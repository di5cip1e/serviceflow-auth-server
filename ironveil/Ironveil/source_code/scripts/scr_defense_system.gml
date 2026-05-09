/// scr_defense_system.gml
/// Defense grid management for tower defense raid system.
/// Objective #23: Tower Defense Raid System
///
/// Dependencies: scr_machine_system, scr_room_data
/// Grid: 40×30 cells overlaid on the raid map (each cell = 2 tiles = 32px)
/// Cell types: EMPTY, BLOCKED, PATH, OCCUPIED, TOWN

#macro DEFENSE_GRID_WIDTH 40
#macro DEFENSE_GRID_HEIGHT 30
#macro DEFENSE_CELL_SIZE 32

enum DEFENSE_CELL {
    EMPTY    = 0,
    BLOCKED  = 1,
    PATH     = 2,
    OCCUPIED = 3,
    TOWN     = 4
}

// ============================================================================
// GRID INITIALIZATION
// ============================================================================

/// @func defense_grid_init()
/// @desc Creates and initializes the defense placement grid for raid preparation.
///       Called when entering GAME_STATE.RAID / RAID_SUB.PREP.
///       Reads Coppervale room data to determine blocked/town cells.
function defense_grid_init() {
    // Create grid as 2D array [y][x]
    global.defense_grid = array_create(DEFENSE_GRID_HEIGHT);
    for (var _y = 0; _y < DEFENSE_GRID_HEIGHT; _y++) {
        global.defense_grid[_y] = array_create(DEFENSE_GRID_WIDTH, DEFENSE_CELL.EMPTY);
    }
    
    // Placed defenses registry: grid_key -> instance_id
    global.defense_placed = ds_map_create();
    
    // Load Coppervale room data to mark blocked/town areas
    var _room_data = room_data_load("rm_town_coppervale");
    if (_room_data != undefined) {
        // Mark building footprints as BLOCKED on defense grid
        if (variable_struct_exists(_room_data, "buildings")) {
            var _buildings = _room_data.buildings;
            for (var _i = 0; _i < array_length(_buildings); _i++) {
                var _b = _buildings[_i];
                // Convert tile coords to defense grid coords (defense cell = 2 tiles)
                var _gx1 = _b.pos[0] div 2;
                var _gy1 = _b.pos[1] div 2;
                var _gx2 = (_b.pos[0] + _b.size[0] - 1) div 2;
                var _gy2 = (_b.pos[1] + _b.size[1] - 1) div 2;
                
                for (var _gy = _gy1; _gy <= _gy2; _gy++) {
                    for (var _gx = _gx1; _gx <= _gx2; _gx++) {
                        if (_gx >= 0 && _gx < DEFENSE_GRID_WIDTH 
                            && _gy >= 0 && _gy < DEFENSE_GRID_HEIGHT) {
                            global.defense_grid[_gy][_gx] = DEFENSE_CELL.BLOCKED;
                        }
                    }
                }
            }
        }
        
        // Mark town center (clocktower area) as TOWN
        // Clocktower is at tile (29,39), size 3×3 -> defense grid ~(14,19) area
        var _town_cx = 29 div 2;
        var _town_cy = 39 div 2;
        for (var _dy = -1; _dy <= 1; _dy++) {
            for (var _dx = -1; _dx <= 1; _dx++) {
                var _tx = _town_cx + _dx;
                var _ty = _town_cy + _dy;
                if (_tx >= 0 && _tx < DEFENSE_GRID_WIDTH 
                    && _ty >= 0 && _ty < DEFENSE_GRID_HEIGHT) {
                    global.defense_grid[_ty][_tx] = DEFENSE_CELL.TOWN;
                }
            }
        }
        
        // Mark river/water as BLOCKED (cols 0-3 in tile space -> 0-1 in grid space)
        for (var _gy = 0; _gy < DEFENSE_GRID_HEIGHT; _gy++) {
            global.defense_grid[_gy][0] = DEFENSE_CELL.BLOCKED;
            global.defense_grid[_gy][1] = DEFENSE_CELL.BLOCKED;
        }
    }
    
    show_debug_message("INFO: Defense grid initialized (" 
        + string(DEFENSE_GRID_WIDTH) + "x" + string(DEFENSE_GRID_HEIGHT) + ")");
}

// ============================================================================
// PLACEMENT VALIDATION & EXECUTION
// ============================================================================

