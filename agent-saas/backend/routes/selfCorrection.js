/**
 * Self-Correction Routes — C.3
 * 
 * GET  /api/self-correction/events/:agentId   — list recent loop events
 * POST /api/self-correction/resolve/:eventId   — mark resolved
 * GET  /api/self-correction/stats/:agentId   — count by event_type
 */
const express = require('express');
const router = express.Router();
const { shouldIntervene, getInterventionAction, getEvents, resolveEvent, getStats, logEvent, getRecentHistory } = require('../services/loopDetector');
const db = require('../database');

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

// GET /api/self-correction/events/:agentId
router.get('/events/:agentId', requireAuth, async (req, res) => {
  try {
    const hasAccess = await verifyAgentAccess(req.params.agentId, req.session.userId);
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });
    const events = await getEvents(req.params.agentId);
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/self-correction/resolve/:eventId
router.post('/resolve/:eventId', requireAuth, async (req, res) => {
  try {
    const result = await resolveEvent(req.params.eventId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/self-correction/stats/:agentId
router.get('/stats/:agentId', requireAuth, async (req, res) => {
  try {
    const hasAccess = await verifyAgentAccess(req.params.agentId, req.session.userId);
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });
    const stats = await getStats(req.params.agentId);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/self-correction/check — check a message for loops (called by frontend)
router.post('/check', async (req, res) => {
  try {
    const { agentId, message } = req.body;
    if (!agentId) return res.status(400).json({ error: 'agentId required' });
    
    const history = await getRecentHistory(agentId, 20);
    // Add the new message to history for checking
    history.push({ role: 'user', content: message });
    
    const result = await shouldIntervene(history, agentId);
    if (result.shouldIntervene) {
      result.action = getInterventionAction(result.reason, result.type);
    }
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
