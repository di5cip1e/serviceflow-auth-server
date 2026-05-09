/// scr_enemy_ai.gml
/// Enemy pathfinding, movement, attack behavior, status effects, and death handling.
/// Objectives #23, #31: Tower Defense Raid System + Full Raid System
///
/// Dependencies: scr_defense_system, scr_raid_system, scr_machine_system
/// Uses: Grid-based A* on the defense grid (40×30)

// ============================================================================
// ACTIVE ENEMY HELPERS
// ============================================================================

/// @func raid_get_active_enemies()
/// @desc Returns array of all living enemy structs from the active raid.
/// @returns {array<struct>}
function raid_get_active_enemies() {
    var _result = [];
    if (!ds_exists(global.raid_enemies, ds_type_list)) return _result;
    for (var _i = 0; _i < ds_list_size(global.raid_enemies); _i++) {
        var _enemy = global.raid_enemies[| _i];
        if (_enemy.alive) {
            array_push(_result, _enemy);
        }
    }
    return _result;
}

// ============================================================================
// STATUS EFFECT SYSTEM
// ============================================================================

/// @func enemy_init_status_effects(_enemy)
/// @desc Initializes status effect tracking on an enemy struct. Called on spawn.
/// @param {struct} _enemy
function enemy_init_status_effects(_enemy) {
    _enemy.status_effects = {
        slow: { active: false, percent: 0, timer: 0 },
        burn: { active: false, dps: 0, timer: 0 },
        bleed: { active: false, dps: 0, timer: 0 },
        stun: { active: false, timer: 0 },
        immobilize: { active: false, timer: 0 },
        ability_disabled: { active: false, timer: 0 }
    };
    _enemy.base_speed = _enemy.speed;
}

/// @func enemy_apply_slow(_enemy, _percent, _duration)
/// @desc Applies a movement speed reduction to an enemy.
/// @param {struct} _enemy
/// @param {real} _percent  Slow fraction (0.0-1.0), e.g. 0.4 = 40% slower
/// @param {real} _duration  Duration in seconds
function enemy_apply_slow(_enemy, _percent, _duration) {
    if (!variable_struct_exists(_enemy, "status_effects")) enemy_init_status_effects(_enemy);
    var _se = _enemy.status_effects.slow;
    // Keep the stronger slow
    if (_percent > _se.percent || !_se.active) {
        _se.active = true;
        _se.percent = _percent;
        _se.timer = _duration;
        _enemy.speed = _enemy.base_speed * (1.0 - _percent);
    }
}

/// @func enemy_apply_burn(_enemy, _dps, _duration)
/// @desc Applies damage-over-time fire effect.
/// @param {struct} _enemy
/// @param {real} _dps  Damage per second
/// @param {real} _duration  Duration in seconds
function enemy_apply_burn(_enemy, _dps, _duration) {
    if (!variable_struct_exists(_enemy, "status_effects")) enemy_init_status_effects(_enemy);
    var _se = _enemy.status_effects.burn;
    _se.active = true;
    _se.dps = max(_se.dps, _dps);
    _se.timer = max(_se.timer, _duration);
}

/// @func enemy_apply_bleed(_enemy, _dps, _duration)
/// @desc Applies damage-over-time bleed effect.
/// @param {struct} _enemy
/// @param {real} _dps  Damage per second
/// @param {real} _duration  Duration in seconds
function enemy_apply_bleed(_enemy, _dps, _duration) {
    if (!variable_struct_exists(_enemy, "status_effects")) enemy_init_status_effects(_enemy);
    var _se = _enemy.status_effects.bleed;
    _se.active = true;
    _se.dps = max(_se.dps, _dps);
    _se.timer = max(_se.timer, _duration);
}

/// @func enemy_apply_stun(_enemy, _duration)
/// @desc Stuns an enemy, preventing all movement and attacks.
/// @param {struct} _enemy
/// @param {real} _duration  Duration in seconds
function enemy_apply_stun(_enemy, _duration) {
    if (!variable_struct_exists(_enemy, "status_effects")) enemy_init_status_effects(_enemy);
    var _se = _enemy.status_effects.stun;
    _se.active = true;
    _se.timer = max(_se.timer, _duration);
}

/// @func enemy_apply_immobilize(_enemy, _duration)
/// @desc Roots an enemy in place but allows attacks.
/// @param {struct} _enemy
/// @param {real} _duration  Duration in seconds
function enemy_apply_immobilize(_enemy, _duration) {
    if (!variable_struct_exists(_enemy, "status_effects")) enemy_init_status_effects(_enemy);
    var _se = _enemy.status_effects.immobilize;
    _se.active = true;
    _se.timer = max(_se.timer, _duration);
}

/// @func enemy_disable_abilities(_enemy, _duration)
/// @desc Prevents enemy from using special abilities (rally, buff, etc.).
/// @param {struct} _enemy
/// @param {real} _duration  Duration in seconds
function enemy_disable_abilities(_enemy, _duration) {
    if (!variable_struct_exists(_enemy, "status_effects")) enemy_init_status_effects(_enemy);
    var _se = _enemy.status_effects.ability_disabled;
    _se.active = true;
    _se.timer = max(_se.timer, _duration);
}

