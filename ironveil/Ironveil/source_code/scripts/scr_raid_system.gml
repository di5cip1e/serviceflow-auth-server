/// scr_raid_system.gml
/// Raid lifecycle manager: scheduling, intel, wave spawning, victory/defeat.
/// Objective #23: Tower Defense Raid System
///
/// Dependencies: scr_defense_system, scr_enemy_ai, scr_turret_system,
///               scr_data, scr_machine_system, scr_time_system
/// State: GAME_STATE.RAID with sub-states PREP, STRATEGIC, MECH, AFTERMATH

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func raid_system_init()
/// @desc Loads raid schedule data and initializes the raid manager.
///       Called during data_load_all().
function raid_system_init() {
    // Load raid schedules (all years)
    global.raid_data_year1 = data_load_file("data/raids/raids_year1.json");
    global.raid_data_year2 = data_load_file("data/raids/raids_year2.json");
    global.raid_data_year3 = data_load_file("data/raids/raids_year3.json");
    
    // Load enemy data (all factions)
    global.enemy_data = {};
    var _enemy_files = [
        "data/enemies/enemies_freelance.json",
        "data/enemies/enemies_rust_wolves.json",
        "data/enemies/enemies_iron_marauders.json",
        "data/enemies/enemies_tide_reavers.json"
    ];
    for (var _i = 0; _i < array_length(_enemy_files); _i++) {
        var _file_data = data_load_file(_enemy_files[_i]);
        if (_file_data != undefined) {
            // Remove metadata
            if (variable_struct_exists(_file_data, "_meta")) {
                variable_struct_remove(_file_data, "_meta");
            }
            // Merge into global enemy data
            var _keys = variable_struct_get_names(_file_data);
            for (var _j = 0; _j < array_length(_keys); _j++) {
                global.enemy_data[$ _keys[_j]] = _file_data[$ _keys[_j]];
            }
        }
    }
    
    // Raid state tracking
    global.raid_state = {
        active: false,
        current_raid_id: "",
        current_raid_data: undefined,
        phase: "NONE",           // NONE, INTEL, PREP, COMBAT, AFTERMATH
        intel_days_remaining: 0,
        current_wave: 0,
        total_waves: 0,
        wave_timer: 0,
        wave_pause_timer: 0,
        enemies_alive: 0,
        enemies_killed: 0,
        enemies_total_spawned: 0,
        structures_destroyed: 0,
        town_center_breached: false,
        salvage_collected: [],
        // M3: Difficulty modifiers
        modifiers: {
            night: false,
            storm: false,
            fog: false,
            coordinated: false
        },
        // M3: Raid objective
        objective: "ASSAULT"     // ASSAULT, THEFT, SABOTAGE, KIDNAP, SIEGE, BOSS
    };
    
    // Initialize mech combat system
    mech_combat_init();
    
    // Track which raids have been completed
    global.raids_completed = ds_map_create();
    
    show_debug_message("INFO: Raid system initialized. " 
        + string(array_length(variable_struct_get_names(global.enemy_data))) + " enemy types loaded.");
}

// ============================================================================
// DAILY SCHEDULING CHECK
// ============================================================================

/// @func raid_check_scheduled()
/// @desc Called daily (from time_advance_day). Checks if a raid should trigger.
///       Compares current date against raid schedule for the current year.
function raid_check_scheduled() {
    // Don't schedule during an active raid
    if (global.raid_state.active) return;
    
    // Get the appropriate year schedule
    var _raid_schedule = undefined;
    switch (global.time_year) {
        case 1: _raid_schedule = global.raid_data_year1; break;
        case 2: _raid_schedule = global.raid_data_year2; break;
        default: _raid_schedule = global.raid_data_year3; break; // Year 3+ uses year 3 schedule
    }
    
    if (_raid_schedule == undefined) return;
    if (!variable_struct_exists(_raid_schedule, "raids")) return;
    
    var _raids = _raid_schedule.raids;
    for (var _i = 0; _i < array_length(_raids); _i++) {
        var _raid = _raids[_i];
        
        // Skip already completed raids
        if (ds_map_exists(global.raids_completed, _raid.raid_id)) continue;
        
        // Only check scheduled raids
        if (_raid.trigger_type != "SCHEDULED") continue;
        
        var _trigger = _raid.trigger_date;
        
        // Check if we should start the intel phase
        // Intel starts warning_days before the raid date
        var _intel_start_day = _trigger.day - _raid.warning_days;
        
        if (global.time_season == _trigger.season && global.time_day == _intel_start_day) {
            raid_schedule(_raid.raid_id, _raid.warning_days);
            return; // Only one raid at a time
        }
    }
}

