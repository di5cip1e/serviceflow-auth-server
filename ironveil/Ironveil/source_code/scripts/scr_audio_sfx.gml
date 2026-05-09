/// scr_audio_sfx.gml
/// Ironveil — SFX & Dialogue System (Part of Objective #39)
/// Priority-based SFX playback, positional audio, terrain footsteps, NPC vocal clips.

// ============================================================================
// MACROS
// ============================================================================
#macro SFX_MAX_CONCURRENT     8
#macro SFX_FALLOFF_REF_DIST   32     // Pixels — full volume within this range
#macro SFX_FALLOFF_MAX_DIST   320    // Pixels — silent beyond this range
#macro SFX_FOOTSTEP_INTERVAL  18     // Frames between footstep sounds (walking)
#macro SFX_FOOTSTEP_RUN_INT   12     // Frames between footstep sounds (running)

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func sfx_init()
/// @desc Initialize SFX system. Called by audio_manager_init().
function sfx_init() {
    global.audio_sfx = {
        config:       {},             // SFX definitions from audio_config
        priorities:   {},             // Priority level lookup
        active:       array_create(SFX_MAX_CONCURRENT, -1),  // Active sound instance IDs
        active_pri:   array_create(SFX_MAX_CONCURRENT, 0),   // Priority of each active slot
        active_count: 0,
        
        footstep_timer: 0,            // Frames until next footstep allowed
        
        npc_vocals:   {},             // NPC vocal clip pools
        vocal_queue:  [],             // Queued vocal clips
        vocal_playing: -1             // Currently playing vocal instance
    };
    
    // Load SFX config
    var _cfg = global.audio_config;
    global.audio_sfx.config = _cfg.sfx;
    global.audio_sfx.priorities = _cfg.sfx_priority_levels;
    global.audio_sfx.npc_vocals = _cfg.npc_vocals;
    
    show_debug_message("[SFX] SFX system initialized. " + string(variable_struct_names_count(global.audio_sfx.config)) + " effects loaded.");
}

// ============================================================================
// GAIN HELPERS
// ============================================================================

/// @func _sfx_calc_gain(_category)
/// @desc Calculate effective gain for an SFX based on channel.
/// @param {string} _category  "ui"|"combat"|"workshop"|"dialogue"|"environmental"
/// @returns {real}
function _sfx_calc_gain(_category) {
    var _vol_key = (_category == "ui") ? "ui" : ((_category == "dialogue") ? "dialogue" : "sfx");
    return global.audio_volumes.master * variable_struct_get(global.audio_volumes, _vol_key);
}

// ============================================================================
// PRIORITY MANAGEMENT
// ============================================================================

/// @func _sfx_get_priority_level(_category)
/// @desc Get numeric priority for a category. Higher = more important.
/// @param {string} _category
/// @returns {real}
function _sfx_get_priority_level(_category) {
    var _p = global.audio_sfx.priorities;
    if (variable_struct_exists(_p, _category)) {
        return variable_struct_get(_p, _category);
    }
    return 0;
}

/// @func _sfx_find_slot(_priority)
/// @desc Find a slot for a new SFX. Returns slot index or -1 if all slots are higher priority.
/// @param {real} _priority
/// @returns {real}
function _sfx_find_slot(_priority) {
    var _s = global.audio_sfx;
    
    // First: find an empty slot (sound finished)
    for (var _i = 0; _i < SFX_MAX_CONCURRENT; _i++) {
        if (_s.active[_i] == -1 || !audio_is_playing(_s.active[_i])) {
            return _i;
        }
    }
    
    // All slots full: find lowest priority slot that is lower than new sound
    var _lowest_pri = _priority;
    var _lowest_idx = -1;
    for (var _i = 0; _i < SFX_MAX_CONCURRENT; _i++) {
        if (_s.active_pri[_i] < _lowest_pri) {
            _lowest_pri = _s.active_pri[_i];
            _lowest_idx = _i;
        }
    }
    
    return _lowest_idx;
}

// ============================================================================
// SFX PLAYBACK
// ============================================================================

