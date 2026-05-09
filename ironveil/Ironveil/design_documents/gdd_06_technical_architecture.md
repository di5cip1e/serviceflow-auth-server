# 📋 IRONVEIL — GAME DESIGN DOCUMENT
## Section 6: Technical Architecture

---

> **"The engine is the foundation. Choose well, and everything above it stands strong."**

---

## 6.0 OVERVIEW

### Technology Stack
| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Game Engine** | GameMaker | Derek's preferred engine. Excellent for 2D tile-based games. Strong sprite/tile support. GML is intuitive. |
| **Target Platforms** | PC (Windows, macOS, Linux) + Mobile (iOS, Android) | GameMaker has solid export support for all targets |
| **Language** | GML (GameMaker Language) | Native to GameMaker, performant for 2D |
| **Data Format** | JSON | Human-readable, easy to edit, good GameMaker support |
| **Version Control** | Git | Industry standard |
| **Mod Support** | None | Simplifies architecture, reduces testing surface |

---

## 6.1 GAMEMAKER ARCHITECTURE

### Project Structure
```
ironveil/
├── sprites/
│   ├── spr_player/          # Jack's sprite sheets
│   ├── spr_npc_*/           # NPC sprite sheets
│   ├── spr_enemy_*/         # Enemy sprite sheets
│   ├── spr_automaton_*/     # Automaton sprites
│   ├── spr_mech_*/          # Mech sprites
│   ├── spr_item_*/          # Item icons
│   ├── spr_ui_*/            # UI elements
│   └── spr_effect_*/        # Visual effects
├── tilesets/
│   ├── ts_terrain_*/        # Terrain tilesets (per season)
│   ├── ts_building_*/       # Building tilesets
│   ├── ts_interior_*/       # Interior tilesets
│   └── ts_decoration_*/     # Decorative element tilesets
├── rooms/
│   ├── rm_title/            # Title screen
│   ├── rm_coppervale/       # Main town (overworld)
│   ├── rm_workshop/         # Player's workshop interior
│   ├── rm_interior_*/       # NPC home/shop interiors
│   ├── rm_exploration_*/    # Exploration zone rooms
│   ├── rm_raid/             # Tower defense raid room
│   └── rm_cutscene_*/       # Cutscene rooms
├── objects/
│   ├── obj_player/          # Player controller
│   ├── obj_npc_*/           # NPC objects
│   ├── obj_machine_*/       # Machine/automaton objects
│   ├── obj_item_*/          # World items
│   ├── obj_ui_*/            # UI controllers
│   ├── obj_system_*/        # Game system managers
│   └── obj_combat_*/        # Combat/defense objects
├── scripts/
│   ├── scr_save_load/       # Save/load system
│   ├── scr_inventory/       # Inventory management
│   ├── scr_crafting/        # Crafting/building logic
│   ├── scr_combat/          # Combat/raid logic
│   ├── scr_npc_ai/          # NPC scheduling and AI
│   ├── scr_dialogue/        # Dialogue system
│   ├── scr_time/            # Time/calendar system
│   └── scr_data/            # Data loading/parsing
├── datafiles/
│   ├── data/
│   │   ├── items.json       # All item definitions
│   │   ├── recipes.json     # Crafting recipes
│   │   ├── blueprints.json  # Machine blueprints
│   │   ├── npcs.json        # NPC data (schedules, gifts, dialogue)
│   │   ├── quests.json      # Quest definitions
│   │   ├── enemies.json     # Enemy unit definitions
│   │   ├── raids.json       # Raid wave compositions
│   │   └── dialogue/        # Dialogue trees (JSON per NPC)
│   └── saves/               # Save game files
├── sounds/
│   ├── music/               # Background music tracks
│   ├── sfx/                 # Sound effects
│   └── ambient/             # Ambient loops
├── fonts/
│   ├── fnt_main/            # Primary game font
│   └── fnt_ui/              # UI-specific font
└── shaders/
    ├── shd_daynight/        # Day/night color overlay
    ├── shd_weather/         # Weather effects
    └── shd_season/          # Seasonal palette shift
```

