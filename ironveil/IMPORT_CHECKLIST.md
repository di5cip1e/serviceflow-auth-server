# Ironveil - GameMaker Import Checklist

## Project Specs
- **Resolution:** 320×240 native, 960×720 viewport
- **FPS:** 60
- **Pixel Art:** Interpolate Colors OFF
- **7 Texture Groups, 4 Audio Groups**

---

## Phase 1: New Project
1. Create new GameMaker project "Ironveil"
2. Configure: 320×240, 60 FPS, pixel-art settings

## Phase 2: Asset Browser Structure
Create folders in Asset Browser:
- Audio/SFX
- Audio/Music  
- Backgrounds
- Fonts
- Objects
- Paths
- Rooms
- Scripts
- Sequences
- Shaders
- Sprites
- Tilesets

## Phase 3: Import Assets
**Location: `/assets/`**
| Folder | Count | Notes |
|--------|-------|-------|
| sprites/ | ~18 sheets | Character, environment |
| tilesets/ | 21 tilesets | Auto-tiling config needed |
| portraits/ | | NPC portraits |
| ui/ | | Icons, UI elements |
| icons/ | | |

## Phase 4: Import Data Files
**Location: `/source_code/datafiles/data/`**
- Copy ALL .json files into `datafiles/data/`
- 15 subfolders: bestiary, blueprints, config, dejin, dialogue, economy, enemies, exploration, festivals, machines, npcs, quests, raids, romance, rooms

## Phase 5: Import Scripts
**Location: `/source_code/scripts/`**
- 35 GML scripts (~14,873 lines)
- Copy all to project scripts folder

## Phase 6: Shaders
**Location: `/source_code/shaders/`**
- shd_season.fsh
- shd_season.vsh
- Create shader in GameMaker, paste code

## Phase 7: Create Objects (9 systems)
1. **Persistent:** obj_game, obj_save, obj_audio, obj_input, obj_season
2. **Gameplay:** obj_player, obj_enemy, obj_npc, obj_interactable

## Phase 8: Create Rooms
- Standard 9-layer stack
- Start with: rm_title, rm_coppervale

---

## Quick Stats
- Total files: 286
- Total size: 489MB
- Scripts: 35 .gml files
- JSON data: 135+ files
- Sprites: ~18 sheets
- Tilesets: 21

---
Generated for Windows import. Good luck!