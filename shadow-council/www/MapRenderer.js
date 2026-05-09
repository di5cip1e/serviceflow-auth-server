import { BIOMES } from './config.js';
import { SpriteAtlas } from './SpriteAtlas.js';

export class MapRenderer {
  constructor(canvas, world, nations, worldManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = world;
    this.nations = nations;
    this.worldManager = worldManager;
    
    // Camera/viewport
    this.cameraX = 0;
    this.cameraY = 0;
    this.zoom = 1;
    this.targetZoom = 1;
    
    // Tile rendering
    this.tileSize = 8; // Base size in pixels
    
    // Interaction
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.hoveredTile = null;
    
    // Sprite atlas for visual assets
    this.spriteAtlas = new SpriteAtlas();
    this.spritesLoaded = false;
    
    // Load sprites asynchronously
    this.loadSprites();
    
    this.setupControls();
    this.resizeCanvas();
    
    // Center camera on player capital if exists
    this.centerOnPlayerCapital();
  }
  
  async loadSprites() {
    try {
      await this.spriteAtlas.load();
      this.spritesLoaded = true;
      console.log('✓ Map renderer ready with sprite assets');
    } catch (error) {
      console.warn('⚠ Sprites failed to load, using fallback rendering:', error);
      this.spritesLoaded = false;
    }
  }
  