/// @func raid_schedule(_raid_id, _warning_days)
/// @desc Triggers the intel phase for an upcoming raid.
/// @param {string} _raid_id  Raid identifier from schedule JSON
/// @param {int} _warning_days  Days of warning before combat begins
function raid_schedule(_raid_id, _warning_days) {
    // Find raid data
    var _raid_data = raid_find_data(_raid_id);
    if (_raid_data == undefined) {
        show_debug_message("ERROR: raid_schedule — Unknown raid: " + _raid_id);
        return;
    }
    
    global.raid_state.active = true;
    global.raid_state.current_raid_id = _raid_id;
    global.raid_state.current_raid_data = _raid_data;
    global.raid_state.phase = "INTEL";
    global.raid_state.intel_days_remaining = _warning_days;
    
    // Fire intel event — Harrow delivers the warning
    // event_fire("raid_intel", { 
    //     raid_id: _raid_id, 
    //     message: _raid_data.intel_message,
    //     directions: _raid_data.directions,
    //     faction: _raid_data.faction,
    //     size: _raid_data.size,
    //     days_until: _warning_days
    // })
    
    show_debug_message("INFO: RAID INTEL — " + _raid_data.intel_message 
        + " [" + _raid_data.size + " from " + string(_raid_data.directions) 
        + " in " + string(_warning_days) + " days]");
}

/// @func raid_find_data(_raid_id)
/// @desc Searches all loaded raid schedules for a specific raid definition.
/// @param {string} _raid_id
/// @returns {struct|undefined}
function raid_find_data(_raid_id) {
    // Search all years
    var _schedules = [global.raid_data_year1, global.raid_data_year2, global.raid_data_year3];
    for (var _s = 0; _s < array_length(_schedules); _s++) {
        var _schedule = _schedules[_s];
        if (_schedule != undefined && variable_struct_exists(_schedule, "raids")) {
            var _raids = _schedule.raids;
            for (var _i = 0; _i < array_length(_raids); _i++) {
                if (_raids[_i].raid_id == _raid_id) return _raids[_i];
            }
        }
    }
    return undefined;
}

/// @func raid_intel_day_advance()
/// @desc Called daily during intel phase. Counts down to raid start.
function raid_intel_day_advance() {
    if (global.raid_state.phase != "INTEL") return;
    
    global.raid_state.intel_days_remaining--;
    
    if (global.raid_state.intel_days_remaining <= 0) {
        // Transition to preparation phase
        raid_enter_prep();
    } else {
        show_debug_message("INFO: Raid in " + string(global.raid_state.intel_days_remaining) + " days.");
    }
}

// ============================================================================
// RAID PHASES
// ============================================================================

/// @func raid_enter_prep()
/// @desc Transitions to the preparation phase. Player places defenses.
function raid_enter_prep() {
    global.raid_state.phase = "PREP";
    
    // Initialize defense grid
    defense_grid_init();
    
    // Change game state
    // state_change(GAME_STATE.RAID, RAID_SUB.PREP)
    
    show_debug_message("INFO: RAID PREP PHASE — Place your defenses!");
    // event_fire("raid_prep_start", { raid_id: global.raid_state.current_raid_id })
}

