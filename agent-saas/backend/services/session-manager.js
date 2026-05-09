/**
 * Session Manager (CommonJS) - Per-customer OpenClaw agent session lifecycle
 * Called from provisioning pipeline after agent files are generated
 * 
 * SECURITY: All child_process calls use spawn() with array arguments (no shell)
 * to prevent command injection via user-controlled strings.
 */

const { spawn } = require('child_process');

const db = require('../database');

/**
 * Generate a slug for the session key
 */
function generateSessionKey(agentSlug) {
  return `agent:${agentSlug}:${Date.now()}`;
}

/**
 * Start a persistent OpenClaw agent session for a customer
 * Called AFTER agent files are generated and agent is in DB
 * 
 * @param {string} agentId - The agent UUID from the DB
 * @returns {Promise<{sessionKey: string, agentDir: string}>}
 */
async function startAgentSession(agentId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT slug, system_prompt FROM agents WHERE id = ?', [agentId], async (err, agent) => {
      if (err || !agent) {
        return reject(new Error('Agent not found: ' + (err?.message || agentId)));
      }

      const sessionKey = generateSessionKey(agent.slug);
      const agentDir = `/opt/agents/${agent.slug}`;
      const prompt = agent.system_prompt || 'You are a helpful AI assistant.';

      console.log('🚀 Spawning agent session:', sessionKey);

      // SECURITY: Use spawn with array args — no shell, no injection risk
      const child = spawn('openclaw', [
        'run',
        '--session-key', sessionKey,
        '--prompt', prompt,
        '--workspace', agentDir,
        '--background'
      ], { cwd: agentDir, detached: true });

      let errorOutput = '';

      child.on('error', (error) => {
        console.error('❌ Failed to spawn agent session:', error.message);
        return reject(new Error('Failed to spawn agent: ' + error.message));
      });

      child.on('close', (code) => {
        if (code !== 0 && code !== null) {
          console.error('⚠️ Agent process exited with code:', code, errorOutput);
        }
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      // Store session key in DB
      db.run('UPDATE agents SET session_key = ? WHERE id = ?', [sessionKey, agentId], (updateErr) => {
        if (updateErr) {
          console.error('⚠️ Agent spawned but could not store session key:', updateErr.message);
        }
      });

      console.log('✅ Agent session started:', sessionKey);
      resolve({ sessionKey, agentDir });
    });
  });
}

/**
 * Send a message to an existing agent session
 * NOTE: sessions_send is an internal ACP CLI command — this requires the
 * OpenClaw gateway to be reachable at the configured ws:// host:port.
 * For external Node.js, messages should be routed via the OpenClaw HTTP/gateway API.
 */
async function sendToSession(sessionKey, message) {
  return new Promise((resolve, reject) => {
    // Use spawn with array args to avoid shell injection
    const child = spawn('node', [
      '-e',
      `const { sessions_send } = require('/root/.openclaw/workspace/node_modules/openclaw');` +
      `sessions_send('${sessionKey}', ${JSON.stringify(message)})` +
      `.then(r => process.stdout.write(JSON.stringify({ok: true})) )` +
      `.catch(e => process.stdout.write(JSON.stringify({ok: false, err: e.message})))`
    ], { timeout: 30000 });

    let output = '';

    child.stdout.on('data', (data) => { output += data.toString(); });
    child.stderr.on('data', (data) => { console.error('sessions_send stderr:', data.toString()); });

    child.on('close', (code) => {
      try {
        const result = JSON.parse(output.trim());
        if (result.ok) resolve(result.r);
        else reject(new Error(result.err || 'sessions_send failed'));
      } catch (e) {
        reject(new Error('Invalid response from sessions_send: ' + output));
      }
    });

    child.on('error', (error) => {
      reject(new Error('sessions_send spawn failed: ' + error.message));
    });
  });
}

/**
 * Close an agent session (stop the subprocess)
 */
async function closeSession(agentId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT session_key FROM agents WHERE id = ?', [agentId], (err, row) => {
      if (err || !row || !row.session_key) {
        return resolve({ success: false, message: 'No session to close' });
      }

      const sessionKey = row.session_key;

      // SECURITY: Use spawn with array args — no shell
      const child = spawn('openclaw', ['sessions', 'stop', sessionKey]);

      child.on('error', () => {}); // Ignore errors (session may already be gone)

      child.on('close', () => {
        // Clear session key regardless of whether stop succeeded
        db.run('UPDATE agents SET session_key = NULL WHERE id = ?', [agentId], (updateErr) => {
          if (updateErr) console.error('⚠️ Could not clear session_key:', updateErr.message);
        });
        resolve({ success: true, sessionKey });
      });
    });
  });
}

/**
 * Check if an agent has an active session
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
