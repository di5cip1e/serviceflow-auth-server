/**
 * Lead Generation Routes (Phase 9)
 * 
 * GET  /api/leads/:agentId          — Get leads for an agent
 * GET  /api/leads/stats/:agentId    — Get lead stats
 * POST /api/leads/:agentId/search   — Trigger lead search (LLM-powered)
 * POST /api/leads/:agentId/save     — Save a found lead
 * PUT  /api/leads/status/:leadId    — Update lead status
 * DELETE /api/leads/:leadId         — Delete a lead
 * GET  /api/leads/export/:agentId   — Export leads as CSV
 */

const express = require('express');
const router = express.Router();
const db = require('../database');
const leadFinder = require('../services/leadFinder');
const { v4: uuidv4 } = require('uuid');

// Auth middleware — require session
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Check if agent belongs to current user
async function requireAgentAccess(req, res, next) {
  const { agentId } = req.params;
  const userId = req.session.userId;
  
  return new Promise((resolve) => {
    db.get(
      `SELECT a.id FROM agents a
       JOIN customers c ON a.customer_id = c.id
       WHERE a.id = ? AND c.user_id = ?`,
      [agentId, userId],
      (err, row) => {
        if (err || !row) {
          res.status(403).json({ error: 'Access denied' });
          return resolve(false);
        }
        next();
        return resolve(true);
      }
    );
  });
}

