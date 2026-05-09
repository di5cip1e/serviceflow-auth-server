/// scr_loading_screen.gml
/// Loading screens for boot sequence and room transitions.
/// Objective #45: Polish Pass
///
/// Dependencies: scr_data (for lore tips loading)

// ============================================================================
// MACROS
// ============================================================================

#macro LOADING_BG_COLOR       make_colour_rgb(15, 12, 8)
#macro LOADING_TEXT_COLOR      make_colour_rgb(240, 235, 220)
#macro LOADING_BAR_BG          make_colour_rgb(40, 35, 28)
#macro LOADING_BAR_FILL        make_colour_rgb(180, 165, 120)
#macro LOADING_GEAR_COLOR      make_colour_rgb(120, 110, 85)
#macro LOADING_BAR_W           200
#macro LOADING_BAR_H           8
#macro LOADING_GEAR_SPEED      2     // Degrees per frame

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func loading_screen_init()
/// @desc Initialize loading screen system. Call during boot.
function loading_screen_init() {
    global.loading = {
        active: false,
        type: "boot",        // "boot" or "transition"
        progress: 0,         // 0.0 to 1.0
        gear_angle: 0,
        lore_tips: [],
        current_tip: "",
        tip_index: 0
    };
    
    // Load lore tips
    var _tips_data = data_load_file("data/config/lore_tips.json");
    if (_tips_data != undefined) {
        if (variable_struct_exists(_tips_data, "tips")) {
            global.loading.lore_tips = _tips_data.tips;
        }
    }
    
    // Fallback tips if file not found
    if (array_length(global.loading.lore_tips) == 0) {
        global.loading.lore_tips = [
            "Coppervale was founded by survivors who believed in building, not fighting.",
            "The Sundering destroyed 90% of the Old World's infrastructure in a single day.",
            "DEJIN stands for Distributed Electronic Joint Intelligence Network.",
            "Aetheric Ore is the key to Pre-War technology — handle with care.",
            "Captain Harrow served in three campaigns before finding Coppervale.",
            "The Rusty Gear Tavern has never closed, even during raids.",
            "Machines need maintenance. A well-oiled turret fires twice as fast.",
            "Every Remembrance Day, Coppervale lights lanterns for those who came before.",
            "Old Maren's husband Oren was the first engineer of Coppervale.",
            "The Iron Marauders unified under the Marshal in just two years.",
            "Spark once tried to add 17 gears to a coupling. The record is still 14.",
            "Trade routes bring more than goods — they bring hope.",
            "The Grand Spire was once the tallest building on the continent.",
            "Pip's scrap collection contains at least three items of genuine historical value.",
            "A mech's legs are its most vulnerable component. Protect them."
        ];
    }
    
    show_debug_message("INFO: Loading screen initialized (" 
        + string(array_length(global.loading.lore_tips)) + " lore tips)");
}

// ============================================================================
// LIFECYCLE
// ============================================================================

/// @func loading_screen_start(_type)
/// @desc Begin showing a loading screen.
/// @param {string} _type  "boot" or "transition"
function loading_screen_start(_type) {
    global.loading.active = true;
    global.loading.type = _type;
    global.loading.progress = 0;
    global.loading.gear_angle = 0;
    
    // Pick a random lore tip
    if (array_length(global.loading.lore_tips) > 0) {
        global.loading.tip_index = irandom(array_length(global.loading.lore_tips) - 1);
        global.loading.current_tip = global.loading.lore_tips[global.loading.tip_index];
    }
}

/// @func loading_screen_update(_progress)
/// @desc Update loading progress.
/// @param {real} _progress  0.0 to 1.0
function loading_screen_update(_progress) {
    global.loading.progress = clamp(_progress, 0, 1);
}

/// @func loading_screen_end()
/// @desc Hide the loading screen.
function loading_screen_end() {
    global.loading.active = false;
}

// ============================================================================
// DRAWING
// ============================================================================