/// @func raid_start_combat()
/// @desc Transitions from prep to combat. Called when player confirms ready.
function raid_start_combat() {
    if (global.raid_state.phase != "PREP") return;
    
    var _raid = global.raid_state.current_raid_data;
    
    global.raid_state.phase = "COMBAT";
    
    // Audio: Start raid music based on faction
    var _faction_key = variable_struct_exists(_raid, "faction") ? _raid.faction : "default";
    audio_manager_raid_start(_faction_key);
    
    global.raid_state.current_wave = 0;
    global.raid_state.total_waves = array_length(_raid.waves);
    global.raid_state.wave_timer = 0;
    global.raid_state.wave_pause_timer = 0;
    global.raid_state.enemies_alive = 0;
    global.raid_state.enemies_killed = 0;
    global.raid_state.enemies_total_spawned = 0;
    global.raid_state.structures_destroyed = 0;
    global.raid_state.town_center_breached = false;
    
    // Initialize active enemies list
    global.raid_enemies = ds_list_create();
    
    // state_change(GAME_STATE.RAID, RAID_SUB.STRATEGIC)
    
    // Spawn first wave immediately
    raid_spawn_wave(0);
    
    show_debug_message("INFO: RAID COMBAT STARTED — " + string(global.raid_state.total_waves) + " waves incoming!");
}

/// @func raid_spawn_wave(_wave_index)
/// @desc Spawns all enemies defined in a wave.
/// @param {int} _wave_index  Index into the raid's waves array
function raid_spawn_wave(_wave_index) {
    var _raid = global.raid_state.current_raid_data;
    if (_wave_index >= array_length(_raid.waves)) return;
    
    var _wave = _raid.waves[_wave_index];
    global.raid_state.current_wave = _wave_index;
    
    // Audio: Escalate raid music layers based on wave progression
    audio_manager_raid_escalate(_wave_index);
    
    show_debug_message("INFO: Spawning wave " + string(_wave_index + 1) 
        + "/" + string(global.raid_state.total_waves));
    
    for (var _i = 0; _i < array_length(_wave.enemies); _i++) {
        var _spawn_def = _wave.enemies[_i];
        var _enemy_template = global.enemy_data[$ _spawn_def.enemy_id];
        
        if (_enemy_template == undefined) {
            show_debug_message("WARN: Unknown enemy type: " + _spawn_def.enemy_id);
            continue;
        }
        
        // Determine spawn position based on direction
        var _spawn_positions = raid_get_spawn_positions(_spawn_def.spawn_direction, _spawn_def.count);
        
        for (var _e = 0; _e < _spawn_def.count; _e++) {
            var _sp = _spawn_positions[_e];
            
            // Create enemy instance
            var _enemy = {
                id: "enemy_" + string(global.raid_state.enemies_total_spawned),
                template_id: _spawn_def.enemy_id,
                faction: _enemy_template.faction,
                type: _enemy_template.type,
                hp: _enemy_template.base_stats.hp,
                max_hp: _enemy_template.base_stats.hp,
                speed: _enemy_template.base_stats.speed,
                damage: _enemy_template.base_stats.damage,
                armor: _enemy_template.base_stats.armor,
                attack_range: _enemy_template.base_stats.attack_range,
                behavior: _enemy_template.behavior,
                target_priority: _enemy_template.target_priority,
                x: _sp.x,
                y: _sp.y,
                grid_x: _sp.x div DEFENSE_CELL_SIZE,
                grid_y: _sp.y div DEFENSE_CELL_SIZE,
                path: [],
                path_index: 0,
                attack_target: undefined,
                attack_cooldown: 0,
                alive: true,
                loot_table: _enemy_template.loot_table
            };
            
            // Copy special stats if present
            if (variable_struct_exists(_enemy_template.base_stats, "damage_vs_walls_mult")) {
                _enemy.damage_vs_walls_mult = _enemy_template.base_stats.damage_vs_walls_mult;
            }
            if (variable_struct_exists(_enemy_template, "special")) {
                _enemy.special = _enemy_template.special;
            }
            if (variable_struct_exists(_enemy_template, "abilities")) {
                _enemy.abilities = _enemy_template.abilities;
            }
            
            // Initialize status effects on the new enemy
            enemy_init_status_effects(_enemy);
            
            // Apply raid difficulty modifiers to enemy stats
            if (global.raid_state.modifiers.night) {
                _enemy.speed *= 1.1; // Enemies faster at night
                _enemy.base_speed = _enemy.speed;
            }
            if (global.raid_state.modifiers.storm) {
                _enemy.armor += 2; // Storm provides slight cover
            }
            if (global.raid_state.modifiers.coordinated) {
                _enemy.damage = floor(_enemy.damage * 1.15); // Coordinated = more organized
            }
            
            ds_list_add(global.raid_enemies, _enemy);
            global.raid_state.enemies_alive++;
            global.raid_state.enemies_total_spawned++;
            
            // Calculate initial path
            enemy_calculate_path(_enemy);
        }
    }
    
    show_debug_message("INFO: Wave " + string(_wave_index + 1) + " spawned: " 
        + string(ds_list_size(global.raid_enemies)) + " total enemies active.");
}

