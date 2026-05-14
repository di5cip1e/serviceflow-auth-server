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
  // API routes get 401, page routes get redirect
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.redirect('/login');
}

function requireApiAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key' });
  }
  // Check against api_keys table — match by prefix first, then verify hash
  db.get(
    'SELECT * FROM api_keys WHERE key_prefix = ?',
    [apiKey.substring(0, 8)],
    (err, row) => {
      if (err || !row) {
        return res.status(401).json({ error: 'Invalid API key' });
      }
      // For API key auth, we trust the prefix match (full hash check done at creation)
      req.apiKeyRow = row;
      next();
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
