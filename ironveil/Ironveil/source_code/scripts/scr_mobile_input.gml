/// scr_mobile_input.gml
/// Ironveil — Mobile Input & Input Abstraction Layer (Objective #40)
/// Platform detection, virtual joystick, input abstraction for keyboard/mouse/touch.
/// All game systems should use these functions instead of direct keyboard_check calls.

// ============================================================================
// MACROS
// ============================================================================
#macro INPUT_JOYSTICK_DEADZONE     8     // Pixels (before scaling)
#macro INPUT_JOYSTICK_MAX_RADIUS   40    // Pixels (before scaling)
#macro INPUT_JOYSTICK_ALPHA        0.45  // Visual opacity
#macro INPUT_JOYSTICK_BG_COLOR     make_colour_rgb(60, 55, 45)
#macro INPUT_JOYSTICK_THUMB_COLOR  make_colour_rgb(180, 165, 120)
#macro INPUT_JOYSTICK_BORDER_COLOR make_colour_rgb(120, 110, 85)

#macro INPUT_TOUCH_NONE   -1
#macro INPUT_SCREEN_LEFT   0.45  // Left 45% of screen for joystick

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func input_init()
/// @desc Initialize input system. Detects platform and sets up state. Call at boot.
function input_init() {
    // Platform detection
    var _os = os_type;
    global.is_mobile = (_os == os_android || _os == os_ios);
    global.ui_scale = global.is_mobile ? 1.75 : 1.0;
    
    // Safe area padding (pixels)
    global.safe_area = {
        left:   global.is_mobile ? 24 : 0,
        right:  global.is_mobile ? 24 : 0,
        top:    global.is_mobile ? 24 : 0,
        bottom: global.is_mobile ? 24 : 0
    };
    
    // Virtual joystick state
    global.joystick = {
        active:    false,
        touch_id:  INPUT_TOUCH_NONE,    // Which touch device slot is controlling joystick
        origin_x:  0,                    // Where the touch started (GUI coords)
        origin_y:  0,
        thumb_x:   0,                    // Current thumb position
        thumb_y:   0,
        dir_x:     0.0,                  // Normalized output (-1.0 to 1.0)
        dir_y:     0.0
    };
    
    // Touch action button state
    global.touch_buttons = {
        action_pressed:    false,
        cancel_pressed:    false,
        secondary_pressed: false,
        hotbar_pressed:    -1            // -1 = none, 0-2 = hotbar slot
    };
    
    // Mouse/pointer state (unified for PC mouse + mobile touch)
    global.input_pointer = {
        x:        0,
        y:        0,
        pressed:  false,
        released: false,
        held:     false
    };
    
    // Direction input state (for UI navigation)
    global.input_dir = {
        up:    false,
        down:  false,
        left:  false,
        right: false,
        up_repeat_timer:   0,
        down_repeat_timer: 0
    };
    
    // Key repeat settings for UI navigation
    global.input_key_repeat_delay = 20;   // Frames before repeat starts
    global.input_key_repeat_rate  = 6;    // Frames between repeats
    
    show_debug_message("[INPUT] Input system initialized. Mobile: " + string(global.is_mobile) + ", UI Scale: " + string(global.ui_scale));
}

// ============================================================================
// UPDATE (Call every Step event, BEFORE other input processing)
// ============================================================================

/// @func input_update()
/// @desc Update all input state. Must be called at start of each Step event.
function input_update() {
    // Reset per-frame states
    global.touch_buttons.action_pressed = false;
    global.touch_buttons.cancel_pressed = false;
    global.touch_buttons.secondary_pressed = false;
    global.touch_buttons.hotbar_pressed = -1;
    global.input_pointer.pressed = false;
    global.input_pointer.released = false;
    global.input_dir.up = false;
    global.input_dir.down = false;
    global.input_dir.left = false;
    global.input_dir.right = false;
    
    if (global.is_mobile) {
        _input_update_touch();
    } else {
        _input_update_keyboard_mouse();
    }
}

// ============================================================================
// KEYBOARD + MOUSE UPDATE (PC)
// ============================================================================

