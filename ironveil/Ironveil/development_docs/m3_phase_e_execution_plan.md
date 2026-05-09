# Ironveil — Phase E Execution Plan
**Date:** 2026-03-19
**Objectives:** #39 (Sound & Music), #40 (Mobile UI)

---

## Execution Order

The two objectives are largely independent but share one touchpoint: the input abstraction layer bridges both. Audio can be built first since it has no dependencies on mobile UI, while mobile UI benefits from audio being in place (UI sounds).

### Step 1: Audio Configuration Data (`audio_config.json`)
**Why first:** All audio code depends on this data file. Define it first so the manager can be built against a real schema.

**Schema:**
```json
{
  "music_tracks": {
    "mus_title_theme": { "description": "Main theme — title screen" },
    "mus_coppervale_spring": { "description": "Coppervale Spring" },
    ...
  },
  "music_mappings": [
    { "room_id": "rm_town_coppervale", "season": "spring", "time": "day", "state": "gameplay", "track": "mus_coppervale_spring" },
    { "room_id": "rm_town_coppervale", "season": "spring", "time": "night", "state": "gameplay", "track": "mus_coppervale_spring" },
    ...
  ],
  "music_overrides": [
    { "game_state": "raid", "condition": "default", "track": "mus_hold_the_line" },
    { "game_state": "raid", "condition": "iron_marauder", "track": "mus_iron_march" },
    { "game_state": "raid", "condition": "boss_marshal", "track": "mus_the_marshal" },
    { "game_state": "mech", "condition": "default", "track": "mus_mech_deployed" },
    { "game_state": "festival", "condition": "spark_festival", "track": "mus_spark_festival" },
    ...
  ],
  "raid_layers": {
    "base_track": "mus_hold_the_line_base",
    "escalation_track": "mus_hold_the_line_escalation",
    "crisis_track": "mus_hold_the_line_crisis",
    "escalation_wave_threshold": 3,
    "crisis_hp_threshold": 0.3
  },
  "ambience": {
    "amb_coppervale_day": { "description": "Town daytime bustle" },
    "amb_coppervale_night": { "description": "Crickets, owl, lanterns" },
    "amb_workshop": { "description": "Machine hum, ticking gauges" },
    "amb_rustwood": { "description": "Creaking trees, metallic groaning" },
    ...
  },
  "ambience_mappings": [
    { "room_id": "rm_town_coppervale", "time": "day", "ambience": "amb_coppervale_day" },
    { "room_id": "rm_town_coppervale", "time": "night", "ambience": "amb_coppervale_night" },
    { "room_id": "rm_int_workshop", "time": "any", "ambience": "amb_workshop" },
    ...
  ],
  "weather_overlays": {
    "RAIN": "amb_rain_loop",
    "STORM": "amb_storm_loop",
    "SNOW": "amb_snow_loop",
    "FOG": "amb_fog_loop"
  },
  "sfx": {
    "sfx_wrench_turn": { "gain": 0.8, "pitch_min": 0.95, "pitch_max": 1.05, "priority": 2, "category": "workshop" },
    "sfx_forge_fire": { "gain": 0.7, "pitch_min": 1.0, "pitch_max": 1.0, "priority": 2, "category": "workshop" },
    "sfx_turret_ballistic": { "gain": 1.0, "pitch_min": 0.95, "pitch_max": 1.05, "priority": 4, "category": "combat" },
    "sfx_menu_open": { "gain": 0.6, "pitch_min": 1.0, "pitch_max": 1.0, "priority": 5, "category": "ui" },
    "sfx_footstep_grass": { "gain": 0.4, "pitch_min": 0.9, "pitch_max": 1.1, "priority": 1, "category": "environmental" },
    "sfx_footstep_stone": { "gain": 0.5, "pitch_min": 0.9, "pitch_max": 1.1, "priority": 1, "category": "environmental" },
    "sfx_footstep_wood": { "gain": 0.45, "pitch_min": 0.9, "pitch_max": 1.1, "priority": 1, "category": "environmental" },
    "sfx_footstep_metal": { "gain": 0.55, "pitch_min": 0.9, "pitch_max": 1.1, "priority": 1, "category": "environmental" },
    ...
  },
  "sfx_priority_order": ["ui", "combat", "workshop", "dialogue", "environmental"],
  "npc_vocals": {
    "spark": ["vocal_spark_excited", "vocal_spark_happy", "vocal_spark_curious"],
    "harrow": ["vocal_harrow_gruff", "vocal_harrow_hmm"],
    ...
  },
  "settings_defaults": {
    "master": 0.8,
    "music": 0.7,
    "ambient": 0.6,
    "sfx": 0.9,
    "ui": 0.8,
    "dialogue": 0.9
  }
}
```

