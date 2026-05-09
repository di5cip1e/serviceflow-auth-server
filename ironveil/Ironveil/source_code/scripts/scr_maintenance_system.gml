/// scr_maintenance_system.gml
/// Daily maintenance cycle: depletion, breakdown detection, repair interactions.
/// Objective #21: Maintenance System
///
/// Dependencies: scr_machine_system, scr_data, scr_inventory_system, scr_time_system
/// Called by: time_advance_day() pipeline
/// Config: datafiles/data/config/balance.json (maintenance section)

// ============================================================================
// DAILY UPDATE — Called once per day advance
// ============================================================================

/// @func maintenance_daily_update()
/// @desc Processes daily depletion of lubrication, fuel, and part condition for all machines.
///       Checks for breakdowns. Updates machine statuses accordingly.
///       Called as part of time_advance_day() after time updates, before NPC schedules.
function maintenance_daily_update() {
    var _all_machines = machine_get_all();
    var _weather_mods = weather_get_gameplay_modifiers();
    var _breakdown_weather_mult = 1.0;
    
    // Dust storms and harsh weather increase breakdown chance
    if (variable_struct_exists(_weather_mods, "breakdown_modifier")) {
        _breakdown_weather_mult = _weather_mods.breakdown_modifier;
    }
    
    var _machines_needing_attention = 0;
    var _breakdowns_today = 0;
    
    for (var _i = 0; _i < array_length(_all_machines); _i++) {
        var _id = _all_machines[_i];
        var _inst = machine_get(_id);
        if (_inst == undefined) continue;
        
        // Skip walls — they don't need maintenance
        if (_inst.category == "WALL") continue;
        
        // Skip already broken down machines (they don't degrade further)
        if (_inst.status == "BROKEN_DOWN") continue;
        
        // Get base depletion rates from machine data
        var _base = global.machine_data[$ _inst.blueprint_id];
        if (_base == undefined) continue;
        
        // Increment age
        _inst.age_days++;
        
        // --- LUBRICATION DEPLETION ---
        var _lub_rate = _base.lubrication_rate_per_day;
        if (_lub_rate > 0) {
            // Slight random variance: ±20%
            var _lub_actual = _lub_rate * (0.8 + random(0.4));
            machine_update_meter(_id, "lubrication", -_lub_actual);
        }
        
        // --- FUEL DEPLETION ---
        // Only deplete fuel if machine is actively assigned/operational
        if (_inst.status == "OPERATIONAL") {
            var _fuel_rate = 0;
            if (variable_struct_exists(_base.base_stats, "fuel_consumption_per_day")) {
                _fuel_rate = _base.base_stats.fuel_consumption_per_day;
            }
            if (_fuel_rate > 0) {
                machine_update_meter(_id, "fuel_level", -_fuel_rate);
                
                // Power down if fuel is empty
                if (_inst.meters.fuel_level <= 0) {
                    machine_set_status(_id, "POWERED_DOWN");
                    show_debug_message("WARN: Machine " + _id + " powered down — out of fuel.");
                    continue; // Skip further checks
                }
            }
        }
        
        // --- PART CONDITION DEGRADATION ---
        var _deg_rate = _base.part_degradation_rate_per_day;
        if (_deg_rate > 0) {
            var _comp_count = array_length(_inst.installed_components);
            for (var _c = 0; _c < _comp_count; _c++) {
                // Each component degrades independently with random variance
                var _comp = _inst.installed_components[_c];
                if (_comp.component_id == "") continue; // Empty slot
                
                var _actual_deg = _deg_rate * (0.6 + random(0.8)); // ±40% variance
                machine_update_component_condition(_id, _c, -_actual_deg);
                
                // Component failure — triggers breakdown
                if (_comp.condition <= 0) {
                    _inst.installed_components[_c].condition = 0;
                    machine_set_status(_id, "BROKEN_DOWN");
                    _breakdowns_today++;
                    show_debug_message("WARN: Machine " + _id + " BREAKDOWN — component failed: " 
                        + _comp.slot);
                    // event_fire("machine_breakdown", { instance_id: _id, slot: _comp.slot })
                    break; // Only one breakdown per machine per day
                }
            }
        }
        
        // --- RANDOM BREAKDOWN CHECK ---
        if (_inst.status == "OPERATIONAL") {
            var _breakdown_occurred = maintenance_check_breakdown(_id, _breakdown_weather_mult);
            if (_breakdown_occurred) {
                _breakdowns_today++;
            }
        }
        
        // --- STATUS UPDATE ---
        if (_inst.status == "OPERATIONAL") {
            // Check if machine needs attention (low meters)
            if (_inst.meters.lubrication < 30 || _inst.meters.fuel_level < 20) {
                machine_set_status(_id, "NEEDS_MAINTENANCE");
                _machines_needing_attention++;
            }
            // Also check if any component is getting critically low
            var _critical_comp = false;
            for (var _c = 0; _c < array_length(_inst.installed_components); _c++) {
                if (_inst.installed_components[_c].component_id != "" 
                    && _inst.installed_components[_c].condition < 20) {
                    _critical_comp = true;
                    break;
                }
            }
            if (_critical_comp) {
                machine_set_status(_id, "NEEDS_MAINTENANCE");
                _machines_needing_attention++;
            }
        }
    }
    
    if (_breakdowns_today > 0 || _machines_needing_attention > 0) {
        show_debug_message("INFO: Daily maintenance — " 
            + string(_breakdowns_today) + " breakdowns, " 
            + string(_machines_needing_attention) + " need attention.");
    }
}

