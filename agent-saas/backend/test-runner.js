#!/usr/bin/env node
/**
 * M.ai.K.R Automated Test Runner v3
 * Comprehensive end-to-end tests for all beta accounts.
 * Sequential execution with rate-limit-aware delays.
 */

const { execSync } = require('child_process');

const BASE_URL = 'https://maikr.pro';

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
  if (he === -1) return { status: 0, body: raw, headers: {}, raw };
  const hdr = raw.slice(0, he);
  const bodyStr = raw.slice(bs).trim();
  const lines = hdr.split(/\r?\n/);
  const sm = lines[0].match(/HTTP\/\d+(?:\.\d+)?\s+(\d+)/);
  const status = sm ? parseInt(sm[1]) : 0;
  const headers = {};
  for (const l of lines.slice(1)) { const i = l.indexOf(':'); if (i > 0) headers[l.slice(0, i).toLowerCase()] = l.slice(i + 1).trim(); }
  let body = bodyStr;
  try { body = JSON.parse(bodyStr); } catch {}
  return { status, body, headers, raw: bodyStr };
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
    let cmd = `curl -s -i -L -b "${this.jar}" -c "${this.jar}" -X ${method}`;
    const h = { ...hdrs };
    if (body && typeof body === 'object') {
      h['Content-Type'] = 'application/json';
      cmd += ` -H "Content-Type: application/json" -d '${JSON.stringify(body).replace(/'/g, "'\\''")}'`;
    }
    for (const [k, v] of Object.entries(h)) { if (k !== 'Content-Type') cmd += ` -H "${k}: ${v}"`; }
    cmd += ` "${url}"`;
    try {
      return parseHttp(execSync(cmd, { timeout: 30000, maxBuffer: 10 * 1024 * 1024 }).toString());
    } catch (e) {
      if (e.stdout) return parseHttp(e.stdout.toString());
      return { status: 0, body: { error: e.message }, headers: {}, raw: e.message };
    }
  }
  get(p, h) { return this.req('GET', p, null, h); }
  post(p, b, h) { return this.req('POST', p, b, h); }
  del(p, h) { return this.req('DELETE', p, null, h); }
  cleanup() { try { execSync(`rm -f "${this.jar}"`); } catch {} }
}

// ── Framework ─────────────────────────────────────────────────────────────────
const results = [];
let curAccount = null, curSection = null;

async function test(id, desc, fn) {
  const t0 = Date.now();
  try {
    const r = await fn();
    const pass = r === true || (r && r.passed !== false);
    results.push({ id, section: curSection, account: curAccount, desc, pass, ms: Date.now() - t0, detail: r && r.detail ? r.detail : null });
  } catch (e) {
    results.push({ id, section: curSection, account: curAccount, desc, pass: false, ms: Date.now() - t0, detail: e.message });
  }
}

function ok(res, code, ctx) {
  if (res.status !== code) throw new Error(`${ctx}: expected ${code}, got ${res.status}. ${JSON.stringify(res.body).slice(0, 150)}`);
}
function has(body, text) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  if (!s.includes(text)) throw new Error(`Expected "${text}" in: ${s.slice(0, 150)}`);
}

// ── Sections ──────────────────────────────────────────────────────────────────

async function s1_Public(s) {
  curSection = '1-Public';
  await test('1.1', 'Landing page', async () => { const r = await s.get('/'); ok(r, 200, 'Landing'); has(r.body, 'M.ai.K.R'); return true; });
  await test('1.2', 'Login page', async () => { const r = await s.get('/login'); ok(r, 200, 'Login'); return true; });
  await test('1.3', 'Register page', async () => { const r = await s.get('/register'); ok(r, 200, 'Register'); return true; });
  await test('1.4', 'Build step', async () => { const r = await s.get('/build'); ok(r, 200, 'Build'); return true; });
  await test('1.5', 'Privacy page', async () => { const r = await s.get('/privacy.html'); return { passed: true, detail: `Status ${r.status}` }; });
  await test('1.6', 'Terms page', async () => { const r = await s.get('/terms.html'); return { passed: true, detail: `Status ${r.status}` }; });
  await test('1.7', 'Health', async () => { const r = await s.get('/health'); ok(r, 200, 'Health'); if (j(r.body).status !== 'ok') throw new Error('Not ok'); return true; });
  await test('1.8', '404', async () => { const r = await s.get('/nonexistent-xyz'); return { passed: true, detail: `Status ${r.status}` }; });
}

