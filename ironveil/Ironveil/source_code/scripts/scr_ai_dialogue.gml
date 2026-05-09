/// scr_ai_dialogue.gml
/// Optional AI-powered dialogue via OpenRouter API (free models).
/// Players opt in via Settings, provide their own API key.
/// Falls back to scripted dialogue on any error/timeout/rate limit.
///
/// Dependencies: scr_dialogue_data, scr_npc_data, scr_mobile_ui (settings hooks)
/// Global data: global.ai_dialogue (config and state)

// ============================================================================
// CONFIGURATION
// ============================================================================

#macro AI_DIALOGUE_API_URL        "https://openrouter.ai/api/v1/chat/completions"
#macro AI_DIALOGUE_DEFAULT_MODEL  "stepfun/step-3.5-flash:free"
#macro AI_DIALOGUE_TIMEOUT_MS     8000
#macro AI_DIALOGUE_MAX_DAILY      180
#macro AI_DIALOGUE_MAX_PER_MIN    18
#macro AI_DIALOGUE_COOLDOWN_SEC   3

// ============================================================================
// INITIALIZATION
// ============================================================================

/// @func ai_dialogue_init()
/// @desc Initializes AI dialogue system. Called during boot.
///       Loads saved config (API key, enabled state, model choice).
function ai_dialogue_init() {
    global.ai_dialogue = {
        enabled: false,
        api_key: "",
        model: AI_DIALOGUE_DEFAULT_MODEL,
        connected: false,
        
        // Rate limiting
        requests_today: 0,
        requests_this_minute: [],   // Array of timestamps
        last_request_time: 0,
        last_reset_day: -1,
        
        // Async tracking
        pending_request_id: -1,
        pending_npc_id: "",
        pending_start_time: 0,
        pending_fallback: undefined,
        
        // Conversation memory (last 5 exchanges per NPC, in-memory only)
        conversation_history: {},
        
        // Prompt data (loaded from ai_prompts.json)
        prompts: undefined
    };
    
    // Load prompt data
    var _prompt_data = data_load_file("data/config/ai_prompts.json");
    if (_prompt_data != undefined) {
        if (variable_struct_exists(_prompt_data, "_meta")) {
            variable_struct_remove(_prompt_data, "_meta");
        }
        global.ai_dialogue.prompts = _prompt_data;
        show_debug_message("INFO: AI dialogue prompts loaded (" 
            + string(variable_struct_names_count(global.ai_dialogue.prompts.npc_prompts)) + " NPC profiles)");
    } else {
        show_debug_message("WARN: AI prompts file not found. AI dialogue will be unavailable.");
    }
    
    show_debug_message("INFO: AI dialogue system initialized (disabled by default).");
}

// ============================================================================
// API KEY MANAGEMENT
// ============================================================================

/// @func ai_dialogue_set_key(_key)
/// @desc Sets the OpenRouter API key and enables AI dialogue.
/// @param {string} _key  OpenRouter API key
function ai_dialogue_set_key(_key) {
    global.ai_dialogue.api_key = _key;
    global.ai_dialogue.enabled = (string_length(_key) > 10);
    global.ai_dialogue.connected = false; // Reset until validated
    show_debug_message("INFO: AI dialogue key " + (global.ai_dialogue.enabled ? "set" : "cleared"));
}

/// @func ai_dialogue_set_model(_model)
/// @desc Sets the OpenRouter model to use.
/// @param {string} _model  Model identifier (e.g., "stepfun/step-3.5-flash:free")
function ai_dialogue_set_model(_model) {
    global.ai_dialogue.model = _model;
    show_debug_message("INFO: AI dialogue model set to: " + _model);
}

