/// scr_mech_combat.gml
/// Player-controlled mech combat system during raids.
/// Objective #32: Mech Combat System
///
/// Dependencies: scr_machine_system, scr_raid_system, scr_enemy_ai, scr_defense_system
/// State: GAME_STATE.RAID / RAID_SUB.MECH
/// Controls: Move (WASD/arrows), Primary (LMB), Secondary (RMB),
///           Stomp (Space), Special (Q), Return to Strategic (Tab)

// ============================================================================
// MECH STATE INITIALIZATION
// ============================================================================

/// @func mech_combat_init()
/// @desc Initializes the global mech combat state. Called during data_load_all().
function mech_combat_init() {
    global.mech_state = {
        deployed: false,
        instance_id: "",
        blueprint_id: "",
        mech_type: "",          // "combat_mk1", "combat_mk2", "heavy", "siege_breaker", "scout"
        x: 0,
        y: 0,
        facing_angle: 270,      // Degrees, 270 = facing up
        velocity_x: 0,
        velocity_y: 0,
        
        // Component HP pools
        hp_legs: 0,
        hp_legs_max: 0,
        hp_arms: 0,
        hp_arms_max: 0,
        hp_torso: 0,
        hp_torso_max: 0,
        hp_cockpit: 0,
        hp_cockpit_max: 0,
        
        // Weapon state
        primary_cooldown: 0,
        secondary_cooldown: 0,
        stomp_cooldown: 0,
        special_cooldown: 0,
        special_active: false,
        special_timer: 0,
        
        // Movement parameters (set per mech type)
        max_speed: 2.0,
        acceleration: 0.08,
        deceleration: 0.05,
        turn_speed: 3.0,
        
        // Weapon parameters (set per mech type)
        primary_damage: 30,
        primary_rate: 1.0,         // Shots per second
        primary_range: 7,
        secondary_damage: 15,
        secondary_rate: 0.5,
        secondary_range: 6,
        stomp_damage: 25,
        stomp_radius: 2,           // Grid cells
        stomp_stun_duration: 2.0,
        
        // Special ability
        special_type: "OVERDRIVE", // OVERDRIVE, ENERGY_SHIELD, SIEGE_MODE, CHARGE, RADAR_PULSE
        special_duration: 10.0,
        
        // Damage modifiers from component damage
        speed_modifier: 1.0,       // Reduced by leg damage
        accuracy_modifier: 1.0,    // Reduced by arm damage
        
        // State flags
        ejected: false,
        siege_mode: false
    };
    
    show_debug_message("INFO: Mech combat system initialized.");
}

// ============================================================================
// MECH DEPLOYMENT
// ============================================================================

