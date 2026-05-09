/// scr_dejin_system.gml
/// DEJIN AI Core progression: stages, memory fragments, commentary, trust tracking.
/// Objective #35: DEJIN Progression System
///
/// Dependencies: scr_data, scr_exploration_system, scr_ui_journal, scr_automaton_system
/// Global data: global.dejin_stages      (stage definitions from dejin_stages.json)
///              global.dejin_fragments    (memory fragments from dejin_memory_fragments.json)
///              global.dejin_commentary   (commentary lines from dejin_commentary.json)
///              global.dejin_state        (runtime state: trust, installed cores, current stage, etc.)

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func dejin_system_init()
/// @desc Loads all DEJIN data files and initializes runtime state.
///       Called during data_load_all() in the boot sequence.
function dejin_system_init() {
    // Load stage definitions
    var _stages_raw = data_load_file("data/dejin/dejin_stages.json");
    global.dejin_stages = _stages_raw.stages;
    global.dejin_trust_rewards = _stages_raw.trust_rewards;
    
    // Load memory fragments
    var _frags_raw = data_load_file("data/dejin/dejin_memory_fragments.json");
    global.dejin_fragments = {};
    for (var _i = 0; _i < array_length(_frags_raw.fragments); _i++) {
        var _frag = _frags_raw.fragments[_i];
        global.dejin_fragments[$ _frag.fragment_id] = _frag;
    }
    global.dejin_fragment_count = array_length(_frags_raw.fragments);
    
    // Load commentary
    var _comm_raw = data_load_file("data/dejin/dejin_commentary.json");
    global.dejin_commentary = {
        morning:     _comm_raw.morning,
        post_raid:   _comm_raw.post_raid,
        exploration: _comm_raw.exploration,
        npc_observation: _comm_raw.npc_observation,
        seasonal:    _comm_raw.seasonal,
        milestone:   _comm_raw.milestone
    };
    global.dejin_commentary_settings = _comm_raw.settings;
    
    // Initialize runtime state (overwritten by save/load if save exists)
    if (!variable_struct_exists(global, "dejin_state")) {
        global.dejin_state = {
            trust: 0,
            installed_cores: [],          // Array of { core_type, source_zone, fragment_id }
            played_fragments: [],         // Array of fragment_ids already played
            current_stage_index: 0,       // Calculated, not saved directly
            commentary_enabled: true,
            commentary_today_count: 0,
            commentary_last_time: -999,   // Game minutes since last commentary
            active_memory_playback: undefined  // Currently playing memory fragment or undefined
        };
    }
    
    // Calculate initial stage
    dejin_recalculate_stage();
    
    show_debug_message("INFO: DEJIN system initialized. " 
        + string(global.dejin_fragment_count) + " memory fragments loaded. "
        + "Stage: " + global.dejin_stages[global.dejin_state.current_stage_index].name);
}

// ============================================================================
// STAGE MANAGEMENT
// ============================================================================

/// @func dejin_recalculate_stage()
/// @desc Evaluates all stage requirements and sets current_stage_index to the
///       highest stage whose requirements are fully met.
function dejin_recalculate_stage() {
    var _state = global.dejin_state;
    var _cores_count = array_length(_state.installed_cores);
    var _trust = _state.trust;
    var _best_index = 0;
    
    for (var _i = 0; _i < array_length(global.dejin_stages); _i++) {
        var _stage = global.dejin_stages[_i];
        var _reqs = _stage.requirements;
        
        // Check data cores installed count
        if (_cores_count < _reqs.data_cores_installed) continue;
        
        // Check trust level
        if (_trust < _reqs.trust_level) continue;
        
        // Check story flag (if required)
        if (_reqs.story_flag != undefined && _reqs.story_flag != noone) {
            if (!variable_struct_exists(global, "story_flags") 
                || !variable_struct_exists(global.story_flags, _reqs.story_flag)
                || global.story_flags[$ _reqs.story_flag] != true) {
                continue;
            }
        }
        
        // All requirements met — this stage is achievable
        _best_index = _i;
    }
    
    var _old_index = _state.current_stage_index;
    _state.current_stage_index = _best_index;
    
    // Fire stage advancement event if changed
    if (_best_index > _old_index) {
        var _new_stage = global.dejin_stages[_best_index];
        show_debug_message("INFO: DEJIN advanced to stage: " + _new_stage.name 
            + " (index " + string(_best_index) + ")");
        // event_fire("dejin_stage_advanced", { stage_id: _new_stage.stage_id, stage_index: _best_index });
    }
}