/// @func raid_get_spawn_positions(_direction, _count)
/// @desc Calculates spawn positions at the edge of the map for a given direction.
/// @param {string} _direction  "EAST", "WEST", "NORTH", "SOUTH"
/// @param {int} _count  Number of positions needed
/// @returns {array} Array of { x, y } world coordinates
function raid_get_spawn_positions(_direction, _count) {
    var _positions = [];
    var _map_w = DEFENSE_GRID_WIDTH * DEFENSE_CELL_SIZE;
    var _map_h = DEFENSE_GRID_HEIGHT * DEFENSE_CELL_SIZE;
    
    for (var _i = 0; _i < _count; _i++) {
        var _offset = (_i - _count / 2) * DEFENSE_CELL_SIZE * 1.5; // Spread out spawns
        var _pos = { x: 0, y: 0 };
        
        switch (_direction) {
            case "EAST":
                _pos.x = _map_w - DEFENSE_CELL_SIZE;
                _pos.y = _map_h / 2 + _offset;
                break;
            case "WEST":
                _pos.x = DEFENSE_CELL_SIZE * 3; // Past the river
                _pos.y = _map_h / 2 + _offset;
                break;
            case "NORTH":
                _pos.x = _map_w / 2 + _offset;
                _pos.y = DEFENSE_CELL_SIZE;
                break;
            case "SOUTH":
                _pos.x = _map_w / 2 + _offset;
                _pos.y = _map_h - DEFENSE_CELL_SIZE;
                break;
        }
        
        // Clamp to valid area
        _pos.x = clamp(_pos.x, DEFENSE_CELL_SIZE * 3, _map_w - DEFENSE_CELL_SIZE);
        _pos.y = clamp(_pos.y, DEFENSE_CELL_SIZE, _map_h - DEFENSE_CELL_SIZE);
        
        array_push(_positions, _pos);
    }
    
    return _positions;
}

// ============================================================================
// COMBAT UPDATE (Called every frame during RAID_SUB.STRATEGIC)
// ============================================================================

