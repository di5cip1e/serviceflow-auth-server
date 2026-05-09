import { POSITIVE_TRAITS, NEGATIVE_TRAITS, MAX_STAT_POINTS, MAX_NEGATIVE_TRAITS } from './config.js';

export class RulerCreationScene {
  constructor(governmentType, onComplete) {
    this.governmentType = governmentType;
    this.onComplete = onComplete;
    
    // Identity data
    this.rulerName = '';
    this.rulerGender = '';
    this.nationName = '';
    this.capitalName = '';
    
    // Trait selection
    this.selectedPositiveTraits = new Set();
    this.selectedNegativeTraits = new Set();
    this.pointsSpent = 0;
    this.pointsRefunded = 0;
    
    this.currentStep = 'identity'; // identity, traits
    this.container = null;
    
    this.init();
  }

  get totalPoints() {
    return MAX_STAT_POINTS + this.pointsRefunded;
  }

  get pointsRemaining() {
    return this.totalPoints - this.pointsSpent;
  }

  init() {
    const uiContainer = document.getElementById('ui-container');
    
    this.container = document.createElement('div');
    this.container.className = 'ui-panel';
    uiContainer.appendChild(this.container);
    
    this.showIdentityStep();
  }

  showIdentityStep() {
    this.currentStep = 'identity';
    this.container.innerHTML = `
      <h1>Define Your Realm</h1>
      <p class="subtitle">Name your ruler and establish your nation</p>
      
      <div style="margin: 2rem 0;">
        <div class="input-group">
          <label class="input-label">Ruler's Name</label>
          <input type="text" id="ruler-name" class="text-input" placeholder="Enter ruler's name" maxlength="30">
        </div>
        
        <div class="input-group">
          <label class="input-label">Ruler's Gender</label>
          <div class="gender-buttons">
            <button class="gender-button" data-gender="male">Male</button>
            <button class="gender-button" data-gender="female">Female</button>
            <button class="gender-button" data-gender="non-binary">Non-Binary</button>
          </div>
        </div>
        
        <div class="input-group">
          <label class="input-label">Nation Name</label>
          <input type="text" id="nation-name" class="text-input" placeholder="Enter nation name" maxlength="30">
        </div>
        
        <div class="input-group">
          <label class="input-label">Capital City</label>
          <input type="text" id="capital-name" class="text-input" placeholder="Enter capital name" maxlength="30">
        </div>
      </div>
      
      <button class="action-button" id="continue-traits" disabled>Continue to Traits</button>
    `;
    
    this.attachIdentityListeners();
  }