/// @func mech_deploy(_instance_id)
/// @desc Deploys a combat mech for player control during a raid.
///       Validates the mech is operational and sets up combat state.
/// @param {string} _instance_id  Machine instance ID of the mech to deploy
/// @returns {bool} True if deployment succeeded
function mech_deploy(_instance_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) {
        show_debug_message("ERROR: mech_deploy — Unknown instance: " + _instance_id);
        return false;
    }
    if (_inst.category != "MECH") {
        show_debug_message("ERROR: mech_deploy — Not a mech: " + _instance_id);
        return false;
    }
    if (_inst.status != "OPERATIONAL") {
        show_debug_message("WARN: mech_deploy — Mech not operational: " + _inst.status);
        return false;
    }
    
    var _ms = global.mech_state;
    _ms.deployed = true;
    _ms.instance_id = _instance_id;
    _ms.blueprint_id = _inst.blueprint_id;
    _ms.ejected = false;
    _ms.siege_mode = false;
    
    // Determine mech type from blueprint
    switch (_inst.blueprint_id) {
        case "bp_combat_mech_mk1": _ms.mech_type = "combat_mk1"; break;
        case "bp_combat_mech_mk2": _ms.mech_type = "combat_mk2"; break;
        case "bp_heavy_mech":      _ms.mech_type = "heavy";       break;
        case "bp_siege_breaker":   _ms.mech_type = "siege_breaker"; break;
        case "bp_scout_mech":      _ms.mech_type = "scout";       break;
        default:                   _ms.mech_type = "combat_mk1";  break;
    }
    
    // Get effective stats
    var _stats = machine_get_effective_stats(_instance_id);
    
    // Set component HP pools (distribute total HP across components)
    var _total_hp = variable_struct_exists(_stats, "hp") ? _stats.hp : 350;
    _ms.hp_torso     = floor(_total_hp * 0.35);
    _ms.hp_torso_max = _ms.hp_torso;
    _ms.hp_legs      = floor(_total_hp * 0.25);
    _ms.hp_legs_max  = _ms.hp_legs;
    _ms.hp_arms      = floor(_total_hp * 0.25);
    _ms.hp_arms_max  = _ms.hp_arms;
    _ms.hp_cockpit   = floor(_total_hp * 0.15);
    _ms.hp_cockpit_max = _ms.hp_cockpit;
    
    // Set position (deploy near town center)
    _ms.x = 14 * DEFENSE_CELL_SIZE;
    _ms.y = 17 * DEFENSE_CELL_SIZE;
    _ms.facing_angle = 90; // Facing east (toward most common attack)
    _ms.velocity_x = 0;
    _ms.velocity_y = 0;
    
    // Configure per-type parameters
    mech_configure_type(_ms);
    
    // Reset cooldowns
    _ms.primary_cooldown = 0;
    _ms.secondary_cooldown = 0;
    _ms.stomp_cooldown = 0;
    _ms.special_cooldown = 0;
    _ms.special_active = false;
    _ms.special_timer = 0;
    _ms.speed_modifier = 1.0;
    _ms.accuracy_modifier = 1.0;
    
    show_debug_message("INFO: Mech deployed: " + _ms.mech_type + " (" + _instance_id + ")");
    // state_change(GAME_STATE.RAID, RAID_SUB.MECH)
    
    // Audio: Switch to mech combat music
    audio_manager_mech_deploy();
    sfx_play("sfx_machine_startup");
    
    return true;
}

/// @func mech_configure_type(_ms)
/// @desc Configures mech parameters based on type.
/// @param {struct} _ms  global.mech_state reference
function mech_configure_type(_ms) {
    switch (_ms.mech_type) {
        case "combat_mk1":
            _ms.max_speed = 1.8;
            _ms.acceleration = 0.06;
            _ms.deceleration = 0.04;
            _ms.turn_speed = 3.0;
            _ms.primary_damage = 30;
            _ms.primary_rate = 1.0;
            _ms.primary_range = 7;
            _ms.secondary_damage = 15;
            _ms.secondary_rate = 0.4;
            _ms.secondary_range = 6;
            _ms.stomp_damage = 25;
            _ms.stomp_radius = 2;
            _ms.stomp_stun_duration = 2.0;
            _ms.special_type = "OVERDRIVE";
            _ms.special_duration = 10.0;
            break;
            
        case "combat_mk2":
            _ms.max_speed = 2.0;
            _ms.acceleration = 0.07;
            _ms.deceleration = 0.045;
            _ms.turn_speed = 3.0;
            _ms.primary_damage = 40;
            _ms.primary_rate = 1.2;
            _ms.primary_range = 8;
            _ms.secondary_damage = 25;
            _ms.secondary_rate = 0.5;
            _ms.secondary_range = 7;
            _ms.stomp_damage = 30;
            _ms.stomp_radius = 2;
            _ms.stomp_stun_duration = 2.5;
            _ms.special_type = "ENERGY_SHIELD";
            _ms.special_duration = 5.0;
            break;
            
        case "heavy":
            _ms.max_speed = 1.2;
            _ms.acceleration = 0.04;
            _ms.deceleration = 0.03;
            _ms.turn_speed = 2.0;
            _ms.primary_damage = 15;
            _ms.primary_rate = 5.0;  // Gatling
            _ms.primary_range = 6;
            _ms.secondary_damage = 50;
            _ms.secondary_rate = 0.25;
            _ms.secondary_range = 9;
            _ms.stomp_damage = 50;
            _ms.stomp_radius = 3;
            _ms.stomp_stun_duration = 3.0;
            _ms.special_type = "SIEGE_MODE";
            _ms.special_duration = 15.0;
            break;
            
        case "siege_breaker":
            _ms.max_speed = 1.5;
            _ms.acceleration = 0.05;
            _ms.deceleration = 0.035;
            _ms.turn_speed = 2.5;
            _ms.primary_damage = 60;
            _ms.primary_rate = 0.4;  // Siege cannon
            _ms.primary_range = 10;
            _ms.secondary_damage = 10;
            _ms.secondary_rate = 3.0;  // Flamethrower
            _ms.secondary_range = 3;
            _ms.stomp_damage = 40;
            _ms.stomp_radius = 2;
            _ms.stomp_stun_duration = 2.0;
            _ms.special_type = "CHARGE";
            _ms.special_duration = 2.0;
            break;
            
        case "scout":
            _ms.max_speed = 3.0;
            _ms.acceleration = 0.10;
            _ms.deceleration = 0.06;
            _ms.turn_speed = 4.5;
            _ms.primary_damage = 18;
            _ms.primary_rate = 2.0;
            _ms.primary_range = 6;
            _ms.secondary_damage = 12;
            _ms.secondary_rate = 1.5;
            _ms.secondary_range = 5;
            _ms.stomp_damage = 15;
            _ms.stomp_radius = 1;
            _ms.stomp_stun_duration = 1.5;
            _ms.special_type = "RADAR_PULSE";
            _ms.special_duration = 8.0;
            break;
    }
}