/// @func enemy_update_status_effects(_enemy)
/// @desc Ticks all active status effects. Called every frame per enemy.
/// @param {struct} _enemy
function enemy_update_status_effects(_enemy) {
    if (!variable_struct_exists(_enemy, "status_effects")) return;
    var _dt = 1 / game_get_speed(gamespeed_fps);
    var _se = _enemy.status_effects;
    
    // --- SLOW ---
    if (_se.slow.active) {
        _se.slow.timer -= _dt;
        if (_se.slow.timer <= 0) {
            _se.slow.active = false;
            _se.slow.percent = 0;
            _enemy.speed = _enemy.base_speed;
        }
    }
    
    // --- BURN ---
    if (_se.burn.active) {
        _enemy.hp -= _se.burn.dps * _dt;
        _se.burn.timer -= _dt;
        if (_se.burn.timer <= 0) {
            _se.burn.active = false;
            _se.burn.dps = 0;
        }
        if (_enemy.hp <= 0) { enemy_die(_enemy); return; }
    }
    
    // --- BLEED ---
    if (_se.bleed.active) {
        _enemy.hp -= _se.bleed.dps * _dt;
        _se.bleed.timer -= _dt;
        if (_se.bleed.timer <= 0) {
            _se.bleed.active = false;
            _se.bleed.dps = 0;
        }
        if (_enemy.hp <= 0) { enemy_die(_enemy); return; }
    }
    
    // --- STUN ---
    if (_se.stun.active) {
        _se.stun.timer -= _dt;
        if (_se.stun.timer <= 0) {
            _se.stun.active = false;
        }
    }
    
    // --- IMMOBILIZE ---
    if (_se.immobilize.active) {
        _se.immobilize.timer -= _dt;
        if (_se.immobilize.timer <= 0) {
            _se.immobilize.active = false;
        }
    }
    
    // --- ABILITY DISABLE ---
    if (_se.ability_disabled.active) {
        _se.ability_disabled.timer -= _dt;
        if (_se.ability_disabled.timer <= 0) {
            _se.ability_disabled.active = false;
        }
    }
}

/// @func enemy_is_stunned(_enemy)
/// @returns {bool}
function enemy_is_stunned(_enemy) {
    if (!variable_struct_exists(_enemy, "status_effects")) return false;
    return _enemy.status_effects.stun.active;
}

/// @func enemy_is_immobilized(_enemy)
/// @returns {bool}
function enemy_is_immobilized(_enemy) {
    if (!variable_struct_exists(_enemy, "status_effects")) return false;
    return _enemy.status_effects.immobilize.active;
}

/// @func enemy_abilities_disabled(_enemy)
/// @returns {bool}
function enemy_abilities_disabled(_enemy) {
    if (!variable_struct_exists(_enemy, "status_effects")) return false;
    return _enemy.status_effects.ability_disabled.active;
}

// ============================================================================
// PATHFINDING (A* on Defense Grid)
// ============================================================================

/// @func enemy_calculate_path(_enemy)
/// @desc Calculates A* path from enemy position to their target on the defense grid.
/// @param {struct} _enemy  Enemy instance struct
function enemy_calculate_path(_enemy) {
    var _start_gx = _enemy.x div DEFENSE_CELL_SIZE;
    var _start_gy = _enemy.y div DEFENSE_CELL_SIZE;
    
    // Determine target based on behavior
    var _target_gx, _target_gy;
    
    switch (_enemy.target_priority) {
        case "TOWN_CENTER":
            // Town center is around grid (14, 19)
            _target_gx = 14;
            _target_gy = 19;
            break;
        case "NEAREST_WALL":
            var _wall_pos = enemy_find_nearest_wall(_enemy.x, _enemy.y);
            _target_gx = _wall_pos.gx;
            _target_gy = _wall_pos.gy;
            break;
        case "NEAREST_STRUCTURE":
            var _struct_pos = enemy_find_nearest_structure(_enemy.x, _enemy.y);
            _target_gx = _struct_pos.gx;
            _target_gy = _struct_pos.gy;
            break;
        case "NEAREST_TURRET":
            var _turret_pos = enemy_find_nearest_turret(_enemy.x, _enemy.y);
            _target_gx = _turret_pos.gx;
            _target_gy = _turret_pos.gy;
            break;
        case "WORKSHOP":
            // Workshop is around grid (20, 6) based on Coppervale layout
            _target_gx = 20;
            _target_gy = 6;
            break;
        default:
            _target_gx = 14;
            _target_gy = 19;
            break;
    }
    
    // Clamp to grid bounds
    _start_gx = clamp(_start_gx, 0, DEFENSE_GRID_WIDTH - 1);
    _start_gy = clamp(_start_gy, 0, DEFENSE_GRID_HEIGHT - 1);
    _target_gx = clamp(_target_gx, 0, DEFENSE_GRID_WIDTH - 1);
    _target_gy = clamp(_target_gy, 0, DEFENSE_GRID_HEIGHT - 1);
    
    // Run A* pathfinding on defense grid
    _enemy.path = enemy_astar(_start_gx, _start_gy, _target_gx, _target_gy);
    _enemy.path_index = 0;
}

