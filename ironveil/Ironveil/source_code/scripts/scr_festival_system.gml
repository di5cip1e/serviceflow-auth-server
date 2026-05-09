/// scr_festival_system.gml
/// Festival lifecycle management, mini-games, schedule overrides, rewards.
/// Objective #36: Festival System (All 4)
///
/// Dependencies: scr_data, scr_npc_data, scr_quest_system, scr_dialogue_data, scr_inventory
/// Global data: global.festival_data    (festival definitions from festivals.json)
///              global.festival_rewards  (reward tables from festival_rewards.json)
///              global.festival_state    (runtime state)

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func festival_system_init()
/// @desc Loads festival definitions and reward tables.
function festival_system_init() {
    var _fest_raw = data_load_file("data/festivals/festivals.json");
    if (_fest_raw != undefined) {
        if (variable_struct_exists(_fest_raw, "_meta")) variable_struct_remove(_fest_raw, "_meta");
        global.festival_data = {};
        for (var _i = 0; _i < array_length(_fest_raw.festivals); _i++) {
            var _f = _fest_raw.festivals[_i];
            global.festival_data[$ _f.festival_id] = _f;
        }
    }
    
    var _rew_raw = data_load_file("data/festivals/festival_rewards.json");
    if (_rew_raw != undefined) {
        if (variable_struct_exists(_rew_raw, "_meta")) variable_struct_remove(_rew_raw, "_meta");
        global.festival_rewards = _rew_raw.rewards;
    }
    
    if (!variable_struct_exists(global, "festival_state")) {
        global.festival_state = {
            active_festival: "",
            festival_started: false,
            minigame_results: {},
            trophies: {},
            attended_this_year: {}
        };
    }
    
    global.active_festival = ""; // Used by dialogue system
    
    show_debug_message("INFO: Festival system initialized.");
}

// ============================================================================
// DAILY CHECK
// ============================================================================

/// @func festival_check_today()
/// @desc Called each morning. Checks if today is a festival day and starts it.
/// @returns {string} Festival ID if today is a festival, or ""
function festival_check_today() {
    var _fest_ids = variable_struct_get_names(global.festival_data);
    
    for (var _i = 0; _i < array_length(_fest_ids); _i++) {
        var _f = global.festival_data[$ _fest_ids[_i]];
        
        var _season_match = false;
        switch (_f.season) {
            case "SPRING": _season_match = (global.time_season == 0); break;
            case "SUMMER": _season_match = (global.time_season == 1); break;
            case "AUTUMN": _season_match = (global.time_season == 2); break;
            case "WINTER": _season_match = (global.time_season == 3); break;
        }
        
        if (_season_match && global.time_day == _f.day) {
            festival_start(_fest_ids[_i]);
            return _fest_ids[_i];
        }
    }
    
    return "";
}

// ============================================================================
// LIFECYCLE
// ============================================================================

/// @func festival_start(_festival_id)
/// @desc Activates a festival: overrides NPC schedules, enables mini-games.
/// @param {string} _festival_id
function festival_start(_festival_id) {
    var _f = global.festival_data[$ _festival_id];
    if (_f == undefined) return;
    
    global.festival_state.active_festival = _festival_id;
    global.festival_state.festival_started = true;
    
    // Audio: Play festival-specific music
    audio_manager_on_state_change("STATE_FESTIVAL", _festival_id);
    
    global.festival_state.minigame_results = {};
    global.active_festival = _festival_id; // For dialogue system
    
    // Track attendance
    var _year_key = "year_" + string(global.time_year);
    if (!variable_struct_exists(global.festival_state.attended_this_year, _year_key)) {
        global.festival_state.attended_this_year[$ _year_key] = {};
    }
    global.festival_state.attended_this_year[$ _year_key][$ _festival_id] = true;
    
    show_debug_message("INFO: Festival started: " + _f.name + " (" + _festival_id + ")");
}

/// @func festival_end()
/// @desc Ends the active festival. Restores schedules, distributes attendance rewards.
function festival_end() {
    if (global.festival_state.active_festival == "") return;
    
    var _fest_id = global.festival_state.active_festival;
    var _f = global.festival_data[$ _fest_id];
    
    // Attendance heart bonus for all NPCs
    if (_f != undefined && variable_struct_exists(_f, "attendance_heart_bonus")) {
        var _bonus = _f.attendance_heart_bonus;
        for (var _i = 0; _i < global.npc_count; _i++) {
            var _npc_id = global.npc_ids[_i];
            if (ds_map_exists(global.npc_hearts, _npc_id)) {
                var _cur = ds_map_find_value(global.npc_hearts, _npc_id);
                ds_map_replace(global.npc_hearts, _npc_id, _cur + _bonus);
            }
        }
    }
    
    // Reputation bonus
    if (!variable_struct_exists(global, "town_reputation")) global.town_reputation = 0;
    global.town_reputation += 15;
    
    global.festival_state.active_festival = "";
    global.festival_state.festival_started = false;
    global.active_festival = "";
    
    show_debug_message("INFO: Festival ended: " + _fest_id);
}