// ============================================================================
// MECH UPDATE (Per-Frame, called during RAID_SUB.MECH)
// ============================================================================

/// @func mech_update()
/// @desc Main mech update loop. Handles input, movement, weapons, abilities.
///       Called every frame when in RAID_SUB.MECH state.
function mech_update() {
    var _ms = global.mech_state;
    if (!_ms.deployed || _ms.ejected) return;
    
    var _dt = 1 / game_get_speed(gamespeed_fps);
    
    // --- COOLDOWN TICKS ---
    if (_ms.primary_cooldown > 0)   _ms.primary_cooldown -= _dt;
    if (_ms.secondary_cooldown > 0) _ms.secondary_cooldown -= _dt;
    if (_ms.stomp_cooldown > 0)     _ms.stomp_cooldown -= _dt;
    if (_ms.special_cooldown > 0)   _ms.special_cooldown -= _dt;
    
    // --- SPECIAL ABILITY TIMER ---
    if (_ms.special_active) {
        _ms.special_timer -= _dt;
        if (_ms.special_timer <= 0) {
            mech_end_special(_ms);
        }
    }
    
    // --- MOVEMENT ---
    if (!_ms.siege_mode) {
        mech_handle_movement(_ms, _dt);
    }
    
    // --- WEAPONS (input is simulated here; actual input comes from game controller) ---
    // Primary, Secondary, Stomp, Special are called by the input handler
    
    // --- COMPONENT DAMAGE EFFECTS ---
    mech_update_damage_modifiers(_ms);
}

