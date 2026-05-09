/// scr_turret_system.gml
/// Turret auto-targeting, firing, and ammo/fuel management during raids.
/// Objective #23: Tower Defense Raid System
///
/// Dependencies: scr_defense_system, scr_machine_system, scr_raid_system

// ============================================================================
// TURRET UPDATE LOOP
// ============================================================================

/// @func turret_update_all()
/// @desc Updates all placed turrets — find targets, fire, consume ammo.
///       Called every frame during raid combat by raid_combat_update().
function turret_update_all() {
    var _key = ds_map_find_first(global.defense_placed);
    
    while (!is_undefined(_key)) {
        var _instance_id = ds_map_find_value(global.defense_placed, _key);
        var _inst = machine_get(_instance_id);
        
        if (_inst != undefined && _inst.category == "DEFENSE" && _inst.status == "OPERATIONAL") {
            turret_update_single(_instance_id, _inst);
        }
        
        _key = ds_map_find_next(global.defense_placed, _key);
    }
}

/// @func turret_update_single(_instance_id, _inst)
/// @desc Updates a single turret: targeting, cooldown, firing.
/// @param {string} _instance_id
/// @param {struct} _inst  Machine instance struct
function turret_update_single(_instance_id, _inst) {
    // Initialize turret combat state if not present
    if (!variable_struct_exists(_inst, "turret_state")) {
        _inst.turret_state = {
            target_enemy_id: "",
            fire_cooldown: 0,
            ammo_current: 0,
            fuel_current: 0,
            focus_target_id: ""  // Player-set manual focus target
        };
        
        // Load ammo/fuel capacity from stats
        var _stats = machine_get_effective_stats(_instance_id);
        if (variable_struct_exists(_stats, "ammo_capacity")) {
            _inst.turret_state.ammo_current = _stats.ammo_capacity;
        }
        if (variable_struct_exists(_stats, "fuel_capacity")) {
            _inst.turret_state.fuel_current = _stats.fuel_capacity;
        }
    }
    
    var _ts = _inst.turret_state;
    var _stats = machine_get_effective_stats(_instance_id);
    
    // Decrement fire cooldown
    if (_ts.fire_cooldown > 0) {
        _ts.fire_cooldown -= 1 / game_get_speed(gamespeed_fps);
        return; // Still on cooldown
    }
    
    // Check ammo / fuel
    var _has_ammo = true;
    if (variable_struct_exists(_stats, "ammo_per_shot")) {
        if (_ts.ammo_current < _stats.ammo_per_shot) _has_ammo = false;
    }
    if (variable_struct_exists(_stats, "fuel_per_shot")) {
        if (_ts.fuel_current < _stats.fuel_per_shot) _has_ammo = false;
    }
    
    if (!_has_ammo) {
        // Out of ammo/fuel — turret is idle
        return;
    }
    
    // Find target
    var _target = turret_find_target(_inst, _stats);
    if (_target == undefined) return;
    
    // Fire!
    turret_fire(_instance_id, _inst, _target, _stats);
}

// ============================================================================
// TARGETING
// ============================================================================

/// @func turret_find_target(_inst, _stats)
/// @desc Finds the best enemy target within range.
///       Priority: manual focus > nearest enemy with most path progress.
/// @param {struct} _inst  Machine instance
/// @param {struct} _stats  Effective stats
/// @returns {struct|undefined} Enemy struct or undefined
function turret_find_target(_inst, _stats) {
    var _range = variable_struct_exists(_stats, "range") ? _stats.range : 5;
    var _range_px = _range * DEFENSE_CELL_SIZE;
    var _tx = _inst.position.x;
    var _ty = _inst.position.y;
    var _ts = _inst.turret_state;
    
    // Check manual focus target first
    if (_ts.focus_target_id != "") {
        var _focus = raid_find_enemy_by_id(_ts.focus_target_id);
        if (_focus != undefined && _focus.alive) {
            var _dist = point_distance(_tx, _ty, _focus.x, _focus.y);
            if (_dist <= _range_px) {
                return _focus;
            }
        }
        // Focus target dead or out of range — clear it
        _ts.focus_target_id = "";
    }
    
    // Auto-target: find enemy with most path progress within range
    var _best_target = undefined;
    var _best_progress = -1;
    var _best_dist = _range_px + 1;
    
    for (var _i = 0; _i < ds_list_size(global.raid_enemies); _i++) {
        var _enemy = global.raid_enemies[| _i];
        if (!_enemy.alive) continue;
        
        var _dist = point_distance(_tx, _ty, _enemy.x, _enemy.y);
        if (_dist > _range_px) continue;
        
        // Check firing arc if applicable
        if (variable_struct_exists(_stats, "arc_degrees") && _stats.arc_degrees < 360) {
            // For simplicity, turrets face the direction of the nearest map edge threat
            // Full arc check would require turret facing direction
            // Skip arc check for now — treat as 360 for basic implementation
        }
        
        // Prioritize by path progress (how close to town center), then by distance
        var _progress = _enemy.path_index;
        if (_progress > _best_progress || (_progress == _best_progress && _dist < _best_dist)) {
            _best_target = _enemy;
            _best_progress = _progress;
            _best_dist = _dist;
        }
    }
    
    return _best_target;
}

