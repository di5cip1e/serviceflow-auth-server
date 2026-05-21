const express = require('express');
const router = express.Router();
const db = require('../database');
const { updateAgentSystemPrompt, updateAgentAppearance } = require('../services/provisioning');

// Get agent by session ID (for success page)
router.get('/get-agent', async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.json({ error: 'No session_id' });
  
  db.get(`SELECT a.* FROM agents a JOIN customers c ON a.customer_id = c.id WHERE c.stripe_session_id = ?`, [session_id], (err, agent) => {
    if (err) {
      console.error('get-agent error:', err);
      return res.json({ error: err.message });
    }
    
    if (agent) {
      res.json({
        success: true,
        agentId: agent.id,
        agentUrl: 'http://maikr.pro/chat.html?agent=' + agent.id,
        agentName: agent.agent_name,
        businessName: agent.business_name
      });
    } else {
      res.json({ success: true, agentUrl: null, message: 'Agent being created' });
    }
  });
});

// Get agent info (for chat page)
router.get('/agent-info', async (req, res) => {
  const { agentId } = req.query;
  if (!agentId) return res.json({ error: 'No agentId' });
  
  db.get('SELECT * FROM agents WHERE id = ?', [agentId], (err, agent) => {
    if (err) {
      console.error('agent-info error:', err);
      return res.json({ error: err.message });
    }
    
    if (agent) {
      // Get API key for this agent's customer
      db.get('SELECT key_prefix FROM api_keys WHERE customer_id = ?', [agent.customer_id], (err2, apiKeyRow) => {
        res.json({
          success: true,
          agentName: agent.agent_name,
          businessName: agent.business_name,
          industry: agent.industry,
          tone: agent.tone,
          systemPrompt: agent.system_prompt,
          avatarUrl: agent.avatar_url,
          themeColor: agent.theme_color,
          dataOptOut: agent.data_opt_out,
          apiKey: apiKeyRow ? apiKeyRow.key_prefix + '********' : 'No API Key'
        });
      });
    } else {
      res.json({ error: 'Agent not found' });
    }
  });
});

// Get agent memory/logs (includes data_opt_out for dashboard toggle state)
router.get('/agent-memory', async (req, res) => {
  const { agentId } = req.query;
  if (!agentId) return res.json({ error: 'No agentId' });
  
  db.get('SELECT data_opt_out FROM agents WHERE id = ?', [agentId], (err, row) => {
    if (err || !row) return res.json({ error: 'Agent not found' });
    db.all('SELECT role, content, created_at FROM conversations WHERE agent_id = ? ORDER BY created_at DESC LIMIT 100', [agentId], (err2, conversations) => {
      if (err2) return res.json({ error: err2.message });
      res.json({ success: true, conversations: (conversations || []).reverse(), dataOptOut: row.data_opt_out });
    });
  });
});

// Data opt-out toggle
router.post('/agent/:agentId/data-opt-out', (req, res) => {
  const { agentId } = req.params;
  const { dataOptOut } = req.body;
  db.run('UPDATE agents SET data_opt_out = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [dataOptOut, agentId], (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ success: true });
  });
});

// Update agent (system_prompt, avatar_url, theme_color)
router.post('/update-agent', async (req, res) => {
  const { agentId, system_prompt, avatar_url, theme_color } = req.body;
  
  if (!agentId) return res.json({ error: 'agentId required' });
  
  try {
    if (system_prompt) {
      await updateAgentSystemPrompt(agentId, system_prompt);
    }
    
    if (avatar_url || theme_color) {
      await updateAgentAppearance(agentId, { avatar_url, theme_color });
    }
    
    res.json({ success: true, message: 'Agent updated' });
  } catch (err) {
    console.error('update-agent error:', err);
    res.json({ error: err.message });
  }
});

// Update agent appearance (personality, colors, tone)
router.post('/:agentId/appearance', async (req, res) => {
  const { agentId } = req.params;
  const { agentName, businessName, industry, personality, primaryColor, accentColor, presetTone, customTone } = req.body;
  
  if (!agentId) return res.json({ error: 'agentId required' });
  
  try {
    const updates = [];
    const params = [];
    
    if (agentName) { updates.push('agent_name = ?'); params.push(agentName); }
    if (businessName) { updates.push('business_name = ?'); params.push(businessName); }
    if (industry) { updates.push('industry = ?'); params.push(industry); }
    if (primaryColor) { updates.push('theme_color = ?'); params.push(primaryColor); }
    if (presetTone) { updates.push('tone = ?'); params.push(presetTone); }
    
    if (personality) {
      const personalityStr = JSON.stringify(personality);
      updates.push('system_prompt = COALESCE(system_prompt, "")');
      // Store personality in a JSON field if we have one, or append to system_prompt
      // For now, we'll store it as a simple field
    }
    
    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(agentId);
      db.run(`UPDATE agents SET ${updates.join(', ')} WHERE id = ?`, params, (err) => {
        if (err) return res.json({ error: err.message });
        res.json({ success: true });
      });
    } else {
      res.json({ success: true, message: 'No changes' });
    }
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Update agent config (dashboard double-entry)
router.post('/agent/:agentId/config', async (req, res) => {
  const { agentId } = req.params;
  const { agentName, businessName, industry, tone, systemPrompt, guardrails } = req.body;

  if (!agentId) return res.json({ error: 'agentId required' });

  try {
    const updates = [];
    const params = [];

    if (agentName !== undefined) { updates.push('agent_name = ?'); params.push(agentName); }
    if (businessName !== undefined) { updates.push('business_name = ?'); params.push(businessName); }
    if (industry !== undefined) { updates.push('industry = ?'); params.push(industry); }
    if (tone !== undefined) { updates.push('tone = ?'); params.push(tone); }
    if (systemPrompt !== undefined) { updates.push('system_prompt = ?'); params.push(systemPrompt); }
    if (guardrails !== undefined) {
      updates.push('guardrails = ?'); params.push(JSON.stringify(guardrails));
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(agentId);
      db.run(`UPDATE agents SET ${updates.join(', ')} WHERE id = ?`, params, function(err) {
        if (err) return res.json({ error: err.message });
        res.json({ success: true, changes: this.changes });
      });
    } else {
      res.json({ success: true, message: 'No changes' });
    }
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Get all agents for current user
router.get('/agents', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.json({ error: 'Not authenticated' });
  }
  db.all(
    'SELECT a.* FROM agents a JOIN customers c ON a.customer_id = c.id WHERE c.user_id = ? ORDER BY a.created_at DESC',
    [req.session.userId],
    (err, agents) => {
      if (err) return res.json({ error: err.message });
      res.json(agents || []);
    }
  );
});

module.exports = router;
