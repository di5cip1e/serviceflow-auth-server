/// scr_ui_map.gml
/// World map with fog of war, location icons, and fast travel.
/// Objective #27: Core UI Suite
///
/// Dependencies: scr_exploration_system, scr_room_data
/// Note: The journal Map tab uses journal_draw_map() for inline display.
///       This script provides the full-screen dedicated map interface.

/// @func map_screen_init()
/// @desc Opens the full-screen world map.
function map_screen_init() {
    global.map_ui = {
        active: true,
        zoom: 1.0,
        pan_x: 0,
        pan_y: 0,
        selected_location: "",
        fast_travel_available: false
    };
}

/// @func map_screen_draw()
/// @desc Draws the full-screen world map.
function map_screen_draw() {
    if (!global.map_ui.active) return;
    
    var _gui_w = display_get_gui_width();
    var _gui_h = display_get_gui_height();
    var _ui = global.map_ui;
    
    // Full background
    draw_set_colour(make_colour_rgb(25, 22, 18));
    draw_rectangle(0, 0, _gui_w, _gui_h, false);
    
    // Map title
    draw_set_font(HUD_FONT_MEDIUM);
    draw_set_colour(INV_TEXT_COLOR);
    draw_set_halign(fa_center);
    draw_text(_gui_w / 2, 4, "WORLD MAP");
    draw_set_halign(fa_left);
    
    // Map area
    var _map_x = 10;
    var _map_y = 20;
    var _map_w = _gui_w - 20;
    var _map_h = _gui_h - 40;
    
    // Map background (parchment style)
    draw_set_colour(make_colour_rgb(55, 48, 38));
    draw_rectangle(_map_x, _map_y, _map_x + _map_w, _map_y + _map_h, false);
    
    // Grid for reference
    draw_set_colour(make_colour_rgb(65, 58, 48));
    for (var _gx = _map_x; _gx <= _map_x + _map_w; _gx += 20) {
        draw_line(_gx, _map_y, _gx, _map_y + _map_h);
    }
    for (var _gy = _map_y; _gy <= _map_y + _map_h; _gy += 20) {
        draw_line(_map_x, _gy, _map_x + _map_w, _gy);
    }
    
    // Define known world locations (positions are conceptual map coordinates)
    var _locations = [
        { id: "coppervale",       name: "Coppervale",           mx: 0.35, my: 0.45, always_visible: true,  fast_travel: true },
        { id: "the_hollow",       name: "The Hollow",           mx: 0.55, my: 0.45, always_visible: false, fast_travel: false },
        { id: "rustwood_edge",    name: "Rustwood Edge",        mx: 0.45, my: 0.70, always_visible: false, fast_travel: false },
        { id: "ashspine_foothills",name: "Ashspine Foothills",  mx: 0.40, my: 0.15, always_visible: false, fast_travel: false },
        { id: "shattered_coast",  name: "Shattered Coast",      mx: 0.10, my: 0.50, always_visible: false, fast_travel: false },
        { id: "old_mill_ruins",   name: "Old Mill Ruins",       mx: 0.65, my: 0.30, always_visible: false, fast_travel: false }
    ];
    
    draw_set_font(HUD_FONT_SMALL);
    
    for (var _i = 0; _i < array_length(_locations); _i++) {
        var _loc = _locations[_i];
        
        // Check if discovered
        var _discovered = _loc.always_visible;
        if (!_discovered && variable_struct_exists(global.exploration_state, _loc.id)) {
            _discovered = true;
        }
        
        if (!_discovered) continue;
        
        var _lx = _map_x + _loc.mx * _map_w;
        var _ly = _map_y + _loc.my * _map_h;
        
        // Location marker
        var _is_selected = (_ui.selected_location == _loc.id);
        var _marker_color = _loc.always_visible ? make_colour_rgb(220, 190, 80) : make_colour_rgb(160, 150, 120);
        
        if (_is_selected) {
            // Selection ring
            draw_set_colour(make_colour_rgb(255, 230, 100));
            draw_circle(_lx, _ly, 6, true);
        }
        
        draw_set_colour(_marker_color);
        draw_circle(_lx, _ly, 4, false);
        
        // Location name
        draw_set_colour(INV_TEXT_COLOR);
        draw_set_halign(fa_center);
        draw_text(_lx, _ly + 6, _loc.name);
        draw_set_halign(fa_left);
        
        // Fast travel indicator
        if (_loc.fast_travel && _is_selected) {
            draw_set_colour(make_colour_rgb(100, 200, 100));
            draw_text(_lx - 20, _ly + 16, "[ENTER] Travel");
        }
    }
    
    // Draw fog of war overlay for unexplored regions
    // Represented as darker patches between known locations
    draw_set_alpha(0.4);
    draw_set_colour(make_colour_rgb(20, 18, 15));
    // Would draw fog patches for undiscovered areas
    draw_set_alpha(1.0);
    
    // Player position indicator
    var _player_loc = "coppervale"; // Would come from current room lookup
    for (var _i = 0; _i < array_length(_locations); _i++) {
        if (_locations[_i].id == _player_loc) {
            var _plx = _map_x + _locations[_i].mx * _map_w;
            var _ply = _map_y + _locations[_i].my * _map_h;
            draw_set_colour(make_colour_rgb(100, 200, 255));
            draw_triangle(_plx - 3, _ply - 8, _plx + 3, _ply - 8, _plx, _ply - 3, false);
            break;
        }
    }
    
    // Controls hint
    draw_set_font(HUD_FONT_SMALL);
    draw_set_colour(INV_CATEGORY_INACTIVE);
    draw_set_halign(fa_center);
    draw_text(_gui_w / 2, _gui_h - 12, "←→: Select | ENTER: Travel | ESC: Close");
    draw_set_halign(fa_left);
}

/// @func map_screen_input()
/// @desc Handles input for the world map.
function map_screen_input() {
    if (!global.map_ui.active) return;
    
    // Close
    if (keyboard_check_pressed(vk_escape) || keyboard_check_pressed(ord("M"))) {
        global.map_ui.active = false;
    }
    
    // Fast travel (if selected location supports it)
    if (keyboard_check_pressed(vk_enter) && global.map_ui.selected_location != "") {
        // room_transition(target_room, target_pos);
        show_debug_message("INFO: Fast travel to " + global.map_ui.selected_location);
    }
}
