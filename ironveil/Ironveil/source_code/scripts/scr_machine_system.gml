/// scr_machine_system.gml
/// Machine instance creation, tracking, and management.
/// Objective #20: Machine & Automaton Instance Management
///
/// Dependencies: scr_blueprint_system, scr_data, scr_save_load
/// Global data: global.machine_data (loaded from machines.json)
///              global.machines (ds_map: instance_id -> machine struct)
///              global.machine_id_counter (int, for generating unique IDs)

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func machine_system_init()
/// @desc Loads machine base stat definitions and initializes the instance registry.
///       Called during data_load_all() in the boot sequence.
function machine_system_init() {
    // Load base machine stat definitions
    global.machine_data = data_load_file("data/machines/machines.json");
    
    // Remove metadata
    if (variable_struct_exists(global.machine_data, "_meta")) {
        variable_struct_remove(global.machine_data, "_meta");
    }
    
    // Initialize instance registry
    global.machines = ds_map_create();
    global.machine_id_counter = 0;
    
    show_debug_message("INFO: Machine system initialized. " 
        + string(array_length(variable_struct_get_names(global.machine_data))) 
        + " machine types loaded.");
}

// ============================================================================
// UNIQUE ID GENERATION
// ============================================================================

/// @func machine_generate_id(_prefix)
/// @desc Generates a unique instance ID string.
/// @param {string} _prefix  Category prefix (e.g., "mech", "auto", "def")
/// @returns {string} Unique ID like "mech_0001" 
function machine_generate_id(_prefix) {
    global.machine_id_counter++;
    var _num = string(global.machine_id_counter);
    // Pad to 4 digits
    while (string_length(_num) < 4) {
        _num = "0" + _num;
    }
    return _prefix + "_" + _num;
}

// ============================================================================
// INSTANCE CRUD
// ============================================================================

/// @func machine_create(_blueprint_id, _mark, _quality, _x, _y, _room)
/// @desc Creates a new machine instance from a blueprint and registers it.
/// @param {string} _blueprint_id  Blueprint used to build this machine
/// @param {int} _mark  Mark level (1-4) of the build
/// @param {real} _quality  Quality rating 0.0-1.0 (from Testing Platform)
/// @param {real} _x  World X position
/// @param {real} _y  World Y position
/// @param {string} _room  Room ID where the machine is placed
/// @returns {string} Instance ID of the created machine, or "" on failure
function machine_create(_blueprint_id, _mark, _quality, _x, _y, _room) {
    // Validate blueprint and machine data exist
    if (!variable_struct_exists(global.blueprint_data, _blueprint_id)) {
        show_debug_message("ERROR: machine_create — Unknown blueprint: " + _blueprint_id);
        return "";
    }
    if (!variable_struct_exists(global.machine_data, _blueprint_id)) {
        show_debug_message("ERROR: machine_create — No machine stats for: " + _blueprint_id);
        return "";
    }
    
    var _bp = global.blueprint_data[$ _blueprint_id];
    var _base = global.machine_data[$ _blueprint_id];
    var _mark_key = "mk" + string(_mark);
    var _multiplier = 1.0;
    if (variable_struct_exists(_bp.marks, _mark_key)) {
        _multiplier = _bp.marks[$ _mark_key].stat_multiplier;
    }
    
    // Determine prefix from category
    var _prefix = "mach";
    switch (_base.category) {
        case "MECH":      _prefix = "mech"; break;
        case "AUTOMATON":  _prefix = "auto"; break;
        case "DEFENSE":    _prefix = "def";  break;
        case "WALL":       _prefix = "wall"; break;
    }
    
    var _instance_id = machine_generate_id(_prefix);
    
    // Build installed components list from blueprint recipe
    var _recipe = blueprint_get_recipe(_blueprint_id, _mark);
    var _installed = [];
    var _slots = _base.component_slots;
    for (var _i = 0; _i < array_length(_slots); _i++) {
        var _slot_name = _slots[_i];
        // Match component from recipe if available
        var _comp_id = "";
        if (_i < array_length(_recipe)) {
            _comp_id = _recipe[_i].component_id;
        }
        array_push(_installed, {
            slot: _slot_name,
            component_id: _comp_id,
            condition: 100.0
        });
    }
    
    // Create instance struct
    var _instance = {
        instance_id: _instance_id,
        blueprint_id: _blueprint_id,
        custom_name: _bp.name,
        category: _base.category,
        mark: _mark,
        quality_rating: _quality,
        stat_multiplier: _multiplier,
        status: "OPERATIONAL",
        creation_date: {
            year: global.time_year,
            season: global.time_season,
            day: global.time_day
        },
        position: { x: _x, y: _y, room: _room },
        meters: {
            lubrication: 100.0,
            fuel_level: 100.0
        },
        installed_components: _installed,
        age_days: 0,
        times_repaired: 0,
        hidden_defects: (random(1) < 0.15) ? true : false  // 15% chance of hidden defect
    };
    
    // Register in global map
    ds_map_add(global.machines, _instance_id, _instance);
    
    // Mark blueprint as built (for first-build tracking)
    blueprint_mark_built(_blueprint_id);
    
    // Fire creation event
    // event_fire("machine_created", { instance_id: _instance_id, blueprint_id: _blueprint_id })
    show_debug_message("INFO: Machine created: " + _instance_id + " (" + _bp.name 
        + " Mk" + string(_mark) + " Q:" + string(_quality) + ")");
    
    return _instance_id;
}