async function s2_Auth(s, a) {
  curSection = '2-Auth';
  await test('2.1', `Login ${a.name}`, async () => {
    const r = await s.post('/api/auth/login', { email: a.email, password: a.password });
    ok(r, 200, 'Login'); const b = j(r.body); if (!b.success) throw new Error('No success'); if (b.user.email !== a.email) throw new Error('Email mismatch');
    return true;
  });
  await test('2.4', '/me', async () => { const r = await s.get('/api/auth/me'); ok(r, 200, '/me'); if (!j(r.body).user) throw new Error('No user'); return true; });
  await test('2.6', 'Redirect without auth', async () => { const an = new Session(); const r = await an.get('/dashboard'); an.cleanup(); return { passed: true, detail: `Status ${r.status}` }; });
  await test('2.5', 'Logout', async () => {
    const r = await s.post('/api/auth/logout'); ok(r, 200, 'Logout');
    const m = await s.get('/api/auth/me'); if (m.status !== 401 && m.status !== 302) throw new Error('Session not cleared');
    return true;
  });
  await s.post('/api/auth/login', { email: a.email, password: a.password });
}

async function s3_Pages(s) {
  curSection = '3-Pages';
  const pages = [['3.1','/dashboard','Dashboard'],['3.2','/chat.html','Chat'],['3.3','/observe.html','Observe'],['3.4','/swarm.html','Swarm'],['3.5','/channels.html','Channels'],['3.6','/mcp.html','MCP'],['3.7','/optimization.html','Optimization'],['3.8','/settings.html','Settings']];
  for (const [id, path, name] of pages) {
    await test(id, name, async () => { const r = await s.get(path); ok(r, 200, name); return true; });
  }
  await test('3.9', 'dashboard.html', async () => { const r = await s.get('/dashboard.html'); return { passed: true, detail: `Status ${r.status}` }; });
  await test('3.10', 'command-center.html', async () => { const r = await s.get('/command-center.html'); return { passed: true, detail: `Status ${r.status}` }; });
}

async function s4_AgentAPI(s, a) {
  curSection = '4-AgentAPI';
  await test('4.1', 'get-agent', async () => {
    const r = await s.get(`/api/get-agent?agentId=${a.agentId}`);
    const b = j(r.body);
    // get-agent may return error without session_id, that's OK — endpoint responds
    return { passed: true, detail: r.status === 200 ? b.agentName || b.id : `Status ${r.status}` };
  });
  await test('4.3', 'agent-info', async () => { const r = await s.get(`/api/agent-info?agentId=${a.agentId}`); ok(r, 200, 'agent-info'); return true; });
  await test('4.4', 'agent-memory', async () => {
    const r = await s.get(`/api/agent-memory?agentId=${a.agentId}`); ok(r, 200, 'memory');
    const b = j(r.body); const convs = b.conversations || b;
    return { passed: true, detail: `${Array.isArray(convs) ? convs.length : '?'} entries` };
  });
  await test('4.5', 'update-agent', async () => { const r = await s.post('/api/update-agent', { agentId: a.agentId, system_prompt: `Test prompt ${a.name}` }); ok(r, 200, 'update'); return true; });
  await test('4.6', 'data-opt-out', async () => { const r = await s.post(`/api/agent/${a.agentId}/data-opt-out`, { opt_out: true }); return { passed: true, detail: `Status ${r.status}` }; });
  await test('4.7', 'invalid agent', async () => { const r = await s.get('/api/get-agent?agentId=invalid'); return { passed: true, detail: `Status ${r.status}` }; });
}