/// @func raid_combat_update()
/// @desc Main combat loop. Updates enemies, turrets, checks wave progression.
///       Called every step during GAME_STATE.RAID combat phase.
function raid_combat_update() {
    if (global.raid_state.phase != "COMBAT") return;
    
    // --- WAVE PAUSE HANDLING ---
    if (global.raid_state.wave_pause_timer > 0) {
        global.raid_state.wave_pause_timer -= 1 / game_get_speed(gamespeed_fps);
        if (global.raid_state.wave_pause_timer <= 0) {
            // Spawn next wave
            var _next = global.raid_state.current_wave + 1;
            if (_next < global.raid_state.total_waves) {
                raid_spawn_wave(_next);
            }
        }
        // Still update existing enemies and turrets during pause
    }
    
    // --- UPDATE ALL ENEMIES ---
    for (var _i = ds_list_size(global.raid_enemies) - 1; _i >= 0; _i--) {
        var _enemy = global.raid_enemies[| _i];
        if (!_enemy.alive) continue;
        
        enemy_update(_enemy);
        
        // Check if enemy reached town center
        var _gx = _enemy.x div DEFENSE_CELL_SIZE;
        var _gy = _enemy.y div DEFENSE_CELL_SIZE;
        if (defense_grid_get_cell(_gx, _gy) == DEFENSE_CELL.TOWN) {
            global.raid_state.town_center_breached = true;
        }
    }
    
    // --- UPDATE ALL TURRETS ---
    turret_update_all();
    
    // --- UPDATE ALL TRAPS (BUG FIX: was missing in M2) ---
    trap_update_all();
    
    // --- UPDATE PLAYER MECH (if deployed, runs even in strategic view for auto-fire) ---
    if (global.mech_state.deployed && !global.mech_state.ejected) {
        mech_update();
    }
    
    // --- CHECK WAVE COMPLETION ---
    if (global.raid_state.enemies_alive <= 0 && global.raid_state.wave_pause_timer <= 0) {
        var _next_wave = global.raid_state.current_wave + 1;
        
        if (_next_wave < global.raid_state.total_waves) {
            // Start pause timer before next wave
            var _raid = global.raid_state.current_raid_data;
            var _next_wave_data = _raid.waves[_next_wave];
            global.raid_state.wave_pause_timer = _next_wave_data.delay_seconds;
            
            show_debug_message("INFO: Wave " + string(global.raid_state.current_wave + 1) 
                + " cleared! Next wave in " + string(global.raid_state.wave_pause_timer) + "s");
        } else {
            // All waves cleared — victory!
            raid_end(true);
            return;
        }
    }
    
    // --- CHECK DEFEAT ---
    if (global.raid_state.town_center_breached) {
        raid_end(false);
        return;
    }
}

// ============================================================================
// RAID END — Victory / Defeat
// ============================================================================

/// @func raid_end(_victory)
/// @desc Ends the raid and transitions to aftermath phase.
/// @param {bool} _victory  True if player won, false if defeated
function raid_end(_victory) {
    global.raid_state.phase = "AFTERMATH";
    
    // Audio: End raid music layers and play victory/defeat
    audio_manager_raid_end();
    if (_victory) {
        audio_manager_play_music("mus_victory");
    }
    
    var _raid = global.raid_state.current_raid_data;
    var _raid_id = global.raid_state.current_raid_id;
    
    // Calculate results
    var _result = {
        raid_id: _raid_id,
        victory: _victory,
        partial_victory: false,
        enemies_killed: global.raid_state.enemies_killed,
        enemies_total: global.raid_state.enemies_total_spawned,
        structures_destroyed: global.raid_state.structures_destroyed,
        salvage: [],
        reputation_gained: 0,
        resources_lost: {}
    };
    
    if (_victory) {
        // Full victory
        _result.reputation_gained = _raid.rewards.reputation;
        
        // Award bonus items
        if (variable_struct_exists(_raid.rewards, "bonus_items")) {
            var _bonus = _raid.rewards.bonus_items;
            for (var _i = 0; _i < array_length(_bonus); _i++) {
                inventory_add_item(global.player_inventory, _bonus[_i].item_id, _bonus[_i].quantity);
                array_push(_result.salvage, _bonus[_i]);
            }
        }
        
        // Blueprint drop chance
        if (variable_struct_exists(_raid.rewards, "blueprint_drop")) {
            var _bp_drop = _raid.rewards.blueprint_drop;
            if (random(1) < _bp_drop.chance) {
                blueprint_discover(_bp_drop.blueprint_id);
                show_debug_message("INFO: Blueprint dropped from raid: " + _bp_drop.blueprint_id);
            }
        }
        
        // Check if partial victory (heavy damage sustained)
        if (global.raid_state.structures_destroyed >= 3) {
            _result.partial_victory = true;
            _result.reputation_gained = floor(_result.reputation_gained 
                * global.balance.raid.partial_victory_reputation_multiplier);
        }
        
        show_debug_message("INFO: RAID VICTORY! Killed " + string(_result.enemies_killed) 
            + "/" + string(_result.enemies_total) + " enemies. Rep +" 
            + string(_result.reputation_gained));
    } else {
        // Defeat — resource loss
        var _loss_pct = global.balance.raid.defeat_resource_loss_percent;
        // Would iterate inventory and remove percentage of each resource
        show_debug_message("INFO: RAID DEFEAT. " + string(_loss_pct * 100) 
            + "% resources stolen. " + string(global.raid_state.structures_destroyed) 
            + " structures destroyed.");
    }
    
    // Generate salvage from killed enemies
    _result.salvage = raid_collect_salvage();
    
    // Mark raid as completed
    ds_map_add(global.raids_completed, _raid_id, true);
    
    // Clean up enemy list
    if (ds_exists(global.raid_enemies, ds_type_list)) {
        ds_list_clear(global.raid_enemies);
    }
    
    // Store result for aftermath UI
    global.raid_state.result = _result;
    
    // state_change(GAME_STATE.RAID, RAID_SUB.AFTERMATH)
    // event_fire("raid_ended", _result)
}

