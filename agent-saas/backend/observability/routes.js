
/**
 * Observability Routes — GET /api/observe/*
 * Serves trace data, token usage stats, and RAG quality scores
 * for the client-facing observability dashboard.
 */
const express = require('express');
const router = express.Router();

// GET /api/observe/summary — overview of all traces
router.get('/summary', (req, res) => {
  const { getRecentTraces } = require('./tracer');
  const traces = getRecentTraces(null, 100);
  const totalTraces = traces.length;
  const avgScore = totalTraces > 0 ? traces.reduce((sum, t) => sum + (t.overallScore || 0), 0) / totalTraces : 0;
  res.json({ totalTraces, avgScore: avgScore.toFixed(2), recentTraces: traces.slice(0, 5) });
});

const db = require('../database');
const { getRecentTraces, getTrace } = require('./tracer');

// Pricing estimates (OpenRouter model costs per 1M tokens)
const MODEL_COSTS = {
  'openai/gpt-4o-mini':      { input: 0.15, output: 0.60 },
  'openai/gpt-4o':          { input: 2.00, output: 8.00 },
  'google/gemini-3.1-flash-lite': { input: 0.05, output: 0.05 },
  'openai/gpt-4.1':         { input: 2.00, output: 8.00 },
  'openai/gpt-5-mini':      { input: 0.25, output: 1.00 },
};

// Default to gpt-4o-mini pricing if model unknown
function estimateCost(inputTokens, outputTokens, model) {
  const costs = MODEL_COSTS[model] || MODEL_COSTS['openai/gpt-4o-mini'];
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  return inputCost + outputCost;
}

// ── GET /api/observe/traces/:agentId ──────────────────────────────────────────
router.get('/traces/:agentId', (req, res) => {
  const { limit = 50 } = req.query;
  const traces = getRecentTraces(req.params.agentId, parseInt(limit));

  const enriched = traces.map(t => ({
    traceId: t.traceId,
    intent: t.intent,
    latencyMs: t.totalLatencyMs,
    overallScore: t.overallScore,
    spanCount: t.spans.length,
    generationCount: t.generations.length,
    startedAt: t.startedAt,
    completedAt: t.completedAt,
  }));

  res.json({ traces: enriched, count: enriched.length });
});

// ── GET /api/observe/traces/:agentId/:traceId ─────────────────────────────────
router.get('/traces/:agentId/:traceId', (req, res) => {
  const trace = getTrace(req.params.traceId);
  if (!trace) return res.status(404).json({ error: 'Trace not found' });
  res.json({ trace });
});

// ── GET /api/observe/usage/:agentId ───────────────────────────────────────────
router.get('/usage/:agentId', (req, res) => {
  const { period = '7d' } = req.query;
  const now = Date.now();
  const periods = { '24h': 1, '7d': 7, '30d': 30 };
  const days = periods[period] || 7;
  const since = new Date(now - days * 86400 * 1000).toISOString();

  db.all(
    `SELECT * FROM token_usage WHERE agent_id = ? AND created_at >= ? ORDER BY created_at DESC`,
    [req.params.agentId, since],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const totalInput = rows.reduce((s, r) => s + (r.input_tokens || 0), 0);
      const totalOutput = rows.reduce((s, r) => s + (r.output_tokens || 0), 0);
      const totalLatency = rows.reduce((s, r) => s + (r.latency_ms || 0), 0);
      const totalCost = rows.reduce((s, r) => s + estimateCost(r.input_tokens || 0, r.output_tokens || 0, r.model || ''), 0);
      const avgLatency = rows.length > 0 ? Math.round(totalLatency / rows.length) : 0;

      // Daily breakdown
      const byDay = {};
      for (const r of rows) {
        const day = r.created_at?.substring(0, 10) || 'unknown';
        if (!byDay[day]) byDay[day] = { inputTokens: 0, outputTokens: 0, cost: 0, count: 0 };
        byDay[day].inputTokens += r.input_tokens || 0;
        byDay[day].outputTokens += r.output_tokens || 0;
        byDay[day].cost += estimateCost(r.input_tokens || 0, r.output_tokens || 0, r.model || '');
        byDay[day].count += 1;
      }

      res.json({
        agentId: req.params.agentId,
        period,
        totalRequests: rows.length,
        totalInputTokens: totalInput,
        totalOutputTokens: totalOutput,
        totalCostUSD: Math.round(totalCost * 1000) / 1000,
        avgLatencyMs: avgLatency,
        byDay: Object.entries(byDay).map(([date, d]) => ({
          date, inputTokens: d.inputTokens, outputTokens: d.outputTokens,
          costUSD: Math.round(d.cost * 1000) / 1000, requestCount: d.count,
        })).sort((a, b) => a.date.localeCompare(b.date)),
      });
    }
  );
});

// ── GET /api/observe/rag-scores/:agentId ──────────────────────────────────────
router.get('/rag-scores/:agentId', (req, res) => {
  const { limit = 50 } = req.query;
  db.all(
    `SELECT * FROM rag_scores WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?`,
    [req.params.agentId, parseInt(limit)],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const stats = rows.length > 0
        ? {
            avgFaithfulness: rows.reduce((s, r) => s + (r.faithfulness || 0), 0) / rows.length,
            avgRelevancy: rows.reduce((s, r) => s + (r.relevancy || 0), 0) / rows.length,
            avgComposite: rows.reduce((s, r) => s + (r.composite || 0), 0) / rows.length,
            count: rows.length,
          }
        : null;
      res.json({ scores: rows, stats });
    }
  );
});

// ── GET /api/observe/intent-distribution/:agentId ───────────────────────────────
router.get('/intent-distribution/:agentId', (req, res) => {
  const { period = '7d' } = req.query;
  const now = Date.now();
  const since = new Date(now - 7 * 86400 * 1000).toISOString();
  db.all(
    `SELECT intent, COUNT(*) as count FROM token_usage
     WHERE agent_id = ? AND created_at >= ? AND intent IS NOT NULL
     GROUP BY intent`,
    [req.params.agentId, since],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const total = rows.reduce((s, r) => s + r.count, 0);
      const distribution = rows.map(r => ({
        intent: r.intent || 'unknown',
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
      }));
      res.json({ distribution, total });
    }
  );
});

// ── POST /api/observe/score ────────────────────────────────────────────────────
// Trigger async RAG scoring for a specific turn
// Body: { agentId, question, answer, contextChunks }
router.post('/score', async (req, res) => {
  const { agentId, question, answer, contextChunks } = req.body;
  if (!agentId || !question || !answer) {
    return res.status(400).json({ error: 'agentId, question, and answer are required' });
  }
  try {
    const { scoreRAG } = require('./tracer');
    const result = await scoreRAG(question, answer, contextChunks || []);
    if (result.composite !== null) {
      db.run(
        `INSERT INTO rag_scores (agent_id, question, answer, faithfulness, relevancy, composite, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [agentId, question.substring(0, 500), answer.substring(0, 1000),
         result.faithfulness, result.relevancy, result.composite, new Date().toISOString()]
      );
    }
    res.json({ agentId, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
