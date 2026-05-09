/// scr_dialogue_data.gml
/// Dialogue data loading, selection, and retrieval for seasonal/daily, heart milestones,
/// festival dialogue, and heart event scripts.
/// Objective #33: Complete NPC Dialogue (Year 1)
///
/// Dependencies: scr_data, scr_npc_data, scr_dejin_system
/// Global data: global.dialogue_seasonal (per-NPC dialogue pools)
///              global.dialogue_festivals (festival dialogue entries)
///              global.dialogue_heart_events (heart event scripts, lazy-loaded)

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func dialogue_data_init()
/// @desc Loads all NPC dialogue JSON files and festival dialogue.
///       Called during data_load_all() in the boot sequence.
function dialogue_data_init() {
    global.dialogue_seasonal = {};
    global.dialogue_festivals = {};
    global.dialogue_heart_events = {}; // Lazy-loaded on demand
    
    // Load per-NPC dialogue files
    for (var _i = 0; _i < global.npc_count; _i++) {
        var _npc_id = global.npc_ids[_i];
        var _path = "data/dialogue/" + _npc_id + ".json";
        var _data = data_load_file(_path);
        
        if (_data != undefined) {
            if (variable_struct_exists(_data, "_meta")) {
                variable_struct_remove(_data, "_meta");
            }
            global.dialogue_seasonal[$ _npc_id] = _data.entries;
            show_debug_message("INFO: Dialogue loaded for " + _npc_id 
                + " (" + string(array_length(_data.entries)) + " entries)");
        }
    }
    
    // Load festival dialogue
    var _fest_data = data_load_file("data/dialogue/festival_dialogue.json");
    if (_fest_data != undefined) {
        if (variable_struct_exists(_fest_data, "_meta")) {
            variable_struct_remove(_fest_data, "_meta");
        }
        // Index by npc_id for fast lookup
        for (var _i = 0; _i < array_length(_fest_data.entries); _i++) {
            var _entry = _fest_data.entries[_i];
            var _key = _entry.npc_id + "_" + _entry.festival_id;
            global.dialogue_festivals[$ _key] = _entry;
        }
        show_debug_message("INFO: Festival dialogue loaded (" 
            + string(array_length(_fest_data.entries)) + " entries)");
    }
    
    // Load quest-specific dialogue files (MQ-18 through MQ-27, etc.)
    global.dialogue_quest = {};
    var _quest_dialogue_files = [
        "data/dialogue/mq_18_distant_shores.json",
        "data/dialogue/mq_19_beacon_summit.json",
        "data/dialogue/mq_20_the_bunker.json",
        "data/dialogue/mq_21_broken_trust.json",
        "data/dialogue/mq_22_marshal_speaks.json",
        "data/dialogue/mq_23_alliance_forged.json",
        "data/dialogue/mq_24_siege.json",
        "data/dialogue/mq_25_grand_expedition.json",
        "data/dialogue/mq_26_the_apex.json",
        "data/dialogue/mq_27_coming_home.json"
    ];
    
    for (var _i = 0; _i < array_length(_quest_dialogue_files); _i++) {
        var _data = data_load_file(_quest_dialogue_files[_i]);
        if (_data != undefined) {
            if (variable_struct_exists(_data, "_meta")) {
                variable_struct_remove(_data, "_meta");
            }
            var _quest_id = _data.quest_id;
            global.dialogue_quest[$ _quest_id] = _data;
            show_debug_message("INFO: Quest dialogue loaded for " + _quest_id
                + " (" + string(array_length(_data.scenes)) + " scenes)");
        }
        // Files that don't exist yet are silently skipped
    }
    
    show_debug_message("INFO: Dialogue data system initialized.");
}

// ============================================================================
// SEASONAL / DAILY DIALOGUE SELECTION
// ============================================================================

