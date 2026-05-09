# Phase E PRD — Self Review

## Review Notes

### 1. Audio Config JSON Structure
The PRD mentions `audio_config.json` but doesn't detail its internal structure. This needs to be defined clearly during execution to ensure the audio manager can look up tracks, SFX, and ambience efficiently. Will define schema in execution plan.

### 2. Room JSON Modifications — Scope Concern
21 room JSON files need `music_id` and `ambience_id` fields added. This is a bulk operation but straightforward. Need to ensure the room_data_load function is updated to read these new fields gracefully (fallback to undefined if missing, for backward compatibility).

### 3. Dynamic Music Layers — Implementation Detail
The PRD specifies 3 layers for raid music but doesn't detail how GameMaker handles layered audio. In GML, this is achieved by playing multiple audio assets simultaneously on the same channel type and controlling their gain independently. The audio manager needs to track layer sound IDs separately from the main music channel.

### 4. Input Abstraction Layer — Migration Risk
F40.6 calls for migrating all existing game code to use abstraction functions. This touches player movement, all UI scripts, and potentially NPC interaction. The risk is breaking existing keyboard input. Mitigation: the abstraction functions should internally call the same `keyboard_check_pressed()` functions on PC, ensuring zero behavior change. Only on mobile do they additionally check touch input.

### 5. Missing: Settings Menu Integration
The PRD doesn't mention a Settings/Options screen for volume sliders. The design docs reference separate volume controls per channel. Need to add a `scr_ui_settings.gml` or integrate volume controls into existing settings. Checking Drive... there's already a `settings_menu.png` in UI screens. This should be addressed — adding audio volume sliders to the settings UI.

**Resolution:** Add F39.10 — Settings Menu Audio Controls (volume sliders for each channel).

### 6. Missing: Terrain-Specific Footstep SFX
The sound design doc mentions "terrain-specific footsteps" as an SFX category. The player movement system would need to check the tile type underneath and play the appropriate footstep sound. This should be part of scr_audio_sfx.gml.

**Resolution:** Already covered implicitly under F39.5 SFX categories but should be called out explicitly in execution.

### 7. Safe Area — No GML Built-in
GameMaker doesn't have a built-in safe area API for all platforms. On iOS, `display_get_gui_width/height` respects safe areas when configured correctly. On Android, manual insets may be needed. The implementation should use a configurable padding value rather than relying on platform APIs.

### 8. Pinch-to-Zoom — Optional
The PRD marks pinch-to-zoom as optional for the map. This is correct — it's complex multi-touch handling and can be deferred. Tap-based zoom buttons are simpler and more reliable.

### 9. Existing Code Has No Mouse Input
All UI is keyboard-only. The mobile adaptation needs to add `device_mouse_x_to_gui()` / `device_mouse_check_button_pressed()` checks. On PC, these would also enable mouse support as a side benefit, which is actually desirable.

**Resolution:** The input abstraction layer should support keyboard + mouse on PC, and touch on mobile. This means PC users also get mouse-clickable UI for free.

## Overall Assessment
PRD is solid and comprehensive. The three gaps identified (settings menu audio, mouse support on PC, terrain footsteps) are addressed in the execution plan. No critical flaws found.
