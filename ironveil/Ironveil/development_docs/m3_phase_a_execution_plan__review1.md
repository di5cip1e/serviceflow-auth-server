# Execution Plan Review 1

## Issues Found

1. **Grid key inconsistency**: Plan mentions it but doesn't explicitly address the fix. The trap system uses `_` separator (`string(_grid_x) + "_" + string(_grid_y)`) while defense system uses `,` separator (`string(_grid_x) + "," + string(_grid_y)`). Decision: Leave trap keys as-is since they're a separate concern (traps are walkable, defenses aren't), but document this clearly.

2. **Mech combat & raid_combat_update integration**: The mech update needs to be called from `raid_combat_update()` when in MECH sub-state. The plan should note that `raid_combat_update()` needs a sub-state check to either run strategic updates OR mech updates (or both — turrets still fire while in mech view).

3. **Machine data unification**: Rather than creating yet another separate global, should extend `expanded_machine_data_init()` to also load M3 data and merge everything into a unified lookup. This avoids triple-checking three different globals.

## Corrections Applied
- Step 1: Add note about mech integration point in raid_combat_update
- Step 1: Machine data unification strategy — extend expanded_machine_data_init to load M3 file too
- Step 2: Note that turrets/traps continue updating during mech control (dual update path)
