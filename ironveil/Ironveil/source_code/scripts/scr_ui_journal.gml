/// scr_ui_journal.gml
/// Tabbed journal interface: Map, Blueprints, Lore, DEJIN Memories, NPC Notes, Quests.
/// Objective #27: Core UI Suite
///
/// Dependencies: scr_exploration_system, scr_blueprint_system, scr_npc_data, scr_quest

enum JOURNAL_TAB {
    MAP        = 0,
    BLUEPRINTS = 1,
    LORE       = 2,
    DEJIN      = 3,
    NPCS       = 4,
    QUESTS     = 5
}

/// @func journal_screen_init()
/// @desc Initializes journal UI state.
function journal_screen_init() {
    global.journal_ui = {
        active: true,
        current_tab: JOURNAL_TAB.MAP,
        selected_entry: -1,
        scroll_offset: 0,
        entries: []
    };
    
    journal_refresh_entries();
}

/// @func journal_refresh_entries()
/// @desc Rebuilds the entry list for the current tab.
function journal_refresh_entries() {
    var _ui = global.journal_ui;
    _ui.entries = [];
    _ui.selected_entry = -1;
    _ui.scroll_offset = 0;
    
    switch (_ui.current_tab) {
        case JOURNAL_TAB.BLUEPRINTS:
            // List all discovered blueprints
            var _bp_keys = variable_struct_get_names(global.blueprint_data);
            for (var _i = 0; _i < array_length(_bp_keys); _i++) {
                var _bp = global.blueprint_data[$ _bp_keys[_i]];
                if (blueprint_is_discovered(_bp_keys[_i])) {
                    array_push(_ui.entries, {
                        id: _bp_keys[_i],
                        title: _bp.name,
                        subtitle: _bp.type + " | " + _bp.tier_label,
                        description: _bp.description
                    });
                }
            }
            break;
            
        case JOURNAL_TAB.LORE:
            // List all found lore entries
            if (variable_struct_exists(global, "journal_lore")) {
                var _lore_keys = variable_struct_get_names(global.journal_lore);
                for (var _i = 0; _i < array_length(_lore_keys); _i++) {
                    var _lore = global.journal_lore[$ _lore_keys[_i]];
                    array_push(_ui.entries, {
                        id: _lore_keys[_i],
                        title: _lore.title,
                        subtitle: "Lore Entry",
                        description: _lore.summary
                    });
                }
            }
            break;
            
        case JOURNAL_TAB.DEJIN:
            // DEJIN memory fragments
            if (variable_struct_exists(global, "dejin_memories")) {
                for (var _i = 0; _i < array_length(global.dejin_memories); _i++) {
                    var _mem = global.dejin_memories[_i];
                    array_push(_ui.entries, {
                        id: "dejin_mem_" + string(_i),
                        title: _mem.title,
                        subtitle: "Memory Fragment",
                        description: _mem.text
                    });
                }
            }
            break;
            
        case JOURNAL_TAB.NPCS:
            // NPC relationship summary
            for (var _i = 0; _i < global.npc_count; _i++) {
                var _npc_id = global.npc_ids[_i];
                var _npc = npc_get_data(_npc_id);
                if (_npc == undefined) continue;
                
                var _hearts = 0;
                if (ds_map_exists(global.npc_hearts, _npc_id)) {
                    _hearts = ds_map_find_value(global.npc_hearts, _npc_id);
                }
                var _heart_level = floor(_hearts / 100); // 100 pts per heart
                
                array_push(_ui.entries, {
                    id: _npc_id,
                    title: _npc.display_name,
                    subtitle: _npc.role + " | ♥ " + string(_heart_level) + "/10",
                    description: "Birthday: " + _npc.birthday.season + " " + string(_npc.birthday.day)
                });
            }
            break;
            
        case JOURNAL_TAB.QUESTS:
            // Active and completed quests
            if (variable_struct_exists(global, "quests")) {
                var _quest_keys = variable_struct_get_names(global.quests);
                for (var _i = 0; _i < array_length(_quest_keys); _i++) {
                    var _q = global.quests[$ _quest_keys[_i]];
                    array_push(_ui.entries, {
                        id: _quest_keys[_i],
                        title: _q.name,
                        subtitle: _q.status + " | " + _q.quest_giver,
                        description: _q.description
                    });
                }
            }
            break;
    }
}

