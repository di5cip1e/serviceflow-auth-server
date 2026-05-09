/// scr_exploration_system.gml
/// Exploration zone management: fog of war, salvage interaction, hazards, discoveries.
/// Objective #25: First Exploration Zone (The Hollow)
///
/// Dependencies: scr_room_data, scr_data, scr_inventory, scr_energy, scr_save_load
/// Global data: global.exploration_zones (loaded zone data)
///              global.exploration_state (persistent state per zone: fog, collected nodes, etc.)

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func exploration_system_init()
/// @desc Loads exploration zone data files. Called during data_load_all().
function exploration_system_init() {
    global.exploration_zones = {};
    global.exploration_state = {};
    
    // Load zone data files
    var _zone_files = [
        "data/exploration/exploration_the_hollow.json",
        "data/exploration/exploration_old_mill.json",
        "data/exploration/exploration_rustwood_edge.json",
        "data/exploration/exploration_ashspine_foothills.json",
        "data/exploration/exploration_coastal_wreck.json",
        "data/exploration/exploration_mountain_bunker.json",
        "data/exploration/exploration_deep_rustwood.json",
        "data/exploration/exploration_scorchland_outpost.json",
        "data/exploration/exploration_spire_wastes.json"
    ];
    
    for (var _i = 0; _i < array_length(_zone_files); _i++) {
        var _data = data_load_file(_zone_files[_i]);
        if (_data != undefined) {
            if (variable_struct_exists(_data, "_meta")) {
                variable_struct_remove(_data, "_meta");
            }
            global.exploration_zones[$ _data.zone_id] = _data;
            show_debug_message("INFO: Exploration zone loaded: " + _data.zone_id);
        }
    }
    
    show_debug_message("INFO: Exploration system initialized. " 
        + string(array_length(variable_struct_get_names(global.exploration_zones))) + " zones loaded.");
}

// ============================================================================
// FOG OF WAR
// ============================================================================

/// @func fog_init(_zone_id)
/// @desc Initializes the fog of war grid for a zone. Creates a 2D bool array.
/// @param {string} _zone_id
function fog_init(_zone_id) {
    var _zone = global.exploration_zones[$ _zone_id];
    if (_zone == undefined) return;
    
    var _room = room_data_load(_zone.room_id);
    if (_room == undefined) return;
    
    var _w = _room.width_tiles;
    var _h = _room.height_tiles;
    
    // Check for existing saved state
    if (variable_struct_exists(global.exploration_state, _zone_id)
        && variable_struct_exists(global.exploration_state[$ _zone_id], "fog_grid")) {
        show_debug_message("INFO: Fog restored from save for " + _zone_id);
        return; // Already loaded from save
    }
    
    // Create new fog grid: true = hidden, false = revealed
    var _fog = array_create(_h);
    for (var _y = 0; _y < _h; _y++) {
        _fog[_y] = array_create(_w, true);
    }
    
    // Initialize zone state
    if (!variable_struct_exists(global.exploration_state, _zone_id)) {
        global.exploration_state[$ _zone_id] = {};
    }
    global.exploration_state[$ _zone_id].fog_grid = _fog;
    global.exploration_state[$ _zone_id].collected_nodes = {};
    global.exploration_state[$ _zone_id].found_discoveries = {};
    global.exploration_state[$ _zone_id].defeated_patrols = {};
    
    show_debug_message("INFO: Fog of war initialized for " + _zone_id + " (" + string(_w) + "x" + string(_h) + ")");
}

