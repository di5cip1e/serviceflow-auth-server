/// scr_mobile_ui.gml
/// Ironveil — Mobile UI Adaptation (Part of Objective #40)
/// Touch action buttons, scaled UI helpers, safe area management, settings screen.

// ============================================================================
// MACROS — TOUCH BUTTONS
// ============================================================================
#macro TOUCH_BTN_SIZE          48    // Base size in pixels (before scaling)
#macro TOUCH_BTN_GAP           8     // Gap between buttons (before scaling)
#macro TOUCH_BTN_MARGIN        12    // Margin from screen edge (before scaling)
#macro TOUCH_BTN_BG            make_colour_rgb(45, 40, 32)
#macro TOUCH_BTN_BG_PRESSED    make_colour_rgb(80, 72, 55)
#macro TOUCH_BTN_BORDER        make_colour_rgb(120, 110, 85)
#macro TOUCH_BTN_TEXT           make_colour_rgb(240, 235, 220)
#macro TOUCH_BTN_ALPHA         0.7

// ============================================================================
// MACROS — SETTINGS
// ============================================================================
#macro SETTINGS_SLIDER_W       180   // Base slider width (before scaling)
#macro SETTINGS_SLIDER_H       8     // Slider track height
#macro SETTINGS_HANDLE_R       6     // Slider handle radius
#macro SETTINGS_SLIDER_BG      make_colour_rgb(50, 45, 38)
#macro SETTINGS_SLIDER_FILL    make_colour_rgb(180, 165, 120)
#macro SETTINGS_SLIDER_HANDLE  make_colour_rgb(240, 235, 220)
#macro SETTINGS_LABEL_COLOR    make_colour_rgb(240, 235, 220)
#macro SETTINGS_BG_COLOR       make_colour_rgb(30, 25, 20)

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func mobile_ui_init()
/// @desc Initialize mobile UI state. Call after input_init().
function mobile_ui_init() {
    global.mobile_ui = {
        // Action buttons
        btn_action:    { x: 0, y: 0, w: 0, h: 0, pressed: false, label: "Act" },
        btn_secondary: { x: 0, y: 0, w: 0, h: 0, pressed: false, label: "Tool" },
        btn_cancel:    { x: 0, y: 0, w: 0, h: 0, pressed: false, label: "X" },
        hotbar_btns:   [],  // Array of 3 hotbar button rects
        
        // Context label for action button
        action_context: "Act"
    };
    
    // Calculate button positions
    _mobile_ui_layout_buttons();
    
    show_debug_message("[MOBILE_UI] Mobile UI initialized.");
}

/// @func _mobile_ui_layout_buttons()
/// @desc Calculate touch button positions based on screen size and scale.
function _mobile_ui_layout_buttons() {
    if (!global.is_mobile) return;
    
    var _s = global.ui_scale;
    var _gui_w = display_get_gui_width();
    var _gui_h = display_get_gui_height();
    var _btn_s = TOUCH_BTN_SIZE * _s;
    var _gap = TOUCH_BTN_GAP * _s;
    var _margin = TOUCH_BTN_MARGIN * _s + global.safe_area.right;
    var _bottom_margin = TOUCH_BTN_MARGIN * _s + global.safe_area.bottom;
    
    var _mu = global.mobile_ui;
    
    // Primary action button (large, bottom-right)
    var _action_size = _btn_s * 1.3;
    _mu.btn_action.w = _action_size;
    _mu.btn_action.h = _action_size;
    _mu.btn_action.x = _gui_w - _margin - _action_size;
    _mu.btn_action.y = _gui_h - _bottom_margin - _action_size;
    
    // Secondary action button (above primary)
    _mu.btn_secondary.w = _btn_s;
    _mu.btn_secondary.h = _btn_s;
    _mu.btn_secondary.x = _gui_w - _margin - _btn_s;
    _mu.btn_secondary.y = _mu.btn_action.y - _gap - _btn_s;
    
    // Cancel/Back button (top-right)
    _mu.btn_cancel.w = _btn_s * 0.8;
    _mu.btn_cancel.h = _btn_s * 0.8;
    _mu.btn_cancel.x = _gui_w - _margin - _mu.btn_cancel.w;
    _mu.btn_cancel.y = global.safe_area.top + _margin;
    
    // Hotbar buttons (3 slots, above secondary button)
    _mu.hotbar_btns = [];
    var _hb_size = _btn_s * 0.85;
    var _hb_start_y = _mu.btn_secondary.y - _gap - _hb_size;
    for (var _i = 0; _i < 3; _i++) {
        var _btn = {
            x: _gui_w - _margin - _hb_size,
            y: _hb_start_y - (_i * (_hb_size + _gap * 0.5)),
            w: _hb_size,
            h: _hb_size,
            pressed: false
        };
        array_push(_mu.hotbar_btns, _btn);
    }
}

