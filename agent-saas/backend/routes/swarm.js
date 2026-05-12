/**
 * Swarm Chat Route — POST /api/chat/swarm
 * Main entry point for the multi-agent swarm system.
 * Replaces the single-agent /api/chat endpoint.
 */
const express = require('express');
const router = express.Router();
const { SwarmRouter, SWARM_STATES, SUB_AGENTS } = require('../orchestrator/swarmRouter');
const db = require('../database');
const mcpRegistry = require('../mcp/registry');
const mcpClient = require('../mcp/client');
const { startTrace, startSpan, scoreRAG } = require('../observability/tracer');
const creditManager = require('../services/creditManager');

const swarmRouter = new SwarmRouter();

/* ─────────────────────────────────────────────
   Parse a tool call from LLM text response.
   Looks for: TOOL: mcp_server_toolname\nARGS: {json}
   Or: mcp_server_toolname {...} somewhere in the text.
───────────────────────────────────────────── */
function parseToolCall(text) {
  const match = text.match(/TOOL:\s*(mcp_\w+)\s*\nARGS:\s*(\{[\s\S]*?\})/);
  if (match) {
    try { return { toolName: match[1], args: JSON.parse(match[2]) }; } catch {}
  }
  // Fallback: tool name then JSON object
  const fallback = text.match(/(mcp_\w+)[\s\S]*?(\{[\s\S]*?\})/);
  if (fallback) {
    try { return { toolName: fallback[1], args: JSON.parse(fallback[2]) }; } catch {}
  }
  return null;
}

/* ─────────────────────────────────────────────
   Execute a single MCP tool call.
   toolName format: mcp_{serverName}_{toolName}
───────────────────────────────────────────── */
async function executeMCPTool(toolName, args) {
  const parts = toolName.split('_');
  if (parts.length < 3) throw new Error('Invalid MCP tool name: ' + toolName);
  // serverName is everything between 'mcp_' prefix and last '_' + toolName
  const actualToolName = parts.pop();
  const serverName = parts.slice(1).join('_');
  return mcpClient.callTool(serverName, actualToolName, args);
}

/* ─────────────────────────────────────────────
   Build the MCP tools description block injected
   into the system prompt so the LLM knows what
   tools are available.
───────────────────────────────────────────── */
function buildMCPToolsDescription(agentId) {
  try {
    const tools = mcpRegistry.buildToolsSchema(agentId);
    if (!tools || tools.length === 0) return '';
    const lines = tools.map(t => {
      const f = t.function;
      const params = f.parameters && f.parameters.properties
        ? Object.entries(f.parameters.properties).map(([k, v]) => {
            const req = (f.parameters.required || []).includes(k) ? '*' : '';
            return `  ${k}${req}: ${v.type} - ${v.description || ''}`;
          }).join('\n')
        : '  (none)';
      return `TOOL: ${f.name}\n  Description: ${f.description}\n  Parameters:\n${params}`;
    });
    return '\n\n--- AVAILABLE MCP TOOLS ---\n'
      + 'You have access to these external tools. To call one, write:\n'
      + 'TOOL: <tool_name>\nARGS: <json_arguments>\n\n'
      + lines.join('\n\n')
      + '\n--- END MCP TOOLS ---\n';
  } catch (err) {
    return '';
  }
}