/// @func loading_screen_draw()
/// @desc Draw the loading screen. Call from Draw GUI event.
function loading_screen_draw() {
    if (!global.loading.active) return;
    
    var _gui_w = display_get_gui_width();
    var _gui_h = display_get_gui_height();
    var _cx = _gui_w / 2;
    var _cy = _gui_h / 2;
    
    // Full-screen background
    draw_set_colour(LOADING_BG_COLOR);
    draw_rectangle(0, 0, _gui_w, _gui_h, false);
    
    if (global.loading.type == "boot") {
        // === BOOT LOADING SCREEN ===
        
        // Title
        draw_set_colour(LOADING_TEXT_COLOR);
        draw_set_halign(fa_center);
        draw_set_valign(fa_middle);
        draw_set_font(HUD_FONT_LARGE);
        draw_text(_cx, _cy - 60, "IRONVEIL");
        
        // Subtitle
        draw_set_font(HUD_FONT_SMALL);
        draw_set_alpha(0.6);
        draw_text(_cx, _cy - 35, "A Post-Apocalyptic Steampunk Tale");
        draw_set_alpha(1.0);
        
        // Animated gear spinner
        _loading_draw_gear(_cx, _cy + 10, 20);
        
        // Progress bar
        var _bar_x = _cx - LOADING_BAR_W / 2;
        var _bar_y = _cy + 45;
        draw_set_colour(LOADING_BAR_BG);
        draw_roundrect_ext(_bar_x, _bar_y, _bar_x + LOADING_BAR_W, _bar_y + LOADING_BAR_H, 3, 3, false);
        draw_set_colour(LOADING_BAR_FILL);
        var _fill_w = LOADING_BAR_W * global.loading.progress;
        if (_fill_w > 2) {
            draw_roundrect_ext(_bar_x, _bar_y, _bar_x + _fill_w, _bar_y + LOADING_BAR_H, 3, 3, false);
        }
        
        // Progress percentage
        draw_set_colour(LOADING_TEXT_COLOR);
        draw_set_font(HUD_FONT_SMALL);
        draw_text(_cx, _bar_y + LOADING_BAR_H + 15, string(round(global.loading.progress * 100)) + "%");
        
        // Version (bottom right)
        draw_set_halign(fa_right);
        draw_set_valign(fa_bottom);
        draw_set_alpha(0.4);
        draw_text(_gui_w - 8, _gui_h - 8, "M4 Release Candidate");
        draw_set_alpha(1.0);
        
    } else {
        // === ROOM TRANSITION LOADING SCREEN ===
        
        // Smaller gear spinner (center)
        _loading_draw_gear(_cx, _cy - 15, 14);
        
        // Lore tip
        draw_set_colour(LOADING_TEXT_COLOR);
        draw_set_halign(fa_center);
        draw_set_valign(fa_middle);
        draw_set_font(HUD_FONT_SMALL);
        draw_set_alpha(0.8);
        
        // Word-wrap the tip
        var _tip_text = global.loading.current_tip;
        draw_text_ext(_cx, _cy + 20, _tip_text, 16, _gui_w * 0.7);
        draw_set_alpha(1.0);
    }
    
    // Reset draw state
    draw_set_halign(fa_left);
    draw_set_valign(fa_top);
    draw_set_font(-1);
}

/// @func _loading_draw_gear(_x, _y, _radius)
/// @desc Draws an animated steampunk gear spinner.
function _loading_draw_gear(_x, _y, _radius) {
    global.loading.gear_angle += LOADING_GEAR_SPEED;
    if (global.loading.gear_angle >= 360) global.loading.gear_angle -= 360;
    
    var _teeth = 8;
    var _inner_r = _radius * 0.6;
    var _angle = global.loading.gear_angle;
    
    draw_set_colour(LOADING_GEAR_COLOR);
    
    // Draw gear teeth
    for (var _i = 0; _i < _teeth; _i++) {
        var _a = _angle + (_i * 360 / _teeth);
        var _x1 = _x + lengthdir_x(_inner_r, _a);
        var _y1 = _y + lengthdir_y(_inner_r, _a);
        var _x2 = _x + lengthdir_x(_radius, _a - 10);
        var _y2 = _y + lengthdir_y(_radius, _a - 10);
        var _x3 = _x + lengthdir_x(_radius, _a + 10);
        var _y3 = _y + lengthdir_y(_radius, _a + 10);
        draw_triangle(_x1, _y1, _x2, _y2, _x3, _y3, false);
    }
    
    // Draw inner circle
    draw_circle(_x, _y, _inner_r, false);
    
    // Draw center hole
    draw_set_colour(LOADING_BG_COLOR);
    draw_circle(_x, _y, _inner_r * 0.4, false);
}
