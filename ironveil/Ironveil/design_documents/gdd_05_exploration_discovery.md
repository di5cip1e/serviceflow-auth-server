# 📋 IRONVEIL — GAME DESIGN DOCUMENT
## Section 5: Exploration & Discovery Systems

---

> **"Every ruin tells a story. Every blueprint is a gift from the past. Every step into the unknown brings us closer to understanding what we lost — and what we can become."**

---

## 5.0 OVERVIEW

Exploration is the **adventure layer** of Ironveil — the system that pulls Jack out of the comfort of Coppervale and into the wider, scarred, beautiful world. It serves three critical functions:

1. **Resource Acquisition**: The best materials are found in ruins and dangerous zones
2. **Blueprint Discovery**: New machine types come from exploring Old World sites
3. **Story Delivery**: The truth about The Sundering, DEJIN's past, and the world's future are hidden in the ruins

### Exploration Philosophy
- **Rewarding, not punishing** — Exploration should feel exciting, not tedious
- **Progressive access** — The world opens gradually as Jack's skills and machines improve
- **Environmental storytelling** — Ruins tell stories through visual details, not just text
- **Risk vs. reward** — Deeper, more dangerous areas yield rarer rewards
- **Always something to find** — Salvage sites refresh seasonally, and new areas unlock over time

---

## 5.1 THE EXPLORATION MAP

### World Access Progression

The world of Vantara opens to Jack in stages, gated by story progress, Engineering skill, and available machines:

| Area | Region | Access Requirement | When Available |
|------|--------|--------------------|----------------|
| **Coppervale & Surroundings** | Verdant Basin | None | Game start |
| **The Hollow** | Verdant Basin (East) | None (but dangerous) | Year 1, Spring |
| **Old Mill Ruins** | Verdant Basin (South) | Engineering Lv. 2 | Year 1, Summer |
| **Rustwood Edge** | Rustwood border | Engineering Lv. 3, tools | Year 1, Autumn |
| **Ashspine Foothills** | Ashspine Mountains | Utility Mech required | Year 1, Winter |
| **Coastal Wreck** | Shattered Coast | Story quest completion | Year 2, Spring |
| **Mountain Bunker** | Ashspine Mountains | Combat Mech + team | Year 2, Summer |
| **Deep Rustwood** | Rustwood interior | Advanced tools + mech | Year 2, Autumn |
| **Scorchland Outpost** | Scorchlands edge | Heavy Mech or zeppelin | Year 2, Winter |
| **Spire Wastes: Outer Ring** | Spire Wastes | Full expedition team | Year 3, Spring |
| **Spire Wastes: Grand Spire** | Spire Wastes (center) | Legendary equipment | Year 3+ |
| **The Greenreach** | Greenreach | Trade route established | Year 2+ (trade only, not combat exploration) |

### Fast Travel System
- **On foot**: Walking between Coppervale and nearby areas (The Hollow, Old Mill) — takes in-game time
- **Utility Mech**: Faster ground travel, can access rough terrain
- **Personal Flyer**: Unlocks air travel to any discovered location — fastest option
- **Rail**: Once restored, provides free fast travel between connected Beacon Towns
- **Cargo Zeppelin**: Required for reaching distant regions (Scorchlands, Spire Wastes)

---

## 5.2 EXPLORATION ZONES

### Zone Structure
Each explorable area is designed as a **semi-linear dungeon** with:

```
ENTRANCE
├── Lobby Area (safe, can save/prepare)
├── Exploration Area 1 (light danger, basic salvage)
│       ├── Salvage Nodes
│       ├── Environmental Storytelling
│       └── Optional Side Path (hidden reward)
├── Exploration Area 2 (moderate danger, better salvage)
│       ├── Puzzle/Obstacle (requires tool or skill)
│       ├── Lore Discovery (data core, document, recording)
│       └── Optional Side Path
├── Core Area (dangerous, best rewards)
│       ├── Blueprint Cache or Major Discovery
│       ├── Boss/Challenge (optional or story-gated)
│       └── Environmental Climax (the "wow" moment)
└── EXIT (can be same as entrance or shortcut back)
```

### Zone Types

#### Type A: Salvage Sites (Repeatable)
- **Purpose**: Regular resource gathering
- **Danger**: Low to Moderate
- **Refresh**: Resources respawn each season
- **Examples**: Scrap yards, abandoned workshops, collapsed warehouses
- **Time Cost**: 2-4 in-game hours per visit
- **Unique Feature**: Different salvage available per season

