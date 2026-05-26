const db = require('../database');

/**
 * Auth middleware for M.ai.K.R
 * 
 * requireAuth — for page routes: redirects to /login if not authenticated
 * requireApiAuth — for API routes: checks X-API-Key header
 * setUserLocals — sets res.locals.user for templates
 */

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  // API/fetch routes get 401, page routes get redirect
  if (req.path.startsWith('/api/') || req.originalUrl.startsWith('/api/') || req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers['accept'] && req.headers['accept'].includes('application/json'))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.redirect('/login');
}

function requireApiAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key' });
  }
  // Match by prefix first to narrow down, then verify full hash with bcrypt
  const bcrypt = require('bcrypt');
  db.get(
    'SELECT * FROM api_keys WHERE key_prefix = ?',
    [apiKey.substring(0, 12)],
    async (err, row) => {
      if (err || !row) {
        return res.status(401).json({ error: 'Invalid API key' });
      }
      // Verify full hash to prevent prefix-collision attacks
      try {
        const isValid = await bcrypt.compare(apiKey, row.key_hash);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid API key' });
        }
        req.apiKeyRow = row;
        next();
      } catch (hashErr) {
        console.error('API key hash verification failed:', hashErr.message);
        return res.status(500).json({ error: 'Authentication error' });
      }
    }
  );
}

function setUserLocals(req, res, next) {
  res.locals.user = null;
  if (req.session && req.session.userId) {
    db.get('SELECT id, email, name FROM users WHERE id = ?', [req.session.userId], (err, user) => {
      if (!err && user) {
        res.locals.user = user;
      }
      next();
    });
  } else {
    next();
  }
}

module.exports = { requireAuth, requireApiAuth, setUserLocals };
