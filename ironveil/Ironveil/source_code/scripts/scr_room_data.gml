/// scr_room_data.gml
/// Room data loading and collision map generation from JSON definitions.
/// Part of Objectives #14-15: Coppervale & Interior Room Data

/// @func room_data_load(_room_id)
/// @desc Loads room JSON data from datafiles/data/rooms/ and returns parsed struct.
/// @param {string} _room_id  The room identifier (e.g., "rm_town_coppervale")
/// @returns {struct} Parsed room data or undefined if not found
function room_data_load(_room_id) {
    var _path = "data/rooms/" + _room_id + ".json";
    var _data = data_load_file(_path);
    if (_data == undefined) {
        show_debug_message("ERROR: Room data not found: " + _path);
        return undefined;
    }
    
    // Audio: Trigger room-based music and ambience when room data loads
    audio_manager_on_room_enter(_room_id);
    
    return _data;
}

/// @func room_data_get_transitions(_room_data)
/// @desc Extracts all transition points from room data for collision map setup.
/// @param {struct} _room_data  Parsed room JSON struct
/// @returns {array} Array of transition structs with tile positions and targets
function room_data_get_transitions(_room_data) {
    var _transitions = [];
    
    // Main exits
    if (variable_struct_exists(_room_data, "exits")) {
        var _exits = _room_data.exits;
        for (var _i = 0; _i < array_length(_exits); _i++) {
            array_push(_transitions, _exits[_i]);
        }
    }
    
    // Map-level transitions (for Coppervale exterior)
    if (variable_struct_exists(_room_data, "transitions")) {
        var _trans = _room_data.transitions;
        for (var _i = 0; _i < array_length(_trans); _i++) {
            array_push(_transitions, _trans[_i]);
        }
    }
    
    // Internal transitions (e.g., tavern stairs)
    if (variable_struct_exists(_room_data, "transitions_internal")) {
        var _internal = _room_data.transitions_internal;
        for (var _i = 0; _i < array_length(_internal); _i++) {
            array_push(_transitions, _internal[_i]);
        }
    }
    
    return _transitions;
}

/// @func room_data_get_interactables(_room_data)
/// @desc Extracts all interactable objects (stations, furniture, NPCs) from room data.
/// @param {struct} _room_data  Parsed room JSON struct
/// @returns {array} Array of interactable structs with positions and interaction types
function room_data_get_interactables(_room_data) {
    var _interactables = [];
    
    // Workshop stations
    if (variable_struct_exists(_room_data, "stations")) {
        var _stations = _room_data.stations;
        for (var _i = 0; _i < array_length(_stations); _i++) {
            var _s = _stations[_i];
            if (_s.collision_type == 2) {
                array_push(_interactables, {
                    id: _s.id,
                    name: _s.name,
                    pos: _s.pos,
                    size: _s.size,
                    type: "STATION",
                    station_type: variable_struct_exists(_s, "station_type") ? _s.station_type : "",
                    interaction: variable_struct_exists(_s, "interaction") ? _s.interaction : ""
                });
            }
        }
    }
    
    // Furniture with interactions
    if (variable_struct_exists(_room_data, "furniture")) {
        var _furniture = _room_data.furniture;
        for (var _i = 0; _i < array_length(_furniture); _i++) {
            var _f = _furniture[_i];
            if (_f.collision_type == 2) {
                array_push(_interactables, {
                    id: _f.id,
                    name: _f.name,
                    pos: _f.pos,
                    size: _f.size,
                    type: _f.type,
                    interaction: variable_struct_exists(_f, "interaction") ? _f.interaction : ""
                });
            }
        }
    }
    
    return _interactables;
}

