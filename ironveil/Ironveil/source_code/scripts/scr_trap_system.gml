/// scr_trap_system.gml
/// Trap placement, trigger detection, and damage application during raids.
/// Objective #24: 10+ Craftable Machines & Automatons
///
/// Dependencies: scr_defense_system, scr_machine_system, scr_raid_system, scr_enemy_ai
/// Trap categories: PASSIVE (always active), SINGLE_USE (destroyed after trigger)
/// Trigger types: STEP_ON (enemy walks onto trap tile), PROXIMITY (enemy enters radius)

// ============================================================================
// TRAP PLACEMENT
// ============================================================================

/// @func trap_place(_blueprint_id, _grid_x, _grid_y)
/// @desc Places a trap on the defense grid during raid preparation.
/// @param {string} _blueprint_id  Trap blueprint ID
/// @param {int} _grid_x  Defense grid X coordinate
/// @param {int} _grid_y  Defense grid Y coordinate
/// @returns {string} Instance ID of placed trap, or "" on failure
function trap_place(_blueprint_id, _grid_x, _grid_y) {
    // Validate blueprint exists and is a trap
    if (!variable_struct_exists(global.machine_data, _blueprint_id)
        && !variable_struct_exists(global.expanded_machine_data, _blueprint_id)) {
        show_debug_message("ERROR: trap_place — Unknown blueprint: " + _blueprint_id);
        return "";
    }
    
    var _base = undefined;
    if (variable_struct_exists(global.expanded_machine_data, _blueprint_id)) {
        _base = global.expanded_machine_data[$ _blueprint_id];
    } else if (variable_struct_exists(global.machine_data, _blueprint_id)) {
        _base = global.machine_data[$ _blueprint_id];
    }
    
    if (_base == undefined || _base.category != "TRAP") {
        show_debug_message("ERROR: trap_place — Not a trap: " + _blueprint_id);
        return "";
    }
    
    // Check grid space is available
    var _tw = _base.size_tiles[0];
    var _th = _base.size_tiles[1];
    for (var _dy = 0; _dy < _th; _dy++) {
        for (var _dx = 0; _dx < _tw; _dx++) {
            var _cx = _grid_x + _dx;
            var _cy = _grid_y + _dy;
            if (_cx >= DEFENSE_GRID_WIDTH || _cy >= DEFENSE_GRID_HEIGHT) return "";
            if (global.defense_grid[_cy][_cx] != DEFENSE_CELL.EMPTY 
                && global.defense_grid[_cy][_cx] != DEFENSE_CELL.PATH) {
                show_debug_message("WARN: trap_place — Cell occupied at " 
                    + string(_cx) + "," + string(_cy));
                return "";
            }
        }
    }
    
    // Create machine instance for the trap
    var _world_x = _grid_x * DEFENSE_CELL_SIZE + (_tw * DEFENSE_CELL_SIZE / 2);
    var _world_y = _grid_y * DEFENSE_CELL_SIZE + (_th * DEFENSE_CELL_SIZE / 2);
    var _instance_id = machine_create(_blueprint_id, 1, 1.0, _world_x, _world_y, "rm_town_coppervale");
    
    if (_instance_id == "") return "";
    
    // Initialize trap-specific combat state
    var _inst = machine_get(_instance_id);
    _inst.trap_state = {
        trap_type: _base.trap_type,
        trigger_type: _base.trap_trigger,
        triggers_remaining: _base.base_stats.max_triggers, // -1 = unlimited
        is_triggered: false,
        cooldown: 0,
        grid_x: _grid_x,
        grid_y: _grid_y
    };
    
    // Mark grid cells (traps allow enemies to walk through — they're hidden)
    // We don't mark as OCCUPIED; traps stay on PATH cells
    var _grid_key = string(_grid_x) + "_" + string(_grid_y);
    ds_map_add(global.defense_placed, _grid_key, _instance_id);
    
    show_debug_message("INFO: Trap placed: " + _blueprint_id + " at grid (" 
        + string(_grid_x) + "," + string(_grid_y) + ") -> " + _instance_id);
    
    return _instance_id;
}

