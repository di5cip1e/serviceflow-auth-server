/**
 * MCP Routes — CRUD and runtime management for MCP server connections.
 * Mounted at /api/mcp/*
 */
const express = require('express');
const router = express.Router();
const mcpClient = require('./client');
const mcpRegistry = require('./registry');

// ── GET /api/mcp/templates — list preset MCP server templates
router.get('/templates', (req, res) => {
  res.json(mcpRegistry.templates || {});
});

// ── GET /api/mcp/servers/:agentId — list servers for an agent
router.get('/servers/:agentId', async (req, res) => {
  try {
    const servers = await mcpRegistry.listServers(req.params.agentId);
    const active = mcpClient.getActiveServers();
    const enriched = servers.map((s) => ({
      ...s,
      connected: active.includes(s.server_name),
      toolCount: mcpRegistry.getToolsForAgent(req.params.agentId).filter(
        (t) => mcpRegistry._inferServerName(req.params.agentId, t.name) === s.server_name
      ).length,
    }));
    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/mcp/servers — add a new server config
router.post('/servers', async (req, res) => {
  const { agentId, serverName, command, args, envVars } = req.body;
  if (!agentId || !serverName || !command) {
    return res.status(400).json({ error: 'agentId, serverName, and command are required' });
  }
  try {
    const result = await mcpRegistry.addServer(agentId, serverName, command, args, envVars);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── DELETE /api/mcp/servers/:agentId/:serverName — remove and disconnect a server
router.delete('/servers/:agentId/:serverName', async (req, res) => {
  try {
    await mcpRegistry.removeServer(req.params.agentId, req.params.serverName);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/mcp/servers/:agentId/:serverName/connect — connect and cache tools
router.post('/servers/:agentId/:serverName/connect', async (req, res) => {
  const { agentId, serverName } = req.params;
  try {
    const servers = await mcpRegistry.listServers(agentId);
    const s = servers.find((x) => x.server_name === serverName);
    if (!s) return res.status(404).json({ error: 'Server config not found' });

    const parsedArgs = JSON.parse(s.args);
    const parsedEnv = JSON.parse(s.env_vars);

    await mcpClient.connect(serverName, s.command, parsedArgs, parsedEnv);
    const tools = await mcpClient.listTools(serverName);
    mcpRegistry.cacheTools(agentId, serverName, tools);

    res.json({ connected: true, serverName, toolCount: tools.length, tools });
  } catch (e) {
    res.status(500).json({ error: `Connection failed: ${e.message}` });
  }
});

// ── POST /api/mcp/servers/:agentId/:serverName/disconnect — disconnect a server
router.post('/servers/:agentId/:serverName/disconnect', async (req, res) => {
  const { agentId, serverName } = req.params;
  try {
    mcpClient.disconnect(serverName);
    mcpRegistry.clearAgentTools(agentId, serverName);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/mcp/servers/:agentId/:serverName/test — test connection by listing tools
router.post('/servers/:agentId/:serverName/test', async (req, res) => {
  const { agentId, serverName } = req.params;
  try {
    // Ensure connected
    if (!mcpClient.getActiveServers().includes(serverName)) {
      const servers = await mcpRegistry.listServers(agentId);
      const s = servers.find((x) => x.server_name === serverName);
      if (!s) return res.status(404).json({ error: 'Server config not found' });
      await mcpClient.connect(serverName, s.command, JSON.parse(s.args), JSON.parse(s.env_vars));
      const tools = await mcpClient.listTools(serverName);
      mcpRegistry.cacheTools(agentId, serverName, tools);
    }
    const tools = await mcpClient.listTools(serverName);
    res.json({ serverName, toolCount: tools.length, tools });
  } catch (e) {
    res.status(500).json({ error: `Test failed: ${e.message}` });
  }
});

// ── GET /api/mcp/servers/:agentId/tools — get OpenAI-format tools for an agent
router.get('/servers/:agentId/tools', async (req, res) => {
  const { agentId } = req.params;
  try {
    // Ensure all enabled servers are loaded
    await mcpRegistry.loadServersForAgent(agentId);
    const tools = mcpRegistry.buildToolsSchema(agentId);
    res.json({ agentId, toolCount: tools.length, tools });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/mcp/servers/:agentId/:serverName/call — call a specific MCP tool
// Body: { toolName, arguments }
router.post('/servers/:agentId/:serverName/call', async (req, res) => {
  const { agentId, serverName } = req.params;
  const { toolName, arguments: toolArgs } = req.body;
  if (!toolName) return res.status(400).json({ error: 'toolName is required' });
  try {
    const result = await mcpClient.callTool(serverName, toolName, toolArgs || {});
    res.json({ serverName, toolName, result });
  } catch (e) {
    res.status(500).json({ error: `Tool call failed: ${e.message}` });
  }
});

module.exports = router;
