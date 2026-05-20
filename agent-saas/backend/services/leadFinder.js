/**
 * Lead Finder Service (Phase 9)
 * 
 * Finds and scores leads for each agent based on their ICP
 * (industry, target audience, tone, use cases).
 * 
 * Tier gating: Only agents on Growth plan or above get lead generation.
 */

const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// Plans that have access to lead generation
const ELIGIBLE_PLANS = ['growth', 'scale', 'enterprise', 'Growth Agent', 'growth (beta)', 'scale (beta)', 'enterprise (beta)'];

/**
 * Check if an agent's plan includes lead generation
 */
function isEligible(planName) {
  if (!planName) return false;
  const p = planName.toLowerCase().replace(/ \(beta\)/, '').trim();
  return ['growth', 'scale', 'enterprise'].includes(p);
}

/**
 * Get all agents eligible for lead generation
 */
function getEligibleAgents() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT a.id, a.agent_name, a.industry, a.target_audience, a.tone, a.use_cases, a.business_name, a.plan_name, a.customer_id
       FROM agents a
       WHERE a.status = 'active'
       AND a.industry IS NOT NULL
       AND a.industry != ''`,
      [],
      (err, rows) => {
        if (err) return reject(err);
        // Filter by eligible plans
        const eligible = rows.filter(r => isEligible(r.plan_name));
        resolve(eligible);
      }
    );
  });
}

/**
 * Build a lead search prompt for the LLM based on agent ICP
 */
function buildLeadSearchPrompt(agent) {
  return `You are a B2B lead generation expert. Find real, specific leads for this business:

Business: ${agent.business_name || agent.agent_name}
Industry: ${agent.industry}
Target Audience: ${agent.target_audience}
Use Cases: ${agent.use_cases || 'General business services'}
Tone: ${agent.tone}

Search the web and find 3-5 REAL companies/people that match this ICP. For each lead, provide:
1. Company name
2. Contact person name and title (if findable)
3. Company website URL
4. LinkedIn URL (if findable)
5. Email (if findable)
6. A lead score from 1-100 (based on how well they match the target audience)
7. A brief reason why this is a good lead
8. A personalized outreach email draft (2-3 sentences) referencing their business

Format each lead as a JSON object. Return a JSON array of leads.
Only include real companies you can verify. Do not make up fake companies.

Example format:
[
  {
    "company_name": "Acme Corp",
    "contact_name": "Jane Smith",
    "title": "VP of Marketing",
    "email": "jane@acme.com",
    "linkedin_url": "https://linkedin.com/in/janesmith",
    "source_url": "https://acme.com",
    "lead_score": 85,
    "reason": "Acme Corp is a mid-size SaaS company that matches the target audience perfectly",
    "outreach_draft": "Hi Jane, I noticed Acme Corp is scaling its marketing efforts..."
  }
]`;
}

/**
 * Build outreach draft for a lead using agent's tone
 */
function buildOutreachDraft(agent, lead) {
  const tone = agent.tone || 'professional';
  const businessName = agent.business_name || agent.agent_name;
  
  return `Hi ${lead.contact_name || 'there'},

I came across ${lead.company_name} and was impressed by what you're doing in the ${agent.industry} space. As a ${agent.target_audience || 'business'} specialist, I'd love to explore how ${businessName} could help ${lead.contact_name ? 'you' : 'your team'} achieve better results.

Would you be open to a quick 15-minute call this week?

Best regards,
${businessName} Team`;
}

/**
 * Save a lead to the database
 */
function saveLead(agentId, lead) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    db.run(
      `INSERT OR IGNORE INTO leads (id, agent_id, company_name, contact_name, title, email, linkedin_url, source_url, lead_score, outreach_draft, status, found_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', datetime('now'))`,
      [
        id,
        agentId,
        lead.company_name || '',
        lead.contact_name || '',
        lead.title || '',
        lead.email || '',
        lead.linkedin_url || '',
        lead.source_url || '',
        lead.lead_score || 50,
        lead.outreach_draft || '',
      ],
      function(err) {
        if (err) return reject(err);
        resolve({ id, changes: this.changes });
      }
    );
  });
}

/**
 * Get leads for an agent
 */
function getLeads(agentId, status = null, limit = 50) {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * FROM leads WHERE agent_id = ?`;
    const params = [agentId];
    
    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    
    sql += ` ORDER BY lead_score DESC, found_at DESC LIMIT ?`;
    params.push(limit);
    
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * Update lead status
 */
function updateLeadStatus(leadId, status, notes = null) {
  return new Promise((resolve, reject) => {
    const contactedAt = status === 'contacted' ? `datetime('now')` : null;
    db.run(
      `UPDATE leads SET status = ?, notes = COALESCE(?, notes) ${contactedAt ? ', contacted_at = datetime(\'now\')' : ''} WHERE id = ?`,
      [status, notes, leadId],
      function(err) {
        if (err) return reject(err);
        resolve({ changes: this.changes });
      }
    );
  });
}

/**
 * Delete a lead
 */
function deleteLead(leadId) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM leads WHERE id = ?`, [leadId], function(err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}

/**
 * Get lead stats for an agent
 */
function getLeadStats(agentId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted_count,
        SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted_count,
        ROUND(AVG(lead_score), 1) as avg_score
       FROM leads WHERE agent_id = ?`,
      [agentId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row);
      }
    );
  });
}

/**
 * Run lead finding for all eligible agents (called by cron)
 * This is a lightweight version that stores search parameters;
 * actual LLM-based search happens via the API endpoint
 */
async function runDaily() {
  const agents = await getEligibleAgents();
  const results = [];
  
  for (const agent of agents) {
    // Check if we already found leads today for this agent
    const todayCount = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as cnt FROM leads WHERE agent_id = ? AND date(found_at) = date('now')`,
        [agent.id],
        (err, row) => {
          if (err) return reject(err);
          resolve(row ? row.cnt : 0);
        }
      );
    });
    
    results.push({
      agentId: agent.id,
      agentName: agent.agent_name,
      plan: agent.plan_name,
      alreadyFoundToday: todayCount,
      eligible: true
    });
  }
  
  return {
    runAt: new Date().toISOString(),
    eligibleAgents: agents.length,
    results
  };
}

module.exports = {
  isEligible,
  getEligibleAgents,
  buildLeadSearchPrompt,
  buildOutreachDraft,
  saveLead,
  getLeads,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  runDaily,
  ELIGIBLE_PLANS
};
