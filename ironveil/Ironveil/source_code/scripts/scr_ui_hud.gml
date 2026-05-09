/// scr_ui_hud.gml
/// Heads-Up Display rendering: clock, money, energy meter, tool hotbar, raid info.
/// Objective #27: Core UI Suite
///
/// Dependencies: scr_time_system, scr_inventory, scr_energy, scr_raid_system
/// Drawn in Draw GUI event. Uses native 320×240 resolution coordinates.

#macro HUD_FONT_SMALL fnt_hud_small
#macro HUD_FONT_MEDIUM fnt_hud_medium
#macro HUD_COLOR_TEXT make_colour_rgb(240, 235, 220)
#macro HUD_COLOR_BG make_colour_rgb(30, 25, 20)
#macro HUD_COLOR_ENERGY make_colour_rgb(80, 200, 255)
#macro HUD_COLOR_ENERGY_LOW make_colour_rgb(255, 80, 60)
#macro HUD_PADDING 4
#macro HUD_HOTBAR_SLOTS 5
#macro HUD_HOTBAR_SLOT_SIZE 20

// ============================================================================
// MAIN HUD DRAW
// ============================================================================

/// @func hud_draw()
/// @desc Master HUD draw function. Called in Draw GUI event.
function hud_draw() {
    // Only draw in gameplay states
    if (global.game_state != GAME_STATE.GAMEPLAY 
        && global.game_state != GAME_STATE.RAID
        && global.game_state != GAME_STATE.EXPLORATION) {
        return;
    }
    
    var _gui_w = display_get_gui_width();
    var _gui_h = display_get_gui_height();
    
    // Top-left: Clock / Date / Season / Weather
    hud_draw_clock(HUD_PADDING, HUD_PADDING);
    
    // Top-right: Money
    hud_draw_money(_gui_w - HUD_PADDING, HUD_PADDING);
    
    // Bottom-left: Energy meter
    hud_draw_energy(HUD_PADDING, _gui_h - HUD_PADDING);
    
    // Bottom-right: Tool hotbar
    hud_draw_hotbar(_gui_w - HUD_PADDING, _gui_h - HUD_PADDING);
    
    // Top-center: Raid info (only during raids)
    if (global.game_state == GAME_STATE.RAID && global.raid_state.active) {
        hud_draw_raid_info(_gui_w / 2, HUD_PADDING);
    }
}

// ============================================================================
// CLOCK / DATE / WEATHER
// ============================================================================

/// @func hud_draw_clock(_x, _y)
/// @desc Draws the time, date, season, and weather icon in the top-left.
/// @param {real} _x  Top-left X
/// @param {real} _y  Top-left Y
function hud_draw_clock(_x, _y) {
    var _hour = global.time_hour;
    var _minute = global.time_minute;
    var _day = global.time_day;
    var _season_names = ["Spring", "Summer", "Autumn", "Winter"];
    var _season = _season_names[global.time_season];
    var _weather_icons = { CLEAR: "☀", CLOUDY: "☁", RAIN: "🌧", STORM: "⛈", SNOW: "❄", FOG: "🌫" };
    
    // Background panel
    var _panel_w = 80;
    var _panel_h = 24;
    draw_set_alpha(0.7);
    draw_set_colour(HUD_COLOR_BG);
    draw_roundrect_ext(_x, _y, _x + _panel_w, _y + _panel_h, 3, 3, false);
    draw_set_alpha(1.0);
    
    // Time text
    draw_set_font(HUD_FONT_SMALL);
    draw_set_colour(HUD_COLOR_TEXT);
    draw_set_halign(fa_left);
    draw_set_valign(fa_top);
    
    var _hour_str = string(_hour);
    if (_hour < 10) _hour_str = "0" + _hour_str;
    var _min_str = string(_minute);
    if (_minute < 10) _min_str = "0" + _min_str;
    
    draw_text(_x + 3, _y + 2, _hour_str + ":" + _min_str);
    
    // Date and season
    draw_text(_x + 3, _y + 12, _season + " " + string(_day));
    
    // Weather icon
    var _weather_str = "";
    if (variable_struct_exists(_weather_icons, global.time_weather)) {
        _weather_str = _weather_icons[$ global.time_weather];
    }
    draw_set_halign(fa_right);
    draw_text(_x + _panel_w - 3, _y + 2, _weather_str);
    
    draw_set_halign(fa_left);
}

// ============================================================================
// MONEY DISPLAY
// ============================================================================

/// @func hud_draw_money(_x, _y)
/// @desc Draws the money counter in the top-right.
/// @param {real} _x  Top-right X
/// @param {real} _y  Top-right Y
function hud_draw_money(_x, _y) {
    var _money_str = string(global.player_money) + "g";
    
    draw_set_font(HUD_FONT_SMALL);
    var _tw = string_width(_money_str) + 16; // 16 for coin icon
    var _th = 14;
    
    // Background
    draw_set_alpha(0.7);
    draw_set_colour(HUD_COLOR_BG);
    draw_roundrect_ext(_x - _tw - 4, _y, _x, _y + _th, 3, 3, false);
    draw_set_alpha(1.0);
    
    // Coin icon placeholder
    draw_set_colour(make_colour_rgb(220, 190, 50));
    draw_circle(_x - _tw, _y + _th / 2, 4, false);
    
    // Money text
    draw_set_colour(HUD_COLOR_TEXT);
    draw_set_halign(fa_right);
    draw_text(_x - 3, _y + 1, _money_str);
    draw_set_halign(fa_left);
}

// ============================================================================
// ENERGY METER
// ============================================================================

