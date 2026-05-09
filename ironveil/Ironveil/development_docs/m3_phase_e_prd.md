# Ironveil — Phase E PRD: Audio & Mobile Polish
**Date:** 2026-03-19
**Objectives:** #39 (Full Sound & Music Integration), #40 (Mobile UI Adaptation)

---

## Objective #39 — Full Sound & Music Integration

### Functional Requirements

#### F39.1 — Audio Manager System (`scr_audio_manager.gml`)
- Persistent audio manager initialized at boot
- 5-channel architecture: Music, Ambient, SFX, UI, Dialogue
- Per-channel volume control stored in `global.audio_volumes` struct (music, ambient, sfx, ui, dialogue)
- Master volume multiplier
- All volumes persisted in save data
- Channel state tracking (current playing sound ID per channel)

#### F39.2 — Music System
- Context-aware music selection based on: room, season, time of day, game state
- 2-second crossfade between music tracks
- Seasonal variants for Coppervale (4) and Workshop (4) themes
- Only one music track plays at a time
- Music lookup table mapping `(room_id, season, game_state)` → `music_track_id`
- Special override tracks for: raids, mech combat, festivals, heart events, story moments
- Night behavior: music volume dips, ambient volume rises at dusk/dawn

#### F39.3 — Dynamic Music Layers (Raid Escalation)
- Raid music composed of 3 logical layers: Base (percussion + low strings), Escalation (brass + strings), Crisis (full orchestra)
- Layer activation tied to raid intensity: wave count thresholds, breach events, player HP critical
- Layers crossfade in/out over 1 second
- Mech deployment triggers hard crossfade to "Mech Deployed" track
- Boss encounters trigger specific boss music

#### F39.4 — Ambient Soundscape System
- Per-room ambient loop definitions (added to room JSON data as `ambience_id`)
- Day/night ambient variants (e.g., Coppervale day vs night)
- Crossfade between ambient tracks on room transition
- Weather-influenced ambient modifications (rain adds rain layer, storm intensifies)
- Multiple ambient layers can mix (base room ambient + weather overlay)

#### F39.5 — SFX System
- Priority-based playback: Combat > Workshop > Environmental
- SFX lookup table: `sfx_id` → `{sound_asset, gain, pitch_variance, priority}`
- One-shot playback with optional pitch randomization (±5% for variety)
- Positional audio support (volume falloff based on distance from camera center)
- SFX categories from design doc: Workshop, Environmental, UI, Combat, NPC Vocal
- Maximum concurrent SFX limit (8 simultaneous, oldest low-priority dropped)

#### F39.6 — UI Sound Integration
- Highest priority channel, never ducked
- Sounds for: menu open/close, button press/hover, tab switch, item pickup/place, notification, achievement, save/load, map open, journal entry, blueprint discovered

#### F39.7 — NPC Vocal Clips (Dialogue Channel)
- Short non-verbal clips per NPC personality
- Triggered during dialogue text display
- Queued playback (one at a time)
- Clips mapped per NPC in dialogue data

#### F39.8 — Audio Configuration Data (`audio_config.json`)
- Central JSON file defining all track mappings, SFX definitions, ambient definitions
- Room-to-music mappings
- Room-to-ambience mappings
- SFX catalog with properties
- Dynamic layer definitions for raid music

#### F39.9 — Save/Load Integration
- Volume settings saved/loaded
- Current music state not saved (recalculated from game state on load)

### Non-Functional Requirements
- All audio references use string IDs mapped to GameMaker audio assets
- No audio plays during BOOT state
- Graceful fallback if audio asset missing (log warning, continue silently)
- Audio system must not cause frame drops (all operations O(1) lookup)

---

## Objective #40 — Mobile UI Adaptation

### Functional Requirements

#### F40.1 — Platform Detection System
- `global.is_mobile` boolean set at boot using `os_type` check
- `os_type == os_android || os_type == os_ios` → mobile
- All mobile-specific code gated behind `global.is_mobile` checks
- Configurable UI scale factor: `global.ui_scale` (1.0 for PC, 1.5-2.0 for mobile)

#### F40.2 — Virtual Joystick (`scr_mobile_input.gml`)
- Dynamic placement on left side of screen
- Appears on touch-down, disappears on release
- Dead zone: 8px, max radius: 40px (scaled)
- Outputs normalized direction vector consumed by player movement
- Does not interfere with UI panels (disabled when UI overlay active)
- Visual: semi-transparent circle with inner thumb indicator

