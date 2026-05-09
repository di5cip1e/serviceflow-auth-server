/**
 * GovernmentUnits.js - Government-Specific Military Units
 * Phase 5B: Government Unit Overhaul
 * 
 * Each government type has unique unit types with special abilities
 * and government affinity bonuses.
 */

export const GOVERNMENT_TYPES = {
  AUTOCRACY: {
    id: 'autocracy',
    name: 'Autocracy',
    icon: '👑',
    description: 'Imperial rule with disciplined elite forces',
    affinityBonus: 'discipline'
  },
  DEMOCRACY: {
    id: 'democracy',
    name: 'Democracy',
    icon: '🏛️',
    description: 'Civic participation and citizen militias',
    affinityBonus: 'morale'
  },
  THEOCRACY: {
    id: 'theocracy',
    name: 'Theocracy',
    icon: '⛪',
    description: 'Divine mandate with holy warriors',
    affinityBonus: 'blessing'
  },
  OLIGARCHY: {
    id: 'oligarchy',
    name: 'Oligarchy',
    icon: '💰',
    description: 'Wealth-based mercenary forces',
    affinityBonus: 'gold'
  },
  MILITARY_JUNTA: {
    id: 'military_junta',
    name: 'Military Junta',
    icon: '⚡',
    description: 'Brutal discipline and shock tactics',
    affinityBonus: 'fear'
  }
};

