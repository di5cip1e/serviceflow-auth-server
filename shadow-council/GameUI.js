export class GameUI {
  constructor(worldManager) {
    this.worldManager = worldManager;
    this.container = null;
    this.statsPanel = null;
    this.notificationQueue = [];
    this.currentNotification = null;
    
    this.init();
  }
  
  init() {
    // Create UI container
    this.container = document.createElement('div');
    this.container.id = 'game-ui';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 15;
    `;
    document.body.appendChild(this.container);
    
    // Create compact stats overlay
    this.createCompactStats();
    
    // Create speed control
    this.createSpeedControl();
  }
  
  createCompactStats() {
    const playerNation = this.worldManager.getPlayerNation();
    
    this.statsPanel = document.createElement('div');
    this.statsPanel.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(20, 15, 25, 0.85);
      border: 1px solid rgba(180, 140, 80, 0.5);
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      pointer-events: all;
      font-family: 'Crimson Pro', serif;
      color: #d4c5a9;
      font-size: 0.9rem;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      max-width: calc(100vw - 320px);
    `;
    
    this.statsPanel.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="color: #c9a86a; font-weight: 600;">${playerNation.name}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="color: #a89070;">💰</span>
        <span id="gold-amount" style="color: #ffd700; font-weight: 700;">1,000</span>
        <span id="income-amount" style="color: #6ac96a; font-size: 0.8rem;">(+0)</span>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="color: #a89070;">🏛️</span>
        <span id="city-count" style="color: #e8d4a8; font-weight: 600;">1</span>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="color: #a89070;">👥</span>
        <span id="total-population" style="color: #e8d4a8; font-weight: 600;">5k</span>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="color: #a89070;">🗺️</span>
        <span id="territory-count" style="color: #e8d4a8; font-weight: 600;">0</span>
      </div>
    `;
    
    this.container.appendChild(this.statsPanel);
  }
  
  createSpeedControl() {
    const speedControl = document.createElement('div');
    speedControl.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(20, 15, 25, 0.85);
      border: 1px solid rgba(180, 140, 80, 0.5);
      border-radius: 6px;
      padding: 0.75rem 1.5rem;
      pointer-events: all;
      display: flex;
      align-items: center;
      gap: 1rem;
      font-family: 'Crimson Pro', serif;
      color: #d4c5a9;
      min-width: 280px;
      -webkit-tap-highlight-color: transparent;
    `;
    
    speedControl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
        <span style="font-size: 1.2rem;">⏱️</span>
        <span id="speed-label" style="font-weight: 600; color: #c9a86a;">Normal</span>
      </div>
      <input 
        type="range" 
        id="speed-slider" 
        min="0" 
        max="4" 
        value="2" 
        step="1"
        style="
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(to right, #4a3a5a, #6a5a7a);
          outline: none;
          cursor: pointer;
        "
      />
    `;
    
    this.container.appendChild(speedControl);
    
    // Add custom slider styling
    const sliderStyle = document.createElement('style');
    sliderStyle.textContent = `
      #speed-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #c9a86a, #e8d4a8);
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        transition: transform 0.2s ease;
      }
      
      #speed-slider::-webkit-slider-thumb:active {
        transform: scale(1.2);
      }
      
      #speed-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #c9a86a, #e8d4a8);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      }
      
      @media (max-width: 768px) {
        #game-ui > div[style*="bottom: 20px"] {
          bottom: 10px !important;
          min-width: 240px !important;
          padding: 0.6rem 1rem !important;
        }
        
        #speed-label {
          font-size: 0.85rem !important;
        }
      }
      
      @media (max-width: 480px) {
        #game-ui > div[style*="bottom: 20px"] {
          width: calc(100vw - 20px) !important;
          min-width: auto !important;
        }
      }
    `;
    document.head.appendChild(sliderStyle);
    
    // Setup speed control
    const slider = document.getElementById('speed-slider');
    const label = document.getElementById('speed-label');
    
    const speedSettings = [
      { label: 'Paused', multiplier: 0 },
      { label: 'Slow', multiplier: 0.5 },
      { label: 'Normal', multiplier: 1.0 },
      { label: 'Fast', multiplier: 2.0 },
      { label: 'Very Fast', multiplier: 4.0 }
    ];
    
    slider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      const setting = speedSettings[value];
      label.textContent = setting.label;
      
      // Update game speed
      this.worldManager.gameSpeed = setting.multiplier;
      this.worldManager.paused = setting.multiplier === 0;
    });
    
    // Initialize
    this.worldManager.gameSpeed = 1.0;
  }
  
  update() {
    const playerNation = this.worldManager.getPlayerNation();
    if (!playerNation) return;
    
    // Update gold and income
    const goldElement = document.getElementById('gold-amount');
    if (goldElement) {
      goldElement.textContent = Math.floor(playerNation.gold).toLocaleString();
    }
    
    // Get income report if available
    const incomeElement = document.getElementById('income-amount');
    if (incomeElement && this.worldManager.incomeSystem) {
      const incomeReport = this.worldManager.incomeSystem.getIncomeReport(0);
      if (incomeReport) {
        const netIncome = Math.floor(incomeReport.netIncome);
        incomeElement.textContent = netIncome >= 0 ? `(+${netIncome})` : `(${netIncome})`;
        incomeElement.style.color = netIncome >= 0 ? '#6ac96a' : '#c96a6a';
      }
    }
    
    // Update city count
    const cityElement = document.getElementById('city-count');
    if (cityElement) {
      cityElement.textContent = playerNation.cities.length;
    }
    
    // Update population (in thousands)
    const popElement = document.getElementById('total-population');
    if (popElement) {
      const totalPop = playerNation.getTotalPopulation();
      popElement.textContent = totalPop >= 1000 ? `${Math.floor(totalPop / 1000)}k` : totalPop;
    }
    
    // Count territory tiles
    const territoryElement = document.getElementById('territory-count');
    if (territoryElement) {
      let territoryCount = 0;
      for (let y = 0; y < this.worldManager.world.height; y++) {
        for (let x = 0; x < this.worldManager.world.width; x++) {
          if (this.worldManager.world.tiles[y][x].nationId === 0) {
            territoryCount++;
          }
        }
      }
      territoryElement.textContent = territoryCount;
    }
  }
  
  showNotification(message, duration = 2000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      background: rgba(20, 15, 25, 0.95);
      border: 2px solid rgba(200, 150, 90, 0.8);
      border-radius: 8px;
      padding: 1.5rem 2rem;
      color: #e8d4a8;
      font-family: 'Cinzel', serif;
      font-size: 1.3rem;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
      animation: slideIn 0.3s ease-out;
      pointer-events: all;
    `;
    notification.textContent = message;
    
    this.notificationArea.appendChild(notification);
    
    // Add animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(20px);
        }
      }
    `;
    document.head.appendChild(styleSheet);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
  
  formatNumber(num) {
    return num.toLocaleString('en-US');
  }
  
  showCityGrowthNotification(city, oldPop, newPop) {
    const sizeChange = this.getCitySizeCategory(newPop) !== this.getCitySizeCategory(oldPop);
    if (sizeChange) {
      const newSize = this.getCitySizeCategory(newPop);
      this.showNotification(`${city.name} has grown to ${newSize}!`, 2500);
    }
  }
  
  getCitySizeCategory(population) {
    if (population >= 100000) return 'Huge City';
    if (population >= 40000) return 'Large City';
    if (population >= 15000) return 'Medium City';
    return 'Small City';
  }
  
  showBattleReport(battle) {
    const result = battle.result;
    const attackerNation = this.worldManager.nations.find(n => n.id === battle.attacker.nationId);
    const defenderNation = this.worldManager.nations.find(n => n.id === battle.defender.nationId);
    
    const victorNation = result.victor === 'attacker' ? attackerNation : defenderNation;
    
    // Create battle report modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 600px;
      background: rgba(20, 15, 25, 0.98);
      border: 3px solid ${result.decisive ? '#ffd700' : 'rgba(180, 140, 80, 0.8)'};
      border-radius: 12px;
      padding: 2rem;
      z-index: 300;
      font-family: 'Crimson Pro', serif;
      color: #d4c5a9;
      box-shadow: 0 10px 50px rgba(0, 0, 0, 0.9);
      animation: slideIn 0.3s ease-out;
    `;
    
    modal.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <h2 style="font-family: 'Cinzel', serif; color: ${result.decisive ? '#ffd700' : '#c9a86a'}; font-size: 2rem; margin: 0;">
          ${result.decisive ? '🎖️ DECISIVE VICTORY' : '⚔️ BATTLE RESULT'}
        </h2>
        <div style="color: #ffd700; font-size: 1.3rem; margin-top: 0.5rem;">
          ${victorNation.name} Victorious!
        </div>
      </div>
      
      <div style="background: rgba(40, 30, 50, 0.4); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: center;">
          <div style="text-align: center;">
            <div style="color: #a89070; font-size: 0.9rem;">Attacker</div>
            <div style="color: #e8d4a8; font-size: 1.2rem; font-weight: 600; margin: 0.5rem 0;">
              ${attackerNation.name}
            </div>
            <div style="color: #ffd700; font-size: 1.1rem;">
              ${battle.attacker.getTotalUnits()} units
            </div>
            <div style="color: ${result.victor === 'attacker' ? '#6ac96a' : '#c96a6a'}; margin-top: 0.5rem;">
              ${Math.floor(result.attackerCasualties * 100)}% casualties
            </div>
          </div>
          
          <div style="font-size: 2rem;">⚔️</div>
          
          <div style="text-align: center;">
            <div style="color: #a89070; font-size: 0.9rem;">Defender</div>
            <div style="color: #e8d4a8; font-size: 1.2rem; font-weight: 600; margin: 0.5rem 0;">
              ${defenderNation.name}
            </div>
            <div style="color: #ffd700; font-size: 1.1rem;">
              ${battle.defender.getTotalUnits()} units
            </div>
            <div style="color: ${result.victor === 'defender' ? '#6ac96a' : '#c96a6a'}; margin-top: 0.5rem;">
              ${Math.floor(result.defenderCasualties * 100)}% casualties
            </div>
          </div>
        </div>
      </div>
      
      <div style="background: rgba(40, 30, 50, 0.4); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem;">
          <div>
            <span style="color: #a89070;">Combat Strength:</span>
          </div>
          <div style="text-align: right;">
            <div style="color: #e8d4a8;">Attacker: ${result.attackerStrength}</div>
            <div style="color: #e8d4a8;">Defender: ${result.defenderStrength}</div>
          </div>
        </div>
        
        ${result.factors.fortified ? `
          <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(180, 140, 80, 0.3); color: #8a7060; font-size: 0.85rem;">
            🏰 Defender held fortified position
          </div>
        ` : ''}
      </div>
      
      <button id="close-battle-btn" class="action-button" style="width: 100%; padding: 1rem; font-size: 1.1rem;">
        Continue
      </button>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('close-battle-btn').addEventListener('click', () => {
      modal.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => modal.remove(), 300);
    });
  }
  
  showGameOver(eliminatorName) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.5s ease-out;
    `;
    
    modal.innerHTML = `
      <div style="
        text-align: center;
        font-family: 'Cinzel', serif;
        color: #d4c5a9;
        max-width: 600px;
        padding: 3rem;
      ">
        <h1 style="
          font-size: 4rem;
          color: #c96a6a;
          margin-bottom: 1rem;
          text-shadow: 0 0 20px rgba(220, 20, 60, 0.5);
        ">
          💀 DEFEAT 💀
        </h1>
        
        <div style="
          font-size: 1.8rem;
          color: #e8d4a8;
          margin-bottom: 2rem;
          line-height: 1.6;
        ">
          Your nation has been eliminated by<br>
          <span style="color: #ffd700; font-size: 2.2rem;">${eliminatorName}</span>
        </div>
        
        <div style="
          font-family: 'Crimson Pro', serif;
          font-size: 1.2rem;
          color: #a89070;
          margin-bottom: 3rem;
          line-height: 1.8;
        ">
          All your cities have fallen.<br>
          Your armies are destroyed.<br>
          Your territory is conquered.<br>
          <br>
          <em>Perhaps different counsel would have changed your fate...</em>
        </div>
        
        <button id="restart-btn" class="action-button" style="
          font-size: 1.3rem;
          padding: 1.5rem 3rem;
          margin: 0 auto;
        ">
          🔄 Start New Game
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add fadeIn animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.getElementById('restart-btn').addEventListener('click', () => {
      window.location.reload();
    });
  }
}
