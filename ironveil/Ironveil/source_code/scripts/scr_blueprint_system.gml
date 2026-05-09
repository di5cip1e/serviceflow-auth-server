/// scr_blueprint_system.gml
/// Blueprint discovery, research, and upgrade system.
/// Objective #19: Blueprint Discovery & Research System
///
/// Dependencies: scr_data (data_load_file), scr_inventory_system, scr_save_load
/// Global data: global.blueprint_data (loaded from blueprints.json)
///              global.journal.discovered_blueprints (ds_map: bp_id -> true)
///              global.journal.built_blueprints (ds_map: bp_id -> true)
///              global.journal.blueprint_marks (ds_map: bp_id -> highest_unlocked_mark int 1-4)

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func blueprint_init()
/// @desc Loads blueprint data from JSON and initializes journal tracking structures.
///       Called during data_load_all() in the boot sequence.
function blueprint_init() {
    // Load master blueprint definitions
    global.blueprint_data = data_load_file("data/blueprints/blueprints.json");
    
    // Remove metadata key
    if (variable_struct_exists(global.blueprint_data, "_meta")) {
        variable_struct_remove(global.blueprint_data, "_meta");
    }
    
    // Build lookup caches
    global.blueprint_cache_by_type = {};
    global.blueprint_cache_by_tier = {};
    global.blueprint_cache_by_source = {};
    
    var _keys = variable_struct_get_names(global.blueprint_data);
    for (var _i = 0; _i < array_length(_keys); _i++) {
        var _id = _keys[_i];
        var _bp = global.blueprint_data[$ _id];
        
        // Cache by type (MECH, AUTOMATON, DEFENSE, WALL)
        var _type = _bp.type;
        if (!variable_struct_exists(global.blueprint_cache_by_type, _type)) {
            global.blueprint_cache_by_type[$ _type] = [];
        }
        array_push(global.blueprint_cache_by_type[$ _type], _id);
        
        // Cache by tier (1-5)
        var _tier = string(_bp.tier);
        if (!variable_struct_exists(global.blueprint_cache_by_tier, _tier)) {
            global.blueprint_cache_by_tier[$ _tier] = [];
        }
        array_push(global.blueprint_cache_by_tier[$ _tier], _id);
        
        // Cache by source (starting_kit, quest, exploration, trade, ai_core)
        var _source = _bp.source;
        if (!variable_struct_exists(global.blueprint_cache_by_source, _source)) {
            global.blueprint_cache_by_source[$ _source] = [];
        }
        array_push(global.blueprint_cache_by_source[$ _source], _id);
    }
    
    // Initialize journal tracking (will be overwritten by save data if loading)
    if (!variable_struct_exists(global, "journal")) {
        global.journal = {};
    }
    if (!variable_struct_exists(global.journal, "discovered_blueprints")) {
        global.journal.discovered_blueprints = ds_map_create();
    }
    if (!variable_struct_exists(global.journal, "built_blueprints")) {
        global.journal.built_blueprints = ds_map_create();
    }
    if (!variable_struct_exists(global.journal, "blueprint_marks")) {
        global.journal.blueprint_marks = ds_map_create();
    }
    
    // Auto-discover starting kit blueprints
    var _starting = blueprint_get_by_source("starting_kit");
    for (var _i = 0; _i < array_length(_starting); _i++) {
        blueprint_discover(_starting[_i]);
    }
    
    show_debug_message("INFO: Blueprint system initialized. " 
        + string(array_length(_keys)) + " blueprints loaded.");
}

// ============================================================================
// DISCOVERY
// ============================================================================

/// @func blueprint_discover(_blueprint_id)
/// @desc Marks a blueprint as discovered. Triggers discovery event for UI/animation.
/// @param {string} _blueprint_id  The blueprint identifier
/// @returns {bool} True if newly discovered, false if already known
function blueprint_discover(_blueprint_id) {
    // Validate blueprint exists
    if (!variable_struct_exists(global.blueprint_data, _blueprint_id)) {
        show_debug_message("WARN: Attempted to discover unknown blueprint: " + _blueprint_id);
        return false;
    }
    
    // Check if already discovered
    if (ds_map_exists(global.journal.discovered_blueprints, _blueprint_id)) {
        return false;
    }
    
    // Mark as discovered
    ds_map_add(global.journal.discovered_blueprints, _blueprint_id, true);
    
    // Set initial mark to 1
    if (!ds_map_exists(global.journal.blueprint_marks, _blueprint_id)) {
        ds_map_add(global.journal.blueprint_marks, _blueprint_id, 1);
    }
    
    // Fire discovery event for UI/animation hook
    // event_fire("blueprint_discovered", { blueprint_id: _blueprint_id })
    var _bp = global.blueprint_data[$ _blueprint_id];
    show_debug_message("INFO: Blueprint discovered: " + _bp.name + " [" + _bp.tier_label + "]");
    
    return true;
}