/// @func dialogue_get_seasonal(_npc_id)
/// @desc Returns the best matching seasonal/daily dialogue line for an NPC.
///       Uses priority-based selection matching current season, weather, and heart level.
/// @param {string} _npc_id  NPC identifier
/// @returns {struct|undefined} Dialogue entry struct or undefined
function dialogue_get_seasonal(_npc_id) {
    var _entries = global.dialogue_seasonal[$ _npc_id];
    if (_entries == undefined) return undefined;
    
    var _season_name = "";
    switch (global.time_season) {
        case 0: _season_name = "SPRING"; break;
        case 1: _season_name = "SUMMER"; break;
        case 2: _season_name = "AUTUMN"; break;
        case 3: _season_name = "WINTER"; break;
    }
    
    var _weather = global.time_weather;
    var _hearts = 0;
    if (ds_map_exists(global.npc_hearts, _npc_id)) {
        _hearts = floor(ds_map_find_value(global.npc_hearts, _npc_id) / 100);
    }
    
    // Filter to matching seasonal_daily entries
    var _candidates = [];
    
    for (var _i = 0; _i < array_length(_entries); _i++) {
        var _entry = _entries[_i];
        if (_entry.category != "seasonal_daily") continue;
        
        var _conds = _entry.conditions;
        var _match = true;
        
        // Check season
        if (variable_struct_exists(_conds, "season")) {
            if (_conds.season != _season_name) _match = false;
        }
        
        // Check weather
        if (_match && variable_struct_exists(_conds, "weather")) {
            if (_conds.weather != _weather) _match = false;
        }
        
        // Check hearts_gte
        if (_match && variable_struct_exists(_conds, "hearts_gte")) {
            if (_hearts < _conds.hearts_gte) _match = false;
        }
        
        // Check year_gte (Year 2-3+ dialogue gating)
        if (_match && variable_struct_exists(_conds, "year_gte")) {
            if (global.time_year < _conds.year_gte) _match = false;
        }
        
        // Check year_lte (upper bound — e.g., Year 1 only dialogue)
        if (_match && variable_struct_exists(_conds, "year_lte")) {
            if (global.time_year > _conds.year_lte) _match = false;
        }
        
        // Check story_flag (post-story / branch-specific dialogue)
        if (_match && variable_struct_exists(_conds, "story_flag")) {
            if (!variable_struct_exists(global, "story_flags")
                || !variable_struct_exists(global.story_flags, _conds.story_flag)
                || global.story_flags[$ _conds.story_flag] != true) {
                _match = false;
            }
        }
        
        // Check story_flag_not (exclude dialogue when a flag IS set)
        if (_match && variable_struct_exists(_conds, "story_flag_not")) {
            if (variable_struct_exists(global, "story_flags")
                && variable_struct_exists(global.story_flags, _conds.story_flag_not)
                && global.story_flags[$ _conds.story_flag_not] == true) {
                _match = false;
            }
        }
        
        if (_match) {
            array_push(_candidates, _entry);
        }
    }
    
    if (array_length(_candidates) == 0) return undefined;
    
    // Sort by priority descending
    array_sort(_candidates, function(_a, _b) {
        return _b.priority - _a.priority;
    });
    
    // Pick randomly from the top priority tier
    var _top_priority = _candidates[0].priority;
    var _top = [];
    for (var _i = 0; _i < array_length(_candidates); _i++) {
        if (_candidates[_i].priority >= _top_priority - 1) {
            array_push(_top, _candidates[_i]);
        }
    }
    
    return _top[irandom(array_length(_top) - 1)];
}

// ============================================================================
// HEART MILESTONE DIALOGUE
// ============================================================================

