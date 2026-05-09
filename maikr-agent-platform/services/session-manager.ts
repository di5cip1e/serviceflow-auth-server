import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const dbPath = '/root/.openclaw/workspace/agent-saas/backend/agents.db';
const sqlite = sqlite3.verbose();
const db = new sqlite3.Database(dbPath);

export async function createSession(agentId: string, sessionKey: string) {
  const sql = 'UPDATE agents SET session_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  return new Promise<void>((resolve, reject) => {
    db.run(sql, [sessionKey, agentId], function(err: any){
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function sendToSession(sessionKey: string, message: string) {
  // Import dynamic to avoid top-level dependency; openclaw API provides sessions_send
  // @ts-ignore
  const { sessions_send } = require('openclaw');
  return new Promise((resolve, reject) => {
    try {
      const res = sessions_send(sessionKey, message);
      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
}

export async function closeSession(agentId: string) {
  const sql = 'UPDATE agents SET session_key = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  return new Promise<void>((resolve, reject) => {
    db.run(sql, [agentId], function(err: any){
      if (err) return reject(err);
      resolve();
    });
  });
}