// ============================================================================
// UPDATE
// ============================================================================

/// @func mobile_ui_update()
/// @desc Process touch input for mobile action buttons. Call each Step after input_update().
function mobile_ui_update() {
    if (!global.is_mobile) return;
    
    var _mu = global.mobile_ui;
    
    // Reset pressed states
    _mu.btn_action.pressed = false;
    _mu.btn_secondary.pressed = false;
    _mu.btn_cancel.pressed = false;
    for (var _i = 0; _i < array_length(_mu.hotbar_btns); _i++) {
        _mu.hotbar_btns[_i].pressed = false;
    }
    
    // Check touch points against buttons
    for (var _t = 0; _t < 5; _t++) {
        if (device_mouse_check_button_pressed(_t, mb_left)) {
            var _tx = device_mouse_x_to_gui(_t);
            var _ty = device_mouse_y_to_gui(_t);
            
            // Action button
            if (input_point_in_rect(_tx, _ty, _mu.btn_action.x, _mu.btn_action.y, _mu.btn_action.w, _mu.btn_action.h)) {
                _mu.btn_action.pressed = true;
                global.touch_buttons.action_pressed = true;
                sfx_play_ui("sfx_button_press");
            }
            
            // Secondary button
            if (input_point_in_rect(_tx, _ty, _mu.btn_secondary.x, _mu.btn_secondary.y, _mu.btn_secondary.w, _mu.btn_secondary.h)) {
                _mu.btn_secondary.pressed = true;
                global.touch_buttons.secondary_pressed = true;
                sfx_play_ui("sfx_button_press");
            }
            
            // Cancel button
            if (input_point_in_rect(_tx, _ty, _mu.btn_cancel.x, _mu.btn_cancel.y, _mu.btn_cancel.w, _mu.btn_cancel.h)) {
                _mu.btn_cancel.pressed = true;
                global.touch_buttons.cancel_pressed = true;
                sfx_play_ui("sfx_button_press");
            }
            
            // Hotbar buttons
            for (var _i = 0; _i < array_length(_mu.hotbar_btns); _i++) {
                var _hb = _mu.hotbar_btns[_i];
                if (input_point_in_rect(_tx, _ty, _hb.x, _hb.y, _hb.w, _hb.h)) {
                    _hb.pressed = true;
                    global.touch_buttons.hotbar_pressed = _i;
                    sfx_play_ui("sfx_button_press");
                }
            }
        }
    }
    
    // Update context label
    _mu.action_context = mobile_action_get_context();
    _mu.btn_action.label = _mu.action_context;
}

/// @func mobile_action_get_context()
/// @desc Determine context-sensitive label for the primary action button.
/// @returns {string}
function mobile_action_get_context() {
    // Check game state for appropriate action label
    if (variable_global_exists("game_state")) {
        if (global.game_state == "STATE_GAMEPLAY") {
            // Check if near an NPC
            if (variable_global_exists("nearby_npc") && global.nearby_npc != noone) {
                return "Talk";
            }
            // Check if near a station
            if (variable_global_exists("nearby_station") && global.nearby_station != "") {
                return "Use";
            }
            // Check if near an item
            if (variable_global_exists("nearby_item") && global.nearby_item != noone) {
                return "Pick Up";
            }
        }
    }
    return "Act";
}

// ============================================================================
// DRAWING
// ============================================================================

