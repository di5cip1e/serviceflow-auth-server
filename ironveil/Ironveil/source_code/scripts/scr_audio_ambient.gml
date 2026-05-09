/// scr_audio_ambient.gml
/// Ironveil — Ambient Soundscape System (Part of Objective #39)
/// Manages per-room ambient loops, day/night variants, and weather overlay layers.

// ============================================================================
// MACROS
// ============================================================================
#macro AMBIENT_CROSSFADE_FRAMES  90    // 1.5 seconds
#macro AMBIENT_MAX_LAYERS_PC     4
#macro AMBIENT_MAX_LAYERS_MOBILE 2

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func ambient_init()
/// @desc Initialize ambient system state. Called by audio_manager_init().
function ambient_init() {
    global.audio_ambient = {
        current_id:       "",          // Current ambience track ID
        current_sound:    -1,          // GML sound instance
        next_id:          "",          // Incoming ambience
        next_sound:       -1,
        crossfade_timer:  0,
        crossfade_total:  AMBIENT_CROSSFADE_FRAMES,
        
        weather_id:       "",          // Current weather overlay ID
        weather_sound:    -1,          // Weather overlay sound instance
        weather_gain:     0.0,         // Current weather gain (fading)
        weather_target:   0.0,         // Target weather gain
        weather_config_gain: 0.0       // Gain from config for this weather type
    };
    
    show_debug_message("[AMBIENT] Ambient system initialized.");
}

// ============================================================================
// GAIN HELPERS
// ============================================================================

/// @func _ambient_calc_gain()
/// @desc Calculate effective ambient gain from master * ambient volumes.
/// @returns {real}
function _ambient_calc_gain() {
    return global.audio_volumes.master * global.audio_volumes.ambient;
}

/// @func ambient_apply_gain()
/// @desc Apply current gain to all active ambient sounds. Called when volume changes.
function ambient_apply_gain() {
    var _a = global.audio_ambient;
    var _gain = _ambient_calc_gain();
    
    if (_a.current_sound != -1 && audio_is_playing(_a.current_sound)) {
        audio_sound_gain(_a.current_sound, _gain, 0);
    }
    if (_a.weather_sound != -1 && audio_is_playing(_a.weather_sound)) {
        audio_sound_gain(_a.weather_sound, _gain * _a.weather_gain, 0);
    }
}

// ============================================================================
// AMBIENT PLAYBACK
// ============================================================================

/// @func ambient_play(_ambience_id)
/// @desc Crossfade to a new ambient track.
/// @param {string} _ambience_id  e.g., "amb_coppervale_day"
function ambient_play(_ambience_id) {
    var _a = global.audio_ambient;
    
    // Don't restart same track
    if (_ambience_id == _a.current_id && _a.crossfade_timer <= 0) return;
    
    var _asset = asset_get_index(_ambience_id);
    if (_asset == -1) {
        show_debug_message("[AMBIENT] WARNING: Ambient asset not found: " + _ambience_id);
        return;
    }
    
    // Kill old outgoing track if already crossfading
    if (_a.crossfade_timer > 0 && _a.current_sound != -1) {
        audio_stop_sound(_a.current_sound);
    }
    
    // Promote next to current if crossfading
    if (_a.crossfade_timer > 0 && _a.next_sound != -1) {
        _a.current_sound = _a.next_sound;
        _a.current_id = _a.next_id;
    }
    
    // Start new ambient at 0 gain
    _a.next_id = _ambience_id;
    _a.next_sound = audio_play_sound(_asset, 0, true);
    audio_sound_gain(_a.next_sound, 0, 0);
    
    _a.crossfade_timer = _a.crossfade_total;
    
    show_debug_message("[AMBIENT] Crossfading to: " + _ambience_id);
}

/// @func ambient_stop()
/// @desc Fade out all ambient sounds.
function ambient_stop() {
    var _a = global.audio_ambient;
    var _fade_ms = AMBIENT_CROSSFADE_FRAMES * (1000 / 60);
    
    if (_a.current_sound != -1 && audio_is_playing(_a.current_sound)) {
        audio_sound_gain(_a.current_sound, 0, _fade_ms);
    }
    if (_a.next_sound != -1 && audio_is_playing(_a.next_sound)) {
        audio_sound_gain(_a.next_sound, 0, _fade_ms);
    }
    _a.current_id = "";
    _a.next_id = "";
}

// ============================================================================
// WEATHER OVERLAY
// ============================================================================

/// @func ambient_add_weather_overlay(_weather)
/// @desc Layer a weather ambient sound on top of the room ambience.
/// @param {string} _weather  "RAIN"|"STORM"|"SNOW"|"FOG"
function ambient_add_weather_overlay(_weather) {
    var _a = global.audio_ambient;
    var _overlays = global.audio_config.weather_overlays;
    
    // Check if this weather has an overlay
    if (!variable_struct_exists(_overlays, _weather)) {
        ambient_remove_weather_overlay();
        return;
    }
    
    var _overlay = variable_struct_get(_overlays, _weather);
    var _amb_id = _overlay.ambience;
    
    // Don't restart same weather
    if (_amb_id == _a.weather_id) return;
    
    // Stop current weather overlay if different
    if (_a.weather_sound != -1 && audio_is_playing(_a.weather_sound)) {
        audio_stop_sound(_a.weather_sound);
    }
    
    var _asset = asset_get_index(_amb_id);
    if (_asset == -1) {
        show_debug_message("[AMBIENT] WARNING: Weather ambient not found: " + _amb_id);
        return;
    }
    
    _a.weather_id = _amb_id;
    _a.weather_config_gain = _overlay.gain;
    _a.weather_target = _overlay.gain;
    _a.weather_gain = 0.0;
    _a.weather_sound = audio_play_sound(_asset, 0, true);
    audio_sound_gain(_a.weather_sound, 0, 0);
    
    show_debug_message("[AMBIENT] Weather overlay: " + _weather + " (" + _amb_id + ")");
}