// ============================================================================
// BREAKDOWN MECHANICS
// ============================================================================

/// @func maintenance_check_breakdown(_instance_id, _weather_mult)
/// @desc Rolls for random breakdown. Chance modified by age, quality, maintenance, weather.
/// @param {string} _instance_id
/// @param {real} _weather_mult  Weather modifier (1.0 = normal, higher = worse)
/// @returns {bool} True if a breakdown occurred
function maintenance_check_breakdown(_instance_id, _weather_mult) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return false;
    
    // Base breakdown chance: 1-5% per day
    // From balance.json: base is 0.02 (2%)
    var _base_chance = global.balance.maintenance.base_breakdown_chance;
    
    // Age modifier: +0.1% per 10 days of age
    var _age_mod = (_inst.age_days / 10) * 0.001;
    
    // Quality modifier: lower quality = higher chance
    // Quality 1.0 = no modifier, 0.5 = +2% chance
    var _quality_mod = (1.0 - _inst.quality_rating) * 0.04;
    
    // Lubrication modifier: low oil = higher chance
    var _lub_mod = 0;
    if (_inst.meters.lubrication < 30) {
        _lub_mod = (30 - _inst.meters.lubrication) / 30 * 0.03; // Up to +3%
    }
    
    // Hidden defects modifier
    var _defect_mod = _inst.hidden_defects ? 0.05 : 0;
    
    // Total chance
    var _total_chance = (_base_chance + _age_mod + _quality_mod + _lub_mod + _defect_mod) * _weather_mult;
    _total_chance = clamp(_total_chance, 0.01, 0.15); // Cap at 1-15%
    
    // Roll
    if (random(1) < _total_chance) {
        // Pick a random component to fail
        var _comp_count = array_length(_inst.installed_components);
        if (_comp_count > 0) {
            var _idx = irandom(_comp_count - 1);
            // Only break components that exist and aren't already broken
            var _attempts = 0;
            while (_inst.installed_components[_idx].component_id == "" 
                   || _inst.installed_components[_idx].condition <= 0) {
                _idx = irandom(_comp_count - 1);
                _attempts++;
                if (_attempts > _comp_count * 2) return false; // No breakable components
            }
            
            _inst.installed_components[_idx].condition = 0;
            machine_set_status(_instance_id, "BROKEN_DOWN");
            
            show_debug_message("WARN: Random breakdown on " + _instance_id 
                + " — component: " + _inst.installed_components[_idx].slot 
                + " (chance was " + string(_total_chance * 100) + "%)");
            // event_fire("machine_breakdown", { instance_id: _instance_id, slot: _inst.installed_components[_idx].slot })
            return true;
        }
    }
    
    return false;
}

