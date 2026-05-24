// services/creditManager.js
// Manages consumption-based billing: base tokens + outcome credits
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// Token cost per 1000 tokens (per 1M tokens at market rate)
const TOKEN_RATES = {
  'openrouter/openai/gpt-4.1-mini': 0.15,  // $0.15 per 1K tokens
  'openrouter/openai/gpt-5-mini': 0.25,    // $0.25 per 1K tokens
  'openrouter/minimax/minimax-m2.7': 0.15, // $0.15 per 1K tokens (approximation)
  'ollama/llama3.2:3b': 0.0,               // free (local Ollama)
};

// Outcome credit cost per action type
const OUTCOME_RATES = {
  'lead_qualified': 2,        // 2 credits per qualified lead
  'appointment_booked': 3,    // 3 credits per booked meeting
  'support_ticket_resolved': 1,  // 1 credit per resolved ticket
  'document_generated': 1,   // 1 credit per doc generation
  'escalation_resolved': 1,  // 1 credit per escalation handled
  'rag_query': 0.25,         // 0.25 credits per RAG search
  'mcp_tool_call': 0.5,      // 0.5 credits per MCP tool invocation
};

/**
 * Deduct base tokens after an LLM call.
 * Called from swarm.js after each callLLM() invocation.
 */
function deductTokenCost(agentId, model, inputTokens, outputTokens) {
  const totalTokens = (inputTokens || 0) + (outputTokens || 0);
  if (totalTokens === 0) return;

  const rate = TOKEN_RATES[model] || 0.15; // default $0.15/1K
  const cost = Math.round((totalTokens / 1000) * rate * 100); // in cents equivalent

  const newBalance = deductCredits(agentId, 'base_token', -cost, 
    `${totalTokens} tokens (${model}) via LLM call`, null);

  if (newBalance !== null && newBalance < 0) {
    // Alert: base tokens exhausted
    console.warn(`[CREDIT] Agent ${agentId} base tokens overdrawn by ${Math.abs(newBalance)}`);
  }
}

/**
 * Deduct outcome credits after a meaningful agent action.
 * Called when an agent completes a qualifying outcome.
 */
function deductOutcomeCredit(agentId, outcomeType, referenceId = null) {
  const credits = OUTCOME_RATES[outcomeType] || 1;
  deductCredits(agentId, 'outcome_credit', -credits,
    `Outcome: ${outcomeType}`, referenceId);
}

/**
 * Core deduction function. Returns new balance or null if insufficient credits.
 */
