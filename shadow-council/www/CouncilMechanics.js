/**
 * CouncilMechanics.js - Shadow Council Rebrand Phase 5
 * 
 * Implements Shadow Influence system, Whisper System, Court Intrigue Mechanics
 * Renamed from Threaten tokens to "Shadow Influence"
 */

import { WHISPER_TYPES, INFLUENCE_CONFIG, INTRIGUE_OPTIONS } from './council_config.js';

// ============================================
// SHADOW INFLUENCE SYSTEM (formerly Threaten Tokens)
// ============================================

export class ShadowInfluenceSystem {
  constructor() {
    this.influence = 0;
    this.maxInfluence = 3;
    this.lastGenerationTime = Date.now();
    this.regenRateMs = 120000; // 2 minutes (120,000ms)
    this.uiElement = null;
    
    // Track ruler biases from whispers
    this.rulerBiases = {
      war: 0,
      peace: 0,
      suspicion: 0,
      economy: 0,
      military: 0
    };
    
    this.init();
  }
  
  init() {
    this.createUI();
    this.startRegeneration();
  }
  
  // Create the Shadow Influence UI display
  createUI() {
    this.uiElement = document.createElement('div');
    this.uiElement.id = 'shadow-influence';
    this.uiElement.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(20, 15, 25, 0.95);
      border: 2px solid rgba(180, 140, 80, 0.6);
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      z-index: 50;
      pointer-events: all;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
    `;
    
    this.uiElement.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 1.2rem;">🌑</span>
        <div>
          <div style="font-family: 'Cinzel', serif; font-size: 0.9rem; color: #c9a86a; line-height: 1;">
            Shadow Influence
          </div>
          <div id="influence-count" style="font-size: 1.2rem; color: #e8d4a8; font-weight: 700; line-height: 1.2;">
            ${this.influence} / ${this.maxInfluence}
          </div>
        </div>
      </div>
      <div style="width: 100px; height: 4px; background: rgba(80, 60, 40, 0.5); border-radius: 2px; overflow: hidden;">
        <div id="influence-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #c9a86a, #e8d4a8); transition: width 0.3s ease;"></div>
      </div>
    `;
    
    document.body.appendChild(this.uiElement);
    
    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
      position: absolute;
      bottom: -90px;
      left: 50%;
      transform: translateX(-50%) scale(0);
      background: rgba(20, 15, 25, 0.98);
      border: 2px solid rgba(180, 140, 80, 0.6);
      border-radius: 6px;
      padding: 0.75rem 1rem;
      color: #d4c5a9;
      font-size: 0.85rem;
      width: 280px;
      text-align: center;
      pointer-events: none;
      transition: transform 0.2s ease;
      z-index: 1000;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
    `;
    tooltip.innerHTML = `
      Plant ideas in your ruler's mind to guide decisions.<br>
      <span style="color: #a89070; font-size: 0.75rem;">Generates slowly or when ruler makes mistakes</span>
    `;
    
    this.uiElement.appendChild(tooltip);
    
    this.uiElement.addEventListener('mouseenter', () => {
      tooltip.style.transform = 'translateX(-50%) scale(1)';
    });
    
    this.uiElement.addEventListener('mouseleave', () => {
      tooltip.style.transform = 'translateX(-50%) scale(0)';
    });
  }
  
  // Start automatic influence regeneration
  startRegeneration() {
    setInterval(() => {
      this.updateRegeneration();
    }, 1000); // Update every second
  }
  
  // Update regeneration progress and grant influence
  updateRegeneration() {
    if (this.influence >= this.maxInfluence) {
      document.getElementById('influence-progress').style.width = '0%';
      return;
    }
    
    const timeSinceLastGen = Date.now() - this.lastGenerationTime;
    const progress = (timeSinceLastGen % this.regenRateMs) / this.regenRateMs;
    
    document.getElementById('influence-progress').style.width = `${progress * 100}%`;
    
    // Grant influence point if time elapsed
    const pointsToGrant = Math.floor(timeSinceLastGen / this.regenRateMs);
    if (pointsToGrant > 0 && this.influence < this.maxInfluence) {
      this.grantInfluence(pointsToGrant, 'time');
      this.lastGenerationTime = Date.now();
    }
  }
  
  // Grant influence points (called from regeneration or ruler mistakes)
  grantInfluence(amount = 1, reason = 'time') {
    const oldInfluence = this.influence;
    this.influence = Math.min(this.maxInfluence, this.influence + amount);
    
    if (this.influence !== oldInfluence) {
      this.updateUI();
      this.showGainAnimation(reason);
      console.log(`Shadow Influence granted! Reason: ${reason}. Total: ${this.influence}/${this.maxInfluence}`);
    }
  }
  
  // Grant influence when ruler makes a mistake (1-3 points)
  grantInfluenceForMistake() {
    const amount = Math.floor(Math.random() * 3) + 1; // 1-3 points
    this.grantInfluence(amount, 'ruler mistake');
  }
  
  // Check if player has enough influence
  canSpend(amount = 1) {
    return this.influence >= amount;
  }
  
  // Spend influence points
  spendInfluence(amount = 1) {
    if (this.influence >= amount) {
      this.influence -= amount;
      this.updateUI();
      this.showSpendAnimation();
      console.log(`Shadow Influence spent! Remaining: ${this.influence}/${this.maxInfluence}`);
      return true;
    }
    return false;
  }
  
  // Update the UI display
  updateUI() {
    const countEl = document.getElementById('influence-count');
    if (countEl) {
      countEl.textContent = `${this.influence} / ${this.maxInfluence}`;
      
      // Pulse animation
      countEl.style.animation = 'none';
      setTimeout(() => {
        countEl.style.animation = 'pulse 0.5s ease';
      }, 10);
    }
  }
  
  // Show gain notification animation
  showGainAnimation(reason) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: rgba(40, 30, 60, 0.95);
      border: 2px solid rgba(150, 120, 180, 0.8);
      border-radius: 6px;
      padding: 0.75rem 1.5rem;
      color: #e8d4a8;
      font-family: 'Crimson Pro', serif;
      font-size: 0.95rem;
      z-index: 1000;
      opacity: 0;
      animation: influenceGain 2s ease-out forwards;
      pointer-events: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
    `;
    
    const reasonText = reason === 'ruler mistake' ? 
      'Ruler made a mistake!' : 
      'Influence regenerated';
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 1.2rem;">🌑</span>
        <span>+${reason === 'ruler mistake' ? '1-3' : '1'} Shadow Influence</span>
      </div>
      <div style="font-size: 0.8rem; color: #a890c0; text-align: center; margin-top: 0.2rem;">
        ${reasonText}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add animations if not already present
    this.ensureAnimations();
    
    setTimeout(() => notification.remove(), 2000);
  }
  