// ============================================================================
// TRAP UPDATE LOOP (Called every frame during raid combat)
// ============================================================================

/// @func trap_update_all()
/// @desc Checks all placed traps for trigger conditions against active enemies.
///       Called every frame during RAID_SUB.COMBAT by raid_combat_update().
function trap_update_all() {
    var _key = ds_map_find_first(global.defense_placed);
    
    while (!is_undefined(_key)) {
        var _instance_id = ds_map_find_value(global.defense_placed, _key);
        var _inst = machine_get(_instance_id);
        
        if (_inst != undefined && variable_struct_exists(_inst, "trap_state")) {
            trap_update_single(_instance_id, _inst);
        }
        
        _key = ds_map_find_next(global.defense_placed, _key);
    }
}

/// @func trap_update_single(_instance_id, _inst)
/// @desc Updates a single trap: checks trigger conditions, applies effects.
/// @param {string} _instance_id
/// @param {struct} _inst  Machine instance struct with trap_state
function trap_update_single(_instance_id, _inst) {
    var _ts = _inst.trap_state;
    
    // Skip if already fully consumed
    if (_ts.triggers_remaining == 0) return;
    
    // Cooldown between triggers for passive traps
    if (_ts.cooldown > 0) {
        _ts.cooldown -= 1 / game_get_speed(gamespeed_fps);
        return;
    }
    
    var _base_bp = _inst.blueprint_id;
    var _base = undefined;
    if (variable_struct_exists(global.expanded_machine_data, _base_bp)) {
        _base = global.expanded_machine_data[$ _base_bp];
    } else if (variable_struct_exists(global.machine_data, _base_bp)) {
        _base = global.machine_data[$ _base_bp];
    }
    if (_base == undefined) return;
    
    var _stats = _base.base_stats;
    var _trap_x = _inst.position.x;
    var _trap_y = _inst.position.y;
    var _trap_w = _base.size_tiles[0] * DEFENSE_CELL_SIZE;
    var _trap_h = _base.size_tiles[1] * DEFENSE_CELL_SIZE;
    
    // Get all active enemies
    var _enemies = raid_get_active_enemies();
    
    for (var _i = 0; _i < array_length(_enemies); _i++) {
        var _enemy = _enemies[_i];
        if (_enemy.hp <= 0) continue;
        
        var _triggered = false;
        
        // Check trigger condition
        switch (_ts.trigger_type) {
            case "STEP_ON":
                // Enemy center point is within trap bounds
                var _half_w = _trap_w / 2;
                var _half_h = _trap_h / 2;
                if (_enemy.x >= _trap_x - _half_w && _enemy.x <= _trap_x + _half_w
                    && _enemy.y >= _trap_y - _half_h && _enemy.y <= _trap_y + _half_h) {
                    _triggered = true;
                }
                break;
                
            case "PROXIMITY":
                var _dist = point_distance(_trap_x, _trap_y, _enemy.x, _enemy.y);
                var _trigger_range = _stats.trigger_radius * DEFENSE_CELL_SIZE;
                if (_dist <= _trigger_range) {
                    _triggered = true;
                }
                break;
        }
        
        if (_triggered) {
            trap_apply_effects(_instance_id, _inst, _base, _enemy);
            
            // Handle trigger count
            if (_ts.triggers_remaining > 0) {
                _ts.triggers_remaining--;
            }
            
            // Set cooldown for passive traps (0.5 seconds between triggers)
            if (_ts.trap_type == "PASSIVE") {
                _ts.cooldown = 0.5;
            }
            
            // Single-use traps trigger once then are destroyed
            if (_ts.trap_type == "SINGLE_USE") {
                _ts.triggers_remaining = 0;
                machine_set_status(_instance_id, "BROKEN_DOWN");
                show_debug_message("INFO: Single-use trap " + _instance_id + " consumed.");
                break;
            }
            
            break; // One trigger per frame per trap
        }
    }
}

