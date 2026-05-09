import { CounselUI } from './CounselUI.js';
import { RulerAI } from './RulerAI.js';
import { ThreatenSystem } from './ThreatenSystem.js';
import { ActionExecutor } from './ActionExecutor.js';
import { DiplomacyManager } from './DiplomacyManager.js';

export class CounselManager {
  constructor(worldManager) {
    this.worldManager = worldManager;
    this.rulerAI = new RulerAI(worldManager);
    this.threatenSystem = new ThreatenSystem();
    this.actionExecutor = new ActionExecutor(worldManager);
    this.counselUI = null;
    this.diplomacyManager = null;
    this.pendingAdvice = null;
    this.diplomacyMode = false; // Track if in diplomacy mode
    
    this.init();
  }
  
  init() {
    // Create UI
    this.counselUI = new CounselUI(
      this.worldManager,
      (advice) => this.handleMessage(advice)
    );
    
    // Create diplomacy manager
    this.diplomacyManager = new DiplomacyManager(this.worldManager, this.counselUI);
    
    // Connect diplomacy manager to world manager so other systems can access it
    this.worldManager.diplomacyManager = this.diplomacyManager;
    
    console.log('Counsel system initialized');
    console.log('- Type advice to your ruler');
    console.log('- They will decide based on personality traits');
    console.log('- Threaten tokens generate over time or from ruler mistakes');
    console.log('- Click rival nations to engage in diplomacy');
  }
  
  /**
   * Handle message (routes to counsel or diplomacy)
   */
  handleMessage(message) {
    if (this.diplomacyMode) {
      return this.diplomacyManager.handleProposal(message);
    } else {
      return this.handleAdvice(message);
    }
  }
  
  /**
   * Open diplomacy with a rival nation
   */
  openDiplomacy(nationId) {
    this.diplomacyMode = true;
    this.diplomacyManager.openDiplomacy(nationId);
  }
  
  /**
   * Close diplomacy and return to counsel mode
   */
  closeDiplomacy() {
    this.diplomacyMode = false;
    this.diplomacyManager.closeDiplomacy();
  }
  
  async handleAdvice(adviceText) {
    console.log('=== COUNSEL RECEIVED ===');
    console.log('Advice:', adviceText);
    
    // Store pending advice
    this.pendingAdvice = adviceText;
    
    // Check if we can threaten
    const canThreaten = this.threatenSystem.canThreaten();
    
    // Get AI decision
    const decision = await this.rulerAI.evaluateAdvice(adviceText, canThreaten);
    
    console.log('Decision:', decision);
    console.log('Accepted:', decision.accepted);
    console.log('Reasoning:', decision.reasoning);
    console.log('Response:', decision.response);
    
    // If rejected and we have tokens, offer to threaten
    if (!decision.accepted && canThreaten) {
      this.showThreatenDialog(adviceText, decision);
    } else {
      // Show ruler response
      this.counselUI.addRulerMessage(decision.response, decision.accepted);
      
      // Execute decision if accepted
      if (decision.accepted) {
        this.executeAdvice(adviceText);
      }
      
      // Log to game state
      this.logAdvice(adviceText, decision, false);
    }
  }
  