/// @func machine_destroy(_instance_id)
/// @desc Removes a machine instance from the registry.
/// @param {string} _instance_id
/// @returns {bool} True if successfully removed
function machine_destroy(_instance_id) {
    if (!ds_map_exists(global.machines, _instance_id)) {
        show_debug_message("WARN: machine_destroy — Unknown instance: " + _instance_id);
        return false;
    }
    
    var _inst = ds_map_find_value(global.machines, _instance_id);
    show_debug_message("INFO: Machine destroyed: " + _instance_id + " (" + _inst.custom_name + ")");
    
    ds_map_delete(global.machines, _instance_id);
    return true;
}

/// @func machine_get(_instance_id)
/// @desc Retrieves a machine instance struct by ID.
/// @param {string} _instance_id
/// @returns {struct|undefined}
function machine_get(_instance_id) {
    if (!ds_map_exists(global.machines, _instance_id)) return undefined;
    return ds_map_find_value(global.machines, _instance_id);
}

/// @func machine_get_all()
/// @desc Returns array of all machine instance IDs.
/// @returns {array<string>}
function machine_get_all() {
    var _all = [];
    var _key = ds_map_find_first(global.machines);
    while (!is_undefined(_key)) {
        array_push(_all, _key);
        _key = ds_map_find_next(global.machines, _key);
    }
    return _all;
}

/// @func machine_get_by_room(_room)
/// @desc Returns array of machine instance IDs in a specific room.
/// @param {string} _room  Room ID
/// @returns {array<string>}
function machine_get_by_room(_room) {
    var _result = [];
    var _key = ds_map_find_first(global.machines);
    while (!is_undefined(_key)) {
        var _inst = ds_map_find_value(global.machines, _key);
        if (_inst.position.room == _room) {
            array_push(_result, _key);
        }
        _key = ds_map_find_next(global.machines, _key);
    }
    return _result;
}

/// @func machine_get_by_category(_category)
/// @desc Returns array of machine instance IDs matching a category.
/// @param {string} _category  "MECH", "AUTOMATON", "DEFENSE", "WALL"
/// @returns {array<string>}
function machine_get_by_category(_category) {
    var _result = [];
    var _key = ds_map_find_first(global.machines);
    while (!is_undefined(_key)) {
        var _inst = ds_map_find_value(global.machines, _key);
        if (_inst.category == _category) {
            array_push(_result, _key);
        }
        _key = ds_map_find_next(global.machines, _key);
    }
    return _result;
}

// ============================================================================
// METER MANAGEMENT
// ============================================================================

/// @func machine_update_meter(_instance_id, _meter, _delta)
/// @desc Adjusts a machine's meter value (lubrication, fuel_level).
/// @param {string} _instance_id
/// @param {string} _meter  "lubrication" or "fuel_level"
/// @param {real} _delta  Amount to add (negative to subtract)
/// @returns {real} New meter value
function machine_update_meter(_instance_id, _meter, _delta) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return 0;
    
    var _current = _inst.meters[$ _meter];
    var _new_val = clamp(_current + _delta, 0, 100);
    _inst.meters[$ _meter] = _new_val;
    
    return _new_val;
}