/// @func _input_update_keyboard_mouse()
/// @desc Process keyboard and mouse input for PC platform.
function _input_update_keyboard_mouse() {
    // Pointer (mouse)
    global.input_pointer.x = device_mouse_x_to_gui(0);
    global.input_pointer.y = device_mouse_y_to_gui(0);
    global.input_pointer.pressed = mouse_check_button_pressed(mb_left);
    global.input_pointer.released = mouse_check_button_released(mb_left);
    global.input_pointer.held = mouse_check_button(mb_left);
    
    // Direction (arrow keys with repeat)
    _input_process_key_repeat(vk_up, "up");
    _input_process_key_repeat(vk_down, "down");
    global.input_dir.left = keyboard_check_pressed(vk_left);
    global.input_dir.right = keyboard_check_pressed(vk_right);
}

/// @func _input_process_key_repeat(_key, _dir_name)
/// @desc Handle key repeat for held-down direction keys (UI scrolling).
/// @param {real}   _key       Keyboard virtual key
/// @param {string} _dir_name  "up" or "down"
function _input_process_key_repeat(_key, _dir_name) {
    var _timer_name = _dir_name + "_repeat_timer";
    
    if (keyboard_check(_key)) {
        var _timer = variable_struct_get(global.input_dir, _timer_name);
        if (keyboard_check_pressed(_key)) {
            // First press
            variable_struct_set(global.input_dir, _dir_name, true);
            variable_struct_set(global.input_dir, _timer_name, global.input_key_repeat_delay);
        } else {
            // Held — decrement timer
            _timer--;
            if (_timer <= 0) {
                variable_struct_set(global.input_dir, _dir_name, true);
                variable_struct_set(global.input_dir, _timer_name, global.input_key_repeat_rate);
            } else {
                variable_struct_set(global.input_dir, _timer_name, _timer);
            }
        }
    } else {
        variable_struct_set(global.input_dir, _timer_name, 0);
    }
}

// ============================================================================
// TOUCH UPDATE (Mobile)
// ============================================================================

/// @func _input_update_touch()
/// @desc Process touch input for mobile platform. Handles joystick + pointer.
function _input_update_touch() {
    var _js = global.joystick;
    var _gui_w = display_get_gui_width();
    var _gui_h = display_get_gui_height();
    var _left_boundary = _gui_w * INPUT_SCREEN_LEFT;
    
    // Process all active touch points
    for (var _t = 0; _t < 5; _t++) {
        var _tx = device_mouse_x_to_gui(_t);
        var _ty = device_mouse_y_to_gui(_t);
        
        if (device_mouse_check_button_pressed(_t, mb_left)) {
            // New touch
            if (_tx < _left_boundary && !_js.active) {
                // Left side — activate joystick
                _js.active = true;
                _js.touch_id = _t;
                _js.origin_x = _tx;
                _js.origin_y = _ty;
                _js.thumb_x = _tx;
                _js.thumb_y = _ty;
                _js.dir_x = 0;
                _js.dir_y = 0;
            } else if (_tx >= _left_boundary) {
                // Right side — pointer/action
                global.input_pointer.x = _tx;
                global.input_pointer.y = _ty;
                global.input_pointer.pressed = true;
                global.input_pointer.held = true;
            }
        }
        
        if (device_mouse_check_button(_t, mb_left)) {
            // Held touch
            if (_t == _js.touch_id && _js.active) {
                // Update joystick thumb position
                _js.thumb_x = _tx;
                _js.thumb_y = _ty;
                
                // Calculate direction vector
                var _dx = _js.thumb_x - _js.origin_x;
                var _dy = _js.thumb_y - _js.origin_y;
                var _dist = sqrt(_dx * _dx + _dy * _dy);
                var _max_r = INPUT_JOYSTICK_MAX_RADIUS * global.ui_scale;
                var _dead = INPUT_JOYSTICK_DEADZONE * global.ui_scale;
                
                if (_dist > _dead) {
                    // Clamp to max radius
                    if (_dist > _max_r) {
                        _dx = (_dx / _dist) * _max_r;
                        _dy = (_dy / _dist) * _max_r;
                        _js.thumb_x = _js.origin_x + _dx;
                        _js.thumb_y = _js.origin_y + _dy;
                        _dist = _max_r;
                    }
                    // Normalize to -1..1
                    _js.dir_x = _dx / _max_r;
                    _js.dir_y = _dy / _max_r;
                } else {
                    _js.dir_x = 0;
                    _js.dir_y = 0;
                }
            } else if (_tx >= _left_boundary) {
                global.input_pointer.x = _tx;
                global.input_pointer.y = _ty;
                global.input_pointer.held = true;
            }
        }
        
        if (device_mouse_check_button_released(_t, mb_left)) {
            if (_t == _js.touch_id) {
                // Joystick released
                _js.active = false;
                _js.touch_id = INPUT_TOUCH_NONE;
                _js.dir_x = 0;
                _js.dir_y = 0;
            } else if (_tx >= _left_boundary) {
                global.input_pointer.released = true;
            }
        }
    }
}

