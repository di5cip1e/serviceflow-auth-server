/**
 * ollama-router.js
 * Smart routing layer: Ollama first (free/fast) → OpenRouter fallback (powerful)
 * Runs on port 3002. M.ai.K.R backend calls this instead of OpenRouter directly.
 * 
 * Strategy:
 * - Simple prompts (< 200 chars, no code/debug keywords) → Ollama
 * - Complex prompts → OpenRouter
 * - Ollama failure/timeout → OpenRouter fallback
 */

const express = require('express');
const crypto = require('crypto');
const https = require('https');

const app = express();
app.use(express.json());

const OLLAMA_URL = 'http://127.0.0.1:11434';
const OPENROUTER_API_URL = 'openrouter.ai';
const PORT = 3002;

// Load secrets
let openRouterKey = '';
try {
  const fs = require('fs');
  // Try .env first, then fall back to secrets.json
  try {
    const env = fs.readFileSync('/root/.openclaw/workspace/agent-saas/backend/.env', 'utf8');
    env.split('\n').forEach(line => {
      const [key, ...vals] = line.split('=');
      if (key === 'OPENROUTER_API_KEY') openRouterKey = vals.join('=').trim();
    });
  } catch(e) {}
  // Fall back to openclaw secrets
  if (!openRouterKey) {
    const secrets = JSON.parse(fs.readFileSync('/root/.openclaw/secrets.json', 'utf8'));
    openRouterKey = secrets.OPENROUTER_API_KEY || '';
  }
} catch(e) {}

// Complexity detection
function isComplexPrompt(prompt) {
  if (!prompt) return true;
  const upper = prompt.toUpperCase();
  const complex = /CODE|DEBUG|ANALYZE|ARCHITECT|WRITE|BUILD|CREATE|FIX|ERROR|IMPLEMENT|REFACTOR|OPTIMIZE|SPAWN|DELEGATE|ORCHESTRATE|RECURSIVE|ASYNC|COMPLEX/i;
  if (complex.test(prompt)) return true;
  if (prompt.length > 300) return true;
  return false;
}

// Ollama chat
function chatOllama(model, messages, signal) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model, messages, stream: false });
    const req = http.request(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) { reject(new Error(parsed.error)); return; }
          const content = parsed.message?.content || parsed.response || '';
          resolve(content);
        } catch(e) { reject(new Error('Ollama parse error: ' + data.substring(0, 100))); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Ollama timeout')); });
    req.write(body);
    req.end();
  });
}

// OpenRouter chat
function chatOpenRouter(model, messages, signal) {
  return new Promise((resolve, reject) => {
    if (!openRouterKey) return reject(new Error('No OpenRouter key'));
    const body = JSON.stringify({
      model: model || 'openrouter/auto',
      messages,
      max_tokens: 256
    });
    const options = {
      hostname: OPENROUTER_API_URL,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': 'https://maikr.pro',
        'X-Title': 'M.ai.K.R'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.message?.content || parsed.response || '';
          resolve(content);
        } catch(e) { reject(new Error('OpenRouter parse error: ' + data.substring(0, 200))); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('OpenRouter timeout')); });
    req.write(body);
    req.end();
  });
}

const http = require('http');

app.post('/chat', async (req, res) => {
  const { message, history = [], model: requestedModel = 'llama3.2:3b' } = req.body;
  const prompt = typeof message === 'string' ? message : message?.content || '';

  // Simple task → try Ollama first
  if (!isComplexPrompt(prompt)) {
    try {
      const systemMsg = { role: 'system', content: 'You are M.ai.K.R, a helpful AI agent assistant. Be concise, helpful, and efficient. Answer questions directly without unnecessary preamble.' };
      const msgs = [systemMsg, ...history.map(h => ({ role: h.role || 'user', content: h.content })), { role: 'user', content: prompt }];
      const response = await chatOllama(requestedModel, msgs);
      console.log(`[${new Date().toISOString()}] OLLAMA OK "${prompt.substring(0,50)}" → ${response.substring(0,50)}`);
      return res.json({ response, source: 'ollama' });
    } catch(ollamaErr) {
      console.log(`[${new Date().toISOString()}] OLLAMA FAIL → OpenRouter fallback: ${ollamaErr.message}`);
    }
  }

  // Complex task OR Ollama failed → OpenRouter
  try {
    const systemMsg = { role: 'system', content: 'You are M.ai.K.R, a helpful AI agent assistant for Derek Brooks. You are efficient, proactive, and keep responses focused.' };
    const msgs = [systemMsg, ...history.map(h => ({ role: h.role || 'user', content: h.content })), { role: 'user', content: prompt }];
    const model = requestedModel.includes('/') ? requestedModel : `openrouter/auto`;
    const response = await chatOpenRouter(model, msgs);
    console.log(`[${new Date().toISOString()}] OPENROUTER OK "${prompt.substring(0,50)}"`);
    return res.json({ response, source: 'openrouter' });
  } catch(openRouterErr) {
    console.error(`[${new Date().toISOString()}] OPENROUTER FAIL: ${openRouterErr.message}`);
    return res.status(500).json({ error: 'All providers failed', ollama: ollamaErr?.message, openrouter: openRouterErr.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    ollama: 'reachable', 
    port: PORT,
    strategy: 'ollama-first → openrouter-fallback'
  });
});

app.listen(PORT, () => {
  console.log(`Ollama router running on port ${PORT}`);
  console.log(`Strategy: Simple tasks → Ollama (free), Complex tasks → OpenRouter`);
});
