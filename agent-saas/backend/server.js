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
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { requireAuth, setUserLocals } = require('./middleware/auth');
const checkoutRoutes = require('./routes/checkout');
const documentsRoutes = require('./routes/documents');
const swarmRoutes = require('./routes/swarm');
const channelRoutes = require('./routes/channels');
const mcpRoutes = require('./mcp/routes');
const observeRoutes = require('./observability/routes');
const optimizationRoutes = require('./optimization/routes');
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

// Session middleware
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: __dirname + '/data' }),
  secret: process.env.SESSION_SECRET || 'maikr-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Set user locals for templates
app.use(setUserLocals);

// Redirect /chat → /chat.html (chat page at /chat, not /chat.html)
app.get('/chat', (req, res) => res.redirect('/chat.html'));

// Serve landing.html on root (marketing page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/landing.html'));
});

// Auth routes (public — before requireAuth middleware)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Onboarding flow — separate steps (public)
app.get('/build', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build-step1.html'));
});
app.get('/build/audience', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build-step2.html'));
});
app.get('/build/usecases', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build-step3.html'));
});
app.get('/build/plan', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build-step4.html'));
});

// ── Protected page routes (require session) ──────────────────────────────────
// These serve the SPA/frontend files; API routes use X-API-Key auth below
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/command-center.html'));
});
app.get('/chat.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/chat.html'));
});
app.get('/observe.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/observe.html'));
});
app.get('/swarm.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/swarm.html'));
});
app.get('/channels.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/channels.html'));
});
app.get('/mcp.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/mcp.html'));
});
app.get('/optimization.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/optimization.html'));
});
app.get('/settings.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/settings.html'));
});

// Routes — webhook already mounted above (before express.json) for signature verification
app.use('/create-checkout-session', checkoutRoutes);
app.use('/api/chat', chatRoutes);  // Disabled for testing
app.use('/api', agentRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/chat', swarmRoutes);
app.use('/api/swarm', swarmRoutes);
app.use('/api/mcp', mcpRoutes);    // MCP server management (before swarm catch-all)
app.use('/api', channelRoutes);     // webhook handlers for Twilio, Slack, etc.
app.use('/api', swarmRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/observe', observeRoutes);  // observability dashboard API
app.use('/api/optimization', optimizationRoutes);  // Phase 6 optimization engine
const creditRoutes = require('./routes/creditRoutes');
app.use('/api/credits', creditRoutes);

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