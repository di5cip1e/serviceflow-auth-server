/// scr_romance_system.gml
/// Romance system: heart event triggering, confession, partnership, post-partnership content.
/// Objective #34: Romance System
///
/// Dependencies: scr_data, scr_npc_data, scr_dialogue_data, scr_inventory, scr_save_load
/// Global data: global.romance_data    (loaded from romance_events.json)
///              global.partnership_data (loaded from partnership_data.json)
///              global.romance_state    (runtime state)

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func romance_system_init()
/// @desc Loads romance event definitions and partnership data.
///       Called during data_load_all() in the boot sequence.
function romance_system_init() {
    // Load romance events
    var _rom_raw = data_load_file("data/romance/romance_events.json");
    if (_rom_raw != undefined) {
        if (variable_struct_exists(_rom_raw, "_meta")) {
            variable_struct_remove(_rom_raw, "_meta");
        }
        global.romance_candidates = _rom_raw.romance_candidates;
        global.romance_events = {};
        global.romance_promise_locket = _rom_raw.promise_locket;
        
        for (var _i = 0; _i < array_length(_rom_raw.events); _i++) {
            var _evt = _rom_raw.events[_i];
            global.romance_events[$ _evt.event_id] = _evt;
        }
        
        show_debug_message("INFO: Romance events loaded. " 
            + string(array_length(_rom_raw.events)) + " events for " 
            + string(array_length(global.romance_candidates)) + " candidates.");
    }
    
    // Load partnership data
    var _part_raw = data_load_file("data/romance/partnership_data.json");
    if (_part_raw != undefined) {
        if (variable_struct_exists(_part_raw, "_meta")) {
            variable_struct_remove(_part_raw, "_meta");
        }
        global.partnership_data = _part_raw;
    }
    
    // Initialize runtime state (overwritten by save/load)
    if (!variable_struct_exists(global, "romance_state")) {
        global.romance_state = {
            active_romance: "",       // NPC ID of active romance partner, or ""
            partnership: "",          // NPC ID of partnership partner, or ""
            completed_events: {},     // event_id -> true
            confession_done: false,
            partnership_done: false,
            packed_lunch_given_today: false,
            anniversary_day: -1,
            anniversary_season: -1
        };
    }
    
    show_debug_message("INFO: Romance system initialized.");
}

// ============================================================================
// HEART EVENT CHECKING
// ============================================================================

/// @func romance_check_events()
/// @desc Called on room enter. Checks if any heart event should trigger based on
///       current location, time, heart level, and story flags.
/// @returns {string} Event ID to trigger, or "" if none
function romance_check_events() {
    var _current_room = room_get_name(room);
    var _current_hour = global.time_hour;
    
    // Don't trigger events during raids or other non-free-roam states
    if (global.game_state != GAME_STATE.GAMEPLAY) return "";
    if (variable_struct_exists(global, "game_sub_state") 
        && global.game_sub_state != "FREE_ROAM") return "";
    
    var _evt_ids = variable_struct_get_names(global.romance_events);
    
    for (var _i = 0; _i < array_length(_evt_ids); _i++) {
        var _evt = global.romance_events[$ _evt_ids[_i]];
        
        // Skip already completed events
        if (variable_struct_exists(global.romance_state.completed_events, _evt.event_id)) {
            continue;
        }
        
        // Check if confession events are blocked (already in a romance)
        if (variable_struct_exists(_evt, "is_confession") && _evt.is_confession == true) {
            if (global.romance_state.active_romance != "" 
                && global.romance_state.active_romance != _evt.npc_id) {
                continue; // Already in a romance with someone else
            }
        }
        
        // Check heart level
        var _npc_id = _evt.npc_id;
        var _hearts = 0;
        if (ds_map_exists(global.npc_hearts, _npc_id)) {
            _hearts = floor(ds_map_find_value(global.npc_hearts, _npc_id) / 100);
        }
        if (_hearts < _evt.heart_level_required) continue;
        
        // Check location
        if (_evt.location != _current_room) continue;
        
        // Check time range
        var _tr = _evt.time_range;
        if (_current_hour < _tr.start || _current_hour >= _tr.end) continue;
        
        // Check story flag requirement
        if (_evt.story_flag_required != undefined && _evt.story_flag_required != "") {
            if (!variable_struct_exists(global, "story_flags") 
                || !variable_struct_exists(global.story_flags, _evt.story_flag_required)
                || global.story_flags[$ _evt.story_flag_required] != true) {
                continue;
            }
        }
        
        // Check required item (Promise Locket for confessions)
        if (_evt.requires_item != undefined && _evt.requires_item != "") {
            // Check player inventory for the item
            if (!variable_struct_exists(global, "inventory") 
                || !variable_struct_exists(global.inventory, _evt.requires_item)
                || global.inventory[$ _evt.requires_item] <= 0) {
                continue;
            }
        }
        
        // Check NPC is present in the room (via schedule system)
        var _schedule = npc_resolve_schedule(_npc_id);
        var _npc_here = false;
        for (var _j = 0; _j < array_length(_schedule); _j++) {
            var _s = _schedule[_j];
            if (_s.room_id == _current_room 
                && _current_hour >= _s.start_hour 
                && _current_hour < _s.end_hour) {
                _npc_here = true;
                break;
            }
        }
        if (!_npc_here) continue;
        
        // All conditions met — this event should trigger
        show_debug_message("INFO: Heart event triggered: " + _evt.event_id);
        return _evt.event_id;
    }
    
    return "";
}

