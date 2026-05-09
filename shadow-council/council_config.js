/**
 * council_config.js - Configuration for Shadow Council Rebrand
 * 
 * Contains all configuration for Shadow Influence, Whisper Types, and Intrigue Options
 * Phase 5 - Shadow Council Rebrand
 */

// ============================================
// SHADOW INFLUENCE CONFIGURATION
// ============================================

export const INFLUENCE_CONFIG = {
  // Generation: 1 point per 2 minutes of gameplay
  regenRateMs: 120000, // 2 minutes in milliseconds
  
  // Maximum influence points player can hold
  maxInfluence: 3,
  
  // Initial influence at game start
  initialInfluence: 0,
  
  // Influence gained from ruler mistakes (random 1-3)
  mistakeBonusMin: 1,
  mistakeBonusMax: 3
};

// ============================================
// WHISPER TYPES CONFIGURATION
// ============================================

export const WHISPER_TYPES = {
  // Encourage military action / war
  encourage_war: {
    id: 'encourage_war',
    title: 'Whisper of War',
    description: 'Plant the idea of military conflict in the ruler\'s mind',
    icon: '⚔️',
    biasKey: 'war',
    biasAmount: 20, // +20% bias
    cost: 1,
    successMessage: 'Your words stoke the fires of war...'
  },
  
  // Encourage peace / diplomacy
  encourage_peace: {
    id: 'encourage_peace',
    title: 'Whisper of Peace',
    description: 'Guide the ruler toward peaceful solutions',
    icon: '🕊️',
    biasKey: 'peace',
    biasAmount: 20, // +20% bias
    cost: 1,
    successMessage: 'The ruler contemplates peace...'
  },
  
  // Plant suspicion about allies/advisors
  plant_suspicion: {
    id: 'plant_suspicion',
    title: 'Whisper of Suspicion',
    description: 'Plant seeds of distrust in the ruler\'s mind',
    icon: '👁️',
    biasKey: 'suspicion',
    biasAmount: 20, // +20% bias
    cost: 1,
    successMessage: 'The ruler\'s eyes narrow with doubt...'
  },
  
  // Boost economic focus
  boost_economy: {
    id: 'boost_economy',
    title: 'Whisper of Prosperity',
    description: 'Guide the ruler to focus on wealth and trade',
    icon: '💰',
    biasKey: 'economy',
    biasAmount: 20, // +20% bias
    cost: 1,
    successMessage: 'The ruler dreams of golden treasures...'
  },
  
  // Military advantage / strategic thinking
  military_advantage: {
    id: 'military_advantage',
    title: 'Whisper of Strategy',
    description: 'Instill strategic military thinking',
    icon: '🗡️',
    biasKey: 'military',
    biasAmount: 20, // +20% bias
    cost: 1,
    successMessage: 'The ruler sees the battlefield clearly...'
  }
};

// ============================================
// COURT INTRIGUE OPTIONS CONFIGURATION
// ============================================

export const INTRIGUE_OPTIONS = {
  // Mercy - show compassion, reduce tension
  mercy: {
    id: 'mercy',
    title: 'Show Mercy',
    description: 'Urge the ruler to show compassion and forgiveness',
    icon: '🤲',
    cost: 1,
    effects: {
      publicOrder: 10,
      rulerMercy: 5,
      armyLoyalty: -5
    },
    successMessage: 'The ruler shows mercy...'
  },
  
  // Cruelty - use fear to maintain control
  cruelty: {
    id: 'cruelty',
    title: 'Crush Dissent',
    description: 'Advise ruthless suppression of opposition',
    icon: '⚔️',
    cost: 2,
    effects: {
      publicOrder: -10,
      rulerCruelty: 10,
      armyLoyalty: 10
    },
    successMessage: 'Fear serves the throne...'
  },
  
  // Negotiation - find middle ground
  negotiation: {
    id: 'negotiation',
    title: 'Negotiate',
    description: 'Seek diplomatic solutions to the crisis',
    icon: '🤝',
    cost: 1,
    effects: {
      publicOrder: 5,
      diplomacy: 5,
      treasury: -5
    },
    successMessage: 'Words can resolve what swords cannot...'
  },
  
  // Suppression - military force to end crisis
  suppression: {
    id: 'suppression',
    title: 'Military Suppression',
    description: 'Use force to quickly end the threat',
    icon: '🛡️',
    cost: 2,
    effects: {
      publicOrder: -5,
      armyLoyalty: 5,
      militaryStrength: -5
    },
    successMessage: 'The army restores order...'
  }
};

// ============================================
// CRISIS TYPES
// ============================================

export const CRISIS_TYPES = {
  rebellion: {
    id: 'rebellion',
    title: 'Rebellion',
    description: 'A group has risen against the throne!',
    baseCost: 2,
    options: ['mercy', 'cruelty', 'negotiation', 'suppression']
  },
  famine: {
    id: 'famine',
    title: 'Famine',
    description: 'Crops fail and people starve!',
    baseCost: 1,
    options: ['mercy', 'negotiation']
  },
  plague: {
    id: 'plaque',
    title: 'Plague',
    description: 'A deadly disease spreads through the realm!',
    baseCost: 2,
    options: ['mercy', 'suppression']
  },
  invasion: {
    id: 'invasion',
    title: 'Foreign Invasion',
    description: 'Enemy armies have crossed our borders!',
    baseCost: 2,
    options: ['cruelty', 'suppression', 'negotiation']
  },
  crisis: {
    id: 'crisis',
    title: 'General Crisis',
    description: 'A crisis threatens the kingdom!',
    baseCost: 1,
    options: ['mercy', 'cruelty', 'negotiation', 'suppression']
  }
};

// ============================================
// TERMINOLOGY MAPPING (for backward compatibility)
// ============================================

// Old names -> New names
export const TERMINOLOGY_MAP = {
  'threaten_token': 'shadow_influence',
  'threaten_tokens': 'shadow_influence',
  'threaten': 'whisper',
  'force_advice': 'spend_influence'
};

// ============================================
// EXPORTS
// ============================================

export default {
  INFLUENCE_CONFIG,
  WHISPER_TYPES,
  INTRIGUE_OPTIONS,
  CRISIS_TYPES,
  TERMINOLOGY_MAP
};