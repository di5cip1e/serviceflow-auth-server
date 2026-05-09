/// scr_economy_system.gml
/// Shop system, dynamic pricing, trade routes, and automaton trade runs.
/// Objective #37: Economy & Trade System
///
/// Dependencies: scr_data, scr_inventory, scr_automaton_system, scr_machine_system
/// Global data: global.shops (loaded shop definitions)
///              global.trade_routes (loaded trade route definitions)
///              global.economy_state (pricing, route status, trade run tracking)

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func economy_system_init()
/// @desc Loads shop and trade route data. Called during data_load_all().
function economy_system_init() {
    // Load shop definitions
    global.shops = data_load_file("data/economy/shops.json");
    if (global.shops != undefined && variable_struct_exists(global.shops, "_meta")) {
        variable_struct_remove(global.shops, "_meta");
    }
    
    // Load trade route definitions
    global.trade_routes = data_load_file("data/economy/trade_routes.json");
    if (global.trade_routes != undefined && variable_struct_exists(global.trade_routes, "_meta")) {
        variable_struct_remove(global.trade_routes, "_meta");
    }
    
    // Initialize economy state
    global.economy_state = {
        // Dynamic pricing modifiers per item (1.0 = base price)
        price_modifiers: {},
        // Active shortage events: item_id -> { multiplier, days_remaining }
        shortage_events: {},
        // Surplus tracking: item_id -> quantity_sold_this_season
        surplus_tracking: {},
        // Unlocked trade routes
        unlocked_routes: {},
        // Active automaton trade runs: instance_id -> { route_id, days_remaining, departed_day }
        active_trade_runs: {},
        // Season tracking for price resets
        last_price_reset_season: -1
    };
    
    show_debug_message("INFO: Economy system initialized.");
}

// ============================================================================
// SHOP SYSTEM
// ============================================================================

/// @func shop_get_inventory(_shop_id)
/// @desc Returns the available inventory for a shop, factoring in unlocked trade routes.
/// @param {string} _shop_id  "gus_general", "ferris_parts", "hank_smithy"
/// @returns {array} Array of { item_id, base_price, current_price, stock, category }
function shop_get_inventory(_shop_id) {
    if (global.shops == undefined) return [];
    if (!variable_struct_exists(global.shops, _shop_id)) return [];
    
    var _shop = global.shops[$ _shop_id];
    var _result = [];
    
    // Base inventory
    if (variable_struct_exists(_shop, "base_inventory")) {
        var _items = _shop.base_inventory;
        for (var _i = 0; _i < array_length(_items); _i++) {
            var _item = _items[_i];
            var _current_price = shop_calculate_price(_item.item_id, _item.base_price, "BUY");
            array_push(_result, {
                item_id: _item.item_id,
                base_price: _item.base_price,
                current_price: _current_price,
                stock: _item.stock,
                category: _item.category,
                source: "base"
            });
        }
    }
    
    // Trade route bonus inventory
    if (variable_struct_exists(_shop, "trade_route_inventory")) {
        var _route_items = _shop.trade_route_inventory;
        for (var _i = 0; _i < array_length(_route_items); _i++) {
            var _ri = _route_items[_i];
            // Only available if the required trade route is unlocked
            if (variable_struct_exists(global.economy_state.unlocked_routes, _ri.requires_route)) {
                var _current_price = shop_calculate_price(_ri.item_id, _ri.base_price, "BUY");
                array_push(_result, {
                    item_id: _ri.item_id,
                    base_price: _ri.base_price,
                    current_price: _current_price,
                    stock: _ri.stock,
                    category: _ri.category,
                    source: "trade_route:" + _ri.requires_route
                });
            }
        }
    }
    
    return _result;
}