// ============================================================================
// EVENT EXECUTION
// ============================================================================

/// @func romance_trigger_event(_event_id)
/// @desc Triggers a heart event: loads dialogue, sets game state, begins event sequence.
/// @param {string} _event_id  Event ID to trigger
/// @returns {bool} True if event started successfully
function romance_trigger_event(_event_id) {
    var _evt = global.romance_events[$ _event_id];
    if (_evt == undefined) {
        show_debug_message("WARN: romance_trigger_event — Unknown event: " + _event_id);
        return false;
    }
    
    // Load the dialogue script
    var _dialogue = dialogue_get_heart_event(_event_id);
    if (_dialogue == undefined) {
        show_debug_message("WARN: romance_trigger_event — Dialogue not found for: " + _event_id);
        return false;
    }
    
    // Mark event as completed
    global.romance_state.completed_events[$ _event_id] = true;
    
    // Set story flag
    if (_evt.story_flag_set != undefined && _evt.story_flag_set != "") {
        if (!variable_struct_exists(global, "story_flags")) {
            global.story_flags = {};
        }
        global.story_flags[$ _evt.story_flag_set] = true;
    }
    
    // Award heart bonus
    if (_evt.heart_bonus != undefined && _evt.heart_bonus > 0) {
        if (ds_map_exists(global.npc_hearts, _evt.npc_id)) {
            var _current = ds_map_find_value(global.npc_hearts, _evt.npc_id);
            ds_map_replace(global.npc_hearts, _evt.npc_id, _current + _evt.heart_bonus);
        }
    }
    
    // Handle confession events
    if (variable_struct_exists(_evt, "is_confession") && _evt.is_confession == true) {
        global.romance_state.active_romance = _evt.npc_id;
        global.romance_state.confession_done = true;
        
        // Consume Promise Locket
        if (_evt.requires_item != undefined && _evt.requires_item != "") {
            if (variable_struct_exists(global.inventory, _evt.requires_item)) {
                global.inventory[$ _evt.requires_item]--;
            }
        }
        
        // Unlock locket recipe for future (in case player wants another playthrough info)
        if (!variable_struct_exists(global, "story_flags")) global.story_flags = {};
        global.story_flags[$ "romance_locket_unlocked"] = true;
        
        show_debug_message("INFO: Romance confession completed with " + _evt.npc_id);
    }
    
    // Audio: Play heart event music
    audio_manager_play_music("mus_heart_to_heart");
    
    // Queue the dialogue for the dialogue system to display
    // The dialogue/cutscene system reads this and runs the event
    global.romance_state.active_heart_event = {
        event_id: _event_id,
        npc_id: _evt.npc_id,
        title: _dialogue.title,
        lines: _dialogue.lines,
        current_line: 0,
        total_lines: array_length(_dialogue.lines)
    };
    
    show_debug_message("INFO: Heart event started: " + _event_id 
        + " (" + string(array_length(_dialogue.lines)) + " lines)");
    return true;
}

// ============================================================================
// PARTNERSHIP
// ============================================================================

/// @func romance_start_partnership(_npc_id)
/// @desc Triggers the partnership ceremony for the active romance partner.
/// @param {string} _npc_id  NPC ID (must be active romance partner at heart 10)
/// @returns {bool} True if partnership started
function romance_start_partnership(_npc_id) {
    // Validate: must be the active romance partner
    if (global.romance_state.active_romance != _npc_id) {
        show_debug_message("WARN: romance_start_partnership — Not the active partner: " + _npc_id);
        return false;
    }
    
    // Validate: heart level must be 10
    var _hearts = 0;
    if (ds_map_exists(global.npc_hearts, _npc_id)) {
        _hearts = floor(ds_map_find_value(global.npc_hearts, _npc_id) / 100);
    }
    if (_hearts < 10) {
        show_debug_message("WARN: romance_start_partnership — Hearts too low: " + string(_hearts));
        return false;
    }
    
    // Set partnership
    global.romance_state.partnership = _npc_id;
    global.romance_state.partnership_done = true;
    
    // Set story flag for schedule overrides
    if (!variable_struct_exists(global, "story_flags")) global.story_flags = {};
    global.story_flags[$ "partnership_" + _npc_id] = true;
    
    // Record anniversary date
    global.romance_state.anniversary_day = global.time_day;
    global.romance_state.anniversary_season = global.time_season;
    
    show_debug_message("INFO: Partnership ceremony with " + _npc_id 
        + " on Year " + string(global.time_year) 
        + " Season " + string(global.time_season) 
        + " Day " + string(global.time_day));
    
    // Fire event for UI/cutscene system
    // event_fire("partnership_ceremony", { npc_id: _npc_id });
    
    return true;
}

