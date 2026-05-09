/**
 * ArmyManager - Military logistics and army composition system
 * Phase 5B: Military System
 * 
 * Player handles military logistics while AI Ruler commands strategy.
 * Players configure army equipment, unit composition, and tactics.
 */

export const UNIT_TYPES = {
  INFANTRY: {
    id: 'infantry',
    name: 'Infantry',
    icon: '🛡️',
    description: 'Versatile foot soldiers, backbone of any army',
    cost: { gold: 50, population: 100 },
    stats: {
      attack: 10,
      defense: 12,
      speed: 5,
      health: 100
    },
    strengths: ['infantry', 'archer'],
    weaknesses: ['cavalry']
  },
  ARCHER: {
    id: 'archer',
    name: 'Archers',
    icon: '🏹',
    description: 'Ranged attackers, effective against infantry',
    cost: { gold: 60, population: 80 },
    stats: {
      attack: 14,
      defense: 6,
      speed: 6,
      health: 70
    },
    strengths: ['infantry', 'cavalry'],
    weaknesses: ['archer']
  },
  CAVALRY: {
    id: 'cavalry',
    name: 'Cavalry',
    icon: '🐴',
    description: 'Fast and powerful, crushes infantry lines',
    cost: { gold: 100, population: 120 },
    stats: {
      attack: 16,
      defense: 10,
      speed: 12,
      health: 120
    },
    strengths: ['infantry', 'siege'],
    weaknesses: ['spearmen']
  },
  SPEARMEN: {
    id: 'spearmen',
    name: 'Spearmen',
    icon: '🗡️',
    description: 'Anti-cavalry specialists with pikes',
    cost: { gold: 55, population: 90 },
    stats: {
      attack: 8,
      defense: 14,
      speed: 4,
      health: 110
    },
    strengths: ['cavalry'],
    weaknesses: ['archer', 'infantry']
  },
  SIEGE: {
    id: 'siege',
    name: 'Siege Engines',
    icon: '🎯',
    description: 'Devastating against fortified positions',
    cost: { gold: 150, population: 60 },
    stats: {
      attack: 25,
      defense: 4,
      speed: 2,
      health: 80
    },
    strengths: ['fortifications'],
    weaknesses: ['cavalry', 'archer']
  }
};

export const TACTICS = {
  AGGRESSIVE: {
    id: 'aggressive',
    name: 'Aggressive Assault',
    icon: '⚔️',
    description: 'All-out attack, high risk high reward',
    modifiers: {
      attackBonus: 0.3,
      defenseBonus: -0.2,
      moraleBonus: 0.1
    }
  },
  DEFENSIVE: {
    id: 'defensive',
    name: 'Defensive Formation',
    icon: '🛡️',
    description: 'Hold ground, minimize casualties',
    modifiers: {
      attackBonus: -0.1,
      defenseBonus: 0.4,
      moraleBonus: 0.05
    }
  },
  FLANKING: {
    id: 'flanking',
    name: 'Flanking Maneuver',
    icon: '↔️',
    description: 'Use speed to outmaneuver enemy',
    modifiers: {
      attackBonus: 0.2,
      defenseBonus: 0.1,
      speedBonus: 0.3
    }
  },
  BALANCED: {
    id: 'balanced',
    name: 'Balanced Approach',
    icon: '⚖️',
    description: 'Adaptable strategy, no penalties',
    modifiers: {
      attackBonus: 0.1,
      defenseBonus: 0.1,
      moraleBonus: 0.1
    }
  },
  AMBUSH: {
    id: 'ambush',
    name: 'Ambush Tactics',
    icon: '🌲',
    description: 'Wait for opportunity, bonus in forests',
    modifiers: {
      attackBonus: 0.15,
      defenseBonus: 0.05,
      terrainBonus: 0.25 // Extra bonus in forest/mountains
    }
  }
};

export const EQUIPMENT = {
  BASIC: {
    id: 'basic',
    name: 'Basic Equipment',
    cost: 0,
    modifiers: { attack: 0, defense: 0, morale: 0 }
  },
  QUALITY: {
    id: 'quality',
    name: 'Quality Arms',
    cost: 200,
    modifiers: { attack: 0.15, defense: 0.1, morale: 0.1 }
  },
  ELITE: {
    id: 'elite',
    name: 'Elite Equipment',
    cost: 500,
    modifiers: { attack: 0.3, defense: 0.25, morale: 0.2 }
  }
};

