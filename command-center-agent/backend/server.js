const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3003;
const DATA_FILE = path.join(__dirname, '..', 'data', 'status.json');
const WSPATH = '/root/.openclaw/workspace';

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

// ── State ──────────────────────────────────────────────────────────────────

function defaultState() {
  return {
    agents: {
      director:  { name: 'The Director', alias: 'Director', emoji: '🎬', status: 'idle', currentTask: null, planned: [], done: [], color: '#C0A060' },
      hermes:    { name: 'Hermes', alias: 'V', emoji: '⚡', status: 'idle', currentTask: null, planned: [], done: [], color: '#0040A0' },
      enlillian: { name: 'Enlillian', alias: 'OWL', emoji: '🦉', status: 'idle', currentTask: null, planned: [], done: [], color: '#804020' },
    },
    messages: [],
    roundTable: { active: false, topic: null, startedAt: null },
    projects: {}, files: {}, tasks: {}, goals: {}, warMaps: {},
  };
}

function loadState() {
  try {
    const s = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const d = defaultState();
    // Only keep known agents from saved state (prevents phantom entries like "owl")
    const validKeys = Object.keys(d.agents);
    const savedAgents = {};
    for (const k of validKeys) { if (s.agents && s.agents[k]) savedAgents[k] = s.agents[k]; }
    return { ...d, ...s, agents: { ...d.agents, ...savedAgents }, projects: s.projects||{}, files: s.files||{}, tasks: s.tasks||{}, goals: s.goals||{}, warMaps: s.warMaps||{} };
  } catch { return defaultState(); }
}

function saveState(st) { fs.writeFileSync(DATA_FILE, JSON.stringify(st, null, 2)); }
let state = loadState();

// ── Parse JSON ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES (before static so they take priority)
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/state', (req, res) => res.json(state));

app.post('/api/agents/:agentId/status', (req, res) => {
  const { agentId } = req.params;
  const b = req.body;
  // Reject unknown agent IDs to prevent phantom entries (e.g. "owl" vs "enlillian")
  const validAgents = Object.keys(defaultState().agents);
  if (!validAgents.includes(agentId)) return res.status(404).json({ error: `Unknown agent "${agentId}". Valid: ${validAgents.join(', ')}` });
  const a = state.agents[agentId];
  if (b.status) a.status = b.status;
  if (b.currentTask !== undefined) a.currentTask = b.currentTask;
  if (b.planned) a.planned = b.planned;
  if (b.done) a.done = b.done;
  if (b.appendDone) a.done.unshift({ task: b.appendDone, at: new Date().toISOString() });
  if (b.prependPlanned) a.planned.unshift({ task: b.prependPlanned, at: new Date().toISOString() });
  a.lastSeen = new Date().toISOString();
  saveState(state);
  broadcast({ type: 'agentUpdate', agentId, agent: a });
  res.json({ ok: true });
});

app.post('/api/messages', (req, res) => {
  const { from, to, text } = req.body;
  const msg = { id: Date.now().toString(36), from, to, text, at: new Date().toISOString() };
  state.messages.push(msg);
  if (state.messages.length > 200) state.messages = state.messages.slice(-200);
  saveState(state);
  broadcast({ type: 'newMessage', message: msg });
  res.json({ ok: true, id: msg.id });
});

app.post('/api/roundtable/start', (req, res) => {
  state.roundTable = { active: true, topic: req.body.topic || 'Open Discussion', startedAt: new Date().toISOString() };
  saveState(state);
  broadcast({ type: 'roundTableStart', roundTable: state.roundTable });
  res.json({ ok: true });
});

app.post('/api/roundtable/end', (req, res) => {
  state.roundTable = { active: false, topic: null, startedAt: null };
  saveState(state);
  broadcast({ type: 'roundTableEnd' });
  res.json({ ok: true });
});

// Projects
app.get('/api/projects', (req, res) => res.json(state.projects));

