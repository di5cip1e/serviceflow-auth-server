const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const db = require('../database');
const { requireAuth, requireApiAuth } = require('../middleware/auth');

const openai = new OpenAI({
  apiKey: require('../bootstrap').getSecret('OPENAI_API_KEY')
});

const OPENROUTER_API_KEY = require('../bootstrap').getSecret('OPENROUTER_API_KEY');

// ✅ ENFORCED FREE MODELS — M.ai.K.R only uses free models
// Users cannot use paid models — billing stays with the platform
// Update this list as OpenRouter adds/removes free tier models
const FREE_MODELS = [
  'google/gemini-3.1-flash-lite',    // Free tier, 128k context
  'google/gemini-2.0-flash',           // Free tier
  'google/gemini-2.0-flash-thinking', // Free tier
  'qwen/qwen3-8b',                    // Free
  'qwen/qwen3-4b',                    // Free
  'meta-llama/llama-3-8b-instruct',   // May have free tier
  'mistral/mistral-small-3-24b',      // Discounted/free tier
  'deepseek/deepseek-chat-v3',        // Discounted/free tier
  'microsoft phi-4',                 // Free
  'nvidia/llama-3.1-nemotron-70b',   // Free
];

// Tier → model mapping with cost-per-1M-tokens for Derek
const TIER_MODELS = {
  standard: { model: 'google/gemini-3.1-flash-lite', costPerM: 0,    monthlyAddOn: 0    },
  premium:  { model: 'openai/gpt-4o-mini',            costPerM: 0.15, monthlyAddOn: 1500 },  // +$15/mo
  elite:    { model: 'openai/gpt-4o',                 costPerM: 2.50, monthlyAddOn: 3000 },  // +$30/mo
};

const DEFAULT_TIER = 'standard';

function isFreeModel(m) {
  return FREE_MODELS.includes(m) || FREE_MODELS.includes(m.replace('openrouter/', ''));
}

const { similaritySearch } = require('../services/vectorStore');
const { getEmbedding } = require('../services/embeddingService');

// Accept either session auth (web) or API key auth (widget/embed)
function requireChatAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  // Fall back to API key auth
  requireApiAuth(req, res, next);
}

