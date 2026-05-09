# Ironveil M3 Phase A — Execution Plan

## Execution Order (Dependency-Driven)

### Step 1: Foundation Fixes & Status Effects
Fix existing bugs and implement missing systems that everything else depends on.

**Files to update:**
- `scr_enemy_ai.gml` — Add:
  - `raid_get_active_enemies()` helper (missing, called by trap system)
  - Full status effect system: slow, burn, bleed, stun, immobilize, ability disable
  - Status effect update in `enemy_update()` tick
  - Ranged attack behavior (`RANGED_ATTACK` path)
  - New behaviors: `SHIELDBEARER`, `TECHNICIAN`, `DIVER`, `BOSS`
- `scr_raid_system.gml` — Add:
  - `trap_update_all()` call in `raid_combat_update()` (BUG FIX)
  - Multi-year schedule loading (year 2, year 3)
  - Raid difficulty modifier system (night, storm, fog, coordinated)
  - Raid objective types (theft, sabotage, kidnap, siege, boss)
- `scr_machine_system.gml` — Add:
  - `machine_get_data()` unified lookup across base + expanded data
  - VEHICLE and WORKSHOP_UPGRADE categories
- `data/config/balance.json` — Add raid modifier values

### Step 2: Mech Combat System (#32)
New script implementing player-controlled mech during raids.

**New file:**
- `scr_mech_combat.gml` — Complete mech combat controller:
  - `mech_deploy()` — Activate mech from strategic view
  - `mech_update()` — Per-frame movement, weapon, ability tick
  - `mech_move()` — Physics-based weighty movement
  - `mech_fire_primary()` / `mech_fire_secondary()` — Weapon systems
  - `mech_stomp()` — AoE ground attack
  - `mech_special_ability()` — Per-type abilities
  - `mech_take_damage()` — Component-based damage
  - `mech_eject()` — Forced eject on cockpit breach
  - `mech_return_to_strategic()` — Switch back to overhead view
  - `mech_serialize()` / `mech_deserialize()` — Save/load

### Step 3: Enemy Factions (#31 data)
Create all enemy faction data files.

**New files:**
- `data/enemies/enemies_rust_wolves.json` — 5 unit types
- `data/enemies/enemies_iron_marauders.json` — 8 unit types including The Marshal
- `data/enemies/enemies_tide_reavers.json` — 3 unit types
- `data/raids/raids_year2.json` — Year 2 schedule (~12-16 raids)
- `data/raids/raids_year3.json` — Year 3 schedule (~16-20 raids, climax)

### Step 4: Full Machine Catalog (#30)
Add all remaining machines, vehicles, and workshop upgrades.

**New files:**
- `data/machines/machines_m3.json` — New mech, vehicle, workshop stats
- `data/machines/blueprints_m3.json` — New blueprint definitions

**Updated files:**
- `scr_trap_system.gml` — Update `expanded_machine_data_init()` to also load M3 data

### Step 5: Integration & Verification
- Verify all new enemy types load in `raid_system_init()`
- Verify all new machines/blueprints load in init sequence
- Verify raid schedule for years 2-3 triggers correctly
- Verify mech combat state transitions work with raid system
- Verify save/load handles all new data

## File Count Estimate
- 3 new GML scripts (scr_mech_combat.gml + major updates to 2 existing)
- 5 new JSON data files
- 2 updated JSON data files
- ~3,000-4,000 new lines of code/data
