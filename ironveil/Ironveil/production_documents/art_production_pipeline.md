# 🎨 IRONVEIL — ART PRODUCTION PIPELINE
## Phase 11: Art Production Pipeline Specification

---

> **"Consistency is the invisible architecture of great art. The player never sees the pipeline — they see the result."**

---

## 1.0 OVERVIEW

This document formalizes the art production pipeline for Ironveil — the rules, conventions, and workflows that ensure every pixel art asset is consistent, properly formatted, and ready for integration into GameMaker. Every artist, tool, and process must follow this specification.

### Pipeline Flow
```
CONCEPT/REFERENCE → CREATION → REVIEW → EXPORT → INTEGRATION → QA
     ↑                                                           |
     └──────────────── Revision Cycle ────────────────────────────┘
```

### Applicable Documents
| Document | Purpose |
|----------|---------|
| Art Style Guide | Visual rules — WHAT things look like |
| Color Palette Bible | Color rules — WHAT colors to use |
| **This Document** | Production rules — HOW assets are made, named, formatted, and delivered |

---

## 2.0 ASSET NAMING CONVENTION

### 2.1 General Rules
- All filenames are **lowercase**
- Words separated by **underscores** `_`
- No spaces, no special characters, no capital letters
- Prefixes denote asset type (see below)
- Suffixes denote variant or state where applicable
- File extension always included and lowercase

### 2.2 Prefix Convention

| Prefix | Asset Type | Example |
|--------|-----------|---------|
| `spr_` | Character/creature sprite sheet | `spr_jack_player_sheet.png` |
| `ts_` | Tileset | `ts_grass_spring_sheet.png` |
| `ui_` | UI element or screen | `ui_elements_kit.png` |
| `pt_` | Portrait (dialogue) | `pt_core_npcs_portraits.png` |
| `ic_` | Icon sheet | `ic_items_sheet_1.png` |
| `eq_` | Equipment/object sprite | `eq_workshop_equipment.png` |
| `fx_` | Visual effect sprite | `fx_explosion_sheet.png` |
| `bg_` | Background/parallax | `bg_title_screen.png` |
| `mp_` | Map/layout image | `mp_coppervale_rendered.png` |

### 2.3 Naming Pattern

```
{prefix}_{subject}_{variant}_{state}.png

Examples:
  spr_jack_player_sheet.png          — Player character sprite sheet
  spr_romance_full_walks_sheet.png   — Romance candidates walk cycles
  ts_grass_spring_sheet.png          — Spring grass tileset
  ts_grass_autumn_sheet.png          — Autumn grass tileset
  pt_core_npcs_portraits.png         — Core NPC dialogue portraits
  eq_alarm_tower_sprite.png          — Alarm tower equipment sprite
  ui_title_screen.png                — Title screen UI
  ic_items_sheet_1.png               — Item icons sheet 1
```

### 2.4 Variant Naming

| Variant Type | Pattern | Example |
|-------------|---------|---------|
| Seasonal | `_{season}` | `ts_grass_spring`, `ts_grass_winter` |
| Set number | `_set{N}` or `_{N}` | `pt_romance_portraits_set_1`, `ic_items_sheet_2` |
| Upgrade tier | `_mk{N}` | `spr_combat_mech_mk2` |
| State | `_{state}` | `eq_dejin_dormant`, `eq_dejin_restored` |
| Direction | `_{dir}` | Only if separate files per direction (not standard) |

### 2.5 Directory Structure (GameMaker Project)