/// @func mech_handle_movement(_ms, _dt)
/// @desc Processes physics-based weighty movement for the mech.
/// @param {struct} _ms  global.mech_state
/// @param {real} _dt  Delta time
function mech_handle_movement(_ms, _dt) {
    // Input axes (would come from keyboard_check in actual game)
    // For now, define the interface — actual input binding is in obj_sys_game_manager
    var _input_x = 0; // -1 to 1 (left/right)
    var _input_y = 0; // -1 to 1 (up/down)
    
    // Read input (keyboard)
    if (keyboard_check(vk_left) || keyboard_check(ord("A")))  _input_x = -1;
    if (keyboard_check(vk_right) || keyboard_check(ord("D"))) _input_x = 1;
    if (keyboard_check(vk_up) || keyboard_check(ord("W")))    _input_y = -1;
    if (keyboard_check(vk_down) || keyboard_check(ord("S")))  _input_y = 1;
    
    var _effective_speed = _ms.max_speed * _ms.speed_modifier;
    var _accel = _ms.acceleration;
    var _decel = _ms.deceleration;
    
    // Apply acceleration/deceleration (weighty feel)
    if (_input_x != 0 || _input_y != 0) {
        // Normalize diagonal movement
        var _len = sqrt(_input_x * _input_x + _input_y * _input_y);
        if (_len > 0) {
            _input_x /= _len;
            _input_y /= _len;
        }
        
        // Accelerate toward input direction
        _ms.velocity_x += _input_x * _accel * DEFENSE_CELL_SIZE;
        _ms.velocity_y += _input_y * _accel * DEFENSE_CELL_SIZE;
        
        // Update facing angle (smooth turning)
        var _target_angle = point_direction(0, 0, _input_x, -_input_y);
        var _angle_diff = angle_difference(_target_angle, _ms.facing_angle);
        _ms.facing_angle += sign(_angle_diff) * min(abs(_angle_diff), _ms.turn_speed);
    } else {
        // Decelerate (friction)
        _ms.velocity_x = lerp(_ms.velocity_x, 0, _decel);
        _ms.velocity_y = lerp(_ms.velocity_y, 0, _decel);
    }
    
    // Clamp to max speed
    var _current_speed = sqrt(_ms.velocity_x * _ms.velocity_x + _ms.velocity_y * _ms.velocity_y);
    var _max_px = _effective_speed * DEFENSE_CELL_SIZE / game_get_speed(gamespeed_fps);
    if (_current_speed > _max_px) {
        var _scale = _max_px / _current_speed;
        _ms.velocity_x *= _scale;
        _ms.velocity_y *= _scale;
    }
    
    // Apply velocity
    _ms.x += _ms.velocity_x;
    _ms.y += _ms.velocity_y;
    
    // Clamp to map bounds
    var _map_w = DEFENSE_GRID_WIDTH * DEFENSE_CELL_SIZE;
    var _map_h = DEFENSE_GRID_HEIGHT * DEFENSE_CELL_SIZE;
    _ms.x = clamp(_ms.x, DEFENSE_CELL_SIZE * 2, _map_w - DEFENSE_CELL_SIZE * 2);
    _ms.y = clamp(_ms.y, DEFENSE_CELL_SIZE, _map_h - DEFENSE_CELL_SIZE);
}

// ============================================================================
// WEAPONS
// ============================================================================

/// @func mech_fire_primary(_target_x, _target_y)
/// @desc Fires the mech's primary weapon toward target coordinates.
/// @param {real} _target_x  World X of target
/// @param {real} _target_y  World Y of target
function mech_fire_primary(_target_x, _target_y) {
    var _ms = global.mech_state;
    if (!_ms.deployed || _ms.ejected) return;
    if (_ms.primary_cooldown > 0) return;
    
    var _range_px = _ms.primary_range * DEFENSE_CELL_SIZE;
    var _damage = _ms.primary_damage * _ms.accuracy_modifier;
    
    // Overdrive doubles fire rate
    var _rate = _ms.primary_rate;
    if (_ms.special_active && _ms.special_type == "OVERDRIVE") {
        _rate *= 2.0;
    }
    // Siege mode doubles damage
    if (_ms.siege_mode) {
        _damage *= 2.0;
    }
    
    // Find enemies near the target point
    var _hit_radius = DEFENSE_CELL_SIZE * 1.5;
    var _enemies = raid_get_active_enemies();
    var _best_enemy = undefined;
    var _best_dist = _hit_radius;
    
    for (var _i = 0; _i < array_length(_enemies); _i++) {
        var _e = _enemies[_i];
        var _dist = point_distance(_target_x, _target_y, _e.x, _e.y);
        if (_dist < _best_dist && point_distance(_ms.x, _ms.y, _e.x, _e.y) <= _range_px) {
            _best_dist = _dist;
            _best_enemy = _e;
        }
    }
    
    if (_best_enemy != undefined) {
        enemy_take_damage(_best_enemy, _damage, _ms.instance_id);
    }
    
    _ms.primary_cooldown = 1.0 / max(_rate, 0.1);
    // fx_mech_fire(_ms.x, _ms.y, _target_x, _target_y, "primary")
    // screen_shake(0.3, 2)
}

