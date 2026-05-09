import { BIOMES } from './config.js';

/**
 * ConquestSystem - Territory capture and city conquest mechanics
 * Phase 5C: Conquest Mechanics
 * 
 * Victorious armies can:
 * - Capture enemy cities
 * - Claim surrounding territory
 * - Trigger border shifts
 * - Gain spoils of war
 */

export class ConquestSystem {
  constructor(worldManager) {
    this.worldManager = worldManager;
    this.sieges = new Map(); // cityId -> siege data
    this.conquestHistory = [];
  }
  
  /**
   * Process conquest after battle victory
   */
  processConquest(battle, victorArmy, defeatedArmy) {
    const victor = battle.result.victor;
    const victorNation = this.worldManager.nations.find(n => n.id === victorArmy.nationId);
    const defeatedNation = this.worldManager.nations.find(n => n.id === defeatedArmy.nationId);
    
    if (!victorNation || !defeatedNation) return;
    
    const battleLocation = battle.location;
    const tile = this.worldManager.world.tiles[battleLocation.y][battleLocation.x];
    
    // Check if battle was at a city
    const cityAtLocation = defeatedNation.cities.find(city => 
      Math.abs(city.x - battleLocation.x) <= 1 && 
      Math.abs(city.y - battleLocation.y) <= 1
    );
    
    const conquestResult = {
      victorNation: victorNation.name,
      defeatedNation: defeatedNation.name,
      location: battleLocation,
      timestamp: Date.now(),
      type: null,
      details: {}
    };
    
    // 1. CITY CONQUEST (if battle near city)
    if (cityAtLocation) {
      const captureSuccess = this.attemptCityCapture(
        victorArmy, 
        defeatedArmy, 
        cityAtLocation, 
        victorNation, 
        defeatedNation,
        battle.result
      );
      
      if (captureSuccess) {
        conquestResult.type = 'city_capture';
        conquestResult.details = {
          cityName: cityAtLocation.name,
          wasCapital: cityAtLocation.isCapital,
          population: cityAtLocation.population
        };
      } else {
        conquestResult.type = 'siege_started';
        conquestResult.details = {
          cityName: cityAtLocation.name,
          siegeStrength: this.calculateSiegeStrength(victorArmy)
        };
      }
    } else {
      // 2. TERRITORY CONQUEST (open field battle)
      const territoryCaptured = this.captureTerritory(
        victorArmy,
        battleLocation,
        victorNation,
        defeatedNation,
        battle.result
      );
      
      conquestResult.type = 'territory_capture';
      conquestResult.details = {
        tilesCaptured: territoryCaptured
      };
    }
    
    // 3. SPOILS OF WAR
    const spoils = this.awardSpoilsOfWar(victorNation, defeatedNation, battle.result);
    conquestResult.details.spoils = spoils;
    
    // Store in history
    this.conquestHistory.push(conquestResult);
    if (this.conquestHistory.length > 100) {
      this.conquestHistory.shift();
    }
    
    // Update influence borders
    this.worldManager.updateInfluence();
    
    // Notify player if involved
    if (victorNation.id === 0) {
      this.notifyPlayerConquest(conquestResult);
    } else if (defeatedNation.id === 0) {
      this.notifyPlayerLoss(conquestResult);
    }
    
    return conquestResult;
  }
  
  /**
   * Attempt to capture an enemy city
   */
  attemptCityCapture(victorArmy, defeatedArmy, city, victorNation, defeatedNation, battleResult) {
    // Calculate capture chance based on:
    // 1. Decisiveness of victory
    // 2. Siege equipment (siege engines)
    // 3. City defenses (fortifications nearby)
    // 4. City size (larger = harder)
    
    const decisiveness = battleResult.decisive ? 1.5 : 1.0;
    
    // Siege strength from army composition
    const siegeUnits = victorArmy.units.siege || 0;
    const totalUnits = victorArmy.getTotalUnits();
    const siegeRatio = totalUnits > 0 ? siegeUnits / totalUnits : 0;
    const siegeBonus = 1 + (siegeRatio * 2); // Up to 3x if all siege
    
    // City defenses
    const citySize = city.getSize();
    const sizeDefense = {
      small: 1.0,
      medium: 1.3,
      large: 1.6,
      huge: 2.0
    }[citySize] || 1.0;
    
    // Check for nearby fortifications
    let fortificationBonus = 1.0;
    if (defeatedNation.fortresses) {
      const nearbyFortress = defeatedNation.fortresses.some(f =>
        Math.sqrt(Math.pow(f.x - city.x, 2) + Math.pow(f.y - city.y, 2)) < 3
      );
      if (nearbyFortress) {
        fortificationBonus = 1.5;
      }
    }
    
    // Capital cities are harder to capture
    const capitalBonus = city.isCapital ? 1.5 : 1.0;
    
    // Calculate capture chance (0-1)
    const attackStrength = decisiveness * siegeBonus * 0.8;
    const defenseStrength = sizeDefense * fortificationBonus * capitalBonus;
    const captureChance = attackStrength / (attackStrength + defenseStrength);
    
    // Minimum 20% chance, maximum 95% chance
    const finalChance = Math.max(0.2, Math.min(0.95, captureChance));
    
    console.log(`City Capture Attempt: ${city.name}`);
    console.log(`  Attack Strength: ${attackStrength.toFixed(2)}`);
    console.log(`  Defense Strength: ${defenseStrength.toFixed(2)}`);
    console.log(`  Capture Chance: ${(finalChance * 100).toFixed(1)}%`);
    
    // Roll for capture
    const roll = Math.random();
    
    if (roll < finalChance) {
      // CITY CAPTURED!
      this.captureCity(city, victorNation, defeatedNation);
      return true;
    } else {
      // City resists - start siege
      this.startSiege(city, victorArmy, victorNation, defeatedNation);
      return false;
    }
  }
  