// Government-specific units
export const GOVERNMENT_UNITS = {
  // === AUTOCRACY (Imperial Units) ===
  AUTOCRACY: {
    praetorian_guard: {
      id: 'praetorian_guard',
      name: 'Praetorian Guard',
      icon: '🛡️',
      description: 'Elite imperial infantry, the personal guard of the ruler',
      government: 'autocracy',
      type: 'infantry',
      cost: { gold: 150, population: 50 },
      stats: {
        attack: 18,
        defense: 20,
        speed: 4,
        health: 150
      },
      affinityBonus: { type: 'discipline', value: 0.25 },
      specialAbility: {
        name: 'Imperial Shield',
        description: '+30% defense when near ruler or capital',
        effect: 'defenseBonus: 0.3',
        condition: 'nearCapital'
      },
      unlockTier: 1
    },
    legatus: {
      id: 'legatus',
      name: 'Legatus',
      icon: '🎖️',
      description: 'Imperial commander, boosts nearby unit morale',
      government: 'autocracy',
      type: 'commander',
      cost: { gold: 200, population: 30 },
      stats: {
        attack: 12,
        defense: 14,
        speed: 8,
        health: 100
      },
      affinityBonus: { type: 'discipline', value: 0.2 },
      specialAbility: {
        name: 'Command Presence',
        description: 'Allied units within range gain +15% attack',
        effect: 'auraAttack: 0.15',
        range: 3
      },
      unlockTier: 2
    },
    imperial_archer: {
      id: 'imperial_archer',
      name: 'Imperial Archer',
      icon: '🏹',
      description: 'Elite archers with precision training',
      government: 'autocracy',
      type: 'archer',
      cost: { gold: 100, population: 60 },
      stats: {
        attack: 20,
        defense: 8,
        speed: 6,
        health: 80
      },
      affinityBonus: { type: 'discipline', value: 0.15 },
      specialAbility: {
        name: 'Piercing Shot',
        description: 'Ignores 30% of enemy defense',
        effect: 'piercing: 0.3'
      },
      unlockTier: 1
    },
    war_elephant: {
      id: 'war_elephant',
      name: 'War Elephant',
      icon: '🐘',
      description: 'Massive siege weapon, tramples infantry',
      government: 'autocracy',
      type: 'siege',
      cost: { gold: 300, population: 40 },
      stats: {
        attack: 30,
        defense: 18,
        speed: 3,
        health: 200
      },
      affinityBonus: { type: 'discipline', value: 0.2 },
      specialAbility: {
        name: 'Trample',
        description: 'Deals 50% bonus damage to infantry',
        effect: 'bonusVsInfantry: 0.5'
      },
      unlockTier: 3
    },
    shadow_assassin: {
      id: 'shadow_assassin',
      name: 'Shadow Assassin',
      icon: '🗡️',
      description: 'Elite special ops, strikes from shadows',
      government: 'autocracy',
      type: 'special',
      cost: { gold: 250, population: 20 },
      stats: {
        attack: 25,
        defense: 8,
        speed: 14,
        health: 60
      },
      affinityBonus: { type: 'discipline', value: 0.3 },
      specialAbility: {
        name: 'Assassinate',
        description: 'First strike deals 2x damage',
        effect: 'firstStrike: 2.0'
      },
      unlockTier: 4
    }
  },

  // === DEMOCRACY (Civic/Militia Units) ===
  DEMOCRACY: {
    citizen_militia: {
      id: 'citizen_militia',
      name: 'Citizen Militia',
      icon: '👷',
      description: 'Volunteer citizens defending their freedom',
      government: 'democracy',
      type: 'infantry',
      cost: { gold: 40, population: 80 },
      stats: {
        attack: 8,
        defense: 10,
        speed: 6,
        health: 90
      },
      affinityBonus: { type: 'morale', value: 0.2 },
      specialAbility: {
        name: 'Defenders of Freedom',
        description: '+20% defense on home territory',
        effect: 'homeDefense: 0.2'
      },
      unlockTier: 1
    },
    hoplite: {
      id: 'hoplite',
      name: 'Hoplite',
      icon: '🛡️',
      description: 'Skilled spearman in phalanx formation',
      government: 'democracy',
      type: 'spearman',
      cost: { gold: 70, population: 70 },
      stats: {
        attack: 14,
        defense: 16,
        speed: 3,
        health: 120
      },
      affinityBonus: { type: 'morale', value: 0.15 },
      specialAbility: {
        name: 'Phalanx',
        description: '+25% defense when adjacent to other hoplites',
        effect: 'formationBonus: 0.25'
      },
      unlockTier: 1
    },
    senate_guard: {
      id: 'senate_guard',
      name: 'Senate Guard',
      icon: '🏛️',
      description: 'Elite protectors of democratic institutions',
      government: 'democracy',
      type: 'infantry',
      cost: { gold: 120, population: 40 },
      stats: {
        attack: 16,
        defense: 18,
        speed: 5,
        health: 130
      },
      affinityBonus: { type: 'morale', value: 0.25 },
      specialAbility: {
        name: 'Democratic Will',
        description: 'Nearby allies recover morale 50% faster',
        effect: 'moraleRecovery: 0.5'
      },
      unlockTier: 2
    },
    democratic_archer: {
      id: 'democratic_archer',
      name: 'Democratic Archer',
      icon: '🏹',
      description: 'Free citizens skilled with the bow',
      government: 'democracy',
      type: 'archer',
      cost: { gold: 60, population: 70 },
      stats: {
        attack: 16,
        defense: 6,
        speed: 7,
        health: 75
      },
      affinityBonus: { type: 'morale', value: 0.2 },
      specialAbility: {
        name: 'Volley Fire',
        description: 'Can attack twice per round at 50% damage',
        effect: 'doubleStrike: 0.5'
      },
      unlockTier: 2
    },
    politician: {
      id: 'politician',
      name: 'Politician',
      icon: '🎭',
      description: 'Diplomat, can negotiate truces and alliances',
      government: 'democracy',
      type: 'diplomat',
      cost: { gold: 100, population: 20 },
      stats: {
        attack: 4,
        defense: 6,
        speed: 8,
        health: 60
      },
      affinityBonus: { type: 'morale', value: 0.3 },
      specialAbility: {
        name: 'Diplomatic Immunity',
        description: 'Can negotiate surrender without combat',
        effect: 'negotiate: true'
      },
      unlockTier: 3
    }
  },

  // === THEOCRACY (Holy/Divine Units) ===
  THEOCRACY: {
    templar_knight: {
      id: 'templar_knight',
      name: 'Templar Knight',
      icon: '✝️',
      description: 'Holy warrior blessed by divine light',
      government: 'theocracy',
      type: 'infantry',
      cost: { gold: 180, population: 40 },
      stats: {
        attack: 20,
        defense: 18,
        speed: 6,
        health: 140
      },
      affinityBonus: { type: 'blessing', value: 0.25 },
      specialAbility: {
        name: 'Divine Shield',
        description: 'Immune to dark magic, +20% vs evil',
        effect: 'antiEvil: 0.2, magicImmune: true'
      },
      unlockTier: 1
    },
    high_priest: {
      id: 'high_priest',
      name: 'High Priest',
      icon: '📿',
      description: 'Divine messenger, heals and buffs allies',
      government: 'theocracy',
      type: 'support',
      cost: { gold: 150, population: 25 },
      stats: {
        attack: 6,
        defense: 10,
        speed: 5,
        health: 80
      },
      affinityBonus: { type: 'blessing', value: 0.35 },
      specialAbility: {
        name: 'Divine Heal',
        description: 'Restores 30 health to nearby allies per turn',
        effect: 'healAura: 30'
      },
      unlockTier: 2
    },
    divine_archer: {
      id: 'divine_archer',
      name: 'Divine Archer',
      icon: '🏹',
      description: 'Blessed archers with sacred arrows',
      government: 'theocracy',
      type: 'archer',
      cost: { gold: 90, population: 50 },
      stats: {
        attack: 18,
        defense: 8,
        speed: 6,
        health: 85
      },
      affinityBonus: { type: 'blessing', value: 0.2 },
      specialAbility: {
        name: 'Smite',
        description: 'Attacks have 25% chance to deal holy damage',
        effect: 'holyDamage: 0.25'
      },
      unlockTier: 1
    },
    zealot: {
      id: 'zealot',
      name: 'Zealot',
      icon: '🔥',
      description: 'Fanatical believer, ignores pain',
      government: 'theocracy',
      type: 'infantry',
      cost: { gold: 60, population: 60 },
      stats: {
        attack: 22,
        defense: 6,
        speed: 5,
        health: 100
      },
      affinityBonus: { type: 'blessing', value: 0.3 },
      specialAbility: {
        name: 'Fanaticism',
        description: 'No morale penalty for attacking',
        effect: 'ignoreMoralePenalty: true'
      },
      unlockTier: 3
    },
    inquisitor: {
      id: 'inquisitor',
      name: 'Inquisitor',
      icon: '🔱',
      description: 'Hunter of heretics and dark forces',
      government: 'theocracy',
      type: 'special',
      cost: { gold: 200, population: 25 },
      stats: {
        attack: 24,
        defense: 12,
        speed: 10,
        health: 90
      },
      affinityBonus: { type: 'blessing', value: 0.25 },
      specialAbility: {
        name: 'Purge',
        description: 'Bonus damage against magic users',
        effect: 'vsMagic: 0.5'
      },
      unlockTier: 4
    }
  },

  // === OLIGARCHY (Mercenary/Coin-Funded Units) ===
  OLIGARCHY: {
    mercenary_captain: {
      id: 'mercenary_captain',
      name: 'Mercenary Captain',
      icon: '⚔️',
      description: 'Veteran mercenary leader, commands loyalty for gold',
      government: 'oligarchy',
      type: 'commander',
      cost: { gold: 250, population: 30 },
      stats: {
        attack: 16,
        defense: 14,
        speed: 7,
        health: 110
      },
      affinityBonus: { type: 'gold', value: 0.2 },
      specialAbility: {
        name: 'Gold Loyalty',
        description: 'Mercenaries fight 25% harder when paid double',
        effect: 'paidMorale: 0.25'
      },
      unlockTier: 2
    },
    gold_infantry: {
      id: 'gold_infantry',
      name: 'Gold-Ranked Infantry',
      icon: '💂',
      description: 'Elite mercenaries paid for their skill',
      government: 'oligarchy',
      type: 'infantry',
      cost: { gold: 120, population: 50 },
      stats: {
        attack: 16,
        defense: 16,
        speed: 5,
        health: 120
      },
      affinityBonus: { type: 'gold', value: 0.2 },
      specialAbility: {
        name: 'Paid for Blood',
        description: '+15% attack for each battle won',
        effect: 'veteranBonus: 0.15'
      },
      unlockTier: 1
    },
    merchant_guard: {
      id: 'merchant_guard',
      name: 'Merchant Guard',
      icon: '🛡️',
      description: 'Protecting trade caravans and wealth',
      government: 'oligarchy',
      type: 'infantry',
      cost: { gold: 80, population: 60 },
      stats: {
        attack: 12,
        defense: 14,
        speed: 4,
        health: 100
      },
      affinityBonus: { type: 'gold', value: 0.15 },
      specialAbility: {
        name: 'Gold Shield',
        description: 'Can pay to avoid battle (costs gold)',
        effect: 'bribeEscape: true'
      },
      unlockTier: 1
    },
    paid_archer: {
      id: 'paid_archer',
      name: 'Paid Archer',
      icon: '🏹',
      description: 'Archer for hire, precise and deadly',
      government: 'oligarchy',
      type: 'archer',
      cost: { gold: 80, population: 55 },
      stats: {
        attack: 18,
        defense: 6,
        speed: 7,
        health: 70
      },
      affinityBonus: { type: 'gold', value: 0.15 },
      specialAbility: {
        name: 'Contract Kill',
        description: 'Against targets with bounty, +30% damage',
        effect: 'bountyBonus: 0.3'
      },
      unlockTier: 2
    },
    spy_master: {
      id: 'spy_master',
      name: 'Spy Master',
      icon: '🎭',
      description: 'Master of intelligence and covert operations',
      government: 'oligarchy',
      type: 'intel',
      cost: { gold: 300, population: 15 },
      stats: {
        attack: 8,
        defense: 6,
        speed: 12,
        health: 50
      },
      affinityBonus: { type: 'gold', value: 0.35 },
      specialAbility: {
        name: 'Intel Network',
        description: 'Reveals enemy positions and increases gold from raids',
        effect: 'revealRange: 5, raidGold: 0.25'
      },
      unlockTier: 4
    }
  },

  // === MILITARY JUNTA (Brutal/Disciplined Units) ===
  MILITARY_JUNTA: {
    stormtrooper: {
      id: 'stormtrooper',
      name: 'Stormtrooper',
      icon: '💀',
      description: 'Elite shock troops, feared across lands',
      government: 'military_junta',
      type: 'infantry',
      cost: { gold: 140, population: 45 },
      stats: {
        attack: 22,
        defense: 14,
        speed: 7,
        health: 130
      },
      affinityBonus: { type: 'fear', value: 0.25 },
      specialAbility: {
        name: 'Terror',
        description: 'Enemies have -15% defense against stormtroopers',
        effect: 'terror: -0.15 enemyDefense'
      },
      unlockTier: 1
    },
    drill_sergeant: {
      id: 'drill_sergeant',
      name: 'Drill Sergeant',
      icon: '📢',
      description: 'Hardens troops through brutal training',
      government: 'military_junta',
      type: 'commander',
      cost: { gold: 160, population: 25 },
      stats: {
        attack: 10,
        defense: 16,
        speed: 5,
        health: 100
      },
      affinityBonus: { type: 'fear', value: 0.2 },
      specialAbility: {
        name: 'Iron Discipline',
        description: 'Nearby units cannot retreat, +10% stats',
        effect: 'noRetreat: true, unitBonus: 0.1'
      },
      unlockTier: 2
    },
    brutal_beserker: {
      id: 'brutal_beserker',
      name: 'Brutal Berserker',
      icon: '🪓',
      description: 'Raging warrior, trades defense for offense',
      government: 'military_junta',
      type: 'infantry',
      cost: { gold: 100, population: 50 },
      stats: {
        attack: 28,
        defense: 4,
        speed: 8,
        health: 110
      },
      affinityBonus: { type: 'fear', value: 0.3 },
      specialAbility: {
        name: 'Blood Rage',
        description: 'Attacks deal double damage below 50% health',
        effect: 'lowHealthDmg: 2.0'
      },
      unlockTier: 3
    },
    artillery_commander: {
      id: 'artillery_commander',
      name: 'Artillery Commander',
      icon: '💣',
      description: 'Coordinates devastating bombardment',
      government: 'military_junta',
      type: 'siege',
      cost: { gold: 200, population: 35 },
      stats: {
        attack: 28,
        defense: 8,
        speed: 3,
        health: 90
      },
      affinityBonus: { type: 'fear', value: 0.2 },
      specialAbility: {
        name: 'Bombardment',
        description: 'Can fire at ranged targets without moving',
        effect: 'indirectFire: true'
      },
      unlockTier: 3
    },
    re_education_officer: {
      id: 're_education_officer',
      name: 'Re-education Officer',
      icon: '📚',
      description: 'Converts prisoners and spreads propaganda',
      government: 'military_junta',
      type: 'support',
      cost: { gold: 120, population: 20 },
      stats: {
        attack: 4,
        defense: 8,
        speed: 6,
        health: 70
      },
      affinityBonus: { type: 'fear', value: 0.35 },
      specialAbility: {
        name: 'Pacify',
        description: 'Enemy units may surrender and join your side',
        effect: 'conversionChance: 0.15'
      },
      unlockTier: 4
    }
  }
};

