import { BIOMES } from './config.js';

/**
 * AIActionEngine - Autonomous AI ruler decision-making system
 * Makes all rulers (including player's) take actions based on personality
 * Phase 4 Expansion: AI Ruler Autonomy
 */
export class AIActionEngine {
  constructor(worldManager) {
    this.worldManager = worldManager;
    this.actionInterval = 8000; // Actions every 8 seconds
    this.lastActionTime = 0;
    this.actionHistory = [];
    this.isPlayerControlled = true; // Player ruler only acts on counsel (for now)
  }
  
  /**
   * Main update loop - called every frame
   */
  update(deltaTime) {
    const currentTime = Date.now();
    
    // Check if it's time for AI action tick
    if (currentTime - this.lastActionTime >= this.actionInterval) {
      this.lastActionTime = currentTime;
      this.performAIActions();
    }
  }
  
  /**
   * All AI rulers take actions based on personality
   */
  performAIActions() {
    console.log('=== AI ACTION TICK ===');
    
    // Process each nation
    this.worldManager.nations.forEach(nation => {
      // Skip player nation if controlled by counsel
      if (nation.id === 0 && this.isPlayerControlled) {
        return;
      }
      
      // Calculate action priority based on personality
      const action = this.decideAction(nation);
      
      if (action) {
        this.executeAction(nation, action);
      }
    });
    
    // Update influence after all actions
    this.worldManager.updateInfluence();
  }
  
  /**
   * Decide what action this nation should take based on personality
   */
  decideAction(nation) {
    const ruler = nation.ruler;
    const resources = this.calculateResources(nation);
    
    // Check income sustainability (Phase 5)
    const incomeCheck = this.checkIncomeHealth(nation);
    
    // Calculate priority scores for each action
    const priorities = {
      foundCity: this.calculateFoundCityPriority(nation, ruler, resources, incomeCheck),
      buildFortress: this.calculateFortressPriority(nation, ruler, resources, incomeCheck),
      constructRoad: this.calculateRoadPriority(nation, ruler, resources, incomeCheck),
      upgradeInfrastructure: this.calculateUpgradePriority(nation, ruler, resources, incomeCheck),
      draftArmy: this.calculateArmyPriority(nation, ruler, resources, incomeCheck)
    };
    
    // Log priorities for debugging
    console.log(`${nation.name} priorities:`, priorities, `| Income: ${incomeCheck.netIncome}g/turn`);
    
    // Find highest priority action
    let bestAction = null;
    let bestScore = 0;
    
    for (const [action, score] of Object.entries(priorities)) {
      if (score > bestScore && this.canAfford(nation, action, resources)) {
        bestScore = score;
        bestAction = action;
      }
    }
    
    return bestAction;
  }
  
  /**
   * Check nation's income health (Phase 5)
   */
  checkIncomeHealth(nation) {
    if (!this.worldManager.incomeSystem) {
      return { netIncome: 0, isHealthy: true, turnsUntilBankrupt: Infinity };
    }
    
    const report = this.worldManager.incomeSystem.getIncomeReport(nation.id);
    const projection = this.worldManager.incomeSystem.projectIncome(nation, 5);
    
    return {
      netIncome: report ? report.netIncome : 0,
      isHealthy: report ? report.netIncome >= 0 : true,
      turnsUntilBankrupt: projection.turnsUntilBankrupt
    };
  }
  
  /**
   * Calculate available resources for a nation
   */
  calculateResources(nation) {
    const population = nation.getTotalPopulation();
    const cityCount = nation.cities.length;
    
    // Count territory
    let territoryCount = 0;
    for (let y = 0; y < this.worldManager.world.height; y++) {
      for (let x = 0; x < this.worldManager.world.width; x++) {
        if (this.worldManager.world.tiles[y][x].nationId === nation.id) {
          territoryCount++;
        }
      }
    }
    
    return {
      gold: nation.gold || 1000,
      population: population,
      cities: cityCount,
      territory: territoryCount,
      military: nation.military || 100
    };
  }
  
