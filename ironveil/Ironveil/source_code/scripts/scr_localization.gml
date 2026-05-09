/// scr_localization.gml
/// Localization infrastructure: string externalization and UI text helpers.
/// Objective #46: Localization Hooks
///
/// Extends the existing str() function from Objective #3 with:
/// - Proper JSON string table loading
/// - Category-organized keys (ui.*, system.*, toast.*, tutorial.*)
/// - Fallback to key name if translation missing
/// - Text truncation helper for UI overflow prevention
///
/// Dependencies: scr_data

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func localization_init()
/// @desc Loads the master string table. Call during boot after data_load_all().
function localization_init() {
    global.localization = {
        strings: {},
        language: "en",
        fallback_language: "en",
        loaded: false
    };
    
    var _path = "data/config/strings_" + global.localization.language + ".json";
    var _data = data_load_file(_path);
    
    if (_data != undefined) {
        if (variable_struct_exists(_data, "_meta")) {
            variable_struct_remove(_data, "_meta");
        }
        
        // Flatten nested categories into dot-notation keys
        // e.g., { "ui": { "save": "Save Game" } } -> "ui.save" = "Save Game"
        _loc_flatten_strings(_data, "");
        
        global.localization.loaded = true;
        show_debug_message("INFO: Localization loaded (" 
            + string(variable_struct_names_count(global.localization.strings)) 
            + " strings, language: " + global.localization.language + ")");
    } else {
        show_debug_message("WARN: String table not found: " + _path 
            + ". Using hardcoded fallbacks.");
    }
}

/// @func _loc_flatten_strings(_struct, _prefix)
/// @desc Recursively flattens a nested struct into dot-notation string keys.
/// @param {struct} _struct  Source struct (possibly nested)
/// @param {string} _prefix  Current key prefix (e.g., "ui.")
function _loc_flatten_strings(_struct, _prefix) {
    var _keys = variable_struct_get_names(_struct);
    for (var _i = 0; _i < array_length(_keys); _i++) {
        var _key = _keys[_i];
        if (_key == "_meta") continue;
        
        var _val = _struct[$ _key];
        var _full_key = (_prefix != "") ? _prefix + "." + _key : _key;
        
        if (is_struct(_val)) {
            // Nested category — recurse
            _loc_flatten_strings(_val, _full_key);
        } else if (is_string(_val)) {
            // Leaf string — store
            global.localization.strings[$ _full_key] = _val;
        }
    }
}

// ============================================================================
// STRING LOOKUP
// ============================================================================

/// @func loc(_key)
/// @desc Look up a localized string by key. Falls back to key name if not found.
///       This enhances the existing str() function — use loc() for all new code.
/// @param {string} _key  String key (e.g., "ui.save_game", "system.quest_complete")
/// @returns {string} Localized string, or the key itself if not found
function loc(_key) {
    if (global.localization.loaded 
        && variable_struct_exists(global.localization.strings, _key)) {
        return global.localization.strings[$ _key];
    }
    
    // Fallback: return the key name, formatted for readability
    // "ui.save_game" -> "Save Game"
    var _fallback = _key;
    var _dot_pos = string_pos(".", _fallback);
    if (_dot_pos > 0) {
        _fallback = string_copy(_fallback, _dot_pos + 1, string_length(_fallback) - _dot_pos);
    }
    _fallback = string_replace_all(_fallback, "_", " ");
    
    // Capitalize first letter
    if (string_length(_fallback) > 0) {
        _fallback = string_upper(string_char_at(_fallback, 1)) 
            + string_copy(_fallback, 2, string_length(_fallback) - 1);
    }
    
    return _fallback;
}

/// @func loc_format(_key, _replacements)
/// @desc Look up a localized string and replace tokens.
///       Tokens use {token_name} format.
/// @param {string} _key  String key
/// @param {struct} _replacements  Struct of { token_name: replacement_value }
/// @returns {string}
function loc_format(_key, _replacements) {
    var _text = loc(_key);
    
    var _rep_keys = variable_struct_get_names(_replacements);
    for (var _i = 0; _i < array_length(_rep_keys); _i++) {
        var _token = "{" + _rep_keys[_i] + "}";
        var _value = string(_replacements[$ _rep_keys[_i]]);
        _text = string_replace_all(_text, _token, _value);
    }
    
    return _text;
}

// ============================================================================
// UI TEXT HELPERS
// ============================================================================

/// @func loc_truncate(_text, _max_width, _font)
/// @desc Truncates text with ellipsis if it exceeds max pixel width.
///       Use for fixed-width UI elements to prevent overflow.
/// @param {string} _text  Text to potentially truncate
/// @param {real} _max_width  Maximum pixel width
/// @param {real} _font  Font to measure with (-1 for current)
/// @returns {string} Original or truncated text
function loc_truncate(_text, _max_width, _font) {
    var _prev_font = -1;
    if (_font != -1) {
        _prev_font = draw_get_font();
        draw_set_font(_font);
    }
    
    if (string_width(_text) <= _max_width) {
        if (_prev_font != -1) draw_set_font(_prev_font);
        return _text;
    }
    
    // Binary search for the longest substring that fits with "..."
    var _ellipsis_w = string_width("...");
    var _target_w = _max_width - _ellipsis_w;
    
    var _lo = 0;
    var _hi = string_length(_text);
    
    while (_lo < _hi) {
        var _mid = floor((_lo + _hi + 1) / 2);
        var _sub = string_copy(_text, 1, _mid);
        if (string_width(_sub) <= _target_w) {
            _lo = _mid;
        } else {
            _hi = _mid - 1;
        }
    }
    
    if (_prev_font != -1) draw_set_font(_prev_font);
    
    if (_lo < string_length(_text)) {
        return string_copy(_text, 1, _lo) + "...";
    }
    return _text;
}

