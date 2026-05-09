# Phase 2: World Generation Documentation

## Overview

Phase 2 implements a complete procedural world generation system with dynamic biomes, rival AI nations, influence borders, and growing cities.

## Features Implemented

### 1. Procedural Map Generation (100x100 tiles)

**WorldGenerator.js** creates terrain using multi-octave noise:

- **Elevation System**: Combines 3 octaves of noise for realistic terrain
  - Low elevation → Ocean
  - High elevation → Mountains
  - Edge dampening creates more ocean near map borders

- **Temperature Zones**: Latitude-based with noise variation
  - Poles are colder (Arctic)
  - Equator is warmer (Desert potential)
  - Creates realistic climate zones

- **Moisture System**: Noise-based precipitation patterns
  - Determines forest vs plains vs desert
  - Combines with temperature for biome assignment

### 2. Dynamic Biomes (6 Types)

Each biome has distinct properties that affect gameplay:

| Biome | Color | Fertility | Movement Cost | Settleable |
|-------|-------|-----------|---------------|------------|
| Ocean | Blue | 0% | 2x | No |
| Desert | Tan | 20% | 1.5x | Yes |
| Arctic | White | 10% | 2x | Yes |
| Plains | Green | 80% | 1x | Yes |
| Forest | Dark Green | 60% | 1.2x | Yes |
| Mountains | Gray | 30% | 3x | Yes |

**Fertility** affects city growth rates (future phase)
**Movement Cost** will affect army movement (future phase)

### 3. AI Nation Generation (3-9 Nations)

**AIRulerGenerator.js** creates rival rulers using the **exact same system** as Phase 1:

#### Ruler Creation Process:
1. **Random Gender**: Male, Female, or Non-Binary
2. **Unique Names**: 
   - 24 ruler names per gender
   - 24 nation names
   - 24 capital names
   - Ensures no duplicates
3. **Random Government**: Autocracy, Democracy, Theocracy, Oligarchy, or Militarism
4. **Trait Selection** (identical to player):
   - 7 base points
   - 0-3 negative traits (weighted: 20%, 30%, 30%, 20%)
   - Each negative trait refunds 1-2 points
   - AI spends 80-100% of total points on positive traits
   - 70% chance to take each affordable trait

#### Example AI Ruler:
```javascript
{
  rulerName: "Lysander",
  rulerGender: "male",
  nationName: "Thornreach",
  capitalName: "Irongate",
  governmentType: "autocracy",
  positiveTraits: ["brilliant", "decisive", "ambitious"],
  negativeTraits: ["cruel", "arrogant"],
  pointsSpent: 6,
  pointsRefunded: 3
}
```

### 4. Starting Locations

**Smart Distribution Algorithm**:
- Filters for high-fertility, settleable tiles
- Maintains minimum 20-tile distance between nations
- Falls back to best locations if spacing fails
- Ensures fair starting positions

### 5. Influence System

**Dynamic Border Calculation** (Nation.js):

```javascript
// Each city projects influence in a radius
cityInfluenceRadius = baseRadius * (1 + citySize * 0.2)

// Influence decreases with distance
influence = 1 - (distance / radius)

// Tile belongs to nation with strongest influence
```

**Visual Representation**:
- Territory tinted with nation color (40% opacity blend)
- Border lines drawn where influence changes
- Real-time recalculation every second

**Expansion Mechanics**:
- Base influence radius: 5 tiles
- Grows at 0.5 tiles per turn
- Larger cities project stronger influence
- Borders naturally expand as nations grow

### 6. City Growth System

**Population Dynamics** (City class):
- **Starting Population**: 5,000 per city
- **Growth Rate**: 2% per turn (configurable)
- **Visual Scaling**: City size increases with population

**Size Tiers**:
| Size | Population | Visual Scale |
|------|------------|--------------|
| Small | 5,000 | 1x |
| Medium | 15,000+ | 1.5x |
| Large | 40,000+ | 2x |
| Huge | 100,000+ | 2.5x |