/// @func journal_screen_draw()
/// @desc Draws the journal interface.
function journal_screen_draw() {
    if (!global.journal_ui.active) return;
    
    var _gui_w = display_get_gui_width();
    var _gui_h = display_get_gui_height();
    var _ui = global.journal_ui;
    
    // Backdrop
    draw_set_alpha(0.6);
    draw_set_colour(c_black);
    draw_rectangle(0, 0, _gui_w, _gui_h, false);
    draw_set_alpha(1.0);
    
    // Panel
    var _panel_w = 300;
    var _panel_h = 220;
    var _px = (_gui_w - _panel_w) / 2;
    var _py = (_gui_h - _panel_h) / 2;
    
    draw_set_colour(INV_PANEL_BG);
    draw_roundrect_ext(_px, _py, _px + _panel_w, _py + _panel_h, 4, 4, false);
    
    // Title
    draw_set_font(HUD_FONT_MEDIUM);
    draw_set_colour(INV_TEXT_COLOR);
    draw_set_halign(fa_center);
    draw_text(_px + _panel_w / 2, _py + 4, "JOURNAL");
    draw_set_halign(fa_left);
    
    // Tabs
    var _tab_names = ["Map", "Blueprints", "Lore", "DEJIN", "NPCs", "Quests"];
    var _tab_y = _py + 20;
    var _tab_x = _px + 4;
    draw_set_font(HUD_FONT_SMALL);
    
    for (var _t = 0; _t < array_length(_tab_names); _t++) {
        var _is_active = (_t == _ui.current_tab);
        draw_set_colour(_is_active ? INV_CATEGORY_ACTIVE : INV_CATEGORY_INACTIVE);
        draw_text(_tab_x, _tab_y, _tab_names[_t]);
        _tab_x += string_width(_tab_names[_t]) + 6;
    }
    
    // Content area
    var _content_y = _tab_y + 14;
    var _content_h = _panel_h - (_content_y - _py) - 16;
    
    if (_ui.current_tab == JOURNAL_TAB.MAP) {
        // Map tab — delegate to map drawing
        journal_draw_map(_px + 4, _content_y, _panel_w - 8, _content_h);
    } else {
        // List-based tabs: two-column layout (list + detail)
        var _list_w = 100;
        var _list_x = _px + 4;
        
        // Entry list
        draw_set_colour(make_colour_rgb(40, 35, 28));
        draw_rectangle(_list_x, _content_y, _list_x + _list_w, _content_y + _content_h, false);
        
        var _visible = floor(_content_h / 12);
        for (var _i = 0; _i < _visible; _i++) {
            var _idx = _i + _ui.scroll_offset;
            if (_idx >= array_length(_ui.entries)) break;
            
            var _entry = _ui.entries[_idx];
            var _ey = _content_y + 2 + _i * 12;
            
            if (_idx == _ui.selected_entry) {
                draw_set_colour(INV_SLOT_SELECTED);
                draw_rectangle(_list_x + 1, _ey - 1, _list_x + _list_w - 1, _ey + 10, false);
            }
            
            draw_set_colour(INV_TEXT_COLOR);
            draw_set_font(HUD_FONT_SMALL);
            draw_text(_list_x + 3, _ey, _entry.title);
        }
        
        // Detail panel
        var _detail_x = _list_x + _list_w + 6;
        var _detail_w = _panel_w - (_detail_x - _px) - 4;
        
        if (_ui.selected_entry >= 0 && _ui.selected_entry < array_length(_ui.entries)) {
            var _sel = _ui.entries[_ui.selected_entry];
            
            draw_set_colour(INV_CATEGORY_ACTIVE);
            draw_set_font(HUD_FONT_SMALL);
            draw_text(_detail_x, _content_y, _sel.title);
            
            draw_set_colour(INV_CATEGORY_INACTIVE);
            draw_text(_detail_x, _content_y + 12, _sel.subtitle);
            
            draw_set_colour(INV_TEXT_COLOR);
            draw_text_ext(_detail_x, _content_y + 28, _sel.description, 10, _detail_w);
        }
    }
    
    // Close hint
    draw_set_font(HUD_FONT_SMALL);
    draw_set_colour(INV_CATEGORY_INACTIVE);
    draw_set_halign(fa_center);
    draw_text(_px + _panel_w / 2, _py + _panel_h - 10, "Q/E: Tabs | ↑↓: Browse | ESC: Close");
    draw_set_halign(fa_left);
}

