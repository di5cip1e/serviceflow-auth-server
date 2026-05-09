# 📋 IRONVEIL — GAME DESIGN DOCUMENT
## Section 2: Workshop & Crafting Systems

---

> **"The workshop is the player's kingdom. Every machine that rolls out of those doors is a statement: we will not be broken."**

---

## 2.0 OVERVIEW

The Workshop & Crafting System is the **core gameplay loop** of Ironveil — the mechanical engineering equivalent of Harvest Moon's farming system. The player gathers resources, crafts components, assembles machines, maintains their fleet, and progressively builds a mechanical empire that transforms Coppervale.

### System Flow
```
RESOURCE GATHERING
├── Salvage (exploration)
├── Mining (Aetheric Ore nodes)
├── Trading (merchants, other towns)
└── Automaton harvesting (passive)
        ↓
COMPONENT CRAFTING
├── Forge (metalworking)
├── Component Fabricator (precision parts)
├── Aether Refinery (fuel cells)
└── Workbench (small items, tools)
        ↓
MACHINE ASSEMBLY
├── Select Blueprint
├── Place Components (hands-on)
├── Assembly Crane (large machines)
└── Testing Platform (quality check)
        ↓
DEPLOYMENT
├── Personal Use (exploration, transport)
├── Defense (turrets, combat mechs)
├── Quest Delivery (build for NPCs/towns)
├── Sale (profit)
└── Town Infrastructure (community builds)
        ↓
MAINTENANCE
├── Daily oiling & fueling
├── Part replacement (wear & tear)
├── Breakdown repair (random failures)
└── Upgrade installation
```

---

## 2.1 RESOURCES

### Resource Categories

#### Tier 1: Raw Materials (Gathered/Mined)
| Resource | Source | Rarity | Usage |
|----------|--------|--------|-------|
| **Scrap Iron** | Salvage sites, ruins | Common | Basic structural components |
| **Copper Ore** | Mining nodes, cave deposits | Common | Pipes, wiring, decorative elements |
| **Timber** | Forest areas, lumber operations | Common | Frames, handles, structural support |
| **Coal** | Mining nodes, trade | Common | Forge fuel, basic power |
| **Aetheric Ore (Raw)** | Ore deposits, deep exploration | Uncommon | Refined into fuel cells and power cores |
| **Brass Alloy** | Salvage, trade | Uncommon | Precision parts, gears, instruments |
| **Steel Plate** | Heavy salvage, industrial ruins | Uncommon | Armor, heavy structural components |
| **Crystal Quartz** | Cave deposits, Scorchlands glass fields | Rare | Lenses, sensors, precision instruments |
| **Titanium Scrap** | Military ruins, marauder salvage | Rare | Advanced armor, lightweight frames |
| **Old World Composites** | Spire Wastes, deep bunkers | Very Rare | Legendary machine components |

#### Tier 2: Refined Materials (Processed from Raw)
| Material | Created From | Station | Usage |
|----------|-------------|---------|-------|
| **Iron Ingots** | Scrap Iron × 3 | Forge | Standard structural parts |
| **Copper Wire** | Copper Ore × 2 | Workbench | Electrical connections, circuits |
| **Copper Pipe** | Copper Ore × 3 | Forge | Steam systems, fluid transport |
| **Planks** | Timber × 2 | Workbench | Frames, platforms, housing |
| **Steel Beams** | Steel Plate × 2 + Coal × 1 | Forge | Heavy frames, reinforcement |
| **Brass Gears** | Brass Alloy × 2 | Component Fabricator | Mechanical transmission, precision |
| **Aetheric Cells** | Aetheric Ore × 3 | Aether Refinery | Standard fuel/power source |
| **Reinforced Plate** | Steel Plate × 2 + Titanium × 1 | Forge | Advanced armor |
| **Lens Array** | Crystal Quartz × 2 + Brass × 1 | Component Fabricator | Sensors, targeting, optics |
| **Power Core** | Aetheric Ore × 5 + Old World Composites × 1 | Aether Refinery | High-capacity energy source |