// ============================================================================
// VIRTUAL JOYSTICK DRAWING
// ============================================================================

/// @func joystick_draw()
/// @desc Draw the virtual joystick overlay. Call in Draw GUI event, mobile only.
function joystick_draw() {
    if (!global.is_mobile) return;
    
    var _js = global.joystick;
    if (!_js.active) return;
    
    var _r = INPUT_JOYSTICK_MAX_RADIUS * global.ui_scale;
    var _thumb_r = _r * 0.4;
    
    // Background ring
    draw_set_alpha(INPUT_JOYSTICK_ALPHA * 0.5);
    draw_set_colour(INPUT_JOYSTICK_BG_COLOR);
    draw_circle(_js.origin_x, _js.origin_y, _r, false);
    
    // Border ring
    draw_set_alpha(INPUT_JOYSTICK_ALPHA);
    draw_set_colour(INPUT_JOYSTICK_BORDER_COLOR);
    draw_circle(_js.origin_x, _js.origin_y, _r, true);
    
    // Thumb indicator
    draw_set_colour(INPUT_JOYSTICK_THUMB_COLOR);
    draw_circle(_js.thumb_x, _js.thumb_y, _thumb_r, false);
    
    // Thumb border
    draw_set_colour(INPUT_JOYSTICK_BORDER_COLOR);
    draw_circle(_js.thumb_x, _js.thumb_y, _thumb_r, true);
    
    draw_set_alpha(1.0);
}

// ============================================================================
// INPUT ABSTRACTION FUNCTIONS (Use these everywhere in game code)
// ============================================================================

/// @func input_move_x()
/// @desc Get horizontal movement input. Returns -1, 0, or 1.
/// @returns {real}
function input_move_x() {
    if (global.is_mobile) {
        var _dx = global.joystick.dir_x;
        if (abs(_dx) > 0.3) return sign(_dx);
        return 0;
    }
    // PC: WASD + Arrow keys
    var _left  = keyboard_check(vk_left)  || keyboard_check(ord("A"));
    var _right = keyboard_check(vk_right) || keyboard_check(ord("D"));
    return _right - _left;
}

/// @func input_move_y()
/// @desc Get vertical movement input. Returns -1, 0, or 1.
/// @returns {real}
function input_move_y() {
    if (global.is_mobile) {
        var _dy = global.joystick.dir_y;
        if (abs(_dy) > 0.3) return sign(_dy);
        return 0;
    }
    var _up   = keyboard_check(vk_up)   || keyboard_check(ord("W"));
    var _down = keyboard_check(vk_down) || keyboard_check(ord("S"));
    return _down - _up;
}

/// @func input_move_x_raw()
/// @desc Get raw horizontal movement (analog). Returns -1.0 to 1.0.
/// @returns {real}
function input_move_x_raw() {
    if (global.is_mobile) return global.joystick.dir_x;
    return input_move_x();
}

/// @func input_move_y_raw()
/// @desc Get raw vertical movement (analog). Returns -1.0 to 1.0.
/// @returns {real}
function input_move_y_raw() {
    if (global.is_mobile) return global.joystick.dir_y;
    return input_move_y();
}

/// @func input_action_pressed()
/// @desc Check if primary action was pressed this frame (Enter/Space on PC, action button on mobile).
/// @returns {bool}
function input_action_pressed() {
    if (global.is_mobile) {
        return global.touch_buttons.action_pressed || global.input_pointer.pressed;
    }
    return keyboard_check_pressed(vk_enter) || keyboard_check_pressed(vk_space);
}