/// @func turret_set_focus(_instance_id, _enemy_id)
/// @desc Player manually sets a turret to focus-fire on a specific enemy.
/// @param {string} _instance_id  Turret machine instance ID
/// @param {string} _enemy_id  Enemy ID to focus
function turret_set_focus(_instance_id, _enemy_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return;
    if (!variable_struct_exists(_inst, "turret_state")) return;
    
    _inst.turret_state.focus_target_id = _enemy_id;
    show_debug_message("INFO: Turret " + _instance_id + " focus target: " + _enemy_id);
}

/// @func turret_clear_focus(_instance_id)
/// @desc Clears manual focus, returning turret to auto-targeting.
/// @param {string} _instance_id
function turret_clear_focus(_instance_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return;
    if (!variable_struct_exists(_inst, "turret_state")) return;
    
    _inst.turret_state.focus_target_id = "";
}

// ============================================================================
// FIRING
// ============================================================================

/// @func turret_fire(_instance_id, _inst, _target, _stats)
/// @desc Fires at a target enemy. Applies damage, consumes ammo/fuel.
/// @param {string} _instance_id
/// @param {struct} _inst  Machine instance
/// @param {struct} _target  Enemy struct
/// @param {struct} _stats  Effective turret stats
function turret_fire(_instance_id, _inst, _target, _stats) {
    var _ts = _inst.turret_state;
    var _damage = variable_struct_exists(_stats, "damage") ? _stats.damage : 10;
    var _fire_rate = variable_struct_exists(_stats, "fire_rate") ? _stats.fire_rate : 1.0;
    
    // Apply damage reduction for damaged turret
    // If any component condition < 50%, reduce damage by 20%
    var _any_damaged = false;
    for (var _c = 0; _c < array_length(_inst.installed_components); _c++) {
        if (_inst.installed_components[_c].component_id != "" 
            && _inst.installed_components[_c].condition < 50) {
            _any_damaged = true;
            break;
        }
    }
    if (_any_damaged) {
        _damage *= 0.8;
    }
    
    // Check for splash damage (mortar)
    var _splash = variable_struct_exists(_stats, "splash_radius") ? _stats.splash_radius : 0;
    
    if (_splash > 0) {
        // AoE damage
        var _splash_px = _splash * DEFENSE_CELL_SIZE;
        for (var _i = 0; _i < ds_list_size(global.raid_enemies); _i++) {
            var _enemy = global.raid_enemies[| _i];
            if (!_enemy.alive) continue;
            var _dist = point_distance(_target.x, _target.y, _enemy.x, _enemy.y);
            if (_dist <= _splash_px) {
                // Damage falls off with distance
                var _falloff = 1.0 - (_dist / _splash_px) * 0.5;
                enemy_take_damage(_enemy, _damage * _falloff, _instance_id);
            }
        }
    } else {
        // Single target damage
        enemy_take_damage(_target, _damage, _instance_id);
    }
    
    // Consume ammo or fuel
    if (variable_struct_exists(_stats, "ammo_per_shot")) {
        _ts.ammo_current -= _stats.ammo_per_shot;
    }
    if (variable_struct_exists(_stats, "fuel_per_shot")) {
        _ts.fuel_current -= _stats.fuel_per_shot;
    }
    
    // Set fire cooldown (inverse of fire_rate: rate 1.0 = 1 shot/sec, 0.3 = 1 shot per 3.3sec)
    _ts.fire_cooldown = 1.0 / max(_fire_rate, 0.1);
    
    // Visual/audio feedback hook
    // fx_turret_fire(_inst.position.x, _inst.position.y, _target.x, _target.y)
    // audio_play(sfx_turret_fire, 0.1, 0.8)
}

// ============================================================================
// AMMO MANAGEMENT
// ============================================================================

/// @func turret_reload(_instance_id, _ammo_item_id, _quantity)
/// @desc Reloads a turret with ammo during preparation phase.
/// @param {string} _instance_id
/// @param {string} _ammo_item_id  Ammo item from inventory
/// @param {int} _quantity  How many ammo items to load
/// @returns {int} Amount actually loaded
function turret_reload(_instance_id, _ammo_item_id, _quantity) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return 0;
    if (!variable_struct_exists(_inst, "turret_state")) return 0;
    
    var _stats = machine_get_effective_stats(_instance_id);
    var _max_ammo = variable_struct_exists(_stats, "ammo_capacity") ? _stats.ammo_capacity : 50;
    var _current = _inst.turret_state.ammo_current;
    var _space = _max_ammo - _current;
    
    var _to_load = min(_quantity, _space);
    
    // Check inventory
    var _have = inventory_count_item(global.player_inventory, _ammo_item_id);
    _to_load = min(_to_load, _have);
    
    if (_to_load <= 0) return 0;
    
    inventory_remove_item(global.player_inventory, _ammo_item_id, _to_load);
    _inst.turret_state.ammo_current += _to_load;
    
    show_debug_message("INFO: Turret " + _instance_id + " reloaded +" 
        + string(_to_load) + " ammo. Total: " + string(_inst.turret_state.ammo_current));
    
    return _to_load;
}

// ============================================================================
// HELPERS
// ============================================================================

/// @func raid_find_enemy_by_id(_enemy_id)
/// @desc Finds an enemy struct in the active enemies list by ID.
/// @param {string} _enemy_id
/// @returns {struct|undefined}
function raid_find_enemy_by_id(_enemy_id) {
    if (!ds_exists(global.raid_enemies, ds_type_list)) return undefined;
    
    for (var _i = 0; _i < ds_list_size(global.raid_enemies); _i++) {
        var _enemy = global.raid_enemies[| _i];
        if (_enemy.id == _enemy_id) return _enemy;
    }
    
    return undefined;
}