/// @func raid_collect_salvage()
/// @desc Generates salvage items from killed enemies based on loot tables.
/// @returns {array} Array of { item_id, quantity } collected
function raid_collect_salvage() {
    var _salvage = [];
    var _drop_rate = global.balance.raid.salvage_drop_rate;
    
    for (var _i = 0; _i < ds_list_size(global.raid_enemies); _i++) {
        var _enemy = global.raid_enemies[| _i];
        if (_enemy.alive) continue; // Only dead enemies drop loot
        
        if (!variable_struct_exists(_enemy, "loot_table")) continue;
        
        var _loot = _enemy.loot_table;
        for (var _j = 0; _j < array_length(_loot); _j++) {
            var _drop = _loot[_j];
            if (random(1) < _drop.chance * _drop_rate) {
                var _qty = irandom_range(_drop.quantity_min, _drop.quantity_max);
                inventory_add_item(global.player_inventory, _drop.item_id, _qty);
                array_push(_salvage, { item_id: _drop.item_id, quantity: _qty });
            }
        }
    }
    
    return _salvage;
}

/// @func raid_exit_aftermath()
/// @desc Called when player dismisses the aftermath screen. Returns to gameplay.
function raid_exit_aftermath() {
    global.raid_state.active = false;
    global.raid_state.phase = "NONE";
    global.raid_state.current_raid_id = "";
    global.raid_state.current_raid_data = undefined;
    
    // Clean up defense grid
    if (ds_exists(global.defense_placed, ds_type_map)) {
        ds_map_clear(global.defense_placed);
    }
    
    // state_change(GAME_STATE.GAMEPLAY, GAMEPLAY_SUB.FREE_ROAM)
    show_debug_message("INFO: Raid aftermath complete. Returning to gameplay.");
}

// ============================================================================
// SAVE/LOAD INTEGRATION
// ============================================================================

/// @func raid_serialize()
/// @desc Serializes raid system state for saving.
/// @returns {struct}
function raid_serialize() {
    var _completed = [];
    var _key = ds_map_find_first(global.raids_completed);
    while (!is_undefined(_key)) {
        array_push(_completed, _key);
        _key = ds_map_find_next(global.raids_completed, _key);
    }
    
    return {
        completed_raids: _completed,
        active: global.raid_state.active,
        phase: global.raid_state.phase,
        current_raid_id: global.raid_state.current_raid_id,
        intel_days_remaining: global.raid_state.intel_days_remaining
    };
}

/// @func raid_deserialize(_data)
/// @desc Restores raid system state from save data.
/// @param {struct} _data
function raid_deserialize(_data) {
    ds_map_clear(global.raids_completed);
    for (var _i = 0; _i < array_length(_data.completed_raids); _i++) {
        ds_map_add(global.raids_completed, _data.completed_raids[_i], true);
    }
    
    global.raid_state.active = _data.active;
    global.raid_state.phase = _data.phase;
    global.raid_state.current_raid_id = _data.current_raid_id;
    global.raid_state.intel_days_remaining = _data.intel_days_remaining;
    
    // If a raid was in intel phase, restore the raid data
    if (global.raid_state.active && global.raid_state.current_raid_id != "") {
        global.raid_state.current_raid_data = raid_find_data(global.raid_state.current_raid_id);
    }
    
    show_debug_message("INFO: Raid state restored. " 
        + string(array_length(_data.completed_raids)) + " raids completed.");
}