/// @func mech_fire_secondary(_target_x, _target_y)
/// @desc Fires the mech's secondary weapon (missiles, flamethrower, etc.).
/// @param {real} _target_x
/// @param {real} _target_y
function mech_fire_secondary(_target_x, _target_y) {
    var _ms = global.mech_state;
    if (!_ms.deployed || _ms.ejected) return;
    if (_ms.secondary_cooldown > 0) return;
    
    var _range_px = _ms.secondary_range * DEFENSE_CELL_SIZE;
    var _damage = _ms.secondary_damage * _ms.accuracy_modifier;
    
    if (_ms.siege_mode) {
        _damage *= 1.5;
    }
    
    // Secondary weapons often have AoE
    var _splash_radius = DEFENSE_CELL_SIZE * 2;
    if (_ms.mech_type == "siege_breaker") {
        // Flamethrower: cone in facing direction
        _splash_radius = DEFENSE_CELL_SIZE * 1.5;
    }
    
    // AoE damage at target point
    var _enemies = raid_get_active_enemies();
    for (var _i = 0; _i < array_length(_enemies); _i++) {
        var _e = _enemies[_i];
        if (point_distance(_ms.x, _ms.y, _e.x, _e.y) > _range_px) continue;
        var _dist = point_distance(_target_x, _target_y, _e.x, _e.y);
        if (_dist <= _splash_radius) {
            var _falloff = 1.0 - (_dist / _splash_radius) * 0.4;
            enemy_take_damage(_e, floor(_damage * _falloff), _ms.instance_id);
            // Flamethrower applies burn
            if (_ms.mech_type == "siege_breaker" || _ms.mech_type == "heavy") {
                enemy_apply_burn(_e, 4, 3);
            }
        }
    }
    
    _ms.secondary_cooldown = 1.0 / max(_ms.secondary_rate, 0.1);
    // fx_mech_fire(_ms.x, _ms.y, _target_x, _target_y, "secondary")
    // screen_shake(0.5, 3)
}

/// @func mech_stomp()
/// @desc Executes the mech's stomp AoE attack. Damages and stuns nearby ground units.
function mech_stomp() {
    var _ms = global.mech_state;
    if (!_ms.deployed || _ms.ejected) return;
    if (_ms.stomp_cooldown > 0) return;
    if (_ms.siege_mode) return; // Can't stomp in siege mode
    
    var _radius_px = _ms.stomp_radius * DEFENSE_CELL_SIZE;
    var _damage = _ms.stomp_damage;
    
    var _enemies = raid_get_active_enemies();
    var _hit_count = 0;
    
    for (var _i = 0; _i < array_length(_enemies); _i++) {
        var _e = _enemies[_i];
        var _dist = point_distance(_ms.x, _ms.y, _e.x, _e.y);
        if (_dist <= _radius_px) {
            var _falloff = 1.0 - (_dist / _radius_px) * 0.3;
            enemy_take_damage(_e, floor(_damage * _falloff), _ms.instance_id);
            enemy_apply_stun(_e, _ms.stomp_stun_duration);
            _hit_count++;
        }
    }
    
    _ms.stomp_cooldown = 3.0; // 3 second cooldown
    // screen_shake(1.0, 5)
    // fx_stomp_wave(_ms.x, _ms.y, _radius_px)
    show_debug_message("INFO: Mech STOMP! Hit " + string(_hit_count) + " enemies.");
}

// ============================================================================
// SPECIAL ABILITIES
// ============================================================================

