const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/delegation/:agentId — get sub-agents for a manager agent
router.get('/:agentId', (req, res) => {
  db.all('SELECT id, agent_name, status, model_tier FROM agents WHERE parent_agent_id = ?',
    [req.params.agentId], (err, rows) => {
      if (err) return res.json({ subAgents: [] }); // column might not exist yet
      res.json({ subAgents: rows || [] });
    });
});

// POST /api/delegation/:agentId/spawn — spawn a new sub-agent
router.post('/:agentId/spawn', (req, res) => {
  const { name, role, model_tier } = req.body;
  const parentId = req.params.agentId;
  const subAgentId = 'sub_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);

  db.run(
    `INSERT INTO agents (id, agent_name, system_prompt, plan, status, model_tier, parent_agent_id)
     VALUES (?, ?, ?, 'basic', 'active', ?, ?)`,
    [subAgentId, name, `You are a ${role || 'specialized'} AI assistant. Answer helpfully and concisely.`,
     model_tier || 'standard', parentId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, subAgentId, name, role: role || 'specialized' });
    }
  );
});

// DELETE /api/delegation/:agentId/:subAgentId — remove sub-agent
router.delete('/:agentId/:subAgentId', (req, res) => {
  db.run('DELETE FROM agents WHERE id = ? AND parent_agent_id = ?',
    [req.params.subAgentId, req.params.agentId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

module.exports = router;
