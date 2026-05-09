/**
 * VictorySystem.js - Shadow Council Victory Conditions
 * Phase 2: Victory Conditions Framework
 * 
 * Systems Architect: Circuit
 * 
 * Defines 5 victory conditions and defeat conditions
 * Integrates with existing gameState and nation structures
 */

import { WORLD_CONFIG } from './config.js';

export class VictorySystem {
  constructor(worldManager) {
    this.worldManager = worldManager;
    this.gameEnded = false;
    this.victoryType = null;
    this.defeatType = null;
    
    // Time-based victory checking
    this.lastVictoryCheckTime = Date.now();
    this.victoryCheckInterval = 30000; // Check every 30 seconds at 1x speed
    
    // Victory condition thresholds
    this.thresholds = {
      domination: {
        territoryPercent: 0.60, // 60% of world territory
        territoryName: 'Domination'
      },
      diplomatic: {
        alliedPercent: 0.75, // 75% of surviving nations
        diplomaticName: 'Diplomatic'
      },
      economic: {
        goldTarget: 50000, // 50,000 gold treasury
        economicName: 'Economic'
      },
      conquest: {
        eliminateAll: true,
        conquestName: 'Conquest'
      },
      prestige: {
        // Prestige = city count * 1000 + total population
        prestigeThreshold: 25000, // Combined score threshold
        prestigeName: 'Prestige'
      }
    };
    
    // Track victory progress for UI
    this.victoryProgress = {
      domination: 0,
      diplomatic: 0,
      economic: 0,
      conquest: 0,
      prestige: 0
    };
  }
  
  /**
   * Process elapsed time and check victory conditions
   * @param {number} elapsedMs - Milliseconds that have elapsed (already scaled by gameSpeed)
   * @returns {object} - Victory check results (only updated if check is due)
   */
  processTimeElapsed(elapsedMs) {
    const now = Date.now();
    const timeSinceLastCheck = now - this.lastVictoryCheckTime;
    
    if (timeSinceLastCheck < this.victoryCheckInterval) {
      // Not time to check yet - return cached result
      return {
        checked: false,
        victory: this.victoryType !== null,
        type: this.victoryType,
        defeat: this.defeatType !== null,
        defeatType: this.defeatType,
        progress: this.victoryProgress,
        nextCheckIn: this.victoryCheckInterval - timeSinceLastCheck
      };
    }
    
    // Time to check - run full victory check
    this.lastVictoryCheckTime = now;
    return this.checkVictoryConditions();
  }
  
  /**
   * Set victory check interval
   * @param {number} intervalMs - Milliseconds between checks at 1x speed
   */
  setVictoryCheckInterval(intervalMs) {
    this.victoryCheckInterval = intervalMs;
  }
  
  /**
   * Get the player nation from worldManager
   */
  getPlayerNation() {
    return this.worldManager.nations[0];
  }
  
  /**
   * Get all surviving nations (not eliminated)
   */
  getSurvivingNations() {
    return this.worldManager.nations.filter(nation => {
      return nation.cities.length > 0 || nation.controlledTiles.length > 0;
    });
  }
  
  /**
   * Calculate total world territory (all controlled tiles)
   */
  getTotalWorldTerritory() {
    let total = 0;
    this.worldManager.nations.forEach(nation => {
      total += nation.controlledTiles.length;
    });
    // Also count influence-based territory
    if (this.worldManager.world && this.worldManager.world.tiles) {
      total = this.worldManager.world.tiles.length;
    }
    return total;
  }
  
  /**
   * Calculate player's controlled territory percentage
   */
  calculateTerritoryPercent() {
    const playerNation = this.getPlayerNation();
    if (!playerNation) return 0;
    
    // Count directly controlled tiles
    let playerTiles = playerNation.controlledTiles.length;
    
    // Count cities as territory (each city controls surrounding area)
    playerNation.cities.forEach(city => {
      const cityRadius = Math.ceil(city.getVisualSize() * 3);
      playerTiles += cityRadius * cityRadius; // Approximate area
    });
    
    // Get world total if available
    let totalTiles = 100; // Default fallback
    if (this.worldManager.world && this.worldManager.world.tiles) {
      totalTiles = this.worldManager.world.tiles.length;
    }
    
    return playerTiles / totalTiles;
  }
  
