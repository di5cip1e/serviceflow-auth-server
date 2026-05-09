import { BIOMES } from './config.js';

/**
 * IncomeSystem - Manages gold and resource income for all nations
 * Phase 5A: Economic Sustainability
 * 
 * Income Sources:
 * 1. Cities - Base income from population and development
 * 2. Trade Routes - Gold from road connections
 * 3. Territory - Resources from controlled land
 * 4. Treaties - Income from trade agreements (diplomacy)
 * 
 * Expenses:
 * 1. City Maintenance - Larger cities cost more
 * 2. Army Upkeep - Military units require payment
 * 3. Infrastructure - Building maintenance
 */
export class IncomeSystem {
  constructor(worldManager) {
    this.worldManager = worldManager;
    this.incomeInterval = 5000; // Calculate income every 5 seconds (1 turn)
    this.lastIncomeTime = 0;
    this.incomeHistory = []; // Track income/expense per nation
  }
  
  /**
   * Main update loop - called every frame
   */
  update(deltaTime) {
    const currentTime = Date.now();
    
    // Check if it's time for income tick
    if (currentTime - this.lastIncomeTime >= this.incomeInterval) {
      this.lastIncomeTime = currentTime;
      this.processIncome();
    }
  }
  
  /**
   * Process income for all nations
   */
  processIncome() {
    this.worldManager.nations.forEach(nation => {
      const report = this.calculateIncome(nation);
      
      // Apply net income
      nation.gold = Math.max(0, nation.gold + report.netIncome);
      
      // Store history
      this.incomeHistory.push({
        nationId: nation.id,
        nationName: nation.name,
        timestamp: Date.now(),
        ...report
      });
      
      // Log for player nation
      if (nation.id === 0) {
        console.log(`💰 ${nation.name} Income Report:`, report);
        
        // Show notification if net income is negative
        if (report.netIncome < 0) {
          this.worldManager.showNotification(
            `⚠️ Treasury declining! Net income: ${report.netIncome}g/turn`,
            'warning'
          );
        }
      }
      
      // Trim history (keep last 100 entries)
      if (this.incomeHistory.length > 100) {
        this.incomeHistory.shift();
      }
    });
  }
  
  /**
   * Calculate income and expenses for a nation
   */
  calculateIncome(nation) {
    const income = {
      cities: this.calculateCityIncome(nation),
      trade: this.calculateTradeIncome(nation),
      territory: this.calculateTerritoryIncome(nation),
      treaties: this.calculateTreatyIncome(nation)
    };
    
    const expenses = {
      cityMaintenance: this.calculateCityMaintenance(nation),
      armyUpkeep: this.calculateArmyUpkeep(nation),
      infrastructure: this.calculateInfrastructureMaintenance(nation)
    };
    
    const totalIncome = Object.values(income).reduce((sum, val) => sum + val, 0);
    const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + val, 0);
    