  /**
   * Priority calculation for founding a new city
   */
  calculateFoundCityPriority(nation, ruler, resources, incomeCheck) {
    let priority = 50; // Base priority
    
    // Government type modifiers
    if (ruler.governmentType === 'democracy') priority += 20;
    if (ruler.governmentType === 'oligarchy') priority += 15;
    if (ruler.governmentType === 'autocracy') priority += 10;
    
    // Trait modifiers
    if (ruler.positiveTraits.includes('ambitious')) priority += 25;
    if (ruler.positiveTraits.includes('shrewd')) priority += 10;
    if (ruler.negativeTraits.includes('slothful')) priority -= 30;
    if (ruler.negativeTraits.includes('impulsive')) priority += 10;
    
    // Resource-based modifiers
    if (resources.cities < 3) priority += 30; // Early game: prioritize expansion
    if (resources.cities >= 8) priority -= 20; // Late game: maintain existing
    if (resources.gold < 500) priority -= 20; // Low funds
    
    // Income sustainability check (Phase 5)
    if (incomeCheck && !incomeCheck.isHealthy) {
      priority -= 30; // Negative income discourages expensive expansion
    }
    if (incomeCheck && incomeCheck.turnsUntilBankrupt < 10) {
      priority -= 40; // Near bankruptcy - avoid expansion
    }
    
    return Math.max(0, priority);
  }
  
  /**
   * Priority calculation for building fortresses
   */
  calculateFortressPriority(nation, ruler, resources, incomeCheck) {
    let priority = 30; // Base priority
    
    // Government type modifiers
    if (ruler.governmentType === 'militarism') priority += 30;
    if (ruler.governmentType === 'autocracy') priority += 15;
    
    // Trait modifiers
    if (ruler.positiveTraits.includes('brave')) priority += 20;
    if (ruler.positiveTraits.includes('defensive')) priority += 25;
    if (ruler.negativeTraits.includes('paranoid')) priority += 30;
    if (ruler.negativeTraits.includes('weak-willed')) priority -= 20;
    
    // Strategic modifiers
    if (this.hasHostileBorders(nation)) priority += 25;
    if (resources.cities < 2) priority -= 15; // Focus on expansion first
    
    return Math.max(0, priority);
  }
  
  /**
   * Priority calculation for constructing roads
   */
  calculateRoadPriority(nation, ruler, resources, incomeCheck) {
    let priority = 40; // Base priority
    
    // Government type modifiers
    if (ruler.governmentType === 'oligarchy') priority += 25;
    if (ruler.governmentType === 'democracy') priority += 15;
    
    // Trait modifiers
    if (ruler.positiveTraits.includes('shrewd')) priority += 20;
    if (ruler.positiveTraits.includes('diplomatic')) priority += 10;
    if (ruler.negativeTraits.includes('greedy')) priority += 15;
    if (ruler.negativeTraits.includes('slothful')) priority -= 25;
    
    // Resource-based modifiers
    if (resources.cities >= 3) priority += 20; // Multiple cities benefit from roads
    if (resources.cities < 2) priority -= 30; // Too early for roads
    
    // Income boost (Phase 5) - Roads generate income, prioritize when negative income
    if (incomeCheck && !incomeCheck.isHealthy) {
      priority += 25; // Roads generate gold - good for struggling economies
    }
    
    return Math.max(0, priority);
  }
  
  /**
   * Priority calculation for upgrading infrastructure
   */
  calculateUpgradePriority(nation, ruler, resources, incomeCheck) {
    let priority = 45; // Base priority
    
    // Government type modifiers
    if (ruler.governmentType === 'oligarchy') priority += 20;
    if (ruler.governmentType === 'democracy') priority += 15;
    if (ruler.governmentType === 'theocracy') priority += 10;
    
    // Trait modifiers
    if (ruler.positiveTraits.includes('just')) priority += 15;
    if (ruler.positiveTraits.includes('merciful')) priority += 10;
    if (ruler.positiveTraits.includes('ambitious')) priority += 5;
    if (ruler.negativeTraits.includes('cruel')) priority -= 20;
    if (ruler.negativeTraits.includes('greedy')) priority -= 10;
    
    // Resource-based modifiers
    if (resources.population < 20000) priority += 25; // Boost small populations
    if (resources.cities >= 4) priority += 15; // More cities = more infrastructure
    
    return Math.max(0, priority);
  }
  