  /**
   * Capture a city
   */
  captureCity(city, victorNation, defeatedNation) {
    const wasCapital = city.isCapital;
    const cityName = city.name;
    
    console.log(`🏰 ${victorNation.name} captures ${cityName} from ${defeatedNation.name}!`);
    
    // Remove from defeated nation
    const cityIndex = defeatedNation.cities.findIndex(c => c.id === city.id);
    if (cityIndex !== -1) {
      defeatedNation.cities.splice(cityIndex, 1);
    }
    
    // If was capital, defeated nation loses capital bonus
    if (wasCapital && defeatedNation.cities.length > 0) {
      // Largest remaining city becomes new capital
      defeatedNation.cities.sort((a, b) => b.population - a.population);
      defeatedNation.cities[0].isCapital = true;
      defeatedNation.capitalId = defeatedNation.cities[0].id;
      
      console.log(`  ${defeatedNation.cities[0].name} becomes new capital of ${defeatedNation.name}`);
    }
    
    // City loses population from conquest (20-40%)
    const populationLoss = 0.2 + Math.random() * 0.2;
    city.population = Math.floor(city.population * (1 - populationLoss));
    
    // Change city ownership
    city.nationId = victorNation.id;
    city.isCapital = false; // Conquered cities are never capitals
    
    // Update city ID to reflect new nation
    const newCityId = `city_${victorNation.id}_${victorNation.cities.length}`;
    city.id = newCityId;
    
    // Add to victor nation
    victorNation.cities.push(city);
    
    // Grant gold spoils from city treasury
    const citySpoils = Math.floor(city.population / 10);
    victorNation.gold += citySpoils;
    
    console.log(`  Population: ${Math.floor(city.population * (1 + populationLoss))} → ${city.population} (-${Math.floor(populationLoss * 100)}%)`);
    console.log(`  Treasury looted: ${citySpoils}g`);
    
    // Check if defeated nation is eliminated
    if (defeatedNation.cities.length === 0) {
      this.eliminateNation(defeatedNation, victorNation);
    }
  }
  
  /**
   * Start siege on a city
   */
  startSiege(city, army, victorNation, defeatedNation) {
    const siegeData = {
      cityId: city.id,
      cityName: city.name,
      armyId: army.id,
      attackerNationId: victorNation.id,
      defenderNationId: defeatedNation.id,
      siegeStrength: this.calculateSiegeStrength(army),
      startTime: Date.now(),
      progress: 0 // 0-100%
    };
    
    this.sieges.set(city.id, siegeData);
    
    console.log(`⏳ Siege begun: ${victorNation.name} besieges ${city.name}`);
    console.log(`  Siege Strength: ${siegeData.siegeStrength}`);
    
    // Position army at city
    army.x = city.x;
    army.y = city.y;
    army.isMoving = false;
  }
  
  /**
   * Calculate siege strength from army composition
   */
  calculateSiegeStrength(army) {
    const siegeUnits = army.units.siege || 0;
    const totalUnits = army.getTotalUnits();
    
    // Base strength from total army size
    let strength = totalUnits * 2;
    
    // Siege engines provide 5x bonus per unit
    strength += siegeUnits * 10;
    
    return strength;
  }
  
