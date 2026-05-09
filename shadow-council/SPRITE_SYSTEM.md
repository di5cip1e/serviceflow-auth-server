# Sprite Atlas System Documentation

## Overview

The sprite atlas system replaces solid color rendering with beautiful, hand-crafted game assets in a 'Battle of Polytopia' / 'Civilization' inspired art style. The system loads a spritesheet, extracts individual sprites, and renders them dynamically on the map.

---

## Architecture

### Core Components

1. **SpriteAtlas.js** - Asset loader and sprite manager
2. **MapRenderer.js** - Rendering engine (updated to use sprites)
3. **strategy_game_spritesheet.png.webp** - Visual asset spritesheet

---

## Spritesheet Layout

### Asset Organization (1344x768 pixels)

**Top Row - Terrain Tiles** (192x192 each):
- Ocean (deep blue)
- Sea (turquoise)
- Desert (golden sand)
- Arctic (white snow)
- Plains (lush green)
- Forest (dark green)
- Mountains (grey peaks)

**Middle Section - City Evolution**:
- Village (120x120) - Small wooden huts
- Town (160x160) - Walled stone buildings
- Metropolis (200x200) - Grand palace with domes

**Bottom Section - Structures**:
- Fortress (140x140) - Stone fortress with towers
- Roads (80x80) - Crossroads and straight sections
- Dock (100x80) - Wooden pier
- Environmental details - Palm trees, pine trees, rocks

---

## SpriteAtlas Class

### Public Methods

#### `async load()`
Loads the spritesheet image from CDN.
```javascript
await spriteAtlas.load();
```

**Returns**: Promise that resolves when loaded

**Side effects**: 
- Sets `this.loaded = true`
- Calls `extractSprites()` automatically
- Logs success/error to console

---

#### `extractSprites()`
Extracts individual sprite regions into canvas elements.

**Called automatically** after image loads.

Creates entries in `this.sprites` object:
- `terrain_ocean`, `terrain_desert`, etc.
- `city_village`, `city_town`, `city_metropolis`
- `structure_fortress`, `structure_road_cross`, etc.
- `detail_palm_trees`, `detail_pine_trees`, etc.

---

#### `getSprite(category, type)`
Retrieves a sprite canvas by category and type.

```javascript
const sprite = atlas.getSprite('terrain', 'plains');
const city = atlas.getSprite('city', 'metropolis');
```

**Parameters**:
- `category` - 'terrain', 'city', 'structure', or 'detail'
- `type` - Specific sprite name

**Returns**: Canvas element or null

---

#### `getTerrainSprite(biomeName)`
Convenient method to get terrain by biome name.

```javascript
const sprite = atlas.getTerrainSprite('plains');
```

**Parameters**:
- `biomeName` - 'ocean', 'desert', 'arctic', 'plains', 'forest', 'mountains'

**Returns**: Canvas element or null

---

#### `getCitySprite(population)`
Automatically selects city sprite based on population.

```javascript
const sprite = atlas.getCitySprite(25000); // Returns 'town'
```

**Population Thresholds**:
- < 15,000 → Village
- 15,000 - 39,999 → Town
- 40,000+ → Metropolis

**Returns**: Canvas element or null

---

#### `drawTerrain(ctx, biomeName, x, y, tileSize)`
Draws terrain sprite to canvas context.

```javascript
atlas.drawTerrain(ctx, 'forest', 100, 50, 8);
```

**Parameters**:
- `ctx` - Canvas 2D context
- `biomeName` - Biome type string
- `x, y` - Top-left corner coordinates
- `tileSize` - Width/height in pixels

---

#### `drawCity(ctx, population, x, y, scale)`
Draws city sprite centered on coordinates.

```javascript
atlas.drawCity(ctx, 30000, 400, 300, 1.5);
```

**Parameters**:
- `ctx` - Canvas 2D context
- `population` - City population (determines sprite)
- `x, y` - Center point coordinates
- `scale` - Scaling factor (1.0 = original size)

**Behavior**: Automatically centers sprite on x,y

---

#### `drawFortress(ctx, x, y, scale)`
Draws fortress sprite centered on coordinates.

```javascript
atlas.drawFortress(ctx, 450, 250, 0.8);
```

**Parameters**:
- `ctx` - Canvas 2D context
- `x, y` - Center point coordinates
- `scale` - Scaling factor

---

#### `isReady()`
Checks if atlas is fully loaded and ready to use.

```javascript
if (atlas.isReady()) {
  // Safe to draw sprites
}
```

