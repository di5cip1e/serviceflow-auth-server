import Phaser from "phaser";
import { Config } from "../Config.js";
import { ASSETS } from "../../manifest.js";
import { GridManager } from "../GridManager.js";
import { IsoUtils } from "../IsoUtils.js";
import { UIManager } from "../UIManager.js";
import { AudioManager } from "../AudioManager.js";
import { getBuildingConfig, BuildingRegistry } from "../BuildingRegistry.js";
import { CitizenManager } from "../CitizenManager.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.selectedTileType = "house";
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.uiManager = null;
    this.audioManager = null;
    this.citizenManager = null;
    this.lastTickTime = 0;
    this.tickInterval = Config.tickInterval;

    // Mobile placement confirmation
    this.isTouchDevice = false;
    this.pendingPlacement = null; // { row, col } when waiting for confirm
  }

  init() {
    // Read initial game state from registry (set in Boot scene)
    this.money = this.registry.get("money");
    this.population = this.registry.get("population");
    this.happiness = this.registry.get("happiness");
  }

  getCost(type) {
    // Cost increases by 10% for each building of this type already placed
    const baseCost = BuildingRegistry[type]?.cost || 0;
    const count = this.gridManager ? this.gridManager.countTiles(type) : 0;
    return Math.round(baseCost * Math.pow(1.1, count));
  }

  // Assets are loaded in Preloader scene

  initAudio() {
    this.audioManager = new AudioManager(this);
  }

  async toggleMute() {
    return await this.audioManager.toggleMute();
  }

  async startMusic() {
    await this.audioManager.init();
  }

  playBuildSound() {
    this.audioManager.playBuildSound();
  }

  playUISound() {
    this.audioManager.playUISound();
  }

  selectBuilding(type) {
    // Cancel any pending placement on mobile
    if (this.pendingPlacement) {
      this.cancelPlacement();
    }

    this.selectedTileType = type;
    const config = getBuildingConfig(type);
    const textureKey = config.texture || type;
    
    this.previewTile.setTexture(textureKey);
    this.previewTile.setVisible(false); // Hide until pointer moves over grid
    this.updatePreviewScale();
    this.playUISound();

    if (this.uiManager) {
      this.uiManager.updateSelectedBuilding(type);
    }
  }

  create() {
    // Detect touch device
    this.isTouchDevice = this.sys.game.device.input.touch;

    this.initAudio();
    this.gridManager = new GridManager(this);
    this.citizenManager = new CitizenManager(this);
    this.uiManager = new UIManager(this);

    // Start music on first user interaction (works for both canvas and DOM)
    const startAudioOnce = async () => {
      if (!this.audioManager.initialized) {
        await this.startMusic();
        this.lastTickTime = this.time.now;
        // Remove listeners after first trigger
        document.removeEventListener("pointerdown", startAudioOnce);
        document.removeEventListener("touchstart", startAudioOnce);
        document.removeEventListener("click", startAudioOnce);
      }
    };
    
    // Listen on document to catch ALL interactions (canvas + UI)
    document.addEventListener("pointerdown", startAudioOnce, { once: false });
    document.addEventListener("touchstart", startAudioOnce, { once: false, passive: true });
    document.addEventListener("click", startAudioOnce, { once: false });

    // Disable context menu for right-click flipping
    this.input.mouse.disableContextMenu();

    // Start zoomed out, centered on middle of grid
    const initialScale = 1;
    this.gridManager.container.setScale(initialScale);

    // Grid center in world coords (middle of gridSize x gridSize)
    const gridCenter = IsoUtils.gridToWorld(
      Math.floor(Config.gridSize / 2),
      Math.floor(Config.gridSize / 2),
    );

    // Position so grid center is slightly above screen center
    this.gridManager.container.x =
      this.scale.width / 2 - gridCenter.x * initialScale;
    this.gridManager.container.y =
      this.scale.height * 0.6 - gridCenter.y * initialScale;

    // Handle window resize
    this.scale.on("resize", this.onResize, this);

    // UI for selection
    this.uiManager.createDOMUI();

    // Load saved state (MUST be after UI creation to update UI texts)
    this.loadGame();

    // Cell highlight (shows which cell is selected)
    this.cellHighlight = this.add.graphics();
    this.cellHighlight.lineStyle(3, 0x00ff00, 0.8);
    this.cellHighlight.fillStyle(0x00ff00, 0.2);
    // Draw diamond for 1x1 cell (top corner at origin)
    this.cellHighlight.beginPath();
    this.cellHighlight.moveTo(0, 0);
    this.cellHighlight.lineTo(-Config.tileWidth / 2, Config.tileHeight / 2);
    this.cellHighlight.lineTo(0, Config.tileHeight);
    this.cellHighlight.lineTo(Config.tileWidth / 2, Config.tileHeight / 2);
    this.cellHighlight.closePath();
    this.cellHighlight.fillPath();
    this.cellHighlight.strokePath();
    this.cellHighlight.setVisible(false);
    this.cellHighlight.isHighlight = true; // Mark for depth sorting
    this.gridManager.container.add(this.cellHighlight);

    // Preview cursor (starts hidden until pointer moves over grid)
    const initialConfig = getBuildingConfig(this.selectedTileType);
    const initialTexture = initialConfig.texture || this.selectedTileType;
    this.previewTile = this.add.image(0, 0, initialTexture);
    this.previewTile.setAlpha(0.6);
    this.previewTile.setOrigin(0.5, 1); // Standard isometric anchor: bottom-center
    this.previewTile.isPreview = true; // Set custom property for depth sorting
    this.previewTile.isFlipped = false; // Initial flip state
    this.previewTile.setVisible(false);
    this.updatePreviewScale();
    this.gridManager.container.add(this.previewTile);

    // Floating animation for preview
    this.tweens.add({
      targets: this.previewTile,
      y: "-=5",
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Input handling
    this.pinchDistance = 0;
    this.input.addPointer(1); // Ensure we have at least 2 pointers for pinch zoom

    this.input.on("pointerdown", (pointer, currentlyOver) => {
      // Pinch-to-zoom: track distance when two fingers down
      if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
        this.pinchDistance = Phaser.Math.Distance.Between(
          this.input.pointer1.x,
          this.input.pointer1.y,
          this.input.pointer2.x,
          this.input.pointer2.y,
        );
        return;
      }

      if (currentlyOver.length > 0) return;

      if (pointer.rightButtonDown()) {
        this.previewTile.isFlipped = !this.previewTile.isFlipped;
        this.updatePreviewScale();
        this.playUISound();
        return;
      }

      this.isDragging = false;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
    });

    this.input.on("pointermove", (pointer) => {
      // Pinch-to-zoom handling
      if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
        const newDist = Phaser.Math.Distance.Between(
          this.input.pointer1.x,
          this.input.pointer1.y,
          this.input.pointer2.x,
          this.input.pointer2.y,
        );

        if (this.pinchDistance > 0) {
          // Use ratio for smoother zooming
          const zoomFactor = newDist / this.pinchDistance;
          const centerX = (this.input.pointer1.x + this.input.pointer2.x) / 2;
          const centerY = (this.input.pointer1.y + this.input.pointer2.y) / 2;
          
          this.zoomAt(centerX, centerY, zoomFactor);
        }

        this.pinchDistance = newDist;
        return;
      }

      // Panning logic
      if (pointer.isDown && (!this.isTouchDevice || !this.pendingPlacement)) {
        const dist = Phaser.Math.Distance.Between(
          this.dragStartX,
          this.dragStartY,
          pointer.x,
          pointer.y,
        );
        
        if (this.isDragging || dist > 10) {
          if (!this.isDragging) {
            this.isDragging = true;
            // Hide preview when starting a pan
            this.previewTile.setVisible(false);
            this.cellHighlight.setVisible(false);
          }
          this.gridManager.container.x += pointer.x - pointer.prevPosition.x;
          this.gridManager.container.y += pointer.y - pointer.prevPosition.y;
          return; // Skip preview update while panning
        }
      }

      // Preview and highlight positioning
      const localPos = this.getLocalPointerPos(pointer);
      const gridCoords = IsoUtils.worldToGrid(localPos.x, localPos.y);

      const shouldShowPreview =
        !this.isTouchDevice || (this.pendingPlacement && pointer.isDown);

      if (
        !this.isDragging &&
        shouldShowPreview &&
        this.gridManager.isValidCoord(gridCoords.row, gridCoords.col)
      ) {
        const worldPos = IsoUtils.gridToWorld(gridCoords.row, gridCoords.col);

        if (
          this.previewTile.gridRow !== gridCoords.row ||
          this.previewTile.gridCol !== gridCoords.col
        ) {
          const config = getBuildingConfig(this.selectedTileType);
          const centerOffset = Math.floor((config.size - 1) / 2);
          const originRow = gridCoords.row - centerOffset;
          const originCol = gridCoords.col - centerOffset;

          const originWorldPos = IsoUtils.gridToWorld(originRow, originCol);
          const offsetToBottom =
            Config.tileHeight / 2 + (config.size - 1) * Config.tileHeight;
          this.previewTile.setPosition(
            originWorldPos.x,
            originWorldPos.y + offsetToBottom,
          );
          this.cellHighlight.setPosition(
            worldPos.x,
            worldPos.y - Config.tileHeight / 2,
          );

          this.previewTile.gridRow = originRow;
          this.previewTile.gridCol = originCol;
          this.previewTile.depth = 9999;
          this.cellHighlight.depth = 10000;

          if (this.isTouchDevice && this.pendingPlacement && pointer.isDown) {
            this.pendingPlacement = { row: originRow, col: originCol };
            const screenPos = this.getScreenPosFromGrid(originRow, originCol);
            this.uiManager.updatePlacementConfirmPosition(
              screenPos.x,
              screenPos.y,
            );
          }
        }

        this.previewTile.setVisible(true);
        // cellHighlight disabled
      } else if (!this.isTouchDevice || !this.pendingPlacement) {
        this.previewTile.setVisible(false);
        this.cellHighlight.setVisible(false);
      }
    });

    this.input.on("pointerup", (pointer, currentlyOver) => {
      this.pinchDistance = 0;

      if (
        pointer.button === 0 &&
        !this.isDragging &&
        currentlyOver.length === 0
      ) {
        const localPos = this.getLocalPointerPos(pointer);
        const gridCoords = IsoUtils.worldToGrid(localPos.x, localPos.y);

        if (this.gridManager.isValidCoord(gridCoords.row, gridCoords.col)) {
          const config = getBuildingConfig(this.selectedTileType);
          const centerOffset = Math.floor((config.size - 1) / 2);
          const originRow = gridCoords.row - centerOffset;
          const originCol = gridCoords.col - centerOffset;

          if (this.gridManager.isValidCoord(originRow, originCol)) {
            if (this.isTouchDevice) {
              this.startPendingPlacement(originRow, originCol, pointer);
            } else {
              this.gridManager.placeTile(
                originRow,
                originCol,
                this.selectedTileType,
              );
              this.playBuildSound();
            }
          }
        }
      }
      this.isDragging = false;
    });

    // Mouse wheel zoom
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      this.zoomAt(pointer.x, pointer.y, 1 - deltaY * 0.001);
    });
  }

  zoomAt(x, y, factor) {
    const minZoom = 0.3;
    const maxZoom = 10;

    const oldZoom = this.gridManager.container.scale;
    let newZoom = oldZoom * factor;
    newZoom = Phaser.Math.Clamp(newZoom, minZoom, maxZoom);

    if (oldZoom !== newZoom) {
      // Zoom towards point
      const worldX = (x - this.gridManager.container.x) / oldZoom;
      const worldY = (y - this.gridManager.container.y) / oldZoom;

      this.gridManager.container.setScale(newZoom);

      this.gridManager.container.x = x - worldX * newZoom;
      this.gridManager.container.y = y - worldY * newZoom;
    }
  }

  onResize(gameSize, baseSize, displaySize, previousWidth, previousHeight) {
    if (!previousWidth || !previousHeight) return;

    // Keep the same world point at the center of the screen
    const scale = this.gridManager.container.scale;

    // What world point was at the old center?
    const oldCenterX = previousWidth / 2;
    const oldCenterY = previousHeight / 2;
    const worldX = (oldCenterX - this.gridManager.container.x) / scale;
    const worldY = (oldCenterY - this.gridManager.container.y) / scale;

    // Position container so that world point is at new center
    const newCenterX = gameSize.width / 2;
    const newCenterY = gameSize.height / 2;
    this.gridManager.container.x = newCenterX - worldX * scale;
    this.gridManager.container.y = newCenterY - worldY * scale;
  }

  update(time, delta) {
    if (this.lastTickTime && time - this.lastTickTime >= this.tickInterval) {
      this.handleTick();
      this.lastTickTime = time;
    }

    if (this.citizenManager) {
        this.citizenManager.updateVisuals(delta);
    }
    
    // Smoothly update heatmap if enabled
    if (this.gridManager && this.gridManager.heatmapEnabled) {
      this.gridManager.updateHeatmap();
    }
  }

  getSaveKey() {
    // Use URL path to create unique save key per game instance
    return `townBuilder_${window.location.pathname}`;
  }

  saveGame() {
    const gameState = {
      money: this.money,
      population: this.population,
      happiness: this.happiness,
      grid: this.gridManager.getGridData(),
      citizens: this.citizenManager.save(),
    };
    localStorage.setItem(this.getSaveKey(), JSON.stringify(gameState));
  }

  loadGame() {
    const saved = localStorage.getItem(this.getSaveKey());
    if (saved) {
      try {
        const gameState = JSON.parse(saved);
        this.money = gameState.money;
        this.population = gameState.population;
        this.happiness = gameState.happiness;

        // Re-initialize grid with saved data
        this.gridManager.loadGrid(gameState.grid);
        this.gridManager.updateDepths();

        // Load citizens
        if (gameState.citizens) {
            this.citizenManager.load(gameState.citizens);
        } else {
            this.citizenManager.syncWithPopulation(this.population);
        }
        
        // Sync police officers after grid and citizens are ready
        this.citizenManager.syncPoliceOfficers();

        // Update UI texts if they exist
        if (this.uiManager) {
          this.updateMoney(0);
          this.updatePopulation(0);
          this.updateHappiness(0);
          this.uiManager.refreshAllCosts();
        }
      } catch (e) {
        console.error("Failed to load save state", e);
      }
    } else {
        // Initial sync for new game
        this.citizenManager.syncWithPopulation(this.population);
    }
  }

  getEffectiveHappiness() {
    // Base happiness from buildings
    let base = this.happiness;
    
    // Unemployment penalty: -0.02 happiness per unemployed person
    if (this.citizenManager) {
        const unemployed = this.citizenManager.citizens.filter(c => !c.job).length;
        base -= unemployed * 0.02;
    }

    const penalty =
      Math.max(0, this.population - Config.happinessPenaltyThreshold) *
      Config.happinessPenaltyRate;
    return base - penalty;
  }

  getIncomeBreakdown() {
    const effectiveHappiness = Phaser.Math.Clamp(
      this.getEffectiveHappiness(),
      Config.happinessMin,
      Config.happinessMax,
    );
    const popBonus = Math.floor(this.population / Config.populationIncomeBonus);
    const baseRate = Config.baseIncome + popBonus;
    const incomePerUnit = Math.floor(baseRate * effectiveHappiness);

    return {
      baseRate,
      popBonus,
      effectiveHappiness,
      incomePerUnit,
    };
  }

  getBuildingIncome(type) {
    const config = getBuildingConfig(type);
    if (!config.generatesIncome) return 0;

    const { incomePerUnit } = this.getIncomeBreakdown();
    const multiplier = config.incomeMultiplier || 1;
    return incomePerUnit * multiplier;
  }

  calculateIncome() {
    const { incomePerUnit } = this.getIncomeBreakdown();
    let totalIncome = 0;

    Object.entries(BuildingRegistry).forEach(([type, config]) => {
      if (config.generatesIncome) {
        const count = this.gridManager.countTiles(type);
        if (count > 0) {
          const multiplier = config.incomeMultiplier || 1;
          totalIncome += count * incomePerUnit * multiplier;
        }
      }
    });

    return totalIncome;
  }

  updateStatsUI() {
    if (this.uiManager) {
      this.uiManager.updateStats();
      this.uiManager.refreshAllCosts();
    }
  }

  handleTick() {
    if (this.citizenManager) {
        this.citizenManager.update();
    }
    
    const income = this.calculateIncome();

    if (income > 0) {
      // Show floating text for all income-generating buildings
      Object.entries(BuildingRegistry).forEach(([type, config]) => {
        if (config.generatesIncome) {
          const buildingIncome = this.getBuildingIncome(type);

          this.gridManager.getTilesByType(type).forEach((tile) => {
            this.showFloatingText(
              `+${ASSETS.metadata.currency}${buildingIncome}`,
              tile.x,
              tile.y,
            );
            tile.playIncomeAnimation();
          });
        }
      });

      this.updateMoney(income);
      this.saveGame();
    }
  }

  updateMoney(amount) {
    this.money += amount;
    this.updateStatsUI();
  }

  updateHappiness(amount) {
    this.happiness += amount;
    this.updateStatsUI();
  }

  updatePopulation(amount) {
    this.population += amount;
    if (this.citizenManager) {
        this.citizenManager.syncWithPopulation(this.population);
    }
    this.updateStatsUI();
  }

  showFloatingText(text, x, y) {
    const floatText = this.add
      .text(x, y - 20, text, {
        fontFamily: '"Press Start 2P"',
        fontSize: "20px",
        fill: text.includes("+") ? "#00ff00" : "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.gridManager.container.add(floatText);

    this.tweens.add({
      targets: floatText,
      y: floatText.y - 100,
      x: floatText.x + (Math.random() - 0.5) * 50,
      alpha: 0,
      duration: 2000,
      onComplete: () => floatText.destroy(),
    });
  }

  updatePreviewScale() {
    const config = getBuildingConfig(this.selectedTileType);
    const targetWidth = Config.tileWidth * config.size;

    const currentWidth = this.previewTile.width;
    if (currentWidth > 0) {
      const baseScale = targetWidth / currentWidth;
      this.previewTile.setScale(
        this.previewTile.isFlipped ? -baseScale : baseScale,
        baseScale,
      );
    }

    // Always use standard isometric anchor
    this.previewTile.setOrigin(0.5, 1);
  }

  getLocalPointerPos(pointer) {
    // Convert screen pointer to grid-container local space
    const scale = this.gridManager.container.scale;
    const x = (pointer.x - this.gridManager.container.x) / scale;
    const y = (pointer.y - this.gridManager.container.y) / scale;
    return { x, y };
  }

  getScreenPosFromGrid(row, col) {
    // Convert grid position to screen position
    const worldPos = IsoUtils.gridToWorld(row, col);
    const scale = this.gridManager.container.scale;
    return {
      x: worldPos.x * scale + this.gridManager.container.x,
      y: worldPos.y * scale + this.gridManager.container.y,
    };
  }

  startPendingPlacement(row, col, pointer) {
    this.pendingPlacement = { row, col };

    // Show preview at position
    const config = getBuildingConfig(this.selectedTileType);
    const originWorldPos = IsoUtils.gridToWorld(row, col);
    const offsetToBottom =
      Config.tileHeight / 2 + (config.size - 1) * Config.tileHeight;
    this.previewTile.setPosition(
      originWorldPos.x,
      originWorldPos.y + offsetToBottom,
    );
    this.previewTile.gridRow = row;
    this.previewTile.gridCol = col;
    this.previewTile.setVisible(true);
    this.previewTile.depth = 9999;

    // Show cell highlight
    const centerOffset = Math.floor((config.size - 1) / 2);
    const centerWorldPos = IsoUtils.gridToWorld(
      row + centerOffset,
      col + centerOffset,
    );
    this.cellHighlight.setPosition(
      centerWorldPos.x,
      centerWorldPos.y - Config.tileHeight / 2,
    );
    // cellHighlight disabled
    this.cellHighlight.depth = 10000;

    // Show confirm/cancel buttons
    const screenPos = this.getScreenPosFromGrid(row, col);
    this.uiManager.showPlacementConfirm(screenPos.x, screenPos.y);
  }

  confirmPlacement() {
    if (!this.pendingPlacement) return;

    const { row, col } = this.pendingPlacement;
    this.gridManager.placeTile(row, col, this.selectedTileType);
    this.playBuildSound();

    this.pendingPlacement = null;
    this.previewTile.setVisible(false);
    this.cellHighlight.setVisible(false);
    this.uiManager.hidePlacementConfirm();
  }

  cancelPlacement() {
    this.pendingPlacement = null;
    this.previewTile.setVisible(false);
    this.cellHighlight.setVisible(false);
    this.uiManager.hidePlacementConfirm();
  }
}