/// @func defense_can_place(_blueprint_id, _grid_x, _grid_y)
/// @desc Checks if a defense structure can be placed at the given grid position.
/// @param {string} _blueprint_id  Blueprint of the defense to place
/// @param {int} _grid_x  Grid X coordinate
/// @param {int} _grid_y  Grid Y coordinate
/// @returns {struct} { can_place: bool, reason: string }
function defense_can_place(_blueprint_id, _grid_x, _grid_y) {
    var _result = { can_place: false, reason: "" };
    
    // Validate blueprint exists and is a defense/wall type
    var _bp = blueprint_get_data(_blueprint_id);
    if (_bp == undefined) {
        _result.reason = "Unknown blueprint.";
        return _result;
    }
    if (_bp.type != "DEFENSE" && _bp.type != "WALL") {
        _result.reason = "Not a defense structure.";
        return _result;
    }
    
    // Must be discovered
    if (!blueprint_is_discovered(_blueprint_id)) {
        _result.reason = "Blueprint not discovered.";
        return _result;
    }
    
    // Get defense size from blueprint or machine data
    var _size = [1, 1];
    if (variable_struct_exists(_bp, "defense_size")) {
        _size = _bp.defense_size;
    }
    
    // Check all cells in the footprint
    for (var _dy = 0; _dy < _size[1]; _dy++) {
        for (var _dx = 0; _dx < _size[0]; _dx++) {
            var _cx = _grid_x + _dx;
            var _cy = _grid_y + _dy;
            
            // Bounds check
            if (_cx < 0 || _cx >= DEFENSE_GRID_WIDTH || _cy < 0 || _cy >= DEFENSE_GRID_HEIGHT) {
                _result.reason = "Out of bounds.";
                return _result;
            }
            
            var _cell = global.defense_grid[_cy][_cx];
            
            // Can only place on EMPTY cells
            if (_cell != DEFENSE_CELL.EMPTY) {
                switch (_cell) {
                    case DEFENSE_CELL.BLOCKED:  _result.reason = "Blocked terrain.";        break;
                    case DEFENSE_CELL.OCCUPIED: _result.reason = "Already occupied.";        break;
                    case DEFENSE_CELL.TOWN:     _result.reason = "Cannot build on town center."; break;
                    case DEFENSE_CELL.PATH:     _result.reason = "Cannot block active path."; break;
                    default:                     _result.reason = "Invalid cell.";            break;
                }
                return _result;
            }
        }
    }
    
    // Check player has components to build
    var _mark = blueprint_get_current_mark(_blueprint_id);
    var _build_check = blueprint_can_build(_blueprint_id, _mark);
    if (!_build_check.can_build) {
        _result.reason = "Missing components.";
        return _result;
    }
    
    _result.can_place = true;
    _result.reason = "Ready to place.";
    return _result;
}

/// @func defense_place(_blueprint_id, _grid_x, _grid_y)
/// @desc Places a defense structure on the grid. Creates a machine instance.
///       Consumes components from inventory.
/// @param {string} _blueprint_id
/// @param {int} _grid_x  Grid X coordinate
/// @param {int} _grid_y  Grid Y coordinate
/// @returns {string} Instance ID of placed defense, or "" on failure
function defense_place(_blueprint_id, _grid_x, _grid_y) {
    var _check = defense_can_place(_blueprint_id, _grid_x, _grid_y);
    if (!_check.can_place) {
        show_debug_message("WARN: defense_place failed: " + _check.reason);
        return "";
    }
    
    var _bp = blueprint_get_data(_blueprint_id);
    var _mark = blueprint_get_current_mark(_blueprint_id);
    
    // Consume components
    var _recipe = blueprint_get_recipe(_blueprint_id, _mark);
    for (var _i = 0; _i < array_length(_recipe); _i++) {
        inventory_remove_item(global.player_inventory, _recipe[_i].component_id, _recipe[_i].quantity);
    }
    
    // Convert grid position to world position
    var _world_x = _grid_x * DEFENSE_CELL_SIZE + (DEFENSE_CELL_SIZE / 2);
    var _world_y = _grid_y * DEFENSE_CELL_SIZE + (DEFENSE_CELL_SIZE / 2);
    
    // Create machine instance (quality 1.0 for quick-placed defenses)
    var _instance_id = machine_create(_blueprint_id, _mark, 1.0, 
        _world_x, _world_y, "rm_town_coppervale");
    
    if (_instance_id == "") return "";
    
    // Mark grid cells as occupied
    var _size = [1, 1];
    if (variable_struct_exists(_bp, "defense_size")) {
        _size = _bp.defense_size;
    }
    for (var _dy = 0; _dy < _size[1]; _dy++) {
        for (var _dx = 0; _dx < _size[0]; _dx++) {
            global.defense_grid[_grid_y + _dy][_grid_x + _dx] = DEFENSE_CELL.OCCUPIED;
        }
    }
    
    // Register in placement map
    var _grid_key = string(_grid_x) + "," + string(_grid_y);
    ds_map_add(global.defense_placed, _grid_key, _instance_id);
    
    show_debug_message("INFO: Defense placed: " + _bp.name + " at grid (" 
        + string(_grid_x) + "," + string(_grid_y) + ") -> " + _instance_id);
    
    return _instance_id;
}

