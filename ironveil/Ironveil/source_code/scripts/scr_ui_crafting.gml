/// scr_ui_crafting.gml
/// Three-panel crafting interface: recipe list, details/requirements, preview.
/// Objective #27: Core UI Suite
///
/// Dependencies: scr_blueprint_system, scr_inventory, scr_workshop
/// Drawn in Draw GUI when interacting with a workshop station.

/// @func crafting_screen_init(_station_type)
/// @desc Initializes the crafting interface for a specific station.
/// @param {string} _station_type  "FORGE", "WORKBENCH", "FABRICATOR", "ASSEMBLY", "REFINERY"
function crafting_screen_init(_station_type) {
    global.craft_ui = {
        active: true,
        station_type: _station_type,
        available_recipes: [],
        selected_index: 0,
        scroll_offset: 0,
        can_craft: false
    };
    
    crafting_screen_refresh_recipes();
}

/// @func crafting_screen_refresh_recipes()
/// @desc Rebuilds the list of available recipes for the current station.
function crafting_screen_refresh_recipes() {
    var _ui = global.craft_ui;
    _ui.available_recipes = [];
    
    var _bp_keys = variable_struct_get_names(global.blueprint_data);
    for (var _i = 0; _i < array_length(_bp_keys); _i++) {
        var _bp = global.blueprint_data[$ _bp_keys[_i]];
        
        // Filter by station type
        if (_bp.station_required != _ui.station_type) continue;
        
        // Check station level
        // var _station_level = workshop_get_station_level(_ui.station_type);
        // if (_bp.station_level_required > _station_level) continue;
        
        // Include both discovered and undiscovered (undiscovered shown as ???)
        var _is_discovered = blueprint_is_discovered(_bp_keys[_i]);
        
        array_push(_ui.available_recipes, {
            blueprint_id: _bp_keys[_i],
            blueprint_data: _bp,
            discovered: _is_discovered
        });
    }
    
    _ui.selected_index = clamp(_ui.selected_index, 0, max(0, array_length(_ui.available_recipes) - 1));
}