// Tech tier unlock requirements
export const TECH_TIERS = {
  1: { name: 'Basic', units: ['praetorian_guard', 'imperial_archer', 'citizen_militia', 'hoplite', 'templar_knight', 'divine_archer', 'gold_infantry', 'merchant_guard', 'stormtrooper'] },
  2: { name: 'Advanced', units: ['legatus', 'senate_guard', 'democratic_archer', 'high_priest', 'mercenary_captain', 'paid_archer', 'drill_sergeant'] },
  3: { name: 'Elite', units: ['war_elephant', 'politician', 'zealot', 'artillery_commander', 'brutal_beserker'] },
  4: { name: 'Special', units: ['shadow_assassin', 'inquisitor', 'spy_master', 're_education_officer'] }
};

export class GovernmentUnitSystem {
  constructor() {
    this.unlockedUnits = new Map(); // govType -> Set of unlocked unit IDs
    this.activeGovernment = null;
    
    // Initialize all governments as locked
    for (const gov of Object.values(GOVERNMENT_TYPES)) {
      this.unlockedUnits.set(gov.id, new Set());
    }
  }

  /**
   * Set the active government type
   */
  setGovernment(govType) {
    this.activeGovernment = govType;
  }

  /**
   * Get all units available for a specific government
   */
  getUnitsForGovernment(govType) {
    const govUnits = GOVERNMENT_UNITS[govType.toUpperCase()];
    if (!govUnits) return [];
    
    const unlocked = this.unlockedUnits.get(govType) || new Set();
    
    return Object.values(govUnits).filter(unit => {
      // Include base units always, plus unlocked government units
      return !unit.government || unlocked.has(unit.id);
    });
  }