/// @func dejin_get_stage()
/// @desc Returns the current DEJIN stage struct.
/// @returns {struct} Current stage definition
function dejin_get_stage() {
    return global.dejin_stages[global.dejin_state.current_stage_index];
}

/// @func dejin_get_stage_index()
/// @desc Returns the current DEJIN stage index (0-5).
/// @returns {int}
function dejin_get_stage_index() {
    return global.dejin_state.current_stage_index;
}

/// @func dejin_has_capability(_capability)
/// @desc Checks if DEJIN currently has a specific capability unlocked.
/// @param {string} _capability  One of: "commentary", "automaton_management", "research", "memory_archive"
/// @returns {bool}
function dejin_has_capability(_capability) {
    var _stage = dejin_get_stage();
    if (variable_struct_exists(_stage.capabilities, _capability)) {
        return _stage.capabilities[$ _capability];
    }
    return false;
}

// ============================================================================
// TRUST MANAGEMENT
// ============================================================================

/// @func dejin_advance_trust(_amount, _reason)
/// @desc Increases DEJIN trust level. Clamped to 0-100.
/// @param {real} _amount  Trust points to add (can be negative for rare cases)
/// @param {string} _reason  Reason string for debug logging
function dejin_advance_trust(_amount, _reason) {
    var _old = global.dejin_state.trust;
    global.dejin_state.trust = clamp(_old + _amount, 0, 100);
    
    show_debug_message("INFO: DEJIN trust " + (_amount >= 0 ? "+" : "") + string(_amount) 
        + " (" + _reason + ") — now " + string(global.dejin_state.trust));
    
    // Recalculate stage in case trust threshold crossed
    dejin_recalculate_stage();
}

/// @func dejin_get_trust()
/// @desc Returns current DEJIN trust level (0-100).
/// @returns {real}
function dejin_get_trust() {
    return global.dejin_state.trust;
}

// ============================================================================
// MEMORY FRAGMENT SYSTEM
// ============================================================================

/// @func dejin_install_core(_core_type, _source_zone)
/// @desc Processes a data core installation at the AI Core terminal.
///       Finds the matching memory fragment, adds trust, queues playback.
/// @param {string} _core_type  One of: "standard", "military", "scientific", "classified"
/// @param {string} _source_zone  Zone ID where the core was found
/// @returns {string} Fragment ID if found, or "" if no matching fragment
function dejin_install_core(_core_type, _source_zone) {
    // Find matching fragment
    var _frag_ids = variable_struct_get_names(global.dejin_fragments);
    var _match_id = "";
    
    for (var _i = 0; _i < array_length(_frag_ids); _i++) {
        var _frag = global.dejin_fragments[$ _frag_ids[_i]];
        if (_frag.data_core_type == _core_type && _frag.source_zone == _source_zone) {
            _match_id = _frag_ids[_i];
            break;
        }
    }
    
    if (_match_id == "") {
        show_debug_message("WARN: dejin_install_core — No fragment for core_type=" 
            + _core_type + " zone=" + _source_zone);
        return "";
    }
    
    var _frag = global.dejin_fragments[$ _match_id];
    
    // Check if already installed
    for (var _i = 0; _i < array_length(global.dejin_state.installed_cores); _i++) {
        if (global.dejin_state.installed_cores[_i].fragment_id == _match_id) {
            show_debug_message("INFO: dejin_install_core — Fragment already installed: " + _match_id);
            return _match_id; // Already installed, allow replay
        }
    }
    
    // Record installation
    array_push(global.dejin_state.installed_cores, {
        core_type: _core_type,
        source_zone: _source_zone,
        fragment_id: _match_id,
        install_date: {
            year: global.time_year,
            season: global.time_season,
            day: global.time_day
        }
    });
    
    // Award trust
    var _trust_key = "data_core_install_" + _core_type;
    var _trust_amount = 15; // Default
    if (variable_struct_exists(global.dejin_trust_rewards, _trust_key)) {
        _trust_amount = global.dejin_trust_rewards[$ _trust_key];
    }
    dejin_advance_trust(_trust_amount, "Data core installed: " + _match_id);
    
    // Unlock lore entry
    if (_frag.lore_entry_unlock != undefined && _frag.lore_entry_unlock != "") {
        if (!variable_struct_exists(global, "journal_lore")) {
            global.journal_lore = {};
        }
        global.journal_lore[$ _frag.lore_entry_unlock] = {
            title: _frag.title,
            summary: "Memory fragment recovered from " + _source_zone + " data core.",
            source: "DEJIN Memory Archive"
        };
    }
    
    show_debug_message("INFO: Data core installed. Fragment: " + _match_id 
        + " | Trust +" + string(_trust_amount) 
        + " | Total cores: " + string(array_length(global.dejin_state.installed_cores)));
    
    // Queue memory playback
    dejin_play_memory(_match_id);
    
    // Recalculate stage (core count may have crossed threshold)
    dejin_recalculate_stage();
    
    return _match_id;
}