/// @func festival_is_active()
/// @desc Returns whether a festival is currently active.
/// @returns {bool}
function festival_is_active() {
    return (global.festival_state.active_festival != "");
}

/// @func festival_get_active()
/// @desc Returns the active festival data, or undefined.
/// @returns {struct|undefined}
function festival_get_active() {
    if (global.festival_state.active_festival == "") return undefined;
    return global.festival_data[$ global.festival_state.active_festival];
}

// ============================================================================
// MINI-GAMES
// ============================================================================

/// @func festival_run_minigame(_minigame_id, _player_entry)
/// @desc Executes a festival mini-game and returns results.
/// @param {string} _minigame_id  Mini-game identifier
/// @param {struct} _player_entry  Player's entry data (machine_id, item_id, automaton_id, etc.)
/// @returns {struct} { rank: 1-3, prize_tier: "gold"|"silver"|"bronze"|"none", score: real }
function festival_run_minigame(_minigame_id, _player_entry) {
    var _result = { rank: 4, prize_tier: "none", score: 0 };
    
    switch (_minigame_id) {
        case "machine_showcase":
            _result = festival_judge_showcase(_player_entry);
            break;
        case "automaton_race":
            _result = festival_judge_race(_player_entry);
            break;
        case "cooking_competition":
            _result = festival_judge_cooking(_player_entry);
            break;
        case "flyer_race":
            _result = festival_judge_flyer_race(_player_entry);
            break;
    }
    
    // Store result
    global.festival_state.minigame_results[$ _minigame_id] = _result;
    
    // Award trophy if gold
    if (_result.prize_tier == "gold") {
        var _trophy_key = _minigame_id + "_year_" + string(global.time_year);
        global.festival_state.trophies[$ _trophy_key] = true;
    }
    
    // Distribute prize rewards
    if (_result.prize_tier != "none" && variable_struct_exists(global, "festival_rewards")) {
        var _reward_key = _minigame_id + "_" + _result.prize_tier;
        if (variable_struct_exists(global.festival_rewards, _reward_key)) {
            var _reward = global.festival_rewards[$ _reward_key];
            if (variable_struct_exists(_reward, "cogs")) {
                if (!variable_struct_exists(global, "player_cogs")) global.player_cogs = 0;
                global.player_cogs += _reward.cogs;
            }
            if (variable_struct_exists(_reward, "items")) {
                for (var _i = 0; _i < array_length(_reward.items); _i++) {
                    var _item = _reward.items[_i];
                    if (!variable_struct_exists(global, "inventory")) global.inventory = {};
                    if (!variable_struct_exists(global.inventory, _item.item_id)) global.inventory[$ _item.item_id] = 0;
                    global.inventory[$ _item.item_id] += _item.quantity;
                }
            }
        }
    }
    
    show_debug_message("INFO: Mini-game " + _minigame_id + " result: rank " 
        + string(_result.rank) + " (" + _result.prize_tier + ") score: " + string(_result.score));
    
    return _result;
}

/// @func festival_judge_showcase(_entry)
/// @desc Machine Showcase judging. Score based on blueprint tier, quality, mark level.
/// @param {struct} _entry  { machine_instance_id }
/// @returns {struct} { rank, prize_tier, score }
function festival_judge_showcase(_entry) {
    var _score = 0;
    
    if (variable_struct_exists(_entry, "machine_instance_id")) {
        var _inst = machine_get(_entry.machine_instance_id);
        if (_inst != undefined) {
            // Base score from blueprint tier
            var _bp = global.blueprint_data[$ _inst.blueprint_id];
            if (_bp != undefined) {
                switch (_bp.tier) {
                    case 1: _score += 20; break;
                    case 2: _score += 40; break;
                    case 3: _score += 60; break;
                    case 4: _score += 80; break;
                }
            }
            
            // Quality bonus (0-1 scale → 0-30 points)
            _score += floor(_inst.quality_rating * 30);
            
            // Mark level bonus (5 per mark)
            _score += _inst.mark * 5;
        }
    }
    
    // Determine rank (thresholds)
    var _rank = 4;
    var _tier = "none";
    if (_score >= 80) { _rank = 1; _tier = "gold"; }
    else if (_score >= 55) { _rank = 2; _tier = "silver"; }
    else if (_score >= 30) { _rank = 3; _tier = "bronze"; }
    
    return { rank: _rank, prize_tier: _tier, score: _score };
}