  // Show spend animation
  showSpendAnimation() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 4rem;
      z-index: 1000;
      opacity: 1;
      animation: influenceUse 1s ease-out forwards;
      pointer-events: none;
      text-shadow: 0 0 20px rgba(150, 120, 180, 0.8);
    `;
    notification.textContent = '🌑';
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 1000);
  }
  
  // Ensure CSS animations are defined
  ensureAnimations() {
    if (!document.getElementById('council-mechanics-animations')) {
      const style = document.createElement('style');
      style.id = 'council-mechanics-animations';
      style.textContent = `
        @keyframes influenceGain {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          20% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          80% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
        }
        @keyframes influenceUse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
          100% {
            opacity: 0;
            transform: scale(0.8);
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Get current influence count
  getInfluenceCount() {
    return this.influence;
  }
  
  // Get ruler biases (from whispers)
  getRulerBiases() {
    return { ...this.rulerBiases };
  }
  
  // Reset the system
  reset() {
    this.influence = 0;
    this.lastGenerationTime = Date.now();
    this.rulerBiases = {
      war: 0,
      peace: 0,
      suspicion: 0,
      economy: 0,
      military: 0
    };
    this.updateUI();
  }
}


// ============================================
// WHISPER SYSTEM - Plant ideas in ruler's mind
// ============================================

export class WhisperSystem {
  constructor(influenceSystem) {
    this.influenceSystem = influenceSystem;
    this.whisperHistory = [];
    this.maxHistory = 10;
  }
  