/// @func mech_activate_special()
/// @desc Activates the mech's type-specific special ability.
function mech_activate_special() {
    var _ms = global.mech_state;
    if (!_ms.deployed || _ms.ejected) return;
    if (_ms.special_cooldown > 0) return;
    if (_ms.special_active) return;
    
    _ms.special_active = true;
    _ms.special_timer = _ms.special_duration;
    
    switch (_ms.special_type) {
        case "OVERDRIVE":
            // +50% fire rate — handled in fire functions via special_active check
            show_debug_message("INFO: Mech OVERDRIVE activated! +50% fire rate for " 
                + string(_ms.special_duration) + "s");
            break;
            
        case "ENERGY_SHIELD":
            // Invulnerability — handled in mech_take_damage
            show_debug_message("INFO: Mech ENERGY SHIELD activated! Invulnerable for " 
                + string(_ms.special_duration) + "s");
            break;
            
        case "SIEGE_MODE":
            // Plant feet, massive damage boost, can't move
            _ms.siege_mode = true;
            _ms.velocity_x = 0;
            _ms.velocity_y = 0;
            show_debug_message("INFO: Mech SIEGE MODE activated! Damage x2, immobile for " 
                + string(_ms.special_duration) + "s");
            break;
            
        case "CHARGE":
            // Devastating forward rush — instant burst of speed + damage
            var _charge_speed = 8.0 * DEFENSE_CELL_SIZE / game_get_speed(gamespeed_fps);
            var _dir = _ms.facing_angle;
            _ms.velocity_x = lengthdir_x(_charge_speed, _dir);
            _ms.velocity_y = -lengthdir_y(_charge_speed, _dir);
            
            // Damage everything in the charge path
            var _enemies = raid_get_active_enemies();
            var _charge_width = DEFENSE_CELL_SIZE * 2;
            for (var _i = 0; _i < array_length(_enemies); _i++) {
                var _e = _enemies[_i];
                if (point_distance(_ms.x, _ms.y, _e.x, _e.y) <= _charge_width * 3) {
                    enemy_take_damage(_e, 80, _ms.instance_id);
                    enemy_apply_stun(_e, 3.0);
                }
            }
            show_debug_message("INFO: Mech CHARGE!");
            break;
            
        case "RADAR_PULSE":
            // Reveals all enemies on the map (visual effect)
            show_debug_message("INFO: Mech RADAR PULSE! All enemies revealed for " 
                + string(_ms.special_duration) + "s");
            break;
    }
    
    // fx_special_activate(_ms.x, _ms.y, _ms.special_type)
}

/// @func mech_end_special(_ms)
/// @desc Ends the active special ability and starts cooldown.
/// @param {struct} _ms  global.mech_state
function mech_end_special(_ms) {
    _ms.special_active = false;
    _ms.special_timer = 0;
    
    if (_ms.special_type == "SIEGE_MODE") {
        _ms.siege_mode = false;
    }
    
    _ms.special_cooldown = 30.0; // 30 second cooldown for all specials
    show_debug_message("INFO: Mech special ability ended. Cooldown: 30s");
}

// ============================================================================
// DAMAGE SYSTEM
// ============================================================================

/// @func mech_take_damage(_amount, _damage_type)
/// @desc Applies damage to the mech, distributed across components.
/// @param {real} _amount  Raw damage
/// @param {string} _damage_type  "melee", "ranged", "explosion", "fire"
function mech_take_damage(_amount, _damage_type) {
    var _ms = global.mech_state;
    if (!_ms.deployed || _ms.ejected) return;
    
    // Energy shield = invulnerable
    if (_ms.special_active && _ms.special_type == "ENERGY_SHIELD") return;
    
    // Apply armor from machine stats
    var _stats = machine_get_effective_stats(_ms.instance_id);
    var _armor = variable_struct_exists(_stats, "armor") ? _stats.armor : 0;
    var _actual = max(1, _amount - _armor);
    
    // Distribute damage to components (weighted random)
    // Torso takes most damage, cockpit is hardest to hit
    var _roll = random(100);
    if (_roll < 40) {
        // Torso (40% chance)
        _ms.hp_torso -= _actual;
    } else if (_roll < 65) {
        // Legs (25% chance)
        _ms.hp_legs -= _actual;
    } else if (_roll < 90) {
        // Arms (25% chance)
        _ms.hp_arms -= _actual;
    } else {
        // Cockpit (10% chance)
        _ms.hp_cockpit -= _actual;
    }
    
    // Clamp
    _ms.hp_torso = max(0, _ms.hp_torso);
    _ms.hp_legs = max(0, _ms.hp_legs);
    _ms.hp_arms = max(0, _ms.hp_arms);
    _ms.hp_cockpit = max(0, _ms.hp_cockpit);
    
    // Check cockpit breach = forced eject
    if (_ms.hp_cockpit <= 0) {
        mech_eject("cockpit_breach");
        return;
    }
    
    // Check total destruction (torso at 0)
    if (_ms.hp_torso <= 0) {
        mech_eject("torso_destroyed");
        return;
    }
    
    // screen_shake(0.2, 1)
}