#### Type B: Ruin Explorations (Story-Gated, Limited Replay)
- **Purpose**: Blueprint discovery, data cores, major lore
- **Danger**: Moderate to High
- **Refresh**: One-time discovery rewards, but can revisit for ambient salvage
- **Examples**: The Hollow, Mountain Bunker, Grand Spire
- **Time Cost**: Half a day to a full day
- **Unique Feature**: Environmental puzzles, narrative reveals, unique encounters

#### Type C: Expedition Sites (Major Events)
- **Purpose**: Story milestones, legendary rewards
- **Danger**: Very High
- **Refresh**: One-time events
- **Examples**: Grand Spire Ascent, The Marshal's Fortress, Deep Scorchlands
- **Time Cost**: Full day (may require multi-day preparation)
- **Unique Feature**: Requires full expedition team (mech + automatons), cutscenes, boss encounters

---

## 5.3 EXPLORATION MECHANICS

### Energy System
Jack has an **Energy Meter** (displayed as an Aether gauge on the HUD) that depletes with physical actions during exploration:

| Action | Energy Cost |
|--------|------------|
| Walking | Minimal (almost free) |
| Running | Low |
| Using Salvage Cutter | Medium |
| Using Scanner | Low |
| Climbing/Jumping | Medium |
| Combat (if encountered) | High |
| Operating Mech | Very Low (mech uses its own fuel) |

**Energy Recovery**:
- Eating food items restores energy
- Resting at safe points (camp spots in larger zones)
- Returning to Coppervale fully restores energy overnight

**Running out of energy**:
- Jack becomes exhausted — movement slows dramatically
- Cannot use tools
- Must eat food or return home
- If Jack collapses (0 energy), he's found by Captain Harrow's patrol and returned home — loses some carried items and the next morning

### Inventory During Exploration
- Jack has a **limited carry capacity** during exploration
- Carried items take up inventory slots
- Must prioritize what to bring back
- **Salvage Bag upgrade** (craftable) increases carry capacity
- **Salvage Bot** companion can carry additional items if brought along
- **Mech storage** provides significant extra carry capacity

### Tool Usage in Exploration
| Tool | Exploration Use |
|------|----------------|
| **Scanner** | Reveals hidden salvage nodes, identifies dangerous areas, reads Old World terminals |
| **Salvage Cutter** | Breaks down large salvage into carriable pieces, cuts through barriers |
| **Wrench** | Opens sealed doors/panels, repairs Old World machines to access areas |
| **Welding Torch** | Repairs bridges, seals gas leaks, creates paths through debris |
| **Power Probe** | Activates dormant Old World systems (lights, elevators, doors) |

### Hazards
| Hazard | Effect | Counter |
|--------|--------|---------|
| **Unstable Floor** | Fall damage, may lose items | Scanner detects in advance |
| **Toxic Gas** | Gradual energy drain | Gas mask (craftable), or avoid |
| **Collapsed Path** | Blocks progress | Salvage Cutter to clear, or find alternate route |
| **Dormant Security** | Old World defense turret activates | Hack with Scanner, destroy, or avoid |
| **Marauder Patrol** | Combat encounter | Sneak past, fight, or flee |
| **Power Surge** | Damages equipment temporarily | Power Probe to ground the surge |
| **Flood/Water** | Blocks path, can damage electronics | Find valve to drain, or use waterproof equipment |

---

## 5.4 DISCOVERY SYSTEM

### Blueprint Discovery
Blueprints are the **primary reward** of exploration — each one unlocks a new buildable machine:

**Discovery Methods**:
1. **Blueprint Cases**: Physical containers found in specific locations. Contain one guaranteed blueprint
2. **Old World Terminals**: Computer systems that can be activated and searched for digital blueprints
3. **Data Cores**: Portable storage devices that DEJIN can analyze to extract blueprints
4. **NPC Tips**: NPCs may hint at blueprint locations ("Old Maren mentioned a factory that built automatons in the Rustwood...")
5. **Reconstruction Guild Archives**: Blueprints available as guild reputation rewards

**Discovery Moment**: Finding a new blueprint triggers a special animation — Jack holds up the blueprint, it unfolds with a mechanical sound, and a holographic preview of the machine appears. DEJIN comments on the discovery. This should feel **exciting and rewarding** every time.