  /**
   * Plant a whisper in the ruler's mind
   * @param {string} whisperType - Type of whisper to plant
   * @param {number} cost - Influence cost (default 1)
   * @returns {object} Result of the whisper operation
   */
  spendInfluence(whisperType, cost = 1) {
    // Validate whisper type
    if (!WHISPER_TYPES[whisperType]) {
      console.error(`Invalid whisper type: ${whisperType}`);
      return { success: false, message: `Invalid whisper type: ${whisperType}` };
    }
    
    // Check if player has enough influence
    if (!this.influenceSystem.canSpend(cost)) {
      return { 
        success: false, 
        message: `Not enough Shadow Influence. Need ${cost}, have ${this.influenceSystem.getInfluenceCount()}` 
      };
    }
    
    // Spend the influence
    this.influenceSystem.spendInfluence(cost);
    
    // Apply the bias to ruler
    const biasKey = WHISPER_TYPES[whisperType].biasKey;
    const biasAmount = WHISPER_TYPES[whisperType].biasAmount; // +20%
    this.influenceSystem.rulerBiases[biasKey] += biasAmount;
    
    // Log the whisper
    const whisperRecord = {
      type: whisperType,
      timestamp: Date.now(),
      biasApplied: biasAmount,
      newBias: this.influenceSystem.rulerBiases[biasKey]
    };
    
    this.whisperHistory.push(whisperRecord);
    if (this.whisperHistory.length > this.maxHistory) {
      this.whisperHistory.shift();
    }
    
    console.log(`Whisper planted: ${whisperType}. Bias '${biasKey}' now at ${this.influenceSystem.rulerBiases[biasKey]}%`);
    
    // Show feedback
    this.showWhisperFeedback(whisperType);
    
    return {
      success: true,
      message: WHISPER_TYPES[whisperType].successMessage,
      biasKey: biasKey,
      newBias: this.influenceSystem.rulerBiases[biasKey]
    };
  }
  
  // Show feedback when whisper is planted
  showWhisperFeedback(whisperType) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(40, 30, 60, 0.95);
      border: 2px solid rgba(150, 120, 180, 0.8);
      border-radius: 6px;
      padding: 1rem 2rem;
      color: #e8d4a8;
      font-family: 'Crimson Pro', serif;
      font-size: 1rem;
      z-index: 1000;
      animation: whisperFeedback 3s ease-out forwards;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
    `;
    
    const whisper = WHISPER_TYPES[whisperType];
    feedback.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${whisper.icon}</div>
        <div>${whisper.title}</div>
        <div style="font-size: 0.8rem; color: #a890c0; margin-top: 0.3rem;">${whisper.description}</div>
      </div>
    `;
    
    document.body.appendChild(feedback);
    
