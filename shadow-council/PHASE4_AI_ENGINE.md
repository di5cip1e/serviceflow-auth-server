# Phase 4 Expansion: AI Ruler Action Engine

**Status:** ✅ COMPLETE

## Overview

The AI Ruler Action Engine brings autonomous life to all nations in the game. Every ruler (including AI rivals) now actively makes decisions based on their personality traits, government type, and strategic situation. Actions execute every 8 seconds, creating a dynamic world where nations build, expand, and compete without player input.

---

## Core Concept

**Autonomous Decision-Making**: Each ruler evaluates 5 possible actions based on their personality, calculates priority scores, and executes the highest-priority affordable action.

**Player Ruler**: Currently controlled only through counsel system (autonomous mode can be toggled).

**AI Rivals**: Fully autonomous, making strategic decisions independently.

---

## The Five Actions

### 1. Found City 🏛️
**Description**: Spawns a new settlement on an empty tile within nation territory.

**Requirements**:
- Cost: 500 gold, 1000 population
- Must have suitable location (10-tile minimum spacing)
- Must own the tile
- Land biome only

**Strategic Value**:
- Expands influence projection
- Increases total population capacity
- Creates new growth centers
- Pushes borders outward

**Personality Modifiers**:
- **High Priority**: Democracy (+20), Oligarchy (+15), Ambitious trait (+25)
- **Low Priority**: Slothful trait (-30), Late game with 8+ cities (-20)
- **Boost**: Early game with <3 cities (+30)

**Visual**: New city appears on map, influence borders expand immediately.

---

### 2. Build Fortress 🏰
**Description**: Constructs a defensive structure on a border tile.

**Requirements**:
- Cost: 300 gold
- Must be on nation border (adjacent to foreign/neutral tiles)
- Tile must not already have fortress

**Strategic Value**:
- Provides 2x defense bonus on tile
- Deters enemy expansion
- Protects territory
- Visual deterrent to rivals

**Personality Modifiers**:
- **High Priority**: Militarism (+30), Paranoid trait (+30), Hostile borders (+25)
- **Low Priority**: Weak-willed trait (-20), Early game with <2 cities (-15)

**Visual**: Fortress structure with four corner towers and shield icon.

---

### 3. Construct Road 🛤️
**Description**: Connects two cities with a trade route.

**Requirements**:
- Cost: 200 gold
- Must have at least 2 cities
- Cities must not already be connected

**Strategic Value**:
- +0.5% growth bonus to both connected cities
- 10% trade bonus (future economic system)
- Represents improved logistics
- Stacks with multiple roads

**Personality Modifiers**:
- **High Priority**: Oligarchy (+25), Shrewd trait (+20), 3+ cities (+20)
- **Low Priority**: Slothful trait (-25), <2 cities (-30)

**Visual**: Dashed golden line connecting two cities.

---

### 4. Upgrade Infrastructure 🏗️
**Description**: Improves an existing city's development level.

**Requirements**:
- Cost: 250 gold
- Must have at least one city

**Strategic Value**:
- +500 immediate population boost
- +0.8% permanent growth bonus
- Increases infrastructure level (tracked per city)
- Compounds with economic policies

**Personality Modifiers**:
- **High Priority**: Oligarchy (+20), Just trait (+15), Low population <20k (+25)
- **Low Priority**: Cruel trait (-20), Greedy trait (-10)

**Visual**: City continues growing, reaches next size tier faster.

---

### 5. Draft Army ⚔️
**Description**: Recruits military units and increases military strength.

**Requirements**:
- Cost: 150 gold, 500 population
- No special location requirements

**Strategic Value**:
- +50-80 military strength
- Prepares for future combat
- Tracked in armies array
- Deters aggression

**Personality Modifiers**:
- **High Priority**: Militarism (+40), Brave (+25), Paranoid (+25), Wrathful (+20)
- **Low Priority**: Weak-willed (-30), Merciful (-15)
- **Boost**: Hostile borders (+30), Low military <200 (+20)

**Visual**: Military strength number increases (shown in future UI).

---

## Decision-Making Algorithm

### 1. Resource Calculation
```javascript
{
  gold: nation.gold,
  population: totalPopulation,
  cities: cityCount,
  territory: ownedTileCount,
  military: militaryStrength
}
```