export class Army {
  constructor(id, nationId, x, y) {
    this.id = id;
    this.nationId = nationId;
    this.x = x;
    this.y = y;
    
    // Army composition
    this.units = {
      infantry: 0,
      archer: 0,
      cavalry: 0,
      spearmen: 0,
      siege: 0
    };
    
    // Configuration
    this.tactic = 'balanced';
    this.equipment = 'basic';
    
    // State
    this.morale = 100;
    this.experience = 0;
    this.isMoving = false;
    this.targetX = null;
    this.targetY = null;
    this.moveSpeed = 1; // Tiles per update
  }
  
  /**
   * Calculate total army strength
   */
  calculateStrength() {
    let totalStrength = 0;
    
    for (const [unitType, count] of Object.entries(this.units)) {
      if (count > 0 && UNIT_TYPES[unitType.toUpperCase()]) {
        const unitStats = UNIT_TYPES[unitType.toUpperCase()].stats;
        const unitStrength = (unitStats.attack + unitStats.defense) * count;
        totalStrength += unitStrength;
      }
    }
    
    // Apply equipment modifier
    const equipMod = EQUIPMENT[this.equipment.toUpperCase()];
    if (equipMod) {
      totalStrength *= (1 + equipMod.modifiers.attack + equipMod.modifiers.defense);
    }
    
    // Apply morale modifier
    totalStrength *= (this.morale / 100);
    
    // Apply experience bonus (up to +50%)
    const expBonus = Math.min(this.experience / 10, 0.5);
    totalStrength *= (1 + expBonus);
    
    return Math.floor(totalStrength);
  }
  
  /**
   * Get total unit count
   */
  getTotalUnits() {
    return Object.values(this.units).reduce((sum, count) => sum + count, 0);
  }
  
  /**
   * Calculate army speed (for movement)
   */
  calculateSpeed() {
    let totalSpeed = 0;
    let totalUnits = 0;
    
    for (const [unitType, count] of Object.entries(this.units)) {
      if (count > 0 && UNIT_TYPES[unitType.toUpperCase()]) {
        const unitStats = UNIT_TYPES[unitType.toUpperCase()].stats;
        totalSpeed += unitStats.speed * count;
        totalUnits += count;
      }
    }
    
    return totalUnits > 0 ? totalSpeed / totalUnits : 0;
  }
  
  /**
   * Calculate upkeep cost
   */
  calculateUpkeep() {
    const baseUpkeep = this.getTotalUnits() * 2;
    
    // Elite equipment costs more to maintain
    const equipMultiplier = this.equipment === 'elite' ? 1.5 : 
                           this.equipment === 'quality' ? 1.2 : 1.0;
    
    return Math.floor(baseUpkeep * equipMultiplier);
  }
  
  /**
   * Move towards target location
   */
  updateMovement(deltaTime) {
    if (!this.isMoving || this.targetX === null || this.targetY === null) {
      return;
    }
    
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 0.5) {
      // Reached destination
      this.x = this.targetX;
      this.y = this.targetY;
      this.isMoving = false;
      this.targetX = null;
      this.targetY = null;
      return;
    }
    
    // Move towards target
    const speed = this.calculateSpeed() * this.moveSpeed * deltaTime;
    const moveX = (dx / distance) * speed;
    const moveY = (dy / distance) * speed;
    
    this.x += moveX;
    this.y += moveY;
  }
  
  /**
   * Order army to move to location
   */
  moveTo(x, y) {
    this.targetX = x;
    this.targetY = y;
    this.isMoving = true;
  }
  
  /**
   * Add casualties after battle
   */
  applyCasualties(percentage) {
    for (const unitType in this.units) {
      const losses = Math.floor(this.units[unitType] * percentage);
      this.units[unitType] = Math.max(0, this.units[unitType] - losses);
    }
    
    // Morale loss from casualties
    this.morale = Math.max(0, this.morale - (percentage * 50));
  }
  
  /**
   * Gain experience from battle
   */
  gainExperience(amount) {
    this.experience += amount;
    
    // Morale boost from victory
    this.morale = Math.min(100, this.morale + (amount * 2));
  }
  
  /**
   * Check if army is destroyed
   */
  isDestroyed() {
    return this.getTotalUnits() === 0;
  }
}

