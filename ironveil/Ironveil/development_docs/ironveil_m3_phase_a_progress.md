# Ironveil Coding Progress Report — M3 Phase A
**Date:** 2026-03-18
**Chat:** 69bb2a48def449d9fe798c05

## Overall Status: Milestone 3 Phase A — Combat & Machines at 100% (3/3 objectives) ✅

## Milestone 3 Phase A: Combat & Machines — 100% Complete (3/3 objectives)

### #32 ✅ Mech Combat System
- **New script**: `scr_mech_combat.gml` (~550 lines)
- Complete player-controlled mech combat during raids
- Physics-based weighty movement (acceleration, deceleration, momentum, turn speed)
- Primary weapon (LMB): Cannon/gatling with per-type fire rates
- Secondary weapon (RMB): Missiles/flamethrower with AoE and cooldown
- Stomp attack (Space): AoE ground pound, stuns small units
- 5 special abilities (Q key): Overdrive, Energy Shield, Siege Mode, Charge, Radar Pulse
- Component-based damage: 4 HP pools (Legs→slow, Arms→accuracy, Torso→main, Cockpit→eject)
- View switch (Tab): Toggle strategic ↔ mech camera
- 5 mech type configurations: Combat Mk I, Combat Mk II, Heavy, Siege Breaker, Scout
- Full save/load integration

### #31 ✅ Full Raid System
- **3 new enemy faction data files** (16 enemy types total across all factions):
  - `enemies_rust_wolves.json` — 5 types: Scout, Raider, Berserker, Sapper, Alpha Wolf
  - `enemies_iron_marauders.json` — 8 types: Infantry, Shieldbearer, Gunner, Technician, Iron Mech, Siege Ram, Lieutenant, The Marshal
  - `enemies_tide_reavers.json` — 3 types: Raider, Diver (water bypass), Captain
- **Year 2 raid schedule** (`raids_year2.json`) — 7 raids, introducing Rust Wolves, Iron Marauders, Tide Reavers, first siege event
- **Year 3 raid schedule** (`raids_year3.json`) — 4 raids escalating to final battle with The Marshal (all 4 directions)
- **Updated `scr_raid_system.gml`**:
  - Multi-year schedule loading (Year 1-3+)
  - `raid_check_scheduled()` now supports all years
  - `raid_find_data()` searches all year schedules
  - `raid_combat_update()` now calls `trap_update_all()` (BUG FIX) and `mech_update()`
  - Difficulty modifiers: night, storm, fog, coordinated (applied on enemy spawn)
  - Raid objectives: ASSAULT, THEFT, SABOTAGE, KIDNAP, SIEGE, BOSS
  - `mech_combat_init()` called during init
- **Updated `scr_enemy_ai.gml`** (1,102 lines, +650 lines):
  - Full status effect system: slow, burn, bleed, stun, immobilize, ability disable
  - `raid_get_active_enemies()` helper (was missing, called by trap system)
  - `enemy_init_status_effects()` called on every enemy spawn
  - Status effects tick in `enemy_update()` — DoT kills, stun blocks actions, immobilize blocks movement
  - 5 advanced behaviors: RANGED_ATTACK, SHIELDBEARER, TECHNICIAN, DIVER, BOSS
  - Diver A* variant (water-walkable pathfinding)
  - Boss ability system (rally, siege ram, summon reinforcements)
  - Shieldbearer aura (25% DR to nearby allies, 50% self-DR)
  - `enemy_take_damage_with_shield()` wrapper for shield DR calculations
- **Updated `balance.json`**: Raid difficulty modifier values (night, storm, fog, coordinated)