#### Tier 3: Components (Assembled from Refined Materials)
| Component | Created From | Station | Usage |
|-----------|-------------|---------|-------|
| **Basic Frame** | Iron Ingots × 4 + Planks × 2 | Workbench | Small machine structure |
| **Reinforced Frame** | Steel Beams × 4 + Iron Ingots × 2 | Forge | Medium/large machine structure |
| **Steam Engine (Small)** | Copper Pipe × 4 + Brass Gears × 3 + Iron Ingots × 2 | Component Fabricator | Power source for small machines |
| **Steam Engine (Large)** | Copper Pipe × 8 + Brass Gears × 6 + Steel Beams × 4 | Assembly Crane | Power source for large machines |
| **Aether Engine** | Power Core × 1 + Brass Gears × 4 + Copper Wire × 6 | Component Fabricator | Advanced power source |
| **Locomotion System** | Brass Gears × 4 + Iron Ingots × 3 + Copper Wire × 2 | Component Fabricator | Legs/wheels/tracks for machines |
| **Armor Plating** | Reinforced Plate × 4 + Iron Ingots × 2 | Forge | Protection for combat machines |
| **Weapon Mount** | Steel Beams × 2 + Brass Gears × 2 + Copper Wire × 3 | Component Fabricator | Attach weapons to machines |
| **AI Module** | Lens Array × 1 + Copper Wire × 8 + Crystal Quartz × 2 | Component Fabricator | Automaton intelligence |
| **Flight System** | Brass Gears × 6 + Copper Pipe × 8 + Aetheric Cells × 4 | Assembly Crane | Enables airship/zeppelin flight |
| **Cockpit Module** | Lens Array × 2 + Steel Beams × 3 + Copper Wire × 4 | Component Fabricator | Player-controllable mech |

---

## 2.2 WORKSHOP STATIONS

The player's workshop contains multiple crafting stations, each handling different types of work. Stations can be **upgraded** to unlock higher-tier recipes and improve efficiency.

### The Workbench
**Purpose**: Small items, tools, basic components, repairs
**Starting Level**: Available from Day 1

| Level | Unlocks |
|-------|---------|
| **Lv.1 (Starter)** | Basic tools, copper wire, planks, simple repairs |
| **Lv.2 (Improved)** | Improved tools, basic frames, small components |
| **Lv.3 (Advanced)** | Advanced tools, precision components, complex repairs |

**Interaction**: Player walks up, selects recipe from menu, watches brief crafting animation, receives item.
**Time**: Instant to 30 seconds (in-game time) depending on complexity.

### The Forge
**Purpose**: Metalworking — ingots, beams, plates, armor, heavy components
**Starting Level**: Available from Day 1 (basic), requires coal fuel

| Level | Unlocks |
|-------|---------|
| **Lv.1 (Basic Forge)** | Iron ingots, copper pipe, basic steel work |
| **Lv.2 (Industrial Forge)** | Steel beams, reinforced plate, brass alloy processing |
| **Lv.3 (Master Forge)** | Titanium work, Old World composite processing, legendary components |

**Interaction**: Player places raw materials in input tray, activates forge (stokes fire animation), waits for processing. Multiple items can queue.
**Time**: 1-3 in-game hours per batch. Player can leave and return.
**Fuel**: Consumes coal. Higher levels use Aetheric Cells for cleaner, faster processing.

### The Component Fabricator
**Purpose**: Precision parts — gears, engines, AI modules, electronics
**Unlocked**: Early-game quest (repairing a salvaged fabricator)

| Level | Unlocks |
|-------|---------|
| **Lv.1 (Salvaged)** | Brass gears, small steam engines, basic locomotion |
| **Lv.2 (Rebuilt)** | AI modules, weapon mounts, lens arrays, medium engines |
| **Lv.3 (Restored)** | Aether engines, cockpit modules, flight systems, advanced AI |

**Interaction**: Technical interface — player selects component, sees schematic diagram, places required materials in slots, initiates fabrication.
**Time**: 2-6 in-game hours. Complex components may take a full day.

### The Aether Refinery
**Purpose**: Processing Aetheric Ore into usable fuel cells and power cores
**Unlocked**: Story quest in mid-Year 1 (recovering refinery blueprints)

