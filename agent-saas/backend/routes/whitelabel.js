const express = require('express');
const router = express.Router();
const db = require('../database');

// Get white-label config for current customer
router.get('/', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  db.get(`SELECT whitelabel_enabled, whitelabel_brand_name, whitelabel_logo_url,
                 whitelabel_primary_color, whitelabel_accent_color,
                 whitelabel_domain, whitelabel_footer_text
          FROM customers WHERE user_id = ?`,
    [req.session.userId], (err, row) => {
      if (err) return res.json({ error: err.message });
      if (!row) return res.json({ enabled: false });
      res.json({
        enabled: !!row.whitelabel_enabled,
        brandName: row.whitelabel_brand_name || '',
        logoUrl: row.whitelabel_logo_url || '',
        primaryColor: row.whitelabel_primary_color || '#C0A060',
        accentColor: row.whitelabel_accent_color || '#0040A0',
        domain: row.whitelabel_domain || '',
        footerText: row.whitelabel_footer_text || ''
      });
    });
});

// Update white-label config
router.put('/', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  const { brandName, logoUrl, primaryColor, accentColor, domain, footerText } = req.body;

  db.run(`UPDATE customers SET
            whitelabel_enabled = 1,
            whitelabel_brand_name = ?,
            whitelabel_logo_url = ?,
            whitelabel_primary_color = ?,
            whitelabel_accent_color = ?,
            whitelabel_domain = ?,
            whitelabel_footer_text = ?
          WHERE user_id = ?`,
    [brandName || null, logoUrl || null, primaryColor || null, accentColor || null,
     domain || null, footerText || null, req.session.userId],
    function (err) {
      if (err) return res.json({ error: err.message });
      res.json({ success: true, changes: this.changes });
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