/// @func sfx_play(_sfx_id)
/// @desc Play a sound effect with configured gain, pitch variance, and priority.
/// @param {string} _sfx_id  e.g., "sfx_hammer_anvil"
/// @returns {real}  Sound instance ID or -1 if skipped
function sfx_play(_sfx_id) {
    var _s = global.audio_sfx;
    var _cfg = _s.config;
    
    if (!variable_struct_exists(_cfg, _sfx_id)) {
        show_debug_message("[SFX] WARNING: Unknown SFX: " + _sfx_id);
        return -1;
    }
    
    var _def = variable_struct_get(_cfg, _sfx_id);
    var _pri_level = _sfx_get_priority_level(_def.priority);
    
    // Find a slot
    var _slot = _sfx_find_slot(_pri_level);
    if (_slot == -1) return -1;  // All slots higher priority
    
    // Stop existing sound in slot if occupied
    if (_s.active[_slot] != -1 && audio_is_playing(_s.active[_slot])) {
        audio_stop_sound(_s.active[_slot]);
    }
    
    // Resolve asset
    var _asset = asset_get_index(_sfx_id);
    if (_asset == -1) {
        show_debug_message("[SFX] WARNING: Asset not found: " + _sfx_id);
        return -1;
    }
    
    // Calculate gain and pitch
    var _gain = _def.gain * _sfx_calc_gain(_def.priority);
    var _pitch = random_range(_def.pitch_min, _def.pitch_max);
    
    // Play
    var _snd = audio_play_sound(_asset, _pri_level, false);  // not looping
    audio_sound_gain(_snd, _gain, 0);
    audio_sound_pitch(_snd, _pitch);
    
    // Track in slot
    _s.active[_slot] = _snd;
    _s.active_pri[_slot] = _pri_level;
    
    return _snd;
}

/// @func sfx_play_at(_sfx_id, _x, _y)
/// @desc Play a positional SFX with distance-based gain falloff from camera center.
/// @param {string} _sfx_id
/// @param {real}   _x  World X position
/// @param {real}   _y  World Y position
/// @returns {real}  Sound instance ID or -1
function sfx_play_at(_sfx_id, _x, _y) {
    // Calculate distance from camera center
    var _cam_x = camera_get_view_x(view_camera[0]) + camera_get_view_width(view_camera[0]) / 2;
    var _cam_y = camera_get_view_y(view_camera[0]) + camera_get_view_height(view_camera[0]) / 2;
    var _dist = point_distance(_cam_x, _cam_y, _x, _y);
    
    // Beyond max distance — don't play
    if (_dist > SFX_FALLOFF_MAX_DIST) return -1;
    
    // Calculate distance attenuation
    var _atten = 1.0;
    if (_dist > SFX_FALLOFF_REF_DIST) {
        _atten = 1.0 - ((_dist - SFX_FALLOFF_REF_DIST) / (SFX_FALLOFF_MAX_DIST - SFX_FALLOFF_REF_DIST));
        _atten = clamp(_atten, 0.0, 1.0);
    }
    
    // Play the sound
    var _snd = sfx_play(_sfx_id);
    if (_snd != -1) {
        // Apply distance attenuation on top of existing gain
        var _current_gain = audio_sound_get_gain(_snd);
        audio_sound_gain(_snd, _current_gain * _atten, 0);
    }
    
    return _snd;
}

/// @func sfx_play_ui(_sfx_id)
/// @desc Play a UI sound effect. Highest priority, always plays.
/// @param {string} _sfx_id
/// @returns {real}
function sfx_play_ui(_sfx_id) {
    var _cfg = global.audio_sfx.config;
    
    if (!variable_struct_exists(_cfg, _sfx_id)) {
        show_debug_message("[SFX] WARNING: Unknown UI SFX: " + _sfx_id);
        return -1;
    }
    
    var _def = variable_struct_get(_cfg, _sfx_id);
    var _asset = asset_get_index(_sfx_id);
    if (_asset == -1) return -1;
    
    var _gain = _def.gain * global.audio_volumes.master * global.audio_volumes.ui;
    var _pitch = random_range(_def.pitch_min, _def.pitch_max);
    
    var _snd = audio_play_sound(_asset, 10, false);  // High priority
    audio_sound_gain(_snd, _gain, 0);
    audio_sound_pitch(_snd, _pitch);
    
    return _snd;
}

