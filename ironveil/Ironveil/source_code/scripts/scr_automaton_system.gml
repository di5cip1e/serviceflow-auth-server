/// scr_automaton_system.gml
/// Automaton task assignment, personality development, and AI Core interface.
/// Objective #20: Machine & Automaton Instance Management
///
/// Dependencies: scr_machine_system, scr_blueprint_system, scr_data
/// Note: Automatons are stored in global.machines alongside other machines.
///       This script provides automaton-specific logic layered on top.

// ============================================================================
// TASK ASSIGNMENT
// ============================================================================

/// @func automaton_assign_task(_instance_id, _task_type, _task_params)
/// @desc Assigns a task to an automaton. Validates the automaton can perform the task.
/// @param {string} _instance_id  Automaton instance ID
/// @param {string} _task_type  One of: SALVAGE, CONSTRUCTION, PATROL, MAINTENANCE, TRADE, 
///                             GENERAL_LABOR, HAULING, COMBAT, IDLE
/// @param {struct} _task_params  Task-specific parameters (target location, cargo list, etc.)
/// @returns {bool} True if task was assigned successfully
function automaton_assign_task(_instance_id, _task_type, _task_params) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) {
        show_debug_message("WARN: automaton_assign_task — Unknown instance: " + _instance_id);
        return false;
    }
    
    // Must be an automaton
    if (_inst.category != "AUTOMATON") {
        show_debug_message("WARN: automaton_assign_task — Not an automaton: " + _instance_id);
        return false;
    }
    
    // Must be operational
    if (_inst.status != "OPERATIONAL") {
        show_debug_message("WARN: automaton_assign_task — Not operational: " + _instance_id 
            + " (status: " + _inst.status + ")");
        return false;
    }
    
    // Check valid tasks for this automaton type
    var _base = global.machine_data[$ _inst.blueprint_id];
    if (variable_struct_exists(_base, "valid_tasks")) {
        if (!array_contains(_base.valid_tasks, _task_type)) {
            show_debug_message("WARN: automaton_assign_task — Task " + _task_type 
                + " not valid for " + _inst.blueprint_id);
            return false;
        }
    }
    
    // Initialize automaton-specific data if not present
    if (!variable_struct_exists(_inst, "automaton_data")) {
        _inst.automaton_data = {
            current_task: { type: "IDLE", params: {} },
            personality: "Neutral",
            personality_points: {},
            task_history: {},
            total_tasks_completed: 0
        };
    }
    
    // Assign the task
    _inst.automaton_data.current_task = {
        type: _task_type,
        params: _task_params,
        assigned_date: {
            year: global.time_year,
            season: global.time_season,
            day: global.time_day
        }
    };
    
    // Track task history for personality development
    if (!variable_struct_exists(_inst.automaton_data.task_history, _task_type)) {
        _inst.automaton_data.task_history[$ _task_type] = 0;
    }
    _inst.automaton_data.task_history[$ _task_type]++;
    
    show_debug_message("INFO: Automaton " + _instance_id + " assigned task: " + _task_type);
    
    // Update personality based on accumulated task history
    automaton_update_personality(_instance_id);
    
    return true;
}

/// @func automaton_get_task(_instance_id)
/// @desc Returns the current task assignment for an automaton.
/// @param {string} _instance_id
/// @returns {struct} Task struct { type, params, assigned_date } or { type: "IDLE" }
function automaton_get_task(_instance_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return { type: "IDLE", params: {} };
    
    if (!variable_struct_exists(_inst, "automaton_data")) {
        return { type: "IDLE", params: {} };
    }
    
    return _inst.automaton_data.current_task;
}

/// @func automaton_clear_task(_instance_id)
/// @desc Clears the current task and sets automaton to IDLE.
/// @param {string} _instance_id
function automaton_clear_task(_instance_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return;
    
    if (variable_struct_exists(_inst, "automaton_data")) {
        _inst.automaton_data.current_task = { type: "IDLE", params: {} };
    }
    
    show_debug_message("INFO: Automaton " + _instance_id + " task cleared -> IDLE");
}

// ============================================================================
// PERSONALITY DEVELOPMENT
// ============================================================================

/// @func automaton_update_personality(_instance_id)
/// @desc Updates automaton personality based on accumulated task history.
///       Personality affects stat bonuses and NPC-like dialogue flavor.
/// @param {string} _instance_id
function automaton_update_personality(_instance_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return;
    if (!variable_struct_exists(_inst, "automaton_data")) return;
    
    var _history = _inst.automaton_data.task_history;
    
    // Find dominant task type
    var _max_count = 0;
    var _dominant_task = "IDLE";
    var _task_keys = variable_struct_get_names(_history);
    for (var _i = 0; _i < array_length(_task_keys); _i++) {
        var _task = _task_keys[_i];
        var _count = _history[$ _task];
        if (_count > _max_count) {
            _max_count = _count;
            _dominant_task = _task;
        }
    }
    
    // Map dominant task to personality (requires 5+ tasks of that type)
    var _old_personality = _inst.automaton_data.personality;
    if (_max_count >= 5) {
        switch (_dominant_task) {
            case "SALVAGE":       _inst.automaton_data.personality = "Curious";    break;
            case "PATROL":        _inst.automaton_data.personality = "Loyal";      break;
            case "COMBAT":        _inst.automaton_data.personality = "Brave";      break;
            case "MAINTENANCE":   _inst.automaton_data.personality = "Diligent";   break;
            case "TRADE":         _inst.automaton_data.personality = "Friendly";   break;
            case "CONSTRUCTION":  _inst.automaton_data.personality = "Industrious";break;
            case "GENERAL_LABOR": _inst.automaton_data.personality = "Helpful";    break;
            case "HAULING":       _inst.automaton_data.personality = "Sturdy";     break;
            default:              _inst.automaton_data.personality = "Neutral";    break;
        }
    }
    
    if (_old_personality != _inst.automaton_data.personality && _max_count >= 5) {
        show_debug_message("INFO: Automaton " + _instance_id + " personality evolved: " 
            + _old_personality + " -> " + _inst.automaton_data.personality);
        // event_fire("automaton_personality_changed", { instance_id: _instance_id })
    }
}