app.post('/api/projects', (req, res) => {
  const { name, description, assignedTo } = req.body;
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  state.projects[id] = { id, name, description: description||'', assignedTo: assignedTo||[], status: 'active', createdAt: new Date().toISOString(), createdBy: 'derek' };
  state.files[id] = []; state.tasks[id] = []; state.goals[id] = []; state.warMaps[id] = { phases: [] };
  saveState(state);
  broadcast({ type: 'projectUpdate', projectId: id, project: state.projects[id] });
  res.json({ ok: true, id, project: state.projects[id] });
});

app.post('/api/projects/:projectId', (req, res) => {
  const p = state.projects[req.params.projectId]; if (!p) return res.status(404).json({ error: 'Not found' });
  if (req.body.name) p.name = req.body.name;
  if (req.body.description !== undefined) p.description = req.body.description;
  if (req.body.status) p.status = req.body.status;
  if (req.body.assignedTo) p.assignedTo = req.body.assignedTo;
  saveState(state);
  broadcast({ type: 'projectUpdate', projectId: req.params.projectId, project: p });
  res.json({ ok: true, project: p });
});

app.delete('/api/projects/:projectId', (req, res) => {
  const id = req.params.projectId;
  delete state.projects[id]; delete state.files[id]; delete state.tasks[id]; delete state.goals[id]; delete state.warMaps[id];
  saveState(state); broadcast({ type: 'projectDelete', projectId: id }); res.json({ ok: true });
});

// Files
app.post('/api/projects/:projectId/files', (req, res) => {
  const { projectId } = req.params; const { name, path: fpath, agent } = req.body;
  if (!state.projects[projectId]) return res.status(404).json({ error: 'Project not found' });
  if (!state.files[projectId]) state.files[projectId] = [];
  const file = { id: Date.now().toString(36), name, path: fpath, agent: agent||'unknown', createdAt: new Date().toISOString(), size: 0 };
  try { file.size = fs.statSync(fpath).size; } catch {}
  state.files[projectId].push(file); saveState(state);
  broadcast({ type: 'fileUpdate', projectId, file }); res.json({ ok: true, file });
});

app.get('/api/projects/:projectId/files', (req, res) => res.json(state.files[req.params.projectId] || []));

app.get('/api/files/read', (req, res) => {
  const fp = req.query.path; if (!fp) return res.status(400).json({ error: 'path required' });
  const r = path.resolve(fp);
  if (!r.startsWith(WSPATH) && !r.startsWith('/root')) return res.status(403).json({ error: 'Access denied' });
  try { res.json({ content: fs.readFileSync(r, 'utf8'), path: r }); } catch (e) { res.status(404).json({ error: e.message }); }
});

// Tasks
app.get('/api/projects/:projectId/tasks', (req, res) => res.json(state.tasks[req.params.projectId] || []));

app.post('/api/projects/:projectId/tasks', (req, res) => {
  const { projectId } = req.params; const { text, agent } = req.body;
  if (!state.projects[projectId]) return res.status(404).json({ error: 'Project not found' });
  if (!state.tasks[projectId]) state.tasks[projectId] = [];
  const task = { id: Date.now().toString(36), text, done: false, agent: agent||null, createdAt: new Date().toISOString() };
  state.tasks[projectId].push(task); saveState(state);
  broadcast({ type: 'taskUpdate', projectId, task }); res.json({ ok: true, task });
});

