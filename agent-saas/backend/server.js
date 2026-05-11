require('dotenv').config();
const fs = require('fs');

// Load additional secrets from ~/.openclaw/secrets.json into process.env BEFORE requiring routes
// This ensures all keys are available even if .env is incomplete
try {
  const secrets = JSON.parse(fs.readFileSync('/root/.openclaw/secrets.json', 'utf8'));
  if (secrets.openai_api_key && !process.env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = secrets.openai_api_key;
  if (secrets.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY) process.env.STRIPE_SECRET_KEY = secrets.STRIPE_SECRET_KEY;
  if (secrets.STRIPE_PUBLISHABLE_KEY && !process.env.STRIPE_PUBLISHABLE_KEY) process.env.STRIPE_PUBLISHABLE_KEY = secrets.STRIPE_PUBLISHABLE_KEY;
  if (secrets.STRIPE_RESTRICTED_KEY && !process.env.STRIPE_RESTRICTED_KEY) process.env.STRIPE_RESTRICTED_KEY = secrets.STRIPE_RESTRICTED_KEY;
  if (secrets.MAILGUN_API_KEY && !process.env.MAILGUN_API_KEY) process.env.MAILGUN_API_KEY = secrets.MAILGUN_API_KEY;
  if (secrets.MAILGUN_DOMAIN && !process.env.MAILGUN_DOMAIN) process.env.MAILGUN_DOMAIN = secrets.MAILGUN_DOMAIN;
  if (secrets.MAILGUN_FROM && !process.env.MAILGUN_FROM) process.env.MAILGUN_FROM = secrets.MAILGUN_FROM;
} catch (e) {
  console.warn('Could not load secrets.json:', e.message);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const checkoutRoutes = require('./routes/checkout');
const documentsRoutes = require('./routes/documents');
const swarmRoutes = require('./routes/swarm');
const webhookRoutes = require('./routes/webhook');
const chatRoutes = require('./routes/chat');  // Disabled for testing
const agentRoutes = require('./routes/agent');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware order is CRITICAL:
// 1. webhook MUST be first — it needs the RAW body for Stripe signature verification
// 2. All other routes use express.json() — applied AFTER webhook so they get parsed body
app.use(cors());
app.use('/webhook', webhookRoutes);         // ← raw body, before JSON parser
app.use(express.json());                     // ← JSON parser for all other routes
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Routes — webhook already mounted above (before express.json) for signature verification
app.use('/create-checkout-session', checkoutRoutes);
app.use('/api/chat', chatRoutes);  // Disabled for testing
app.use('/api', agentRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/chat', swarmRoutes);
app.use('/api', swarmRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: Math.round(process.memoryUsage().rss / 1024 / 1024)
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Agent SaaS Backend running on port ${PORT}`);
});

module.exports = app;