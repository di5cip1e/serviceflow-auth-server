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
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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

  // Create indexes for common queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(agent_id, created_at DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_token_usage_agent ON token_usage(agent_id, created_at DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_rag_scores_agent ON rag_scores(agent_id, created_at DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_traces_agent ON traces(agent_id, started_at DESC)`);
});

module.exports = db;
