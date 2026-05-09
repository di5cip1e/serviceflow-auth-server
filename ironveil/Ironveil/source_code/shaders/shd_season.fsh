/// shd_season.fsh
/// Fragment shader for seasonal palette swap system.
/// Objective #26: Seasonal Cycle Visuals
///
/// Technique: Indexed-color palette swap.
/// The base tileset uses a limited palette. This shader reads a pixel's color,
/// matches it against the source palette row, then replaces it with the
/// corresponding color from the target season's row in the palette map texture.
///
/// Palette map layout (small texture, e.g. 16×4):
///   Row 0: Spring palette (source/reference)
///   Row 1: Summer palette
///   Row 2: Autumn palette
///   Row 3: Winter palette
/// Each column is a color index (0-15). The shader finds which column
/// the input color best matches in Row 0, then samples the target row.

varying vec2 v_texcoord;
varying vec4 v_colour;

uniform sampler2D u_palette_map;     // Palette map texture (16×4 or similar)
uniform float u_season_index;        // 0.0=Spring, 1.0=Summer, 2.0=Autumn, 3.0=Winter
uniform float u_palette_width;       // Number of color indices (e.g., 16.0)
uniform float u_color_tolerance;     // Match tolerance (0.05 default)
uniform float u_blend_factor;        // 0.0=original, 1.0=full swap (for transitions)

void main() {
    vec4 base_color = texture2D(gm_BaseTexture, v_texcoord) * v_colour;
    
    // Skip transparent pixels
    if (base_color.a < 0.01) {
        gl_FragColor = base_color;
        return;
    }
    
    // Search for the best matching color index in the source row (Row 0 = Spring)
    float best_match = -1.0;
    float best_dist = u_color_tolerance;
    vec4 target_color = base_color;
    
    float row_height = 1.0 / 4.0; // 4 rows in palette map
    float source_v = 0.5 * row_height; // Center of Row 0 (Spring)
    float target_v = (u_season_index + 0.5) * row_height; // Center of target season row
    
    for (float i = 0.0; i < 16.0; i += 1.0) {
        if (i >= u_palette_width) break;
        
        float col_u = (i + 0.5) / u_palette_width;
        
        // Sample source palette color
        vec4 source_col = texture2D(u_palette_map, vec2(col_u, source_v));
        
        // Calculate color distance (RGB only)
        float dist = distance(base_color.rgb, source_col.rgb);
        
        if (dist < best_dist) {
            best_dist = dist;
            best_match = i;
            
            // Sample target palette color
            target_color = texture2D(u_palette_map, vec2(col_u, target_v));
            target_color.a = base_color.a; // Preserve original alpha
        }
    }
    
    // Blend between original and swapped color
    if (best_match >= 0.0) {
        gl_FragColor = mix(base_color, target_color, u_blend_factor);
    } else {
        gl_FragColor = base_color;
    }
}
