/**
 * Onboarding Wizard Routes
 * 
 * GET  /api/onboarding/:agentId/status     — Get onboarding progress
 * POST /api/onboarding/:agentId/step/:step  — Mark step complete
 * GET  /api/onboarding/:agentId/provisioning — Poll provisioning status
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

async function verifyAgentAccess(agentId, userId) {
  return new Promise((resolve) => {
    db.get(
      `SELECT a.id, a.agent_name, a.business_name, a.status, a.plan_name, a.industry, a.target_audience, a.tone
       FROM agents a JOIN customers c ON a.customer_id = c.id
       WHERE a.id = ? AND c.user_id = ?`,
      [agentId, userId],
      (err, row) => resolve(row || null)
    );
  });
}

// GET /api/onboarding/:agentId/status
router.get('/:agentId/status', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await verifyAgentAccess(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    // Get onboarding progress from DB
    const progress = await new Promise((resolve) => {
      db.get(
        `SELECT * FROM onboarding_progress WHERE agent_id = ?`,
        [agentId],
        (err, row) => resolve(row || null)
      );
    });

    // Determine current step based on agent status
    const steps = [
      { id: 'welcome', label: 'Welcome', completed: true },
      { id: 'channel', label: 'Connect Channel', completed: false },
      { id: 'chat', label: 'Test Chat', completed: false },
      { id: 'leads', label: 'Find Leads', completed: false },
      { id: 'complete', label: 'You\'re Live!', completed: false }
    ];

    // Check channel connections
    const channels = await new Promise((resolve) => {
      db.all(`SELECT channel_type FROM agent_channels WHERE agent_id = ? AND status = 'active'`, [agentId], (err, rows) => {
        resolve(rows || []);
      });
    });
    if (channels.length > 0) steps[1].completed = true;

    // Check if chat has been tested
    const chatTested = await new Promise((resolve) => {
      db.get(`SELECT COUNT(*) as cnt FROM conversations WHERE agent_id = ? AND role = 'user'`, [agentId], (err, row) => {
        resolve(row && row.cnt > 0);
      });
    });
    if (chatTested) steps[2].completed = true;

    // Check if leads found
    const leadsFound = await new Promise((resolve) => {
      db.get(`SELECT COUNT(*) as cnt FROM leads WHERE agent_id = ?`, [agentId], (err, row) => {
        resolve(row && row.cnt > 0);
      });
    });
    if (leadsFound) steps[3].completed = true;

    // Determine current step
    let currentStep = 0;
    for (let i = 0; i < steps.length; i++) {
      if (!steps[i].completed) { currentStep = i; break; }
      if (i === steps.length - 1) currentStep = steps.length - 1;
    }

    res.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.agent_name,
        businessName: agent.business_name,
        status: agent.status,
        plan: agent.plan_name,
        industry: agent.industry,
        targetAudience: agent.target_audience,
        tone: agent.tone
      },
      steps,
      currentStep,
      completed: steps.every(s => s.completed)
    });
  } catch (err) {
    console.error('GET onboarding status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/onboarding/:agentId/step/:stepId/complete
router.post('/:agentId/step/:stepId/complete', requireAuth, async (req, res) => {
  try {
    const { agentId, stepId } = req.params;
    const agent = await verifyAgentAccess(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    // Upsert progress
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO onboarding_progress (agent_id, step_id, completed_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(agent_id, step_id) DO UPDATE SET completed_at = datetime('now')`,
        [agentId, stepId],
        (err) => { if (err) reject(err); else resolve(); }
      );
    });

    res.json({ success: true, step: stepId });
  } catch (err) {
    console.error('POST onboarding step error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/onboarding/:agentId/provisioning
router.get('/:agentId/provisioning', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await verifyAgentAccess(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    res.json({
      success: true,
      status: agent.status, // pending, active, error
      agentName: agent.agent_name,
      ready: agent.status === 'active'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
