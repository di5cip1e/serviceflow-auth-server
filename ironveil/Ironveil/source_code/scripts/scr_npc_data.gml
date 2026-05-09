/// scr_npc_data.gml
/// NPC data loading, schedule resolution, gift response, and birthday checking.
/// Objective #16: Complete NPC System
///
/// Dependencies: scr_data, scr_time_system, scr_relationship (Obj #17)
/// Global data: global.npc_data (loaded from npcs_core.json)
///              global.npc_hearts (ds_map: npc_id -> heart_level, from relationship system)
///              global.story_flags (from event system #28)

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func npc_data_init()
/// @desc Loads all NPC definitions from JSON. Called during data_load_all().
function npc_data_init() {
    global.npc_data = data_load_file("data/npcs/npcs_core.json");
    
    // Remove metadata
    if (variable_struct_exists(global.npc_data, "_meta")) {
        variable_struct_remove(global.npc_data, "_meta");
    }
    
    // Build lookup caches
    global.npc_ids = variable_struct_get_names(global.npc_data);
    global.npc_count = array_length(global.npc_ids);
    
    // Track daily conversation status (reset each day)
    global.npc_talked_today = ds_map_create();
    
    // Track Wes courier run state
    global.wes_away_counter = 0;
    global.wes_is_away = false;
    global.wes_next_trip_day = 5 + irandom(2); // First trip between day 5-7
    
    show_debug_message("INFO: NPC data initialized. " + string(global.npc_count) + " NPCs loaded.");
}

// ============================================================================
// SCHEDULE RESOLUTION
// ============================================================================

/// @func npc_resolve_schedule(_npc_id)
/// @desc Resolves the current schedule for an NPC based on priority system:
///       story_flag > festival > weather > hearts_conditional > seasonal > base
/// @param {string} _npc_id  NPC identifier
/// @returns {array} Array of schedule entry structs for today, or empty array
function npc_resolve_schedule(_npc_id) {
    var _npc = global.npc_data[$ _npc_id];
    if (_npc == undefined) return [];
    
    // --- Priority 1: Story flag overrides ---
    var _conditional = _npc.conditional_schedules;
    for (var _i = 0; _i < array_length(_conditional); _i++) {
        var _cond = _conditional[_i];
        if (_cond.condition == "story_flag") {
            if (variable_struct_exists(global, "story_flags") 
                && variable_struct_exists(global.story_flags, _cond.value)
                && global.story_flags[$ _cond.value] == true) {
                // Check season applicability
                if (_npc_schedule_season_match(_cond)) {
                    return [_cond.override_entry];
                }
            }
        }
    }
    
    // --- Priority 2: Festival override (handled by festival system) ---
    // If a festival is active today, the festival system provides schedule overrides
    // This is checked externally; we skip it here
    
    // --- Priority 3: Wes away-from-town check ---
    if (_npc_id == "npc_wes" && global.wes_is_away) {
        return []; // Empty schedule = NPC not present
    }
    
    // --- Priority 4: Special day overrides ---
    for (var _i = 0; _i < array_length(_conditional); _i++) {
        var _cond = _conditional[_i];
        if (_cond.condition == "special_day") {
            if (_npc_check_special_day(_cond.value)) {
                if (_cond.override_entry != undefined) {
                    // Merge: special day entry replaces matching time slot in base schedule
                    var _base = _npc_get_base_schedule(_npc);
                    return _npc_merge_override(_base, _cond.override_entry);
                }
            }
        }
    }
    
    // --- Priority 5: Heart-level conditional overrides ---
    var _hearts = 0;
    if (ds_map_exists(global.npc_hearts, _npc_id)) {
        _hearts = ds_map_find_value(global.npc_hearts, _npc_id);
    }
    
    var _base_schedule = _npc_get_base_schedule(_npc);
    
    for (var _i = 0; _i < array_length(_conditional); _i++) {
        var _cond = _conditional[_i];
        if (_cond.condition == "hearts_gte" && _hearts >= _cond.value) {
            if (_npc_schedule_season_match(_cond) && _npc_schedule_weather_match(_cond)) {
                if (_cond.override_entry != undefined) {
                    _base_schedule = _npc_merge_override(_base_schedule, _cond.override_entry);
                }
            }
        }
    }
    
    return _base_schedule;
}