/// @func shop_calculate_price(_item_id, _base_price, _transaction_type)
/// @desc Calculates current price with dynamic modifiers.
/// @param {string} _item_id
/// @param {int} _base_price  Base price from shop definition
/// @param {string} _transaction_type  "BUY" or "SELL"
/// @returns {int} Current price (floored)
function shop_calculate_price(_item_id, _base_price, _transaction_type) {
    var _price = _base_price;
    
    // Apply dynamic price modifier
    if (variable_struct_exists(global.economy_state.price_modifiers, _item_id)) {
        _price *= global.economy_state.price_modifiers[$ _item_id];
    }
    
    // Apply shortage event multiplier (buy prices go UP)
    if (variable_struct_exists(global.economy_state.shortage_events, _item_id)) {
        var _shortage = global.economy_state.shortage_events[$ _item_id];
        if (_shortage.days_remaining > 0) {
            _price *= _shortage.multiplier;
        }
    }
    
    // Apply surplus discount (buy prices go DOWN if player has been selling a lot)
    if (_transaction_type == "BUY" && variable_struct_exists(global.economy_state.surplus_tracking, _item_id)) {
        var _sold = global.economy_state.surplus_tracking[$ _item_id];
        if (_sold > 20) {
            _price *= 0.85; // 15% discount if market is flooded
        } else if (_sold > 10) {
            _price *= 0.92; // 8% discount
        }
    }
    
    // Sell prices are always lower than buy (60% of buy price)
    if (_transaction_type == "SELL") {
        _price *= 0.6;
    }
    
    return max(1, floor(_price));
}

/// @func shop_buy_item(_shop_id, _item_id, _quantity)
/// @desc Player buys items from a shop.
/// @param {string} _shop_id
/// @param {string} _item_id
/// @param {int} _quantity
/// @returns {struct} { success: bool, total_cost: int, reason: string }
function shop_buy_item(_shop_id, _item_id, _quantity) {
    var _result = { success: false, total_cost: 0, reason: "" };
    
    // Find the item in shop inventory
    var _inventory = shop_get_inventory(_shop_id);
    var _shop_item = undefined;
    for (var _i = 0; _i < array_length(_inventory); _i++) {
        if (_inventory[_i].item_id == _item_id) {
            _shop_item = _inventory[_i];
            break;
        }
    }
    
    if (_shop_item == undefined) {
        _result.reason = "Item not available in this shop.";
        return _result;
    }
    
    // Check stock
    if (_shop_item.stock >= 0 && _quantity > _shop_item.stock) {
        _result.reason = "Insufficient stock.";
        return _result;
    }
    
    // Calculate total cost
    var _total = _shop_item.current_price * _quantity;
    
    // Check player money
    if (!variable_struct_exists(global, "player_money") || global.player_money < _total) {
        _result.reason = "Not enough coins.";
        return _result;
    }
    
    // Execute transaction
    global.player_money -= _total;
    // inventory_add_item(global.player_inventory, _item_id, _quantity);
    
    _result.success = true;
    _result.total_cost = _total;
    
    show_debug_message("INFO: Bought " + string(_quantity) + "x " + _item_id 
        + " for " + string(_total) + " coins from " + _shop_id);
    
    return _result;
}

/// @func shop_sell_item(_shop_id, _item_id, _quantity)
/// @desc Player sells items to a shop.
/// @param {string} _shop_id
/// @param {string} _item_id
/// @param {int} _quantity
/// @returns {struct} { success: bool, total_earned: int, reason: string }
function shop_sell_item(_shop_id, _item_id, _quantity) {
    var _result = { success: false, total_earned: 0, reason: "" };
    
    // Check player has the items
    // var _have = inventory_count_item(global.player_inventory, _item_id);
    // if (_have < _quantity) { _result.reason = "Not enough items."; return _result; }
    
    // Get sell price (use base price of 10 if not in shop — generic sell)
    var _base = 10;
    var _inventory = shop_get_inventory(_shop_id);
    for (var _i = 0; _i < array_length(_inventory); _i++) {
        if (_inventory[_i].item_id == _item_id) {
            _base = _inventory[_i].base_price;
            break;
        }
    }
    
    var _sell_price = shop_calculate_price(_item_id, _base, "SELL");
    var _total = _sell_price * _quantity;
    
    // Execute
    // inventory_remove_item(global.player_inventory, _item_id, _quantity);
    global.player_money += _total;
    
    // Track surplus
    if (!variable_struct_exists(global.economy_state.surplus_tracking, _item_id)) {
        global.economy_state.surplus_tracking[$ _item_id] = 0;
    }
    global.economy_state.surplus_tracking[$ _item_id] += _quantity;
    
    _result.success = true;
    _result.total_earned = _total;
    
    show_debug_message("INFO: Sold " + string(_quantity) + "x " + _item_id 
        + " for " + string(_total) + " coins to " + _shop_id);
    
    return _result;
}

