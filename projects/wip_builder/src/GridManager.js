import { Config } from "./Config.js";
import { IsoUtils } from "./IsoUtils.js";
import { Tile } from "./Tile.js";
import { getBuildingConfig } from "./BuildingRegistry.js";

export class GridManager {
  constructor(scene) {
    this.scene = scene;
    this.grid = [];
    this.container = scene.add.container(Config.width / 2, 200);

    this.createGrid();
    
    this.heatmapEnabled = false;
    this.heatmapGraphics = scene.add.graphics();
    this.container.add(this.heatmapGraphics);
  }

  toggleHeatmap(enabled) {
    this.heatmapEnabled = enabled;
    if (!enabled) {
      this.heatmapGraphics.clear();
    } else {
      this.updateHeatmap();
    }
  }

  updateHeatmap() {
    if (!this.heatmapEnabled) return;
    this.heatmapGraphics.clear();

    const policeStations = [];
    const criminals = this.scene.citizenManager.getCriminals();

    // Collect police stations
    for (let r = 0; r < this.currentGridSize; r++) {
      for (let c = 0; c < this.currentGridSize; c++) {
        const tile = this.grid[r][c];
        const config = getBuildingConfig(tile.buildingType);
        if (config.safetyRadius) {
          policeStations.push({ row: r, col: c, radius: config.safetyRadius });
        }
      }
    }

    for (let r = 0; r < this.currentGridSize; r++) {
      for (let c = 0; c < this.currentGridSize; c++) {
        let safetyScore = 0.5; // Neutral

        // Safety from police
        policeStations.forEach(ps => {
          const dist = Phaser.Math.Distance.Between(r, c, ps.row, ps.col);
          if (dist < ps.radius) {
            safetyScore += (1 - dist / ps.radius) * 0.5;
          }
        });

        // Danger from criminals
        criminals.forEach(crim => {
          const v = crim.visual;
          if (!v) return;
          const dist = Phaser.Math.Distance.Between(r, c, v.gridRow, v.gridCol);
          const crimeRadius = 4;
          if (dist < crimeRadius) {
            const risk = CITIZEN_TYPES[crim.type].crimeRisk;
            safetyScore -= (1 - dist / crimeRadius) * risk;
          }
        });

        safetyScore = Phaser.Math.Clamp(safetyScore, 0, 1);

        // Color interpolation: Red (0,1) -> Green (1,1)
        // Red is 0xff0000, Green is 0x00ff00
        const rVal = Math.floor(255 * (1 - safetyScore));
        const gVal = Math.floor(255 * safetyScore);
        const color = Phaser.Display.Color.GetColor(rVal, gVal, 0);

        const worldPos = IsoUtils.gridToWorld(r, c);
        this.heatmapGraphics.fillStyle(color, 0.4);
        this.heatmapGraphics.beginPath();
        this.heatmapGraphics.moveTo(worldPos.x, worldPos.y - Config.tileHeight / 2);
        this.heatmapGraphics.lineTo(worldPos.x + Config.tileWidth / 2, worldPos.y);
        this.heatmapGraphics.lineTo(worldPos.x, worldPos.y + Config.tileHeight / 2);
        this.heatmapGraphics.lineTo(worldPos.x - Config.tileWidth / 2, worldPos.y);
        this.heatmapGraphics.closePath();
        this.heatmapGraphics.fillPath();
      }
    }
    
    this.heatmapGraphics.setDepth(10001); // Ensure it's on top of tiles but below highlights
  }

  createGrid(size = Config.gridSize) {
    this.clearTiles();
    this.currentGridSize = size;
    this.grid = [];

    for (let row = 0; row < size; row++) {
      this.grid[row] = [];
      for (let col = 0; col < size; col++) {
        this.grid[row][col] = this.createTile(row, col, "grass");
      }
    }
  }