### #30 ✅ Full Machine Catalog
- **`machines_m3.json`** — 15 new machine definitions:
  - 4 Mechs: Combat Mk II, Heavy Mech, Siege Breaker, Scout Mech
  - 4 Vehicles: Personal Flyer, Cargo Hauler, Cargo Zeppelin, Battle Zeppelin
  - 5 Workshop Upgrades: Forge Tier II/III, Fabricator Automation, AI Core Tier II/III
  - 1 Wall: Aether-Shielded Wall (HP + regenerating shield)
  - 1 existing addition: all mech types have full stat profiles for mech combat system
- **`blueprints_m3.json`** — 9 new blueprint definitions with component recipes, mark upgrades, tier labels
- **Updated `scr_trap_system.gml`**: `expanded_machine_data_init()` now loads M3 data, merges all expanded machines into `global.machine_data` for unified lookup

## Bug Fixes
- `raid_combat_update()` was not calling `trap_update_all()` — traps were never triggering during combat. Fixed.
- `raid_get_active_enemies()` was called by trap system but never defined. Implemented.
- Machine data lookup inconsistency — expanded machines now merged into `global.machine_data`

## File Inventory — This Session

### New GML Scripts
| File | Lines | Description |
|------|-------|-------------|
| scr_mech_combat.gml | ~550 | Complete mech combat system |

### Updated GML Scripts
| File | Lines Added | Description |
|------|------------|-------------|
| scr_enemy_ai.gml | +650 | Status effects, advanced behaviors, helpers |
| scr_raid_system.gml | +50 | Multi-year, modifiers, trap/mech integration |
| scr_trap_system.gml | +25 | M3 data loading, unified machine data |

### New JSON Data Files
| File | Lines | Description |
|------|-------|-------------|
| enemies_rust_wolves.json | ~90 | 5 enemy types |
| enemies_iron_marauders.json | ~170 | 8 enemy types including The Marshal |
| enemies_tide_reavers.json | ~65 | 3 enemy types with Diver mechanic |
| raids_year2.json | ~250 | 7 raids, first siege event |
| raids_year3.json | ~180 | 4 raids, final Marshal battle |
| machines_m3.json | ~230 | 15 machine stat definitions |
| blueprints_m3.json | ~310 | 9 blueprint definitions |

### Updated JSON Data
| File | Description |
|------|-------------|
| balance.json | Raid difficulty modifier values |

**Total this session: 8 new files + 4 updated files, ~2,570 new lines**

## Combined Project Totals (All Sessions)
- 19 GML scripts (~10,555 lines)
- 33 JSON data files (~7,285 lines)
- 4 GLSL shaders (~170 lines)
- **Estimated total: ~56 source files, ~18,010 lines**

## Machine/Structure Census (Updated)
| Category | Count | New in M3 |
|----------|-------|-----------|
| Mechs | 6 | +4 (Combat Mk II, Heavy, Siege Breaker, Scout) |
| Automatons | 7 | — |
| Turrets | 6 | — |
| Traps | 6 | — |
| Walls | 4 | +1 (Aether-Shielded Wall) |
| Utility Defense | 3 | — |
| Vehicles | 4 | +4 (Personal Flyer, Cargo Hauler, Cargo Zep, Battle Zep) |
| Workshop Upgrades | 5 | +5 (Forge II/III, Fabricator Auto, AI Core II/III) |
| **Total** | **41** | **+14** |

## Enemy Census (Updated)
| Faction | Count | Tier | Key Units |
|---------|-------|------|-----------|
| Freelance Raiders | 6 | 1 | Raider, Brute, Sapper, Archer, Lieutenant, Thief |
| Rust Wolves | 5 | 2 | Scout, Raider, Berserker, Sapper, Alpha Wolf |
| Iron Marauders | 8 | 3-5 | Infantry, Shieldbearer, Gunner, Technician, Iron Mech, Siege Ram, Lieutenant, **The Marshal** |
| Tide Reavers | 3 | 2-3 | Raider, Diver, Captain |
| **Total** | **22** | | |

## What's Next: M3 Phase B (World Content & Economy)
- #29 All Exploration Zones
- #37 Economy & Trade System