/// @func journal_draw_map(_x, _y, _w, _h)
/// @desc Draws the world map with fog of war in the journal map tab.
function journal_draw_map(_x, _y, _w, _h) {
    // Background
    draw_set_colour(make_colour_rgb(45, 40, 32));
    draw_rectangle(_x, _y, _x + _w, _y + _h, false);
    
    // Placeholder: draw known locations as icons
    draw_set_font(HUD_FONT_SMALL);
    draw_set_colour(INV_TEXT_COLOR);
    draw_set_halign(fa_center);
    draw_text(_x + _w / 2, _y + _h / 2 - 6, "World Map");
    draw_set_colour(INV_CATEGORY_INACTIVE);
    draw_text(_x + _w / 2, _y + _h / 2 + 6, "Explore to reveal");
    draw_set_halign(fa_left);
    
    // Draw discovered location markers
    // Coppervale (always visible)
    var _map_scale_x = _w / 100; // World is ~100 units wide conceptually
    var _map_scale_y = _h / 80;
    
    // Coppervale marker
    var _cv_x = _x + 40 * _map_scale_x;
    var _cv_y = _y + 40 * _map_scale_y;
    draw_set_colour(make_colour_rgb(200, 180, 100));
    draw_circle(_cv_x, _cv_y, 3, false);
    draw_set_font(HUD_FONT_SMALL);
    draw_text(_cv_x + 5, _cv_y - 4, "Coppervale");
    
    // The Hollow (if explored)
    if (variable_struct_exists(global.exploration_state, "the_hollow")) {
        var _th_x = _x + 60 * _map_scale_x;
        var _th_y = _y + 40 * _map_scale_y;
        draw_set_colour(make_colour_rgb(150, 140, 100));
        draw_circle(_th_x, _th_y, 2, false);
        draw_text(_th_x + 4, _th_y - 4, "The Hollow");
    }
}

/// @func journal_screen_input()
/// @desc Handles input for the journal.
function journal_screen_input() {
    if (!global.journal_ui.active) return;
    var _ui = global.journal_ui;
    
    // Tab switching
    if (keyboard_check_pressed(ord("Q"))) {
        _ui.current_tab = max(0, _ui.current_tab - 1);
        journal_refresh_entries();
    }
    if (keyboard_check_pressed(ord("E"))) {
        _ui.current_tab = min(5, _ui.current_tab + 1);
        journal_refresh_entries();
    }
    
    // Navigate entries
    if (keyboard_check_pressed(vk_up)) {
        _ui.selected_entry = max(0, _ui.selected_entry - 1);
    }
    if (keyboard_check_pressed(vk_down)) {
        _ui.selected_entry = min(array_length(_ui.entries) - 1, _ui.selected_entry + 1);
    }
    
    // Close
    if (keyboard_check_pressed(vk_escape) || keyboard_check_pressed(ord("J"))) {
        _ui.active = false;
    }
}