  showThreatenDialog(adviceText, originalDecision) {
    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: linear-gradient(135deg, rgba(20, 15, 25, 0.98), rgba(35, 25, 40, 0.98));
      border: 2px solid rgba(180, 140, 80, 0.6);
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.9);
    `;
    
    const playerNation = this.worldManager.getPlayerNation();
    const pronouns = playerNation.ruler.gender === 'male' ? 'he' : 
                     playerNation.ruler.gender === 'female' ? 'she' : 'they';
    
    dialog.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">⚔</div>
        <h2 style="font-family: 'Cinzel', serif; color: #c9a86a; margin: 0; font-size: 1.5rem;">
          Ruler Rejected Your Counsel
        </h2>
      </div>
      
      <div style="background: rgba(80, 40, 40, 0.3); border-left: 3px solid #c96a6a; padding: 1rem; margin: 1rem 0; border-radius: 6px;">
        <div style="color: #e8a8a8; font-weight: 700; margin-bottom: 0.5rem;">
          ${playerNation.ruler.name} says:
        </div>
        <div style="color: #d4c5a9; font-style: italic;">
          "${originalDecision.response}"
        </div>
      </div>
      
      <div style="color: #b4a088; margin: 1.5rem 0; line-height: 1.6; text-align: center;">
        ${playerNation.ruler.name} has dismissed your advice. You can use a <strong style="color: #c9a86a;">Threaten Token</strong> to force ${pronouns} to comply... but this may damage your relationship.
      </div>
      
      <div style="display: flex; gap: 1rem; margin-top: 2rem;">
        <button id="threaten-yes" class="action-button" style="
          flex: 1;
          background: linear-gradient(135deg, rgba(120, 60, 60, 0.9), rgba(160, 80, 80, 0.8));
          border-color: rgba(200, 100, 100, 0.8);
          padding: 1rem;
          margin: 0;
        ">
          ⚔ Threaten (1 Token)
        </button>
        <button id="threaten-no" class="secondary-button" style="
          flex: 1;
          padding: 1rem;
          margin: 0;
        ">
          Accept Rejection
        </button>
      </div>
      
      <div style="text-align: center; margin-top: 1rem; font-size: 0.85rem; color: #a89070;">
        Tokens: ${this.threatenSystem.getTokenCount()} / ${this.threatenSystem.maxTokens}
      </div>
    `;
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    
    // Add fade in animation
    if (!document.getElementById('threaten-modal-animation')) {
      const style = document.createElement('style');
      style.id = 'threaten-modal-animation';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Handle buttons
    dialog.querySelector('#threaten-yes').addEventListener('click', () => {
      modal.remove();
      this.executeThreaten(adviceText, originalDecision);
    });
    
    dialog.querySelector('#threaten-no').addEventListener('click', () => {
      modal.remove();
      this.counselUI.addRulerMessage(originalDecision.response, false);
      this.logAdvice(adviceText, originalDecision, false);
    });
  }
  
  executeThreaten(adviceText, originalDecision) {
    // Use token
    if (!this.threatenSystem.useToken()) {
      console.error('No tokens available!');
      return;
    }
    
    // Damage relationship
    this.rulerAI.mood = Math.max(-1, this.rulerAI.mood - 0.3);
    this.rulerAI.trustLevel = Math.max(0, this.rulerAI.trustLevel - 0.2);
    
    // Generate threatening response
    const playerNation = this.worldManager.getPlayerNation();
    const pronouns = playerNation.ruler.gender === 'male' ? 'His' : 
                     playerNation.ruler.gender === 'female' ? 'Her' : 'Their';
    
    const threatenResponse = `Under your forceful insistence, ${playerNation.ruler.name} reluctantly complies. ${pronouns} displeasure is evident.`;
    
    this.counselUI.addRulerMessage(threatenResponse, true, true);
    
    // Execute the advice
    this.executeAdvice(adviceText);
    
    // Log
    this.logAdvice(adviceText, originalDecision, true);
    
    console.log('Threaten used! Trust:', this.rulerAI.trustLevel, 'Mood:', this.rulerAI.mood);
  }
  
  executeAdvice(adviceText) {
    console.log('Executing advice:', adviceText);
    
    // Use ActionExecutor to parse and execute the advice
    const executionResult = this.actionExecutor.executeAdvice(adviceText);
    
    // Show execution results to player
    if (executionResult.success) {
      executionResult.results.forEach(result => {
        if (result.success) {
          this.worldManager.showNotification(result.message, 'success');
          console.log(`✓ ${result.type}:`, result.details);
        } else {
          this.worldManager.showNotification(result.message, 'warning');
          console.log(`✗ ${result.type}:`, result.details);
        }
      });
    } else {
      this.worldManager.showNotification('Unable to execute advice at this time.', 'error');
    }
    
    return executionResult;
  }
  
  logAdvice(adviceText, decision, threatened) {
    if (!window.gameState.counselLog) {
      window.gameState.counselLog = [];
    }
    
    window.gameState.counselLog.push({
      turn: this.worldManager.turnNumber,
      advice: adviceText,
      accepted: decision.accepted,
      threatened: threatened,
      response: decision.response,
      mood: this.rulerAI.mood,
      trust: this.rulerAI.trustLevel,
      timestamp: Date.now()
    });
  }
  
  recordRulerMistake() {
    this.rulerAI.recordMistake();
    this.threatenSystem.grantTokenForMistake();
  }
  
  // Public getters for UI
  getMood() {
    return this.rulerAI.getMood();
  }
  
  getTrust() {
    return this.rulerAI.getTrust();
  }
  
  getTokenCount() {
    return this.threatenSystem.getTokenCount();
  }
}