  attachIdentityListeners() {
    const rulerNameInput = document.getElementById('ruler-name');
    const nationNameInput = document.getElementById('nation-name');
    const capitalNameInput = document.getElementById('capital-name');
    const continueButton = document.getElementById('continue-traits');
    const genderButtons = document.querySelectorAll('.gender-button');
    
    // Gender selection
    genderButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        genderButtons.forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
        this.rulerGender = e.target.dataset.gender;
        this.validateIdentityForm();
      });
    });
    
    // Text inputs
    rulerNameInput.addEventListener('input', (e) => {
      this.rulerName = e.target.value.trim();
      this.validateIdentityForm();
    });
    
    nationNameInput.addEventListener('input', (e) => {
      this.nationName = e.target.value.trim();
      this.validateIdentityForm();
    });
    
    capitalNameInput.addEventListener('input', (e) => {
      this.capitalName = e.target.value.trim();
      this.validateIdentityForm();
    });
    
    continueButton.addEventListener('click', () => {
      if (this.validateIdentityData()) {
        this.showTraitsStep();
      }
    });
  }

  validateIdentityForm() {
    const continueButton = document.getElementById('continue-traits');
    continueButton.disabled = !this.validateIdentityData();
  }

  validateIdentityData() {
    return this.rulerName.length > 0 && 
           this.rulerGender.length > 0 && 
           this.nationName.length > 0 && 
           this.capitalName.length > 0;
  }

  showTraitsStep() {
    this.currentStep = 'traits';
    this.container.innerHTML = `
      <h1>Shape Your Ruler</h1>
      <p class="subtitle">${this.rulerName} of ${this.nationName}</p>
      
      <div class="points-display">
        <div class="points-box">
          <div class="points-label">Points Available</div>
          <div class="points-value" id="points-remaining">${this.pointsRemaining}</div>
        </div>
        <div class="points-box">
          <div class="points-label">Base Points</div>
          <div class="points-value">${MAX_STAT_POINTS}</div>
        </div>
        <div class="points-box">
          <div class="points-label">From Flaws</div>
          <div class="points-value positive" id="points-refunded">+${this.pointsRefunded}</div>
        </div>
      </div>
      
      <div class="traits-section">
        <h2 class="section-title">Positive Traits</h2>
        <p class="section-subtitle">Spend points to grant your ruler strengths</p>
        <div id="positive-traits-container" class="traits-grid"></div>
      </div>
      
      <div class="traits-section">
        <h2 class="section-title negative">Negative Traits</h2>
        <p class="section-subtitle">Accept flaws to gain more points (max ${MAX_NEGATIVE_TRAITS})</p>
        <div id="negative-traits-container" class="traits-grid"></div>
      </div>
      
      <button class="action-button" id="confirm-ruler" disabled>Confirm Ruler</button>
      <button class="secondary-button" id="back-identity">← Back to Identity</button>
    `;
    
    this.renderTraits();
    this.attachTraitListeners();
  }

  renderTraits() {
    this.renderPositiveTraits();
    this.renderNegativeTraits();
    this.updatePointsDisplay();
  }

  renderPositiveTraits() {
    const container = document.getElementById('positive-traits-container');
    
    container.innerHTML = POSITIVE_TRAITS.map(trait => {
      const isSelected = this.selectedPositiveTraits.has(trait.id);
      const canAfford = this.pointsRemaining >= trait.cost;
      const isDisabled = !isSelected && !canAfford;
      
      return `
        <div class="trait-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" 
             data-trait-id="${trait.id}" 
             data-trait-type="positive">
          <div class="trait-header">
            <span class="trait-name">${trait.name}</span>
            <span class="trait-cost">${trait.cost} pt${trait.cost > 1 ? 's' : ''}</span>
          </div>
          <div class="trait-description">${trait.description}</div>
          <div class="trait-impact">${trait.impact}</div>
          ${isSelected ? '<div class="trait-selected-badge">✓ Selected</div>' : ''}
        </div>
      `;
    }).join('');
  }

  renderNegativeTraits() {
    const container = document.getElementById('negative-traits-container');
    const negativeCount = this.selectedNegativeTraits.size;
    const maxReached = negativeCount >= MAX_NEGATIVE_TRAITS;
    
    container.innerHTML = NEGATIVE_TRAITS.map(trait => {
      const isSelected = this.selectedNegativeTraits.has(trait.id);
      const isDisabled = !isSelected && maxReached;
      
      return `
        <div class="trait-card negative ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" 
             data-trait-id="${trait.id}" 
             data-trait-type="negative">
          <div class="trait-header">
            <span class="trait-name">${trait.name}</span>
            <span class="trait-cost positive">+${trait.refund} pt${trait.refund > 1 ? 's' : ''}</span>
          </div>
          <div class="trait-description">${trait.description}</div>
          <div class="trait-impact">${trait.impact}</div>
          ${isSelected ? '<div class="trait-selected-badge negative">✓ Taken</div>' : ''}
        </div>
      `;
    }).join('');
  }

  attachTraitListeners() {
    // Trait card clicks
    document.querySelectorAll('.trait-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('disabled')) return;
        
        const traitId = card.dataset.traitId;
        const traitType = card.dataset.traitType;
        
        if (traitType === 'positive') {
          this.togglePositiveTrait(traitId);
        } else {
          this.toggleNegativeTrait(traitId);
        }
      });
    });
    
    // Confirm button
    document.getElementById('confirm-ruler').addEventListener('click', () => {
      this.confirmRuler();
    });
    
    // Back button
    document.getElementById('back-identity').addEventListener('click', () => {
      this.showIdentityStep();
    });
  }

  togglePositiveTrait(traitId) {
    const trait = POSITIVE_TRAITS.find(t => t.id === traitId);
    
    if (this.selectedPositiveTraits.has(traitId)) {
      // Deselect
      this.selectedPositiveTraits.delete(traitId);
      this.pointsSpent -= trait.cost;
    } else {
      // Select
      if (this.pointsRemaining >= trait.cost) {
        this.selectedPositiveTraits.add(traitId);
        this.pointsSpent += trait.cost;
      }
    }
    
    this.renderTraits();
  }

  toggleNegativeTrait(traitId) {
    const trait = NEGATIVE_TRAITS.find(t => t.id === traitId);
    
    if (this.selectedNegativeTraits.has(traitId)) {
      // Deselect
      this.selectedNegativeTraits.delete(traitId);
      this.pointsRefunded -= trait.refund;
      // Need to remove positive traits if we can't afford them anymore
      this.validatePositiveTraitsAfterNegativeRemoval();
    } else {
      // Select
      if (this.selectedNegativeTraits.size < MAX_NEGATIVE_TRAITS) {
        this.selectedNegativeTraits.add(traitId);
        this.pointsRefunded += trait.refund;
      }
    }
    
    this.renderTraits();
  }

  validatePositiveTraitsAfterNegativeRemoval() {
    // If removing negative trait causes us to not afford positive traits, remove them
    while (this.pointsSpent > this.totalPoints) {
      // Remove the most expensive positive trait
      let mostExpensive = null;
      let maxCost = 0;
      
      this.selectedPositiveTraits.forEach(traitId => {
        const trait = POSITIVE_TRAITS.find(t => t.id === traitId);
        if (trait.cost > maxCost) {
          maxCost = trait.cost;
          mostExpensive = traitId;
        }
      });
      
      if (mostExpensive) {
        const trait = POSITIVE_TRAITS.find(t => t.id === mostExpensive);
        this.selectedPositiveTraits.delete(mostExpensive);
        this.pointsSpent -= trait.cost;
      } else {
        break;
      }
    }
  }

  updatePointsDisplay() {
    const remainingEl = document.getElementById('points-remaining');
    const refundedEl = document.getElementById('points-refunded');
    const confirmButton = document.getElementById('confirm-ruler');
    
    if (remainingEl) {
      remainingEl.textContent = this.pointsRemaining;
    }
    
    if (refundedEl) {
      refundedEl.textContent = `+${this.pointsRefunded}`;
    }
    
    // Can confirm if we have at least one positive trait selected
    if (confirmButton) {
      confirmButton.disabled = this.selectedPositiveTraits.size === 0;
    }
  }

  confirmRuler() {
    if (this.selectedPositiveTraits.size === 0) return;
    
    const rulerData = {
      // Identity
      rulerName: this.rulerName,
      rulerGender: this.rulerGender,
      nationName: this.nationName,
      capitalName: this.capitalName,
      
      // Government
      governmentType: this.governmentType,
      
      // Traits
      positiveTraits: Array.from(this.selectedPositiveTraits),
      negativeTraits: Array.from(this.selectedNegativeTraits),
      
      // Stats summary
      pointsSpent: this.pointsSpent,
      pointsRefunded: this.pointsRefunded,
      totalPoints: this.totalPoints
    };
    
    this.destroy();
    this.onComplete(rulerData);
  }

  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
