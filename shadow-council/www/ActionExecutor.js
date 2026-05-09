import { BIOMES } from './config.js';

/**
 * ActionExecutor - Parses advice text and executes concrete game actions
 * Phase 4: Action Execution System
 */
export class ActionExecutor {
  constructor(worldManager) {
    this.worldManager = worldManager;
    this.actionHistory = [];
  }
  
  /**
   * Parse advice text and execute matching actions
   * @param {string} adviceText - The counsel advice to parse
   * @returns {Object} Result of execution with success/failure messages
   */
  executeAdvice(adviceText) {
    const advice = adviceText.toLowerCase();
    const results = [];
    
    console.log('=== EXECUTING ADVICE ===');
    console.log('Input:', adviceText);
    
    // Try to match and execute actions in priority order
    
    // 1. City Building/Founding
    if (this.matchesCityBuilding(advice)) {
      const result = this.executeCityBuilding(advice);
      results.push(result);
    }
    
    // 2. Territory Expansion
    else if (this.matchesTerritoryExpansion(advice)) {
      const result = this.executeTerritoryExpansion(advice);
      results.push(result);
    }
    
    // 3. War Declaration
    else if (this.matchesWarDeclaration(advice)) {
      const result = this.executeWarDeclaration(advice);
      results.push(result);
    }
    
    // 4. Peace/Diplomacy
    else if (this.matchesDiplomacy(advice)) {
      const result = this.executeDiplomacy(advice);
      results.push(result);
    }
    
    // 5. Economic Focus
    else if (this.matchesEconomicAction(advice)) {
      const result = this.executeEconomicAction(advice);
      results.push(result);
    }
    
    // 6. Military Focus
    else if (this.matchesMilitaryAction(advice)) {
      const result = this.executeMilitaryAction(advice);
      results.push(result);
    }
    
    // 7. Generic "expand" or "grow"
    else if (this.matchesGenericGrowth(advice)) {
      const result = this.executeGenericGrowth(advice);
      results.push(result);
    }
    
    // No specific action matched - provide feedback
    else {
      results.push({
        success: true,
        type: 'acknowledged',
        message: 'Your counsel has been noted and will guide future decisions.',
        details: 'Strategic advice without immediate action'
      });
    }
    
    // Log all executed actions
    this.actionHistory.push({
      turn: this.worldManager.turnNumber,
      advice: adviceText,
      results: results,
      timestamp: Date.now()
    });
    
    return {
      success: results.some(r => r.success),
      results: results
    };
  }
  
  // ==================== MATCHING METHODS ====================
  
  matchesCityBuilding(advice) {
    const keywords = [
      'build.*city', 'found.*city', 'establish.*city', 'create.*city',
      'new.*city', 'settle.*new', 'build.*settlement', 'found.*settlement'
    ];
    return keywords.some(pattern => new RegExp(pattern).test(advice));
  }
  
  matchesTerritoryExpansion(advice) {
    const keywords = [
      'expand.*territory', 'expand.*border', 'expand.*land', 'expand.*influence',
      'claim.*land', 'claim.*territory', 'push.*border', 'grow.*territory',
      'take.*land', 'conquer.*land', 'annex.*land'
    ];
    return keywords.some(pattern => new RegExp(pattern).test(advice));
  }
  
  matchesWarDeclaration(advice) {
    const keywords = [
      'declare.*war', 'attack', 'invade', 'assault', 'conquer',
      'go.*to.*war', 'wage.*war', 'strike.*at', 'march.*on'
    ];
    return keywords.some(pattern => new RegExp(pattern).test(advice));
  }
  
  matchesDiplomacy(advice) {
    const keywords = [
      'make.*peace', 'negotiate.*peace', 'diplomacy', 'diplomatic',
      'treaty', 'alliance', 'cease.*fire', 'end.*war', 'trade.*with'
    ];
    return keywords.some(pattern => new RegExp(pattern).test(advice));
  }
  
  matchesEconomicAction(advice) {
    const keywords = [
      'economy', 'economic', 'trade', 'gold', 'wealth', 'prosperity',
      'commerce', 'market', 'tax', 'revenue'
    ];
    return keywords.some(pattern => new RegExp(pattern).test(advice));
  }
  
  matchesMilitaryAction(advice) {
    const keywords = [
      'military', 'army', 'soldier', 'defense', 'fortify',
      'garrison', 'troop', 'warrior', 'strengthen.*force'
    ];
    return keywords.some(pattern => new RegExp(pattern).test(advice));
  }
  
  matchesGenericGrowth(advice) {
    const keywords = ['expand', 'grow', 'increase', 'strengthen', 'improve'];
    return keywords.some(word => advice.includes(word));
  }
  
  // ==================== EXECUTION METHODS ====================
  
