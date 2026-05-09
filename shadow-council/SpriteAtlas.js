/**
 * SpriteAtlas - Manages spritesheet loading and sprite extraction
 * Maps individual sprites to game entities (terrain, cities, structures)
 */
export class SpriteAtlas {
  constructor() {
    this.image = null;
    this.loaded = false;
    this.sprites = {};
    
    // Sprite definitions - coordinates and dimensions in the spritesheet
    this.definitions = {
      // TERRAIN TILES (top row, left to right)
      terrain: {
        ocean: { x: 0, y: 0, width: 192, height: 192 },
        sea: { x: 192, y: 0, width: 192, height: 192 },
        desert: { x: 384, y: 0, width: 192, height: 192 },
        arctic: { x: 576, y: 0, width: 192, height: 192 },
        plains: { x: 768, y: 0, width: 192, height: 192 },
        forest: { x: 960, y: 0, width: 192, height: 192 },
        mountains: { x: 1152, y: 0, width: 192, height: 192 }
      },
      
      // CITY EVOLUTION (middle section)
      cities: {
        village: { x: 30, y: 240, width: 120, height: 120 },
        town: { x: 200, y: 220, width: 160, height: 160 },
        metropolis: { x: 400, y: 200, width: 200, height: 200 }
      },
      
      // STRUCTURES (bottom section)
      structures: {
        fortress: { x: 650, y: 240, width: 140, height: 140 },
        road_cross: { x: 820, y: 260, width: 80, height: 80 },
        road_straight: { x: 920, y: 260, width: 80, height: 80 },
        dock: { x: 1020, y: 260, width: 100, height: 80 }
      },
      
      // ENVIRONMENTAL DETAILS (scattered in bottom section)
      details: {
        palm_trees: { x: 30, y: 500, width: 80, height: 80 },
        pine_trees: { x: 400, y: 520, width: 80, height: 80 },
        rocks: { x: 850, y: 520, width: 100, height: 80 }
      }
    };
  }
  
  /**
   * Load the spritesheet image
   */
  async load() {
    return new Promise((resolve, reject) => {
      this.image = new Image();
      this.image.crossOrigin = 'anonymous';
      
      this.image.onload = () => {
        console.log('✓ Spritesheet loaded:', this.image.width, 'x', this.image.height);
        this.loaded = true;
        this.extractSprites();
        resolve();
      };
      
      this.image.onerror = (error) => {
        console.error('✗ Failed to load spritesheet:', error);
        reject(error);
      };
      
      // Load the generated spritesheet
      this.image.src = 'https://rosebud.ai/assets/strategy_game_spritesheet.png.webp?ES04';
    });
  }
  
  /**
   * Extract individual sprites into canvas elements for faster rendering
   */
  extractSprites() {
    // Extract terrain sprites
    for (const [terrainType, def] of Object.entries(this.definitions.terrain)) {
      this.sprites[`terrain_${terrainType}`] = this.extractSprite(def);
    }
    
    // Extract city sprites
    for (const [citySize, def] of Object.entries(this.definitions.cities)) {
      this.sprites[`city_${citySize}`] = this.extractSprite(def);
    }
    
    // Extract structure sprites
    for (const [structType, def] of Object.entries(this.definitions.structures)) {
      this.sprites[`structure_${structType}`] = this.extractSprite(def);
    }
    
    // Extract detail sprites
    for (const [detailType, def] of Object.entries(this.definitions.details)) {
      this.sprites[`detail_${detailType}`] = this.extractSprite(def);
    }
    
    console.log(`✓ Extracted ${Object.keys(this.sprites).length} sprites from atlas`);
  }
  
  /**
   * Extract a single sprite region into a canvas
   */
  extractSprite(definition) {
    const canvas = document.createElement('canvas');
    canvas.width = definition.width;
    canvas.height = definition.height;
    const ctx = canvas.getContext('2d');
    
    // Draw the sprite region from the main image
    ctx.drawImage(
      this.image,
      definition.x, definition.y, definition.width, definition.height,
      0, 0, definition.width, definition.height
    );
    
    return canvas;
  }
  
  /**
   * Get sprite by category and type
   */
  getSprite(category, type) {
    const key = `${category}_${type}`;
    return this.sprites[key] || null;
  }
  
  /**
   * Get terrain sprite by biome name
   */
  getTerrainSprite(biomeName) {
    // Map biome names to sprite keys
    const biomeMap = {
      'ocean': 'ocean',
      'desert': 'desert',
      'arctic': 'arctic',
      'plains': 'plains',
      'forest': 'forest',
      'mountains': 'mountains'
    };
    
    const spriteKey = biomeMap[biomeName] || 'plains';
    return this.getSprite('terrain', spriteKey);
  }
  
  /**
   * Get city sprite by population size
   */
  getCitySprite(population) {
    if (population < 15000) {
      return this.getSprite('city', 'village');
    } else if (population < 40000) {
      return this.getSprite('city', 'town');
    } else {
      return this.getSprite('city', 'metropolis');
    }
  }
  
  /**
   * Get structure sprite
   */
  getStructureSprite(structureType) {
    return this.getSprite('structure', structureType);
  }
  
  /**
   * Get environmental detail sprite
   */
  getDetailSprite(detailType) {
    return this.getSprite('detail', detailType);
  }
  
  /**
   * Draw a sprite to a context with optional scaling and positioning
   */
  drawSprite(ctx, sprite, x, y, width, height) {
    if (!sprite) return;
    
    // Center the sprite
    const drawX = x - width / 2;
    const drawY = y - height / 2;
    
    ctx.drawImage(sprite, drawX, drawY, width, height);
  }
  
  /**
   * Draw a terrain tile sprite
   */
  drawTerrain(ctx, biomeName, x, y, tileSize) {
    const sprite = this.getTerrainSprite(biomeName);
    if (sprite) {
      ctx.drawImage(sprite, x, y, tileSize, tileSize);
    }
  }
  
  /**
   * Draw a city sprite centered on coordinates
   */
  drawCity(ctx, population, x, y, scale = 1.0) {
    const sprite = this.getCitySprite(population);
    if (sprite) {
      // City sprites are larger and centered
      const width = sprite.width * scale;
      const height = sprite.height * scale;
      this.drawSprite(ctx, sprite, x, y, width, height);
    }
  }
  
  /**
   * Draw a fortress sprite
   */
  drawFortress(ctx, x, y, scale = 1.0) {
    const sprite = this.getStructureSprite('fortress');
    if (sprite) {
      const width = sprite.width * scale;
      const height = sprite.height * scale;
      this.drawSprite(ctx, sprite, x, y, width, height);
    }
  }
  
  /**
   * Check if atlas is ready
   */
  isReady() {
    return this.loaded && Object.keys(this.sprites).length > 0;
  }
}
