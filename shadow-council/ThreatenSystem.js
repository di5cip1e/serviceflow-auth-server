export class ThreatenSystem {
  constructor() {
    this.tokens = 0;
    this.maxTokens = 3;
    this.lastAdviceTime = Date.now();
    this.regenRate = 120000; // 2 minutes per token
    this.uiElement = null;
    
    this.init();
  }
  
  init() {
    this.createUI();
    this.startRegeneration();
  }
  
  createUI() {
    this.uiElement = document.createElement('div');
    this.uiElement.id = 'threaten-tokens';
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
        <span style="font-size: 1.2rem;">⚔</span>
        <div>
          <div style="font-family: 'Cinzel', serif; font-size: 0.9rem; color: #c9a86a; line-height: 1;">
            Threaten Tokens
          </div>
          <div id="token-count" style="font-size: 1.2rem; color: #e8d4a8; font-weight: 700; line-height: 1.2;">
            ${this.tokens} / ${this.maxTokens}
          </div>
        </div>
      </div>
      <div style="width: 100px; height: 4px; background: rgba(80, 60, 40, 0.5); border-radius: 2px; overflow: hidden;">
        <div id="token-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #c9a86a, #e8d4a8); transition: width 0.3s ease;"></div>
      </div>
    `;
    
    document.body.appendChild(this.uiElement);
    
    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
      position: absolute;
      bottom: -80px;
      left: 50%;
      transform: translateX(-50%) scale(0);
      background: rgba(20, 15, 25, 0.98);
      border: 2px solid rgba(180, 140, 80, 0.6);
      border-radius: 6px;
      padding: 0.75rem 1rem;
      color: #d4c5a9;
      font-size: 0.85rem;
      width: 250px;
      text-align: center;
      pointer-events: none;
      transition: transform 0.2s ease;
      z-index: 1000;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
    `;
    tooltip.innerHTML = `
      Force your ruler to accept advice when they reject it.<br>
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
  
  startRegeneration() {
    setInterval(() => {
      this.updateRegeneration();
    }, 1000); // Update every second
  }
  
  updateRegeneration() {
    if (this.tokens >= this.maxTokens) {
      document.getElementById('token-progress').style.width = '0%';
      return;
    }
    
    const timeSinceLastAdvice = Date.now() - this.lastAdviceTime;
    const progress = (timeSinceLastAdvice % this.regenRate) / this.regenRate;
    
    document.getElementById('token-progress').style.width = `${progress * 100}%`;
    
    // Grant token if time elapsed
    const tokensToGrant = Math.floor(timeSinceLastAdvice / this.regenRate);
    if (tokensToGrant > 0 && this.tokens < this.maxTokens) {
      this.grantToken(tokensToGrant);
      this.lastAdviceTime = Date.now();
    }
  }
  
  grantToken(amount = 1, reason = 'time') {
    const oldTokens = this.tokens;
    this.tokens = Math.min(this.maxTokens, this.tokens + amount);
    
    if (this.tokens !== oldTokens) {
      this.updateUI();
      this.showGainAnimation(reason);
      console.log(`Threaten token granted! Reason: ${reason}. Total: ${this.tokens}/${this.maxTokens}`);
    }
  }
  
  grantTokenForMistake() {
    this.grantToken(1, 'ruler mistake');
  }
  
  canThreaten() {
    return this.tokens > 0;
  }
  
  useToken() {
    if (this.tokens > 0) {
      this.tokens--;
      this.updateUI();
      this.showUseAnimation();
      console.log(`Threaten token used! Remaining: ${this.tokens}/${this.maxTokens}`);
      return true;
    }
    return false;
  }
  
  updateUI() {
    const countEl = document.getElementById('token-count');
    if (countEl) {
      countEl.textContent = `${this.tokens} / ${this.maxTokens}`;
      
      // Pulse animation
      countEl.style.animation = 'none';
      setTimeout(() => {
        countEl.style.animation = 'pulse 0.5s ease';
      }, 10);
    }
  }
  
  showGainAnimation(reason) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: rgba(120, 90, 60, 0.95);
      border: 2px solid rgba(200, 150, 90, 0.8);
      border-radius: 6px;
      padding: 0.75rem 1.5rem;
      color: #e8d4a8;
      font-family: 'Crimson Pro', serif;
      font-size: 0.95rem;
      z-index: 1000;
      opacity: 0;
      animation: tokenGain 2s ease-out forwards;
      pointer-events: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
    `;
    
    const reasonText = reason === 'ruler mistake' ? 
      'Ruler made a mistake!' : 
      'Token regenerated';
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 1.2rem;">⚔</span>
        <span>+1 Threaten Token</span>
      </div>
      <div style="font-size: 0.8rem; color: #c9a86a; text-align: center; margin-top: 0.2rem;">
        ${reasonText}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add animation
    if (!document.getElementById('token-gain-animation')) {
      const style = document.createElement('style');
      style.id = 'token-gain-animation';
      style.textContent = `
        @keyframes tokenGain {
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
        @keyframes tokenUse {
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
      `;
      document.head.appendChild(style);
    }
    
    setTimeout(() => notification.remove(), 2000);
  }
  
  showUseAnimation() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 4rem;
      z-index: 1000;
      opacity: 1;
      animation: tokenUse 1s ease-out forwards;
      pointer-events: none;
      text-shadow: 0 0 20px rgba(200, 150, 90, 0.8);
    `;
    notification.textContent = '⚔';
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 1000);
  }
  
  getTokenCount() {
    return this.tokens;
  }
  
  reset() {
    this.tokens = 0;
    this.lastAdviceTime = Date.now();
    this.updateUI();
  }
}