  executeCityBuilding(advice) {
    const playerNation = this.worldManager.getPlayerNation();
    
    // Find best location for new city
    const location = this.findBestCityLocation(playerNation);
    
    if (!location) {
      return {
        success: false,
        type: 'city_building',
        message: 'No suitable location found for a new city.',
        details: 'All good locations are too close to existing cities or outside territory.'
      };
    }
    
    // Create new city
    const cityName = this.generateCityName(playerNation);
    const newCity = playerNation.addCity(cityName, location.x, location.y);
    
    // Update map
    this.worldManager.world.tiles[location.y][location.x].hasCity = true;
    this.worldManager.world.tiles[location.y][location.x].cityId = newCity.id;
    
    // Trigger influence recalculation
    this.worldManager.updateInfluence();
    
    return {
      success: true,
      type: 'city_building',
      message: `${cityName} has been founded!`,
      details: `New city established at (${location.x}, ${location.y}) on ${this.getBiomeName(location.biome)} terrain.`,
      location: location,
      cityName: cityName
    };
  }
  
  executeTerritoryExpansion(advice) {
    const playerNation = this.worldManager.getPlayerNation();
    
    // Expand influence from all cities
    const tilesGained = this.expandTerritory(playerNation, 5); // Expand by 5 tiles
    
    if (tilesGained === 0) {
      return {
        success: false,
        type: 'territory_expansion',
        message: 'Unable to expand territory at this time.',
        details: 'All adjacent tiles are already claimed or unreachable.'
      };
    }
    
    return {
      success: true,
      type: 'territory_expansion',
      message: `Territory expanded by ${tilesGained} tiles!`,
      details: `Influence borders have been pushed outward through diplomatic and economic pressure.`,
      tilesGained: tilesGained
    };
  }
  
  executeWarDeclaration(advice) {
    // Extract target nation name if mentioned
    const targetNation = this.extractTargetNation(advice);
    
    if (!targetNation) {
      return {
        success: false,
        type: 'war_declaration',
        message: 'No specific rival nation mentioned.',
        details: 'Specify which nation to target (e.g., "attack the Kingdom of..." or use their nation name).'
      };
    }
    
    // Set war status (Phase 5 will add full war mechanics)
    if (!window.gameState.wars) {
      window.gameState.wars = [];
    }
    
    window.gameState.wars.push({
      attacker: this.worldManager.getPlayerNation().id,
      defender: targetNation.id,
      turnDeclared: this.worldManager.turnNumber
    });
    
    return {
      success: true,
      type: 'war_declaration',
      message: `War declared against ${targetNation.name}!`,
      details: `Your armies prepare to march. Military actions against ${targetNation.name} are now possible.`,
      target: targetNation.name
    };
  }
  
  executeDiplomacy(advice) {
    // Extract target nation name if mentioned
    const targetNation = this.extractTargetNation(advice);
    
    if (!targetNation) {
      return {
        success: true,
        type: 'diplomacy',
        message: 'Diplomatic overtures have been sent to neighboring nations.',
        details: 'Your emissaries work to improve relations across the realm.'
      };
    }
    
    // Improve relations (Phase 5 will add full diplomacy system)
    return {
      success: true,
      type: 'diplomacy',
      message: `Diplomatic relations with ${targetNation.name} improved.`,
      details: `Trade envoys and peace delegations have been dispatched to ${targetNation.ruler.name}.`,
      target: targetNation.name
    };
  }
  
  executeEconomicAction(advice) {
    const playerNation = this.worldManager.getPlayerNation();
    
    // Boost city growth rates temporarily
    playerNation.cities.forEach(city => {
      city.growthBonus = (city.growthBonus || 0) + 0.01; // +1% growth bonus
    });
    
    return {
      success: true,
      type: 'economic',
      message: 'Economic policies enacted!',
      details: `Trade routes optimized, taxes adjusted, markets encouraged. City growth rate increased by 1%.`,
      cities: playerNation.cities.length
    };
  }
  
  executeMilitaryAction(advice) {
    const playerNation = this.worldManager.getPlayerNation();
    
    // Add military strength (Phase 5 will add full military system)
    if (!playerNation.militaryStrength) {
      playerNation.militaryStrength = 100;
    }
    playerNation.militaryStrength += 50;
    
    return {
      success: true,
      type: 'military',
      message: 'Military forces strengthened!',
      details: `Recruitment drives and training programs have bolstered your armies. Military strength increased.`,
      strength: playerNation.militaryStrength
    };
  }
  
  executeGenericGrowth(advice) {
    // Try to do something beneficial - prioritize city building if possible
    const playerNation = this.worldManager.getPlayerNation();
    const location = this.findBestCityLocation(playerNation);
    
    if (location && playerNation.cities.length < 5) {
      // Build a city if possible
      return this.executeCityBuilding(advice);
    } else {
      // Otherwise expand territory
      return this.executeTerritoryExpansion(advice);
    }
  }
  
