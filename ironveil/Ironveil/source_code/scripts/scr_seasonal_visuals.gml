/// scr_seasonal_visuals.gml
/// Season change handler, weather particle effects, and palette management.
/// Objective #26: Seasonal Cycle Visuals
///
/// Dependencies: scr_time_system, shd_season (GLSL shader pair)
/// Global data: global.season_palette_surface (palette map surface)
///              global.weather_particles (particle system IDs)

// ============================================================================
// SEASON PALETTE MANAGEMENT
// ============================================================================

/// @func seasonal_visuals_init()
/// @desc Initializes the seasonal visual system. Creates palette map and particle systems.
///       Called once during game boot after shaders are compiled.
function seasonal_visuals_init() {
    // Shader uniform locations (cached for performance)
    global.shd_season_u_palette    = shader_get_sampler_index(shd_season, "u_palette_map");
    global.shd_season_u_season     = shader_get_uniform(shd_season, "u_season_index");
    global.shd_season_u_width      = shader_get_uniform(shd_season, "u_palette_width");
    global.shd_season_u_tolerance  = shader_get_uniform(shd_season, "u_color_tolerance");
    global.shd_season_u_blend      = shader_get_uniform(shd_season, "u_blend_factor");
    
    // Current visual state
    global.season_current = 0;         // 0=Spring, 1=Summer, 2=Autumn, 3=Winter
    global.season_blend = 1.0;         // Blend factor (1.0 = fully transitioned)
    global.season_transitioning = false;
    global.season_transition_speed = 0.02; // Blend speed per frame
    
    // Create palette map texture
    seasonal_build_palette_map();
    
    // Initialize weather particle systems
    weather_particles_init();
    
    show_debug_message("INFO: Seasonal visual system initialized.");
}

/// @func seasonal_build_palette_map()
/// @desc Creates the 16×4 palette map surface used by the season swap shader.
///       Each row represents a season's color palette.
function seasonal_build_palette_map() {
    // 16 indexed colors × 4 seasons
    var _w = 16;
    var _h = 4;
    
    global.season_palette_surface = surface_create(_w, _h);
    surface_set_target(global.season_palette_surface);
    draw_clear_alpha(c_black, 0);
    
    // Define palettes: [index] = color per season
    // Index 0: Primary grass
    // Index 1: Secondary grass / shadow
    // Index 2: Dirt path
    // Index 3: Tree leaves primary
    // Index 4: Tree leaves secondary
    // Index 5: Bush/shrub
    // Index 6: Flower accent
    // Index 7: Water surface tint
    // Index 8: Stone/rock tint
    // Index 9: Roof moss/weathering
    // Index 10: Ground cover
    // Index 11: Bark tint
    // Index 12-15: Reserved/unused
    
    // Spring palette (Row 0) — lush greens, bright
    var _spring = [
        make_colour_rgb(106, 190, 48),   // 0: Bright grass green
        make_colour_rgb(75, 140, 35),    // 1: Dark grass shadow
        make_colour_rgb(160, 130, 90),   // 2: Warm dirt
        make_colour_rgb(60, 165, 50),    // 3: Leaf green
        make_colour_rgb(45, 130, 40),    // 4: Leaf shadow
        make_colour_rgb(80, 170, 55),    // 5: Bush green
        make_colour_rgb(220, 180, 50),   // 6: Yellow flowers
        make_colour_rgb(70, 130, 170),   // 7: Cool water
        make_colour_rgb(140, 135, 125),  // 8: Grey stone
        make_colour_rgb(85, 150, 60),    // 9: Mossy roof
        make_colour_rgb(95, 175, 50),    // 10: Ground cover
        make_colour_rgb(110, 85, 55),    // 11: Brown bark
        c_black, c_black, c_black, c_black
    ];
    
    // Summer palette (Row 1) — deeper greens, warm
    var _summer = [
        make_colour_rgb(85, 170, 40),    // 0: Deep grass
        make_colour_rgb(60, 120, 30),    // 1: Deep shadow
        make_colour_rgb(170, 140, 85),   // 2: Dry dirt
        make_colour_rgb(50, 150, 40),    // 3: Deep leaf
        make_colour_rgb(35, 110, 30),    // 4: Deep leaf shadow
        make_colour_rgb(65, 150, 45),    // 5: Deep bush
        make_colour_rgb(230, 100, 50),   // 6: Orange flowers
        make_colour_rgb(60, 120, 155),   // 7: Warm water
        make_colour_rgb(145, 138, 120),  // 8: Warm stone
        make_colour_rgb(70, 135, 50),    // 9: Dense moss
        make_colour_rgb(75, 155, 40),    // 10: Dense ground
        make_colour_rgb(100, 75, 45),    // 11: Dark bark
        c_black, c_black, c_black, c_black
    ];
    
    // Autumn palette (Row 2) — golds, oranges, reds
    var _autumn = [
        make_colour_rgb(170, 155, 60),   // 0: Golden grass
        make_colour_rgb(130, 110, 45),   // 1: Brown-gold shadow
        make_colour_rgb(150, 120, 75),   // 2: Cool dirt
        make_colour_rgb(200, 120, 30),   // 3: Orange leaf
        make_colour_rgb(170, 80, 25),    // 4: Red-orange shadow
        make_colour_rgb(180, 140, 40),   // 5: Yellow bush
        make_colour_rgb(190, 60, 40),    // 6: Red flowers
        make_colour_rgb(75, 125, 150),   // 7: Cool water
        make_colour_rgb(135, 128, 115),  // 8: Cool stone
        make_colour_rgb(140, 120, 50),   // 9: Dried moss
        make_colour_rgb(155, 135, 55),   // 10: Dried ground
        make_colour_rgb(95, 70, 40),     // 11: Grey-brown bark
        c_black, c_black, c_black, c_black
    ];
    
    // Winter palette (Row 3) — muted, desaturated, cold
    var _winter = [
        make_colour_rgb(160, 170, 155),  // 0: Frosty grey-green
        make_colour_rgb(120, 130, 115),  // 1: Dark frost
        make_colour_rgb(145, 140, 130),  // 2: Frozen dirt
        make_colour_rgb(140, 145, 130),  // 3: Bare branch tint
        make_colour_rgb(110, 115, 105),  // 4: Branch shadow
        make_colour_rgb(130, 140, 120),  // 5: Bare bush
        make_colour_rgb(180, 185, 190),  // 6: Ice crystals
        make_colour_rgb(90, 140, 170),   // 7: Cold water
        make_colour_rgb(155, 155, 155),  // 8: Frost stone
        make_colour_rgb(145, 150, 140),  // 9: Frost on roof
        make_colour_rgb(170, 175, 165),  // 10: Snow-dusted ground
        make_colour_rgb(105, 90, 70),    // 11: Cold bark
        c_black, c_black, c_black, c_black
    ];
    
    // Draw palette rows
    var _palettes = [_spring, _summer, _autumn, _winter];
    for (var _row = 0; _row < 4; _row++) {
        for (var _col = 0; _col < _w; _col++) {
            draw_point_colour(_col, _row, _palettes[_row][_col]);
        }
    }
    
    surface_reset_target();
    
    // Convert to sprite for persistence (surfaces can be lost)
    global.season_palette_sprite = sprite_create_from_surface(
        global.season_palette_surface, 0, 0, _w, _h, false, false, 0, 0
    );
    
    show_debug_message("INFO: Season palette map created (" + string(_w) + "x" + string(_h) + ").");
}

