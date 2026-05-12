/**
 * M.ai.K.R Optimization Engine — Phase 6
 *
 * Nightly agent that reviews yesterday's traces, corrections, and escalations
 * to generate self-improvement proposals. All changes require human approval.
 *
 * Data sources:
 *   - RAG scores (faithfulness < 0.6, relevancy < 0.5)
 *   - Escalations (type: MAJOR_DEAL, ANGRY_CUSTOMER, COMPLAINTS)
 *   - User corrections (human feedback events)
 *
 * Changes it can propose:
 *   - System prompt rewrites (for specific agent)
 *   - RAG retrieval weight adjustments (doc prioritization)
 */

const db = require('../database');

// ── Score thresholds ──────────────────────────────────────────────────────────
const FAITHFULNESS_THRESHOLD = 0.6;
const RELEVANCY_THRESHOLD = 0.5;
const MIN_CASES_TO_TRIGGER = 2;  // Minimum similar issues before proposing

// ── Problem patterns to look for ─────────────────────────────────────────────
const PROBLEM_PATTERNS = [
  { tag: 'hallucination_return_policy', keywords: ['return policy', 'refund policy', '30 days', 'money back'], agentType: 'support', issue: 'hallucination', docHint: 'return policy' },
  { tag: 'hallucination_pricing', keywords: ['price', 'cost', 'discount', 'subscription cost', 'how much'], agentType: 'sales', issue: 'hallucination', docHint: 'pricing document' },
  { tag: 'hallucination_features', keywords: ['feature', 'can it', 'does it', 'capabilities', 'what can'], agentType: 'general', issue: 'hallucination', docHint: 'feature list' },
  { tag: 'wrong_routing', keywords: ['escalate', 'human', 'talk to someone', 'manager'], agentType: 'any', issue: 'routing', docHint: null },
  { tag: 'slow_response', keywords: ['slow', 'taking too long', 'wait', 'just a sec'], agentType: 'any', issue: 'latency', docHint: null },
  { tag: 'off_topic', keywords: [], agentType: 'any', issue: 'off_topic', docHint: null },
];

// ── Generate a unique proposal ID ─────────────────────────────────────────────
function genId() {
  return 'prop_' + require('crypto').randomUUID().split('-')[0];
}

// ── Analyze RAG scores from the last 24h ──────────────────────────────────────
function analyzeRagScores(since) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT rs.*, a.agent_name, a.business_name, a.use_cases
       FROM rag_scores rs
       JOIN agents a ON rs.agent_id = a.id
       WHERE rs.created_at >= ? AND (rs.faithfulness < ? OR rs.relevancy < ?)
       ORDER BY rs.created_at DESC`,
      [since, FAITHFULNESS_THRESHOLD, RELEVANCY_THRESHOLD],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

// ── Analyze escalations from the last 24h ────────────────────────────────────
function analyzeEscalations(since) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT e.*, a.agent_name
       FROM escalations e
       JOIN agents a ON e.agent_id = a.id
       WHERE e.created_at >= ? AND e.resolved = 0
       ORDER BY e.created_at DESC`,
      [since],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