/// @func fog_reveal(_zone_id, _tile_x, _tile_y)
/// @desc Reveals fog around a position based on the player's reveal radius.
/// @param {string} _zone_id
/// @param {int} _tile_x  Player tile X
/// @param {int} _tile_y  Player tile Y
function fog_reveal(_zone_id, _tile_x, _tile_y) {
    if (!variable_struct_exists(global.exploration_state, _zone_id)) return;
    var _state = global.exploration_state[$ _zone_id];
    if (!variable_struct_exists(_state, "fog_grid")) return;
    
    var _fog = _state.fog_grid;
    var _h = array_length(_fog);
    if (_h == 0) return;
    var _w = array_length(_fog[0]);
    
    // Get reveal radius from zone config
    var _zone = global.exploration_zones[$ _zone_id];
    var _radius = 5; // Default
    if (variable_struct_exists(_zone, "fog_of_war")) {
        _radius = _zone.fog_of_war.reveal_radius_tiles;
        // Scanner bonus (check if player has scanner equipped)
        // if (player_has_scanner()) _radius += _zone.fog_of_war.scanner_bonus_radius;
    }
    
    // Reveal in circular radius
    var _r_sq = _radius * _radius;
    for (var _dy = -_radius; _dy <= _radius; _dy++) {
        for (var _dx = -_radius; _dx <= _radius; _dx++) {
            if (_dx * _dx + _dy * _dy <= _r_sq) {
                var _rx = _tile_x + _dx;
                var _ry = _tile_y + _dy;
                if (_rx >= 0 && _rx < _w && _ry >= 0 && _ry < _h) {
                    _fog[_ry][_rx] = false;
                }
            }
        }
    }
}

/// @func fog_is_hidden(_zone_id, _tile_x, _tile_y)
/// @desc Checks if a tile is still hidden by fog.
/// @param {string} _zone_id
/// @param {int} _tile_x
/// @param {int} _tile_y
/// @returns {bool}
function fog_is_hidden(_zone_id, _tile_x, _tile_y) {
    if (!variable_struct_exists(global.exploration_state, _zone_id)) return true;
    var _state = global.exploration_state[$ _zone_id];
    if (!variable_struct_exists(_state, "fog_grid")) return true;
    
    var _fog = _state.fog_grid;
    if (_tile_y < 0 || _tile_y >= array_length(_fog)) return true;
    if (_tile_x < 0 || _tile_x >= array_length(_fog[0])) return true;
    
    return _fog[_tile_y][_tile_x];
}

// ============================================================================
// SALVAGE NODE INTERACTION
// ============================================================================

/// @func salvage_interact(_zone_id, _node_id)
/// @desc Attempts to salvage a node. Checks energy, rolls loot, marks as collected.
/// @param {string} _zone_id
/// @param {string} _node_id
/// @returns {struct} { success: bool, loot: array, energy_spent: int }
function salvage_interact(_zone_id, _node_id) {
    var _result = { success: false, loot: [], energy_spent: 0 };
    
    var _zone = global.exploration_zones[$ _zone_id];
    if (_zone == undefined) return _result;
    
    // Find the salvage node
    var _node = undefined;
    for (var _i = 0; _i < array_length(_zone.salvage_nodes); _i++) {
        if (_zone.salvage_nodes[_i].id == _node_id) {
            _node = _zone.salvage_nodes[_i];
            break;
        }
    }
    if (_node == undefined) return _result;
    
    // Check if already collected and not yet respawned
    var _state = global.exploration_state[$ _zone_id];
    if (variable_struct_exists(_state.collected_nodes, _node_id)) {
        var _collected_day = _state.collected_nodes[$ _node_id];
        var _current_day = global.time_year * 120 + global.time_season * 30 + global.time_day;
        if (_current_day - _collected_day < _node.respawn_days) {
            show_debug_message("INFO: Salvage node " + _node_id + " not yet respawned.");
            return _result;
        }
    }
    
    // Check energy
    var _cost = _node.energy_cost;
    if (global.player_energy < _cost) {
        show_debug_message("WARN: Not enough energy to salvage " + _node_id);
        return _result;
    }
    
    // Spend energy
    global.player_energy -= _cost;
    _result.energy_spent = _cost;
    
    // Roll loot
    var _loot = [];
    for (var _i = 0; _i < array_length(_node.loot_table); _i++) {
        var _entry = _node.loot_table[_i];
        if (random(1) <= _entry.chance) {
            var _qty = irandom_range(_entry.quantity_min, _entry.quantity_max);
            array_push(_loot, { item_id: _entry.item_id, quantity: _qty });
            // inventory_add(_entry.item_id, _qty);
        }
    }
    
    _result.success = true;
    _result.loot = _loot;
    
    // Mark as collected
    var _current_day = global.time_year * 120 + global.time_season * 30 + global.time_day;
    _state.collected_nodes[$ _node_id] = _current_day;
    
    show_debug_message("INFO: Salvaged " + _node_id + ": " + string(array_length(_loot)) + " item types.");
    
    return _result;
}