  // ==================== HELPER METHODS ====================
  
  findBestCityLocation(nation) {
    const world = this.worldManager.world;
    const minDistance = 10; // Minimum distance between cities
    
    // Get all tiles owned by this nation
    const ownedTiles = [];
    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        const tile = world.tiles[y][x];
        if (tile.nationId === nation.id && !tile.hasCity && tile.isLand) {
          ownedTiles.push({ x, y, biome: tile.biome, fertility: this.getFertility(tile.biome) });
        }
      }
    }
    
    // Filter by distance from existing cities
    const validTiles = ownedTiles.filter(tile => {
      return nation.cities.every(city => {
        const dx = tile.x - city.x;
        const dy = tile.y - city.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance >= minDistance;
      });
    });
    
    if (validTiles.length === 0) return null;
    
    // Sort by fertility (prefer better biomes)
    validTiles.sort((a, b) => b.fertility - a.fertility);
    
    // Return best location (or random from top 5)
    const topCandidates = validTiles.slice(0, Math.min(5, validTiles.length));
    return topCandidates[Math.floor(Math.random() * topCandidates.length)];
  }
  
  getFertility(biomeType) {
    // Biome types are strings: 'ocean', 'plains', 'desert', 'arctic', 'forest', 'mountains'
    const fertility = {
      'plains': 10,
      'forest': 8,
      'mountains': 4,
      'desert': 3,
      'arctic': 2,
      'ocean': 0
    };
    return fertility[biomeType] || 5;
  }
  
  getBiomeName(biomeType) {
    // Biomes are already stored as string names, just return them
    return biomeType || 'unknown';
  }
  
  generateCityName(nation) {
    const prefixes = ['New', 'East', 'West', 'North', 'South', 'Greater', 'Lesser', 'Fort', 'Port'];
    const suffixes = ['ford', 'burg', 'ville', 'ton', 'ham', 'shire', 'port', 'dale', 'field', 'haven'];
    const bases = ['Crown', 'King', 'Queen', 'Royal', 'Gold', 'Silver', 'Iron', 'Stone', 'Oak', 'Ash', 'River', 'Lake', 'Hill', 'Vale'];
    
    // 60% chance for base + suffix, 40% for prefix + base
    if (Math.random() < 0.6) {
      const base = bases[Math.floor(Math.random() * bases.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      return base + suffix;
    } else {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const base = bases[Math.floor(Math.random() * bases.length)];
      return `${prefix} ${base}`;
    }
  }
  
  expandTerritory(nation, targetTiles) {
    const world = this.worldManager.world;
    let tilesGained = 0;
    
    // Find all border tiles (player tiles adjacent to neutral/other nation tiles)
    const expansionCandidates = [];
    
    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        const tile = world.tiles[y][x];
        
        // Skip if not land or already owned by player
        if (!tile.isLand || tile.nationId === nation.id) continue;
        
        // Check if adjacent to player territory
        const neighbors = this.getNeighbors(x, y);
        const hasPlayerNeighbor = neighbors.some(n => {
          const neighborTile = world.tiles[n.y]?.[n.x];
          return neighborTile && neighborTile.nationId === nation.id;
        });
        
        if (hasPlayerNeighbor && tile.nationId === null) {
          // Unclaimed land adjacent to player
          expansionCandidates.push({ x, y, priority: this.getFertility(tile.biome) });
        }
      }
    }
    
    // Sort by priority (best biomes first)
    expansionCandidates.sort((a, b) => b.priority - a.priority);
    
    // Claim top tiles
    const tilesToClaim = Math.min(targetTiles, expansionCandidates.length);
    for (let i = 0; i < tilesToClaim; i++) {
      const tile = expansionCandidates[i];
      world.tiles[tile.y][tile.x].nationId = nation.id;
      tilesGained++;
    }
    
    return tilesGained;
  }
  
  getNeighbors(x, y) {
    return [
      { x: x - 1, y: y },
      { x: x + 1, y: y },
      { x: x, y: y - 1 },
      { x: x, y: y + 1 }
    ];
  }
  
  extractTargetNation(advice) {
    const nations = this.worldManager.nations.slice(1); // Exclude player
    
    // Try to find nation name mentioned in advice
    for (const nation of nations) {
      const nameLower = nation.name.toLowerCase();
      if (advice.includes(nameLower)) {
        return nation;
      }
      
      // Also try ruler name
      const rulerNameLower = nation.ruler.name.toLowerCase();
      if (advice.includes(rulerNameLower)) {
        return nation;
      }
    }
    
    // If no specific nation mentioned, pick closest/largest rival
    if (nations.length > 0) {
      // Sort by population (largest threat)
      nations.sort((a, b) => b.getTotalPopulation() - a.getTotalPopulation());
      return nations[0];
    }
    
    return null;
  }
  
  getActionHistory() {
    return this.actionHistory;
  }
}
