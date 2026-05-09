import { UNIT_TYPES, TACTICS, EQUIPMENT } from './ArmyManager.js';
import { BIOMES } from './config.js';

/**
 * BattleSystem - Auto-battler combat resolution
 * Phase 5B: Military System
 * 
 * Calculates battle outcomes based on:
 * - Army composition and size
 * - Ruler traits and aptitude
 * - Tactics and equipment
 * - Terrain and positioning
 * - Morale and experience
 */

export class BattleSystem {
  constructor(worldManager) {
    this.worldManager = worldManager;
    this.activeBattles = [];
    this.battleHistory = [];
  }
  
  /**
   * Initiate battle between two armies
   */
  initiateBattle(attacker, defender, tileX, tileY) {
    const tile = this.worldManager.world.tiles[tileY][tileX];
    const biome = tile.biome;
    
    const battle = {
      id: `battle_${Date.now()}`,
      attacker: attacker,
      defender: defender,
      location: { x: tileX, y: tileY },
      biome: biome,
      startTime: Date.now(),
      phase: 'calculating' // calculating -> ongoing -> resolved
    };
    
    // Calculate battle outcome
    const result = this.calculateBattleOutcome(battle);
    battle.result = result;
    battle.phase = 'resolved';
    
    // Apply casualties
    this.applyBattleResult(attacker, defender, result);
    
    // Store in history
    this.battleHistory.push(battle);
    if (this.battleHistory.length > 50) {
      this.battleHistory.shift();
    }
    
    return battle;
  }
  
  /**
   * Calculate battle outcome using comprehensive factors
   */
  calculateBattleOutcome(battle) {
    const attacker = battle.attacker;
    const defender = battle.defender;
    const biome = battle.biome;
    
    // Get ruler traits
    const attackerNation = this.worldManager.nations.find(n => n.id === attacker.nationId);
    const defenderNation = this.worldManager.nations.find(n => n.id === defender.nationId);
    
    // 1. BASE STRENGTH
    let attackerStrength = this.calculateArmyStrength(attacker, attackerNation, true);
    let defenderStrength = this.calculateArmyStrength(defender, defenderNation, false);
    
    // 2. TACTICAL MODIFIERS
    attackerStrength *= this.getTacticalModifier(attacker, defender);
    defenderStrength *= this.getTacticalModifier(defender, attacker);
    
    // 3. TERRAIN EFFECTS
    attackerStrength *= this.getTerrainModifier(attacker, biome, true);
    defenderStrength *= this.getTerrainModifier(defender, biome, false);
    
    // 4. RULER APTITUDE
    attackerStrength *= this.getRulerAptitude(attackerNation, true);
    defenderStrength *= this.getRulerAptitude(defenderNation, false);
    
    // 5. EQUIPMENT QUALITY
    attackerStrength *= this.getEquipmentModifier(attacker);
    defenderStrength *= this.getEquipmentModifier(defender);
    
    // 6. UNIT COMPOSITION EFFECTIVENESS
    const compositionBonus = this.calculateCompositionEffectiveness(attacker, defender);
    attackerStrength *= compositionBonus.attacker;
    defenderStrength *= compositionBonus.defender;
    
    // 7. DEFENDER ADVANTAGE (fortification, defensive position)
    defenderStrength *= 1.2; // Base defender bonus
    
    // Check for fortifications at battle location
    if (defenderNation.fortresses) {
      const hasFortress = defenderNation.fortresses.some(f => 
        Math.abs(f.x - battle.location.x) < 2 && 
        Math.abs(f.y - battle.location.y) < 2
      );
      if (hasFortress) {
        defenderStrength *= 1.5; // Major fortress bonus
      }
    }
    
    // 8. CALCULATE OUTCOME
    const totalStrength = attackerStrength + defenderStrength;
    const attackerChance = attackerStrength / totalStrength;
    const defenderChance = defenderStrength / totalStrength;
    
    // Determine victor
    let victor, loser, victorChance;
    if (attackerChance > defenderChance) {
      victor = 'attacker';
      loser = 'defender';
      victorChance = attackerChance;
    } else {
      victor = 'defender';
      loser = 'attacker';
      victorChance = defenderChance;
    }
    
    // Calculate casualties
    const strengthRatio = Math.max(attackerStrength, defenderStrength) / 
                         Math.min(attackerStrength, defenderStrength);
    
    // Winner casualties: 10-30% based on how close the fight was
    const victorCasualties = 0.3 - ((strengthRatio - 1) * 0.1);
    
    // Loser casualties: 40-80% based on how badly they lost
    const loserCasualties = 0.4 + ((strengthRatio - 1) * 0.2);
    
    return {
      victor: victor,
      attackerCasualties: Math.max(0.05, Math.min(0.95, victor === 'attacker' ? victorCasualties : loserCasualties)),
      defenderCasualties: Math.max(0.05, Math.min(0.95, victor === 'defender' ? victorCasualties : loserCasualties)),
      attackerStrength: Math.floor(attackerStrength),
      defenderStrength: Math.floor(defenderStrength),
      decisive: strengthRatio > 2, // Decisive victory if 2x stronger
      factors: {
        terrain: biome,
        attackerTactic: attacker.tactic,
        defenderTactic: defender.tactic,
        fortified: defenderStrength > attackerStrength * 1.3
      }
    };
  }
  
