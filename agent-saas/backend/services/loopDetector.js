/**
 * Loop Detector — C.3 Self-Correction & Loop Detection
 * Detects when an agent is stuck in a loop, repeating itself, or hallucinating.
 */
const db = require('../database');

// Ensure loop_events table exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS loop_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    reason TEXT,
    action_taken TEXT,
    resolved INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
});

/**
 * Get recent conversation history for an agent
 */
async function getRecentHistory(agentId, limit = 20) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT role, content FROM conversations 
       WHERE agent_id = ? AND role IN ('user', 'assistant')
       ORDER BY created_at DESC LIMIT ?`,
      [agentId, limit],
      (err, rows) => {
        if (err) return reject(err);
        resolve((rows || []).reverse());
      }
    );
  });
}

/**
 * Detect repeated assistant responses (same message 3+ times)
 */
function detectRepeatedResponses(history) {
  const assistantMsgs = history.filter(m => m.role === 'assistant');
  if (assistantMsgs.length < 3) return null;

  // Check last 3 assistant messages for similarity
  const last3 = assistantMsgs.slice(-3);
  const normalized = last3.map(m => m.content.trim().toLowerCase().substring(0, 100));
  
  if (normalized[0] === normalized[1] && normalized[1] === normalized[2]) {
    return { type: 'repeated_response', reason: 'Agent repeated the same response 3 times' };
  }
  return null;
}

/**
 * Detect circular reasoning (user asks same question repeatedly)
 */
function detectCircularReasoning(history) {
  const userMsgs = history.filter(m => m.role === 'user');
  if (userMsgs.length < 3) return null;

  const last3 = userMsgs.slice(-3);
  const normalized = last3.map(m => m.content.trim().toLowerCase().substring(0, 80));
  
  // Check if user is rephrasing the same question
  if (normalized[0] === normalized[1] || normalized[1] === normalized[2] || normalized[0] === normalized[2]) {
    return { type: 'circular_reasoning', reason: 'User asked the same question multiple times without resolution' };
  }
  return null;
}

/**
 * Detect self-contradiction in assistant responses
 */
function detectSelfContradiction(history) {
  const assistantMsgs = history.filter(m => m.role === 'assistant');
  if (assistantMsgs.length < 2) return null;

  const last = assistantMsgs[assistantMsgs.length - 1]?.content.toLowerCase() || '';
  const prev = assistantMsgs[assistantMsgs.length - 2]?.content.toLowerCase() || '';

  // Simple heuristic: check for direct negation patterns
  const contradictionPatterns = [
    [/\byes\b/, /\bno\b/], [/\bis\b/, /\bis not\b/, /\bisn't\b/], [/\bcan\b/, /\bcannot\b/, /\bcan't\b/],
    [/\bwill\b/, /\bwon't\b/, /\bwill not\b/], [/\bshould\b/, /\bshouldn't\b/, /\bshould not\b/],
    [/\balways\b/, /\bnever\b/], [/\ball\b/, /\bnone\b/],
  ];

  for (const patterns of contradictionPatterns) {
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        if ((patterns[i].test(prev) && patterns[j].test(last)) ||
            (patterns[i].test(last) && patterns[j].test(prev))) {
          // Check if they're talking about the same topic (shared words)
          const prevWords = new Set(prev.split(/\s+/).filter(w => w.length > 4));
          const lastWords = new Set(last.split(/\s+/).filter(w => w.length > 4));
          const shared = [...prevWords].filter(w => lastWords.has(w));
          if (shared.length >= 3) {
            return { type: 'self_contradiction', reason: 'Agent contradicted itself in consecutive responses' };
          }
        }
      }
    }
  }
  return null;
}

/**
 * Main detection entry point.
 * Returns { shouldIntervene: boolean, reason: string, type: string }
 */
async function shouldIntervene(history, agentId) {
  // Run all detectors
  const checks = [
    detectRepeatedResponses(history),
    detectCircularReasoning(history),
    detectSelfContradiction(history),
  ];

  const detected = checks.find(c => c !== null);
  if (!detected) return { shouldIntervene: false };

  // Log the event
  await logEvent(agentId, detected.type, detected.reason, null);

  return { shouldIntervene: true, reason: detected.reason, type: detected.type };
}

/**
 * Determine what action to take based on the loop type
 */
function getInterventionAction(reason, type) {
  if (type === 'repeated_response') return 'reset_context';
  if (type === 'circular_reasoning') return 'soft_redirect';
  if (type === 'self_contradiction') return 'escalate_human';
  return 'soft_redirect';
}

/**
 * Log a loop event to the database
 */
async function logEvent(agentId, eventType, reason, actionTaken) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO loop_events (agent_id, event_type, reason, action_taken) VALUES (?, ?, ?, ?)`,
      [agentId, eventType, reason, actionTaken],
      function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      }
    );
  });
}

/**
 * Get recent loop events for an agent
 */
async function getEvents(agentId, limit = 20) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM loop_events WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?`,
      [agentId, limit],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

/**
 * Mark an event as resolved
 */
async function resolveEvent(eventId) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE loop_events SET resolved = 1 WHERE id = ?`,
      [eventId],
      function(err) {
        if (err) return reject(err);
        resolve({ changes: this.changes });
      }
    );
  });
}

/**
 * Get stats by event type
 */
async function getStats(agentId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT event_type, COUNT(*) as count,
              SUM(CASE WHEN resolved = 1 THEN 1 ELSE 0 END) as resolved
       FROM loop_events WHERE agent_id = ? GROUP BY event_type`,
      [agentId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

module.exports = {
  shouldIntervene,
  getInterventionAction,
  getEvents,
  resolveEvent,
  getStats,
  logEvent,
  getRecentHistory,
};
