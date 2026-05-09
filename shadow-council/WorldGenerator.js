import { WORLD_CONFIG, BIOMES } from './config.js';

export class WorldGenerator {
  constructor(width = WORLD_CONFIG.mapWidth, height = WORLD_CONFIG.mapHeight) {
    this.width = width;
    this.height = height;
    this.tiles = [];
    this.seed = Math.random() * 10000;
  }
  
  generate() {
    console.log('Generating world map...');
    
    // Initialize empty map
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push({
          x,
          y,
          biome: 'plains',
          elevation: 0,
          temperature: 0,
          moisture: 0,
          nationId: null,
          influence: 0,
          cityId: null
        });
      }
      this.tiles.push(row);
    }
    
    // Generate terrain using noise
    this.generateElevation();
    this.generateTemperature();
    this.generateMoisture();
    this.assignBiomes();
    
    console.log('World generation complete!');
    return this.tiles;
  }
  
  generateElevation() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // Combine multiple octaves of noise for terrain
        const scale1 = 0.03;
        const scale2 = 0.08;
        const scale3 = 0.15;
        
        let elevation = 0;
        elevation += this.noise2D(x * scale1, y * scale1, this.seed) * 0.6;
        elevation += this.noise2D(x * scale2, y * scale2, this.seed + 100) * 0.3;
        elevation += this.noise2D(x * scale3, y * scale3, this.seed + 200) * 0.1;
        
        // Normalize to 0-1
        elevation = (elevation + 1) / 2;
        
        // Create more ocean near edges
        const edgeX = Math.min(x, this.width - x) / (this.width / 4);
        const edgeY = Math.min(y, this.height - y) / (this.height / 4);
        const edgeFactor = Math.min(edgeX, edgeY, 1);
        elevation *= edgeFactor;
        
        this.tiles[y][x].elevation = elevation;
      }
    }
  }
  
  generateTemperature() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // Temperature based on latitude (distance from center)
        const latitudeFactor = Math.abs(y - this.height / 2) / (this.height / 2);
        
        // Add some noise variation
        const noise = this.noise2D(x * 0.05, y * 0.05, this.seed + 300);
        
        // Combine (0 = hot, 1 = cold)
        let temperature = latitudeFactor * 0.7 + noise * 0.3;
        temperature = Math.max(0, Math.min(1, temperature));
        
        this.tiles[y][x].temperature = temperature;
      }
    }
  }
  
  generateMoisture() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // Moisture from noise
        const noise1 = this.noise2D(x * 0.04, y * 0.04, this.seed + 400);
        const noise2 = this.noise2D(x * 0.1, y * 0.1, this.seed + 500);
        
        let moisture = noise1 * 0.7 + noise2 * 0.3;
        moisture = (moisture + 1) / 2; // Normalize to 0-1
        
        this.tiles[y][x].moisture = moisture;
      }
    }
  }
  
  assignBiomes() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        
        // Ocean (low elevation)
        if (tile.elevation < 0.35) {
          tile.biome = 'ocean';
        }
        // Arctic (cold)
        else if (tile.temperature > 0.7) {
          tile.biome = 'arctic';
        }
        // Desert (hot and dry)
        else if (tile.temperature < 0.3 && tile.moisture < 0.3) {
          tile.biome = 'desert';
        }
        // Mountains (high elevation)
        else if (tile.elevation > 0.75) {
          tile.biome = 'mountains';
        }
        // Forest (moderate moisture)
        else if (tile.moisture > 0.5) {
          tile.biome = 'forest';
        }
        // Plains (default)
        else {
          tile.biome = 'plains';
        }
      }
    }
  }
  
  // Simple 2D noise function (based on smoothed random)
  noise2D(x, y, seed) {
    const X = Math.floor(x);
    const Y = Math.floor(y);
    
    const xFrac = x - X;
    const yFrac = y - Y;
    
    // Get corner values
    const n00 = this.pseudoRandom(X, Y, seed);
    const n10 = this.pseudoRandom(X + 1, Y, seed);
    const n01 = this.pseudoRandom(X, Y + 1, seed);
    const n11 = this.pseudoRandom(X + 1, Y + 1, seed);
    
    // Interpolate
    const nx0 = this.lerp(n00, n10, this.smoothstep(xFrac));
    const nx1 = this.lerp(n01, n11, this.smoothstep(xFrac));
    
    return this.lerp(nx0, nx1, this.smoothstep(yFrac));
  }
  
  pseudoRandom(x, y, seed) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1; // Return -1 to 1
  }
  
  lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  smoothstep(t) {
    return t * t * (3 - 2 * t);
  }
  
  getTile(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.tiles[y][x];
  }
  
  getNeighbors(x, y) {
    const neighbors = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    
    for (const [dx, dy] of directions) {
      const tile = this.getTile(x + dx, y + dy);
      if (tile) neighbors.push(tile);
    }
    
    return neighbors;
  }
  
  findSettlableLocations() {
    const locations = [];
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        const biome = BIOMES[tile.biome];
        
        if (biome.canSettle && biome.fertility > 0.3) {
          locations.push({ x, y, fertility: biome.fertility });
        }
      }
    }
    
    return locations;
  }
}