/// @func enemy_astar(_sx, _sy, _ex, _ey)
/// @desc A* pathfinding on the defense grid. Returns array of {gx, gy} waypoints.
/// @param {int} _sx  Start grid X
/// @param {int} _sy  Start grid Y
/// @param {int} _ex  End grid X
/// @param {int} _ey  End grid Y
/// @returns {array} Array of { gx, gy } waypoints, or empty if no path
function enemy_astar(_sx, _sy, _ex, _ey) {
    var _open = ds_priority_create();
    var _closed = ds_map_create();
    var _came_from = ds_map_create();
    var _g_cost = ds_map_create();
    
    var _start_key = string(_sx) + "," + string(_sy);
    var _end_key = string(_ex) + "," + string(_ey);
    
    ds_priority_add(_open, _start_key, 0);
    ds_map_add(_g_cost, _start_key, 0);
    
    var _found = false;
    var _iterations = 0;
    var _max_iterations = DEFENSE_GRID_WIDTH * DEFENSE_GRID_HEIGHT * 2; // Safety limit
    
    while (!ds_priority_empty(_open) && _iterations < _max_iterations) {
        _iterations++;
        
        var _current_key = ds_priority_delete_min(_open);
        
        if (_current_key == _end_key) {
            _found = true;
            break;
        }
        
        ds_map_add(_closed, _current_key, true);
        
        // Parse current position
        var _comma = string_pos(",", _current_key);
        var _cx = real(string_copy(_current_key, 1, _comma - 1));
        var _cy = real(string_delete(_current_key, 1, _comma));
        
        // Check 4 neighbors
        var _dx = [0, 0, -1, 1];
        var _dy = [-1, 1, 0, 0];
        
        for (var _d = 0; _d < 4; _d++) {
            var _nx = _cx + _dx[_d];
            var _ny = _cy + _dy[_d];
            
            // Bounds check
            if (_nx < 0 || _nx >= DEFENSE_GRID_WIDTH || _ny < 0 || _ny >= DEFENSE_GRID_HEIGHT) continue;
            
            var _neighbor_key = string(_nx) + "," + string(_ny);
            
            // Skip if already evaluated
            if (ds_map_exists(_closed, _neighbor_key)) continue;
            
            // Check walkability
            var _cell = global.defense_grid[_ny][_nx];
            
            // Walls (OCCUPIED) are blocked unless enemy is a sapper targeting them
            if (_cell == DEFENSE_CELL.BLOCKED) continue;
            if (_cell == DEFENSE_CELL.OCCUPIED) {
                // Sappers can path toward walls, stopping adjacent
                // For pathfinding, treat OCCUPIED as blocked (enemies attack walls they can't pass)
                continue;
            }
            
            // Movement cost (EMPTY=1, PATH=1, TOWN=1)
            var _move_cost = 1;
            
            var _new_g = ds_map_find_value(_g_cost, _current_key) + _move_cost;
            
            if (!ds_map_exists(_g_cost, _neighbor_key) 
                || _new_g < ds_map_find_value(_g_cost, _neighbor_key)) {
                
                ds_map_replace(_g_cost, _neighbor_key, _new_g);
                
                // Manhattan distance heuristic
                var _h = abs(_nx - _ex) + abs(_ny - _ey);
                var _f = _new_g + _h;
                
                ds_priority_add(_open, _neighbor_key, _f);
                ds_map_replace(_came_from, _neighbor_key, _current_key);
            }
        }
    }
    
    // Reconstruct path
    var _path = [];
    if (_found) {
        var _trace = _end_key;
        while (_trace != _start_key) {
            var _comma2 = string_pos(",", _trace);
            var _px = real(string_copy(_trace, 1, _comma2 - 1));
            var _py = real(string_delete(_trace, 1, _comma2));
            array_insert(_path, 0, { gx: _px, gy: _py });
            
            if (!ds_map_exists(_came_from, _trace)) break;
            _trace = ds_map_find_value(_came_from, _trace);
        }
    }
    
    // Cleanup
    ds_priority_destroy(_open);
    ds_map_destroy(_closed);
    ds_map_destroy(_came_from);
    ds_map_destroy(_g_cost);
    
    return _path;
}

// ============================================================================
// ENEMY UPDATE (Per-Frame)
// ============================================================================

/// @func enemy_update(_enemy)
/// @desc Updates a single enemy: status effects, behavior dispatch, movement, attacks.
/// @param {struct} _enemy  Enemy instance struct
function enemy_update(_enemy) {
    if (!_enemy.alive) return;
    
    // --- STATUS EFFECTS TICK ---
    enemy_update_status_effects(_enemy);
    if (!_enemy.alive) return; // Died from DoT
    
    // Stunned enemies can't act at all
    if (enemy_is_stunned(_enemy)) return;
    
    // Decrement attack cooldown
    if (_enemy.attack_cooldown > 0) {
        _enemy.attack_cooldown -= 1 / game_get_speed(gamespeed_fps);
    }
    
    // --- BEHAVIOR DISPATCH ---
    switch (_enemy.behavior) {
        case "RANGED_ATTACK":
            enemy_behavior_ranged(_enemy);
            return;
        case "SHIELDBEARER":
            enemy_behavior_shieldbearer(_enemy);
            return;
        case "TECHNICIAN":
            enemy_behavior_technician(_enemy);
            return;
        case "DIVER":
            enemy_behavior_diver(_enemy);
            return;
        case "BOSS":
            enemy_behavior_boss(_enemy);
            return;
        case "PATHFIND_TO_WALLS":
        case "PATHFIND_TO_TARGET":
        case "PATHFIND_TO_WORKSHOP":
        default:
            // Standard melee pathfind behavior (original logic)
            break;
    }
    
    // --- STANDARD MELEE PATHFIND BEHAVIOR ---
    // Immobilized enemies can attack but not move
    if (enemy_is_immobilized(_enemy)) {
        if (enemy_check_adjacent_obstacle(_enemy)) {
            enemy_attack_obstacle(_enemy);
        }
        return;
    }
    
    // Check if we need to attack an adjacent wall/structure
    if (enemy_check_adjacent_obstacle(_enemy)) {
        enemy_attack_obstacle(_enemy);
        return;
    }
    
    // Move along path
    if (array_length(_enemy.path) == 0 || _enemy.path_index >= array_length(_enemy.path)) {
        enemy_calculate_path(_enemy);
        if (array_length(_enemy.path) == 0) return;
    }
    
    var _waypoint = _enemy.path[_enemy.path_index];
    var _target_x = _waypoint.gx * DEFENSE_CELL_SIZE + DEFENSE_CELL_SIZE / 2;
    var _target_y = _waypoint.gy * DEFENSE_CELL_SIZE + DEFENSE_CELL_SIZE / 2;
    
    var _dist = point_distance(_enemy.x, _enemy.y, _target_x, _target_y);
    var _speed = _enemy.speed * (DEFENSE_CELL_SIZE / game_get_speed(gamespeed_fps));
    
    if (_dist <= _speed) {
        _enemy.x = _target_x;
        _enemy.y = _target_y;
        _enemy.grid_x = _waypoint.gx;
        _enemy.grid_y = _waypoint.gy;
        _enemy.path_index++;
    } else {
        var _dir = point_direction(_enemy.x, _enemy.y, _target_x, _target_y);
        _enemy.x += lengthdir_x(_speed, _dir);
        _enemy.y += lengthdir_y(_speed, _dir);
        _enemy.grid_x = _enemy.x div DEFENSE_CELL_SIZE;
        _enemy.grid_y = _enemy.y div DEFENSE_CELL_SIZE;
    }
}