### 2. Priority Calculation
For each action:
1. Start with base priority (30-50)
2. Apply government type modifiers
3. Apply positive trait modifiers
4. Apply negative trait modifiers
5. Apply strategic situation modifiers
6. Apply resource-based modifiers

### 3. Affordability Check
```javascript
canAfford(action) {
  if (cost.gold > resources.gold) return false;
  if (cost.population > resources.population) return false;
  return true;
}
```

### 4. Action Selection
- Find action with highest priority score
- Must be affordable
- Execute immediately
- Deduct costs
- Log to history

### 5. Frequency
- Actions tick every **8 seconds**
- All nations (except controlled player) act simultaneously
- Influence borders recalculated after all actions

---

## Personality-Driven Examples

### Ambitious Democracy (High Expansion)
```
Traits: Ambitious, Diplomatic, Just
Priorities:
  - Found City: 95 (50 base + 20 democracy + 25 ambitious)
  - Upgrade Infrastructure: 80
  - Construct Road: 65
  - Build Fortress: 45
  - Draft Army: 50
Result: Prioritizes founding cities and infrastructure
```

### Paranoid Militarism (Defensive)
```
Traits: Brave, Paranoid
Priorities:
  - Draft Army: 120 (35 base + 40 militarism + 25 brave + 25 paranoid)
  - Build Fortress: 85
  - Found City: 40
  - Upgrade Infrastructure: 35
  - Construct Road: 30
Result: Heavy military and fortress focus
```

### Slothful Oligarchy (Economic)
```
Traits: Shrewd, Greedy, Slothful
Priorities:
  - Construct Road: 80 (40 base + 25 oligarchy + 20 shrewd + 15 greedy)
  - Upgrade Infrastructure: 55
  - Found City: 20 (reduced by slothful)
  - Build Fortress: 15
  - Draft Army: 20
Result: Focuses on trade and economy, avoids expansion
```

---

## Integration with Influence System

**Dynamic Border Expansion**:
- New cities immediately project influence
- Fortresses strengthen existing borders
- Roads indirectly boost city growth → larger influence radius
- Infrastructure upgrades increase city population → stronger influence

**Calculation**:
```javascript
cityInfluenceRadius = baseRadius * (1 + citySize * 0.2)
```

As cities grow from actions:
- Small (5k) → 1.0x radius
- Medium (15k) → 1.5x radius  
- Large (40k) → 2.0x radius
- Huge (100k) → 2.5x radius

**Result**: Nations that build and upgrade push borders naturally outward.

---

## Resource Economy

### Starting Resources (Per Nation)
- Gold: 1,000
- Population: 5,000 (capital only)
- Military: 100
- Territory: Initial influence from capital

### Income Generation (Future Phase)
Currently resources are:
- Gold: Deducted on actions, regeneration TBD
- Population: Grows automatically at 2% base + bonuses
- Military: Only increases through Draft Army action

### Cost Balance
Actions are priced to create strategic choices:
- **Cheap**: Draft Army (150g), Construct Road (200g)
- **Medium**: Upgrade Infrastructure (250g), Build Fortress (300g)
- **Expensive**: Found City (500g + 1000 pop)

---

## Technical Implementation

### File Structure
```
/AIActionEngine.js - Core autonomous decision engine
/WorldManager.js - Integration and update loop
/MapRenderer.js - Visual rendering of roads/fortresses
/Nation.js - Extended with roads[], fortresses[], armies[]
```

### Action Flow
```
Every 8 seconds:
  ↓
For each nation (skip player if controlled):
  ↓
Calculate resources
  ↓
Calculate priority for each action
  ↓
Find highest priority affordable action
  ↓
Execute action (update game state)
  ↓
Deduct costs
  ↓
Log to history
  ↓
Update influence borders globally
```

### Data Structures

**Nation Extensions**:
```javascript
nation.gold = 1000
nation.militaryStrength = 100
nation.roads = [{ from: cityId, to: cityId, tradeBonus: 1.1 }]
nation.fortresses = [{ x, y, defense: 2.0 }]
nation.armies = [{ strength, createdTurn }]
```