/// @func ambient_remove_weather_overlay()
/// @desc Fade out and stop the weather overlay.
function ambient_remove_weather_overlay() {
    var _a = global.audio_ambient;
    _a.weather_target = 0.0;
    _a.weather_id = "";
    // Sound will be stopped when gain reaches 0 in update
}

// ============================================================================
// ROOM & TIME HOOKS
// ============================================================================

/// @func ambient_on_room_enter(_room_id)
/// @desc Look up and play the appropriate ambient track for this room.
/// @param {string} _room_id
function ambient_on_room_enter(_room_id) {
    var _mappings = global.audio_config.ambience_room_mappings;
    var _hour = global.time_hour;
    var _time_key = (_hour >= AUDIO_NIGHT_START_HOUR || _hour < AUDIO_NIGHT_END_HOUR) ? "night" : "day";
    
    // Search for room+time match first, then room+any
    var _found = "";
    for (var _i = 0; _i < array_length(_mappings); _i++) {
        var _m = _mappings[_i];
        if (_m.room_id == _room_id) {
            if (_m.time == _time_key || _m.time == "any") {
                _found = _m.ambience;
                // Prefer exact time match over "any"
                if (_m.time == _time_key) break;
            }
        }
    }
    
    if (_found != "") {
        ambient_play(_found);
    }
}

/// @func ambient_on_weather_change(_new_weather)
/// @desc Called when weather changes. Adds or removes weather overlay.
/// @param {string} _new_weather  "CLEAR"|"CLOUDY"|"RAIN"|"STORM"|"SNOW"|"FOG"
function ambient_on_weather_change(_new_weather) {
    if (_new_weather == "CLEAR" || _new_weather == "CLOUDY") {
        ambient_remove_weather_overlay();
    } else {
        ambient_add_weather_overlay(_new_weather);
    }
}

/// @func ambient_on_time_change(_new_period)
/// @desc Called when time period changes (day→night or night→day). Re-evaluates room ambience.
/// @param {string} _new_period  "day"|"night"
function ambient_on_time_change(_new_period) {
    // Re-evaluate current room ambience with new time
    if (global.audio_last_room != "") {
        ambient_on_room_enter(global.audio_last_room);
    }
}

// ============================================================================
// UPDATE
// ============================================================================

/// @func ambient_update()
/// @desc Handle ambient crossfades and weather overlay fading. Called by audio_manager_update().
function ambient_update() {
    var _a = global.audio_ambient;
    var _gain = _ambient_calc_gain();
    
    // --- Ambient Crossfade ---
    if (_a.crossfade_timer > 0) {
        _a.crossfade_timer--;
        var _progress = 1.0 - (_a.crossfade_timer / _a.crossfade_total);
        
        // Fade out old
        if (_a.current_sound != -1 && audio_is_playing(_a.current_sound)) {
            audio_sound_gain(_a.current_sound, _gain * (1.0 - _progress), 0);
        }
        // Fade in new
        if (_a.next_sound != -1 && audio_is_playing(_a.next_sound)) {
            audio_sound_gain(_a.next_sound, _gain * _progress, 0);
        }
        
        // Crossfade complete
        if (_a.crossfade_timer <= 0) {
            if (_a.current_sound != -1) audio_stop_sound(_a.current_sound);
            _a.current_sound = _a.next_sound;
            _a.current_id = _a.next_id;
            _a.next_sound = -1;
            _a.next_id = "";
            
            if (_a.current_sound != -1) {
                audio_sound_gain(_a.current_sound, _gain, 0);
            }
        }
    }
    
    // --- Weather Overlay Fade ---
    if (_a.weather_sound != -1) {
        var _fade_speed = 0.02;
        _a.weather_gain = lerp(_a.weather_gain, _a.weather_target, _fade_speed);
        
        if (audio_is_playing(_a.weather_sound)) {
            audio_sound_gain(_a.weather_sound, _gain * _a.weather_gain, 0);
        }
        
        // Stop sound if fully faded out
        if (_a.weather_target <= 0 && _a.weather_gain < 0.01) {
            audio_stop_sound(_a.weather_sound);
            _a.weather_sound = -1;
            _a.weather_gain = 0.0;
        }
    }
}

// ============================================================================
// CLEANUP
// ============================================================================

/// @func ambient_cleanup()
/// @desc Stop all ambient sounds. Called by audio_manager_cleanup().
function ambient_cleanup() {
    var _a = global.audio_ambient;
    if (_a.current_sound != -1) audio_stop_sound(_a.current_sound);
    if (_a.next_sound != -1) audio_stop_sound(_a.next_sound);
    if (_a.weather_sound != -1) audio_stop_sound(_a.weather_sound);
    show_debug_message("[AMBIENT] Ambient system cleaned up.");
}