/// @func loc_measure_and_warn(_key, _max_width, _font)
/// @desc Debug helper: measures a localized string and warns if it would overflow.
///       Use during development to identify UI elements that need flexibility.
/// @param {string} _key  String key
/// @param {real} _max_width  Maximum pixel width for the UI element
/// @param {real} _font  Font to measure with
/// @returns {real} Pixel width of the localized string
function loc_measure_and_warn(_key, _max_width, _font) {
    var _prev_font = draw_get_font();
    draw_set_font(_font);
    
    var _text = loc(_key);
    var _width = string_width(_text);
    
    if (_width > _max_width) {
        show_debug_message("WARN: Localization overflow — key '" + _key 
            + "' is " + string(round(_width)) + "px wide (max " + string(_max_width) + "px)"
            + " | Text: \"" + _text + "\"");
    }
    
    draw_set_font(_prev_font);
    return _width;
}

// ============================================================================
// STRING TABLE TEMPLATE
// ============================================================================

/// @func localization_generate_template()
/// @desc Generates a template strings_en.json by scanning all loc() calls.
///       For development use — helps identify strings that need externalization.
///       Returns a struct that can be saved as JSON.
/// @returns {struct} Template string table
function localization_generate_template() {
    // This is a convenience function for development.
    // In practice, the string table is built manually or by automated tooling.
    // Below is the initial template structure:
    
    return {
        _meta: {
            description: "Master string table for Ironveil. Language: English.",
            version: "1.0",
            language: "en"
        },
        ui: {
            save_game: "Save Game",
            load_game: "Load Game",
            settings: "Settings",
            quit: "Quit",
            resume: "Resume",
            inventory: "Inventory",
            crafting: "Crafting",
            journal: "Journal",
            map: "Map",
            close: "Close",
            confirm: "Confirm",
            cancel: "Cancel",
            back: "Back",
            yes: "Yes",
            no: "No",
            master_volume: "Master",
            music_volume: "Music",
            ambient_volume: "Ambient",
            sfx_volume: "SFX",
            ui_volume: "UI",
            ai_dialogue: "AI Dialogue",
            enable: "Enable",
            api_key: "API Key",
            model: "Model",
            test_connection: "Test Connection",
            testing: "Testing...",
            connected: "Connected",
            not_connected: "Not Connected",
            disabled: "Disabled",
            requests_left: "{count} requests left",
            openrouter_hint: "Free API key at openrouter.ai"
        },
        system: {
            quest_complete: "Quest Complete!",
            quest_failed: "Quest Failed",
            quest_new: "New Quest: {quest_name}",
            objective_complete: "Objective Complete",
            item_received: "Received: {item_name} x{quantity}",
            cogs_received: "+{amount} Cogs",
            reputation_gained: "+{amount} Reputation",
            heart_gained: "{npc_name}: +{amount} Heart Points",
            blueprint_discovered: "Blueprint Discovered: {blueprint_name}",
            save_complete: "Game Saved",
            load_complete: "Game Loaded",
            raid_warning: "RAID WARNING: {faction_name} approaching from the {direction}!",
            raid_victory: "Raid Repelled!",
            raid_defeat: "Defenses Breached!",
            festival_start: "The {festival_name} has begun!",
            season_change: "{season} has arrived.",
            day_change: "Day {day}"
        },
        toast: {
            energy_low: "Energy Low — Consider resting or eating",
            energy_depleted: "Exhausted! You collapse...",
            machine_needs_maintenance: "{machine_name} needs maintenance!",
            machine_breakdown: "{machine_name} has broken down!",
            npc_birthday: "It's {npc_name}'s birthday today!",
            trade_route_active: "Trade route to {town_name} is now active",
            achievement_unlocked: "Achievement: {achievement_name}"
        },
        tutorial: {
            move: "Use arrow keys or joystick to move",
            interact: "Press {action_key} to interact",
            craft: "Approach a workstation and press {action_key} to craft",
            inventory_open: "Press {inventory_key} to open your inventory",
            save_hint: "Sleep in your bed to save the game"
        },
        dialogue: {
            ai_thinking: "...",
            ai_error: "(The connection flickers briefly)",
            choice_prompt: "Choose your response:"
        }
    };
}

// ============================================================================
// SAVE / LOAD
// ============================================================================

/// @func localization_save()
/// @desc Returns localization preferences for save file.
/// @returns {struct}
function localization_save() {
    return {
        language: global.localization.language
    };
}

/// @func localization_load(_save_data)
/// @desc Restores localization preferences. Reloads string table if language changed.
/// @param {struct} _save_data
function localization_load(_save_data) {
    if (_save_data == undefined) return;
    
    var _new_lang = variable_struct_exists(_save_data, "language") 
        ? _save_data.language : "en";
    
    if (_new_lang != global.localization.language) {
        global.localization.language = _new_lang;
        localization_init(); // Reload with new language
    }
}