**City Extensions**:
```javascript
city.infrastructureLevel = 0 // Upgrades counter
city.growthBonus = 0.005 // Stacking growth from roads/infrastructure
```

**Tile Extensions**:
```javascript
tile.hasFortress = true
tile.defenseBonus = 2.0
```

---

## Visualization

### Roads
- Rendered as **dashed golden lines** between cities
- Visible at all zoom levels
- Color: `rgba(200, 180, 140, 0.5)`
- Line style: 8px dash, 4px gap

### Fortresses
- Rendered as **square structures** with four corner towers
- Nation-colored main body
- Black outlines for contrast
- Shield emoji (🛡) in center at medium+ zoom
- Size: 40% of tile size

### Cities (Enhanced)
- Size scales with population + infrastructure bonuses
- Growth accelerates with roads and upgrades
- Visual tier progression happens faster

---

## Console Logging

Every action tick logs:
```
=== AI ACTION TICK ===
Kingdom of Ashford priorities: {
  foundCity: 75,
  buildFortress: 60,
  constructRoad: 85,
  upgradeInfrastructure: 70,
  draftArmy: 45
}
✓ Kingdom of Ashford - constructRoad: Road: Ashford ↔ Ironburg
```

**Transparency**: Players can see what AI is doing in console.

---

## Notifications

### Player Nation Actions
When player ruler acts (future autonomous mode):
- Full notification for all actions
- "✓ Crownford has been founded!"

### AI Nation Actions
Selective notifications to avoid spam:
- 30% chance to show AI actions
- "Kingdom of Ashford: Founded Ironburg"
- Keeps player aware of world changes

---

## Strategic Depth

### Early Game (Turns 1-20)
- High priority on founding cities
- Rapid expansion phase
- Limited military/fortresses
- Nations claim prime territory

### Mid Game (Turns 21-50)
- Infrastructure upgrades accelerate
- Roads connect major cities
- Defensive fortresses appear
- Military buildups begin

### Late Game (Turns 51+)
- Fewer new cities (spacing constraints)
- Heavy infrastructure investment
- Fortress networks on borders
- Large standing armies

---

## Future Enhancements (Phase 5+)

### Income System
- Gold generation from cities/trade
- Sustainable economy
- Budget constraints create tougher choices

### Combat Resolution
- Draft Army creates actual units
- Military strength used in battles
- Fortresses provide tactical bonuses

### Diplomacy
- Wars influence action priorities
- Alliances enable trade road bonuses
- Peace treaties reduce military needs

### Advanced Actions
- Research technology
- Build wonders
- Establish trade routes
- Cultural expansion

---

## Debugging & Testing

### Action History
Access full log:
```javascript
worldManager.aiActionEngine.getActionHistory()
```

Returns:
```javascript
[{
  nationId: 1,
  nationName: "Kingdom of Ashford",
  action: "foundCity",
  result: { success: true, message: "Founded Ironburg", ... },
  turn: 15,
  timestamp: 1234567890
}]
```

### Toggle Player Autonomy
```javascript
worldManager.aiActionEngine.setPlayerAutonomous(true)
// Player ruler now acts autonomously
```

### Modify Action Interval
```javascript
worldManager.aiActionEngine.actionInterval = 5000; // Faster actions
```

---

## Performance Considerations

**Optimizations**:
- Only calculates priorities when needed (every 8s)
- Influence updates AFTER all actions (batch processing)
- Location finding caches valid tiles
- No pathfinding (direct line roads)

**Complexity**:
- O(nations × actions) per tick = ~25-45 calculations per tick
- Very manageable with 3-9 nations

---

## Summary

The AI Ruler Action Engine transforms The Counsel from a static world into a living, breathing strategy game. Nations expand, build, fortify, and grow based on their rulers' personalities. Players watch their rivals develop alongside their own nation, creating dynamic competition and strategic depth.

**Key Achievements**:
- ✅ 5 fully functional autonomous actions
- ✅ Personality-driven decision making
- ✅ Resource economy with costs
- ✅ Visual representation (roads, fortresses)
- ✅ Dynamic influence border expansion
- ✅ Action logging and history
- ✅ Configurable action frequency
- ✅ Player autonomy toggle

The world is now **alive**.