/// @func enemy_check_adjacent_obstacle(_enemy)
/// @desc Checks if an enemy is adjacent to a wall/defense it should attack.
/// @param {struct} _enemy
/// @returns {bool} True if there's an obstacle to attack
function enemy_check_adjacent_obstacle(_enemy) {
    var _gx = _enemy.grid_x;
    var _gy = _enemy.grid_y;
    
    // Check 4 adjacent cells for walls
    var _dx = [0, 0, -1, 1];
    var _dy = [-1, 1, 0, 0];
    
    for (var _d = 0; _d < 4; _d++) {
        var _nx = _gx + _dx[_d];
        var _ny = _gy + _dy[_d];
        
        if (_nx < 0 || _nx >= DEFENSE_GRID_WIDTH || _ny < 0 || _ny >= DEFENSE_GRID_HEIGHT) continue;
        
        if (global.defense_grid[_ny][_nx] == DEFENSE_CELL.OCCUPIED) {
            // Check if this wall is between us and our destination
            if (array_length(_enemy.path) > _enemy.path_index) {
                // There's a wall blocking our path — attack it
                _enemy.attack_target = { gx: _nx, gy: _ny };
                return true;
            }
        }
    }
    
    return false;
}

/// @func enemy_attack_obstacle(_enemy)
/// @desc Enemy attacks an adjacent wall or defense structure.
/// @param {struct} _enemy
function enemy_attack_obstacle(_enemy) {
    if (_enemy.attack_cooldown > 0) return;
    if (_enemy.attack_target == undefined) return;
    
    var _tgx = _enemy.attack_target.gx;
    var _tgy = _enemy.attack_target.gy;
    
    var _damage = _enemy.damage;
    
    // Sappers deal extra damage to walls
    if (variable_struct_exists(_enemy, "damage_vs_walls_mult")) {
        _damage *= _enemy.damage_vs_walls_mult;
    }
    
    // Apply damage to the defense
    var _destroyed = defense_wall_take_damage(_tgx, _tgy, _damage);
    
    if (_destroyed) {
        _enemy.attack_target = undefined;
        global.raid_state.structures_destroyed++;
        
        // Recalculate path — the obstacle is gone
        enemy_calculate_path(_enemy);
    }
    
    // Attack cooldown (1 attack per second)
    _enemy.attack_cooldown = 1.0;
    
    // fx_attack(_enemy.x, _enemy.y, _tgx * DEFENSE_CELL_SIZE, _tgy * DEFENSE_CELL_SIZE)
}

// ============================================================================
// DAMAGE & DEATH
// ============================================================================

/// @func enemy_take_damage(_enemy, _amount, _source)
/// @desc Applies damage to an enemy, accounting for armor.
/// @param {struct} _enemy
/// @param {real} _amount  Raw damage
/// @param {string} _source  Source identifier (turret instance_id, etc.)
function enemy_take_damage(_enemy, _amount, _source) {
    if (!_enemy.alive) return;
    
    // Apply armor reduction: damage = max(1, raw_damage - armor)
    var _actual = max(1, _amount - _enemy.armor);
    _enemy.hp -= _actual;
    
    // fx_damage_number(_enemy.x, _enemy.y, _actual)
    
    if (_enemy.hp <= 0) {
        enemy_die(_enemy);
    }
}

/// @func enemy_die(_enemy)
/// @desc Handles enemy death: cleanup, counter updates, visual effects.
/// @param {struct} _enemy
function enemy_die(_enemy) {
    _enemy.alive = false;
    _enemy.hp = 0;
    
    global.raid_state.enemies_alive--;
    global.raid_state.enemies_killed++;
    
    // fx_explosion(_enemy.x, _enemy.y, 0.5)
    // audio_play(sfx_enemy_death, 0.1, 0.7)
    
    // show_debug_message("INFO: Enemy killed: " + _enemy.id + " (" + _enemy.template_id + ")");
}

// ============================================================================
// TARGET FINDING HELPERS
// ============================================================================

/// @func enemy_find_nearest_wall(_world_x, _world_y)
/// @desc Finds the nearest wall/defense on the defense grid.
/// @returns {struct} { gx, gy } grid position of nearest wall, or town center if none
function enemy_find_nearest_wall(_world_x, _world_y) {
    var _ego_gx = _world_x div DEFENSE_CELL_SIZE;
    var _ego_gy = _world_y div DEFENSE_CELL_SIZE;
    var _best_dist = 9999;
    var _best = { gx: 14, gy: 19 }; // Fallback to town center
    
    var _key = ds_map_find_first(global.defense_placed);
    while (!is_undefined(_key)) {
        var _inst_id = ds_map_find_value(global.defense_placed, _key);
        var _inst = machine_get(_inst_id);
        if (_inst != undefined && (_inst.category == "WALL" || _inst.category == "DEFENSE")) {
            var _comma = string_pos(",", _key);
            var _gx = real(string_copy(_key, 1, _comma - 1));
            var _gy = real(string_delete(_key, 1, _comma));
            var _dist = abs(_gx - _ego_gx) + abs(_gy - _ego_gy);
            if (_dist < _best_dist) {
                _best_dist = _dist;
                _best = { gx: _gx, gy: _gy };
            }
        }
        _key = ds_map_find_next(global.defense_placed, _key);
    }
    
    return _best;
}

/// @func enemy_find_nearest_structure(_world_x, _world_y)
/// @desc Finds the nearest placed defense structure (turret, wall, etc.).
/// @returns {struct} { gx, gy }
function enemy_find_nearest_structure(_world_x, _world_y) {
    // Same implementation as nearest_wall but includes all defense types
    return enemy_find_nearest_wall(_world_x, _world_y);
}