/// @func trap_apply_effects(_instance_id, _inst, _base, _enemy)
/// @desc Applies a trap's effects to a triggered enemy (and AoE if applicable).
/// @param {string} _instance_id  Trap instance
/// @param {struct} _inst  Machine instance
/// @param {struct} _base  Base machine data
/// @param {struct} _enemy  Enemy struct that triggered the trap
function trap_apply_effects(_instance_id, _inst, _base, _enemy) {
    var _stats = _base.base_stats;
    var _trap_x = _inst.position.x;
    var _trap_y = _inst.position.y;
    
    // Direct damage
    if (variable_struct_exists(_stats, "damage") && _stats.damage > 0) {
        // Check for splash/AoE
        if (variable_struct_exists(_stats, "splash_radius") && _stats.splash_radius > 0) {
            // AoE damage to all enemies in splash radius
            var _splash_range = _stats.splash_radius * DEFENSE_CELL_SIZE;
            var _all_enemies = raid_get_active_enemies();
            for (var _j = 0; _j < array_length(_all_enemies); _j++) {
                var _e = _all_enemies[_j];
                if (_e.hp <= 0) continue;
                var _dist = point_distance(_trap_x, _trap_y, _e.x, _e.y);
                if (_dist <= _splash_range) {
                    // Damage falls off with distance
                    var _falloff = 1.0 - (_dist / _splash_range) * 0.5;
                    var _aoe_dmg = floor(_stats.damage * _falloff);
                    enemy_take_damage(_e, _aoe_dmg);
                }
            }
        } else {
            // Single-target damage
            enemy_take_damage(_enemy, _stats.damage);
        }
    }
    
    // Slow effect
    if (variable_struct_exists(_stats, "slow_percent") && _stats.slow_percent > 0) {
        enemy_apply_slow(_enemy, _stats.slow_percent / 100, _stats.slow_duration_seconds);
    }
    
    // Bleed effect
    if (variable_struct_exists(_stats, "bleed_damage_per_second") && _stats.bleed_damage_per_second > 0) {
        enemy_apply_bleed(_enemy, _stats.bleed_damage_per_second, _stats.bleed_duration_seconds);
    }
    
    // Burn effect
    if (variable_struct_exists(_stats, "burn_damage_per_second") && _stats.burn_damage_per_second > 0) {
        enemy_apply_burn(_enemy, _stats.burn_damage_per_second, _stats.burn_duration_seconds);
    }
    
    // Stun effect
    if (variable_struct_exists(_stats, "stun_duration_seconds") && _stats.stun_duration_seconds > 0) {
        enemy_apply_stun(_enemy, _stats.stun_duration_seconds);
    }
    
    // Immobilize effect
    if (variable_struct_exists(_stats, "immobilize_duration_seconds") && _stats.immobilize_duration_seconds > 0) {
        enemy_apply_immobilize(_enemy, _stats.immobilize_duration_seconds);
    }
    
    // Ability disable (EMP)
    if (variable_struct_exists(_stats, "disable_abilities_seconds") && _stats.disable_abilities_seconds > 0) {
        // AoE ability disable
        var _emp_range = (_stats.splash_radius > 0) ? _stats.splash_radius * DEFENSE_CELL_SIZE : DEFENSE_CELL_SIZE;
        var _all_enemies = raid_get_active_enemies();
        for (var _j = 0; _j < array_length(_all_enemies); _j++) {
            var _e = _all_enemies[_j];
            if (_e.hp <= 0) continue;
            if (point_distance(_trap_x, _trap_y, _e.x, _e.y) <= _emp_range) {
                enemy_disable_abilities(_e, _stats.disable_abilities_seconds);
            }
        }
    }
    
    // Oil slick ignition check (flammable traps can be ignited by fire turrets)
    if (variable_struct_exists(_stats, "flammable") && _stats.flammable) {
        // Mark trap as ignitable — actual ignition happens via turret fire interaction
        _inst.trap_state.is_flammable = true;
    }
    
    show_debug_message("INFO: Trap " + _instance_id + " triggered on enemy at (" 
        + string(_enemy.x) + "," + string(_enemy.y) + ")");
}