**Returns**: Boolean

---

## MapRenderer Integration

### Initialization

```javascript
constructor(canvas, world, nations) {
  // ... other setup ...
  
  this.spriteAtlas = new SpriteAtlas();
  this.spritesLoaded = false;
  
  this.loadSprites();
}

async loadSprites() {
  try {
    await this.spriteAtlas.load();
    this.spritesLoaded = true;
    console.log('✓ Map renderer ready with sprite assets');
  } catch (error) {
    console.warn('⚠ Sprites failed to load, using fallback rendering');
    this.spritesLoaded = false;
  }
}
```

---

### Rendering with Fallback

All rendering methods check `this.spritesLoaded` before using sprites:

```javascript
if (this.spritesLoaded && this.spriteAtlas.isReady()) {
  // Use sprite rendering
  this.spriteAtlas.drawTerrain(ctx, biome, x, y, size);
} else {
  // Fallback to solid colors
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
}
```

**Graceful degradation**: Game works even if sprites fail to load.

---

## Terrain Rendering

### Before (Solid Colors)
```javascript
ctx.fillStyle = biome.color;
ctx.fillRect(x, y, tileSize, tileSize);
```

### After (Sprites with Tint)
```javascript
// Draw terrain sprite
atlas.drawTerrain(ctx, tile.biome, x, y, tileSize);

// Add nation color tint
if (tile.nationId !== null && tile.influence > 0.3) {
  ctx.fillStyle = nation.color;
  ctx.globalAlpha = tile.influence * 0.2; // Subtle 20% tint
  ctx.fillRect(x, y, tileSize, tileSize);
  ctx.globalAlpha = 1.0;
}
```

**Key Improvements**:
- Detailed terrain textures
- Subtle nation tinting (20% opacity)
- Only tints high influence tiles (> 30%)

---

## City Rendering

### Before (Circles with Gradients)
```javascript
const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
gradient.addColorStop(0, lightenColor(nation.color, 20));
gradient.addColorStop(1, nation.color);
ctx.fillStyle = gradient;
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();
```

### After (Sprites with Evolution)
```javascript
// Draw city sprite (auto-selects based on population)
const baseScale = (tileSize / 120) * visualSize;
atlas.drawCity(ctx, city.population, x, y, baseScale);

// Add subtle nation tint
ctx.fillStyle = nation.color;
ctx.globalAlpha = 0.15;
ctx.arc(x, y, tintRadius, 0, Math.PI * 2);
ctx.fill();
ctx.globalAlpha = 1.0;

// Capital star overlay
if (city.isCapital) {
  // Draw golden star on top
}
```

**Key Features**:
- Visual evolution (village → town → metropolis)
- Scales with city size
- Maintains nation color identity
- Capital stars still visible

---

## Fortress Rendering

### Before (Geometric Shapes)
```javascript
// Square body + corner towers
ctx.fillRect(x, y, size, size);
// ... tower rendering ...
ctx.fillText('🛡', centerX, centerY);
```

### After (Detailed Sprites)
```javascript
const scale = tileSize / 140;
atlas.drawFortress(ctx, centerX, centerY, scale);

// Add nation color tint
ctx.fillStyle = nation.color;
ctx.globalAlpha = 0.25;
ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
ctx.globalAlpha = 1.0;
```

**Key Features**:
- Detailed medieval fortress design
- Stone towers and walls
- Nation-colored tinting
- Scales with zoom level

---

## Performance Optimizations

### Sprite Extraction
Sprites are extracted once on load into canvas elements:
```javascript
extractSprite(definition) {
  const canvas = document.createElement('canvas');
  canvas.width = definition.width;
  canvas.height = definition.height;
  ctx.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, w, h);
  return canvas;
}
```

**Benefits**:
- No repeated image slicing during render
- Canvas-to-canvas drawing is fast
- GPU-accelerated compositing

### Zoom-Based Culling
```javascript
if (this.zoom > 0.5) {
  // Draw detailed sprites
} else {
  // Skip or use simpler fallback
}
```

**Benefits**:
- Reduced draw calls at low zoom
- Maintains performance with thousands of tiles

### Conditional Rendering
```javascript
if (this.spritesLoaded && atlas.isReady()) {
  // High-quality sprite rendering
} else {
  // Fast fallback rendering
}
```

**Benefits**:
- Game playable immediately
- Progressive enhancement
- Resilient to network issues

---

## Sprite Coordinate Reference

