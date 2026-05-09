# Ironveil Objectives #14-15, #19-21, #23 — Functional Requirements

## Objective #19: Blueprint Discovery & Research System
### Functional Requirements
- Blueprint data schema (`blueprints.json`) with all fields: id, name, type, tier, description, required_skill_level, first_build_days, required_components, mark upgrades, source info
- `blueprint_discover(_blueprint_id)` — marks a blueprint as discovered in global journal
- `blueprint_is_discovered(_blueprint_id)` — checks discovery status
- `blueprint_research_upgrade(_blueprint_id, _target_mark)` — upgrades a blueprint mark (I→II→III→IV) at the AI Core, consuming data cores and checking skill level
- `blueprint_get_available_upgrades(_blueprint_id)` — returns list of upgradeable marks
- `blueprint_get_recipe(_blueprint_id, _mark)` — returns component requirements for a specific mark
- Integration with save/load (serialize discovered/upgraded blueprints)
- Blueprint discovery triggers special event (animation hook)
- First-build vs repeat-build distinction tracking via `global.journal.built_blueprints`

### Non-Functional Requirements
- All blueprint data externalized in JSON
- Lookup caches built at load time (by type, by tier, by source)
- Consistent with existing data_load_all() pattern

## Objective #20: Machine & Automaton Instance Management
### Functional Requirements
- `machine_create(_blueprint_id, _mark, _quality, _x, _y, _room)` — creates a new machine instance with unique ID
- `machine_destroy(_instance_id)` — removes a machine instance
- `machine_get(_instance_id)` — retrieves machine data
- `machine_get_all()` — returns all machine instances
- `machine_get_by_room(_room)` — returns machines in a specific room
- `machine_update_meter(_instance_id, _meter, _delta)` — updates lubrication/fuel/condition
- `machine_set_status(_instance_id, _status)` — OPERATIONAL, NEEDS_MAINTENANCE, BROKEN_DOWN
- Automaton system: `automaton_create()`, `automaton_assign_task()`, `automaton_get_task()`, `automaton_update_personality()`
- Automaton task types: SALVAGE, CONSTRUCTION, PATROL, MAINTENANCE, TRADE, IDLE
- Personality development based on consistent task assignment
- Unique ID generation (uuid-like string)
- Integration with save/load (serialize all instances)

### Non-Functional Requirements
- Global registry (`global.machines`, `global.automatons`) as ds_maps keyed by instance_id
- Machine data defined in `machines.json` (base stats per blueprint)

## Objective #21: Maintenance System
### Functional Requirements
- `maintenance_daily_update()` — called at start of each day, depletes all machine meters
- Depletion rates: lubrication (-10 to -15%), fuel (-5 to -20% by type), part condition (-2 to -5% per component)
- `maintenance_check_breakdown(_instance_id)` — random 1-5% daily breakdown chance, modified by age, quality, weather, maintenance history
- `maintenance_diagnose(_instance_id)` — uses Scanner tool, reveals which component failed
- `maintenance_repair(_instance_id, _component_slot, _replacement_part_id)` — replaces broken component
- `maintenance_oil(_instance_id)` — restores lubrication meter
- `maintenance_refuel(_instance_id, _fuel_item_id)` — restores fuel meter
- Visual indicators: warning icons on machines (oil, fuel, repair, breakdown)
- Efficiency penalty when lubrication < 50% (-20% efficiency)
- Machine powers down when fuel = 0
- Machine offline when any component condition = 0 (breakdown)
- Integration with weather modifiers (dust storms increase breakdown chance)

### Non-Functional Requirements
- Runs as part of time_advance_day() pipeline
- Depletion rates configurable in balance.json

## Objective #23: Tower Defense Raid System
### Functional Requirements
- `raid_check_scheduled()` — daily check against raids_year1.json calendar
- `raid_schedule(_raid_id, _warning_days)` — triggers intel phase
- `raid_start(_raid_id)` — transitions to GAME_STATE.RAID
- Raid lifecycle: INTEL (1-3 days warning) → PREP (defense placement) → COMBAT (waves) → AFTERMATH (summary)
- `defense_grid_init()` — creates 40×30 defense placement grid
- `defense_can_place(_structure_id, _gx, _gy)` — validates placement in defense zones
- `defense_place(_structure_id, _gx, _gy)` — places wall/turret/trap
- `raid_spawn_wave(_wave_index)` — spawns enemies from JSON definitions
- Enemy pathfinding: grid-based A* toward town center, dynamic recalculation on wall placement/destruction
- `turret_find_target()` — auto-targeting (nearest, path-progress priority)
- `turret_fire(_target)` — fires at target, consumes ammo
- Wall HP and destruction system
- Victory: all waves cleared; Partial: survived with heavy damage; Defeat: town center breached
- Salvage collection in aftermath
- Enemy data in `enemies_*.json`, raid schedule in `raids_year1.json`

### Non-Functional Requirements
- Defense grid separate from main collision tilemap
- Wave pause timer between waves (30-60s)
- Raid data fully externalized in JSON

## Objectives #14-15: Coppervale Room Data & Interior Room Data
### Functional Requirements
- Coppervale master room: 80×60 tiles, JSON definition with all 8 tile layers
- Zone data with boundaries matching master layout specs
- All building positions, collision data, transition points, NPC spawns
- Collision types: 0=walkable, 1=blocked, 2=interactable, 3=transition, 4=water, 5=defense_zone
- Map exits: North→Ashspine, East→Hollow, South→Rustwood/Rail, West→Coast
- Interior rooms as JSON definitions:
  - Workshop (16×12), Living Quarters (10×8), Rusty Gear Tavern (14×10)
  - General Store (10×8), Parts Dealer (10×8), Clinic (12×8), Archive (12×10)
  - Smithy (10×8), Chapel (8×10), Town Hall (12×10)
  - NPC Home template (8×6) with per-NPC customizations
- All station/furniture positions, door locations, NPC positions per room
- Each room JSON includes: dimensions, tile_layers (references), collision_map, transitions, interactive_objects, npc_positions

### Non-Functional Requirements
- JSON format compatible with data_load_file() pattern
- Room data stored in datafiles/data/rooms/ directory
- Collision maps as 2D arrays of integers
