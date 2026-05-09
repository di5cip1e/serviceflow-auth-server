import { UNIT_TYPES, TACTICS, EQUIPMENT } from './ArmyManager.js';

/**
 * ArmyUI - Army recruitment and management interface
 * Phase 5B: Military System
 */

export class ArmyUI {
  constructor(worldManager) {
    this.worldManager = worldManager;
    this.container = null;
    this.isOpen = false;
    this.currentComposition = {
      infantry: 10,
      archer: 5,
      cavalry: 0,
      spearmen: 5,
      siege: 0,
      tactic: 'balanced',
      equipment: 'basic'
    };
    
    this.createUI();
  }
  
  createUI() {
    // Create floating button
    this.createFloatingButton();
    
    // Create army panel (hidden initially)
    this.createArmyPanel();
  }
  
  createFloatingButton() {
    this.floatingBtn = document.createElement('button');
    this.floatingBtn.innerHTML = '⚔️';
    this.floatingBtn.title = 'Military Logistics';
    this.floatingBtn.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b0000 0%, #dc143c 100%);
      border: 3px solid rgba(180, 140, 80, 0.8);
      color: white;
      font-size: 28px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
      z-index: 100;
      transition: all 0.3s ease;
    `;
    
    this.floatingBtn.addEventListener('mouseenter', () => {
      this.floatingBtn.style.transform = 'scale(1.1)';
    });
    
    this.floatingBtn.addEventListener('mouseleave', () => {
      this.floatingBtn.style.transform = 'scale(1)';
    });
    
    this.floatingBtn.addEventListener('click', () => {
      this.toggle();
    });
    
    document.body.appendChild(this.floatingBtn);
  }
  
  createArmyPanel() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      background: rgba(20, 15, 25, 0.98);
      border: 3px solid rgba(180, 140, 80, 0.8);
      border-radius: 12px;
      padding: 2rem;
      z-index: 200;
      display: none;
      font-family: 'Crimson Pro', serif;
      color: #d4c5a9;
      box-shadow: 0 10px 50px rgba(0, 0, 0, 0.9);
    `;
    
    this.container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="font-family: 'Cinzel', serif; color: #c9a86a; font-size: 2rem; margin: 0;">
          ⚔️ Military Logistics
        </h2>
        <button id="close-army-btn" style="
          background: rgba(139, 0, 0, 0.6);
          border: 2px solid rgba(180, 140, 80, 0.6);
          color: #d4c5a9;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-family: 'Cinzel', serif;
        ">✕ Close</button>
      </div>
      
      <p style="color: #a89070; margin-bottom: 2rem; line-height: 1.6;">
        Your ruler delegates military logistics to you, the Counsel. Configure army composition, equipment, and tactics before deployment.
      </p>
      
      <!-- Unit Composition -->
      <div style="background: rgba(40, 30, 50, 0.4); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
        <h3 style="font-family: 'Cinzel', serif; color: #c9a86a; margin-bottom: 1rem;">Unit Composition</h3>
        
        <div id="unit-sliders" style="display: grid; gap: 1rem;">
          <!-- Sliders will be generated here -->
        </div>
        
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(180, 140, 80, 0.3);">
          <div style="display: flex; justify-content: space-between;">
            <span>Total Units:</span>
            <span id="total-units" style="color: #ffd700; font-weight: 700;">20</span>
          </div>
        </div>
      </div>
      
      <!-- Equipment Selection -->
      <div style="background: rgba(40, 30, 50, 0.4); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
        <h3 style="font-family: 'Cinzel', serif; color: #c9a86a; margin-bottom: 1rem;">Equipment Quality</h3>
        
        <div id="equipment-options" style="display: grid; gap: 0.5rem;">
          <!-- Equipment options will be generated here -->
        </div>
      </div>
      
      <!-- Tactics Selection -->
      <div style="background: rgba(40, 30, 50, 0.4); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
        <h3 style="font-family: 'Cinzel', serif; color: #c9a86a; margin-bottom: 1rem;">Battle Tactics</h3>
        
        <div id="tactics-options" style="display: grid; gap: 0.5rem;">
          <!-- Tactics options will be generated here -->
        </div>
      </div>
      
      <!-- Cost Summary -->
      <div style="background: rgba(60, 40, 20, 0.4); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
        <h3 style="font-family: 'Cinzel', serif; color: #c9a86a; margin-bottom: 1rem;">Recruitment Cost</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <div style="color: #a89070;">💰 Gold Cost:</div>
            <div id="gold-cost" style="color: #ffd700; font-size: 1.5rem; font-weight: 700;">1,000</div>
          </div>
          <div>
            <div style="color: #a89070;">👥 Population Cost:</div>
            <div id="pop-cost" style="color: #6ac96a; font-size: 1.5rem; font-weight: 700;">2,000</div>
          </div>
        </div>
        
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(180, 140, 80, 0.3);">
          <div style="color: #a89070; margin-bottom: 0.5rem;">Upkeep per turn:</div>
          <div id="upkeep-cost" style="color: #ffa500; font-weight: 700;">40g/turn</div>
        </div>
      </div>
      
      <!-- Recruit Button -->
      <button id="recruit-army-btn" class="action-button" style="
        width: 100%;
        padding: 1.5rem;
        font-size: 1.2rem;
        margin-bottom: 1rem;
      ">
        🎖️ Recruit Army
      </button>
      
      <!-- Army List -->
      <div style="background: rgba(40, 30, 50, 0.4); padding: 1.5rem; border-radius: 8px;">
        <h3 style="font-family: 'Cinzel', serif; color: #c9a86a; margin-bottom: 1rem;">Existing Armies</h3>
        <div id="army-list" style="max-height: 200px; overflow-y: auto;">
          <!-- Army list will be populated here -->
        </div>
      </div>
    `;
    
    document.body.appendChild(this.container);
    
    // Generate UI components
    this.generateUnitSliders();
    this.generateEquipmentOptions();
    this.generateTacticsOptions();
    this.updateCostDisplay();
    this.updateArmyList();
    
    // Event listeners
    document.getElementById('close-army-btn').addEventListener('click', () => this.hide());
    document.getElementById('recruit-army-btn').addEventListener('click', () => this.recruitArmy());
  }
  
  generateUnitSliders() {
    const container = document.getElementById('unit-sliders');
    
    for (const [id, unit] of Object.entries(UNIT_TYPES)) {
      const unitType = id.toLowerCase();
      const currentValue = this.currentComposition[unitType] || 0;
      
      const slider = document.createElement('div');
      slider.style.cssText = 'display: grid; gap: 0.5rem;';
      
      slider.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 1.2rem;">${unit.icon}</span>
            <span style="color: #e8d4a8; font-weight: 600; margin-left: 0.5rem;">${unit.name}</span>
          </div>
          <span id="${unitType}-count" style="color: #ffd700; font-weight: 700;">${currentValue}</span>
        </div>
        
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <input type="range" id="${unitType}-slider" min="0" max="50" value="${currentValue}" 
            style="flex: 1; height: 8px; border-radius: 4px; background: rgba(100, 80, 60, 0.5);">
        </div>
        
        <div style="font-size: 0.85rem; color: #8a7060; line-height: 1.4;">
          ${unit.description}
        </div>
        
        <div style="font-size: 0.8rem; color: #7a6050; display: flex; gap: 1rem;">
          <span>⚔️ ${unit.stats.attack}</span>
          <span>🛡️ ${unit.stats.defense}</span>
          <span>⚡ ${unit.stats.speed}</span>
          <span>💰 ${unit.cost.gold}g</span>
        </div>
      `;
      
      container.appendChild(slider);
      
      // Add event listener
      document.getElementById(`${unitType}-slider`).addEventListener('input', (e) => {
        this.currentComposition[unitType] = parseInt(e.target.value);
        document.getElementById(`${unitType}-count`).textContent = e.target.value;
        this.updateCostDisplay();
      });
    }
  }
  
  generateEquipmentOptions() {
    const container = document.getElementById('equipment-options');
    
    for (const [id, equip] of Object.entries(EQUIPMENT)) {
      const equipId = id.toLowerCase();
      const isSelected = this.currentComposition.equipment === equipId;
      
      const option = document.createElement('div');
      option.style.cssText = `
        padding: 1rem;
        background: ${isSelected ? 'rgba(200, 150, 90, 0.2)' : 'rgba(60, 50, 70, 0.3)'};
        border: 2px solid ${isSelected ? 'rgba(200, 150, 90, 0.6)' : 'rgba(100, 80, 60, 0.4)'};
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      `;
      
      option.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="color: #e8d4a8; font-weight: 600;">${equip.name}</div>
          <div style="color: #ffd700;">${equip.cost > 0 ? `+${equip.cost}g` : 'Free'}</div>
        </div>
        <div style="font-size: 0.85rem; color: #8a7060; margin-top: 0.5rem;">
          Attack: ${equip.modifiers.attack > 0 ? `+${Math.floor(equip.modifiers.attack * 100)}%` : '—'}
          | Defense: ${equip.modifiers.defense > 0 ? `+${Math.floor(equip.modifiers.defense * 100)}%` : '—'}
          | Morale: ${equip.modifiers.morale > 0 ? `+${Math.floor(equip.modifiers.morale * 100)}%` : '—'}
        </div>
      `;
      
      option.addEventListener('click', () => {
        this.currentComposition.equipment = equipId;
        this.generateEquipmentOptions(); // Refresh
        this.updateCostDisplay();
      });
      
      container.appendChild(option);
    }
  }
  
  generateTacticsOptions() {
    const container = document.getElementById('tactics-options');
    
    for (const [id, tactic] of Object.entries(TACTICS)) {
      const tacticId = id.toLowerCase();
      const isSelected = this.currentComposition.tactic === tacticId;
      
      const option = document.createElement('div');
      option.style.cssText = `
        padding: 1rem;
        background: ${isSelected ? 'rgba(200, 150, 90, 0.2)' : 'rgba(60, 50, 70, 0.3)'};
        border: 2px solid ${isSelected ? 'rgba(200, 150, 90, 0.6)' : 'rgba(100, 80, 60, 0.4)'};
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      `;
      
      option.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span style="font-size: 1.5rem;">${tactic.icon}</span>
          <span style="color: #e8d4a8; font-weight: 600;">${tactic.name}</span>
        </div>
        <div style="font-size: 0.85rem; color: #8a7060;">
          ${tactic.description}
        </div>
      `;
      
      option.addEventListener('click', () => {
        this.currentComposition.tactic = tacticId;
        this.generateTacticsOptions(); // Refresh
      });
      
      container.appendChild(option);
    }
  }
  
  updateCostDisplay() {
    const cost = this.worldManager.armyManager.calculateArmyCost(this.currentComposition);
    
    document.getElementById('gold-cost').textContent = cost.gold.toLocaleString();
    document.getElementById('pop-cost').textContent = cost.population.toLocaleString();
    
    // Calculate upkeep (approximate)
    const totalUnits = Object.values(this.currentComposition)
      .filter(v => typeof v === 'number')
      .reduce((sum, v) => sum + v, 0);
    
    const baseUpkeep = totalUnits * 2;
    const equipMultiplier = this.currentComposition.equipment === 'elite' ? 1.5 :
                           this.currentComposition.equipment === 'quality' ? 1.2 : 1.0;
    const upkeep = Math.floor(baseUpkeep * equipMultiplier);
    
    document.getElementById('upkeep-cost').textContent = `${upkeep}g/turn`;
    document.getElementById('total-units').textContent = totalUnits;
  }
  
  updateArmyList() {
    const container = document.getElementById('army-list');
    const playerNation = this.worldManager.getPlayerNation();
    const armies = this.worldManager.armyManager.getArmiesForNation(0);
    
    if (armies.length === 0) {
      container.innerHTML = `
        <div style="color: #8a7060; text-align: center; padding: 2rem;">
          No armies recruited yet
        </div>
      `;
      return;
    }
    
    container.innerHTML = armies.map((army, index) => `
      <div style="
        background: rgba(60, 50, 70, 0.3);
        border: 1px solid rgba(100, 80, 60, 0.4);
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 0.5rem;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div style="color: #e8d4a8; font-weight: 600;">Army ${index + 1}</div>
          <div style="display: flex; gap: 1rem;">
            <span style="color: #6ac96a;">💪 ${army.calculateStrength()}</span>
            <span style="color: #ffd700;">${army.getTotalUnits()} units</span>
          </div>
        </div>
        
        <div style="font-size: 0.85rem; color: #8a7060;">
          Location: (${Math.floor(army.x)}, ${Math.floor(army.y)})
          | Morale: ${Math.floor(army.morale)}%
          | Exp: ${army.experience}
        </div>
        
        <div style="font-size: 0.8rem; color: #7a6050; margin-top: 0.5rem;">
          ${TACTICS[army.tactic.toUpperCase()].icon} ${TACTICS[army.tactic.toUpperCase()].name}
          | ${EQUIPMENT[army.equipment.toUpperCase()].name}
        </div>
      </div>
    `).join('');
  }
  
  recruitArmy() {
    const playerNation = this.worldManager.getPlayerNation();
    
    // Check if can afford
    if (!this.worldManager.armyManager.canAffordArmy(0, this.currentComposition)) {
      this.worldManager.showNotification('⚠️ Insufficient resources to recruit army', 'warning');
      return;
    }
    
    // Find capital city location
    const capital = playerNation.getCapital();
    if (!capital) {
      this.worldManager.showNotification('⚠️ No capital city found', 'warning');
      return;
    }
    
    // Recruit army at capital
    const army = this.worldManager.armyManager.recruitArmy(
      0,
      capital.x,
      capital.y,
      this.currentComposition
    );
    
    if (army) {
      this.worldManager.showNotification(`🎖️ Army recruited! ${army.getTotalUnits()} units mobilized`, 'success');
      this.updateArmyList();
      this.updateCostDisplay();
    }
  }
  
  show() {
    this.isOpen = true;
    this.container.style.display = 'block';
    this.updateArmyList();
  }
  
  hide() {
    this.isOpen = false;
    this.container.style.display = 'none';
  }
  
  toggle() {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }
}
