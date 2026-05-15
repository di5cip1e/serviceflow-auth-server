const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ── Rate limiters ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                    // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' }
});

// ── Validation helpers ───────────────────────────────────────────────────────
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)',
        [userId, normalizedEmail, passwordHash, name.trim()],
        function (err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });

    // Auto-login: set session
    req.session.userId = userId;

    return res.status(201).json({
      success: true,
      user: { id: userId, email: normalizedEmail, name: name.trim() }
    });
  } catch (err) {
    console.error('[auth/register]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, name, password_hash FROM users WHERE email = ?',
        [normalizedEmail],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Set session
    req.session.userId = user.id;

    return res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('[auth/login]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/auth/logout ───────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  if (!req.session) {
    return res.json({ success: true });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('[auth/logout]', err.message);
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

// ── POST /api/auth/change-password ──────────────────────────────────────────
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ error: 'Current password is required' });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const userId = req.session.userId;

    // Get current password hash
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password and update
    const newHash = await bcrypt.hash(newPassword, 10);

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newHash, userId],
        function (err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('[auth/change-password]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  const userId = req.session.userId;

  db.get(
    'SELECT id, email, name FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        console.error('[auth/me]', err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({ user: { id: user.id, email: user.email, name: user.name } });
    }
  );
});

module.exports = router;