| Level | Unlocks |
|-------|---------|
| **Lv.1 (Crude)** | Basic Aetheric Cells (low efficiency — 3 ore → 1 cell) |
| **Lv.2 (Standard)** | Standard Aetheric Cells (2 ore → 1 cell), small power cores |
| **Lv.3 (Advanced)** | High-efficiency cells (1 ore → 1 cell), large power cores, Aether-infused materials |

**Interaction**: Player feeds raw ore into the refinery, sets processing mode, refinery hums and glows. Produces fuel cells over time.
**Visual**: The refinery is one of the most visually impressive workshop stations — glowing purple ore → processing → bright blue fuel cells. Steam and light effects.

### The Assembly Crane
**Purpose**: Assembling large machines from components — mechs, zeppelins, heavy equipment
**Starting Level**: Available from Day 1 (it's the workshop's central feature)

| Level | Unlocks |
|-------|---------|
| **Lv.1 (Basic Crane)** | Small machines (utility mech, turrets, small automaton) |
| **Lv.2 (Heavy Crane)** | Medium machines (combat mech, personal flyer, large automaton) |
| **Lv.3 (Grand Crane)** | Large machines (heavy mech, cargo zeppelin, battle zeppelin) |

**Interaction**: This is the **main event** — the hands-on assembly experience described in Section 2.3.

### The Testing Platform
**Purpose**: Testing completed machines before deployment
**Unlocked**: Mid-game upgrade

**Interaction**: Player places completed machine on the platform. Runs diagnostic sequence. Reveals:
- **Quality Rating** (affects performance and durability)
- **Hidden Defects** (can be fixed before deployment)
- **Efficiency Score** (how well the machine uses fuel)

Quality is affected by:
- Player's Engineering skill level
- Component quality (higher tier = better base quality)
- Whether the player rushed or took care during assembly
- Random variance (small, but present)

---

## 2.3 THE ASSEMBLY EXPERIENCE

This is the **signature interaction** of Ironveil — the moment the player builds a machine with their own hands.

### First Build (Always Manual)

When the player builds a machine type for the **first time**, they go through a full hands-on assembly process:

#### Step 1: Blueprint Selection
- Player approaches the Assembly Crane
- Opens Blueprint Menu — shows all discovered blueprints
- Each blueprint shows: machine preview, required components, estimated build time, required Engineering skill level
- Player selects a blueprint and confirms

#### Step 2: Component Placement
The camera zooms to show the machine being built in an **interactive assembly view**:

- The machine's frame is placed on the crane platform
- Player sees **component slots** highlighted on the frame
- Each slot is labeled: "Engine Bay", "Left Arm", "Right Arm", "Armor Plate", "Power Core", "Cockpit", etc.
- Player selects each slot and places the required component from inventory
- Each placement triggers a **satisfying build animation**:
  - *Click* — bolts tighten
  - *Hiss* — steam connections seal
  - *Clang* — armor plates lock into place
  - *Hum* — power core activates
  - *Whirr* — gears engage

#### Step 3: Multi-Day Builds
Large machines can't be completed in a single day:

| Machine Size | Build Days (First Build) | Components to Place |
|-------------|------------------------|-------------------|
| **Small** (turret, small automaton) | 1 day | 3-5 components |
| **Medium** (utility mech, personal flyer) | 2-3 days | 6-10 components |
| **Large** (combat mech, cargo zeppelin) | 4-6 days | 12-18 components |
| **Massive** (heavy mech, battle zeppelin) | 6-8 days | 18-25 components |

- Progress saves between days
- Player can work on other things and return
- Each day of building uses a portion of the midday time block
- Automatons assist (reducing build time if assigned to Construction Assist)

#### Step 4: Completion & Testing
- Final component placed → completion cutscene
- Machine powers up for the first time (dramatic moment — lights, steam, engine roar)
- Optional: Test on the Testing Platform for quality rating
- Machine is now available for deployment

### Subsequent Builds (Automaton-Assisted)

After the player has built a machine type once AND has a skilled enough Assembler Automaton:

- Player selects blueprint + assigns automaton
- Automaton builds the machine over time (takes ~1.5x longer than manual)
- Player can check progress daily
- Quality is slightly lower than manual builds (incentivizes manual for important machines)
- Player can intervene at any point to take over manually

