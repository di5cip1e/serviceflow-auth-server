import { Scene3D } from './Scene3D.js';
import { QuizScene } from './QuizScene.js';
import { RulerCreationScene } from './RulerCreationScene.js';
import { WorldManager } from './WorldManager.js';
import { POSITIVE_TRAITS, NEGATIVE_TRAITS, GOVERNMENT_TYPES } from './config.js';
import { VictorySystem } from './VictorySystem.js';
import { EventSystem } from './EventSystem.js';
import { TechTree } from './TechTree.js';
import { AIMemory } from './AIMemory.js';
import { GovernmentUnits } from './GovernmentUnits.js';
import { CouncilMechanics } from './CouncilMechanics.js';

// Global game state that will persist for AI decisions
window.gameState = {
  ruler: null,
  nation: null,
  world: null,
  initialized: false
};

class Game {
  constructor() {
    this.scene3D = null;
    this.currentUIScene = null;
    this.worldManager = null;
    this.phase = 'quiz'; // quiz, creation, world, playing
    
    // New system instances
    this.victorySystem = null;
    this.eventSystem = null;
    this.techTree = null;
    this.aiMemory = null;
    this.governmentUnits = null;
    this.councilMechanics = null;
    
    // Game speed (1x default)
    this.gameSpeed = 1;
    
    this.lastTime = 0;
    
    this.init();
  }

  init() {
    // Initialize 3D background scene
    this.scene3D = new Scene3D();
    
    // Start with personality quiz
    this.startQuiz();
    
    // Start game loop
    this.animate(0);
  }

  startQuiz() {
    this.phase = 'quiz';
    this.currentUIScene = new QuizScene((governmentType) => {
      this.onQuizComplete(governmentType);
    });
  }

  onQuizComplete(governmentType) {
    console.log('Quiz complete! Government type:', governmentType);
    this.startRulerCreation(governmentType);
  }

  startRulerCreation(governmentType) {
    this.phase = 'creation';
    this.currentUIScene = new RulerCreationScene(governmentType, (rulerData) => {
      this.onRulerCreated(rulerData);
    });
  }

  onRulerCreated(rulerData) {
    console.log('Ruler created!', rulerData);
    
    // Store in global game state for future AI use
    window.gameState.ruler = {
      name: rulerData.rulerName,
      gender: rulerData.rulerGender,
      governmentType: rulerData.governmentType,
      positiveTraits: rulerData.positiveTraits,
      negativeTraits: rulerData.negativeTraits
    };
    
    window.gameState.nation = {
      name: rulerData.nationName,
      capital: rulerData.capitalName
    };
    
    window.gameState.initialized = true;
    
    this.phase = 'world';
    this.showWorldGenerationMessage(rulerData);
  }
  
  showWorldGenerationMessage(rulerData) {
    const uiContainer = document.getElementById('ui-container');
    
    const panel = document.createElement('div');
    panel.className = 'ui-panel';
    panel.style.maxWidth = '600px';
    panel.innerHTML = `
      <h1>Generating World</h1>
      <p class="subtitle">Forging realms and rival rulers...</p>
      
      <div style="text-align: center; margin: 3rem 0;">
        <div style="font-size: 3rem; color: #c9a86a; animation: pulse 2s infinite;">⚔</div>
        <p style="color: #a89070; margin-top: 1rem;">
          Creating procedural map with dynamic biomes<br>
          Generating 3-9 rival AI nations<br>
          Establishing influence borders<br>
          Founding cities across the realm
        </p>
      </div>
    `;
    
    uiContainer.appendChild(panel);
    
    // Generate world after a short delay for visual feedback
    setTimeout(() => {
      this.startWorldGeneration(rulerData);
      panel.remove();
    }, 2000);
  }
  
  startWorldGeneration(rulerData) {
    console.log('Starting world generation...');
    
    // Hide 3D scene
    const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.style.display = 'none';
    
    // Create map canvas
    const mapCanvas = document.createElement('canvas');
    mapCanvas.id = 'mapCanvas';
    mapCanvas.style.position = 'fixed';
    mapCanvas.style.top = '0';
    mapCanvas.style.left = '0';
    mapCanvas.style.width = '100%';
    mapCanvas.style.height = '100%';
    mapCanvas.style.zIndex = '5';
    document.body.appendChild(mapCanvas);
    
    // Generate world
    this.worldManager = new WorldManager(mapCanvas, rulerData);
    
    // Initialize new game systems
    this.initializeGameSystems(rulerData);
    
    this.phase = 'playing';
    this.showWorldSummary();
  }
  
  initializeGameSystems(rulerData) {
    console.log('Initializing game systems...');
    
    // Initialize VictorySystem
    this.victorySystem = new VictorySystem(window.gameState);
    window.gameState.victorySystem = this.victorySystem;
    
    // Initialize EventSystem
    this.eventSystem = new EventSystem(window.gameState);
    window.gameState.eventSystem = this.eventSystem;
    
    // Initialize TechTree
    this.techTree = new TechTree(window.gameState);
    window.gameState.techTree = this.techTree;
    
    // Initialize AIMemory
    this.aiMemory = new AIMemory(window.gameState);
    window.gameState.aiMemory = this.aiMemory;
    
    // Initialize GovernmentUnits
    this.governmentUnits = new GovernmentUnits(window.gameState);
    window.gameState.governmentUnits = this.governmentUnits;
    
    // Initialize CouncilMechanics
    this.councilMechanics = new CouncilMechanics(window.gameState);
    window.gameState.councilMechanics = this.councilMechanics;
    
    console.log('Game systems initialized:', {
      victorySystem: !!this.victorySystem,
      eventSystem: !!this.eventSystem,
      techTree: !!this.techTree,
      aiMemory: !!this.aiMemory,
      governmentUnits: !!this.governmentUnits,
      councilMechanics: !!this.councilMechanics
    });
  }
  
