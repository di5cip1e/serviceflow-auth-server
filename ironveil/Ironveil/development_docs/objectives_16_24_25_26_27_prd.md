# Ironveil — Objectives #16, #24, #25, #26, #27 PRD
**Date:** 2026-03-18
**Objectives:** Complete NPC System, 10+ Craftable Machines, First Exploration Zone, Seasonal Visuals, Core UI Suite

## Objective #16: Complete NPC System
**Requirement:** All 15 core NPCs with full schedules (4 seasons × default + rainy), conditional schedule entries (hearts_gte), gift preferences (loved/liked/hated), interaction (talk, gift), birthday data.

### Deliverables
1. **npcs_core.json** — All 15 NPCs: Spark, Maren, Harrow, Linden, Michelle, Kaydee, Kiery, Paige, Gus, Ferris, Hank, Nora, Wes, Elm, Bramble
2. **scr_npc_data.gml** — NPC data loading, schedule resolution (priority: story > festival > weather > seasonal > day > base), gift response system, birthday checking

### NPC Data Schema (per NPC)
- id, name, display_name, role, personality_tag
- home_building, sprite, portrait
- is_romance_candidate, birthday { season, day }
- gift_preferences { loved: [], liked: [], hated: [] }
- schedules: { spring_default, spring_rainy, summer_default, summer_rainy, autumn_default, autumn_rainy, winter_default, winter_rainy }
- Each schedule entry: { start_hour, end_hour, location, room_id, pos }
- conditional_schedules: [ { condition: "hearts_gte", value: N, schedule_override } ]

## Objective #24: 10+ Craftable Machines
**Requirement:** Expand machines.json and blueprints.json with additional craftable machines beyond what exists. Per PRD: Worker Bot, Guard Bot, Patrol Bot, Assault Bot, Medic Bot, Utility Mech, Combat Mech Mk I, Ballistic Turret, Repeater Turret, Energy Turret, Wooden Palisade, Stone Wall.

### Current State (already in machines.json/blueprints.json)
- 2 Mechs: Utility Mech, Combat Mech Mk1
- 7 Automatons: Worker Bot, Salvage Bot, Patrol Bot, Combat Bot, Maintenance Bot, Trade Bot
- 3 Turrets: Ballistic, Energy, Mortar
- 3 Walls: Wooden Palisade, Stone Wall, Reinforced Wall
- **Total existing: 15 machines already defined**

### New Machines Needed (from GDD)
1. **Repeater Turret** — Fast-firing, low damage, wide arc
2. **Tesla Coil** — Chain lightning, area denial
3. **Flamethrower Turret** — Close range, high sustained damage, fuel-based
4. **Spike Strip** (Trap) — Passive damage, slows enemies
5. **Oil Slick** (Trap) — Slows enemies, flammable
6. **Concussion Mine** (Trap) — Explosive, single-use, high AoE damage
7. **Caltrops** (Trap) — Cheap, slow+bleed, area denial
8. **Net Trap** (Trap) — Immobilizes single target
9. **EMP Mine** (Trap) — Disables enemy special abilities
10. **Spotlight Tower** (Utility) — Increases detection range during night raids
11. **Alarm Tower** (Utility) — Extends raid warning time
12. **Energy Shield Generator** (Defense) — Temporary shield over an area

### Deliverables
1. **machines_expanded.json** — New machine stat definitions
2. **blueprints_expanded.json** — New blueprint definitions with component recipes
3. **scr_trap_system.gml** — Trap placement, trigger mechanics, and damage application

## Objective #25: First Exploration Zone (The Hollow)
**Requirement:** 40×50 tile room, fog of war system, salvage node interaction, hazard system, enemy encounters, data core discovery, blueprint chest interaction.

### Deliverables
1. **rm_explore_the_hollow.json** — Zone room definition (40×50 tiles)
2. **scr_exploration_system.gml** — Fog of war, salvage nodes, hazards, discoveries
3. **exploration_the_hollow.json** — Zone-specific data (nodes, hazards, enemies, discoveries)

### Zone Layout (from GDD)
- 5 sub-areas: Crater Rim (entrance), Slope Descent, Crater Floor, Underwater Cave (locked), Impact Center
- Salvage nodes: Scrap Piles (common), Component Caches (uncommon), Ore Veins (rare at Impact Center)
- Hazards: Unstable Floor (energy loss), Shallow Water (slow), Marauder Patrols
- Enemies: Freelance Raiders and Scavengers (Tier 1 only)
- Discoveries: 1 Standard Data Core (orbital bombardment history), 1 Blueprint Chest (Aether Refinery)

## Objective #26: Seasonal Visuals
**Requirement:** Palette swap shader, tileset swapping per season, decorative element changes, weather visual effects.

### Deliverables
1. **shd_season.vsh / shd_season.fsh** — GLSL vertex + fragment shader for palette swapping
2. **scr_seasonal_visuals.gml** — Season change handler, weather particle effects (rain, snow, fog), palette map management

### Shader Approach
- Indexed-color palette swap: base tileset uses indexed colors, shader replaces via palette map texture
- 4 rows in palette map (Spring, Summer, Autumn, Winter), each row maps to the season's palette
- Weather effects: particle systems for rain (angled streaks), snow (gentle flakes), fog (distance fade + overlay)

## Objective #27: Core UI Suite
**Requirement:** HUD, inventory screen, crafting interface, dialogue box, journal/quest log, map interface.

### Deliverables
1. **scr_ui_hud.gml** — HUD rendering (clock/date, money, energy meter, tool hotbar, raid info)
2. **scr_ui_inventory.gml** — Grid-based inventory screen with tabs/categories
3. **scr_ui_crafting.gml** — Three-panel crafting interface (recipe list, details, preview)
4. **scr_ui_journal.gml** — Tabbed journal (map, blueprints, lore, DEJIN memories, NPC notes, quest log)
5. **scr_ui_map.gml** — Fog of war world map with icons and fast travel

### UI Specifications
- HUD: Top-left (clock/date/weather), top-right (money), bottom-left (energy gauge), bottom-right (hotbar 5 slots)
- Inventory: 3×8 grid, item detail panel, category tabs (Materials, Tools, Food, Key Items)
- Crafting: Left (recipe list with unlock state), Center (requirements + craft button), Right (preview)
- Journal: 6 tabs (Map, Blueprints, Lore, DEJIN, NPCs, Quests)