**Design Philosophy**: The first build is a **memorable experience**. Subsequent builds are **convenient**. The player always has the choice to build manually for better quality or delegate for time savings.

---

## 2.4 THE BLUEPRINT SYSTEM

### Blueprint Discovery
Blueprints are found through:

| Source | Blueprint Types | Rarity |
|--------|----------------|--------|
| **Starting Kit** | Basic tools, small automaton, utility mech | Guaranteed |
| **NPC Quests** | Specific machines for quest lines | Guaranteed (quest reward) |
| **Salvage Sites** | Various utility and exploration machines | Common-Uncommon |
| **Ruin Exploration** | Combat machines, advanced tech | Uncommon-Rare |
| **Old World Data Cores** | Legendary machines, unique designs | Rare-Very Rare |
| **Guild Research** | Specialized machines per guild | Earned through guild reputation |
| **Trade** | Blueprints from other Beacon Towns | Uncommon (requires trade routes) |
| **The AI Core** | Recovered from memory fragments as AI Core is repaired | Story-gated |

### Blueprint Tiers
| Tier | Color Code | Access | Examples |
|------|-----------|--------|---------|
| **Common (Tier 1)** | White | Starting/Early Game | Basic tools, small automaton, utility mech |
| **Uncommon (Tier 2)** | Green | Mid Year 1 | Combat mech, personal flyer, defense turret |
| **Rare (Tier 3)** | Blue | Year 2+ | Heavy mech, cargo zeppelin, advanced automaton |
| **Epic (Tier 4)** | Purple | Year 3+ | Battle zeppelin, siege mech, AI-enhanced automaton |
| **Legendary (Tier 5)** | Gold | Late Game/Secret | Old World replicas, unique designs, prototype tech |

### Blueprint Upgrades
Each blueprint can be **upgraded** through research and experimentation:

- **Mark I** (Base): Standard version as discovered
- **Mark II** (Improved): Better stats, slightly different appearance, requires upgrade research
- **Mark III** (Advanced): Significantly better, visual upgrade (more polished, extra details), requires rare materials
- **Mark IV** (Masterwork): Best possible version, unique visual flair, requires Old World components

Upgrades are researched at the AI Core terminal using data cores and the player's Engineering skill.

---

## 2.5 THE MACHINE CATALOG

### Category 1: Tools
The player's personal equipment — the steampunk equivalent of Harvest Moon's farming tools.

| Tool | Function | Upgrades | Notes |
|------|----------|----------|-------|
| **Wrench** | General repair, bolt-tightening, maintenance | Speed, durability | Used daily — the "watering can" of Ironveil |
| **Welding Torch** | Metal joining, advanced repairs | Heat, precision | Used for forge work and machine assembly |
| **Salvage Cutter** | Breaking down salvage into components | Efficiency, material yield | Used during exploration |
| **Scanner** | Detecting resources, analyzing machines, identifying blueprints | Range, detail level | Essential for exploration |
| **Oil Can** | Daily machine lubrication | Capacity, efficiency | Used every morning — core maintenance tool |
| **Power Probe** | Checking/managing Aetheric power levels | Accuracy, recharge function | Used for refueling and diagnostics |

### Category 2: Automatons
The player's robot workforce — the "farm animals" of Ironveil, but smarter.

| Automaton | Role | Size | Key Stats |
|-----------|------|------|-----------|
| **Worker Bot** | General labor — carrying, cleaning, basic tasks | Small (1 tile) | Speed, carry capacity |
| **Salvage Bot** | Autonomous resource gathering | Small (1 tile) | Efficiency, range, storage |
| **Builder Bot** | Assists with machine assembly | Medium (1-2 tiles) | Skill level, speed |
| **Maintenance Bot** | Handles daily machine upkeep | Small (1 tile) | Thoroughness, speed |
| **Patrol Bot** | Perimeter surveillance | Small (1 tile) | Detection range, alert speed |
| **Combat Bot** | Armed defense unit | Medium (2 tiles) | Damage, armor, AI quality |
| **Trade Bot** | Automated trade runs to other towns | Medium (2 tiles) | Carry capacity, speed, diplomacy |