/// @func mobile_ui_draw()
/// @desc Draw all mobile touch buttons. Call in Draw GUI event, mobile only.
function mobile_ui_draw() {
    if (!global.is_mobile) return;
    
    var _mu = global.mobile_ui;
    
    // Draw action button (larger, with context label)
    _draw_touch_button(_mu.btn_action, true);
    
    // Draw secondary button
    _draw_touch_button(_mu.btn_secondary, false);
    
    // Draw cancel button
    _draw_touch_button(_mu.btn_cancel, false);
    
    // Draw hotbar buttons
    for (var _i = 0; _i < array_length(_mu.hotbar_btns); _i++) {
        var _hb = _mu.hotbar_btns[_i];
        var _slot_label = string(_i + 1);
        
        draw_set_alpha(TOUCH_BTN_ALPHA);
        draw_set_colour(_hb.pressed ? TOUCH_BTN_BG_PRESSED : TOUCH_BTN_BG);
        draw_roundrect_ext(_hb.x, _hb.y, _hb.x + _hb.w, _hb.y + _hb.h, 4, 4, false);
        
        draw_set_colour(TOUCH_BTN_BORDER);
        draw_roundrect_ext(_hb.x, _hb.y, _hb.x + _hb.w, _hb.y + _hb.h, 4, 4, true);
        
        draw_set_colour(TOUCH_BTN_TEXT);
        draw_set_halign(fa_center);
        draw_set_valign(fa_middle);
        draw_text(_hb.x + _hb.w / 2, _hb.y + _hb.h / 2, _slot_label);
        
        draw_set_alpha(1.0);
        draw_set_halign(fa_left);
        draw_set_valign(fa_top);
    }
}

/// @func _draw_touch_button(_btn, _is_primary)
/// @desc Draw a single touch button with label.
/// @param {struct} _btn          Button struct with x, y, w, h, pressed, label
/// @param {bool}   _is_primary   If true, use slightly different styling
function _draw_touch_button(_btn, _is_primary) {
    var _r = _is_primary ? 6 : 4;
    
    draw_set_alpha(TOUCH_BTN_ALPHA);
    draw_set_colour(_btn.pressed ? TOUCH_BTN_BG_PRESSED : TOUCH_BTN_BG);
    draw_roundrect_ext(_btn.x, _btn.y, _btn.x + _btn.w, _btn.y + _btn.h, _r, _r, false);
    
    draw_set_colour(TOUCH_BTN_BORDER);
    draw_roundrect_ext(_btn.x, _btn.y, _btn.x + _btn.w, _btn.y + _btn.h, _r, _r, true);
    
    draw_set_colour(TOUCH_BTN_TEXT);
    draw_set_halign(fa_center);
    draw_set_valign(fa_middle);
    draw_set_alpha(1.0);
    draw_text(_btn.x + _btn.w / 2, _btn.y + _btn.h / 2, _btn.label);
    
    draw_set_halign(fa_left);
    draw_set_valign(fa_top);
}

// ============================================================================
// SETTINGS SCREEN (Audio Volume Controls)
// ============================================================================

/// @func settings_screen_init()
/// @desc Open the settings screen with audio volume sliders + AI dialogue config.
function settings_screen_init() {
    global.settings_ui = {
        active: true,
        sliders: [
            { label: "Master",   channel: "master",   value: audio_manager_get_volume("master") },
            { label: "Music",    channel: "music",    value: audio_manager_get_volume("music") },
            { label: "Ambient",  channel: "ambient",  value: audio_manager_get_volume("ambient") },
            { label: "SFX",      channel: "sfx",      value: audio_manager_get_volume("sfx") },
            { label: "UI",       channel: "ui",       value: audio_manager_get_volume("ui") }
        ],
        selected: 0,
        dragging: -1,   // Slider index being dragged (-1 = none)
        
        // AI Dialogue section
        ai_section: {
            enabled: global.ai_dialogue.enabled,
            api_key_display: _settings_mask_key(global.ai_dialogue.api_key),
            api_key_editing: false,
            api_key_buffer: "",
            model: global.ai_dialogue.model,
            connected: global.ai_dialogue.connected,
            test_pending: false,
            remaining: ai_dialogue_get_remaining_requests()
        }
    };
    sfx_play_ui("sfx_menu_open");
}

/// @func _settings_mask_key(_key)
/// @desc Masks an API key for display, showing only first 6 and last 4 chars.
/// @param {string} _key
/// @returns {string}
function _settings_mask_key(_key) {
    if (string_length(_key) < 12) return (string_length(_key) > 0 ? "****" : "Not set");
    return string_copy(_key, 1, 6) + "..." + string_copy(_key, string_length(_key) - 3, 4);
}