  /**
   * Update ongoing sieges
   */
  updateSieges(deltaTime) {
    for (const [cityId, siege] of this.sieges.entries()) {
      const city = this.findCity(cityId);
      const army = this.worldManager.armyManager.getArmy(siege.armyId);
      
      // Check if siege is still valid
      if (!city || !army || army.isDestroyed()) {
        this.sieges.delete(cityId);
        continue;
      }
      
      // Check if army is still at city
      const distance = Math.sqrt(
        Math.pow(army.x - city.x, 2) +
        Math.pow(army.y - city.y, 2)
      );
      
      if (distance > 2) {
        // Army moved away, siege lifted
        console.log(`⏸️ Siege lifted: Army moved away from ${city.name}`);
        
        // Check for mistake (abandoned siege - Phase 5D)
        if (this.worldManager.mistakeDetector && siege.attackerNationId === 0) {
          this.worldManager.mistakeDetector.checkSiegeAbandoned(siege);
        }
        
        this.sieges.delete(cityId);
        continue;
      }
      
      // Progress siege (1% per 5 seconds for 100 strength)
      const progressRate = (siege.siegeStrength / 100) * 0.2; // Base 0.2% per second
      siege.progress += progressRate * deltaTime;
      
      // Check if siege complete
      if (siege.progress >= 100) {
        this.completeSiege(cityId, siege);
      }
    }
  }
  
  /**
   * Complete siege and capture city
   */
  completeSiege(cityId, siege) {
    const city = this.findCity(cityId);
    const victorNation = this.worldManager.nations.find(n => n.id === siege.attackerNationId);
    const defeatedNation = this.worldManager.nations.find(n => n.id === siege.defenderNationId);
    
    if (!city || !victorNation || !defeatedNation) {
      this.sieges.delete(cityId);
      return;
    }
    
    console.log(`🏰 Siege complete! ${victorNation.name} captures ${city.name}`);
    
    this.captureCity(city, victorNation, defeatedNation);
    this.sieges.delete(cityId);
    
    // Notify player
    if (victorNation.id === 0) {
      this.worldManager.showNotification(
        `🏰 ${city.name} captured after siege!`,
        'success'
      );
    } else if (defeatedNation.id === 0) {
      this.worldManager.showNotification(
        `💔 ${city.name} has fallen to ${victorNation.name}!`,
        'warning'
      );
    }
  }
  
  /**
   * Capture territory after field battle
   */
  captureTerritory(army, location, victorNation, defeatedNation, battleResult) {
    // Capture tiles in radius based on:
    // 1. Decisiveness of victory
    // 2. Army size
    // 3. Battle location ownership
    
    const baseRadius = battleResult.decisive ? 4 : 3;
    const armySizeBonus = Math.floor(army.getTotalUnits() / 30); // +1 per 30 units
    const captureRadius = Math.min(baseRadius + armySizeBonus, 8);
    
    let tilesCaptured = 0;
    const capturedTiles = [];
    
    // Capture tiles in radius
    for (let dy = -captureRadius; dy <= captureRadius; dy++) {
      for (let dx = -captureRadius; dx <= captureRadius; dx++) {
        const tx = location.x + dx;
        const ty = location.y + dy;
        
        // Check bounds
        if (tx < 0 || tx >= this.worldManager.world.width ||
            ty < 0 || ty >= this.worldManager.world.height) {
          continue;
        }
        
        // Check distance (circular radius)
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > captureRadius) continue;
        
        const tile = this.worldManager.world.tiles[ty][tx];
        
        // Can only capture enemy or neutral tiles
        if (tile.nationId === null || tile.nationId === defeatedNation.id) {
          // Don't capture ocean
          if (tile.biome === BIOMES.OCEAN) continue;
          
          // Capture tile
          tile.nationId = victorNation.id;
          tilesCaptured++;
          capturedTiles.push({ x: tx, y: ty });
        }
      }
    }
    
    console.log(`📍 ${victorNation.name} captures ${tilesCaptured} tiles around (${location.x}, ${location.y})`);
    