### Step 2: Audio Manager Core (`scr_audio_manager.gml`)
**Functions to implement:**
- `audio_manager_init()` — Initialize channel state, load config, set default volumes
- `audio_manager_set_volume(_channel, _vol)` — Set per-channel volume (0.0-1.0)
- `audio_manager_get_volume(_channel)` — Get current volume
- `audio_manager_update()` — Called every step: handle crossfades, layer transitions, time-of-day adjustments
- `audio_manager_play_music(_track_id)` — Start crossfade to new music track
- `audio_manager_stop_music()` — Fade out current music
- `audio_manager_on_room_enter(_room_id)` — Evaluate music + ambience for new room
- `audio_manager_on_state_change(_new_state)` — Handle game state music overrides
- `audio_manager_on_season_change(_new_season)` — Swap seasonal music variant
- `audio_manager_save_settings()` — Persist volume settings
- `audio_manager_load_settings()` — Restore volume settings

**Music crossfade implementation:**
- Track two sound instance IDs: `_current_music_id`, `_next_music_id`
- When crossfading: `_next_music_id` starts at gain 0, ramps to target over 120 frames (2 sec at 60fps)
- `_current_music_id` ramps from current gain to 0 over same duration
- On completion: stop old track, promote next to current

### Step 3: Dynamic Raid Music Layers
**Add to `scr_audio_manager.gml`:**
- `audio_manager_raid_start(_faction)` — Start base raid layer, select faction-specific track
- `audio_manager_raid_escalate(_wave_num)` — Add escalation layer if threshold met
- `audio_manager_raid_crisis(_active)` — Add/remove crisis layer
- `audio_manager_raid_end()` — Fade all layers, transition to victory or normal music
- `audio_manager_mech_deploy()` — Hard crossfade to mech track
- `audio_manager_mech_exit()` — Return to raid music with current layers

**Hook points (modifications to existing scripts):**
- `scr_raid_system.gml` — Call `audio_manager_raid_start()` on raid begin, `_escalate()` on wave advance, `_end()` on victory/defeat
- `scr_mech_combat.gml` — Call `audio_manager_mech_deploy()` on mech entry, `_exit()` on mech exit

### Step 4: Ambient Soundscape System (`scr_audio_ambient.gml`)
**Functions:**
- `ambient_init()` — Initialize ambient state
- `ambient_update()` — Handle crossfades, weather overlay mixing
- `ambient_play(_ambience_id)` — Start crossfade to new ambient track
- `ambient_add_weather_overlay(_weather)` — Layer weather sound on top
- `ambient_remove_weather_overlay()` — Fade out weather layer
- `ambient_on_room_enter(_room_id)` — Look up and play room ambience
- `ambient_on_weather_change(_new_weather)` — Add/remove weather overlay
- `ambient_on_time_change(_new_period)` — Switch day/night ambient variant

### Step 5: SFX System (`scr_audio_sfx.gml`)
**Functions:**
- `sfx_init()` — Load SFX config, initialize tracking array
- `sfx_play(_sfx_id)` — Play SFX with configured gain, pitch variance, priority check
- `sfx_play_at(_sfx_id, _x, _y)` — Positional SFX with distance-based gain falloff
- `sfx_play_ui(_sfx_id)` — Play UI sound (highest priority, no position)
- `sfx_play_footstep(_terrain_type)` — Terrain-aware footstep (grass/stone/wood/metal)
- `sfx_play_npc_vocal(_npc_id)` — Random vocal clip from NPC's pool