/// @func dejin_play_memory(_fragment_id)
/// @desc Queues a memory fragment for dialogue-style playback.
///       Uses the existing dialogue system to display lines sequentially.
/// @param {string} _fragment_id  Fragment ID to play
function dejin_play_memory(_fragment_id) {
    var _frag = global.dejin_fragments[$ _fragment_id];
    if (_frag == undefined) {
        show_debug_message("WARN: dejin_play_memory — Unknown fragment: " + _fragment_id);
        return;
    }
    
    // Mark as played
    if (!array_contains(global.dejin_state.played_fragments, _fragment_id)) {
        array_push(global.dejin_state.played_fragments, _fragment_id);
    }
    
    // Audio: Play DEJIN memory music
    audio_manager_play_music("mus_old_world");
    
    // Set active playback (UI system reads this to display memory sequence)
    global.dejin_state.active_memory_playback = {
        fragment_id: _fragment_id,
        title: _frag.title,
        lines: _frag.lines,
        current_line: 0,
        total_lines: array_length(_frag.lines)
    };
    
    show_debug_message("INFO: DEJIN memory playback started: " + _frag.title 
        + " (" + string(array_length(_frag.lines)) + " lines)");
    
    // The dialogue/UI system should check global.dejin_state.active_memory_playback
    // and display it like a cutscene dialogue sequence.
    // When all lines are shown, set active_memory_playback = undefined.
}

/// @func dejin_memory_advance_line()
/// @desc Advances to the next line of the active memory playback.
/// @returns {struct|undefined} Next line struct, or undefined if playback complete
function dejin_memory_advance_line() {
    var _playback = global.dejin_state.active_memory_playback;
    if (_playback == undefined) return undefined;
    
    _playback.current_line++;
    
    if (_playback.current_line >= _playback.total_lines) {
        // Playback complete
        show_debug_message("INFO: DEJIN memory playback complete: " + _playback.title);
        global.dejin_state.active_memory_playback = undefined;
        return undefined;
    }
    
    return _playback.lines[_playback.current_line];
}

/// @func dejin_get_current_memory_line()
/// @desc Returns the current line of active memory playback without advancing.
/// @returns {struct|undefined}
function dejin_get_current_memory_line() {
    var _playback = global.dejin_state.active_memory_playback;
    if (_playback == undefined) return undefined;
    if (_playback.current_line >= _playback.total_lines) return undefined;
    return _playback.lines[_playback.current_line];
}

/// @func dejin_is_memory_playing()
/// @desc Returns whether a memory fragment is currently being played back.
/// @returns {bool}
function dejin_is_memory_playing() {
    return (global.dejin_state.active_memory_playback != undefined);
}

// ============================================================================
// COMMENTARY SYSTEM
// ============================================================================

