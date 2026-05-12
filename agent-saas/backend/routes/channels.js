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

// Mount Twilio at /api/webhooks/twilio
// GET for validation, POST for inbound messages
router.use('/webhooks/twilio', twilioHandler);

// Mount Slack at /api/webhooks/slack
router.use('/webhooks/slack', slackHandler);

// Health check for webhook infrastructure
router.get('/webhooks/status', (req, res) => {
  res.json({
    status: 'online',
    channels: {
      twilio: !!process.env.TWILIO_ACCOUNT_SID,
      slack: !!process.env.SLACK_BOT_TOKEN,
    },
    defaults: {
      twilio: process.env.DEFAULT_TWILIO_AGENT_ID || null,
      slack: process.env.DEFAULT_SLACK_AGENT_ID || null,
    },
  });
});

module.exports = router;