  /**
   * Unlock units for a government based on tech tier
   */
  unlockGovernmentUnits(govType, techTier) {
    const govKey = govType.toUpperCase();
    if (!GOVERNMENT_UNITS[govKey]) {
      console.warn(`Unknown government type: ${govType}`);
      return;
    }

    const tierUnits = TECH_TIERS[techTier];
    if (!tierUnits) {
      console.warn(`Unknown tech tier: ${techTier}`);
      return;
    }

    const unlocked = this.unlockedUnits.get(govType) || new Set();
    
    // Unlock all units for this tier
    for (const unitId of tierUnits.units) {
      unlocked.add(unitId);
    }
    
    this.unlockedUnits.set(govType, unlocked);
    console.log(`Unlocked ${tierUnits.units.length} units for ${govType} at tier ${techTier}`);
  }

  /**
   * Get detailed stats for a specific unit
   */
  getUnitStats(unitId) {
    // Search all government unit pools
    for (const govUnits of Object.values(GOVERNMENT_UNITS)) {
      if (govUnits[unitId]) {
        return {
          ...govUnits[unitId],
          // Calculate effective stats with affinity bonus
          effectiveStats: {
            attack: govUnits[unitId].stats.attack * (1 + govUnits[unitId].affinityBonus.value),
            defense: govUnits[unitId].stats.defense * (1 + govUnits[unitId].affinityBonus.value),
            speed: govUnits[unitId].stats.speed,
            health: govUnits[unitId].stats.health
          }
        };
      }
    }
    return null;
  }