/// @func festival_judge_cooking(_entry)
/// @desc Cooking Competition judging. Score based on item rarity and type.
/// @param {struct} _entry  { item_id }
/// @returns {struct} { rank, prize_tier, score }
function festival_judge_cooking(_entry) {
    var _score = 0;
    
    if (variable_struct_exists(_entry, "item_id")) {
        // Score based on item properties (rarity, cooking complexity)
        // Simple scoring: rare items score higher
        var _item_id = _entry.item_id;
        if (string_pos("rare", _item_id) > 0) _score += 60;
        else if (string_pos("cooked", _item_id) > 0) _score += 40;
        else if (string_pos("pie", _item_id) > 0 || string_pos("stew", _item_id) > 0) _score += 50;
        else _score += 20;
        
        // Random judge preference bonus (±10)
        _score += irandom(20) - 10;
    }
    
    var _rank = 4;
    var _tier = "none";
    if (_score >= 60) { _rank = 1; _tier = "gold"; }
    else if (_score >= 40) { _rank = 2; _tier = "silver"; }
    else if (_score >= 25) { _rank = 3; _tier = "bronze"; }
    
    return { rank: _rank, prize_tier: _tier, score: _score };
}

/// @func festival_judge_race(_entry)
/// @desc Automaton Race judging. Score based on automaton personality speed bonus.
/// @param {struct} _entry  { automaton_instance_id }
/// @returns {struct} { rank, prize_tier, score }
function festival_judge_race(_entry) {
    var _score = 50; // Base score
    
    if (variable_struct_exists(_entry, "automaton_instance_id")) {
        var _inst = machine_get(_entry.automaton_instance_id);
        if (_inst != undefined && variable_struct_exists(_inst, "automaton_data")) {
            var _personality = _inst.automaton_data.personality;
            // Speed-related personalities get bonus
            if (_personality == "Industrious") _score += 25;
            else if (_personality == "Brave") _score += 15;
            else if (_personality == "Curious") _score += 10;
            
            // Quality bonus
            _score += floor(_inst.quality_rating * 20);
        }
    }
    
    // Spark's automaton competition (she's good!)
    var _spark_score = 60 + irandom(20);
    
    var _rank = (_score >= _spark_score) ? 1 : 2;
    var _tier = (_rank == 1) ? "gold" : "silver";
    
    return { rank: _rank, prize_tier: _tier, score: _score };
}

/// @func festival_judge_flyer_race(_entry)
/// @desc Flyer Race judging (Sky Day). Player vs Spark.
/// @param {struct} _entry  { has_flyer: bool }
/// @returns {struct} { rank, prize_tier, score }
function festival_judge_flyer_race(_entry) {
    if (!variable_struct_exists(_entry, "has_flyer") || !_entry.has_flyer) {
        return { rank: 4, prize_tier: "none", score: 0 };
    }
    
    // Skill-based: player's engineering level affects performance
    var _eng = variable_struct_exists(global, "engineering_level") ? global.engineering_level : 1;
    var _score = 40 + _eng * 5 + irandom(15);
    var _spark_score = 55 + irandom(20);
    
    var _rank = (_score >= _spark_score) ? 1 : 2;
    var _tier = (_rank == 1) ? "gold" : "silver";
    
    return { rank: _rank, prize_tier: _tier, score: _score };
}

// ============================================================================
// DANCE / PARTNER INVITATION
// ============================================================================

/// @func festival_invite_dance(_npc_id)
/// @desc Invite an NPC to the festival dance. Requires hearts >= 3.
/// @param {string} _npc_id
/// @returns {bool} True if accepted
function festival_invite_dance(_npc_id) {
    var _hearts = 0;
    if (ds_map_exists(global.npc_hearts, _npc_id)) {
        _hearts = floor(ds_map_find_value(global.npc_hearts, _npc_id) / 100);
    }
    
    if (_hearts < 3) {
        show_debug_message("INFO: Dance invitation declined by " + _npc_id + " (hearts too low)");
        return false;
    }
    
    // Accept! Heart bonus
    var _bonus = 5 + floor(_hearts / 2);
    ds_map_replace(global.npc_hearts, _npc_id, ds_map_find_value(global.npc_hearts, _npc_id) + _bonus);
    
    show_debug_message("INFO: " + _npc_id + " accepted dance invitation! +" + string(_bonus) + " hearts");
    return true;
}

// ============================================================================
// SAVE / LOAD
// ============================================================================

/// @func festival_save()
function festival_save() {
    return {
        trophies: global.festival_state.trophies,
        attended_this_year: global.festival_state.attended_this_year
    };
}

/// @func festival_load(_save_data)
function festival_load(_save_data) {
    if (_save_data == undefined) return;
    global.festival_state.trophies = _save_data.trophies;
    global.festival_state.attended_this_year = _save_data.attended_this_year;
    show_debug_message("INFO: Festival state loaded.");
}