/// @func room_data_build_collision_grid(_room_data)
/// @desc Generates a 2D collision grid from room JSON data.
///       0=WALKABLE, 1=BLOCKED, 2=INTERACTABLE, 3=TRANSITION, 4=WATER, 5=DEFENSE_ZONE
/// @param {struct} _room_data  Parsed room JSON struct
/// @returns {array<array<int>>} 2D array [y][x] of collision values
function room_data_build_collision_grid(_room_data) {
    var _w = _room_data.width_tiles;
    var _h = _room_data.height_tiles;
    
    // Initialize all tiles as walkable
    var _grid = array_create(_h);
    for (var _y = 0; _y < _h; _y++) {
        _grid[_y] = array_create(_w, 0);
    }
    
    // Mark perimeter as blocked (for interior rooms)
    if (variable_struct_exists(_room_data, "parent_room")) {
        // Top and bottom walls
        for (var _x = 0; _x < _w; _x++) {
            _grid[0][_x] = 1;
            _grid[_h - 1][_x] = 1;
        }
        // Left and right walls
        for (var _y = 0; _y < _h; _y++) {
            _grid[_y][0] = 1;
            _grid[_y][_w - 1] = 1;
        }
    }
    
    // Mark building footprints as blocked (for exterior rooms)
    if (variable_struct_exists(_room_data, "buildings")) {
        var _buildings = _room_data.buildings;
        for (var _i = 0; _i < array_length(_buildings); _i++) {
            var _b = _buildings[_i];
            var _bx = _b.pos[0];
            var _by = _b.pos[1];
            var _bw = _b.size[0];
            var _bh = _b.size[1];
            for (var _ty = _by; _ty < _by + _bh; _ty++) {
                for (var _tx = _bx; _tx < _bx + _bw; _tx++) {
                    if (_tx >= 0 && _tx < _w && _ty >= 0 && _ty < _h) {
                        _grid[_ty][_tx] = 1; // BLOCKED
                    }
                }
            }
            // Mark door tile as interactable (center-bottom of building)
            var _door_x = _bx + (_bw div 2);
            var _door_y = _by + _bh; // tile just below building
            if (_door_x >= 0 && _door_x < _w && _door_y >= 0 && _door_y < _h) {
                _grid[_door_y][_door_x] = 2; // INTERACTABLE (door)
            }
        }
    }
    
    // Mark stations as blocked with interactable front tile
    if (variable_struct_exists(_room_data, "stations")) {
        var _stations = _room_data.stations;
        for (var _i = 0; _i < array_length(_stations); _i++) {
            var _s = _stations[_i];
            var _sx = _s.pos[0];
            var _sy = _s.pos[1];
            var _sw = _s.size[0];
            var _sh = _s.size[1];
            for (var _ty = _sy; _ty < _sy + _sh; _ty++) {
                for (var _tx = _sx; _tx < _sx + _sw; _tx++) {
                    if (_tx >= 0 && _tx < _w && _ty >= 0 && _ty < _h) {
                        _grid[_ty][_tx] = _s.collision_type;
                    }
                }
            }
        }
    }
    
    // Mark furniture
    if (variable_struct_exists(_room_data, "furniture")) {
        var _furniture = _room_data.furniture;
        for (var _i = 0; _i < array_length(_furniture); _i++) {
            var _f = _furniture[_i];
            var _fx = _f.pos[0];
            var _fy = _f.pos[1];
            var _fw = _f.size[0];
            var _fh = _f.size[1];
            for (var _ty = _fy; _ty < _fy + _fh; _ty++) {
                for (var _tx = _fx; _tx < _fx + _fw; _tx++) {
                    if (_tx >= 0 && _tx < _w && _ty >= 0 && _ty < _h) {
                        _grid[_ty][_tx] = _f.collision_type;
                    }
                }
            }
        }
    }
    
    // Mark transitions
    var _all_transitions = room_data_get_transitions(_room_data);
    for (var _i = 0; _i < array_length(_all_transitions); _i++) {
        var _t = _all_transitions[_i];
        if (variable_struct_exists(_t, "tiles")) {
            var _tiles = _t.tiles;
            for (var _ty = _tiles.y1; _ty <= _tiles.y2; _ty++) {
                for (var _tx = _tiles.x1; _tx <= _tiles.x2; _tx++) {
                    if (_tx >= 0 && _tx < _w && _ty >= 0 && _ty < _h) {
                        _grid[_ty][_tx] = 3; // TRANSITION
                    }
                }
            }
        }
    }
    
    // Mark water (for Coppervale exterior — river on western edge)
    if (_room_data.room_id == "rm_town_coppervale") {
        for (var _y = 0; _y < _h; _y++) {
            // Cols 0-3: deep water (blocked)
            for (var _x = 0; _x <= 3; _x++) {
                _grid[_y][_x] = 1; // BLOCKED (deep water)
            }
            // Cols 4-5: shallow water (walkable but slow)
            for (var _x = 4; _x <= 5; _x++) {
                _grid[_y][_x] = 4; // WATER_SHALLOW
            }
        }
        
        // Mark defense zones
        if (variable_struct_exists(_room_data, "defense_zones")) {
            var _dzones = _room_data.defense_zones;
            for (var _i = 0; _i < array_length(_dzones); _i++) {
                var _dz = _dzones[_i];
                var _db = _dz.bounds;
                for (var _ty = _db.y1; _ty <= _db.y2; _ty++) {
                    for (var _tx = _db.x1; _tx <= _db.x2; _tx++) {
                        if (_tx >= 0 && _tx < _w && _ty >= 0 && _ty < _h) {
                            // Only mark as defense zone if currently walkable
                            if (_grid[_ty][_tx] == 0) {
                                _grid[_ty][_tx] = 5; // DEFENSE_ZONE
                            }
                        }
                    }
                }
            }
        }
    }
    
    return _grid;
}

