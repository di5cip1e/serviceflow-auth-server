/**
 * Analytics Routes
 * 
 * GET /api/analytics/:agentId — Get analytics data for an agent
 */

const express = require('express');
const router = express.Router();
const db = require('../database');
const analyticsService = require('../services/analyticsService');

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

async function verifyAgentAccess(agentId, userId) {
  return new Promise((resolve) => {
    db.get(
      `SELECT a.id FROM agents a JOIN customers c ON a.customer_id = c.id
       WHERE a.id = ? AND c.user_id = ?`,
      [agentId, userId],
      (err, row) => resolve(!!row)
    );
  });
}

// GET /api/analytics/:agentId
router.get('/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { period } = req.query;
    
    const hasAccess = await verifyAgentAccess(agentId, req.session.userId);
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });
    
    const data = await analyticsService.getAgentAnalytics(agentId, period || '30d');
    res.json({ success: true, analytics: data });
  } catch (err) {
    console.error('GET analytics error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/:agentId/spending — Spending caps + cost breakdown
router.get('/:agentId/spending', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const hasAccess = await verifyAgentAccess(agentId, req.session.userId);
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });
    
    const data = await analyticsService.getSpendingAnalytics(agentId);
    res.json({ success: true, spending: data });
  } catch (err) {
    console.error('GET spending analytics error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/analytics/:agentId/spending-cap — Update spending cap
router.put('/:agentId/spending-cap', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { spendingCapCents, dailyTokenCap } = req.body;
    const hasAccess = await verifyAgentAccess(agentId, req.session.userId);
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });

    const updates = [];
    const params = [];
    if (spendingCapCents !== undefined) { updates.push('spending_cap_cents = ?'); params.push(spendingCapCents); }
    if (dailyTokenCap !== undefined) { updates.push('daily_token_cap = ?'); params.push(dailyTokenCap); }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(agentId);
    await new Promise((resolve, reject) => {
      db.run(`UPDATE agents SET ${updates.join(', ')} WHERE id = ?`, params, (err) => {
        if (err) reject(err); else resolve();
      });
    });
    res.json({ success: true });
  } catch (err) {
    console.error('PUT spending cap error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
