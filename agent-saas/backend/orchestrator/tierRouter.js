/**
 * Tier Router — maps model tier to the appropriate LLM.
 * Extracted from chat.js for use in swarm routing.
 */

const TIER_MODELS = {
  standard: { model: 'openrouter/google/gemini-3.1-flash-lite', costPerM: 0,    monthlyAddOn: 0    },
  premium:  { model: 'openrouter/openai/gpt-4o-mini',            costPerM: 0.15, monthlyAddOn: 1500 },
  elite:    { model: 'openrouter/openai/gpt-4o',                 costPerM: 2.50, monthlyAddOn: 3000 },
};

function getModelForTier(tier) {
  return TIER_MODELS[tier]?.model || TIER_MODELS.standard.model;
}

function getCostForTier(tier) {
  return TIER_MODELS[tier] || TIER_MODELS.standard;
}

module.exports = { getModelForTier, getCostForTier, TIER_MODELS };