/* ─────────────────────────────────────────────
   POST /api/chat/swarm
   Body: { agentId, message, conversationId? }
───────────────────────────────────────────── */
router.post('/', async (req, res) => {
  const { agentId, agent_id, message, conversationId } = req.body;
  if ((!agentId && !agent_id) || !message) {
    return res.status(400).json({ error: 'agentId and message are required' });
  }
  const resolvedAgentId = agentId || agent_id;
  const convId = conversationId || `conv_${resolvedAgentId}`;

  try {
    // Start root trace for this conversation turn
    const trace = startTrace('swarm.chat', {
      agentId: resolvedAgentId,
      sessionId: convId,
    });
    trace.trace.metadata = { messageLength: message.length };

    // 1. Route message → select sub-agent (span: intent_classification)
    const intentSpan = trace.startSpan('intent_classification');
    const routingResult = await swarmRouter.route(message, convId);
    const { state, intent, confidence, systemPrompt } = routingResult.routing;
    intentSpan.end();
    trace.trace.intent = intent;

    // 2. Load agent from DB
    const agent = await new Promise((resolve, reject) => {
      db.get(
        'SELECT system_prompt, session_key, model_tier FROM agents WHERE id = ?',
        [resolvedAgentId],
        (err, row) => { if (err) return reject(err); resolve(row); }
      );
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    // 3. Build base system prompt: sub-agent role + agent's own prompt
    const baseSystemPrompt = agent.system_prompt
      || 'You are a helpful AI assistant built on M.ai.K.R.';
    const finalSystemPrompt = systemPrompt + '\n\n---\n' + baseSystemPrompt;

    // 4. Add RAG context (span: rag_lookup)
    let ragContext = '';
    const ragSpan = trace.startSpan('rag_lookup');
    let retrievedChunks = [];
    try {
      const { getEmbedding } = require('../services/embeddingService');
      const { similaritySearch } = require('../services/vectorStore');
      const queryEmbedding = await getEmbedding(message);
      const chunks = await similaritySearch(queryEmbedding, resolvedAgentId, 5);
      retrievedChunks = chunks;
      if (chunks.length > 0) {
        ragContext = '\n\n--- BRAND CONTEXT ---\n'
          + chunks.map((c, i) => `[${i + 1}] From ${c.doc_name}:\n${c.content}`).join('\n\n')
          + '\n--- END BRAND CONTEXT ---\n';
      }
    } catch (ragErr) {
      console.warn('[SWARM] RAG lookup failed:', ragErr.message);
    }
    ragSpan.end();

    // 5. Add MCP tools (if any are connected for this agent)
    const mcpToolsDescription = buildMCPToolsDescription(resolvedAgentId);
    const fullSystemPrompt = finalSystemPrompt + ragContext + mcpToolsDescription;

    // 6. Build conversation history
    const history = await new Promise((resolve) => {
      db.all(
        'SELECT role, content FROM conversations WHERE agent_id = ? ORDER BY created_at DESC LIMIT 40',
        [resolvedAgentId],
        (err, rows) => {
          if (err || !rows) return resolve([]);
          resolve(rows.filter(r => !r.content.startsWith('[ALERT:')).reverse());
        }
      );
    });

    const messages = [
      { role: 'system', content: fullSystemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    // 7. LLM call helper (with tracing + token tracking)
    const tier = agent.model_tier || 'standard';
    const { getModelForTier } = require('../orchestrator/tierRouter');
    const orModel = getModelForTier(tier).replace('openrouter/', '');
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const llmStartTime = Date.now();

    async function callLLM(msgs, iteration = 0) {
      const span = trace.startSpan(`llm_call_${iteration}`);
      span.attributes = { model: orModel, messageCount: msgs.length };

      const start = Date.now();
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://maikr.pro',
          'X-Title': 'M.ai.K.R',
        },
        body: JSON.stringify({ model: orModel, messages: msgs, max_tokens: 1500 })
      });
      const latencyMs = Date.now() - start;
      const data = await response.json();
      if (data.error) { span.end('error'); throw new Error(data.error.message); }

      const usage = data.usage || {};
      const inputTokens = usage.prompt_tokens || 0;
      const outputTokens = usage.completion_tokens || 0;

      // Record generation in trace
      trace.trace.metadata = trace.trace.metadata || {};
      trace.recordGeneration({
        model: orModel,
        systemPrompt: msgs[0]?.content?.substring(0, 200) || '',
        inputMessages: msgs.length,
        inputTokens,
        outputTokens,
        latencyMs,
        retrievalChunks: retrievedChunks.length,
      });

      // Record token usage in DB (async, don't block response)
      const ts = new Date().toISOString();
      db.run(
        `INSERT INTO token_usage (agent_id, session_id, model, input_tokens, output_tokens, latency_ms, intent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [resolvedAgentId, convId, orModel, inputTokens, outputTokens, latencyMs, intent, ts]
      );


      // Deduct credit cost for this LLM call (async, non-blocking)
      creditManager.deductTokenCost(resolvedAgentId, orModel, inputTokens, outputTokens);
      span.end();
      return data.choices[0].message.content;
    }

    // 8. Tool-call loop: max 3 MCP tool calls per message
    let aiResponse = await callLLM(messages, 0);
    for (let iter = 0; iter < 3; iter++) {
      const toolCall = parseToolCall(aiResponse);
      if (!toolCall) break;
      const toolSpan = trace.startSpan(`mcp_tool_${toolCall.toolName}`);
      let toolResult;
      try {
        toolResult = await executeMCPTool(toolCall.toolName, toolCall.args);
      } catch (err) {
        toolResult = { error: err.message };
      }
      toolSpan.end();
      messages.push({ role: 'assistant', content: aiResponse });
      messages.push({
        role: 'system',
        content: `TOOL RESULT for ${toolCall.toolName}: ${JSON.stringify(toolResult, null, 2)}`
      });
      aiResponse = await callLLM(messages, iter + 1);
    }

    // 8b. RAG scoring (async, don't block response)
    if (retrievedChunks.length > 0) {
      const ragScore = await scoreRAG(message, aiResponse, retrievedChunks, getModelForTier(tier));
      if (ragScore.composite !== null) {
        db.run(
          `INSERT INTO rag_scores (agent_id, question, answer, faithfulness, relevancy, composite, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [resolvedAgentId, message.substring(0, 500), aiResponse.substring(0, 1000),
           ragScore.faithfulness, ragScore.relevancy, ragScore.composite, new Date().toISOString()]
        );
      }
    }

    // 9. End the root trace
    trace.end();

    // 9. Log conversation
    const ts = new Date().toISOString();
    db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'user', ?, ?)`,
      [resolvedAgentId, message, ts]);
    db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'assistant', ?, ?)`,
      [resolvedAgentId, aiResponse, ts]);

    // 10. Check for escalation
    const escalationMatch = aiResponse.match(/\[ESCALATE:(\w+)\]/);
    if (escalationMatch) {
      db.run(
        `INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'system', ?, ?)`,
        [resolvedAgentId, `[ALERT: ${escalationMatch[1]}] Customer: ${message}`, ts]
      );
    }

    // 11. Return response with routing metadata
    return res.json({
      response: aiResponse,
      routing: { state, intent, confidence, subAgent: SUB_AGENTS[state]?.name, emoji: SUB_AGENTS[state]?.emoji },
      trace: routingResult.trace,
    });

  } catch (err) {
    console.error('[SWARM] Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────
   GET /api/chat/swarm/trace/:conversationId
───────────────────────────────────────────── */
router.get('/trace/:conversationId', (req, res) => {
  res.json({ trace: swarmRouter.getTrace(req.params.conversationId) });
});

/* ─────────────────────────────────────────────
   POST /api/chat/swarm/override
   Body: { conversationId, state }
───────────────────────────────────────────── */
router.post('/override', (req, res) => {
  const { conversationId, state } = req.body;
  if (!conversationId || !state) {
    return res.status(400).json({ error: 'conversationId and state required' });
  }
  res.json(swarmRouter.override(conversationId, state));
});

/* ─────────────────────────────────────────────
   POST /api/chat/swarm/route-test
   Test routing without executing chat.
   Body: { message }
───────────────────────────────────────────── */
router.post('/route-test', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  try {
    const result = await swarmRouter.route(message, 'test_conversation');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
