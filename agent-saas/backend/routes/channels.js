/**
 * Omnichannel API Gateway — Channel Webhook Router
 * Mounts webhook handlers for all external channels.
 *
 * Routes:
 *   POST /api/webhooks/twilio       → Twilio SMS/WhatsApp inbound
 *   GET  /api/webhooks/twilio       → Twilio URL validation handshake
 *   POST /api/webhooks/slack        → Slack events API
 *   POST /api/webhooks/slack/interact → Slack interactive components
 *   POST /api/webhooks/slack/commands → Slack slash commands
 */
const express = require('express');
const router = express.Router();

const twilioHandler = require('./channels/twilio');
const slackHandler = require('./channels/slack');
const telegramHandler = require('./channels/telegram');

// Mount Twilio at /api/webhooks/twilio
// GET for validation, POST for inbound messages
router.use('/webhooks/twilio', twilioHandler);

// Mount Slack at /api/webhooks/slack
router.use('/webhooks/slack', slackHandler);

// Mount Telegram at /webhooks/telegram (full path: /api/webhooks/telegram)
router.use('/webhooks/telegram', telegramHandler);

// ── Channel Management API ──────────────────────────────────────
const db = require('../database');

// GET /api/channels/:agentId — list all channels for an agent
router.get('/channels/:agentId', async (req, res) => {
  try {
    const channels = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM agent_channels WHERE agent_id = ? ORDER BY created_at DESC',
        [req.params.agentId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
    res.json({ success: true, channels });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/channels — connect a channel to an agent
router.post('/channels', async (req, res) => {
  try {
    const { agent_id, channel_type, channel_id, channel_name, config } = req.body;
    if (!agent_id || !channel_type || !channel_id) {
      return res.status(400).json({ success: false, error: 'Missing required fields: agent_id, channel_type, channel_id' });
    }
    const id = require('uuid').v4();
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO agent_channels (id, agent_id, channel_type, channel_id, channel_name, config) VALUES (?, ?, ?, ?, ?, ?)',
        [id, agent_id, channel_type, channel_id, channel_name || null, config ? JSON.stringify(config) : null],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/channels/:id — disconnect a channel
router.delete('/channels/:id', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      db.run('UPDATE agent_channels SET status = ? WHERE id = ?', ['inactive', req.params.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check for webhook infrastructure
router.get('/webhooks/status', (req, res) => {
  res.json({
    status: 'online',
    channels: {
      twilio: !!process.env.TWILIO_ACCOUNT_SID,
      slack: !!process.env.SLACK_BOT_TOKEN,
      telegram: !!process.env.TELEGRAM_BOT_TOKEN,
    },
    defaults: {
      twilio: process.env.DEFAULT_TWILIO_AGENT_ID || null,
      slack: process.env.DEFAULT_SLACK_AGENT_ID || null,
    },
  });
});

module.exports = router;