/// @func dialogue_get_heart_milestone(_npc_id, _heart_level)
/// @desc Returns a heart milestone dialogue entry for a specific NPC and heart level.
///       Only returns if the milestone hasn't been delivered yet (checked via story flags).
/// @param {string} _npc_id  NPC identifier
/// @param {int} _heart_level  Heart level to check (2, 4, 6, 8, or 10)
/// @returns {struct|undefined} Milestone dialogue entry or undefined
function dialogue_get_heart_milestone(_npc_id, _heart_level) {
    var _entries = global.dialogue_seasonal[$ _npc_id];
    if (_entries == undefined) return undefined;
    
    for (var _i = 0; _i < array_length(_entries); _i++) {
        var _entry = _entries[_i];
        if (_entry.category != "heart_milestone") continue;
        
        // Check heart level match
        if (variable_struct_exists(_entry.conditions, "hearts_eq")) {
            if (_entry.conditions.hearts_eq != _heart_level) continue;
        }
        
        // Check if already delivered (one-time)
        if (variable_struct_exists(_entry, "story_flag_set")) {
            if (variable_struct_exists(global, "story_flags") 
                && variable_struct_exists(global.story_flags, _entry.story_flag_set)
                && global.story_flags[$ _entry.story_flag_set] == true) {
                return undefined; // Already delivered
            }
        }
        
        return _entry;
    }
    
    return undefined;
}

/// @func dialogue_deliver_milestone(_npc_id, _heart_level)
/// @desc Marks a heart milestone as delivered and returns the dialogue entry.
/// @param {string} _npc_id
/// @param {int} _heart_level
/// @returns {struct|undefined}
function dialogue_deliver_milestone(_npc_id, _heart_level) {
    var _entry = dialogue_get_heart_milestone(_npc_id, _heart_level);
    if (_entry == undefined) return undefined;
    
    // Set story flag to prevent re-delivery
    if (variable_struct_exists(_entry, "story_flag_set")) {
        if (!variable_struct_exists(global, "story_flags")) {
            global.story_flags = {};
        }
        global.story_flags[$ _entry.story_flag_set] = true;
    }
    
    show_debug_message("INFO: Heart milestone delivered: " + _npc_id + " level " + string(_heart_level));
    return _entry;
}

// ============================================================================
// FESTIVAL DIALOGUE
// ============================================================================

/// @func dialogue_get_festival(_npc_id, _festival_id)
/// @desc Returns the festival-specific dialogue for an NPC.
/// @param {string} _npc_id  NPC identifier
/// @param {string} _festival_id  Festival identifier (spark_festival, sky_day, harvest_faire, remembrance_day)
/// @returns {struct|undefined} Festival dialogue entry or undefined
function dialogue_get_festival(_npc_id, _festival_id) {
    var _key = _npc_id + "_" + _festival_id;
    if (variable_struct_exists(global.dialogue_festivals, _key)) {
        return global.dialogue_festivals[$ _key];
    }
    return undefined;
}

// ============================================================================
// HEART EVENT SCRIPTS (Lazy-loaded)
// ============================================================================

/// @func dialogue_load_heart_event(_event_id)
/// @desc Loads a heart event dialogue script from its JSON file.
///       Uses lazy loading — only loaded when needed, then cached.
/// @param {string} _event_id  Event ID like "heart_event_leera_01"
/// @returns {struct|undefined} Full heart event data or undefined
function dialogue_load_heart_event(_event_id) {
    // Check cache first
    if (variable_struct_exists(global.dialogue_heart_events, _event_id)) {
        return global.dialogue_heart_events[$ _event_id];
    }
    
    // Derive file path from event_id
    // event_id format: "heart_event_[name]_[num]" -> "data/dialogue/heart_events/[name]_event_[num].json"
    var _parts = string_split(_event_id, "_");
    // parts: ["heart", "event", "name", "num"]
    if (array_length(_parts) < 4) {
        show_debug_message("WARN: dialogue_load_heart_event — Invalid event_id: " + _event_id);
        return undefined;
    }
    var _name = _parts[2];
    var _num = _parts[3];
    var _path = "data/dialogue/heart_events/" + _name + "_event_" + _num + ".json";
    
    var _data = data_load_file(_path);
    if (_data == undefined) {
        show_debug_message("WARN: dialogue_load_heart_event — File not found: " + _path);
        return undefined;
    }
    
    if (variable_struct_exists(_data, "_meta")) {
        variable_struct_remove(_data, "_meta");
    }
    
    // Cache for future access
    global.dialogue_heart_events[$ _event_id] = _data;
    
    show_debug_message("INFO: Heart event loaded: " + _event_id + " (" + string(array_length(_data.lines)) + " lines)");
    return _data;
}