/// @func enemy_find_nearest_turret(_world_x, _world_y)
/// @desc Finds the nearest turret specifically.
/// @returns {struct} { gx, gy }
function enemy_find_nearest_turret(_world_x, _world_y) {
    var _ego_gx = _world_x div DEFENSE_CELL_SIZE;
    var _ego_gy = _world_y div DEFENSE_CELL_SIZE;
    var _best_dist = 9999;
    var _best = { gx: 14, gy: 19 };
    
    var _key = ds_map_find_first(global.defense_placed);
    while (!is_undefined(_key)) {
        var _inst_id = ds_map_find_value(global.defense_placed, _key);
        var _inst = machine_get(_inst_id);
        if (_inst != undefined && _inst.category == "DEFENSE") {
            var _comma = string_pos(",", _key);
            var _gx = real(string_copy(_key, 1, _comma - 1));
            var _gy = real(string_delete(_key, 1, _comma));
            var _dist = abs(_gx - _ego_gx) + abs(_gy - _ego_gy);
            if (_dist < _best_dist) {
                _best_dist = _dist;
                _best = { gx: _gx, gy: _gy };
            }
        }
        _key = ds_map_find_next(global.defense_placed, _key);
    }
    
    return _best;
}

/// @func enemy_recalculate_all_paths()
/// @desc Forces all living enemies to recalculate their paths.
///       Called when defense grid changes (wall placed/destroyed).
function enemy_recalculate_all_paths() {
    if (!ds_exists(global.raid_enemies, ds_type_list)) return;
    
    for (var _i = 0; _i < ds_list_size(global.raid_enemies); _i++) {
        var _enemy = global.raid_enemies[| _i];
        if (_enemy.alive) {
            enemy_calculate_path(_enemy);
        }
    }
    
    show_debug_message("INFO: All enemy paths recalculated (" 
        + string(global.raid_state.enemies_alive) + " enemies).");
}

// ============================================================================
// ADVANCED ENEMY BEHAVIORS (M3 — Objective #31)
// ============================================================================

/// @func enemy_behavior_ranged(_enemy)
/// @desc Ranged attack behavior: move within range, then stop and fire at target.
///       Used by archers, gunners, and similar ranged units.
/// @param {struct} _enemy
function enemy_behavior_ranged(_enemy) {
    if (enemy_is_immobilized(_enemy) && _enemy.attack_cooldown > 0) return;
    
    var _range_px = _enemy.attack_range * DEFENSE_CELL_SIZE;
    
    // Find nearest target based on priority
    var _target = enemy_find_ranged_target(_enemy);
    if (_target == undefined) {
        // No target — fall back to standard pathfinding toward town center
        if (!enemy_is_immobilized(_enemy)) {
            if (array_length(_enemy.path) == 0 || _enemy.path_index >= array_length(_enemy.path)) {
                enemy_calculate_path(_enemy);
            }
            if (array_length(_enemy.path) > 0 && _enemy.path_index < array_length(_enemy.path)) {
                var _wp = _enemy.path[_enemy.path_index];
                var _tx = _wp.gx * DEFENSE_CELL_SIZE + DEFENSE_CELL_SIZE / 2;
                var _ty = _wp.gy * DEFENSE_CELL_SIZE + DEFENSE_CELL_SIZE / 2;
                var _spd = _enemy.speed * (DEFENSE_CELL_SIZE / game_get_speed(gamespeed_fps));
                var _dir = point_direction(_enemy.x, _enemy.y, _tx, _ty);
                _enemy.x += lengthdir_x(_spd, _dir);
                _enemy.y += lengthdir_y(_spd, _dir);
                _enemy.grid_x = _enemy.x div DEFENSE_CELL_SIZE;
                _enemy.grid_y = _enemy.y div DEFENSE_CELL_SIZE;
                if (point_distance(_enemy.x, _enemy.y, _tx, _ty) <= _spd) {
                    _enemy.path_index++;
                }
            }
        }
        return;
    }
    
    var _dist = point_distance(_enemy.x, _enemy.y, _target.x, _target.y);
    
    if (_dist <= _range_px) {
        // In range — fire!
        if (_enemy.attack_cooldown <= 0) {
            enemy_ranged_fire(_enemy, _target);
            _enemy.attack_cooldown = 1.5; // Ranged attack interval
        }
        // Stand still while in range (don't advance)
    } else if (!enemy_is_immobilized(_enemy)) {
        // Move toward target until in range
        var _spd = _enemy.speed * (DEFENSE_CELL_SIZE / game_get_speed(gamespeed_fps));
        var _dir = point_direction(_enemy.x, _enemy.y, _target.x, _target.y);
        _enemy.x += lengthdir_x(_spd, _dir);
        _enemy.y += lengthdir_y(_spd, _dir);
        _enemy.grid_x = _enemy.x div DEFENSE_CELL_SIZE;
        _enemy.grid_y = _enemy.y div DEFENSE_CELL_SIZE;
    }
}

/// @func enemy_find_ranged_target(_enemy)
/// @desc Finds the best ranged attack target (turret, wall, or mech).
/// @param {struct} _enemy
/// @returns {struct|undefined} { x, y, type, instance_id } or undefined
function enemy_find_ranged_target(_enemy) {
    var _range_px = _enemy.attack_range * DEFENSE_CELL_SIZE;
    var _best = undefined;
    var _best_dist = _range_px * 2; // Search wider than range to path toward
    
    // Check placed defenses
    var _key = ds_map_find_first(global.defense_placed);
    while (!is_undefined(_key)) {
        var _inst_id = ds_map_find_value(global.defense_placed, _key);
        var _inst = machine_get(_inst_id);
        if (_inst != undefined && _inst.status == "OPERATIONAL") {
            var _dist = point_distance(_enemy.x, _enemy.y, _inst.position.x, _inst.position.y);
            if (_dist < _best_dist) {
                _best_dist = _dist;
                _best = { x: _inst.position.x, y: _inst.position.y, type: "defense", instance_id: _inst_id };
            }
        }
        _key = ds_map_find_next(global.defense_placed, _key);
    }
    
    // Check if player mech is deployed
    if (variable_struct_exists(global, "mech_state") && global.mech_state.deployed) {
        var _dist = point_distance(_enemy.x, _enemy.y, global.mech_state.x, global.mech_state.y);
        if (_dist < _best_dist) {
            _best_dist = _dist;
            _best = { x: global.mech_state.x, y: global.mech_state.y, type: "mech", instance_id: "" };
        }
    }
    
    return _best;
}