/// @func _npc_get_base_schedule(_npc)
/// @desc Returns the base seasonal+weather schedule for an NPC.
/// @param {struct} _npc  NPC data struct
/// @returns {array} Schedule entries
function _npc_get_base_schedule(_npc) {
    // Build schedule key from current season and weather
    var _season = "";
    switch (global.time_season) {
        case 0: _season = "spring"; break;
        case 1: _season = "summer"; break;
        case 2: _season = "autumn"; break;
        case 3: _season = "winter"; break;
    }
    
    var _weather = global.time_weather; // "CLEAR", "CLOUDY", "RAIN", "STORM", "SNOW", "FOG"
    var _is_bad_weather = (_weather == "RAIN" || _weather == "STORM" || _weather == "SNOW");
    
    var _schedule_key = _season + (_is_bad_weather ? "_rainy" : "_default");
    
    if (variable_struct_exists(_npc.schedules, _schedule_key)) {
        return _npc.schedules[$ _schedule_key];
    }
    
    // Fallback to default if rainy variant doesn't exist
    var _fallback_key = _season + "_default";
    if (variable_struct_exists(_npc.schedules, _fallback_key)) {
        return _npc.schedules[$ _fallback_key];
    }
    
    return [];
}

/// @func _npc_schedule_season_match(_cond)
/// @desc Checks if the current season matches a conditional schedule's season list.
/// @param {struct} _cond  Conditional schedule struct with .seasons array
/// @returns {bool}
function _npc_schedule_season_match(_cond) {
    if (!variable_struct_exists(_cond, "seasons")) return true;
    
    var _current_season = "";
    switch (global.time_season) {
        case 0: _current_season = "SPRING"; break;
        case 1: _current_season = "SUMMER"; break;
        case 2: _current_season = "AUTUMN"; break;
        case 3: _current_season = "WINTER"; break;
    }
    
    for (var _i = 0; _i < array_length(_cond.seasons); _i++) {
        if (_cond.seasons[_i] == _current_season) return true;
    }
    return false;
}

/// @func _npc_schedule_weather_match(_cond)
/// @desc Checks if current weather matches a conditional schedule's weather requirement.
/// @param {struct} _cond  Conditional schedule struct with .weather string
/// @returns {bool}
function _npc_schedule_weather_match(_cond) {
    if (!variable_struct_exists(_cond, "weather")) return true;
    if (_cond.weather == "ANY") return true;
    return (_cond.weather == global.time_weather);
}

/// @func _npc_merge_override(_base_schedule, _override_entry)
/// @desc Inserts an override entry into a base schedule, splitting/replacing
///       any existing entries that overlap the override's time range.
/// @param {array} _base_schedule  Base schedule entries
/// @param {struct} _override_entry  Override entry with start_hour, end_hour
/// @returns {array} Merged schedule
function _npc_merge_override(_base_schedule, _override_entry) {
    var _result = [];
    var _ov_start = _override_entry.start_hour;
    var _ov_end = _override_entry.end_hour;
    
    for (var _i = 0; _i < array_length(_base_schedule); _i++) {
        var _entry = _base_schedule[_i];
        var _e_start = _entry.start_hour;
        var _e_end = _entry.end_hour;
        
        // Handle wrap-around schedules (e.g., 11pm to 2am)
        // For simplicity, treat end_hour < start_hour as next-day
        
        // No overlap: entry ends before override starts or starts after override ends
        if (_e_end <= _ov_start || _e_start >= _ov_end) {
            array_push(_result, _entry);
        } else {
            // Partial overlap — split the base entry
            if (_e_start < _ov_start) {
                // Keep the part before the override
                var _before = {};
                variable_struct_copy(_entry, _before);
                _before.end_hour = _ov_start;
                array_push(_result, _before);
            }
            if (_e_end > _ov_end) {
                // Keep the part after the override
                var _after = {};
                variable_struct_copy(_entry, _after);
                _after.start_hour = _ov_end;
                array_push(_result, _after);
            }
        }
    }
    
    // Insert the override entry
    array_push(_result, _override_entry);
    
    // Sort by start_hour
    array_sort(_result, function(_a, _b) {
        return _a.start_hour - _b.start_hour;
    });
    
    return _result;
}

/// @func _npc_check_special_day(_value)
/// @desc Checks if today matches a special day condition string.
/// @param {string} _value  e.g., "season_day_10"
/// @returns {bool}
function _npc_check_special_day(_value) {
    if (_value == "season_day_10") {
        return (global.time_day == 10);
    }
    return false;
}