  /**
   * Calculate total army strength
   */
  calculateArmyStrength(army, nation, isAttacker) {
    let strength = 0;
    
    // Base unit strength
    for (const [unitType, count] of Object.entries(army.units)) {
      if (count > 0 && UNIT_TYPES[unitType.toUpperCase()]) {
        const stats = UNIT_TYPES[unitType.toUpperCase()].stats;
        const unitStrength = isAttacker ? 
          (stats.attack * 1.2 + stats.defense * 0.8) :
          (stats.attack * 0.8 + stats.defense * 1.2);
        strength += unitStrength * count;
      }
    }
    
    // Morale modifier
    strength *= (army.morale / 100);
    
    // Experience bonus (up to +50%)
    const expBonus = Math.min(army.experience / 10, 0.5);
    strength *= (1 + expBonus);
    
    // Size matters but with diminishing returns
    const totalUnits = army.getTotalUnits();
    const sizeMultiplier = 1 + Math.log10(Math.max(1, totalUnits / 10));
    strength *= sizeMultiplier;
    
    return strength;
  }
  
  /**
   * Get tactical modifier based on chosen tactics
   */
  getTacticalModifier(army, enemy) {
    const tactic = TACTICS[army.tactic.toUpperCase()];
    if (!tactic) return 1.0;
    
    let modifier = 1.0;
    
    // Apply tactic modifiers
    modifier += tactic.modifiers.attackBonus || 0;
    modifier += tactic.modifiers.defenseBonus || 0;
    
    // Counter-tactics (rock-paper-scissors element)
    if (army.tactic === 'aggressive' && enemy.tactic === 'defensive') {
      modifier *= 0.85; // Aggressive struggles against defensive
    } else if (army.tactic === 'defensive' && enemy.tactic === 'flanking') {
      modifier *= 0.85; // Defensive vulnerable to flanking
    } else if (army.tactic === 'flanking' && enemy.tactic === 'aggressive') {
      modifier *= 1.15; // Flanking exploits aggressive overextension
    }
    
    return modifier;
  }
  
  /**
   * Terrain effects on army performance
   */
  getTerrainModifier(army, biome, isAttacker) {
    let modifier = 1.0;
    const tactic = TACTICS[army.tactic.toUpperCase()];
    
    // Ambush tactic gets terrain bonus (compare to string keys since biomes are stored as strings)
    if (tactic && tactic.modifiers.terrainBonus) {
      if (biome === 'forest' || biome === 'mountains') {
        modifier += tactic.modifiers.terrainBonus;
      }
    }
    
    // Cavalry struggles in forests/mountains
    const cavalryRatio = army.units.cavalry / Math.max(1, army.getTotalUnits());
    if (biome === 'forest' || biome === 'mountains') {
      modifier *= (1 - cavalryRatio * 0.3); // Up to -30% if all cavalry
    }
    
    // Siege engines struggle in difficult terrain
    const siegeRatio = army.units.siege / Math.max(1, army.getTotalUnits());
    if (biome === 'mountains' || biome === 'forest') {
      modifier *= (1 - siegeRatio * 0.4); // Up to -40% if all siege
    }
    
    // Plains favor cavalry
    if (biome === 'plains' && cavalryRatio > 0.3) {
      modifier *= 1.15;
    }
    
    // Attackers struggle in mountains
    if (isAttacker && biome === 'mountains') {
      modifier *= 0.85;
    }
    
    return modifier;
  }
  
