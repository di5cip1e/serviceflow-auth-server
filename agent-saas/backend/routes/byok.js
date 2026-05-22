const express = require('express');
const router = express.Router();
const db = require('../database');
const crypto = require('crypto');

// Simple encryption for storing API keys (XOR with server secret — production should use AES-256-GCM)
const ENC_KEY = process.env.BYOK_ENCRYPTION_KEY || process.env.SESSION_SECRET || 'maikr-byok-key-change-me';

function encrypt(text) {
  const key = Buffer.from(ENC_KEY.padEnd(32, '0').slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(data) {
  const [ivHex, encrypted] = data.split(':');
  const key = Buffer.from(ENC_KEY.padEnd(32, '0').slice(0, 32));
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Get BYOK status and keys
router.get('/', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  db.get('SELECT byok_enabled FROM customers WHERE user_id = ?', [req.session.userId], (err, customer) => {
    if (err) return res.json({ error: err.message });

    db.all(`SELECT id, provider, key_prefix, is_active, platform_fee_percent, created_at, last_used_at
            FROM customer_api_keys
            WHERE customer_id = (SELECT id FROM customers WHERE user_id = ?)
            ORDER BY created_at DESC`,
      [req.session.userId], (err2, keys) => {
        if (err2) return res.json({ error: err2.message });
        res.json({
          enabled: !!customer?.byok_enabled,
          platformFeePercent: 5.0,
          keys: keys || []
        });
      });
  });
});

// Add a new API key
router.post('/keys', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  const { provider, apiKey, platformFeePercent } = req.body;
  if (!provider || !apiKey) return res.json({ error: 'provider and apiKey required' });

  const keyId = crypto.randomUUID();
  const keyPrefix = apiKey.slice(0, 8) + '...';
  const encrypted = encrypt(apiKey);

  db.get('SELECT id FROM customers WHERE user_id = ?', [req.session.userId], (err, customer) => {
    if (err) return res.json({ error: err.message });
    if (!customer) return res.json({ error: 'Customer not found' });

    db.run(`INSERT INTO customer_api_keys (id, customer_id, provider, key_encrypted, key_prefix, platform_fee_percent)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [keyId, customer.id, provider, encrypted, keyPrefix, platformFeePercent || 5.0],
      function (err2) {
        if (err2) return res.json({ error: err2.message });

        // Enable BYOK on customer
        db.run('UPDATE customers SET byok_enabled = 1 WHERE id = ?', [customer.id]);

        res.json({
          success: true,
          keyId,
          provider,
          keyPrefix,
          platformFeePercent: platformFeePercent || 5.0
        });
      });
  });
});

// Delete an API key
router.delete('/keys/:id', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  db.run(`DELETE FROM customer_api_keys
          WHERE id = ? AND customer_id = (SELECT id FROM customers WHERE user_id = ?)`,
    [req.params.id, req.session.userId], function (err) {
      if (err) return res.json({ error: err.message });
      if (this.changes === 0) return res.json({ error: 'Key not found' });

      // Check if any keys remain
      db.get(`SELECT COUNT(*) as cnt FROM customer_api_keys
              WHERE customer_id = (SELECT id FROM customers WHERE user_id = ?)`,
        [req.session.userId], (err2, row) => {
          if (!row || row.cnt === 0) {
            db.run('UPDATE customers SET byok_enabled = 0 WHERE user_id = ?', [req.session.userId]);
          }
          res.json({ success: true });
        });
    });
});

// Toggle key active/inactive
router.patch('/keys/:id', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });
  const { isActive } = req.body;

  db.run(`UPDATE customer_api_keys SET is_active = ?
          WHERE id = ? AND customer_id = (SELECT id FROM customers WHERE user_id = ?)`,
    [isActive ? 1 : 0, req.params.id, req.session.userId],
    function (err) {
      if (err) return res.json({ error: err.message });
      res.json({ success: true, changes: this.changes });
    });
});

// Get decrypted key for internal use (only called by backend services)
router.get('/keys/:id/decrypt', (req, res) => {
  // This should only be called internally — not exposed to frontend
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  db.get(`SELECT key_encrypted, provider FROM customer_api_keys
          WHERE id = ? AND customer_id = (SELECT id FROM customers WHERE user_id = ?) AND is_active = 1`,
    [req.params.id, req.session.userId], (err, row) => {
      if (err) return res.json({ error: err.message });
      if (!row) return res.json({ error: 'Key not found or inactive' });
      try {
        const decrypted = decrypt(row.key_encrypted);
        res.json({ key: decrypted, provider: row.provider });
      } catch (e) {
        res.json({ error: 'Decryption failed' });
      }
    });
});

module.exports = router;
