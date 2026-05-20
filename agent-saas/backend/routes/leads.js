/**
 * Lead Generation Routes (Phase 9)
 * 
 * GET  /api/leads/:agentId          — Get leads for an agent
 * GET  /api/leads/stats/:agentId    — Get lead stats
 * POST /api/leads/:agentId/search   — Trigger lead search (LLM-powered)
 * POST /api/leads/:agentId/save     — Save a found lead
 * PUT  /api/leads/status/:leadId    — Update lead status + notes
 * DELETE /api/leads/:leadId         — Delete a lead
 * GET  /api/leads/export/:agentId   — Export leads as CSV or PDF
 */

const express = require('express');
const router = express.Router();
const db = require('../database');
const leadFinder = require('../services/leadFinder');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');

// ── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Verify agent ownership
async function verifyAgentAccess(agentId, userId) {
  return new Promise((resolve) => {
    db.get(
      `SELECT a.id, a.agent_name, a.business_name FROM agents a
       JOIN customers c ON a.customer_id = c.id
       WHERE a.id = ? AND c.user_id = ?`,
      [agentId, userId],
      (err, row) => resolve(row || null)
    );
  });
}

// Verify lead ownership
async function verifyLeadAccess(leadId, userId) {
  return new Promise((resolve) => {
    db.get(
      `SELECT l.id FROM leads l
       JOIN agents a ON l.agent_id = a.id
       JOIN customers c ON a.customer_id = c.id
       WHERE l.id = ? AND c.user_id = ?`,
      [leadId, userId],
      (err, row) => resolve(!!row)
    );
  });
}

// ── PDF Generation ──────────────────────────────────────────────────────────

function generateLeadsPDF(leads, agent) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    const agentName = agent?.business_name || agent?.agent_name || 'M.ai.K.R';
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Header
    doc.fillColor('#0A0A0F').fontSize(24).font('Helvetica-Bold').text('Lead Report', 50, 50);
    doc.fillColor('#666').fontSize(11).font('Helvetica').text(agentName, 50, 78);
    doc.text(`Generated: ${date}`, 50, 95);
    doc.text('M.ai.K.R Lead Generation', 50, 112);
    
    // Divider
    doc.moveTo(50, 130).lineTo(545, 130).stroke('#C0A060').lineWidth(2);
    
    // Summary stats
    doc.fillColor('#0A0A0F').fontSize(14).font('Helvetica-Bold').text('Summary', 50, 145);
    doc.fontSize(10).font('Helvetica');
    const avgScore = leads.length ? Math.round(leads.reduce((a,b) => a + (b.lead_score||0), 0) / leads.length) : 0;
    doc.text(`Total Leads: ${leads.length}  |  New: ${leads.filter(l=>l.status==='new').length}  |  Contacted: ${leads.filter(l=>l.status==='contacted').length}  |  Converted: ${leads.filter(l=>l.status==='converted').length}  |  Avg Score: ${avgScore}`, 50, 165);
    
    // Lead table
    doc.fillColor('#0A0A0F').fontSize(14).font('Helvetica-Bold').text('Leads', 50, 200);
    
    // Table header
    const tableTop = 220;
    doc.fillColor('#1a1a2e').rect(50, tableTop, 495, 20).fill();
    doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold');
    doc.text('#', 55, tableTop + 5);
    doc.text('Company', 85, tableTop + 5);
    doc.text('Contact', 200, tableTop + 5);
    doc.text('Email', 300, tableTop + 5);
    doc.text('Score', 420, tableTop + 5);
    doc.text('Status', 470, tableTop + 5);
    
    // Table rows
    let y = tableTop + 25;
    doc.font('Helvetica').fontSize(9).fillColor('#333');
    
    leads.forEach((l, i) => {
      if (y > 750) { doc.addPage(); y = 50; }
      
      if (i % 2 === 0) {
        doc.fillColor('#fafafa').rect(50, y - 3, 495, 18).fill();
      }
      doc.fillColor('#333');
      
      doc.text(String(i + 1), 55, y);
      doc.text(l.company_name || '-', 85, y, { width: 110, ellipsis: true });
      doc.text(l.contact_name || '-', 200, y, { width: 95, ellipsis: true });
      doc.text(l.email || '-', 300, y, { width: 115, ellipsis: true });
      doc.text(String(l.lead_score || '-'), 420, y);
      doc.text(l.status || 'new', 470, y);
      
      y += 18;
    });
    
    // Outreach drafts section
    const outreachLeads = leads.filter(l => l.outreach_draft);
    if (outreachLeads.length > 0) {
      doc.addPage();
      doc.fillColor('#0A0A0F').fontSize(16).font('Helvetica-Bold').text('Outreach Drafts', 50, 50);
      doc.moveTo(50, 70).lineTo(545, 70).stroke('#C0A060').lineWidth(2);
      
      y = 90;
      outreachLeads.forEach((l, i) => {
        if (y > 700) { doc.addPage(); y = 50; }
        
        // Company header
        doc.fillColor('#C0A060').fontSize(11).font('Helvetica-Bold');
        doc.text(`${l.company_name}  (Score: ${l.lead_score || '-'})`, 50, y);
        y += 18;
        
        // Draft body
        doc.fillColor('#444').fontSize(10).font('Helvetica');
        const draftLines = l.outreach_draft.split('\n');
        draftLines.forEach(line => {
          if (y > 750) { doc.addPage(); y = 50; }
          doc.text(line, 60, y, { width: 470 });
          y += 14;
        });
        
        y += 10;
        doc.moveTo(50, y).lineTo(545, y).stroke('#eee').lineWidth(0.5);
        y += 15;
      });
    }
    
    // Footer
    doc.fillColor('#999').fontSize(8).font('Helvetica');
    doc.text('Generated by M.ai.K.R — maikr.pro', 50, doc.page.height - 50, { align: 'center' });
    
    doc.end();
  });
}

// ── Routes ──────────────────────────────────────────────────────────────────

// GET /api/leads/:agentId — Get leads for an agent
router.get('/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { status, limit } = req.query;
    
    const agent = await verifyAgentAccess(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });
    
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
    const agent = await verifyAgentAccess(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });
    
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
    
    const agent = await verifyAgentAccess(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });
    
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
    
    // Call OpenRouter
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
    
    const agent = await verifyAgentAccess(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });
    
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

// PUT /api/leads/status/:leadId — Update lead status and notes
router.put('/status/:leadId', requireAuth, async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status, notes } = req.body;
    
    if (!status || !['new', 'contacted', 'qualified', 'converted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status required: new, contacted, qualified, converted, rejected' });
    }
    
    const hasAccess = await verifyLeadAccess(leadId, req.session.userId);
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
    const hasAccess = await verifyLeadAccess(leadId, req.session.userId);
    if (!hasAccess) return res.status(403).json({ error: 'Access denied' });
    
    await leadFinder.deleteLead(leadId);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE lead error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/export/:agentId — Export leads as CSV or PDF
router.get('/export/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { format } = req.query;
    
    const agent = await verifyAgentAccess(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });
    
    const leads = await leadFinder.getLeads(agentId, null, 500);
    
    if (format === 'pdf') {
      const pdfBuffer = await generateLeadsPDF(leads, agent);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="leads-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
    } else {
      // CSV export
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
    }
  } catch (err) {
    console.error('GET export leads error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
