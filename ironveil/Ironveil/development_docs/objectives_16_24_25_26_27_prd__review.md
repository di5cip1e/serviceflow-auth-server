# PRD Self-Review — Objectives #16, #24, #25, #26, #27

## Review Notes

### #16 Complete NPC System
- ✅ All 15 NPCs from rm_town_coppervale.json accounted for
- ✅ Schedule schema matches existing patterns from scr_npc_system (Milestone 1)
- ✅ Gift preference system aligns with existing relationship system (#17)
- ⚠️ Need to ensure NPC schedule resolution priority matches existing npc_parent object
- ⚠️ Wes has highly variable schedule (away 2-3 days) — need special handling
- ⚠️ Kaydee and Gus spawn inside interiors (home_pos [0,0]) — already handled by room_data_spawn_npcs

### #24 Craftable Machines
- ✅ 15 machines already exist in machines.json + blueprints.json
- ✅ 12 new machines will bring total to 27 — well over the "10+" requirement
- ⚠️ Traps are a NEW category not in existing machines.json schema — need TRAP category
- ⚠️ Utility defense (Spotlight, Alarm Tower, Shield Generator) also new — need UTILITY_DEFENSE category
- ⚠️ Trap system needs trigger mechanics (proximity, pressure plate, manual) — not in existing turret_update

### #25 Exploration Zone
- ✅ Room JSON format matches existing rm_town_coppervale.json patterns
- ✅ Fog of war is a new system — needs 2D bool grid + reveal radius
- ⚠️ Need to define how exploration state persists across visits (save/load)
- ⚠️ Enemy encounters in exploration differ from raid system — need encounter trigger mechanic
- ⚠️ The Hollow entry is from Coppervale exit_east (tile 79,19-21 → target 2,24)

### #26 Seasonal Visuals
- ✅ Shader approach is clean — indexed palette swap is performant
- ⚠️ Need to define the actual palette indices (which colors map to which)
- ⚠️ Weather particles need performance consideration (particle limits from GDD)
- ✅ Can reuse existing day/night shader integration pattern from shd_daynight

### #27 Core UI Suite
- ✅ All 6 UI components identified
- ⚠️ UI needs to work with existing game state system (MENU_OVERLAY sub-state)
- ⚠️ Crafting interface must integrate with existing workshop system (#18)
- ⚠️ Map interface needs fog of war data from exploration system (#25)
- ✅ HUD components have clear specifications from GDD

## Execution Order Decision
1. #16 (NPC Data) — Foundation data, no dependencies on other new objectives
2. #24 (Machines) — Extends existing systems, needed for #25 (Aether Refinery blueprint)
3. #25 (Exploration) — Depends on enemy data, needs fog of war system
4. #26 (Seasonal) — Independent shader work, can be done in parallel
5. #27 (UI) — Depends on all other systems being defined (inventory, crafting, map, NPCs)
