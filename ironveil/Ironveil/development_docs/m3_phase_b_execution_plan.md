# Ironveil M3 Phase B — Execution Plan

## Step 1: All 8 Exploration Zone Room Data Files
Create room JSON files following `rm_explore_the_hollow.json` pattern.
Each defines: dimensions, sub_zones, exits, terrain_features, collision_rules, ruins, tile_layers.

## Step 2: All 8 Exploration Zone Data Files
Create exploration JSON files following `exploration_the_hollow.json` pattern.
Each defines: zone_id, room_id, salvage_nodes, hazards, enemy_patrols, discoveries, fog_of_war.

## Step 3: Update Exploration System
Update `scr_exploration_system.gml` to load all 9 zones.

## Step 4: Economy & Trade System
Create `scr_economy_system.gml` — shops, dynamic pricing, trade routes, automaton trade runs.
Create `data/economy/shops.json` and `data/economy/trade_routes.json`.

## Step 5: Progress Report
Update progress report.

## Parallelization Strategy
- Write room + exploration data for zones in batches of 2-3 per message
- Economy system can be written independently
