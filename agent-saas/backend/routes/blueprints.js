const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all blueprints
router.get('/', (req, res) => {
  db.all('SELECT * FROM blueprints ORDER BY category, name', [], (err, blueprints) => {
    if (err) {
      // Table might not exist yet — return empty array
      if (err.message.includes('no such table')) {
        return res.json([]);
      }
      return res.json({ error: err.message });
    }
    res.json(blueprints || []);
  });
});

// Get single blueprint
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM blueprints WHERE id = ?', [req.params.id], (err, bp) => {
    if (err) return res.json({ error: err.message });
    if (!bp) return res.json({ error: 'Not found' });
    res.json(bp);
  });
});

// Use a blueprint (apply to agent)
router.post('/:id/use', (req, res) => {
  const { agentId } = req.body;
  if (!agentId) return res.json({ error: 'agentId required' });

  db.get('SELECT * FROM blueprints WHERE id = ?', [req.params.id], (err, bp) => {
    if (err) return res.json({ error: err.message });
    if (!bp) return res.json({ error: 'Blueprint not found' });

    // Apply blueprint config to agent
    const updates = [];
    const params = [];

    if (bp.system_prompt) { updates.push('system_prompt = ?'); params.push(bp.system_prompt); }
    if (bp.tone) { updates.push('tone = ?'); params.push(bp.tone); }
    if (bp.industry) { updates.push('industry = ?'); params.push(bp.industry); }
    if (bp.guardrails) { updates.push('guardrails = ?'); params.push(bp.guardrails); }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(agentId);
      db.run(`UPDATE agents SET ${updates.join(', ')} WHERE id = ?`, params, function(err2) {
        if (err2) return res.json({ error: err2.message });
        res.json({ success: true, changes: this.changes, blueprint: bp.name });
      });
    } else {
      res.json({ success: true, message: 'No config to apply', blueprint: bp.name });
    }
  });
});

module.exports = router;