/// @func input_cancel_pressed()
/// @desc Check if cancel was pressed this frame (Escape on PC, back button on mobile).
/// @returns {bool}
function input_cancel_pressed() {
    if (global.is_mobile) {
        return global.touch_buttons.cancel_pressed;
    }
    return keyboard_check_pressed(vk_escape);
}

/// @func input_direction_up()
/// @desc Check if UI "up" navigation triggered this frame (with key repeat support).
/// @returns {bool}
function input_direction_up() {
    return global.input_dir.up;
}

/// @func input_direction_down()
/// @desc Check if UI "down" navigation triggered this frame.
/// @returns {bool}
function input_direction_down() {
    return global.input_dir.down;
}

/// @func input_direction_left()
/// @desc Check if UI "left" navigation triggered this frame.
/// @returns {bool}
function input_direction_left() {
    return global.input_dir.left;
}

/// @func input_direction_right()
/// @desc Check if UI "right" navigation triggered this frame.
/// @returns {bool}
function input_direction_right() {
    return global.input_dir.right;
}

/// @func input_tab_next()
/// @desc Check if "next tab" was pressed (E on PC, tab tap on mobile).
/// @returns {bool}
function input_tab_next() {
    if (global.is_mobile) return false;  // Handled by touch tap on tab buttons
    return keyboard_check_pressed(ord("E"));
}

/// @func input_tab_prev()
/// @desc Check if "previous tab" was pressed (Q on PC, tab tap on mobile).
/// @returns {bool}
function input_tab_prev() {
    if (global.is_mobile) return false;  // Handled by touch tap on tab buttons
    return keyboard_check_pressed(ord("Q"));
}

/// @func input_pointer_x()
/// @desc Get current pointer X position in GUI coordinates (mouse or touch).
/// @returns {real}
function input_pointer_x() {
    return global.input_pointer.x;
}

/// @func input_pointer_y()
/// @desc Get current pointer Y position in GUI coordinates.
/// @returns {real}
function input_pointer_y() {
    return global.input_pointer.y;
}

/// @func input_pointer_pressed()
/// @desc Check if pointer was pressed this frame (mouse click or touch tap).
/// @returns {bool}
function input_pointer_pressed() {
    return global.input_pointer.pressed;
}

/// @func input_pointer_released()
/// @desc Check if pointer was released this frame.
/// @returns {bool}
function input_pointer_released() {
    return global.input_pointer.released;
}

/// @func input_pointer_held()
/// @desc Check if pointer is currently held down.
/// @returns {bool}
function input_pointer_held() {
    return global.input_pointer.held;
}

/// @func input_hotkey_pressed(_key)
/// @desc Check if a specific hotkey was pressed. On mobile, checks hotbar touch buttons.
/// @param {string} _key  Single character key (e.g., "I", "J", "M")
/// @returns {bool}
function input_hotkey_pressed(_key) {
    if (global.is_mobile) return false;  // Mobile uses touch buttons directly
    return keyboard_check_pressed(ord(_key));
}

// ============================================================================
// HIT TESTING HELPERS
// ============================================================================

/// @func input_point_in_rect(_px, _py, _rx, _ry, _rw, _rh)
/// @desc Check if a point is inside a rectangle. Used for touch hit testing.
/// @param {real} _px, _py  Point coordinates
/// @param {real} _rx, _ry  Rectangle top-left
/// @param {real} _rw, _rh  Rectangle size
/// @returns {bool}
function input_point_in_rect(_px, _py, _rx, _ry, _rw, _rh) {
    return (_px >= _rx && _px < _rx + _rw && _py >= _ry && _py < _ry + _rh);
}

/// @func input_pointer_in_rect(_rx, _ry, _rw, _rh)
/// @desc Check if the current pointer position is inside a rectangle.
/// @returns {bool}
function input_pointer_in_rect(_rx, _ry, _rw, _rh) {
    return input_point_in_rect(input_pointer_x(), input_pointer_y(), _rx, _ry, _rw, _rh);
}