// ============================================================================
// HAZARD SYSTEM
// ============================================================================

/// @func hazard_check_tile(_zone_id, _tile_x, _tile_y)
/// @desc Checks if a tile has a hazard and applies its effect.
/// @param {string} _zone_id
/// @param {int} _tile_x
/// @param {int} _tile_y
/// @returns {struct|undefined} Hazard effect struct, or undefined if no hazard
function hazard_check_tile(_zone_id, _tile_x, _tile_y) {
    var _zone = global.exploration_zones[$ _zone_id];
    if (_zone == undefined) return undefined;
    if (!variable_struct_exists(_zone, "hazards")) return undefined;
    
    for (var _i = 0; _i < array_length(_zone.hazards); _i++) {
        var _hazard = _zone.hazards[_i];
        var _tiles = _hazard.tiles;
        
        for (var _j = 0; _j < array_length(_tiles); _j++) {
            if (_tiles[_j][0] == _tile_x && _tiles[_j][1] == _tile_y) {
                // Apply hazard effect
                if (variable_struct_exists(_hazard.effect, "energy_loss")) {
                    global.player_energy = max(0, global.player_energy - _hazard.effect.energy_loss);
                }
                
                show_debug_message("WARN: Hazard triggered at (" + string(_tile_x) + "," 
                    + string(_tile_y) + "): " + _hazard.type);
                
                return _hazard.effect;
            }
        }
    }
    
    return undefined;
}

// ============================================================================
// DISCOVERY INTERACTION
// ============================================================================

/// @func discovery_interact(_zone_id, _discovery_id)
/// @desc Interacts with a discovery (data core, blueprint chest). One-time events.
/// @param {string} _zone_id
/// @param {string} _discovery_id
/// @returns {struct} { success: bool, type: string, data: struct }
function discovery_interact(_zone_id, _discovery_id) {
    var _result = { success: false, type: "", data: {} };
    
    var _zone = global.exploration_zones[$ _zone_id];
    if (_zone == undefined) return _result;
    
    var _state = global.exploration_state[$ _zone_id];
    
    // Check if already found
    if (variable_struct_exists(_state.found_discoveries, _discovery_id)) {
        show_debug_message("INFO: Discovery " + _discovery_id + " already found.");
        return _result;
    }
    
    // Find the discovery
    var _disc = undefined;
    for (var _i = 0; _i < array_length(_zone.discoveries); _i++) {
        if (_zone.discoveries[_i].id == _discovery_id) {
            _disc = _zone.discoveries[_i];
            break;
        }
    }
    if (_disc == undefined) return _result;
    
    _result.success = true;
    _result.type = _disc.type;
    
    switch (_disc.type) {
        case "DATA_CORE":
            _result.data = {
                lore_id: _disc.lore_id,
                lore_title: _disc.lore_title,
                lore_summary: _disc.lore_summary,
                dejin_reaction: _disc.dejin_reaction
            };
            // Grant reward items
            for (var _r = 0; _r < array_length(_disc.reward_items); _r++) {
                var _ri = _disc.reward_items[_r];
                // inventory_add(_ri.item_id, _ri.quantity);
            }
            // Add to journal lore entries
            // journal_add_lore(_disc.lore_id, _disc.lore_title, _disc.lore_summary);
            // Trigger DEJIN dialogue
            // dialogue_start(_disc.dejin_reaction);
            show_debug_message("INFO: Data Core discovered: " + _disc.lore_title);
            break;
            
        case "BLUEPRINT_CHEST":
            _result.data = {
                blueprint_id: _disc.blueprint_id
            };
            // Unlock blueprint
            // blueprint_discover(_disc.blueprint_id);
            show_debug_message("INFO: Blueprint discovered: " + _disc.blueprint_id);
            break;
    }
    
    // Mark as found
    _state.found_discoveries[$ _discovery_id] = true;
    
    // Fire discovery event
    // event_fire("exploration_discovery", { zone_id: _zone_id, discovery_id: _discovery_id })
    
    return _result;
}