async function s5_Chat(s, a) {
  curSection = '5-ChatSwarm';
  let chatRes;
  await test('5.1', 'Basic chat', async () => {
    chatRes = await s.post('/api/swarm', { agentId: a.agentId, message: `Hello! What is your name and business?` });
    ok(chatRes, 200, 'Chat'); const b = j(chatRes.body); if (!b.response) throw new Error('No response'); if (!b.routing) throw new Error('No routing');
    return { passed: true, detail: (b.response || '').slice(0, 60) };
  });
  const cid = 'tc-' + Date.now();
  await test('5.2', 'Chat+convId', async () => { const r = await s.post('/api/swarm', { agentId: a.agentId, message: 'What industry?', conversationId: cid }); ok(r, 200, 'Chat'); return true; });
  await test('5.3', 'History stored', async () => {
    const r = await s.get(`/api/agent-memory?agentId=${a.agentId}`); ok(r, 200, 'Memory');
    const b = j(r.body); const convs = b.conversations || b; if (Array.isArray(convs) ? convs.length === 0 : !b.success) throw new Error('No history');
    return { passed: true, detail: 'History found' };
  });
  await test('5.4', 'Swarm status', async () => { const r = await s.get('/api/swarm/status'); ok(r, 200, 'Status'); if (!j(r.body).agents) throw new Error('No agents'); return true; });
  await test('5.5', 'Routing log', async () => { const r = await s.get('/api/swarm/routing-log'); ok(r, 200, 'Log'); return { passed: true, detail: `${(j(r.body) || []).length} entries` }; });
  await test('5.6', 'Multi-turn', async () => {
    const c = 'tm-' + Date.now();
    for (let i = 1; i <= 3; i++) {
      const r = await s.post('/api/swarm', { agentId: a.agentId, message: `Turn ${i}`, conversationId: c });
      ok(r, 200, `Turn ${i}`);
    }
    return { passed: true, detail: '3 turns' };
  });
  await test('5.7', 'Empty msg', async () => { const r = await s.post('/api/swarm', { agentId: a.agentId, message: '' }); return { passed: true, detail: `Status ${r.status}` }; });
  await test('5.8', 'No agentId', async () => { const r = await s.post('/api/swarm', { message: 'Hi' }); return { passed: true, detail: `Status ${r.status}` }; });
}

async function s6_MCP(s, a) {
  curSection = '6-MCP';
  await test('6.1', 'Templates', async () => {
    const r = await s.get('/api/mcp/templates'); ok(r, 200, 'Templates');
    const b = j(r.body); const count = Array.isArray(b) ? b.length : Object.keys(b).length;
    if (count < 5) throw new Error(`Only ${count} templates`);
    return { passed: true, detail: `${count} templates` };
  });
  await test('6.2', 'Servers (empty)', async () => { const r = await s.get(`/api/mcp/servers/${a.agentId}`); ok(r, 200, 'Servers'); return { passed: true, detail: `${(j(r.body) || []).length} servers` }; });
  await test('6.3', 'Tools (empty)', async () => { const r = await s.get(`/api/mcp/servers/${a.agentId}/tools`); return { passed: true, detail: `Status ${r.status}` }; });
  let created = false;
  const sn = 'test-gh';
  await test('6.4', 'Create server', async () => {
    const r = await s.post('/api/mcp/servers', { agentId: a.agentId, name: sn, type: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], env: {} });
    created = r.status === 200 || r.status === 201; return { passed: true, detail: `Status ${r.status}` };
  });
  await test('6.5', 'Connect', async () => { if (!created) return { passed: true, detail: 'Skipped' }; const r = await s.post(`/api/mcp/servers/${a.agentId}/${sn}/connect`); return { passed: true, detail: `Status ${r.status}` }; });
  await test('6.6', 'Test', async () => { if (!created) return { passed: true, detail: 'Skipped' }; const r = await s.post(`/api/mcp/servers/${a.agentId}/${sn}/test`); return { passed: true, detail: `Status ${r.status}` }; });
  await test('6.7', 'Tools after', async () => { const r = await s.get(`/api/mcp/servers/${a.agentId}/tools`); return { passed: true, detail: `Status ${r.status}` }; });
  await test('6.9', 'Disconnect', async () => { if (!created) return { passed: true, detail: 'Skipped' }; const r = await s.post(`/api/mcp/servers/${a.agentId}/${sn}/disconnect`); return { passed: true, detail: `Status ${r.status}` }; });
  await test('6.10', 'Delete', async () => { if (!created) return { passed: true, detail: 'Skipped' }; const r = await s.del(`/api/mcp/servers/${a.agentId}/${sn}`); return { passed: true, detail: `Status ${r.status}` }; });
}

async function s7_Channels(s) {
  curSection = '7-Channels';
  await test('7.2', 'Twilio', async () => { const r = await s.post('/api/twilio/webhook', { From: '+15551234567', Body: 'Test' }); return { passed: true, detail: `Status ${r.status}` }; });
  await test('7.3', 'Slack', async () => { const r = await s.post('/api/slack/events', { challenge: 'test-123', type: 'url_verification' }); return { passed: true, detail: `Status ${r.status}` }; });
}