```
ironveil/
├── sprites/
│   ├── characters/           # All character sprite sheets
│   │   ├── spr_jack_player_sheet.png
│   │   ├── spr_core_npcs_sheet.png
│   │   ├── spr_romance_candidates_sheet.png
│   │   ├── spr_romance_full_walks_sheet.png
│   │   ├── spr_supporting_npcs_sheet.png
│   │   ├── spr_enemy_factions_sheet.png
│   │   └── spr_automatons_pip_sheet.png
│   ├── machines/             # Mechs, vehicles, turrets, defenses
│   │   ├── spr_light_mechs_sheet.png
│   │   ├── spr_heavy_mechs_sheet.png
│   │   ├── spr_turrets_sheet.png
│   │   ├── spr_vehicles_zeppelins_sheet.png
│   │   ├── spr_walls_traps_sheet.png
│   │   ├── spr_mortar_emplacement.png
│   │   └── ...
│   ├── equipment/            # Workshop stations, defense structures
│   │   ├── eq_workshop_equipment.png
│   │   ├── eq_alarm_tower.png
│   │   ├── eq_energy_shield_generator.png
│   │   ├── eq_spotlight.png
│   │   ├── eq_testing_platform.png
│   │   └── eq_dejin_states.png
│   └── effects/              # Visual effects (explosions, particles, etc.)
├── tilesets/
│   ├── terrain/              # Ground tiles (per season where applicable)
│   │   ├── ts_grass_spring_sheet.png
│   │   ├── ts_grass_summer_sheet.png
│   │   ├── ts_grass_autumn_sheet.png
│   │   ├── ts_grass_winter_sheet.png
│   │   ├── ts_dirt_soil_sheet.png
│   │   ├── ts_stone_road_sheet.png
│   │   ├── ts_water_sheet.png
│   │   └── ts_war_scars_ruins_sheet.png
│   ├── buildings/            # Building exterior tiles
│   │   └── ts_coppervale_buildings_sheet.png
│   ├── interiors/            # Interior furniture and workshop tiles
│   │   ├── ts_interior_furniture_sheet.png
│   │   └── ts_workshop_interior_sheet.png
│   ├── vegetation/           # Trees, plants (per season)
│   │   ├── ts_vegetation_spring_sheet.png
│   │   ├── ts_vegetation_summer_sheet.png
│   │   ├── ts_vegetation_autumn_sheet.png
│   │   └── ts_vegetation_winter_sheet.png
│   ├── regions/              # Region-specific tilesets
│   │   ├── ts_rustwood_forest_sheet.png
│   │   ├── ts_ashspine_mountains_sheet.png
│   │   ├── ts_shattered_coast_sheet.png
│   │   ├── ts_scorchlands_sheet.png
│   │   └── ts_spire_wastes_sheet.png
│   └── decorations/          # Props and decorative elements
│       └── ts_decorative_props_sheet.png
├── portraits/
│   ├── pt_core_npcs_portraits.png
│   ├── pt_romance_portraits_set_1.png
│   ├── pt_romance_portraits_set_2.png
│   ├── pt_supporting_npcs_set_1.png
│   └── pt_supporting_npcs_set_2.png
├── ui/
│   ├── screens/              # Full UI screens
│   │   ├── ui_title_screen.png
│   │   ├── ui_save_load_screen.png
│   │   ├── ui_settings_menu.png
│   │   ├── ui_credits_screen.png
│   │   ├── ui_automaton_panel.png
│   │   └── ui_world_map_screen.png
│   ├── icons/                # Item and status icons
│   │   ├── ic_items_sheet_1.png
│   │   └── ic_items_sheet_2.png
│   └── ui_elements_kit.png   # HUD, buttons, frames, dialogue boxes
├── sounds/                    # (Per Phase 9 Sound Direction document)
│   ├── music/
│   ├── sfx/
│   └── ambient/
└── datafiles/
    └── data/                  # JSON data files
```

### 2.6 Drive Storage Structure (Derek's Personal Archive)
The Drive mirrors the project structure for easy reference:
```
Drive/Ironveil/
├── assets/                    # All game-ready art assets
│   ├── icons/
│   ├── portraits/
│   ├── sprites/characters/
│   ├── sprites/machines/
│   ├── tilesets/{category}/
│   └── ui/screens/
├── design_documents/          # All design specs
│   ├── narrative/
│   ├── sound_music/
│   └── map_layouts/
├── production_documents/      # Pipeline and production plans
└── visual_references/         # Concept art and reference images
```

---

## 3.0 SPRITE SHEET FORMAT SPECIFICATION

### 3.1 Character Sprites (16×24 px per frame)