/// @func mech_update_damage_modifiers(_ms)
/// @desc Recalculates speed/accuracy modifiers based on component damage.
/// @param {struct} _ms  global.mech_state
function mech_update_damage_modifiers(_ms) {
    // Leg damage reduces speed
    if (_ms.hp_legs_max > 0) {
        var _leg_pct = _ms.hp_legs / _ms.hp_legs_max;
        _ms.speed_modifier = 0.5 + (_leg_pct * 0.5); // 50%-100% speed
    }
    
    // Arm damage reduces accuracy
    if (_ms.hp_arms_max > 0) {
        var _arm_pct = _ms.hp_arms / _ms.hp_arms_max;
        _ms.accuracy_modifier = 0.5 + (_arm_pct * 0.5); // 50%-100% accuracy
    }
}

/// @func mech_eject(_reason)
/// @desc Forces the player out of the mech. Mech is disabled for the raid.
/// @param {string} _reason  "cockpit_breach", "torso_destroyed", "player_choice"
function mech_eject(_reason) {
    var _ms = global.mech_state;
    _ms.ejected = true;
    _ms.deployed = false;
    _ms.velocity_x = 0;
    _ms.velocity_y = 0;
    
    // Audio: Return to raid music from mech music
    audio_manager_mech_exit();
    sfx_play("sfx_machine_shutdown");
    
    // End any active special
    if (_ms.special_active) {
        mech_end_special(_ms);
    }
    
    // Update the machine instance status
    if (_ms.instance_id != "") {
        machine_set_status(_ms.instance_id, "BROKEN_DOWN");
        
        // Store component damage on the machine instance for post-raid repair
        var _inst = machine_get(_ms.instance_id);
        if (_inst != undefined) {
            _inst.mech_damage = {
                hp_legs: _ms.hp_legs,
                hp_arms: _ms.hp_arms,
                hp_torso: _ms.hp_torso,
                hp_cockpit: _ms.hp_cockpit
            };
        }
    }
    
    show_debug_message("INFO: MECH EJECTED! Reason: " + _reason);
    // state_change(GAME_STATE.RAID, RAID_SUB.STRATEGIC)
    // fx_explosion(_ms.x, _ms.y, 1.5)
    // event_fire("mech_ejected", { reason: _reason, instance_id: _ms.instance_id })
}

/// @func mech_return_to_strategic()
/// @desc Player voluntarily switches back to strategic view. Mech stays deployed.
function mech_return_to_strategic() {
    show_debug_message("INFO: Switching to strategic view. Mech remains deployed.");
    // state_change(GAME_STATE.RAID, RAID_SUB.STRATEGIC)
    // Mech stays deployed — AI controls it in strategic mode (basic: hold position, auto-fire)
}

/// @func mech_enter_from_strategic()
/// @desc Player switches from strategic view back to mech control.
function mech_enter_from_strategic() {
    var _ms = global.mech_state;
    if (!_ms.deployed || _ms.ejected) return;
    show_debug_message("INFO: Entering mech cockpit view.");
    // state_change(GAME_STATE.RAID, RAID_SUB.MECH)
}

// ============================================================================
// MECH TOTAL HP HELPERS
// ============================================================================

