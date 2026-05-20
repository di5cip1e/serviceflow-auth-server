/**
 * Lead Scheduler Service
 * 
 * Runs daily to trigger lead searches for all eligible agents.
 * Called by the daily cron job.
 */

const db = require('../database');
const leadFinder = require('./leadFinder');

/**
 * Run daily lead search for all eligible agents.
 * This is a lightweight scheduler that logs which agents
 * should have leads searched. The actual LLM search is
 * triggered via the API endpoint.
 */
async function runDaily() {
  console.log('[Lead Scheduler] Running daily lead check...');
  
  try {
    const result = await leadFinder.runDaily();
    console.log(`[Lead Scheduler] ${result.eligibleAgents} eligible agents found`);
    
    for (const agent of result.results) {
      if (agent.alreadyFoundToday > 0) {
        console.log(`[Lead Scheduler] ${agent.agentName}: ${agent.alreadyFoundToday} leads already found today — skipping`);
      } else {
        console.log(`[Lead Scheduler] ${agent.agentName}: ready for lead search (no leads found today)`);
      }
    }
    
    return result;
  } catch (err) {
    console.error('[Lead Scheduler] Error:', err);
    throw err;
  }
}

module.exports = { runDaily };