---

## 6.2 CORE SYSTEMS DESIGN

### 6.2.1 Game State Manager
The central controller that manages which state the game is in:

```
GAME STATES:
├── STATE_TITLE          # Title screen / main menu
├── STATE_GAMEPLAY       # Normal overworld gameplay
├── STATE_INTERIOR       # Inside a building
├── STATE_WORKSHOP       # Workshop crafting/assembly mode
├── STATE_DIALOGUE       # NPC conversation
├── STATE_CUTSCENE       # Scripted cutscene
├── STATE_RAID           # Tower defense combat
├── STATE_MECH_COMBAT    # Direct mech control
├── STATE_EXPLORATION    # Ruin exploration mode
├── STATE_MENU           # Pause/inventory/journal menu
├── STATE_MAP            # World map view
└── STATE_FESTIVAL       # Festival mini-game
```

### 6.2.2 Time System
The backbone of the game — every other system references the clock:

```
Time Variables:
├── game_minute          # 0-59 (each real second ≈ 1 game minute at 20min/day)
├── game_hour            # 0-23
├── game_day             # 1-30
├── game_season          # 0-3 (Spring, Summer, Autumn, Winter)
├── game_year            # 1-20
├── game_day_of_week     # 0-6 (for NPC schedule variation)
└── time_paused          # Boolean (paused during menus, dialogue, cutscenes)

Time Speed:
- 1 real second = ~1.2 game minutes (1200 game minutes in 1000 real seconds)
- 20 real minutes = 1 game day (1440 game minutes)
- Time pauses during: menus, dialogue, cutscenes, raids
- Time runs during: overworld, exploration, workshop work
```

### 6.2.3 Tile Rendering System
GameMaker's built-in tilemap system with custom extensions:

```
Tile Layers (bottom to top):
├── Layer 0: Ground Base       (grass, dirt, stone, water)
├── Layer 1: Ground Detail     (paths, cracks, flowers, puddles)
├── Layer 2: Shadows           (building/tree shadows)
├── Layer 3: Objects Low       (fences, low walls, crops, ground items)
├── Layer 4: Objects Mid       (characters, NPCs, machines, furniture)
├── Layer 5: Objects High      (rooftops, tree canopy, overhead wires)
├── Layer 6: Weather           (rain, snow, particles)
└── Layer 7: UI Overlay        (HUD, dialogue boxes, menus)
```

**Tile Specifications**:
- Base tile: 16×16 pixels
- Display scale: 3x (48×48 screen pixels)
- Auto-tiling: 47-tile blob auto-tile set for terrain transitions
- Animated tiles: Water, lava, steam (3-4 frame loops)

### 6.2.4 Data-Driven Design
All game content is defined in JSON data files, making it easy to add/modify content without changing code:

**Item Definition Example** (`items.json`):
```json
{
  "item_scrap_iron": {
    "name": "Scrap Iron",
    "category": "raw_material",
    "tier": 1,
    "description": "Salvaged iron. The building block of everything.",
    "stack_max": 99,
    "sell_price": 5,
    "buy_price": 12,
    "icon": "spr_item_scrap_iron",
    "tags": ["metal", "common", "forge_input"]
  }
}
```