  /**
   * Priority calculation for drafting armies
   */
  calculateArmyPriority(nation, ruler, resources, incomeCheck) {
    let priority = 35; // Base priority
    
    // Government type modifiers
    if (ruler.governmentType === 'militarism') priority += 40;
    if (ruler.governmentType === 'autocracy') priority += 20;
    
    // Trait modifiers
    if (ruler.positiveTraits.includes('brave')) priority += 25;
    if (ruler.positiveTraits.includes('ambitious')) priority += 15;
    if (ruler.negativeTraits.includes('wrathful')) priority += 20;
    if (ruler.negativeTraits.includes('paranoid')) priority += 25;
    if (ruler.negativeTraits.includes('weak-willed')) priority -= 30;
    if (ruler.negativeTraits.includes('merciful')) priority -= 15;
    
    // Strategic modifiers
    if (this.hasHostileBorders(nation)) priority += 30;
    if (resources.military < 200) priority += 20; // Low military strength
    
    // Income check (Phase 5) - Armies have upkeep costs
    if (incomeCheck && !incomeCheck.isHealthy) {
      priority -= 20; // Avoid army drafting when income is negative (upkeep cost)
    }
    
    return Math.max(0, priority);
  }
  
  /**
   * Check if nation can afford an action
   */
  canAfford(nation, action, resources) {
    const costs = {
      foundCity: { gold: 500, population: 1000 },
      buildFortress: { gold: 300 },
      constructRoad: { gold: 200 },
      upgradeInfrastructure: { gold: 250 },
      draftArmy: { gold: 150, population: 500 }
    };
    
    const cost = costs[action];
    if (!cost) return false;
    
    if (cost.gold && resources.gold < cost.gold) return false;
    if (cost.population && resources.population < cost.population) return false;
    
    return true;
  }
  
  /**
   * Execute the chosen action
   */
  executeAction(nation, action) {
    const actions = {
      foundCity: () => this.actionFoundCity(nation),
      buildFortress: () => this.actionBuildFortress(nation),
      constructRoad: () => this.actionConstructRoad(nation),
      upgradeInfrastructure: () => this.actionUpgradeInfrastructure(nation),
      draftArmy: () => this.actionDraftArmy(nation)
    };
    
    const result = actions[action]?.();
    
    if (result && result.success) {
      // Deduct costs
      this.deductCosts(nation, action);
      
      // Log action
      this.logAction(nation, action, result);
      
      // Show notification for player nation
      if (nation.id === 0) {
        this.worldManager.showNotification(result.message, 'info');
      } else {
        // Show notifications for AI actions near player
        if (Math.random() < 0.3) { // 30% chance to notify player
          this.worldManager.showNotification(`${nation.name}: ${result.message}`, 'info');
        }
      }
      
      console.log(`✓ ${nation.name} - ${action}:`, result.message);
    } else if (result) {
      console.log(`✗ ${nation.name} - ${action}: Failed`);
    }
  }
  
  /**
   * Deduct costs from nation resources
   */
  deductCosts(nation, action) {
    const costs = {
      foundCity: { gold: 500 },
      buildFortress: { gold: 300 },
      constructRoad: { gold: 200 },
      upgradeInfrastructure: { gold: 250 },
      draftArmy: { gold: 150 }
    };
    
    const cost = costs[action];
    if (cost && cost.gold) {
      nation.gold = (nation.gold || 1000) - cost.gold;
    }
  }
  
  // ==================== ACTION IMPLEMENTATIONS ====================
  
  /**
   * ACTION: Found a new city
   */
  actionFoundCity(nation) {
    const location = this.findCityLocation(nation);
    
    if (!location) {
      return { success: false, message: 'No suitable location' };
    }
    
    const cityName = this.generateCityName(nation);
    const newCity = nation.addCity(cityName, location.x, location.y);
    
    // Mark tile as city
    this.worldManager.world.tiles[location.y][location.x].hasCity = true;
    this.worldManager.world.tiles[location.y][location.x].cityId = newCity.id;
    
    return {
      success: true,
      message: `Founded ${cityName}`,
      location: location,
      cityName: cityName
    };
  }
  