function deductCredits(agentId, type, amount, description, referenceId) {
  const id = uuidv4().replace(/-/g, '').slice(0, 16);
  const ts = new Date().toISOString();
  const absAmount = Math.abs(amount);

  // Use atomic UPDATE with WHERE clause to prevent TOCTOU race condition
  const updateCol = type === 'base_token' ? 'base_tokens_used' : 'outcome_credits_used';
  const limitCol = type === 'base_token' ? 'base_tokens' : 'outcome_credits';

  // Atomic: only deduct if sufficient balance exists
  const sql = `UPDATE agents SET ${updateCol} = ${updateCol} + ? WHERE id = ? AND (${limitCol} - ${updateCol}) >= ?`;

  db.run(sql, [absAmount, agentId, absAmount], function(err) {
    if (err) {
      console.error('[CREDIT] Update error:', err.message);
      return;
    }
    if (this.changes === 0) {
      // Insufficient balance — do overdraft deduction and warn
      db.run(`UPDATE agents SET ${updateCol} = ${updateCol} + ? WHERE id = ?`, [absAmount, agentId]);
      console.warn(`[CREDIT] Overdraft for agent ${agentId}: ${type} by ${absAmount}`);
    }
    // Record transaction
    db.get(`SELECT ${limitCol}, ${updateCol} FROM agents WHERE id = ?`, [agentId], (e, row) => {
      if (e || !row) return;
      const balance = row[limitCol] - row[updateCol];
      db.run(`INSERT INTO credit_transactions (id, agent_id, type, amount, balance_after, description, reference_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, agentId, type, amount, balance, description, referenceId, ts]);
    });
  });

  return null; // async; use callback pattern for sync return if needed
}

/**
 * Get current credit status for an agent
 */
function getCreditStatus(agentId, callback) {
  db.get(`SELECT base_tokens, base_tokens_used, outcome_credits, outcome_credits_used, plan_name FROM agents WHERE id = ?`,
    [agentId], (e, row) => {
      if (e || !row) return callback(e || new Error('Agent not found'));
      callback(null, {
        baseTokens: row.base_tokens || 20000,
        baseTokensUsed: row.base_tokens_used || 0,
        baseTokensAvailable: (row.base_tokens || 20000) - (row.base_tokens_used || 0),
        outcomeCredits: row.outcome_credits || 100,
        outcomeCreditsUsed: row.outcome_credits_used || 0,
        outcomeCreditsAvailable: (row.outcome_credits || 100) - (row.outcome_credits_used || 0),
        planName: row.plan_name || 'value',
      });
    });
}

/**
 * Transaction history for billing transparency
 */
function getTransactionHistory(agentId, limit = 20, callback) {
  db.all(`SELECT * FROM credit_transactions WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?`,
    [agentId, limit], (e, rows) => {
      if (e) return callback(e);
      callback(null, rows);
    });
}

/**
 * Purchase additional outcome credit packs
 * Called by Stripe webhook on successful payment
 */
function addCreditPack(agentId, packName, creditsPurchased, pricePaidCents, stripePaymentId, callback) {
  const id = uuidv4().replace(/-/g, '').slice(0, 16);
  const ts = new Date().toISOString();

  db.run(`INSERT INTO credit_purchases (id, agent_id, pack_name, credits_purchased, price_paid_cents, stripe_payment_id, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'completed', ?)`,
    [id, agentId, packName, creditsPurchased, pricePaidCents, stripePaymentId, ts]);

  // Add credits to agent's outcome pool
  db.run(`UPDATE agents SET outcome_credits = outcome_credits + ? WHERE id = ?`,
    [creditsPurchased, agentId]);

  // Record transaction
  const txId = uuidv4().replace(/-/g, '').slice(0, 16);
  db.get(`SELECT outcome_credits, outcome_credits_used FROM agents WHERE id = ?`, [agentId], (e, row) => {
    if (e || !row) return;
    const balance = (row.outcome_credits || 0) - (row.outcome_credits_used || 0);
    db.run(`INSERT INTO credit_transactions (id, agent_id, type, amount, balance_after, description, reference_id, created_at)
      VALUES (?, ?, 'purchase', ?, ?, ?, ?, ?)`,
      [txId, agentId, creditsPurchased, balance, `Credit pack: ${packName}`, stripePaymentId, ts]);
  });

  if (callback) callback(null, { id, creditsPurchased });
}

module.exports = {
  deductTokenCost,
  deductOutcomeCredit,
  deductCredits,
  getCreditStatus,
  getTransactionHistory,
  addCreditPack,
  checkAgentLimits,
  getUsageWarnings,
  TOKEN_RATES,
  OUTCOME_RATES,
};

// ── Usage Enforcement ──────────────────────────────────────────────────────

async function checkAgentLimits(agentId) {
  const agent = await new Promise((resolve, reject) => {
    db.get('SELECT base_tokens, base_tokens_used, outcome_credits, outcome_credits_used, plan_name, status FROM agents WHERE id = ?',
      [agentId], (err, row) => { if (err) reject(err); else resolve(row); });
  });

  if (!agent) return { allowed: false, reason: 'Agent not found' };
  if (agent.status !== 'active') return { allowed: false, reason: 'Agent is not active' };

  const remainingTokens = (agent.base_tokens || 0) - (agent.base_tokens_used || 0);
  const remainingCredits = (agent.outcome_credits || 0) - (agent.outcome_credits_used || 0);

  if (remainingTokens <= 0) {
    return { allowed: false, reason: 'Token limit reached', remainingTokens: 0, remainingCredits, upgradeUrl: 'https://maikr.pro/build/plan' };
  }
  if (remainingCredits <= 0) {
    return { allowed: false, reason: 'Outcome credits exhausted', remainingTokens, remainingCredits: 0, upgradeUrl: 'https://maikr.pro/build/plan' };
  }

  return { allowed: true, remainingTokens, remainingCredits };
}

function getUsageWarnings(remainingTokens, totalTokens, remainingCredits, totalCredits) {
  const warnings = [];
  const tokenPct = totalTokens > 0 ? remainingTokens / totalTokens : 1;
  const creditPct = totalCredits > 0 ? remainingCredits / totalCredits : 1;

  if (tokenPct <= 0.1 && tokenPct > 0) warnings.push({ type: 'warning', message: '⚠️ Less than 10% of tokens remaining this month.' });
  if (tokenPct <= 0) warnings.push({ type: 'error', message: '🚫 Token limit reached. Upgrade to continue.' });
  if (creditPct <= 0.2 && creditPct > 0) warnings.push({ type: 'warning', message: '⚠️ Less than 20% of outcome credits remaining.' });
  if (creditPct <= 0) warnings.push({ type: 'error', message: '🚫 Outcome credits exhausted. Purchase more to continue.' });

  return warnings;
}