// ============================================================================
// TERRAIN FOOTSTEPS
// ============================================================================

/// @func sfx_play_footstep(_terrain_type, _is_running)
/// @desc Play terrain-appropriate footstep sound with timing control.
/// @param {string} _terrain_type  "GRASS"|"STONE"|"WOOD"|"METAL"|"SAND"|"SNOW"
/// @param {bool}   _is_running    True if player is running
function sfx_play_footstep(_terrain_type, _is_running) {
    var _s = global.audio_sfx;
    
    // Respect timing interval
    if (_s.footstep_timer > 0) {
        _s.footstep_timer--;
        return;
    }
    
    // Look up footstep SFX from terrain map
    var _map = global.audio_config.footstep_terrain_map;
    var _sfx_id = "sfx_footstep_stone";  // Default
    if (variable_struct_exists(_map, _terrain_type)) {
        _sfx_id = variable_struct_get(_map, _terrain_type);
    } else if (variable_struct_exists(_map, "DEFAULT")) {
        _sfx_id = variable_struct_get(_map, "DEFAULT");
    }
    
    sfx_play(_sfx_id);
    
    // Set cooldown
    _s.footstep_timer = _is_running ? SFX_FOOTSTEP_RUN_INT : SFX_FOOTSTEP_INTERVAL;
}

// ============================================================================
// NPC VOCAL CLIPS
// ============================================================================

/// @func sfx_play_npc_vocal(_npc_id)
/// @desc Play a random vocal clip for an NPC during dialogue.
/// @param {string} _npc_id  e.g., "spark", "harrow"
function sfx_play_npc_vocal(_npc_id) {
    var _vocals = global.audio_sfx.npc_vocals;
    
    if (!variable_struct_exists(_vocals, _npc_id)) return;
    
    var _npc_data = variable_struct_get(_vocals, _npc_id);
    var _clips = _npc_data.clips;
    if (array_length(_clips) == 0) return;
    
    // Pick random clip
    var _clip_id = _clips[irandom(array_length(_clips) - 1)];
    var _asset = asset_get_index(_clip_id);
    if (_asset == -1) return;
    
    // Stop currently playing vocal
    var _s = global.audio_sfx;
    if (_s.vocal_playing != -1 && audio_is_playing(_s.vocal_playing)) {
        audio_stop_sound(_s.vocal_playing);
    }
    
    var _gain = global.audio_volumes.master * global.audio_volumes.dialogue;
    _s.vocal_playing = audio_play_sound(_asset, 5, false);
    audio_sound_gain(_s.vocal_playing, _gain, 0);
}

/// @func sfx_update()
/// @desc Update SFX system. Clean up finished sounds from active slots. Call each step.
function sfx_update() {
    var _s = global.audio_sfx;
    
    // Clean up finished active slots
    for (var _i = 0; _i < SFX_MAX_CONCURRENT; _i++) {
        if (_s.active[_i] != -1 && !audio_is_playing(_s.active[_i])) {
            _s.active[_i] = -1;
            _s.active_pri[_i] = 0;
        }
    }
}

// ============================================================================
// CLEANUP
// ============================================================================

/// @func sfx_cleanup()
/// @desc Stop all SFX. Called by audio_manager_cleanup().
function sfx_cleanup() {
    var _s = global.audio_sfx;
    for (var _i = 0; _i < SFX_MAX_CONCURRENT; _i++) {
        if (_s.active[_i] != -1 && audio_is_playing(_s.active[_i])) {
            audio_stop_sound(_s.active[_i]);
        }
        _s.active[_i] = -1;
    }
    if (_s.vocal_playing != -1) audio_stop_sound(_s.vocal_playing);
    show_debug_message("[SFX] SFX system cleaned up.");
}