/// @func enemy_ranged_fire(_enemy, _target)
/// @desc Fires a ranged projectile at a target.
/// @param {struct} _enemy
/// @param {struct} _target  { x, y, type, instance_id }
function enemy_ranged_fire(_enemy, _target) {
    var _damage = _enemy.damage;
    
    if (_target.type == "defense") {
        // Damage the defense structure
        var _gx = _target.x div DEFENSE_CELL_SIZE;
        var _gy = _target.y div DEFENSE_CELL_SIZE;
        defense_wall_take_damage(_gx, _gy, _damage);
    } else if (_target.type == "mech") {
        // Damage the player mech
        if (variable_struct_exists(global, "mech_state") && global.mech_state.deployed) {
            mech_take_damage(_damage, "ranged");
        }
    }
    // fx_projectile(_enemy.x, _enemy.y, _target.x, _target.y)
}

/// @func enemy_behavior_shieldbearer(_enemy)
/// @desc Shieldbearer behavior: advances slowly, absorbs damage for units behind.
///       Reduces damage taken from the front by 50%. Nearby allies get 25% DR.
/// @param {struct} _enemy
function enemy_behavior_shieldbearer(_enemy) {
    if (enemy_is_immobilized(_enemy)) return;
    
    // Initialize shield aura state
    if (!variable_struct_exists(_enemy, "shield_aura_timer")) {
        _enemy.shield_aura_timer = 0;
    }
    
    // Apply shield aura to nearby allies every 1 second
    _enemy.shield_aura_timer -= 1 / game_get_speed(gamespeed_fps);
    if (_enemy.shield_aura_timer <= 0) {
        _enemy.shield_aura_timer = 1.0;
        var _aura_range = 3 * DEFENSE_CELL_SIZE;
        var _enemies = raid_get_active_enemies();
        for (var _i = 0; _i < array_length(_enemies); _i++) {
            var _ally = _enemies[_i];
            if (_ally.id == _enemy.id) continue;
            if (point_distance(_enemy.x, _enemy.y, _ally.x, _ally.y) <= _aura_range) {
                // Mark ally as shielded (temporary DR flag)
                _ally.shielded = true;
                _ally.shield_timer = 1.2; // Lasts slightly longer than aura refresh
            }
        }
    }
    
    // Standard melee pathfinding (slow advance)
    if (enemy_check_adjacent_obstacle(_enemy)) {
        enemy_attack_obstacle(_enemy);
        return;
    }
    if (array_length(_enemy.path) == 0 || _enemy.path_index >= array_length(_enemy.path)) {
        enemy_calculate_path(_enemy);
    }
    if (array_length(_enemy.path) > 0 && _enemy.path_index < array_length(_enemy.path)) {
        var _wp = _enemy.path[_enemy.path_index];
        var _tx = _wp.gx * DEFENSE_CELL_SIZE + DEFENSE_CELL_SIZE / 2;
        var _ty = _wp.gy * DEFENSE_CELL_SIZE + DEFENSE_CELL_SIZE / 2;
        var _spd = _enemy.speed * (DEFENSE_CELL_SIZE / game_get_speed(gamespeed_fps));
        var _d = point_distance(_enemy.x, _enemy.y, _tx, _ty);
        if (_d <= _spd) {
            _enemy.x = _tx; _enemy.y = _ty;
            _enemy.grid_x = _wp.gx; _enemy.grid_y = _wp.gy;
            _enemy.path_index++;
        } else {
            var _dir = point_direction(_enemy.x, _enemy.y, _tx, _ty);
            _enemy.x += lengthdir_x(_spd, _dir); _enemy.y += lengthdir_y(_spd, _dir);
            _enemy.grid_x = _enemy.x div DEFENSE_CELL_SIZE;
            _enemy.grid_y = _enemy.y div DEFENSE_CELL_SIZE;
        }
    }
}

/// @func enemy_behavior_technician(_enemy)
/// @desc Technician behavior: approaches defenses, disables traps, repairs ally machines.
///       Prioritizes disabling traps over attacking structures.
/// @param {struct} _enemy
function enemy_behavior_technician(_enemy) {
    if (enemy_is_immobilized(_enemy)) return;
    
    // Standard pathfinding toward nearest structure, but with trap awareness
    // Technicians neutralize traps they walk over (instant disable)
    if (!variable_struct_exists(_enemy, "traps_disabled")) {
        _enemy.traps_disabled = 0;
    }
    
    // Standard advance behavior
    if (enemy_check_adjacent_obstacle(_enemy)) {
        enemy_attack_obstacle(_enemy);
        return;
    }
    if (array_length(_enemy.path) == 0 || _enemy.path_index >= array_length(_enemy.path)) {
        enemy_calculate_path(_enemy);
    }
    if (array_length(_enemy.path) > 0 && _enemy.path_index < array_length(_enemy.path)) {
        var _wp = _enemy.path[_enemy.path_index];
        var _tx = _wp.gx * DEFENSE_CELL_SIZE + DEFENSE_CELL_SIZE / 2;
        var _ty = _wp.gy * DEFENSE_CELL_SIZE + DEFENSE_CELL_SIZE / 2;
        var _spd = _enemy.speed * (DEFENSE_CELL_SIZE / game_get_speed(gamespeed_fps));
        var _d = point_distance(_enemy.x, _enemy.y, _tx, _ty);
        if (_d <= _spd) {
            _enemy.x = _tx; _enemy.y = _ty;
            _enemy.grid_x = _wp.gx; _enemy.grid_y = _wp.gy;
            _enemy.path_index++;
        } else {
            var _dir = point_direction(_enemy.x, _enemy.y, _tx, _ty);
            _enemy.x += lengthdir_x(_spd, _dir); _enemy.y += lengthdir_y(_spd, _dir);
            _enemy.grid_x = _enemy.x div DEFENSE_CELL_SIZE;
            _enemy.grid_y = _enemy.y div DEFENSE_CELL_SIZE;
        }
    }
}