/// @func seasonal_apply_shader()
/// @desc Sets the season shader and uniforms. Call before drawing seasonal tiles.
function seasonal_apply_shader() {
    shader_set(shd_season);
    
    // Bind palette map texture to sampler
    var _tex = sprite_get_texture(global.season_palette_sprite, 0);
    texture_set_stage(global.shd_season_u_palette, _tex);
    
    shader_set_uniform_f(global.shd_season_u_season, global.season_current);
    shader_set_uniform_f(global.shd_season_u_width, 16.0);
    shader_set_uniform_f(global.shd_season_u_tolerance, 0.05);
    shader_set_uniform_f(global.shd_season_u_blend, global.season_blend);
}

/// @func seasonal_reset_shader()
/// @desc Resets the shader after drawing seasonal tiles.
function seasonal_reset_shader() {
    shader_reset();
}

/// @func seasonal_update()
/// @desc Called every frame. Handles season transition blending.
function seasonal_update() {
    // Check if season changed
    if (global.time_season != global.season_current && !global.season_transitioning) {
        global.season_transitioning = true;
        global.season_blend = 0.0;
        global.season_current = global.time_season;
        
        // Audio: Notify audio manager of season change for music variant swap
        audio_manager_on_season_change(global.season_current);
        
        show_debug_message("INFO: Season transition started -> " + string(global.season_current));
    }
    
    // Animate blend during transition
    if (global.season_transitioning) {
        global.season_blend += global.season_transition_speed;
        if (global.season_blend >= 1.0) {
            global.season_blend = 1.0;
            global.season_transitioning = false;
            show_debug_message("INFO: Season transition complete.");
        }
    }
    
    // Update weather particles
    weather_particles_update();
}

// ============================================================================
// WEATHER PARTICLE EFFECTS
// ============================================================================