/// @func room_data_spawn_npcs(_room_data)
/// @desc Creates NPC instances at their defined positions for the current room.
/// @param {struct} _room_data  Parsed room JSON struct
function room_data_spawn_npcs(_room_data) {
    if (!variable_struct_exists(_room_data, "npc_positions") 
        && !variable_struct_exists(_room_data, "npc_spawns")) {
        return;
    }
    
    // Interior rooms use npc_positions
    if (variable_struct_exists(_room_data, "npc_positions")) {
        var _npcs = _room_data.npc_positions;
        for (var _i = 0; _i < array_length(_npcs); _i++) {
            var _npc = _npcs[_i];
            if (_npc.npc_id == "TEMPLATE_NPC_ID") continue; // Skip template entries
            
            var _px = _npc.pos[0] * _room_data.tile_size + (_room_data.tile_size / 2);
            var _py = _npc.pos[1] * _room_data.tile_size + (_room_data.tile_size / 2);
            
            // Spawn NPC instance at world position
            // Uses npc_spawn() from scr_npc_system (Milestone 1)
            npc_spawn(_npc.npc_id, _px, _py);
        }
    }
    
    // Exterior rooms use npc_spawns
    if (variable_struct_exists(_room_data, "npc_spawns")) {
        var _spawns = _room_data.npc_spawns;
        for (var _i = 0; _i < array_length(_spawns); _i++) {
            var _spawn = _spawns[_i];
            // NPCs with home_pos [0,0] spawn inside their interior room
            if (_spawn.home_pos[0] == 0 && _spawn.home_pos[1] == 0) continue;
            
            var _px = _spawn.home_pos[0] * _room_data.tile_size + (_room_data.tile_size / 2);
            var _py = _spawn.home_pos[1] * _room_data.tile_size + (_room_data.tile_size / 2);
            
            npc_spawn(_spawn.npc_id, _px, _py);
        }
    }
}

/// @func room_data_check_transition(_tile_x, _tile_y, _room_data)
/// @desc Checks if a tile position is a transition point and returns target info.
/// @param {int} _tile_x  Tile X coordinate
/// @param {int} _tile_y  Tile Y coordinate
/// @param {struct} _room_data  Current room data
/// @returns {struct|undefined} Transition target info or undefined
function room_data_check_transition(_tile_x, _tile_y, _room_data) {
    var _all_transitions = room_data_get_transitions(_room_data);
    
    for (var _i = 0; _i < array_length(_all_transitions); _i++) {
        var _t = _all_transitions[_i];
        if (!variable_struct_exists(_t, "tiles")) continue;
        
        var _tiles = _t.tiles;
        if (_tile_x >= _tiles.x1 && _tile_x <= _tiles.x2 
            && _tile_y >= _tiles.y1 && _tile_y <= _tiles.y2) {
            return {
                target_room: _t.target_room,
                target_x: _t.target_pos[0],
                target_y: _t.target_pos[1]
            };
        }
    }
    
    return undefined;
}

/// @func room_data_get_station_at(_tile_x, _tile_y, _room_data)
/// @desc Checks if a tile position contains a workshop station.
/// @param {int} _tile_x  Tile X coordinate
/// @param {int} _tile_y  Tile Y coordinate
/// @param {struct} _room_data  Current room data
/// @returns {struct|undefined} Station data or undefined
function room_data_get_station_at(_tile_x, _tile_y, _room_data) {
    if (!variable_struct_exists(_room_data, "stations")) return undefined;
    
    var _stations = _room_data.stations;
    for (var _i = 0; _i < array_length(_stations); _i++) {
        var _s = _stations[_i];
        var _sx = _s.pos[0];
        var _sy = _s.pos[1];
        var _sw = _s.size[0];
        var _sh = _s.size[1];
        
        if (_tile_x >= _sx && _tile_x < _sx + _sw 
            && _tile_y >= _sy && _tile_y < _sy + _sh) {
            return _s;
        }
    }
    
    return undefined;
}