/// @func automaton_get_personality_bonus(_instance_id)
/// @desc Returns stat bonuses from personality development.
/// @param {string} _instance_id
/// @returns {struct} Bonus multipliers { efficiency, speed, damage, detection, diplomacy, etc. }
function automaton_get_personality_bonus(_instance_id) {
    var _bonus = {
        efficiency: 1.0,
        speed: 1.0,
        damage: 1.0,
        detection: 1.0,
        diplomacy: 1.0,
        thoroughness: 1.0,
        carry_capacity: 1.0
    };
    
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return _bonus;
    if (!variable_struct_exists(_inst, "automaton_data")) return _bonus;
    
    var _personality = _inst.automaton_data.personality;
    
    switch (_personality) {
        case "Curious":     _bonus.efficiency = 1.15; break;    // Better salvage yields
        case "Loyal":       _bonus.detection = 1.2;   break;    // Better patrol detection
        case "Brave":       _bonus.damage = 1.15;     break;    // More combat damage
        case "Diligent":    _bonus.thoroughness = 1.2; break;   // Better maintenance
        case "Friendly":    _bonus.diplomacy = 1.15;   break;   // Better trade deals
        case "Industrious": _bonus.speed = 1.15;       break;   // Faster construction
        case "Helpful":     _bonus.speed = 1.1;        break;   // Faster general labor
        case "Sturdy":      _bonus.carry_capacity = 1.2; break; // More hauling
    }
    
    return _bonus;
}

// ============================================================================
// DAILY UPDATE (Called by time_advance_day)
// ============================================================================

/// @func automaton_daily_update()
/// @desc Processes daily automaton tasks — generates resources, completes trade runs, etc.
///       Called as part of the daily update cycle in time_advance_day().
function automaton_daily_update() {
    var _all = machine_get_by_category("AUTOMATON");
    
    for (var _i = 0; _i < array_length(_all); _i++) {
        var _id = _all[_i];
        var _inst = machine_get(_id);
        if (_inst == undefined) continue;
        if (_inst.status != "OPERATIONAL") continue;
        if (!variable_struct_exists(_inst, "automaton_data")) continue;
        
        var _task = _inst.automaton_data.current_task;
        if (_task.type == "IDLE") continue;
        
        var _bonus = automaton_get_personality_bonus(_id);
        
        switch (_task.type) {
            case "SALVAGE":
                // Generate resources based on efficiency and target location
                var _base_yield = 3;
                var _effective_yield = floor(_base_yield * _bonus.efficiency);
                // Would add items to a collection queue: 
                // salvage_queue_add(_task.params.target_location, _effective_yield)
                show_debug_message("INFO: Automaton " + _id + " salvaged " 
                    + string(_effective_yield) + " items.");
                break;
                
            case "MAINTENANCE":
                // Auto-maintain assigned machines
                var _machines_maintained = 0;
                var _base_stats = global.machine_data[$ _inst.blueprint_id].base_stats;
                var _max_machines = floor(_base_stats.machines_per_day * _bonus.thoroughness);
                // Would call maintenance functions on assigned machines
                show_debug_message("INFO: Automaton " + _id + " maintained up to " 
                    + string(_max_machines) + " machines.");
                break;
                
            case "TRADE":
                // Process trade run (off-screen simulation)
                var _profit = floor(10 * _bonus.diplomacy);
                // Would add money: global.player_money += _profit
                show_debug_message("INFO: Automaton " + _id + " trade run earned " 
                    + string(_profit) + " coins.");
                break;
                
            case "PATROL":
                // Patrol increases early warning for raids
                // raid_extend_warning(floor(1 * _bonus.detection))
                show_debug_message("INFO: Automaton " + _id + " patrolling. Detection: x" 
                    + string(_bonus.detection));
                break;
        }
        
        // Increment completed tasks counter
        _inst.automaton_data.total_tasks_completed++;
    }
}

// ============================================================================
// AI CORE INTERFACE HELPERS
// ============================================================================

/// @func automaton_get_all()
/// @desc Returns array of all automaton instance IDs.
/// @returns {array<string>}
function automaton_get_all() {
    return machine_get_by_category("AUTOMATON");
}

/// @func automaton_get_summary(_instance_id)
/// @desc Returns a display-friendly summary of an automaton's state.
/// @param {string} _instance_id
/// @returns {struct} Summary for UI display
function automaton_get_summary(_instance_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return {};
    
    var _task = automaton_get_task(_instance_id);
    var _personality = "Neutral";
    var _total_tasks = 0;
    
    if (variable_struct_exists(_inst, "automaton_data")) {
        _personality = _inst.automaton_data.personality;
        _total_tasks = _inst.automaton_data.total_tasks_completed;
    }
    
    return {
        instance_id: _instance_id,
        name: _inst.custom_name,
        blueprint_id: _inst.blueprint_id,
        mark: _inst.mark,
        quality: _inst.quality_rating,
        status: _inst.status,
        personality: _personality,
        current_task: _task.type,
        lubrication: _inst.meters.lubrication,
        fuel: _inst.meters.fuel_level,
        total_tasks: _total_tasks
    };
}
