import { WorldGenerator } from './WorldGenerator.js';
import { AIRulerGenerator } from './AIRulerGenerator.js';
import { Nation } from './Nation.js';
import { MapRenderer } from './MapRenderer.js';
import { GameUI } from './GameUI.js';
import { CounselManager } from './CounselManager.js';
import { AIActionEngine } from './AIActionEngine.js';
import { AIDiplomacy } from './AIDiplomacy.js';
import { IncomeSystem } from './IncomeSystem.js';
import { ArmyManager } from './ArmyManager.js';
import { BattleSystem } from './BattleSystem.js';
import { ArmyUI } from './ArmyUI.js';
import { ConquestSystem } from './ConquestSystem.js';
import { MistakeDetector } from './MistakeDetector.js';
import { MessageFeed } from './MessageFeed.js';
import { WORLD_CONFIG, NATION_COLORS } from './config.js';

export class WorldManager {
  constructor(canvas, playerRulerData) {
    this.canvas = canvas;
    this.playerRulerData = playerRulerData;
    
    this.world = null;
    this.nations = [];
    this.renderer = null;
    this.gameUI = null;
    this.counselManager = null;
    this.aiActionEngine = null;
    this.aiDiplomacy = null;
    this.incomeSystem = null;
    this.armyManager = null;
    this.battleSystem = null;
    this.armyUI = null;
    this.conquestSystem = null;
    this.mistakeDetector = null;
    this.messageFeed = null;
    
    this.turnNumber = 0;
    this.lastUpdateTime = Date.now();
    this.paused = false;
    this.gameSpeed = 1.0; // Speed multiplier (0 = paused, 0.5 = slow, 1 = normal, 2 = fast, 4 = very fast)
    
    this.generate();
  }
  
  generate() {
    console.log('=== WORLD GENERATION START ===');
    
    // 1. Generate world terrain
    this.world = new WorldGenerator();
    this.world.generate();
    
    // 2. Determine number of nations (3-9 including player)
    const numNations = Math.floor(Math.random() * (WORLD_CONFIG.maxNations - WORLD_CONFIG.minNations + 1)) + WORLD_CONFIG.minNations;
    console.log(`Generating ${numNations} nations (including player)`);
    
    // 3. Find good starting locations
    const settleableLocations = this.world.findSettlableLocations();
    const startLocations = this.selectStartingLocations(settleableLocations, numNations);
    
    // 4. Create player nation (always id 0)
    const playerNation = new Nation(
      0,
      this.playerRulerData,
      NATION_COLORS[0],
      startLocations[0]
    );
    this.nations.push(playerNation);
    console.log(`Player Nation: ${playerNation.name} (${playerNation.ruler.name})`);
    
    // 5. Generate AI nations using the same trait system
    const usedNames = {
      rulers: [this.playerRulerData.rulerName],
      nations: [this.playerRulerData.nationName],
      capitals: [this.playerRulerData.capitalName]
    };
    
    for (let i = 1; i < numNations; i++) {
      const aiRulerData = AIRulerGenerator.generateRuler(usedNames);
      const aiNation = new Nation(
        i,
        aiRulerData,
        NATION_COLORS[i % NATION_COLORS.length],
        startLocations[i]
      );
      this.nations.push(aiNation);
      
      console.log(`AI Nation ${i}: ${aiNation.name} (${aiNation.ruler.name})`);
      console.log(`  - Government: ${aiNation.ruler.governmentType}`);
      console.log(`  - Positive Traits: ${aiNation.ruler.positiveTraits.join(', ')}`);
      console.log(`  - Negative Traits: ${aiNation.ruler.negativeTraits.join(', ')}`);
    }
    
    // 6. Initialize influence
    this.updateInfluence();
    
    // 7. Create message feed (must be before other systems)
    this.messageFeed = new MessageFeed();
    console.log('Message Feed initialized - notifications ready');
    
    // 8. Create renderer
    this.renderer = new MapRenderer(this.canvas, this.world, this.nations, this);
    
    // 9. Create game UI
    this.gameUI = new GameUI(this);
    this.gameUI.update();
    
    // 10. Create counsel system (Phase 3)
    this.counselManager = new CounselManager(this);
    
    // 10. Create AI action engine (Phase 4 Expansion)
    this.aiActionEngine = new AIActionEngine(this);
    console.log('AI Action Engine initialized - rulers will act autonomously');
    
    // 11. Create AI-to-AI diplomacy system (Phase 4: Diplomacy)
    this.aiDiplomacy = new AIDiplomacy(this);
    console.log('AI Diplomacy initialized - nations will interact autonomously');
    
    // 12. Create income system (Phase 5A: Economy)
    this.incomeSystem = new IncomeSystem(this);
    console.log('Income System initialized - nations will generate gold from cities, trade, and territory');
    
    // 13. Create military systems (Phase 5B: Military)
    this.armyManager = new ArmyManager(this);
    this.battleSystem = new BattleSystem(this);
    this.armyUI = new ArmyUI(this);
    console.log('Military System initialized - army management, battles, and tactics enabled');
    
    // 14. Create conquest system (Phase 5C: Conquest)
    this.conquestSystem = new ConquestSystem(this);
    console.log('Conquest System initialized - city capture and territory conquest enabled');
    
    // 15. Create mistake detection system (Phase 5D: Mistake Detection)
    this.mistakeDetector = new MistakeDetector(this, this.counselManager);
    console.log('Mistake Detection System initialized - AI failures reward threaten tokens');
    
    console.log('=== WORLD GENERATION COMPLETE ===');
    
    // Save world state globally
    window.gameState.world = {
      nations: this.nations.map(n => ({
        id: n.id,
        name: n.name,
        ruler: n.ruler,
        color: n.color,
        cities: n.cities.map(c => ({
          name: c.name,
          x: c.x,
          y: c.y,
          population: c.population,
          isCapital: c.isCapital
        }))
      })),
      turnNumber: this.turnNumber
    };
  }
  
