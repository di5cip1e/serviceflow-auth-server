# Ironveil Coding Progress Report — M3 Phase D
**Date:** 2026-03-19
**Chat:** 69bb583868b62936413590a8

## Overall Status: M3 Phase D — Events, Discovery & Quests at 100% (3/3 objectives) ✅

---

### #41 ✅ Full Quest System (118 quests + 6 repeatable templates)

**New script:** `scr_quest_system.gml` (~700 lines)
- **Quest engine**: States (LOCKED → AVAILABLE → ACTIVE → COMPLETE / FAILED)
- **Trigger evaluation**: Prerequisite quests, story flags, heart levels, season/day/year, engineering level
- **Objective tracking**: 15 objective types (VISIT, TALK, CRAFT, BUILD, GATHER, DELIVER, KILL, EXPLORE, SURVIVE_RAID, REACH, HAVE_ITEM, ACHIEVE_RATING, CHOICE, ESCORT, INSPECT)
- **Reward distribution**: Cogs, items, hearts, reputation, blueprints, story flags, unlocks
- **Event hooks**: `quest_on_room_enter()`, `quest_on_npc_talk()`, `quest_on_enemy_kill()`, `quest_on_item_craft()`, `quest_on_raid_survive()`
- **Repeatable generation**: Template-based quest instances with randomized parameters
- **Full save/load integration**

**Quest content:**
| Category | File | Quests |
|----------|------|--------|
| Main Quest Chain | `main_quests.json` | 27 (MQ-01 to MQ-27) |
| Romance Side Quests | `side_quests_romance.json` | 21 (6 candidates) |
| Core NPC Side Quests | `side_quests_core.json` | 25 (Spark 6, Harrow 5, Maren 5, Linden 4, Pip 5) |
| Supporting NPC Quests | `side_quests_support.json` | 17 (7 NPCs) |
| Build Quests | `build_quests.json` | 12 |
| Exploration Quests | `exploration_quests.json` | 9 |
| Defense Quests | `defense_quests.json` | 7 |
| Repeatable Templates | `repeatable_templates.json` | 6 templates (infinite generation) |
| **Total** | | **118 + 6 templates** |

---

### #36 ✅ Festival System (All 4 Festivals)

**New script:** `scr_festival_system.gml` (~375 lines)
- **Festival lifecycle**: Auto-trigger on festival days, NPC schedule overrides, attendance tracking
- **4 festivals**: Spark Festival (Spring 15), Sky Day (Summer 20), Harvest Faire (Autumn 25), Remembrance Day (Winter 10)
- **Mini-game engine**: Machine Showcase judging, Automaton Race, Cooking Competition, Flyer Race
- **Scoring system**: Blueprint tier + quality + mark level for showcases; personality bonus for races
- **Dance invitation**: Heart requirement (≥3), heart bonus on acceptance
- **Rewards**: Festival-exclusive items, trophies, cogs, heart bonuses
- **Full save/load integration**

**New data files:**
| File | Description |
|------|-------------|
| `festivals.json` | 4 festival definitions with schedules, mini-games, decorations |
| `festival_rewards.json` | 10 prize tier reward tables (gold/silver/bronze per mini-game) |

---

### #38 ✅ Journal & Discovery System

**New script:** `scr_bestiary.gml` (~138 lines)
- **Kill tracking**: Per enemy type, persisted in save
- **3-tier info unlock**: Name at 1 kill, stats at 10 kills, full info + lore at 50 kills
- **17 enemy types** across 5 factions: Freelance (2), Rust Wolves (5 + Alpha Wolf boss), Iron Marauders (5 + Iron Mech + The Marshal), Tide Reavers (3), Old World (1 security drone)
- **Journal integration**: `bestiary_get_all()` for journal BESTIARY tab

**New data file:**
| File | Description |
|------|-------------|
| `bestiary_entries.json` | 17 enemy display entries with tiered descriptions and faction lore |

---

## File Inventory — Phase D

### New GML Scripts (3 files)
| File | Lines | Description |
|------|-------|-------------|
| `scr_quest_system.gml` | 700 | Quest engine, triggers, objectives, rewards |
| `scr_festival_system.gml` | 375 | Festival lifecycle, mini-games, scoring |
| `scr_bestiary.gml` | 138 | Kill tracking, tiered info, journal data |

### New JSON Data Files (11 files)
| Category | Files | Description |
|----------|-------|-------------|
| Quest data | 8 | Main, side (romance/core/support), build, exploration, defense, templates |
| Festival data | 2 | Definitions + reward tables |
| Bestiary data | 1 | 17 enemy type entries |

**Total Phase D: 14 new files, ~1,213 GML lines + ~7,000+ JSON lines**

---

## Combined Project Totals (All Sessions Through Phase D)

| Metric | Count |
|--------|-------|
| GML scripts | 27 |
| JSON data files | 122 |
| GLSL shaders | 4 |
| **Total source files** | **146** |
| **Total lines** | **~35,332** |

---

## Milestone 3 Cumulative Progress

| Phase | Objectives | Status |
|-------|-----------|--------|
| Phase A: Combat & Machines Core | #32, #31, #30 | ✅ Complete |
| Phase B: World Content & Economy | #29, #37 | ✅ Complete |
| Phase C: Story & Social | #35, #33, #34 | ✅ Complete |
| **Phase D: Events, Discovery & Quests** | **#36, #38, #41** | **✅ Complete** |
| Phase E: Audio & Mobile Polish | #39, #40 | ⬜ Next |

**M3 Progress: 11/13 objectives complete (85%)**

---

## What's Next: M3 Phase E (Audio & Mobile Polish)
- **#39** — Full Sound & Music Integration (music channels, dynamic layers, ambient soundscapes, SFX)
- **#40** — Mobile UI Adaptation (virtual joystick, tap interactions, scaled UI)
