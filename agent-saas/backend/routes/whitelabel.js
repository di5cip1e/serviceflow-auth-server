const express = require('express');
const router = express.Router();
const db = require('../database');

// Helper: get or create customer row for current user
function getOrCreateCustomer(userId, callback) {
  db.get('SELECT * FROM customers WHERE user_id = ?', [userId], (err, row) => {
    if (err) return callback(err);
    if (row) return callback(null, row);
    // Auto-create customer row
    const custId = require('crypto').randomUUID();
    db.run('INSERT INTO customers (id, user_id, email, status) VALUES (?, ?, (SELECT email FROM users WHERE id = ?), ?)',
      [custId, userId, userId, 'active'], function(err2) {
        if (err2) return callback(err2);
        db.get('SELECT * FROM customers WHERE id = ?', [custId], (err3, newRow) => {
          callback(err3, newRow);
        });
      });
  });
}

// Get white-label config for current customer
router.get('/', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  getOrCreateCustomer(req.session.userId, (err, customer) => {
    if (err) return res.json({ error: err.message });
    res.json({
      enabled: !!customer.whitelabel_enabled,
      brandName: customer.whitelabel_brand_name || '',
      logoUrl: customer.whitelabel_logo_url || '',
      primaryColor: customer.whitelabel_primary_color || '#C0A060',
      accentColor: customer.whitelabel_accent_color || '#0040A0',
      domain: customer.whitelabel_domain || '',
      footerText: customer.whitelabel_footer_text || ''
    });
  });
});

// Update white-label config
router.put('/', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });
  const { brandName, logoUrl, primaryColor, accentColor, domain, footerText } = req.body;

  getOrCreateCustomer(req.session.userId, (err, customer) => {
    if (err) return res.json({ error: err.message });
    db.run(`UPDATE customers SET
              whitelabel_enabled = 1,
              whitelabel_brand_name = ?,
              whitelabel_logo_url = ?,
              whitelabel_primary_color = ?,
              whitelabel_accent_color = ?,
              whitelabel_domain = ?,
              whitelabel_footer_text = ?
            WHERE id = ?`,
      [brandName || null, logoUrl || null, primaryColor || null, accentColor || null,
       domain || null, footerText || null, customer.id],
      function (err2) {
        if (err2) return res.json({ error: err2.message });
        res.json({ success: true, changes: this.changes });
      });
  });
});

// Disable white-label
router.delete('/', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  db.run(`UPDATE customers SET whitelabel_enabled = 0 WHERE user_id = ?`,
    [req.session.userId], function (err) {
      if (err) return res.json({ error: err.message });
      res.json({ success: true, changes: this.changes });
    });
});

module.exports = router;

module.exports = router;
