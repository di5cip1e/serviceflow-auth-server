import { ASSETS } from "../manifest.js";
import { BuildingRegistry } from "./BuildingRegistry.js";
import { CITIZEN_TYPES } from "./CitizenManager.js";

// UI timing and positioning constants
const UI = {
  LONG_PRESS_MS: 500,
  TOOLTIP_GAP: 10,
  VIEWPORT_PADDING: 8,
  CONFIRM_Y_OFFSET: 80,
  INSTRUCTIONS_DURATION_MS: 10000,
  INSTRUCTIONS_FADE_MS: 1000,
};

export class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.topBarEl = null;
    this.bottomBarEl = null;
    this.confirmEl = null;
    this.longPressTimer = null;
    this.tooltipEl = null;
    this.instructionsEl = null;
    this.citizenMenuEl = null;
    this.isTouchDevice = scene.isTouchDevice;
  }

  // --- Formatting Helpers ---

  /** Returns CSS class for positive/negative values */
  _valueClass(val) {
    return val >= 0 ? "val-pos" : "val-neg";
  }

  /** Formats number with sign: +5 or -3 */
  _signed(val) {
    return (val > 0 ? "+" : "") + val;
  }

  /** Prevents event propagation to game canvas */
  _blockGameInput(el) {
    el.addEventListener("pointerdown", (e) => e.stopPropagation());
    el.addEventListener("mousedown", (e) => e.stopPropagation());
  }

  createDOMUI() {
    this.injectStyles();
    this.createTopBar();
    this.createBottomBar();
    this.createTooltip();
    this.createPlacementConfirm();
    this.createHelperPopup();
    this.createCitizenMenu();
    this.createStatsMenu();
  }

  injectStyles() {
    if (document.getElementById("game-ui-styles")) return;

    const link = document.createElement("link");
    link.id = "game-ui-styles";
    link.rel = "stylesheet";
    link.href = "./src/styles/game-ui.css";
    document.head.appendChild(link);
  }

  createTopBar() {
    this.topBarEl = document.createElement("div");
    this.topBarEl.className = "game-ui top-bar";
    this.topBarEl.innerHTML = `
            <div class="stats-group">
                <div class="stat-item" id="stat-money">
                    <span>💰</span>
                    <span class="stat-value" id="money-value">${this.scene.money}</span>
                    <span class="stat-income" id="income-value">(+0)</span>
                </div>
                <div class="stat-item" id="stat-happiness">
                    <span>😊</span>
                    <span class="stat-value" id="happiness-value">${this.scene.happiness.toFixed(1)}</span>
                </div>
                <div class="stat-item" id="stat-population">
                    <span>👥</span>
                    <span class="stat-value" id="population-value">${this.scene.population}</span>
                </div>
            </div>
            <div class="top-actions">
                <div class="action-btn" id="stats-btn">🏢 <span>City Hall</span></div>
                <div class="action-btn" id="add-money-btn">💵 <span>$1k</span></div>
                <div class="action-btn" id="heatmap-btn">🛡️ <span>Safety</span></div>
                <div class="action-btn" id="citizen-btn">🏠 <span>Citizens</span></div>
                <div class="sound-toggle" id="sound-btn">🔊 <span>ON</span></div>
            </div>
        `;
    document.body.appendChild(this.topBarEl);

    // City Hall stats click
    this.topBarEl.querySelector("#stats-btn").addEventListener("click", () => {
        this.toggleStatsMenu();
        this.scene.playUISound();
    });

    // Add money button
    this.topBarEl.querySelector("#add-money-btn").addEventListener("click", () => {
        this.scene.updateMoney(1000);
        this.scene.playUISound();
    });

    // Heatmap toggle
    const heatmapBtn = this.topBarEl.querySelector("#heatmap-btn");
    heatmapBtn.addEventListener("click", () => {
        const enabled = !this.scene.gridManager.heatmapEnabled;
        this.scene.gridManager.toggleHeatmap(enabled);
        heatmapBtn.classList.toggle("active", enabled);
        this.scene.playUISound();
    });

    // Citizen menu click
    this.topBarEl.querySelector("#citizen-btn").addEventListener("click", () => {
        this.toggleCitizenMenu();
        this.scene.playUISound();
    });

    // Sound toggle click
    this.soundBtnEl = this.topBarEl.querySelector("#sound-btn");
    this.soundBtnEl.addEventListener("click", async () => {
      const muted = await this.scene.toggleMute();
      this.soundBtnEl.innerHTML = muted
        ? "🔇 <span>OFF</span>"
        : "🔊 <span>ON</span>";
    });

    this._blockGameInput(this.topBarEl);
  }

  createStatsMenu() {
    this.statsMenuEl = document.createElement("div");
    this.statsMenuEl.className = "game-ui citizen-menu hidden"; // Reuse menu styling
    this.statsMenuEl.innerHTML = `
        <div class="menu-header">
            <h2>City Hall</h2>
            <button id="close-stats">X</button>
        </div>
        <div class="stats-content" id="stats-content"></div>
    `;
    document.body.appendChild(this.statsMenuEl);

    this.statsMenuEl.querySelector("#close-stats").addEventListener("click", () => this.toggleStatsMenu());
    this._blockGameInput(this.statsMenuEl);
  }

  toggleStatsMenu() {
    this.statsMenuEl.classList.toggle("hidden");
    if (!this.statsMenuEl.classList.contains("hidden")) {
        this.refreshStatsMenu();
    }
  }

  refreshStatsMenu() {
    const contentEl = this.statsMenuEl.querySelector("#stats-content");
    const citizens = this.scene.citizenManager.citizens;
    const criminals = this.scene.citizenManager.getCriminals();
    const unemployed = citizens.filter(c => !c.job).length;
    const totalJobs = this.scene.citizenManager.getAvailableJobs().length + citizens.filter(c => c.job).length;
    const filledJobs = citizens.filter(c => c.job).length;
    
    // Calculate total housing capacity
    let housingCapacity = 0;
    this.scene.gridManager.grid.flat().forEach(tile => {
        if (tile.isMaster || !tile.masterTile) {
            const config = BuildingRegistry[tile.buildingType];
            if (config && config.effects.population > 0) {
                housingCapacity += config.effects.population;
            }
        }
    });

    const incomeBreakdown = this.scene.getIncomeBreakdown();

    contentEl.innerHTML = `
        <div class="city-stats-grid">
            <div class="stat-card">
                <div class="stat-label">Population</div>
                <div class="stat-value">${citizens.length} / ${housingCapacity}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Employment</div>
                <div class="stat-value">${filledJobs} / ${totalJobs}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Unemployed</div>
                <div class="stat-value ${unemployed > 0 ? 'val-neg' : 'val-pos'}">${unemployed}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Criminals</div>
                <div class="stat-value ${criminals.length > 0 ? 'val-neg' : 'val-pos'}">${criminals.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Income Rate</div>
                <div class="stat-value val-pos">$${incomeBreakdown.incomePerUnit} / tick</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Avg Happiness</div>
                <div class="stat-value">${this.scene.getEffectiveHappiness().toFixed(2)}</div>
            </div>
        </div>
        <div class="building-summary">
            <h3>Infrastructure</h3>
            <div class="building-grid">
                ${Object.entries(BuildingRegistry).filter(([_, cfg]) => cfg.cost > 0).map(([type, cfg]) => {
                    const count = this.scene.gridManager.countTiles(type);
                    if (count === 0) return '';
                    return `<div class="building-count-item"><span>${cfg.name}:</span> <span>${count}</span></div>`;
                }).join('')}
            </div>
        </div>
    `;
  }

  createCitizenMenu() {
    this.citizenMenuEl = document.createElement("div");
    this.citizenMenuEl.className = "game-ui citizen-menu hidden";
    this.citizenMenuEl.innerHTML = `
        <div class="menu-header">
            <h2>Citizens</h2>
            <button id="close-citizens">X</button>
        </div>
        <div class="menu-actions">
            <button id="auto-assign">Auto-Assign Jobs</button>
        </div>
        <div class="citizen-list" id="citizen-list"></div>
    `;
    document.body.appendChild(this.citizenMenuEl);

    this.citizenMenuEl.querySelector("#close-citizens").addEventListener("click", () => this.toggleCitizenMenu());
    this.citizenMenuEl.querySelector("#auto-assign").addEventListener("click", () => {
        this.scene.citizenManager.autoAssignJobs();
        this.refreshCitizenList();
        this.scene.playUISound();
    });

    this._blockGameInput(this.citizenMenuEl);
  }

  toggleCitizenMenu() {
    this.citizenMenuEl.classList.toggle("hidden");
    if (!this.citizenMenuEl.classList.contains("hidden")) {
        this.refreshCitizenList();
    }
  }

  refreshCitizenList() {
    const listEl = this.citizenMenuEl.querySelector("#citizen-list");
    const citizens = this.scene.citizenManager.citizens;
    const availableJobs = this.scene.citizenManager.getAvailableJobs();

    if (citizens.length === 0) {
        listEl.innerHTML = '<div class="empty-state">No citizens yet. Build houses!</div>';
        return;
    }

    listEl.innerHTML = citizens.map(c => {
        const typeData = CITIZEN_TYPES[c.type];
        const jobText = c.job ? `${c.job.type}` : "Unemployed";
        const jobClass = c.job ? "job-filled" : "job-empty";
        
        let activityText = "Wandering";
        if (c.isPrisoner) activityText = "In Jail";
        else if (c.isBeingPursued) activityText = "Being Chased!";
        else if (c.state === "WORK") activityText = `At ${c.job ? c.job.type : 'Work'}`;
        else if (c.state === "HOME") activityText = "At Home";

        return `
            <div class="citizen-card">
                <div class="citizen-info">
                    <span class="citizen-emoji">${typeData.emoji}</span>
                    <div class="citizen-details">
                        <div class="citizen-name">${c.name}</div>
                        <div class="citizen-type">${typeData.name}</div>
                    </div>
                </div>
                <div class="citizen-stats">
                    <div class="citizen-happiness">😊 ${c.happiness.toFixed(1)}</div>
                    <div class="citizen-activity">${activityText}</div>
                    <div class="citizen-job ${jobClass}">${jobText}</div>
                </div>
                ${!c.job && availableJobs.length > 0 ? 
                    `<button class="assign-btn" data-id="${c.id}">Assign</button>` : ''}
            </div>
        `;
    }).join('');

    // Handle manual assignment
    listEl.querySelectorAll(".assign-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const available = this.scene.citizenManager.getAvailableJobs();
            if (available.length > 0) {
                this.scene.citizenManager.assignJob(id, available[0]);
                this.refreshCitizenList();
                this.scene.playUISound();
            }
        });
    });
  }

  createBottomBar() {
    this.bottomBarEl = document.createElement("div");
    this.bottomBarEl.className = "game-ui bottom-bar";

    let itemsHTML = '<div class="hotbar">';
    Object.entries(BuildingRegistry).forEach(([type, building]) => {
      const cost = this.scene.getCost(type);
      const costStr = cost > 0 ? `$${cost}` : "FREE";
      const costClass = cost > 0 ? "" : "free";
      const selected = type === this.scene.selectedTileType ? "selected" : "";

      const textureKey = building.texture || type;
      const imgSrc = ASSETS.images[textureKey] || ASSETS.images.grass; // Fallback

      itemsHTML += `
                <div class="hotbar-item ${selected}" data-type="${type}">
                    <img src="${imgSrc}" alt="${building.name}">
                    <span class="hotbar-cost ${costClass}" id="cost-${type}">${costStr}</span>
                </div>
            `;
    });
    itemsHTML += "</div>";

    this.bottomBarEl.innerHTML = itemsHTML;
    document.body.appendChild(this.bottomBarEl);

    // Click and long-press handling
    this.bottomBarEl.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      const item = event.target.closest(".hotbar-item");
      if (item) {
        const type = item.dataset.type;
        // Start long-press timer for tooltip
        this.longPressTimer = setTimeout(() => {
          this.showTooltip(type, item);
          this.longPressTimer = null;
        }, UI.LONG_PRESS_MS);
      }
    });

    this.bottomBarEl.addEventListener("pointerup", (event) => {
      const item = event.target.closest(".hotbar-item");
      if (item && this.longPressTimer) {
        // Short press - select building
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
        const type = item.dataset.type;
        this.scene.selectBuilding(type);
      }
    });

    this.bottomBarEl.addEventListener("pointerout", (event) => {
      // Only clear if leaving the bottom bar entirely
      if (!this.bottomBarEl.contains(event.relatedTarget)) {
        if (this.longPressTimer) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }
      }
    });

    this._blockGameInput(this.bottomBarEl);

    // Desktop: hover to show tooltip (positioned near item)
    if (!this.isTouchDevice) {
      const items = this.bottomBarEl.querySelectorAll(".hotbar-item");
      items.forEach((item) => {
        item.addEventListener("mouseenter", () => {
          const type = item.dataset.type;
          this.showTooltip(type, item);
        });

        item.addEventListener("mouseleave", () => {
          this.hideTooltip();
        });
      });
    }
  }

  createTooltip() {
    // Mobile: create overlay behind tooltip
    if (this.isTouchDevice) {
      this.tooltipOverlay = document.createElement("div");
      this.tooltipOverlay.className = "game-ui tooltip-overlay";
      this.tooltipOverlay.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.hideTooltip();
      });
      document.body.appendChild(this.tooltipOverlay);
    }

    this.tooltipEl = document.createElement("div");
    this.tooltipEl.className = "game-ui game-tooltip";
    document.body.appendChild(this.tooltipEl);
  }

  showTooltip(type, targetEl) {
    const config = BuildingRegistry[type];
    if (!config || !this.tooltipEl) return;

    let html = `<div class="tooltip-title">${config.name}</div>`;

    // Effects section
    const effects = [];
    if (config.effects.population) {
      const val = config.effects.population;
      effects.push(
        `<span class="${this._valueClass(val)}">${this._signed(val)} Population</span>`,
      );
    }
    if (config.effects.happiness) {
      const val = config.effects.happiness;
      effects.push(
        `<span class="${this._valueClass(val)}">${this._signed(val)} Happiness</span>`,
      );
    }
    if (config.effects.gridExpansion) {
      effects.push(
        `<span class="val-pos">+${config.effects.gridExpansion} Territory</span>`,
      );
    }

    // Jobs section
    if (config.jobSlots) {
        effects.push(`<span class="val-pos">${config.jobSlots} ${config.jobType} Jobs</span>`);
    }

    if (config.prisonerCapacity) {
        effects.push(`<span class="val-gold">Capacity: ${config.prisonerCapacity} Prisoners</span>`);
    }

    // Income with detailed breakdown
    if (config.generatesIncome) {
      const { baseRate, popBonus, effectiveHappiness } =
        this.scene.getIncomeBreakdown();
      const finalIncome = this.scene.getBuildingIncome(type);
      const multiplier = config.incomeMultiplier || 1;

      let subText = `($${baseRate - popBonus} Base + $${popBonus} Pop) x ${effectiveHappiness.toFixed(1)} Happy`;
      if (multiplier > 1) {
        subText = `(${multiplier}x Shop Income)`;
      }

      effects.push(`<div class="tooltip-income">
                <span class="${this._valueClass(finalIncome)}">${this._signed(finalIncome)}$ / 5 sec</span>
                <span class="text-muted">${subText}</span>
            </div>`);
    }

    if (effects.length > 0) {
      html += `<div class="tooltip-row"><span>Effects:</span></div>`;
      effects.forEach((eff) => {
        html += `<div class="tooltip-row indented">${eff}</div>`;
      });
    }

    // Requirements section
    if (config.requirements?.population) {
      const met = this.scene.population >= config.requirements.population;
      html += `<div class="tooltip-row section"><span>Requires:</span></div>`;
      html += `<div class="tooltip-row indented"><span class="${met ? "val-pos" : "val-neg"}">${config.requirements.population} Population</span></div>`;
    }

    // Description
    if (config.description) {
      html += `<div class="tooltip-desc">${config.description}</div>`;
    }

    this.tooltipEl.innerHTML = html;

    // Mobile: show overlay
    if (this.isTouchDevice && this.tooltipOverlay) {
      this.tooltipOverlay.classList.add("visible");
    }

    this.tooltipEl.classList.add("visible");

    // Mobile: center on screen
    if (this.isTouchDevice) {
      this.tooltipEl.style.left = "50%";
      this.tooltipEl.style.top = "50%";
      this.tooltipEl.style.transform = "translate(-50%, -50%)";
      return;
    }

    // Desktop: position above the hotbar item
    this.tooltipEl.style.transform = "none";
    const rect = targetEl.getBoundingClientRect();
    const tooltipRect = this.tooltipEl.getBoundingClientRect();

    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let top = rect.top - tooltipRect.height - UI.TOOLTIP_GAP;

    const pad = UI.VIEWPORT_PADDING;
    if (left < pad) left = pad;
    if (left + tooltipRect.width > window.innerWidth - pad) {
      left = window.innerWidth - tooltipRect.width - pad;
    }
    if (top < pad) {
      top = rect.bottom + UI.TOOLTIP_GAP;
    }

    this.tooltipEl.style.left = `${left}px`;
    this.tooltipEl.style.top = `${top}px`;
  }

  hideTooltip() {
    if (this.tooltipEl) this.tooltipEl.classList.remove("visible");
    if (this.tooltipOverlay) this.tooltipOverlay.classList.remove("visible");
  }

  createHelperPopup() {
    // Instructions panel that auto-fades (like original)
    this.instructionsEl = document.createElement("div");
    this.instructionsEl.className = "game-ui instructions-panel";

    if (this.isTouchDevice) {
      this.instructionsEl.innerHTML =
        '<div class="instructions-line">Build by tapping tiles</div>' +
        '<div class="instructions-line">Drag to pan, pinch to zoom</div>' +
        '<div class="instructions-line subtle">Hold building icon for details</div>';
    } else {
      this.instructionsEl.innerHTML =
        '<div class="instructions-line">Click to build, drag to pan</div>' +
        '<div class="instructions-line">Scroll to zoom, right-click to flip</div>' +
        '<div class="instructions-line subtle">Click anywhere to start music</div>';
    }

    document.body.appendChild(this.instructionsEl);

    // Auto-hide after delay
    setTimeout(() => {
      if (this.instructionsEl) {
        this.instructionsEl.classList.add("hidden");
        // Remove from DOM after fade
        setTimeout(() => {
          if (this.instructionsEl?.parentNode) {
            this.instructionsEl.remove();
          }
        }, UI.INSTRUCTIONS_FADE_MS);
      }
    }, UI.INSTRUCTIONS_DURATION_MS);
  }

  createPlacementConfirm() {
    this.confirmEl = document.createElement("div");
    this.confirmEl.className = "game-ui placement-confirm";
    this.confirmEl.innerHTML = `
            <div class="placement-btn cancel" id="placement-cancel">X</div>
            <div class="placement-btn confirm" id="placement-confirm">OK</div>
        `;
    document.body.appendChild(this.confirmEl);

    this.confirmEl
      .querySelector("#placement-confirm")
      .addEventListener("click", (e) => {
        e.stopPropagation();
        this.scene.confirmPlacement();
      });

    this.confirmEl
      .querySelector("#placement-cancel")
      .addEventListener("click", (e) => {
        e.stopPropagation();
        this.scene.cancelPlacement();
      });

    this._blockGameInput(this.confirmEl);
  }

  showPlacementConfirm(screenX, screenY) {
    if (!this.confirmEl) return;
    this.confirmEl.style.left = `${screenX}px`;
    this.confirmEl.style.top = `${screenY - UI.CONFIRM_Y_OFFSET}px`;
    this.confirmEl.style.transform = "translateX(-50%)";
    this.confirmEl.classList.add("visible");
  }

  hidePlacementConfirm() {
    if (this.confirmEl) this.confirmEl.classList.remove("visible");
  }

  updatePlacementConfirmPosition(screenX, screenY) {
    if (!this.confirmEl) return;
    this.confirmEl.style.left = `${screenX}px`;
    this.confirmEl.style.top = `${screenY - UI.CONFIRM_Y_OFFSET}px`;
  }

  updateStats() {
    if (!this.topBarEl) return;

    const moneyEl = this.topBarEl.querySelector("#money-value");
    const incomeEl = this.topBarEl.querySelector("#income-value");
    const popEl = this.topBarEl.querySelector("#population-value");
    const happyEl = this.topBarEl.querySelector("#happiness-value");

    if (moneyEl) moneyEl.innerText = this.scene.money;

    if (incomeEl) {
      const income = this.scene.calculateIncome
        ? this.scene.calculateIncome()
        : 0;
      incomeEl.textContent = `(${this._signed(income)})`;
      incomeEl.className = `stat-income ${this._valueClass(income)}`;
    }

    if (popEl) popEl.innerText = this.scene.population;

    if (happyEl) {
      const effectiveHappiness = this.scene.getEffectiveHappiness();
      const display = Phaser.Math.Clamp(effectiveHappiness, -1.0, 1.5);
      happyEl.innerText = display.toFixed(1);
      
      if (display >= 0.9) happyEl.style.color = "#00ff00"; // Model
      else if (display >= 0.6) happyEl.style.color = "#ffffff"; // Normal
      else if (display >= 0.3) happyEl.style.color = "#ffff00"; // Disgruntled
      else happyEl.style.color = "#ff4444"; // Criminal territory
    }

    // Periodically refresh citizen list if visible
    if (this.citizenMenuEl && !this.citizenMenuEl.classList.contains("hidden")) {
        this.refreshCitizenList();
    }

    // Periodically refresh stats menu if visible
    if (this.statsMenuEl && !this.statsMenuEl.classList.contains("hidden")) {
        this.refreshStatsMenu();
    }
  }

  refreshAllCosts() {
    if (!this.bottomBarEl) return;

    Object.keys(BuildingRegistry).forEach((type) => {
      const el = this.bottomBarEl.querySelector(`#cost-${type}`);
      if (el) {
        const cost = this.scene.getCost(type);
        el.innerText = cost > 0 ? `$${cost}` : "FREE";
        el.className = `hotbar-cost ${cost > 0 ? "" : "free"}`;
      }
    });
  }

  updateSelectedBuilding(type) {
    if (!this.bottomBarEl) return;

    const items = this.bottomBarEl.querySelectorAll(".hotbar-item");
    items.forEach((item) => {
      if (item.dataset.type === type) {
        item.classList.add("selected");
      } else {
        item.classList.remove("selected");
      }
    });
  }
}