**NPC Schedule Example** (`npcs.json` excerpt):
```json
{
  "npc_spark": {
    "name": "Spark",
    "schedule": {
      "spring": {
        "default": [
          {"time": "06:00", "location": "spark_home", "action": "sleeping"},
          {"time": "08:00", "location": "spark_garage", "action": "tinkering"},
          {"time": "12:00", "location": "market_district", "action": "shopping"},
          {"time": "14:00", "location": "player_workshop", "action": "visiting", "requires_hearts": 4},
          {"time": "17:00", "location": "overlook", "action": "dreaming"},
          {"time": "19:00", "location": "rusty_gear", "action": "dining"},
          {"time": "22:00", "location": "spark_home", "action": "sleeping"}
        ],
        "rainy": [
          {"time": "06:00", "location": "spark_home", "action": "sleeping"},
          {"time": "08:00", "location": "spark_garage", "action": "deep_project"},
          {"time": "22:00", "location": "spark_home", "action": "sleeping"}
        ]
      }
    },
    "gifts": {
      "loved": ["item_flight_component", "item_rare_gear", "item_aviation_book"],
      "liked": ["item_brass_gear", "item_copper_wire", "item_mechanical_toy"],
      "hated": ["item_cleaning_supplies", "item_formal_clothes"]
    }
  }
}
```

### 6.2.5 Save System
**Save Data Structure**:
```json
{
  "meta": {
    "save_slot": 1,
    "save_date": "2026-03-17T19:14:00Z",
    "play_time_seconds": 14400,
    "game_version": "1.0.0"
  },
  "time": {
    "year": 1, "season": 2, "day": 15,
    "hour": 14, "minute": 30
  },
  "player": {
    "name": "Jack",
    "position": {"room": "rm_coppervale", "x": 512, "y": 384},
    "energy": 75, "max_energy": 100,
    "skills": {"engineering": 4, "salvaging": 3, "combat": 2, "diplomacy": 2, "aether": 1},
    "money": 2450
  },
  "inventory": [...],
  "machines": [...],
  "automatons": [...],
  "workshop": {...},
  "relationships": {
    "npc_spark": {"hearts": 6, "talked_today": true},
    "npc_leera": {"hearts": 4, "talked_today": false, "romance_active": false}
  },
  "quests": {...},
  "exploration": {"discovered_zones": [...], "collected_data_cores": [...]},
  "dejin": {"stage": "functional", "memories_recovered": 12},
  "town": {"defense_rating": 45, "reputation": 62, "buildings_upgraded": [...]},
  "defenses": {"walls": [...], "turrets": [...], "traps": [...]},
  "world_state": {"raids_survived": 8, "story_flags": [...]}
}
```

**Save Triggers**:
- When player sleeps (end of day) — auto-save
- Manual save from pause menu (3 save slots)
- Before raids — auto-save checkpoint
- Before story events — auto-save checkpoint

---

## 6.3 RENDERING & VISUAL SYSTEMS

### 6.3.1 Camera System
```
Camera Properties:
├── Follow Target: Player (smooth lerp)
├── Native Resolution: 320×240 (20×15 tiles)
├── Display Scale: 3x (960×720) or 4x (1280×960)
├── Smooth Scrolling: Yes (sub-pixel camera via surfaces)
├── Bounds: Clamped to room edges
├── Shake: On impact events (combat, explosions)
└── Transitions: Fade for room changes, slide for interior entry
```

### 6.3.2 Day/Night Cycle Shader
A screen-wide color overlay that shifts based on time of day:

