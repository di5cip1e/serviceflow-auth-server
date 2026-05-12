const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/maikr.db');

db.serialize(() => {
  db.run(`ALTER TABLE agents ADD COLUMN base_tokens INTEGER DEFAULT 20000`);
  db.run(`ALTER TABLE agents ADD COLUMN base_tokens_used INTEGER DEFAULT 0`);
  db.run(`ALTER TABLE agents ADD COLUMN outcome_credits INTEGER DEFAULT 100`);
  db.run(`ALTER TABLE agents ADD COLUMN outcome_credits_used INTEGER DEFAULT 0`);
  db.run(`ALTER TABLE agents ADD COLUMN plan_name TEXT DEFAULT 'value'`);

  db.run(`CREATE TABLE IF NOT EXISTS credit_transactions (
    id TEXT PRIMARY KEY,
    agent_id TEXT,
    type TEXT,
    amount INTEGER,
    balance_after INTEGER,
    description TEXT,
    reference_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(agent_id) REFERENCES agents(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS credit_purchases (
    id TEXT PRIMARY KEY,
    agent_id TEXT,
    pack_name TEXT,
    credits_purchased INTEGER,
    price_paid_cents INTEGER,
    stripe_payment_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(agent_id) REFERENCES agents(id)
  )`);

  console.log('Migration complete.');
});
db.close();