app.post('/api/projects/:projectId/tasks/:taskId', (req, res) => {
  const tasks = (state.tasks[req.params.projectId] || []);
  const task = tasks.find(t => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (req.body.done !== undefined) task.done = req.body.done;
  if (req.body.text) task.text = req.body.text;
  task.updatedAt = new Date().toISOString(); saveState(state);
  broadcast({ type: 'taskUpdate', projectId: req.params.projectId, task }); res.json({ ok: true, task });
});

app.delete('/api/projects/:projectId/tasks/:taskId', (req, res) => {
  if (!state.tasks[req.params.projectId]) return res.status(404).json({ error: 'Not found' });
  state.tasks[req.params.projectId] = state.tasks[req.params.projectId].filter(t => t.id !== req.params.taskId);
  saveState(state); broadcast({ type: 'taskDelete', projectId: req.params.projectId, taskId: req.params.taskId }); res.json({ ok: true });
});

// Goals
app.get('/api/projects/:projectId/goals', (req, res) => res.json(state.goals[req.params.projectId] || []));

app.post('/api/projects/:projectId/goals', (req, res) => {
  const { projectId } = req.params;
  const { title, description, target, unit, agent, milestones } = req.body;
  if (!state.projects[projectId]) return res.status(404).json({ error: 'Project not found' });
  if (!state.goals[projectId]) state.goals[projectId] = [];
  const goal = { id: Date.now().toString(36), title, description: description||'', progress: 0, target: target||100, unit: unit||'%', agent: agent||null, status: 'active', milestones: milestones||[], createdAt: new Date().toISOString() };
  state.goals[projectId].push(goal); saveState(state);
  broadcast({ type: 'goalUpdate', projectId, goal }); res.json({ ok: true, goal });
});

app.post('/api/projects/:projectId/goals/:goalId', (req, res) => {
  const goals = (state.goals[req.params.projectId] || []);
  const goal = goals.find(g => g.id === req.params.goalId);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });
  const b = req.body;
  if (b.progress !== undefined) goal.progress = Math.min(b.progress, goal.target||100);
  if (b.status) goal.status = b.status;
  if (b.title) goal.title = b.title;
  if (b.description !== undefined) goal.description = b.description;
  if (b.target) goal.target = b.target;
  if (b.unit) goal.unit = b.unit;
  if (b.agent !== undefined) goal.agent = b.agent;
  if (b.milestones) goal.milestones = b.milestones;
  if (b.addMilestone) goal.milestones.push({ id: Date.now().toString(36), text: b.addMilestone, done: false, createdAt: new Date().toISOString() });
  goal.updatedAt = new Date().toISOString(); saveState(state);
  broadcast({ type: 'goalUpdate', projectId: req.params.projectId, goal }); res.json({ ok: true, goal });
});

app.post('/api/projects/:projectId/goals/:goalId/milestones/:milestoneId', (req, res) => {
  const goals = (state.goals[req.params.projectId] || []);
  const goal = goals.find(g => g.id === req.params.goalId);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });
  const ms = goal.milestones.find(m => m.id === req.params.milestoneId);
  if (!ms) return res.status(404).json({ error: 'Milestone not found' });
  if (req.body.done !== undefined) ms.done = req.body.done;
  if (req.body.text) ms.text = req.body.text;
  if (goal.milestones.length > 0) {
    const dc = goal.milestones.filter(m => m.done).length;
    goal.progress = Math.round((dc / goal.milestones.length) * (goal.target||100));
    if (dc === goal.milestones.length) goal.status = 'completed';
    else if (goal.status === 'completed') goal.status = 'active';
  }
  goal.updatedAt = new Date().toISOString(); saveState(state);
  broadcast({ type: 'goalUpdate', projectId: req.params.projectId, goal }); res.json({ ok: true, goal });
});

app.delete('/api/projects/:projectId/goals/:goalId', (req, res) => {
  if (!state.goals[req.params.projectId]) return res.status(404).json({ error: 'Not found' });
  state.goals[req.params.projectId] = state.goals[req.params.projectId].filter(g => g.id !== req.params.goalId);
  saveState(state); broadcast({ type: 'goalDelete', projectId: req.params.projectId, goalId: req.params.goalId }); res.json({ ok: true });
});

// War Map
app.get('/api/projects/:projectId/warmap', (req, res) => res.json(state.warMaps[req.params.projectId] || { phases: [] }));

app.post('/api/projects/:projectId/warmap/phases', (req, res) => {
  const { projectId } = req.params; const { name, description, agent } = req.body;
  if (!state.projects[projectId]) return res.status(404).json({ error: 'Project not found' });
  if (!state.warMaps[projectId]) state.warMaps[projectId] = { phases: [] };
  const phases = state.warMaps[projectId].phases;
  const phase = { id: Date.now().toString(36), name, description: description||'', order: phases.length, status: 'pending', agent: agent||null, steps: [], createdAt: new Date().toISOString() };
  phases.push(phase); saveState(state);
  broadcast({ type: 'warMapUpdate', projectId, phase }); res.json({ ok: true, phase });
});