/// @func settings_screen_draw()
/// @desc Draw the settings screen with volume sliders.
function settings_screen_draw() {
    if (!variable_global_exists("settings_ui")) return;
    if (!global.settings_ui.active) return;
    
    var _s = global.ui_scale;
    var _gui_w = display_get_gui_width();
    var _gui_h = display_get_gui_height();
    
    // Panel dimensions (expanded to fit AI Dialogue section)
    var _panel_w = 280 * _s;
    var _panel_h = 440 * _s;
    var _px = (_gui_w - _panel_w) / 2;
    var _py = (_gui_h - _panel_h) / 2;
    var _padding = 12 * _s;
    var _row_h = 32 * _s;
    
    // Background
    draw_set_alpha(0.85);
    draw_set_colour(SETTINGS_BG_COLOR);
    draw_roundrect_ext(_px, _py, _px + _panel_w, _py + _panel_h, 4, 4, false);
    draw_set_alpha(1.0);
    
    // Border
    draw_set_colour(TOUCH_BTN_BORDER);
    draw_roundrect_ext(_px, _py, _px + _panel_w, _py + _panel_h, 4, 4, true);
    
    // Title
    draw_set_colour(SETTINGS_LABEL_COLOR);
    draw_set_halign(fa_center);
    draw_set_font(HUD_FONT_MEDIUM);
    draw_text(_px + _panel_w / 2, _py + _padding, "Settings");
    draw_set_halign(fa_left);
    draw_set_font(HUD_FONT_SMALL);
    
    // Sliders
    var _sliders = global.settings_ui.sliders;
    var _slider_w = SETTINGS_SLIDER_W * _s;
    var _start_y = _py + _padding + _row_h;
    
    for (var _i = 0; _i < array_length(_sliders); _i++) {
        var _sl = _sliders[_i];
        var _cy = _start_y + (_i * _row_h);
        
        // Label
        draw_set_colour(SETTINGS_LABEL_COLOR);
        draw_text(_px + _padding, _cy, _sl.label);
        
        // Slider track
        var _sx = _px + _padding + 70 * _s;
        var _sy = _cy + 4 * _s;
        
        draw_set_colour(SETTINGS_SLIDER_BG);
        draw_roundrect_ext(_sx, _sy, _sx + _slider_w, _sy + SETTINGS_SLIDER_H * _s, 2, 2, false);
        
        // Slider fill
        var _fill_w = _slider_w * _sl.value;
        draw_set_colour(SETTINGS_SLIDER_FILL);
        draw_roundrect_ext(_sx, _sy, _sx + _fill_w, _sy + SETTINGS_SLIDER_H * _s, 2, 2, false);
        
        // Handle
        var _hx = _sx + _fill_w;
        var _hy = _sy + (SETTINGS_SLIDER_H * _s) / 2;
        draw_set_colour(SETTINGS_SLIDER_HANDLE);
        draw_circle(_hx, _hy, SETTINGS_HANDLE_R * _s, false);
        
        // Value text
        draw_set_colour(SETTINGS_LABEL_COLOR);
        draw_text(_sx + _slider_w + 8 * _s, _cy, string(round(_sl.value * 100)) + "%");
        
        // Store slider rect for hit testing
        _sl.rect_x = _sx;
        _sl.rect_y = _sy - 8 * _s;
        _sl.rect_w = _slider_w;
        _sl.rect_h = SETTINGS_SLIDER_H * _s + 16 * _s;
    }
    
    // --- AI Dialogue Section ---
    var _ai = global.settings_ui.ai_section;
    var _ai_y = _start_y + (array_length(_sliders) * _row_h) + _row_h * 0.5;
    
    // Section divider
    draw_set_colour(TOUCH_BTN_BORDER);
    draw_set_alpha(0.4);
    draw_line(_px + _padding, _ai_y - 4 * _s, _px + _panel_w - _padding, _ai_y - 4 * _s);
    draw_set_alpha(1.0);
    
    // Section header
    draw_set_colour(SETTINGS_SLIDER_FILL);
    draw_set_font(HUD_FONT_MEDIUM);
    draw_text(_px + _padding, _ai_y, "AI Dialogue");
    draw_set_font(HUD_FONT_SMALL);
    
    // Enable checkbox
    var _cb_y = _ai_y + _row_h;
    draw_set_colour(SETTINGS_LABEL_COLOR);
    draw_text(_px + _padding, _cb_y, "Enable");
    
    var _cb_x = _px + _padding + 70 * _s;
    var _cb_size = 14 * _s;
    draw_set_colour(TOUCH_BTN_BORDER);
    draw_rectangle(_cb_x, _cb_y, _cb_x + _cb_size, _cb_y + _cb_size, true);
    if (_ai.enabled) {
        draw_set_colour(SETTINGS_SLIDER_FILL);
        draw_rectangle(_cb_x + 2, _cb_y + 2, _cb_x + _cb_size - 2, _cb_y + _cb_size - 2, false);
    }
    // Store checkbox rect for hit testing
    _ai.cb_rect = { x: _cb_x, y: _cb_y, w: _cb_size, h: _cb_size };
    
    // Status indicator
    var _status_text = "Disabled";
    var _status_color = TOUCH_BTN_BORDER;
    if (_ai.enabled) {
        if (_ai.test_pending) {
            _status_text = "Testing...";
            _status_color = SETTINGS_SLIDER_FILL;
        } else if (_ai.connected) {
            _status_text = "Connected";
            _status_color = make_colour_rgb(80, 200, 80);
        } else {
            _status_text = "Not Connected";
            _status_color = make_colour_rgb(200, 80, 80);
        }
    }
    draw_set_colour(_status_color);
    draw_text(_cb_x + _cb_size + 10 * _s, _cb_y, _status_text);
    
    // API Key display
    var _key_y = _cb_y + _row_h;
    draw_set_colour(SETTINGS_LABEL_COLOR);
    draw_text(_px + _padding, _key_y, "API Key");
    draw_set_colour(TOUCH_BTN_BORDER);
    
    var _key_bx = _px + _padding + 70 * _s;
    var _key_bw = _slider_w;
    var _key_bh = 16 * _s;
    draw_roundrect_ext(_key_bx, _key_y, _key_bx + _key_bw, _key_y + _key_bh, 2, 2, false);
    draw_set_colour(SETTINGS_LABEL_COLOR);
    draw_set_alpha(0.8);
    draw_text(_key_bx + 4 * _s, _key_y + 2 * _s, _ai.api_key_display);
    draw_set_alpha(1.0);
    _ai.key_rect = { x: _key_bx, y: _key_y, w: _key_bw, h: _key_bh };
    
    // Model display
    var _model_y = _key_y + _row_h;
    draw_set_colour(SETTINGS_LABEL_COLOR);
    draw_text(_px + _padding, _model_y, "Model");
    draw_set_colour(TOUCH_BTN_BORDER);
    draw_set_alpha(0.6);
    var _model_short = string_length(_ai.model) > 30 
        ? string_copy(_ai.model, 1, 27) + "..." : _ai.model;
    draw_text(_px + _padding + 70 * _s, _model_y, _model_short);
    draw_set_alpha(1.0);
    
    // Remaining requests
    var _rem_y = _model_y + _row_h;
    draw_set_colour(SETTINGS_LABEL_COLOR);
    draw_text(_px + _padding, _rem_y, "Today");
    draw_set_colour(_ai.remaining > 20 ? SETTINGS_SLIDER_FILL : make_colour_rgb(200, 80, 80));
    draw_text(_px + _padding + 70 * _s, _rem_y, string(_ai.remaining) + " requests left");
    
    // Test Connection button
    var _test_y = _rem_y + _row_h;
    var _test_bw = 100 * _s;
    var _test_bh = 20 * _s;
    var _test_bx = _px + _padding + 70 * _s;
    
    draw_set_colour(_ai.test_pending ? TOUCH_BTN_BG_PRESSED : TOUCH_BTN_BG);
    draw_roundrect_ext(_test_bx, _test_y, _test_bx + _test_bw, _test_y + _test_bh, 3, 3, false);
    draw_set_colour(TOUCH_BTN_BORDER);
    draw_roundrect_ext(_test_bx, _test_y, _test_bx + _test_bw, _test_y + _test_bh, 3, 3, true);
    draw_set_colour(TOUCH_BTN_TEXT);
    draw_set_halign(fa_center);
    draw_text(_test_bx + _test_bw / 2, _test_y + 3 * _s, _ai.test_pending ? "Testing..." : "Test Connection");
    draw_set_halign(fa_left);
    _ai.test_rect = { x: _test_bx, y: _test_y, w: _test_bw, h: _test_bh };
    
    // OpenRouter signup link hint
    var _hint_y = _test_y + _row_h + 4 * _s;
    draw_set_colour(SETTINGS_SLIDER_FILL);
    draw_set_alpha(0.7);
    draw_set_halign(fa_center);
    draw_text(_px + _panel_w / 2, _hint_y, "Free API key at openrouter.ai");
    draw_set_alpha(1.0);
    draw_set_halign(fa_left);
    
    // Close hint
    draw_set_colour(SETTINGS_LABEL_COLOR);
    draw_set_halign(fa_center);
    draw_set_alpha(0.6);
    var _hint = global.is_mobile ? "Tap outside to close" : "ESC to close";
    draw_text(_px + _panel_w / 2, _py + _panel_h - _padding - 10 * _s, _hint);
    draw_set_alpha(1.0);
    draw_set_halign(fa_left);
}