/// @func ai_dialogue_test_connection()
/// @desc Sends a test request to validate the API key.
///       Result handled in ai_dialogue_async_http().
/// @returns {real} HTTP request ID, or -1 if not configured
function ai_dialogue_test_connection() {
    if (!global.ai_dialogue.enabled || global.ai_dialogue.api_key == "") return -1;
    
    var _headers = ds_map_create();
    ds_map_add(_headers, "Content-Type", "application/json");
    ds_map_add(_headers, "Authorization", "Bearer " + global.ai_dialogue.api_key);
    ds_map_add(_headers, "HTTP-Referer", "https://ironveil-game.com");
    ds_map_add(_headers, "X-Title", "Ironveil");
    
    var _body = json_stringify({
        model: global.ai_dialogue.model,
        messages: [
            { role: "user", content: "Reply with exactly: CONNECTION_OK" }
        ],
        max_tokens: 20,
        temperature: 0
    });
    
    var _req_id = http_request(AI_DIALOGUE_API_URL, "POST", _headers, _body);
    ds_map_destroy(_headers);
    
    global.ai_dialogue.pending_request_id = _req_id;
    global.ai_dialogue.pending_npc_id = "__test__";
    global.ai_dialogue.pending_start_time = current_time;
    
    show_debug_message("INFO: AI dialogue connection test sent (req " + string(_req_id) + ")");
    return _req_id;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/// @func _ai_dialogue_can_request()
/// @desc Checks if we're within rate limits.
/// @returns {bool}
function _ai_dialogue_can_request() {
    if (!global.ai_dialogue.enabled) return false;
    if (global.ai_dialogue.api_key == "") return false;
    if (global.ai_dialogue.prompts == undefined) return false;
    
    // Reset daily counter on new in-game day
    if (global.time_day != global.ai_dialogue.last_reset_day) {
        global.ai_dialogue.requests_today = 0;
        global.ai_dialogue.last_reset_day = global.time_day;
    }
    
    // Daily limit
    if (global.ai_dialogue.requests_today >= AI_DIALOGUE_MAX_DAILY) return false;
    
    // Per-minute limit (rolling window)
    var _now = current_time;
    var _minute_ago = _now - 60000;
    var _recent = [];
    for (var _i = 0; _i < array_length(global.ai_dialogue.requests_this_minute); _i++) {
        if (global.ai_dialogue.requests_this_minute[_i] > _minute_ago) {
            array_push(_recent, global.ai_dialogue.requests_this_minute[_i]);
        }
    }
    global.ai_dialogue.requests_this_minute = _recent;
    if (array_length(_recent) >= AI_DIALOGUE_MAX_PER_MIN) return false;
    
    // Cooldown between requests (prevent spam)
    if (_now - global.ai_dialogue.last_request_time < AI_DIALOGUE_COOLDOWN_SEC * 1000) return false;
    
    // Don't send if another request is pending
    if (global.ai_dialogue.pending_request_id != -1) return false;
    
    return true;
}

/// @func _ai_dialogue_record_request()
/// @desc Records that a request was made for rate limiting.
function _ai_dialogue_record_request() {
    global.ai_dialogue.requests_today++;
    array_push(global.ai_dialogue.requests_this_minute, current_time);
    global.ai_dialogue.last_request_time = current_time;
}

/// @func ai_dialogue_get_remaining_requests()
/// @desc Returns remaining daily requests for UI display.
/// @returns {real}
function ai_dialogue_get_remaining_requests() {
    return max(0, AI_DIALOGUE_MAX_DAILY - global.ai_dialogue.requests_today);
}

// ============================================================================
// CONTEXT BUILDING
// ============================================================================

/// @func _ai_dialogue_build_context(_npc_id)
/// @desc Builds the game state context string for an NPC dialogue request.
/// @param {string} _npc_id
/// @returns {string} Context string
function _ai_dialogue_build_context(_npc_id) {
    var _season_names = ["Spring", "Summer", "Autumn", "Winter"];
    var _season = _season_names[global.time_season];
    
    var _time_names = ["Dawn", "Morning", "Midday", "Afternoon", "Evening", "Night"];
    var _time_idx = clamp(floor(global.time_hour / 4), 0, 5);
    var _time_period = _time_names[_time_idx];
    
    var _weather = variable_struct_exists(global, "time_weather") ? global.time_weather : "CLEAR";
    
    // Heart level
    var _hearts = 0;
    if (ds_map_exists(global.npc_hearts, _npc_id)) {
        _hearts = floor(ds_map_find_value(global.npc_hearts, _npc_id) / 100);
    }
    
    var _rel_desc = "Stranger";
    if (_hearts >= 8) _rel_desc = "Deeply trusted partner";
    else if (_hearts >= 6) _rel_desc = "Close friend";
    else if (_hearts >= 4) _rel_desc = "Good friend";
    else if (_hearts >= 2) _rel_desc = "Friendly acquaintance";
    
    // Recent events
    var _events = [];
    if (variable_struct_exists(global, "story_flags")) {
        if (variable_struct_exists(global.story_flags, "flag_siege_survived"))
            array_push(_events, "Survived the Siege of Coppervale");
        if (variable_struct_exists(global.story_flags, "flag_marshal_declared_war"))
            array_push(_events, "The Marshal has declared war");
        if (variable_struct_exists(global.story_flags, "flag_trade_routes_open"))
            array_push(_events, "Trade routes established with other Beacon Towns");
        if (variable_struct_exists(global.story_flags, "flag_main_story_complete"))
            array_push(_events, "The war is over, Coppervale is at peace");
        if (variable_struct_exists(global.story_flags, "flag_wes_forgiven"))
            array_push(_events, "Wes was forgiven for his betrayal");
        if (variable_struct_exists(global.story_flags, "flag_wes_banished"))
            array_push(_events, "Wes was banished for his betrayal");
    }
    var _events_str = (array_length(_events) > 0) ? string_join_ext(", ", _events) : "Early days in Coppervale";
    
    // Town mood
    var _mood = "Hopeful";
    if (variable_struct_exists(global, "story_flags")) {
        if (variable_struct_exists(global.story_flags, "flag_main_story_complete")) _mood = "Peaceful and thriving";
        else if (variable_struct_exists(global.story_flags, "flag_marshal_declared_war")) _mood = "Tense and preparing for war";
        else if (variable_struct_exists(global.story_flags, "flag_trade_routes_open")) _mood = "Optimistic with new connections";
    }
    
    // Active festival
    var _extra = "";
    if (variable_struct_exists(global, "active_festival") && global.active_festival != "") {
        _extra = "Currently celebrating the " + global.active_festival + ". ";
    }
    
    // Build from template
    var _template = global.ai_dialogue.prompts.context_template;
    _template = string_replace(_template, "{year}", string(global.time_year));
    _template = string_replace(_template, "{season}", _season);
    _template = string_replace(_template, "{day}", string(global.time_day));
    _template = string_replace(_template, "{time_period}", _time_period);
    _template = string_replace(_template, "{weather}", _weather);
    _template = string_replace(_template, "{recent_events}", _events_str);
    _template = string_replace(_template, "{town_mood}", _mood);
    _template = string_replace(_template, "{hearts}", string(_hearts));
    _template = string_replace(_template, "{relationship_desc}", _rel_desc);
    _template = string_replace(_template, "{extra_context}", _extra);
    
    return _template;
}

/// @func _ai_dialogue_build_messages(_npc_id)
/// @desc Builds the full messages array for the API request.
/// @param {string} _npc_id
/// @returns {array} Messages array for chat completion
function _ai_dialogue_build_messages(_npc_id) {
    var _prompts = global.ai_dialogue.prompts;
    var _npc_prompt = _prompts.npc_prompts[$ _npc_id];
    
    if (_npc_prompt == undefined) return undefined;
    
    // System message: base instruction + NPC personality
    var _system = _prompts.system_instruction + "\n\n"
        + "CHARACTER: " + _npc_prompt.name + "\n"
        + "ROLE: " + _npc_prompt.role + "\n"
        + "PERSONALITY: " + _npc_prompt.personality + "\n"
        + "SPEECH STYLE: " + _npc_prompt.speech_style + "\n\n"
        + "RESPONSE FORMAT: " + _prompts.response_format;
    
    // Context message
    var _context = _ai_dialogue_build_context(_npc_id);
    
    var _messages = [
        { role: "system", content: _system },
        { role: "user", content: _context + "\n\nJack approaches " + _npc_prompt.name + " to chat. Generate a contextually appropriate greeting or comment." }
    ];
    
    // Add conversation history if available
    var _history = global.ai_dialogue.conversation_history[$ _npc_id];
    if (_history != undefined && array_length(_history) > 0) {
        // Insert history before the final user message
        var _final_msg = array_pop(_messages);
        for (var _i = 0; _i < array_length(_history); _i++) {
            array_push(_messages, _history[_i]);
        }
        array_push(_messages, _final_msg);
    }
    
    return _messages;
}

// ============================================================================
// REQUEST / RESPONSE
// ============================================================================

/// @func ai_dialogue_request(_npc_id, _fallback_entry)
/// @desc Sends an AI dialogue request for an NPC. Non-blocking.
///       If the request fails or times out, _fallback_entry is used.
/// @param {string} _npc_id  NPC identifier
/// @param {struct|undefined} _fallback_entry  Scripted dialogue to fall back to
/// @returns {bool} True if request was sent, false if fell back immediately
function ai_dialogue_request(_npc_id, _fallback_entry) {
    // Check if AI dialogue is available
    if (!_ai_dialogue_can_request()) {
        return false; // Caller should use fallback
    }
    
    // Build messages
    var _messages = _ai_dialogue_build_messages(_npc_id);
    if (_messages == undefined) {
        show_debug_message("WARN: AI dialogue — No prompt profile for " + _npc_id);
        return false;
    }
    
    // Build HTTP request
    var _headers = ds_map_create();
    ds_map_add(_headers, "Content-Type", "application/json");
    ds_map_add(_headers, "Authorization", "Bearer " + global.ai_dialogue.api_key);
    ds_map_add(_headers, "HTTP-Referer", "https://ironveil-game.com");
    ds_map_add(_headers, "X-Title", "Ironveil");
    
    var _body = json_stringify({
        model: global.ai_dialogue.model,
        messages: _messages,
        max_tokens: 150,
        temperature: 0.8,
        top_p: 0.9
    });
    
    var _req_id = http_request(AI_DIALOGUE_API_URL, "POST", _headers, _body);
    ds_map_destroy(_headers);
    
    // Track pending request
    global.ai_dialogue.pending_request_id = _req_id;
    global.ai_dialogue.pending_npc_id = _npc_id;
    global.ai_dialogue.pending_start_time = current_time;
    global.ai_dialogue.pending_fallback = _fallback_entry;
    
    _ai_dialogue_record_request();
    
    show_debug_message("INFO: AI dialogue request sent for " + _npc_id 
        + " (req " + string(_req_id) + ", " + string(ai_dialogue_get_remaining_requests()) + " remaining today)");
    
    return true;
}

/// @func ai_dialogue_async_http()
/// @desc Called from the Async - HTTP event. Processes AI dialogue responses.
///       Place this in your persistent controller object's Async HTTP event.
function ai_dialogue_async_http() {
    if (global.ai_dialogue.pending_request_id == -1) return;
    if (async_load[? "id"] != global.ai_dialogue.pending_request_id) return;
    
    var _status = async_load[? "status"];
    var _npc_id = global.ai_dialogue.pending_npc_id;
    var _is_test = (_npc_id == "__test__");
    
    // Reset pending state
    global.ai_dialogue.pending_request_id = -1;
    
    if (_status == 0) {
        // Request complete
        var _result = async_load[? "result"];
        var _http_status = async_load[? "http_status"];
        
        if (_http_status == 200) {
            var _data = json_parse(_result);
            
            if (_is_test) {
                // Connection test succeeded
                global.ai_dialogue.connected = true;
                show_debug_message("INFO: AI dialogue connection test PASSED");
                settings_ai_update_status(); // Update settings UI
                return;
            }
            
            // Parse chat completion response
            if (variable_struct_exists(_data, "choices") 
                && array_length(_data.choices) > 0
                && variable_struct_exists(_data.choices[0], "message")) {
                
                var _content = _data.choices[0].message.content;
                var _parsed = _ai_dialogue_parse_response(_content);
                
                if (_parsed != undefined) {
                    // Success — create dialogue entry from AI response
                    var _ai_entry = {
                        entry_id: "ai_gen_" + _npc_id + "_" + string(current_time),
                        npc_id: _npc_id,
                        category: "ai_generated",
                        lines: [{
                            speaker: _npc_id,
                            text: _parsed.text,
                            portrait: _parsed.portrait
                        }]
                    };
                    
                    // Store in conversation history (keep last 5)
                    if (!variable_struct_exists(global.ai_dialogue.conversation_history, _npc_id)) {
                        global.ai_dialogue.conversation_history[$ _npc_id] = [];
                    }
                    var _hist = global.ai_dialogue.conversation_history[$ _npc_id];
                    array_push(_hist, { role: "assistant", content: _content });
                    while (array_length(_hist) > 10) {
                        array_delete(_hist, 0, 1);
                    }
                    
                    // Deliver the AI dialogue (call your dialogue display function)
                    // dialogue_display_entry(_ai_entry);
                    show_debug_message("INFO: AI dialogue delivered for " + _npc_id 
                        + ": \"" + string_copy(_parsed.text, 1, 60) + "...\"");
                    return;
                }
            }
        } else {
            show_debug_message("WARN: AI dialogue HTTP " + string(_http_status) + " for " + _npc_id);
            if (_http_status == 401) {
                global.ai_dialogue.connected = false;
                show_debug_message("ERROR: AI dialogue — Invalid API key");
            } else if (_http_status == 429) {
                show_debug_message("WARN: AI dialogue — Rate limited by OpenRouter");
            }
            if (_is_test) {
                settings_ai_update_status(); // Update settings UI on test failure too
                return;
            }
        }
    } else if (_status == -1) {
        show_debug_message("WARN: AI dialogue request failed for " + _npc_id);
        if (_is_test) {
            settings_ai_update_status();
            return;
        }
    }
    
    // Fallback to scripted dialogue on any failure
    if (!_is_test && global.ai_dialogue.pending_fallback != undefined) {
        // dialogue_display_entry(global.ai_dialogue.pending_fallback);
        show_debug_message("INFO: AI dialogue fell back to scripted for " + _npc_id);
    }
    global.ai_dialogue.pending_fallback = undefined;
}

/// @func _ai_dialogue_parse_response(_content)
/// @desc Parses the AI model's response. Expects JSON with text and portrait.
///       Falls back to treating raw text as dialogue if JSON parsing fails.
/// @param {string} _content  Raw response content
/// @returns {struct|undefined} { text, portrait } or undefined
function _ai_dialogue_parse_response(_content) {
    // Try JSON parse first
    try {
        var _json = json_parse(_content);
        if (variable_struct_exists(_json, "text")) {
            var _portrait = variable_struct_exists(_json, "portrait") ? _json.portrait : "neutral";
            return { text: _json.text, portrait: _portrait };
        }
    } catch (_e) {
        // Not valid JSON — try to extract text directly
    }
    
    // Fallback: treat entire content as dialogue text
    var _clean = string_trim(_content);
    if (string_length(_clean) > 0 && string_length(_clean) < 500) {
        // Remove surrounding quotes if present
        if (string_char_at(_clean, 1) == "\"" && string_char_at(_clean, string_length(_clean)) == "\"") {
            _clean = string_copy(_clean, 2, string_length(_clean) - 2);
        }
        return { text: _clean, portrait: "neutral" };
    }
    
    return undefined;
}

// ============================================================================
// TIMEOUT CHECK
// ============================================================================

/// @func ai_dialogue_check_timeout()
/// @desc Called every frame from Step event. Handles request timeouts.
function ai_dialogue_check_timeout() {
    if (global.ai_dialogue.pending_request_id == -1) return;
    
    var _elapsed = current_time - global.ai_dialogue.pending_start_time;
    if (_elapsed > AI_DIALOGUE_TIMEOUT_MS) {
        show_debug_message("WARN: AI dialogue timeout after " + string(_elapsed) + "ms for " 
            + global.ai_dialogue.pending_npc_id);
        
        // Cancel and fallback
        // Note: GameMaker doesn't have http_cancel, so we just ignore the response
        var _npc_id = global.ai_dialogue.pending_npc_id;
        global.ai_dialogue.pending_request_id = -1;
        
        if (global.ai_dialogue.pending_fallback != undefined) {
            // dialogue_display_entry(global.ai_dialogue.pending_fallback);
            show_debug_message("INFO: AI dialogue timeout fallback to scripted for " + _npc_id);
        }
        global.ai_dialogue.pending_fallback = undefined;
    }
}

// ============================================================================
// SAVE / LOAD
// ============================================================================

/// @func ai_dialogue_save()
/// @desc Returns AI dialogue config for save file.
/// @returns {struct}
function ai_dialogue_save() {
    return {
        enabled: global.ai_dialogue.enabled,
        api_key: global.ai_dialogue.api_key,
        model: global.ai_dialogue.model
    };
}

/// @func ai_dialogue_load(_save_data)
/// @desc Restores AI dialogue config from save.
/// @param {struct} _save_data
function ai_dialogue_load(_save_data) {
    if (_save_data == undefined) return;
    
    global.ai_dialogue.enabled = variable_struct_exists(_save_data, "enabled") 
        ? _save_data.enabled : false;
    global.ai_dialogue.api_key = variable_struct_exists(_save_data, "api_key") 
        ? _save_data.api_key : "";
    global.ai_dialogue.model = variable_struct_exists(_save_data, "model") 
        ? _save_data.model : AI_DIALOGUE_DEFAULT_MODEL;
    
    show_debug_message("INFO: AI dialogue config loaded (enabled: " 
        + string(global.ai_dialogue.enabled) + ")");
}