app.post('/api/projects/:projectId/warmap/phases/:phaseId', (req, res) => {
  const phases = (state.warMaps[req.params.projectId]||{phases:[]}).phases;
  const phase = phases.find(p => p.id === req.params.phaseId);
  if (!phase) return res.status(404).json({ error: 'Phase not found' });
  const b = req.body;
  if (b.name) phase.name = b.name;
  if (b.description !== undefined) phase.description = b.description;
  if (b.status) phase.status = b.status;
  if (b.agent !== undefined) phase.agent = b.agent;
  if (b.order !== undefined) phase.order = b.order;
  phase.updatedAt = new Date().toISOString(); saveState(state);
  broadcast({ type: 'warMapUpdate', projectId: req.params.projectId, phase }); res.json({ ok: true, phase });
});

app.post('/api/projects/:projectId/warmap/phases/:phaseId/steps', (req, res) => {
  const phases = (state.warMaps[req.params.projectId]||{phases:[]}).phases;
  const phase = phases.find(p => p.id === req.params.phaseId);
  if (!phase) return res.status(404).json({ error: 'Phase not found' });
  const step = { id: Date.now().toString(36), text: req.body.text, done: false, agent: req.body.agent||null, createdAt: new Date().toISOString() };
  phase.steps.push(step); saveState(state);
  broadcast({ type: 'warMapStepUpdate', projectId: req.params.projectId, phaseId: req.params.phaseId, step }); res.json({ ok: true, step });
});

app.post('/api/projects/:projectId/warmap/phases/:phaseId/steps/:stepId', (req, res) => {
  const phases = (state.warMaps[req.params.projectId]||{phases:[]}).phases;
  const phase = phases.find(p => p.id === req.params.phaseId);
  if (!phase) return res.status(404).json({ error: 'Phase not found' });
  const step = phase.steps.find(s => s.id === req.params.stepId);
  if (!step) return res.status(404).json({ error: 'Step not found' });
  if (req.body.done !== undefined) step.done = req.body.done;
  if (req.body.text) step.text = req.body.text;
  if (phase.steps.length > 0) {
    const dc = phase.steps.filter(s => s.done).length;
    phase.status = dc === phase.steps.length ? 'completed' : dc > 0 ? 'active' : 'pending';
  }
  saveState(state); broadcast({ type: 'warMapStepUpdate', projectId: req.params.projectId, phaseId: req.params.phaseId, step }); res.json({ ok: true, step });
});

app.delete('/api/projects/:projectId/warmap/phases/:phaseId', (req, res) => {
  if (!state.warMaps[req.params.projectId]) return res.status(404).json({ error: 'Not found' });
  state.warMaps[req.params.projectId].phases = state.warMaps[req.params.projectId].phases.filter(p => p.id !== req.params.phaseId);
  saveState(state); broadcast({ type: 'warMapPhaseDelete', projectId: req.params.projectId, phaseId: req.params.phaseId }); res.json({ ok: true });
});

app.delete('/api/projects/:projectId/warmap/phases/:phaseId/steps/:stepId', (req, res) => {
  const phases = (state.warMaps[req.params.projectId]||{phases:[]}).phases;
  const phase = phases.find(p => p.id === req.params.phaseId);
  if (!phase) return res.status(404).json({ error: 'Phase not found' });
  phase.steps = phase.steps.filter(s => s.id !== req.params.stepId);
  saveState(state); broadcast({ type: 'warMapStepDelete', projectId: req.params.projectId, phaseId: req.params.phaseId, stepId: req.params.stepId }); res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// STATIC FILES (after all API routes)
// ═══════════════════════════════════════════════════════════════════════════
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── WebSocket ──────────────────────────────────────────────────────────────

function broadcast(data) {
  const p = JSON.stringify(data);
  wss.clients.forEach(c => { if (c.readyState === 1) c.send(p); });
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'init', state }));
  ws.on('message', (raw) => { try { const d = JSON.parse(raw); if (d.type === 'ping') ws.send(JSON.stringify({ type: 'pong' })); } catch {} });
});

// ── Start ──────────────────────────────────────────────────────────────────

server.listen(PORT, '0.0.0.0', () => console.log(`Command Center on ${PORT}`));