  showWorldSummary() {
    const uiContainer = document.getElementById('ui-container');
    
    const nations = this.worldManager.nations;
    const playerNation = nations[0];
    
    const panel = document.createElement('div');
    panel.className = 'ui-panel';
    panel.style.maxWidth = '800px';
    panel.style.maxHeight = '80%';
    panel.style.overflowY = 'auto';
    panel.innerHTML = `
      <h1>The World Awaits</h1>
      <p class="subtitle">Phase 2 Complete - ${nations.length} nations vie for power</p>
      
      <div style="margin: 2rem 0; padding: 1.5rem; background: rgba(80, 60, 40, 0.3); border-radius: 6px; border-left: 3px solid #c9a86a;">
        <div style="font-size: 1.3rem; color: #e8d4a8; margin-bottom: 0.5rem;">
          <strong>${playerNation.name}</strong>
        </div>
        <div style="color: #b4a088;">
          Ruled by ${playerNation.ruler.name} from ${playerNation.getCapital().name}
        </div>
      </div>
      
      <h2 style="font-family: 'Cinzel', serif; color: #c9a86a; text-align: center; margin: 2rem 0 1rem 0;">Rival Nations</h2>
      
      <div style="display: grid; gap: 1rem;">
        ${nations.slice(1).map(nation => `
          <div style="padding: 1rem; background: rgba(40, 30, 50, 0.5); border-radius: 6px; border-left: 3px solid ${nation.color};">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
              <div>
                <div style="font-weight: 700; color: #e8d4a8; font-size: 1.1rem;">${nation.name}</div>
                <div style="color: #a89070; font-size: 0.9rem;">${nation.ruler.name} • ${nation.ruler.governmentType}</div>
              </div>
              <div style="width: 20px; height: 20px; background: ${nation.color}; border-radius: 3px; border: 1px solid #000;"></div>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
              ${nation.ruler.positiveTraits.slice(0, 3).map(traitId => {
                const trait = POSITIVE_TRAITS.find(t => t.id === traitId);
                return `<span style="background: rgba(120, 90, 60, 0.5); padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.85rem; color: #d4c5a9;">+${trait.name}</span>`;
              }).join('')}
              ${nation.ruler.negativeTraits.slice(0, 2).map(traitId => {
                const trait = NEGATIVE_TRAITS.find(t => t.id === traitId);
                return `<span style="background: rgba(120, 50, 50, 0.5); padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.85rem; color: #e8a8a8;">-${trait.name}</span>`;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(120, 90, 60, 0.15); border-radius: 6px; border: 1px solid rgba(200, 150, 90, 0.3);">
        <p style="color: #c9a86a; font-weight: 700; margin-bottom: 0.5rem;">Phase 2 Complete</p>
        <p style="color: #d4c5a9; line-height: 1.6;">
          The world has been generated with <strong>${nations.length} nations</strong> competing for dominance. 
          Each rival ruler was created using the same trait system as your own, with unique personalities 
          that will drive their autonomous decisions. Cities will grow dynamically based on population, 
          and influence borders will expand and contract as nations prosper or struggle.
        </p>
        <p style="color: #a89070; line-height: 1.6; margin-top: 1rem; font-size: 0.95rem;">
          <strong>Map Controls:</strong> Drag to pan • Scroll to zoom • Hover tiles for info
        </p>
      </div>
      
      <button class="action-button" id="start-playing">Begin Your Counsel</button>
    `;
    
    uiContainer.appendChild(panel);
    
    document.getElementById('start-playing').addEventListener('click', () => {
      panel.remove();
      console.log('Game started! World state:', window.gameState);
      console.log('Controls: Drag to pan, Scroll to zoom, Click "Advance Turn" to progress');
    });
  }

  animate(currentTime) {
    requestAnimationFrame((time) => this.animate(time));
    
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap delta time
    this.lastTime = currentTime;
    
    // Calculate scaled time based on game speed
    const scaledTime = deltaTime * this.gameSpeed;
    
    // Update 3D scene (only in early phases)
    if (this.scene3D && this.phase !== 'playing') {
      this.scene3D.update(deltaTime);
      this.scene3D.render();
    }
    
    // Update world manager (during play)
    if (this.worldManager && this.phase === 'playing') {
      this.worldManager.update(deltaTime);
    }
    
    // Update new game systems with scaled time
    if (this.phase === 'playing') {
      if (this.victorySystem) this.victorySystem.processTimeElapsed(scaledTime);
      if (this.eventSystem) this.eventSystem.processTimeElapsed(scaledTime);
      if (this.techTree) this.techTree.processTimeElapsed(scaledTime);
      if (this.aiMemory) this.aiMemory.processTimeElapsed(scaledTime);
    }
  }
}

// Start the game
new Game();
