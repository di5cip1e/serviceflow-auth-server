/// shd_season.vsh
/// Vertex shader for seasonal palette swap system.
/// Objective #26: Seasonal Cycle Visuals
/// Passes through standard vertex attributes to the fragment shader.

attribute vec3 in_Position;
attribute vec4 in_Colour;
attribute vec2 in_TextureCoord;

varying vec2 v_texcoord;
varying vec4 v_colour;

void main() {
    vec4 pos = vec4(in_Position.xyz, 1.0);
    gl_Position = gm_Matrices[MATRIX_WORLD_VIEW_PROJECTION] * pos;
    
    v_texcoord = in_TextureCoord;
    v_colour = in_Colour;
}