/// @func blueprint_is_discovered(_blueprint_id)
/// @desc Checks if a blueprint has been discovered.
/// @param {string} _blueprint_id
/// @returns {bool}
function blueprint_is_discovered(_blueprint_id) {
    return ds_map_exists(global.journal.discovered_blueprints, _blueprint_id);
}

/// @func blueprint_mark_built(_blueprint_id)
/// @desc Marks a blueprint as having been built at least once (first-build complete).
/// @param {string} _blueprint_id
function blueprint_mark_built(_blueprint_id) {
    if (!ds_map_exists(global.journal.built_blueprints, _blueprint_id)) {
        ds_map_add(global.journal.built_blueprints, _blueprint_id, true);
    }
    show_debug_message("INFO: Blueprint first-build complete: " + _blueprint_id);
}

/// @func blueprint_has_been_built(_blueprint_id)
/// @desc Checks if a blueprint has been built at least once (enables automaton-assisted builds).
/// @param {string} _blueprint_id
/// @returns {bool}
function blueprint_has_been_built(_blueprint_id) {
    return ds_map_exists(global.journal.built_blueprints, _blueprint_id);
}

// ============================================================================
// MARK UPGRADES & RESEARCH
// ============================================================================

/// @func blueprint_get_current_mark(_blueprint_id)
/// @desc Returns the highest unlocked mark level for a blueprint (1-4).
/// @param {string} _blueprint_id
/// @returns {int} Mark level (1-4), or 0 if not discovered
function blueprint_get_current_mark(_blueprint_id) {
    if (!ds_map_exists(global.journal.blueprint_marks, _blueprint_id)) {
        return 0;
    }
    return ds_map_find_value(global.journal.blueprint_marks, _blueprint_id);
}

/// @func blueprint_can_research_upgrade(_blueprint_id, _target_mark)
/// @desc Checks if a mark upgrade can be researched at the AI Core.
/// @param {string} _blueprint_id
/// @param {int} _target_mark  Target mark level (2, 3, or 4)
/// @returns {struct} { can_research: bool, reason: string }
function blueprint_can_research_upgrade(_blueprint_id, _target_mark) {
    var _result = { can_research: false, reason: "" };
    
    // Must be discovered
    if (!blueprint_is_discovered(_blueprint_id)) {
        _result.reason = "Blueprint not discovered.";
        return _result;
    }
    
    // Must be upgrading sequentially
    var _current = blueprint_get_current_mark(_blueprint_id);
    if (_target_mark != _current + 1) {
        _result.reason = "Must upgrade sequentially. Current: Mk" + string(_current) 
            + ", requested: Mk" + string(_target_mark);
        return _result;
    }
    
    // Validate target mark exists
    var _bp = global.blueprint_data[$ _blueprint_id];
    var _mark_key = "mk" + string(_target_mark);
    if (!variable_struct_exists(_bp.marks, _mark_key)) {
        _result.reason = "Mark " + string(_target_mark) + " does not exist for this blueprint.";
        return _result;
    }
    
    var _mark_data = _bp.marks[$ _mark_key];
    
    // Check research cost exists
    if (!variable_struct_exists(_mark_data, "research_cost")) {
        _result.reason = "No research cost defined (may be the base mark).";
        return _result;
    }
    
    var _cost = _mark_data.research_cost;
    
    // Check engineering skill level
    if (variable_struct_exists(_cost, "engineering_level")) {
        var _player_eng = global.player_skills.engineering;
        if (_player_eng < _cost.engineering_level) {
            _result.reason = "Engineering skill too low. Need: " 
                + string(_cost.engineering_level) + ", have: " + string(_player_eng);
            return _result;
        }
    }
    
    // Check data core costs
    var _core_types = ["data_cores_standard", "data_cores_military", 
                       "data_cores_scientific", "data_cores_classified"];
    for (var _i = 0; _i < array_length(_core_types); _i++) {
        var _core_type = _core_types[_i];
        if (variable_struct_exists(_cost, _core_type)) {
            var _needed = _cost[$ _core_type];
            var _item_id = "item_" + _core_type; // e.g., "item_data_cores_standard"
            var _have = inventory_count_item(global.player_inventory, _item_id);
            if (_have < _needed) {
                _result.reason = "Insufficient " + _core_type + ". Need: " 
                    + string(_needed) + ", have: " + string(_have);
                return _result;
            }
        }
    }
    
    _result.can_research = true;
    _result.reason = "Ready to research.";
    return _result;
}