// ============================================================================
// DYNAMIC PRICING
// ============================================================================

/// @func economy_daily_update()
/// @desc Called daily by time_advance_day(). Ticks shortage events, resets seasonal surplus.
function economy_daily_update() {
    // Tick shortage events
    var _shortage_keys = variable_struct_get_names(global.economy_state.shortage_events);
    for (var _i = 0; _i < array_length(_shortage_keys); _i++) {
        var _key = _shortage_keys[_i];
        var _event = global.economy_state.shortage_events[$ _key];
        _event.days_remaining--;
        if (_event.days_remaining <= 0) {
            variable_struct_remove(global.economy_state.shortage_events, _key);
            show_debug_message("INFO: Shortage event ended for " + _key);
        }
    }
    
    // Reset surplus tracking each season
    if (global.time_season != global.economy_state.last_price_reset_season) {
        global.economy_state.surplus_tracking = {};
        global.economy_state.last_price_reset_season = global.time_season;
        show_debug_message("INFO: Seasonal surplus tracking reset.");
    }
    
    // Random shortage event (2% daily chance per eligible item)
    var _shortage_items = ["item_copper_ore", "item_iron_ore", "item_coal", "item_oil_canister", "item_aetheric_ore"];
    for (var _i = 0; _i < array_length(_shortage_items); _i++) {
        var _item = _shortage_items[_i];
        if (!variable_struct_exists(global.economy_state.shortage_events, _item)) {
            if (random(1) < 0.02) {
                global.economy_state.shortage_events[$ _item] = {
                    multiplier: 1.5 + random(1.0), // 1.5x to 2.5x price spike
                    days_remaining: irandom_range(3, 7)
                };
                show_debug_message("INFO: SHORTAGE EVENT: " + _item + " prices spiked!");
                // event_fire("shortage_event", { item_id: _item })
            }
        }
    }
}

// ============================================================================
// TRADE ROUTES
// ============================================================================

/// @func trade_route_unlock(_route_id)
/// @desc Unlocks a trade route, adding new inventory to shops.
/// @param {string} _route_id
/// @returns {bool} True if newly unlocked
function trade_route_unlock(_route_id) {
    if (variable_struct_exists(global.economy_state.unlocked_routes, _route_id)) {
        return false; // Already unlocked
    }
    
    global.economy_state.unlocked_routes[$ _route_id] = {
        unlocked_date: {
            year: global.time_year,
            season: global.time_season,
            day: global.time_day
        }
    };
    
    show_debug_message("INFO: Trade route unlocked: " + _route_id);
    // event_fire("trade_route_unlocked", { route_id: _route_id })
    return true;
}

/// @func trade_route_is_unlocked(_route_id)
/// @returns {bool}
function trade_route_is_unlocked(_route_id) {
    return variable_struct_exists(global.economy_state.unlocked_routes, _route_id);
}

// ============================================================================
// AUTOMATON TRADE RUNS
// ============================================================================

