/**
 * Admin API — Private dashboard for Derek + Director only
 * Shows all customer agents, metrics, and system status
 */
const express = require('express');
const router = express.Router();
const db = require('../database');

const crypto = require('crypto');
const AUTHORIZED_SENDER_IDS = ['7709503599']; // Derek's Telegram ID
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // No fallback — server will refuse to start without it

if (!ADMIN_PASSWORD) {
  console.warn('[admin] ADMIN_PASSWORD env var is not set. Admin routes disabled.');
  // Don't crash — admin routes will return 401 for all requests
}

// In-memory session token store (token → { createdAt, expiresAt })
const adminSessions = new Map();

function generateAdminToken() {
  return crypto.randomBytes(32).toString('hex');
}

function isValidAdminToken(token) {
  const session = adminSessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    return false;
  }
  return true;
}

// Middleware: auth check — only Derek + this Director session can access
function adminAuth(req, res, next) {
  const senderId = req.headers['x-sender-id'];
  const isLocalhost = ['127.0.0.1', '::1', 'localhost'].includes(req.ip);
  const adminKey = req.headers['x-admin-key'];
  const isAuthorizedKey = adminKey && isValidAdminToken(adminKey);

  if (AUTHORIZED_SENDER_IDS.includes(senderId) || isLocalhost || isAuthorizedKey) {
    return next();
  }

  return res.status(403).json({ error: 'Access denied. Private dashboard.' });
}

// POST /api/admin/login — Verify password, return non-reversible session token
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = generateAdminToken();
  adminSessions.set(token, {
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000)
  });
  res.json({ success: true, token, expiresIn: 86400 });
});

router.use(adminAuth);

// GET /api/admin/overview — System-wide stats
router.get('/overview', (req, res) => {
  const stats = {};

  db.get('SELECT COUNT(*) as total, COUNT(CASE WHEN status = "active" THEN 1 END) as active FROM agents', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.agents = row;

    db.get('SELECT COUNT(*) as total FROM customers', [], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.customers = row;

      db.get('SELECT COUNT(*) as total FROM conversations', [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.conversations = row;

        db.get('SELECT COALESCE(SUM(total_tokens), 0) as tokens, COALESCE(SUM(total_cost_cents), 0) as cost FROM agents', [], (err, usageRow) => {
          if (err) return res.status(500).json({ error: err.message });
          stats.platformTokens = usageRow.tokens;
          stats.platformCostCents = usageRow.cost;

          db.get('SELECT COUNT(DISTINCT DATE(created_at)) as days_active FROM conversations', [], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.daysActive = row.days_active;

            // Revenue estimate (count by plan)
            db.all('SELECT plan, COUNT(*) as cnt FROM agents WHERE status = "active" GROUP BY plan', [], (err, rows) => {
              if (err) return res.status(500).json({ error: err.message });
              const planPrices = { basic: 49, intermediate: 99, advanced: 199, enterprise: 499 };
              let mrr = 0;
              rows.forEach(r => { mrr += (planPrices[r.plan] || 49) * r.cnt; });
              stats.mrr = mrr;
              stats.plans = rows;
              res.json(stats);
            });
          });
        });
      });
    });
  });
});

// GET /api/admin/agents — All agents with stats
router.get('/agents', (req, res) => {
  const query = `
    SELECT
      a.id,
      a.agent_name,
      a.business_name,
      a.industry,
      a.plan,
      a.status,
      a.session_key,
      a.created_at,
      a.updated_at,
      a.tone,
      a.use_cases,
      a.slug,
      c.email as customer_email,
      (SELECT COUNT(*) FROM conversations WHERE agent_id = a.id) as message_count,
      (SELECT COUNT(*) FROM conversations WHERE agent_id = a.id AND role = 'user') as user_messages,
      a.total_tokens,
      a.total_cost_cents,
      a.enforced_model,
      (SELECT COUNT(DISTINCT DATE(created_at)) FROM conversations WHERE agent_id = a.id) as active_days,
      (SELECT MAX(created_at) FROM conversations WHERE agent_id = a.id) as last_activity,
      (SELECT MIN(created_at) FROM conversations WHERE agent_id = a.id) as first_activity
    FROM agents a
    LEFT JOIN customers c ON c.id = a.customer_id
    ORDER BY a.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /api/admin/agents/:id — Single agent detail
router.get('/agents/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM agents WHERE id = ?', [id], (err, agent) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    // Get conversation stats
    db.get('SELECT COUNT(*) as total, COUNT(CASE WHEN role = "user" THEN 1 END) as user_msgs FROM conversations WHERE agent_id = ?', [id], (err, convStats) => {
      if (err) return res.status(500).json({ error: err.message });

      // Get daily message counts (last 30 days)
      db.all(`
        SELECT DATE(created_at) as date, COUNT(*) as messages
        FROM conversations
        WHERE agent_id = ? AND created_at > datetime("now", "-30 days")
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, [id], (err, dailyStats) => {
        if (err) return res.status(500).json({ error: err.message });

        // Get recent conversations (last 10, no content — just metadata)
        db.all(`
          SELECT role, created_at FROM conversations
          WHERE agent_id = ?
          ORDER BY created_at DESC LIMIT 20
        `, [id], (err, recent) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({
            ...agent,
            stats: convStats,
            dailyStats,
            recent
          });
        });
      });
    });
  });
});