/// @func blueprint_research_upgrade(_blueprint_id, _target_mark)
/// @desc Performs mark upgrade research at the AI Core. Consumes data cores.
/// @param {string} _blueprint_id
/// @param {int} _target_mark  Target mark level (2, 3, or 4)
/// @returns {bool} True if upgrade succeeded
function blueprint_research_upgrade(_blueprint_id, _target_mark) {
    var _check = blueprint_can_research_upgrade(_blueprint_id, _target_mark);
    if (!_check.can_research) {
        show_debug_message("WARN: Cannot research upgrade: " + _check.reason);
        return false;
    }
    
    var _bp = global.blueprint_data[$ _blueprint_id];
    var _mark_key = "mk" + string(_target_mark);
    var _cost = _bp.marks[$ _mark_key].research_cost;
    
    // Consume data cores
    var _core_types = ["data_cores_standard", "data_cores_military", 
                       "data_cores_scientific", "data_cores_classified"];
    for (var _i = 0; _i < array_length(_core_types); _i++) {
        var _core_type = _core_types[_i];
        if (variable_struct_exists(_cost, _core_type)) {
            var _needed = _cost[$ _core_type];
            var _item_id = "item_" + _core_type;
            inventory_remove_item(global.player_inventory, _item_id, _needed);
        }
    }
    
    // Upgrade mark
    ds_map_replace(global.journal.blueprint_marks, _blueprint_id, _target_mark);
    
    // Fire event
    // event_fire("blueprint_upgraded", { blueprint_id: _blueprint_id, new_mark: _target_mark })
    show_debug_message("INFO: Blueprint upgraded: " + _bp.name + " -> Mk" + string(_target_mark));
    
    return true;
}

/// @func blueprint_get_available_upgrades(_blueprint_id)
/// @desc Returns array of mark levels that can potentially be unlocked next.
/// @param {string} _blueprint_id
/// @returns {array<int>} Array of available mark numbers (e.g., [2] or [])
function blueprint_get_available_upgrades(_blueprint_id) {
    var _upgrades = [];
    
    if (!blueprint_is_discovered(_blueprint_id)) return _upgrades;
    
    var _current = blueprint_get_current_mark(_blueprint_id);
    var _bp = global.blueprint_data[$ _blueprint_id];
    
    // Check next sequential mark
    var _next = _current + 1;
    var _next_key = "mk" + string(_next);
    if (variable_struct_exists(_bp.marks, _next_key)) {
        array_push(_upgrades, _next);
    }
    
    return _upgrades;
}

// ============================================================================
// RECIPE QUERIES
// ============================================================================

/// @func blueprint_get_recipe(_blueprint_id, _mark)
/// @desc Returns component requirements for a specific blueprint mark.
/// @param {string} _blueprint_id
/// @param {int} _mark  Mark level (1-4)
/// @returns {array} Array of { component_id, quantity } structs, or empty array
function blueprint_get_recipe(_blueprint_id, _mark) {
    if (!variable_struct_exists(global.blueprint_data, _blueprint_id)) return [];
    
    var _bp = global.blueprint_data[$ _blueprint_id];
    var _mark_key = "mk" + string(_mark);
    
    if (!variable_struct_exists(_bp.marks, _mark_key)) return [];
    
    var _mark_data = _bp.marks[$ _mark_key];
    if (!variable_struct_exists(_mark_data, "components")) return [];
    
    return _mark_data.components;
}

/// @func blueprint_can_build(_blueprint_id, _mark)
/// @desc Checks if the player has all components to build a blueprint at a given mark.
/// @param {string} _blueprint_id
/// @param {int} _mark  Mark level (1-4)
/// @returns {struct} { can_build: bool, missing: array<struct> }
function blueprint_can_build(_blueprint_id, _mark) {
    var _result = { can_build: true, missing: [] };
    
    var _recipe = blueprint_get_recipe(_blueprint_id, _mark);
    for (var _i = 0; _i < array_length(_recipe); _i++) {
        var _req = _recipe[_i];
        var _have = inventory_count_item(global.player_inventory, _req.component_id);
        if (_have < _req.quantity) {
            _result.can_build = false;
            array_push(_result.missing, {
                component_id: _req.component_id,
                needed: _req.quantity,
                have: _have
            });
        }
    }
    
    return _result;
}

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