  /**
   * ACTION: Build fortress on border
   */
  actionBuildFortress(nation) {
    const location = this.findBorderTile(nation);
    
    if (!location) {
      return { success: false, message: 'No suitable border location' };
    }
    
    // Mark tile as fortress
    const tile = this.worldManager.world.tiles[location.y][location.x];
    tile.hasFortress = true;
    tile.defenseBonus = 2.0; // 2x defense multiplier
    
    // Initialize fortresses array if needed
    if (!nation.fortresses) {
      nation.fortresses = [];
    }
    
    nation.fortresses.push({
      x: location.x,
      y: location.y,
      defense: 2.0
    });
    
    return {
      success: true,
      message: `Built fortress`,
      location: location
    };
  }
  
  /**
   * ACTION: Construct road between cities
   */
  actionConstructRoad(nation) {
    if (nation.cities.length < 2) {
      return { success: false, message: 'Need at least 2 cities' };
    }
    
    // Find two cities without a road
    const cityPair = this.findUnconnectedCities(nation);
    
    if (!cityPair) {
      return { success: false, message: 'All cities connected' };
    }
    
    // Initialize roads array if needed
    if (!nation.roads) {
      nation.roads = [];
    }
    
    // Create road connection
    const road = {
      from: cityPair.from.id,
      to: cityPair.to.id,
      tradeBonus: 1.1 // 10% trade bonus
    };
    
    nation.roads.push(road);
    
    // Apply growth bonus to connected cities
    cityPair.from.growthBonus = (cityPair.from.growthBonus || 0) + 0.005;
    cityPair.to.growthBonus = (cityPair.to.growthBonus || 0) + 0.005;
    
    return {
      success: true,
      message: `Road: ${cityPair.from.name} ↔ ${cityPair.to.name}`,
      road: road
    };
  }
  
  /**
   * ACTION: Upgrade infrastructure in a city
   */
  actionUpgradeInfrastructure(nation) {
    // Find city with lowest infrastructure level
    const city = this.findCityToUpgrade(nation);
    
    if (!city) {
      return { success: false, message: 'No cities to upgrade' };
    }
    
    // Initialize infrastructure level
    if (!city.infrastructureLevel) {
      city.infrastructureLevel = 0;
    }
    
    city.infrastructureLevel++;
    
    // Apply benefits
    city.growthBonus = (city.growthBonus || 0) + 0.008; // +0.8% growth
    city.population += 500; // Immediate population boost
    
    return {
      success: true,
      message: `Upgraded ${city.name}`,
      city: city.name
    };
  }
  
  /**
   * ACTION: Draft army units
   */
  actionDraftArmy(nation) {
    const armyStrength = 50 + Math.floor(Math.random() * 30); // 50-80 strength
    
    // Initialize military if needed
    if (!nation.militaryStrength) {
      nation.militaryStrength = 100;
    }
    
    nation.militaryStrength += armyStrength;
    
    // Track armies
    if (!nation.armies) {
      nation.armies = [];
    }
    
    nation.armies.push({
      strength: armyStrength,
      createdTurn: this.worldManager.turnNumber
    });
    
    return {
      success: true,
      message: `Drafted army (+${armyStrength} strength)`,
      strength: armyStrength
    };
  }
  
  // ==================== HELPER METHODS ====================
  