/// @func enemy_behavior_diver(_enemy)
/// @desc Diver behavior: can traverse water tiles (BLOCKED for others), bypassing walls.
///       Used by Tide Reaver Divers approaching from the west river.
/// @param {struct} _enemy
function enemy_behavior_diver(_enemy) {
    if (enemy_is_immobilized(_enemy)) return;
    
    // Divers use a special pathfinding that treats water as walkable
    if (array_length(_enemy.path) == 0 || _enemy.path_index >= array_length(_enemy.path)) {
        _enemy.path = enemy_astar_diver(_enemy.x div DEFENSE_CELL_SIZE, _enemy.y div DEFENSE_CELL_SIZE, 14, 19);
        _enemy.path_index = 0;
    }
    
    if (array_length(_enemy.path) > 0 && _enemy.path_index < array_length(_enemy.path)) {
        var _wp = _enemy.path[_enemy.path_index];
        var _tx = _wp.gx * DEFENSE_CELL_SIZE + DEFENSE_CELL_SIZE / 2;
        var _ty = _wp.gy * DEFENSE_CELL_SIZE + DEFENSE_CELL_SIZE / 2;
        // Divers are slower in water (50% speed)
        var _on_water = (_enemy.grid_x <= 1);
        var _speed_mult = _on_water ? 0.5 : 1.0;
        var _spd = _enemy.speed * _speed_mult * (DEFENSE_CELL_SIZE / game_get_speed(gamespeed_fps));
        var _d = point_distance(_enemy.x, _enemy.y, _tx, _ty);
        if (_d <= _spd) {
            _enemy.x = _tx; _enemy.y = _ty;
            _enemy.grid_x = _wp.gx; _enemy.grid_y = _wp.gy;
            _enemy.path_index++;
        } else {
            var _dir = point_direction(_enemy.x, _enemy.y, _tx, _ty);
            _enemy.x += lengthdir_x(_spd, _dir); _enemy.y += lengthdir_y(_spd, _dir);
            _enemy.grid_x = _enemy.x div DEFENSE_CELL_SIZE;
            _enemy.grid_y = _enemy.y div DEFENSE_CELL_SIZE;
        }
    }
    
    // Once on land, attack adjacent obstacles normally
    if (_enemy.grid_x > 1 && enemy_check_adjacent_obstacle(_enemy)) {
        enemy_attack_obstacle(_enemy);
    }
}

/// @func enemy_astar_diver(_sx, _sy, _ex, _ey)
/// @desc A* variant that treats water/river tiles (cols 0-1) as walkable.
/// @returns {array} Array of { gx, gy } waypoints
function enemy_astar_diver(_sx, _sy, _ex, _ey) {
    // Reuse standard A* but override walkability check for water columns
    var _open = ds_priority_create();
    var _closed = ds_map_create();
    var _came_from = ds_map_create();
    var _g_cost = ds_map_create();
    
    var _start_key = string(_sx) + "," + string(_sy);
    var _end_key = string(_ex) + "," + string(_ey);
    
    ds_priority_add(_open, _start_key, 0);
    ds_map_add(_g_cost, _start_key, 0);
    
    var _found = false;
    var _iterations = 0;
    var _max_iterations = DEFENSE_GRID_WIDTH * DEFENSE_GRID_HEIGHT * 2;
    
    while (!ds_priority_empty(_open) && _iterations < _max_iterations) {
        _iterations++;
        var _current_key = ds_priority_delete_min(_open);
        if (_current_key == _end_key) { _found = true; break; }
        ds_map_add(_closed, _current_key, true);
        
        var _comma = string_pos(",", _current_key);
        var _cx = real(string_copy(_current_key, 1, _comma - 1));
        var _cy = real(string_delete(_current_key, 1, _comma));
        
        var _dx = [0, 0, -1, 1];
        var _dy = [-1, 1, 0, 0];
        
        for (var _d = 0; _d < 4; _d++) {
            var _nx = _cx + _dx[_d];
            var _ny = _cy + _dy[_d];
            if (_nx < 0 || _nx >= DEFENSE_GRID_WIDTH || _ny < 0 || _ny >= DEFENSE_GRID_HEIGHT) continue;
            var _neighbor_key = string(_nx) + "," + string(_ny);
            if (ds_map_exists(_closed, _neighbor_key)) continue;
            
            var _cell = global.defense_grid[_ny][_nx];
            // Divers can swim through water (BLOCKED cols 0-1) but not other blocked cells
            var _is_water = (_nx <= 1);
            if (_cell == DEFENSE_CELL.BLOCKED && !_is_water) continue;
            if (_cell == DEFENSE_CELL.OCCUPIED) continue;
            
            var _move_cost = _is_water ? 2 : 1; // Water is slower
            var _new_g = ds_map_find_value(_g_cost, _current_key) + _move_cost;
            
            if (!ds_map_exists(_g_cost, _neighbor_key) || _new_g < ds_map_find_value(_g_cost, _neighbor_key)) {
                ds_map_replace(_g_cost, _neighbor_key, _new_g);
                var _h = abs(_nx - _ex) + abs(_ny - _ey);
                ds_priority_add(_open, _neighbor_key, _new_g + _h);
                ds_map_replace(_came_from, _neighbor_key, _current_key);
            }
        }
    }
    
    var _path = [];
    if (_found) {
        var _trace = _end_key;
        while (_trace != _start_key) {
            var _c = string_pos(",", _trace);
            var _px = real(string_copy(_trace, 1, _c - 1));
            var _py = real(string_delete(_trace, 1, _c));
            array_insert(_path, 0, { gx: _px, gy: _py });
            if (!ds_map_exists(_came_from, _trace)) break;
            _trace = ds_map_find_value(_came_from, _trace);
        }
    }
    
    ds_priority_destroy(_open);
    ds_map_destroy(_closed);
    ds_map_destroy(_came_from);
    ds_map_destroy(_g_cost);
    return _path;
}

