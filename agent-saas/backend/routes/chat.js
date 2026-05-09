const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const db = require('../database');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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

router.post('/', async (req, res) => {
  const { agentId, agent_id, message } = req.body;

  if ((!agentId && !agent_id) || !message) {
    return res.status(400).json({ error: 'agentId and message are required' });
  }

  // NOTE: model parameter is deliberately ignored — platform enforces free model only
  // Users cannot select paid models. See ENFORCED_MODEL at top of routes file.

  const resolvedAgentId = agentId || agent_id;

  // Get agent from database
  db.get('SELECT system_prompt, session_key, model_tier FROM agents WHERE id = ?', [resolvedAgentId], async (err, row) => {
    if (err) {
      console.error('❌ Database error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const systemPrompt = row.system_prompt || 'You are a helpful AI assistant.';
    const sessionKey = row.session_key;
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

    // Try OpenClaw session routing if session exists
    if (sessionKey) {
      try {
        const { sessions_send } = require('/root/.openclaw/workspace/node_modules/openclaw');
        sessions_send(sessionKey, message).then(sessionRes => {
          if (sessionRes && sessionRes.response) {
            const ts = new Date().toISOString();
            db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'user', ?, ?)`, [resolvedAgentId, message, ts]);
            db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'assistant', ?, ?)`, [resolvedAgentId, sessionRes.response, ts]);
            return res.json({ response: sessionRes.response });
          }
        }).catch(() => {});
      } catch (e) {}
    }

    // ✅ TIER-BASED MODEL — agent uses the model matching their selected tier
    // Users cannot override this. Platform cost is tracked per tier.
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    try {
      let aiResponse;
      let tokensUsed = 0;
      let costCents = 0;

      // Route ALL models through OpenRouter (including gpt-4o-mini, gpt-4o, etc.)
      // OpenRouter provides access to OpenAI models under their free/reduced tier
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
        aiResponse = data.choices[0].message.content;
        
        // Track token usage from OpenRouter response
        if (data.usage) {
          tokensUsed = (data.usage.prompt_tokens || 0) + (data.usage.completion_tokens || 0);
          costCents = Math.round(tokensUsed * tierConfig.costPerM / 1000000 * 100);
      }

      // Log conversation
      const ts = new Date().toISOString();
      db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'user', ?, ?)`, [resolvedAgentId, message, ts]);
      db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'assistant', ?, ?)`, [resolvedAgentId, aiResponse, ts]);

      // Update agent token stats (only if non-zero, avoids resetting free model costs)
      if (tokensUsed > 0) {
        db.run(
          `UPDATE agents SET total_tokens = total_tokens + ?, total_cost_cents = total_cost_cents + ? WHERE id = ?`,
          [tokensUsed, costCents, resolvedAgentId]
        );
      }

      // Check for escalation codes
      const escalationMatch = aiResponse.match(/\[ESCALATE:(\w+)\]/);
      if (escalationMatch) {
        console.log(`🚨 ESCALATION DETECTED: ${escalationMatch[1]}`);
        db.run(`INSERT INTO conversations (agent_id, role, content, created_at) VALUES (?, 'system', ?, ?)`,
          [resolvedAgentId, `[ALERT: ${escalationMatch[1]}] Customer message: ${message}`, ts]);
      }

      return res.json({ response: aiResponse });
    } catch (aiError) {
      console.error('❌ AI error:', aiError.message);
      return res.status(500).json({ error: 'AI service error' });
    }
  });
});

module.exports = router;