// ============================================================================
// ENEMY PATROL MANAGEMENT
// ============================================================================

/// @func exploration_check_patrols(_zone_id, _player_tile_x, _player_tile_y)
/// @desc Checks if the player has entered aggro range of any enemy patrol.
/// @param {string} _zone_id
/// @param {int} _player_tile_x
/// @param {int} _player_tile_y
/// @returns {struct|undefined} Patrol data if encounter triggered, undefined otherwise
function exploration_check_patrols(_zone_id, _player_tile_x, _player_tile_y) {
    var _zone = global.exploration_zones[$ _zone_id];
    if (_zone == undefined) return undefined;
    if (!variable_struct_exists(_zone, "enemy_patrols")) return undefined;
    
    var _state = global.exploration_state[$ _zone_id];
    
    for (var _i = 0; _i < array_length(_zone.enemy_patrols); _i++) {
        var _patrol = _zone.enemy_patrols[_i];
        
        // Check if already defeated and not yet respawned
        if (variable_struct_exists(_state.defeated_patrols, _patrol.id)) {
            var _defeat_day = _state.defeated_patrols[$ _patrol.id];
            var _current_day = global.time_year * 120 + global.time_season * 30 + global.time_day;
            if (_current_day - _defeat_day < _patrol.respawn_days) {
                continue; // Still defeated
            }
        }
        
        // Calculate patrol center (average of path points)
        var _cx = 0, _cy = 0;
        var _path = _patrol.patrol_path;
        for (var _j = 0; _j < array_length(_path); _j++) {
            _cx += _path[_j][0];
            _cy += _path[_j][1];
        }
        _cx = _cx div array_length(_path);
        _cy = _cy div array_length(_path);
        
        // Check aggro range
        var _dist = point_distance(_player_tile_x, _player_tile_y, _cx, _cy);
        if (_dist <= _patrol.aggro_range) {
            show_debug_message("INFO: Enemy patrol " + _patrol.id + " aggro triggered!");
            return _patrol;
        }
    }
    
    return undefined;
}

/// @func exploration_defeat_patrol(_zone_id, _patrol_id)
/// @desc Marks a patrol as defeated. Called after combat encounter resolution.
/// @param {string} _zone_id
/// @param {string} _patrol_id
function exploration_defeat_patrol(_zone_id, _patrol_id) {
    var _state = global.exploration_state[$ _zone_id];
    if (_state == undefined) return;
    
    var _current_day = global.time_year * 120 + global.time_season * 30 + global.time_day;
    _state.defeated_patrols[$ _patrol_id] = _current_day;
    
    show_debug_message("INFO: Patrol " + _patrol_id + " defeated in " + _zone_id);
}

// ============================================================================
// SAVE/LOAD
// ============================================================================

/// @func exploration_serialize()
/// @desc Serializes all exploration state for the save system.
/// @returns {struct}
function exploration_serialize() {
    return {
        exploration_state: global.exploration_state
    };
}

/// @func exploration_deserialize(_data)
/// @desc Restores exploration state from save data.
/// @param {struct} _data
function exploration_deserialize(_data) {
    global.exploration_state = _data.exploration_state;
    show_debug_message("INFO: Exploration state restored.");
}
