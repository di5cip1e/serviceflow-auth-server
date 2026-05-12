// routing/creditRoutes.js
const router = require('express').Router();
const creditManager = require('../services/creditManager');

// Middleware: require auth (same pattern as admin routes)
const authRequired = (req, res, next) => {
  const token = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'API key required' });
  next();
};

/**
 * GET /api/credits/status/:agentId
 * Returns current credit balance and usage for an agent
 */
router.get('/status/:agentId', authRequired, (req, res) => {
  creditManager.getCreditStatus(req.params.agentId, (err, status) => {
    if (err) return res.status(404).json({ error: err.message });
    res.json({
      agentId: req.params.agentId,
      plan: status.planName,
      baseTokens: {
        total: status.baseTokens,
        used: status.baseTokensUsed,
        available: status.baseTokensAvailable,
        percentUsed: Math.round((status.baseTokensUsed / status.baseTokens) * 100),
      },
      outcomeCredits: {
        total: status.outcomeCredits,
        used: status.outcomeCreditsUsed,
        available: status.outcomeCreditsAvailable,
        percentUsed: Math.round((status.outcomeCreditsUsed / status.outcomeCredits) * 100),
      },
      rates: {
        lead_qualified: '2 credits',
        appointment_booked: '3 credits',
        support_ticket_resolved: '1 credit',
        document_generated: '1 credit',
        escalation_resolved: '1 credit',
        rag_query: '0.25 credits',
        mcp_tool_call: '0.5 credits',
      },
    });
  });
});

/**
 * GET /api/credits/transactions/:agentId
 * Returns credit transaction history (last 50)
 */
router.get('/transactions/:agentId', authRequired, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  creditManager.getTransactionHistory(req.params.agentId, limit, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ agentId: req.params.agentId, transactions: rows, count: rows.length });
  });
});

/**
 * POST /api/credits/deduct-outcome
 * Manually deduct outcome credits for a completed action
 * Body: { agentId, outcomeType, referenceId? }
 */
router.post('/deduct-outcome', authRequired, (req, res) => {
  const { agentId, outcomeType, referenceId } = req.body;
  if (!agentId || !outcomeType) {
    return res.status(400).json({ error: 'agentId and outcomeType required' });
  }
  creditManager.deductOutcomeCredit(agentId, outcomeType, referenceId);
  res.json({ success: true, deducted: outcomeType });
});

/**
 * GET /api/credits/packs
 * Available credit pack offerings
 */
router.get('/packs', (req, res) => {
  res.json({
    packs: [
      {
        id: 'outcome-10',
        name: 'Outcome Pack',
        credits: 10,
        priceCents: 1500,
        priceDisplay: '$15.00',
        perCredit: '$1.50',
        bestFor: 'Unlocking 10 additional qualified leads or meetings',
      },
      {
        id: 'outcome-50',
        name: 'Growth Pack',
        credits: 50,
        priceCents: 6500,
        priceDisplay: '$65.00',
        perCredit: '$1.30',
        popular: true,
        bestFor: 'High-volume sales and support teams',
      },
      {
        id: 'outcome-100',
        name: 'Scale Pack',
        credits: 100,
        priceCents: 11000,
        priceDisplay: '$110.00',
        perCredit: '$1.10',
        bestFor: 'Enterprise teams running continuous campaigns',
      },
    ],
  });
});

module.exports = router;