// ============================================================================
// DIAGNOSIS & REPAIR INTERACTIONS
// ============================================================================

/// @func maintenance_diagnose(_instance_id)
/// @desc Uses Scanner tool to identify which components are damaged or failed.
///       Requires player to have Scanner equipped.
/// @param {string} _instance_id
/// @returns {array} Array of { slot, component_id, condition, is_failed } for all components
function maintenance_diagnose(_instance_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return [];
    
    var _report = [];
    for (var _i = 0; _i < array_length(_inst.installed_components); _i++) {
        var _comp = _inst.installed_components[_i];
        if (_comp.component_id == "") continue;
        
        array_push(_report, {
            slot: _comp.slot,
            component_id: _comp.component_id,
            condition: _comp.condition,
            is_failed: (_comp.condition <= 0)
        });
    }
    
    // Energy cost for scanning
    energy_consume(ENERGY_COST_SCAN);
    
    return _report;
}

/// @func maintenance_oil(_instance_id)
/// @desc Uses Oil Can to restore a machine's lubrication meter to 100%.
///       Consumes 1 oil item from inventory.
/// @param {string} _instance_id
/// @returns {bool} True if oiling succeeded
function maintenance_oil(_instance_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return false;
    
    // Check player has oil
    if (!inventory_has_items(global.player_inventory, "item_machine_oil", 1)) {
        show_debug_message("WARN: maintenance_oil — No oil in inventory.");
        return false;
    }
    
    // Consume oil
    inventory_remove_item(global.player_inventory, "item_machine_oil", 1);
    
    // Restore lubrication
    _inst.meters.lubrication = 100.0;
    
    // Energy cost
    energy_consume(ENERGY_COST_TOOL_USE);
    
    // Update status if it was NEEDS_MAINTENANCE just for oil
    if (_inst.status == "NEEDS_MAINTENANCE" && _inst.meters.fuel_level > 20) {
        // Check if any components are also critical
        var _any_critical = false;
        for (var _c = 0; _c < array_length(_inst.installed_components); _c++) {
            if (_inst.installed_components[_c].component_id != "" 
                && _inst.installed_components[_c].condition < 20) {
                _any_critical = true;
                break;
            }
        }
        if (!_any_critical) {
            machine_set_status(_instance_id, "OPERATIONAL");
        }
    }
    
    show_debug_message("INFO: Machine " + _instance_id + " oiled. Lubrication: 100%");
    // event_fire("machine_oiled", { instance_id: _instance_id })
    return true;
}

/// @func maintenance_refuel(_instance_id, _fuel_item_id)
/// @desc Refuels a machine using an aether cell or fuel item.
/// @param {string} _instance_id
/// @param {string} _fuel_item_id  Fuel item to consume (e.g., "item_aether_cell")
/// @returns {bool} True if refueling succeeded
function maintenance_refuel(_instance_id, _fuel_item_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return false;
    
    // Check player has fuel item
    if (!inventory_has_items(global.player_inventory, _fuel_item_id, 1)) {
        show_debug_message("WARN: maintenance_refuel — No fuel item: " + _fuel_item_id);
        return false;
    }
    
    // Determine fuel restoration amount based on fuel item type
    var _restore_amount = 50; // Default
    switch (_fuel_item_id) {
        case "item_aether_cell_small":  _restore_amount = 30; break;
        case "item_aether_cell":        _restore_amount = 50; break;
        case "item_aether_cell_medium": _restore_amount = 75; break;
        case "item_aether_cell_large":  _restore_amount = 100; break;
        case "item_coal":               _restore_amount = 20; break;
    }
    
    // Consume fuel item
    inventory_remove_item(global.player_inventory, _fuel_item_id, 1);
    
    // Restore fuel
    machine_update_meter(_instance_id, "fuel_level", _restore_amount);
    
    // Energy cost
    energy_consume(ENERGY_COST_TOOL_USE);
    
    // If was powered down, restore to operational
    if (_inst.status == "POWERED_DOWN" && _inst.meters.fuel_level > 0) {
        machine_set_status(_instance_id, "OPERATIONAL");
    }
    
    show_debug_message("INFO: Machine " + _instance_id + " refueled +" 
        + string(_restore_amount) + "%. Now: " + string(_inst.meters.fuel_level) + "%");
    // event_fire("machine_refueled", { instance_id: _instance_id })
    return true;
}

