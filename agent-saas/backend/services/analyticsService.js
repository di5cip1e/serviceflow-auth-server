/**
 * Analytics Service
 * 
 * Provides customer-facing analytics for the dashboard:
- Messages per day/week/month
- Leads found over time
- Credits used vs remaining
- Cost trends
- Agent performance metrics
 */

const db = require('../database');

/**
 * Get analytics data for an agent
 */
async function getAgentAnalytics(agentId, period = '30d') {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const since = new Date(Date.now() - days * 86400000).toISOString();

  // Message counts per day
  const messagesPerDay = await new Promise((resolve) => {
    db.all(
      `SELECT date(created_at) as day, COUNT(*) as count
       FROM conversations
       WHERE agent_id = ? AND role = 'user' AND created_at >= ?
       GROUP BY date(created_at)
       ORDER BY day ASC`,
      [agentId, since],
      (err, rows) => resolve(rows || [])
    );
  });

  // Total messages
  const totalMessages = messagesPerDay.reduce((sum, r) => sum + r.count, 0);

  // Leads found over time
  const leadsOverTime = await new Promise((resolve) => {
    db.all(
      `SELECT date(found_at) as day, COUNT(*) as count, AVG(lead_score) as avg_score
       FROM leads
       WHERE agent_id = ? AND found_at >= ?
       GROUP BY date(found_at)
       ORDER BY day ASC`,
      [agentId, since],
      (err, rows) => resolve(rows || [])
    );
  });

  const totalLeads = leadsOverTime.reduce((sum, r) => sum + r.count, 0);
  const avgLeadScore = leadsOverTime.length > 0
    ? Math.round(leadsOverTime.reduce((sum, r) => sum + (r.avg_score || 0), 0) / leadsOverTime.length)
    : 0;

  // Lead status breakdown
  const leadStatuses = await new Promise((resolve) => {
    db.all(
      `SELECT status, COUNT(*) as count FROM leads WHERE agent_id = ? GROUP BY status`,
      [agentId],
      (err, rows) => resolve(rows || [])
    );
  });

  // Token usage
  const tokenUsage = await new Promise((resolve) => {
    db.get(
      `SELECT SUM(input_tokens) as total_input, SUM(output_tokens) as total_output,
              SUM(input_tokens + output_tokens) as total
       FROM token_usage WHERE agent_id = ? AND created_at >= ?`,
      [agentId, since],
      (err, row) => resolve(row || { total_input: 0, total_output: 0, total: 0 })
    );
  });

  // Credit balance
  const credits = await new Promise((resolve) => {
    db.get(
      `SELECT base_tokens, base_tokens_used, outcome_credits, outcome_credits_used
       FROM agents WHERE id = ?`,
      [agentId],
      (err, row) => resolve(row || {})
    );
  });

  // Cost estimate
  const costEstimate = await new Promise((resolve) => {
    db.get(
      `SELECT SUM(CASE
        WHEN model LIKE '%gpt-4.1-mini%' THEN (input_tokens * 0.00000015 + output_tokens * 0.0000006)
        WHEN model LIKE '%gpt-5-mini%' THEN (input_tokens * 0.00000025 + output_tokens * 0.000001)
        WHEN model LIKE '%minimax%' THEN (input_tokens * 0.00000015 + output_tokens * 0.00000015)
        ELSE 0
      END) as estimated_cost
      FROM token_usage WHERE agent_id = ? AND created_at >= ?`,
      [agentId, since],
      (err, row) => resolve(row?.estimated_cost || 0)
    );
  });

  // Escalations
  const escalations = await new Promise((resolve) => {
    db.get(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN resolved = 1 THEN 1 ELSE 0 END) as resolved
       FROM escalations WHERE agent_id = ? AND created_at >= ?`,
      [agentId, since],
      (err, row) => resolve(row || { total: 0, resolved: 0 })
    );
  });

  // Fill in missing days for chart data
  const messageChart = fillMissingDays(messagesPerDay, days);
  const leadsChart = fillMissingDays(leadsOverTime, days);

  return {
    period: days,
    messages: {
      total: totalMessages,
      perDay: messageChart,
      avgPerDay: messagesPerDay.length > 0 ? Math.round(totalMessages / messagesPerDay.length) : 0
    },
    leads: {
      total: totalLeads,
      avgScore: avgLeadScore,
      perDay: leadsChart,
      statuses: leadStatuses
    },
    usage: {
      tokens: tokenUsage,
      credits: {
        baseTotal: credits.base_tokens || 0,
        baseUsed: credits.base_tokens_used || 0,
        baseRemaining: (credits.base_tokens || 0) - (credits.base_tokens_used || 0),
        outcomeTotal: credits.outcome_credits || 0,
        outcomeUsed: credits.outcome_credits_used || 0,
        outcomeRemaining: (credits.outcome_credits || 0) - (credits.outcome_credits_used || 0)
      },
      estimatedCost: Math.round(costEstimate * 100) / 100
    },
    escalations: {
      total: escalations.total || 0,
      resolved: escalations.resolved || 0,
      unresolved: (escalations.total || 0) - (escalations.resolved || 0)
    }
  };
}

function fillMissingDays(data, days) {
  const result = [];
  const map = {};
  data.forEach(r => { map[r.day] = r.count; });
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().split('T')[0];
    result.push({ day: key, count: map[key] || 0 });
  }
  
  return result;
}

module.exports = { getAgentAnalytics };
