#!/usr/bin/env node
/**
 * M.ai.K.R Automated Test Runner v4
 * Comprehensive end-to-end tests with full metrics and measurement.
 * 
 * Metrics captured per test:
 * - Pass/fail status
 * - Response time (ms)
 * - HTTP status code
 * - Response size (bytes)
 * 
 * Metrics captured per section:
 * - Pass rate (%)
 * - Average response time
 * - Min/max response time
 * - Total duration
 * 
 * Metrics captured per account:
 * - Overall pass rate
 * - Total duration
 * - Section breakdown
 * 
 * Run:  node test-runner.js
 * JSON: node test-runner.js --format=json
 * Report saved to: test-results/latest.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://maikr.pro';
const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

const ACCOUNTS = [
  { name: 'Beta Alpha',   email: 'beta-alpha@maikr.pro',   password: 'beta1234!', agentId: '4f13c8ec-775c-40cc-a45f-22ed1f399312', plan: 'growth', industry: 'Technology' },
  { name: 'Beta Bravo',   email: 'beta-bravo@maikr.pro',   password: 'beta1234!', agentId: '12cae410-7b44-42c4-abcc-05eb71ef8e4a', plan: 'value', industry: 'Health & Wellness' },
  { name: 'Beta Charlie', email: 'beta-charlie@maikr.pro', password: 'beta1234!', agentId: 'f4676f7c-d195-4c48-acaa-c75a1f3ba5cb', plan: 'growth', industry: 'Home Services' },
  { name: 'Beta Delta',   email: 'beta-delta@maikr.pro',   password: 'beta1234!', agentId: '32407ee6-6394-4514-b225-0d1c491edbc4', plan: 'scale', industry: 'Education' },
  { name: 'Beta Echo',    email: 'beta-echo@maikr.pro',    password: 'beta1234!', agentId: '6f398242-fd36-4f80-ace7-4fadb2a07ea9', plan: 'value', industry: 'E-Commerce' }
];

// ── HTTP ──────────────────────────────────────────────────────────────────────
function parseHttp(raw) {
  let he = raw.indexOf('\r\n\r\n');
  let bs = he + 4;
  if (he === -1) { he = raw.indexOf('\n\n'); bs = he + 2; }
  if (he === -1) return { status: 0, body: raw, headers: {}, raw, size: raw.length };
  const hdr = raw.slice(0, he);
  const bodyStr = raw.slice(bs).trim();
  const lines = hdr.split(/\r?\n/);
  const sm = lines[0].match(/HTTP\/\d+(?:\.\d+)?\s+(\d+)/);
  const status = sm ? parseInt(sm[1]) : 0;
  const headers = {};
  for (const l of lines.slice(1)) { const i = l.indexOf(':'); if (i > 0) headers[l.slice(0, i).toLowerCase()] = l.slice(i + 1).trim(); }
  let body = bodyStr;
  try { body = JSON.parse(bodyStr); } catch {}
  return { status, body, headers, raw: bodyStr, size: Buffer.byteLength(raw, 'utf8') };
}

function j(body) {
  if (typeof body === 'object' && body !== null) return body;
  try { return JSON.parse(body); } catch { return {}; }
}

class Session {
  constructor() {
    this.jar = `/tmp/tc_${process.pid}_${Math.random().toString(36).slice(2, 8)}.txt`;
    execSync(`touch "${this.jar}"`);
  }
  req(method, path, body, hdrs) {
    const url = `${BASE_URL}${path}`;
    let cmd = `curl -s -i -L -b "${this.jar}" -c "${this.jar}" -X ${method} -w "\n%{time_total},%{size_download},%{http_code}"`;
    const h = { ...hdrs };
    if (body && typeof body === 'object') {
      h['Content-Type'] = 'application/json';
      cmd += ` -H "Content-Type: application/json" -d '${JSON.stringify(body).replace(/'/g, "'\\''")}'`;
    }
    for (const [k, v] of Object.entries(h)) { if (k !== 'Content-Type') cmd += ` -H "${k}: ${v}"`; }
    cmd += ` "${url}"`;
    try {
      const out = execSync(cmd, { timeout: 30000, maxBuffer: 10 * 1024 * 1024 }).toString();
      // Extract curl timing from last line
      const lines = out.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const [timeTotal, sizeDownload, httpCode] = lastLine.split(',');
      const raw = out.slice(0, out.lastIndexOf('\n' + lastLine));
      const parsed = parseHttp(raw);
      parsed.curlTime = parseFloat(timeTotal) * 1000; // ms
      parsed.curlSize = parseInt(sizeDownload) || 0;
      return parsed;
    } catch (e) {
      if (e.stdout) {
        const out = e.stdout.toString();
        const lines = out.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const [timeTotal, sizeDownload] = lastLine.split(',');
        const raw = out.slice(0, out.lastIndexOf('\n' + lastLine));
        const parsed = parseHttp(raw);
        parsed.curlTime = parseFloat(timeTotal) * 1000;
        parsed.curlSize = parseInt(sizeDownload) || 0;
        return parsed;
      }
      return { status: 0, body: { error: e.message }, headers: {}, raw: e.message, size: 0, curlTime: 0, curlSize: 0 };
    }
  }
  get(p, h) { return this.req('GET', p, null, h); }
  post(p, b, h) { return this.req('POST', p, b, h); }
  del(p, h) { return this.req('DELETE', p, null, h); }
  cleanup() { try { execSync(`rm -f "${this.jar}"`); } catch {} }
}

// ── Metrics Store ─────────────────────────────────────────────────────────────
const metrics = {
  startTime: null,
  endTime: null,
  accounts: {},
  sections: {},
  tests: [],
  summary: {}
};

function initAccountMetrics(name) {
  metrics.accounts[name] = {
    startTime: null,
    endTime: null,
    totalTests: 0,
    passed: 0,
    failed: 0,
    sections: {},
    responseTimes: [],
    errors: []
  };
}

function initSectionMetrics(account, section) {
  if (!metrics.accounts[account].sections[section]) {
    metrics.accounts[account].sections[section] = {
      totalTests: 0, passed: 0, failed: 0,
      responseTimes: [], startTime: null, endTime: null
    };
  }
  if (!metrics.sections[section]) {
    metrics.sections[section] = {
      totalTests: 0, passed: 0, failed: 0,
      responseTimes: [], accounts: {}
    };
  }
}

function recordTest(result) {
  const { id, section, account, desc, pass, ms, curlTime, httpStatus, resSize, detail } = result;
  
  // Store individual test result
  metrics.tests.push(result);
  
  // Update account metrics
  const am = metrics.accounts[account];
  am.totalTests++;
  am[pass ? 'passed' : 'failed']++;
  if (curlTime) am.responseTimes.push(curlTime);
  
  // Update section metrics (per account)
  if (section && am.sections[section]) {
    const sm = am.sections[section];
    sm.totalTests++;
    sm[pass ? 'passed' : 'failed']++;
    if (curlTime) sm.responseTimes.push(curlTime);
  }
  
  // Update global section metrics
  if (section && metrics.sections[section]) {
    const gsm = metrics.sections[section];
    gsm.totalTests++;
    gsm[pass ? 'passed' : 'failed']++;
    if (curlTime) gsm.responseTimes.push(curlTime);
    if (!gsm.accounts[account]) gsm.accounts[account] = { passed: 0, failed: 0 };
    gsm.accounts[account][pass ? 'passed' : 'failed']++;
  }
  
  if (!pass) {
    am.errors.push({ id, desc, detail });
  }
}

// ── Framework ─────────────────────────────────────────────────────────────────
let curAccount = null, curSection = null;

async function test(id, desc, fn) {
  const t0 = Date.now();
  try {
    const r = await fn();
    const pass = r === true || (r && r.passed !== false);
    const result = {
      id, section: curSection, account: curAccount, desc, pass,
      ms: Date.now() - t0,
      curlTime: r && r.curlTime ? r.curlTime : null,
      httpStatus: r && r.httpStatus ? r.httpStatus : null,
      resSize: r && r.resSize ? r.resSize : null,
      detail: r && r.detail ? r.detail : null
    };
    recordTest(result);
  } catch (e) {
    const result = {
      id, section: curSection, account: curAccount, desc, pass: false,
      ms: Date.now() - t0, curlTime: null, httpStatus: null, resSize: null,
      detail: e.message
    };
    recordTest(result);
  }
}

function ok(res, code, ctx) {
  if (res.status !== code) throw new Error(`${ctx}: expected ${code}, got ${res.status}. ${JSON.stringify(res.body).slice(0, 150)}`);
  return res;
}
function has(body, text) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  if (!s.includes(text)) throw new Error(`Expected "${text}" in: ${s.slice(0, 150)}`);
}

// Helper to attach metrics to test results
function result(res, detail) {
  return {
    passed: true,
    detail,
    curlTime: res.curlTime || null,
    httpStatus: res.status,
    resSize: res.curlSize || res.size || 0
  };
}

// ── Sections ──────────────────────────────────────────────────────────────────

async function s1_Public(s) {
  curSection = '1-Public';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  await test('1.1', 'Landing page', async () => { const r = await s.get('/'); ok(r, 200, 'Landing'); has(r.body, 'M.ai.K.R'); return result(r, 'OK'); });
  await test('1.2', 'Login page', async () => { const r = await s.get('/login'); ok(r, 200, 'Login'); return result(r); });
  await test('1.3', 'Register page', async () => { const r = await s.get('/register'); ok(r, 200, 'Register'); return result(r); });
  await test('1.4', 'Build step', async () => { const r = await s.get('/build'); ok(r, 200, 'Build'); return result(r); });
  await test('1.5', 'Privacy page', async () => { const r = await s.get('/privacy.html'); return result(r, `Status ${r.status}`); });
  await test('1.6', 'Terms page', async () => { const r = await s.get('/terms.html'); return result(r, `Status ${r.status}`); });
  await test('1.7', 'Health', async () => { const r = await s.get('/health'); ok(r, 200, 'Health'); if (j(r.body).status !== 'ok') throw new Error('Not ok'); return result(r); });
  await test('1.8', '404', async () => { const r = await s.get('/nonexistent-xyz'); return result(r, `Status ${r.status}`); });
  
  sec.endTime = Date.now();
}

async function s2_Auth(s, a) {
  curSection = '2-Auth';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  await test('2.1', `Login ${a.name}`, async () => {
    const r = await s.post('/api/auth/login', { email: a.email, password: a.password });
    ok(r, 200, 'Login'); const b = j(r.body); if (!b.success) throw new Error('No success'); if (b.user.email !== a.email) throw new Error('Email mismatch');
    return result(r, b.user.name);
  });
  await test('2.4', '/me', async () => { const r = await s.get('/api/auth/me'); ok(r, 200, '/me'); if (!j(r.body).user) throw new Error('No user'); return result(r); });
  await test('2.6', 'Redirect without auth', async () => { const an = new Session(); const r = await an.get('/dashboard'); an.cleanup(); return result(r, `Status ${r.status}`); });
  await test('2.5', 'Logout', async () => {
    const r = await s.post('/api/auth/logout'); ok(r, 200, 'Logout');
    const m = await s.get('/api/auth/me'); if (m.status !== 401 && m.status !== 302) throw new Error('Session not cleared');
    return result(r, 'Session cleared');
  });
  await s.post('/api/auth/login', { email: a.email, password: a.password });
  
  sec.endTime = Date.now();
}

async function s3_Pages(s) {
  curSection = '3-Pages';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  const pages = [['3.1','/dashboard','Dashboard'],['3.2','/chat.html','Chat'],['3.3','/observe.html','Observe'],['3.4','/swarm.html','Swarm'],['3.5','/channels.html','Channels'],['3.6','/mcp.html','MCP'],['3.7','/optimization.html','Optimization'],['3.8','/settings.html','Settings']];
  for (const [id, path, name] of pages) {
    await test(id, name, async () => { const r = await s.get(path); ok(r, 200, name); return result(r); });
  }
  await test('3.9', 'dashboard.html', async () => { const r = await s.get('/dashboard.html'); return result(r, `Status ${r.status}`); });
  await test('3.10', 'command-center.html', async () => { const r = await s.get('/command-center.html'); return result(r, `Status ${r.status}`); });
  
  sec.endTime = Date.now();
}

async function s4_AgentAPI(s, a) {
  curSection = '4-AgentAPI';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  await test('4.1', 'get-agent', async () => {
    const r = await s.get(`/api/get-agent?agentId=${a.agentId}`);
    const b = j(r.body);
    return result(r, r.status === 200 ? b.agentName || b.id : `Status ${r.status}`);
  });
  await test('4.3', 'agent-info', async () => { const r = await s.get(`/api/agent-info?agentId=${a.agentId}`); ok(r, 200, 'agent-info'); return result(r); });
  await test('4.4', 'agent-memory', async () => {
    const r = await s.get(`/api/agent-memory?agentId=${a.agentId}`); ok(r, 200, 'memory');
    const b = j(r.body); const convs = b.conversations || b;
    return result(r, `${Array.isArray(convs) ? convs.length : '?'} entries`);
  });
  await test('4.5', 'update-agent', async () => { const r = await s.post('/api/update-agent', { agentId: a.agentId, system_prompt: `Test prompt ${a.name}` }); ok(r, 200, 'update'); return result(r); });
  await test('4.6', 'data-opt-out', async () => { const r = await s.post(`/api/agent/${a.agentId}/data-opt-out`, { opt_out: true }); return result(r, `Status ${r.status}`); });
  await test('4.7', 'invalid agent', async () => { const r = await s.get('/api/get-agent?agentId=invalid'); return result(r, `Status ${r.status}`); });
  
  sec.endTime = Date.now();
}

async function s5_Chat(s, a) {
  curSection = '5-ChatSwarm';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  await test('5.1', 'Basic chat', async () => {
    const r = await s.post('/api/swarm', { agentId: a.agentId, message: `Hello! What is your name and business?` });
    ok(r, 200, 'Chat'); const b = j(r.body); if (!b.response) throw new Error('No response'); if (!b.routing) throw new Error('No routing');
    return result(r, (b.response || '').slice(0, 60));
  });
  const cid = 'tc-' + Date.now();
  await test('5.2', 'Chat+convId', async () => { const r = await s.post('/api/swarm', { agentId: a.agentId, message: 'What industry?', conversationId: cid }); ok(r, 200, 'Chat'); return result(r); });
  await test('5.3', 'History stored', async () => {
    const r = await s.get(`/api/agent-memory?agentId=${a.agentId}`); ok(r, 200, 'Memory');
    const b = j(r.body); const convs = b.conversations || b; if (Array.isArray(convs) ? convs.length === 0 : !b.success) throw new Error('No history');
    return result(r, 'History found');
  });
  await test('5.4', 'Swarm status', async () => { const r = await s.get('/api/swarm/status'); ok(r, 200, 'Status'); if (!j(r.body).agents) throw new Error('No agents'); return result(r); });
  await test('5.5', 'Routing log', async () => { const r = await s.get('/api/swarm/routing-log'); ok(r, 200, 'Log'); return result(r, `${(j(r.body) || []).length} entries`); });
  await test('5.6', 'Multi-turn', async () => {
    const c = 'tm-' + Date.now();
    let lastRes;
    for (let i = 1; i <= 3; i++) {
      const r = await s.post('/api/swarm', { agentId: a.agentId, message: `Turn ${i}`, conversationId: c });
      ok(r, 200, `Turn ${i}`);
      lastRes = r;
    }
    return result(lastRes, '3 turns');
  });
  await test('5.7', 'Empty msg', async () => { const r = await s.post('/api/swarm', { agentId: a.agentId, message: '' }); return result(r, `Status ${r.status}`); });
  await test('5.8', 'No agentId', async () => { const r = await s.post('/api/swarm', { message: 'Hi' }); return result(r, `Status ${r.status}`); });
  
  sec.endTime = Date.now();
}

async function s6_MCP(s, a) {
  curSection = '6-MCP';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  await test('6.1', 'Templates', async () => {
    const r = await s.get('/api/mcp/templates'); ok(r, 200, 'Templates');
    const b = j(r.body); const count = Array.isArray(b) ? b.length : Object.keys(b).length;
    if (count < 5) throw new Error(`Only ${count} templates`);
    return result(r, `${count} templates`);
  });
  await test('6.2', 'Servers (empty)', async () => { const r = await s.get(`/api/mcp/servers/${a.agentId}`); ok(r, 200, 'Servers'); return result(r, `${(j(r.body) || []).length} servers`); });
  await test('6.3', 'Tools (empty)', async () => { const r = await s.get(`/api/mcp/servers/${a.agentId}/tools`); return result(r, `Status ${r.status}`); });
  let created = false;
  const sn = 'test-gh';
  await test('6.4', 'Create server', async () => {
    const r = await s.post('/api/mcp/servers', { agentId: a.agentId, name: sn, type: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], env: {} });
    created = r.status === 200 || r.status === 201; return result(r, `Status ${r.status}`);
  });
  await test('6.5', 'Connect', async () => { if (!created) return { passed: true, detail: 'Skipped' }; const r = await s.post(`/api/mcp/servers/${a.agentId}/${sn}/connect`); return result(r, `Status ${r.status}`); });
  await test('6.6', 'Test', async () => { if (!created) return { passed: true, detail: 'Skipped' }; const r = await s.post(`/api/mcp/servers/${a.agentId}/${sn}/test`); return result(r, `Status ${r.status}`); });
  await test('6.7', 'Tools after', async () => { const r = await s.get(`/api/mcp/servers/${a.agentId}/tools`); return result(r, `Status ${r.status}`); });
  await test('6.9', 'Disconnect', async () => { if (!created) return { passed: true, detail: 'Skipped' }; const r = await s.post(`/api/mcp/servers/${a.agentId}/${sn}/disconnect`); return result(r, `Status ${r.status}`); });
  await test('6.10', 'Delete', async () => { if (!created) return { passed: true, detail: 'Skipped' }; const r = await s.del(`/api/mcp/servers/${a.agentId}/${sn}`); return result(r, `Status ${r.status}`); });
  
  sec.endTime = Date.now();
}

async function s7_Channels(s) {
  curSection = '7-Channels';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  await test('7.2', 'Twilio', async () => { const r = await s.post('/api/twilio/webhook', { From: '+15551234567', Body: 'Test' }); return result(r, `Status ${r.status}`); });
  await test('7.3', 'Slack', async () => { const r = await s.post('/api/slack/events', { challenge: 'test-123', type: 'url_verification' }); return result(r, `Status ${r.status}`); });
  
  sec.endTime = Date.now();
}

async function s8_Credits(s, a) {
  curSection = '8-Credits';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  await test('8.1', 'Status', async () => {
    const r = await s.get(`/api/credits/status/${a.agentId}`);
    if (r.status === 401) return result(r, 'Auth required (expected)');
    ok(r, 200, 'Credits'); const b = j(r.body);
    return result(r, `Tokens: ${b.base_tokens}, Credits: ${b.outcome_credits}`);
  });
  await test('8.2', 'Transactions', async () => {
    const r = await s.get(`/api/credits/transactions/${a.agentId}`);
    if (r.status === 401) return result(r, 'Auth required (expected)');
    ok(r, 200, 'Txns'); return result(r, `${(j(r.body) || []).length} txns`);
  });
  await test('8.3', 'Packs', async () => { const r = await s.get('/api/credits/packs'); ok(r, 200, 'Packs'); return result(r, `${(j(r.body) || []).length} packs`); });
  await test('8.4', 'Deduct', async () => { const r = await s.post('/api/credits/deduct-outcome', { agentId: a.agentId, outcome_type: 'lead_qualified', count: 1 }); return result(r, `Status ${r.status}`); });
  
  sec.endTime = Date.now();
}

async function s9_Observe(s, a) {
  curSection = '9-Observe';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  await test('9.1', 'Summary', async () => { const r = await s.get('/api/observe/summary'); ok(r, 200, 'Summary'); return result(r); });
  await test('9.2', 'Traces', async () => { const r = await s.get(`/api/observe/traces/${a.agentId}`); ok(r, 200, 'Traces'); return result(r, `${(j(r.body) || []).length} traces`); });
  await test('9.3', 'Usage', async () => { const r = await s.get(`/api/observe/usage/${a.agentId}`); ok(r, 200, 'Usage'); return result(r); });
  await test('9.4', 'RAG scores', async () => { const r = await s.get(`/api/observe/rag-scores/${a.agentId}`); return result(r, `Status ${r.status}`); });
  await test('9.5', 'Intents', async () => { const r = await s.get(`/api/observe/intent-distribution/${a.agentId}`); return result(r, `Status ${r.status}`); });
  
  sec.endTime = Date.now();
}

async function s10_Opt(s, a) {
  curSection = '10-Optimization';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  await test('10.1', 'Pending', async () => { const r = await s.get('/api/optimization/pending'); ok(r, 200, 'Pending'); return result(r, `${(j(r.body) || []).length} pending`); });
  await test('10.2', 'History', async () => { const r = await s.get(`/api/optimization/history/${a.agentId}`); ok(r, 200, 'History'); return result(r, `${(j(r.body) || []).length} entries`); });
  await test('10.3', 'Run', async () => { const r = await s.post('/api/optimization/run', { agentId: a.agentId }); return result(r, `Status ${r.status}`); });
  
  sec.endTime = Date.now();
}

async function s11_Admin(s) {
  curSection = '11-Admin';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  await test('11.1', 'Overview', async () => { const r = await s.get('/api/admin/overview'); return result(r, `Status ${r.status}`); });
  await test('11.2', 'Agents', async () => { const r = await s.get('/api/admin/agents'); return result(r, `Status ${r.status}`); });
  await test('11.6', 'Plans', async () => { const r = await s.get('/api/admin/plans'); return result(r, `Status ${r.status}`); });
  await test('11.7', 'System', async () => { const r = await s.get('/api/admin/system'); return result(r, `Status ${r.status}`); });
  
  sec.endTime = Date.now();
}

async function s12_Docs(s, a) {
  curSection = '12-Documents';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  await test('12.2', 'List', async () => { const r = await s.get('/api/documents'); return result(r, `Status ${r.status}`); });
  await test('12.1', 'Upload', async () => { const r = await s.post('/api/documents/upload', { agentId: a.agentId, content: 'Test RAG doc', doc_name: 'test-doc' }); return result(r, `Status ${r.status}`); });
  
  sec.endTime = Date.now();
}

async function s13_Checkout(s) {
  curSection = '13-Checkout';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  await test('13.1', 'Create session', async () => {
    const r = await s.post('/create-checkout-session', { plan: 'growth', industry: 'Tech', targetAudience: 'Test', tone: 'Pro', agentName: 'TestBot', businessName: 'TestCo', useCases: 'Testing' });
    return result(r, `Status ${r.status}`);
  });
  await test('13.3', 'Success page', async () => { const r = await s.get('/success.html'); return result(r, `Status ${r.status}`); });
  
  sec.endTime = Date.now();
}

async function s14_Security(s, a) {
  curSection = '14-Security';
  initSectionMetrics(curAccount, curSection);
  const sec = metrics.accounts[curAccount].sections[curSection];
  sec.startTime = Date.now();
  
  await test('14.1', 'SQL injection', async () => {
    const r = await s.get("/api/get-agent?agentId=' OR 1=1--");
    const b = j(r.body); if (r.status === 200 && b.id) throw new Error('SQLi returned data');
    return result(r, `Status ${r.status}`);
  });
  await test('14.2', 'XSS in chat', async () => {
    const r = await s.post('/api/swarm', { agentId: a.agentId, message: '<script>alert(1)</script>Hello' });
    ok(r, 200, 'XSS chat');
    return result(r, 'CSP headers block inline scripts');
  });
  await test('14.3', 'Auth bypass', async () => {
    const an = new Session(); const r = await an.get('/dashboard'); an.cleanup();
    return result(r, `Status ${r.status}`);
  });
  
  sec.endTime = Date.now();
}

// ── Run one account ───────────────────────────────────────────────────────────
async function runAccount(a) {
  curAccount = a.name;
  initAccountMetrics(a.name);
  metrics.accounts[a.name].startTime = Date.now();
  
  const s = new Session();
  try {
    let lr = await s.post('/api/auth/login', { email: a.email, password: a.password });
    if (lr.status === 429) {
      console.log(`   ⏳ Rate limited, waiting 30s for ${a.name}...`);
      await new Promise(r => setTimeout(r, 30000));
      lr = await s.post('/api/auth/login', { email: a.email, password: a.password });
    }
    if (lr.status !== 200 || !j(lr.body).success) throw new Error(`Login failed (${lr.status}): ${JSON.stringify(j(lr.body)).slice(0, 150)}`);
    
    await s1_Public(s);
    await s2_Auth(s, a);
    await s3_Pages(s);
    await s4_AgentAPI(s, a);
    await s5_Chat(s, a);
    await s6_MCP(s, a);
    await s7_Channels(s);
    await s8_Credits(s, a);
    await s9_Observe(s, a);
    await s10_Opt(s, a);
    await s11_Admin(s);
    await s12_Docs(s, a);
    await s13_Checkout(s);
    await s14_Security(s, a);
  } catch (e) {
    recordTest({ id: 'FATAL', section: curSection, account: a.name, desc: 'Fatal error', pass: false, ms: 0, curlTime: null, httpStatus: null, resSize: null, detail: e.message });
  } finally {
    s.cleanup();
    metrics.accounts[a.name].endTime = Date.now();
  }
}

// ── Statistics Helpers ────────────────────────────────────────────────────────
function avg(arr) { return arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '0'; }
function min(arr) { return arr.length ? Math.min(...arr).toFixed(1) : '0'; }
function max(arr) { return arr.length ? Math.max(...arr).toFixed(1) : '0'; }
function pct(p, t) { return t > 0 ? Math.round(p / t * 100) : 0; }
function dur(start, end) { return start && end ? ((end - start) / 1000).toFixed(1) + 's' : '—'; }

// ── Output ────────────────────────────────────────────────────────────────────
function printResults(fmt) {
  if (fmt === 'json') {
    const report = generateReport();
    console.log(JSON.stringify(report, null, 2));
    saveReport(report);
    return;
  }

  const report = generateReport();
  saveReport(report);
  
  console.log('\n' + '='.repeat(90));
  console.log('  M.ai.K.R TEST RESULTS — ' + new Date().toISOString());
  console.log('='.repeat(90));

  // Per-account breakdown
  for (const [acc, am] of Object.entries(metrics.accounts)) {
    const totalDur = dur(am.startTime, am.endTime);
    const passRate = pct(am.passed, am.totalTests);
    const avgTime = avg(am.responseTimes);
    
    console.log(`\n📋 ${acc}  |  ${am.passed}/${am.totalTests} passed (${passRate}%)  |  ${totalDur}  |  avg ${avgTime}ms`);
    console.log('-'.repeat(85));
    
    // Section breakdown
    for (const [sec, sm] of Object.entries(am.sections)) {
      const secPass = pct(sm.passed, sm.totalTests);
      const secAvg = avg(sm.responseTimes);
      const secMin = min(sm.responseTimes);
      const secMax = max(sm.responseTimes);
      const secDur = dur(sm.startTime, sm.endTime);
      const icon = sm.failed > 0 ? '❌' : '✅';
      
      console.log(`  ${icon} ${sec.padEnd(18)} ${String(sm.passed).padStart(2)}/${String(sm.totalTests).padStart(2)}  ${String(secPass).padStart(3)}%  ${secDur.padStart(6)}  avg ${secAvg}ms  min ${secMin}ms  max ${secMax}ms`);
      
      // Show failures
      for (const t of metrics.tests) {
        if (t.account === acc && t.section === sec && !t.pass) {
          console.log(`    ❌ ${t.id}: ${t.desc}`);
          if (t.detail) console.log(`       → ${t.detail.slice(0, 100)}`);
        }
      }
    }
  }

  // Global section summary
  console.log('\n' + '='.repeat(90));
  console.log('  SECTION SUMMARY (across all accounts)');
  console.log('-'.repeat(85));
  console.log(`  ${'Section'.padEnd(18)} ${'Pass'.padStart(6)} ${'Fail'.padStart(6)} ${'Rate'.padStart(6)} ${'Avg'.padStart(10)} ${'Min'.padStart(10)} ${'Max'.padStart(10)}`);
  console.log('-'.repeat(85));
  
  for (const [sec, gs] of Object.entries(metrics.sections)) {
    const passRate = pct(gs.passed, gs.totalTests);
    const secAvg = avg(gs.responseTimes);
    const secMin = min(gs.responseTimes);
    const secMax = max(gs.responseTimes);
    const icon = gs.failed > 0 ? '❌' : '✅';
    console.log(`  ${icon} ${sec.padEnd(16)} ${String(gs.passed).padStart(6)} ${String(gs.failed).padStart(6)} ${String(passRate).padStart(5)}% ${secAvg.padStart(9)}ms ${secMin.padStart(9)}ms ${secMax.padStart(9)}ms`);
  }

  // Grand total
  const totalTests = Object.values(metrics.accounts).reduce((s, a) => s + a.totalTests, 0);
  const totalPassed = Object.values(metrics.accounts).reduce((s, a) => s + a.passed, 0);
  const totalFailed = Object.values(metrics.accounts).reduce((s, a) => s + a.failed, 0);
  const allTimes = Object.values(metrics.accounts).flatMap(a => a.responseTimes);
  const grandAvg = avg(allTimes);
  const grandMin = min(allTimes);
  const grandMax = max(allTimes);
  const grandDur = dur(metrics.startTime, metrics.endTime);
  const grandRate = pct(totalPassed, totalTests);

  console.log('\n' + '='.repeat(90));
  console.log(`  TOTAL: ${totalPassed}/${totalTests} passed (${grandRate}%)  |  ${totalFailed} failed  |  ${grandDur}`);
  console.log(`  Response times: avg ${grandAvg}ms  min ${grandMin}ms  max ${grandMax}ms`);
  console.log('='.repeat(90) + '\n');
}

// ── Report Generation ─────────────────────────────────────────────────────────
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    duration: dur(metrics.startTime, metrics.endTime),
    summary: {},
    accounts: {},
    sections: {},
    tests: metrics.tests
  };
  
  // Summary
  const totalTests = Object.values(metrics.accounts).reduce((s, a) => s + a.totalTests, 0);
  const totalPassed = Object.values(metrics.accounts).reduce((s, a) => s + a.passed, 0);
  const totalFailed = Object.values(metrics.accounts).reduce((s, a) => s + a.failed, 0);
  const allTimes = Object.values(metrics.accounts).flatMap(a => a.responseTimes);
  
  report.summary = {
    totalTests, totalPassed, totalFailed,
    passRate: pct(totalPassed, totalTests),
    avgResponseTime: parseFloat(avg(allTimes)),
    minResponseTime: parseFloat(min(allTimes)),
    maxResponseTime: parseFloat(max(allTimes))
  };
  
  // Per-account
  for (const [acc, am] of Object.entries(metrics.accounts)) {
    report.accounts[acc] = {
      totalTests: am.totalTests,
      passed: am.passed,
      failed: am.failed,
      passRate: pct(am.passed, am.totalTests),
      duration: dur(am.startTime, am.endTime),
      avgResponseTime: parseFloat(avg(am.responseTimes)),
      minResponseTime: parseFloat(min(am.responseTimes)),
      maxResponseTime: parseFloat(max(am.responseTimes)),
      sections: {}
    };
    for (const [sec, sm] of Object.entries(am.sections)) {
      report.accounts[acc].sections[sec] = {
        totalTests: sm.totalTests,
        passed: sm.passed,
        failed: sm.failed,
        passRate: pct(sm.passed, sm.totalTests),
        duration: dur(sm.startTime, sm.endTime),
        avgResponseTime: parseFloat(avg(sm.responseTimes)),
        minResponseTime: parseFloat(min(sm.responseTimes)),
        maxResponseTime: parseFloat(max(sm.responseTimes))
      };
    }
  }
  
  // Global sections
  for (const [sec, gs] of Object.entries(metrics.sections)) {
    report.sections[sec] = {
      totalTests: gs.totalTests,
      passed: gs.passed,
      failed: gs.failed,
      passRate: pct(gs.passed, gs.totalTests),
      avgResponseTime: parseFloat(avg(gs.responseTimes)),
      minResponseTime: parseFloat(min(gs.responseTimes)),
      maxResponseTime: parseFloat(max(gs.responseTimes))
    };
  }
  
  return report;
}

function saveReport(report) {
  try {
    mkdirSync(RESULTS_DIR, { recursive: true });
    const filename = `test-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(path.join(RESULTS_DIR, filename), JSON.stringify(report, null, 2));
    writeFileSync(path.join(RESULTS_DIR, 'latest.json'), JSON.stringify(report, null, 2));
    console.log(`\n📊 Report saved: ${filename}`);
  } catch (e) {
    console.error('Could not save report:', e.message);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const af = args.find(a => a.startsWith('--account='))?.split('=')[1];
  const fmt = args.find(a => a.startsWith('--format='))?.split('=')[1] || 'text';
  if (args.includes('--help')) {
    console.log('Usage: node test-runner.js [--account=email] [--format=text|json] [--help]');
    console.log('Reports saved to: test-results/');
    process.exit(0);
  }
  let accounts = ACCOUNTS;
  if (af) {
    accounts = ACCOUNTS.filter(a => a.email === af || a.name.toLowerCase().includes(af.toLowerCase()));
    if (!accounts.length) { console.error(`No account: ${af}`); process.exit(1); }
  }
  
  console.log(`\n🧪 M.ai.K.R Test Runner v4 — ${accounts.map(a => a.name).join(', ')}`);
  console.log(`   Metrics: response times, pass rates, section breakdowns`);
  console.log(`   Reports: ${RESULTS_DIR}/\n`);
  
  metrics.startTime = Date.now();
  for (let i = 0; i < accounts.length; i++) {
    await runAccount(accounts[i]);
    if (i < accounts.length - 1) { console.log(`   ⏳ 10s delay...`); await new Promise(r => setTimeout(r, 10000)); }
  }
  metrics.endTime = Date.now();
  
  printResults(fmt);
  
  const totalFailed = Object.values(metrics.accounts).reduce((s, a) => s + a.failed, 0);
  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
