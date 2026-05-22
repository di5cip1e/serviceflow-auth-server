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
const escalationRoutes = require('./routes/escalations');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware order is CRITICAL:
// 1. webhook MUST be first — it needs the RAW body for Stripe signature verification
// 2. All other routes use express.json() — applied AFTER webhook so they get parsed body
app.use(cors());
app.use('/webhook', webhookRoutes);         // ← raw body, before JSON parser
app.use(express.json());                     // ← JSON parser for all other routes

// Session middleware — must be before auth checks and static file serving
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

// Block direct static access to protected HTML pages
// These must go through the explicit protected routes below
const protectedFiles = new Set([
  'chat.html', 'observe.html', 'swarm.html', 'channels.html',
  'mcp.html', 'optimization.html', 'settings.html', 'command-center.html',
  'deploy.html', 'admin.html', 'dashboard.html'
]);
app.use(function(req, res, next) {
  // Check if request is for a protected HTML file (direct .html access)
  var pathParts = req.path.split('/');
  var fileName = pathParts[pathParts.length - 1];
  if (protectedFiles.has(fileName)) {
    // Run requireAuth — redirect to login if not authenticated
    return requireAuth(req, res, next);
  }
  next();
});

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

// ── Public auth pages ──────────────────────────────────────────────────────
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

// ── Protected page routes (require session) ──────────────────────────────────
// These serve the SPA/frontend files; API routes use X-API-Key auth below
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/command-center.html'));
});
app.get('/command-center.html', requireAuth, (req, res) => {
  res.redirect('/dashboard');
});
app.get('/dashboard.html', requireAuth, (req, res) => {
  res.redirect('/dashboard');
});
app.get('/blueprints.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/blueprints.html'));
});
app.get('/workflow-canvas.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/workflow-canvas.html'));
});
app.get('/whitelabel.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/whitelabel.html'));
});
app.get('/templates.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates.html'));
});
app.get('/byok.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/byok.html'));
});
app.get('/widgets.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/widgets.html'));
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
app.get('/deploy.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/deploy.html'));
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
app.use('/api/chat', swarmRoutes);  // Swarm chat (mounted first to handle /api/chat/swarm)
app.use('/api/chat', chatRoutes);  // Single-agent chat fallback
app.use('/api/swarm', swarmRoutes);  // Also mount at /api/swarm for direct access
app.use('/api', agentRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/mcp', mcpRoutes);    // MCP server management (before swarm catch-all)
app.use('/api', channelRoutes);     // webhook handlers for Twilio, Slack, etc.
app.use('/api/admin', adminRoutes);
app.use('/api/observe', observeRoutes);  // observability dashboard API
app.use('/api/optimization', optimizationRoutes);  // Phase 6 optimization engine
const creditRoutes = require('./routes/creditRoutes');
app.use('/api/credits', creditRoutes);
const revenueRoutes = require('./routes/revenue');
app.use('/api/revenue', revenueRoutes);

// Lead Generation routes (Phase 9)
const leadsRoutes = require('./routes/leads');
app.use('/api/leads', leadsRoutes);

// Onboarding Wizard routes
const onboardingRoutes = require('./routes/onboarding');
app.use('/api/onboarding', onboardingRoutes);

// Analytics routes
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);
const blueprintsRoutes = require('./routes/blueprints');
app.use('/api/blueprints', blueprintsRoutes);

// White-label routes (D.1)
const whitelabelRoutes = require('./routes/whitelabel');
app.use('/api/whitelabel', whitelabelRoutes);

// Template Marketplace routes (D.2)
const templatesRoutes = require('./routes/templates');
app.use('/api/templates', templatesRoutes);

// BYOK routes (D.3)
const byokRoutes = require('./routes/byok');
app.use('/api/byok', byokRoutes);

// Widget routes (D.4)
const widgetsRoutes = require('./routes/widgets');
app.use('/api/widgets', widgetsRoutes);

// Delegation routes (C.2 Agent-to-Agent Delegation)
const delegationRoutes = require('./routes/delegation');
app.use('/api/delegation', delegationRoutes);

// Self-Correction routes (C.3 Loop Detection)
const selfCorrectionRoutes = require('./routes/selfCorrection');
app.use('/api/self-correction', selfCorrectionRoutes);

// Escalation routes (HITL approvals)
app.use('/api/escalations', escalationRoutes);

// Static file serving — AFTER session and protected routes
// Only serve files that are NOT protected HTML pages
const protectedPages = new Set([
  'chat.html', 'observe.html', 'swarm.html', 'channels.html',
  'mcp.html', 'optimization.html', 'settings.html', 'command-center.html',
  'deploy.html', 'admin.html', 'dashboard.html', 'leads.html', 'onboarding-wizard.html', 'analytics.html', 'agent-studio.html', 'blueprints.html', 'workflow-canvas.html', 'whitelabel.html', 'templates.html', 'byok.html', 'widgets.html'
]);

// Serve CSS, JS, and assets statically (no auth needed)
app.use('/css', express.static(path.join(__dirname, '../frontend/css'), { maxAge: '1d' }));
app.use('/js', express.static(path.join(__dirname, '../frontend/js'), { maxAge: '1d' }));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets'), { maxAge: '1d' }));

// Serve other frontend files, but block protected HTML pages
// Note: leads.html is in the protected set above
app.use(express.static(path.join(__dirname, '../frontend'), {
  maxAge: '1d',
  index: false,
  setHeaders: function(res, filePath) {
    // Prevent caching of HTML files
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
  }
}));

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