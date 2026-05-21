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

module.exports = router;