/// @func settings_screen_input()
/// @desc Handle input for settings screen (keyboard sliders + mouse/touch drag).
function settings_screen_input() {
    if (!variable_global_exists("settings_ui")) return;
    if (!global.settings_ui.active) return;
    
    var _su = global.settings_ui;
    var _sliders = _su.sliders;
    var _s = global.ui_scale;
    
    // --- Close ---
    if (input_cancel_pressed()) {
        _su.active = false;
        sfx_play_ui("sfx_menu_close");
        return;
    }
    
    // --- Keyboard Navigation (PC) ---
    if (!global.is_mobile) {
        if (input_direction_up() && _su.selected > 0) {
            _su.selected--;
            sfx_play_ui("sfx_tab_switch");
        }
        if (input_direction_down() && _su.selected < array_length(_sliders) - 1) {
            _su.selected++;
            sfx_play_ui("sfx_tab_switch");
        }
        // Left/Right to adjust selected slider
        if (input_direction_left()) {
            _sliders[_su.selected].value = max(0, _sliders[_su.selected].value - 0.05);
            audio_manager_set_volume(_sliders[_su.selected].channel, _sliders[_su.selected].value);
        }
        if (input_direction_right()) {
            _sliders[_su.selected].value = min(1, _sliders[_su.selected].value + 0.05);
            audio_manager_set_volume(_sliders[_su.selected].channel, _sliders[_su.selected].value);
        }
    }
    
    // --- Mouse/Touch Drag ---
    if (input_pointer_pressed()) {
        // Check which slider was tapped
        for (var _i = 0; _i < array_length(_sliders); _i++) {
            var _sl = _sliders[_i];
            if (variable_struct_exists(_sl, "rect_x")) {
                if (input_pointer_in_rect(_sl.rect_x, _sl.rect_y, _sl.rect_w, _sl.rect_h)) {
                    _su.dragging = _i;
                    break;
                }
            }
        }
    }
    
    if (input_pointer_held() && _su.dragging >= 0) {
        var _sl = _sliders[_su.dragging];
        if (variable_struct_exists(_sl, "rect_x")) {
            var _rel = (input_pointer_x() - _sl.rect_x) / _sl.rect_w;
            _sl.value = clamp(_rel, 0, 1);
            audio_manager_set_volume(_sl.channel, _sl.value);
        }
    }
    
    if (input_pointer_released()) {
        _su.dragging = -1;
    }
    
    // --- AI Dialogue Section Input ---
    if (input_pointer_pressed() && variable_struct_exists(_su, "ai_section")) {
        var _ai = _su.ai_section;
        
        // Checkbox toggle
        if (variable_struct_exists(_ai, "cb_rect")) {
            if (input_pointer_in_rect(_ai.cb_rect.x, _ai.cb_rect.y, _ai.cb_rect.w, _ai.cb_rect.h)) {
                _ai.enabled = !_ai.enabled;
                global.ai_dialogue.enabled = _ai.enabled;
                if (!_ai.enabled) {
                    global.ai_dialogue.connected = false;
                    _ai.connected = false;
                }
                sfx_play_ui("sfx_ui_click");
            }
        }
        
        // API Key field tap — opens keyboard input on mobile, or text prompt on PC
        if (variable_struct_exists(_ai, "key_rect") && _ai.enabled) {
            if (input_pointer_in_rect(_ai.key_rect.x, _ai.key_rect.y, _ai.key_rect.w, _ai.key_rect.h)) {
                if (global.is_mobile) {
                    // Mobile: use OS virtual keyboard
                    keyboard_string = "";
                    _ai.api_key_editing = true;
                } else {
                    // PC: use get_string_async for key input
                    var _input = get_string_async("Enter your OpenRouter API key:", "");
                    if (_input >= 0) {
                        _ai.api_key_editing = true;
                        _ai.key_input_id = _input;
                    }
                }
                sfx_play_ui("sfx_ui_click");
            }
        }
        
        // Test Connection button
        if (variable_struct_exists(_ai, "test_rect") && _ai.enabled && !_ai.test_pending) {
            if (input_pointer_in_rect(_ai.test_rect.x, _ai.test_rect.y, _ai.test_rect.w, _ai.test_rect.h)) {
                var _test_id = ai_dialogue_test_connection();
                if (_test_id >= 0) {
                    _ai.test_pending = true;
                }
                sfx_play_ui("sfx_ui_click");
            }
        }
    }
}

