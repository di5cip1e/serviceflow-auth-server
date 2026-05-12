/**
 * Twilio Webhook Handler — SMS & WhatsApp
 * Receives inbound messages from Twilio, routes to the swarm agent,
 * returns TwiML XML response.
 */
const express = require('express');
const router = express.Router();

// TwiML builder
function buildTwiml(response) {
  const text = escapeXml(String(response || 'Got your message.'));
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${text}</Message>
</Response>`;
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
}

// POST /api/webhooks/twilio
router.post('/', async (req, res) => {
  try {
    const { From: from, Body: body } = req.body;
    const message = (body || '').trim();

    if (!message) {
      res.type('text/xml').send(buildTwiml(''));
      return;
    }

    // Determine channel (WhatsApp numbers start with whatsapp:)
    const isWhatsApp = from && String(from).startsWith('whatsapp:');
    const channel = isWhatsApp ? 'whatsapp' : 'sms';

    // Resolve agent by phone — fallback to default
    const agentId = await resolveAgentByPhone(from);
    if (!agentId) {
      res.type('text/xml').send(buildTwiml(
        "Thanks for reaching out! No agent is linked to this number. Visit maikr.pro to connect your AI agent."
      ));
      return;
    }

    const response = await callSwarmAgent(agentId, message, `twilio_${from}`);
    res.type('text/xml').send(buildTwiml(response));
  } catch (err) {
    console.error('Twilio webhook error:', err);
    res.type('text/xml').send(buildTwiml('Sorry, something went wrong. Please try again.'));
  }
});

// GET — Twilio validation URL (must return 200)
router.get('/', (req, res) => {
  res.type('text/plain').send('ok');
});

async function resolveAgentByPhone(phone) {
  // TODO: query agents DB for phone number mapping
  // For now, use environment default
  return process.env.DEFAULT_TWILIO_AGENT_ID || null;
}

async function callSwarmAgent(agentId, message, conversationId) {
  const apiBase = process.env.API_BASE_URL || 'http://127.0.0.1:3001';
  try {
    const res = await fetch(`${apiBase}/api/chat/swarm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, message, conversationId }),
      signal: AbortSignal.timeout(12000), // stay under Twilio's 15s timeout
    });
    if (!res.ok) throw new Error(`Swarm API ${res.status}`);
    const data = await res.json();
    return data.response || "Message received.";
  } catch (err) {
    console.error('Swarm call failed:', err.message);
    return "Sorry, I'm having trouble processing that right now. Please try again.";
  }
}

module.exports = router;