/// @func trade_run_start(_automaton_id, _route_id)
/// @desc Dispatches an automaton on a trade run. Requires Cargo Hauler/Zeppelin.
/// @param {string} _automaton_id  Automaton or vehicle machine instance ID
/// @param {string} _route_id  Trade route to follow
/// @returns {struct} { success: bool, reason: string, estimated_return_days: int }
function trade_run_start(_automaton_id, _route_id) {
    var _result = { success: false, reason: "", estimated_return_days: 0 };
    
    // Validate automaton/vehicle
    var _inst = machine_get(_automaton_id);
    if (_inst == undefined) {
        _result.reason = "Unknown machine.";
        return _result;
    }
    if (_inst.status != "OPERATIONAL") {
        _result.reason = "Machine not operational.";
        return _result;
    }
    
    // Validate route is unlocked
    if (!trade_route_is_unlocked(_route_id)) {
        _result.reason = "Trade route not unlocked.";
        return _result;
    }
    
    // Get route data
    if (global.trade_routes == undefined || !variable_struct_exists(global.trade_routes, _route_id)) {
        _result.reason = "Unknown trade route.";
        return _result;
    }
    var _route = global.trade_routes[$ _route_id];
    
    // Check if already on a run
    if (variable_struct_exists(global.economy_state.active_trade_runs, _automaton_id)) {
        _result.reason = "Already on a trade run.";
        return _result;
    }
    
    // Start the run
    var _current_day = global.time_year * 120 + global.time_season * 30 + global.time_day;
    global.economy_state.active_trade_runs[$ _automaton_id] = {
        route_id: _route_id,
        days_remaining: _route.round_trip_days,
        departed_day: _current_day,
        cargo_value: 0
    };
    
    // Load cargo from inventory (if vehicle has carry capacity)
    var _carry = 0;
    var _base = undefined;
    if (variable_struct_exists(global.machine_data, _inst.blueprint_id)) {
        _base = global.machine_data[$ _inst.blueprint_id];
    }
    if (_base != undefined && variable_struct_exists(_base.base_stats, "carry_capacity")) {
        _carry = _base.base_stats.carry_capacity;
    }
    
    _result.success = true;
    _result.estimated_return_days = _route.round_trip_days;
    
    show_debug_message("INFO: Trade run started: " + _automaton_id + " on route " + _route_id 
        + " (" + string(_route.round_trip_days) + " day round trip)");
    
    return _result;
}

/// @func trade_run_daily_update()
/// @desc Processes active trade runs. Called daily by time_advance_day().
function trade_run_daily_update() {
    var _run_keys = variable_struct_get_names(global.economy_state.active_trade_runs);
    
    for (var _i = 0; _i < array_length(_run_keys); _i++) {
        var _id = _run_keys[_i];
        var _run = global.economy_state.active_trade_runs[$ _id];
        
        _run.days_remaining--;
        
        if (_run.days_remaining <= 0) {
            // Trade run complete — generate profit and goods
            trade_run_complete(_id, _run);
            variable_struct_remove(global.economy_state.active_trade_runs, _id);
        }
    }
}

/// @func trade_run_complete(_automaton_id, _run_data)
/// @desc Completes a trade run. Generates profit and rare goods.
/// @param {string} _automaton_id
/// @param {struct} _run_data
function trade_run_complete(_automaton_id, _run_data) {
    var _route = global.trade_routes[$ _run_data.route_id];
    if (_route == undefined) return;
    
    // Get automaton personality bonus for trade
    var _bonus = automaton_get_personality_bonus(_automaton_id);
    var _diplomacy_mult = _bonus.diplomacy;
    
    // Calculate profit
    var _base_profit = _route.base_profit;
    var _profit = floor(_base_profit * _diplomacy_mult);
    global.player_money += _profit;
    
    // Generate rare goods
    var _goods = [];
    if (variable_struct_exists(_route, "possible_goods")) {
        for (var _i = 0; _i < array_length(_route.possible_goods); _i++) {
            var _good = _route.possible_goods[_i];
            if (random(1) <= _good.chance * _diplomacy_mult) {
                var _qty = irandom_range(_good.quantity_min, _good.quantity_max);
                // inventory_add_item(global.player_inventory, _good.item_id, _qty);
                array_push(_goods, { item_id: _good.item_id, quantity: _qty });
            }
        }
    }
    
    show_debug_message("INFO: Trade run complete! " + _automaton_id + " returned with " 
        + string(_profit) + " coins and " + string(array_length(_goods)) + " goods.");
    
    // event_fire("trade_run_complete", { 
    //     automaton_id: _automaton_id, 
    //     profit: _profit, 
    //     goods: _goods 
    // })
}

// ============================================================================
// SAVE/LOAD
// ============================================================================

/// @func economy_serialize()
/// @returns {struct}
function economy_serialize() {
    return {
        economy_state: global.economy_state
    };
}

/// @func economy_deserialize(_data)
/// @param {struct} _data
function economy_deserialize(_data) {
    global.economy_state = _data.economy_state;
    show_debug_message("INFO: Economy state restored.");
}
