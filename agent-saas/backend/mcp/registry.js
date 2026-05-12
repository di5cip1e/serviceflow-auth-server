/**
 * MCPRegistry — per-agent MCP server configuration and tool cache.
 * Each agent can have its own set of connected MCP servers.
 */
const path = require('path');
const db = require('../database');

const MCP_TEMPLATES = {
  github: {
    name: 'GitHub',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    envVars: { GITHUB_PERSONAL_ACCESS_TOKEN: '' },
    description: 'Search repos, manage issues, read/write code',
  },
  filesystem: {
    name: 'Filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
    envVars: {},
    description: 'Read and write local files',
  },
  notion: {
    name: 'Notion',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-notion'],
    envVars: { NOTION_API_KEY: '' },
    description: 'Search and interact with Notion pages',
  },
  slack: {
    name: 'Slack',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-slack'],
    envVars: { SLACK_BOT_TOKEN: '', SLACK_TEAM_ID: '' },
    description: 'Post messages and manage channels',
  },
  'aws-kb': {
    name: 'AWS Knowledge Base',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-aws-kb'],
    envVars: { AWS_ACCESS_KEY_ID: '', AWS_SECRET_ACCESS_KEY: '', AWS_REGION: 'us-east-1' },
    description: 'Query AWS Bedrock Knowledge Bases',
  },
};

class MCPRegistry {
  constructor() {
    // toolsCache: agentId -> serverName -> [toolDefs]
    this.toolsCache = new Map();
  }

  /**
   * Add or update an MCP server config for an agent.
   */
  async addServer(agentId, serverName, command, args, envVars) {
    const argsJson = JSON.stringify(args || []);
    const envJson = JSON.stringify(envVars || {});
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO mcp_servers (agent_id, server_name, command, args, env_vars, enabled)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [agentId, serverName, command, argsJson, envJson],
        (err) => { if (err) return reject(err); resolve({ agentId, serverName }); }
      );
    });
  }

  /**
   * Remove an MCP server config and disconnect it.
   */
  async removeServer(agentId, serverName) {
    const mcpClient = require('./client');
    try { mcpClient.disconnect(serverName); } catch {}
    this.clearAgentTools(agentId, serverName);
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM mcp_servers WHERE agent_id = ? AND server_name = ?`,
        [agentId, serverName],
        (err) => { if (err) return reject(err); resolve(true); }
      );
    });
  }

  /**
   * List all MCP servers configured for an agent.
   */
  async listServers(agentId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM mcp_servers WHERE agent_id = ?`,
        [agentId],
        (err, rows) => { if (err) return reject(err); resolve(rows || []); }
      );
    });
  }

  /**
   * Enable or disable a server (without disconnecting the active process).
   */
  async setEnabled(agentId, serverName, enabled) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE mcp_servers SET enabled = ? WHERE agent_id = ? AND server_name = ?`,
        [enabled ? 1 : 0, agentId, serverName],
        (err) => { if (err) return reject(err); resolve(true); }
      );
    });
  }

  /**
   * Connect all ENABLED servers for an agent and cache their tools.
   */
  async loadServersForAgent(agentId) {
    const servers = await this.listServers(agentId);
    const mcpClient = require('./client');
    for (const s of servers) {
      if (!s.enabled) continue;
      if (mcpClient.getActiveServers().includes(s.server_name)) continue;
      try {
        await mcpClient.connect(s.server_name, s.command, JSON.parse(s.args), JSON.parse(s.env_vars));
        const tools = await mcpClient.listTools(s.server_name);
        this.cacheTools(agentId, s.server_name, tools);
      } catch (err) {
        console.error(`[MCP] Failed to connect ${s.server_name} for agent ${agentId}:`, err.message);
      }
    }
  }

  /**
   * Cache tool definitions for a specific agent + server.
   */
  cacheTools(agentId, serverName, tools) {
    if (!this.toolsCache.has(agentId)) this.toolsCache.set(agentId, new Map());
    this.toolsCache.get(agentId).set(serverName, tools);
  }

  /**
   * Clear cached tools for an agent + server.
   */
  clearAgentTools(agentId, serverName) {
    const agentCache = this.toolsCache.get(agentId);
    if (agentCache) agentCache.delete(serverName);
  }

  /**
   * Get all cached tools for an agent (aggregated from all connected servers).
   */
  getToolsForAgent(agentId) {
    const agentCache = this.toolsCache.get(agentId);
    if (!agentCache) return [];
    const all = [];
    for (const [, tools] of agentCache) all.push(...tools);
    return all;
  }

  /**
   * Build OpenAI-compatible function-calling schema from cached MCP tools.
   * Tool names are namespaced: mcp_{serverName}_{originalName}
   */
  buildToolsSchema(agentId) {
    const tools = this.getToolsForAgent(agentId);
    return tools.map((tool) => {
      const serverName = this._inferServerName(agentId, tool.name);
      const prefixedName = `mcp_${serverName}_${tool.name}`;
      const description = tool.description || `MCP tool: ${tool.name}`;
      let parameters = { type: 'object', properties: {}, required: [] };

      if (tool.inputSchema) {
        // Handle both object-style and string-style schemas
        let schema = tool.inputSchema;
        if (typeof schema === 'string') {
          try { schema = JSON.parse(schema); } catch { schema = {}; }
        }
        if (schema.type === 'object' && schema.properties) {
          parameters.properties = Object.fromEntries(
            Object.entries(schema.properties).map(([k, v]) => {
              // Normalize to OpenAI parameter format
              const param = { type: v.type || 'string', description: v.description || '' };
              return [k, param];
            })
          );
          parameters.required = schema.required || [];
        }
      }

      return {
        type: 'function',
        function: {
          name: prefixedName,
          description,
          parameters,
        },
      };
    });
  }

  _inferServerName(agentId, toolName) {
    // Find which server a tool belongs to by looking in cache
    const agentCache = this.toolsCache.get(agentId);
    if (!agentCache) return 'unknown';
    for (const [serverName, tools] of agentCache) {
      if (tools.find((t) => t.name === toolName)) return serverName;
    }
    return 'unknown';
  }

  static templates() {
    return MCP_TEMPLATES;
  }
}

module.exports = new MCPRegistry();
module.exports.templates = MCP_TEMPLATES;
