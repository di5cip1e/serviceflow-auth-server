/**
 * Intent Classifier — hybrid keyword + LLM approach.
 * Fast deterministic matching first, then lightweight LLM for ambiguous cases.
 */

// Deterministic keyword词典 for each intent
const INTENT_KEYWORDS = {
  support: [
    'return', 'refund', 'broken', 'issue', 'problem', 'error', 'bug', 'crash',
    'not working', 'failed', 'wrong', 'stuck', 'help me', 'cant', "can't",
    'trouble', 'frustrated', 'angry', 'disappointed', 'cancel', 'cancelled',
    'refunded', 'reimburse', 'replacement', 'defective', 'damaged',
    'where is my', 'tracking', 'shipped', 'delivery', 'delivered',
    'password', 'login', 'access', 'locked', 'account', 'profile',
  ],
  sales: [
    'price', 'pricing', 'cost', 'how much', 'expensive', 'cheap', 'afford',
    'buy', 'purchase', 'subscribe', 'subscription', 'plan', 'upgrade',
    'downgrade', 'cancel plan', 'billing', 'invoice', 'receipt', 'discount',
    'coupon', 'promo', 'trial', 'free plan', 'paid', 'tier', 'feature',
    'compare', 'comparison', 'vs ', 'versus', 'difference between',
    'worth it', 'value', 'roi', 'return on', 'investment',
    'enterprise', 'custom', 'unlimited', 'volume',
  ],
  onboarding: [
    'start', 'begin', 'setup', 'new', 'onboard', 'getting started', 'first time',
    'how do i start', 'create agent', 'build agent', 'new agent',
    'questionnaire', 'sign up', 'register', 'account creation',
    'welcome', 'tutorial', 'tour', 'guide', 'learn', 'demo',
    'introduction', 'introduce me', 'what can you do', 'capabilities',
  ],
  admin: [
    'admin', 'manage', 'config', 'configuration', 'settings', 'dashboard',
    'agent settings', 'regenerate', 'rebuild', 'rename', 'delete agent',
    'change plan', 'api key', 'webhook', 'integrations', 'connected',
    'usage', 'stats', 'statistics', 'tokens', 'cost breakdown',
  ],
};

// Context shifters — words that PUSH toward a different intent even in supporting sentences
const CONTEXT_OVERRIDES = {
  // User mentions "return" but is actually ASKING about someone else's return policy
  // These are handled by looking at question marks and interrogative patterns
};

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
}

function scoreIntent(text, keywords) {
  const normalized = normalizeText(text);
  let score = 0;
  let matched = [];
  for (const keyword of keywords) {
    if (normalized.includes(keyword.toLowerCase())) {
      score += keyword.split(' ').length; // multi-word keywords score higher
      matched.push(keyword);
    }
  }
  return { score, matched };
}

/**
 * Primary classifier — fast keyword matching.
 * Returns { intent, confidence, method: 'keyword' }
 */
function keywordClassify(text) {
  const scores = {};
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const { score, matched } = scoreIntent(text, keywords);
    scores[intent] = { score, matched };
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);
  const top = sorted[0];
  const runnerUp = sorted[1];

  // Confidence: based on score differential and absolute score
  const topScore = top[1].score;
  const runnerUpScore = runnerUp ? runnerUp[1].score : 0;

  if (topScore === 0) {
    return { intent: 'general', confidence: 0.5, method: 'keyword' };
  }

  // Strong match: top score is 2+ above runner-up, or top score is 3+
  if (topScore >= 3 && (topScore - runnerUpScore >= 2 || topScore >= 5)) {
    return { intent: top[0], confidence: 0.95, method: 'keyword', matched: top[1].matched };
  }

  // Weak match: some signal but not definitive
  if (topScore >= 1) {
    return { intent: top[0], confidence: 0.6, method: 'keyword', matched: top[1].matched };
  }

  return { intent: 'general', confidence: 0.5, method: 'keyword' };
}

/**
 * Secondary classifier — uses small Ollama model for ambiguous cases.
 * Falls back to OpenAI if Ollama is unavailable.
 */
async function llmClassify(text) {
  const prompt = `Classify this user message into exactly ONE category:
Categories: support | sales | onboarding | admin | general
Rules:
- "return" or "refund" → support
- "price" or "cost" or "plan" → sales
- "start" or "new" or "build agent" → onboarding
- "settings" or "manage" or "dashboard" → admin
- casual chat, greetings, thanks → general

Message: "${text.slice(0, 200)}"
Category (one word only):`;

  // Try Ollama first (free, fast) — with 3-second timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        prompt,
        stream: false,
        options: { num_predict: 10, temperature: 0.1 },
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json();
      const category = data.response.trim().toLowerCase();
      const validIntents = ['support', 'sales', 'onboarding', 'admin', 'general'];
      if (validIntents.includes(category)) {
        return { intent: category, confidence: 0.8, method: 'llm' };
      }
    }
  } catch (e) {
    // Ollama not available or timed out — fall through
  }

  // Fallback: OpenRouter with a fast, cheap model
  try {
    const { getSecret } = require('../bootstrap');
    const apiKey = getSecret('OPENROUTER_API_KEY');
    if (!apiKey) return { intent: 'general', confidence: 0.5, method: 'no_key' };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://maikr.pro',
        'X-Title': 'M.ai.K.R',
      },
      body: JSON.stringify({
        model: 'openrouter/google/gemini-2.0-flash-lite-001',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1,
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json();
      const category = (data.choices[0].message.content || '').trim().toLowerCase();
      const validIntents = ['support', 'sales', 'onboarding', 'admin', 'general'];
      const matched = validIntents.find(i => category.includes(i)) || 'general';
      return { intent: matched, confidence: 0.8, method: 'llm_or' };
    }
  } catch (e) {
    // OpenRouter not available
  }
  return { intent: 'general', confidence: 0.5, method: 'llm_fallback' };
}

/**
 * Main classify function.
 * Runs keyword first, then LLM if confidence is low (< 0.7).
 */
async function classify(text) {
  if (!text || !text.trim()) {
    return { intent: 'general', confidence: 0.5 };
  }

  const keywordResult = keywordClassify(text);

  // High confidence from keyword matching → use it directly
  if (keywordResult.confidence >= 0.7) {
    return keywordResult;
  }

  // Medium confidence → try LLM to confirm
  if (keywordResult.confidence >= 0.4) {
    try {
      const llmResult = await llmClassify(text);
      // LLM wins if it has higher confidence
      if (llmResult.confidence > keywordResult.confidence) {
        return { ...llmResult, keywordHint: keywordResult.intent };
      }
    } catch (e) {
      // LLM failed — stick with keyword result
    }
  }

  // Low confidence → LLM
  if (keywordResult.confidence < 0.4) {
    try {
      return await llmClassify(text);
    } catch (e) {
      return { intent: 'general', confidence: 0.5, method: 'fallback' };
    }
  }

  return keywordResult;
}

module.exports = { classify, keywordClassify, llmClassify };
