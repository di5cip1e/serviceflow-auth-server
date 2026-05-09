/// scr_audio_manager.gml
/// Ironveil — Full Sound & Music Integration (Objective #39)
/// Core audio manager: music channels, crossfade, dynamic layers, volume control
/// Handles context-aware music selection, raid layering, and save/load of settings.

// ============================================================================
// MACROS
// ============================================================================
#macro AUDIO_CROSSFADE_FRAMES   120   // 2 seconds at 60fps
#macro AUDIO_LAYER_FADE_FRAMES  60    // 1 second for raid layer transitions
#macro AUDIO_NIGHT_MUSIC_GAIN   0.4   // Music dips at night
#macro AUDIO_NIGHT_START_HOUR   20    // 8 PM
#macro AUDIO_NIGHT_END_HOUR     6     // 6 AM
#macro AUDIO_DAWN_DUSK_HOURS    1     // Transition window

// ============================================================================
// SEASON HELPERS
// ============================================================================

/// @func _audio_season_name(_season_index)
/// @desc Convert season index (0-3) to suffix string
/// @param {real} _season_index
/// @returns {string}
function _audio_season_name(_season_index) {
    switch (_season_index) {
        case 0: return "spring";
        case 1: return "summer";
        case 2: return "autumn";
        case 3: return "winter";
    }
    return "spring";
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func audio_manager_init()
/// @desc Initialize the audio manager. Call once at boot (in obj_sys_game_manager Create).
function audio_manager_init() {
    // Load audio config
    var _cfg = data_load_file("config/audio_config.json");
    global.audio_config = _cfg;
    
    // Volume settings (defaults, overridden by save data)
    var _defaults = _cfg.settings_defaults;
    global.audio_volumes = {
        master:   _defaults.master,
        music:    _defaults.music,
        ambient:  _defaults.ambient,
        sfx:      _defaults.sfx,
        ui:       _defaults.ui,
        dialogue: _defaults.dialogue
    };
    
    // Music channel state
    global.audio_music = {
        current_track:    "",          // Track ID currently playing
        current_sound:    -1,          // GML sound instance ID
        next_track:       "",          // Track ID fading in
        next_sound:       -1,          // GML sound instance for incoming track
        crossfade_timer:  0,           // Frames remaining in crossfade
        crossfade_total:  AUDIO_CROSSFADE_FRAMES,
        target_gain:      1.0,         // Target gain for current track (night dimming)
        current_gain:     1.0          // Actual current gain (lerped)
    };
    
    // Raid layer state
    global.audio_raid_layers = {
        active:             false,
        base_sound:         -1,
        escalation_sound:   -1,
        crisis_sound:       -1,
        escalation_active:  false,
        crisis_active:      false,
        escalation_gain:    0.0,       // Current gain (fading in/out)
        crisis_gain:        0.0,
        escalation_target:  0.0,       // Target gain
        crisis_target:      0.0,
        faction:            "default"
    };
    
    // Room music cache (built from config)
    global.audio_room_music_map = ds_map_create();
    var _mappings = _cfg.music_room_mappings;
    for (var _i = 0; _i < array_length(_mappings); _i++) {
        var _m = _mappings[_i];
        var _key = _m.room_id + "|" + string(_m.season);
        ds_map_add(global.audio_room_music_map, _key, _m.track);
    }
    
    // State override cache
    global.audio_state_overrides = _cfg.music_state_overrides;
    
    // Previous room tracking (avoid re-triggering same track)
    global.audio_last_room = "";
    global.audio_last_season = -1;
    
    // Initialize sub-systems
    ambient_init();
    sfx_init();
    
    show_debug_message("[AUDIO] Audio manager initialized.");
}

// ============================================================================
// VOLUME CONTROL
// ============================================================================

/// @func audio_manager_set_volume(_channel, _vol)
/// @desc Set volume for a specific channel. Applies immediately.
/// @param {string} _channel  "master"|"music"|"ambient"|"sfx"|"ui"|"dialogue"
/// @param {real}   _vol      0.0 to 1.0
function audio_manager_set_volume(_channel, _vol) {
    _vol = clamp(_vol, 0.0, 1.0);
    variable_struct_set(global.audio_volumes, _channel, _vol);
    
    // Immediately apply to active sounds
    if (_channel == "master" || _channel == "music") {
        _audio_apply_music_gain();
    }
    if (_channel == "master" || _channel == "ambient") {
        ambient_apply_gain();
    }
}

/// @func audio_manager_get_volume(_channel)
/// @param {string} _channel
/// @returns {real}
function audio_manager_get_volume(_channel) {
    return variable_struct_get(global.audio_volumes, _channel);
}

/// @func _audio_calc_music_gain()
/// @desc Calculate effective music gain from master * music * night modifier
/// @returns {real}
function _audio_calc_music_gain() {
    return global.audio_volumes.master * global.audio_volumes.music * global.audio_music.current_gain;
}

/// @func _audio_apply_music_gain()
/// @desc Apply calculated gain to active music sounds
function _audio_apply_music_gain() {
    var _gain = _audio_calc_music_gain();
    var _m = global.audio_music;
    if (_m.current_sound != -1 && audio_is_playing(_m.current_sound)) {
        // During crossfade, current track is fading out
        if (_m.crossfade_timer > 0) {
            var _fade_ratio = _m.crossfade_timer / _m.crossfade_total;
            audio_sound_gain(_m.current_sound, _gain * _fade_ratio, 0);
        } else {
            audio_sound_gain(_m.current_sound, _gain, 0);
        }
    }
    if (_m.next_sound != -1 && audio_is_playing(_m.next_sound)) {
        var _fade_in = 1.0 - (_m.crossfade_timer / _m.crossfade_total);
        audio_sound_gain(_m.next_sound, _gain * _fade_in, 0);
    }
}

// ============================================================================
// MUSIC PLAYBACK
// ============================================================================

/// @func audio_manager_play_music(_track_id)
/// @desc Start crossfade to a new music track. If same track, do nothing.
/// @param {string} _track_id  Asset name string (e.g., "mus_coppervale_spring")
function audio_manager_play_music(_track_id) {
    var _m = global.audio_music;
    
    // Resolve seasonal placeholder
    if (_track_id == "_seasonal_coppervale") {
        var _suffix = _audio_season_name(global.time_season);
        _track_id = "mus_coppervale_" + _suffix;
    }
    
    // Don't restart same track
    if (_track_id == _m.current_track && _m.crossfade_timer <= 0) return;
    if (_track_id == _m.next_track && _m.crossfade_timer > 0) return;
    
    // Resolve asset
    var _asset = asset_get_index(_track_id);
    if (_asset == -1) {
        show_debug_message("[AUDIO] WARNING: Music asset not found: " + _track_id);
        return;
    }
    
    // If already crossfading, kill the old outgoing track immediately
    if (_m.crossfade_timer > 0 && _m.current_sound != -1) {
        audio_stop_sound(_m.current_sound);
    }
    
    // Promote current next to current (if crossfading)
    if (_m.crossfade_timer > 0 && _m.next_sound != -1) {
        _m.current_sound = _m.next_sound;
        _m.current_track = _m.next_track;
    }
    
    // Start new track at 0 gain
    _m.next_track = _track_id;
    _m.next_sound = audio_play_sound(_asset, 0, true);  // priority 0, looping
    audio_sound_gain(_m.next_sound, 0, 0);  // Start silent
    
    // Begin crossfade
    _m.crossfade_timer = _m.crossfade_total;
    
    show_debug_message("[AUDIO] Crossfading to: " + _track_id);
}

/// @func audio_manager_stop_music()
/// @desc Fade out all music over crossfade duration.
function audio_manager_stop_music() {
    var _m = global.audio_music;
    if (_m.current_sound != -1 && audio_is_playing(_m.current_sound)) {
        audio_sound_gain(_m.current_sound, 0, AUDIO_CROSSFADE_FRAMES * (1000/60));
    }
    if (_m.next_sound != -1 && audio_is_playing(_m.next_sound)) {
        audio_sound_gain(_m.next_sound, 0, AUDIO_CROSSFADE_FRAMES * (1000/60));
    }
    _m.current_track = "";
    _m.next_track = "";
}

// ============================================================================
// UPDATE (Called every step)
// ============================================================================

/// @func audio_manager_update()
/// @desc Main update loop. Handles crossfades, night gain, raid layers. Call in Step event.
function audio_manager_update() {
    var _m = global.audio_music;
    
    // --- Music Crossfade ---
    if (_m.crossfade_timer > 0) {
        _m.crossfade_timer--;
        var _progress = 1.0 - (_m.crossfade_timer / _m.crossfade_total);
        var _gain = _audio_calc_music_gain();
        
        // Fade out old
        if (_m.current_sound != -1 && audio_is_playing(_m.current_sound)) {
            audio_sound_gain(_m.current_sound, _gain * (1.0 - _progress), 0);
        }
        // Fade in new
        if (_m.next_sound != -1 && audio_is_playing(_m.next_sound)) {
            audio_sound_gain(_m.next_sound, _gain * _progress, 0);
        }
        
        // Crossfade complete
        if (_m.crossfade_timer <= 0) {
            // Stop old track
            if (_m.current_sound != -1) {
                audio_stop_sound(_m.current_sound);
            }
            // Promote next to current
            _m.current_sound = _m.next_sound;
            _m.current_track = _m.next_track;
            _m.next_sound = -1;
            _m.next_track = "";
            
            // Ensure full gain
            if (_m.current_sound != -1) {
                audio_sound_gain(_m.current_sound, _audio_calc_music_gain(), 0);
            }
        }
    }
    
    // --- Night Music Dimming ---
    var _hour = global.time_hour;
    var _is_night = (_hour >= AUDIO_NIGHT_START_HOUR || _hour < AUDIO_NIGHT_END_HOUR);
    _m.target_gain = _is_night ? AUDIO_NIGHT_MUSIC_GAIN : 1.0;
    _m.current_gain = lerp(_m.current_gain, _m.target_gain, 0.02);
    
    // Apply gain if not crossfading (crossfade handles its own gain)
    if (_m.crossfade_timer <= 0 && _m.current_sound != -1 && audio_is_playing(_m.current_sound)) {
        audio_sound_gain(_m.current_sound, _audio_calc_music_gain(), 0);
    }
    
    // --- Raid Layer Updates ---
    if (global.audio_raid_layers.active) {
        _audio_update_raid_layers();
    }
    
    // --- Ambient Update ---
    ambient_update();
}

// ============================================================================
// ROOM & STATE HOOKS
// ============================================================================

/// @func audio_manager_on_room_enter(_room_id)
/// @desc Called when player enters a new room. Selects appropriate music + ambience.
/// @param {string} _room_id
function audio_manager_on_room_enter(_room_id) {
    // Skip if in override state (raid, festival, etc.)
    if (global.game_state == "STATE_RAID" || global.game_state == "STATE_FESTIVAL") return;
    
    var _season = global.time_season;
    
    // Look up room+season specific track first
    var _key = _room_id + "|" + string(_season);
    var _track = ds_map_find_value(global.audio_room_music_map, _key);
    
    // If no season-specific entry, try season=-1 (any season)
    if (_track == undefined) {
        _key = _room_id + "|-1";
        _track = ds_map_find_value(global.audio_room_music_map, _key);
    }
    
    if (_track != undefined) {
        audio_manager_play_music(_track);
    }
    
    // Trigger ambience change
    ambient_on_room_enter(_room_id);
    
    global.audio_last_room = _room_id;
    global.audio_last_season = _season;
}

/// @func audio_manager_on_state_change(_new_state, _context)
/// @desc Called when game state changes. Handles music overrides for raids, festivals, etc.
/// @param {string} _new_state   e.g., "STATE_RAID", "STATE_FESTIVAL", "STATE_GAMEPLAY"
/// @param {string} _context     Additional context (faction name, festival ID, etc.)
function audio_manager_on_state_change(_new_state, _context) {
    var _overrides = global.audio_state_overrides;
    
    for (var _i = 0; _i < array_length(_overrides); _i++) {
        var _o = _overrides[_i];
        if (_o.game_state == _new_state) {
            // Check context match (faction, festival, etc.)
            var _match = true;
            if (variable_struct_exists(_o, "faction") && _o.faction != "default") {
                _match = (_o.faction == _context);
            }
            if (variable_struct_exists(_o, "festival")) {
                _match = (_o.festival == _context);
            }
            
            if (_match) {
                audio_manager_play_music(_o.track);
                return;
            }
        }
    }
    
    // If returning to gameplay, re-evaluate room music
    if (_new_state == "STATE_GAMEPLAY") {
        audio_manager_on_room_enter(global.audio_last_room);
    }
}

/// @func audio_manager_on_season_change(_new_season)
/// @desc Called when season changes. Swaps seasonal music variant if applicable.
/// @param {real} _new_season  0-3
function audio_manager_on_season_change(_new_season) {
    // Skip if in override state
    if (global.game_state != "STATE_GAMEPLAY") return;
    
    // Re-evaluate current room music with new season
    global.audio_last_season = _new_season;
    audio_manager_on_room_enter(global.audio_last_room);
}

// ============================================================================
// RAID MUSIC LAYERS
// ============================================================================

/// @func audio_manager_raid_start(_faction)
/// @desc Begin raid music with base layer. Called by scr_raid_system on raid start.
/// @param {string} _faction  "default"|"rust_wolves"|"iron_marauders"|"tide_reavers"|"boss_marshal"|"siege"
function audio_manager_raid_start(_faction) {
    var _rl = global.audio_raid_layers;
    var _cfg = global.audio_config.raid_layers;
    
    _rl.active = true;
    _rl.faction = _faction;
    _rl.escalation_active = false;
    _rl.crisis_active = false;
    _rl.escalation_gain = 0.0;
    _rl.crisis_gain = 0.0;
    _rl.escalation_target = 0.0;
    _rl.crisis_target = 0.0;
    
    // Play faction-specific track via state override
    audio_manager_on_state_change("STATE_RAID", _faction);
    
    // Start base layer (plays alongside main raid track for layered raids)
    var _base_asset = asset_get_index(_cfg.base_track);
    if (_base_asset != -1) {
        _rl.base_sound = audio_play_sound(_base_asset, 0, true);
        var _gain = global.audio_volumes.master * global.audio_volumes.music;
        audio_sound_gain(_rl.base_sound, _gain, 0);
    }
    
    // Pre-load escalation and crisis layers (start at 0 gain)
    var _esc_asset = asset_get_index(_cfg.escalation_track);
    if (_esc_asset != -1) {
        _rl.escalation_sound = audio_play_sound(_esc_asset, 0, true);
        audio_sound_gain(_rl.escalation_sound, 0, 0);
    }
    
    var _crisis_asset = asset_get_index(_cfg.crisis_track);
    if (_crisis_asset != -1) {
        _rl.crisis_sound = audio_play_sound(_crisis_asset, 0, true);
        audio_sound_gain(_rl.crisis_sound, 0, 0);
    }
    
    show_debug_message("[AUDIO] Raid music started — faction: " + _faction);
}

/// @func audio_manager_raid_escalate(_wave_num)
/// @desc Activate escalation layer if wave threshold met.
/// @param {real} _wave_num  Current wave number
function audio_manager_raid_escalate(_wave_num) {
    var _rl = global.audio_raid_layers;
    var _cfg = global.audio_config.raid_layers;
    
    if (!_rl.active) return;
    
    if (_wave_num >= _cfg.escalation_wave_threshold && !_rl.escalation_active) {
        _rl.escalation_active = true;
        _rl.escalation_target = 1.0;
        show_debug_message("[AUDIO] Raid escalation layer activated at wave " + string(_wave_num));
    }
}

/// @func audio_manager_raid_crisis(_active)
/// @desc Toggle crisis layer on/off (breached defenses, low HP).
/// @param {bool} _active
function audio_manager_raid_crisis(_active) {
    var _rl = global.audio_raid_layers;
    if (!_rl.active) return;
    
    _rl.crisis_active = _active;
    _rl.crisis_target = _active ? 1.0 : 0.0;
    show_debug_message("[AUDIO] Raid crisis layer: " + (_active ? "ON" : "OFF"));
}

/// @func audio_manager_raid_end()
/// @desc Stop all raid layers and return to normal music.
function audio_manager_raid_end() {
    var _rl = global.audio_raid_layers;
    _rl.active = false;
    
    if (_rl.base_sound != -1) audio_stop_sound(_rl.base_sound);
    if (_rl.escalation_sound != -1) audio_stop_sound(_rl.escalation_sound);
    if (_rl.crisis_sound != -1) audio_stop_sound(_rl.crisis_sound);
    
    _rl.base_sound = -1;
    _rl.escalation_sound = -1;
    _rl.crisis_sound = -1;
    
    show_debug_message("[AUDIO] Raid music ended.");
}

/// @func audio_manager_mech_deploy()
/// @desc Hard crossfade to mech combat music. Called by scr_mech_combat.
function audio_manager_mech_deploy() {
    audio_manager_on_state_change("SUB_RAID_MECH", "default");
    show_debug_message("[AUDIO] Mech deployed — switching to mech music.");
}

/// @func audio_manager_mech_exit()
/// @desc Return to raid music with current layer state.
function audio_manager_mech_exit() {
    var _rl = global.audio_raid_layers;
    audio_manager_on_state_change("STATE_RAID", _rl.faction);
    show_debug_message("[AUDIO] Mech exited — returning to raid music.");
}

/// @func _audio_update_raid_layers()
/// @desc Internal: fade raid layers in/out each frame.
function _audio_update_raid_layers() {
    var _rl = global.audio_raid_layers;
    var _gain = global.audio_volumes.master * global.audio_volumes.music;
    var _fade_speed = 1.0 / AUDIO_LAYER_FADE_FRAMES;
    
    // Escalation layer
    if (_rl.escalation_sound != -1) {
        _rl.escalation_gain = lerp(_rl.escalation_gain, _rl.escalation_target, _fade_speed);
        if (audio_is_playing(_rl.escalation_sound)) {
            audio_sound_gain(_rl.escalation_sound, _gain * _rl.escalation_gain, 0);
        }
    }
    
    // Crisis layer
    if (_rl.crisis_sound != -1) {
        _rl.crisis_gain = lerp(_rl.crisis_gain, _rl.crisis_target, _fade_speed);
        if (audio_is_playing(_rl.crisis_sound)) {
            audio_sound_gain(_rl.crisis_sound, _gain * _rl.crisis_gain, 0);
        }
    }
}

// ============================================================================
// SAVE / LOAD
// ============================================================================

/// @func audio_manager_save_settings()
/// @desc Returns a struct of audio settings to include in save data.
/// @returns {struct}
function audio_manager_save_settings() {
    return {
        master:   global.audio_volumes.master,
        music:    global.audio_volumes.music,
        ambient:  global.audio_volumes.ambient,
        sfx:      global.audio_volumes.sfx,
        ui:       global.audio_volumes.ui,
        dialogue: global.audio_volumes.dialogue
    };
}

/// @func audio_manager_load_settings(_data)
/// @desc Restore audio settings from save data.
/// @param {struct} _data  Struct with volume keys
function audio_manager_load_settings(_data) {
    if (_data == undefined) return;
    
    var _keys = ["master", "music", "ambient", "sfx", "ui", "dialogue"];
    for (var _i = 0; _i < array_length(_keys); _i++) {
        var _k = _keys[_i];
        if (variable_struct_exists(_data, _k)) {
            variable_struct_set(global.audio_volumes, _k, variable_struct_get(_data, _k));
        }
    }
    
    // Re-apply gains
    _audio_apply_music_gain();
    ambient_apply_gain();
    
    show_debug_message("[AUDIO] Settings loaded from save data.");
}

// ============================================================================
// CLEANUP
// ============================================================================

/// @func audio_manager_cleanup()
/// @desc Stop all audio and free resources. Call on game exit.
function audio_manager_cleanup() {
    audio_stop_all();
    ds_map_destroy(global.audio_room_music_map);
    show_debug_message("[AUDIO] Audio manager cleaned up.");
}