  selectStartingLocations(settleableLocations, count) {
    // Sort by fertility
    settleableLocations.sort((a, b) => b.fertility - a.fertility);
    
    // Pick locations that are well-distributed
    const selected = [];
    const minDistance = 20; // Minimum distance between starts
    
    for (const location of settleableLocations) {
      if (selected.length >= count) break;
      
      // Check if far enough from other selected locations
      const isFarEnough = selected.every(s => {
        const dist = Math.sqrt(
          Math.pow(s.x - location.x, 2) + 
          Math.pow(s.y - location.y, 2)
        );
        return dist >= minDistance;
      });
      
      if (isFarEnough) {
        selected.push(location);
      }
    }
    
    // If we couldn't find enough well-spaced locations, just take the best
    while (selected.length < count && settleableLocations.length > 0) {
      selected.push(settleableLocations[selected.length]);
    }
    
    return selected;
  }
  
  update(deltaTime) {
    // Skip updates if paused
    if (this.paused) {
      if (this.renderer) {
        this.renderer.render();
      }
      return;
    }
    
    // Apply game speed multiplier to delta time
    const adjustedDelta = deltaTime * this.gameSpeed;
    
    // Track city growth for notifications
    const oldPopulations = new Map();
    this.nations[0].cities.forEach(city => {
      oldPopulations.set(city.id, city.population);
    });
    
    // Update all nations (population growth, etc.)
    this.nations.forEach(nation => nation.update(adjustedDelta));
    
    // Update AI Action Engine
    if (this.aiActionEngine) {
      this.aiActionEngine.update(adjustedDelta);
    }
    
    // Update AI Diplomacy
    if (this.aiDiplomacy) {
      this.aiDiplomacy.update(adjustedDelta);
    }
    
    // Update Income System
    if (this.incomeSystem) {
      this.incomeSystem.update(adjustedDelta);
    }
    
    // Update Army Manager (movement)
    if (this.armyManager) {
      this.armyManager.update(adjustedDelta);
    }
    
    // Check for battles
    if (this.battleSystem) {
      this.battleSystem.checkForBattles();
    }
    
    // Update sieges
    if (this.conquestSystem) {
      this.conquestSystem.updateSieges(adjustedDelta);
    }
    
    // Update mistake detector
    if (this.mistakeDetector) {
      this.mistakeDetector.update();
    }
    
    // Check for city growth milestones
    this.nations[0].cities.forEach(city => {
      const oldPop = oldPopulations.get(city.id);
      if (oldPop && this.gameUI) {
        this.gameUI.showCityGrowthNotification(city, oldPop, city.population);
      }
    });
    
    // Periodically recalculate influence (expensive operation)
    const currentTime = Date.now();
    if (currentTime - this.lastUpdateTime > 1000) { // Every second
      this.updateInfluence();
      this.lastUpdateTime = currentTime;
      
      // Update UI stats
      if (this.gameUI) {
        this.gameUI.update();
      }
    }
    
    // Render
    if (this.renderer) {
      this.renderer.render();
    }
  }
  
  updateInfluence() {
    // Clear all influence
    for (let y = 0; y < this.world.height; y++) {
      for (let x = 0; x < this.world.width; x++) {
        this.world.tiles[y][x].nationId = null;
        this.world.tiles[y][x].influence = 0;
      }
    }
    
    // Calculate influence for each tile
    for (let y = 0; y < this.world.height; y++) {
      for (let x = 0; x < this.world.width; x++) {
        let maxInfluence = 0;
        let dominantNation = null;
        
        // Check each nation's influence
        this.nations.forEach(nation => {
          const influence = nation.calculateInfluence(x, y);
          
          if (influence > maxInfluence) {
            maxInfluence = influence;
            dominantNation = nation;
          }
        });
        
        // Assign tile to nation with strongest influence
        if (dominantNation && maxInfluence > 0.1) {
          this.world.tiles[y][x].nationId = dominantNation.id;
          this.world.tiles[y][x].influence = maxInfluence;
        }
      }
    }
  }
  
  advanceTurn() {
    this.turnNumber++;
    console.log(`=== TURN ${this.turnNumber} ===`);
    
    // Log nation statistics
    this.nations.forEach(nation => {
      const totalPop = nation.getTotalPopulation();
      const cityCount = nation.cities.length;
      console.log(`${nation.name}: ${cityCount} cities, ${Math.floor(totalPop).toLocaleString()} population`);
    });
    
    // Update influence
    this.updateInfluence();
    
    // Update global game state
    window.gameState.world.turnNumber = this.turnNumber;
    
    // AI nations take actions (future phase)
    this.nations.forEach(nation => {
      if (nation.id !== 0) { // Skip player nation
        // TODO: AI decision making in future phase
        // Will use ruler traits to make autonomous decisions
      }
    });
  }
  
  getPlayerNation() {
    return this.nations.find(n => n.id === 0);
  }
  
  showNotification(message, type = 'info') {
    // Use message feed for all notifications
    if (this.messageFeed) {
      // Parse title and description from message
      let title = message;
      let description = '';
      
      // Split on colon or newline if present
      if (message.includes(':')) {
        const parts = message.split(':');
        title = parts[0].trim();
        description = parts.slice(1).join(':').trim();
      } else if (message.includes('\n')) {
        const parts = message.split('\n');
        title = parts[0].trim();
        description = parts.slice(1).join(' ').trim();
      }
      
      this.messageFeed.addMessage({
        title,
        description,
        type
      });
    }
  }
}