/// @func defense_remove(_grid_x, _grid_y)
/// @desc Removes a defense structure from the grid. Does NOT return components.
/// @param {int} _grid_x
/// @param {int} _grid_y
/// @returns {bool} True if a defense was removed
function defense_remove(_grid_x, _grid_y) {
    var _grid_key = string(_grid_x) + "," + string(_grid_y);
    
    if (!ds_map_exists(global.defense_placed, _grid_key)) return false;
    
    var _instance_id = ds_map_find_value(global.defense_placed, _grid_key);
    var _inst = machine_get(_instance_id);
    
    if (_inst != undefined) {
        // Get size to clear grid
        var _bp = blueprint_get_data(_inst.blueprint_id);
        var _size = [1, 1];
        if (_bp != undefined && variable_struct_exists(_bp, "defense_size")) {
            _size = _bp.defense_size;
        }
        
        // Clear grid cells
        for (var _dy = 0; _dy < _size[1]; _dy++) {
            for (var _dx = 0; _dx < _size[0]; _dx++) {
                var _cx = _grid_x + _dx;
                var _cy = _grid_y + _dy;
                if (_cx >= 0 && _cx < DEFENSE_GRID_WIDTH 
                    && _cy >= 0 && _cy < DEFENSE_GRID_HEIGHT) {
                    global.defense_grid[_cy][_cx] = DEFENSE_CELL.EMPTY;
                }
            }
        }
        
        // Destroy machine instance
        machine_destroy(_instance_id);
    }
    
    ds_map_delete(global.defense_placed, _grid_key);
    return true;
}

/// @func defense_get_at(_grid_x, _grid_y)
/// @desc Returns the machine instance ID of a defense at a grid position.
/// @param {int} _grid_x
/// @param {int} _grid_y
/// @returns {string} Instance ID or "" if empty
function defense_get_at(_grid_x, _grid_y) {
    var _grid_key = string(_grid_x) + "," + string(_grid_y);
    if (!ds_map_exists(global.defense_placed, _grid_key)) return "";
    return ds_map_find_value(global.defense_placed, _grid_key);
}

/// @func defense_grid_get_cell(_grid_x, _grid_y)
/// @desc Returns the cell type at a defense grid position.
/// @param {int} _grid_x
/// @param {int} _grid_y
/// @returns {int} DEFENSE_CELL enum value, or DEFENSE_CELL.BLOCKED for out-of-bounds
function defense_grid_get_cell(_grid_x, _grid_y) {
    if (_grid_x < 0 || _grid_x >= DEFENSE_GRID_WIDTH 
        || _grid_y < 0 || _grid_y >= DEFENSE_GRID_HEIGHT) {
        return DEFENSE_CELL.BLOCKED;
    }
    return global.defense_grid[_grid_y][_grid_x];
}

/// @func defense_grid_is_walkable(_grid_x, _grid_y)
/// @desc Checks if a defense grid cell can be walked through by enemies.
/// @param {int} _grid_x
/// @param {int} _grid_y
/// @returns {bool}
function defense_grid_is_walkable(_grid_x, _grid_y) {
    var _cell = defense_grid_get_cell(_grid_x, _grid_y);
    return (_cell == DEFENSE_CELL.EMPTY || _cell == DEFENSE_CELL.PATH 
            || _cell == DEFENSE_CELL.TOWN);
}

/// @func defense_wall_take_damage(_grid_x, _grid_y, _damage)
/// @desc Applies damage to a wall/defense at the given grid position.
/// @param {int} _grid_x
/// @param {int} _grid_y
/// @param {real} _damage  Damage amount
/// @returns {bool} True if the defense was destroyed
function defense_wall_take_damage(_grid_x, _grid_y, _damage) {
    var _instance_id = defense_get_at(_grid_x, _grid_y);
    if (_instance_id == "") return false;
    
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return false;
    
    // Get effective HP
    var _stats = machine_get_effective_stats(_instance_id);
    var _max_hp = variable_struct_exists(_stats, "hp") ? _stats.hp : 100;
    
    // Track current HP (stored in a custom field)
    if (!variable_struct_exists(_inst, "current_hp")) {
        _inst.current_hp = _max_hp;
    }
    
    _inst.current_hp -= _damage;
    
    if (_inst.current_hp <= 0) {
        // Defense destroyed
        show_debug_message("INFO: Defense destroyed at (" + string(_grid_x) + "," + string(_grid_y) + ")");
        defense_remove(_grid_x, _grid_y);
        // event_fire("defense_destroyed", { grid_x: _grid_x, grid_y: _grid_y })
        return true;
    }
    
    return false;
}
