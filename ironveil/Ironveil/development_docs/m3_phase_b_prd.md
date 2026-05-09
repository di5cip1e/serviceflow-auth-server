# Ironveil M3 Phase B — PRD: Objectives #29, #37
**Date:** 2026-03-19

## Objective #29: All Exploration Zones [LARGE]
8 new zones beyond The Hollow, each with unique tilesets, hazards, enemies, discoveries.

### Per-Zone Deliverables (×8)
Each zone requires TWO files following existing patterns:
1. **Room data** (`rm_explore_[zone].json`) — Spatial layout: dimensions, sub-zones, exits, terrain features, ruins, collision rules
2. **Zone exploration data** (`exploration_[zone].json`) — Gameplay content: salvage nodes, hazards, enemy patrols, discoveries, fog of war config

### Zone Specifications (from roadmap)
| # | Zone | Room Size | Faction | Key Discovery | Tileset |
|---|------|-----------|---------|---------------|---------|
| 1 | Old Mill Ruins | 30×40 | Freelance | Worker Bot BP | grass, dirt, ruins |
| 2 | Rustwood Edge | 35×45 | Rust Wolves | Repeater Turret BP | rustwood_forest, dirt |
| 3 | Ashspine Foothills | 35×45 | Freelance | Scout Mech BP | ashspine_mountains, stone |
| 4 | Coastal Wreck | 30×40 | Tide Reavers | EMP Mine BP | shattered_coast, water |
| 5 | Mountain Bunker | 40×60 (multi-level) | Iron Marauder Scouts | Combat Mech Mk II BP + Classified Core | stone, interiors |
| 6 | Deep Rustwood | 45×50 | Rust Wolves | Heavy Mech BP | rustwood_forest |
| 7 | Scorchland Outpost | 35×40 | Iron Marauders | Energy Turret Mk II BP | scorchlands |
| 8 | Spire Wastes | 50×60 (very large) | Iron Marauders (Elite) | Legendary BPs + Sundering Truth | spire_wastes |

### System Updates
- `scr_exploration_system.gml` — Expand zone file list to load all 9 zones

---

## Objective #37: Economy & Trade System [MEDIUM]

### Requirements
1. **Shop System**: 3 shops with buy/sell
   - Gus (General Store): food, basic materials, tools
   - Ferris (Parts Dealer): components, blueprints, rare parts
   - Hank (Smithy): weapons, armor plating, repairs
2. **Dynamic Pricing**: Surplus drives prices down, shortage events spike prices
3. **Trade Routes**: Unlocked via quests, adds new shop inventory
4. **Automaton Trade Runs**: Cargo Hauler + route → 1-2 day round trip → profit + rare goods

### Deliverables
- `scr_economy_system.gml` — New script: shops, pricing, trade routes, trade runs
- `data/economy/shops.json` — Shop inventory definitions
- `data/economy/trade_routes.json` — Trade route definitions