/// @func maintenance_repair(_instance_id, _slot_index, _replacement_part_id)
/// @desc Replaces a broken/damaged component in a machine.
///       Requires player to use Wrench tool and have the replacement part.
/// @param {string} _instance_id
/// @param {int} _slot_index  Index of the component slot to repair
/// @param {string} _replacement_part_id  Item ID of the replacement component
/// @returns {bool} True if repair succeeded
function maintenance_repair(_instance_id, _slot_index, _replacement_part_id) {
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return false;
    
    // Validate slot index
    if (_slot_index < 0 || _slot_index >= array_length(_inst.installed_components)) {
        show_debug_message("WARN: maintenance_repair — Invalid slot index: " + string(_slot_index));
        return false;
    }
    
    // Check player has replacement part
    if (!inventory_has_items(global.player_inventory, _replacement_part_id, 1)) {
        show_debug_message("WARN: maintenance_repair — Missing part: " + _replacement_part_id);
        return false;
    }
    
    // Consume replacement part
    inventory_remove_item(global.player_inventory, _replacement_part_id, 1);
    
    // Install new component
    var _old_comp = _inst.installed_components[_slot_index];
    _inst.installed_components[_slot_index] = {
        slot: _old_comp.slot,
        component_id: _replacement_part_id,
        condition: 100.0
    };
    
    // Increment repair counter
    _inst.times_repaired++;
    
    // Energy cost
    energy_consume(ENERGY_COST_TOOL_USE);
    
    // Check if machine can be restored to operational
    // (all components must have condition > 0, fuel > 0)
    var _can_operate = true;
    for (var _c = 0; _c < array_length(_inst.installed_components); _c++) {
        var _comp = _inst.installed_components[_c];
        if (_comp.component_id != "" && _comp.condition <= 0) {
            _can_operate = false;
            break;
        }
    }
    
    if (_can_operate && _inst.meters.fuel_level > 0) {
        machine_set_status(_instance_id, "OPERATIONAL");
    } else if (_can_operate && _inst.meters.fuel_level <= 0) {
        machine_set_status(_instance_id, "POWERED_DOWN");
    }
    
    show_debug_message("INFO: Machine " + _instance_id + " repaired slot [" 
        + _old_comp.slot + "] with " + _replacement_part_id);
    // event_fire("machine_repaired", { instance_id: _instance_id, slot: _old_comp.slot })
    return true;
}

// ============================================================================
// VISUAL INDICATOR HELPERS
// ============================================================================

/// @func maintenance_get_warning_icons(_instance_id)
/// @desc Returns array of warning icon IDs to display on a machine.
/// @param {string} _instance_id
/// @returns {array<string>} Array of icon identifiers (e.g., ["oil", "fuel", "repair", "breakdown"])
function maintenance_get_warning_icons(_instance_id) {
    var _icons = [];
    var _inst = machine_get(_instance_id);
    if (_inst == undefined) return _icons;
    
    if (_inst.status == "BROKEN_DOWN") {
        array_push(_icons, "breakdown"); // ⚠️
        return _icons; // Breakdown overrides other warnings
    }
    
    if (_inst.meters.lubrication < 30) {
        array_push(_icons, "oil"); // 💧
    }
    
    if (_inst.meters.fuel_level < 20) {
        array_push(_icons, "fuel"); // ⚡
    }
    
    // Check for worn components
    for (var _c = 0; _c < array_length(_inst.installed_components); _c++) {
        var _comp = _inst.installed_components[_c];
        if (_comp.component_id != "" && _comp.condition < 30 && _comp.condition > 0) {
            array_push(_icons, "repair"); // 🔩
            break; // Only show one repair icon
        }
    }
    
    if (_inst.status == "POWERED_DOWN") {
        array_push(_icons, "no_power"); // 🔋
    }
    
    return _icons;
}
