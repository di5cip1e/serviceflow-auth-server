/**
 * Swarm Chat Route — POST /api/chat/swarm
 * Main entry point for the multi-agent swarm system.
 * Replaces the single-agent /api/chat endpoint.
 */

const express = require('express');
const router = express.Router();
const { SwarmRouter, SWARM_STATES } = require('../orchestrator/swarmRouter');
const db = require('../database');

const swarmRouter = new SwarmRouter();

/**
 * POST /api/chat/swarm
 * Body: { agentId, message, conversationId (optional) }
 */
router.post('/', async (req, res) => {
  const { agentId, agent_id, message, conversationId } = req.body;

  if ((!agentId && !agent_id) || !message) {
    return res.status(400).json({ error: 'agentId and message are required' });
  }

  const resolvedAgentId = agentId || agent_id;
  const convId = conversationId || `conv_${resolvedAgentId}`;

  try {
    // Step 1: Route the message (classify intent → select sub-agent)
    const routingResult = await swarmRouter.route(message, convId);
    const { state, intent, confidence, systemPrompt } = routingResult.routing;

    // Step 2: Get agent from DB (system prompt + session info)
    const agent = await new Promise((resolve, reject) => {
      db.get(
        'SELECT system_prompt, session_key, model_tier FROM agents WHERE id = ?',
        [resolvedAgentId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Step 3: Build the sub-agent system prompt
    // Base: agent's own system prompt + sub-agent role prompt + RAG context
    const baseSystemPrompt = agent.system_prompt || 'You are a helpful AI assistant.';
    const rolePrompt = `\n\nYou are currently acting as: {SUB_AGENT_ROLE}\nAlways stay in character as this role.`;
    const combinedSystemPrompt = systemPrompt + '\n\n---\n' + baseSystemPrompt;

    // Step 4: Add RAG context (same as the original chat route)
    let ragContext = '';
    try {
      const { getEmbedding } = require('../services/embeddingService');
      const { similaritySearch } = require('../services/vectorStore');
      const queryEmbedding = await getEmbedding(message);
      const chunks = await similaritySearch(queryEmbedding, resolvedAgentId, 5);
      if (chunks.length > 0) {
        ragContext = '\n\n--- BRAND CONTEXT ---\n' +
          chunks.map((c, i) => `[${i+1}] From ${c.doc_name}:\n${c.content}`).join('\n\n') +
          '\n--- END BRAND CONTEXT ---\n';
      }
    } catch (err) {
      console.warn('RAG lookup failed:', err.message);
    }

    const finalSystemPrompt = combinedSystemPrompt + ragContext;

    // Step 5: Build messages array with swarm routing context
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
      { role: 'system', content: finalSystemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    // Step 6: Call the LLM (same routing as original chat route)
    const tier = agent.model_tier || 'standard';
    const { getModelForTier } = require('../orchestrator/tierRouter');
    const selectedModel = getModelForTier(tier);

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const orModel = selectedModel.replace('openrouter/', '');

    const aiResponse = await new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://maikr.pro',
            'X-Title': 'M.ai.K.R',
          },
          body: JSON.stringify({ model: orModel, messages, max_tokens: 1000 })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        resolve(data.choices[0].message.content);
      } catch (e) {
        reject(e);
      }
    });

    // Step 7: Log conversation
    const ts = new Date().toISOString();
    db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'user', ?, ?)`, [resolvedAgentId, message, ts]);
    db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'assistant', ?, ?)`, [resolvedAgentId, aiResponse, ts]);

    // Step 8: Check for escalation
    const escalationMatch = aiResponse.match(/\[ESCALATE:(\w+)\]/);
    if (escalationMatch) {
      db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'system', ?, ?)`,
        [resolvedAgentId, `[ALERT: ${escalationMatch[1]}] Customer: ${message}`, ts]);
    }

    // Step 9: Return response WITH routing metadata
    return res.json({
      response: aiResponse,
      routing: {
        state,
        intent,
        confidence,
        subAgent: SUB_AGENTS[state]?.name,
        emoji: SUB_AGENTS[state]?.emoji,
      },
      trace: routingResult.trace,
    });

  } catch (err) {
    console.error('Swarm error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/chat/swarm/trace/:conversationId
 * Returns the full routing trace for a conversation.
 */
router.get('/trace/:conversationId', (req, res) => {
  const trace = swarmRouter.getTrace(req.params.conversationId);
  res.json({ trace });
});

/**
 * POST /api/chat/swarm/override
 * Manually override routing to a specific sub-agent.
 * Body: { conversationId, state }
 */
router.post('/override', (req, res) => {
  const { conversationId, state } = req.body;
  if (!conversationId || !state) {
    return res.status(400).json({ error: 'conversationId and state required' });
  }
  const result = swarmRouter.override(conversationId, state);
  res.json(result);
});

/**
 * POST /api/swarm/route-test
 * Test routing for a message without executing the chat.
 * Body: { message }
 */
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