/// @func hud_draw_energy(_x, _y)
/// @desc Draws the energy gauge in the bottom-left, styled as an aether gauge.
/// @param {real} _x  Bottom-left X
/// @param {real} _y  Bottom-left Y (bottom edge)
function hud_draw_energy(_x, _y) {
    var _bar_w = 60;
    var _bar_h = 8;
    var _by = _y - _bar_h - 12; // Position above bottom edge
    
    var _pct = clamp(global.player_energy / global.player_energy_max, 0, 1);
    var _color = (_pct > 0.25) ? HUD_COLOR_ENERGY : HUD_COLOR_ENERGY_LOW;
    
    // Background
    draw_set_alpha(0.7);
    draw_set_colour(HUD_COLOR_BG);
    draw_roundrect_ext(_x, _by - 2, _x + _bar_w + 6, _by + _bar_h + 12, 3, 3, false);
    draw_set_alpha(1.0);
    
    // Label
    draw_set_font(HUD_FONT_SMALL);
    draw_set_colour(HUD_COLOR_TEXT);
    draw_text(_x + 3, _by, "Energy");
    
    // Bar background
    draw_set_colour(make_colour_rgb(40, 35, 30));
    draw_rectangle(_x + 3, _by + 10, _x + 3 + _bar_w, _by + 10 + _bar_h, false);
    
    // Bar fill
    draw_set_colour(_color);
    draw_rectangle(_x + 3, _by + 10, _x + 3 + floor(_bar_w * _pct), _by + 10 + _bar_h, false);
    
    // Numeric value
    draw_set_colour(HUD_COLOR_TEXT);
    draw_set_halign(fa_center);
    draw_text(_x + 3 + _bar_w / 2, _by + 10, string(floor(global.player_energy)));
    draw_set_halign(fa_left);
}

// ============================================================================
// TOOL HOTBAR
// ============================================================================

/// @func hud_draw_hotbar(_x, _y)
/// @desc Draws the active tool/item hotbar in the bottom-right.
/// @param {real} _x  Bottom-right X
/// @param {real} _y  Bottom-right Y (bottom edge)
function hud_draw_hotbar(_x, _y) {
    var _total_w = HUD_HOTBAR_SLOTS * (HUD_HOTBAR_SLOT_SIZE + 2) + 2;
    var _bx = _x - _total_w;
    var _by = _y - HUD_HOTBAR_SLOT_SIZE - 6;
    
    // Background
    draw_set_alpha(0.7);
    draw_set_colour(HUD_COLOR_BG);
    draw_roundrect_ext(_bx, _by, _x, _y, 3, 3, false);
    draw_set_alpha(1.0);
    
    // Draw slots
    for (var _i = 0; _i < HUD_HOTBAR_SLOTS; _i++) {
        var _sx = _bx + 2 + _i * (HUD_HOTBAR_SLOT_SIZE + 2);
        var _sy = _by + 2;
        
        // Slot background
        var _is_selected = (_i == global.player_hotbar_selected);
        draw_set_colour(_is_selected ? make_colour_rgb(80, 75, 60) : make_colour_rgb(50, 45, 35));
        draw_rectangle(_sx, _sy, _sx + HUD_HOTBAR_SLOT_SIZE, _sy + HUD_HOTBAR_SLOT_SIZE, false);
        
        // Selection highlight
        if (_is_selected) {
            draw_set_colour(make_colour_rgb(200, 180, 100));
            draw_rectangle(_sx, _sy, _sx + HUD_HOTBAR_SLOT_SIZE, _sy + HUD_HOTBAR_SLOT_SIZE, true);
        }
        
        // Draw item icon if slot is filled
        if (variable_struct_exists(global, "player_hotbar")) {
            if (_i < array_length(global.player_hotbar) && global.player_hotbar[_i] != "") {
                var _item_id = global.player_hotbar[_i];
                // draw_sprite_stretched(item_get_icon(_item_id), 0, _sx+1, _sy+1, 
                //     HUD_HOTBAR_SLOT_SIZE-2, HUD_HOTBAR_SLOT_SIZE-2);
            }
        }
        
        // Slot number
        draw_set_font(HUD_FONT_SMALL);
        draw_set_colour(make_colour_rgb(150, 145, 130));
        draw_text(_sx + 1, _sy + 1, string(_i + 1));
    }
}

// ============================================================================
// RAID HUD OVERLAY
// ============================================================================

/// @func hud_draw_raid_info(_cx, _y)
/// @desc Draws raid-specific HUD info at top-center during active raids.
/// @param {real} _cx  Center X
/// @param {real} _y  Top Y
function hud_draw_raid_info(_cx, _y) {
    var _panel_w = 120;
    var _panel_h = 20;
    var _px = _cx - _panel_w / 2;
    
    // Background
    draw_set_alpha(0.8);
    draw_set_colour(make_colour_rgb(60, 15, 15));
    draw_roundrect_ext(_px, _y, _px + _panel_w, _y + _panel_h, 3, 3, false);
    draw_set_alpha(1.0);
    
    // Raid info text
    draw_set_font(HUD_FONT_SMALL);
    draw_set_colour(make_colour_rgb(255, 200, 200));
    draw_set_halign(fa_center);
    
    var _phase = global.raid_state.phase;
    var _wave = global.raid_state.current_wave;
    var _total = global.raid_state.total_waves;
    var _alive = global.raid_state.enemies_alive;
    
    draw_text(_cx, _y + 2, "RAID — " + _phase);
    draw_text(_cx, _y + 11, "Wave " + string(_wave) + "/" + string(_total) + " | " + string(_alive) + " enemies");
    
    draw_set_halign(fa_left);
}