/// @func settings_ai_on_key_entered(_key_string)
/// @desc Called when the player finishes entering their API key.
///       Handles both mobile keyboard and PC async dialog.
/// @param {string} _key_string  The entered API key
function settings_ai_on_key_entered(_key_string) {
    if (!variable_global_exists("settings_ui")) return;
    if (!variable_struct_exists(global.settings_ui, "ai_section")) return;
    
    var _ai = global.settings_ui.ai_section;
    var _key = string_trim(_key_string);
    
    if (string_length(_key) > 10) {
        ai_dialogue_set_key(_key);
        _ai.api_key_display = _settings_mask_key(_key);
        _ai.enabled = true;
        _ai.connected = false;
        show_debug_message("INFO: AI dialogue API key entered via settings");
    }
    _ai.api_key_editing = false;
}

/// @func settings_ai_update_status()
/// @desc Called after AI dialogue async response to update settings UI state.
///       Should be called from ai_dialogue_async_http() after connection test.
function settings_ai_update_status() {
    if (!variable_global_exists("settings_ui")) return;
    if (!variable_struct_exists(global.settings_ui, "ai_section")) return;
    
    var _ai = global.settings_ui.ai_section;
    _ai.connected = global.ai_dialogue.connected;
    _ai.test_pending = false;
    _ai.remaining = ai_dialogue_get_remaining_requests();
}