| Time | Overlay | Opacity |
|------|---------|---------|
| Dawn (6-8 AM) | Warm pink-orange (#FFD0B0) | 15% |
| Morning (8-12 PM) | None | 0% |
| Afternoon (12-5 PM) | Warm gold (#FFF0C0) | 10% |
| Evening (5-9 PM) | Deep amber (#FFB060) | 25% |
| Night (9 PM-12 AM) | Cool blue (#203060) | 40% + saturation reduction |
| Late Night (12-6 AM) | Deep blue (#101840) | 55% + heavy saturation reduction |

### 6.3.3 Seasonal Palette System
Rather than creating 4 complete tilesets for each season, use a **palette swap system**:
- Base tilesets use indexed colors
- Seasonal palette maps swap specific colors (green grass → golden grass for autumn)
- Reduces art production by ~60% while maintaining seasonal variety
- Specific seasonal objects (snow, flowers, leaves) are separate overlay sprites

### 6.3.4 Weather System
Visual weather effects layered on top of the game:

| Weather | Visual Effect | Gameplay Effect |
|---------|--------------|----------------|
| Clear | None | Normal |
| Cloudy | Slight dim overlay | None |
| Rain | Particle streaks + puddle tiles | NPC schedule changes, some outdoor actions slower |
| Storm | Heavy rain + lightning flashes + screen shake | Energy turrets less effective, breakdown chance increases |
| Snow | Particle fall + accumulation on surfaces | Movement slightly slower, some paths blocked |
| Fog | Distance fade shader | Reduced visibility in exploration, night raids harder |

---

## 6.4 MOBILE-SPECIFIC CONSIDERATIONS

### Input Adaptation
| PC Input | Mobile Equivalent |
|----------|------------------|
| WASD/Arrow keys | Virtual joystick (left side) |
| Mouse click (interact) | Tap on target |
| Mouse hover (tooltip) | Long press |
| Keyboard shortcuts | Quick-action buttons (right side) |
| Right-click (cancel) | Back button / dedicated cancel button |
| Scroll wheel (zoom) | Pinch to zoom (optional) |

### UI Scaling
- Mobile UI elements are 1.5-2x larger than PC
- Touch targets minimum 48×48 display pixels
- Critical buttons have generous hit areas
- HUD repositioned for thumb accessibility
- Inventory grid adjusted for touch interaction

### Performance Targets
| Platform | Target FPS | Resolution | Notes |
|----------|-----------|------------|-------|
| PC (min spec) | 60 FPS | 1280×960 | 4x scale |
| PC (recommended) | 60 FPS | 1920×1440 | 6x scale |
| Mobile (modern) | 60 FPS | Device native | 2-3x scale |
| Mobile (older) | 30 FPS | Device native | 2x scale, reduced particles |

### Optimization Strategies
- **Tile culling**: Only render tiles within camera view + 1 tile buffer
- **Object deactivation**: NPCs/machines outside camera range deactivated
- **Particle limits**: Cap particle count on mobile (rain: 50 instead of 200)
- **Sprite batching**: Group similar sprites for efficient draw calls
- **Save file compression**: Compress save data for mobile storage limits

---

## 6.5 DIALOGUE SYSTEM

### Structure
Dialogue uses a **tree-based JSON format** with branching:

```json
{
  "dialogue_spark_greeting_spring": {
    "speaker": "Spark",
    "portrait": "spr_portrait_spark_happy",
    "lines": [
      {
        "text": "Jack! Come check this out — I almost got the rotary coupling to work!",
        "next": "response_options"
      }
    ],
    "response_options": [
      {
        "text": "That's amazing, Spark!",
        "effect": {"hearts": 2},
        "next": "spark_excited_response"
      },
      {
        "text": "Be careful with that.",
        "effect": {"hearts": 1},
        "next": "spark_deflated_response"
      },
      {
        "text": "I'm busy right now.",
        "effect": {"hearts": -1},
        "next": null
      }
    ]
  }
}
```

### Dialogue Features
- **Portrait system**: Character portraits with multiple expressions
- **Branching responses**: Player choices affect relationship and story
- **Conditional dialogue**: Different lines based on hearts, season, story progress, time of day
- **DEJIN interjections**: AI Core can comment during conversations (optional, toggleable)
- **Text speed**: Adjustable typewriter effect, skip with button press

---

## 6.6 COMBAT/RAID SYSTEM ARCHITECTURE

### Tower Defense Mode
```
Raid Room Structure:
├── Background Layer: Town map (static)
├── Path Layer: Enemy pathfinding grid
├── Defense Layer: Placeable defense zones
├── Enemy Layer: Active enemy units
├── Projectile Layer: Turret/weapon projectiles
├── Effect Layer: Explosions, impacts, status effects
└── UI Layer: Raid HUD, unit selection, ability buttons
```

### Pathfinding
- **Grid-based A***: Enemies pathfind on a grid toward the town center
- **Dynamic updates**: Walls block paths, forcing recalculation
- **Multi-path**: Multiple valid routes — enemies spread across available paths
- **Priority targets**: Some enemies target specific structures (sappers → walls, thieves → workshop)

### Mech Combat Mode
- Switches from overhead strategic view to **top-down action view**
- Mech uses physics-based movement (acceleration, deceleration, turning radius)
- Collision with enemies deals stomp damage
- Weapon aiming follows mouse/touch direction
- Camera follows mech with wider viewport

---

## 6.7 AUDIO ARCHITECTURE

### Sound Categories
| Category | Behavior | Examples |
|----------|----------|---------|
| **Music** | One track at a time, crossfade transitions | Town theme, workshop theme, raid music |
| **Ambient** | Looping background, mixable | Wind, birds, machinery hum, rain |
| **SFX** | One-shot or short loop | Tool use, menu clicks, footsteps |
| **UI** | Priority over other sounds | Button press, notification, achievement |
| **Dialogue** | Short vocal clips (HM style) | NPC greeting sounds, reaction grunts |

### Music System
- **Context-aware**: Music changes based on location, time, season, and game state
- **Crossfade**: 2-second crossfade between tracks
- **Layered**: Some tracks have layers that add/remove based on intensity (e.g., raid music adds drums as waves progress)
- **Seasonal variants**: Town theme has 4 seasonal arrangements

### Musical Identity (Djinn's Recommendation)
Based on Ironveil's tone (hope through rebuilding, steampunk warmth, Harvest Moon coziness):

**Core Instruments**:
- Acoustic guitar (warmth, home)
- Piano (emotion, elegance)
- Accordion/concertina (steampunk flavor, European folk warmth)
- Strings (sweeping emotion, grandeur)
- Metallic percussion (anvil strikes, gear clicks, steam hisses — subtle steampunk texture)
- Gentle woodwinds (flute, clarinet — pastoral beauty)

**Genre Blend**: Acoustic folk + light orchestral + steampunk industrial textures

**Reference Mood**: Stardew Valley's warmth + Bastion's atmospheric storytelling + Studio Ghibli's magical realism

---

## 6.8 DEVELOPMENT MILESTONES

### Prototype (Month 1-2)
- [ ] Basic tile rendering and camera
- [ ] Player movement and interaction
- [ ] Time system (day/night cycle)
- [ ] One NPC with schedule and dialogue
- [ ] Basic inventory system
- [ ] One crafting recipe
- [ ] Save/load

### Alpha (Month 3-6)
- [ ] Full Coppervale tilemap
- [ ] All core NPCs with schedules
- [ ] Workshop stations (all 5)
- [ ] 10+ craftable machines
- [ ] Basic tower defense raid
- [ ] Relationship system (gifts, hearts)
- [ ] One exploration zone (The Hollow)
- [ ] Seasonal cycle working
- [ ] Basic UI (HUD, inventory, crafting)

### Beta (Month 7-12)
- [ ] All exploration zones
- [ ] Full machine catalog
- [ ] All NPC dialogue (Year 1)
- [ ] Full raid system with mech combat
- [ ] Romance system (all 6 candidates)
- [ ] DEJIN fully implemented
- [ ] All 4 festivals
- [ ] Sound and music
- [ ] Mobile UI adaptation
- [ ] Performance optimization

### Release Candidate (Month 13-15)
- [ ] Full 3+ year story content
- [ ] All dialogue and quest content
- [ ] Polish pass on all systems
- [ ] QA testing
- [ ] Platform-specific testing (PC + Mobile)
- [ ] Localization (if applicable)

---

*This Technical Architecture Document is Part 6 of the Ironveil GDD.*
*This completes the core Game Design Document suite.*

*— Forged by the Djinn*