**Capital Cities**:
- Marked with golden star
- Start at same size but grow with advantages (future)
- Named from capital name pool

### 7. Map Rendering (MapRenderer.js)

**Interactive Features**:
- **Pan**: Click and drag to move camera
- **Zoom**: Mouse wheel (0.3x to 3x)
- **Touch Support**: Pinch to zoom, drag to pan
- **Hover Info**: Shows biome, position, owner, influence

**Visual Elements**:
- Tile-based rendering (8px base size)
- Nation color tinting on controlled territory
- Border highlighting between nations
- City circles with size scaling
- Capital star markers
- City name labels (zoom > 1x)

**UI Overlays**:
- Nation legend (top-left)
- Tile info panel (top-right, on hover)
- Controls hint (bottom-left)

**Performance Optimizations**:
- Only renders visible tiles
- Culls off-screen cities
- Smooth zoom interpolation
- Delta-time capped at 0.1s

### 8. Data Persistence

All world data saved to `window.gameState.world`:

```javascript
window.gameState.world = {
  nations: [
    {
      id: 0,
      name: "Player Nation",
      ruler: { /* full ruler data */ },
      color: "#c94a4a",
      cities: [
        { name: "Capital", x: 50, y: 50, population: 5000, isCapital: true }
      ]
    },
    // ... AI nations
  ],
  turnNumber: 0
}
```

## File Structure

```
/config.js              - World constants, biomes, name pools
/AIRulerGenerator.js    - AI ruler creation (same logic as player)
/WorldGenerator.js      - Procedural terrain generation
/Nation.js              - Nation and City classes
/MapRenderer.js         - Canvas-based map rendering
/WorldManager.js        - Coordinates generation and updates
/main.js               - Integrates world gen into game flow
```

## Technical Details

### Noise Generation

Simple 2D noise implementation:
- Pseudo-random based on coordinates + seed
- Bilinear interpolation for smoothness
- Smoothstep function for better gradients
- Multiple octaves for detail at different scales

### Color Blending

Biome colors blend with nation colors for territory:
```javascript
blendedColor = biomeColor * (1 - alpha) + nationColor * alpha
alpha = influence * 0.4  // 40% maximum blend
```

### Influence Calculation

Distance-based with city size modifier:
```javascript
for each city:
  distance = sqrt((cityX - tileX)² + (cityY - tileY)²)
  if distance < influenceRadius:
    influence += 1 - (distance / radius)

tile.owner = nation with highest influence (min 0.1 threshold)
```

## Future Extensions (Phase 3+)

Ready for implementation:
- [ ] AI decision-making using ruler traits
- [ ] Resource generation (gold, food, military)
- [ ] City specialization (commerce, military, culture)
- [ ] Diplomatic relations between nations
- [ ] War and conquest mechanics
- [ ] Adviser counsel system (player input)
- [ ] Event system (plagues, discoveries, rebellions)
- [ ] Trade routes between cities
- [ ] Technology/advancement trees

## Debug Console

Check browser console for detailed generation logs:
```
=== WORLD GENERATION START ===
Generating world map...
World generation complete!
Generating 6 nations (including player)
Player Nation: Valdoria (Queen Elara)
AI Nation 1: Thornreach (King Aldric)
  - Government: autocracy
  - Positive Traits: brilliant, decisive, ambitious
  - Negative Traits: cruel, arrogant
...
=== WORLD GENERATION COMPLETE ===
```

Access world state:
```javascript
console.log(window.gameState.world);
```

## Map Controls Summary

- **Desktop**: 
  - Drag to pan
  - Scroll wheel to zoom
  - Hover tiles for info

- **Mobile**:
  - Touch drag to pan  
  - Pinch to zoom
  - Tap tiles for info

## Performance Notes

- 100x100 map = 10,000 tiles
- Influence recalculated every 1 second (not every frame)
- Rendering optimized with viewport culling
- Population growth calculated with delta time
- Canvas rendering at 60 FPS target
