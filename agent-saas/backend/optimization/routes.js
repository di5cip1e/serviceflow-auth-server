/**
 * Optimization Routes — Phase 6
 * GET  /api/optimization/pending          — list pending proposals
 * GET  /api/optimization/:id              — get single proposal
 * GET  /api/optimization/history/:agentId — proposal history for an agent
 * POST /api/optimization/:id/approve      — apply an approved change
 * POST /api/optimization/:id/reject       — reject with reason
 * POST /api/optimization/run             — manually trigger optimization (admin)
 */
const express = require('express');
const router = express.Router();
const { getPendingProposals, getProposal, getProposalHistory, applyProposal, rejectProposal, runOptimization } = require('../services/optimizationEngine');

// ── GET /api/optimization/pending ─────────────────────────────────────────────
router.get('/pending', (req, res) => {
  const { agentId } = req.query;
  getPendingProposals(agentId || null)
    .then(proposals => {
      const enriched = proposals.map(p => ({
        id: p.id,
        agentId: p.agent_id,
        agentName: p.agent_name,
        type: p.type,
        tag: p.tag,
        issue: p.issue,
        priority: p.priority,
        confidence: p.confidence,
        rewrite: p.rewrite ? p.rewrite.substring(0, 500) : null,
        adjustment: p.adjustment ? JSON.parse(p.adjustment) : null,
        estimatedImpact: p.estimated_impact,
        createdAt: p.created_at,
      }));
      res.json({ proposals: enriched, count: enriched.length });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// ── GET /api/optimization/:id ─────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  getProposal(req.params.id)
    .then(p => {
      if (!p) return res.status(404).json({ error: 'Proposal not found' });
      res.json({
        id: p.id,
        agentId: p.agent_id,
        agentName: p.agent_name,
        type: p.type,
        tag: p.tag,
        issue: p.issue,
        priority: p.priority,
        confidence: p.confidence,
        rewrite: p.rewrite,
        adjustment: p.adjustment ? JSON.parse(p.adjustment) : null,
        exampleBad: p.example_bad,
        estimatedImpact: p.estimated_impact,
        status: p.status,
        rejectReason: p.reject_reason,
        createdAt: p.created_at,
        appliedAt: p.applied_at,
      });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// ── GET /api/optimization/history/:agentId ────────────────────────────────────
router.get('/history/:agentId', (req, res) => {
  const { limit = 20 } = req.query;
  getProposalHistory(req.params.agentId, parseInt(limit))
    .then(proposals => {
      const enriched = proposals.map(p => ({
        id: p.id,
        type: p.type,
        tag: p.tag,
        issue: p.issue,
        priority: p.priority,
        confidence: p.confidence,
        status: p.status,
        rejectReason: p.reject_reason,
        estimatedImpact: p.estimated_impact,
        createdAt: p.created_at,
        appliedAt: p.applied_at,
      }));
      res.json({ proposals: enriched, count: enriched.length });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// ── POST /api/optimization/:id/approve ────────────────────────────────────────
router.post('/:id/approve', (req, res) => {
  applyProposal(req.params.id)
    .then(result => res.json({ success: true, ...result }))
    .catch(err => res.status(400).json({ error: err.message }));
});

// ── POST /api/optimization/:id/reject ─────────────────────────────────────────
router.post('/:id/reject', (req, res) => {
  const { reason } = req.body;
  rejectProposal(req.params.id, reason)
    .then(() => res.json({ success: true, proposalId: req.params.id }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// ── POST /api/optimization/run — manual trigger ────────────────────────────────
router.post('/run', (req, res) => {
  // Fire and forget — don't wait for completion
  res.json({ status: 'started', message: 'Optimization run initiated. Check pending proposals shortly.' });
  runOptimization()
    .then(proposals => {
      console.log(`[OPTIMIZE] Manual run complete: ${proposals.length} proposals generated`);
    })
    .catch(err => {
      console.error('[OPTIMIZE] Manual run failed:', err.message);
    });
});

module.exports = router;
