/**
 * Session Manager (CommonJS) - Per-customer OpenClaw agent session lifecycle
 * 
 * Architecture: The gateway owns session lifecycle. We call:
 *   openclaw agent --agent <slug> --session-id <key> --message <msg> --json
 * 
 * The gateway routes to the right agent session (or creates it on first use).
 * No child processes are spawned by this module — all agent communication
 * goes through the OpenClaw CLI which talks to the gateway.
 */

const { spawn } = require('child_process');
const db = require('../database');

const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '98f91ecf9750fcb40d71a9fd8de1f0c052f629301e8bc45b';

/**
 * Generate a deterministic session key for an agent
 * Format: agent:<slug>:main
 */
function generateSessionKey(slug) {
  return `agent:${slug}:main`;
}

/**
 * Get conversation history for an agent (last N messages)
 */
function getHistory(agentId, limit = 20) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT role, content FROM conversations WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?`,
      [agentId, limit],
      (err, rows) => {
        if (err) return reject(err);
        resolve((rows || []).reverse()); // Oldest first
      }
    );
  });
}

/**
 * Store a message in conversation history
 */
function storeMessage(agentId, role, content) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO conversations (agent_id, role, content) VALUES (?, ?, ?)`,
      [agentId, role, content],
      (err) => { if (err) return reject(err); resolve(); }
    );
  });
}

/**
 * Start a persistent agent session for a customer.
 * Stores the session key in the DB — the gateway creates the session
 * on the first message sent to it (no process spawned here).
 * 
 * @param {string} agentId - The agent UUID from the DB
 * @returns {Promise<{sessionKey: string, agentDir: string}>}
 */
async function startAgentSession(agentId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT slug, agent_name FROM agents WHERE id = ?', [agentId], async (err, agent) => {
      if (err || !agent) {
        return reject(new Error('Agent not found: ' + (err?.message || agentId)));
      }

      const sessionKey = generateSessionKey(agent.slug);
      const agentDir = `/opt/agents/${agent.slug}`;

      db.run('UPDATE agents SET session_key = ? WHERE id = ?', [sessionKey, agentId], (updateErr) => {
        if (updateErr) {
          console.warn('⚠️ Could not store session_key:', updateErr.message);
        }
      });

      console.log('✅ Session key registered:', sessionKey);
      resolve({ sessionKey, agentDir });
    });
  });
}

/**
 * Send a message to an existing agent session.
 * Uses `openclaw agent --session-id <key> --message <msg> --json`.
 * Conversation history is loaded and prepended as context.
 * 
 * @param {string} agentId - The agent UUID
 * @param {string} message - The user's message
 * @returns {Promise<{response: string, sessionKey: string}>}
 */
async function sendToSession(agentId, message) {
  return new Promise((resolve, reject) => {
    db.get('SELECT slug, session_key FROM agents WHERE id = ?', [agentId], async (err, agent) => {
      if (err || !agent) {
        return reject(new Error('Agent not found: ' + (err?.message || agentId)));
      }

      const sessionKey = agent.session_key || generateSessionKey(agent.slug);

      // Load conversation history for context
      const history = await getHistory(agentId);
      
      // Build full prompt with history
      let fullPrompt = '';
      if (history.length > 0) {
        fullPrompt += '[Conversation history]\n';
        for (const h of history) {
          fullPrompt += `${h.role === 'user' ? 'Customer' : 'Agent'}: ${h.content}\n`;
        }
        fullPrompt += `[End history]\n\nCustomer: ${message}\nAgent:`;
      } else {
        fullPrompt = message;
      }

      // Store user message
      await storeMessage(agentId, 'user', message);

      // Call openclaw agent via gateway — array args, no shell injection risk
      const child = spawn('openclaw', [
        'agent',
        '--agent', agent.slug,
        '--session-id', sessionKey,
        '--message', fullPrompt,
        '--timeout', '120',
        '--json'
      ], { timeout: 130000 });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });

      child.on('error', (error) => {
        return reject(new Error('openclaw agent spawn failed: ' + error.message));
      });

      child.on('close', async (code) => {
        if (code !== 0 && code !== null) {
          console.warn('⚠️ openclaw agent exited code', code, stderr.slice(0, 200));
        }

        try {
          // Parse JSON output — find the result text
          const lines = stdout.trim().split('\n');
          let responseText = '';

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed?.result?.payloads?.[0]?.text) {
                responseText = parsed.result.payloads[0].text;
                break;
              }
            } catch {}
          }

          if (!responseText && stdout.trim()) {
            const match = stdout.match(/"text":\s*"([^"]+(?:\\"[^"]*)*)"/);
            if (match) responseText = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
          }

          if (!responseText) {
            responseText = stdout.trim() || 'Agent responded without text.';
          }

          // Store agent response
          await storeMessage(agentId, 'agent', responseText);

          resolve({ response: responseText, sessionKey });
        } catch (e) {
          console.error('❌ Failed to parse agent response:', e.message);
          console.error('Raw stdout:', stdout.slice(0, 500));
          reject(new Error('Invalid response from agent: ' + e.message));
        }
      });
    });
  });
}

/**
 * Close an agent session — clears session_key from DB.
 * The gateway handles actual session cleanup.
 */
async function closeSession(agentId) {
  return new Promise((resolve) => {
    db.get('SELECT session_key FROM agents WHERE id = ?', [agentId], (err, row) => {
      if (err || !row || !row.session_key) {
        return resolve({ success: false, message: 'No session to close' });
      }

      db.run('UPDATE agents SET session_key = NULL, status = ? WHERE id = ?', ['inactive', agentId], (updateErr) => {
        if (updateErr) console.error('⚠️ Could not clear session_key:', updateErr.message);
      });

      resolve({ success: true, sessionKey: row.session_key });
    });
  });
}

/**
 * Check if an agent has a session key registered
 */
async function hasActiveSession(agentId) {
  return new Promise((resolve) => {
    db.get('SELECT session_key FROM agents WHERE id = ?', [agentId], (err, row) => {
      if (err || !row || !row.session_key) return resolve(false);
      resolve(true);
    });
  });
}

module.exports = { startAgentSession, sendToSession, closeSession, hasActiveSession };