| Property | Value |
|----------|-------|
| **Frame Size** | 16×24 pixels (1 tile wide × 1.5 tiles tall) |
| **Chibi Proportions** | Head ~40% of height, body ~35%, legs ~25% |
| **Outline** | 1px dark contextual (brown #3D2B1F organic, steel #2C3E50 mechanical) |
| **Shading** | 2-3 tones (base + shadow + highlight) |
| **Background** | Transparent (alpha channel) |
| **Color Depth** | 32-bit RGBA |

#### Standard Character Sheet Layout

```
Sheet Width: 16px × 8 columns = 128px
Sheet Height: 24px × 8 rows = 192px

Row Layout (standard character):
Row 0: Walk Down  — 4 frames (idle is frame 0)
Row 1: Walk Left  — 4 frames
Row 2: Walk Right — 4 frames
Row 3: Walk Up    — 4 frames
Row 4: Idle Down  — 2-4 frames (breathing/blinking)
Row 5: Idle Side  — 2-4 frames
Row 6: Action 1   — 3-6 frames (tool use, interact)
Row 7: Action 2   — 3-6 frames (special action)
```

**Frame Padding**: 0px between frames (tight packing)
**Sheet Padding**: 0px margin around sheet edges

#### Walk Cycle Specification
- 4 frames per direction
- Frame order: Stand → Step Left → Stand → Step Right
- Animation speed: 150ms per frame (6.67 FPS) at normal walk speed
- Run animation: Same frames, 100ms per frame (10 FPS)

#### Player Character (Jack) — Extended Sheet
Jack has additional rows for tool animations:
```
Row 8:  Wrench Use     — 4 frames
Row 9:  Welding Torch  — 4 frames
Row 10: Salvage Cutter — 4 frames
Row 11: Scanner Use    — 3 frames
Row 12: Oil Can        — 3 frames
Row 13: Celebrate      — 4 frames
Row 14: Exhausted      — 2 frames
Row 15: Carry (heavy)  — 4 frames (walk cycle with object)
```

### 3.2 Large Sprites (Mechs, Vehicles, Equipment)

| Category | Frame Size | Notes |
|----------|-----------|-------|
| Light Mechs | 32×32 px | 2×2 tile footprint |
| Heavy Mechs | 48×48 px | 3×3 tile footprint |
| Vehicles | 32×48 px | 2×3 tile footprint (varies) |
| Zeppelins | 64×32 px | 4×2 tile footprint |
| Workshop Equipment | 32×32 or 48×48 px | Per station size |
| Defense Turrets | 32×32 px | 2×2 tile footprint |
| Walls/Traps | 16×16 px | 1×1 tile footprint |

#### Large Sprite Sheet Layout
```
Row Layout (mech example — 32×32 frame):
Row 0: Idle          — 2-4 frames
Row 1: Walk/Move     — 4 frames
Row 2: Attack/Fire   — 3-6 frames
Row 3: Special       — 3-4 frames
Row 4: Damaged       — 2 frames
Row 5: Destroyed     — 3 frames
```

### 3.3 Portrait Sprites (Dialogue)

| Property | Value |
|----------|-------|
| **Frame Size** | 64×64 pixels |
| **Style** | Detailed face — NOT chibi, more proportional |
| **Background** | Transparent |
| **Expressions per character** | 8 standard |

#### Standard Expression Set
| Slot | Expression | When Used |
|------|-----------|-----------|
| 0 | Neutral | Default, general conversation |
| 1 | Happy | Good news, gifts, festivals |
| 2 | Sad | Bad news, loss, disappointment |
| 3 | Angry | Conflict, frustration, raids |
| 4 | Surprised | Discoveries, unexpected events |
| 5 | Embarrassed | Romance moments, mistakes |
| 6 | Determined | Quests, challenges, resolve |
| 7 | Thoughtful | Deep conversation, lore, reflection |

#### Portrait Sheet Layout
```
Sheet: 8 expressions per row, 1 row per character
Width: 64px × 8 = 512px per character row
Height: 64px per character

Multi-character sheets: Stack vertically
  Row 0: Character A (8 expressions)
  Row 1: Character B (8 expressions)
  ...
```

---

## 4.0 TILESET FORMAT SPECIFICATION

### 4.1 Base Tile Properties

| Property | Value |
|----------|-------|
| **Tile Size** | 16×16 pixels |
| **Color Depth** | 32-bit RGBA |
| **Background** | Opaque (no transparency for base terrain) |
| **Outline** | 1px contextual dark outline where edges are visible |
| **Shading** | 2-3 tones maximum |
| **Dithering** | Minimal — only for large gradient areas |

### 4.2 Auto-Tile Configuration (47-Tile Blob)

GameMaker supports auto-tiling for seamless terrain transitions. Each terrain type requires a **47-tile blob auto-tile set**:

```
47-Tile Blob Layout (Standard):
┌──┬──┬──┬──┬──┬──┬──┬──┐
│01│02│03│04│05│06│07│08│  Row 1: Outer corners and edges
├──┼──┼──┼──┼──┼──┼──┼──┤
│09│10│11│12│13│14│15│16│  Row 2: Inner corners and transitions
├──┼──┼──┼──┼──┼──┼──┼──┤
│17│18│19│20│21│22│23│24│  Row 3: Fill variants
├──┼──┼──┼──┼──┼──┼──┼──┤
│25│26│27│28│29│30│31│32│  Row 4: Special transitions
├──┼──┼──┼──┼──┼──┼──┼──┤
│33│34│35│36│37│38│39│40│  Row 5: Additional variants
├──┼──┼──┼──┼──┼──┼──┼──┤
│41│42│43│44│45│46│47│  │  Row 6: Remaining + empty
└──┴──┴──┴──┴──┴──┴──┴──┘

Sheet Size: 128×96 px (8 columns × 6 rows of 16×16 tiles)
```

### 4.3 Tileset Sheet Organization

Each tileset PNG is organized as follows:
```
Section 1: Auto-tile set (47 tiles for seamless transitions)
Section 2: Variant tiles (visual variety — 8-16 tiles)
Section 3: Decorative overlays (flowers, debris, details — 8-16 tiles)
Section 4: Transition tiles (to OTHER terrain types — 16-32 tiles)
Section 5: Animated tiles (water frames, steam, etc. — 3-4 frames each)
Section 6: Special tiles (Aetheric glow, war scars, etc.)

Total tiles per tileset: 80-160 typically
Sheet dimensions: Varies, but always multiples of 16px
```

### 4.4 Animated Tile Specification

| Animated Element | Frames | Speed | Loop |
|-----------------|--------|-------|------|
| Water (still) | 3 | 300ms/frame | Yes |
| Water (flowing) | 4 | 200ms/frame | Yes |
| Steam puff | 4 | 250ms/frame | Yes (with random delay) |
| Fire/forge | 3 | 200ms/frame | Yes |
| Aetheric glow | 3 | 400ms/frame | Yes (pulse) |
| Machine active | 2-4 | 300ms/frame | Yes |
| Smoke | 4-6 | 350ms/frame | Yes |
| Lamp flicker | 2 | 500ms/frame | Yes (random) |

Animated tiles are stored as consecutive frames in the sheet, left-to-right.

### 4.5 Seasonal Tileset Relationships

| Base Tileset | Spring | Summer | Autumn | Winter |
|-------------|--------|--------|--------|--------|
| Grass/Meadow | `ts_grass_spring` | `ts_grass_summer` | `ts_grass_autumn` | `ts_grass_winter` |
| Vegetation | `ts_vegetation_spring` | `ts_vegetation_summer` | `ts_vegetation_autumn` | `ts_vegetation_winter` |
| Water | Same year-round (minor tint) | Same | Amber tint | Frozen edges variant |
| Dirt/Soil | Same year-round | Same | Same | Snow overlay |
| Stone/Road | Same year-round | Same | Leaf debris | Snow overlay |
| Buildings | Same year-round | Same | Harvest garlands | Snow on roofs, warm windows |

**Palette Swap Implementation**: Where possible, use GameMaker's palette swap shader rather than separate tilesets. This reduces memory and asset count. Only vegetation and grass require fully separate sheets due to significant shape changes (bare trees in winter, flowers in spring).

---

## 5.0 ANIMATION FRAME SPECIFICATION

### 5.1 Character Animations

| Animation | Frames | Speed (ms/frame) | Loop | Trigger |
|-----------|--------|-------------------|------|---------|
| Walk (per direction) | 4 | 150 | Yes | Movement input |
| Run (per direction) | 4 | 100 | Yes | Run input |
| Idle (per direction) | 2-4 | 400 | Yes | No input for 2s |
| Tool Use | 3-6 | 120 | No | Tool action |
| Interact | 2-3 | 150 | No | NPC/object interaction |
| Celebrate | 4 | 200 | No | Achievement/quest complete |
| Exhausted | 2 | 600 | Yes | Energy at 0 |
| Sleep | 1 | — | No | Bed interaction |
| Carry | 4 | 170 | Yes | Carrying heavy object |

### 5.2 Machine Animations

| Animation | Frames | Speed (ms/frame) | Loop | Trigger |
|-----------|--------|-------------------|------|---------|
| Machine Idle | 2 | 500 | Yes | Default state |
| Machine Active | 2-4 | 250 | Yes | During operation |
| Machine Startup | 4-6 | 150 | No | Power on |
| Machine Shutdown | 4-6 | 200 | No | Power off |
| Mech Walk | 4 | 200 | Yes | Movement |
| Mech Attack | 3-6 | 100 | No | Combat action |
| Turret Fire | 3 | 80 | No | Target acquired |
| Turret Rotate | 4 | 150 | No | Tracking target |

### 5.3 Environmental Animations

| Animation | Frames | Speed (ms/frame) | Loop |
|-----------|--------|-------------------|------|
| Water ripple | 3 | 300 | Yes |
| Waterfall | 4 | 200 | Yes |
| Chimney smoke | 4-6 | 350 | Yes |
| Forge fire | 3 | 200 | Yes |
| Wind (grass sway) | 3 | 400 | Yes |
| Rain drops | 4 | 100 | Yes |
| Snow fall | 4 | 300 | Yes |
| Lamp flicker | 2 | 500 | Yes (random start) |
| Flag wave | 3 | 300 | Yes |
| Gear turn | 4 | 250 | Yes |

### 5.4 UI Animations

| Animation | Frames | Speed (ms/frame) | Loop |
|-----------|--------|-------------------|------|
| Button hover glow | 2 | 200 | Yes |
| Heart icon pulse | 2 | 400 | Yes |
| Notification pop | 3 | 100 | No |
| Gauge fill | Continuous | — | No (lerp) |
| Text typewriter | Per-character | 30-50ms/char | No |
| Menu transition | 4-6 | 50 | No |

---

## 6.0 EXPORT SETTINGS

### 6.1 Image Export

| Property | Setting |
|----------|---------|
| **Format** | PNG (32-bit RGBA) |
| **Compression** | Maximum (lossless) |
| **Color Profile** | sRGB |
| **Transparency** | Alpha channel preserved |
| **Scaling** | Export at 1x (native 16px tiles). GameMaker handles display scaling. |
| **Anti-aliasing** | NONE — nearest neighbor only |
| **Interlacing** | Off |

### 6.2 Pre-Export Checklist

Before exporting any asset, verify:
- [ ] Filename follows naming convention (Section 2)
- [ ] Dimensions are multiples of 16px (tile alignment)
- [ ] No stray pixels outside intended bounds
- [ ] Transparent background where required (sprites, portraits, UI elements)
- [ ] Opaque background where required (tilesets base terrain)
- [ ] Colors match the Color Palette Bible (no unauthorized colors)
- [ ] Outline is 1px, correct contextual color (brown or steel)
- [ ] Shading is 2-3 tones maximum
- [ ] No anti-aliasing, no sub-pixel rendering
- [ ] Animation frames are consistently sized and aligned
- [ ] Sheet layout matches specification for its type

### 6.3 Audio Export (Reference — Per Phase 9)

| Property | Setting |
|----------|---------|
| **Music Format** | OGG Vorbis, 44.1kHz, stereo |
| **SFX Format** | OGG Vorbis, 44.1kHz, mono |
| **Ambient Format** | OGG Vorbis, 44.1kHz, stereo |
| **Naming** | `mus_`, `sfx_`, `amb_` prefixes (per Phase 9 document) |

---

## 7.0 VERSION CONTROL PROTOCOL

### 7.1 Git Repository Structure
The Ironveil project uses Git for version control. Art assets live alongside code in the same repository.

### 7.2 Branching Strategy

| Branch | Purpose | Merge Target |
|--------|---------|-------------|
| `main` | Stable, tested, release-ready | — |
| `develop` | Active development, integration | `main` (on milestone) |
| `art/{description}` | New art assets or revisions | `develop` |
| `feature/{description}` | New game features/systems | `develop` |
| `fix/{description}` | Bug fixes | `develop` or `main` (hotfix) |

### 7.3 Commit Message Convention

```
{type}: {short description}

Types:
  art:     New or updated art assets
  tileset: Tileset changes
  sprite:  Character/object sprite changes
  ui:      UI asset changes
  audio:   Sound/music changes
  code:    GML code changes
  data:    JSON data file changes
  doc:     Documentation changes
  fix:     Bug fixes
  refactor: Code/asset reorganization

Examples:
  art: Add romance candidates full walk cycle sheets
  tileset: Create autumn grass seasonal variant
  sprite: Update DEJIN terminal states for all 6 stages
  ui: Redesign save/load screen layout
  code: Implement NPC pathfinding system
  data: Add Year 1 Spring quest definitions
  doc: Update art pipeline with animation specs
```

### 7.4 Asset Versioning Rules
- **Never overwrite** an existing asset without creating a backup or using Git history
- **Significant revisions** get a new commit with descriptive message
- **Minor tweaks** (color adjustments, pixel fixes) can be batched into a single commit
- **Breaking changes** (sheet layout changes, dimension changes) require updating all dependent code/data files in the same commit

---

## 8.0 STYLE CONSISTENCY CHECKLIST

### 8.1 Per-Asset QA Review

Use this checklist when reviewing any art asset before integration:

#### General Checks
- [ ] **Naming**: Follows naming convention (prefix, lowercase, underscores)
- [ ] **Dimensions**: Multiples of 16px, matches spec for asset type
- [ ] **Format**: PNG, 32-bit RGBA, sRGB
- [ ] **Palette**: All colors exist in the Color Palette Bible
- [ ] **Scale**: Created at 1x native resolution (16px tiles)

#### Style Checks
- [ ] **Outline**: 1px, correct contextual color (brown #3D2B1F or steel #2C3E50)
- [ ] **Shading**: 2-3 tones only (base + shadow + optional highlight)
- [ ] **Anti-aliasing**: None — clean pixel edges
- [ ] **Dithering**: Minimal, only for large gradients
- [ ] **Readability**: Asset is identifiable at 1x and at 3x display scale
- [ ] **Charm Factor**: Does it feel warm, inviting, Harvest Moon-esque?
- [ ] **Steampunk Balance**: 70% charm / 30% steampunk grit

#### Character-Specific Checks
- [ ] **Proportions**: Chibi — head ~40%, body ~35%, legs ~25%
- [ ] **Identifiability**: Recognizable by hair + color + silhouette at 16×24 px
- [ ] **Consistency**: Matches established character design sheet
- [ ] **Walk Cycle**: 4 frames per direction, smooth animation
- [ ] **Expressions** (portraits): 8 standard expressions, consistent style

#### Tileset-Specific Checks
- [ ] **Seamless**: Tiles connect without visible seams
- [ ] **Auto-tile**: 47-tile blob set complete and functional
- [ ] **Variants**: Visual variety within same terrain type (no monotone fields)
- [ ] **Transitions**: Clean transitions to adjacent terrain types
- [ ] **Seasonal**: Correct palette for intended season

#### Machine-Specific Checks
- [ ] **Visible Mechanics**: Gears, pipes, gauges are exposed, not hidden
- [ ] **Warm Metals**: Copper/brass dominant, steel for structural
- [ ] **Aetheric Glow**: Blue glow on powered machines
- [ ] **Imperfect Craft**: Slight asymmetry, visible welds — handmade feel
- [ ] **Size Hierarchy**: Correct footprint for machine category

#### UI-Specific Checks
- [ ] **Steampunk Aesthetic**: Brass borders, rivets, leather textures
- [ ] **Readability**: Text is legible at display resolution
- [ ] **Touch Targets**: Minimum 48×48 display pixels for mobile
- [ ] **Consistency**: Matches UI Elements Kit style

### 8.2 Integration Testing

After importing an asset into GameMaker:
- [ ] Asset displays correctly at 3x render scale
- [ ] No visual artifacts or misaligned pixels
- [ ] Animations play at correct speed and loop properly
- [ ] Tileset auto-tiling works correctly (no seam breaks)
- [ ] Collision maps align with visual boundaries
- [ ] Asset works in all intended seasonal variants
- [ ] Performance: No frame rate impact from asset complexity

---

## 9.0 TEMPLATE FILES

### 9.1 Available Templates

| Template | Dimensions | Purpose | File |
|----------|-----------|---------|------|
| Character Sprite | 128×192 px | Standard 8-row character sheet | `template_character_sprite.png` |
| Extended Character Sprite | 128×384 px | Player character with tool animations | `template_player_sprite.png` |
| Portrait Sheet (single) | 512×64 px | 8 expressions for one character | `template_portrait_single.png` |
| Portrait Sheet (multi) | 512×384 px | 8 expressions × 6 characters | `template_portrait_multi.png` |
| Tileset (auto-tile) | 128×96 px | 47-tile blob template with guide | `template_tileset_autotile.png` |
| Tileset (full) | 256×256 px | Full tileset with sections marked | `template_tileset_full.png` |
| Icon Sheet | 256×256 px | 16×16 icons, 16×16 grid | `template_icon_sheet.png` |
| UI Screen | 320×240 px | Native resolution UI layout guide | `template_ui_screen.png` |
| UI Screen (mobile) | 320×240 px | With touch target overlay zones | `template_ui_screen_mobile.png` |

### 9.2 Template Contents
Each template includes:
- **Grid guides** showing tile/frame boundaries (non-rendering layer)
- **Color palette** embedded as a reference swatch strip
- **Annotation layer** with slot labels ("Walk Down Frame 1", etc.)
- **Example content** (faded, on separate layer) showing a completed asset for reference

---

## 10.0 ASSET PRODUCTION PRIORITY

### Current Status: All Pre-Production Art Complete

All art assets through Phases 3-7 are complete:
- ✅ 22 tilesets (terrain, buildings, interiors, vegetation, regions, decorations)
- ✅ 17 character/creature sprite sheets
- ✅ 5 portrait sheets (all NPCs covered)
- ✅ 5 equipment sprite sheets
- ✅ 7 UI screens + 1 UI kit + 2 icon sheets

### Future Production (During Development)

| Priority | Asset Type | When Needed |
|----------|-----------|-------------|
| 🔴 Critical | Additional character animations (if needed) | Alpha |
| 🔴 Critical | Visual effects sprites (explosions, impacts, status) | Alpha |
| 🟡 High | Cutscene illustrations (heart events, story moments) | Beta |
| 🟡 High | Additional UI screens (shop interface, crafting detail) | Alpha |
| 🟢 Medium | Marketing materials (Steam capsule, screenshots) | Pre-release |
| 🟢 Medium | Loading screen illustrations | Beta |
| 🟢 Low | Additional portrait expressions (beyond standard 8) | Polish |

---

*This Art Production Pipeline Specification is Phase 11 of the Ironveil Development Roadmap.*
*It formalizes the standards that all art assets must follow for consistent quality and seamless integration.*

*— Forged by the Djinn, in service to Master Derek*
