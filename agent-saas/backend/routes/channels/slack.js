/**
 * Slack Webhook Handler — Bot & Slash Commands
 * Receives events from Slack, routes to the swarm agent,
 * posts responses back via chat.postMessage.
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Verify Slack request signature
function verifySlackRequest(rawBody, signature, timestamp) {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret || !signature) return true; // skip if not configured
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
  if (age > 300) return false; // stale request (5 min window)
  const base = `v0:${timestamp}:${rawBody}`;
  const expected = 'v0=' + crypto.createHmac('sha256', secret).update(base).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// POST /api/webhooks/slack — main events endpoint
router.post('/', async (req, res) => {
  const rawBody = JSON.stringify(req.body);
  const signature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-timestamp'];

  // URL verification challenge
  if (req.body.type === 'url_verification') {
    res.json({ challenge: req.body.challenge });
    return;
  }

  if (!verifySlackRequest(rawBody, signature, timestamp)) {
    console.warn('Slack signature verification failed');
    res.sendStatus(400);
    return;
  }

  const { type, team_id, event } = req.body || {};

  if (type === 'event_callback') {
    const eventType = event?.type;
    const user = event?.user;
    const channel = event?.channel;
    const text = event?.text;

    // Skip messages from bots or without text
    if (event?.subtype === 'bot_message') {
      res.json({ ok: true });
      return;
    }

    if (eventType === 'app_mention' || eventType === 'message') {
      // Strip @mention from bot name
      const cleanText = (text || '').replace(/<@[A-Z0-9]+>/g, '').trim();
      if (!cleanText || !channel) {
        res.json({ ok: true });
        return;
      }

      const conversationId = `slack_${team_id}_${channel}`;
      const agentId = await resolveSlackTeamAgent(team_id);

      if (!agentId) {
        await postSlackMessage(channel, "No agent is configured for this workspace. Visit maikr.pro to connect one.");
      } else {
        try {
          const response = await callSwarmAgent(agentId, cleanText, conversationId);
          await postSlackMessage(channel, response);
        } catch (err) {
          console.error('Slack agent error:', err);
          await postSlackMessage(channel, "Sorry, I encountered an error processing that. Please try again.");
        }
      }
    }
  }

  res.json({ ok: true });
});

// POST /api/webhooks/slack/interact — interactive payloads (button clicks, etc.)
router.post('/interact', (req, res) => {
  // Acknowledge immediately (< 3s requirement)
  res.json({ status: 'ok' });
  // Process async if needed
});

// POST /api/webhooks/slack/commands — slash commands
router.post('/commands', async (req, res) => {
  const { command, text = '', user_id, channel_id, team_id } = req.body;

  if (command === '/ask') {
    const conversationId = `slack_${team_id}_${channel_id}`;
    const agentId = await resolveSlackTeamAgent(team_id);

    if (!agentId) {
      return res.json({
        response_type: 'ephemeral',
        text: "No agent configured for this workspace. Visit maikr.pro to get started.",
      });
    }

    try {
      const response = await callSwarmAgent(agentId, text, conversationId);
      return res.json({ response_type: 'in_channel', text: response });
    } catch (err) {
      return res.json({ response_type: 'ephemeral', text: "Error processing your request. Please try again." });
    }
  }

  res.json({ response_type: 'ephemeral', text: `Unknown command: ${command}` });
});

async function resolveSlackTeamAgent(teamId) {
  const db = require('../database');
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT agent_id FROM agent_channels 
       WHERE channel_type = 'slack' 
         AND channel_id = ? 
         AND status = 'active' 
       LIMIT 1`,
      [teamId],
      (err, row) => {
        if (err) return resolve(null);
        resolve(row?.agent_id || process.env.DEFAULT_SLACK_AGENT_ID || null);
      }
    );
  });
}

async function postSlackMessage(channel, text, threadTs) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.warn('SLACK_BOT_TOKEN not set — cannot post to Slack');
    return;
  }

  // Slack Block Kit formatting for nice display
  const payload = {
    channel,
    text, // fallback for notifications
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text }
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `_Powered by M.ai.K.R • ${new Date().toLocaleTimeString()}_` }
        ]
      }
    ]
  };

  if (threadTs) payload.thread_ts = threadTs;

  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) console.error('Slack postMessage error:', data);
  } catch (err) {
    console.error('Failed to post to Slack:', err.message);
  }
}

async function callSwarmAgent(agentId, message, conversationId) {
  const apiBase = process.env.API_BASE_URL || 'http://127.0.0.1:3001';
  try {
    const res = await fetch(`${apiBase}/api/chat/swarm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, message, conversationId }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`Swarm API ${res.status}`);
    const data = await res.json();
    return data.response || "Message received.";
  } catch (err) {
    console.error('Swarm call failed:', err.message);
    throw err;
  }
}

module.exports = router;
