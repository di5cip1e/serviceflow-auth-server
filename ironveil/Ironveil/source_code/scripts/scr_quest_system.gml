/// scr_quest_system.gml
/// Quest engine: trigger evaluation, objective tracking, reward distribution, quest log.
/// Objective #41: Full Quest System
///
/// Dependencies: scr_data, scr_npc_data, scr_dialogue_data, scr_inventory, scr_save_load
/// Global data: global.quest_data      (all quest definitions, indexed by quest_id)
///              global.quest_state      (runtime: active quests, completed quests, objective progress)
///              global.quest_templates  (repeatable quest templates)

// ============================================================================
// ENUMS
// ============================================================================

enum QUEST_STATUS {
    LOCKED     = 0,  // Requirements not met
    AVAILABLE  = 1,  // Can be activated (trigger conditions met)
    ACTIVE     = 2,  // In progress
    COMPLETE   = 3,  // Successfully finished
    FAILED     = 4   // Failed (rare — most quests can't fail)
}

enum QUEST_TYPE {
    MAIN        = 0,
    SIDE_NPC    = 1,
    BUILD       = 2,
    EXPLORATION = 3,
    DEFENSE     = 4,
    FESTIVAL    = 5,
    REPEATABLE  = 6
}

// Objective types for tracking
enum OBJ_TYPE {
    VISIT          = 0,   // Enter a specific room
    TALK           = 1,   // Talk to a specific NPC
    CRAFT          = 2,   // Craft at a specific station
    BUILD          = 3,   // Build a specific machine
    GATHER         = 4,   // Collect X of item Y
    DELIVER        = 5,   // Give item to NPC
    KILL           = 6,   // Defeat X enemies of type Y
    EXPLORE        = 7,   // Discover a zone/area
    SURVIVE_RAID   = 8,   // Survive a raid event
    REACH          = 9,   // Reach a location within a zone
    HAVE_ITEM      = 10,  // Have X of item Y in inventory
    ACHIEVE_RATING = 11,  // Reach a defense/reputation rating
    CHOICE         = 12,  // Make a dialogue choice
    ESCORT         = 13,  // Accompany NPC to location
    INSPECT        = 14   // Use scanner on target
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func quest_system_init()
/// @desc Loads all quest data files and initializes the quest state.
///       Called during data_load_all() in the boot sequence.
function quest_system_init() {
    global.quest_data = {};
    global.quest_templates = {};
    
    // Load quest data files
    var _quest_files = [
        "data/quests/main_quests.json",
        "data/quests/side_quests_romance.json",
        "data/quests/side_quests_core.json",
        "data/quests/side_quests_support.json",
        "data/quests/build_quests.json",
        "data/quests/exploration_quests.json",
        "data/quests/defense_quests.json",
        "data/quests/sandbox_quests.json"
    ];
    
    var _total = 0;
    for (var _i = 0; _i < array_length(_quest_files); _i++) {
        var _data = data_load_file(_quest_files[_i]);
        if (_data != undefined) {
            if (variable_struct_exists(_data, "_meta")) {
                variable_struct_remove(_data, "_meta");
            }
            var _quests = _data.quests;
            for (var _j = 0; _j < array_length(_quests); _j++) {
                var _q = _quests[_j];
                global.quest_data[$ _q.quest_id] = _q;
                _total++;
            }
        }
    }
    
    // Load repeatable templates
    var _tpl_data = data_load_file("data/quests/repeatable_templates.json");
    if (_tpl_data != undefined) {
        if (variable_struct_exists(_tpl_data, "_meta")) {
            variable_struct_remove(_tpl_data, "_meta");
        }
        var _tpls = _tpl_data.templates;
        for (var _i = 0; _i < array_length(_tpls); _i++) {
            global.quest_templates[$ _tpls[_i].template_id] = _tpls[_i];
        }
        show_debug_message("INFO: " + string(array_length(_tpls)) + " repeatable quest templates loaded.");
    }
    
    // Initialize runtime state (overwritten by save/load if save exists)
    if (!variable_struct_exists(global, "quest_state")) {
        global.quest_state = {
            active_quests: {},      // quest_id -> { status, objectives_progress }
            completed_quests: {},   // quest_id -> true
            failed_quests: {},      // quest_id -> true
            generated_repeatables: [] // Array of generated repeatable quest instances
        };
    }
    
    // Initialize branching story tracking (overwritten by save/load if save exists)
    // Marshal Understanding score: determines ending (Defeated / Captured / Redeemed)
    if (!variable_struct_exists(global, "marshal_understanding")) {
        global.marshal_understanding = 0;
    }
    // Alliance strength: affects MQ-24 siege reinforcements
    if (!variable_struct_exists(global, "alliance_strength")) {
        global.alliance_strength = 0;
    }
    // Marshal ending result: set during MQ-26 resolution
    if (!variable_struct_exists(global, "marshal_ending")) {
        global.marshal_ending = ""; // "defeated", "captured", or "redeemed"
    }
    
    show_debug_message("INFO: Quest system initialized. " + string(_total) + " quests loaded."
        + " Understanding: " + string(global.marshal_understanding)
        + " Alliance: " + string(global.alliance_strength));
}

// ============================================================================
// TRIGGER EVALUATION
// ============================================================================

/// @func quest_check_triggers()
/// @desc Evaluates all locked quests to see if any have become available.
///       Called on room enter, daily update, and after significant events.
/// @returns {array} Array of quest_ids that just became available
function quest_check_triggers() {
    var _newly_available = [];
    var _all_ids = variable_struct_get_names(global.quest_data);
    
    for (var _i = 0; _i < array_length(_all_ids); _i++) {
        var _qid = _all_ids[_i];
        
        // Skip if already active, complete, or failed
        if (variable_struct_exists(global.quest_state.active_quests, _qid)) continue;
        if (variable_struct_exists(global.quest_state.completed_quests, _qid)) continue;
        if (variable_struct_exists(global.quest_state.failed_quests, _qid)) continue;
        
        var _q = global.quest_data[$ _qid];
        if (_quest_triggers_met(_q)) {
            array_push(_newly_available, _qid);
        }
    }
    
    return _newly_available;
}

/// @func _quest_triggers_met(_quest)
/// @desc Checks if all trigger conditions for a quest are satisfied.
/// @param {struct} _quest  Quest definition struct
/// @returns {bool}
function _quest_triggers_met(_quest) {
    var _trigger = _quest.trigger;
    if (_trigger == undefined) return false;
    
    // Check prerequisite quests
    if (variable_struct_exists(_trigger, "prerequisite_quests")) {
        var _prereqs = _trigger.prerequisite_quests;
        for (var _i = 0; _i < array_length(_prereqs); _i++) {
            if (!variable_struct_exists(global.quest_state.completed_quests, _prereqs[_i])) {
                return false;
            }
        }
    }
    
    // Check story flags
    if (variable_struct_exists(_trigger, "story_flags")) {
        var _flags = _trigger.story_flags;
        for (var _i = 0; _i < array_length(_flags); _i++) {
            if (!variable_struct_exists(global, "story_flags") 
                || !variable_struct_exists(global.story_flags, _flags[_i])
                || global.story_flags[$ _flags[_i]] != true) {
                return false;
            }
        }
    }
    
    // Check heart level requirements
    if (variable_struct_exists(_trigger, "heart_level")) {
        var _heart_reqs = _trigger.heart_level;
        var _hr_keys = variable_struct_get_names(_heart_reqs);
        for (var _i = 0; _i < array_length(_hr_keys); _i++) {
            var _npc_id = _hr_keys[_i];
            var _req_level = _heart_reqs[$ _npc_id];
            var _current = 0;
            if (ds_map_exists(global.npc_hearts, _npc_id)) {
                _current = floor(ds_map_find_value(global.npc_hearts, _npc_id) / 100);
            }
            if (_current < _req_level) return false;
        }
    }
    
    // Check season
    if (variable_struct_exists(_trigger, "season") && _trigger.season != undefined) {
        var _season_name = "";
        switch (global.time_season) {
            case 0: _season_name = "SPRING"; break;
            case 1: _season_name = "SUMMER"; break;
            case 2: _season_name = "AUTUMN"; break;
            case 3: _season_name = "WINTER"; break;
        }
        if (_trigger.season != _season_name) return false;
    }
    
    // Check day
    if (variable_struct_exists(_trigger, "day") && _trigger.day != undefined) {
        if (global.time_day < _trigger.day) return false;
    }
    
    // Check year
    if (variable_struct_exists(_trigger, "year") && _trigger.year != undefined) {
        if (global.time_year < _trigger.year) return false;
    }
    
    // Check engineering level
    if (variable_struct_exists(_trigger, "engineering_level")) {
        if (variable_struct_exists(global, "engineering_level")) {
            if (global.engineering_level < _trigger.engineering_level) return false;
        } else {
            return false;
        }
    }
    
    // Check game start trigger
    if (variable_struct_exists(_trigger, "type") && _trigger.type == "game_start") {
        return true; // Always available at game start
    }
    
    return true;
}

// ============================================================================
// QUEST LIFECYCLE
// ============================================================================

/// @func quest_activate(_quest_id)
/// @desc Activates a quest: sets it to ACTIVE, initializes objective tracking.
/// @param {string} _quest_id
/// @returns {bool} True if activated successfully
function quest_activate(_quest_id) {
    var _q = global.quest_data[$ _quest_id];
    if (_q == undefined) {
        show_debug_message("WARN: quest_activate — Unknown quest: " + _quest_id);
        return false;
    }
    
    // Initialize objective progress
    var _obj_progress = {};
    if (variable_struct_exists(_q, "objectives")) {
        for (var _i = 0; _i < array_length(_q.objectives); _i++) {
            var _obj = _q.objectives[_i];
            _obj_progress[$ _obj.id] = {
                complete: false,
                current: 0,
                target: variable_struct_exists(_obj, "target_count") ? _obj.target_count : 1
            };
        }
    }
    
    global.quest_state.active_quests[$ _quest_id] = {
        status: QUEST_STATUS.ACTIVE,
        objectives: _obj_progress,
        activated_date: {
            year: global.time_year,
            season: global.time_season,
            day: global.time_day
        }
    };
    
    // Set activation story flag if specified
    if (variable_struct_exists(_q, "on_activate_flag")) {
        if (!variable_struct_exists(global, "story_flags")) global.story_flags = {};
        global.story_flags[$ _q.on_activate_flag] = true;
    }
    
    show_debug_message("INFO: Quest activated: " + _quest_id + " (" + _q.name + ")");
    // event_fire("quest_activated", { quest_id: _quest_id, name: _q.name });
    
    return true;
}

/// @func quest_update_objective(_quest_id, _obj_id, _amount)
/// @desc Updates progress on a quest objective.
/// @param {string} _quest_id
/// @param {string} _obj_id  Objective ID within the quest
/// @param {real} _amount  Amount to add (default 1)
/// @returns {bool} True if objective is now complete
function quest_update_objective(_quest_id, _obj_id, _amount) {
    if (_amount == undefined) _amount = 1;
    
    var _active = global.quest_state.active_quests[$ _quest_id];
    if (_active == undefined) return false;
    
    var _obj = _active.objectives[$ _obj_id];
    if (_obj == undefined) return false;
    if (_obj.complete) return true; // Already done
    
    _obj.current = min(_obj.current + _amount, _obj.target);
    
    if (_obj.current >= _obj.target) {
        _obj.complete = true;
        show_debug_message("INFO: Quest objective complete: " + _quest_id + " / " + _obj_id);
        
        // Check if ALL objectives are now complete
        var _all_done = true;
        var _obj_keys = variable_struct_get_names(_active.objectives);
        for (var _i = 0; _i < array_length(_obj_keys); _i++) {
            if (!_active.objectives[$ _obj_keys[_i]].complete) {
                _all_done = false;
                break;
            }
        }
        
        if (_all_done) {
            quest_complete(_quest_id);
        }
        
        return true;
    }
    
    return false;
}

/// @func quest_complete(_quest_id)
/// @desc Completes a quest: distributes rewards, sets flags, moves to completed.
/// @param {string} _quest_id
function quest_complete(_quest_id) {
    var _q = global.quest_data[$ _quest_id];
    if (_q == undefined) return;
    
    // Remove from active, add to completed
    if (variable_struct_exists(global.quest_state.active_quests, _quest_id)) {
        variable_struct_remove(global.quest_state.active_quests, _quest_id);
    }
    global.quest_state.completed_quests[$ _quest_id] = true;
    
    // Distribute rewards
    var _rewards = _q.rewards;
    if (_rewards != undefined) {
        // Cogs (currency)
        if (variable_struct_exists(_rewards, "cogs") && _rewards.cogs > 0) {
            if (!variable_struct_exists(global, "player_cogs")) global.player_cogs = 0;
            global.player_cogs += _rewards.cogs;
            show_debug_message("INFO: Quest reward: +" + string(_rewards.cogs) + " Cogs");
        }
        
        // Items
        if (variable_struct_exists(_rewards, "items")) {
            for (var _i = 0; _i < array_length(_rewards.items); _i++) {
                var _item = _rewards.items[_i];
                if (!variable_struct_exists(global, "inventory")) global.inventory = {};
                if (!variable_struct_exists(global.inventory, _item.item_id)) {
                    global.inventory[$ _item.item_id] = 0;
                }
                global.inventory[$ _item.item_id] += _item.quantity;
            }
        }
        
        // Heart points
        if (variable_struct_exists(_rewards, "hearts")) {
            var _hr = _rewards.hearts;
            var _hr_keys = variable_struct_get_names(_hr);
            for (var _i = 0; _i < array_length(_hr_keys); _i++) {
                var _npc_id = _hr_keys[_i];
                var _amount = _hr[$ _npc_id];
                if (_npc_id == "all_npcs" && _amount > 0) {
                    // Apply to all NPCs
                    for (var _j = 0; _j < global.npc_count; _j++) {
                        var _nid = global.npc_ids[_j];
                        if (ds_map_exists(global.npc_hearts, _nid)) {
                            var _cur = ds_map_find_value(global.npc_hearts, _nid);
                            ds_map_replace(global.npc_hearts, _nid, _cur + _amount);
                        }
                    }
                } else if (ds_map_exists(global.npc_hearts, _npc_id)) {
                    var _cur = ds_map_find_value(global.npc_hearts, _npc_id);
                    ds_map_replace(global.npc_hearts, _npc_id, _cur + _amount);
                }
            }
        }
        
        // Reputation
        if (variable_struct_exists(_rewards, "reputation") && _rewards.reputation > 0) {
            if (!variable_struct_exists(global, "town_reputation")) global.town_reputation = 0;
            global.town_reputation += _rewards.reputation;
        }
        
        // Story flags
        if (variable_struct_exists(_rewards, "story_flags_set")) {
            if (!variable_struct_exists(global, "story_flags")) global.story_flags = {};
            for (var _i = 0; _i < array_length(_rewards.story_flags_set); _i++) {
                global.story_flags[$ _rewards.story_flags_set[_i]] = true;
            }
        }
        
        // Blueprint unlocks
        if (variable_struct_exists(_rewards, "blueprints")) {
            for (var _i = 0; _i < array_length(_rewards.blueprints); _i++) {
                if (variable_struct_exists(global, "blueprint_discovered")) {
                    global.blueprint_discovered[$ _rewards.blueprints[_i]] = true;
                }
            }
        }
    }
    
    show_debug_message("INFO: Quest complete: " + _quest_id + " (" + _q.name + ")");
    // event_fire("quest_completed", { quest_id: _quest_id, name: _q.name });
    
    // Check if completing this quest triggers new quests
    quest_check_triggers();
}

/// @func quest_fail(_quest_id)
/// @desc Marks a quest as failed.
/// @param {string} _quest_id
function quest_fail(_quest_id) {
    if (variable_struct_exists(global.quest_state.active_quests, _quest_id)) {
        variable_struct_remove(global.quest_state.active_quests, _quest_id);
    }
    global.quest_state.failed_quests[$ _quest_id] = true;
    
    show_debug_message("INFO: Quest failed: " + _quest_id);
}

// ============================================================================
// OBJECTIVE HELPER — EVENT HOOKS
// ============================================================================

/// @func quest_on_room_enter(_room_id)
/// @desc Called when player enters a room. Checks VISIT and REACH objectives.
/// @param {string} _room_id  Room identifier
function quest_on_room_enter(_room_id) {
    var _active_keys = variable_struct_get_names(global.quest_state.active_quests);
    
    for (var _i = 0; _i < array_length(_active_keys); _i++) {
        var _qid = _active_keys[_i];
        var _q = global.quest_data[$ _qid];
        if (_q == undefined) continue;
        
        for (var _j = 0; _j < array_length(_q.objectives); _j++) {
            var _obj = _q.objectives[_j];
            if ((_obj.type == "visit" || _obj.type == "reach" || _obj.type == "explore") 
                && _obj.target == _room_id) {
                quest_update_objective(_qid, _obj.id, 1);
            }
        }
    }
    
    // Also check for newly available quests
    quest_check_triggers();
}

/// @func quest_on_npc_talk(_npc_id)
/// @desc Called when player talks to an NPC. Checks TALK objectives.
/// @param {string} _npc_id
function quest_on_npc_talk(_npc_id) {
    var _active_keys = variable_struct_get_names(global.quest_state.active_quests);
    
    for (var _i = 0; _i < array_length(_active_keys); _i++) {
        var _qid = _active_keys[_i];
        var _q = global.quest_data[$ _qid];
        if (_q == undefined) continue;
        
        for (var _j = 0; _j < array_length(_q.objectives); _j++) {
            var _obj = _q.objectives[_j];
            if (_obj.type == "talk" && _obj.target == _npc_id) {
                quest_update_objective(_qid, _obj.id, 1);
            }
        }
    }
}

/// @func quest_on_enemy_kill(_enemy_type)
/// @desc Called when an enemy is defeated. Checks KILL objectives.
/// @param {string} _enemy_type  Enemy type identifier
function quest_on_enemy_kill(_enemy_type) {
    var _active_keys = variable_struct_get_names(global.quest_state.active_quests);
    
    for (var _i = 0; _i < array_length(_active_keys); _i++) {
        var _qid = _active_keys[_i];
        var _q = global.quest_data[$ _qid];
        if (_q == undefined) continue;
        
        for (var _j = 0; _j < array_length(_q.objectives); _j++) {
            var _obj = _q.objectives[_j];
            if (_obj.type == "kill" && (_obj.target == _enemy_type || _obj.target == "any")) {
                quest_update_objective(_qid, _obj.id, 1);
            }
        }
    }
}

/// @func quest_on_item_craft(_item_id)
/// @desc Called when an item is crafted. Checks CRAFT and BUILD objectives.
/// @param {string} _item_id  Crafted item/machine identifier
function quest_on_item_craft(_item_id) {
    var _active_keys = variable_struct_get_names(global.quest_state.active_quests);
    
    for (var _i = 0; _i < array_length(_active_keys); _i++) {
        var _qid = _active_keys[_i];
        var _q = global.quest_data[$ _qid];
        if (_q == undefined) continue;
        
        for (var _j = 0; _j < array_length(_q.objectives); _j++) {
            var _obj = _q.objectives[_j];
            if ((_obj.type == "craft" || _obj.type == "build") && _obj.target == _item_id) {
                quest_update_objective(_qid, _obj.id, 1);
            }
        }
    }
}

/// @func quest_on_raid_survive(_raid_result)
/// @desc Called after a raid. Checks SURVIVE_RAID objectives.
/// @param {string} _raid_result  "victory", "hard_victory", "defeat"
function quest_on_raid_survive(_raid_result) {
    if (_raid_result == "defeat") return; // Only count victories
    
    var _active_keys = variable_struct_get_names(global.quest_state.active_quests);
    
    for (var _i = 0; _i < array_length(_active_keys); _i++) {
        var _qid = _active_keys[_i];
        var _q = global.quest_data[$ _qid];
        if (_q == undefined) continue;
        
        for (var _j = 0; _j < array_length(_q.objectives); _j++) {
            var _obj = _q.objectives[_j];
            if (_obj.type == "survive_raid") {
                quest_update_objective(_qid, _obj.id, 1);
            }
        }
    }
}

// ============================================================================
// REPEATABLE QUEST GENERATION
// ============================================================================

/// @func quest_generate_repeatable(_template_id)
/// @desc Creates a new quest instance from a repeatable template.
/// @param {string} _template_id  Template identifier
/// @returns {string} Generated quest_id, or "" on failure
function quest_generate_repeatable(_template_id) {
    var _tpl = global.quest_templates[$ _template_id];
    if (_tpl == undefined) {
        show_debug_message("WARN: quest_generate_repeatable — Unknown template: " + _template_id);
        return "";
    }
    
    // Generate unique ID
    var _count = array_length(global.quest_state.generated_repeatables);
    var _gen_id = _template_id + "_gen_" + string(_count + 1);
    
    // Resolve template variables
    var _zones = _tpl.variable_pools.zones;
    var _zone = _zones[irandom(array_length(_zones) - 1)];
    
    var _enemies = _tpl.variable_pools.enemy_types;
    var _enemy = _enemies[irandom(array_length(_enemies) - 1)];
    
    var _items = _tpl.variable_pools.items;
    var _item = _items[irandom(array_length(_items) - 1)];
    
    var _qty_range = _tpl.variable_pools.quantity_range;
    var _qty = _qty_range[0] + irandom(_qty_range[1] - _qty_range[0]);
    
    // Clone template quest definition with resolved variables
    var _quest = {
        quest_id: _gen_id,
        name: string_replace_all(string_replace_all(string_replace_all(
            _tpl.name_template, "{ZONE}", _zone), "{ENEMY}", _enemy), "{ITEM}", _item),
        type: "REPEATABLE",
        giver: _tpl.giver,
        description: string_replace_all(string_replace_all(string_replace_all(string_replace_all(
            _tpl.description_template, "{ZONE}", _zone), "{ENEMY}", _enemy), "{ITEM}", _item), "{QTY}", string(_qty)),
        trigger: { type: "generated" },
        objectives: [],
        rewards: _tpl.reward_template
    };
    
    // Build objectives from template
    for (var _i = 0; _i < array_length(_tpl.objective_templates); _i++) {
        var _ot = _tpl.objective_templates[_i];
        array_push(_quest.objectives, {
            id: "obj_" + string(_i + 1),
            type: _ot.type,
            target: string_replace_all(string_replace_all(_ot.target_template, "{ZONE}", _zone), "{ENEMY}", _enemy),
            target_count: (_ot.use_quantity ? _qty : 1),
            description: string_replace_all(string_replace_all(string_replace_all(string_replace_all(
                _ot.description_template, "{ZONE}", _zone), "{ENEMY}", _enemy), "{ITEM}", _item), "{QTY}", string(_qty))
        });
    }
    
    // Register the generated quest
    global.quest_data[$ _gen_id] = _quest;
    array_push(global.quest_state.generated_repeatables, _gen_id);
    
    // Auto-activate
    quest_activate(_gen_id);
    
    show_debug_message("INFO: Generated repeatable quest: " + _gen_id + " (" + _quest.name + ")");
    return _gen_id;
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/// @func quest_get_active()
/// @desc Returns an array of active quest summaries for the quest log UI.
/// @returns {array} Array of { quest_id, name, type, giver, objectives, description }
function quest_get_active() {
    var _result = [];
    var _active_keys = variable_struct_get_names(global.quest_state.active_quests);
    
    for (var _i = 0; _i < array_length(_active_keys); _i++) {
        var _qid = _active_keys[_i];
        var _q = global.quest_data[$ _qid];
        var _state = global.quest_state.active_quests[$ _qid];
        if (_q == undefined) continue;
        
        // Build objective summaries
        var _obj_summaries = [];
        if (variable_struct_exists(_q, "objectives")) {
            for (var _j = 0; _j < array_length(_q.objectives); _j++) {
                var _obj = _q.objectives[_j];
                var _prog = _state.objectives[$ _obj.id];
                array_push(_obj_summaries, {
                    description: _obj.description,
                    complete: (_prog != undefined ? _prog.complete : false),
                    current: (_prog != undefined ? _prog.current : 0),
                    target: (_prog != undefined ? _prog.target : 1)
                });
            }
        }
        
        array_push(_result, {
            quest_id: _qid,
            name: _q.name,
            type: _q.type,
            giver: variable_struct_exists(_q, "giver") ? _q.giver : "unknown",
            description: variable_struct_exists(_q, "description") ? _q.description : "",
            objectives: _obj_summaries
        });
    }
    
    return _result;
}

/// @func quest_get_completed()
/// @desc Returns an array of completed quest IDs.
/// @returns {array}
function quest_get_completed() {
    return variable_struct_get_names(global.quest_state.completed_quests);
}

/// @func quest_is_complete(_quest_id)
/// @desc Checks if a specific quest has been completed.
/// @param {string} _quest_id
/// @returns {bool}
function quest_is_complete(_quest_id) {
    return variable_struct_exists(global.quest_state.completed_quests, _quest_id);
}

/// @func quest_is_active(_quest_id)
/// @desc Checks if a specific quest is currently active.
/// @param {string} _quest_id
/// @returns {bool}
function quest_is_active(_quest_id) {
    return variable_struct_exists(global.quest_state.active_quests, _quest_id);
}

// ============================================================================
// SAVE / LOAD
// ============================================================================

/// @func quest_save()
/// @desc Returns a struct suitable for inclusion in the save file.
/// @returns {struct}
function quest_save() {
    return {
        active_quests: global.quest_state.active_quests,
        completed_quests: global.quest_state.completed_quests,
        failed_quests: global.quest_state.failed_quests,
        generated_repeatables: global.quest_state.generated_repeatables,
        marshal_understanding: global.marshal_understanding,
        alliance_strength: global.alliance_strength,
        marshal_ending: global.marshal_ending
    };
}

/// @func quest_load(_save_data)
/// @desc Restores quest state from save data.
/// @param {struct} _save_data  Quest portion of save file
function quest_load(_save_data) {
    if (_save_data == undefined) return;
    
    global.quest_state.active_quests = _save_data.active_quests;
    global.quest_state.completed_quests = _save_data.completed_quests;
    global.quest_state.failed_quests = _save_data.failed_quests;
    global.quest_state.generated_repeatables = _save_data.generated_repeatables;
    
    // Restore branching story state (backward compatible — defaults if missing)
    global.marshal_understanding = variable_struct_exists(_save_data, "marshal_understanding") 
        ? _save_data.marshal_understanding : 0;
    global.alliance_strength = variable_struct_exists(_save_data, "alliance_strength") 
        ? _save_data.alliance_strength : 0;
    global.marshal_ending = variable_struct_exists(_save_data, "marshal_ending") 
        ? _save_data.marshal_ending : "";
    
    show_debug_message("INFO: Quest state loaded. Active: " 
        + string(array_length(variable_struct_get_names(global.quest_state.active_quests)))
        + " | Completed: " 
        + string(array_length(variable_struct_get_names(global.quest_state.completed_quests)))
        + " | Understanding: " + string(global.marshal_understanding)
        + " | Alliance: " + string(global.alliance_strength));
}

// ============================================================================
// BRANCHING STORY SYSTEMS (M4 Objective #42)
// ============================================================================

/// Marshal Understanding thresholds for MQ-26 ending determination
#macro MARSHAL_END_THRESHOLD_CAPTURED  2
#macro MARSHAL_END_THRESHOLD_REDEEMED  4

/// @func quest_get_marshal_ending()
/// @desc Determines which Marshal ending the player qualifies for
///       based on their accumulated Understanding score.
/// @returns {string} "defeated", "captured", or "redeemed"
function quest_get_marshal_ending() {
    if (global.marshal_understanding >= MARSHAL_END_THRESHOLD_REDEEMED) {
        return "redeemed";
    } else if (global.marshal_understanding >= MARSHAL_END_THRESHOLD_CAPTURED) {
        return "captured";
    }
    return "defeated";
}

/// @func quest_resolve_marshal_ending()
/// @desc Called during MQ-26 completion. Locks in the Marshal ending
///       and sets appropriate story flags for post-game content.
function quest_resolve_marshal_ending() {
    global.marshal_ending = quest_get_marshal_ending();
    
    if (!variable_struct_exists(global, "story_flags")) global.story_flags = {};
    global.story_flags[$ "flag_marshal_ending_" + global.marshal_ending] = true;
    
    show_debug_message("INFO: Marshal ending resolved: " + global.marshal_ending 
        + " (Understanding: " + string(global.marshal_understanding) + ")");
}

/// @func quest_get_alliance_reinforcement_level()
/// @desc Returns the reinforcement tier for the MQ-24 Siege based on
///       alliance_strength accumulated during MQ-19 and MQ-23.
/// @returns {string} "none", "partial", or "full"
function quest_get_alliance_reinforcement_level() {
    if (global.alliance_strength >= 6) return "full";
    if (global.alliance_strength >= 3) return "partial";
    return "none";
}

/// @func quest_add_understanding(_amount)
/// @desc Adds to the Marshal Understanding score. Used by quest completion
///       handlers and dialogue_process_effects().
/// @param {real} _amount
function quest_add_understanding(_amount) {
    global.marshal_understanding += _amount;
    show_debug_message("INFO: Understanding +" + string(_amount) 
        + " (total: " + string(global.marshal_understanding) + ")");
}

/// @func quest_add_alliance(_amount)
/// @desc Adds to the Alliance Strength score.
/// @param {real} _amount
function quest_add_alliance(_amount) {
    global.alliance_strength += _amount;
    show_debug_message("INFO: Alliance +" + string(_amount) 
        + " (total: " + string(global.alliance_strength) + ")");
}