/// @func dejin_get_commentary(_category, _context)
/// @desc Returns the best matching commentary line for the given category and context.
///       Respects daily limit and cooldown. Returns undefined if no valid line.
/// @param {string} _category  One of: "morning", "post_raid", "exploration", "npc_observation", "seasonal", "milestone"
/// @param {struct} _context   Context struct with fields like: weather, season, location, 
///                            npc_nearby, raid_result, raid_faction, event, story_flag, trust_gte, etc.
/// @returns {struct|undefined} Commentary line struct { id, text } or undefined
function dejin_get_commentary(_category, _context) {
    // Check if commentary is enabled
    if (!global.dejin_state.commentary_enabled) return undefined;
    
    // Check if DEJIN has commentary capability
    if (!dejin_has_capability("commentary")) return undefined;
    
    // Check daily limit (morning greetings and milestones bypass limit)
    var _settings = global.dejin_commentary_settings;
    if (_category != "morning" && _category != "milestone") {
        if (global.dejin_state.commentary_today_count >= _settings.max_commentary_per_day) {
            return undefined;
        }
        
        // Check cooldown
        var _game_minutes = global.time_hour * 60 + global.time_minute;
        if ((_game_minutes - global.dejin_state.commentary_last_time) < _settings.cooldown_minutes_between
            && global.dejin_state.commentary_last_time >= 0) {
            return undefined;
        }
    }
    
    // Get the commentary pool for this category
    var _pool = undefined;
    if (variable_struct_exists(global.dejin_commentary, _category)) {
        _pool = global.dejin_commentary[$ _category];
    }
    if (_pool == undefined || array_length(_pool) == 0) return undefined;
    
    // Filter and score candidates
    var _candidates = [];
    var _stage_index = dejin_get_stage_index();
    
    for (var _i = 0; _i < array_length(_pool); _i++) {
        var _line = _pool[_i];
        var _conds = _line.conditions;
        var _match = true;
        
        // Check dejin_stage_gte
        if (variable_struct_exists(_conds, "dejin_stage_gte")) {
            if (_stage_index < _conds.dejin_stage_gte) _match = false;
        }
        
        // Check dejin_stage_lte
        if (_match && variable_struct_exists(_conds, "dejin_stage_lte")) {
            if (_stage_index > _conds.dejin_stage_lte) _match = false;
        }
        
        // Check trust_gte
        if (_match && variable_struct_exists(_conds, "trust_gte")) {
            if (global.dejin_state.trust < _conds.trust_gte) _match = false;
        }
        
        // Check weather
        if (_match && variable_struct_exists(_conds, "weather")) {
            if (variable_struct_exists(_context, "weather")) {
                if (_conds.weather != _context.weather) _match = false;
            } else {
                _match = false;
            }
        }
        
        // Check season
        if (_match && variable_struct_exists(_conds, "season")) {
            var _season_name = "";
            switch (global.time_season) {
                case 0: _season_name = "SPRING"; break;
                case 1: _season_name = "SUMMER"; break;
                case 2: _season_name = "AUTUMN"; break;
                case 3: _season_name = "WINTER"; break;
            }
            if (_conds.season != _season_name) _match = false;
        }
        
        // Check location
        if (_match && variable_struct_exists(_conds, "location")) {
            if (variable_struct_exists(_context, "location")) {
                if (_conds.location != _context.location && _conds.location != "any_exploration") {
                    _match = false;
                }
            } else {
                if (_conds.location != "any_exploration") _match = false;
            }
        }
        
        // Check npc_nearby
        if (_match && variable_struct_exists(_conds, "npc_nearby")) {
            if (variable_struct_exists(_context, "npc_nearby")) {
                if (_conds.npc_nearby != _context.npc_nearby) _match = false;
            } else {
                _match = false;
            }
        }
        
        // Check raid_result
        if (_match && variable_struct_exists(_conds, "raid_result")) {
            if (variable_struct_exists(_context, "raid_result")) {
                if (_conds.raid_result != _context.raid_result) _match = false;
            } else {
                _match = false;
            }
        }
        
        // Check raid_faction
        if (_match && variable_struct_exists(_conds, "raid_faction")) {
            if (variable_struct_exists(_context, "raid_faction")) {
                if (_conds.raid_faction != _context.raid_faction) _match = false;
            } else {
                _match = false;
            }
        }
        
        // Check event
        if (_match && variable_struct_exists(_conds, "event")) {
            if (variable_struct_exists(_context, "event")) {
                if (_conds.event != _context.event) _match = false;
            } else {
                _match = false;
            }
        }
        
        // Check story_flag
        if (_match && variable_struct_exists(_conds, "story_flag")) {
            if (variable_struct_exists(global, "story_flags") 
                && variable_struct_exists(global.story_flags, _conds.story_flag)
                && global.story_flags[$ _conds.story_flag] == true) {
                // OK — flag is set
            } else {
                _match = false;
            }
        }
        
        // Check special conditions
        if (_match && variable_struct_exists(_conds, "special")) {
            if (variable_struct_exists(_context, "special")) {
                if (_conds.special != _context.special) _match = false;
            } else {
                _match = false;
            }
        }
        
        // Check time_range [start_hour, end_hour]
        if (_match && variable_struct_exists(_conds, "time_range")) {
            var _tr = _conds.time_range;
            if (global.time_day < _tr[0] || global.time_day > _tr[1]) {
                _match = false;
            }
        }
        
        if (_match) {
            array_push(_candidates, { line: _line, priority: _line.priority });
        }
    }
    
    if (array_length(_candidates) == 0) return undefined;
    
    // Sort by priority descending
    array_sort(_candidates, function(_a, _b) {
        return _b.priority - _a.priority;
    });
    
    // Pick from top candidates (weighted random among top priority tier)
    var _top_priority = _candidates[0].priority;
    var _top_candidates = [];
    for (var _i = 0; _i < array_length(_candidates); _i++) {
        if (_candidates[_i].priority >= _top_priority - 1) {
            array_push(_top_candidates, _candidates[_i].line);
        }
    }
    
    var _selected = _top_candidates[irandom(array_length(_top_candidates) - 1)];
    
    // Update tracking
    if (_category != "morning") {
        global.dejin_state.commentary_today_count++;
        global.dejin_state.commentary_last_time = global.time_hour * 60 + global.time_minute;
    }
    
    return _selected;
}

