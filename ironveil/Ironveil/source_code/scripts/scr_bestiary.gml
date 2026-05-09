/// scr_bestiary.gml
/// Bestiary system: enemy kill tracking, tiered info unlocks, journal integration.
/// Objective #38: Journal & Discovery System
///
/// Dependencies: scr_data, scr_enemy_ai
/// Global data: global.bestiary_data   (display definitions from bestiary_entries.json)
///              global.bestiary_state   (runtime: kill counts per enemy type)

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func bestiary_init()
/// @desc Loads bestiary display data and initializes kill tracking.
function bestiary_init() {
    var _raw = data_load_file("data/bestiary/bestiary_entries.json");
    if (_raw != undefined) {
        if (variable_struct_exists(_raw, "_meta")) variable_struct_remove(_raw, "_meta");
        global.bestiary_data = {};
        for (var _i = 0; _i < array_length(_raw.entries); _i++) {
            var _e = _raw.entries[_i];
            global.bestiary_data[$ _e.enemy_type] = _e;
        }
        show_debug_message("INFO: Bestiary loaded. " + string(array_length(_raw.entries)) + " enemy types.");
    }
    
    if (!variable_struct_exists(global, "bestiary_state")) {
        global.bestiary_state = {
            kill_counts: {} // enemy_type -> count
        };
    }
}

// ============================================================================
// KILL TRACKING
// ============================================================================

/// @func bestiary_record_kill(_enemy_type)
/// @desc Increments the kill counter for an enemy type.
/// @param {string} _enemy_type
function bestiary_record_kill(_enemy_type) {
    if (!variable_struct_exists(global.bestiary_state.kill_counts, _enemy_type)) {
        global.bestiary_state.kill_counts[$ _enemy_type] = 0;
    }
    global.bestiary_state.kill_counts[$ _enemy_type]++;
    
    var _count = global.bestiary_state.kill_counts[$ _enemy_type];
    if (_count == 1 || _count == 10 || _count == 50) {
        show_debug_message("INFO: Bestiary milestone: " + _enemy_type + " kills = " + string(_count));
    }
}

// ============================================================================
// ENTRY RETRIEVAL
// ============================================================================

/// @func bestiary_get_entry(_enemy_type)
/// @desc Returns the bestiary display data for an enemy type, filtered by kill count tier.
/// @param {string} _enemy_type
/// @returns {struct|undefined} { enemy_type, name, tier, stats, description, lore, faction, kills }
function bestiary_get_entry(_enemy_type) {
    var _data = global.bestiary_data[$ _enemy_type];
    if (_data == undefined) return undefined;
    
    var _kills = 0;
    if (variable_struct_exists(global.bestiary_state.kill_counts, _enemy_type)) {
        _kills = global.bestiary_state.kill_counts[$ _enemy_type];
    }
    
    if (_kills < 1) return undefined; // Not discovered yet
    
    // Tier 1: Name only (1+ kills)
    var _result = {
        enemy_type: _enemy_type,
        name: _data.name,
        faction: _data.faction,
        tier: 1,
        kills: _kills,
        stats: "???",
        description: "Defeat more to learn about this enemy.",
        lore: "???"
    };
    
    // Tier 2: Stats revealed (10+ kills)
    if (_kills >= 10) {
        _result.tier = 2;
        _result.stats = _data.stats_display;
        _result.description = _data.description_short;
    }
    
    // Tier 3: Full info (50+ kills)
    if (_kills >= 50) {
        _result.tier = 3;
        _result.description = _data.description_full;
        _result.lore = _data.lore;
    }
    
    return _result;
}

/// @func bestiary_get_all()
/// @desc Returns all discovered bestiary entries for the journal tab.
/// @returns {array} Array of bestiary entry structs
function bestiary_get_all() {
    var _result = [];
    var _all_types = variable_struct_get_names(global.bestiary_data);
    
    for (var _i = 0; _i < array_length(_all_types); _i++) {
        var _entry = bestiary_get_entry(_all_types[_i]);
        if (_entry != undefined) {
            array_push(_result, _entry);
        }
    }
    
    // Sort by faction then name
    array_sort(_result, function(_a, _b) {
        if (_a.faction != _b.faction) return (_a.faction < _b.faction) ? -1 : 1;
        return (_a.name < _b.name) ? -1 : 1;
    });
    
    return _result;
}

// ============================================================================
// SAVE / LOAD
// ============================================================================

/// @func bestiary_save()
function bestiary_save() {
    return { kill_counts: global.bestiary_state.kill_counts };
}

/// @func bestiary_load(_save_data)
function bestiary_load(_save_data) {
    if (_save_data == undefined) return;
    global.bestiary_state.kill_counts = _save_data.kill_counts;
    show_debug_message("INFO: Bestiary state loaded.");
}
