# Ironveil M3 Phase A — PRD: Objectives #30, #31, #32
**Date:** 2026-03-18
**Scope:** Combat & Machines Core (Phase A of Milestone 3)

## Objective #32: Mech Combat System
**Priority:** HIGH (other objectives depend on mech state infrastructure)

### Requirements
1. **New game sub-state**: `RAID_SUB.MECH` within `GAME_STATE.RAID`
2. **Mech movement**: Physics-based, weighty — low acceleration, momentum, wide turns
3. **Primary weapon** (LMB): Cannon/gatling depending on mech type, continuous fire
4. **Secondary weapon** (RMB): Missiles/flamethrower with cooldown
5. **Stomp attack** (Spacebar): AoE ground pound, stuns small units within radius
6. **Special abilities** (Q key): Per-mech-type unique abilities:
   - Combat Mech Mk I: Overdrive (+50% fire rate for 10s)
   - Combat Mech Mk II: Energy Shield (5s invulnerability)
   - Heavy Mech: Siege Mode (plant feet, massive damage boost)
   - Siege Breaker: Charge (devastating forward rush)
   - Scout Mech: Radar Pulse (reveals all enemies for 8s)
7. **Component-based damage**: 4 HP pools — Legs (→ slow), Arms (→ accuracy loss), Torso (→ main HP), Cockpit (→ eject)
8. **View switch** (Tab): Instant toggle between strategic overhead and mech camera
9. **Mech deployment**: "DEPLOY MECH" button during raid prep/combat if operational mech exists

### Deliverables
- `scr_mech_combat.gml` — Mech combat controller (~400-500 lines)

---

## Objective #31: Full Raid System
**Priority:** HIGH

### Requirements
1. **3 new enemy factions** with full unit rosters (JSON data):
   - Rust Wolves (Tier 2): Scout, Raider, Berserker, Sapper, Alpha Wolf boss
   - Iron Marauders (Tier 3): Infantry, Shieldbearer, Gunner, Technician, Iron Mech, Siege Ram, Lieutenant, The Marshal
   - Tide Reavers (Tier 2.5): Raider, Diver (bypasses walls via water), Captain boss
2. **Advanced raid mechanics** in scr_raid_system.gml:
   - Multi-direction raids (already partially supported)
   - Raid difficulty modifiers: Night, Storm, Fog, Coordinated
   - Raid objectives: Assault (exists), Theft, Sabotage, Kidnap, Siege, Boss
3. **Year 2-3 raid schedules** (JSON data files)
4. **Enhanced enemy AI** in scr_enemy_ai.gml:
   - Status effects: slow, bleed, burn, stun, immobilize, ability disable (referenced in trap system but not implemented)
   - Ranged enemy behavior (stand at range, fire at turrets)
   - Shield formation behavior (Shieldbearers protect units behind them)
   - Technician behavior (repair enemy machines, disable traps)
   - Diver behavior (bypass walls via water tiles)
   - Boss behaviors (rally, buff, unique attacks)
5. **Story raids** with boss encounters and special victory conditions

### Deliverables
- `data/enemies/enemies_rust_wolves.json` — Rust Wolves faction data
- `data/enemies/enemies_iron_marauders.json` — Iron Marauders faction data
- `data/enemies/enemies_tide_reavers.json` — Tide Reavers faction data
- `data/raids/raids_year2.json` — Year 2 raid schedule
- `data/raids/raids_year3.json` — Year 3 raid schedule
- Updates to `scr_raid_system.gml` — Difficulty modifiers, objectives, multi-year loading
- Updates to `scr_enemy_ai.gml` — Status effects, advanced behaviors

---

## Objective #30: Full Machine Catalog
**Priority:** MEDIUM (builds on existing machine/blueprint infrastructure)

### Requirements
1. **New mechs** (machine + blueprint definitions):
   - Combat Mech Mk II (Tier 3)
   - Heavy Mech (Tier 4)
   - Siege Breaker (Tier 5, Legendary)
   - Scout Mech (Tier 2)
2. **Vehicles** (new category):
   - Personal Flyer (fast travel unlock)
   - Cargo Hauler (trade route requirement)
   - Cargo Zeppelin (advanced trade)
   - Battle Zeppelin (aerial raid support)
3. **Workshop upgrades** (new category):
   - Forge Tier II/III
   - Fabricator Automation
   - AI Core Tier II/III
4. **Additional defense mark variants** for existing turrets/traps

### Deliverables
- `data/machines/machines_m3.json` — New M3 machine stat definitions
- `data/machines/blueprints_m3.json` — New M3 blueprint definitions
- Updates to `scr_machine_system.gml` — Vehicle category, workshop upgrade handling
- Updates to `scr_trap_system.gml` — Expanded machine data merge for new categories

---

## Cross-Cutting Concerns
- All new data files follow existing JSON schema patterns
- New enemy data auto-loads via `raid_system_init()` file list expansion
- New machines/blueprints auto-load via `expanded_machine_data_init()` pattern or new loader
- Save/load compatibility maintained (new data additive, no schema breaks)
- Balance values in `balance.json` updated for new raid modifiers
