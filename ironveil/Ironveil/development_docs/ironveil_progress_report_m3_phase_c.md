# Ironveil Coding Progress Report — M3 Phase C
**Date:** 2026-03-19
**Chat:** 69bb583868b62936413590a8

## Overall Status: M3 Phase C — Story & Social at 100% (3/3 objectives) ✅

---

### #35 ✅ DEJIN Progression System

**New script:** `scr_dejin_system.gml` (~600 lines)
- **6-stage progression**: Dormant → Flickering → Awakening → Functional → Recovering → Restored
- **Stage requirements**: Data cores installed count + trust level + story flags
- **Trust system**: 0-100 scale, advances via core installations, dialogue choices, story milestones
- **Memory fragment playback**: 13 fragments across 9 exploration zones, cutscene-style dialogue sequences
- **Commentary system**: 200+ conditional lines across 6 categories (morning, post_raid, exploration, npc_observation, seasonal, milestone)
- **Commentary controls**: Toggleable, daily limit (3/day), cooldown between lines
- **AI Core Terminal UI data**: System Status, Memory Archive, Automaton Management, Research tabs
- **Full save/load integration**

**New data files:**
| File | Description |
|------|-------------|
| `dejin_stages.json` | 6 stage definitions with requirements, capabilities, personality |
| `dejin_memory_fragments.json` | 13 memory fragments with full dialogue sequences |
| `dejin_commentary.json` | 200+ commentary lines across 6 categories |

---

### #33 ✅ Complete NPC Dialogue (Year 1)

**New script:** `scr_dialogue_data.gml` (~300 lines)
- **Dialogue loading**: Per-NPC JSON files loaded at boot
- **Priority-based selection**: Season → weather → heart level matching
- **Heart milestone delivery**: One-time milestone lines at hearts 2/4/6/8/10
- **Festival dialogue**: Per-NPC per-festival lookup
- **Heart event lazy loading**: Dialogue scripts loaded on demand, cached
- **Master selection**: `dialogue_get_best()` checks milestones → festivals → seasonal pool

**Dialogue content totals:**
| Category | Count |
|----------|-------|
| Seasonal/daily pool lines | ~432 (18 NPCs × 24 avg) |
| Heart milestone lines | 90 (18 NPCs × 5 levels) |
| Heart event scripted lines | ~360 (6 candidates × 6 events × ~10 lines avg) |
| Festival dialogue lines | 72 (18 NPCs × 4 festivals) |
| DEJIN commentary lines | 200+ |
| **Total dialogue entries** | **~1,154** |

**New data files (55 files):**
| Category | Files | Description |
|----------|-------|-------------|
| NPC dialogue | 18 | `npc_*.json` — seasonal/daily + heart milestones per NPC |
| Heart events | 36 | `*_event_*.json` — 6 events × 6 romance candidates |
| Festival dialogue | 1 | `festival_dialogue.json` — all 18 NPCs × 4 festivals |

---

### #34 ✅ Romance System

**New script:** `scr_romance_system.gml` (~500 lines)
- **Heart event checking**: Room-enter trigger with location/time/heart/flag/item conditions
- **Event execution**: Dialogue loading, story flag setting, heart bonus, item consumption
- **Confession system**: Promise Locket required, locks to one romance path
- **Partnership ceremony**: Heart 10 trigger, Mayor Linden officiates, town-wide event
- **Post-partnership content**: Packed lunches, partner dialogue, anniversary checks, schedule overrides
- **6 partner-specific activities**: Each with unique gameplay bonus
- **Full save/load integration**

**New data files:**
| File | Description |
|------|-------------|
| `romance_events.json` | 36 heart event trigger definitions + Promise Locket recipe |
| `partnership_data.json` | Ceremony dialogue, 6 partner profiles with schedules/dialogue/activities |

---

## File Inventory — Phase C

### New GML Scripts (3 files)
| File | Lines | Description |
|------|-------|-------------|
| `scr_dejin_system.gml` | ~600 | DEJIN progression, memory, commentary, trust |
| `scr_dialogue_data.gml` | ~300 | Dialogue loading, selection, heart events |
| `scr_romance_system.gml` | ~500 | Romance events, confession, partnership |

### New JSON Data Files (58 files)
| Category | Files | Description |
|----------|-------|-------------|
| DEJIN data | 3 | Stages, memory fragments, commentary |
| NPC dialogue | 18 | Seasonal/daily + milestones per NPC |
| Heart events | 36 | Full scripted events for 6 romance candidates |
| Festival dialogue | 1 | All NPCs × 4 festivals |
| Romance data | 2 | Event triggers + partnership content |

**Total Phase C: 61 new files, ~1,400 GML lines + ~9,000+ JSON lines**

---

## Combined Project Totals (All Sessions Through Phase C)
- **24 GML scripts** (~12,400 lines)
- **109 JSON data files** (~21,000+ lines)  
- **4 GLSL shaders** (~170 lines)
- **Estimated total: ~137 source files, ~33,570+ lines**

---

## Milestone 3 Cumulative Progress

| Phase | Objectives | Status |
|-------|-----------|--------|
| Phase A: Combat & Machines Core | #32, #31, #30 | ✅ Complete |
| Phase B: World Content & Economy | #29, #37 | ✅ Complete |
| **Phase C: Story & Social** | **#35, #33, #34** | **✅ Complete** |
| Phase D: Events, Discovery & Quests | #36, #38, #41 | ⬜ Next |
| Phase E: Audio & Mobile Polish | #39, #40 | ⬜ Pending |

**M3 Progress: 8/13 objectives complete (62%)**

---

## What's Next: M3 Phase D (Events, Discovery & Quests)
- **#36** — Festival System (All 4 festivals with mini-games)
- **#38** — Journal & Discovery System (Enhanced map, bestiary, fast travel)
- **#41** — Full Quest System (~100-120 quests)