**Automaton Personality System:**
Each automaton develops a simple "personality" over time based on their tasks:
- **Diligent**: Works faster, rarely breaks down (from consistent maintenance assignments)
- **Curious**: Finds rare items more often (from salvage/exploration assignments)
- **Loyal**: Fights harder in defense (from patrol/combat assignments)
- **Friendly**: Better trade deals (from trade assignments)

These personalities are shown through subtle visual cues (paint wear patterns, accessories, idle animations) and minor stat bonuses.

### Category 3: Mechs
Bipedal/quadrupedal walking machines — the game's flagship technology.

| Mech | Role | Size | Crew | Key Features |
|------|------|------|------|-------------|
| **Scout Walker** | Fast exploration, light salvage | Small (2×2 tiles) | 0 (autonomous) or 1 | Speed, sensor range |
| **Utility Mech** | Construction, heavy lifting, transport | Medium (2×3 tiles) | 1 (player) | Carry capacity, tool mounts |
| **Combat Mech** | Defense against marauders | Medium (2×3 tiles) | 1 (player) | Weapons, armor, speed |
| **Heavy Mech** | Major construction, heavy combat | Large (3×4 tiles) | 1 (player) | Maximum armor/weapons, slow |
| **Siege Breaker** | Destroying marauder fortifications | Large (3×4 tiles) | 1 (player) | Massive damage, very slow |

### Category 4: Airships & Vehicles
Aerial and ground transportation.

| Vehicle | Role | Size | Key Features |
|---------|------|------|-------------|
| **Personal Flyer** | Fast travel within the region | Small | Speed, range, 1 passenger |
| **Cargo Hauler** | Ground transport for bulk resources | Medium | Huge carry capacity, slow |
| **Cargo Zeppelin** | Long-distance trade and transport | Large | Massive capacity, inter-region travel |
| **Battle Zeppelin** | Armed aerial defense | Large | Weapons, armor, crew automatons |
| **Rail Engine** | Fixed-route transport (once rail is restored) | Large | Highest capacity, requires track |

### Category 5: Defense Structures
Buildable defense installations for Coppervale.

| Structure | Role | Size | Key Features |
|-----------|------|------|-------------|
| **Wooden Palisade** | Basic wall section | 1 tile wide | Cheap, low durability |
| **Stone Wall** | Standard wall section | 1 tile wide | Moderate durability |
| **Reinforced Wall** | Advanced wall section | 1 tile wide | High durability, expensive |
| **Ballistic Turret** | Ranged defense — physical projectiles | 2×2 tiles | High damage, limited arc |
| **Energy Turret** | Ranged defense — Aether beam | 2×2 tiles | Moderate damage, wide arc, uses fuel |
| **Mortar Emplacement** | Area-of-effect defense | 2×2 tiles | Splash damage, slow fire rate |
| **Energy Shield Generator** | Temporary invulnerability dome | 3×3 tiles | Very expensive, limited duration |
| **Alarm Tower** | Early warning system | 1×1 tile | Detects approaching raiders, extends warning time |
| **Spotlight** | Illuminates night raids | 1×1 tile | Reveals hidden raiders, improves turret accuracy at night |

---

## 2.6 THE MAINTENANCE SYSTEM (DETAILED)

### Daily Maintenance Types

Each active machine has **three maintenance meters** that deplete over time:

| Meter | Depletion Rate | Tool Used | Consequence if Ignored |
|-------|---------------|-----------|----------------------|
| **Lubrication** | -10-15% per day | Oil Can | Gears grind, efficiency drops 20%, eventually jams |
| **Fuel Level** | -5-20% per day (varies by machine) | Aetheric Cells | Machine powers down when empty |
| **Part Condition** | -2-5% per day (random per component) | Wrench + Replacement Part | Component failure — machine offline until repaired |

### Maintenance Interaction Flow
```
Player approaches machine
    ↓
Visual indicators show status:
    💧 Oil droplet icon = needs lubrication
    ⚡ Battery icon = needs fuel
    🔩 Wrench icon = part wearing down
    ⚠️ Warning triangle = critical failure
    ↓
Player uses appropriate tool:
    Oil Can → Quick swipe animation → Lubrication restored
    Aetheric Cell → Insert into power slot → Fuel restored
    Wrench → Open component view → Identify worn part → Replace from inventory
    ↓
Machine status updates → Satisfying "all good" chime
```