/// @func dialogue_get_heart_event(_event_id)
/// @desc Returns a heart event dialogue script (loading it if necessary).
/// @param {string} _event_id  Event ID
/// @returns {struct|undefined}
function dialogue_get_heart_event(_event_id) {
    return dialogue_load_heart_event(_event_id);
}

// ============================================================================
// DIALOGUE SELECTION INTEGRATION
// ============================================================================

/// @func dialogue_get_best(_npc_id)
/// @desc Master dialogue selection function. Checks in priority order:
///       1. Active heart event (if in correct location/time)
///       2. Heart milestone (if at milestone level and undelivered)
///       3. Festival dialogue (if festival active)
///       4. Seasonal/daily pool
/// @param {string} _npc_id  NPC identifier
/// @returns {struct|undefined} Best dialogue entry
function dialogue_get_best(_npc_id) {
    // Priority 1: Check for pending heart milestones
    var _hearts = 0;
    if (ds_map_exists(global.npc_hearts, _npc_id)) {
        _hearts = floor(ds_map_find_value(global.npc_hearts, _npc_id) / 100);
    }
    
    // Check milestone levels in descending order
    var _milestone_levels = [10, 8, 6, 4, 2];
    for (var _i = 0; _i < array_length(_milestone_levels); _i++) {
        if (_hearts >= _milestone_levels[_i]) {
            var _milestone = dialogue_get_heart_milestone(_npc_id, _milestone_levels[_i]);
            if (_milestone != undefined) {
                return _milestone;
            }
        }
    }
    
    // Priority 2: Festival dialogue
    if (variable_struct_exists(global, "active_festival") && global.active_festival != "") {
        var _fest = dialogue_get_festival(_npc_id, global.active_festival);
        if (_fest != undefined) return _fest;
    }
    
    // Priority 3: Seasonal/daily pool (also serves as AI fallback)
    var _scripted = dialogue_get_seasonal(_npc_id);
    
    // Priority 4: AI-enhanced dialogue (optional, player opt-in)
    // If AI dialogue is enabled and available, attempt to generate a contextual response.
    // The scripted dialogue is passed as fallback in case of API error/timeout.
    if (variable_struct_exists(global, "ai_dialogue") && global.ai_dialogue.enabled) {
        var _ai_sent = ai_dialogue_request(_npc_id, _scripted);
        if (_ai_sent) {
            // AI request is in-flight. Return undefined here — the async handler
            // will deliver the dialogue when the response arrives (or fall back).
            // The caller should show a brief "thinking" indicator.
            return undefined;
        }
        // If AI couldn't send (rate limit, cooldown, etc.), fall through to scripted
    }
    
    return _scripted;
}

// ============================================================================
// QUEST DIALOGUE RETRIEVAL
// ============================================================================

/// @func dialogue_get_quest_scene(_quest_id, _scene_id)
/// @desc Returns a specific scene from a quest dialogue file.
///       Quest dialogues are structured as an array of scenes, each with
///       an ID, conditions, speaker lines, and optional branching choices.
/// @param {string} _quest_id  Quest identifier (e.g., "mq_18")
/// @param {string} _scene_id  Scene identifier within the quest
/// @returns {struct|undefined} Scene data or undefined
function dialogue_get_quest_scene(_quest_id, _scene_id) {
    var _quest_data = global.dialogue_quest[$ _quest_id];
    if (_quest_data == undefined) return undefined;
    
    var _scenes = _quest_data.scenes;
    for (var _i = 0; _i < array_length(_scenes); _i++) {
        if (_scenes[_i].scene_id == _scene_id) {
            return _scenes[_i];
        }
    }
    
    return undefined;
}

