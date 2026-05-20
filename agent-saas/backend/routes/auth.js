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

// ── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await new Promise((resolve, reject) => {
      db.get('SELECT id, email, name FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });

    // Always return success (don't reveal if email exists)
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a reset email has been sent.' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 3600000).toISOString();

    // Store token
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
        [require('uuid').v4(), user.id, tokenHash, expiresAt],
        (err) => { if (err) reject(err); else resolve(); }
      );
    });

    // Send reset email via Resend
    const resetUrl = `https://maikr.pro/reset-password.html?token=${token}&user=${user.id}`;
    const { sendEmail } = require('../services/alerter');
    await sendEmail(user.email, 'Reset Your M.ai.K.R Password',
      `Hi ${user.name || 'there'},

Click this link to reset your password:
${resetUrl}

This link expires in 1 hour.

If you didn't request this, ignore this email.`,
      `<h2>Reset Your Password</h2><p>Hi ${user.name || 'there'},</p><p>Click below to reset your password:</p><a href="${resetUrl}" style="display:inline-block;background:#2ECC71;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a><p style="color:#888;font-size:14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>`
    );

    res.json({ success: true, message: 'If an account exists, a reset email has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/auth/reset-password ───────────────────────────────────────────
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, user_id, new_password } = req.body;
    if (!token || !user_id || !new_password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Find valid token
    const resetToken = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM password_reset_tokens WHERE user_id = ? AND used = 0 AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1',
        [user_id],
        (err, row) => { if (err) reject(err); else resolve(row); }
      );
    });

    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    // Verify token hash
    const valid = await bcrypt.compare(token, resetToken.token_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    // Update password
    const passwordHash = await bcrypt.hash(new_password, 10);
    await new Promise((resolve, reject) => {
      db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [passwordHash, user_id],
        (err) => { if (err) reject(err); else resolve(); }
      );
    });

    // Mark token as used
    await new Promise((resolve, reject) => {
      db.run('UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
        [resetToken.id],
        (err) => { if (err) reject(err); else resolve(); }
      );
    });

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
