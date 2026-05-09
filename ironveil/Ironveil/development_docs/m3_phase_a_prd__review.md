# M3 Phase A PRD — Self Review

## Review Notes

### Covered Well
- All 3 objectives clearly defined with deliverables
- Mech combat maps directly to GDD section 3.6 specs
- Enemy factions match GDD section 3.4 unit rosters
- Machine catalog matches roadmap #30 requirements
- Data schema patterns match existing codebase conventions

### Potential Issues Identified

1. **Status effect system missing**: The trap system CALLS `enemy_apply_slow()`, `enemy_apply_burn()`, etc. but these functions don't exist in `scr_enemy_ai.gml`. Must implement the full status effect system in the enemy AI update loop. This is a critical dependency for both traps AND new enemy abilities.

2. **Ranged enemy behavior**: Current `enemy_update()` only handles melee pathfinding. Need `RANGED_ATTACK` behavior — enemies stop at range and fire projectiles. The `enemy_freelance_archer` has `behavior: "RANGED_ATTACK"` but the code path doesn't exist.

3. **`raid_get_active_enemies()` function**: Called by `scr_trap_system.gml` but not defined anywhere. Need to implement this helper.

4. **Machine data lookup inconsistency**: `scr_trap_system.gml` checks both `global.machine_data` and `global.expanded_machine_data`, but `scr_machine_system.gml` only checks `global.machine_data`. New M3 machines need consistent lookup across both systems. Should create a unified lookup function.

5. **Defense grid TRAP vs OCCUPIED**: Traps use a different grid key format (`_` separator) than regular defenses (`,` separator). This inconsistency could cause bugs. Should standardize.

6. **`raid_combat_update()` calls `turret_update_all()` but NOT `trap_update_all()`**: The trap update loop is never called during combat! This is a bug in the existing code that must be fixed.

### Execution Priority Adjustment
Based on dependencies:
1. First: Enemy status effects + `raid_get_active_enemies()` + trap integration fix (foundational)
2. Second: Mech combat system (#32)
3. Third: Full enemy factions + raid system (#31)  
4. Fourth: Full machine catalog (#30)