/// @func npc_get_current_location(_npc_id)
/// @desc Returns the current schedule entry for an NPC based on the time of day.
/// @param {string} _npc_id
/// @returns {struct|undefined} Current schedule entry, or undefined if NPC is off-schedule
function npc_get_current_location(_npc_id) {
    var _schedule = npc_resolve_schedule(_npc_id);
    var _hour = global.time_hour;
    
    for (var _i = 0; _i < array_length(_schedule); _i++) {
        var _entry = _schedule[_i];
        var _start = _entry.start_hour;
        var _end = _entry.end_hour;
        
        // Handle wrap-around (e.g., 23 to 2 means 23:00 to 02:00)
        if (_end < _start) {
            if (_hour >= _start || _hour < _end) return _entry;
        } else {
            if (_hour >= _start && _hour < _end) return _entry;
        }
    }
    
    return undefined;
}

// ============================================================================
// GIFT SYSTEM
// ============================================================================

/// @func npc_give_gift(_npc_id, _item_id)
/// @desc Processes giving a gift to an NPC. Returns heart point change and reaction.
/// @param {string} _npc_id
/// @param {string} _item_id
/// @returns {struct} { points: int, reaction: string, category: string }
function npc_give_gift(_npc_id, _item_id) {
    var _npc = global.npc_data[$ _npc_id];
    if (_npc == undefined) return { points: 0, reaction: "confused", category: "UNKNOWN" };
    
    var _prefs = _npc.gift_preferences;
    var _category = "NEUTRAL";
    var _points = 1;
    var _reaction = "neutral";
    
    // Check loved
    if (array_contains(_prefs.loved, _item_id)) {
        _category = "LOVED";
        _points = irandom_range(5, 8);
        _reaction = "happy";
    }
    // Check liked
    else if (array_contains(_prefs.liked, _item_id)) {
        _category = "LIKED";
        _points = irandom_range(3, 4);
        _reaction = "pleased";
    }
    // Check hated
    else if (array_contains(_prefs.hated, _item_id)) {
        _category = "HATED";
        _points = irandom_range(-5, -3);
        _reaction = "angry";
    }
    
    // Birthday multiplier
    if (npc_is_birthday(_npc_id)) {
        _points = _points * 2;
        show_debug_message("INFO: Birthday multiplier applied for " + _npc_id);
    }
    
    // Gift wrapping bonus (if item has wrapped flag)
    // Would check: if (item_is_wrapped(_item_id)) _points += 1;
    
    // Apply heart points via relationship system
    if (variable_struct_exists(global, "npc_hearts")) {
        var _current = 0;
        if (ds_map_exists(global.npc_hearts, _npc_id)) {
            _current = ds_map_find_value(global.npc_hearts, _npc_id);
        }
        var _new_val = clamp(_current + _points, 0, 1000); // 1000 = 10 hearts × 100 points each
        ds_map_replace(global.npc_hearts, _npc_id, _new_val);
    }
    
    show_debug_message("INFO: Gift to " + _npc_id + ": " + _item_id 
        + " -> " + _category + " (" + string(_points) + " pts)");
    
    return { points: _points, reaction: _reaction, category: _category };
}

/// @func npc_daily_talk(_npc_id)
/// @desc Processes daily conversation with NPC. Returns heart points gained.
/// @param {string} _npc_id
/// @returns {int} Heart points gained (0 if already talked today)
function npc_daily_talk(_npc_id) {
    // Check if already talked today
    if (ds_map_exists(global.npc_talked_today, _npc_id)) {
        var _count = ds_map_find_value(global.npc_talked_today, _npc_id);
        if (_count >= 1) {
            // Diminishing returns for repeat conversation
            return 0;
        }
    }
    
    var _points = irandom_range(1, 3);
    
    // Apply to relationship
    if (variable_struct_exists(global, "npc_hearts")) {
        var _current = 0;
        if (ds_map_exists(global.npc_hearts, _npc_id)) {
            _current = ds_map_find_value(global.npc_hearts, _npc_id);
        }
        ds_map_replace(global.npc_hearts, _npc_id, clamp(_current + _points, 0, 1000));
    }
    
    // Track conversation
    if (ds_map_exists(global.npc_talked_today, _npc_id)) {
        ds_map_replace(global.npc_talked_today, _npc_id, 
            ds_map_find_value(global.npc_talked_today, _npc_id) + 1);
    } else {
        ds_map_add(global.npc_talked_today, _npc_id, 1);
    }
    
    return _points;
}

// ============================================================================
// BIRTHDAY SYSTEM
// ============================================================================

