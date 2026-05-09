/// scr_ui_inventory.gml
/// Grid-based inventory screen with categories and item details.
/// Objective #27: Core UI Suite
///
/// Dependencies: scr_inventory, scr_data
/// Drawn in Draw GUI event when sub-state is MENU_OVERLAY with inventory active.

#macro INV_COLS 8
#macro INV_ROWS 3
#macro INV_SLOT_SIZE 28
#macro INV_SLOT_GAP 2
#macro INV_PANEL_BG make_colour_rgb(35, 30, 25)
#macro INV_SLOT_BG make_colour_rgb(50, 45, 38)
#macro INV_SLOT_HOVER make_colour_rgb(70, 65, 50)
#macro INV_SLOT_SELECTED make_colour_rgb(90, 80, 55)
#macro INV_TEXT_COLOR make_colour_rgb(240, 235, 220)
#macro INV_CATEGORY_ACTIVE make_colour_rgb(200, 180, 100)
#macro INV_CATEGORY_INACTIVE make_colour_rgb(130, 125, 110)

enum INV_TAB {
    ALL        = 0,
    MATERIALS  = 1,
    TOOLS      = 2,
    FOOD       = 3,
    KEY_ITEMS  = 4
}

/// @func inventory_screen_init()
/// @desc Initializes inventory screen state. Called when opening inventory.
function inventory_screen_init() {
    global.inv_ui = {
        active: true,
        current_tab: INV_TAB.ALL,
        selected_slot: -1,
        hovered_slot: -1,
        scroll_offset: 0,
        filtered_items: []
    };
    
    inventory_screen_filter();
}

/// @func inventory_screen_filter()
/// @desc Filters inventory items based on current category tab.
function inventory_screen_filter() {
    var _ui = global.inv_ui;
    _ui.filtered_items = [];
    
    // Get all items from player inventory
    var _all_items = inventory_get_all(); // Returns array of { item_id, quantity }
    
    for (var _i = 0; _i < array_length(_all_items); _i++) {
        var _item = _all_items[_i];
        var _item_data = data_get_item(_item.item_id);
        if (_item_data == undefined) continue;
        
        var _include = false;
        switch (_ui.current_tab) {
            case INV_TAB.ALL:       _include = true; break;
            case INV_TAB.MATERIALS: _include = (_item_data.category == "MATERIAL" || _item_data.category == "ORE" || _item_data.category == "COMPONENT"); break;
            case INV_TAB.TOOLS:     _include = (_item_data.category == "TOOL" || _item_data.category == "EQUIPMENT"); break;
            case INV_TAB.FOOD:      _include = (_item_data.category == "FOOD" || _item_data.category == "DRINK"); break;
            case INV_TAB.KEY_ITEMS: _include = (_item_data.category == "KEY" || _item_data.category == "QUEST"); break;
        }
        
        if (_include) {
            array_push(_ui.filtered_items, _item);
        }
    }
    
    _ui.selected_slot = -1;
    _ui.scroll_offset = 0;
}

