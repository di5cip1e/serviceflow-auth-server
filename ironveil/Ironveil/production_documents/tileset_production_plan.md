# Ironveil Tileset Production Plan

## Technical Specifications (from Art Style Guide)
- **Base Tile Size**: 16×16 pixels
- **Render Scale**: 3x (48×48 displayed pixels)
- **Perspective**: Top-down with ~30° angle (¾ view)
- **Outline**: 1px dark contextual outline (NOT pure black)
  - Organic: dark brown (#3D2B1F)
  - Mechanical: dark steel (#2C3E50)
- **Shading**: 2-3 tone maximum (base + 1 shadow + 1 highlight)
- **Dithering**: Minimal, only for large gradients
- **Anti-aliasing**: None — clean pixel edges only
- **Color Palette**: Per Art Style Guide seasonal palettes

## Priority Order (Foundation First)
### Batch 1: Core Terrain (CURRENT)
1. **Grass/Meadow Tileset** — The Verdant Basin base terrain
   - Plain grass (multiple variants for visual variety)
   - Grass with wildflower accents
   - Grass edges/transitions
   - Path-worn grass

2. **Dirt/Soil Tileset** — Farm and workshop ground
   - Packed earth
   - Tilled soil (farm plots)
   - Gravel/rough ground
   - Mud (wet variant)

3. **Stone/Road Tileset** — Town infrastructure
   - Cobblestone path
   - Cracked Old World concrete
   - Natural stone
   - Stone edges/borders

4. **Water Tileset** — Rivers, ponds, coastline
   - Still water (pond)
   - Flowing water (river) 
   - Water edges/shoreline
   - Deep water

### Batch 2: Coppervale Buildings
### Batch 3: Interiors
### Batch 4: Nature & Vegetation (4 seasons)
### Batch 5: War Scar Tiles
### Batch 6: Regional Variants (Rustwood, Scorchlands, etc.)

## Season: Starting with SPRING palette
- Grass: #7EC850, #A8D848
- Trees: #68B840, #90C868
- Flowers: #F0A0B8, #B8A0D8, #F0E8D0, #F8E060
- Sky: #A0D8F0, #E8F4FF
- Soil: #5C4033, #6B4E3A

## Generation Strategy
Each tileset will be generated as a sprite sheet containing multiple tile variants.
Target: Cohesive, warm, charming pixel art that matches the Harvest Moon BTN + steampunk aesthetic.
