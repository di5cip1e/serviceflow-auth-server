const express = require('express');
const router = express.Router();
const db = require('../database');
const crypto = require('crypto');

// Generate embed code for a widget
function generateEmbedCode(agentId, widgetType, config) {
  const widgetId = crypto.randomUUID();
  const configB64 = Buffer.from(JSON.stringify({ agentId, ...config })).toString('base64');

  switch (widgetType) {
    case 'chat-bubble':
      return `<script src="https://maikr.pro/js/widget.js" data-agent="${agentId}" data-widget="${widgetId}" data-config="${configB64}" async></script>`;
    case 'inline-chat':
      return `<div id="maikr-widget-${widgetId}"></div>\n<script src="https://maikr.pro/js/widget.js" data-agent="${agentId}" data-widget="${widgetId}" data-mode="inline" data-config="${configB64}" async></script>`;
    case 'full-page':
      return `<iframe src="https://maikr.pro/embed/${agentId}?widget=${widgetId}" style="border:none;width:100%;height:600px;border-radius:12px;" title="AI Chat"></iframe>`;
    case 'whatsapp-button':
      return `<a href="https://wa.me/?text=${encodeURIComponent('Hey! I\'d like to chat with ' + (config.agentName || 'an AI assistant') + '.')}">\n  <img src="https://maikr.pro/assets/whatsapp-icon.svg" alt="Chat on WhatsApp" width="56" height="56" style="position:fixed;bottom:24px;right:24px;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.3);cursor:pointer;">\n</a>
<!-- or use the official WhatsApp Business API via maikr.pro: -->
<script src="https://maikr.pro/js/widget.js" data-agent="${agentId}" data-widget="${widgetId}" data-channel="whatsapp" data-config="${configB64}" async></script>`;
    case 'sms-widget':
      return `<a href="sms:+1XXXXXXXXXX?body=Hi!">\n  <button style="position:fixed;bottom:24px;left:24px;background:#00C0FF;color:#0A0A0F;border:none;padding:12px 24px;border-radius:24px;font-weight:bold;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);">\n    📱 Text Us\n  </button>\n</a>\n<!-- Powered by maikr.pro -->`;
    default:
      return `<script src="https://maikr.pro/js/widget.js" data-agent="${agentId}" data-widget="${widgetId}" data-config="${configB64}" async></script>`;
  }
}

// Helper: get or create customer row
function getOrCreateCustomer(userId, callback) {
  db.get('SELECT * FROM customers WHERE user_id = ?', [userId], (err, row) => {
    if (err) return callback(err);
    if (row) return callback(null, row);
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

// List all widgets for customer's agents
router.get('/', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  db.all(`SELECT aw.id, aw.agent_id, aw.widget_type, aw.embed_code, aw.config, aw.placement, aw.status, aw.created_at,
                 a.agent_name
          FROM agent_widgets aw
          JOIN agents a ON aw.agent_id = a.id
          WHERE a.customer_id IN (SELECT id FROM customers WHERE user_id = ?)
          ORDER BY aw.created_at DESC`,
    [req.session.userId], (err, rows) => {
      if (err) return res.json({ error: err.message });
      res.json(rows || []);
    });
});

// Create a new widget
router.post('/', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  const { agentId, widgetType, config, placement } = req.body;
  if (!agentId || !widgetType) return res.json({ error: 'agentId and widgetType required' });

  // Verify agent belongs to user
  db.get(`SELECT 1 FROM agents a
          JOIN customers c ON a.customer_id = c.id
          WHERE a.id = ? AND c.user_id = ?`,
    [agentId, req.session.userId], (err, access) => {
      if (err) return res.json({ error: err.message });
      if (!access) return res.json({ error: 'Agent not found or unauthorized' });
      if (!access) return res.json({ error: 'Agent not found or unauthorized' });

      const widgetId = crypto.randomUUID();
      const widgetConfig = config || {};
      const embedCode = generateEmbedCode(agentId, widgetType, widgetConfig);

      db.run(`INSERT INTO agent_widgets (id, agent_id, widget_type, embed_code, config, placement)
              VALUES (?, ?, ?, ?, ?, ?)`,
        [widgetId, agentId, widgetType, embedCode, JSON.stringify(widgetConfig), placement || 'inline'],
        function (err2) {
          if (err2) return res.json({ error: err2.message });
          res.json({
            success: true,
            widgetId,
            embedCode,
            widgetType,
            agentId
          });
        });
    });
});

// Get a specific widget
router.get('/:id', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  db.get(`SELECT aw.*, a.agent_name
          FROM agent_widgets aw
          JOIN agents a ON aw.agent_id = a.id
          JOIN customers c ON a.customer_id = c.id
          WHERE aw.id = ? AND c.user_id = ?`,
    [req.params.id, req.session.userId], (err, row) => {
      if (err) return res.json({ error: err.message });
      if (!row) return res.json({ error: 'Widget not found' });

      // Parse usage stats
      db.get('SELECT COUNT(*) as total_impressions FROM conversations WHERE agent_id = ? AND created_at > datetime("now", "-30 days")',
        [row.agent_id], (err2, stats) => {
          res.json({
            ...row,
            config: safeParse(row.config),
            embedCode: row.embed_code,
            stats30d: stats?.total_impressions || 0
          });
        });
    });
});

// Delete a widget
router.delete('/:id', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  db.run(`DELETE FROM agent_widgets
          WHERE id = ? AND agent_id IN (
            SELECT a.id FROM agents a
            JOIN customers c ON a.customer_id = c.id
            WHERE c.user_id = ?
          )`,
    [req.params.id, req.session.userId], function (err) {
      if (err) return res.json({ error: err.message });
      res.json({ success: true, changes: this.changes });
    });
});

// Get all agents available for widget creation
router.get('/agents/list', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  db.all(`SELECT a.id, a.agent_name, a.status, a.industry
          FROM agents a
          JOIN customers c ON a.customer_id = c.id
          WHERE c.user_id = ?
          ORDER BY a.created_at DESC`,
    [req.session.userId], (err, rows) => {
      if (err) return res.json({ error: err.message });
      res.json(rows || []);
    });
});

function safeParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

module.exports = router;