/// @func dejin_toggle_commentary(_enabled)
/// @desc Enables or disables DEJIN commentary.
/// @param {bool} _enabled
function dejin_toggle_commentary(_enabled) {
    global.dejin_state.commentary_enabled = _enabled;
    show_debug_message("INFO: DEJIN commentary " + (_enabled ? "enabled" : "disabled"));
}

// ============================================================================
// DAILY UPDATE
// ============================================================================

/// @func dejin_daily_update()
/// @desc Called each morning (when day advances). Resets daily counters,
///       selects morning greeting, checks stage advancement.
/// @returns {struct|undefined} Morning commentary line, or undefined
function dejin_daily_update() {
    // Reset daily commentary counter
    global.dejin_state.commentary_today_count = 0;
    global.dejin_state.commentary_last_time = -999;
    
    // Recalculate stage
    dejin_recalculate_stage();
    
    // Get morning commentary
    var _weather = "CLEAR";
    if (variable_struct_exists(global, "time_weather")) {
        _weather = global.time_weather;
    }
    
    var _context = {
        weather: _weather
    };
    
    // Check for special days
    // (Player birthday check would go here if tracked)
    
    return dejin_get_commentary("morning", _context);
}

// ============================================================================
// AI CORE TERMINAL UI DATA
// ============================================================================

/// @func dejin_get_terminal_data()
/// @desc Returns a struct with all data needed to render the AI Core Terminal UI.
/// @returns {struct}
function dejin_get_terminal_data() {
    var _stage = dejin_get_stage();
    var _state = global.dejin_state;
    
    // Build memory archive list
    var _memories = [];
    var _all_frag_ids = variable_struct_get_names(global.dejin_fragments);
    for (var _i = 0; _i < array_length(_all_frag_ids); _i++) {
        var _frag = global.dejin_fragments[$ _all_frag_ids[_i]];
        var _is_installed = false;
        for (var _j = 0; _j < array_length(_state.installed_cores); _j++) {
            if (_state.installed_cores[_j].fragment_id == _all_frag_ids[_i]) {
                _is_installed = true;
                break;
            }
        }
        
        array_push(_memories, {
            fragment_id: _all_frag_ids[_i],
            title: _is_installed ? _frag.title : "???",
            core_type: _frag.data_core_type,
            source_zone: _is_installed ? _frag.source_zone : "unknown",
            installed: _is_installed,
            played: array_contains(_state.played_fragments, _all_frag_ids[_i])
        });
    }
    
    return {
        // System Status tab
        stage_name: _stage.name,
        stage_description: _stage.description,
        stage_index: _state.current_stage_index,
        trust_level: _state.trust,
        trust_max: 100,
        personality: _stage.personality,
        speech_pattern: _stage.speech_pattern,
        capabilities: _stage.capabilities,
        portrait_state: _stage.portrait_state,
        cores_installed: array_length(_state.installed_cores),
        cores_total: global.dejin_fragment_count,
        
        // Memory Archive tab
        memories: _memories,
        
        // Commentary toggle
        commentary_enabled: _state.commentary_enabled
    };
}

// ============================================================================
// SAVE / LOAD
// ============================================================================

/// @func dejin_save()
/// @desc Returns a struct suitable for inclusion in the save file.
/// @returns {struct}
function dejin_save() {
    return {
        trust: global.dejin_state.trust,
        installed_cores: global.dejin_state.installed_cores,
        played_fragments: global.dejin_state.played_fragments,
        commentary_enabled: global.dejin_state.commentary_enabled
    };
}

/// @func dejin_load(_save_data)
/// @desc Restores DEJIN state from save data.
/// @param {struct} _save_data  DEJIN portion of save file
function dejin_load(_save_data) {
    if (_save_data == undefined) return;
    
    global.dejin_state.trust = _save_data.trust;
    global.dejin_state.installed_cores = _save_data.installed_cores;
    global.dejin_state.played_fragments = _save_data.played_fragments;
    global.dejin_state.commentary_enabled = _save_data.commentary_enabled;
    global.dejin_state.commentary_today_count = 0;
    global.dejin_state.commentary_last_time = -999;
    global.dejin_state.active_memory_playback = undefined;
    
    // Recalculate stage from loaded data
    dejin_recalculate_stage();
    
    show_debug_message("INFO: DEJIN state loaded. Trust: " + string(global.dejin_state.trust)
        + " | Cores: " + string(array_length(global.dejin_state.installed_cores))
        + " | Stage: " + dejin_get_stage().name);
}