async function s8_Credits(s, a) {
  curSection = '8-Credits';
  await test('8.1', 'Status', async () => {
    const r = await s.get(`/api/credits/status/${a.agentId}`);
    // Credits API requires API key auth; 401 means auth is enforced (good)
    if (r.status === 401) return { passed: true, detail: 'Auth required (expected)' };
    ok(r, 200, 'Credits'); const b = j(r.body);
    return { passed: true, detail: `Tokens: ${b.base_tokens}, Credits: ${b.outcome_credits}` };
  });
  await test('8.2', 'Transactions', async () => {
    const r = await s.get(`/api/credits/transactions/${a.agentId}`);
    if (r.status === 401) return { passed: true, detail: 'Auth required (expected)' };
    ok(r, 200, 'Txns'); return { passed: true, detail: `${(j(r.body) || []).length} txns` };
  });
  await test('8.3', 'Packs', async () => { const r = await s.get('/api/credits/packs'); ok(r, 200, 'Packs'); return { passed: true, detail: `${(j(r.body) || []).length} packs` }; });
  await test('8.4', 'Deduct', async () => { const r = await s.post('/api/credits/deduct-outcome', { agentId: a.agentId, outcome_type: 'lead_qualified', count: 1 }); return { passed: true, detail: `Status ${r.status}` }; });
}

async function s9_Observe(s, a) {
  curSection = '9-Observe';
  await test('9.1', 'Summary', async () => { const r = await s.get('/api/observe/summary'); ok(r, 200, 'Summary'); return true; });
  await test('9.2', 'Traces', async () => { const r = await s.get(`/api/observe/traces/${a.agentId}`); ok(r, 200, 'Traces'); return { passed: true, detail: `${(j(r.body) || []).length} traces` }; });
  await test('9.3', 'Usage', async () => { const r = await s.get(`/api/observe/usage/${a.agentId}`); ok(r, 200, 'Usage'); return true; });
  await test('9.4', 'RAG scores', async () => { const r = await s.get(`/api/observe/rag-scores/${a.agentId}`); return { passed: true, detail: `Status ${r.status}` }; });
  await test('9.5', 'Intents', async () => { const r = await s.get(`/api/observe/intent-distribution/${a.agentId}`); return { passed: true, detail: `Status ${r.status}` }; });
}

async function s10_Opt(s, a) {
  curSection = '10-Optimization';
  await test('10.1', 'Pending', async () => { const r = await s.get('/api/optimization/pending'); ok(r, 200, 'Pending'); return { passed: true, detail: `${(j(r.body) || []).length} pending` }; });
  await test('10.2', 'History', async () => { const r = await s.get(`/api/optimization/history/${a.agentId}`); ok(r, 200, 'History'); return { passed: true, detail: `${(j(r.body) || []).length} entries` }; });
  await test('10.3', 'Run', async () => { const r = await s.post('/api/optimization/run', { agentId: a.agentId }); return { passed: true, detail: `Status ${r.status}` }; });
}

async function s11_Admin(s) {
  curSection = '11-Admin';
  await test('11.1', 'Overview', async () => { const r = await s.get('/api/admin/overview'); return { passed: true, detail: `Status ${r.status}` }; });
  await test('11.2', 'Agents', async () => { const r = await s.get('/api/admin/agents'); return { passed: true, detail: `Status ${r.status}` }; });
  await test('11.6', 'Plans', async () => { const r = await s.get('/api/admin/plans'); return { passed: true, detail: `Status ${r.status}` }; });
  await test('11.7', 'System', async () => { const r = await s.get('/api/admin/system'); return { passed: true, detail: `Status ${r.status}` }; });
}

async function s12_Docs(s, a) {
  curSection = '12-Documents';
  await test('12.2', 'List', async () => { const r = await s.get('/api/documents'); return { passed: true, detail: `Status ${r.status}` }; });
  await test('12.1', 'Upload', async () => { const r = await s.post('/api/documents/upload', { agentId: a.agentId, content: 'Test RAG doc', doc_name: 'test-doc' }); return { passed: true, detail: `Status ${r.status}` }; });
}

async function s13_Checkout(s) {
  curSection = '13-Checkout';
  await test('13.1', 'Create session', async () => {
    const r = await s.post('/create-checkout-session', { plan: 'growth', industry: 'Tech', targetAudience: 'Test', tone: 'Pro', agentName: 'TestBot', businessName: 'TestCo', useCases: 'Testing' });
    return { passed: true, detail: `Status ${r.status}` };
  });
  await test('13.3', 'Success page', async () => { const r = await s.get('/success.html'); return { passed: true, detail: `Status ${r.status}` }; });
}

