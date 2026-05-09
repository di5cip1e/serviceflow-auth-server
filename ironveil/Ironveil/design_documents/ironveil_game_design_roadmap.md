# 🗺️ IRONVEIL — GAME DESIGN & DEVELOPMENT ROADMAP
### A Complete Pre-Production Through Production Blueprint

---

> **"Before the first line of code is written, the world must be fully imagined."**
> *— The Djinn*

---

## TABLE OF CONTENTS

1. [Roadmap Overview](#1-roadmap-overview)
2. [Phase 1: Foundation — World & Vision (COMPLETE)](#2-phase-1-foundation)
3. [Phase 2: Game Design Document (GDD)](#3-phase-2-game-design-document)
4. [Phase 3: Visual Identity & Art Direction](#4-phase-3-visual-identity)
5. [Phase 4: Character Design](#5-phase-4-character-design)
6. [Phase 5: Environment & Tileset Design](#6-phase-5-environment-tileset)
7. [Phase 6: Machine & Technology Design](#7-phase-6-machine-design)
8. [Phase 7: UI/UX Design](#8-phase-7-ui-ux)
9. [Phase 8: Narrative & Quest Design](#9-phase-8-narrative)
10. [Phase 9: Sound & Music Direction](#10-phase-9-sound-music)
11. [Phase 10: Technical Architecture](#11-phase-10-technical)
12. [Phase 11: Art Production Pipeline](#12-phase-11-art-pipeline)
13. [Phase 12: Level Design Pipeline](#13-phase-12-level-design)
14. [Phase 13: Testing & QA Process](#14-phase-13-testing)
15. [Master Checklist](#15-master-checklist)

---

## 1. ROADMAP OVERVIEW

### Philosophy
This roadmap follows the principle that **creative decisions drive technical ones**. Every visual, narrative, and design choice must be locked down before coding begins, so development is execution — not exploration.

### Three Macro Stages

| Stage | Phases | Focus | Status |
|-------|--------|-------|--------|
| **PRE-PRODUCTION** | 1–9 | Creative vision, design, and documentation | 🟡 In Progress |
| **PRODUCTION PIPELINE** | 10–12 | Asset creation workflows and processes | ⬜ Not Started |
| **QUALITY ASSURANCE** | 13 | Testing frameworks and validation | ⬜ Not Started |

### Dependency Map
```
Phase 1 (Foundation) ✅
    ├── Phase 2 (GDD) ← Master reference for everything
    │       ├── Phase 3 (Visual Identity) ← Art direction drives all art
    │       │       ├── Phase 4 (Characters)
    │       │       ├── Phase 5 (Environments/Tilesets)
    │       │       ├── Phase 6 (Machines)
    │       │       └── Phase 7 (UI/UX)
    │       ├── Phase 8 (Narrative) ← Can run parallel to art
    │       └── Phase 9 (Sound/Music) ← Can run parallel to art
    └── Phase 10 (Technical Architecture) ← Informed by GDD
            ├── Phase 11 (Art Pipeline) ← How art enters the game
            ├── Phase 12 (Level Design) ← How levels are built
            └── Phase 13 (QA) ← How everything is tested
```

---

## 2. PHASE 1: FOUNDATION — WORLD & VISION ✅ COMPLETE

### Deliverables
| Deliverable | Status | Notes |
|-------------|--------|-------|
| World Bible | ✅ Complete | Lore, history, geography, factions, technology, town design |
| World Map (Vantara) | ✅ Complete | Illustrated continent map with all 7 regions |
| Coppervale Town Map | ✅ Complete | Illustrated player home town with all key locations |
| Core Game Concept Brief | ✅ Complete | Art style, gameplay loop, setting, tone confirmed |

---

## 3. PHASE 2: GAME DESIGN DOCUMENT (GDD)

The GDD is the **master blueprint** — the single source of truth for every system, mechanic, and feature in the game. Everything else references this document.

### 2.1 Core Systems Design
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Game Loop Document** | Detailed breakdown of the daily/seasonal/yearly cycle — wake, assign automatons, build, explore, socialize, defend, sleep | 🔴 Critical |
| **Workshop Mechanics** | How building works — resource gathering → component crafting → assembly → testing. Blueprint system, upgrade trees, quality tiers | 🔴 Critical |
| **Automaton Management** | AI team management — assigning tasks, upgrading, specializing, personality/efficiency traits | 🔴 Critical |
| **Resource & Economy System** | All resources (Aetheric Ore, metals, components, salvage), currency, trade with merchants, supply/demand | 🔴 Critical |
| **Combat & Defense System** | Marauder raid mechanics, defense building, mech combat, turret placement, threat escalation over seasons | 🔴 Critical |
| **Relationship System** | Friendship/romance mechanics, gift preferences, heart events, dialogue triggers, NPC schedules | 🟡 High |
| **Season & Calendar System** | 4 seasons, weather effects on gameplay, festivals, seasonal resources, time progression | 🟡 High |
| **Exploration & Salvage System** | How the player explores ruins, discovers blueprints, encounters dangers, and recovers Old World tech | 🟡 High |
| **Progression System** | Player skill levels, workshop upgrades, town reputation, story milestones, unlock gates | 🟡 High |
| **Inventory & Crafting System** | Inventory management, storage, crafting recipes, component trees | 🟡 High |

### 2.2 Machine Catalog Design
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Machine Categories** | Full taxonomy — utility mechs, combat mechs, zeppelins, automatons, vehicles, defense structures, tools | 🔴 Critical |
| **Blueprint System** | How blueprints are discovered, unlocked, and upgraded. Rarity tiers. | 🟡 High |
| **Build Requirements** | Per-machine resource costs, skill requirements, build time, component lists | 🟡 High |
| **Machine Stats & Abilities** | What each machine does — combat stats, utility functions, special abilities | 🟡 High |

### 2.3 World Systems
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Marauder Faction AI** | How marauder raids work — frequency, escalation, faction behavior, raid types | 🔴 Critical |
| **Town Growth System** | How Coppervale evolves based on player actions — new buildings, new NPCs, visual upgrades | 🟡 High |
| **Trade Route System** | Establishing connections to other Beacon Towns, unlocking trade goods, rail restoration | 🟢 Medium |
| **Weather System** | How weather affects gameplay, resource availability, NPC behavior, marauder activity | 🟢 Medium |

---

## 4. PHASE 3: VISUAL IDENTITY & ART DIRECTION

This phase establishes the **visual language** of the entire game. Every subsequent art asset references this.

### 3.1 Art Style Guide
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Master Style Guide** | Definitive reference for the game's art style — the "Harvest Moon BTN meets steampunk post-apocalypse" look. Includes DO's and DON'Ts | 🔴 Critical |
| **Color Palette Bible** | Master palettes for: each season, each region, time of day (dawn/day/dusk/night), interiors vs exteriors, UI elements | 🔴 Critical |
| **Tile Size & Grid Spec** | Exact pixel dimensions for tiles, sprite scale, camera viewport, grid spacing | 🔴 Critical |
| **Rendering Rules** | Outline thickness, shading style, dithering approach, how depth is conveyed, perspective angle specification | 🔴 Critical |

### 3.2 Seasonal Art Direction
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Spring Palette & Mood** | Fresh greens, cherry blossoms growing through ruins, morning mist, hope | 🟡 High |
| **Summer Palette & Mood** | Warm golds, long shadows, buzzing machinery, peak activity | 🟡 High |
| **Autumn Palette & Mood** | Copper and amber (plays beautifully with steampunk), harvest, preparation | 🟡 High |
| **Winter Palette & Mood** | Snow on copper rooftops, warm interior glows, frost on gears, quiet beauty | 🟡 High |

### 3.3 Concept Art
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Key Art / Hero Image** | A single iconic illustration that captures the game's essence — used for marketing, title screen | 🟡 High |
| **Region Concept Paintings** | One concept painting per region (7 total) showing the visual feel at ground level | 🟢 Medium |
| **Mood Board Collection** | Reference images, color studies, and inspiration organized by theme | 🟢 Medium |

---

## 5. PHASE 4: CHARACTER DESIGN

### 4.1 Player Character
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Player Character Sheet** | Front, side, back views. Default outfit. Chibi proportions per HM:BTN style | 🔴 Critical |
| **Player Outfit Variants** | Work clothes, formal wear, seasonal outfits, special event costumes | 🟡 High |
| **Player Expression Sheet** | Key emotions — happy, determined, surprised, tired, proud | 🟡 High |
| **Player Animation Concepts** | Key poses — walking, building, using tools, interacting, celebrating | 🟡 High |

### 4.2 NPC Cast
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Core NPC Character Sheets** | Full design sheets for ~15-20 main NPCs (Mayor Linden, Spark, Old Maren, Captain Harrow, Pip, merchants, romance candidates, etc.) | 🔴 Critical |
| **NPC Expression Sheets** | Key emotions for each NPC that reflect their personality | 🟡 High |
| **NPC Portrait Art** | Dialogue box portraits for each NPC — multiple expressions | 🟡 High |
| **NPC Schedule Concepts** | Visual reference for where NPCs go throughout the day | 🟢 Medium |

### 4.3 Marauder Design
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Iron Marauder Designs** | The Marshal + soldier variants. Military aesthetic, threatening but still HM art style | 🟡 High |
| **Rust Wolf Designs** | Scrappy forest bandits — patchwork armor, salvaged weapons | 🟡 High |
| **Tide Reaver Designs** | Coastal pirates — nautical steampunk, salvaged naval gear | 🟢 Medium |
| **Generic Raider Designs** | Freelance marauder types for random encounters | 🟢 Medium |

### 4.4 Automaton Design
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Automaton Base Models** | Core robot worker designs — small utility bots, medium labor bots, large construction bots | 🔴 Critical |
| **Automaton Personality Variants** | Visual cues that show automaton "personality" — paint jobs, accessories, wear patterns | 🟡 High |
| **Automaton Animation Concepts** | Working, idle, celebrating, damaged, powered-down states | 🟡 High |

---

## 6. PHASE 5: ENVIRONMENT & TILESET DESIGN

This is the **largest art production phase** — the tiles and environmental assets that make up every screen of the game.

### 5.1 Terrain Tilesets
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Grass/Meadow Tileset** | Base terrain for The Verdant Basin — multiple grass types, wildflowers, paths | 🔴 Critical |
| **Dirt/Soil Tileset** | Farm/workshop ground — tilled soil, packed earth, gravel, mud | 🔴 Critical |
| **Stone/Road Tileset** | Town paths, cobblestone, cracked concrete from Old World roads | 🔴 Critical |
| **Water Tileset** | Rivers, ponds (including crater-ponds), puddles, coastline edges | 🔴 Critical |
| **War Scar Tiles** | Craters, scorched earth, rubble, broken concrete, glass shards | 🟡 High |
| **Snow Tileset** | Winter variants of all base terrain | 🟡 High |
| **Desert/Scorchland Tileset** | For Scorchlands exploration — cracked earth, glass fields, dust | 🟢 Medium |
| **Forest Floor Tileset** | For Rustwood — leaf litter, roots, moss, copper-tinted mulch | 🟢 Medium |
| **Mountain/Cave Tileset** | For Ashspine exploration — rock faces, ice, cave interiors | 🟢 Medium |
| **Urban Ruin Tileset** | For Spire Wastes — broken floors, overgrown streets, rubble | 🟢 Medium |

### 5.2 Building & Structure Tilesets
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Coppervale Buildings** | All town buildings — homes, shops, tavern, clocktower, rail station | 🔴 Critical |
| **Workshop/Farm Structures** | Player's property — main workshop, forge, storage, AI core building, living quarters | 🔴 Critical |
| **Fence & Boundary Tiles** | Wooden fences, stone walls, chain-link, repurposed war debris borders | 🟡 High |
| **Decorative Objects** | Lampposts, benches, signs, planters (including rusted-tank-planter), mailboxes, flagpoles | 🟡 High |
| **Ruin Structures** | Damaged buildings, collapsed walls, overgrown bunkers — for exploration areas | 🟢 Medium |

### 5.3 Interior Tilesets
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Player Workshop Interior** | Assembly floor, forge area, workbenches, tool racks, component storage | 🔴 Critical |
| **Player Living Quarters** | Bedroom, kitchen area, personal items, upgradeable furniture | 🔴 Critical |
| **Shop Interiors** | General store, parts dealer, food vendor — shelves, counters, goods | 🟡 High |
| **Tavern Interior (The Rusty Gear)** | Bar, tables, decor, stage area, gear-themed decorations | 🟡 High |
| **NPC Home Interiors** | Template interiors for NPC houses — customized per character | 🟡 High |
| **Public Building Interiors** | Town hall, clinic, library/archive | 🟢 Medium |

### 5.4 Nature & Vegetation
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Trees (4 seasons)** | Normal trees, copper-tinted Rustwood trees, seasonal variants | 🔴 Critical |
| **Bushes, Flowers, Grass Details** | Decorative vegetation, seasonal wildflowers, harvestable plants | 🟡 High |
| **Crops/Resources** | Gatherable items — Aetheric Ore nodes, scrap metal deposits, component plants | 🟡 High |
| **Water Features** | Waterfalls, streams, ponds with lily pads, fountains | 🟢 Medium |

### 5.5 War Scar Environmental Art
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Rusted War Machine Props** | Tanks, drones, and walkers repurposed as planters, fences, playground equipment | 🟡 High |
| **Crater Environments** | Impact craters at various stages — fresh scars to beautiful ponds | 🟡 High |
| **Destroyed Infrastructure** | Broken bridges, collapsed towers, shattered roads | 🟢 Medium |
| **Overgrowth Art** | Vines on ruins, trees through buildings, nature reclaiming technology | 🟢 Medium |

---

## 7. PHASE 6: MACHINE & TECHNOLOGY DESIGN

The unique heart of this game — the machines the player builds.

### 6.1 Mech Designs
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Utility Mech (Small)** | Light bipedal frame for construction, hauling, basic tasks | 🔴 Critical |
| **Combat Mech (Medium)** | Armed walker for defense — the player's primary anti-marauder tool | 🔴 Critical |
| **Heavy Mech (Large)** | Massive quadrupedal frame for major construction or heavy combat | 🟡 High |
| **Scout Mech** | Fast, light, designed for exploration missions | 🟢 Medium |
| **Mech Upgrade Variants** | Visual progression as mechs are upgraded — more armor, better weapons, shinier parts | 🟡 High |

### 6.2 Airship Designs
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Personal Flyer** | Small one-person craft — the player's first flying machine | 🟡 High |
| **Cargo Zeppelin** | Medium transport for trade missions | 🟡 High |
| **Battle Zeppelin** | Armed airship for major defense events | 🟢 Medium |
| **The Dreadnought (Lore Reference)** | Old World war zeppelin — seen only as wrecks, but important for visual worldbuilding | 🟢 Medium |

### 6.3 Workshop Equipment
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Forge & Anvil** | Metalworking station — visual progression as upgraded | 🔴 Critical |
| **Assembly Crane** | For building large machines — a key workshop feature | 🔴 Critical |
| **AI Core Terminal** | The Old World computer that manages automatons — starts damaged, progressively repaired | 🔴 Critical |
| **Component Fabricator** | Machine that produces parts from raw materials | 🟡 High |
| **Aether Refinery** | Processes raw Aetheric Ore into usable fuel cells | 🟡 High |
| **Testing Platform** | Where completed machines are tested before deployment | 🟢 Medium |

### 6.4 Defense Structures
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Perimeter Wall Sections** | Buildable wall segments for town defense | 🟡 High |
| **Turret Designs** | Automated defense turrets — small, medium, large | 🟡 High |
| **Energy Shield Generator** | Rare, expensive, powerful — late-game defense | 🟢 Medium |
| **Alarm/Siren System** | Early warning for marauder raids | 🟢 Medium |

### 6.5 Tools & Items
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Player Tools** | Wrench, welding torch, scanner, salvage cutter — the steampunk equivalent of HM's farming tools | 🔴 Critical |
| **Resource Items** | Visual designs for all craftable/gatherable items — ores, components, salvage, fuel cells | 🔴 Critical |
| **Gift Items** | Items for NPC relationships — handcrafted gadgets, trinkets, useful tools | 🟡 High |
| **Key Items** | Story-critical items — Old World data cores, blueprints, the AI Core's memory fragments | 🟡 High |

---

## 8. PHASE 7: UI/UX DESIGN

### 7.1 HUD & In-Game Interface
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Main HUD Layout** | Health, energy, time/date, minimap, quick-access toolbar — steampunk gauge aesthetic | 🔴 Critical |
| **Dialogue Box Design** | NPC conversation interface — portrait, text area, response options. Brass/copper frame | 🔴 Critical |
| **Inventory Screen** | Grid-based inventory with item categories, descriptions, stats | 🔴 Critical |
| **Workshop/Crafting Interface** | Blueprint selection, component requirements, assembly progress, quality preview | 🔴 Critical |
| **Automaton Management Panel** | Assign tasks, view status, upgrade, customize | 🟡 High |
| **Map Interface** | Stylized in-game map matching the world map aesthetic | 🟡 High |

### 7.2 Menu Screens
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Title Screen** | Game logo, background art, menu options — first impression | 🟡 High |
| **Save/Load Screen** | Save slot interface with preview thumbnails | 🟡 High |
| **Settings Menu** | Audio, display, controls, accessibility options | 🟢 Medium |
| **Credits Screen** | Scrolling credits with thematic art | 🟢 Low |

### 7.3 UI Kit & Components
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Button Styles** | Primary, secondary, danger, disabled — steampunk aesthetic | 🔴 Critical |
| **Window/Panel Frames** | Consistent frame style for all UI panels — brass rivets, copper borders, gear accents | 🔴 Critical |
| **Icon Set** | Consistent icons for all items, resources, stats, actions, status effects | 🔴 Critical |
| **Font Selection** | Primary and secondary fonts — readable at small sizes, thematic | 🔴 Critical |
| **Progress Bars & Gauges** | Steampunk-styled meters for health, energy, build progress, etc. | 🟡 High |
| **Notification System** | How alerts, achievements, and information are displayed | 🟡 High |

---

## 9. PHASE 8: NARRATIVE & QUEST DESIGN

### 8.1 Story Architecture
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Main Story Arc** | The overarching narrative — from arriving in Coppervale to restoring the region. Major beats, climax, resolution | 🔴 Critical |
| **Act Structure** | Breaking the story into acts tied to seasons/years — Act 1 (Arrival/Setup), Act 2 (Growth/Conflict), Act 3 (Crisis/Triumph) | 🔴 Critical |
| **The Marshal's Storyline** | The Iron Marauder antagonist arc — who they are, what they want, how the conflict escalates and resolves | 🟡 High |
| **Old World Mystery Arc** | The slow reveal of what really caused The Sundering — discoverable through exploration and AI Core memories | 🟡 High |

### 8.2 Quest Design
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Main Quest Line** | ~20-30 story quests driving the main narrative | 🔴 Critical |
| **NPC Side Quest Lines** | Personal quest chains for each major NPC (~5-8 quests each) | 🟡 High |
| **Build Quests** | "Build X machine for Y purpose" — core gameplay loop quests | 🔴 Critical |
| **Exploration Quests** | Discover ruins, recover blueprints, map new areas | 🟡 High |
| **Defense Quests** | Prepare for and survive marauder raids of increasing difficulty | 🟡 High |
| **Festival Events** | Seasonal festival activities and mini-games | 🟢 Medium |
| **Random/Repeatable Quests** | Procedural tasks for ongoing engagement — trade requests, repair jobs, bounties | 🟢 Medium |

### 8.3 Dialogue & Writing
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **NPC Personality Profiles** | Detailed personality, speech patterns, likes/dislikes, backstory for each NPC | 🔴 Critical |
| **Dialogue Trees** | Branching conversation scripts for all major interactions | 🟡 High |
| **Seasonal/Daily Dialogue** | Ambient NPC dialogue that changes with season, weather, story progress, relationship level | 🟡 High |
| **Heart Events** | Romance milestone scenes — discovery, courtship, commitment | 🟡 High |
| **Lore Entries** | Discoverable text — Old World documents, journal entries, data core logs | 🟢 Medium |

---

## 10. PHASE 9: SOUND & MUSIC DIRECTION

### 9.1 Music
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Musical Identity Document** | The game's sonic identity — instruments, mood, genre blend. Think: acoustic warmth (guitar, piano, strings) + steampunk industrial textures (metallic percussion, steam hisses, gear clicks) | 🔴 Critical |
| **Main Theme** | The iconic melody — heard on title screen and key moments. Should evoke hope and determination | 🔴 Critical |
| **Coppervale Town Theme** | Warm, cozy, community feel — the "home" music | 🔴 Critical |
| **Workshop Theme** | Upbeat, rhythmic, productive — the "building" music | 🟡 High |
| **Seasonal Variants** | Spring (hopeful), Summer (energetic), Autumn (warm/reflective), Winter (quiet/cozy) versions of town theme | 🟡 High |
| **Exploration Themes** | One per explorable region — mysterious, adventurous, tense depending on danger level | 🟡 High |
| **Combat/Raid Theme** | Intense, urgent — for marauder attacks | 🟡 High |
| **Emotional Themes** | Romance, loss, triumph, discovery — for cutscenes and heart events | 🟢 Medium |
| **Festival Music** | Unique tracks for each seasonal festival | 🟢 Medium |

### 9.2 Sound Effects
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **SFX Categories Document** | Complete categorization of all needed sound effects | 🔴 Critical |
| **Workshop SFX** | Hammering, welding, gears turning, steam releasing, machines powering up | 🔴 Critical |
| **Environmental SFX** | Wind, rain, birds, water, fire crackling, distant machinery | 🟡 High |
| **UI SFX** | Button clicks, menu navigation, notifications, achievements | 🟡 High |
| **Combat SFX** | Weapon impacts, mech footsteps, explosions, shield activations | 🟡 High |
| **NPC SFX** | Vocal grunts/reactions (Harvest Moon style — short, characteristic sounds per NPC) | 🟢 Medium |
| **Ambient Soundscapes** | Per-location ambient loops — town bustle, forest, wasteland wind, ocean waves | 🟢 Medium |

---

## 11. PHASE 10: TECHNICAL ARCHITECTURE

### 10.1 Core Technical Decisions
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Engine & Platform Selection** | Which game engine, target platforms, performance targets | 🔴 Critical |
| **Rendering Pipeline Spec** | How the 2D tile-based world is rendered — layers, camera system, lighting | 🔴 Critical |
| **Data Architecture** | How game data is structured — items, NPCs, quests, machines, saves | 🔴 Critical |
| **State Machine Design** | Game states — title, gameplay, cutscene, menu, combat, building | 🔴 Critical |

### 10.2 System Architecture
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Tile Engine Spec** | How tiles are loaded, rendered, and interacted with — chunk loading, collision, layers | 🔴 Critical |
| **NPC AI System** | Pathfinding, scheduling, interaction triggers, relationship tracking | 🔴 Critical |
| **Crafting/Building System** | Data-driven blueprint system, resource management, build queues | 🔴 Critical |
| **Save System** | What is saved, how, when — world state, inventory, relationships, story progress | 🟡 High |
| **Combat System** | Turn-based vs real-time decision, damage calculation, mech control | 🟡 High |
| **Event System** | How game events (raids, festivals, story triggers) are scheduled and executed | 🟡 High |
| **Mod Support Considerations** | If modding is desired — data-driven design to enable community content | 🟢 Medium |

---

## 12. PHASE 11: ART PRODUCTION PIPELINE

### The Asset Workflow
```
Concept Art → Style Approval → Pixel Art / Tile Creation → Animation → Integration → QA Review
     ↑                                                                                    |
     └────────────────────── Revision Cycle ──────────────────────────────────────────────┘
```

### 11.1 Pipeline Specification
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Asset Naming Convention** | Standardized file naming for all art assets | 🔴 Critical |
| **Sprite Sheet Format Spec** | Exact layout, dimensions, padding for all sprite sheets | 🔴 Critical |
| **Tileset Format Spec** | How tilesets are organized — auto-tile rules, edge matching, variant handling | 🔴 Critical |
| **Animation Frame Spec** | Frame counts, timing, loop rules for all animation types | 🟡 High |
| **Export Settings** | File formats, color depth, compression, transparency handling | 🟡 High |
| **Version Control Protocol** | How art assets are versioned, branched, and merged | 🟡 High |

### 11.2 Style Consistency Tools
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Color Palette Files** | Exact hex/RGB values for all approved palettes — importable into art tools | 🔴 Critical |
| **Template Files** | Pre-configured canvas templates for tiles, sprites, portraits, UI elements | 🟡 High |
| **Style Checker Checklist** | Manual QA checklist for art consistency review | 🟡 High |

---

## 13. PHASE 12: LEVEL DESIGN PIPELINE

### 12.1 Map Construction
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Coppervale Master Layout** | Exact tile-level layout of the entire town and surrounding areas | 🔴 Critical |
| **Interior Layouts** | Room-by-room layouts for all enterable buildings | 🟡 High |
| **Exploration Zone Layouts** | Maps for each explorable area — ruins, forests, mountains, coast | 🟡 High |
| **Event-Triggered Map Changes** | How the map evolves with story progress (new buildings, restored areas, seasonal changes) | 🟢 Medium |

### 12.2 Level Design Process
```
Paper/Digital Sketch → Blockout (Gray Tiles) → Art Pass (Real Tiles) → Object Placement → 
NPC Placement → Trigger/Event Placement → Lighting Pass → Playtest → Polish
```

| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Level Design Template** | Standardized process document for building any game area | 🔴 Critical |
| **Blockout Tileset** | Simple placeholder tiles for rapid prototyping of layouts | 🟡 High |
| **Object Placement Guide** | Rules for prop density, clutter, readability, performance | 🟡 High |
| **Collision Map Standards** | How walkable vs blocked areas are defined and tested | 🟡 High |

---

## 14. PHASE 13: TESTING & QA PROCESS

### 13.1 Testing Categories
| Test Type | Description | When |
|-----------|-------------|------|
| **Art Consistency Review** | Does every asset match the style guide? | After each art batch |
| **Tile Seam Testing** | Do tiles connect seamlessly? No visible grid lines? | After tileset completion |
| **Gameplay Loop Testing** | Is the daily cycle fun? Balanced? Not tedious? | After core systems |
| **Balance Testing** | Are resources, difficulty, progression curves fair? | Ongoing |
| **NPC Behavior Testing** | Do NPCs follow schedules? React correctly? No broken dialogue? | After NPC implementation |
| **Combat/Defense Testing** | Are raids fun? Challenging but fair? Mechs satisfying? | After combat system |
| **Performance Testing** | Frame rate, load times, memory usage | Ongoing |
| **Narrative Testing** | Story coherence, quest flow, dialogue quality | After narrative implementation |
| **Save/Load Testing** | Does everything save and restore correctly? | After save system |

### 13.2 QA Deliverables
| Deliverable | Description | Priority |
|-------------|-------------|----------|
| **Test Plan Document** | Comprehensive testing strategy for each phase | 🟡 High |
| **Bug Tracking System** | Chosen tool and workflow for reporting/tracking bugs | 🟡 High |
| **Playtest Protocol** | How internal and external playtests are conducted and feedback collected | 🟢 Medium |
| **Acceptance Criteria** | Per-feature definition of "done" — when is something ready for release? | 🟡 High |

---

## 15. MASTER CHECKLIST

### Pre-Production Complete When:
- [ ] ✅ Phase 1: World Bible, World Map, Town Map
- [ ] Phase 2: Complete GDD with all core systems designed
- [ ] Phase 3: Art Style Guide, Color Palettes, Tile Specs finalized
- [ ] Phase 4: All major character designs complete
- [ ] Phase 5: Core tilesets (Coppervale area) designed and approved
- [ ] Phase 6: Key machine designs (starter mech, workshop equipment, tools) complete
- [ ] Phase 7: HUD, dialogue box, inventory, and crafting UI designed
- [ ] Phase 8: Main story arc, Act structure, and core quest lines written
- [ ] Phase 9: Musical identity defined, main theme composed
- [ ] Phase 10: Engine selected, core architecture designed
- [ ] Phase 11: Art pipeline defined, naming conventions set
- [ ] Phase 12: Coppervale master layout at tile-level complete
- [ ] Phase 13: Test plan written, QA process defined

### Production Ready When:
All critical (🔴) deliverables across all phases are complete and approved.

---

## WHAT THE DJINN RECOMMENDS NEXT

Based on this roadmap, I recommend we tackle **Phase 2 (GDD Core Systems)** and **Phase 3 (Visual Identity)** in parallel:

1. **GDD** — Because every other decision cascades from the game's mechanical design. We need to nail down the workshop/building system, automaton management, and combat/defense before designing the art for those systems.

2. **Visual Identity** — Because the Art Style Guide will be referenced by literally every art asset we create. Locking down tile size, color palettes, and rendering rules early prevents costly rework later.

These two phases can run simultaneously because they inform different downstream work.

---

*Forged by the Djinn, in service to Master Derek*
*This document is a living roadmap — it will be updated as decisions are made and phases are completed.*