**Priority enforcement:**
- Track up to 8 active SFX instances in array
- On new play request: if at limit, compare priority against lowest active
- If new priority >= lowest, stop lowest and play new
- If new priority < all active, skip (don't play)

### Step 6: Room JSON Updates (21 files)
Add `music_id` and `ambience_id` to each room JSON. Mapping from sound design doc:

| Room | music_id | ambience_id |
|------|----------|-------------|
| rm_town_coppervale | (seasonal lookup) | amb_coppervale_day / _night |
| rm_int_workshop | mus_workshop_{season} | amb_workshop |
| rm_int_rusty_gear | mus_coppervale_{season} | amb_tavern |
| rm_int_living_quarters | mus_coppervale_{season} | amb_interior_quiet |
| rm_int_general_store | mus_coppervale_{season} | amb_interior_quiet |
| rm_int_parts_dealer | mus_coppervale_{season} | amb_interior_quiet |
| rm_int_clinic | mus_coppervale_{season} | amb_interior_quiet |
| rm_int_archive | mus_coppervale_{season} | amb_interior_quiet |
| rm_int_smithy | mus_coppervale_{season} | amb_smithy |
| rm_int_chapel | mus_coppervale_{season} | amb_interior_quiet |
| rm_int_town_hall | mus_coppervale_{season} | amb_interior_quiet |
| rm_int_npc_home_template | mus_coppervale_{season} | amb_interior_quiet |
| rm_explore_the_hollow | mus_the_hollow | amb_hollow |
| rm_explore_old_mill | mus_the_hollow | amb_rustwood |
| rm_explore_rustwood_edge | mus_rustwood | amb_rustwood |
| rm_explore_deep_rustwood | mus_rustwood | amb_rustwood |
| rm_explore_ashspine_foothills | mus_ashspine | amb_ashspine |
| rm_explore_coastal_wreck | mus_shattered_coast | amb_coast |
| rm_explore_mountain_bunker | mus_ashspine | amb_bunker |
| rm_explore_scorchland_outpost | mus_scorchlands | amb_scorchlands |
| rm_explore_spire_wastes | mus_spire_wastes | amb_spire_wastes |

**Modify `scr_room_data.gml`:**
- In `room_data_load()`: read `music_id` and `ambience_id` fields (default to `undefined` if missing)

### Step 7: Hook Existing Systems
**Modifications to integrate audio calls into existing scripts:**

| Script | Hook Point | Audio Call |
|--------|-----------|------------|
| `scr_raid_system.gml` | Raid start | `audio_manager_raid_start(_faction)` |
| `scr_raid_system.gml` | Wave advance | `audio_manager_raid_escalate(_wave)` |
| `scr_raid_system.gml` | Raid end | `audio_manager_raid_end()` |
| `scr_mech_combat.gml` | Mech deploy | `audio_manager_mech_deploy()` |
| `scr_mech_combat.gml` | Mech exit | `audio_manager_mech_exit()` |
| `scr_festival_system.gml` | Festival start | `audio_manager_play_music("mus_" + _festival_id)` |
| `scr_romance_system.gml` | Heart event start | `audio_manager_play_music("mus_heart_to_heart")` |
| `scr_dejin_system.gml` | Memory playback | `audio_manager_play_music("mus_old_world")` |
| `scr_seasonal_visuals.gml` | Season change | `audio_manager_on_season_change(_season)` |
| `scr_seasonal_visuals.gml` | Weather change | `ambient_on_weather_change(_weather)` |
| `scr_room_data.gml` | Room loaded | `audio_manager_on_room_enter(_room_id)` |
| All `scr_ui_*.gml` | Menu open/close | `sfx_play_ui("sfx_menu_open/close")` |

### Step 8: Settings Menu Audio Controls
**Add to existing settings UI or create `scr_ui_settings.gml`:**
- Volume sliders for: Master, Music, Ambient, SFX, UI
- Slider UI: horizontal bar with draggable handle
- Real-time preview (adjust volume as slider moves)
- Save on close

### Step 9: Input Abstraction Layer (`scr_mobile_input.gml` — Part 1)
**This is the bridge between #39 and #40.**

**Input abstraction functions (work on all platforms):**
- `input_init()` — Detect platform, set `global.is_mobile`
- `input_move_x()` — Returns -1/0/1 from keyboard OR joystick X
- `input_move_y()` — Returns -1/0/1 from keyboard OR joystick Y
- `input_action_pressed()` — Enter/Space OR primary action tap
- `input_cancel_pressed()` — Escape OR back button tap
- `input_direction_up/down/left/right()` — Arrow keys OR touch navigation
- `input_tab_next()` / `input_tab_prev()` — Q/E OR tab tap
- `input_pointer_x()` / `input_pointer_y()` — Mouse position OR touch position (GUI coords)
- `input_pointer_pressed()` — Mouse click OR touch tap
- `input_pointer_released()` — Mouse release OR touch release

**PC gets mouse support for free** — `input_pointer_pressed()` checks `mouse_check_button_pressed(mb_left)` on PC, `device_mouse_check_button_pressed(0, mb_left)` on mobile.

### Step 10: Virtual Joystick Implementation (Mobile Only)
**Added to `scr_mobile_input.gml`:**
- `joystick_update()` — Process touch input, calculate direction vector
- `joystick_draw()` — Render joystick visuals (semi-transparent, steampunk-styled)
- State: `global.joystick` struct with `{active, origin_x, origin_y, thumb_x, thumb_y, dir_x, dir_y}`
- Touch detection: first finger on left half of screen activates joystick
- Dead zone: 8 * global.ui_scale pixels
- Max radius: 40 * global.ui_scale pixels

### Step 11: Touch Action Buttons (Mobile Only)
**Added to `scr_mobile_ui.gml`:**
- `mobile_ui_init()` — Create touch button definitions
- `mobile_ui_draw()` — Render touch buttons (right side)
- `mobile_ui_update()` — Process touch input on buttons
- `mobile_action_get_context()` — Determine context label ("Talk", "Use", "Pick Up")
- Buttons: Primary Action (large, bottom-right), Secondary Action (above primary), Back (top-right)
- Quick-action bar: 3 small buttons above action buttons, mapped to hotbar

### Step 12: Migrate Existing UI to Input Abstraction
**Modify all 5 `scr_ui_*.gml` files:**
- Replace `keyboard_check_pressed(vk_up/down)` → `input_direction_up/down()`
- Replace `keyboard_check_pressed(vk_enter)` → `input_action_pressed()`
- Replace `keyboard_check_pressed(vk_escape)` → `input_cancel_pressed()`
- Replace `keyboard_check_pressed(ord("Q"/"E"))` → `input_tab_prev/next()`
- Add touch hit-testing: on `input_pointer_pressed()`, check if pointer is within element bounds
- Scale all sizes by `global.ui_scale`
- Add `sfx_play_ui()` calls for interactions

### Step 13: HUD Mobile Adaptation
**Modify `scr_ui_hud.gml`:**
- Scale all HUD elements by `global.ui_scale`
- Reposition for mobile: move clock to top-center, energy to top-left, hotbar to bottom-center
- On mobile: hide keyboard-centric hotbar numbers, show touch-friendly versions
- Integrate joystick and action button drawing into HUD draw order

### Step 14: Safe Area & Final Polish
- Define `global.safe_area` struct: `{left, right, top, bottom}` padding in pixels
- On iOS: derive from display metrics. On Android: use configurable default (24px)
- Offset all HUD and touch elements by safe area padding
- Test all UI panels at 1.5x and 2.0x scale
- Verify no touch targets overlap
- Performance: cap particle systems on mobile

---

## Dependency Graph

```
Step 1: audio_config.json
    ├── Step 2: scr_audio_manager.gml (core)
    │       ├── Step 3: Dynamic raid layers
    │       ├── Step 4: scr_audio_ambient.gml
    │       └── Step 5: scr_audio_sfx.gml
    ├── Step 6: Room JSON updates
    ├── Step 7: Hook existing systems
    └── Step 8: Settings menu audio

Step 9: Input abstraction layer
    ├── Step 10: Virtual joystick
    ├── Step 11: Touch action buttons
    ├── Step 12: Migrate UI scripts
    ├── Step 13: HUD mobile adaptation
    └── Step 14: Safe area & polish
```

Steps 1-8 (Audio) and Steps 9-14 (Mobile) are **independent tracks** that can be executed sequentially. Step 12 depends on both Step 9 (input abstraction) and Step 5 (UI SFX).

---

## Execution Strategy
1. Build all audio systems first (Steps 1-8) — this is the larger, more complex objective
2. Build input abstraction and mobile systems (Steps 9-14)
3. Final integration pass: ensure audio plays correctly with mobile input
