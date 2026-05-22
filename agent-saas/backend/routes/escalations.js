/**
 * Escalation Routes — HITL (Human-in-the-Loop) Approvals
 *
 * GET  /api/escalations/pending           — list all unresolved escalations
 * GET  /api/escalations/pending/:agentId  — list unresolved for specific agent
 * POST /api/escalations/:id/approve       — approve / mark resolved
 * POST /api/escalations/:id/dismiss       — dismiss / reject
 * POST /api/escalations                   — create new escalation
 */
const express = require('express');
const router = express.Router();
const db = require('../database');

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// GET /api/escalations/pending — all unresolved escalations for current user
router.get('/pending', requireAuth, (req, res) => {
  db.all(
    `SELECT e.*, a.name as agent_name
     FROM escalations e
     JOIN agents a ON e.agent_id = a.id
     JOIN customers c ON a.customer_id = c.id
     WHERE e.resolved = 0 AND c.user_id = ?
     ORDER BY e.created_at DESC
     LIMIT 50`,
    [req.session.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const escalations = rows.map(r => ({
        id: r.id,
        agentId: r.agent_id,
        agentName: r.agent_name,
        type: r.alert_type,
        message: r.message,
        createdAt: r.created_at,
        resolved: !!r.resolved,
      }));
      res.json({ escalations, count: escalations.length });
    }
  );
});

// GET /api/escalations/pending/:agentId — unresolved for specific agent
router.get('/pending/:agentId', requireAuth, (req, res) => {
  db.all(
    `SELECT e.*, a.name as agent_name
     FROM escalations e
     JOIN agents a ON e.agent_id = a.id
     JOIN customers c ON a.customer_id = c.id
     WHERE e.agent_id = ? AND e.resolved = 0 AND c.user_id = ?
     ORDER BY e.created_at DESC
     LIMIT 20`,
    [req.params.agentId, req.session.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const escalations = rows.map(r => ({
        id: r.id,
        agentId: r.agent_id,
        agentName: r.agent_name,
        type: r.alert_type,
        message: r.message,
        createdAt: r.created_at,
        resolved: !!r.resolved,
      }));
      res.json({ escalations, count: escalations.length });
    }
  );
});

// POST /api/escalations/:id/approve — approve and resolve
router.post('/:id/approve', requireAuth, (req, res) => {
  const now = new Date().toISOString();
  db.run(
    `UPDATE escalations SET resolved = 1, resolved_at = ? WHERE id = ?`,
    [now, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Escalation not found' });
      res.json({ success: true, id: req.params.id, action: 'approved', resolvedAt: now });
    }
  );
});

// POST /api/escalations/:id/dismiss — dismiss/reject
router.post('/:id/dismiss', requireAuth, (req, res) => {
  const now = new Date().toISOString();
  db.run(
    `UPDATE escalations SET resolved = 1, resolved_at = ? WHERE id = ?`,
    [now, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Escalation not found' });
      res.json({ success: true, id: req.params.id, action: 'dismissed', resolvedAt: now });
    }
  );
});

// POST /api/escalations — create new escalation
router.post('/', requireAuth, (req, res) => {
  const { agentId, alertType, message } = req.body;
  if (!agentId || !alertType) {
    return res.status(400).json({ error: 'agentId and alertType are required' });
  }
  db.run(
    `INSERT INTO escalations (agent_id, alert_type, message, resolved, created_at)
     VALUES (?, ?, ?, 0, ?)`,
    [agentId, alertType, message || '', new Date().toISOString()],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID, agentId, alertType, message });
    }
  );
});

module.exports = router;