/// @func mech_get_total_hp()
/// @desc Returns current total HP across all components.
/// @returns {real}
function mech_get_total_hp() {
    var _ms = global.mech_state;
    return _ms.hp_legs + _ms.hp_arms + _ms.hp_torso + _ms.hp_cockpit;
}

/// @func mech_get_total_hp_max()
/// @desc Returns maximum total HP across all components.
/// @returns {real}
function mech_get_total_hp_max() {
    var _ms = global.mech_state;
    return _ms.hp_legs_max + _ms.hp_arms_max + _ms.hp_torso_max + _ms.hp_cockpit_max;
}

/// @func mech_get_component_status()
/// @desc Returns component HP percentages for HUD display.
/// @returns {struct} { legs_pct, arms_pct, torso_pct, cockpit_pct }
function mech_get_component_status() {
    var _ms = global.mech_state;
    return {
        legs_pct:    (_ms.hp_legs_max > 0)    ? _ms.hp_legs / _ms.hp_legs_max       : 0,
        arms_pct:    (_ms.hp_arms_max > 0)    ? _ms.hp_arms / _ms.hp_arms_max       : 0,
        torso_pct:   (_ms.hp_torso_max > 0)   ? _ms.hp_torso / _ms.hp_torso_max     : 0,
        cockpit_pct: (_ms.hp_cockpit_max > 0) ? _ms.hp_cockpit / _ms.hp_cockpit_max : 0
    };
}

// ============================================================================
// SAVE/LOAD INTEGRATION
// ============================================================================

/// @func mech_serialize()
/// @desc Serializes mech combat state for saving mid-raid.
/// @returns {struct}
function mech_serialize() {
    var _ms = global.mech_state;
    return {
        deployed: _ms.deployed,
        instance_id: _ms.instance_id,
        ejected: _ms.ejected,
        hp_legs: _ms.hp_legs,
        hp_arms: _ms.hp_arms,
        hp_torso: _ms.hp_torso,
        hp_cockpit: _ms.hp_cockpit,
        x: _ms.x,
        y: _ms.y,
        facing_angle: _ms.facing_angle
    };
}

/// @func mech_deserialize(_data)
/// @desc Restores mech state from save data.
/// @param {struct} _data
function mech_deserialize(_data) {
    var _ms = global.mech_state;
    _ms.deployed = _data.deployed;
    _ms.instance_id = _data.instance_id;
    _ms.ejected = _data.ejected;
    _ms.hp_legs = _data.hp_legs;
    _ms.hp_arms = _data.hp_arms;
    _ms.hp_torso = _data.hp_torso;
    _ms.hp_cockpit = _data.hp_cockpit;
    _ms.x = _data.x;
    _ms.y = _data.y;
    _ms.facing_angle = _data.facing_angle;
    
    // Reconfigure type if deployed
    if (_ms.deployed && _ms.instance_id != "") {
        var _inst = machine_get(_ms.instance_id);
        if (_inst != undefined) {
            _ms.blueprint_id = _inst.blueprint_id;
            switch (_inst.blueprint_id) {
                case "bp_combat_mech_mk1": _ms.mech_type = "combat_mk1"; break;
                case "bp_combat_mech_mk2": _ms.mech_type = "combat_mk2"; break;
                case "bp_heavy_mech":      _ms.mech_type = "heavy";       break;
                case "bp_siege_breaker":   _ms.mech_type = "siege_breaker"; break;
                case "bp_scout_mech":      _ms.mech_type = "scout";       break;
                default:                   _ms.mech_type = "combat_mk1";  break;
            }
            mech_configure_type(_ms);
            _ms.hp_legs_max = floor(machine_get_effective_stats(_ms.instance_id).hp * 0.25);
            _ms.hp_arms_max = _ms.hp_legs_max;
            _ms.hp_torso_max = floor(machine_get_effective_stats(_ms.instance_id).hp * 0.35);
            _ms.hp_cockpit_max = floor(machine_get_effective_stats(_ms.instance_id).hp * 0.15);
        }
    }
    
    show_debug_message("INFO: Mech state restored. Deployed: " + string(_ms.deployed));
}