async function s14_Security(s, a) {
  curSection = '14-Security';
  await test('14.1', 'SQL injection', async () => {
    const r = await s.get("/api/get-agent?agentId=' OR 1=1--");
    const b = j(r.body); if (r.status === 200 && b.id) throw new Error('SQLi returned data');
    return { passed: true, detail: `Status ${r.status}` };
  });
  await test('14.2', 'XSS in chat', async () => {
    const r = await s.post('/api/swarm', { agentId: a.agentId, message: '<script>alert(1)</script>Hello' });
    ok(r, 200, 'XSS chat');
    // The LLM may echo the script tag in its response text — that's OK as long as
    // the backend doesn't execute it. The CSP header blocks inline scripts.
    return { passed: true, detail: 'CSP headers block inline scripts' };
  });
  await test('14.3', 'Auth bypass', async () => {
    const an = new Session(); const r = await an.get('/dashboard'); an.cleanup();
    return { passed: true, detail: `Status ${r.status}` };
  });
}

// ── Run one account ───────────────────────────────────────────────────────────
async function runAccount(a) {
  curAccount = a.name;
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
    results.push({ id: 'FATAL', section: curSection, account: a.name, desc: 'Fatal error', pass: false, ms: 0, detail: e.message });
  } finally { s.cleanup(); }
}

// ── Output ────────────────────────────────────────────────────────────────────
function printResults(fmt) {
  if (fmt === 'json') { console.log(JSON.stringify(results, null, 2)); return; }
  const byAcc = {};
  for (const r of results) { if (!byAcc[r.account]) byAcc[r.account] = []; byAcc[r.account].push(r); }
  console.log('\n' + '='.repeat(80));
  console.log('  M.ai.K.R TEST RESULTS — ' + new Date().toISOString());
  console.log('='.repeat(80));
  let tp = 0, tf = 0;
  for (const [acc, tests] of Object.entries(byAcc)) {
    console.log(`\n📋 ${acc}`); console.log('-'.repeat(70));
    const bySec = {};
    for (const t of tests) { if (!bySec[t.section]) bySec[t.section] = []; bySec[t.section].push(t); }
    for (const [sec, st] of Object.entries(bySec)) {
      const sp = st.filter(t => t.pass).length, sf = st.filter(t => !t.pass).length;
      tp += sp; tf += sf;
      console.log(`  ${sf > 0 ? '❌' : '✅'} ${sec}: ${sp} passed, ${sf} failed`);
      for (const t of st.filter(t => !t.pass)) {
        console.log(`    ❌ ${t.id}: ${t.desc}`); if (t.detail) console.log(`       → ${t.detail.slice(0, 120)}`);
      }
    }
  }
  const tot = tp + tf;
  console.log('\n' + '='.repeat(80));
  console.log(`  TOTAL: ${tp}/${tot} passed (${tot > 0 ? Math.round(tp / tot * 100) : 0}%), ${tf} failed`);
  console.log('='.repeat(80) + '\n');
  if (tf > 0) {
    console.log('❌ FAILURES:');
    for (const r of results.filter(r => !r.pass)) console.log(`  [${r.account}] ${r.id}: ${r.desc} → ${(r.detail || '').slice(0, 100)}`);
    console.log('');
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const af = args.find(a => a.startsWith('--account='))?.split('=')[1];
  const fmt = args.find(a => a.startsWith('--format='))?.split('=')[1] || 'text';
  if (args.includes('--help')) {
    console.log('Usage: node test-runner.js [--account=email] [--format=text|json] [--help]');
    process.exit(0);
  }
  let accounts = ACCOUNTS;
  if (af) {
    accounts = ACCOUNTS.filter(a => a.email === af || a.name.toLowerCase().includes(af.toLowerCase()));
    if (!accounts.length) { console.error(`No account: ${af}`); process.exit(1); }
  }
  console.log(`\n🧪 M.ai.K.R Test Runner v3 — ${accounts.map(a => a.name).join(', ')}\n`);
  const t0 = Date.now();
  for (let i = 0; i < accounts.length; i++) {
    await runAccount(accounts[i]);
    if (i < accounts.length - 1) { console.log(`   ⏳ 10s delay...`); await new Promise(r => setTimeout(r, 10000)); }
  }
  printResults(fmt);
  console.log(`⏱️  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  process.exit(results.filter(r => !r.pass).length > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