    // Add animation if needed
    if (!document.getElementById('whisper-feedback-anim')) {
      const style = document.createElement('style');
      style.id = 'whisper-feedback-anim';
      style.textContent = `
        @keyframes whisperFeedback {
          0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
          20% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    setTimeout(() => feedback.remove(), 3000);
  }
  
  // Get available whisper types
  getWhisperTypes() {
    return WHISPER_TYPES;
  }
  
  // Get whisper history
  getHistory() {
    return [...this.whisperHistory];
  }
  
  // Get current biases
  getBiases() {
    return this.influenceSystem.getRulerBiases();
  }
}


// ============================================
// COURT INTRIGUE MECHANICS
// ============================================

export class CourtIntrigueSystem {
  constructor(influenceSystem) {
    this.influenceSystem = influenceSystem;
    this.activeCrisis = null;
    this.intrigueHistory = [];
    this.maxHistory = 20;
  }
  
  /**
   * Trigger a crisis event that requires player response
   * @param {string} crisisType - Type of crisis (rebellion, crisis, etc.)
   * @param {object} crisisData - Additional crisis details
   */
  triggerCrisis(crisisType, crisisData = {}) {
    this.activeCrisis = {
      type: crisisType,
      ...crisisData,
      timestamp: Date.now(),
      resolved: false
    };
    
    // Show crisis notification
    this.showCrisisNotification(crisisType, crisisData);
    
    console.log(`Crisis triggered: ${crisisType}`, crisisData);
    
    return this.activeCrisis;
  }
  
  // Show crisis notification to player
  showCrisisNotification(crisisType, crisisData) {
    const crisisMessages = {
      rebellion: "A rebellion has erupted in the realm!",
      crisis: "A major crisis threatens the kingdom!",
      famine: "Famine spreads through the land!",
      plague: "A deadly plague sweeps through cities!",
      invasion: "Enemy forces have been spotted at the borders!"
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(60, 20, 20, 0.98);
      border: 3px solid rgba(200, 80, 80, 0.8);
      border-radius: 10px;
      padding: 1.5rem 2.5rem;
      color: #e8d4a8;
      font-family: 'Crimson Pro', serif;
      font-size: 1.1rem;
      z-index: 2000;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.9);
    `;
    
    notification.innerHTML = `
      <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
      <div style="font-weight: bold; margin-bottom: 0.5rem;">${crisisMessages[crisisType] || 'Crisis!'}</div>
      <div style="font-size: 0.9rem; color: #c9a86a;">${crisisData.description || 'The realm needs your guidance.'}</div>
      <div style="margin-top: 1rem; font-size: 0.85rem; color: #a890c0;">
        Use Shadow Influence to guide the response
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-dismiss after showing
    setTimeout(() => notification.remove(), 5000);
  }
  
  /**
   * Player responds to crisis with an intrigue option
   * @param {string} option - Intrigue option: mercy, cruelty, negotiation, suppression
   * @returns {object} Result of the response
   */
  respondToCrisis(option) {
    if (!this.activeCrisis || this.activeCrisis.resolved) {
      return { 
        success: false, 
        message: "No active crisis to respond to." 
      };
    }
    
    // Validate option
    const intrigueOption = INTRIGUE_OPTIONS[option];
    if (!intrigueOption) {
      return { 
        success: false, 
        message: `Invalid intrigue option: ${option}` 
      };
    }
    
    // Check if player has enough influence
    const cost = intrigueOption.cost;
    if (!this.influenceSystem.canSpend(cost)) {
      return {
        success: false,
        message: `Not enough Shadow Influence. Need ${cost}, have ${this.influenceSystem.getInfluenceCount()}`
      };
    }
    
    // Spend influence
    this.influenceSystem.spendInfluence(cost);
    
    // Resolve the crisis
    this.activeCrisis.resolved = true;
    this.activeCrisis.response = option;
    
    // Log the intrigue
    const intrigueRecord = {
      crisisType: this.activeCrisis.type,
      response: option,
      cost: cost,
      timestamp: Date.now()
    };
    
    this.intrigueHistory.push(intrigueRecord);
    if (this.intrigueHistory.length > this.maxHistory) {
      this.intrigueHistory.shift();
    }
    
    console.log(`Crisis resolved with: ${option}. Cost: ${cost} influence`);
    
    // Show resolution feedback
    this.showResolutionFeedback(option, intrigueOption);
    
    const resolvedCrisis = this.activeCrisis;
    this.activeCrisis = null;
    
    return {
      success: true,
      message: `Crisis resolved with ${intrigueOption.title}`,
      effects: intrigueOption.effects,
      crisis: resolvedCrisis
    };
  }
  
  // Show resolution feedback
  showResolutionFeedback(option, intrigueOption) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(30, 50, 40, 0.95);
      border: 2px solid rgba(100, 180, 120, 0.8);
      border-radius: 6px;
      padding: 1rem 2rem;
      color: #e8d4a8;
      font-family: 'Crimson Pro', serif;
      font-size: 1rem;
      z-index: 1000;
      animation: whisperFeedback 3s ease-out forwards;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
    `;
    
    feedback.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${intrigueOption.icon}</div>
        <div>${intrigueOption.title}</div>
        <div style="font-size: 0.8rem; color: #90c0a0; margin-top: 0.3rem;">${intrigueOption.description}</div>
      </div>
    `;
    
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000);
  }
  
  // Check if there's an active crisis
  hasActiveCrisis() {
    return this.activeCrisis !== null && !this.activeCrisis.resolved;
  }
  
  // Get current crisis
  getActiveCrisis() {
    return this.activeCrisis;
  }
  
  // Get available intrigue options
  getIntrigueOptions() {
    return INTRIGUE_OPTIONS;
  }
  
  // Get intrigue history
  getHistory() {
    return [...this.intrigueHistory];
  }
}


// ============================================
// MAIN EXPORTS
// ============================================

/**
 * Initialize the complete Council Mechanics system
 * @param {object} options - Configuration options
 * @returns {object} Object containing all council systems
 */
export function createCouncilMechanics(options = {}) {
  // Create the Shadow Influence system
  const influenceSystem = new ShadowInfluenceSystem();
  
  // Create the Whisper System (depends on influence system)
  const whisperSystem = new WhisperSystem(influenceSystem);
  
  // Create the Court Intrigue System (depends on influence system)
  const intrigueSystem = new CourtIntrigueSystem(influenceSystem);
  
  console.log("Council Mechanics initialized - Shadow Influence system active");
  
  return {
    influence: influenceSystem,
    whispers: whisperSystem,
    intrigue: intrigueSystem
  };
}

export default {
  ShadowInfluenceSystem,
  WhisperSystem,
  CourtIntrigueSystem,
  createCouncilMechanics
};