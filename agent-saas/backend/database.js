const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'maikr.db');

// Ensure data directory exists
try { require('fs').mkdirSync(DATA_DIR, { recursive: true }); } catch {}

// ── Main application database ─────────────────────────────────────────────────
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('[DB] Open error:', err.message);
  } else {
    console.log('[DB] SQLite at', DB_PATH);
  }
});

db.serialize(() => {
  // Agents table
  db.run(`CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    stripe_session_id TEXT,
    stripe_customer_id TEXT,
    agent_name TEXT,
    business_name TEXT,
    industry TEXT,
    target_audience TEXT,
    tone TEXT,
    use_cases TEXT,
    system_prompt TEXT NOT NULL,
    plan TEXT DEFAULT 'basic',
    status TEXT DEFAULT 'pending',
    model_tier TEXT DEFAULT 'standard',
    monthly_cost_cents INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    plan_name TEXT DEFAULT 'value',
    outcome_credits REAL DEFAULT 100,
    outcome_credits_used REAL DEFAULT 0,
    base_tokens_used INTEGER DEFAULT 0,
    base_tokens INTEGER DEFAULT 20000,
    slug TEXT,
    session_key TEXT,
    api_key TEXT,
    agent_slug TEXT,
    data_opt_out INTEGER DEFAULT 0,
    customer_id TEXT
  )`);

  // Conversations table
  db.run(`CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);

  // Webhook events table
  db.run(`CREATE TABLE IF NOT EXISTS webhook_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT,
    event_type TEXT NOT NULL,
    payload TEXT,
    status TEXT DEFAULT 'received',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Escalations table
  db.run(`CREATE TABLE IF NOT EXISTS escalations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    customer_id TEXT,
    alert_type TEXT NOT NULL,
    message TEXT,
    resolved INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    resolved_at TEXT,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);

  // RAG documents table
  db.run(`CREATE TABLE IF NOT EXISTS rag_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    doc_name TEXT NOT NULL,
    doc_type TEXT,
    content TEXT NOT NULL,
    chunk_index INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);

  // RAG embeddings table
  db.run(`CREATE TABLE IF NOT EXISTS rag_embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    agent_id TEXT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding BLOB,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES rag_documents(id),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);

  // MCP servers table
  db.run(`CREATE TABLE IF NOT EXISTS mcp_servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    server_name TEXT NOT NULL,
    command TEXT NOT NULL,
    args TEXT NOT NULL,
    env_vars TEXT DEFAULT '{}',
    enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, server_name)
  )`);

  // Token usage tracking (Phase 5)
  db.run(`CREATE TABLE IF NOT EXISTS token_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    session_id TEXT,
    trace_id TEXT,
    model TEXT,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    intent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);

  // Optimization proposals (Phase 6)
  db.run(`CREATE TABLE IF NOT EXISTS optimization_proposals (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    agent_name TEXT,
    type TEXT NOT NULL,
    tag TEXT,
    issue TEXT,
    priority TEXT DEFAULT 'medium',
    confidence REAL DEFAULT 0.5,
    rewrite TEXT,
    adjustment TEXT,
    example_bad TEXT,
    estimated_impact TEXT,
    status TEXT DEFAULT 'pending',
    reject_reason TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    applied_at TEXT,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);

  // RAG quality scores (Phase 5)
  db.run(`CREATE TABLE IF NOT EXISTS rag_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    trace_id TEXT,
    question TEXT,
    answer TEXT,
    faithfulness REAL,
    relevancy REAL,
    composite REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);

  // Trace storage (Phase 5 — lightweight local store, complements Langfuse)
  db.run(`CREATE TABLE IF NOT EXISTS traces (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    session_id TEXT,
    intent TEXT,
    top_level_span_id TEXT,
    started_at TEXT,
    completed_at TEXT,
    total_latency_ms INTEGER,
    overall_score REAL,
    metadata TEXT,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);

  // Customers table
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_session_id TEXT,
    plan TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // API Keys table
  db.run(`CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )`);

  // Credit Transactions table
  db.run(`CREATE TABLE IF NOT EXISTS credit_transactions (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    balance_after REAL,
    description TEXT,
    reference_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);

  // Credit Purchases table
  db.run(`CREATE TABLE IF NOT EXISTS credit_purchases (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    pack_name TEXT,
    credits_purchased REAL,
    price_paid_cents INTEGER,
    stripe_payment_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);

  // ── Users table ──────────────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Sessions table (for connect-sqlite3 session store)
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expired TEXT NOT NULL
  )`);

  // Helper: add column if it doesn't exist (SQLite has no IF NOT EXISTS for ADD COLUMN)
  function addColumnIfMissing(table, column, type, cb) {
    db.all(`PRAGMA table_info(${table})`, [], (err, cols) => {
      if (err) return cb(err);
      if (!cols.some(c => c.name === column)) {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`, cb);
      } else {
        cb(null);
      }
    });
  }

  // Migration: add user_id to existing tables
  addColumnIfMissing('customers', 'user_id', 'TEXT', () => {});
  addColumnIfMissing('api_keys', 'user_id', 'TEXT', () => {});

  // ── Phase D: White-Label ──────────────────────────────────────────────────
  addColumnIfMissing('customers', 'whitelabel_enabled', 'INTEGER DEFAULT 0', () => {});
  addColumnIfMissing('customers', 'whitelabel_brand_name', 'TEXT', () => {});
  addColumnIfMissing('customers', 'whitelabel_logo_url', 'TEXT', () => {});
  addColumnIfMissing('customers', 'whitelabel_primary_color', 'TEXT', () => {});
  addColumnIfMissing('customers', 'whitelabel_accent_color', 'TEXT', () => {});
  addColumnIfMissing('customers', 'whitelabel_domain', 'TEXT', () => {});
  addColumnIfMissing('customers', 'whitelabel_footer_text', 'TEXT', () => {});
  addColumnIfMissing('customers', 'plan', 'TEXT DEFAULT "growth"', () => {});

  // ── Phase D: Templates Marketplace ─────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    industry TEXT,
    thumbnail_url TEXT,
    price_cents INTEGER DEFAULT 0,
    is_premium INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    config TEXT NOT NULL,
    guardrails TEXT,
    system_prompt TEXT,
    sample_prompts TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_templates_industry ON templates(industry)`);

  // Track which templates a customer has purchased/unlocked
  db.run(`CREATE TABLE IF NOT EXISTS customer_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, template_id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (template_id) REFERENCES templates(id)
  )`);

  // ── Phase D: BYOK (Bring Your Own Key) ─────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS customer_api_keys (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    key_encrypted TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    platform_fee_percent REAL DEFAULT 5.0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_used_at TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )`);
  addColumnIfMissing('customers', 'byok_enabled', 'INTEGER DEFAULT 0', () => {});
  addColumnIfMissing('agents', 'customer_api_key_id', 'TEXT', () => {});

  // ── Phase D: Template purchases ────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS template_purchases (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    price_paid_cents INTEGER NOT NULL,
    stripe_payment_id TEXT,
    status TEXT DEFAULT 'completed',
    purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (template_id) REFERENCES templates(id)
  )`);

  // Revenue snapshots (daily MRR tracking)
  db.run(`CREATE TABLE IF NOT EXISTS revenue_snapshots (
    id TEXT PRIMARY KEY,
    snapshot_date TEXT NOT NULL,
    total_customers INTEGER DEFAULT 0,
    active_customers INTEGER DEFAULT 0,
    cancelled_customers INTEGER DEFAULT 0,
    mrr_cents INTEGER DEFAULT 0,
    new_customers_1d INTEGER DEFAULT 0,
    churned_1d INTEGER DEFAULT 0,
    credit_revenue_cents INTEGER DEFAULT 0,
    credit_purchases INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_revenue_snapshots_date ON revenue_snapshots(snapshot_date)`);

  // Password reset tokens
  db.run(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_reset_tokens ON password_reset_tokens(token_hash)`);

  // Agent-channel mapping (which agent is connected to which channel)
  db.run(`CREATE TABLE IF NOT EXISTS agent_channels (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    channel_type TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    channel_name TEXT,
    config TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_agent_channels ON agent_channels(agent_id, channel_type)`);

  // Email log table (for onboarding drip campaign)
  db.run(`CREATE TABLE IF NOT EXISTS email_log (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    email_type TEXT NOT NULL,
    sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
    success INTEGER DEFAULT 0,
    error TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_email_log_customer ON email_log(customer_id, email_type)`);

  // Onboarding progress tracking
  db.run(`CREATE TABLE IF NOT EXISTS onboarding_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    step_id TEXT NOT NULL,
    completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, step_id),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);

  // Leads table (Phase 9 — Lead Generation)
  db.run(`CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    company_name TEXT,
    contact_name TEXT,
    title TEXT,
    email TEXT,
    linkedin_url TEXT,
    source_url TEXT,
    lead_score INTEGER DEFAULT 0,
    outreach_draft TEXT,
    status TEXT DEFAULT 'new',
    found_at TEXT DEFAULT CURRENT_TIMESTAMP,
    contacted_at TEXT,
    notes TEXT,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_leads_agent ON leads(agent_id, lead_score DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(agent_id, status)`);

  // ── Phase D: Widget tracking ──────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS agent_widgets (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    widget_type TEXT NOT NULL,
    embed_code TEXT NOT NULL,
    config TEXT DEFAULT '{}',
    placement TEXT DEFAULT 'inline',
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_agent_widgets ON agent_widgets(agent_id, widget_type)`);

  // Create indexes for common queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(agent_id, created_at DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_token_usage_agent ON token_usage(agent_id, created_at DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_rag_scores_agent ON rag_scores(agent_id, created_at DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_traces_agent ON traces(agent_id, started_at DESC)`);
});

module.exports = db;