/// @func trap_ignite_oil_slick(_instance_id)
/// @desc Ignites a flammable oil slick trap, dealing AoE burn damage.
///       Called when a fire-based turret or weapon hits the oil slick area.
/// @param {string} _instance_id
function trap_ignite_oil_slick(_instance_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return;
    if (!variable_struct_exists(_inst, "trap_state")) return;
    if (!variable_struct_exists(_inst.trap_state, "is_flammable") || !_inst.trap_state.is_flammable) return;
    
    var _base = undefined;
    if (variable_struct_exists(global.expanded_machine_data, _inst.blueprint_id)) {
        _base = global.expanded_machine_data[$ _inst.blueprint_id];
    }
    if (_base == undefined) return;
    
    var _stats = _base.base_stats;
    var _burn_range = _stats.burn_radius * DEFENSE_CELL_SIZE;
    var _burn_dmg = _stats.burn_damage_on_ignite;
    
    // Deal immediate AoE burn damage
    var _all_enemies = raid_get_active_enemies();
    for (var _j = 0; _j < array_length(_all_enemies); _j++) {
        var _e = _all_enemies[_j];
        if (_e.hp <= 0) continue;
        if (point_distance(_inst.position.x, _inst.position.y, _e.x, _e.y) <= _burn_range) {
            enemy_take_damage(_e, _burn_dmg);
            enemy_apply_burn(_e, 5, 3); // 5 dps for 3 seconds
        }
    }
    
    // Consume the oil slick
    _inst.trap_state.triggers_remaining = 0;
    machine_set_status(_instance_id, "BROKEN_DOWN");
    
    show_debug_message("INFO: Oil slick " + _instance_id + " IGNITED! AoE burn applied.");
}

// ============================================================================
// EXPANDED MACHINE DATA LOADER
// ============================================================================

/// @func expanded_machine_data_init()
/// @desc Loads expanded machine definitions from JSON. Called during data_load_all().
function expanded_machine_data_init() {
    global.expanded_machine_data = data_load_file("data/machines/machines_expanded.json");
    
    if (variable_struct_exists(global.expanded_machine_data, "_meta")) {
        variable_struct_remove(global.expanded_machine_data, "_meta");
    }
    
    // Load M3 machine data and merge into expanded
    var _m3_machines = data_load_file("data/machines/machines_m3.json");
    if (_m3_machines != undefined) {
        if (variable_struct_exists(_m3_machines, "_meta")) {
            variable_struct_remove(_m3_machines, "_meta");
        }
        var _m3_keys = variable_struct_get_names(_m3_machines);
        for (var _i = 0; _i < array_length(_m3_keys); _i++) {
            global.expanded_machine_data[$ _m3_keys[_i]] = _m3_machines[$ _m3_keys[_i]];
        }
    }
    
    // Also merge M3 machines into global.machine_data for unified lookup
    var _exp_keys = variable_struct_get_names(global.expanded_machine_data);
    for (var _i = 0; _i < array_length(_exp_keys); _i++) {
        global.machine_data[$ _exp_keys[_i]] = global.expanded_machine_data[$ _exp_keys[_i]];
    }
    
    // Load expanded blueprints and merge into global.blueprint_data
    var _bp_files = [
        "data/machines/blueprints_expanded.json",
        "data/machines/blueprints_m3.json"
    ];
    for (var _f = 0; _f < array_length(_bp_files); _f++) {
        var _bp_data = data_load_file(_bp_files[_f]);
        if (_bp_data != undefined) {
            if (variable_struct_exists(_bp_data, "_meta")) {
                variable_struct_remove(_bp_data, "_meta");
            }
            var _keys = variable_struct_get_names(_bp_data);
            for (var _i = 0; _i < array_length(_keys); _i++) {
                global.blueprint_data[$ _keys[_i]] = _bp_data[$ _keys[_i]];
            }
        }
    }
    
    show_debug_message("INFO: Expanded machine data initialized. " 
        + string(array_length(variable_struct_get_names(global.expanded_machine_data))) 
        + " expanded types loaded (includes M3).");
}

// ============================================================================
// SAVE/LOAD (traps are part of machine_serialize_all)
// ============================================================================
// Trap state is stored in each machine instance's trap_state field.
// machine_serialize_all() and machine_deserialize_all() handle this automatically
// since trap_state is a field on the instance struct.