  /**
   * Check diplomatic victory - allied with 75% of surviving nations
   */
  calculateDiplomaticProgress() {
    const playerNation = this.getPlayerNation();
    if (!playerNation) return 0;
    
    const survivingNations = this.getSurvivingNations();
    if (survivingNations.length <= 1) return 0;
    
    // Count allied nations (not at war, positive relations)
    let alliedCount = 0;
    survivingNations.forEach(nation => {
      if (nation.id === playerNation.id) return;
      
      // Check if allied (no war and positive relations)
      const isAtWar = playerNation.wars && playerNation.wars.some(w => w.enemyId === nation.id);
      const hasAlliance = this.hasAllianceWith(playerNation, nation);
      
      if (!isAtWar && hasAlliance) {
        alliedCount++;
      }
    });
    
    return alliedCount / (survivingNations.length - 1); // Exclude player
  }
  
  /**
   * Check if two nations have an alliance
   */
  hasAllianceWith(nation1, nation2) {
    // Check diplomatic relationships
    // For now, check if they're not at war and have good relations
    const isAtWar = nation1.wars && nation1.wars.some(w => w.enemyId === nation2.id);
    if (isAtWar) return false;
    
    // Could check relation value here when diplomacy system is fully implemented
    return true;
  }
  
  /**
   * Calculate economic progress - gold treasury
   */
  calculateEconomicProgress() {
    const playerNation = this.getPlayerNation();
    if (!playerNation) return 0;
    
    return playerNation.gold / this.thresholds.economic.goldTarget;
  }
  
  /**
   * Calculate conquest progress - eliminated rival nations
   */
  calculateConquestProgress() {
    const survivingNations = this.getSurvivingNations();
    const playerNation = this.getPlayerNation();
    
    if (!playerNation) return 0;
    
    // Calculate how many rivals have been eliminated
    const totalRivals = this.worldManager.nations.length - 1;
    const eliminatedRivals = totalRivals - (survivingNations.length - 1);
    
    return eliminatedRivals / totalRivals;
  }
  
  /**
   * Calculate prestige progress - city count + population
   */
  calculatePrestigeProgress() {
    const playerNation = this.getPlayerNation();
    if (!playerNation) return 0;
    
    const cityScore = playerNation.cities.length * 1000;
    const populationScore = playerNation.getTotalPopulation();
    const totalScore = cityScore + populationScore;
    
    return totalScore / this.thresholds.prestige.prestigeThreshold;
  }
  
  /**
   * Main victory condition checker - call this each turn
   * Returns: { victory: boolean, type: string|null, progress: object }
   */
  checkVictoryConditions() {
    if (this.gameEnded) {
      return { 
        victory: this.victoryType !== null, 
        type: this.victoryType,
        defeat: this.defeatType !== null,
        defeatType: this.defeatType,
        progress: this.victoryProgress 
      };
    }
    
    // Update progress for each condition
    this.victoryProgress.domination = this.calculateTerritoryPercent();
    this.victoryProgress.diplomatic = this.calculateDiplomaticProgress();
    this.victoryProgress.economic = this.calculateEconomicProgress();
    this.victoryProgress.conquest = this.calculateConquestProgress();
    this.victoryProgress.prestige = this.calculatePrestigeProgress();
    
    // Check for defeat first (player eliminated)
    const defeatResult = this.checkDefeatConditions();
    if (defeatResult.defeated) {
      this.gameEnded = true;
      this.defeatType = defeatResult.type;
      return {
        victory: false,
        type: null,
        defeat: true,
        defeatType: this.defeatType,
        progress: this.victoryProgress
      };
    }
    
    // Check each victory condition
    if (this.victoryProgress.domination >= this.thresholds.domination.territoryPercent) {
      this.gameEnded = true;
      this.victoryType = 'domination';
      return {
        victory: true,
        type: this.victoryType,
        defeat: false,
        progress: this.victoryProgress
      };
    }
    
    if (this.victoryProgress.diplomatic >= this.thresholds.diplomatic.alliedPercent) {
      this.gameEnded = true;
      this.victoryType = 'diplomatic';
      return {
        victory: true,
        type: this.victoryType,
        defeat: false,
        progress: this.victoryProgress
      };
    }
    
    if (this.victoryProgress.economic >= 1.0) {
      this.gameEnded = true;
      this.victoryType = 'economic';
      return {
        victory: true,
        type: this.victoryType,
        defeat: false,
        progress: this.victoryProgress
      };
    }
    
    if (this.victoryProgress.conquest >= 1.0) {
      this.gameEnded = true;
      this.victoryType = 'conquest';
      return {
        victory: true,
        type: this.victoryType,
        defeat: false,
        progress: this.victoryProgress
      };
    }
    
    if (this.victoryProgress.prestige >= 1.0) {
      this.gameEnded = true;
      this.victoryType = 'prestige';
      return {
        victory: true,
        type: this.victoryType,
        defeat: false,
        progress: this.victoryProgress
      };
    }
    
    return {
      victory: false,
      type: null,
      defeat: false,
      defeatType: null,
      progress: this.victoryProgress
    };
  }
  