/// @func dialogue_get_quest_scenes_by_trigger(_quest_id, _trigger_type)
/// @desc Returns all scenes from a quest that match a specific trigger type.
///       Trigger types: "quest_start", "quest_complete", "objective_complete",
///       "location_enter", "npc_interact", "cutscene", "choice_branch"
/// @param {string} _quest_id
/// @param {string} _trigger_type
/// @returns {array} Array of matching scene structs
function dialogue_get_quest_scenes_by_trigger(_quest_id, _trigger_type) {
    var _quest_data = global.dialogue_quest[$ _quest_id];
    if (_quest_data == undefined) return [];
    
    var _result = [];
    var _scenes = _quest_data.scenes;
    for (var _i = 0; _i < array_length(_scenes); _i++) {
        if (variable_struct_exists(_scenes[_i], "trigger") 
            && _scenes[_i].trigger == _trigger_type) {
            array_push(_result, _scenes[_i]);
        }
    }
    
    return _result;
}

/// @func dialogue_process_effects(_effects)
/// @desc Processes an array of dialogue effects (triggered by player choices).
///       Supports: set_flag, add_hearts, add_cogs, add_understanding,
///       add_alliance, add_item, remove_item
/// @param {array} _effects  Array of effect structs
function dialogue_process_effects(_effects) {
    if (_effects == undefined) return;
    
    for (var _i = 0; _i < array_length(_effects); _i++) {
        var _eff = _effects[_i];
        var _type = _eff.type;
        
        switch (_type) {
            case "set_flag":
                if (!variable_struct_exists(global, "story_flags")) global.story_flags = {};
                global.story_flags[$ _eff.flag] = true;
                show_debug_message("INFO: Dialogue effect — flag set: " + _eff.flag);
                break;
                
            case "add_understanding":
                var _amt = variable_struct_exists(_eff, "amount") ? _eff.amount : 1;
                if (!variable_struct_exists(global, "marshal_understanding")) {
                    global.marshal_understanding = 0;
                }
                global.marshal_understanding += _amt;
                show_debug_message("INFO: Dialogue effect — Understanding +" 
                    + string(_amt) + " (total: " + string(global.marshal_understanding) + ")");
                break;
                
            case "add_alliance":
                var _amt = variable_struct_exists(_eff, "amount") ? _eff.amount : 1;
                if (!variable_struct_exists(global, "alliance_strength")) {
                    global.alliance_strength = 0;
                }
                global.alliance_strength += _amt;
                show_debug_message("INFO: Dialogue effect — Alliance +" 
                    + string(_amt) + " (total: " + string(global.alliance_strength) + ")");
                break;
                
            case "add_hearts":
                if (variable_struct_exists(_eff, "npc_id") && variable_struct_exists(_eff, "amount")) {
                    if (ds_map_exists(global.npc_hearts, _eff.npc_id)) {
                        var _cur = ds_map_find_value(global.npc_hearts, _eff.npc_id);
                        ds_map_replace(global.npc_hearts, _eff.npc_id, _cur + _eff.amount);
                    }
                }
                break;
                
            case "add_cogs":
                if (!variable_struct_exists(global, "player_cogs")) global.player_cogs = 0;
                global.player_cogs += _eff.amount;
                break;
                
            case "add_item":
                if (!variable_struct_exists(global, "inventory")) global.inventory = {};
                if (!variable_struct_exists(global.inventory, _eff.item_id)) {
                    global.inventory[$ _eff.item_id] = 0;
                }
                global.inventory[$ _eff.item_id] += _eff.quantity;
                break;
                
            case "remove_item":
                if (variable_struct_exists(global, "inventory") 
                    && variable_struct_exists(global.inventory, _eff.item_id)) {
                    global.inventory[$ _eff.item_id] = max(0, 
                        global.inventory[$ _eff.item_id] - _eff.quantity);
                }
                break;
                
            default:
                show_debug_message("WARN: dialogue_process_effects — Unknown effect type: " + _type);
                break;
        }
    }
}