/// @func inventory_screen_draw()
/// @desc Draws the full inventory screen. Called in Draw GUI.
function inventory_screen_draw() {
    if (!global.inv_ui.active) return;
    
    var _gui_w = display_get_gui_width();
    var _gui_h = display_get_gui_height();
    
    // Full-screen darkened backdrop
    draw_set_alpha(0.6);
    draw_set_colour(c_black);
    draw_rectangle(0, 0, _gui_w, _gui_h, false);
    draw_set_alpha(1.0);
    
    // Main panel dimensions
    var _panel_w = 280;
    var _panel_h = 200;
    var _px = (_gui_w - _panel_w) / 2;
    var _py = (_gui_h - _panel_h) / 2;
    
    // Panel background
    draw_set_colour(INV_PANEL_BG);
    draw_roundrect_ext(_px, _py, _px + _panel_w, _py + _panel_h, 4, 4, false);
    
    // Title
    draw_set_font(HUD_FONT_MEDIUM);
    draw_set_colour(INV_TEXT_COLOR);
    draw_set_halign(fa_center);
    draw_text(_px + _panel_w / 2, _py + 4, "INVENTORY");
    draw_set_halign(fa_left);
    
    // Category tabs
    var _tab_names = ["All", "Materials", "Tools", "Food", "Key"];
    var _tab_y = _py + 20;
    var _tab_x = _px + 8;
    draw_set_font(HUD_FONT_SMALL);
    
    for (var _t = 0; _t < array_length(_tab_names); _t++) {
        var _is_active = (_t == global.inv_ui.current_tab);
        draw_set_colour(_is_active ? INV_CATEGORY_ACTIVE : INV_CATEGORY_INACTIVE);
        draw_text(_tab_x, _tab_y, _tab_names[_t]);
        _tab_x += string_width(_tab_names[_t]) + 8;
    }
    
    // Item grid
    var _grid_x = _px + 8;
    var _grid_y = _tab_y + 14;
    var _items = global.inv_ui.filtered_items;
    
    for (var _row = 0; _row < INV_ROWS; _row++) {
        for (var _col = 0; _col < INV_COLS; _col++) {
            var _slot = _row * INV_COLS + _col + global.inv_ui.scroll_offset;
            var _sx = _grid_x + _col * (INV_SLOT_SIZE + INV_SLOT_GAP);
            var _sy = _grid_y + _row * (INV_SLOT_SIZE + INV_SLOT_GAP);
            
            // Slot background
            var _bg_col = INV_SLOT_BG;
            if (_slot == global.inv_ui.selected_slot) _bg_col = INV_SLOT_SELECTED;
            else if (_slot == global.inv_ui.hovered_slot) _bg_col = INV_SLOT_HOVER;
            
            draw_set_colour(_bg_col);
            draw_rectangle(_sx, _sy, _sx + INV_SLOT_SIZE, _sy + INV_SLOT_SIZE, false);
            
            // Draw item if slot has one
            if (_slot < array_length(_items)) {
                var _item = _items[_slot];
                // draw_sprite_stretched(item_get_icon(_item.item_id), 0, 
                //     _sx + 2, _sy + 2, INV_SLOT_SIZE - 4, INV_SLOT_SIZE - 4);
                
                // Quantity badge
                if (_item.quantity > 1) {
                    draw_set_font(HUD_FONT_SMALL);
                    draw_set_colour(INV_TEXT_COLOR);
                    draw_set_halign(fa_right);
                    draw_text(_sx + INV_SLOT_SIZE - 1, _sy + INV_SLOT_SIZE - 10, string(_item.quantity));
                    draw_set_halign(fa_left);
                }
            }
        }
    }
    
    // Item detail panel (right side)
    var _detail_x = _grid_x + INV_COLS * (INV_SLOT_SIZE + INV_SLOT_GAP) + 8;
    var _detail_y = _grid_y;
    var _detail_w = _panel_w - (_detail_x - _px) - 8;
    
    if (global.inv_ui.selected_slot >= 0 && global.inv_ui.selected_slot < array_length(_items)) {
        var _sel_item = _items[global.inv_ui.selected_slot];
        var _sel_data = data_get_item(_sel_item.item_id);
        
        if (_sel_data != undefined) {
            // Item name
            draw_set_font(HUD_FONT_SMALL);
            draw_set_colour(INV_CATEGORY_ACTIVE);
            draw_text(_detail_x, _detail_y, _sel_data.name);
            
            // Description (word-wrapped)
            draw_set_colour(INV_TEXT_COLOR);
            draw_text_ext(_detail_x, _detail_y + 12, _sel_data.description, 10, _detail_w);
            
            // Stack count and sell price
            draw_set_colour(INV_CATEGORY_INACTIVE);
            draw_text(_detail_x, _detail_y + 60, "Qty: " + string(_sel_item.quantity));
            if (variable_struct_exists(_sel_data, "sell_price")) {
                draw_text(_detail_x, _detail_y + 72, "Sell: " + string(_sel_data.sell_price) + "g");
            }
        }
    }
    
    // Close hint
    draw_set_font(HUD_FONT_SMALL);
    draw_set_colour(INV_CATEGORY_INACTIVE);
    draw_set_halign(fa_center);
    draw_text(_px + _panel_w / 2, _py + _panel_h - 12, "Press ESC to close");
    draw_set_halign(fa_left);
}

/// @func inventory_screen_input()
/// @desc Handles input for the inventory screen. Called each step.
function inventory_screen_input() {
    if (!global.inv_ui.active) return;
    
    // Tab switching with Q/E or number keys
    if (keyboard_check_pressed(ord("Q"))) {
        global.inv_ui.current_tab = max(0, global.inv_ui.current_tab - 1);
        inventory_screen_filter();
    }
    if (keyboard_check_pressed(ord("E"))) {
        global.inv_ui.current_tab = min(4, global.inv_ui.current_tab + 1);
        inventory_screen_filter();
    }
    
    // Close
    if (keyboard_check_pressed(vk_escape) || keyboard_check_pressed(ord("I"))) {
        global.inv_ui.active = false;
        // Return to FREE_ROAM sub-state
        // game_set_sub_state(GAMEPLAY_SUB.FREE_ROAM);
    }
}
