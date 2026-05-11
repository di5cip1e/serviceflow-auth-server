/**
 * Agent Registry — exports all sub-agents for the swarm.
 */

const supportPrompt = require('./support').BASE_PROMPT;
const salesPrompt = require('./sales').BASE_PROMPT;
const onboardingPrompt = require('./onboarding').BASE_PROMPT;
const generalPrompt = require('./general').BASE_PROMPT;

const AGENTS = {
  SUPPORT:    { name: 'Support Agent',     emoji: '🎧', prompt: supportPrompt },
  SALES:      { name: 'Sales Agent',       emoji: '💼', prompt: salesPrompt },
  ONBOARDING: { name: 'Onboarding Agent',  emoji: '🚀', prompt: onboardingPrompt },
  GENERAL:    { name: 'M.ai.K.R Assistant', emoji: '🤖', prompt: generalPrompt },
};

function getAgent(state) {
  return AGENTS[state] || AGENTS.GENERAL;
}

function getAllAgents() {
  return AGENTS;
}

module.exports = { AGENTS, getAgent, getAllAgents };