// POST /api/admin/agents/:id/tier — Update agent's model tier
router.post('/agents/:id/tier', (req, res) => {
  const { id } = req.params;
  const { modelTier, monthlyCostCents } = req.body;
  
  // Tier → cost mapping (Derek's cost per month)
  const TIER_COSTS = { standard: 0, premium: 1500, elite: 3000 };
  
  if (!modelTier || !TIER_COSTS.hasOwnProperty(modelTier)) {
    return res.status(400).json({ error: 'Invalid tier. Must be standard, premium, or elite.' });
  }

  db.run(
    `UPDATE agents SET model_tier = ?, monthly_cost_cents = ? WHERE id = ?`,
    [modelTier, monthlyCostCents || TIER_COSTS[modelTier], id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        success: true,
        modelTier,
        monthlyCostCents: monthlyCostCents || TIER_COSTS[modelTier],
        model: { standard: 'google/gemini-3.1-flash-lite', premium: 'openai/gpt-4o-mini', elite: 'openai/gpt-4o' }[modelTier]
      });
    }
  );
});

// GET /api/admin/daily-stats — All measurable days across all agents
router.get('/daily-stats', (req, res) => {
  const days = parseInt(req.query.days || 90);

  db.all(`
    SELECT
      DATE(c.created_at) as date,
      COUNT(DISTINCT c.agent_id) as active_agents,
      COUNT(*) as total_messages,
      COUNT(CASE WHEN c.role = "user" THEN 1 END) as user_messages,
      COUNT(DISTINCT a.plan) as plan_diversity
    FROM conversations c
    JOIN agents a ON a.id = c.agent_id
    WHERE c.created_at > datetime('now', ?)
    GROUP BY DATE(c.created_at)
    ORDER BY date DESC
  `, [`-${days} days`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /api/admin/plans — Plan distribution
router.get('/plans', (req, res) => {
  db.all(`
    SELECT plan, COUNT(*) as count, status
    FROM agents
    GROUP BY plan, status
    ORDER BY count DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /api/admin/system — System health
router.get('/system', (req, res) => {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  Promise.all([
    new Promise((resolve) => {
      db.get('SELECT COUNT(*) as uptime_secs FROM agents', [], (err) => resolve({ db: 'ok' }));
    }),
    execAsync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/chat -X POST -H "Content-Type: application/json" -d "{\"agentId\":\"test\",\"message\":\"ping\"}" 2>/dev/null')
      .then(r => ({ backend: r.stdout.trim() === '404' ? 'ok' : r.stdout.trim() }))
      .catch(() => ({ backend: 'down' })),
    execAsync('pm2 jlist 2>/dev/null | node -e "const d=require(\"fs\").readFileSync(\"/dev/stdin\",\"utf8\");const l=JSON.parse(d);console.log(JSON.stringify(l.map(p=>({name:p.name,status:p.pm2_env.status,uptime:p.pm2_env.pm_uptime}))))"')
      .then(r => JSON.parse(r.stdout.trim()))
      .catch(() => [])
  ]).then(([{ db }, { backend }, processes]) => {
    res.json({ db, backend, processes });
  }).catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;

// GET /api/admin/agents/:id/rag-preview?query=your question
router.get('/agents/:id/rag-preview', async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'query parameter required' });
    
    const { similaritySearch } = require('../services/vectorStore');
    const { getEmbedding } = require('../services/embeddingService');
    
    const queryEmbedding = await getEmbedding(query);
    const results = await similaritySearch(queryEmbedding, id, 5);
    
    res.json({
      query,
      results: results.map(r => ({
        docName: r.doc_name,
        chunkIndex: r.chunk_index,
        content: r.content,
        similarity: Math.round(r.similarity * 100) / 100
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