export class ArmyManager {
  constructor(worldManager) {
    this.worldManager = worldManager;
    this.armies = new Map(); // armyId -> Army
    this.nextArmyId = 0;
    this.selectedArmy = null;
  }
  
  /**
   * Create a new army
   */
  createArmy(nationId, x, y, composition = null) {
    const army = new Army(`army_${nationId}_${this.nextArmyId++}`, nationId, x, y);
    
    if (composition) {
      army.units = { ...composition };
      army.tactic = composition.tactic || 'balanced';
      army.equipment = composition.equipment || 'basic';
    }
    
    this.armies.set(army.id, army);
    
    // Add to nation's army list
    const nation = this.worldManager.nations.find(n => n.id === nationId);
    if (nation) {
      if (!nation.armies) nation.armies = [];
      nation.armies.push(army);
    }
    
    return army;
  }
  
  /**
   * Get army by ID
   */
  getArmy(armyId) {
    return this.armies.get(armyId);
  }
  
  /**
   * Get all armies for a nation
   */
  getArmiesForNation(nationId) {
    return Array.from(this.armies.values()).filter(a => a.nationId === nationId);
  }
  
  /**
   * Delete army
   */
  deleteArmy(armyId) {
    const army = this.armies.get(armyId);
    if (!army) return;
    
    // Remove from nation
    const nation = this.worldManager.nations.find(n => n.id === army.nationId);
    if (nation && nation.armies) {
      nation.armies = nation.armies.filter(a => a.id !== armyId);
    }
    
    this.armies.delete(armyId);
  }
  
  /**
   * Update all armies (movement)
   */
  update(deltaTime) {
    for (const army of this.armies.values()) {
      army.updateMovement(deltaTime);
    }
  }
  
  /**
   * Get armies at a specific tile
   */
  getArmiesAtTile(x, y) {
    return Array.from(this.armies.values()).filter(army => {
      const roundX = Math.round(army.x);
      const roundY = Math.round(army.y);
      return roundX === x && roundY === y;
    });
  }
  
  /**
   * Calculate total cost for army composition
   */
  calculateArmyCost(composition) {
    let totalGold = 0;
    let totalPopulation = 0;
    
    for (const [unitType, count] of Object.entries(composition)) {
      if (count > 0 && UNIT_TYPES[unitType.toUpperCase()]) {
        const unitCost = UNIT_TYPES[unitType.toUpperCase()].cost;
        totalGold += unitCost.gold * count;
        totalPopulation += unitCost.population * count;
      }
    }
    
    // Add equipment cost
    if (composition.equipment && EQUIPMENT[composition.equipment.toUpperCase()]) {
      totalGold += EQUIPMENT[composition.equipment.toUpperCase()].cost;
    }
    
    return { gold: totalGold, population: totalPopulation };
  }
  
  /**
   * Check if nation can afford army composition
   */
  canAffordArmy(nationId, composition) {
    const nation = this.worldManager.nations.find(n => n.id === nationId);
    if (!nation) return false;
    
    const cost = this.calculateArmyCost(composition);
    
    return nation.gold >= cost.gold && 
           nation.getTotalPopulation() >= cost.population;
  }
  
  /**
   * Recruit army (deduct resources)
   */
  recruitArmy(nationId, x, y, composition) {
    if (!this.canAffordArmy(nationId, composition)) {
      return null;
    }
    
    const nation = this.worldManager.nations.find(n => n.id === nationId);
    const cost = this.calculateArmyCost(composition);
    
    // Deduct resources
    nation.gold -= cost.gold;
    
    // Deduct population from cities (proportionally)
    const totalPop = nation.getTotalPopulation();
    let remainingPop = cost.population;
    
    for (const city of nation.cities) {
      if (remainingPop <= 0) break;
      
      const cityShare = (city.population / totalPop) * cost.population;
      const deduction = Math.min(cityShare, remainingPop, city.population * 0.3); // Max 30% from one city
      city.population -= deduction;
      remainingPop -= deduction;
    }
    
    // Create army
    return this.createArmy(nationId, x, y, composition);
  }
}
