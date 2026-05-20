/**
 * Telegram Webhook Handler
 * Receives inbound messages from Telegram, routes to the swarm agent,
 * sends responses back via Telegram Bot API.
 *
 * Endpoints:
 *   POST /api/webhooks/telegram/:agentId — inbound messages from Telegram
 *   GET  /api/webhooks/telegram/setup       — set webhook URL (one-time setup)
 */
const express = require('express');
const router = express.Router({ mergeParams: true });

// POST /api/webhooks/telegram/:agentId
router.post('/:agentId', async (req, res) => {
  // Always respond 200 immediately (Telegram retries on non-200)
  res.json({ ok: true });

  try {
    const { agentId } = req.params;
    const update = req.body;

    if (!update.message) return; // skip edits, callbacks, etc.

    const chatId = update.message.chat?.id;
    const text = update.message.text?.trim();
    const from = update.message.from;

    if (!text || !chatId) return;

    // Skip commands other than /start
    if (text.startsWith('/') && text !== '/start') return;

    if (text === '/start') {
      await sendTelegramMessage(chatId,
        `👋 Welcome! I'm your AI agent. Ask me anything and I'll do my best to help.`
      );
      return;
    }

    const conversationId = `telegram_${chatId}`;

    // Call the swarm agent
    const response = await callSwarmAgent(agentId, text, conversationId);
    await sendTelegramMessage(chatId, response);
  } catch (err) {
    console.error('Telegram webhook error:', err);
  }
});

// GET /api/webhooks/telegram/setup?token=<bot_token>&url=<webhook_url>
// One-time setup to register the webhook with Telegram
router.get('/setup', async (req, res) => {
  const { token, url } = req.query;
  if (!token || !url) {
    return res.status(400).json({ error: 'Missing token or url query param' });
  }
  try {
    const apiBase = `https://api.telegram.org/bot${token}`;
    const result = await (await fetch(`${apiBase}/setWebhook?url=${encodeURIComponent(url)}`)).json();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN not set — cannot send to Telegram');
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    const data = await res.json();
    if (!data.ok) console.error('Telegram sendMessage error:', data);
  } catch (err) {
    console.error('Failed to send Telegram message:', err.message);
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
    return data.response || 'Message received.';
  } catch (err) {
    console.error('Swarm call failed:', err.message);
    return "Sorry, I'm having trouble processing that right now. Please try again.";
  }
}

module.exports = router;
