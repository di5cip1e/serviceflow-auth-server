// Simple in-memory LRU cache for conversation history and frequent queries
const { LRUCache } = require('lru-cache');

const conversationCache = new LRUCache({
  max: 200,              // max 200 agent histories
  ttl: 5 * 60 * 1000,   // 5 min TTL
  updateAgeOnGet: true,
});

const agentCache = new LRUCache({
  max: 500,
  ttl: 10 * 60 * 1000,  // 10 min TTL for agent records
});

function getCachedHistory(agentId) {
  return conversationCache.get(agentId) || null;
}

function setCachedHistory(agentId, history) {
  conversationCache.set(agentId, history);
}

function invalidateHistory(agentId) {
  conversationCache.delete(agentId);
}

function getCachedAgent(agentId) {
  return agentCache.get(agentId) || null;
}

function setCachedAgent(agentId, agent) {
  agentCache.set(agentId, agent);
}

function invalidateAgent(agentId) {
  agentCache.delete(agentId);
}

function getStats() {
  return {
    history: { size: conversationCache.size, max: conversationCache.max },
    agent: { size: agentCache.size, max: agentCache.max },
  };
}

module.exports = {
  getCachedHistory, setCachedHistory, invalidateHistory,
  getCachedAgent, setCachedAgent, invalidateAgent,
  getStats,
};