  /**
   * Ruler traits affect military performance
   */
  getRulerAptitude(nation, isAttacker) {
    if (!nation || !nation.ruler) return 1.0;
    
    const traits = nation.ruler.positiveTraits.concat(nation.ruler.negativeTraits);
    let modifier = 1.0;
    
    // Positive traits
    if (traits.includes('brave')) modifier += 0.15;
    if (traits.includes('decisive')) modifier += 0.12;
    if (traits.includes('brilliant')) modifier += 0.1;
    if (traits.includes('ambitious') && isAttacker) modifier += 0.08;
    
    // Negative traits
    if (traits.includes('weak-willed')) modifier -= 0.15;
    if (traits.includes('slothful')) modifier -= 0.12;
    if (traits.includes('impulsive')) modifier -= 0.08;
    if (traits.includes('paranoid') && isAttacker) modifier -= 0.1; // Paranoid rulers hesitate on offense
    if (traits.includes('wrathful') && !isAttacker) modifier -= 0.08; // Wrathful rulers weak on defense
    
    // Government type
    if (nation.ruler.governmentType === 'militarism') {
      modifier += 0.15;
    } else if (nation.ruler.governmentType === 'theocracy') {
      modifier += 0.05; // Morale bonus
    }
    
    return modifier;
  }
  
  /**
   * Equipment quality modifier
   */
  getEquipmentModifier(army) {
    const equip = EQUIPMENT[army.equipment.toUpperCase()];
    if (!equip) return 1.0;
    
    return 1 + equip.modifiers.attack + equip.modifiers.defense + equip.modifiers.morale;
  }
  
  /**
   * Calculate unit composition effectiveness (counter units)
   */
  calculateCompositionEffectiveness(attacker, defender) {
    let attackerBonus = 1.0;
    let defenderBonus = 1.0;
    
    const attackerTotal = attacker.getTotalUnits();
    const defenderTotal = defender.getTotalUnits();
    
    if (attackerTotal === 0 || defenderTotal === 0) {
      return { attacker: attackerBonus, defender: defenderBonus };
    }
    
    // Check each unit type matchup
    for (const [unitType, count] of Object.entries(attacker.units)) {
      if (count === 0) continue;
      
      const unit = UNIT_TYPES[unitType.toUpperCase()];
      if (!unit) continue;
      
      const ratio = count / attackerTotal;
      
      // Check if this unit is strong against defender's composition
      for (const [defUnitType, defCount] of Object.entries(defender.units)) {
        if (defCount === 0) continue;
        
        const defRatio = defCount / defenderTotal;
        
        if (unit.strengths.includes(defUnitType)) {
          attackerBonus += ratio * defRatio * 0.2; // Up to +20% per matchup
        }
        if (unit.weaknesses.includes(defUnitType)) {
          attackerBonus -= ratio * defRatio * 0.15; // Up to -15% per counter
        }
      }
    }
    
    // Same for defender
    for (const [unitType, count] of Object.entries(defender.units)) {
      if (count === 0) continue;
      
      const unit = UNIT_TYPES[unitType.toUpperCase()];
      if (!unit) continue;
      
      const ratio = count / defenderTotal;
      
      for (const [attUnitType, attCount] of Object.entries(attacker.units)) {
        if (attCount === 0) continue;
        
        const attRatio = attCount / attackerTotal;
        
        if (unit.strengths.includes(attUnitType)) {
          defenderBonus += ratio * attRatio * 0.2;
        }
        if (unit.weaknesses.includes(attUnitType)) {
          defenderBonus -= ratio * attRatio * 0.15;
        }
      }
    }
    
    return {
      attacker: Math.max(0.5, attackerBonus), // Cap at 50% reduction
      defender: Math.max(0.5, defenderBonus)
    };
  }
  
  /**
   * Apply battle results to armies
   */
  applyBattleResult(attacker, defender, result) {
    // Apply casualties
    attacker.applyCasualties(result.attackerCasualties);
    defender.applyCasualties(result.defenderCasualties);
    
    // Grant experience
    const expGain = result.decisive ? 3 : 2;
    if (result.victor === 'attacker') {
      attacker.gainExperience(expGain);
    } else {
      defender.gainExperience(expGain);
    }
    
    // Loser morale penalty
    if (result.victor === 'attacker') {
      defender.morale = Math.max(0, defender.morale - 20);
    } else {
      attacker.morale = Math.max(0, attacker.morale - 20);
    }
    
    // Phase 5C: Process conquest
    if (this.worldManager.conquestSystem) {
      const victorArmy = result.victor === 'attacker' ? attacker : defender;
      const defeatedArmy = result.victor === 'attacker' ? defender : attacker;
      
      // Create battle reference for conquest
      const battle = {
        attacker: attacker,
        defender: defender,
        location: { x: Math.round(attacker.x), y: Math.round(attacker.y) },
        result: result
      };
      
      this.worldManager.conquestSystem.processConquest(battle, victorArmy, defeatedArmy);
    }
  }
  