// GET /api/leads/:agentId — Get leads for an agent
router.get('/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { status, limit } = req.query;
    
    // Verify ownership
    const hasAccess = await new Promise((resolve) => {
      db.get(
        `SELECT a.id FROM agents a
         JOIN customers c ON a.customer_id = c.id
         WHERE a.id = ? AND c.user_id = ?`,
        [agentId, req.session.userId],
        (err, row) => resolve(!!row)
      );
    });
    
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });
    
    const leads = await leadFinder.getLeads(agentId, status || null, parseInt(limit) || 50);
    res.json({ success: true, leads });
  } catch (err) {
    console.error('GET leads error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/stats/:agentId — Get lead stats
router.get('/stats/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const hasAccess = await new Promise((resolve) => {
      db.get(
        `SELECT a.id FROM agents a
         JOIN customers c ON a.customer_id = c.id
         WHERE a.id = ? AND c.user_id = ?`,
        [agentId, req.session.userId],
        (err, row) => resolve(!!row)
      );
    });
    
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });
    
    const stats = await leadFinder.getLeadStats(agentId);
    res.json({ success: true, stats });
  } catch (err) {
    console.error('GET lead stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:agentId/search — Trigger LLM-powered lead search
router.post('/:agentId/search', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Get agent info
    const agent = await new Promise((resolve, reject) => {
      db.get(
        `SELECT a.*, c.user_id FROM agents a
         JOIN customers c ON a.customer_id = c.id
         WHERE a.id = ?`,
        [agentId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });
    
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    if (agent.user_id !== req.session.userId) return res.status(403).json({ error: 'Access denied' });
    
    // Check tier eligibility
    if (!leadFinder.isEligible(agent.plan_name)) {
      return res.status(403).json({ 
        error: 'Lead generation requires Growth plan or above',
        upgradeUrl: '/build/plan',
        currentPlan: agent.plan_name
      });
    }
    
    // Build the search prompt
    const prompt = leadFinder.buildLeadSearchPrompt(agent);
    
    // Call OpenRouter for lead search
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openrouterKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-4.1-mini',
        messages: [
          { role: 'system', content: 'You are a B2B lead generation expert. Always respond with valid JSON arrays only. No markdown, no code fences.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Parse leads from response
    let leads = [];
    try {
      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        leads = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error('Failed to parse leads from LLM response:', parseErr);
      return res.status(500).json({ error: 'Failed to parse leads from search results' });
    }
    
    // Save leads to database
    const savedLeads = [];
    for (const lead of leads) {
      if (lead.company_name) {
        const result = await leadFinder.saveLead(agentId, {
          company_name: lead.company_name,
          contact_name: lead.contact_name || '',
          title: lead.title || '',
          email: lead.email || '',
          linkedin_url: lead.linkedin_url || '',
          source_url: lead.source_url || '',
          lead_score: Math.min(100, Math.max(1, lead.lead_score || 50)),
          outreach_draft: lead.outreach_draft || leadFinder.buildOutreachDraft(agent, lead)
        });
        if (result.changes > 0) {
          savedLeads.push(lead);
        }
      }
    }
    
    res.json({
      success: true,
      found: leads.length,
      saved: savedLeads.length,
      leads: savedLeads
    });
    
  } catch (err) {
    console.error('POST lead search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:agentId/save — Manually save a lead
router.post('/:agentId/save', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { company_name, contact_name, title, email, linkedin_url, source_url, lead_score, outreach_draft } = req.body;
    
    if (!company_name) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    const hasAccess = await new Promise((resolve) => {
      db.get(
        `SELECT a.id FROM agents a
         JOIN customers c ON a.customer_id = c.id
         WHERE a.id = ? AND c.user_id = ?`,
        [agentId, req.session.userId],
        (err, row) => resolve(!!row)
      );
    });
    
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });
    
    const result = await leadFinder.saveLead(agentId, {
      company_name, contact_name, title, email, linkedin_url, source_url,
      lead_score: lead_score || 50,
      outreach_draft: outreach_draft || ''
    });
    
    res.json({ success: true, leadId: result.id, saved: result.changes > 0 });
  } catch (err) {
    console.error('POST save lead error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/leads/status/:leadId — Update lead status
router.put('/status/:leadId', requireAuth, async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status, notes } = req.body;
    
    if (!status || !['new', 'contacted', 'converted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status required: new, contacted, converted, rejected' });
    }
    
    // Verify ownership through agent -> customer -> user
    const hasAccess = await new Promise((resolve) => {
      db.get(
        `SELECT l.id FROM leads l
         JOIN agents a ON l.agent_id = a.id
         JOIN customers c ON a.customer_id = c.id
         WHERE l.id = ? AND c.user_id = ?`,
        [leadId, req.session.userId],
        (err, row) => resolve(!!row)
      );
    });
    
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });
    
    await leadFinder.updateLeadStatus(leadId, status, notes);
    res.json({ success: true });
  } catch (err) {
    console.error('PUT lead status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:leadId — Delete a lead
router.delete('/:leadId', requireAuth, async (req, res) => {
  try {
    const { leadId } = req.params;
    
    const hasAccess = await new Promise((resolve) => {
      db.get(
        `SELECT l.id FROM leads l
         JOIN agents a ON l.agent_id = a.id
         JOIN customers c ON a.customer_id = c.id
         WHERE l.id = ? AND c.user_id = ?`,
        [leadId, req.session.userId],
        (err, row) => resolve(!!row)
      );
    });
    
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });
    
    await leadFinder.deleteLead(leadId);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE lead error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/export/:agentId — Export leads as CSV
router.get('/export/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const hasAccess = await new Promise((resolve) => {
      db.get(
        `SELECT a.id FROM agents a
         JOIN customers c ON a.customer_id = c.id
         WHERE a.id = ? AND c.user_id = ?`,
        [agentId, req.session.userId],
        (err, row) => resolve(!!row)
      );
    });
    
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });
    
    const leads = await leadFinder.getLeads(agentId, null, 500);
    
    // Build CSV
    const headers = ['Company', 'Contact', 'Title', 'Email', 'LinkedIn', 'Source', 'Score', 'Status', 'Outreach Draft', 'Found At'];
    const rows = leads.map(l => [
      `"${(l.company_name || '').replace(/"/g, '""')}"`,
      `"${(l.contact_name || '').replace(/"/g, '""')}"`,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      l.email || '',
      l.linkedin_url || '',
      l.source_url || '',
      l.lead_score || 0,
      l.status || 'new',
      `"${(l.outreach_draft || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      l.found_at || ''
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads-${agentId}-${Date.now()}.csv"`);
    res.send(csv);
    
  } catch (err) {
    console.error('GET export leads error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
