# Execution Plan — Objectives #16, #24, #25, #26, #27

## Phase 1: NPC Data (#16)
1. Create npcs_core.json — All 15 NPCs with full data
2. Create scr_npc_data.gml — NPC data loader, schedule resolver, gift system

## Phase 2: Expanded Machines (#24)
1. Create machines_expanded.json — 12 new machine stat definitions
2. Create blueprints_expanded.json — 12 new blueprint definitions
3. Create scr_trap_system.gml — Trap placement, trigger, and damage logic

## Phase 3: Exploration Zone (#25)
1. Create rm_explore_the_hollow.json — 40×50 room definition
2. Create exploration_the_hollow.json — Zone salvage/hazard/discovery data
3. Create scr_exploration_system.gml — Fog of war, salvage, hazards, discoveries

## Phase 4: Seasonal Visuals (#26)
1. Create shd_season vertex + fragment shaders
2. Create scr_seasonal_visuals.gml — Season handler, weather particles, palette management

## Phase 5: Core UI Suite (#27)
1. Create scr_ui_hud.gml — HUD rendering
2. Create scr_ui_inventory.gml — Inventory screen
3. Create scr_ui_crafting.gml — Crafting interface
4. Create scr_ui_journal.gml — Journal/quest log
5. Create scr_ui_map.gml — World map with fog of war

## Parallelization
- Phase 1 and Phase 4 are independent — can be written in sequence but have no cross-dependencies
- Phase 2 feeds into Phase 3 (Aether Refinery blueprint discovered in The Hollow)
- Phase 5 depends on data structures from all prior phases