/// @func blueprint_get_data(_blueprint_id)
/// @desc Returns the full blueprint definition struct.
/// @param {string} _blueprint_id
/// @returns {struct|undefined}
function blueprint_get_data(_blueprint_id) {
    if (!variable_struct_exists(global.blueprint_data, _blueprint_id)) return undefined;
    return global.blueprint_data[$ _blueprint_id];
}

/// @func blueprint_get_by_type(_type)
/// @desc Returns array of blueprint IDs matching a type (MECH, AUTOMATON, DEFENSE, WALL).
/// @param {string} _type
/// @returns {array<string>}
function blueprint_get_by_type(_type) {
    if (!variable_struct_exists(global.blueprint_cache_by_type, _type)) return [];
    return global.blueprint_cache_by_type[$ _type];
}

/// @func blueprint_get_by_tier(_tier)
/// @desc Returns array of blueprint IDs matching a tier (1-5).
/// @param {int} _tier
/// @returns {array<string>}
function blueprint_get_by_tier(_tier) {
    var _key = string(_tier);
    if (!variable_struct_exists(global.blueprint_cache_by_tier, _key)) return [];
    return global.blueprint_cache_by_tier[$ _key];
}

/// @func blueprint_get_by_source(_source)
/// @desc Returns array of blueprint IDs matching a source (starting_kit, quest, exploration, etc.).
/// @param {string} _source
/// @returns {array<string>}
function blueprint_get_by_source(_source) {
    if (!variable_struct_exists(global.blueprint_cache_by_source, _source)) return [];
    return global.blueprint_cache_by_source[$ _source];
}

/// @func blueprint_get_all_discovered()
/// @desc Returns array of all discovered blueprint IDs.
/// @returns {array<string>}
function blueprint_get_all_discovered() {
    var _discovered = [];
    var _key = ds_map_find_first(global.journal.discovered_blueprints);
    while (!is_undefined(_key)) {
        array_push(_discovered, _key);
        _key = ds_map_find_next(global.journal.discovered_blueprints, _key);
    }
    return _discovered;
}

// ============================================================================
// SAVE/LOAD INTEGRATION
// ============================================================================

/// @func blueprint_serialize()
/// @desc Serializes blueprint discovery/upgrade state for save system.
/// @returns {struct} Serialized blueprint state
function blueprint_serialize() {
    var _data = {
        discovered: [],
        built: [],
        marks: {}
    };
    
    // Serialize discovered blueprints
    var _key = ds_map_find_first(global.journal.discovered_blueprints);
    while (!is_undefined(_key)) {
        array_push(_data.discovered, _key);
        _key = ds_map_find_next(global.journal.discovered_blueprints, _key);
    }
    
    // Serialize built blueprints
    _key = ds_map_find_first(global.journal.built_blueprints);
    while (!is_undefined(_key)) {
        array_push(_data.built, _key);
        _key = ds_map_find_next(global.journal.built_blueprints, _key);
    }
    
    // Serialize mark levels
    _key = ds_map_find_first(global.journal.blueprint_marks);
    while (!is_undefined(_key)) {
        _data.marks[$ _key] = ds_map_find_value(global.journal.blueprint_marks, _key);
        _key = ds_map_find_next(global.journal.blueprint_marks, _key);
    }
    
    return _data;
}

/// @func blueprint_deserialize(_data)
/// @desc Restores blueprint state from save data.
/// @param {struct} _data  Serialized blueprint state from blueprint_serialize()
function blueprint_deserialize(_data) {
    // Clear existing maps
    ds_map_clear(global.journal.discovered_blueprints);
    ds_map_clear(global.journal.built_blueprints);
    ds_map_clear(global.journal.blueprint_marks);
    
    // Restore discovered
    for (var _i = 0; _i < array_length(_data.discovered); _i++) {
        ds_map_add(global.journal.discovered_blueprints, _data.discovered[_i], true);
    }
    
    // Restore built
    for (var _i = 0; _i < array_length(_data.built); _i++) {
        ds_map_add(global.journal.built_blueprints, _data.built[_i], true);
    }
    
    // Restore marks
    var _mark_keys = variable_struct_get_names(_data.marks);
    for (var _i = 0; _i < array_length(_mark_keys); _i++) {
        var _bp_id = _mark_keys[_i];
        ds_map_add(global.journal.blueprint_marks, _bp_id, _data.marks[$ _bp_id]);
    }
    
    show_debug_message("INFO: Blueprint state restored. " 
        + string(array_length(_data.discovered)) + " discovered, "
        + string(array_length(_data.built)) + " built.");
}