  /**
   * Check if a unit is unlocked for the current government
   */
  isUnitUnlocked(unitId, govType) {
    const unlocked = this.unlockedUnits.get(govType);
    return unlocked ? unlocked.has(unitId) : false;
  }

  /**
   * Get all available unit IDs for a government
   */
  getAvailableUnitIds(govType) {
    return Array.from(this.unlockedUnits.get(govType) || []);
  }

  /**
   * Get the government affinity bonus type
   */
  getAffinityBonus(govType) {
    const gov = GOVERNMENT_TYPES[govType.toUpperCase()];
    return gov ? gov.affinityBonus : null;
  }

  /**
   * Calculate unit cost with government discount
   */
  calculateUnitCost(unitId, govType) {
    const unit = this.getUnitStats(unitId);
    if (!unit) return null;

    const affinity = this.getAffinityBonus(govType);
    let discount = 0;

    // Apply affinity-based discounts
    switch (affinity?.type) {
      case 'discipline': // Autocracy
        discount = 0.1;
        break;
      case 'morale': // Democracy
        discount = 0.05;
        break;
      case 'blessing': // Theocracy
        discount = 0.08;
        break;
      case 'gold': // Oligarchy
        discount = 0.15;
        break;
      case 'fear': // Military Junta
        discount = 0.1;
        break;
    }

    return {
      gold: Math.floor(unit.cost.gold * (1 - discount)),
      population: unit.cost.population
    };
  }
}

export default GovernmentUnitSystem;