### Terrain Tiles (Top Row)
```javascript
ocean:     { x: 0,    y: 0, width: 192, height: 192 }
sea:       { x: 192,  y: 0, width: 192, height: 192 }
desert:    { x: 384,  y: 0, width: 192, height: 192 }
arctic:    { x: 576,  y: 0, width: 192, height: 192 }
plains:    { x: 768,  y: 0, width: 192, height: 192 }
forest:    { x: 960,  y: 0, width: 192, height: 192 }
mountains: { x: 1152, y: 0, width: 192, height: 192 }
```

### City Evolution (Middle)
```javascript
village:    { x: 30,  y: 240, width: 120, height: 120 }
town:       { x: 200, y: 220, width: 160, height: 160 }
metropolis: { x: 400, y: 200, width: 200, height: 200 }
```

### Structures (Bottom)
```javascript
fortress:      { x: 650,  y: 240, width: 140, height: 140 }
road_cross:    { x: 820,  y: 260, width: 80,  height: 80 }
road_straight: { x: 920,  y: 260, width: 80,  height: 80 }
dock:          { x: 1020, y: 260, width: 100, height: 80 }
```

### Environmental Details (Bottom)
```javascript
palm_trees: { x: 30,  y: 500, width: 80,  height: 80 }
pine_trees: { x: 400, y: 520, width: 80,  height: 80 }
rocks:      { x: 850, y: 520, width: 100, height: 80 }
```

---

## Adding New Sprites

### 1. Update Spritesheet
Generate new asset with additional sprites in organized layout.

### 2. Update Definitions
```javascript
// In SpriteAtlas.js
this.definitions = {
  terrain: { /* ... */ },
  cities: { /* ... */ },
  structures: {
    fortress: { /* ... */ },
    tower: { x: 1150, y: 240, width: 100, height: 120 }, // NEW
    // ...
  }
}
```

### 3. Add Getter Method (Optional)
```javascript
getTowerSprite() {
  return this.getSprite('structure', 'tower');
}
```

### 4. Add Render Method (Optional)
```javascript
drawTower(ctx, x, y, scale) {
  const sprite = this.getTowerSprite();
  if (sprite) {
    const width = sprite.width * scale;
    const height = sprite.height * scale;
    this.drawSprite(ctx, sprite, x, y, width, height);
  }
}
```

### 5. Use in MapRenderer
```javascript
if (tile.hasTower) {
  atlas.drawTower(ctx, centerX, centerY, scale);
}
```

---

## Troubleshooting

### Sprites Don't Appear
**Check**:
1. Console for load errors
2. `atlas.isReady()` returns true
3. `spritesLoaded` flag is set
4. Sprite coordinates are correct
5. CORS headers allow image loading

### Sprites Look Blurry
**Solutions**:
- Ensure canvas context uses `imageSmoothingEnabled = false` for pixel art
- Use appropriate scale factors
- Check sprite source resolution

### Performance Issues
**Solutions**:
- Implement more aggressive zoom-based culling
- Use simpler fallback at low zoom levels
- Cache rendered frames if static
- Reduce rendered tile range

### Fallback Always Used
**Check**:
- Network connectivity
- Image URL is correct
- CORS headers present
- Console errors during load

---

## Future Enhancements

### Animated Sprites
```javascript
// Store sprite frames
animations: {
  water: [
    { x: 0, y: 0, width: 192, height: 192 },
    { x: 192, y: 0, width: 192, height: 192 },
    // ... more frames
  ]
}

// Render with frame selection
drawAnimatedTerrain(ctx, biome, x, y, size, frameIndex) {
  const frames = this.animations[biome];
  const frame = frames[frameIndex % frames.length];
  // ... draw frame
}
```

### Texture Atlasing
Use single large texture with packed sprites for optimal GPU performance.

### Sprite Caching
Pre-render common configurations to offscreen canvases.

### Dynamic Tinting
Support hue-shift and saturation adjustments for more color variations.

---

## Summary

The sprite atlas system transforms The Counsel from a functional prototype into a visually polished strategy game. Key benefits:

✅ **Professional aesthetics** - Battle of Polytopia inspired art style  
✅ **Progressive enhancement** - Works with or without sprites  
✅ **Performance optimized** - Pre-extracted sprites, zoom culling  
✅ **Easy to extend** - Add new sprites with minimal code  
✅ **Graceful fallback** - Solid colors if sprites fail to load  
✅ **Visual clarity** - Terrain, cities, and structures instantly recognizable  

The system maintains the game's strategic depth while dramatically improving visual appeal and player immersion.
