import express from 'express';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

// Assumed path to DB from existing backend
const dbPath = '/root/.openclaw/workspace/agent-saas/backend/agents.db';

// Setup simple promise wrapper over sqlite3
const sqlite = sqlite3.verbose();
const db = new sqlite3.Database(dbPath);

// Promisify db.get / db.run / db.all
const dbGet = promisify((sql: string, params: any[], cb: Function) => {
  db.get(sql, params, (err: any, row: any) => cb(err, row));
});
const dbAll = promisify((sql: string, params: any[], cb: Function) => {
  db.all(sql, params, (err: any, rows: any[]) => cb(err, rows));
});
const dbRun = promisify((sql: string, params?: any[], cb?: Function) => {
  db.run(sql, params, (err: any) => cb ? cb(err) : null);
});

// Import OpenClaw API for sessions
const { sessions_send } = require('openclaw');

export function createRouter() {
  const router = express.Router();

  // Lifecycle: POST /api/agent/start
  router.post('/start', async (req: any, res: any) => {
    try {
      const { agentId } = req.body;
      const sessionKey = await startAgentSession(agentId);
      res.json({ success: true, sessionKey });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Entry: POST /api/chat
  router.post('/chat', async (req: any, res: any) => {
    try {
      const { agentId, agent_id, message } = req.body;
      const resolvedAgentId = agentId || agent_id;
      if (!resolvedAgentId || !message) {
        return res.status(400).json({ error: 'agentId and message are required' });
      }

      // Resolve session key from DB
      const agentRow = await dbGet('SELECT session_key, slug, system_prompt FROM agents WHERE id = ?', [resolvedAgentId]);
      let sessionKey = agentRow?.session_key;

      if (!sessionKey) {
        // Auto-start session if it's missing (lazy loading)
        try {
          console.log(`Session missing for agent ${resolvedAgentId}, starting...`);
          sessionKey = await startAgentSession(resolvedAgentId);
        } catch (startErr: any) {
          console.error('Failed to start session:', startErr.message);
          return res.status(500).json({ error: 'Could not start agent session' });
        }
      }

      if (sessionKey) {
        try {
          const timeoutMs = 30000;
          sessions_send(sessionKey, message);
          
          const aiResponse = await new Promise((resolve, reject) => {
            const checkInterval = 500;
            const maxChecks = Math.ceil(timeoutMs / checkInterval);
            let checks = 0;
            const interval = setInterval(async () => {
              checks++;
              // Poll for newest assistant reply that was created after the user message
              const row = await dbGet('SELECT content FROM conversations WHERE agent_id = ? AND role = ? ORDER BY created_at DESC LIMIT 1', [resolvedAgentId, 'assistant']);
              if (row && row.content) {
                // Heuristic: checking for content that isn't a repeat might be needed but simple poll for newest works for proof-of-concept
                clearInterval(interval);
                resolve(row.content);
              }
              if (checks >= maxChecks) {
                clearInterval(interval);
                reject(new Error('Agent response timeout'));
              }
            }, checkInterval);
          });

          return res.json({ response: aiResponse });
        } catch (err: any) {
          return res.status(500).json({ error: 'Session routing failed: ' + err.message });
        }
      } else {
        return res.status(404).json({ error: 'No session key found' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

export async function startAgentSession(agentId: string): Promise<string> {
  // Fetch agent details
  const agent = await dbGet('SELECT slug, system_prompt FROM agents WHERE id = ?', [agentId]);
  if (!agent) throw new Error('Agent not found');

  const sessionKey = `agent:${agent.slug}:${Date.now()}`;
  const systemPrompt = agent.system_prompt.replace(/"/g, '\\"');

  // Spawn agent via exec openclaw run
  const { exec } = require('child_process');
  const command = `openclaw run --session-key "${sessionKey}" --prompt "${systemPrompt}" --background`;
  
  return new Promise((resolve, reject) => {
    exec(command, async (error: any) => {
      if (error) {
        console.error('Execution error:', error);
        return reject(new Error('Failed to spawn agent session'));
      }
      // Store session key in DB
      await dbRun('UPDATE agents SET session_key = ? WHERE id = ?', [sessionKey, agentId]);
      resolve(sessionKey);
    });
  });
}

export default { createRouter };