    return {
      income,
      expenses,
      totalIncome: Math.floor(totalIncome),
      totalExpenses: Math.floor(totalExpenses),
      netIncome: Math.floor(totalIncome - totalExpenses)
    };
  }
  
  /**
   * Calculate income from cities
   * Base income: 10g per 1000 population
   * Infrastructure bonus: +5g per infrastructure level
   * Capital bonus: +50% for capital cities
   */
  calculateCityIncome(nation) {
    let totalIncome = 0;
    
    nation.cities.forEach(city => {
      // Base income from population
      const populationIncome = (city.population / 1000) * 10;
      
      // Infrastructure bonus
      const infrastructureLevel = city.infrastructureLevel || 0;
      const infrastructureBonus = infrastructureLevel * 5;
      
      // Capital bonus
      const capitalMultiplier = city.isCapital ? 1.5 : 1.0;
      
      const cityIncome = (populationIncome + infrastructureBonus) * capitalMultiplier;
      totalIncome += cityIncome;
    });
    
    return totalIncome;
  }
  
  /**
   * Calculate income from trade routes (roads)
   * Each road generates 15g per turn
   * Bonus for longer routes: +5g per 10 tiles distance
   */
  calculateTradeIncome(nation) {
    if (!nation.roads || nation.roads.length === 0) return 0;
    
    let totalIncome = 0;
    
    nation.roads.forEach(road => {
      const baseIncome = 15;
      
      // Calculate distance bonus
      const distance = Math.sqrt(
        Math.pow(road.city1.x - road.city2.x, 2) +
        Math.pow(road.city1.y - road.city2.y, 2)
      );
      const distanceBonus = Math.floor(distance / 10) * 5;
      
      totalIncome += baseIncome + distanceBonus;
    });
    
    return totalIncome;
  }
  
  /**
   * Calculate income from controlled territory
   * Different biomes generate different resources
   * Plains: 2g per tile
   * Forest: 1.5g per tile
   * Desert: 0.5g per tile
   * Mountains: 3g per tile (mining)
   * Arctic: 0.3g per tile
   */
  calculateTerritoryIncome(nation) {
    let totalIncome = 0;
    const world = this.worldManager.world;
    
    // Count tiles by biome
    const biomeCounts = {};
    
    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        const tile = world.tiles[y][x];
        if (tile.nationId === nation.id) {
          const biome = tile.biome;
          biomeCounts[biome] = (biomeCounts[biome] || 0) + 1;
        }
      }
    }
    
    // Calculate income based on biome values (use string keys since biomes are stored as strings)
    const biomeValues = {
      'plains': 2,
      'forest': 1.5,
      'desert': 0.5,
      'mountains': 3,
      'arctic': 0.3,
      'ocean': 0
    };
    
    for (const [biome, count] of Object.entries(biomeCounts)) {
      const value = biomeValues[biome] || 0;
      totalIncome += count * value;
    }
    
    return totalIncome;
  }
  
  /**
   * Calculate income from diplomatic treaties
   * Trade agreements generate gold per turn
   */
  calculateTreatyIncome(nation) {
    let totalIncome = 0;
    
    // Check for trade agreements in diplomacy system
    if (this.worldManager.diplomacyManager) {
      const treaties = this.worldManager.diplomacyManager.getTreatiesForNation(nation.id);
      
      if (treaties) {
        treaties.forEach(treaty => {
          if (treaty.type === 'trade') {
            // Trade agreements generate 20g per turn
            totalIncome += 20;
          }
        });
      }
    }
    
    return totalIncome;
  }
  
  /**
   * Calculate city maintenance costs
   * Small cities: 5g
   * Medium cities: 15g
   * Large cities: 30g
   * Huge cities: 50g
   */
  calculateCityMaintenance(nation) {
    let totalCost = 0;
    
    const maintenanceCosts = {
      small: 5,
      medium: 15,
      large: 30,
      huge: 50
    };
    
    nation.cities.forEach(city => {
      const size = city.getSize();
      totalCost += maintenanceCosts[size] || 5;
    });
    
    return totalCost;
  }
  
  /**
   * Calculate army upkeep
   * Based on actual army units now (Phase 5B)
   */
  calculateArmyUpkeep(nation) {
    let totalUpkeep = 0;
    
    // Get armies from army manager if available
    if (this.worldManager.armyManager) {
      const armies = this.worldManager.armyManager.getArmiesForNation(nation.id);
      
      armies.forEach(army => {
        totalUpkeep += army.calculateUpkeep();
      });
    } else {
      // Fallback to old system
      const armyCount = nation.armies ? nation.armies.length : 0;
      const militaryStrength = nation.military || 0;
      
      const baseUpkeep = militaryStrength / 10;
      const armyUpkeep = armyCount * 5;
      
      totalUpkeep = baseUpkeep + armyUpkeep;
    }
    
    return totalUpkeep;
  }
  
  /**
   * Calculate infrastructure maintenance
   * Roads: 2g each
   * Fortresses: 5g each
   * Infrastructure levels: 3g per level across all cities
   */
  calculateInfrastructureMaintenance(nation) {
    let totalCost = 0;
    
    // Road maintenance
    if (nation.roads) {
      totalCost += nation.roads.length * 2;
    }
    
    // Fortress maintenance
    if (nation.fortresses) {
      totalCost += nation.fortresses.length * 5;
    }
    
    // City infrastructure maintenance
    nation.cities.forEach(city => {
      const level = city.infrastructureLevel || 0;
      totalCost += level * 3;
    });
    
    return totalCost;
  }
  
  /**
   * Get income report for a specific nation
   */
  getIncomeReport(nationId) {
    const nation = this.worldManager.nations.find(n => n.id === nationId);
    if (!nation) return null;
    
    return this.calculateIncome(nation);
  }
  
  /**
   * Get income history for a nation
   */
  getIncomeHistory(nationId, limit = 10) {
    return this.incomeHistory
      .filter(entry => entry.nationId === nationId)
      .slice(-limit);
  }
  
  /**
   * Project future income (for AI decision making)
   */
  projectIncome(nation, turns = 1) {
    const currentReport = this.calculateIncome(nation);
    const projectedGold = nation.gold + (currentReport.netIncome * turns);
    
    return {
      currentGold: nation.gold,
      netIncomePerTurn: currentReport.netIncome,
      projectedGold: Math.floor(projectedGold),
      turnsUntilBankrupt: currentReport.netIncome < 0 
        ? Math.floor(nation.gold / Math.abs(currentReport.netIncome))
        : Infinity
    };
  }
  
  /**
   * Check if nation can afford expenses
   */
  canSustainExpenses(nation) {
    const report = this.calculateIncome(nation);
    return report.netIncome >= 0;
  }
  
  /**
   * Calculate break-even point for a proposed action
   * Returns number of turns until action pays for itself
   */
  calculateROI(nation, actionCost, projectedIncomeIncrease) {
    if (projectedIncomeIncrease <= 0) return Infinity;
    return Math.ceil(actionCost / projectedIncomeIncrease);
  }
}