  /**
   * Find suitable location for new city
   */
  findCityLocation(nation) {
    const world = this.worldManager.world;
    const minDistance = 10;
    
    // Get all tiles owned by this nation
    const ownedTiles = [];
    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        const tile = world.tiles[y][x];
        if (tile.nationId === nation.id && !tile.hasCity && tile.isLand) {
          const fertility = this.getFertility(tile.biome);
          ownedTiles.push({ x, y, biome: tile.biome, fertility });
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
    
    // Sort by fertility
    validTiles.sort((a, b) => b.fertility - a.fertility);
    
    // Return random from top 5
    const topCandidates = validTiles.slice(0, Math.min(5, validTiles.length));
    return topCandidates[Math.floor(Math.random() * topCandidates.length)];
  }
  
  /**
   * Find border tile for fortress
   */
  findBorderTile(nation) {
    const world = this.worldManager.world;
    const borderTiles = [];
    
    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        const tile = world.tiles[y][x];
        
        // Must be owned by this nation
        if (tile.nationId !== nation.id) continue;
        if (tile.hasFortress) continue; // Already has fortress
        if (!tile.isLand) continue;
        
        // Check if it's on border (adjacent to foreign/neutral tile)
        const neighbors = this.getNeighbors(x, y);
        const isBorder = neighbors.some(n => {
          const neighborTile = world.tiles[n.y]?.[n.x];
          return neighborTile && neighborTile.nationId !== nation.id;
        });
        
        if (isBorder) {
          borderTiles.push({ x, y });
        }
      }
    }
    
    if (borderTiles.length === 0) return null;
    
    // Return random border tile
    return borderTiles[Math.floor(Math.random() * borderTiles.length)];
  }
  
  /**
   * Find two cities without road connection
   */
  findUnconnectedCities(nation) {
    if (nation.cities.length < 2) return null;
    
    const roads = nation.roads || [];
    
    // Check all city pairs
    for (let i = 0; i < nation.cities.length; i++) {
      for (let j = i + 1; j < nation.cities.length; j++) {
        const cityA = nation.cities[i];
        const cityB = nation.cities[j];
        
        // Check if road exists
        const hasRoad = roads.some(r => 
          (r.from === cityA.id && r.to === cityB.id) ||
          (r.from === cityB.id && r.to === cityA.id)
        );
        
        if (!hasRoad) {
          return { from: cityA, to: cityB };
        }
      }
    }
    
    return null; // All cities connected
  }
  
  /**
   * Find city that needs infrastructure upgrade
   */
  findCityToUpgrade(nation) {
    if (nation.cities.length === 0) return null;
    
    // Sort by infrastructure level (lowest first)
    const cities = [...nation.cities].sort((a, b) => {
      const levelA = a.infrastructureLevel || 0;
      const levelB = b.infrastructureLevel || 0;
      return levelA - levelB;
    });
    
    return cities[0];
  }
  
  /**
   * Check if nation has hostile neighbors
   */
  hasHostileBorders(nation) {
    // Check for wars
    const wars = window.gameState.wars || [];
    const atWar = wars.some(w => w.attacker === nation.id || w.defender === nation.id);
    
    if (atWar) return true;
    
    // Check for close rival cities
    const world = this.worldManager.world;
    for (const city of nation.cities) {
      for (const otherNation of this.worldManager.nations) {
        if (otherNation.id === nation.id) continue;
        
        for (const otherCity of otherNation.cities) {
          const dx = city.x - otherCity.x;
          const dy = city.y - otherCity.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 15) return true; // Close proximity
        }
      }
    }
    
    return false;
  }
  
  /**
   * Get neighboring tiles
   */
  getNeighbors(x, y) {
    return [
      { x: x - 1, y: y },
      { x: x + 1, y: y },
      { x: x, y: y - 1 },
      { x: x, y: y + 1 }
    ];
  }
  
  /**
   * Get fertility score for biome
   */
  getFertility(biomeType) {
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
  
  /**
   * Generate city name
   */
  generateCityName(nation) {
    const prefixes = ['New', 'East', 'West', 'North', 'South', 'Greater', 'Fort', 'Port'];
    const suffixes = ['ford', 'burg', 'ville', 'ton', 'ham', 'shire', 'port', 'dale', 'field'];
    const bases = ['Crown', 'King', 'Royal', 'Gold', 'Silver', 'Iron', 'Stone', 'Oak', 'River', 'Hill'];
    
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
  
  /**
   * Log action to history
   */
  logAction(nation, action, result) {
    this.actionHistory.push({
      nationId: nation.id,
      nationName: nation.name,
      action: action,
      result: result,
      turn: this.worldManager.turnNumber,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get action history
   */
  getActionHistory() {
    return this.actionHistory;
  }
  
  /**
   * Enable/disable player autonomous actions
   */
  setPlayerAutonomous(enabled) {
    this.isPlayerControlled = !enabled;
  }
}
