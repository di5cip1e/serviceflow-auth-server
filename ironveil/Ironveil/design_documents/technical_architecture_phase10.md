# ⚙️ IRONVEIL — PHASE 10: TECHNICAL ARCHITECTURE
## Complete Implementation Specification for GameMaker (GML)

---

> **"Every gear must mesh. Every pipe must seal. The architecture is the machine beneath the machine."**
> *— The Djinn*

---

## TABLE OF CONTENTS

### Part 1: Core Architecture
1. [Project Configuration & Build Settings](#1-project-configuration--build-settings)
2. [Game State Machine](#2-game-state-machine)
3. [Time & Calendar System](#3-time--calendar-system)
4. [Data Architecture & Loading Pipeline](#4-data-architecture--loading-pipeline)

### Part 2: Rendering & Visual Systems
5. [Tile Engine](#5-tile-engine)
6. [Rendering Pipeline](#6-rendering-pipeline)
7. [Camera System](#7-camera-system)
8. [Shader Pipeline](#8-shader-pipeline)
9. [Particle System](#9-particle-system)

### Part 3: Gameplay Systems
10. [Inventory & Storage System](#10-inventory--storage-system)
11. [Crafting & Workshop System](#11-crafting--workshop-system)
12. [NPC AI & Schedule System](#12-npc-ai--schedule-system)
13. [Relationship & Gift System](#13-relationship--gift-system)
14. [Energy & Stamina System](#14-energy--stamina-system)

### Part 4: Combat & Defense
15. [Tower Defense System](#15-tower-defense-system)
16. [Enemy AI & Pathfinding](#16-enemy-ai--pathfinding)
17. [Mech Combat System](#17-mech-combat-system)
18. [Raid Lifecycle Manager](#18-raid-lifecycle-manager)

### Part 5: World Systems
19. [Exploration & Zone System](#19-exploration--zone-system)
20. [Event System & Story Flags](#20-event-system--story-flags)
21. [Economy & Trade System](#21-economy--trade-system)
22. [Journal & Discovery System](#22-journal--discovery-system)

### Part 6: Infrastructure
23. [Save/Load System](#23-saveload-system)
24. [Audio System](#24-audio-system)
25. [Input System](#25-input-system)
26. [UI System Architecture](#26-ui-system-architecture)
27. [Performance & Optimization](#27-performance--optimization)

### Appendices
- [A: Complete JSON Schema Reference](#appendix-a-complete-json-schema-reference)
- [B: System Integration Map](#appendix-b-system-integration-map)
- [C: GML Naming Conventions](#appendix-c-gml-naming-conventions)

---

# PART 1: CORE ARCHITECTURE

---

## 1. PROJECT CONFIGURATION & BUILD SETTINGS

### 1.1 Target Specifications

| Setting | Value | Notes |
|---------|-------|-------|
| **Engine** | GameMaker LTS (latest stable) | Use LTS for stability |
| **Language** | GML (modern — structs, methods, feather) | Enable Feather for type checking |
| **Native Resolution** | 320×240 px | 20×15 tiles at 16px |
| **Display Scale** | 3x (960×720) — 4x (1280×960) — 6x (1920×1440) | User-selectable |
| **Target FPS** | 60 | All platforms |
| **Room Speed** | 60 | Matches target FPS |
| **Color Depth** | 32-bit RGBA | Standard |
| **Texture Page Size** | 2048×2048 | Balance quality/memory |
| **Audio Format** | OGG Vorbis (music/ambient), WAV (SFX) | OGG for streaming, WAV for low-latency |

### 1.2 Texture Groups

Organize sprites into texture groups to control GPU memory:

| Texture Group | Contents | Load Strategy |
|---------------|----------|---------------|
| `tg_always` | Player sprites, HUD, common UI elements, tools | Always loaded |
| `tg_coppervale` | Town tilesets, NPC sprites, building tilesets | Loaded in town rooms |
| `tg_interiors` | Interior furniture, workshop equipment | Loaded in interior rooms |
| `tg_exploration_{region}` | Region-specific tilesets (one group per region) | Loaded on zone entry |
| `tg_combat` | Enemy sprites, turret sprites, mech sprites, effects | Loaded during raids |
| `tg_ui_screens` | Menu screens, full UI panels | Loaded on demand |
| `tg_portraits` | NPC dialogue portraits | Loaded during dialogue |
| `tg_seasonal_{season}` | Season-specific vegetation, overlays | Swapped on season change |

### 1.3 Audio Groups

| Audio Group | Contents | Behavior |
|-------------|----------|----------|
| `ag_music` | All music tracks | Stream from disk, one at a time |
| `ag_ambient` | Ambient loops (wind, birds, machinery) | Stream, mixable |
| `ag_sfx` | Sound effects | Preloaded, instant playback |
| `ag_ui` | UI sounds (clicks, notifications) | Preloaded, priority over SFX |
| `ag_dialogue` | NPC vocal clips | Loaded per conversation |

### 1.4 Build Configurations

| Config | Use | Settings |
|--------|-----|----------|
| `debug` | Development | Show collision masks, FPS counter, debug overlay, verbose logging |
| `testing` | QA builds | FPS counter, error logging, no debug overlay |
| `release` | Production | No debug features, optimized, minified data |

### 1.5 Naming Conventions (Code)

| Element | Convention | Example |
|---------|-----------|---------|
| **Objects** | `obj_{category}_{name}` | `obj_sys_game_manager`, `obj_npc_spark` |
| **Scripts** | `scr_{system}_{action}` | `scr_save_write_to_disk`, `scr_inv_add_item` |
| **Functions** | `{system}_{action}` (within scripts) | `time_advance_hour()`, `npc_get_schedule()` |
| **Variables (global)** | `global.{system}_{name}` | `global.time_hour`, `global.player_energy` |
| **Variables (instance)** | `{descriptive_name}` | `current_hp`, `target_npc_id` |
| **Constants/Enums** | `UPPER_SNAKE_CASE` | `STATE_GAMEPLAY`, `SEASON_SPRING` |
| **Structs** | `PascalCase` | `ItemData`, `NpcScheduleEntry` |
| **Data files** | `lowercase_snake.json` | `items.json`, `npc_spark.json` |
| **Rooms** | `rm_{category}_{name}` | `rm_town_coppervale`, `rm_int_workshop` |
| **Sprites** | Per Art Pipeline convention | `spr_jack_player_sheet` |
| **Tilesets** | Per Art Pipeline convention | `ts_grass_spring_sheet` |

---

## 2. GAME STATE MACHINE

### 2.1 State Hierarchy

The game uses a **hierarchical state machine** with a top-level state and nested sub-states:

```
GameState (Top Level)
├── STATE_BOOT
│   └── Loading data files, initializing systems
├── STATE_TITLE
│   ├── SUB_MAIN_MENU
│   ├── SUB_SETTINGS
│   ├── SUB_LOAD_GAME
│   └── SUB_CREDITS
├── STATE_GAMEPLAY
│   ├── SUB_FREE_ROAM          (normal overworld/interior movement)
│   ├── SUB_DIALOGUE            (NPC conversation active)
│   ├── SUB_CUTSCENE            (scripted scene playing)
│   ├── SUB_MENU_OVERLAY        (inventory/journal/map open)
│   │   ├── MENU_INVENTORY
│   │   ├── MENU_CRAFTING
│   │   ├── MENU_JOURNAL
│   │   ├── MENU_MAP
│   │   ├── MENU_RELATIONSHIPS
│   │   └── MENU_SETTINGS
│   ├── SUB_WORKSHOP            (assembly crane interaction)
│   ├── SUB_SHOP                (buying/selling interface)
│   └── SUB_MAINTENANCE         (machine maintenance interaction)
├── STATE_RAID
│   ├── SUB_RAID_PREP           (placement phase before raid)
│   ├── SUB_RAID_STRATEGIC      (top-down tower defense view)
│   ├── SUB_RAID_MECH           (direct mech control)
│   └── SUB_RAID_AFTERMATH      (post-raid summary)
├── STATE_EXPLORATION
│   ├── SUB_EXPLORE_NAVIGATE    (moving through zone)
│   ├── SUB_EXPLORE_PUZZLE      (puzzle/obstacle interaction)
│   ├── SUB_EXPLORE_COMBAT      (encounter in exploration)
│   └── SUB_EXPLORE_DISCOVERY   (blueprint/data core found — special animation)
├── STATE_FESTIVAL
│   ├── SUB_FESTIVAL_OPEN       (festival area, free movement)
│   └── SUB_FESTIVAL_MINIGAME   (active mini-game)
└── STATE_TRANSITION
    └── Fade/slide between rooms
```

### 2.2 State Manager Implementation

The state manager is a **singleton object** (`obj_sys_game_manager`) that persists across all rooms:

```gml
// obj_sys_game_manager — Create Event

// Enums
enum GAME_STATE {
    BOOT,
    TITLE,
    GAMEPLAY,
    RAID,
    EXPLORATION,
    FESTIVAL,
    TRANSITION
}

enum GAMEPLAY_SUB {
    FREE_ROAM,
    DIALOGUE,
    CUTSCENE,
    MENU_OVERLAY,
    WORKSHOP,
    SHOP,
    MAINTENANCE
}

enum RAID_SUB {
    PREP,
    STRATEGIC,
    MECH,
    AFTERMATH
}

enum MENU_TAB {
    INVENTORY,
    CRAFTING,
    JOURNAL,
    MAP,
    RELATIONSHIPS,
    SETTINGS
}

// State variables
current_state = GAME_STATE.BOOT;
current_sub_state = -1;
previous_state = -1;
previous_sub_state = -1;
state_timer = 0;           // Frames since state entry
sub_state_timer = 0;       // Frames since sub-state entry
state_transition_data = {}; // Arbitrary data passed between states
```

### 2.3 State Transition Rules

```gml
/// @function state_change(_new_state, _new_sub, _transition_data)
/// @description Handles state transitions with validation and callbacks
function state_change(_new_state, _new_sub = -1, _transition_data = {}) {
    // Store previous
    previous_state = current_state;
    previous_sub_state = current_sub_state;
    
    // Exit callback for current state
    state_on_exit(current_state, current_sub_state);
    
    // Set new state
    current_state = _new_state;
    current_sub_state = _new_sub;
    state_timer = 0;
    sub_state_timer = 0;
    state_transition_data = _transition_data;
    
    // Entry callback for new state
    state_on_enter(current_state, current_sub_state);
}
```

### 2.4 State Behaviors

| State | Time Runs? | Player Input? | NPCs Active? | Save Allowed? |
|-------|-----------|--------------|--------------|--------------|
| `BOOT` | No | No | No | No |
| `TITLE` | No | Yes (menus) | No | No (load only) |
| `GAMEPLAY.FREE_ROAM` | Yes | Full | Yes | No (auto-save on sleep) |
| `GAMEPLAY.DIALOGUE` | **Paused** | Dialogue choices | Frozen | No |
| `GAMEPLAY.CUTSCENE` | **Paused** | Skip only | Scripted | No |
| `GAMEPLAY.MENU_OVERLAY` | **Paused** | Menu nav | Frozen | Yes (manual save) |
| `GAMEPLAY.WORKSHOP` | Yes (slow) | Workshop UI | Nearby only | No |
| `GAMEPLAY.SHOP` | **Paused** | Shop UI | Frozen | No |
| `GAMEPLAY.MAINTENANCE` | Yes (slow) | Maintenance UI | Nearby only | No |
| `RAID.PREP` | **Paused** | Placement UI | Frozen | Auto-save on entry |
| `RAID.STRATEGIC` | Yes (raid time) | Strategic commands | Combat AI only | No |
| `RAID.MECH` | Yes (raid time) | Mech controls | Combat AI only | No |
| `RAID.AFTERMATH` | **Paused** | Summary UI | Frozen | Auto-save on exit |
| `EXPLORATION.*` | Yes | Full (in zone) | Zone NPCs only | Checkpoint save |
| `FESTIVAL.*` | Yes | Festival UI | Festival attendees | No |
| `TRANSITION` | No | No | No | No |

### 2.5 Room-to-State Mapping

Each GameMaker room type maps to an expected state:

| Room Pattern | Expected State | On Room Enter |
|-------------|---------------|---------------|
| `rm_title` | `STATE_TITLE` | Set state, play title music |
| `rm_town_*` | `STATE_GAMEPLAY` | Set FREE_ROAM, activate town NPCs |
| `rm_int_*` | `STATE_GAMEPLAY` | Set FREE_ROAM, load interior NPCs |
| `rm_raid_*` | `STATE_RAID` | Set PREP, load defense data |
| `rm_explore_*` | `STATE_EXPLORATION` | Set NAVIGATE, load zone data |
| `rm_festival_*` | `STATE_FESTIVAL` | Set OPEN, load festival data |
| `rm_cutscene_*` | `STATE_GAMEPLAY` | Set CUTSCENE, run script |

---

## 3. TIME & CALENDAR SYSTEM

### 3.1 Core Time Variables

```gml
// Managed by obj_sys_time_manager (persistent)

// Raw time tracking
global.time_total_minutes = 0;  // Cumulative game minutes since game start (for aging/wear)
global.time_tick_accumulator = 0.0; // Sub-frame accumulator for smooth time progression

// Current time
global.time_minute = 0;    // 0-59
global.time_hour = 6;      // 0-23 (game starts at 6:00 AM)
global.time_day = 1;       // 1-30
global.time_season = 0;    // 0=Spring, 1=Summer, 2=Autumn, 3=Winter
global.time_year = 1;      // 1-20
global.time_day_of_week = 0; // 0-6 (derived: (time_day - 1) mod 7)

// Time control
global.time_paused = false;
global.time_speed_multiplier = 1.0;  // 1.0 = normal, can be adjusted for cutscenes

// Derived convenience
global.time_period = TIME_PERIOD.DAWN;  // Updated each frame
global.time_is_night = false;           // true if hour >= 21 or hour < 6
```

### 3.2 Time Progression

```gml
// Time speed: 1 real second = 1.2 game minutes
// At 60 FPS: each frame advances 1.2/60 = 0.02 game minutes

#macro TIME_MINUTES_PER_REAL_SECOND 1.2
#macro TIME_MINUTES_PER_FRAME (TIME_MINUTES_PER_REAL_SECOND / game_get_speed(gamespeed_fps))

/// @function time_step()
/// @description Called every frame by obj_sys_time_manager Step event
function time_step() {
    if (global.time_paused) return;
    
    global.time_tick_accumulator += TIME_MINUTES_PER_FRAME * global.time_speed_multiplier;
    
    // Process whole minutes
    while (global.time_tick_accumulator >= 1.0) {
        global.time_tick_accumulator -= 1.0;
        time_advance_minute();
    }
}

/// @function time_advance_minute()
function time_advance_minute() {
    global.time_minute++;
    global.time_total_minutes++;
    
    if (global.time_minute >= 60) {
        global.time_minute = 0;
        time_advance_hour();
    }
    
    // Update derived values
    time_update_period();
}

/// @function time_advance_hour()
function time_advance_hour() {
    global.time_hour++;
    
    // Hourly events
    event_system_fire("on_hour_change", { hour: global.time_hour });
    
    // Fatigue check at midnight
    if (global.time_hour == 0) {
        event_system_fire("on_midnight", {});
    }
    
    // Force collapse at 2 AM
    if (global.time_hour == 2) {
        event_system_fire("on_player_collapse", {});
    }
    
    if (global.time_hour >= 24) {
        global.time_hour = 0;
        // Note: Day does NOT advance at midnight.
        // Day advances when the player SLEEPS.
        // This mirrors Harvest Moon behavior.
    }
}

/// @function time_advance_day()
/// @description Called when player sleeps, NOT at midnight
function time_advance_day() {
    global.time_day++;
    global.time_day_of_week = (global.time_day - 1) mod 7;
    
    // Reset daily flags
    event_system_fire("on_day_start", { 
        day: global.time_day, 
        season: global.time_season, 
        year: global.time_year 
    });
    
    if (global.time_day > 30) {
        global.time_day = 1;
        time_advance_season();
    }
    
    // Reset clock to 6 AM
    global.time_hour = 6;
    global.time_minute = 0;
    global.time_tick_accumulator = 0;
}

/// @function time_advance_season()
function time_advance_season() {
    global.time_season++;
    
    event_system_fire("on_season_change", { 
        new_season: global.time_season,
        year: global.time_year 
    });
    
    if (global.time_season > 3) {
        global.time_season = 0;
        time_advance_year();
    }
}

/// @function time_advance_year()
function time_advance_year() {
    global.time_year++;
    event_system_fire("on_year_change", { year: global.time_year });
}
```

### 3.3 Time Period Calculation

```gml
enum TIME_PERIOD {
    DAWN,       // 6:00 - 7:59
    MORNING,    // 8:00 - 11:59
    AFTERNOON,  // 12:00 - 16:59
    EVENING,    // 17:00 - 20:59
    NIGHT,      // 21:00 - 23:59
    LATE_NIGHT  // 0:00 - 5:59
}

/// @function time_update_period()
function time_update_period() {
    var _h = global.time_hour;
    
    if (_h >= 6 && _h < 8)       global.time_period = TIME_PERIOD.DAWN;
    else if (_h >= 8 && _h < 12)  global.time_period = TIME_PERIOD.MORNING;
    else if (_h >= 12 && _h < 17) global.time_period = TIME_PERIOD.AFTERNOON;
    else if (_h >= 17 && _h < 21) global.time_period = TIME_PERIOD.EVENING;
    else if (_h >= 21)            global.time_period = TIME_PERIOD.NIGHT;
    else                          global.time_period = TIME_PERIOD.LATE_NIGHT;
    
    global.time_is_night = (_h >= 21 || _h < 6);
}

/// @function time_get_progress_in_day()
/// @description Returns 0.0-1.0 representing position within the waking day (6AM-2AM)
/// @returns {real}
function time_get_progress_in_day() {
    var _minutes_since_wake = (global.time_hour - 6) * 60 + global.time_minute;
    if (_minutes_since_wake < 0) _minutes_since_wake += 1440; // wrapped past midnight
    return clamp(_minutes_since_wake / 1200, 0, 1); // 1200 min = 6AM to 2AM
}
```

### 3.4 Season & Calendar Constants

```gml
enum SEASON {
    SPRING = 0,
    SUMMER = 1,
    AUTUMN = 2,
    WINTER = 3
}

// Season names for display
global.season_names = ["Spring", "Summer", "Autumn", "Winter"];

// Day names (7-day week)
global.day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Festival dates { season: day }
global.festivals = {
    spring_spark: { season: SEASON.SPRING, day: 15 },
    summer_sky:   { season: SEASON.SUMMER, day: 20 },
    autumn_harvest: { season: SEASON.AUTUMN, day: 25 },
    winter_remembrance: { season: SEASON.WINTER, day: 10 }
};

/// @function time_is_festival_today()
/// @returns {string|undefined} Festival key or undefined
function time_is_festival_today() {
    var _keys = variable_struct_get_names(global.festivals);
    for (var i = 0; i < array_length(_keys); i++) {
        var _f = global.festivals[$ _keys[i]];
        if (_f.season == global.time_season && _f.day == global.time_day) {
            return _keys[i];
        }
    }
    return undefined;
}
```

### 3.5 Weather System

```gml
enum WEATHER {
    CLEAR = 0,
    CLOUDY = 1,
    RAIN = 2,
    STORM = 3,
    SNOW = 4,   // Winter only
    FOG = 5     // Rare
}

// Weather state (managed by obj_sys_time_manager)
global.weather_current = WEATHER.CLEAR;
global.weather_duration_remaining = 0; // Hours remaining for current weather
global.weather_next = WEATHER.CLEAR;   // Queued weather after duration expires

/// @function weather_roll_new()
/// @description Called at start of each day to determine weather
function weather_roll_new() {
    var _season = global.time_season;
    
    // Base probabilities per season [clear, cloudy, rain, storm, snow, fog]
    var _probs;
    switch (_season) {
        case SEASON.SPRING: _probs = [0.40, 0.25, 0.25, 0.05, 0.00, 0.05]; break;
        case SEASON.SUMMER: _probs = [0.55, 0.20, 0.15, 0.08, 0.00, 0.02]; break;
        case SEASON.AUTUMN: _probs = [0.30, 0.30, 0.25, 0.10, 0.00, 0.05]; break;
        case SEASON.WINTER: _probs = [0.25, 0.20, 0.10, 0.05, 0.30, 0.10]; break;
    }
    
    // Weighted random selection
    var _roll = random(1.0);
    var _cumulative = 0;
    for (var i = 0; i < array_length(_probs); i++) {
        _cumulative += _probs[i];
        if (_roll <= _cumulative) {
            global.weather_current = i;
            break;
        }
    }
    
    // Duration: 8-24 hours (most weather lasts the whole day)
    global.weather_duration_remaining = irandom_range(8, 24);
    
    event_system_fire("on_weather_change", { weather: global.weather_current });
}

/// @function weather_get_gameplay_modifiers()
/// @returns {struct} Modifiers for various gameplay systems
function weather_get_gameplay_modifiers() {
    switch (global.weather_current) {
        case WEATHER.CLEAR:
            return { move_speed: 1.0, energy_drain: 1.0, turret_accuracy: 1.0, 
                     npc_schedule: "default", visibility: 1.0 };
        case WEATHER.CLOUDY:
            return { move_speed: 1.0, energy_drain: 1.0, turret_accuracy: 1.0, 
                     npc_schedule: "default", visibility: 0.9 };
        case WEATHER.RAIN:
            return { move_speed: 0.9, energy_drain: 1.1, turret_accuracy: 0.9, 
                     npc_schedule: "rainy", visibility: 0.7 };
        case WEATHER.STORM:
            return { move_speed: 0.8, energy_drain: 1.3, turret_accuracy: 0.7, 
                     npc_schedule: "rainy", visibility: 0.5,
                     energy_turret_penalty: 0.5, breakdown_chance_mult: 1.5 };
        case WEATHER.SNOW:
            return { move_speed: 0.85, energy_drain: 1.2, turret_accuracy: 0.85, 
                     npc_schedule: "default", visibility: 0.6 };
        case WEATHER.FOG:
            return { move_speed: 1.0, energy_drain: 1.0, turret_accuracy: 0.6, 
                     npc_schedule: "default", visibility: 0.3 };
    }
}
```

---

## 4. DATA ARCHITECTURE & LOADING PIPELINE

### 4.1 Design Principles

All game content is **data-driven** via JSON files. Code defines SYSTEMS; data defines CONTENT. This means:
- Adding a new item = add a JSON entry (no code change)
- Adding a new NPC = add a JSON file (no code change)
- Balancing = edit JSON values (no recompile)

### 4.2 Data File Organization

```
datafiles/data/
├── items/
│   ├── items_raw_materials.json
│   ├── items_refined_materials.json
│   ├── items_components.json
│   ├── items_tools.json
│   ├── items_gifts.json
│   ├── items_consumables.json
│   └── items_key_items.json
├── recipes/
│   ├── recipes_forge.json
│   ├── recipes_workbench.json
│   ├── recipes_fabricator.json
│   ├── recipes_refinery.json
│   └── recipes_assembly.json
├── blueprints/
│   └── blueprints.json
├── machines/
│   └── machines.json
├── npcs/
│   ├── npc_spark.json
│   ├── npc_old_maren.json
│   ├── npc_captain_harrow.json
│   ├── npc_mayor_linden.json
│   ├── npc_pip.json
│   ├── npc_leera.json
│   ├── npc_michelle.json
│   ├── npc_kaydee.json
│   ├── npc_janis.json
│   ├── npc_kiery.json
│   ├── npc_paige.json
│   ├── npc_doc_bramble.json
│   ├── npc_gus.json
│   ├── npc_ferris.json
│   ├── npc_hank.json
│   ├── npc_nora.json
│   ├── npc_wes.json
│   └── npc_pastor_elm.json
├── dialogue/
│   ├── dlg_spark/
│   │   ├── dlg_spark_greeting.json
│   │   ├── dlg_spark_heart_events.json
│   │   └── dlg_spark_seasonal.json
│   ├── dlg_leera/
│   │   └── ... (same pattern)
│   └── ... (one folder per NPC)
├── quests/
│   ├── quests_main.json
│   ├── quests_npc_spark.json
│   ├── quests_npc_leera.json
│   └── ... (one file per quest line)
├── enemies/
│   ├── enemies_freelance.json
│   ├── enemies_rust_wolves.json
│   ├── enemies_iron_marauders.json
│   └── enemies_tide_reavers.json
├── raids/
│   ├── raids_year1.json
│   ├── raids_year2.json
│   ├── raids_year3.json
│   └── raids_story.json
├── exploration/
│   ├── zone_the_hollow.json
│   ├── zone_old_mill.json
│   ├── zone_rustwood_edge.json
│   └── ... (one per zone)
├── economy/
│   ├── shop_gus.json
│   ├── shop_ferris.json
│   ├── shop_traveling_merchant.json
│   └── price_modifiers.json
├── festivals/
│   ├── festival_spark.json
│   ├── festival_sky_day.json
│   ├── festival_harvest.json
│   └── festival_remembrance.json
└── config/
    ├── balance.json          // Global balance constants
    ├── progression.json      // XP tables, unlock gates
    └── strings.json          // All display strings (localization-ready)
```

### 4.3 Data Loading Pipeline

```gml
// obj_sys_data_manager — Persistent singleton

/// @function data_load_all()
/// @description Called during STATE_BOOT. Loads all JSON data into memory.
function data_load_all() {
    // Phase 1: Core data (required for all states)
    global.data_items = data_load_merged("items/");     // Merge all item files
    global.data_recipes = data_load_merged("recipes/");  // Merge all recipe files
    global.data_blueprints = data_load_file("blueprints/blueprints.json");
    global.data_machines = data_load_file("machines/machines.json");
    global.data_balance = data_load_file("config/balance.json");
    global.data_progression = data_load_file("config/progression.json");
    global.data_strings = data_load_file("config/strings.json");
    
    // Phase 2: NPC data
    global.data_npcs = {};
    var _npc_files = data_list_files("npcs/");
    for (var i = 0; i < array_length(_npc_files); i++) {
        var _npc = data_load_file("npcs/" + _npc_files[i]);
        global.data_npcs[$ _npc.id] = _npc;
    }
    
    // Phase 3: Enemy data
    global.data_enemies = data_load_merged("enemies/");
    global.data_raids = data_load_merged("raids/");
    
    // Phase 4: Economy
    global.data_shops = data_load_merged("economy/");
    
    // Phase 5: Exploration zones (loaded on demand, but index now)
    global.data_zone_index = {};
    var _zone_files = data_list_files("exploration/");
    for (var i = 0; i < array_length(_zone_files); i++) {
        var _name = string_replace(_zone_files[i], ".json", "");
        global.data_zone_index[$ _name] = "exploration/" + _zone_files[i];
    }
    
    // Phase 6: Build lookup caches
    data_build_caches();
}

/// @function data_load_file(_path)
/// @description Loads and parses a single JSON file from datafiles/data/
/// @returns {struct}
function data_load_file(_path) {
    var _full_path = "data/" + _path;
    if (!file_exists(_full_path)) {
        show_debug_message("ERROR: Data file not found: " + _full_path);
        return {};
    }
    var _buf = buffer_load(_full_path);
    var _str = buffer_read(_buf, buffer_text);
    buffer_delete(_buf);
    return json_parse(_str);
}

/// @function data_load_merged(_folder)
/// @description Loads all JSON files in a folder, merges top-level keys into one struct
/// @returns {struct}
function data_load_merged(_folder) {
    var _result = {};
    var _files = data_list_files(_folder);
    for (var i = 0; i < array_length(_files); i++) {
        var _data = data_load_file(_folder + _files[i]);
        var _keys = variable_struct_get_names(_data);
        for (var j = 0; j < array_length(_keys); j++) {
            _result[$ _keys[j]] = _data[$ _keys[j]];
        }
    }
    return _result;
}
```

### 4.4 Lookup Caches

After loading, build indexed caches for fast runtime lookups:

```gml
/// @function data_build_caches()
function data_build_caches() {
    // Item lookup by tag
    global.cache_items_by_tag = {};
    var _item_keys = variable_struct_get_names(global.data_items);
    for (var i = 0; i < array_length(_item_keys); i++) {
        var _item = global.data_items[$ _item_keys[i]];
        if (variable_struct_exists(_item, "tags")) {
            for (var t = 0; t < array_length(_item.tags); t++) {
                var _tag = _item.tags[t];
                if (!variable_struct_exists(global.cache_items_by_tag, _tag)) {
                    global.cache_items_by_tag[$ _tag] = [];
                }
                array_push(global.cache_items_by_tag[$ _tag], _item_keys[i]);
            }
        }
    }
    
    // Recipe lookup by output item
    global.cache_recipes_by_output = {};
    var _recipe_keys = variable_struct_get_names(global.data_recipes);
    for (var i = 0; i < array_length(_recipe_keys); i++) {
        var _recipe = global.data_recipes[$ _recipe_keys[i]];
        global.cache_recipes_by_output[$ _recipe.output_item] = _recipe_keys[i];
    }
    
    // Recipe lookup by station
    global.cache_recipes_by_station = {};
    for (var i = 0; i < array_length(_recipe_keys); i++) {
        var _recipe = global.data_recipes[$ _recipe_keys[i]];
        var _station = _recipe.station;
        if (!variable_struct_exists(global.cache_recipes_by_station, _station)) {
            global.cache_recipes_by_station[$ _station] = [];
        }
        array_push(global.cache_recipes_by_station[$ _station], _recipe_keys[i]);
    }
    
    // NPC lookup by location (for interaction detection)
    // This is rebuilt dynamically each frame based on NPC schedules
}
```

### 4.5 JSON Schema: Items

```json
{
  "item_scrap_iron": {
    "id": "item_scrap_iron",
    "name": "Scrap Iron",
    "description": "Salvaged iron. The building block of everything.",
    "category": "raw_material",
    "tier": 1,
    "stack_max": 99,
    "sell_price": 5,
    "buy_price": 12,
    "icon_sprite": "spr_item_scrap_iron",
    "icon_index": 0,
    "tags": ["metal", "common", "forge_input", "salvage"],
    "gift_data": {
      "universal_value": 1,
      "loved_by": [],
      "liked_by": ["npc_hank", "npc_spark"],
      "hated_by": ["npc_janis"]
    }
  }
}
```

### 4.6 JSON Schema: Recipes

```json
{
  "recipe_iron_ingot": {
    "id": "recipe_iron_ingot",
    "name": "Iron Ingot",
    "station": "forge",
    "station_level_required": 1,
    "engineering_level_required": 1,
    "inputs": [
      { "item_id": "item_scrap_iron", "quantity": 3 }
    ],
    "fuel_cost": { "item_id": "item_coal", "quantity": 1 },
    "output_item": "item_iron_ingot",
    "output_quantity": 1,
    "craft_time_minutes": 60,
    "xp_reward": 15
  },
  "recipe_steam_engine_small": {
    "id": "recipe_steam_engine_small",
    "name": "Small Steam Engine",
    "station": "fabricator",
    "station_level_required": 1,
    "engineering_level_required": 2,
    "inputs": [
      { "item_id": "item_copper_pipe", "quantity": 4 },
      { "item_id": "item_brass_gears", "quantity": 3 },
      { "item_id": "item_iron_ingot", "quantity": 2 }
    ],
    "fuel_cost": null,
    "output_item": "item_steam_engine_small",
    "output_quantity": 1,
    "craft_time_minutes": 180,
    "xp_reward": 50
  }
}
```

### 4.7 JSON Schema: NPC

```json
{
  "id": "npc_spark",
  "name": "Spark",
  "display_name": "Spark",
  "portrait_sprite": "spr_portrait_spark",
  "world_sprite": "spr_npc_spark",
  "birthday": { "season": 0, "day": 7 },
  "home_location": { "room": "rm_int_spark_home", "x": 80, "y": 64 },
  "is_romance_candidate": false,
  "personality_tags": ["energetic", "inventive", "competitive", "dreamer"],
  "gift_preferences": {
    "loved": ["item_flight_component", "item_rare_gear", "item_aviation_book"],
    "liked": ["item_brass_gear", "item_copper_wire", "item_mechanical_toy"],
    "neutral_positive": ["item_food_*"],
    "disliked": ["item_formal_clothes"],
    "hated": ["item_cleaning_supplies"]
  },
  "schedules": {
    "spring": {
      "default": [
        { "time": "06:00", "room": "rm_int_spark_home", "x": 80, "y": 64, "action": "sleeping" },
        { "time": "08:00", "room": "rm_int_spark_garage", "x": 48, "y": 32, "action": "tinkering" },
        { "time": "12:00", "room": "rm_town_coppervale", "x": 320, "y": 192, "action": "shopping" },
        { "time": "14:00", "room": "rm_int_workshop", "x": 96, "y": 48, "action": "visiting",
          "condition": { "type": "hearts_gte", "npc": "npc_spark", "value": 4 } },
        { "time": "17:00", "room": "rm_town_coppervale", "x": 480, "y": 64, "action": "dreaming" },
        { "time": "19:00", "room": "rm_int_rusty_gear", "x": 64, "y": 48, "action": "dining" },
        { "time": "22:00", "room": "rm_int_spark_home", "x": 80, "y": 64, "action": "sleeping" }
      ],
      "rainy": [
        { "time": "06:00", "room": "rm_int_spark_home", "x": 80, "y": 64, "action": "sleeping" },
        { "time": "08:00", "room": "rm_int_spark_garage", "x": 48, "y": 32, "action": "deep_project" },
        { "time": "22:00", "room": "rm_int_spark_home", "x": 80, "y": 64, "action": "sleeping" }
      ]
    },
    "summer": { "default": [], "rainy": [] },
    "autumn": { "default": [], "rainy": [] },
    "winter": { "default": [], "rainy": [] }
  },
  "dialogue_files": [
    "dialogue/dlg_spark/dlg_spark_greeting.json",
    "dialogue/dlg_spark/dlg_spark_heart_events.json",
    "dialogue/dlg_spark/dlg_spark_seasonal.json"
  ]
}
```

### 4.8 JSON Schema: Blueprints

```json
{
  "bp_utility_mech": {
    "id": "bp_utility_mech",
    "name": "Utility Mech",
    "category": "mech",
    "tier": 1,
    "tier_label": "Common",
    "description": "A versatile bipedal walker for construction and transport.",
    "discovery_method": "starting_kit",
    "machine_id": "machine_utility_mech",
    "required_engineering_level": 3,
    "required_crane_level": 1,
    "components": [
      { "slot": "frame", "label": "Reinforced Frame", "item_id": "item_reinforced_frame" },
      { "slot": "engine", "label": "Small Steam Engine", "item_id": "item_steam_engine_small" },
      { "slot": "legs", "label": "Locomotion System", "item_id": "item_locomotion_system" },
      { "slot": "left_arm", "label": "Utility Arm (Left)", "item_id": "item_utility_arm" },
      { "slot": "right_arm", "label": "Utility Arm (Right)", "item_id": "item_utility_arm" },
      { "slot": "power", "label": "Aetheric Cell", "item_id": "item_aetheric_cell" },
      { "slot": "armor", "label": "Armor Plating", "item_id": "item_armor_plating" }
    ],
    "build_days_manual": 3,
    "build_days_automaton": 5,
    "xp_reward_first_build": 200,
    "xp_reward_repeat_build": 50,
    "upgrades": {
      "mk2": {
        "research_cost": [{ "item_id": "item_data_core_standard", "quantity": 2 }],
        "engineering_level": 5,
        "stat_modifiers": { "speed": 1.15, "carry_capacity": 1.25 }
      },
      "mk3": {
        "research_cost": [
          { "item_id": "item_data_core_scientific", "quantity": 1 },
          { "item_id": "item_data_core_standard", "quantity": 3 }
        ],
        "engineering_level": 7,
        "stat_modifiers": { "speed": 1.3, "carry_capacity": 1.5, "fuel_efficiency": 1.2 }
      }
    }
  }
}
```

### 4.9 JSON Schema: Enemies

```json
{
  "enemy_wolf_raider": {
    "id": "enemy_wolf_raider",
    "name": "Wolf Raider",
    "faction": "rust_wolves",
    "tier": 2,
    "sprite": "spr_enemy_wolf_raider",
    "stats": {
      "hp": 100,
      "speed": 1.0,
      "damage": 15,
      "armor": 5,
      "attack_range": 1,
      "attack_speed": 1.0
    },
    "behavior": "standard_infantry",
    "behavior_params": {
      "attack_priority": ["walls", "turrets", "buildings"],
      "flee_hp_percent": 0,
      "group_bonus": true
    },
    "loot_table": [
      { "item_id": "item_scrap_iron", "quantity_min": 1, "quantity_max": 3, "chance": 0.8 },
      { "item_id": "item_brass_alloy", "quantity_min": 1, "quantity_max": 1, "chance": 0.2 }
    ],
    "salvage_value": 15
  }
}
```

### 4.10 JSON Schema: Raid Definitions

```json
{
  "raid_y1_summer_1": {
    "id": "raid_y1_summer_1",
    "name": "Summer Skirmish",
    "trigger": {
      "type": "scheduled",
      "year": 1,
      "season": 1,
      "day_range": [8, 15],
      "story_flag_required": null
    },
    "intel": {
      "warning_days": 2,
      "direction_primary": "east",
      "direction_secondary": null,
      "estimated_strength": "minor",
      "faction": "freelance"
    },
    "waves": [
      {
        "delay_seconds": 0,
        "direction": "east",
        "units": [
          { "enemy_id": "enemy_scavenger", "count": 5 },
          { "enemy_id": "enemy_raider", "count": 3 }
        ]
      },
      {
        "delay_seconds": 45,
        "direction": "east",
        "units": [
          { "enemy_id": "enemy_raider", "count": 5 },
          { "enemy_id": "enemy_raider_archer", "count": 2 }
        ]
      }
    ],
    "difficulty_modifiers": [],
    "rewards": {
      "reputation": 5,
      "bonus_salvage": []
    },
    "is_story_raid": false
  }
}
```

### 4.11 JSON Schema: Dialogue

```json
{
  "dlg_spark_greeting_spring_default": {
    "id": "dlg_spark_greeting_spring_default",
    "speaker": "npc_spark",
    "conditions": {
      "season": 0,
      "hearts_min": 0,
      "hearts_max": 3,
      "story_flags": [],
      "weather": null,
      "time_period": null
    },
    "priority": 10,
    "nodes": [
      {
        "id": "start",
        "portrait": "neutral",
        "text": "Hey Jack! Working on anything cool today?",
        "responses": [
          {
            "text": "Always! Want to see?",
            "effects": [{ "type": "hearts", "npc": "npc_spark", "value": 2 }],
            "next": "spark_excited"
          },
          {
            "text": "Just maintenance.",
            "effects": [{ "type": "hearts", "npc": "npc_spark", "value": 1 }],
            "next": null
          }
        ]
      },
      {
        "id": "spark_excited",
        "portrait": "happy",
        "text": "Show me, show me! I love seeing new builds!",
        "responses": null,
        "next": null
      }
    ]
  }
}
```

### 4.12 Dialogue Selection Algorithm

```gml
/// @function dialogue_select_greeting(_npc_id)
/// @description Selects the best matching greeting dialogue for an NPC
/// @returns {struct} Dialogue data, or undefined if none found
function dialogue_select_greeting(_npc_id) {
    var _npc_data = global.data_npcs[$ _npc_id];
    var _candidates = [];
    
    // Load all dialogue files for this NPC
    for (var i = 0; i < array_length(_npc_data.dialogue_files); i++) {
        var _dlg_data = data_load_file(_npc_data.dialogue_files[i]);
        var _keys = variable_struct_get_names(_dlg_data);
        for (var j = 0; j < array_length(_keys); j++) {
            var _dlg = _dlg_data[$ _keys[j]];
            if (dialogue_check_conditions(_dlg.conditions, _npc_id)) {
                array_push(_candidates, _dlg);
            }
        }
    }
    
    // Sort by priority (highest first)
    array_sort(_candidates, function(_a, _b) {
        return _b.priority - _a.priority;
    });
    
    // Return highest priority match
    if (array_length(_candidates) > 0) {
        return _candidates[0];
    }
    return undefined;
}

/// @function dialogue_check_conditions(_conditions, _npc_id)
/// @returns {bool}
function dialogue_check_conditions(_conditions, _npc_id) {
    // Season check
    if (_conditions.season != undefined && _conditions.season != global.time_season) return false;
    
    // Hearts range check
    var _hearts = relationship_get_hearts(_npc_id);
    if (_conditions.hearts_min != undefined && _hearts < _conditions.hearts_min) return false;
    if (_conditions.hearts_max != undefined && _hearts > _conditions.hearts_max) return false;
    
    // Story flags
    if (_conditions.story_flags != undefined) {
        for (var i = 0; i < array_length(_conditions.story_flags); i++) {
            if (!story_flag_is_set(_conditions.story_flags[i])) return false;
        }
    }
    
    // Weather
    if (_conditions.weather != undefined && _conditions.weather != global.weather_current) return false;
    
    // Time period
    if (_conditions.time_period != undefined && _conditions.time_period != global.time_period) return false;
    
    return true;
}
```

### 4.13 Localization Support

All player-facing strings go through a lookup:

```gml
/// @function str(_key, _replacements)
/// @description Localized string lookup with optional token replacement
/// @param {string} _key The string key in strings.json
/// @param {struct} _replacements Optional struct of {token: value} pairs
/// @returns {string}
function str(_key, _replacements = {}) {
    var _text = "";
    if (variable_struct_exists(global.data_strings, _key)) {
        _text = global.data_strings[$ _key];
    } else {
        _text = "[MISSING:" + _key + "]";
        show_debug_message("WARNING: Missing string key: " + _key);
    }
    
    // Token replacement: {player_name} → "Jack"
    var _rep_keys = variable_struct_get_names(_replacements);
    for (var i = 0; i < array_length(_rep_keys); i++) {
        _text = string_replace_all(_text, "{" + _rep_keys[i] + "}", 
                                   string(_replacements[$ _rep_keys[i]]));
    }
    
    return _text;
}
```

**strings.json format:**
```json
{
  "ui_save_title": "Save Game",
  "ui_load_title": "Load Game",
  "npc_greeting_generic": "Hello, {player_name}!",
  "item_scrap_iron_name": "Scrap Iron",
  "item_scrap_iron_desc": "Salvaged iron. The building block of everything.",
  "season_spring": "Spring",
  "weather_rain": "Rain"
}
```

---

# PART 2: RENDERING & VISUAL SYSTEMS

---

## 5. TILE ENGINE

### 5.1 Tile Layer Architecture

GameMaker rooms use the built-in tilemap system with custom management:

```gml
// Layer order (bottom to top) — defined per room in the Room Editor
// Layer names are standardized across all rooms

#macro LAYER_GROUND_BASE     "layer_ground_base"      // Grass, dirt, stone, water
#macro LAYER_GROUND_DETAIL   "layer_ground_detail"     // Paths, cracks, flowers, puddles
#macro LAYER_SHADOW          "layer_shadow"            // Pre-baked building/tree shadows
#macro LAYER_OBJECTS_LOW     "layer_objects_low"       // Fences, low walls, crops, ground items
#macro LAYER_OBJECTS_MID     "layer_objects_mid"       // Characters, NPCs, machines, furniture
#macro LAYER_OBJECTS_HIGH    "layer_objects_high"      // Rooftops, tree canopy, overhead wires
#macro LAYER_WEATHER         "layer_weather"           // Rain, snow, particles (drawn via code)
#macro LAYER_UI              "layer_ui"                // HUD, dialogue boxes (drawn via code)
```

### 5.2 Auto-Tile Implementation

GameMaker supports 47-tile blob auto-tiling natively. Configuration per tileset:

```gml
/// @function tilemap_setup_autotile(_tileset, _layer_name)
/// @description Configures auto-tiling for a terrain layer
function tilemap_setup_autotile(_tileset, _layer_name) {
    var _tilemap_id = layer_tilemap_get_id(layer_get_id(_layer_name));
    // GameMaker handles 47-tile blob auto-tiling through the tileset editor
    // Configuration is done in the IDE — this function validates at runtime
    
    if (_tilemap_id == -1) {
        show_debug_message("ERROR: Tilemap not found on layer: " + _layer_name);
        return;
    }
}
```

### 5.3 Animated Tiles

GameMaker doesn't natively animate tiles, so we use a frame-swap system:

```gml
// obj_sys_tile_animator — Persistent, runs in all gameplay rooms

// Create Event
animated_tiles = [];  // Array of { tilemap_id, cell_x, cell_y, frames[], speed, timer, current_frame }

/// @function tile_anim_register(_tilemap_id, _cx, _cy, _frame_tiles, _speed_ms)
/// @description Register a tile cell for animation
function tile_anim_register(_tilemap_id, _cx, _cy, _frame_tiles, _speed_ms) {
    array_push(animated_tiles, {
        tilemap_id: _tilemap_id,
        cx: _cx,
        cy: _cy,
        frames: _frame_tiles,  // Array of tile indices to cycle through
        speed: _speed_ms / 1000 * game_get_speed(gamespeed_fps), // Convert ms to frames
        timer: 0,
        current_frame: 0
    });
}

// Step Event
for (var i = 0; i < array_length(animated_tiles); i++) {
    var _anim = animated_tiles[i];
    _anim.timer++;
    if (_anim.timer >= _anim.speed) {
        _anim.timer = 0;
        _anim.current_frame = (_anim.current_frame + 1) mod array_length(_anim.frames);
        tilemap_set(_anim.tilemap_id, _anim.frames[_anim.current_frame], _anim.cx, _anim.cy);
    }
}
```

### 5.4 Collision System

Collision uses a dedicated binary collision tilemap (not visible, purely for logic):

```gml
#macro LAYER_COLLISION "layer_collision"
#macro TILE_EMPTY 0
#macro TILE_SOLID 1
#macro TILE_WATER 2
#macro TILE_SLOW  3   // Mud, thick grass — reduces movement speed

/// @function collision_check_tile(_x, _y)
/// @description Check collision tile at world position
/// @returns {int} Tile type constant
function collision_check_tile(_x, _y) {
    var _tilemap = layer_tilemap_get_id(layer_get_id(LAYER_COLLISION));
    if (_tilemap == -1) return TILE_EMPTY;
    
    var _tile = tilemap_get_at_pixel(_tilemap, _x, _y);
    return tile_get_index(_tile);
}

/// @function collision_check_rect(_x1, _y1, _x2, _y2)
/// @description Check if any solid tile exists within a rectangle
/// @returns {bool}
function collision_check_rect(_x1, _y1, _x2, _y2) {
    // Check each tile cell overlapping the rectangle
    var _tx1 = _x1 div 16;
    var _ty1 = _y1 div 16;
    var _tx2 = _x2 div 16;
    var _ty2 = _y2 div 16;
    
    var _tilemap = layer_tilemap_get_id(layer_get_id(LAYER_COLLISION));
    
    for (var _tx = _tx1; _tx <= _tx2; _tx++) {
        for (var _ty = _ty1; _ty <= _ty2; _ty++) {
            var _tile = tilemap_get(_tilemap, _tx, _ty);
            if (tile_get_index(_tile) == TILE_SOLID) return true;
        }
    }
    return false;
}
```

### 5.5 Room Transitions

```gml
// Transition types
enum TRANSITION {
    FADE_BLACK,     // Standard room change (outdoor to outdoor)
    SLIDE_DOWN,     // Entering a building (camera slides down)
    SLIDE_UP,       // Exiting a building (camera slides up)
    INSTANT         // Debug only
}

/// @function room_transition(_target_room, _target_x, _target_y, _type)
function room_transition(_target_room, _target_x, _target_y, _type = TRANSITION.FADE_BLACK) {
    // Store target data
    global.transition_target_room = _target_room;
    global.transition_target_x = _target_x;
    global.transition_target_y = _target_y;
    global.transition_type = _type;
    
    // Enter transition state
    state_change(GAME_STATE.TRANSITION);
    
    // Begin fade out (handled by obj_sys_transition_manager)
    transition_start_fadeout();
}

// obj_sys_transition_manager handles the visual transition:
// 1. Fade out (or slide) over 15 frames
// 2. room_goto(target_room)
// 3. In Room Start: position player, activate NPCs, set camera
// 4. Fade in over 15 frames
// 5. Return to GAMEPLAY state
```

### 5.6 Depth Sorting

For the OBJECTS_MID layer, objects must be depth-sorted by Y position (objects lower on screen appear in front):

```gml
// All objects on OBJECTS_MID layer use this in their Step Event:
depth = -y;

// This ensures:
// - An NPC at y=100 (higher on screen) draws behind an NPC at y=120
// - The player walks behind trees whose trunk base is above the player
// - Furniture and machines sort correctly with characters
```

---

## 6. RENDERING PIPELINE

### 6.1 Draw Order

The rendering pipeline uses GameMaker's layer system with custom surface compositing for effects:

```gml
// obj_sys_render_manager — Draw GUI End Event

// The rendering happens in this order:
// 1. GameMaker renders room layers automatically (ground, detail, shadows, objects)
// 2. obj_sys_render_manager draws post-processing effects:

// Step 1: Capture the game view to a surface
if (!surface_exists(surf_game)) {
    surf_game = surface_create(320, 240);
}

// Step 2: Apply day/night shader
surface_set_target(surf_game);
shader_set(shd_daynight);
shader_set_uniform_f(u_time_progress, time_get_progress_in_day());
shader_set_uniform_f(u_hour, global.time_hour + global.time_minute / 60);
draw_surface(application_surface, 0, 0);
shader_reset();
surface_reset_target();

// Step 3: Apply weather overlay
if (global.weather_current != WEATHER.CLEAR) {
    surface_set_target(surf_game);
    weather_draw_overlay();
    surface_reset_target();
}

// Step 4: Scale and draw to display
var _scale = global.display_scale; // 3, 4, or 6
draw_surface_ext(surf_game, 0, 0, _scale, _scale, 0, c_white, 1);

// Step 5: Draw UI on top (at display resolution, not game resolution)
ui_draw_hud();
```

### 6.2 Surface Management

```gml
// Surfaces used by the rendering pipeline
// Surfaces can be lost at any time (GPU memory) — always check existence

surf_game = -1;          // Main game composite (320×240)
surf_lighting = -1;      // Light map for interiors (320×240)
surf_weather = -1;       // Weather particle surface (320×240)

/// @function surface_ensure(_surf_var_name, _width, _height)
/// @description Ensures a surface exists, creating if needed
function surface_ensure(_surf_var_name, _width, _height) {
    if (!surface_exists(variable_instance_get(id, _surf_var_name))) {
        variable_instance_set(id, _surf_var_name, surface_create(_width, _height));
    }
    return variable_instance_get(id, _surf_var_name);
}
```

### 6.3 Seasonal Palette Swap

Rather than loading entirely different tilesets each season, use a **palette swap shader** for efficiency:

```gml
// shd_season_palette — Fragment Shader Concept

// The shader receives:
// - The current season (0-3)
// - A palette lookup texture containing color mappings

// For each pixel:
// 1. Read the pixel color from the source texture
// 2. Look up the pixel color in the palette lookup texture
// 3. If found, replace with the seasonal variant color
// 4. If not found, pass through unchanged

// This allows base tilesets to be reused with different color palettes per season
// Only vegetation and grass require fully separate sheets (shape changes)
```

**Implementation strategy:**
- Create a **256×4 palette texture** where:
  - Row 0 = Spring colors
  - Row 1 = Summer colors
  - Row 2 = Autumn colors
  - Row 3 = Winter colors
  - Each column maps to one indexed color from the base palette
- Apply this shader only to terrain/vegetation layers
- Character sprites and UI are never palette-swapped

---

## 7. CAMERA SYSTEM

### 7.1 Camera Configuration

```gml
// obj_sys_camera — Persistent

// Create Event
cam = camera_create();
camera_set_view_size(cam, 320, 240);
view_camera[0] = cam;
view_enabled = true;
view_visible[0] = true;

// Follow target
follow_target = noone;       // Usually obj_player
follow_lerp_speed = 0.1;    // Smooth follow (0 = no follow, 1 = instant)

// Position (sub-pixel for smooth scrolling)
cam_x = 0;
cam_y = 0;

// Shake
shake_intensity = 0;
shake_decay = 0.9;          // Shake reduces by 10% per frame

// Bounds (clamped to room edges)
cam_bound_left = 0;
cam_bound_top = 0;
cam_bound_right = room_width;
cam_bound_bottom = room_height;
```

### 7.2 Camera Update Logic

```gml
// obj_sys_camera — Step Event

// Smooth follow
if (instance_exists(follow_target)) {
    var _target_x = follow_target.x - 160;  // Center on target (320/2)
    var _target_y = follow_target.y - 120;   // Center on target (240/2)
    
    cam_x = lerp(cam_x, _target_x, follow_lerp_speed);
    cam_y = lerp(cam_y, _target_y, follow_lerp_speed);
}

// Clamp to room bounds
cam_x = clamp(cam_x, cam_bound_left, cam_bound_right - 320);
cam_y = clamp(cam_y, cam_bound_top, cam_bound_bottom - 240);

// Apply shake
var _shake_x = 0;
var _shake_y = 0;
if (shake_intensity > 0.5) {
    _shake_x = irandom_range(-shake_intensity, shake_intensity);
    _shake_y = irandom_range(-shake_intensity, shake_intensity);
    shake_intensity *= shake_decay;
}

// Round to avoid sub-pixel jitter on tiles (critical for pixel art)
var _final_x = round(cam_x + _shake_x);
var _final_y = round(cam_y + _shake_y);

camera_set_view_pos(cam, _final_x, _final_y);

/// @function camera_shake(_intensity)
function camera_shake(_intensity) {
    shake_intensity = max(shake_intensity, _intensity);
}
```

### 7.3 Camera Transitions

```gml
/// @function camera_pan_to(_x, _y, _duration_frames, _callback)
/// @description Smooth pan to a position (for cutscenes)
function camera_pan_to(_x, _y, _duration_frames, _callback = undefined) {
    pan_start_x = cam_x;
    pan_start_y = cam_y;
    pan_target_x = _x - 160;
    pan_target_y = _y - 120;
    pan_duration = _duration_frames;
    pan_timer = 0;
    pan_callback = _callback;
    pan_active = true;
    
    // Disable follow during pan
    follow_target = noone;
}

// In Step Event, if pan_active:
if (pan_active) {
    pan_timer++;
    var _t = pan_timer / pan_duration;
    _t = ease_out_cubic(_t);  // Smooth easing
    
    cam_x = lerp(pan_start_x, pan_target_x, _t);
    cam_y = lerp(pan_start_y, pan_target_y, _t);
    
    if (pan_timer >= pan_duration) {
        pan_active = false;
        if (pan_callback != undefined) pan_callback();
    }
}

/// @function ease_out_cubic(_t)
function ease_out_cubic(_t) {
    return 1 - power(1 - _t, 3);
}
```

---

## 8. SHADER PIPELINE

### 8.1 Day/Night Cycle Shader

```glsl
// shd_daynight — Fragment Shader

varying vec2 v_vTexcoord;
varying vec4 v_vColour;

uniform float u_hour;         // 0.0 - 23.99
uniform float u_cloud_cover;  // 0.0 - 1.0 (weather influence)

void main() {
    vec4 base_color = v_vColour * texture2D(gm_BaseTexture, v_vTexcoord);
    
    // Time-based overlay color and intensity
    vec3 overlay_color;
    float overlay_alpha;
    float saturation_mult = 1.0;
    
    if (u_hour >= 6.0 && u_hour < 8.0) {
        // Dawn: warm pink-orange
        float t = (u_hour - 6.0) / 2.0;
        overlay_color = vec3(1.0, 0.82, 0.69);
        overlay_alpha = mix(0.20, 0.0, t);
    } else if (u_hour >= 8.0 && u_hour < 12.0) {
        // Morning: no overlay
        overlay_color = vec3(1.0);
        overlay_alpha = 0.0;
    } else if (u_hour >= 12.0 && u_hour < 17.0) {
        // Afternoon: warm gold
        overlay_color = vec3(1.0, 0.94, 0.75);
        overlay_alpha = 0.08;
    } else if (u_hour >= 17.0 && u_hour < 21.0) {
        // Evening: deep amber
        float t = (u_hour - 17.0) / 4.0;
        overlay_color = vec3(1.0, 0.69, 0.38);
        overlay_alpha = mix(0.10, 0.30, t);
    } else if (u_hour >= 21.0 && u_hour < 24.0) {
        // Night: cool blue
        float t = (u_hour - 21.0) / 3.0;
        overlay_color = vec3(0.13, 0.19, 0.38);
        overlay_alpha = mix(0.30, 0.45, t);
        saturation_mult = mix(1.0, 0.6, t);
    } else {
        // Late night (0-6): deep blue
        overlay_color = vec3(0.06, 0.09, 0.25);
        overlay_alpha = 0.55;
        saturation_mult = 0.5;
    }
    
    // Apply cloud cover (dims everything slightly)
    overlay_alpha += u_cloud_cover * 0.1;
    
    // Apply saturation reduction
    float gray = dot(base_color.rgb, vec3(0.299, 0.587, 0.114));
    base_color.rgb = mix(vec3(gray), base_color.rgb, saturation_mult);
    
    // Blend overlay
    base_color.rgb = mix(base_color.rgb, overlay_color, overlay_alpha);
    
    gl_FragColor = base_color;
}
```

### 8.2 Interior Lighting

Interior rooms use a **light map surface** approach:

```gml
// For interior rooms, create a dark overlay with light circles cut out

/// @function lighting_draw_interior()
function lighting_draw_interior() {
    var _surf = surface_ensure("surf_lighting", 320, 240);
    
    surface_set_target(_surf);
    // Start with ambient darkness
    draw_clear_alpha(c_black, 0.6);  // 60% dark overlay
    
    // Cut out light sources using blend mode
    gpu_set_blendmode(bm_subtract);
    
    // For each light source in the room:
    with (obj_light_source) {
        // Draw a radial gradient circle (bright center, fading edges)
        draw_sprite_ext(spr_light_gradient, 0, 
            x - camera_get_view_x(view_camera[0]),
            y - camera_get_view_y(view_camera[0]),
            light_radius / 32, light_radius / 32, 
            0, light_color, light_intensity);
    }
    
    gpu_set_blendmode(bm_normal);
    surface_reset_target();
    
    // Draw the light map over the scene
    draw_surface(_surf, camera_get_view_x(view_camera[0]), 
                        camera_get_view_y(view_camera[0]));
}
```

---

## 9. PARTICLE SYSTEM

### 9.1 Weather Particles

```gml
// obj_sys_weather_particles — Persistent

// Create Event
part_sys = part_system_create();
part_system_depth(part_sys, -10000); // Above most objects, below UI

part_rain = -1;
part_snow = -1;
part_emitter = -1;

/// @function weather_particles_update()
function weather_particles_update() {
    var _cam_x = camera_get_view_x(view_camera[0]);
    var _cam_y = camera_get_view_y(view_camera[0]);
    
    switch (global.weather_current) {
        case WEATHER.RAIN:
            weather_ensure_rain();
            // Position emitter above camera view
            part_emitter_region(part_sys, part_emitter, 
                _cam_x - 16, _cam_x + 336,  // Slightly wider than view
                _cam_y - 32, _cam_y - 16,    // Above view
                ps_shape_rectangle, ps_distr_linear);
            break;
            
        case WEATHER.SNOW:
            weather_ensure_snow();
            part_emitter_region(part_sys, part_emitter,
                _cam_x - 32, _cam_x + 352,
                _cam_y - 48, _cam_y - 16,
                ps_shape_rectangle, ps_distr_linear);
            break;
            
        default:
            weather_clear_particles();
            break;
    }
}

/// @function weather_ensure_rain()
function weather_ensure_rain() {
    if (part_rain == -1) {
        part_rain = part_type_create();
        part_type_shape(part_rain, pt_shape_line);
        part_type_size(part_rain, 0.5, 1.5, 0, 0);
        part_type_color1(part_rain, make_color_rgb(180, 200, 220));
        part_type_alpha2(part_rain, 0.6, 0.2);
        part_type_speed(part_rain, 4, 6, 0, 0);
        part_type_direction(part_rain, 260, 280, 0, 0); // Mostly downward, slight angle
        part_type_life(part_rain, 20, 40);
        part_type_blend(part_rain, true);
        
        part_emitter = part_emitter_create(part_sys);
        
        // Particle count: 100 for PC, 50 for mobile
        var _count = (os_type == os_android || os_type == os_ios) ? 2 : 5;
        part_emitter_burst(part_sys, part_emitter, part_rain, _count);
        // Use stream for continuous emission
        part_emitter_stream(part_sys, part_emitter, part_rain, _count);
    }
}
```

### 9.2 Combat Effects

```gml
// Reusable effect particle types, created once in obj_sys_particle_manager

/// @function fx_explosion(_x, _y, _size)
function fx_explosion(_x, _y, _size) {
    // Burst of orange/yellow particles + camera shake
    part_emitter_region(part_sys_combat, emitter_burst,
        _x - 4, _x + 4, _y - 4, _y + 4,
        ps_shape_ellipse, ps_distr_gaussian);
    
    var _count = round(_size * 15);
    part_emitter_burst(part_sys_combat, emitter_burst, part_fire, _count);
    part_emitter_burst(part_sys_combat, emitter_burst, part_smoke, round(_count * 0.5));
    part_emitter_burst(part_sys_combat, emitter_burst, part_spark, round(_count * 0.3));
    
    camera_shake(_size * 3);
}

/// @function fx_sparks(_x, _y)
function fx_sparks(_x, _y) {
    part_emitter_region(part_sys_combat, emitter_burst,
        _x - 2, _x + 2, _y - 2, _y + 2,
        ps_shape_ellipse, ps_distr_gaussian);
    part_emitter_burst(part_sys_combat, emitter_burst, part_spark, 5);
}

/// @function fx_steam_puff(_x, _y)
function fx_steam_puff(_x, _y) {
    part_emitter_region(part_sys_ambient, emitter_burst,
        _x - 1, _x + 1, _y - 4, _y - 2,
        ps_shape_rectangle, ps_distr_linear);
    part_emitter_burst(part_sys_ambient, emitter_burst, part_steam, 3);
}
```

---

# PART 3: GAMEPLAY SYSTEMS

---

## 10. INVENTORY & STORAGE SYSTEM

### 10.1 Data Structures

```gml
// Player inventory: array of slot structs
// Each slot: { item_id: string, quantity: int } or null for empty

#macro INVENTORY_SIZE 30         // Player backpack
#macro HOTBAR_SIZE 8             // Quick-access toolbar
#macro STORAGE_SIZE_SMALL 20     // Small storage chest
#macro STORAGE_SIZE_LARGE 40     // Large storage chest
#macro SALVAGE_BAG_BASE 10       // Exploration carry capacity (upgradeable)

/// @function inventory_create(_size)
/// @returns {array} Array of _size null slots
function inventory_create(_size) {
    var _inv = array_create(_size, undefined);
    return _inv;
}

// Global player inventory
global.player_inventory = inventory_create(INVENTORY_SIZE);
global.player_hotbar = inventory_create(HOTBAR_SIZE);
global.player_money = 0;  // Cogs
```

### 10.2 Core Operations

```gml
/// @function inventory_add_item(_inventory, _item_id, _quantity)
/// @description Adds items to inventory, stacking where possible
/// @returns {int} Quantity that could NOT be added (overflow)
function inventory_add_item(_inventory, _item_id, _quantity) {
    var _item_data = global.data_items[$ _item_id];
    var _stack_max = _item_data.stack_max;
    var _remaining = _quantity;
    
    // Phase 1: Stack into existing slots with same item
    for (var i = 0; i < array_length(_inventory); i++) {
        if (_remaining <= 0) break;
        var _slot = _inventory[i];
        if (_slot != undefined && _slot.item_id == _item_id) {
            var _space = _stack_max - _slot.quantity;
            if (_space > 0) {
                var _add = min(_remaining, _space);
                _slot.quantity += _add;
                _remaining -= _add;
            }
        }
    }
    
    // Phase 2: Fill empty slots
    for (var i = 0; i < array_length(_inventory); i++) {
        if (_remaining <= 0) break;
        if (_inventory[i] == undefined) {
            var _add = min(_remaining, _stack_max);
            _inventory[i] = { item_id: _item_id, quantity: _add };
            _remaining -= _add;
        }
    }
    
    // Fire event if items were added
    if (_remaining < _quantity) {
        event_system_fire("on_inventory_change", { 
            item_id: _item_id, 
            quantity_added: _quantity - _remaining 
        });
    }
    
    return _remaining;  // 0 = all added, >0 = overflow
}

/// @function inventory_remove_item(_inventory, _item_id, _quantity)
/// @description Removes items from inventory
/// @returns {int} Quantity actually removed
function inventory_remove_item(_inventory, _item_id, _quantity) {
    var _remaining = _quantity;
    
    // Remove from slots, last-to-first (preserves organization)
    for (var i = array_length(_inventory) - 1; i >= 0; i--) {
        if (_remaining <= 0) break;
        var _slot = _inventory[i];
        if (_slot != undefined && _slot.item_id == _item_id) {
            var _remove = min(_remaining, _slot.quantity);
            _slot.quantity -= _remove;
            _remaining -= _remove;
            if (_slot.quantity <= 0) {
                _inventory[i] = undefined;
            }
        }
    }
    
    return _quantity - _remaining;  // Actual amount removed
}

/// @function inventory_count_item(_inventory, _item_id)
/// @returns {int} Total quantity of item across all slots
function inventory_count_item(_inventory, _item_id) {
    var _total = 0;
    for (var i = 0; i < array_length(_inventory); i++) {
        var _slot = _inventory[i];
        if (_slot != undefined && _slot.item_id == _item_id) {
            _total += _slot.quantity;
        }
    }
    return _total;
}

/// @function inventory_has_items(_inventory, _item_id, _quantity)
/// @returns {bool}
function inventory_has_items(_inventory, _item_id, _quantity) {
    return inventory_count_item(_inventory, _item_id) >= _quantity;
}

/// @function inventory_transfer(_from_inv, _to_inv, _slot_index)
/// @description Transfer a full slot from one inventory to another
/// @returns {bool} Success
function inventory_transfer(_from_inv, _to_inv, _slot_index) {
    var _slot = _from_inv[_slot_index];
    if (_slot == undefined) return false;
    
    var _overflow = inventory_add_item(_to_inv, _slot.item_id, _slot.quantity);
    if (_overflow == 0) {
        _from_inv[_slot_index] = undefined;
        return true;
    } else {
        // Partial transfer
        _slot.quantity = _overflow;
        return true;
    }
}
```

### 10.3 Storage Containers

World storage (chests, workshop storage) persists in the save file:

```gml
// Storage containers are tracked by a unique ID tied to their room and position
// global.storage_containers: { "rm_int_workshop_chest_1": inventory_array, ... }

global.storage_containers = {};

/// @function storage_get_or_create(_container_id, _size)
function storage_get_or_create(_container_id, _size) {
    if (!variable_struct_exists(global.storage_containers, _container_id)) {
        global.storage_containers[$ _container_id] = inventory_create(_size);
    }
    return global.storage_containers[$ _container_id];
}
```

---

## 11. CRAFTING & WORKSHOP SYSTEM

### 11.1 Station Interaction

```gml
// When player interacts with a workshop station:

/// @function crafting_open_station(_station_type, _station_level)
/// @description Opens the crafting UI for a specific station
function crafting_open_station(_station_type, _station_level) {
    // Get available recipes for this station at this level
    var _all_recipes = global.cache_recipes_by_station[$ _station_type];
    var _available = [];
    
    for (var i = 0; i < array_length(_all_recipes); i++) {
        var _recipe = global.data_recipes[$ _all_recipes[i]];
        
        // Check station level requirement
        if (_recipe.station_level_required > _station_level) continue;
        
        // Check engineering level
        if (_recipe.engineering_level_required > global.player_engineering_level) continue;
        
        // Check if player has discovered this recipe (some are hidden until blueprint found)
        if (variable_struct_exists(_recipe, "requires_blueprint")) {
            if (!blueprint_is_discovered(_recipe.requires_blueprint)) continue;
        }
        
        // Add with craftability status
        var _can_craft = crafting_check_ingredients(_recipe);
        array_push(_available, { 
            recipe: _recipe, 
            can_craft: _can_craft 
        });
    }
    
    // Open crafting UI with available recipes
    state_change(GAME_STATE.GAMEPLAY, GAMEPLAY_SUB.WORKSHOP, { 
        station: _station_type,
        recipes: _available 
    });
}

/// @function crafting_check_ingredients(_recipe)
/// @returns {bool}
function crafting_check_ingredients(_recipe) {
    // Check all inputs
    for (var i = 0; i < array_length(_recipe.inputs); i++) {
        var _input = _recipe.inputs[i];
        if (!inventory_has_items(global.player_inventory, _input.item_id, _input.quantity)) {
            return false;
        }
    }
    
    // Check fuel cost
    if (_recipe.fuel_cost != undefined) {
        if (!inventory_has_items(global.player_inventory, 
            _recipe.fuel_cost.item_id, _recipe.fuel_cost.quantity)) {
            return false;
        }
    }
    
    return true;
}
```

### 11.2 Craft Execution

```gml
/// @function crafting_execute(_recipe_id)
/// @description Begins crafting a recipe
function crafting_execute(_recipe_id) {
    var _recipe = global.data_recipes[$ _recipe_id];
    
    // Consume inputs
    for (var i = 0; i < array_length(_recipe.inputs); i++) {
        var _input = _recipe.inputs[i];
        inventory_remove_item(global.player_inventory, _input.item_id, _input.quantity);
    }
    
    // Consume fuel
    if (_recipe.fuel_cost != undefined) {
        inventory_remove_item(global.player_inventory, 
            _recipe.fuel_cost.item_id, _recipe.fuel_cost.quantity);
    }
    
    // Instant craft (workbench) or timed craft (forge, fabricator, refinery)
    if (_recipe.craft_time_minutes <= 0) {
        // Instant
        crafting_complete(_recipe);
    } else {
        // Queue the craft on the station
        crafting_queue_add(_recipe.station, {
            recipe_id: _recipe_id,
            minutes_remaining: _recipe.craft_time_minutes,
            minutes_total: _recipe.craft_time_minutes
        });
    }
}

/// @function crafting_complete(_recipe)
function crafting_complete(_recipe) {
    // Add output to inventory
    var _overflow = inventory_add_item(global.player_inventory, 
        _recipe.output_item, _recipe.output_quantity);
    
    // If inventory full, drop on ground near station
    if (_overflow > 0) {
        // Create ground item at station position
        event_system_fire("on_item_drop", { 
            item_id: _recipe.output_item, 
            quantity: _overflow 
        });
    }
    
    // Award XP
    engineering_add_xp(_recipe.xp_reward);
    
    // Play crafting complete SFX
    audio_play("sfx_craft_complete");
    
    event_system_fire("on_craft_complete", { recipe_id: _recipe.id });
}
```

### 11.3 Timed Craft Queue

```gml
// Each station has a craft queue
// global.craft_queues: { "forge": [queue_entry, ...], "fabricator": [...], ... }

global.craft_queues = {
    forge: [],
    workbench: [],
    fabricator: [],
    refinery: []
};

/// @function crafting_queue_add(_station, _entry)
function crafting_queue_add(_station, _entry) {
    array_push(global.craft_queues[$ _station], _entry);
}

/// @function crafting_queues_update()
/// @description Called each game minute by the time system
function crafting_queues_update() {
    var _stations = variable_struct_get_names(global.craft_queues);
    for (var s = 0; s < array_length(_stations); s++) {
        var _queue = global.craft_queues[$ _stations[s]];
        if (array_length(_queue) > 0) {
            var _entry = _queue[0]; // Process first in queue
            _entry.minutes_remaining--;
            
            if (_entry.minutes_remaining <= 0) {
                // Craft complete
                var _recipe = global.data_recipes[$ _entry.recipe_id];
                crafting_complete(_recipe);
                array_delete(_queue, 0, 1);
            }
        }
    }
}
```

### 11.4 Assembly Crane (Machine Building)

```gml
// Machine assembly is a multi-day interactive process

/// @function assembly_start_build(_blueprint_id)
function assembly_start_build(_blueprint_id) {
    var _bp = global.data_blueprints[$ _blueprint_id];
    
    // Create build-in-progress state
    global.current_assembly = {
        blueprint_id: _blueprint_id,
        components_placed: {},   // { slot_name: true/false }
        days_worked: 0,
        total_days: _bp.build_days_manual,
        is_first_build: !blueprint_has_been_built(_blueprint_id),
        quality_score: 0,        // Accumulated quality from component placement
        quality_rolls: 0
    };
    
    // Initialize all slots as not placed
    for (var i = 0; i < array_length(_bp.components); i++) {
        global.current_assembly.components_placed[$ _bp.components[i].slot] = false;
    }
    
    state_change(GAME_STATE.GAMEPLAY, GAMEPLAY_SUB.WORKSHOP, {
        mode: "assembly",
        assembly: global.current_assembly
    });
}

/// @function assembly_place_component(_slot_name)
/// @description Player places a component in a slot
function assembly_place_component(_slot_name) {
    var _bp = global.data_blueprints[$ global.current_assembly.blueprint_id];
    
    // Find the component data for this slot
    var _comp = undefined;
    for (var i = 0; i < array_length(_bp.components); i++) {
        if (_bp.components[i].slot == _slot_name) {
            _comp = _bp.components[i];
            break;
        }
    }
    if (_comp == undefined) return;
    
    // Check player has the component
    if (!inventory_has_items(global.player_inventory, _comp.item_id, 1)) return;
    
    // Consume component
    inventory_remove_item(global.player_inventory, _comp.item_id, 1);
    
    // Mark slot as placed
    global.current_assembly.components_placed[$ _slot_name] = true;
    
    // Quality roll (affected by engineering level + component tier)
    var _item_data = global.data_items[$ _comp.item_id];
    var _base_quality = 50 + (global.player_engineering_level * 5) + (_item_data.tier * 10);
    var _roll = _base_quality + irandom_range(-10, 10);
    global.current_assembly.quality_score += clamp(_roll, 0, 100);
    global.current_assembly.quality_rolls++;
    
    // Play satisfying placement SFX based on component type
    audio_play("sfx_build_" + _slot_name);
    
    // Check if all components placed
    if (assembly_all_placed()) {
        assembly_complete();
    }
}

/// @function assembly_all_placed()
function assembly_all_placed() {
    var _slots = variable_struct_get_names(global.current_assembly.components_placed);
    for (var i = 0; i < array_length(_slots); i++) {
        if (!global.current_assembly.components_placed[$ _slots[i]]) return false;
    }
    return true;
}

/// @function assembly_complete()
function assembly_complete() {
    var _asm = global.current_assembly;
    var _bp = global.data_blueprints[$ _asm.blueprint_id];
    
    // Calculate final quality
    var _avg_quality = _asm.quality_score / max(_asm.quality_rolls, 1);
    var _quality_grade;
    if (_avg_quality >= 90)      _quality_grade = "masterwork";
    else if (_avg_quality >= 70) _quality_grade = "excellent";
    else if (_avg_quality >= 50) _quality_grade = "standard";
    else if (_avg_quality >= 30) _quality_grade = "rough";
    else                         _quality_grade = "shoddy";
    
    // Create machine instance
    var _machine = machine_create(_bp.machine_id, _quality_grade);
    
    // Award XP
    var _xp = _asm.is_first_build ? _bp.xp_reward_first_build : _bp.xp_reward_repeat_build;
    engineering_add_xp(_xp);
    
    // Mark blueprint as built
    blueprint_mark_built(_asm.blueprint_id);
    
    // Trigger discovery animation if first build
    if (_asm.is_first_build) {
        event_system_fire("on_first_build", { 
            blueprint_id: _asm.blueprint_id,
            machine: _machine 
        });
    }
    
    // Clear assembly state
    global.current_assembly = undefined;
    
    event_system_fire("on_assembly_complete", { machine: _machine });
}
```

---

## 12. NPC AI & SCHEDULE SYSTEM

### 12.1 NPC Instance Structure

```gml
// obj_npc — Create Event (configured per NPC via room creation code)

npc_id = "";                    // e.g., "npc_spark"
npc_data = undefined;           // Reference to global.data_npcs[npc_id]

// Movement
move_speed = 1.0;               // Pixels per frame
move_target_x = x;
move_target_y = y;
move_path = [];                 // Array of {x, y} waypoints
move_path_index = 0;
is_moving = false;

// Schedule
current_schedule_entry = undefined;  // Current schedule entry being followed
schedule_action = "idle";            // Current action string
schedule_arrived = false;            // Has arrived at schedule destination

// Interaction
can_interact = true;            // False during movement, sleeping, etc.
talked_today = false;           // Reset each day
facing_direction = DIR.DOWN;    // 0=down, 1=left, 2=right, 3=up

// Animation
anim_state = "idle";            // "idle", "walk", "action"
anim_frame = 0;
anim_timer = 0;
anim_speed = 10;                // Frames between animation frames
```

### 12.2 Schedule Resolution

```gml
/// @function npc_resolve_schedule(_npc_id)
/// @description Determines what schedule entry an NPC should be following right now
/// @returns {struct} Schedule entry or undefined
function npc_resolve_schedule(_npc_id) {
    var _npc = global.data_npcs[$ _npc_id];
    var _season_key = global.season_names[global.time_season];
    _season_key = string_lower(_season_key);
    
    // Priority 1: Story event override
    var _story_override = event_get_npc_override(_npc_id);
    if (_story_override != undefined) return _story_override;
    
    // Priority 2: Festival schedule
    var _festival = time_is_festival_today();
    if (_festival != undefined) {
        var _fest_schedule = npc_get_festival_schedule(_npc_id, _festival);
        if (_fest_schedule != undefined) return npc_find_current_entry(_fest_schedule);
    }
    
    // Priority 3: Weather override
    var _weather_mods = weather_get_gameplay_modifiers();
    var _schedule_key = _weather_mods.npc_schedule;  // "default" or "rainy"
    
    // Priority 4: Get seasonal schedule with weather variant
    var _schedules = _npc.schedules[$ _season_key];
    if (_schedules == undefined) return undefined;
    
    var _daily = _schedules[$ _schedule_key];
    if (_daily == undefined) _daily = _schedules[$ "default"]; // Fallback
    if (_daily == undefined) return undefined;
    
    return npc_find_current_entry(_daily);
}

/// @function npc_find_current_entry(_schedule_array)
/// @description Finds the schedule entry that should be active at the current time
/// @returns {struct}
function npc_find_current_entry(_schedule_array) {
    var _current_minutes = global.time_hour * 60 + global.time_minute;
    var _best = undefined;
    
    for (var i = 0; i < array_length(_schedule_array); i++) {
        var _entry = _schedule_array[i];
        
        // Parse time string "HH:MM" to minutes
        var _entry_minutes = real(string_copy(_entry.time, 1, 2)) * 60 + 
                             real(string_copy(_entry.time, 4, 2));
        
        // Check conditions
        if (variable_struct_exists(_entry, "condition")) {
            if (!npc_check_condition(_entry.condition)) continue;
        }
        
        // Find the latest entry that's before or at current time
        if (_entry_minutes <= _current_minutes) {
            _best = _entry;
        }
    }
    
    return _best;
}

/// @function npc_check_condition(_condition)
function npc_check_condition(_condition) {
    switch (_condition.type) {
        case "hearts_gte":
            return relationship_get_hearts(_condition.npc) >= _condition.value;
        case "story_flag":
            return story_flag_is_set(_condition.flag);
        case "item_owned":
            return inventory_has_items(global.player_inventory, _condition.item_id, 1);
        default:
            return true;
    }
}
```

### 12.3 A* Pathfinding

```gml
/// @function pathfind_astar(_start_x, _start_y, _end_x, _end_y)
/// @description Grid-based A* pathfinding on the collision tilemap
/// @returns {array} Array of {x, y} waypoints in world coordinates, or empty if no path
function pathfind_astar(_start_x, _start_y, _end_x, _end_y) {
    var _tilemap = layer_tilemap_get_id(layer_get_id(LAYER_COLLISION));
    if (_tilemap == -1) return [];
    
    // Convert to grid coordinates
    var _sx = _start_x div 16;
    var _sy = _start_y div 16;
    var _ex = _end_x div 16;
    var _ey = _end_y div 16;
    
    // Early exit: start or end is solid
    if (tilemap_get(_tilemap, _ex, _ey) == TILE_SOLID) return [];
    
    // Grid dimensions
    var _w = tilemap_get_width(_tilemap);
    var _h = tilemap_get_height(_tilemap);
    
    // A* data structures
    var _open = ds_priority_create();     // Priority queue (f_cost → node)
    var _closed = ds_map_create();        // Visited nodes: key → true
    var _came_from = ds_map_create();     // key → parent_key
    var _g_cost = ds_map_create();        // key → cost from start
    
    // Helper: grid coords to unique key
    var _key = function(_gx, _gy) { return string(_gx) + "," + string(_gy); };
    
    var _start_key = _key(_sx, _sy);
    ds_priority_add(_open, _start_key, 0);
    ds_map_add(_g_cost, _start_key, 0);
    
    var _found = false;
    var _end_key = _key(_ex, _ey);
    
    // Search limit to prevent infinite loops
    var _max_iterations = 1000;
    var _iter = 0;
    
    while (!ds_priority_empty(_open) && _iter < _max_iterations) {
        _iter++;
        var _current_key = ds_priority_delete_min(_open);
        
        if (_current_key == _end_key) {
            _found = true;
            break;
        }
        
        ds_map_add(_closed, _current_key, true);
        
        // Parse current position from key
        var _comma = string_pos(",", _current_key);
        var _cx = real(string_copy(_current_key, 1, _comma - 1));
        var _cy = real(string_delete(_current_key, 1, _comma));
        
        // Check 4 neighbors (no diagonal movement for tile-based game)
        var _neighbors = [
            [_cx, _cy - 1],  // Up
            [_cx, _cy + 1],  // Down
            [_cx - 1, _cy],  // Left
            [_cx + 1, _cy]   // Right
        ];
        
        for (var i = 0; i < 4; i++) {
            var _nx = _neighbors[i][0];
            var _ny = _neighbors[i][1];
            var _nkey = _key(_nx, _ny);
            
            // Bounds check
            if (_nx < 0 || _nx >= _w || _ny < 0 || _ny >= _h) continue;
            
            // Already visited
            if (ds_map_exists(_closed, _nkey)) continue;
            
            // Collision check
            var _tile = tile_get_index(tilemap_get(_tilemap, _nx, _ny));
            if (_tile == TILE_SOLID) continue;
            
            // Movement cost (slow tiles cost more)
            var _move_cost = (_tile == TILE_SLOW) ? 2 : 1;
            var _new_g = ds_map_find_value(_g_cost, _current_key) + _move_cost;
            
            // Heuristic: Manhattan distance
            var _h_cost = abs(_nx - _ex) + abs(_ny - _ey);
            var _f_cost = _new_g + _h_cost;
            
            // Check if this is a better path to this neighbor
            if (!ds_map_exists(_g_cost, _nkey) || _new_g < ds_map_find_value(_g_cost, _nkey)) {
                ds_map_replace(_g_cost, _nkey, _new_g);
                ds_map_replace(_came_from, _nkey, _current_key);
                ds_priority_add(_open, _nkey, _f_cost);
            }
        }
    }
    
    // Reconstruct path
    var _path = [];
    if (_found) {
        var _trace = _end_key;
        while (_trace != _start_key) {
            var _comma2 = string_pos(",", _trace);
            var _px = real(string_copy(_trace, 1, _comma2 - 1));
            var _py = real(string_delete(_trace, 1, _comma2));
            array_insert(_path, 0, { x: _px * 16 + 8, y: _py * 16 + 8 }); // Center of tile
            _trace = ds_map_find_value(_came_from, _trace);
        }
    }
    
    // Cleanup
    ds_priority_destroy(_open);
    ds_map_destroy(_closed);
    ds_map_destroy(_came_from);
    ds_map_destroy(_g_cost);
    
    return _path;
}
```

### 12.4 NPC Movement Along Path

```gml
// obj_npc — Step Event (movement portion)

if (is_moving && array_length(move_path) > 0) {
    var _target = move_path[move_path_index];
    var _dx = _target.x - x;
    var _dy = _target.y - y;
    var _dist = point_distance(x, y, _target.x, _target.y);
    
    if (_dist <= move_speed) {
        // Arrived at waypoint
        x = _target.x;
        y = _target.y;
        move_path_index++;
        
        if (move_path_index >= array_length(move_path)) {
            // Arrived at final destination
            is_moving = false;
            move_path = [];
            move_path_index = 0;
            schedule_arrived = true;
            anim_state = "idle";
        }
    } else {
        // Move toward waypoint
        var _dir = point_direction(x, y, _target.x, _target.y);
        x += lengthdir_x(move_speed, _dir);
        y += lengthdir_y(move_speed, _dir);
        
        // Update facing direction (4-directional)
        if (abs(_dx) > abs(_dy)) {
            facing_direction = (_dx > 0) ? DIR.RIGHT : DIR.LEFT;
        } else {
            facing_direction = (_dy > 0) ? DIR.DOWN : DIR.UP;
        }
        
        anim_state = "walk";
    }
}
```

### 12.5 Cross-Room NPC Movement

NPCs that need to move between rooms use a **teleport-when-off-screen** approach:

```gml
/// @function npc_update_schedule(_npc_instance)
/// @description Called each game minute for each NPC
function npc_update_schedule(_npc_instance) {
    var _entry = npc_resolve_schedule(_npc_instance.npc_id);
    if (_entry == undefined) return;
    
    // Check if schedule entry changed
    if (_entry != _npc_instance.current_schedule_entry) {
        _npc_instance.current_schedule_entry = _entry;
        _npc_instance.schedule_arrived = false;
        
        // Is the target in a different room?
        if (_entry.room != room_get_name(room)) {
            // NPC needs to leave this room
            // Option A: NPC walks to room exit, then teleports
            // Option B: NPC is simply not present in this room
            
            // For simplicity: if NPC is visible on camera, walk to exit first
            // If off-camera, teleport immediately
            if (!npc_is_on_camera(_npc_instance)) {
                instance_deactivate_object(_npc_instance);
                // NPC will be created in the target room when player enters it
                npc_register_location(_npc_instance.npc_id, _entry.room, _entry.x, _entry.y);
            } else {
                // Walk to nearest room exit, then deactivate
                var _exit = room_find_nearest_exit(_npc_instance.x, _npc_instance.y);
                _npc_instance.move_path = pathfind_astar(
                    _npc_instance.x, _npc_instance.y, _exit.x, _exit.y);
                _npc_instance.move_path_index = 0;
                _npc_instance.is_moving = true;
                // After arriving at exit → deactivate and register in target room
            }
        } else {
            // Same room — pathfind to new position
            _npc_instance.move_path = pathfind_astar(
                _npc_instance.x, _npc_instance.y, _entry.x, _entry.y);
            _npc_instance.move_path_index = 0;
            _npc_instance.is_moving = true;
        }
    }
}
```

---

## 13. RELATIONSHIP & GIFT SYSTEM

### 13.1 Relationship Data Structure

```gml
// global.relationships: { "npc_spark": { hearts: 0, points: 0, ... }, ... }

/// @function relationship_init_all()
function relationship_init_all() {
    global.relationships = {};
    var _npc_keys = variable_struct_get_names(global.data_npcs);
    for (var i = 0; i < array_length(_npc_keys); i++) {
        global.relationships[$ _npc_keys[i]] = {
            hearts: 0,          // 0-10
            points: 0,          // Points within current heart level (0 to threshold)
            talked_today: false,
            gave_gift_today: false,
            romance_active: false,
            romance_stage: 0,   // 0=none, 1=dating, 2=partner
            heart_events_seen: [],  // Array of event IDs already triggered
            birthday_gift_given: false  // Reset each year on their birthday
        };
    }
}

#macro HEART_POINTS_PER_LEVEL 100  // 100 points = 1 heart

/// @function relationship_add_points(_npc_id, _points)
function relationship_add_points(_npc_id, _points) {
    var _rel = global.relationships[$ _npc_id];
    _rel.points += _points;
    
    // Level up
    while (_rel.points >= HEART_POINTS_PER_LEVEL && _rel.hearts < 10) {
        _rel.points -= HEART_POINTS_PER_LEVEL;
        _rel.hearts++;
        event_system_fire("on_heart_level_up", { npc_id: _npc_id, hearts: _rel.hearts });
    }
    
    // Cap points at level 10
    if (_rel.hearts >= 10) _rel.points = 0;
    
    // Prevent going below 0
    if (_rel.points < 0 && _rel.hearts > 0) {
        _rel.hearts--;
        _rel.points += HEART_POINTS_PER_LEVEL;
    }
    _rel.points = max(0, _rel.points);
}

/// @function relationship_get_hearts(_npc_id)
function relationship_get_hearts(_npc_id) {
    return global.relationships[$ _npc_id].hearts;
}
```

### 13.2 Gift Processing

```gml
/// @function gift_process(_npc_id, _item_id)
/// @description Process giving a gift to an NPC
/// @returns {string} Reaction type: "loved", "liked", "neutral", "disliked", "hated"
function gift_process(_npc_id, _item_id) {
    var _rel = global.relationships[$ _npc_id];
    var _npc = global.data_npcs[$ _npc_id];
    var _prefs = _npc.gift_preferences;
    
    // Determine gift category
    var _reaction = "neutral";
    if (array_contains(_prefs.loved, _item_id))          _reaction = "loved";
    else if (array_contains(_prefs.liked, _item_id))     _reaction = "liked";
    else if (array_contains(_prefs.hated, _item_id))     _reaction = "hated";
    else if (array_contains(_prefs.disliked, _item_id))  _reaction = "disliked";
    else {
        // Check wildcard patterns (e.g., "item_food_*")
        for (var i = 0; i < array_length(_prefs.liked); i++) {
            if (string_pos("*", _prefs.liked[i]) > 0) {
                var _pattern = string_replace(_prefs.liked[i], "*", "");
                if (string_pos(_pattern, _item_id) == 1) {
                    _reaction = "liked";
                    break;
                }
            }
        }
    }
    
    // Calculate points
    var _points;
    switch (_reaction) {
        case "loved":    _points = 65; break;   // ~5-8 range from GDD (scaled to 100-point system)
        case "liked":    _points = 35; break;   // ~3-4 range
        case "neutral":  _points = 10; break;   // ~1 range
        case "disliked": _points = -15; break;
        case "hated":    _points = -40; break;  // ~-3 to -5 range
    }
    
    // Birthday multiplier
    var _birthday = _npc.birthday;
    if (_birthday.season == global.time_season && _birthday.day == global.time_day) {
        _points *= 2;
    }
    
    // Gift wrapping bonus (if item is wrapped)
    // TODO: Check if gift was wrapped at workbench
    
    // Apply points
    relationship_add_points(_npc_id, _points);
    
    // Mark gift given today
    _rel.gave_gift_today = true;
    
    // Remove item from player inventory
    inventory_remove_item(global.player_inventory, _item_id, 1);
    
    return _reaction;
}

/// @function array_contains(_arr, _value)
function array_contains(_arr, _value) {
    for (var i = 0; i < array_length(_arr); i++) {
        if (_arr[i] == _value) return true;
    }
    return false;
}
```

### 13.3 Heart Event Triggers

```gml
/// @function heart_event_check(_npc_id)
/// @description Check if any heart events should trigger for an NPC
/// @returns {string|undefined} Heart event ID to trigger, or undefined
function heart_event_check(_npc_id) {
    var _rel = global.relationships[$ _npc_id];
    var _npc = global.data_npcs[$ _npc_id];
    
    // Load heart event definitions for this NPC
    // Heart events are defined in dialogue files with special conditions
    var _events = npc_get_heart_events(_npc_id);
    
    for (var i = 0; i < array_length(_events); i++) {
        var _event = _events[i];
        
        // Already seen?
        if (array_contains(_rel.heart_events_seen, _event.id)) continue;
        
        // Heart level requirement met?
        if (_rel.hearts < _event.hearts_required) continue;
        
        // Additional conditions (location, time, etc.)
        if (variable_struct_exists(_event, "conditions")) {
            if (!dialogue_check_conditions(_event.conditions, _npc_id)) continue;
        }
        
        // All conditions met — trigger this event
        return _event.id;
    }
    
    return undefined;
}
```

---

## 14. ENERGY & STAMINA SYSTEM

### 14.1 Energy Variables

```gml
global.player_energy = 100;
global.player_energy_max = 100;  // Increases with upgrades/food

// Energy costs (per action)
#macro ENERGY_COST_WALK          0       // Free
#macro ENERGY_COST_RUN           0.02    // Per frame while running
#macro ENERGY_COST_TOOL_USE      5       // Per tool action
#macro ENERGY_COST_SALVAGE_CUT   8       // Salvage cutter
#macro ENERGY_COST_SCAN          3       // Scanner
#macro ENERGY_COST_CLIMB         10      // Climbing in exploration
#macro ENERGY_COST_COMBAT        15      // Per combat action in exploration

/// @function energy_consume(_amount)
/// @returns {bool} True if energy was available and consumed
function energy_consume(_amount) {
    // Apply weather modifier
    var _mods = weather_get_gameplay_modifiers();
    _amount *= _mods.energy_drain;
    
    if (global.player_energy >= _amount) {
        global.player_energy -= _amount;
        return true;
    }
    return false;
}

/// @function energy_restore(_amount)
function energy_restore(_amount) {
    global.player_energy = min(global.player_energy + _amount, global.player_energy_max);
}

/// @function energy_check_exhaustion()
/// @description Called each frame — handles exhaustion state
function energy_check_exhaustion() {
    if (global.player_energy <= 0) {
        global.player_energy = 0;
        // Trigger exhaustion: slow movement, can't use tools
        event_system_fire("on_player_exhausted", {});
    }
}
```

### 14.2 Fatigue (Late Night Penalty)

```gml
/// @function fatigue_check()
/// @description Called by time system — penalizes staying up late
function fatigue_check() {
    if (global.time_hour >= 0 && global.time_hour < 6) {
        // Past midnight: drain energy faster
        var _drain_per_minute = 0.5;
        energy_consume(_drain_per_minute);
        
        // At 2 AM: force collapse
        if (global.time_hour >= 2) {
            player_collapse();
        }
    }
}

/// @function player_collapse()
function player_collapse() {
    // Player found by Captain Harrow's patrol
    // Lose some carried items (10% chance per slot)
    for (var i = 0; i < array_length(global.player_inventory); i++) {
        if (global.player_inventory[i] != undefined && random(1) < 0.1) {
            global.player_inventory[i] = undefined;
        }
    }
    
    // Wake up next morning with reduced energy
    time_advance_day();
    global.player_energy = global.player_energy_max * 0.5;
    
    // Transition to home
    room_transition(global.player_home_room, global.player_bed_x, global.player_bed_y, 
                    TRANSITION.FADE_BLACK);
    
    event_system_fire("on_player_collapse", {});
}
```

---

# PART 4: COMBAT & DEFENSE

---

## 15. TOWER DEFENSE SYSTEM

### 15.1 Defense Map Grid

```gml
// The raid room uses a grid overlay for defense placement
// Grid cell size: 16×16 (same as tiles)

#macro DEFENSE_GRID_WIDTH  40   // 640px wide raid map
#macro DEFENSE_GRID_HEIGHT 30   // 480px tall raid map

// Cell types
enum DEFENSE_CELL {
    EMPTY,          // Can place defenses
    BLOCKED,        // Terrain blocks placement
    PATH,           // Enemy path — can place traps only
    OCCUPIED,       // Defense structure already here
    TOWN            // Town building — cannot be modified
}

// global.defense_grid: 2D array of DEFENSE_CELL values
/// @function defense_grid_init()
function defense_grid_init() {
    global.defense_grid = array_create(DEFENSE_GRID_WIDTH);
    for (var x = 0; x < DEFENSE_GRID_WIDTH; x++) {
        global.defense_grid[x] = array_create(DEFENSE_GRID_HEIGHT, DEFENSE_CELL.EMPTY);
    }
    // Load blocked cells from room tilemap
    defense_grid_load_from_room();
}
```

### 15.2 Defense Placement

```gml
/// @function defense_can_place(_structure_id, _grid_x, _grid_y)
/// @returns {bool}
function defense_can_place(_structure_id, _grid_x, _grid_y) {
    var _struct = global.data_machines[$ _structure_id];
    var _footprint_w = _struct.footprint_width;   // In tiles
    var _footprint_h = _struct.footprint_height;
    
    // Check all cells in footprint
    for (var dx = 0; dx < _footprint_w; dx++) {
        for (var dy = 0; dy < _footprint_h; dy++) {
            var _cx = _grid_x + dx;
            var _cy = _grid_y + dy;
            
            // Bounds check
            if (_cx < 0 || _cx >= DEFENSE_GRID_WIDTH || _cy < 0 || _cy >= DEFENSE_GRID_HEIGHT) {
                return false;
            }
            
            var _cell = global.defense_grid[_cx][_cy];
            
            // Traps can go on PATH cells; structures cannot
            if (_struct.category == "trap") {
                if (_cell != DEFENSE_CELL.PATH && _cell != DEFENSE_CELL.EMPTY) return false;
            } else {
                if (_cell != DEFENSE_CELL.EMPTY) return false;
            }
        }
    }
    
    return true;
}

/// @function defense_place(_structure_id, _grid_x, _grid_y)
function defense_place(_structure_id, _grid_x, _grid_y) {
    if (!defense_can_place(_structure_id, _grid_x, _grid_y)) return false;
    
    var _struct = global.data_machines[$ _structure_id];
    
    // Mark grid cells as occupied
    for (var dx = 0; dx < _struct.footprint_width; dx++) {
        for (var dy = 0; dy < _struct.footprint_height; dy++) {
            global.defense_grid[_grid_x + dx][_grid_y + dy] = DEFENSE_CELL.OCCUPIED;
        }
    }
    
    // Create the defense instance
    var _inst = instance_create_layer(
        _grid_x * 16, _grid_y * 16, 
        LAYER_OBJECTS_MID, 
        obj_defense_structure
    );
    _inst.structure_id = _structure_id;
    _inst.structure_data = _struct;
    _inst.grid_x = _grid_x;
    _inst.grid_y = _grid_y;
    _inst.current_hp = _struct.stats.hp;
    _inst.max_hp = _struct.stats.hp;
    
    // Recalculate enemy paths (walls change pathing)
    if (_struct.category == "wall") {
        enemy_pathfinding_recalculate();
    }
    
    return true;
}
```

### 15.3 Turret Targeting

```gml
// obj_defense_structure — Step Event (for turrets)

if (structure_data.category == "turret" && raid_is_active()) {
    // Find target
    if (target_enemy == noone || !instance_exists(target_enemy)) {
        target_enemy = turret_find_target();
    }
    
    // Fire at target
    if (target_enemy != noone) {
        fire_timer++;
        if (fire_timer >= structure_data.stats.fire_rate_frames) {
            fire_timer = 0;
            turret_fire(target_enemy);
        }
        
        // Rotate toward target (for visual)
        var _dir = point_direction(x, y, target_enemy.x, target_enemy.y);
        turret_angle = lerp(turret_angle, _dir, 0.1);
    }
}

/// @function turret_find_target()
/// @description Find the best target within range
/// @returns {instance} Enemy instance or noone
function turret_find_target() {
    var _range = structure_data.stats.range * 16; // Range in pixels
    var _best = noone;
    var _best_priority = -1;
    
    with (obj_enemy) {
        var _dist = point_distance(x, y, other.x, other.y);
        if (_dist <= _range) {
            // Priority: closest to town center (furthest along path)
            var _priority = path_progress; // 0.0 = start, 1.0 = reached town
            if (_priority > _best_priority) {
                _best_priority = _priority;
                _best = id;
            }
        }
    }
    
    return _best;
}

/// @function turret_fire(_target)
function turret_fire(_target) {
    // Create projectile
    var _proj = instance_create_layer(x, y, LAYER_OBJECTS_MID, obj_projectile);
    _proj.target = _target;
    _proj.damage = structure_data.stats.damage;
    _proj.speed = 4;
    _proj.is_aoe = (structure_data.stats.aoe_radius != undefined);
    _proj.aoe_radius = structure_data.stats.aoe_radius ?? 0;
    
    // Consume ammo (if applicable)
    if (variable_struct_exists(structure_data, "ammo_per_shot")) {
        ammo_current -= structure_data.ammo_per_shot;
    }
    
    // SFX
    audio_play("sfx_turret_fire_" + structure_data.turret_type);
    
    // Camera shake (light)
    camera_shake(1);
}
```

### 15.4 Wave Management

```gml
// obj_sys_raid_manager — manages the entire raid lifecycle

// State
raid_active = false;
current_raid_data = undefined;
current_wave_index = 0;
wave_timer = 0;
wave_delay_frames = 0;
enemies_alive = 0;
raid_result = undefined;

/// @function raid_start(_raid_id)
function raid_start(_raid_id) {
    current_raid_data = global.data_raids[$ _raid_id];
    raid_active = true;
    current_wave_index = 0;
    wave_timer = 0;
    enemies_alive = 0;
    raid_result = undefined;
    
    // Auto-save before raid
    save_game_auto("raid_checkpoint");
    
    // Spawn first wave
    raid_spawn_wave(0);
    
    event_system_fire("on_raid_start", { raid_id: _raid_id });
}

/// @function raid_spawn_wave(_wave_index)
function raid_spawn_wave(_wave_index) {
    var _wave = current_raid_data.waves[_wave_index];
    
    // Determine spawn position based on direction
    var _spawn = defense_get_spawn_point(_wave.direction);
    
    for (var i = 0; i < array_length(_wave.units); i++) {
        var _unit = _wave.units[i];
        for (var j = 0; j < _unit.count; j++) {
            // Stagger spawn positions slightly
            var _sx = _spawn.x + irandom_range(-16, 16);
            var _sy = _spawn.y + irandom_range(-16, 16);
            
            var _enemy = instance_create_layer(_sx, _sy, LAYER_OBJECTS_MID, obj_enemy);
            _enemy.enemy_id = _unit.enemy_id;
            _enemy.enemy_data = global.data_enemies[$ _unit.enemy_id];
            _enemy.current_hp = _enemy.enemy_data.stats.hp;
            _enemy.max_hp = _enemy.enemy_data.stats.hp;
            _enemy.spawn_delay = j * 15; // Stagger by 15 frames
            
            enemies_alive++;
        }
    }
    
    event_system_fire("on_wave_start", { wave: _wave_index + 1 });
}

// Step Event
if (raid_active) {
    // Check wave completion
    if (enemies_alive <= 0) {
        current_wave_index++;
        if (current_wave_index >= array_length(current_raid_data.waves)) {
            // All waves defeated — victory!
            raid_end(true);
        } else {
            // Pause between waves
            var _delay_seconds = current_raid_data.waves[current_wave_index].delay_seconds;
            wave_delay_frames = _delay_seconds * game_get_speed(gamespeed_fps);
            wave_timer = 0;
        }
    }
    
    // Wave delay countdown
    if (wave_delay_frames > 0) {
        wave_timer++;
        if (wave_timer >= wave_delay_frames) {
            wave_delay_frames = 0;
            raid_spawn_wave(current_wave_index);
        }
    }
    
    // Check defeat condition (enemy reached town center)
    // Handled by obj_town_center collision check
}

/// @function raid_end(_victory)
function raid_end(_victory) {
    raid_active = false;
    
    if (_victory) {
        // Calculate rewards
        raid_result = {
            victory: true,
            salvage: raid_calculate_salvage(),
            reputation: current_raid_data.rewards.reputation,
            damage_taken: raid_calculate_damage()
        };
    } else {
        raid_result = {
            victory: false,
            resources_lost: raid_calculate_losses(),
            structures_damaged: raid_count_damaged_structures()
        };
    }
    
    // Transition to aftermath
    state_change(GAME_STATE.RAID, RAID_SUB.AFTERMATH, { result: raid_result });
}
```

---

## 16. ENEMY AI & PATHFINDING

### 16.1 Enemy Pathfinding

Enemies use the same A* system as NPCs but with **dynamic obstacle awareness** (walls block paths):

```gml
// obj_enemy — Create Event
enemy_id = "";
enemy_data = undefined;
current_hp = 0;
max_hp = 0;
move_path = [];
move_path_index = 0;
path_progress = 0;      // 0.0 to 1.0 — how far along toward town center
behavior_state = "advance";  // "advance", "attack_structure", "flee"
attack_target = noone;
attack_timer = 0;
spawn_delay = 0;         // Frames to wait before activating

/// @function enemy_calculate_path()
function enemy_calculate_path() {
    // Target: town center
    var _target = instance_find(obj_town_center, 0);
    if (_target == noone) return;
    
    move_path = pathfind_astar(x, y, _target.x, _target.y);
    move_path_index = 0;
    
    // If no path found (walls block completely), target nearest wall
    if (array_length(move_path) == 0) {
        var _wall = instance_nearest(x, y, obj_defense_wall);
        if (_wall != noone) {
            behavior_state = "attack_structure";
            attack_target = _wall;
        }
    }
}
```

### 16.2 Enemy Behavior

```gml
// obj_enemy — Step Event

if (spawn_delay > 0) { spawn_delay--; return; }

switch (behavior_state) {
    case "advance":
        // Follow path toward town center
        if (array_length(move_path) > 0 && move_path_index < array_length(move_path)) {
            var _target = move_path[move_path_index];
            var _dist = point_distance(x, y, _target.x, _target.y);
            
            if (_dist <= enemy_data.stats.speed) {
                x = _target.x;
                y = _target.y;
                move_path_index++;
                path_progress = move_path_index / max(array_length(move_path), 1);
            } else {
                var _dir = point_direction(x, y, _target.x, _target.y);
                x += lengthdir_x(enemy_data.stats.speed, _dir);
                y += lengthdir_y(enemy_data.stats.speed, _dir);
            }
        }
        
        // Check if wall is blocking — switch to attack
        if (move_path_index >= array_length(move_path) && path_progress < 0.95) {
            enemy_calculate_path(); // Recalculate in case walls changed
        }
        break;
        
    case "attack_structure":
        if (attack_target == noone || !instance_exists(attack_target)) {
            behavior_state = "advance";
            enemy_calculate_path();
            break;
        }
        
        // Move toward target structure
        var _dist = point_distance(x, y, attack_target.x, attack_target.y);
        if (_dist > enemy_data.stats.attack_range * 16) {
            var _dir = point_direction(x, y, attack_target.x, attack_target.y);
            x += lengthdir_x(enemy_data.stats.speed, _dir);
            y += lengthdir_y(enemy_data.stats.speed, _dir);
        } else {
            // Attack!
            attack_timer++;
            if (attack_timer >= 60 / enemy_data.stats.attack_speed) {
                attack_timer = 0;
                structure_take_damage(attack_target, enemy_data.stats.damage);
            }
        }
        break;
        
    case "flee":
        // Move away from town center (Scavenger behavior at low HP)
        var _tc = instance_find(obj_town_center, 0);
        if (_tc != noone) {
            var _dir = point_direction(_tc.x, _tc.y, x, y);
            x += lengthdir_x(enemy_data.stats.speed * 1.5, _dir);
            y += lengthdir_y(enemy_data.stats.speed * 1.5, _dir);
        }
        break;
}

// Faction-specific behavior
enemy_behavior_faction_update();
```

### 16.3 Damage & Death

```gml
/// @function enemy_take_damage(_amount, _source)
function enemy_take_damage(_amount, _source) {
    // Apply armor reduction
    var _actual = max(1, _amount - enemy_data.stats.armor);
    current_hp -= _actual;
    
    // Flash white (hit feedback)
    flash_timer = 5;
    
    // Behavior response
    if (current_hp <= 0) {
        enemy_die();
    } else if (enemy_data.behavior_params.flee_hp_percent > 0) {
        if (current_hp / max_hp <= enemy_data.behavior_params.flee_hp_percent / 100) {
            behavior_state = "flee";
        }
    }
}

/// @function enemy_die()
function enemy_die() {
    // Drop loot
    for (var i = 0; i < array_length(enemy_data.loot_table); i++) {
        var _loot = enemy_data.loot_table[i];
        if (random(1) <= _loot.chance) {
            var _qty = irandom_range(_loot.quantity_min, _loot.quantity_max);
            // Add to raid salvage pool (collected after raid)
            raid_add_salvage(_loot.item_id, _qty);
        }
    }
    
    // Explosion/death effect
    fx_explosion(x, y, 0.5);
    
    // Notify raid manager
    with (obj_sys_raid_manager) { enemies_alive--; }
    
    instance_destroy();
}
```

---

## 17. MECH COMBAT SYSTEM

### 17.1 Mech Controller

```gml
// obj_player_mech — Created when player deploys mech during raid

// Properties (set from machine data)
mech_id = "";
mech_data = undefined;

// Physics
mech_speed = 0;
mech_max_speed = 2.0;
mech_accel = 0.1;
mech_decel = 0.05;
mech_turn_speed = 3;    // Degrees per frame
mech_direction = 270;   // Facing direction
mech_move_direction = 0;

// Component HP (from GDD: legs, arms, torso, cockpit)
hp_legs = 100;
hp_arms = 100;
hp_torso = 100;
hp_cockpit = 50;

// Weapons
primary_weapon = undefined;
secondary_weapon = undefined;
weapon_cooldown_primary = 0;
weapon_cooldown_secondary = 0;

// Special ability
special_ability = undefined;
special_cooldown = 0;
special_active = false;
```

### 17.2 Mech Movement

```gml
// obj_player_mech — Step Event (movement)

// Only active in RAID_SUB.MECH state
if (obj_sys_game_manager.current_sub_state != RAID_SUB.MECH) return;

// Input
var _move_h = input_check("move_right") - input_check("move_left");
var _move_v = input_check("move_down") - input_check("move_up");

// Acceleration / Deceleration (weighty feel)
if (_move_h != 0 || _move_v != 0) {
    mech_move_direction = point_direction(0, 0, _move_h, _move_v);
    mech_speed = min(mech_speed + mech_accel, mech_max_speed);
    
    // Leg damage reduces max speed
    var _leg_mult = hp_legs / 100;
    mech_speed = min(mech_speed, mech_max_speed * max(0.3, _leg_mult));
} else {
    mech_speed = max(0, mech_speed - mech_decel);
}

// Apply movement with collision
var _dx = lengthdir_x(mech_speed, mech_move_direction);
var _dy = lengthdir_y(mech_speed, mech_move_direction);

if (!collision_check_rect(bbox_left + _dx, bbox_top, bbox_right + _dx, bbox_bottom)) {
    x += _dx;
}
if (!collision_check_rect(bbox_left, bbox_top + _dy, bbox_right, bbox_bottom + _dy)) {
    y += _dy;
}

// Rotate turret toward mouse/touch
var _aim_x = input_get_aim_x();
var _aim_y = input_get_aim_y();
mech_direction = point_direction(x, y, _aim_x, _aim_y);
```

### 17.3 Mech Combat

```gml
// Weapons
if (input_check_pressed("primary_fire") && weapon_cooldown_primary <= 0) {
    mech_fire_primary();
    weapon_cooldown_primary = primary_weapon.cooldown_frames;
    
    // Arm damage reduces weapon effectiveness
    var _arm_mult = hp_arms / 100;
    // Reduced damage applied in mech_fire_primary
}
weapon_cooldown_primary = max(0, weapon_cooldown_primary - 1);

if (input_check_pressed("secondary_fire") && weapon_cooldown_secondary <= 0) {
    mech_fire_secondary();
    weapon_cooldown_secondary = secondary_weapon.cooldown_frames;
}
weapon_cooldown_secondary = max(0, weapon_cooldown_secondary - 1);

// Stomp attack (area damage to nearby ground units)
if (input_check_pressed("stomp")) {
    var _stomp_range = 24; // Pixels
    with (obj_enemy) {
        if (point_distance(x, y, other.x, other.y) <= _stomp_range) {
            enemy_take_damage(other.mech_data.stats.stomp_damage, other);
        }
    }
    camera_shake(4);
    fx_explosion(x, y + 12, 0.8);
}

// Special ability
if (input_check_pressed("special") && special_cooldown <= 0 && !special_active) {
    mech_activate_special();
}

// Switch back to strategic view
if (input_check_pressed("toggle_view")) {
    state_change(GAME_STATE.RAID, RAID_SUB.STRATEGIC);
}
```

### 17.4 Mech Damage Model

```gml
/// @function mech_take_damage(_amount, _source_direction)
function mech_take_damage(_amount, _source_direction) {
    // Determine which component is hit based on angle of attack
    var _relative_angle = angle_difference(_source_direction, mech_direction);
    
    var _component;
    if (abs(_relative_angle) < 45) {
        _component = "torso";  // Front hit
    } else if (abs(_relative_angle) > 135) {
        _component = "torso";  // Rear hit (more vulnerable)
        _amount *= 1.5;        // Rear damage bonus
    } else if (_relative_angle > 0) {
        _component = "arms";   // Left side
    } else {
        _component = "arms";   // Right side
    }
    
    // Random chance to hit cockpit (rare but dangerous)
    if (random(100) < 5) _component = "cockpit";
    
    // Apply damage to component
    switch (_component) {
        case "legs":    hp_legs = max(0, hp_legs - _amount); break;
        case "arms":    hp_arms = max(0, hp_arms - _amount); break;
        case "torso":   hp_torso = max(0, hp_torso - _amount); break;
        case "cockpit": hp_cockpit = max(0, hp_cockpit - _amount); break;
    }
    
    // Cockpit breach = forced eject
    if (hp_cockpit <= 0) {
        mech_force_eject();
    }
    
    // Mech destroyed if torso reaches 0
    if (hp_torso <= 0) {
        mech_destroyed();
    }
    
    camera_shake(2);
    fx_sparks(x, y);
}
```

---

## 18. RAID LIFECYCLE MANAGER

### 18.1 Raid Scheduling

```gml
/// @function raid_check_scheduled()
/// @description Called at start of each day — checks if a raid should be scheduled
function raid_check_scheduled() {
    var _raids = variable_struct_get_names(global.data_raids);
    
    for (var i = 0; i < array_length(_raids); i++) {
        var _raid = global.data_raids[$ _raids[i]];
        var _trigger = _raid.trigger;
        
        if (_trigger.type == "scheduled") {
            // Check year, season, day range
            if (_trigger.year != global.time_year) continue;
            if (_trigger.season != global.time_season) continue;
            if (global.time_day < _trigger.day_range[0] || 
                global.time_day > _trigger.day_range[1]) continue;
            
            // Check story flag
            if (_trigger.story_flag_required != undefined) {
                if (!story_flag_is_set(_trigger.story_flag_required)) continue;
            }
            
            // Check if already completed
            if (raid_has_been_completed(_raids[i])) continue;
            
            // Schedule the raid!
            raid_schedule(_raids[i], _raid.intel.warning_days);
            break; // Only one raid at a time
        }
    }
}

/// @function raid_schedule(_raid_id, _warning_days)
function raid_schedule(_raid_id, _warning_days) {
    global.scheduled_raid = {
        raid_id: _raid_id,
        trigger_day: global.time_day + _warning_days,
        trigger_season: global.time_season
    };
    
    // Captain Harrow delivers warning
    event_system_fire("on_raid_warning", { 
        raid_id: _raid_id, 
        days_until: _warning_days 
    });
}
```

---

# PART 5: WORLD SYSTEMS

---

## 19. EXPLORATION & ZONE SYSTEM

### 19.1 Zone Loading

```gml
/// @function exploration_enter_zone(_zone_id)
function exploration_enter_zone(_zone_id) {
    // Load zone data on demand
    var _path = global.data_zone_index[$ _zone_id];
    var _zone = data_load_file(_path);
    global.current_zone = _zone;
    
    // Transition to exploration room
    room_transition(asset_get_index(_zone.room_name), 
                    _zone.entrance.x, _zone.entrance.y, 
                    TRANSITION.FADE_BLACK);
    
    state_change(GAME_STATE.EXPLORATION, 0); // SUB_EXPLORE_NAVIGATE
}
```

### 19.2 Salvage Node System

```gml
// obj_salvage_node — in exploration rooms

node_id = "";
node_data = undefined;
is_harvested = false;
respawn_season = -1;  // Which season this respawns (-1 = one-time)

/// @function salvage_interact()
function salvage_interact() {
    if (is_harvested) return;
    
    // Check tool requirement
    if (node_data.tool_required != "" && 
        !player_has_tool_equipped(node_data.tool_required)) {
        ui_show_message(str("msg_need_tool", { tool: node_data.tool_required }));
        return;
    }
    
    // Energy cost
    if (!energy_consume(node_data.energy_cost)) {
        ui_show_message(str("msg_too_tired"));
        return;
    }
    
    // Generate loot
    for (var i = 0; i < array_length(node_data.yields); i++) {
        var _yield = node_data.yields[i];
        if (random(1) <= _yield.chance) {
            var _qty = irandom_range(_yield.quantity_min, _yield.quantity_max);
            
            // Quality roll based on salvaging skill
            var _quality = salvage_roll_quality();
            
            var _overflow = inventory_add_item(global.player_inventory, _yield.item_id, _qty);
            if (_overflow > 0) {
                ui_show_message(str("msg_inventory_full"));
            }
        }
    }
    
    is_harvested = true;
    
    // Play harvest animation
    anim_state = "harvested";
    audio_play("sfx_salvage_" + node_data.type);
    
    // Award salvaging XP
    skill_add_xp("salvaging", node_data.xp_reward);
}
```

---

## 20. EVENT SYSTEM & STORY FLAGS

### 20.1 Event Bus

A simple publish/subscribe event system for decoupled communication between systems:

```gml
// obj_sys_event_manager — Persistent singleton

// Event listeners: { "event_name": [{ callback: function, context: instance_id }, ...] }
global.event_listeners = {};

/// @function event_system_subscribe(_event_name, _callback, _context)
function event_system_subscribe(_event_name, _callback, _context = noone) {
    if (!variable_struct_exists(global.event_listeners, _event_name)) {
        global.event_listeners[$ _event_name] = [];
    }
    array_push(global.event_listeners[$ _event_name], {
        callback: _callback,
        context: _context
    });
}

/// @function event_system_fire(_event_name, _data)
function event_system_fire(_event_name, _data = {}) {
    if (!variable_struct_exists(global.event_listeners, _event_name)) return;
    
    var _listeners = global.event_listeners[$ _event_name];
    for (var i = 0; i < array_length(_listeners); i++) {
        var _listener = _listeners[i];
        if (_listener.context == noone || instance_exists(_listener.context)) {
            _listener.callback(_data);
        }
    }
}

/// @function event_system_unsubscribe_context(_context)
/// @description Remove all listeners for a destroyed instance
function event_system_unsubscribe_context(_context) {
    var _keys = variable_struct_get_names(global.event_listeners);
    for (var i = 0; i < array_length(_keys); i++) {
        var _arr = global.event_listeners[$ _keys[i]];
        for (var j = array_length(_arr) - 1; j >= 0; j--) {
            if (_arr[j].context == _context) {
                array_delete(_arr, j, 1);
            }
        }
    }
}
```

### 20.2 Story Flags

```gml
// Simple set-based flag system for tracking story progress
global.story_flags = {};  // { "flag_name": true }

/// @function story_flag_set(_flag)
function story_flag_set(_flag) {
    global.story_flags[$ _flag] = true;
    event_system_fire("on_story_flag_set", { flag: _flag });
}

/// @function story_flag_is_set(_flag)
function story_flag_is_set(_flag) {
    return variable_struct_exists(global.story_flags, _flag) && global.story_flags[$ _flag];
}

/// @function story_flag_clear(_flag)
function story_flag_clear(_flag) {
    if (variable_struct_exists(global.story_flags, _flag)) {
        variable_struct_remove(global.story_flags, _flag);
    }
}

// Example flags:
// "tutorial_raid_complete"
// "dejin_stage_flickering"
// "dejin_stage_awakening"
// "first_mech_built"
// "met_the_marshal"
// "year2_siege_survived"
// "leera_heart_event_3_seen"
// "blueprint_combat_mech_discovered"
```

---

## 21. ECONOMY & TRADE SYSTEM

### 21.1 Price Calculation

```gml
/// @function economy_get_buy_price(_item_id, _shop_id)
function economy_get_buy_price(_item_id, _shop_id) {
    var _item = global.data_items[$ _item_id];
    var _base = _item.buy_price;
    
    // Seasonal modifier
    var _season_mod = economy_get_seasonal_modifier(_item_id);
    
    // Supply/demand modifier (based on player's recent trading volume)
    var _demand_mod = economy_get_demand_modifier(_item_id);
    
    // Diplomacy skill discount
    var _diplo_discount = 1.0 - (global.player_skills.diplomacy * 0.02); // 2% per level
    
    return round(_base * _season_mod * _demand_mod * _diplo_discount);
}

/// @function economy_get_sell_price(_item_id, _shop_id)
function economy_get_sell_price(_item_id, _shop_id) {
    var _item = global.data_items[$ _item_id];
    var _base = _item.sell_price;
    
    var _season_mod = economy_get_seasonal_modifier(_item_id);
    var _diplo_bonus = 1.0 + (global.player_skills.diplomacy * 0.02);
    
    return round(_base * _season_mod * _diplo_bonus);
}
```

---

## 22. JOURNAL & DISCOVERY SYSTEM

### 22.1 Journal Data

```gml
global.journal = {
    discovered_zones: [],       // Array of zone IDs
    discovered_blueprints: [],  // Array of blueprint IDs
    built_blueprints: [],       // Blueprints the player has built at least once
    lore_entries: [],           // Array of lore entry IDs found
    dejin_memories: [],         // Array of memory fragment IDs recovered
    bestiary: {},               // { enemy_id: { encountered: true, killed_count: int } }
    quest_log: {
        active: [],             // Array of quest IDs
        completed: []           // Array of quest IDs
    }
};

// Fog of war for the world map
global.map_fog = {};  // { "zone_id": true } — zones revealed on map
```

---

# PART 6: INFRASTRUCTURE

---

## 23. SAVE/LOAD SYSTEM

### 23.1 Save Data Structure

```gml
/// @function save_compile_data()
/// @returns {struct} Complete save state
function save_compile_data() {
    return {
        // Meta
        meta: {
            save_version: 1,
            game_version: "1.0.0",
            save_date: date_datetime_string(date_current_datetime()),
            play_time_seconds: global.play_time_seconds,
            save_slot: global.current_save_slot
        },
        
        // Time
        time: {
            year: global.time_year,
            season: global.time_season,
            day: global.time_day,
            hour: global.time_hour,
            minute: global.time_minute,
            total_minutes: global.time_total_minutes,
            weather: global.weather_current
        },
        
        // Player
        player: {
            name: global.player_name,
            position: { room: room_get_name(room), x: obj_player.x, y: obj_player.y },
            energy: global.player_energy,
            energy_max: global.player_energy_max,
            money: global.player_money,
            skills: {
                engineering: global.player_skills.engineering,
                engineering_xp: global.player_skills.engineering_xp,
                salvaging: global.player_skills.salvaging,
                salvaging_xp: global.player_skills.salvaging_xp,
                combat: global.player_skills.combat,
                combat_xp: global.player_skills.combat_xp,
                diplomacy: global.player_skills.diplomacy,
                diplomacy_xp: global.player_skills.diplomacy_xp,
                aether: global.player_skills.aether,
                aether_xp: global.player_skills.aether_xp
            }
        },
        
        // Inventory
        inventory: save_serialize_inventory(global.player_inventory),
        hotbar: save_serialize_inventory(global.player_hotbar),
        storage: save_serialize_all_storage(),
        
        // Workshop
        workshop: {
            station_levels: global.workshop_station_levels,
            craft_queues: global.craft_queues,
            current_assembly: global.current_assembly
        },
        
        // Machines & Automatons
        machines: save_serialize_machines(),
        automatons: save_serialize_automatons(),
        
        // Relationships
        relationships: global.relationships,
        
        // Story & Progress
        story_flags: global.story_flags,
        journal: global.journal,
        
        // Defense
        defense_rating: global.defense_rating,
        placed_defenses: save_serialize_defenses(),
        raids_completed: global.raids_completed,
        scheduled_raid: global.scheduled_raid,
        
        // Town
        town: {
            reputation: global.town_reputation,
            buildings_upgraded: global.buildings_upgraded,
            community_projects: global.community_projects
        },
        
        // DEJIN
        dejin: {
            stage: global.dejin_stage,
            hearts: global.dejin_hearts,
            memories_recovered: global.dejin_memories
        },
        
        // Map
        map_fog: global.map_fog,
        
        // NPC locations (for cross-room tracking)
        npc_locations: global.npc_current_locations
    };
}
```

### 23.2 Save/Load Operations

```gml
#macro SAVE_FILE_PREFIX "ironveil_save_"
#macro SAVE_SLOTS 3
#macro AUTOSAVE_SLOT 0  // Slot 0 = autosave

/// @function save_game(_slot)
function save_game(_slot) {
    var _data = save_compile_data();
    _data.meta.save_slot = _slot;
    
    var _json = json_stringify(_data);
    var _filename = SAVE_FILE_PREFIX + string(_slot) + ".json";
    
    // Write to file
    var _buf = buffer_create(string_byte_length(_json) + 1, buffer_fixed, 1);
    buffer_write(_buf, buffer_text, _json);
    buffer_save(_buf, _filename);
    buffer_delete(_buf);
    
    show_debug_message("Game saved to slot " + string(_slot));
}

/// @function save_game_auto(_reason)
function save_game_auto(_reason) {
    show_debug_message("Auto-save: " + _reason);
    save_game(AUTOSAVE_SLOT);
}

/// @function load_game(_slot)
function load_game(_slot) {
    var _filename = SAVE_FILE_PREFIX + string(_slot) + ".json";
    
    if (!file_exists(_filename)) {
        show_debug_message("ERROR: Save file not found: " + _filename);
        return false;
    }
    
    var _buf = buffer_load(_filename);
    var _json = buffer_read(_buf, buffer_text);
    buffer_delete(_buf);
    
    var _data = json_parse(_json);
    
    // Version check and migration
    if (_data.meta.save_version < 1) {
        _data = save_migrate(_data, _data.meta.save_version);
    }
    
    // Restore all state
    save_restore_data(_data);
    
    return true;
}

/// @function save_restore_data(_data)
function save_restore_data(_data) {
    // Time
    global.time_year = _data.time.year;
    global.time_season = _data.time.season;
    global.time_day = _data.time.day;
    global.time_hour = _data.time.hour;
    global.time_minute = _data.time.minute;
    global.time_total_minutes = _data.time.total_minutes;
    global.weather_current = _data.time.weather;
    
    // Player
    global.player_name = _data.player.name;
    global.player_energy = _data.player.energy;
    global.player_energy_max = _data.player.energy_max;
    global.player_money = _data.player.money;
    global.player_skills = _data.player.skills;
    
    // Inventory
    global.player_inventory = save_deserialize_inventory(_data.inventory);
    global.player_hotbar = save_deserialize_inventory(_data.hotbar);
    save_deserialize_all_storage(_data.storage);
    
    // Workshop
    global.workshop_station_levels = _data.workshop.station_levels;
    global.craft_queues = _data.workshop.craft_queues;
    global.current_assembly = _data.workshop.current_assembly;
    
    // Relationships
    global.relationships = _data.relationships;
    
    // Story
    global.story_flags = _data.story_flags;
    global.journal = _data.journal;
    
    // Defense
    global.defense_rating = _data.defense_rating;
    global.raids_completed = _data.raids_completed;
    global.scheduled_raid = _data.scheduled_raid;
    
    // Town
    global.town_reputation = _data.town.reputation;
    global.buildings_upgraded = _data.town.buildings_upgraded;
    global.community_projects = _data.town.community_projects;
    
    // DEJIN
    global.dejin_stage = _data.dejin.stage;
    global.dejin_hearts = _data.dejin.hearts;
    global.dejin_memories = _data.dejin.memories_recovered;
    
    // Map
    global.map_fog = _data.map_fog;
    
    // NPC locations
    global.npc_current_locations = _data.npc_locations;
    
    // Navigate to saved room
    room_transition(asset_get_index(_data.player.position.room),
                    _data.player.position.x, _data.player.position.y,
                    TRANSITION.FADE_BLACK);
}
```

### 23.3 Save File Versioning & Migration

```gml
/// @function save_migrate(_data, _from_version)
/// @description Migrates save data from older versions to current
/// @returns {struct} Migrated save data
function save_migrate(_data, _from_version) {
    // Migration chain: apply each migration step in order
    // Example: version 0 → 1 adds the "dejin" field
    
    if (_from_version < 1) {
        // v0 → v1: Added DEJIN system
        if (!variable_struct_exists(_data, "dejin")) {
            _data.dejin = {
                stage: "dormant",
                hearts: 0,
                memories_recovered: []
            };
        }
        _data.meta.save_version = 1;
    }
    
    // Future migrations go here:
    // if (_from_version < 2) { ... _data.meta.save_version = 2; }
    
    return _data;
}
```

### 23.4 Save Corruption Recovery

```gml
/// @function save_validate(_data)
/// @returns {bool} True if save data appears valid
function save_validate(_data) {
    // Check required fields exist
    if (!variable_struct_exists(_data, "meta")) return false;
    if (!variable_struct_exists(_data, "time")) return false;
    if (!variable_struct_exists(_data, "player")) return false;
    if (!variable_struct_exists(_data, "inventory")) return false;
    
    // Check value ranges
    if (_data.time.year < 1 || _data.time.year > 50) return false;
    if (_data.time.season < 0 || _data.time.season > 3) return false;
    if (_data.time.day < 1 || _data.time.day > 30) return false;
    if (_data.time.hour < 0 || _data.time.hour > 23) return false;
    
    return true;
}

// Before loading, always validate:
// if (!save_validate(_data)) { show_message("Save file corrupted!"); return false; }
```

---

## 24. AUDIO SYSTEM

### 24.1 Music Manager

```gml
// obj_sys_audio_manager — Persistent

current_music = -1;
current_music_id = "";
target_music_id = "";
crossfade_timer = 0;
crossfade_duration = 120; // 2 seconds at 60fps
music_volume = 1.0;

/// @function music_play(_track_id, _crossfade)
function music_play(_track_id, _crossfade = true) {
    if (_track_id == current_music_id) return; // Already playing
    
    target_music_id = _track_id;
    
    if (_crossfade && current_music != -1) {
        // Begin crossfade
        crossfade_timer = crossfade_duration;
    } else {
        // Immediate switch
        music_switch_immediate(_track_id);
    }
}

/// @function music_update()
/// @description Called every frame
function music_update() {
    if (crossfade_timer > 0) {
        crossfade_timer--;
        var _progress = 1 - (crossfade_timer / crossfade_duration);
        
        // Fade out current
        if (current_music != -1) {
            audio_sound_gain(current_music, music_volume * (1 - _progress), 0);
        }
        
        // At halfway point, start the new track
        if (_progress >= 0.5 && current_music_id != target_music_id) {
            music_switch_immediate(target_music_id);
            audio_sound_gain(current_music, 0, 0); // Start at 0
        }
        
        // Fade in new
        if (current_music_id == target_music_id && current_music != -1) {
            audio_sound_gain(current_music, music_volume * max(0, (_progress - 0.5) * 2), 0);
        }
        
        if (crossfade_timer <= 0) {
            audio_sound_gain(current_music, music_volume, 0);
        }
    }
}

/// @function music_switch_immediate(_track_id)
function music_switch_immediate(_track_id) {
    if (current_music != -1) {
        audio_stop_sound(current_music);
    }
    
    var _asset = asset_get_index("mus_" + _track_id);
    if (_asset != -1) {
        current_music = audio_play_sound(_asset, 1, true); // Priority 1, loop
        audio_sound_gain(current_music, music_volume, 0);
        current_music_id = _track_id;
    }
}
```

### 24.2 Context-Aware Music Selection

```gml
/// @function music_select_contextual()
/// @description Determines what music should be playing based on game state
/// @returns {string} Track ID
function music_select_contextual() {
    var _state = obj_sys_game_manager.current_state;
    
    switch (_state) {
        case GAME_STATE.TITLE:
            return "title_theme";
            
        case GAME_STATE.RAID:
            return "raid_combat";
            
        case GAME_STATE.FESTIVAL:
            var _festival = time_is_festival_today();
            return "festival_" + _festival;
            
        case GAME_STATE.GAMEPLAY:
            // Context: location + time + season
            var _room_name = room_get_name(room);
            
            if (string_pos("rm_int_workshop", _room_name) == 1) {
                return "workshop_theme";
            }
            
            if (string_pos("rm_int_rusty_gear", _room_name) == 1) {
                return "tavern_theme";
            }
            
            if (string_pos("rm_int_", _room_name) == 1) {
                return "interior_ambient";
            }
            
            // Town — seasonal variant
            if (string_pos("rm_town_", _room_name) == 1) {
                var _season_suffix = ["spring", "summer", "autumn", "winter"];
                var _base = "coppervale_" + _season_suffix[global.time_season];
                
                // Night variant
                if (global.time_is_night) {
                    return _base + "_night";
                }
                return _base;
            }
            
            return "ambient_default";
            
        case GAME_STATE.EXPLORATION:
            return "exploration_" + global.current_zone.music_id;
    }
    
    return "ambient_default";
}

// Called periodically (every 60 frames) to check if music should change:
if (alarm_timer mod 60 == 0) {
    var _should_play = music_select_contextual();
    music_play(_should_play);
}
```

### 24.3 SFX Manager

```gml
/// @function audio_play(_sfx_id, _pitch_variance, _volume)
/// @description Play a sound effect with optional pitch randomization
function audio_play(_sfx_id, _pitch_variance = 0, _volume = 1.0) {
    var _asset = asset_get_index(_sfx_id);
    if (_asset == -1) {
        show_debug_message("WARNING: SFX not found: " + _sfx_id);
        return -1;
    }
    
    var _snd = audio_play_sound(_asset, 10, false); // Priority 10, no loop
    audio_sound_gain(_snd, _volume * global.sfx_volume, 0);
    
    if (_pitch_variance > 0) {
        var _pitch = 1.0 + random_range(-_pitch_variance, _pitch_variance);
        audio_sound_pitch(_snd, _pitch);
    }
    
    return _snd;
}
```

---

## 25. INPUT SYSTEM

### 25.1 Abstracted Input Layer

```gml
// Abstract input actions so the same code works for keyboard + gamepad + touch

enum INPUT_ACTION {
    MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT,
    INTERACT, CANCEL, MENU, RUN,
    PRIMARY_FIRE, SECONDARY_FIRE, STOMP, SPECIAL,
    TOGGLE_VIEW,
    HOTBAR_1, HOTBAR_2, HOTBAR_3, HOTBAR_4,
    HOTBAR_5, HOTBAR_6, HOTBAR_7, HOTBAR_8
}

// Key bindings (rebindable)
global.keybinds = {};
global.keybinds[$ INPUT_ACTION.MOVE_UP]    = vk_up;
global.keybinds[$ INPUT_ACTION.MOVE_DOWN]  = vk_down;
global.keybinds[$ INPUT_ACTION.MOVE_LEFT]  = vk_left;
global.keybinds[$ INPUT_ACTION.MOVE_RIGHT] = vk_right;
global.keybinds[$ INPUT_ACTION.INTERACT]   = ord("Z");
global.keybinds[$ INPUT_ACTION.CANCEL]     = ord("X");
global.keybinds[$ INPUT_ACTION.MENU]       = vk_escape;
global.keybinds[$ INPUT_ACTION.RUN]        = vk_shift;

/// @function input_check(_action)
/// @returns {bool} True if action is held
function input_check(_action) {
    if (global.input_mode == "keyboard") {
        return keyboard_check(global.keybinds[$ _action]);
    } else if (global.input_mode == "touch") {
        return touch_check_action(_action);
    }
    return false;
}

/// @function input_check_pressed(_action)
/// @returns {bool} True on first frame of press
function input_check_pressed(_action) {
    if (global.input_mode == "keyboard") {
        return keyboard_check_pressed(global.keybinds[$ _action]);
    } else if (global.input_mode == "touch") {
        return touch_check_action_pressed(_action);
    }
    return false;
}
```

### 25.2 Mobile Touch Input

```gml
// Virtual joystick (left side of screen) + action buttons (right side)

global.touch_joystick = {
    active: false,
    origin_x: 0, origin_y: 0,
    current_x: 0, current_y: 0,
    radius: 48  // Display pixels
};

/// @function touch_update()
function touch_update() {
    if (device_mouse_check_button(0, mb_left)) {
        var _tx = device_mouse_x(0);
        var _ty = device_mouse_y(0);
        
        // Left half = joystick
        if (_tx < display_get_width() / 2) {
            if (!global.touch_joystick.active) {
                global.touch_joystick.active = true;
                global.touch_joystick.origin_x = _tx;
                global.touch_joystick.origin_y = _ty;
            }
            global.touch_joystick.current_x = _tx;
            global.touch_joystick.current_y = _ty;
        }
    } else {
        global.touch_joystick.active = false;
    }
}
```

---

## 26. UI SYSTEM ARCHITECTURE

### 26.1 UI Layer Management

```gml
// UI is drawn in the Draw GUI event at display resolution (not game resolution)
// This ensures UI elements are crisp and properly sized for touch targets

// UI stack for layered panels (inventory over HUD, etc.)
global.ui_stack = [];  // Array of UI panel structs

/// @function ui_push(_panel_id, _data)
function ui_push(_panel_id, _data = {}) {
    array_push(global.ui_stack, {
        panel_id: _panel_id,
        data: _data,
        anim_timer: 0
    });
}

/// @function ui_pop()
function ui_pop() {
    if (array_length(global.ui_stack) > 0) {
        array_pop(global.ui_stack);
    }
}

/// @function ui_draw_all()
/// @description Called in Draw GUI event
function ui_draw_all() {
    // Always draw HUD (if in gameplay)
    if (obj_sys_game_manager.current_state == GAME_STATE.GAMEPLAY) {
        ui_draw_hud();
    }
    
    // Draw stacked panels
    for (var i = 0; i < array_length(global.ui_stack); i++) {
        var _panel = global.ui_stack[i];
        switch (_panel.panel_id) {
            case "inventory":    ui_draw_inventory(_panel.data); break;
            case "crafting":     ui_draw_crafting(_panel.data); break;
            case "dialogue":     ui_draw_dialogue(_panel.data); break;
            case "shop":         ui_draw_shop(_panel.data); break;
            case "map":          ui_draw_map(_panel.data); break;
            case "journal":      ui_draw_journal(_panel.data); break;
            case "raid_hud":     ui_draw_raid_hud(_panel.data); break;
        }
    }
}
```

### 26.2 HUD Layout

```gml
/// @function ui_draw_hud()
function ui_draw_hud() {
    var _scale = global.display_scale;
    var _sw = display_get_gui_width();
    var _sh = display_get_gui_height();
    
    // Top-left: Time & Date
    draw_sprite(spr_ui_clock_frame, 0, 8, 8);
    draw_text(32, 12, string(global.time_hour) + ":" + string_format(global.time_minute, 2, 0));
    draw_text(32, 28, global.season_names[global.time_season] + " " + string(global.time_day));
    
    // Top-right: Money
    draw_sprite(spr_ui_cog_icon, 0, _sw - 80, 8);
    draw_text(_sw - 60, 12, string(global.player_money));
    
    // Bottom-left: Energy bar
    var _energy_pct = global.player_energy / global.player_energy_max;
    draw_sprite(spr_ui_energy_frame, 0, 8, _sh - 32);
    draw_sprite_ext(spr_ui_energy_fill, 0, 12, _sh - 28, _energy_pct, 1, 0, c_white, 1);
    
    // Bottom-center: Hotbar
    var _hotbar_x = (_sw - HOTBAR_SIZE * 24) / 2;
    for (var i = 0; i < HOTBAR_SIZE; i++) {
        draw_sprite(spr_ui_hotbar_slot, 0, _hotbar_x + i * 24, _sh - 32);
        var _slot = global.player_hotbar[i];
        if (_slot != undefined) {
            var _item = global.data_items[$ _slot.item_id];
            draw_sprite(asset_get_index(_item.icon_sprite), _item.icon_index,
                       _hotbar_x + i * 24 + 4, _sh - 28);
            if (_slot.quantity > 1) {
                draw_text(_hotbar_x + i * 24 + 16, _sh - 16, string(_slot.quantity));
            }
        }
    }
}
```

### 26.3 Dialogue UI

```gml
/// @function ui_draw_dialogue(_data)
function ui_draw_dialogue(_data) {
    var _sw = display_get_gui_width();
    var _sh = display_get_gui_height();
    
    // Dialogue box at bottom of screen
    var _box_h = 80 * global.display_scale;
    var _box_y = _sh - _box_h - 8;
    
    // Draw frame (steampunk brass border)
    draw_sprite_stretched(spr_ui_dialogue_frame, 0, 8, _box_y, _sw - 16, _box_h);
    
    // Portrait (left side)
    var _portrait_sprite = asset_get_index(_data.current_node.portrait_sprite);
    var _portrait_index = _data.current_node.portrait_index;
    draw_sprite_ext(_portrait_sprite, _portrait_index, 16, _box_y + 8, 
                    global.display_scale, global.display_scale, 0, c_white, 1);
    
    // Speaker name
    var _name_x = 16 + 64 * global.display_scale + 8;
    draw_text(_name_x, _box_y + 8, _data.speaker_name);
    
    // Text (typewriter effect)
    var _text = string_copy(_data.full_text, 1, _data.chars_shown);
    draw_text_ext(_name_x, _box_y + 28, _text, 16, _sw - _name_x - 16);
    
    // Advance typewriter
    if (_data.chars_shown < string_length(_data.full_text)) {
        _data.char_timer++;
        if (_data.char_timer >= 2) { // Show new char every 2 frames
            _data.char_timer = 0;
            _data.chars_shown++;
            audio_play("sfx_text_blip", 0.1); // Subtle blip per character
        }
    }
    
    // Response options (if text fully shown and responses exist)
    if (_data.chars_shown >= string_length(_data.full_text) && _data.responses != undefined) {
        for (var i = 0; i < array_length(_data.responses); i++) {
            var _resp = _data.responses[i];
            var _ry = _box_y - (array_length(_data.responses) - i) * 20 - 8;
            var _selected = (i == _data.selected_response);
            
            if (_selected) {
                draw_sprite(spr_ui_dialogue_arrow, 0, 16, _ry);
            }
            draw_text(32, _ry, _resp.text);
        }
    }
}
```

---

## 27. PERFORMANCE & OPTIMIZATION

### 27.1 Object Deactivation

```gml
// Objects outside camera range (+2 tile buffer) are deactivated

/// @function optimization_deactivate_distant()
/// @description Called every 30 frames
function optimization_deactivate_distant() {
    var _cam_x = camera_get_view_x(view_camera[0]);
    var _cam_y = camera_get_view_y(view_camera[0]);
    var _margin = 32; // 2 tiles
    
    var _left = _cam_x - _margin;
    var _top = _cam_y - _margin;
    var _right = _cam_x + 320 + _margin;
    var _bottom = _cam_y + 240 + _margin;
    
    // Deactivate all, then reactivate in region
    instance_deactivate_all(true);
    instance_activate_region(_left, _top, _right - _left, _bottom - _top, true);
    
    // Always keep persistent/system objects active
    instance_activate_object(obj_sys_game_manager);
    instance_activate_object(obj_sys_time_manager);
    instance_activate_object(obj_sys_audio_manager);
    instance_activate_object(obj_sys_camera);
    instance_activate_object(obj_sys_event_manager);
    instance_activate_object(obj_sys_data_manager);
    instance_activate_object(obj_sys_render_manager);
    instance_activate_object(obj_player);
}
```

### 27.2 Mobile-Specific Optimizations

| Optimization | PC | Mobile |
|-------------|-----|--------|
| Particle count (rain) | 200 | 50 |
| Particle count (snow) | 150 | 40 |
| Object deactivation range | 2 tiles | 1 tile |
| Shader complexity | Full | Simplified day/night |
| Texture page size | 2048×2048 | 1024×1024 |
| Display scale | 4x-6x | 2x-3x |
| Target FPS | 60 | 60 (30 fallback) |
| Draw call batching | Standard | Aggressive |

### 27.3 Memory Budget

| Category | PC Budget | Mobile Budget |
|----------|----------|---------------|
| Textures (loaded) | 256 MB | 128 MB |
| Audio (streaming) | 32 MB | 16 MB |
| Game data (JSON) | 16 MB | 16 MB |
| Surfaces | 8 MB | 4 MB |
| Save files | 2 MB each | 2 MB each |
| **Total** | **~314 MB** | **~166 MB** |

### 27.4 Debug Overlay

```gml
// Only in debug builds
if (global.build_config == "debug") {
    draw_set_color(c_lime);
    draw_text(4, 4, "FPS: " + string(fps_real));
    draw_text(4, 16, "Instances: " + string(instance_count));
    draw_text(4, 28, "State: " + string(obj_sys_game_manager.current_state));
    draw_text(4, 40, "Time: " + string(global.time_hour) + ":" + 
              string_format(global.time_minute, 2, 0));
    draw_text(4, 52, "Memory: " + string(round(debug_event("ResourceUsage", 0) / 1024 / 1024)) + "MB");
    draw_set_color(c_white);
}
```

---

# APPENDICES

---

## APPENDIX A: COMPLETE JSON SCHEMA REFERENCE

All JSON schemas are defined in their respective sections:
- **Items**: Section 4.5
- **Recipes**: Section 4.6
- **NPCs**: Section 4.7
- **Blueprints**: Section 4.8
- **Enemies**: Section 4.9
- **Raids**: Section 4.10
- **Dialogue**: Section 4.11

---

## APPENDIX B: SYSTEM INTEGRATION MAP

```
TIME SYSTEM ──────┬──→ NPC SCHEDULE SYSTEM
                  ├──→ WEATHER SYSTEM ──→ SHADER PIPELINE
                  ├──→ CRAFTING QUEUES
                  ├──→ MAINTENANCE SYSTEM
                  ├──→ RAID SCHEDULER
                  ├──→ ENERGY SYSTEM (fatigue)
                  └──→ AUDIO SYSTEM (music context)

EVENT BUS ────────┬──→ ALL SYSTEMS (decoupled communication)
                  ├──→ STORY FLAGS
                  ├──→ ACHIEVEMENT/JOURNAL TRACKING
                  └──→ UI NOTIFICATIONS

INVENTORY ────────┬──→ CRAFTING SYSTEM
                  ├──→ GIFT SYSTEM → RELATIONSHIP SYSTEM
                  ├──→ SHOP/TRADE SYSTEM
                  ├──→ EXPLORATION (loot)
                  └──→ SAVE SYSTEM

SAVE SYSTEM ──────┬──→ ALL GLOBAL STATE
                  └──→ FILE I/O

GAME STATE ───────┬──→ INPUT SYSTEM (context-dependent)
                  ├──→ TIME SYSTEM (pause/unpause)
                  ├──→ CAMERA SYSTEM (follow target)
                  ├──→ AUDIO SYSTEM (music selection)
                  └──→ UI SYSTEM (panel visibility)
```

---

## APPENDIX C: GML NAMING CONVENTIONS

| Element | Convention | Example |
|---------|-----------|---------|
| Objects | `obj_{category}_{name}` | `obj_sys_game_manager` |
| Sprites | Per Art Pipeline | `spr_jack_player_sheet` |
| Tilesets | Per Art Pipeline | `ts_grass_spring_sheet` |
| Sounds (Music) | `mus_{name}` | `mus_coppervale_spring` |
| Sounds (SFX) | `sfx_{category}_{name}` | `sfx_craft_complete` |
| Sounds (Ambient) | `amb_{name}` | `amb_forest_wind` |
| Rooms | `rm_{category}_{name}` | `rm_town_coppervale` |
| Scripts | `scr_{system}_{action}` | `scr_save_write` |
| Functions | `{system}_{action}()` | `time_advance_hour()` |
| Shaders | `shd_{name}` | `shd_daynight` |
| Fonts | `fnt_{name}` | `fnt_main` |
| Enums | `UPPER_SNAKE` | `GAME_STATE.GAMEPLAY` |
| Macros | `UPPER_SNAKE` | `INVENTORY_SIZE` |
| Global vars | `global.{system}_{name}` | `global.time_hour` |
| Instance vars | `lower_snake` | `current_hp` |
| Local vars | `_lower_snake` (prefixed underscore) | `_target_x` |
| Structs | `PascalCase` | `NpcScheduleEntry` |
| Data keys | `lower_snake` | `"item_scrap_iron"` |

---

*This Technical Architecture Document is Phase 10 of the Ironveil Development Roadmap.*
*It provides the complete implementation specification for building Ironveil in GameMaker.*
*All systems are designed to be data-driven, modular, and scalable from prototype to production.*

*— Forged by the Djinn, in service to Master Derek*