// ============================================================================
// DAILY UPDATE (Post-Partnership)
// ============================================================================

/// @func romance_daily_update()
/// @desc Called each morning. Handles post-partnership content:
///       packed lunches, anniversary checks, schedule updates.
function romance_daily_update() {
    var _partner = global.romance_state.partnership;
    if (_partner == "") return;
    
    // Reset daily flags
    global.romance_state.packed_lunch_given_today = false;
    
    // Packed lunch: partner leaves a food item
    if (variable_struct_exists(global.partnership_data, "partners")) {
        var _p_data = global.partnership_data.partners[$ _partner];
        if (_p_data != undefined && variable_struct_exists(_p_data, "packed_lunch_items")) {
            var _lunch_items = _p_data.packed_lunch_items;
            var _item = _lunch_items[irandom(array_length(_lunch_items) - 1)];
            
            // Add to player inventory
            if (!variable_struct_exists(global, "inventory")) global.inventory = {};
            if (!variable_struct_exists(global.inventory, _item)) {
                global.inventory[$ _item] = 0;
            }
            global.inventory[$ _item]++;
            global.romance_state.packed_lunch_given_today = true;
            
            show_debug_message("INFO: Packed lunch from " + _partner + ": " + _item);
        }
    }
    
    // Anniversary check
    if (global.time_day == global.romance_state.anniversary_day 
        && global.time_season == global.romance_state.anniversary_season
        && global.time_year > 1) { // Not on the first year
        show_debug_message("INFO: Anniversary! Partner: " + _partner);
        // event_fire("anniversary", { npc_id: _partner });
    }
}

// ============================================================================
// STATUS QUERIES
// ============================================================================

/// @func romance_get_status()
/// @desc Returns current romance state for UI display.
/// @returns {struct}
function romance_get_status() {
    return {
        active_romance: global.romance_state.active_romance,
        partnership: global.romance_state.partnership,
        confession_done: global.romance_state.confession_done,
        partnership_done: global.romance_state.partnership_done,
        packed_lunch_today: global.romance_state.packed_lunch_given_today
    };
}

/// @func romance_is_candidate(_npc_id)
/// @desc Checks if an NPC is a romance candidate.
/// @param {string} _npc_id
/// @returns {bool}
function romance_is_candidate(_npc_id) {
    for (var _i = 0; _i < array_length(global.romance_candidates); _i++) {
        if (global.romance_candidates[_i] == _npc_id) return true;
    }
    return false;
}

/// @func romance_get_partner_dialogue()
/// @desc Returns a morning or evening dialogue line from the partner.
///       Selects based on current time of day.
/// @returns {string} Dialogue text or ""
function romance_get_partner_dialogue() {
    var _partner = global.romance_state.partnership;
    if (_partner == "") return "";
    
    var _p_data = global.partnership_data.partners[$ _partner];
    if (_p_data == undefined) return "";
    
    var _hour = global.time_hour;
    var _pool = [];
    
    if (_hour >= 6 && _hour < 12) {
        _pool = _p_data.morning_dialogue_pool;
    } else if (_hour >= 18 && _hour < 23) {
        _pool = _p_data.evening_dialogue_pool;
    }
    
    if (array_length(_pool) == 0) return "";
    return _pool[irandom(array_length(_pool) - 1)];
}

// ============================================================================
// SAVE / LOAD
// ============================================================================

/// @func romance_save()
/// @desc Returns a struct suitable for inclusion in the save file.
/// @returns {struct}
function romance_save() {
    return {
        active_romance: global.romance_state.active_romance,
        partnership: global.romance_state.partnership,
        completed_events: global.romance_state.completed_events,
        confession_done: global.romance_state.confession_done,
        partnership_done: global.romance_state.partnership_done,
        anniversary_day: global.romance_state.anniversary_day,
        anniversary_season: global.romance_state.anniversary_season
    };
}

/// @func romance_load(_save_data)
/// @desc Restores romance state from save data.
/// @param {struct} _save_data  Romance portion of save file
function romance_load(_save_data) {
    if (_save_data == undefined) return;
    
    global.romance_state.active_romance = _save_data.active_romance;
    global.romance_state.partnership = _save_data.partnership;
    global.romance_state.completed_events = _save_data.completed_events;
    global.romance_state.confession_done = _save_data.confession_done;
    global.romance_state.partnership_done = _save_data.partnership_done;
    global.romance_state.anniversary_day = _save_data.anniversary_day;
    global.romance_state.anniversary_season = _save_data.anniversary_season;
    global.romance_state.packed_lunch_given_today = false;
    
    show_debug_message("INFO: Romance state loaded. Partner: " 
        + (global.romance_state.partnership != "" ? global.romance_state.partnership : "none")
        + " | Romance: " 
        + (global.romance_state.active_romance != "" ? global.romance_state.active_romance : "none"));
}