  setupControls() {
    // Mouse drag
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        
        this.cameraX -= dx / this.zoom;
        this.cameraY -= dy / this.zoom;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
      
      // Update hovered tile
      this.updateHoveredTile(e.clientX, e.clientY);
    });
    
    this.canvas.addEventListener('mouseup', (e) => {
      if (!this.isDragging) {
        // Click without drag - check for nation selection
        this.handleMapClick(e.clientX, e.clientY);
      }
      this.isDragging = false;
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
      this.hoveredTile = null;
    });
    
    // Mouse wheel zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.targetZoom *= delta;
      this.targetZoom = Math.max(0.3, Math.min(3, this.targetZoom));
    });
    
    // Touch support
    let touchStartDistance = 0;
    
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        touchStartDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      
      if (e.touches.length === 1 && this.isDragging) {
        const dx = e.touches[0].clientX - this.lastMouseX;
        const dy = e.touches[0].clientY - this.lastMouseY;
        
        this.cameraX -= dx / this.zoom;
        this.cameraY -= dy / this.zoom;
        
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        
        const scale = currentDistance / touchStartDistance;
        this.targetZoom *= scale;
        this.targetZoom = Math.max(0.3, Math.min(3, this.targetZoom));
        touchStartDistance = currentDistance;
      }
    });
    
    this.canvas.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  centerOnPlayerCapital() {
    // Find player nation (id 0)
    const playerNation = this.nations.find(n => n.id === 0);
    if (playerNation) {
      const capital = playerNation.getCapital();
      if (capital) {
        this.cameraX = capital.x * this.tileSize - this.canvas.width / 2;
        this.cameraY = capital.y * this.tileSize - this.canvas.height / 2;
      }
    }
  }
  
  updateHoveredTile(mouseX, mouseY) {
    const worldX = (mouseX / this.zoom) + this.cameraX;
    const worldY = (mouseY / this.zoom) + this.cameraY;
    
    const tileX = Math.floor(worldX / this.tileSize);
    const tileY = Math.floor(worldY / this.tileSize);
    
    const tile = this.world.getTile(tileX, tileY);
    this.hoveredTile = tile;
  }
  
  render() {
    // Smooth zoom
    this.zoom += (this.targetZoom - this.zoom) * 0.1;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.save();
    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.translate(-this.cameraX, -this.cameraY);
    
    // Calculate visible tile range
    const startX = Math.floor(this.cameraX / this.tileSize);
    const startY = Math.floor(this.cameraY / this.tileSize);
    const endX = Math.ceil((this.cameraX + this.canvas.width / this.zoom) / this.tileSize);
    const endY = Math.ceil((this.cameraY + this.canvas.height / this.zoom) / this.tileSize);
    
    // Render tiles
    for (let y = Math.max(0, startY); y < Math.min(this.world.height, endY); y++) {
      for (let x = Math.max(0, startX); x < Math.min(this.world.width, endX); x++) {
        this.renderTile(x, y);
      }
    }
    
    // Render influence borders
    this.renderInfluenceBorders(startX, startY, endX, endY);
    
    // Render cities
    this.nations.forEach(nation => {
      nation.cities.forEach(city => {
        this.renderCity(city, nation);
      });
    });
    
    // Render roads
    this.nations.forEach(nation => {
      if (nation.roads && nation.roads.length > 0) {
        this.renderRoads(nation);
      }
    });
    
    // Render fortresses
    this.renderFortresses(startX, startY, endX, endY);
    
    // Render armies
    this.renderArmies(startX, startY, endX, endY);
    
    // Render sieges
    this.renderSieges(startX, startY, endX, endY);
    
    this.ctx.restore();
    
    // Render UI overlay (not affected by zoom/pan)
    this.renderUI();
  }
  
  renderTile(x, y) {
    const tile = this.world.tiles[y][x];
    const biome = BIOMES[tile.biome];
    
    const tileX = x * this.tileSize;
    const tileY = y * this.tileSize;
    
    // Use sprite if loaded, otherwise fallback to color
    if (this.spritesLoaded && this.spriteAtlas.isReady()) {
      // Draw terrain sprite
      this.spriteAtlas.drawTerrain(this.ctx, tile.biome, tileX, tileY, this.tileSize);
      
      // Add subtle nation color tint if influenced
      if (tile.nationId !== null && tile.influence > 0.3) {
        const nation = this.nations.find(n => n.id === tile.nationId);
        if (nation) {
          this.ctx.fillStyle = nation.color;
          this.ctx.globalAlpha = tile.influence * 0.2; // Subtle tint
          this.ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
          this.ctx.globalAlpha = 1.0;
        }
      }
    } else {
      // Fallback to solid color rendering
      let color = biome.color;
      
      // Tint with nation color if influenced
      if (tile.nationId !== null && tile.influence > 0) {
        const nation = this.nations.find(n => n.id === tile.nationId);
        if (nation) {
          color = this.blendColors(biome.color, nation.color, tile.influence * 0.4);
        }
      }
      
      this.ctx.fillStyle = color;
      this.ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
    }
    
    // Highlight hovered tile
    if (this.hoveredTile && this.hoveredTile.x === x && this.hoveredTile.y === y) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.lineWidth = 2 / this.zoom;
      this.ctx.strokeRect(tileX, tileY, this.tileSize, this.tileSize);
    }
  }
  
  renderInfluenceBorders(startX, startY, endX, endY) {
    this.ctx.lineWidth = 2 / this.zoom;
    
    for (let y = Math.max(0, startY); y < Math.min(this.world.height, endY); y++) {
      for (let x = Math.max(0, startX); x < Math.min(this.world.width, endX); x++) {
        const tile = this.world.tiles[y][x];
        
        if (tile.nationId !== null) {
          const nation = this.nations.find(n => n.id === tile.nationId);
          if (!nation) continue;
          
          // Check neighbors for border
          const neighbors = this.world.getNeighbors(x, y);
          const hasBorder = neighbors.some(n => n.nationId !== tile.nationId);
          
          if (hasBorder) {
            this.ctx.strokeStyle = nation.color;
            this.ctx.strokeRect(
              x * this.tileSize,
              y * this.tileSize,
              this.tileSize,
              this.tileSize
            );
          }
        }
      }
    }
  }
  
  renderCity(city, nation) {
    const x = city.x * this.tileSize + this.tileSize / 2;
    const y = city.y * this.tileSize + this.tileSize / 2;
    
    const visualSize = city.getVisualSize();
    
    // Use sprite if loaded, otherwise fallback to circle
    if (this.spritesLoaded && this.spriteAtlas.isReady()) {
      // Calculate sprite scale based on zoom and visual size
      const baseScale = (this.tileSize / 120) * visualSize; // 120 is base sprite size
      this.spriteAtlas.drawCity(this.ctx, city.population, x, y, baseScale);
      
      // Add nation color tint
      if (this.zoom > 0.5) {
        this.ctx.fillStyle = nation.color;
        this.ctx.globalAlpha = 0.15;
        const tintSize = 60 * baseScale;
        this.ctx.beginPath();
        this.ctx.arc(x, y, tintSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
      }
      
      // Capital star overlay
      if (city.isCapital && this.zoom > 0.6) {
        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1.5 / this.zoom;
        this.ctx.beginPath();
        const starRadius = (this.tileSize * visualSize * 0.4);
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const px = x + Math.cos(angle) * starRadius;
          const py = y + Math.sin(angle) * starRadius;
          if (i === 0) this.ctx.moveTo(px, py);
          else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
      }
    } else {
      // Fallback to circle rendering
      const radius = (this.tileSize * 0.8 * visualSize) / 2;
      
      // City circle with gradient
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, this.lightenColor(nation.color, 20));
      gradient.addColorStop(1, nation.color);
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Border
      this.ctx.strokeStyle = '#1a1a1a';
      this.ctx.lineWidth = 2 / this.zoom;
      this.ctx.stroke();
      
      // Glow effect for larger cities
      if (city.population > 15000) {
        this.ctx.strokeStyle = this.lightenColor(nation.color, 40);
        this.ctx.lineWidth = 1 / this.zoom;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius + 2 / this.zoom, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      
      // Capital star
      if (city.isCapital) {
        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1 / this.zoom;
        this.ctx.beginPath();
        const starRadius = radius * 0.5;
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const px = x + Math.cos(angle) * starRadius;
          const py = y + Math.sin(angle) * starRadius;
          if (i === 0) this.ctx.moveTo(px, py);
          else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
      }
    }
    
    // City name and population (only at higher zoom)
    if (this.zoom > 1) {
      // Calculate approximate radius for text positioning
      const textRadius = (this.tileSize * 0.8 * visualSize) / 2;
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 3 / this.zoom;
      this.ctx.font = `${12 / this.zoom}px 'Cinzel', serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      
      const textY = y + textRadius + 2 / this.zoom;
      this.ctx.strokeText(city.name, x, textY);
      this.ctx.fillText(city.name, x, textY);
      
      // Show population at very high zoom
      if (this.zoom > 1.5) {
        this.ctx.font = `${9 / this.zoom}px 'Crimson Pro', serif`;
        this.ctx.fillStyle = '#b4a088';
        const popText = `${Math.floor(city.population / 1000)}k`;
        const popY = textY + 14 / this.zoom;
        this.ctx.strokeText(popText, x, popY);
        this.ctx.fillText(popText, x, popY);
      }
    }
  }
  
  renderUI() {
    // Legend
    const legendX = 10;
    const legendY = 10;
    
    this.ctx.fillStyle = 'rgba(20, 15, 25, 0.9)';
    this.ctx.fillRect(legendX, legendY, 200, 150);
    
    this.ctx.strokeStyle = 'rgba(180, 140, 80, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(legendX, legendY, 200, 150);
    
    this.ctx.fillStyle = '#d4c5a9';
    this.ctx.font = '14px "Cinzel", serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Nations', legendX + 10, legendY + 20);
    
    // List nations
    let yOffset = legendY + 40;
    this.nations.slice(0, 5).forEach(nation => {
      // Color square
      this.ctx.fillStyle = nation.color;
      this.ctx.fillRect(legendX + 10, yOffset - 10, 15, 15);
      
      // Name
      this.ctx.fillStyle = '#d4c5a9';
      this.ctx.font = '12px "Crimson Pro", serif';
      const displayName = nation.name.length > 15 ? nation.name.substring(0, 15) + '...' : nation.name;
      this.ctx.fillText(displayName, legendX + 30, yOffset);
      
      yOffset += 20;
    });
    
    // Hovered tile info
    if (this.hoveredTile) {
      const infoX = this.canvas.width - 210;
      const infoY = 10;
      
      this.ctx.fillStyle = 'rgba(20, 15, 25, 0.9)';
      this.ctx.fillRect(infoX, infoY, 200, 100);
      
      this.ctx.strokeStyle = 'rgba(180, 140, 80, 0.6)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(infoX, infoY, 200, 100);
      
      this.ctx.fillStyle = '#d4c5a9';
      this.ctx.font = '12px "Crimson Pro", serif';
      this.ctx.textAlign = 'left';
      
      const biome = BIOMES[this.hoveredTile.biome];
      this.ctx.fillText(`Biome: ${biome.name}`, infoX + 10, infoY + 20);
      this.ctx.fillText(`Position: ${this.hoveredTile.x}, ${this.hoveredTile.y}`, infoX + 10, infoY + 40);
      
      if (this.hoveredTile.nationId !== null) {
        const nation = this.nations.find(n => n.id === this.hoveredTile.nationId);
        if (nation) {
          this.ctx.fillText(`Owner: ${nation.name}`, infoX + 10, infoY + 60);
          this.ctx.fillText(`Influence: ${Math.round(this.hoveredTile.influence * 100)}%`, infoX + 10, infoY + 80);
        }
      }
    }
    
    // Controls hint
    this.ctx.fillStyle = 'rgba(20, 15, 25, 0.9)';
    this.ctx.fillRect(10, this.canvas.height - 50, 250, 40);
    
    this.ctx.strokeStyle = 'rgba(180, 140, 80, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(10, this.canvas.height - 50, 250, 40);
    
    this.ctx.fillStyle = '#a89070';
    this.ctx.font = '11px "Crimson Pro", serif';
    this.ctx.fillText('Drag to pan • Scroll to zoom', 20, this.canvas.height - 28);
  }
  
  blendColors(color1, color2, alpha) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    const r = Math.round(c1.r * (1 - alpha) + c2.r * alpha);
    const g = Math.round(c1.g * (1 - alpha) + c2.g * alpha);
    const b = Math.round(c1.b * (1 - alpha) + c2.b * alpha);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
  
  lightenColor(color, percent) {
    const rgb = this.hexToRgb(color);
    const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * (percent / 100)));
    const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * (percent / 100)));
    const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * (percent / 100)));
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  handleMapClick(mouseX, mouseY) {
    const worldX = (mouseX / this.zoom) + this.cameraX;
    const worldY = (mouseY / this.zoom) + this.cameraY;
    
    const tileX = Math.floor(worldX / this.tileSize);
    const tileY = Math.floor(worldY / this.tileSize);
    
    const tile = this.world.getTile(tileX, tileY);
    
    if (tile && tile.nationId !== null && tile.nationId !== 0) {
      // Clicked on a rival nation - open diplomacy
      if (this.worldManager && this.worldManager.counselManager) {
        this.worldManager.counselManager.openDiplomacy(tile.nationId);
        console.log(`Opening diplomacy with nation ${tile.nationId}`);
      }
    }
  }
  
  renderRoads(nation) {
    if (!nation.roads || nation.roads.length === 0) return;
    
    this.ctx.strokeStyle = 'rgba(200, 180, 140, 0.5)';
    this.ctx.lineWidth = 3 / this.zoom;
    this.ctx.setLineDash([8 / this.zoom, 4 / this.zoom]);
    
    nation.roads.forEach(road => {
      const fromCity = nation.cities.find(c => c.id === road.from);
      const toCity = nation.cities.find(c => c.id === road.to);
      
      if (fromCity && toCity) {
        const x1 = fromCity.x * this.tileSize + this.tileSize / 2;
        const y1 = fromCity.y * this.tileSize + this.tileSize / 2;
        const x2 = toCity.x * this.tileSize + this.tileSize / 2;
        const y2 = toCity.y * this.tileSize + this.tileSize / 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      }
    });
    
    this.ctx.setLineDash([]); // Reset line dash
  }
  
  renderFortresses(startX, startY, endX, endY) {
    for (let y = Math.max(0, startY); y < Math.min(this.world.height, endY); y++) {
      for (let x = Math.max(0, startX); x < Math.min(this.world.width, endX); x++) {
        const tile = this.world.tiles[y][x];
        
        if (tile.hasFortress) {
          const centerX = x * this.tileSize + this.tileSize / 2;
          const centerY = y * this.tileSize + this.tileSize / 2;
          
          // Find nation that owns this fortress
          const nation = this.nations.find(n => n.id === tile.nationId);
          const color = nation ? nation.color : '#808080';
          
          // Use sprite if loaded, otherwise fallback to geometric shapes
          if (this.spritesLoaded && this.spriteAtlas.isReady() && this.zoom > 0.5) {
            const scale = this.tileSize / 140; // 140 is fortress sprite base size
            this.spriteAtlas.drawFortress(this.ctx, centerX, centerY, scale);
            
            // Add nation color tint
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = 0.25;
            const tintSize = 70 * scale;
            this.ctx.fillRect(
              centerX - tintSize / 2,
              centerY - tintSize / 2,
              tintSize,
              tintSize
            );
            this.ctx.globalAlpha = 1.0;
          } else {
            // Fallback to geometric rendering
            const size = this.tileSize * 0.4;
            
            // Draw fortress as a square with towers
            this.ctx.fillStyle = this.lightenColor(color, 10);
            this.ctx.strokeStyle = '#1a1a1a';
            this.ctx.lineWidth = 2 / this.zoom;
            
            // Main fortress body
            this.ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
            this.ctx.strokeRect(centerX - size / 2, centerY - size / 2, size, size);
            
            // Corner towers
            const towerSize = size * 0.3;
            const positions = [
              { x: centerX - size / 2, y: centerY - size / 2 }, // Top-left
              { x: centerX + size / 2 - towerSize, y: centerY - size / 2 }, // Top-right
              { x: centerX - size / 2, y: centerY + size / 2 - towerSize }, // Bottom-left
              { x: centerX + size / 2 - towerSize, y: centerY + size / 2 - towerSize } // Bottom-right
            ];
            
            this.ctx.fillStyle = color;
            positions.forEach(pos => {
              this.ctx.fillRect(pos.x, pos.y, towerSize, towerSize);
              this.ctx.strokeRect(pos.x, pos.y, towerSize, towerSize);
            });
            
            // Fortress icon (shield) in center
            if (this.zoom > 0.8) {
              this.ctx.fillStyle = '#1a1a1a';
              this.ctx.font = `${10 / this.zoom}px Arial`;
              this.ctx.textAlign = 'center';
              this.ctx.textBaseline = 'middle';
              this.ctx.fillText('🛡', centerX, centerY);
            }
          }
        }
      }
    }
  }
  
  renderArmies(startX, startY, endX, endY) {
    if (!this.worldManager.armyManager) return;
    
    const armies = Array.from(this.worldManager.armyManager.armies.values());
    
    armies.forEach(army => {
      const armyX = Math.floor(army.x);
      const armyY = Math.floor(army.y);
      
      // Only render if in visible area
      if (armyX < startX || armyX >= endX || armyY < startY || armyY >= endY) {
        return;
      }
      
      const centerX = army.x * this.tileSize + this.tileSize / 2;
      const centerY = army.y * this.tileSize + this.tileSize / 2;
      
      // Find nation
      const nation = this.nations.find(n => n.id === army.nationId);
      const color = nation ? nation.color : '#808080';
      
      // Army size based on unit count
      const totalUnits = army.getTotalUnits();
      const baseSize = this.tileSize * 0.5;
      const sizeMultiplier = 1 + Math.log10(Math.max(1, totalUnits / 10)) * 0.3;
      const size = baseSize * sizeMultiplier;
      
      // Draw army banner
      this.ctx.save();
      
      // Shadow
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      this.ctx.shadowBlur = 4 / this.zoom;
      this.ctx.shadowOffsetX = 2 / this.zoom;
      this.ctx.shadowOffsetY = 2 / this.zoom;
      
      // Army flag/banner
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY - size);
      this.ctx.lineTo(centerX + size * 0.6, centerY - size * 0.7);
      this.ctx.lineTo(centerX + size * 0.6, centerY - size * 0.3);
      this.ctx.lineTo(centerX, centerY - size * 0.5);
      this.ctx.closePath();
      this.ctx.fill();
      
      // Flag pole
      this.ctx.strokeStyle = '#3a2a1a';
      this.ctx.lineWidth = 2 / this.zoom;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY + size * 0.3);
      this.ctx.lineTo(centerX, centerY - size);
      this.ctx.stroke();
      
      this.ctx.restore();
      
      // Army icon at base
      this.ctx.fillStyle = this.lightenColor(color, 20);
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, size * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.strokeStyle = '#1a1a1a';
      this.ctx.lineWidth = 2 / this.zoom;
      this.ctx.stroke();
      
      // Army icon (crossed swords)
      if (this.zoom > 0.6) {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.font = `${Math.floor(12 / this.zoom)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⚔', centerX, centerY);
      }
      
      // Unit count badge
      if (this.zoom > 0.8 && totalUnits > 0) {
        const badgeX = centerX + size * 0.4;
        const badgeY = centerY - size * 0.4;
        const badgeRadius = size * 0.25;
        
        // Badge background
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.beginPath();
        this.ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 1.5 / this.zoom;
        this.ctx.stroke();
        
        // Unit count
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = `bold ${Math.floor(10 / this.zoom)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(totalUnits, badgeX, badgeY);
      }
      
      // Movement indicator (if moving)
      if (army.isMoving && army.targetX !== null && this.zoom > 0.7) {
        const targetX = army.targetX * this.tileSize + this.tileSize / 2;
        const targetY = army.targetY * this.tileSize + this.tileSize / 2;
        
        // Draw arrow to target
        this.ctx.strokeStyle = color;
        this.ctx.setLineDash([4 / this.zoom, 4 / this.zoom]);
        this.ctx.lineWidth = 2 / this.zoom;
        this.ctx.globalAlpha = 0.6;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(targetX, targetY);
        this.ctx.stroke();
        
        // Arrowhead
        const angle = Math.atan2(targetY - centerY, targetX - centerX);
        const arrowSize = size * 0.3;
        
        this.ctx.beginPath();
        this.ctx.moveTo(targetX, targetY);
        this.ctx.lineTo(
          targetX - arrowSize * Math.cos(angle - Math.PI / 6),
          targetY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
          targetX - arrowSize * Math.cos(angle + Math.PI / 6),
          targetY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        this.ctx.setLineDash([]);
        this.ctx.globalAlpha = 1.0;
      }
    });
  }
  
  renderSieges(startX, startY, endX, endY) {
    if (!this.worldManager.conquestSystem) return;
    
    const sieges = Array.from(this.worldManager.conquestSystem.sieges.values());
    
    sieges.forEach(siege => {
      // Find the city being sieged
      const city = this.worldManager.conquestSystem.findCity(siege.cityId);
      if (!city) return;
      
      // Only render if city in visible area
      if (city.x < startX || city.x >= endX || city.y < startY || city.y >= endY) {
        return;
      }
      
      const centerX = city.x * this.tileSize + this.tileSize / 2;
      const centerY = city.y * this.tileSize + this.tileSize / 2;
      const radius = this.tileSize * 2;
      
      // Draw siege indicator ring
      this.ctx.save();
      
      // Pulsing red ring
      const pulsePhase = (Date.now() / 1000) % 1;
      const pulseAlpha = 0.3 + Math.sin(pulsePhase * Math.PI * 2) * 0.2;
      
      this.ctx.strokeStyle = `rgba(220, 20, 60, ${pulseAlpha})`;
      this.ctx.lineWidth = 3 / this.zoom;
      this.ctx.setLineDash([6 / this.zoom, 6 / this.zoom]);
      
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Progress arc
      const progressAngle = (siege.progress / 100) * Math.PI * 2;
      this.ctx.strokeStyle = 'rgba(220, 20, 60, 0.8)';
      this.ctx.lineWidth = 5 / this.zoom;
      this.ctx.setLineDash([]);
      
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius + 2 / this.zoom, -Math.PI / 2, -Math.PI / 2 + progressAngle);
      this.ctx.stroke();
      
      this.ctx.restore();
      
      // Siege icon and progress text
      if (this.zoom > 0.7) {
        // Siege text
        this.ctx.fillStyle = '#dc143c';
        this.ctx.font = `bold ${Math.floor(10 / this.zoom)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const progressText = `⏳ ${Math.floor(siege.progress)}%`;
        this.ctx.fillText(progressText, centerX, centerY - radius - 10 / this.zoom);
      }
    });
  }
}