#### F40.3 — Touch Action Buttons
- Right side of screen: Primary Action button (context-sensitive), Secondary Action button
- Context-sensitive label: "Talk" near NPC, "Use" near station, "Pick Up" near item
- Quick-action bar: 3 slots mapped to hotbar items (tap to use)
- Back/Cancel button (top-right, replaces Escape key)

#### F40.4 — Touch-Friendly UI Panels
- All existing UI panels gain touch support when `global.is_mobile`:
  - Tap on list items to select (replaces arrow key navigation)
  - Tap on tabs to switch (replaces Q/E)
  - Tap on action buttons (replaces Enter)
  - Tap outside panel or Back button to close (replaces Escape)
- Minimum touch target: 48×48 display pixels
- All UI element sizes multiplied by `global.ui_scale`

#### F40.5 — Scaled UI Elements
- HUD elements scaled by `global.ui_scale`
- HUD repositioned for thumb accessibility on mobile
- Inventory grid: larger cells (28 * scale), tap-to-select + context menu
- Crafting: larger recipe list items, tap-to-craft button
- Journal: larger tab buttons, scrollable with touch drag
- Map: pinch-to-zoom (optional), tap POI for fast travel confirmation
- Dialogue: larger response buttons, tap to advance text

#### F40.6 — Input Abstraction Layer
- New input functions that abstract keyboard vs touch:
  - `input_move_x()` / `input_move_y()` → returns -1/0/1 from keyboard OR joystick vector
  - `input_action_pressed()` → Enter key OR primary action tap
  - `input_cancel_pressed()` → Escape key OR back button tap
  - `input_ui_up/down/left/right()` → Arrow keys OR touch list navigation
- All existing game code migrated to use abstraction functions
- Eliminates need for duplicate input checks everywhere

#### F40.7 — Safe Area Handling
- Detect display safe area insets (notches, rounded corners)
- Offset HUD and touch controls away from unsafe edges
- Configurable safe area padding

#### F40.8 — Mobile Performance Considerations
- Particle limit cap on mobile (50% of PC limits)
- Reduced ambient sound layers on mobile (max 2 simultaneous vs 4 on PC)
- Touch input polling optimized (process only active touches)

### Non-Functional Requirements
- Zero impact on PC gameplay when `global.is_mobile == false`
- All touch elements use consistent visual style matching existing UI (steampunk palette)
- Touch controls must not overlap with game UI elements
- Virtual joystick must feel responsive (no input lag beyond 1 frame)

---

## File Inventory (Expected Output)

### New GML Scripts
| File | Est. Lines | Description |
|------|-----------|-------------|
| `scr_audio_manager.gml` | ~500 | Audio manager: channels, music, crossfade, layers |
| `scr_audio_sfx.gml` | ~200 | SFX playback, priority, positional audio |
| `scr_audio_ambient.gml` | ~150 | Ambient soundscape management |
| `scr_mobile_input.gml` | ~350 | Virtual joystick, touch buttons, input abstraction |
| `scr_mobile_ui.gml` | ~250 | Mobile UI scaling, safe area, touch panel helpers |

### New JSON Data Files
| File | Description |
|------|-------------|
| `audio_config.json` | Master audio configuration (tracks, SFX, ambience, layers) |

### Modified Files
| File | Changes |
|------|---------|
| All `scr_ui_*.gml` (5 files) | Add touch input support, scale factors |
| `scr_room_data.gml` | Read `music_id`, `ambience_id` from room JSON |
| `scr_seasonal_visuals.gml` | Hook audio season changes |
| All room JSON files (21 files) | Add `music_id` and `ambience_id` fields |
| `scr_raid_system.gml` | Hook dynamic music layers |
| `scr_mech_combat.gml` | Hook mech music trigger |
| `scr_festival_system.gml` | Hook festival music |
| `scr_romance_system.gml` | Hook heart event music |
| `scr_dejin_system.gml` | Hook DEJIN memory music |

### Estimated Totals
- **5 new GML scripts** (~1,450 lines)
- **1 new JSON data file** (~800+ lines)
- **~30 modified files** (room JSONs + existing scripts)
- **Total new code:** ~2,250+ lines
