# Execution Plan — Objectives #14-15, #19-21, #23

## Build Order (Dependency-Driven)

### Phase A: Room Data (Objectives #14-15)
1. Create `datafiles/data/rooms/` directory
2. Write `rm_town_coppervale.json` — 80×60 master layout with zones, collision, transitions, NPCs
3. Write all interior room JSONs (workshop, living_quarters, tavern, general_store, parts_dealer, clinic, archive, smithy, chapel, town_hall, npc_home_template)
4. Write `scr_room_data.gml` — room data loader functions

### Phase B: Blueprint System (Objective #19)
1. Write `datafiles/data/blueprints/blueprints.json` — all blueprint definitions
2. Write `scr_blueprint_system.gml` — discovery, research, upgrade functions
3. Update data_load_all() references (documented in comments)

### Phase C: Machine & Automaton Management (Objective #20)
1. Write `datafiles/data/machines/machines.json` — base machine/automaton stat definitions
2. Write `scr_machine_system.gml` — instance CRUD, meter management, registry
3. Write `scr_automaton_system.gml` — task assignment, personality, AI Core interface

### Phase D: Maintenance System (Objective #21)
1. Write `scr_maintenance_system.gml` — daily depletion, breakdown, repair, oil, refuel
2. Update `datafiles/data/config/balance.json` with maintenance rates

### Phase E: Tower Defense / Raid System (Objective #23)
1. Write `datafiles/data/enemies/enemies_freelance.json` — first enemy faction
2. Write `datafiles/data/raids/raids_year1.json` — Year 1 raid schedule
3. Write `scr_defense_system.gml` — defense grid, placement, validation
4. Write `scr_raid_system.gml` — lifecycle manager, wave spawning, victory/defeat
5. Write `scr_turret_system.gml` — targeting, firing, ammo
6. Write `scr_enemy_ai.gml` — pathfinding integration, damage, death

### Phase F: Integration & Verification
1. Self-review all files for consistency
2. Update progress report
3. Update interactive roadmap