  loadGrid(savedData) {
    this.clearTiles();
    this.currentGridSize = savedData.length;
    this.grid = [];

    for (let row = 0; row < this.currentGridSize; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.currentGridSize; col++) {
        const data = savedData[row][col];
        const tile = this.createTile(row, col, data.type);
        tile.masterTile = data.masterTile || null;
        tile.isMaster = data.isMaster || false;
        if (data.flipped) tile.setFlip(true);
        if (tile.masterTile && !tile.isMaster) tile.setVisible(false);
        this.grid[row][col] = tile;
      }
    }
  }

  expandGrid(amount) {
    const savedData = this.getGridData();
    const newSize = this.currentGridSize + amount;

    this.clearTiles();
    this.currentGridSize = newSize;
    this.grid = [];

    for (let row = 0; row < newSize; row++) {
      this.grid[row] = [];
      for (let col = 0; col < newSize; col++) {
        const existing = savedData[row]?.[col];
        if (existing) {
          const tile = this.createTile(row, col, existing.type);
          tile.masterTile = existing.masterTile || null;
          tile.isMaster = existing.isMaster || false;
          if (existing.flipped) tile.setFlip(true);
          if (tile.masterTile && !tile.isMaster) tile.setVisible(false);
          this.grid[row][col] = tile;
        } else {
          this.grid[row][col] = this.createTile(row, col, "grass");
        }
      }
    }
    this.updateDepths();
  }

  createTile(row, col, type) {
    const worldPos = IsoUtils.gridToWorld(row, col);
    const tile = new Tile(this.scene, worldPos.x, worldPos.y, type, row, col);
    this.container.add(tile);
    return tile;
  }

  clearTiles() {
    const toDestroy = this.container.list.filter(
      (child) => !child.isPreview && !child.isHighlight,
    );
    toDestroy.forEach((child) => child.destroy());
  }

  getGridData() {
    const data = [];
    for (let row = 0; row < this.currentGridSize; row++) {
      data[row] = [];
      for (let col = 0; col < this.currentGridSize; col++) {
        const tile = this.grid[row][col];
        data[row][col] = {
          type: tile.buildingType,
          flipped: tile.isFlipped,
          masterTile: tile.masterTile,
          isMaster: tile.isMaster,
        };
      }
    }
    return data;
  }

  placeTile(row, col, type) {
    if (!this.isValidCoord(row, col)) return;

    const config = getBuildingConfig(type);
    const multiTile = config.size > 1;
    const size = config.size;

    // Check if area is available
    if (multiTile) {
      for (let checkRow = row; checkRow < row + size; checkRow++) {
        for (let checkCol = col; checkCol < col + size; checkCol++) {
          if (!this.isValidCoord(checkRow, checkCol)) {
            this.scene.showFloatingText(
              "SPACE BLOCKED",
              this.grid[row][col].x,
              this.grid[row][col].y,
            );
            return;
          }

          const tile = this.grid[checkRow][checkCol];
          // Check if occupied (non-grass or part of a structure)
          if (tile.buildingType !== "grass" || tile.masterTile) {
            this.scene.showFloatingText(
              "SPACE BLOCKED",
              this.grid[row][col].x,
              this.grid[row][col].y,
            );
            return;
          }
        }
      }
    }

    const oldTile = this.grid[row][col];
    const oldType = oldTile.buildingType;
    const oldConfig = getBuildingConfig(oldType);

    // Prevent building over existing structures (single tile)
    if (!multiTile && type !== "grass") {
      const isOccupied = oldType !== "grass" || oldTile.masterTile;
      // Block if occupied, unless we're just rotating the same building type
      if (isOccupied && oldType !== type) {
        this.scene.showFloatingText("OCCUPIED", oldTile.x, oldTile.y);
        return;
      }
    }
    const oldFlipped = oldTile.isFlipped;
    const newFlipped = this.scene.previewTile.isFlipped;

    if (oldType === type && oldFlipped === newFlipped && !multiTile) return;

    // Calculate cost (based on how many of this type already exist)
    const cost = this.scene.getCost(type);

    // Only charge if it's a new building or a different type
    if (oldType !== type) {
      if (cost > 0 && this.scene.money < cost) {
        this.scene.showFloatingText(`NEED $${cost}`, oldTile.x, oldTile.y);
        return;
      }

      // Check requirements
      if (config.requirements) {
        if (
          config.requirements.population &&
          this.scene.population < config.requirements.population
        ) {
          this.scene.showFloatingText(
            `NEED ${config.requirements.population} 👥`,
            oldTile.x,
            oldTile.y,
          );
          return;
        }
      }

      // Deduct money
      if (cost > 0) {
        this.scene.updateMoney(-cost);
      }

      // Clean up old building if it was a multi-tile
      if (oldTile.masterTile) {
        this.clearMultiTile(oldTile.masterTile);
      } else if (oldType !== "grass") {
        // Reverse effects of old building
        if (oldConfig.effects.population)
          this.scene.updatePopulation(-oldConfig.effects.population);
        if (oldConfig.effects.happiness)
          this.scene.updateHappiness(-oldConfig.effects.happiness);
      }

      // Apply new effects
      if (config.effects.population)
        this.scene.updatePopulation(config.effects.population);
      if (config.effects.happiness)
        this.scene.updateHappiness(config.effects.happiness);
      if (config.effects.gridExpansion) {
        this.expandGrid(config.effects.gridExpansion);
      }

      if (config.floatText) {
        this.scene.showFloatingText(config.floatText, oldTile.x, oldTile.y);
      }

      if (multiTile) {
        // Set up multi-tile
        for (let tileRow = row; tileRow < row + size; tileRow++) {
          for (let tileCol = col; tileCol < col + size; tileCol++) {
            const tile = this.grid[tileRow][tileCol];
            tile.masterTile = { row, col };
            if (tileRow === row && tileCol === col) {
              tile.updateType(type);
              tile.setFlip(newFlipped);
              tile.isMaster = true;
              tile.setVisible(true);
              tile.playPlacementAnimation();
            } else {
              // Hide non-master tiles as the master tile covers this area
              tile.setVisible(false);
              tile.isMaster = false;
            }
          }
        }
      } else {
        // Single tile logic need to fetch new tile object if grid expanded
        const tile = this.grid[row][col];
        tile.updateType(type);
        tile.setFlip(newFlipped);
        tile.masterTile = null;
        tile.isMaster = false;
        tile.playPlacementAnimation();
      }
    } else {
      // Just flipping or same type
      if (!multiTile) {
        oldTile.updateType(type);
        oldTile.setFlip(newFlipped);
        oldTile.masterTile = null;
        oldTile.isMaster = false;
      }
    }

    this.updateDepths();
    this.scene.updateStatsUI();
    if (type === "policeStation" || oldType === "policeStation") {
        this.scene.citizenManager.syncPoliceOfficers();
    }
    this.scene.saveGame();
  }

  clearMultiTile(masterPos) {
    const master = this.grid[masterPos.row][masterPos.col];
    const type = master.buildingType;
    const config = getBuildingConfig(type);
    const size = config.size;

    // Reverse effects
    if (config.effects.population)
      this.scene.updatePopulation(-config.effects.population);
    if (config.effects.happiness)
      this.scene.updateHappiness(-config.effects.happiness);

    for (let row = masterPos.row; row < masterPos.row + size; row++) {
      for (let col = masterPos.col; col < masterPos.col + size; col++) {
        const tile = this.grid[row][col];
        tile.updateType("grass");
        tile.masterTile = null;
        tile.isMaster = false;
        tile.setVisible(true);
        tile.setFlip(false);
      }
    }
  }

  countTiles(type) {
    let count = 0;
    for (let row = 0; row < this.currentGridSize; row++) {
      for (let col = 0; col < this.currentGridSize; col++) {
        if (this.grid[row][col].buildingType === type) count++;
      }
    }
    return count;
  }

  getTilesByType(type) {
    const tiles = [];
    for (let row = 0; row < this.currentGridSize; row++) {
      for (let col = 0; col < this.currentGridSize; col++) {
        if (this.grid[row][col].buildingType === type)
          tiles.push(this.grid[row][col]);
      }
    }
    return tiles;
  }

  updateDepths() {
    // Sort tiles by depth (excluding UI elements)
    this.container.list.sort((a, b) => {
      if (a.isHighlight || a.isPreview) return 1;
      if (b.isHighlight || b.isPreview) return -1;

      const rowA = a.gridRow ?? 0;
      const colA = a.gridCol ?? 0;
      const rowB = b.gridRow ?? 0;
      const colB = b.gridCol ?? 0;

      let depthA = rowA + colA;
      let depthB = rowB + colB;

      const configA = getBuildingConfig(a.buildingType);
      const configB = getBuildingConfig(b.buildingType);

      if (configA.size > 1) depthA += configA.size - 1;
      if (configB.size > 1) depthB += configB.size - 1;

      if (depthA !== depthB) return depthA - depthB;
      return rowA - rowB;
    });
  }

  isValidCoord(row, col) {
    return (
      row >= 0 &&
      row < this.currentGridSize &&
      col >= 0 &&
      col < this.currentGridSize
    );
  }

  getTileAt(row, col) {
    if (this.isValidCoord(row, col)) {
      return this.grid[row][col];
    }
    return null;
  }
}