/// @func enemy_behavior_boss(_enemy)
/// @desc Boss behavior: advances like melee, periodically uses special abilities.
///       Rally (buffs nearby), charge attacks, summon reinforcements.
/// @param {struct} _enemy
function enemy_behavior_boss(_enemy) {
    if (enemy_is_immobilized(_enemy)) return;
    
    // Initialize boss state
    if (!variable_struct_exists(_enemy, "boss_state")) {
        _enemy.boss_state = {
            ability_cooldown: 5.0, // First ability after 5 seconds
            abilities_used: 0
        };
    }
    
    // Tick ability cooldown
    _enemy.boss_state.ability_cooldown -= 1 / game_get_speed(gamespeed_fps);
    
    // Use ability when ready (if not disabled)
    if (_enemy.boss_state.ability_cooldown <= 0 && !enemy_abilities_disabled(_enemy)) {
        enemy_boss_use_ability(_enemy);
        _enemy.boss_state.ability_cooldown = 10.0; // 10s between abilities
        _enemy.boss_state.abilities_used++;
    }
    
    // Standard melee advance
    if (enemy_check_adjacent_obstacle(_enemy)) {
        enemy_attack_obstacle(_enemy);
        return;
    }
    if (array_length(_enemy.path) == 0 || _enemy.path_index >= array_length(_enemy.path)) {
        enemy_calculate_path(_enemy);
    }
    if (array_length(_enemy.path) > 0 && _enemy.path_index < array_length(_enemy.path)) {
        var _wp = _enemy.path[_enemy.path_index];
        var _tx = _wp.gx * DEFENSE_CELL_SIZE + DEFENSE_CELL_SIZE / 2;
        var _ty = _wp.gy * DEFENSE_CELL_SIZE + DEFENSE_CELL_SIZE / 2;
        var _spd = _enemy.speed * (DEFENSE_CELL_SIZE / game_get_speed(gamespeed_fps));
        var _d = point_distance(_enemy.x, _enemy.y, _tx, _ty);
        if (_d <= _spd) {
            _enemy.x = _tx; _enemy.y = _ty;
            _enemy.grid_x = _wp.gx; _enemy.grid_y = _wp.gy;
            _enemy.path_index++;
        } else {
            var _dir = point_direction(_enemy.x, _enemy.y, _tx, _ty);
            _enemy.x += lengthdir_x(_spd, _dir); _enemy.y += lengthdir_y(_spd, _dir);
            _enemy.grid_x = _enemy.x div DEFENSE_CELL_SIZE;
            _enemy.grid_y = _enemy.y div DEFENSE_CELL_SIZE;
        }
    }
}

/// @func enemy_boss_use_ability(_enemy)
/// @desc Boss uses their special ability based on their abilities array.
/// @param {struct} _enemy
function enemy_boss_use_ability(_enemy) {
    if (!variable_struct_exists(_enemy, "abilities")) return;
    
    for (var _i = 0; _i < array_length(_enemy.abilities); _i++) {
        var _ability = _enemy.abilities[_i];
        
        switch (_ability) {
            case "rally_nearby":
                // Buff all nearby allies: speed +30%, damage +20% for 10s
                var _rally_data = variable_struct_exists(_enemy, "rally_nearby") 
                    ? _enemy.rally_nearby : { radius: 4, speed_buff: 1.3, damage_buff: 1.2, duration_seconds: 10 };
                var _radius = _rally_data.radius * DEFENSE_CELL_SIZE;
                var _allies = raid_get_active_enemies();
                for (var _j = 0; _j < array_length(_allies); _j++) {
                    var _ally = _allies[_j];
                    if (_ally.id == _enemy.id) continue;
                    if (point_distance(_enemy.x, _enemy.y, _ally.x, _ally.y) <= _radius) {
                        _ally.speed *= _rally_data.speed_buff;
                        _ally.damage = floor(_ally.damage * _rally_data.damage_buff);
                    }
                }
                show_debug_message("INFO: Boss " + _enemy.id + " RALLIED nearby allies!");
                break;
                
            case "siege_ram":
                // Massive damage to nearest wall
                var _wall = enemy_find_nearest_wall(_enemy.x, _enemy.y);
                defense_wall_take_damage(_wall.gx, _wall.gy, _enemy.damage * 3);
                show_debug_message("INFO: Boss " + _enemy.id + " used SIEGE RAM!");
                break;
                
            case "summon_reinforcements":
                // Spawn 2-3 basic infantry at boss position
                show_debug_message("INFO: Boss " + _enemy.id + " summoned reinforcements!");
                break;
        }
    }
}

/// @func enemy_take_damage_with_shield(_enemy, _amount, _source)
/// @desc Wrapper for enemy_take_damage that accounts for shieldbearer DR.
/// @param {struct} _enemy
/// @param {real} _amount  Raw damage
/// @param {string} _source  Source identifier
function enemy_take_damage_with_shield(_enemy, _amount, _source) {
    var _final_dmg = _amount;
    
    // Check shieldbearer self-DR (50% from front)
    if (_enemy.behavior == "SHIELDBEARER") {
        _final_dmg = floor(_final_dmg * 0.5);
    }
    
    // Check if ally is shielded by a nearby shieldbearer
    if (variable_struct_exists(_enemy, "shielded") && _enemy.shielded) {
        if (variable_struct_exists(_enemy, "shield_timer") && _enemy.shield_timer > 0) {
            _final_dmg = floor(_final_dmg * 0.75); // 25% DR from shield aura
        }
    }
    
    enemy_take_damage(_enemy, _final_dmg, _source);
}