// ============================================================================
// UI SCALING HELPERS
// ============================================================================

/// @func ui_scale_value(_base_value)
/// @desc Scale a UI dimension by the current UI scale factor.
/// @param {real} _base_value  Base pixel value
/// @returns {real}
function ui_scale_value(_base_value) {
    return _base_value * global.ui_scale;
}

/// @func ui_safe_left()
/// @desc Get the safe area left offset.
/// @returns {real}
function ui_safe_left() {
    return global.safe_area.left;
}

/// @func ui_safe_right()
/// @desc Get the safe area right offset from the right edge.
/// @returns {real}
function ui_safe_right() {
    return global.safe_area.right;
}

/// @func ui_safe_top()
/// @returns {real}
function ui_safe_top() {
    return global.safe_area.top;
}

/// @func ui_safe_bottom()
/// @returns {real}
function ui_safe_bottom() {
    return global.safe_area.bottom;
}

// ============================================================================
// MOBILE PERFORMANCE HELPERS
// ============================================================================

/// @func mobile_get_particle_limit()
/// @desc Get the maximum particle count for the current platform.
/// @returns {real}
function mobile_get_particle_limit() {
    return global.is_mobile ? 128 : 256;
}

/// @func mobile_get_ambient_layer_limit()
/// @desc Get the maximum simultaneous ambient layers for the current platform.
/// @returns {real}
function mobile_get_ambient_layer_limit() {
    return global.is_mobile ? AMBIENT_MAX_LAYERS_MOBILE : AMBIENT_MAX_LAYERS_PC;
}