// Verify the authenticated user owns the specified agent
async function verifyAgentOwnership(req, res, next) {
  const userId = req.session.userId || (req.apiKeyRow && req.apiKeyRow.customer_id);
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const resolvedAgentId = req.body.agentId || req.body.agent_id || req.params.agentId;
  if (!resolvedAgentId) {
    return res.status(400).json({ error: 'agentId is required' });
  }

  try {
    let ownerId;
    if (req.apiKeyRow) {
      // API key auth: check agent belongs to the API key's customer
      const agent = await new Promise((resolve, reject) => {
        db.get('SELECT customer_id FROM agents WHERE id = ?', [resolvedAgentId], (err, row) => {
          if (err) reject(err); else resolve(row);
        });
      });
      if (!agent) return res.status(404).json({ error: 'Agent not found' });
      if (agent.customer_id !== req.apiKeyRow.customer_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      return next();
    } else {
      // Session auth: check agent belongs to user via customer table
      const agent = await new Promise((resolve, reject) => {
        db.get(
          `SELECT a.id FROM agents a JOIN customers c ON a.customer_id = c.id
           WHERE a.id = ? AND c.user_id = ?`,
          [resolvedAgentId, req.session.userId],
          (err, row) => { if (err) reject(err); else resolve(row); }
        );
      });
      if (!agent) return res.status(403).json({ error: 'Access denied to this agent' });
      return next();
    }
  } catch (err) {
    console.error('Ownership check error:', err.message);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
}

router.post('/', requireChatAuth, verifyAgentOwnership, async (req, res) => {
  const { agentId, agent_id, message, sandbox, systemPrompt: sandboxPrompt, tone: sandboxTone } = req.body;

  if ((!agentId && !agent_id) || !message) {
    return res.status(400).json({ error: 'agentId and message are required' });
  }

  // NOTE: model parameter is deliberately ignored — platform enforces free model only

  const resolvedAgentId = agentId || agent_id;

  try {
    // Get agent from database
    const row = await new Promise((resolve, reject) => {
      db.get('SELECT system_prompt, session_key, model_tier FROM agents WHERE id = ?', [resolvedAgentId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!row) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Sandbox mode: use provided system prompt for live preview
    let systemPrompt = row.system_prompt || 'You are a helpful AI assistant.';
    if (sandbox && sandboxPrompt) {
      systemPrompt = sandboxPrompt;
      if (sandboxTone) {
        systemPrompt += `\n\nTone: ${sandboxTone}.`;
      }
    }
    const sessionKey = row.session_key;

    // RAG: retrieve relevant context from brand documents
    let ragContext = '';
    try {
      const queryEmbedding = await getEmbedding(message);
      const relevantChunks = await similaritySearch(queryEmbedding, resolvedAgentId, 5);
      if (relevantChunks.length > 0) {
        ragContext = '\n\n--- BRAND CONTEXT ---\n' +
          relevantChunks.map((c, i) => `[${i+1}] From ${c.doc_name}:\n${c.content}`).join('\n\n') +
          '\n--- END BRAND CONTEXT ---\n';
      }
    } catch (err) {
      console.warn('RAG lookup failed:', err.message);
      // Don't fail the request if RAG errors — proceed without context
    }

    const tier = row.model_tier || DEFAULT_TIER;
    const tierConfig = TIER_MODELS[tier] || TIER_MODELS[DEFAULT_TIER];
    const selectedModel = tierConfig.model;

    // Load conversation history
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

    // Try OpenClaw session routing if session exists (non-blocking — errors are logged, not swallowed)
    if (sessionKey && !sandbox) {
      try {
        const { sessions_send } = require('/root/.openclaw/workspace/node_modules/openclaw');
        sessions_send(sessionKey, message).then(sessionRes => {
          if (sessionRes && sessionRes.response) {
            const ts = new Date().toISOString();
            db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'user', ?, ?)`, [resolvedAgentId, message, ts]);
            db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'assistant', ?, ?)`, [resolvedAgentId, sessionRes.response, ts]);
          }
        }).catch((e) => {
          console.warn('OpenClaw session routing error:', e.message);
        });
      } catch (e) {
        console.warn('OpenClaw session routing unavailable:', e.message);
      }
    }

    // ✅ TIER-BASED MODEL — agent uses the model matching their selected tier
    const messages = [
      { role: 'system', content: systemPrompt + ragContext },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const orModel = selectedModel.startsWith('openrouter/') ? selectedModel.replace('openrouter/', '') : selectedModel;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://maikr.pro',
        'X-Title': 'M.ai.K.R',
        'OpenAI-Organization': 'org-maikr'
      },
      body: JSON.stringify({ model: orModel, messages, max_tokens: 1000 })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const aiResponse = data.choices[0].message.content;

    // Track token usage from OpenRouter response
    let tokensUsed = 0;
    let costCents = 0;
    if (data.usage) {
      tokensUsed = (data.usage.prompt_tokens || 0) + (data.usage.completion_tokens || 0);
      costCents = Math.round(tokensUsed * tierConfig.costPerM / 1000000 * 100);
    }

    // Log conversation
    const ts = new Date().toISOString();
    await new Promise((resolve, reject) => {
      db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'user', ?, ?)`, [resolvedAgentId, message, ts], (err) => {
        if (err) reject(err); else resolve();
      });
    });
    await new Promise((resolve, reject) => {
      db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'assistant', ?, ?)`, [resolvedAgentId, aiResponse, ts], (err) => {
        if (err) reject(err); else resolve();
      });
    });

    // Update agent token stats (only if non-zero)
    if (tokensUsed > 0) {
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE agents SET total_tokens = total_tokens + ?, total_cost_cents = total_cost_cents + ? WHERE id = ?`,
          [tokensUsed, costCents, resolvedAgentId],
          (err) => { if (err) reject(err); else resolve(); }
        );
      });
    }

    // Check for escalation codes
    const escalationMatch = aiResponse.match(/\[ESCALATE:(\w+)\]/);
    if (escalationMatch) {
      console.log(`🚨 ESCALATION DETECTED: ${escalationMatch[1]}`);
      db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'system', ?, ?)`,
        [resolvedAgentId, `[ALERT: ${escalationMatch[1]}] Customer message: ${message}`, ts]);
    }

    return res.json({ response: aiResponse });
  } catch (err) {
    console.error('❌ Chat error:', err.message);
    return res.status(500).json({ error: 'Chat service error' });
  }
});

module.exports = router;
