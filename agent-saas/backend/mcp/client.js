const { spawn } = require('child_process');

class MCPClient {
  constructor() {
    this.processes = new Map(); // serverName -> { proc, pending: Map(id->{resolve,reject}), counter: 0 }
    this.cachedTools = new Map(); // serverName -> tools array
    this.maxServers = 5;
  }

  async connect(serverName, command, args = [], env = {}) {
    if (this.processes.has(serverName)) {
      await this.disconnect(serverName);
    }

    // Prevent resource exhaustion
    if (this.processes.size >= this.maxServers) {
      throw new Error(`Maximum MCP server connections (${this.maxServers}) reached. Disconnect a server before adding a new one.`);
    }

    const spawnEnv = { ...process.env, ...env };
    const proc = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'], env: spawnEnv });

    const serverState = {
      proc,
      pending: new Map(),
      counter: 0,
      buffer: ''
    };

    this.processes.set(serverName, serverState);

    proc.stdout.on('data', (data) => {
      serverState.buffer += data.toString();
      let lines = serverState.buffer.split('\n');
      serverState.buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const message = JSON.parse(line);
          if (message.id !== undefined) {
            const pending = serverState.pending.get(message.id);
            if (pending) {
              serverState.pending.delete(message.id);
              if (message.error) {
                pending.reject(new Error(message.error.message || 'Unknown MCP error'));
              } else {
                pending.resolve(message.result);
              }
            }
          }
        } catch (err) {
          console.error(`[MCP][${serverName}] Failed to parse JSON:`, line, err);
        }
      }
    });

    proc.stderr.on('data', (data) => {
      console.error(`[MCP][${serverName}] stderr:`, data.toString());
    });

    proc.on('close', (code) => {
      console.log(`[MCP][${serverName}] process exited with code ${code}`);
      // Attempt reconnect if not intentionally disconnected
      if (this.processes.has(serverName)) {
        const state = this.processes.get(serverName);
        if (!state.intentionalDisconnect && (state.reconnectAttempts || 0) < 3) {
          state.reconnectAttempts = (state.reconnectAttempts || 0) + 1;
          const delay = 1000 * Math.pow(2, state.reconnectAttempts - 1);
          console.log(`[MCP][${serverName}] Reconnecting in ${delay}ms (attempt ${state.reconnectAttempts})`);
          setTimeout(() => {
            if (state.lastCommand && state.lastEnv) {
              this.connect(serverName, state.lastCommand, state.lastArgs || [], state.lastEnv)
                .catch(e => console.error(`[MCP][${serverName}] Reconnect failed:`, e.message));
            }
          }, delay);
        } else {
          this.processes.delete(serverName);
          this.cachedTools.delete(serverName);
        }
      }
    });

    // Store for reconnect
    serverState.intentionalDisconnect = false;
    serverState.lastCommand = command;
    serverState.lastArgs = args;
    serverState.lastEnv = env;

    // 1. Initialize
    const initResult = await this.sendRequest(serverName, 'initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'maikr', version: '1.0.0' }
    });

    // 2. Initialized notification
    this.sendNotification(serverName, 'notifications/initialized');

    return initResult;
  }

  async sendRequest(serverName, method, params = {}) {
    const server = this.processes.get(serverName);
    if (!server) throw new Error(`Server ${serverName} not connected`);

    const id = ++server.counter;
    const request = { jsonrpc: '2.0', id, method, params };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (server.pending.has(id)) {
          server.pending.delete(id);
          reject(new Error(`MCP request timeout: ${method}`));
        }
      }, 30000);

      server.pending.set(id, {
        resolve: (val) => {
          clearTimeout(timeout);
          resolve(val);
        },
        reject: (err) => {
          clearTimeout(timeout);
          reject(err);
        }
      });

      server.proc.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  sendNotification(serverName, method, params = {}) {
    const server = this.processes.get(serverName);
    if (!server) return;
    const notification = { jsonrpc: '2.0', method, params };
    server.proc.stdin.write(JSON.stringify(notification) + '\n');
  }

  async listTools(serverName) {
    const result = await this.sendRequest(serverName, 'tools/list');
    const tools = result.tools || [];
    this.cachedTools.set(serverName, tools);
    return tools;
  }

  async callTool(serverName, toolName, args) {
    return await this.sendRequest(serverName, 'tools/call', {
      name: toolName,
      arguments: args
    });
  }

  async disconnect(serverName) {
    const server = this.processes.get(serverName);
    if (server) {
      server.intentionalDisconnect = true;
      server.proc.kill();
      this.processes.delete(serverName);
      this.cachedTools.delete(serverName);
    }
  }

  getActiveServers() {
    return Array.from(this.processes.keys());
  }
}

module.exports = new MCPClient();
