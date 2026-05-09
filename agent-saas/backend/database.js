const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'agents.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to SQLite:', DB_PATH);
  }
});

// Initialize agents table
db.run(`
  CREATE TABLE IF NOT EXISTS agents (
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('❌ Table creation error:', err.message);
  } else {
    console.log('✅ Agents table ready');
  }
});

module.exports = db;