  /**
   * Get battle report text
   */
  getBattleReport(battle) {
    const result = battle.result;
    const attackerNation = this.worldManager.nations.find(n => n.id === battle.attacker.nationId);
    const defenderNation = this.worldManager.nations.find(n => n.id === battle.defender.nationId);
    
    const victorNation = result.victor === 'attacker' ? attackerNation : defenderNation;
    const loserNation = result.victor === 'attacker' ? defenderNation : attackerNation;
    
    // Use string keys since biomes are stored as strings
    const biomeNames = {
      'plains': 'plains',
      'forest': 'forest',
      'mountains': 'mountains',
      'desert': 'desert',
      'arctic': 'arctic tundra',
      'ocean': 'coast'
    };
    
    let report = `**Battle at ${biomeNames[battle.biome] || 'the battlefield'}**\n\n`;
    report += `${attackerNation.name} (${battle.attacker.getTotalUnits()} troops) attacked `;
    report += `${defenderNation.name} (${battle.defender.getTotalUnits()} troops)\n\n`;
    
    if (result.decisive) {
      report += `🎖️ **DECISIVE VICTORY** for ${victorNation.name}!\n\n`;
    } else {
      report += `⚔️ **VICTORY** for ${victorNation.name}\n\n`;
    }
    
    report += `Casualties:\n`;
    report += `- ${attackerNation.name}: ${Math.floor(result.attackerCasualties * 100)}% losses\n`;
    report += `- ${defenderNation.name}: ${Math.floor(result.defenderCasualties * 100)}% losses\n\n`;
    
    report += `Combat Strength:\n`;
    report += `- Attacker: ${result.attackerStrength}\n`;
    report += `- Defender: ${result.defenderStrength}\n\n`;
    
    if (result.factors.fortified) {
      report += `🏰 Defender held fortified position\n`;
    }
    
    return report;
  }
  
  /**
   * Check for battles at a location
   */
  checkForBattles() {
    const armyManager = this.worldManager.armyManager;
    if (!armyManager) return;
    
    const armies = Array.from(armyManager.armies.values());
    const checkedPairs = new Set();
    
    for (let i = 0; i < armies.length; i++) {
      for (let j = i + 1; j < armies.length; j++) {
        const army1 = armies[i];
        const army2 = armies[j];
        
        // Skip if same nation
        if (army1.nationId === army2.nationId) continue;
        
        // Skip if already checked this pair
        const pairKey = `${army1.id}-${army2.id}`;
        if (checkedPairs.has(pairKey)) continue;
        checkedPairs.add(pairKey);
        
        // Check if at same location
        const dist = Math.sqrt(
          Math.pow(army1.x - army2.x, 2) + 
          Math.pow(army1.y - army2.y, 2)
        );
        
        if (dist < 1.5) {
          // Check if nations are at war
          const nation1 = this.worldManager.nations.find(n => n.id === army1.nationId);
          const nation2 = this.worldManager.nations.find(n => n.id === army2.nationId);
          
          if (this.areNationsAtWar(nation1, nation2)) {
            // Battle!
            const tileX = Math.round(army1.x);
            const tileY = Math.round(army1.y);
            
            const battle = this.initiateBattle(army1, army2, tileX, tileY);
            
            // Notify player if involved
            if (army1.nationId === 0 || army2.nationId === 0) {
              const report = this.getBattleReport(battle);
              this.worldManager.showNotification('⚔️ BATTLE!', 'warning');
              console.log(report);
              
              // Show detailed battle report
              if (this.worldManager.gameUI) {
                this.worldManager.gameUI.showBattleReport(battle);
              }
              
              // Check for battle mistakes (Phase 5D)
              if (this.worldManager.mistakeDetector) {
                this.worldManager.mistakeDetector.checkBattleResult(battle);
              }
            }
            
            // Remove destroyed armies
            if (army1.isDestroyed()) {
              armyManager.deleteArmy(army1.id);
            }
            if (army2.isDestroyed()) {
              armyManager.deleteArmy(army2.id);
            }
          }
        }
      }
    }
  }
  
  /**
   * Check if two nations are at war
   */
  areNationsAtWar(nation1, nation2) {
    // Check war states
    if (nation1.wars && nation1.wars.some(w => w.enemyId === nation2.id)) {
      return true;
    }
    if (nation2.wars && nation2.wars.some(w => w.enemyId === nation1.id)) {
      return true;
    }
    
    // Check diplomacy manager
    if (this.worldManager.diplomacyManager) {
      return this.worldManager.diplomacyManager.areNationsAtWar(nation1.id, nation2.id);
    }
    
    return false;
  }
}