/// @func crafting_screen_draw()
/// @desc Draws the three-panel crafting interface.
function crafting_screen_draw() {
    if (!global.craft_ui.active) return;
    
    var _gui_w = display_get_gui_width();
    var _gui_h = display_get_gui_height();
    var _ui = global.craft_ui;
    
    // Backdrop
    draw_set_alpha(0.6);
    draw_set_colour(c_black);
    draw_rectangle(0, 0, _gui_w, _gui_h, false);
    draw_set_alpha(1.0);
    
    // Main panel
    var _panel_w = 300;
    var _panel_h = 210;
    var _px = (_gui_w - _panel_w) / 2;
    var _py = (_gui_h - _panel_h) / 2;
    
    draw_set_colour(INV_PANEL_BG);
    draw_roundrect_ext(_px, _py, _px + _panel_w, _py + _panel_h, 4, 4, false);
    
    // Title
    draw_set_font(HUD_FONT_MEDIUM);
    draw_set_colour(INV_TEXT_COLOR);
    draw_set_halign(fa_center);
    draw_text(_px + _panel_w / 2, _py + 4, _ui.station_type + " STATION");
    draw_set_halign(fa_left);
    
    // === LEFT PANEL: Recipe list ===
    var _left_x = _px + 4;
    var _left_y = _py + 20;
    var _left_w = 90;
    var _list_h = _panel_h - 40;
    
    // Recipe list background
    draw_set_colour(make_colour_rgb(40, 35, 28));
    draw_rectangle(_left_x, _left_y, _left_x + _left_w, _left_y + _list_h, false);
    
    draw_set_font(HUD_FONT_SMALL);
    var _visible_count = floor(_list_h / 12);
    
    for (var _i = 0; _i < _visible_count; _i++) {
        var _idx = _i + _ui.scroll_offset;
        if (_idx >= array_length(_ui.available_recipes)) break;
        
        var _recipe = _ui.available_recipes[_idx];
        var _ry = _left_y + 2 + _i * 12;
        
        // Selection highlight
        if (_idx == _ui.selected_index) {
            draw_set_colour(INV_SLOT_SELECTED);
            draw_rectangle(_left_x + 1, _ry - 1, _left_x + _left_w - 1, _ry + 10, false);
        }
        
        // Recipe name
        if (_recipe.discovered) {
            draw_set_colour(INV_TEXT_COLOR);
            draw_text(_left_x + 3, _ry, _recipe.blueprint_data.name);
        } else {
            draw_set_colour(INV_CATEGORY_INACTIVE);
            draw_text(_left_x + 3, _ry, "??? (Locked)");
        }
    }
    
    // === CENTER PANEL: Requirements & craft button ===
    var _center_x = _left_x + _left_w + 6;
    var _center_y = _left_y;
    var _center_w = 110;
    
    if (_ui.selected_index >= 0 && _ui.selected_index < array_length(_ui.available_recipes)) {
        var _sel = _ui.available_recipes[_ui.selected_index];
        
        if (_sel.discovered) {
            var _bp = _sel.blueprint_data;
            
            // Blueprint name
            draw_set_colour(INV_CATEGORY_ACTIVE);
            draw_set_font(HUD_FONT_SMALL);
            draw_text(_center_x, _center_y, _bp.name);
            
            // Description
            draw_set_colour(INV_TEXT_COLOR);
            draw_text_ext(_center_x, _center_y + 12, _bp.description, 10, _center_w);
            
            // Required components (Mk1)
            var _comp_y = _center_y + 48;
            draw_set_colour(INV_CATEGORY_ACTIVE);
            draw_text(_center_x, _comp_y, "Components:");
            _comp_y += 12;
            
            if (variable_struct_exists(_bp.marks, "mk1")) {
                var _components = _bp.marks.mk1.components;
                _ui.can_craft = true;
                
                for (var _c = 0; _c < array_length(_components); _c++) {
                    var _comp = _components[_c];
                    var _comp_data = data_get_item(_comp.component_id);
                    var _comp_name = (_comp_data != undefined) ? _comp_data.name : _comp.component_id;
                    var _have = inventory_count(_comp.component_id);
                    var _need = _comp.quantity;
                    
                    var _has_enough = (_have >= _need);
                    if (!_has_enough) _ui.can_craft = false;
                    
                    draw_set_colour(_has_enough ? make_colour_rgb(100, 200, 100) : make_colour_rgb(200, 80, 80));
                    draw_text(_center_x + 4, _comp_y, _comp_name + " " + string(_have) + "/" + string(_need));
                    _comp_y += 10;
                }
            }
            
            // Build time
            if (_bp.first_build_days > 0) {
                draw_set_colour(INV_CATEGORY_INACTIVE);
                draw_text(_center_x, _comp_y + 4, "Build time: " + string(_bp.first_build_days) + " day(s)");
            }
            
            // CRAFT button
            var _btn_y = _left_y + _list_h - 18;
            var _btn_color = _ui.can_craft ? make_colour_rgb(60, 140, 60) : make_colour_rgb(80, 75, 65);
            draw_set_colour(_btn_color);
            draw_roundrect_ext(_center_x, _btn_y, _center_x + _center_w, _btn_y + 16, 3, 3, false);
            
            draw_set_colour(_ui.can_craft ? INV_TEXT_COLOR : INV_CATEGORY_INACTIVE);
            draw_set_halign(fa_center);
            draw_text(_center_x + _center_w / 2, _btn_y + 2, "CRAFT");
            draw_set_halign(fa_left);
        } else {
            draw_set_colour(INV_CATEGORY_INACTIVE);
            draw_text(_center_x, _center_y, "Blueprint not yet");
            draw_text(_center_x, _center_y + 12, "discovered.");
            draw_text(_center_x, _center_y + 30, "Explore the world");
            draw_text(_center_x, _center_y + 42, "to find blueprints.");
        }
    }
    
    // === RIGHT PANEL: Preview ===
    var _right_x = _center_x + _center_w + 6;
    var _right_y = _left_y;
    var _right_w = _panel_w - (_right_x - _px) - 4;
    var _right_h = _list_h;
    
    // Preview background
    draw_set_colour(make_colour_rgb(45, 40, 32));
    draw_rectangle(_right_x, _right_y, _right_x + _right_w, _right_y + _right_h, false);
    
    if (_ui.selected_index >= 0 && _ui.selected_index < array_length(_ui.available_recipes)) {
        var _sel = _ui.available_recipes[_ui.selected_index];
        if (_sel.discovered) {
            // Draw blueprint icon/preview centered in panel
            // draw_sprite_ext(sprite_get(_sel.blueprint_data.icon), 0, 
            //     _right_x + _right_w/2, _right_y + _right_h/2, 2, 2, 0, c_white, 1.0);
            
            // Tier label
            draw_set_font(HUD_FONT_SMALL);
            draw_set_colour(INV_CATEGORY_ACTIVE);
            draw_set_halign(fa_center);
            draw_text(_right_x + _right_w / 2, _right_y + _right_h - 12, _sel.blueprint_data.tier_label);
            draw_set_halign(fa_left);
        }
    }
    
    // Close hint
    draw_set_font(HUD_FONT_SMALL);
    draw_set_colour(INV_CATEGORY_INACTIVE);
    draw_set_halign(fa_center);
    draw_text(_px + _panel_w / 2, _py + _panel_h - 10, "ESC: Close | ↑↓: Browse | ENTER: Craft");
    draw_set_halign(fa_left);
}

/// @func crafting_screen_input()
/// @desc Handles input for the crafting interface.
function crafting_screen_input() {
    if (!global.craft_ui.active) return;
    var _ui = global.craft_ui;
    
    // Navigate recipe list
    if (keyboard_check_pressed(vk_up)) {
        _ui.selected_index = max(0, _ui.selected_index - 1);
    }
    if (keyboard_check_pressed(vk_down)) {
        _ui.selected_index = min(array_length(_ui.available_recipes) - 1, _ui.selected_index + 1);
    }
    
    // Craft
    if (keyboard_check_pressed(vk_enter) && _ui.can_craft) {
        var _sel = _ui.available_recipes[_ui.selected_index];
        if (_sel.discovered) {
            // workshop_start_craft(_sel.blueprint_id, 1);
            show_debug_message("INFO: Crafting initiated: " + _sel.blueprint_id);
            crafting_screen_refresh_recipes();
        }
    }
    
    // Close
    if (keyboard_check_pressed(vk_escape)) {
        _ui.active = false;
    }
}