### Breakdown Events
Randomly (1-5% chance per day per machine), a component **breaks down**:
- Machine shows ⚠️ warning + sparks/smoke visual
- Player must diagnose the issue (Scanner tool reveals which component failed)
- Player replaces the failed component from inventory
- If player doesn't have the part → machine stays offline until they craft/buy one

**Breakdown Frequency Factors:**
- Machine age (older = more frequent)
- Part quality (higher tier parts = less frequent)
- Maintenance consistency (well-maintained = less frequent)
- Weather (storms increase breakdown chance)
- Overuse (machines used heavily break down faster)

### Maintenance Automation Progression

| Game Stage | Player Maintenance Load | Automaton Help |
|-----------|------------------------|----------------|
| **Early (Year 1, Spring-Summer)** | 3-5 machines, all manual. ~3-4 min real-time | None |
| **Early-Mid (Year 1, Autumn-Winter)** | 5-8 machines. First Maintenance Bot helps with oiling | Bot handles oiling for 2-3 machines |
| **Mid (Year 2)** | 8-15 machines. Multiple Maintenance Bots | Bots handle oiling + refueling. Player handles breakdowns only |
| **Late (Year 3+)** | 15-30+ machines. Advanced Maintenance Bots | Bots handle everything except critical failures. Player = manager |

---

## 2.7 UPGRADE SYSTEM

### Workshop Station Upgrades
Each station upgrade requires:
1. **Resources**: Specific materials for the physical upgrade
2. **Blueprint**: Found through exploration or purchased
3. **Engineering Skill**: Minimum level requirement
4. **Build Time**: 1-3 days of active construction

### Machine Upgrades
Individual machines can be upgraded after construction:

| Upgrade Type | Effect | How |
|-------------|--------|-----|
| **Armor Upgrade** | +defense | Install better armor plates |
| **Engine Upgrade** | +speed or +efficiency | Swap engine component |
| **Weapon Upgrade** | +damage or new weapon type | Install weapon mount + weapon |
| **AI Upgrade** | +autonomy, +decision quality | Install better AI Module |
| **Fuel Upgrade** | +capacity, slower depletion | Install larger/better fuel system |
| **Cosmetic** | Visual customization | Paint jobs, decals, accessories |

### Town Infrastructure Upgrades
The player can build machines/structures that upgrade Coppervale itself:

| Project | Effect | Requirements |
|---------|--------|-------------|
| **Power Grid Expansion** | Powers more buildings, enables new facilities | Aether Engine + materials |
| **Water Purifier** | Clean water for town, crop growth boost | Machine build + plumbing |
| **Communication Array** | Contact other Beacon Towns, unlock trade | Salvaged tech + construction |
| **Rail Restoration** | Rail service to neighboring towns | Massive multi-season project |
| **Airship Dock** | Zeppelin landing pad, air trade routes | Large construction project |
| **Defense Perimeter** | Full wall circuit around town | Gradual wall construction |
| **Workshop Expansion** | Larger workshop, more stations, more storage | Building materials + labor |

---

## 2.8 ECONOMY & TRADE

### Currency
**Cogs** — small brass gear-shaped coins. The post-war standard currency adopted by Beacon Towns.

### Income Sources
| Source | Reliability | Amount |
|--------|-----------|--------|
| **Machine Sales** | High | 100-5000 Cogs depending on machine |
| **Quest Rewards** | Medium | 50-500 Cogs + items |
| **Trade (selling resources)** | High | Variable market prices |
| **Salvage Sales** | Medium | 10-100 Cogs per load |
| **Defense Bounties** | Seasonal | 200-1000 Cogs for repelling raids |
| **Automaton Trade Runs** | Passive | Small but consistent daily income |

### Expenses
| Expense | Frequency | Amount |
|---------|-----------|--------|
| **Resources (buying)** | As needed | Variable |
| **Tool Repairs** | Occasional | 20-100 Cogs |
| **Station Upgrades** | Major milestones | 500-5000 Cogs + materials |
| **NPC Gifts** | Optional (relationship building) | 10-200 Cogs per gift |
| **Emergency Repairs** | After raids | Variable |