    return tilesCaptured;
  }
  
  /**
   * Award spoils of war to victor
   */
  awardSpoilsOfWar(victorNation, defeatedNation, battleResult) {
    // Gold spoils based on:
    // 1. Defeated army value
    // 2. Decisiveness
    // 3. Defeated nation wealth
    
    const baseGold = battleResult.decisive ? 200 : 100;
    const wealthFactor = Math.min(defeatedNation.gold / 1000, 2); // Up to 2x if rich
    const goldSpoils = Math.floor(baseGold * wealthFactor);
    
    // Transfer gold
    const actualGold = Math.min(goldSpoils, defeatedNation.gold);
    victorNation.gold += actualGold;
    defeatedNation.gold = Math.max(0, defeatedNation.gold - actualGold);
    
    console.log(`💰 ${victorNation.name} loots ${actualGold}g from ${defeatedNation.name}`);
    
    return {
      gold: actualGold
    };
  }
  
  /**
   * Eliminate nation when all cities lost
   */
  eliminateNation(defeatedNation, victorNation) {
    console.log(`💀 ${defeatedNation.name} has been eliminated by ${victorNation.name}!`);
    
    // Transfer all remaining gold
    victorNation.gold += defeatedNation.gold;
    
    // Transfer all remaining territory
    for (let y = 0; y < this.worldManager.world.height; y++) {
      for (let x = 0; x < this.worldManager.world.width; x++) {
        const tile = this.worldManager.world.tiles[y][x];
        if (tile.nationId === defeatedNation.id) {
          tile.nationId = victorNation.id;
        }
      }
    }
    
    // Destroy all armies
    if (this.worldManager.armyManager) {
      const armies = this.worldManager.armyManager.getArmiesForNation(defeatedNation.id);
      armies.forEach(army => {
        this.worldManager.armyManager.deleteArmy(army.id);
      });
    }
    
    // End all wars
    if (defeatedNation.wars) {
      defeatedNation.wars.forEach(war => {
        const enemy = this.worldManager.nations.find(n => n.id === war.enemyId);
        if (enemy && enemy.wars) {
          enemy.wars = enemy.wars.filter(w => w.enemyId !== defeatedNation.id);
        }
      });
      defeatedNation.wars = [];
    }
    
    // Cancel all treaties
    if (this.worldManager.diplomacyManager) {
      this.worldManager.diplomacyManager.cancelAllTreatiesWithNation(defeatedNation.id);
    }
    
    // Mark as eliminated (but keep in list for history)
    defeatedNation.eliminated = true;
    defeatedNation.eliminatedBy = victorNation.id;
    defeatedNation.eliminatedTurn = this.worldManager.turnNumber;
    
    // Major notification
    if (victorNation.id === 0) {
      this.worldManager.showNotification(
        `👑 VICTORY! ${defeatedNation.name} has been eliminated!`,
        'success'
      );
    } else if (defeatedNation.id === 0) {
      this.worldManager.showNotification(
        `💀 DEFEAT! Your nation has been eliminated by ${victorNation.name}!`,
        'warning'
      );
      
      // Show game over screen
      if (this.worldManager.gameUI) {
        this.worldManager.gameUI.showGameOver(victorNation.name);
      }
    } else {
      this.worldManager.showNotification(
        `📰 ${defeatedNation.name} eliminated by ${victorNation.name}!`,
        'info'
      );
    }
  }
  
  /**
   * Find city by ID across all nations
   */
  findCity(cityId) {
    for (const nation of this.worldManager.nations) {
      const city = nation.cities.find(c => c.id === cityId);
      if (city) return city;
    }
    return null;
  }
  
  /**
   * Notify player of conquest
   */
  notifyPlayerConquest(result) {
    if (result.type === 'city_capture') {
      const city = result.details.cityName;
      const wasCapital = result.details.wasCapital;
      
      const message = wasCapital ?
        `👑 ${city} (capital) captured!` :
        `🏰 ${city} captured!`;
      
      this.worldManager.showNotification(message, 'success');
    } else if (result.type === 'siege_started') {
      this.worldManager.showNotification(
        `⏳ Siege of ${result.details.cityName} begun!`,
        'info'
      );
    } else if (result.type === 'territory_capture') {
      this.worldManager.showNotification(
        `📍 ${result.details.tilesCaptured} tiles captured!`,
        'success'
      );
    }
    
    // Show gold spoils
    if (result.details.spoils && result.details.spoils.gold > 0) {
      setTimeout(() => {
        this.worldManager.showNotification(
          `💰 +${result.details.spoils.gold}g looted!`,
          'success'
        );
      }, 1000);
    }
  }
  
  /**
   * Notify player of loss
   */
  notifyPlayerLoss(result) {
    if (result.type === 'city_capture') {
      this.worldManager.showNotification(
        `💔 ${result.details.cityName} has fallen!`,
        'warning'
      );
    } else if (result.type === 'territory_capture') {
      this.worldManager.showNotification(
        `⚠️ ${result.details.tilesCaptured} tiles lost!`,
        'warning'
      );
    }
  }
  
  /**
   * Get active sieges for a nation
   */
  getActiveSieges(nationId) {
    const sieges = [];
    for (const [cityId, siege] of this.sieges.entries()) {
      if (siege.attackerNationId === nationId || siege.defenderNationId === nationId) {
        sieges.push(siege);
      }
    }
    return sieges;
  }
  
  /**
   * Get conquest history for a nation
   */
  getConquestHistory(nationId, limit = 10) {
    return this.conquestHistory
      .filter(c => 
        this.worldManager.nations.find(n => n.name === c.victorNation)?.id === nationId ||
        this.worldManager.nations.find(n => n.name === c.defeatedNation)?.id === nationId
      )
      .slice(-limit);
  }
}
