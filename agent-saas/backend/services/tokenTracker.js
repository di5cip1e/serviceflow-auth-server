// token tracking service
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

async function ensureTables(){
  const sql = `CREATE TABLE IF NOT EXISTS token_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    session_id TEXT,
    trace_id TEXT,
    model TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    latency_ms INTEGER,
    intent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`;
  return new Promise((resolve,reject)=>db.run(sql,[],err=>err?reject(err):resolve()));
}

async function recordTokens(agentId, sessionId, model, inputTokens, outputTokens, latencyMs, intent){
  await ensureTables();
  const sql = `INSERT INTO token_usage (agent_id, session_id, model, input_tokens, output_tokens, latency_ms, intent) VALUES (?,?,?,?,?,?,?)`;
  return new Promise((resolve,reject)=>db.run(sql,[agentId, sessionId, model, inputTokens, outputTokens, latencyMs, intent],function(err){ if(err) reject(err); else resolve(this.lastID); }));
}

async function getAgentUsageStats(agentId, fromDate, toDate){
  await ensureTables();
  // simple sum
  const sql = `SELECT COUNT(*) as requestsCount, SUM(input_tokens) as totalInputTokens, SUM(output_tokens) as totalOutputTokens, AVG(latency_ms) as avgLatencyMs FROM token_usage WHERE agent_id = ?` + (fromDate?" AND created_at >= ?":"") + (toDate?" AND created_at <= ?":"");
  const params = [agentId].concat(fromDate? [fromDate]:[]).concat(toDate? [toDate]:[]);
  return new Promise((resolve,reject)=>db.get(sql,params,(err,row)=>{ if(err) reject(err); else resolve({ totalInputTokens: row.totalInputTokens||0, totalOutputTokens: row.totalOutputTokens||0, totalCost:0, avgLatencyMs: row.avgLatencyMs||0, requestsCount: row.requestsCount||0 }); }));
}

async function getSessionCostBreakdown(sessionId){
  await ensureTables();
  const sql = `SELECT intent, SUM(input_tokens) as inTokens, SUM(output_tokens) as outTokens FROM token_usage WHERE session_id = ? GROUP BY intent`;
  return new Promise((resolve,reject)=>db.all(sql,[sessionId],(err,rows)=>err?reject(err):resolve(rows)));
}

async function estimateCost(inputTokens, outputTokens, model){
  // rough pricing
  const pricing = {
    'gpt-4o-mini': { in: 0.15/1000000, out: 0.60/1000000 },
    'gpt-4.1': { in: 2.00/1000000, out: 8.00/1000000 },
    'gemini-3.1-flash-lite': { in: 0.05/1000000, out: 0.05/1000000 }
  };
  const p = pricing[model] || pricing['gpt-4o-mini'];
  const cost = (inputTokens * p.in) + (outputTokens * p.out);
  return cost;
}

module.exports = { recordTokens, getAgentUsageStats, getSessionCostBreakdown, estimateCost };