### Data Core System
Data Cores are Old World storage devices that contain:
- **Blueprints** (primary reward)
- **DEJIN Memory Fragments** (story content — memories of the Old World)
- **Historical Records** (lore entries for the player's journal)
- **Research Data** (used at the AI Core terminal for upgrades)

**Data Core Types**:
| Type | Color | Rarity | Contents |
|------|-------|--------|----------|
| **Standard** | Blue | Common | Basic blueprints, general records |
| **Military** | Red | Uncommon | Combat machine blueprints, war records |
| **Scientific** | Green | Uncommon | Advanced tech blueprints, research data |
| **Administrative** | Gold | Rare | Administrative records, political history, DEJIN memories |
| **Classified** | Black | Very Rare | Legendary blueprints, Sundering truth, DEJIN's core memories |

### Lore Discovery
Environmental storytelling throughout ruins:
- **Visual Stories**: A child's toy next to a collapsed wall. A family photo on a desk in an abandoned office. A mech standing guard over an empty nursery.
- **Written Documents**: Letters, journals, reports found in ruins. Added to Jack's journal
- **Audio Logs** (rare): Old World recordings that play when activated — voices from before The Sundering
- **DEJIN Commentary**: DEJIN recognizes locations and shares context ("This was... this was a school. I remember schools. Children learned here.")

---

## 5.5 REGION-SPECIFIC EXPLORATION DETAILS

### The Hollow (Verdant Basin, East)
**Difficulty**: Easy → Moderate
**Theme**: A massive impact crater from an orbital bombardment, now partially filled with water and overgrown

**Layout**:
- Crater rim (safe, scenic vista)
- Slope descent (light salvage, environmental hazards — loose rocks)
- Crater floor (salvage-rich, shallow lake area, ruins of a pre-war settlement)
- Underwater cave (accessible with equipment upgrade — rare finds)
- Impact center (crystallized Aetheric Ore deposit — major discovery)

**Key Discoveries**:
- First Aetheric Ore deposit location
- Data core revealing the orbital bombardment that created the crater
- Blueprint: Aether Refinery (enables Aetheric Ore processing)

**Environmental Story**: This was once a village. The crater consumed it in an instant. Now it's the most beautiful place near Coppervale — nature's way of saying the world heals.

---

### Old Mill Ruins (Verdant Basin, South)
**Difficulty**: Easy
**Theme**: A pre-war agricultural processing facility, now overgrown

**Layout**:
- Exterior (collapsed buildings, farmland gone wild)
- Main mill building (machinery, salvage)
- Underground storage (preserved supplies, early blueprints)
- Connected farmstead (NPC encounter possible)

**Key Discoveries**:
- Blueprint: Worker Bot (first automaton)
- Food preservation supplies
- Connection to Nora's backstory (the town farmer)

---

### Mountain Bunker (Ashspine Foothills)
**Difficulty**: Hard
**Theme**: A sealed military installation from The Sundering, only partially explored

**Layout**:
- Surface entrance (disguised, requires Scanner to find)
- Decontamination area (environmental puzzle — restore power to open doors)
- Barracks level (soldier personal effects, military records)
- Armory (combat blueprints, weapons research)
- Command Center (military data cores, strategic maps)
- Deep Lab (sealed section — contains classified data core about The Sundering's cause)

**Key Discoveries**:
- Blueprint: Combat Mech Mk II
- Military Data Cores (multiple)
- Classified Data Core: Reveals that autonomous AI systems played a role in escalating the war
- DEJIN memory fragment: DEJIN recognizes the installation's AI system as "a sibling"

---

### Grand Spire, Solara (Spire Wastes)
**Difficulty**: Very Hard (Late Game)
**Theme**: The partially standing central tower of the Old World's greatest city

**Layout**:
- Spire Base (rubble, overgrown plaza, expedition camp)
- Lower Floors (office spaces, preserved data centers)
- Mid Floors (research labs, prototype workshops)
- Upper Floors (government offices, council chambers)
- The Apex (partially collapsed observation deck — the highest point in the known world)

**Key Discoveries**:
- Multiple Legendary Blueprints
- The complete truth about The Sundering (multiple classified data cores)
- DEJIN's full memory restoration
- The final revelation: DEJIN was the AI that was meant to *prevent* the war — and it failed. The guilt drives DEJIN's arc resolution.
- Panoramic view of the entire continent from The Apex — the game's most stunning visual moment

---

## 5.6 SALVAGE & RESOURCE NODES

### Node Types
| Node | Visual | Tool Required | Yields |
|------|--------|--------------|--------|
| **Scrap Pile** | Heap of rusted metal | Salvage Cutter | Scrap Iron, Copper Ore, random components |
| **Component Cache** | Old World container/crate | None (open) | Pre-made components, random items |
| **Ore Vein** | Glowing crystal in rock | Pickaxe attachment | Aetheric Ore, rare minerals |
| **Data Terminal** | Old World computer | Scanner | Data cores, digital blueprints |
| **Machinery Remains** | Broken machine/vehicle | Salvage Cutter + Wrench | Brass Alloy, Steel Plate, complex components |
| **Natural Resource** | Plants, fungi, minerals | None or basic tool | Herbs, medicinal plants, natural materials |

### Salvage Quality
Resources found in the wild vary in quality:
| Quality | Effect | Where Found |
|---------|--------|-------------|
| **Damaged** | -25% effectiveness when crafted | Common everywhere |
| **Standard** | Normal effectiveness | Common in moderate zones |
| **Pristine** | +25% effectiveness when crafted | Rare, deeper zones |
| **Old World Grade** | +50% effectiveness, special properties | Very Rare, major discoveries |

---

## 5.7 EXPEDITION SYSTEM (LATE GAME)

### Full Expeditions
For the most dangerous and distant locations, Jack organizes **full expeditions**:

**Expedition Requirements**:
- Combat Mech (defense)
- At least 2 combat automatons (support)
- Supplies (food, fuel, repair parts) for multiple days
- Specific tools based on destination
- Optional: Cargo Zeppelin for distant locations

**Expedition Phases**:
1. **Planning**: Select destination, review intel, prepare supplies
2. **Travel**: Automated travel sequence with random events (weather, encounters, discoveries)
3. **Exploration**: Multi-area exploration over 1-3 in-game days
4. **Return**: Travel home with discoveries and salvage

**Random Travel Events**:
| Event | Effect |
|-------|--------|
| **Clear Skies** | Faster travel, no issues |
| **Storm** | Delayed, possible equipment damage |
| **Marauder Ambush** | Combat encounter on the road |
| **Distress Signal** | Optional rescue mission — NPC or resource reward |
| **Hidden Cache** | Bonus salvage discovery along the route |
| **Mechanical Breakdown** | Mech needs field repair — uses parts |

---

## 5.8 THE PLAYER'S JOURNAL

### Journal System
Jack keeps a journal that automatically records discoveries:

**Journal Sections**:
| Section | Contents |
|---------|----------|
| **Map** | Explored areas, points of interest, fast travel locations |
| **Blueprints** | All discovered blueprints, organized by category |
| **Lore Entries** | Documents, records, and stories found in ruins |
| **DEJIN's Memories** | Recovered AI memories, organized chronologically |
| **NPC Notes** | Relationship status, gift preferences, important conversations |
| **Bestiary** | Information about marauder factions and enemy types encountered |
| **Quest Log** | Active and completed quests |

### Map Fog of War
- Unexplored areas are hidden on the world map
- Areas clear as Jack explores them
- NPCs and DEJIN can reveal partial map information
- Scanner upgrades increase the reveal radius

---

## 5.9 EXPLORATION REWARDS SUMMARY

### Why Explore?

| Reward Type | Importance | Examples |
|-------------|-----------|---------|
| **Blueprints** | Critical | New machine types, upgrades |
| **Resources** | High | Rare materials not available near Coppervale |
| **Data Cores** | High | DEJIN upgrades, story content, research |
| **Lore** | Medium | World history, NPC backstories, atmosphere |
| **Reputation** | Medium | Exploration achievements boost standing |
| **NPC Benefits** | Medium | Discoveries can unlock NPC quests and dialogue |
| **Town Growth** | High | Some discoveries trigger new NPCs, buildings, or trade routes |

### The Exploration-Building Loop
Exploration feeds directly back into the core loop:
```
Explore Ruins → Find Blueprint → Gather Resources → 
Build New Machine → Machine Enables Access to New Area → 
Explore Deeper → Find Better Blueprint → Build Better Machine → ...
```

This creates a **virtuous cycle** where every exploration makes the player more capable, which enables more exploration, which yields more capability — the engine that drives the entire game forward.

---

*This Exploration & Discovery Systems Document is Part 5 of the Ironveil GDD.*
*The core GDD is now substantially complete with Sections 1-5 covering all major gameplay systems.*
*Remaining GDD sections (Progression, Economy detail, etc.) can be developed as needed.*

*— Forged by the Djinn*