### Trade System
- **Local Merchants**: Available in Coppervale. Stock rotates seasonally
- **Traveling Merchant**: Visits every few days with rare goods
- **Inter-Town Trade**: Unlocked by building Communication Array + establishing trade routes
- **Supply & Demand**: Prices fluctuate based on season, story events, and player's trade volume
- **Automaton Trade Runs**: Player can send Trade Bots to other towns with goods for passive income

---

## 2.9 ENGINEERING SKILL SYSTEM

### Skill Progression
The player's **Engineering Skill** determines what they can build and how well:

| Level | Title | Unlocks | XP Required |
|-------|-------|---------|-------------|
| 1 | **Tinkerer** | Basic tools, small repairs | Starting |
| 2 | **Apprentice** | Workbench Lv.2, basic automatons | 500 XP |
| 3 | **Mechanic** | Forge Lv.2, utility mech, turrets | 1,200 XP |
| 4 | **Engineer** | Component Fabricator Lv.2, combat mech | 2,500 XP |
| 5 | **Senior Engineer** | Aether Refinery Lv.2, personal flyer | 4,500 XP |
| 6 | **Master Engineer** | All stations Lv.3, heavy machines | 7,500 XP |
| 7 | **Chief Engineer** | Blueprint Mark III upgrades, zeppelins | 11,000 XP |
| 8 | **Grand Engineer** | Blueprint Mark IV, legendary blueprints | 16,000 XP |
| 9 | **Architect** | Town-scale projects, unique machines | 22,000 XP |
| 10 | **Master Architect** | Everything. The best of the best. | 30,000 XP |

### XP Sources
| Action | XP Gained |
|--------|-----------|
| **Building a machine (first time)** | 100-500 XP (scales with complexity) |
| **Building a machine (repeat)** | 25-100 XP |
| **Crafting components** | 10-50 XP |
| **Successful maintenance** | 5-15 XP per machine per day |
| **Repairing breakdowns** | 20-80 XP |
| **Completing build quests** | 50-300 XP |
| **Discovering blueprints** | 50-200 XP |
| **Upgrading a station** | 100-300 XP |
| **Research at AI Core** | 30-100 XP |

---

## 2.10 THE AI CORE

The **AI Core** is a damaged Old World artificial intelligence system found in the player's workshop. It serves as:
1. **Advisor**: Provides tips, tutorials, and guidance
2. **Automaton Manager**: Controls and coordinates the player's automaton fleet
3. **Research Terminal**: Unlocks blueprint upgrades and advanced technology
4. **Story Vehicle**: Its recovering memories reveal the truth about The Sundering

### AI Core Repair Progression
| Stage | Status | Unlocks | Trigger |
|-------|--------|---------|---------|
| **Dormant** | Broken, silent | Nothing | Game start |
| **Flickering** | Occasional static, fragments | Basic automaton coordination, hints | Repair quest (Year 1, Spring) |
| **Awakening** | Partial function, personality emerging | Automaton task management, basic research | Story quest (Year 1, Summer) |
| **Functional** | Fully operational for basic tasks | Full automaton control, blueprint research, diagnostics | Story quest (Year 1, Autumn) |
| **Recovering** | Memories returning | Advanced research, Old World knowledge, story revelations | Data Core installations (ongoing) |
| **Restored** | Full Old World capability | Legendary blueprints, complete history, maximum automaton efficiency | Late game achievement |

### AI Core Personality
The AI Core develops a personality as it's repaired:
- **Name**: The player names it (or it chooses its own name from a recovered memory)
- **Voice**: Text-based dialogue with characteristic speech patterns (precise, slightly formal, occasionally confused by gaps in memory)
- **Relationship**: Grows to trust and care about the player
- **Humor**: Dry, analytical humor that becomes warmer over time
- **Conflict**: Struggles with memories of The Sundering — was AI involved in starting the war?

---

*This Workshop & Crafting Systems Document is Part 2 of the Ironveil GDD.*
*Next: Section 3 — Combat & Defense Systems (Detailed Tower Defense Mechanics)*

*— Forged by the Djinn*