/// @func machine_update_component_condition(_instance_id, _slot_index, _delta)
/// @desc Adjusts a specific component's condition value.
/// @param {string} _instance_id
/// @param {int} _slot_index  Index into installed_components array
/// @param {real} _delta  Amount to add (negative for degradation)
/// @returns {real} New condition value
function machine_update_component_condition(_instance_id, _slot_index, _delta) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return 0;
    if (_slot_index < 0 || _slot_index >= array_length(_inst.installed_components)) return 0;
    
    var _comp = _inst.installed_components[_slot_index];
    var _new_val = clamp(_comp.condition + _delta, 0, 100);
    _comp.condition = _new_val;
    
    return _new_val;
}

/// @func machine_set_status(_instance_id, _status)
/// @desc Sets the operational status of a machine.
/// @param {string} _instance_id
/// @param {string} _status  "OPERATIONAL", "NEEDS_MAINTENANCE", "BROKEN_DOWN", "POWERED_DOWN"
function machine_set_status(_instance_id, _status) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return;
    
    var _old = _inst.status;
    _inst.status = _status;
    
    if (_old != _status) {
        show_debug_message("INFO: Machine " + _instance_id + " status: " + _old + " -> " + _status);
        // event_fire("machine_status_changed", { instance_id: _instance_id, old: _old, new: _status })
    }
}

/// @func machine_set_name(_instance_id, _name)
/// @desc Sets a custom name for a machine instance.
/// @param {string} _instance_id
/// @param {string} _name  New custom name
function machine_set_name(_instance_id, _name) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return;
    _inst.custom_name = _name;
}

/// @func machine_get_effective_stats(_instance_id)
/// @desc Calculates effective stats for a machine (base * mark_multiplier * quality).
/// @param {string} _instance_id
/// @returns {struct} Effective stats struct, or empty struct on failure
function machine_get_effective_stats(_instance_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return {};
    
    if (!variable_struct_exists(global.machine_data, _inst.blueprint_id)) return {};
    var _base = global.machine_data[$ _inst.blueprint_id].base_stats;
    
    var _effective = {};
    var _factor = _inst.stat_multiplier * _inst.quality_rating;
    
    // Apply efficiency penalty for low lubrication
    if (_inst.meters.lubrication < 50) {
        _factor *= 0.8; // -20% efficiency
    }
    
    var _stat_keys = variable_struct_get_names(_base);
    for (var _i = 0; _i < array_length(_stat_keys); _i++) {
        var _key = _stat_keys[_i];
        _effective[$ _key] = _base[$ _key] * _factor;
    }
    
    return _effective;
}

/// @func machine_reveal_defects(_instance_id)
/// @desc Reveals hidden defects on a machine (used by Testing Platform).
/// @param {string} _instance_id
/// @returns {bool} True if defects were found
function machine_reveal_defects(_instance_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return false;
    
    var _had_defects = _inst.hidden_defects;
    _inst.hidden_defects = false; // Defects are now known (whether present or not)
    
    if (_had_defects) {
        show_debug_message("WARN: Hidden defects found in machine " + _instance_id);
        // Reduce a random component's condition
        var _comp_count = array_length(_inst.installed_components);
        if (_comp_count > 0) {
            var _idx = irandom(_comp_count - 1);
            _inst.installed_components[_idx].condition -= 25;
            _inst.installed_components[_idx].condition = max(0, _inst.installed_components[_idx].condition);
        }
    }
    
    return _had_defects;
}

// ============================================================================
// SAVE/LOAD INTEGRATION
// ============================================================================

/// @func machine_serialize_all()
/// @desc Serializes all machine instances for the save system.
/// @returns {struct} { machines: array, id_counter: int }
function machine_serialize_all() {
    var _data = {
        machines: [],
        id_counter: global.machine_id_counter
    };
    
    var _key = ds_map_find_first(global.machines);
    while (!is_undefined(_key)) {
        var _inst = ds_map_find_value(global.machines, _key);
        array_push(_data.machines, _inst);
        _key = ds_map_find_next(global.machines, _key);
    }
    
    return _data;
}

/// @func machine_deserialize_all(_data)
/// @desc Restores all machine instances from save data.
/// @param {struct} _data  Serialized data from machine_serialize_all()
function machine_deserialize_all(_data) {
    // Clear existing registry
    ds_map_clear(global.machines);
    
    global.machine_id_counter = _data.id_counter;
    
    for (var _i = 0; _i < array_length(_data.machines); _i++) {
        var _inst = _data.machines[_i];
        ds_map_add(global.machines, _inst.instance_id, _inst);
    }
    
    show_debug_message("INFO: Machine instances restored: " + string(array_length(_data.machines)));
}