// ── Analyze user corrections from conversations ───────────────────────────────
function analyzeUserCorrections(since) {
  return new Promise((resolve, reject) => {
    // Look for short "no", "wrong", "that's not right" type messages from users
    // that follow an assistant message, indicating correction
    db.all(
      `SELECT c.*, a.agent_name
       FROM conversations c
       JOIN agents a ON c.agent_id = a.id
       WHERE c.created_at >= ?
         AND c.role = 'user'
         AND LENGTH(c.content) < 100
         AND c.content IN ('no','No','NO','wrong','Wrong','not right',"that's wrong","that's not right","nope","Nope')
       ORDER BY c.created_at DESC`,
      [since],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

// ── Get agent config for rewriting ───────────────────────────────────────────
function getAgentConfig(agentId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM agents WHERE id = ?`, [agentId], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// ── Detect which problem pattern matches a bad interaction ───────────────────
function matchPattern(text, patterns) {
  for (const p of patterns) {
    for (const kw of p.keywords) {
      if (text.toLowerCase().includes(kw.toLowerCase())) {
        return p;
      }
    }
  }
  return null;
}

// ── Generate a system prompt rewrite proposal ─────────────────────────────────
function generatePromptRewrite(agentRow, pattern, exampleBadContent) {
  const rewrite = `IMPROVED SYSTEM PROMPT for ${agentRow.agent_name} (${agentRow.business_name}):

OBJECTIVE: Fix recurring issue: "${pattern.issue}" related to "${pattern.docHint || pattern.tag}"

WHAT WENT WRONG:
${exampleBadContent ? '- Example bad response: "' + exampleBadContent.substring(0, 200) + '"' : '- Multiple traces showed this pattern'}

INSTRUCTION: Rewrite the agent's system prompt to:
1. Be more explicit about ${pattern.docHint ? `what the policy says regarding ${pattern.docHint}` : 'what the agent should and should not claim'}
2. Add a specific warning phrase the agent must say when unsure (e.g., "Let me check that for you" instead of guessing)
3. Include the correct knowledge cutoff / scope boundaries
4. Keep the same tone, audience, and overall personality

Respond with ONLY the new system prompt text.`;

  return {
    agentId: agentRow.agent_id,
    agentName: agentRow.agent_name,
    type: 'system_prompt_rewrite',
    tag: pattern.tag,
    issue: pattern.issue,
    rewrite,
    priority: 'high',
    confidence: 0.75,
    exampleBadContent: exampleBadContent || null,
    estimatedImpact: 'Fixes hallucination pattern in ' + agentRow.agent_name,
  };
}

// ── Generate a RAG weight adjustment proposal ─────────────────────────────────
function generateRagWeightProposal(agentRow, pattern, relevantDocName) {
  const docHint = pattern.docHint || 'general knowledge';
  return {
    agentId: agentRow.agent_id,
    agentName: agentRow.agent_name,
    type: 'rag_weight_adjustment',
    tag: pattern.tag,
    issue: pattern.issue,
    docHint,
    adjustment: JSON.stringify({
      priority_boost: 1.5,
      doc_pattern: docHint,
      recency_boost: 0.1,
    }),
    priority: 'medium',
    confidence: 0.65,
    rewrite: `BOOST retrieval priority for documents containing "${docHint}" by 1.5x for agent "${agentRow.agent_name}". This ensures the agent retrieves the correct policy docs before generating an answer.`,
    estimatedImpact: `Improves ${pattern.issue} accuracy for ${agentRow.agent_name} by prioritizing correct docs`,
  };
}

// ── Store a proposal in the DB ─────────────────────────────────────────────────
function saveProposal(proposal) {
  return new Promise((resolve, reject) => {
    const id = genId();
    db.run(
      `INSERT INTO optimization_proposals
       (id, agent_id, agent_name, type, tag, issue, priority, confidence,
        rewrite, adjustment, example_bad, estimated_impact, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, proposal.agentId, proposal.agentName, proposal.type, proposal.tag,
       proposal.issue, proposal.priority, proposal.confidence,
       proposal.rewrite || null, proposal.adjustment || null,
       proposal.exampleBadContent || null, proposal.estimatedImpact,
       new Date().toISOString()],
      function(err) {
        if (err) return reject(err);
        resolve(id);
      }
    );
  });
}

// ── Check if similar proposal already exists (avoid duplicates) ───────────────
function recentSimilarProposal(agentId, tag, hoursAgo = 72) {
  const since = new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM optimization_proposals
       WHERE agent_id = ? AND tag = ? AND status = 'pending'
       AND created_at >= ? LIMIT 1`,
      [agentId, tag, since],
      (err, row) => {
        if (err) return reject(err);
        resolve(!!row);
      }
    );
  });
}

// ── Main optimization run — called by the nightly cron ─────────────────────────
async function runOptimization() {
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  console.log(`[OPTIMIZE] Running optimization for data since ${since}`);

  const [ragScores, escalations, corrections] = await Promise.all([
    analyzeRagScores(since),
    analyzeEscalations(since),
    analyzeUserCorrections(since),
  ]);

  console.log(`[OPTIMIZE] Found ${ragScores.length} low RAG scores, ${escalations.length} unresolved escalations, ${corrections.length} user corrections`);

  const proposals = [];
  const agentIssues = {};

  // Process RAG score failures
  for (const score of ragScores) {
    const key = `${score.agent_id}__${score.tag || 'general_rag'}`;
    if (!agentIssues[key]) {
      agentIssues[key] = { agent: score, pattern: null, count: 0, examples: [] };
    }
    agentIssues[key].count++;
    if (score.answer) agentIssues[key].examples.push(score.answer);
  }

  // Process escalations
  for (const esc of escalations) {
    const key = `${esc.agent_id}__escalation`;
    if (!agentIssues[key]) {
      agentIssues[key] = { agent: esc, pattern: null, count: 0, examples: [] };
    }
    agentIssues[key].count++;
    if (esc.message) agentIssues[key].examples.push(esc.message);
  }

  // Generate proposals for agents with enough issues
  for (const [key, issueData] of Object.entries(agentIssues)) {
    if (issueData.count < MIN_CASES_TO_TRIGGER) continue;

    const agent = issueData.agent;
    const examples = issueData.examples.slice(0, 3).join('\n---\n');

    // Try to match a known pattern
    const pattern = matchPattern(examples, PROBLEM_PATTERNS) || {
      tag: 'general_quality_issue',
      issue: 'quality',
      docHint: 'general',
      agentType: 'any',
    };

    // Check for duplicate pending proposals
    const isDuplicate = await recentSimilarProposal(agent.agent_id || agent.id, pattern.tag);
    if (isDuplicate) {
      console.log(`[OPTIMIZE] Skipping duplicate proposal for ${agent.agent_name} / ${pattern.tag}`);
      continue;
    }

    const exampleBad = issueData.examples[0] || null;

    if (pattern.issue === 'hallucination' && pattern.docHint) {
      // Generate both a prompt rewrite and a RAG weight proposal
      const promptProposal = generatePromptRewrite(agent, pattern, exampleBad);
      const ragProposal = generateRagWeightProposal(agent, pattern, pattern.docHint);
      const pid1 = await saveProposal(promptProposal);
      const pid2 = await saveProposal(ragProposal);
      proposals.push(promptProposal, ragProposal);
      console.log(`[OPTIMIZE] Saved 2 proposals for ${agent.agent_name}: prompt + RAG (${pid1}, ${pid2})`);
    } else {
      // Generate just a prompt rewrite
      const promptProposal = generatePromptRewrite(agent, pattern, exampleBad);
      const pid = await saveProposal(promptProposal);
      proposals.push(promptProposal);
      console.log(`[OPTIMIZE] Saved prompt proposal for ${agent.agent_name} (${pid})`);
    }
  }

  console.log(`[OPTIMIZE] Optimization run complete. ${proposals.length} proposals generated.`);
  return proposals;
}

// ── Apply an approved proposal ─────────────────────────────────────────────────
async function applyProposal(proposalId) {
  const proposal = await getProposal(proposalId);
  if (!proposal) throw new Error('Proposal not found');
  if (proposal.status !== 'pending') throw new Error('Proposal already processed');

  if (proposal.type === 'system_prompt_rewrite') {
    // Update the agent's system prompt in the DB
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE agents SET system_prompt = ?, updated_at = ? WHERE id = ?`,
        [proposal.rewrite, new Date().toISOString(), proposal.agent_id],
        function(err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
    console.log(`[OPTIMIZE] Applied system prompt rewrite for agent ${proposal.agent_id}`);
  } else if (proposal.type === 'rag_weight_adjustment') {
    // Store RAG weight adjustment in agent config
    // The swarm RAG query will read this to boost specific doc types
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE agents SET
         metadata = COALESCE(metadata, '{}') || ?,
         updated_at = ?
         WHERE id = ?`,
        [proposal.adjustment, new Date().toISOString(), proposal.agent_id],
        function(err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
    console.log(`[OPTIMIZE] Applied RAG weight adjustment for agent ${proposal.agent_id}`);
  }

  // Mark proposal as applied
  await new Promise((resolve, reject) => {
    db.run(
      `UPDATE optimization_proposals SET status = 'applied', applied_at = ? WHERE id = ?`,
      [new Date().toISOString(), proposalId],
      function(err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });

  return { applied: true, proposalId };
}

function getProposal(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM optimization_proposals WHERE id = ?`, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function getPendingProposals(agentId = null) {
  return new Promise((resolve, reject) => {
    const sql = agentId
      ? `SELECT * FROM optimization_proposals WHERE agent_id = ? AND status = 'pending' ORDER BY priority DESC, created_at DESC`
      : `SELECT * FROM optimization_proposals WHERE status = 'pending' ORDER BY priority DESC, created_at DESC`;
    db.all(sql, agentId ? [agentId] : [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getProposalHistory(agentId, limit = 20) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM optimization_proposals WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?`,
      [agentId, limit],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

function rejectProposal(id, reason) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE optimization_proposals SET status = 'rejected', reject_reason = ? WHERE id = ?`,
      [reason || 'Rejected by admin', id],
      function(err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

module.exports = {
  runOptimization,
  applyProposal,
  getProposal,
  getPendingProposals,
  getProposalHistory,
  rejectProposal,
};