  /**
   * Check defeat conditions - player eliminated
   */
  checkDefeatConditions() {
    const playerNation = this.getPlayerNation();
    
    // Player has no cities and no territory
    if (!playerNation || (playerNation.cities.length === 0 && playerNation.controlledTiles.length === 0)) {
      return {
        defeated: true,
        type: 'eliminated',
        message: 'Your nation has been eliminated from the world!'
      };
    }
    
    // Player has no gold and no armies and no cities producing income
    if (playerNation.gold <= 0 && playerNation.armies.length === 0 && playerNation.cities.length === 0) {
      return {
        defeated: true,
        type: 'ruin',
        message: 'Your nation has fallen into ruin!'
      };
    }
    
    return {
      defeated: false,
      type: null
    };
  }
  
  /**
   * End the game - called when victory or defeat is triggered
   */
  endGame(result) {
    this.gameEnded = true;
    
    if (result.victory) {
      this.victoryType = result.type;
      this.defeatType = null;
      console.log(`🏆 VICTORY! ${this.getVictoryTitle(result.type)}`);
      console.log(`   ${this.getVictoryDescription(result.type)}`);
    } else if (result.defeat) {
      this.defeatType = result.type;
      this.victoryType = null;
      console.log(`💀 DEFEAT! ${this.getDefeatDescription(result.type)}`);
    }
    
    // Notify the world manager to stop the game
    if (this.worldManager) {
      this.worldManager.paused = true;
      this.worldManager.gameSpeed = 0;
    }
    
    return {
      victory: result.victory,
      victoryType: this.victoryType,
      defeat: result.defeat,
      defeatType: this.defeatType,
      message: result.victory 
        ? this.getVictoryDescription(result.type)
        : this.getDefeatDescription(result.type)
    };
  }
  
  /**
   * Get victory title for display
   */
  getVictoryTitle(type) {
    const titles = {
      domination: '🌍 World Domination',
      diplomatic: '🤝 Diplomatic Mastery',
      economic: '💰 Economic Supremacy',
      conquest: '⚔ Total Conquest',
      prestige: '👑 Prestige Victory'
    };
    return titles[type] || 'Unknown Victory';
  }
  
  /**
   * Get victory description
   */
  getVictoryDescription(type) {
    const descriptions = {
      domination: 'You have conquered 60% of the known world! Your empire stretches across continents.',
      diplomatic: 'You have allied with 75% of all surviving nations. Your diplomatic acumen is unmatched.',
      economic: 'Your treasury has reached 50,000 gold! Your economic power dominates the world.',
      conquest: 'You have eliminated every rival nation! Total conquest is yours.',
      prestige: 'Your cities flourish and your population thrives. You are the most prestigious ruler!'
    };
    return descriptions[type] || 'Unknown victory';
  }
  
  /**
   * Get defeat description
   */
  getDefeatDescription(type) {
    const descriptions = {
      eliminated: 'Your nation has been erased from the world. Your reign ends in defeat.',
      ruin: 'Your empire has collapsed into ruin. Nothing remains of your once-great nation.'
    };
    return descriptions[type] || 'You have been defeated.';
  }
  
  /**
   * Get victory progress for UI display
   */
  getProgressDisplay() {
    return {
      domination: {
        label: 'Domination',
        current: (this.victoryProgress.domination * 100).toFixed(1) + '%',
        target: (this.thresholds.domination.territoryPercent * 100) + '%',
        progress: this.victoryProgress.domination
      },
      diplomatic: {
        label: 'Diplomatic',
        current: (this.victoryProgress.diplomatic * 100).toFixed(1) + '%',
        target: (this.thresholds.diplomatic.alliedPercent * 100) + '%',
        progress: this.victoryProgress.diplomatic
      },
      economic: {
        label: 'Economic',
        current: this.getPlayerNation()?.gold || 0,
        target: this.thresholds.economic.goldTarget,
        progress: this.victoryProgress.economic
      },
      conquest: {
        label: 'Conquest',
        current: (this.victoryProgress.conquest * 100).toFixed(1) + '%',
        target: '100%',
        progress: this.victoryProgress.conquest
      },
      prestige: {
        label: 'Prestige',
        current: (this.getPlayerNation()?.cities.length || 0) + ' cities',
        target: 'High prestige',
        progress: this.victoryProgress.prestige
      }
    };
  }
  
  /**
   * Reset victory system for new game
   */
  reset() {
    this.gameEnded = false;
    this.victoryType = null;
    this.defeatType = null;
    this.lastVictoryCheckTime = Date.now();
    this.victoryProgress = {
      domination: 0,
      diplomatic: 0,
      economic: 0,
      conquest: 0,
      prestige: 0
    };
  }
}

export default VictorySystem;
