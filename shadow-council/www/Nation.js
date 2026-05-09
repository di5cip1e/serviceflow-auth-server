import { WORLD_CONFIG } from './config.js';

export class City {
  constructor(id, name, x, y, nationId, isCapital = false) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.nationId = nationId;
    this.isCapital = isCapital;
    this.population = WORLD_CONFIG.initialCityPopulation;
    this.growthRate = WORLD_CONFIG.populationGrowthRate;
    this.growthBonus = 0; // Bonus growth from economic policies
    this.infrastructureLevel = 0; // Phase 5: Infrastructure upgrades
  }
  
  update(deltaTime) {
    // Population growth (simplified - no food/happiness yet)
    const effectiveGrowthRate = this.growthRate + (this.growthBonus || 0);
    this.population *= (1 + effectiveGrowthRate * deltaTime);
    this.population = Math.floor(this.population);
  }
  
  getSize() {
    const thresholds = WORLD_CONFIG.citySizeThresholds;
    
    if (this.population >= thresholds.huge) return 'huge';
    if (this.population >= thresholds.large) return 'large';
    if (this.population >= thresholds.medium) return 'medium';
    return 'small';
  }
  
  getVisualSize() {
    const size = this.getSize();
    const sizes = {
      small: 1,
      medium: 1.5,
      large: 2,
      huge: 2.5
    };
    return sizes[size] || 1;
  }
}

export class Nation {
  constructor(id, rulerData, color, capitalLocation) {
    this.id = id;
    this.color = color;
    
    // Ruler information (same structure as player)
    this.ruler = {
      name: rulerData.rulerName,
      gender: rulerData.rulerGender,
      governmentType: rulerData.governmentType,
      positiveTraits: rulerData.positiveTraits,
      negativeTraits: rulerData.negativeTraits
    };
    
    // Nation information
    this.name = rulerData.nationName;
    
    // Cities
    this.cities = [];
    this.capitalId = null;
    
    // Create capital city
    if (capitalLocation) {
      const capital = new City(
        `city_${id}_0`,
        rulerData.capitalName,
        capitalLocation.x,
        capitalLocation.y,
        id,
        true
      );
      this.cities.push(capital);
      this.capitalId = capital.id;
    }
    
    // Territory control
    this.controlledTiles = [];
    this.influenceRadius = 5; // Starting influence radius
    this.influenceGrowthRate = WORLD_CONFIG.influenceGrowthRate;
    
    // Resources (Phase 5: Economy)
    this.gold = 1000;
    this.military = 100;
    
    // Structures (Phase 4-5)
    this.roads = []; // { city1, city2 }
    this.fortresses = []; // { x, y }
    this.armies = []; // Reference to armies (managed by ArmyManager in Phase 5B)
    
    // Diplomacy (Phase 4E+)
    this.wars = []; // { enemyId, startTurn }
  }
  
  update(deltaTime) {
    // Update all cities
    this.cities.forEach(city => city.update(deltaTime));
    
    // Influence naturally expands slowly
    this.influenceRadius += this.influenceGrowthRate * deltaTime;
  }
  
  getCapital() {
    return this.cities.find(city => city.id === this.capitalId);
  }
  
  getTotalPopulation() {
    return this.cities.reduce((sum, city) => sum + city.population, 0);
  }
  
  addCity(name, x, y) {
    const city = new City(
      `city_${this.id}_${this.cities.length}`,
      name,
      x,
      y,
      this.id,
      false
    );
    this.cities.push(city);
    return city;
  }
  
  // Calculate if a tile should be influenced by this nation
  calculateInfluence(tileX, tileY) {
    let totalInfluence = 0;
    
    // Each city projects influence
    this.cities.forEach(city => {
      const distance = Math.sqrt(
        Math.pow(city.x - tileX, 2) + 
        Math.pow(city.y - tileY, 2)
      );
      
      // Influence decreases with distance
      const cityInfluenceRadius = this.influenceRadius * (1 + city.getVisualSize() * 0.2);
      
      if (distance < cityInfluenceRadius) {
        // Stronger influence closer to city
        const influenceStrength = 1 - (distance / cityInfluenceRadius);
        totalInfluence += influenceStrength;
      }
    });
    
    return Math.min(totalInfluence, 1); // Cap at 1
  }
}