/// @func weather_particles_init()
/// @desc Creates particle systems for rain, snow, and fog effects.
function weather_particles_init() {
    // Rain particle system
    global.ps_rain = part_system_create();
    part_system_depth(global.ps_rain, -9000); // Above most objects
    
    global.pt_rain = part_type_create();
    part_type_shape(global.pt_rain, pt_shape_line);
    part_type_size(global.pt_rain, 0.1, 0.2, 0, 0);
    part_type_scale(global.pt_rain, 1, 3);
    part_type_colour1(global.pt_rain, make_colour_rgb(150, 170, 200));
    part_type_alpha2(global.pt_rain, 0.4, 0.1);
    part_type_speed(global.pt_rain, 4, 6, 0, 0);
    part_type_direction(global.pt_rain, 250, 260, 0, 0); // Angled downward
    part_type_life(global.pt_rain, 20, 40);
    
    // Snow particle system
    global.ps_snow = part_system_create();
    part_system_depth(global.ps_snow, -9000);
    
    global.pt_snow = part_type_create();
    part_type_shape(global.pt_snow, pt_shape_circle);
    part_type_size(global.pt_snow, 0.05, 0.15, 0, 0);
    part_type_colour1(global.pt_snow, make_colour_rgb(230, 235, 240));
    part_type_alpha2(global.pt_snow, 0.6, 0.2);
    part_type_speed(global.pt_snow, 0.5, 1.5, 0, 0);
    part_type_direction(global.pt_snow, 250, 290, 0, 0); // Gentle downward
    part_type_gravity(global.pt_snow, 0.02, 270);
    part_type_life(global.pt_snow, 60, 120);
    
    // Fog overlay (handled as a draw effect, not particles)
    global.fog_alpha = 0.0;
    global.fog_target_alpha = 0.0;
    
    // Particle emission state
    global.weather_emitting = false;
    global.weather_type_active = "";
    
    show_debug_message("INFO: Weather particle systems created.");
}

/// @func weather_particles_update()
/// @desc Updates weather particles based on current weather state.
///       Emits particles from top of camera view.
function weather_particles_update() {
    var _weather = global.time_weather;
    var _cam_x = camera_get_view_x(view_camera[0]);
    var _cam_y = camera_get_view_y(view_camera[0]);
    var _cam_w = camera_get_view_width(view_camera[0]);
    
    // Determine target particle emission
    switch (_weather) {
        case "RAIN":
            if (global.weather_type_active != "RAIN") {
                weather_particles_stop_all();
                global.weather_type_active = "RAIN";
                ambient_on_weather_change("RAIN");
            }
            // Emit rain across camera width, capped at 8 per frame for performance
            var _count = min(8, floor(_cam_w / 40));
            part_particles_create(global.ps_rain, 
                _cam_x + random(_cam_w), _cam_y - 10, 
                global.pt_rain, _count);
            global.fog_target_alpha = 0.0;
            break;
            
        case "STORM":
            if (global.weather_type_active != "STORM") {
                weather_particles_stop_all();
                global.weather_type_active = "STORM";
                ambient_on_weather_change("STORM");
            }
            // Heavy rain — more particles
            var _count = min(12, floor(_cam_w / 25));
            part_particles_create(global.ps_rain, 
                _cam_x + random(_cam_w), _cam_y - 10, 
                global.pt_rain, _count);
            global.fog_target_alpha = 0.0;
            break;
            
        case "SNOW":
            if (global.weather_type_active != "SNOW") {
                weather_particles_stop_all();
                global.weather_type_active = "SNOW";
                ambient_on_weather_change("SNOW");
            }
            // Gentle snow
            var _count = min(6, floor(_cam_w / 50));
            part_particles_create(global.ps_snow, 
                _cam_x + random(_cam_w), _cam_y - 10, 
                global.pt_snow, _count);
            global.fog_target_alpha = 0.0;
            break;
            
        case "FOG":
            if (global.weather_type_active != "FOG") {
                weather_particles_stop_all();
                global.weather_type_active = "FOG";
                ambient_on_weather_change("FOG");
            }
            global.fog_target_alpha = 0.3; // Fog overlay at 30% opacity
            break;
            
        default: // CLEAR, CLOUDY
            if (global.weather_type_active != "") {
                weather_particles_stop_all();
                global.weather_type_active = "";
                ambient_on_weather_change("CLEAR");
            }
            global.fog_target_alpha = 0.0;
            break;
    }
    
    // Smooth fog alpha transition
    global.fog_alpha = lerp(global.fog_alpha, global.fog_target_alpha, 0.02);
}

/// @func weather_particles_stop_all()
/// @desc Stops all active weather particle emissions.
function weather_particles_stop_all() {
    part_particles_clear(global.ps_rain);
    part_particles_clear(global.ps_snow);
}

/// @func weather_draw_fog()
/// @desc Draws the fog overlay effect. Called during the Draw GUI event.
function weather_draw_fog() {
    if (global.fog_alpha > 0.01) {
        draw_set_alpha(global.fog_alpha);
        draw_set_colour(make_colour_rgb(200, 210, 220));
        draw_rectangle(0, 0, display_get_gui_width(), display_get_gui_height(), false);
        draw_set_alpha(1.0);
        draw_set_colour(c_white);
    }
}

// ============================================================================
// CLEANUP
// ============================================================================

/// @func seasonal_visuals_cleanup()
/// @desc Frees particle systems and surfaces. Called on game exit.
function seasonal_visuals_cleanup() {
    part_type_destroy(global.pt_rain);
    part_type_destroy(global.pt_snow);
    part_system_destroy(global.ps_rain);
    part_system_destroy(global.ps_snow);
    
    if (surface_exists(global.season_palette_surface)) {
        surface_free(global.season_palette_surface);
    }
    if (sprite_exists(global.season_palette_sprite)) {
        sprite_delete(global.season_palette_sprite);
    }
}