/// @func npc_is_birthday(_npc_id)
/// @desc Checks if today is an NPC's birthday.
/// @param {string} _npc_id
/// @returns {bool}
function npc_is_birthday(_npc_id) {
    var _npc = global.npc_data[$ _npc_id];
    if (_npc == undefined) return false;
    
    var _bday = _npc.birthday;
    var _current_season = "";
    switch (global.time_season) {
        case 0: _current_season = "SPRING"; break;
        case 1: _current_season = "SUMMER"; break;
        case 2: _current_season = "AUTUMN"; break;
        case 3: _current_season = "WINTER"; break;
    }
    
    return (_bday.season == _current_season && _bday.day == global.time_day);
}

/// @func npc_get_todays_birthdays()
/// @desc Returns array of NPC IDs whose birthday is today.
/// @returns {array<string>}
function npc_get_todays_birthdays() {
    var _result = [];
    for (var _i = 0; _i < global.npc_count; _i++) {
        if (npc_is_birthday(global.npc_ids[_i])) {
            array_push(_result, global.npc_ids[_i]);
        }
    }
    return _result;
}

// ============================================================================
// DAILY UPDATE (Called by time_advance_day)
// ============================================================================

/// @func npc_daily_update()
/// @desc Resets daily conversation tracking and handles Wes courier schedule.
///       Called as part of the daily update cycle.
function npc_daily_update() {
    // Reset daily talk tracking
    ds_map_clear(global.npc_talked_today);
    
    // Handle Wes courier run schedule
    global.wes_away_counter++;
    
    if (global.wes_is_away) {
        // Count down away days
        global.wes_away_counter++;
        var _away_duration = irandom_range(2, 3);
        if (global.wes_away_counter >= _away_duration) {
            global.wes_is_away = false;
            global.wes_away_counter = 0;
            global.wes_next_trip_day = global.time_day + 5 + irandom(2);
            show_debug_message("INFO: Wes returned from courier run.");
            // event_fire("wes_returned", {})
        }
    } else {
        // Check if it's time for Wes to leave
        if (global.time_day >= global.wes_next_trip_day) {
            global.wes_is_away = true;
            global.wes_away_counter = 0;
            show_debug_message("INFO: Wes departed on courier run.");
            // event_fire("wes_departed", {})
        }
    }
    
    // Check for birthdays and fire events
    var _birthdays = npc_get_todays_birthdays();
    for (var _i = 0; _i < array_length(_birthdays); _i++) {
        show_debug_message("INFO: Today is " + _birthdays[_i] + "'s birthday!");
        // event_fire("npc_birthday", { npc_id: _birthdays[_i] })
    }
}

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

/// @func npc_get_data(_npc_id)
/// @desc Returns the full NPC data struct.
/// @param {string} _npc_id
/// @returns {struct|undefined}
function npc_get_data(_npc_id) {
    if (!variable_struct_exists(global.npc_data, _npc_id)) return undefined;
    return global.npc_data[$ _npc_id];
}

/// @func npc_get_display_name(_npc_id)
/// @desc Returns the display name for an NPC.
/// @param {string} _npc_id
/// @returns {string}
function npc_get_display_name(_npc_id) {
    var _npc = npc_get_data(_npc_id);
    if (_npc == undefined) return "???";
    return _npc.display_name;
}

/// @func npc_is_romance_candidate(_npc_id)
/// @desc Checks if an NPC is a romance candidate.
/// @param {string} _npc_id
/// @returns {bool}
function npc_is_romance_candidate(_npc_id) {
    var _npc = npc_get_data(_npc_id);
    if (_npc == undefined) return false;
    return _npc.is_romance_candidate;
}

/// @func npc_get_all_romance_candidates()
/// @desc Returns array of NPC IDs that are romance candidates.
/// @returns {array<string>}
function npc_get_all_romance_candidates() {
    var _result = [];
    for (var _i = 0; _i < global.npc_count; _i++) {
        var _id = global.npc_ids[_i];
        if (npc_is_romance_candidate(_id)) {
            array_push(_result, _id);
        }
    }
    return _result;
}

// ============================================================================
// SAVE/LOAD INTEGRATION
// ============================================================================

/// @func npc_serialize()
/// @desc Serializes NPC runtime state for save system.
/// @returns {struct}
function npc_serialize() {
    return {
        wes_is_away: global.wes_is_away,
        wes_away_counter: global.wes_away_counter,
        wes_next_trip_day: global.wes_next_trip_day
    };
}

/// @func npc_deserialize(_data)
/// @desc Restores NPC runtime state from save data.
/// @param {struct} _data
function npc_deserialize(_data) {
    global.wes_is_away = _data.wes_is_away;
    global.wes_away_counter = _data.wes_away_counter;
    global.wes_next_trip_day = _data.wes_next_trip_day;
    
    show_debug_message("INFO: NPC state restored. Wes away: " + string(global.wes_is_away));
}
