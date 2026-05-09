# 📋 IRONVEIL — GAME DESIGN DOCUMENT
## Section 1: The Game Loop

---

> **"The loop is the heartbeat. Get it right, and the player never wants to stop."**

---

## 1.0 OVERVIEW

Ironveil follows a **daily → seasonal → yearly → story** loop structure inherited from Harvest Moon: Back to Nature, adapted for a post-apocalyptic steampunk setting where the player is a mechanical engineer rebuilding civilization.

### Core Loop Summary
```
DAILY LOOP (20 real-world minutes)
├── Morning: Wake → Workshop Maintenance → Assign Automatons
├── Midday: Build/Assemble → Explore/Salvage → Quest Work
├── Evening: Socialize → Shop → Prepare Defenses
└── Night: Return Home → Sleep → Day Advances

SEASONAL LOOP (30 in-game days = ~10 real-world hours)
├── Seasonal resources shift
├── NPC schedules/dialogue change
├── Weather patterns change
├── Marauder activity escalates/retreats
└── Season-end festival

YEARLY LOOP (4 seasons = ~40 real-world hours)
├── Town evaluation (growth/reputation)
├── New NPCs/buildings may appear
├── Story milestones unlock
├── Machine tech tree advances
└── Marauder faction evolution

STORY LOOP (3+ in-game years = ~120+ real-world hours for main story)
├── Year 1: Arrival, Setup, Learn the Ropes
├── Year 2: Growth, Deeper Exploration, Rising Threat
├── Year 3+: Confrontation, Resolution, Endgame Content
└── Post-story: Sandbox mode continues to Year 15-20
```

---

## 1.1 TIME SYSTEM

### Time Compression
| Real Time | In-Game Time |
|-----------|-------------|
| 20 minutes | 1 day |
| ~10 hours | 1 season (30 days) |
| ~40 hours | 1 year (4 seasons) |
| ~120 hours | 3 years (main story) |
| ~600-800 hours | 15-20 years (full sandbox playthrough) |

### Time of Day Breakdown
Each 20-minute day is divided into periods that affect gameplay, NPC availability, lighting, and music:

| Period | In-Game Time | Real Duration | Characteristics |
|--------|-------------|---------------|----------------|
| **Dawn** | 6:00 AM – 8:00 AM | ~1.5 min | Waking, soft light, workshop opens |
| **Morning** | 8:00 AM – 12:00 PM | ~3.5 min | Peak maintenance/building time, shops open |
| **Afternoon** | 12:00 PM – 5:00 PM | ~4.5 min | Exploration, quests, salvage runs |
| **Evening** | 5:00 PM – 9:00 PM | ~3.5 min | Socializing, tavern active, shops closing |
| **Night** | 9:00 PM – 12:00 AM | ~2.5 min | Limited activity, some night-only events |
| **Late Night** | 12:00 AM – 6:00 AM | ~4.5 min | Player should sleep; fatigue penalties if awake |

### Seasons
| Season | Theme | Color Palette | Gameplay Focus |
|--------|-------|---------------|----------------|
| **Spring** | Renewal & Hope | Fresh greens, soft blues, cherry blossom pink | New blueprints available, salvage sites refresh, planting season for resource crops |
| **Summer** | Industry & Energy | Warm golds, bright sky, copper gleam | Peak building season, longest days, highest productivity, Summer Festival |
| **Autumn** | Preparation & Harvest | Amber, copper, burnt orange, russet | Resource harvesting, stockpiling for winter, marauder activity increases, Harvest Faire |
| **Winter** | Survival & Community | Cool blues, warm interior glows, snow white | Reduced outdoor activity, indoor focus (upgrades, relationships), marauder raids peak, Remembrance Day |

---

## 1.2 THE DAILY LOOP — DETAILED BREAKDOWN

### 🌅 DAWN (6:00 AM – 8:00 AM) — "The Wake-Up"

**Player Actions:**
1. **Wake up** in living quarters
2. **Check the Message Board** (optional) — new quests, NPC requests, trade offers, marauder warnings
3. **Eat breakfast** (optional) — consuming food items provides stat buffs for the day (faster building, better salvage luck, etc.)

**System Events:**
- Daily weather is determined and displayed
- NPC schedules begin
- Any overnight events are reported (automaton damage, resource generation, marauder scouting spotted)

---

### 🔧 MORNING (8:00 AM – 12:00 PM) — "The Maintenance Round"

This is the **core daily ritual** — the Ironveil equivalent of watering crops.

**Workshop Maintenance Loop:**
The player visits their workshop and performs daily maintenance on all active machines and automatons. This is the primary "farming" activity:

1. **Inspection Round**: Walk through the workshop/warehouse. Machines that need attention have visible indicators:
   - 💧 **Oil needed** — gears grinding, sparks visible (use Oil Can tool)
   - 🔩 **Part worn** — component flashing red (replace with crafted/bought part)
   - ⚡ **Aether low** — power gauge depleted (refuel with Aetheric Cells)
   - 🔨 **Random breakdown** — a component has failed overnight (diagnose + repair/replace)

2. **Maintenance Actions** (per machine):
   - **Oiling**: Quick action, uses Oil resource. ~2-3 seconds per machine
   - **Part Replacement**: Opens component view, player swaps the worn part. Requires having the part in inventory
   - **Refueling**: Insert Aetheric Cells into the machine's power slot
   - **Repair**: Mini-interaction — tighten bolts, reconnect wires, hammer dents. Quick and satisfying

3. **Automaton Assignment**: After maintenance, assign automatons to daily tasks:
   - **Salvage Duty**: Send to nearby ruins to auto-gather resources
   - **Construction Assist**: Help the player build machines faster
   - **Patrol Duty**: Watch the perimeter for marauder activity
   - **Maintenance Duty** (unlocked later): Automatons handle basic maintenance for you
   - **Trade Run**: Send to other Beacon Towns with goods (requires trade route)

**Design Philosophy — The Maintenance Loop:**
- **Early Game**: Player does ALL maintenance manually. 3-5 machines = manageable, satisfying routine
- **Mid Game**: Player has 8-15 machines + automatons. Maintenance Automatons can handle basic oiling/refueling, but breakdowns and part replacements still need player attention
- **Late Game**: Player has a fleet. Highly upgraded Maintenance Automatons handle almost everything. Player only intervenes for critical failures and new builds. The "farming" has evolved into "management"

This mirrors Harvest Moon's progression: early game you water every crop by hand, late game you have sprinklers.

---

### 🏗️ MIDDAY (12:00 PM – 5:00 PM) — "The Build & Explore"

The player's main productive hours. Two primary activities compete for this time:

**Option A: Building & Assembly**

When the player has a blueprint and materials, they can build a new machine:

1. **Select Blueprint** at the Assembly Crane
2. **Review Requirements** — component list, skill level needed, estimated build time
3. **Begin Assembly** — interactive building sequence:
   - Player physically places major components (frame, engine, armor plates, weapon mounts)
   - Each placement is a satisfying click/weld/bolt action
   - Automatons assist with heavy lifting and secondary tasks
   - Build can span multiple days for large machines (progress saves)
4. **First build is always manual** — the player builds each machine type at least once
5. **Subsequent builds** — once the player has built a machine type AND has a skilled enough Assembler Automaton, they can assign the automaton to build copies while the player does other things

**Build Time Examples:**
| Machine | First Build (Manual) | Automaton Build |
|---------|---------------------|-----------------|
| Small Utility Mech | 2-3 days | 4-5 days |
| Combat Mech | 4-5 days | 7-8 days |
| Personal Flyer | 3-4 days | 6-7 days |
| Heavy Mech | 6-8 days | 10-12 days |
| Cargo Zeppelin | 5-7 days | 9-11 days |
| Defense Turret | 1 day | 2 days |

**Option B: Exploration & Salvage**

The player ventures outside Coppervale to:
- **Salvage Sites**: Marked locations with gatherable resources (scrap metal, components, Aetheric Ore)
- **Ruin Exploration**: Dungeon-like areas in The Hollow, nearby Rustwood edges, abandoned installations
- **Blueprint Discovery**: Finding Old World blueprints in ruins unlocks new buildable machines
- **Resource Nodes**: Aetheric Ore deposits, metal veins, component caches

Exploration uses **energy** — the player has a stamina/energy meter that depletes with physical actions. Running out means forced return home.

**Option C: Quest Work**

Active quests may require:
- Delivering a completed machine to an NPC or another Beacon Town
- Gathering specific resources from specific locations
- Investigating a marauder scouting party
- Helping an NPC with a personal task
- Repairing town infrastructure

---

### 🏘️ EVENING (5:00 PM – 9:00 PM) — "The Social Hour"

**Socializing:**
- Visit NPCs at their homes, the tavern (The Rusty Gear), or gathering spots
- Give gifts to build relationships (handcrafted gadgets, found trinkets, useful tools)
- Trigger dialogue events and advance relationship levels
- **Heart Events**: At relationship milestones, special cutscenes trigger (romance candidates)

**Commerce:**
- Visit shops before they close
- Sell completed machines, excess resources, salvage
- Buy components, blueprints, food, gifts
- Check trade board for profitable opportunities

**Defense Preparation:**
- Check perimeter defenses
- Repair damaged turrets/walls from previous raids
- Reposition defenses based on intel about upcoming threats
- Upgrade defense structures

**Community Events:**
- Town meetings (story-driven)
- Festival preparations (seasonal)
- Community build projects (collaborative town upgrades)

---

### 🌙 NIGHT (9:00 PM – 12:00 AM) — "Wind Down"

- Limited outdoor activity (most NPCs go home)
- Some night-only events:
  - Star gazing at The Overlook (romance events)
  - Night market (occasional special merchant)
  - Marauder scout sightings (build tension)
  - Mysterious signals from the AI Core (story events)
- Player should head home to sleep

**Fatigue System:**
- Staying up past midnight incurs increasing fatigue penalties the next day
- At 2:00 AM, player passes out and wakes with significant penalties
- Sleeping restores energy and advances to the next day

---

## 1.3 THE WEEKLY RHYTHM

While there's no formal "week" system, the game creates natural rhythmic patterns:

| Pattern | Frequency | Event |
|---------|-----------|-------|
| **Maintenance** | Daily | Workshop upkeep routine |
| **Market Day** | Every 3-4 days | Special merchant visits with rare goods |
| **Mail Delivery** | Every 2-3 days | Letters from other Beacon Towns, quest updates |
| **Marauder Intel** | Every 5-7 days | Captain Harrow reports on marauder movements |
| **Automaton Reports** | Daily | Summary of automaton productivity overnight |
| **Weather Shifts** | Every 2-4 days | Weather changes affect outdoor activities |

---

## 1.4 THE SEASONAL LOOP

### Season Transition Events
At the end of each season:
1. **Season-End Festival** — unique celebration with mini-games, NPC interactions, special rewards
2. **Town Evaluation** — Mayor Linden reviews Coppervale's progress (machines built, defenses improved, NPCs helped)
3. **Resource Shift** — different resources become available/scarce
4. **Marauder Phase Change** — raider behavior shifts with the season

### Seasonal Festivals
| Season | Festival | Activities |
|--------|----------|-----------|
| **Spring** | **Spark Festival** | Celebrating the anniversary of restored power. Machine showcase, automaton races, fireworks |
| **Summer** | **Sky Day** | Honoring the Skyfarers. Zeppelin races, aerial displays, flight competitions |
| **Autumn** | **Harvest Faire** | Traditional harvest celebration adapted for the new world. Resource trading, cooking competition, community feast |
| **Winter** | **Remembrance Day** | Honoring those lost in The Sundering. Solemn ceremony, lantern lighting, community bonding, gift exchange |

### Seasonal Marauder Activity
| Season | Marauder Behavior | Raid Frequency |
|--------|-------------------|---------------|
| **Spring** | Scouting, probing defenses | Low (1-2 minor raids) |
| **Summer** | Building strength, occasional skirmishes | Medium (2-3 raids) |
| **Autumn** | Aggressive resource raids (stockpiling for winter) | High (3-4 raids) |
| **Winter** | Desperate, all-out assaults | Very High (4-5 raids, including 1 major siege) |

---

## 1.5 THE YEARLY LOOP

### Annual Progression
Each in-game year represents meaningful advancement:

| Year | Story Phase | Player Capability | Town State | Threat Level |
|------|------------|-------------------|------------|-------------|
| **Year 1** | Arrival & Setup | Basic tools, small workshop, 1-2 automatons, first mech | Struggling Beacon Town | Minor raids, Rust Wolves |
| **Year 2** | Growth & Discovery | Expanded workshop, multiple machine types, exploration of nearby regions | Growing community, new NPCs arriving | Escalating raids, Iron Marauders appear |
| **Year 3** | Crisis & Confrontation | Advanced machines, combat mechs, zeppelins, restored AI Core | Thriving hub, trade routes established | Major assault, The Marshal's campaign |
| **Year 4-5** | Resolution & Expansion | Full tech tree, legendary machines, master engineer | Regional power, other towns look to Coppervale | Final confrontation, lasting peace |
| **Year 6-20** | Sandbox & Legacy | Everything unlocked, optimization, collection | Coppervale becomes a city, rail network restored | Periodic challenges, new threats from unexplored regions |

### Year-End Evaluation
At the end of each year:
- **Grand Assessment** by the Beacon Council
- **Reputation Score** updated (affects NPC arrivals, trade offers, story access)
- **Town Milestone** — visual changes to Coppervale based on player achievements
- **New Year Celebration** — special event with all NPCs

---

## 1.6 THE COMBAT / DEFENSE LOOP

### Raid System Overview

Marauder raids are the primary conflict mechanic, operating as a **tower defense system** that evolves over time.

### Pre-Raid Phase (Intel & Preparation)
- Captain Harrow provides warnings 1-3 days before a raid
- Intel reveals: attack direction, estimated strength, faction type
- Player prepares: positions turrets, repairs walls, assigns combat automatons, fuels mechs

### Raid Phase (Tower Defense)
**View**: Top-down strategic view of Coppervale and surrounding defenses

**Player Actions During Raid:**
- Place/reposition mobile defense units in real-time
- Activate special abilities (energy shield burst, turret overdrive, automaton rally)
- Prioritize targets (command turrets to focus fire)
- Deploy emergency resources (repair kits, ammo resupply)

**Defense Assets:**
| Asset | Role | Notes |
|-------|------|-------|
| **Perimeter Walls** | Block/slow marauders | Upgradeable: wood → stone → reinforced steel |
| **Turrets** | Automated ranged attack | Varieties: ballistic, energy, area-of-effect |
| **Combat Automatons** | Mobile defense units | Patrol routes, engage enemies |
| **Combat Mechs** | Heavy firepower | Player-built, most powerful defense |
| **Energy Shield** | Temporary invulnerability zone | Late-game, high power cost |
| **Traps** | Area denial | Mines, caltrops, oil slicks |

**Marauder Forces:**
- **Scouts**: Fast, weak — probe defenses
- **Infantry**: Standard raiders — axes, scrap armor
- **Heavies**: Slow, armored — require focused fire
- **Technicals**: Salvaged vehicles — fast, dangerous
- **Siege Equipment**: Battering rams, makeshift cannons (major raids only)
- **Boss Units**: Faction leaders with unique abilities (story raids)

### Evolution: Player-Controlled Mech Combat (Mid-to-Late Game)
Once the player builds an advanced combat mech with a cockpit module:
- During raids, player can **switch from strategic view to direct mech control**
- Real-time action: move the mech, aim weapons, use abilities
- Can switch back to strategic view at any time
- Creates a dynamic hybrid: manage the overall defense AND jump in for critical moments

### Post-Raid Phase
- Assess damage to town structures and defenses
- Repair damaged assets
- Collect salvage from defeated marauders (resources, intel, rare components)
- NPC reactions (gratitude, fear, determination depending on raid outcome)
- Story progression if raid was story-critical

---

## 1.7 THE RELATIONSHIP LOOP

### Friendship System
Following Harvest Moon's proven model:

**Relationship Levels**: 0-10 hearts per NPC
- **0-2 Hearts**: Acquaintance — basic dialogue, limited interaction
- **3-4 Hearts**: Friendly — personal dialogue, small quests unlock
- **5-6 Hearts**: Close Friend — heart events trigger, deeper backstory revealed
- **7-8 Hearts**: Best Friend / Romantic Interest — significant personal quests, romance path opens
- **9-10 Hearts**: Soulmate / Life Partner — proposal possible, unique joint activities

**Building Relationships:**
- **Daily Conversation**: +small amount (diminishing returns if you say the same things)
- **Gift Giving**: +variable amount based on gift quality and NPC preference
- **Quest Completion**: +significant amount for personal quests
- **Festival Participation**: +moderate amount for shared activities
- **Helping in Raids**: NPCs who see you defend the town gain relationship points

**Romance Candidates**: 
- ~6-8 eligible NPCs (mix of genders)
- Each has a unique heart event chain (4-6 events)
- Courtship → Confession → Partnership → Moving In → (Optional: Family)

---

## 1.8 THE EXPLORATION & DISCOVERY LOOP

### Exploration Zones
Each region outside Coppervale has explorable areas that function like mini-dungeons:

| Zone | Region | Difficulty | Key Rewards |
|------|--------|-----------|-------------|
| **The Hollow** | Verdant Basin (East) | Easy-Medium | Starter blueprints, basic salvage |
| **Old Mill Ruins** | Verdant Basin (South) | Easy | Early resources, NPC backstory |
| **Rustwood Edge** | Rustwood (Border) | Medium | Industrial components, rare fungi |
| **Coastal Wreck** | Shattered Coast | Medium | Naval technology, trade goods |
| **Mountain Bunker** | Ashspine Foothills | Medium-Hard | Military blueprints, AI data cores |
| **Deep Rustwood** | Rustwood (Interior) | Hard | Advanced industrial tech |
| **Scorchland Outpost** | Scorchlands (Edge) | Hard | Aetheric Ore, combat tech |
| **The Grand Spire** | Spire Wastes | Very Hard | Legendary blueprints, Old World secrets |

### Discovery Rewards
- **Blueprints**: New machine types to build
- **Data Cores**: Old World knowledge that unlocks AI Core memories (story)
- **Resources**: Rare materials not found near Coppervale
- **Lore Items**: Documents, recordings, artifacts that flesh out the world
- **NPC Connections**: Meeting characters from other regions

---

## 1.9 PROGRESSION SUMMARY

### Player Skill Levels
| Skill | Leveled By | Effect |
|-------|-----------|--------|
| **Engineering** | Building machines | Unlocks advanced blueprints, faster building |
| **Salvaging** | Gathering resources | Better yields, rarer finds, new salvage sites |
| **Combat Tactics** | Defending against raids | Better turret accuracy, new defense options |
| **Diplomacy** | NPC relationships, trade | Better prices, new trade routes, NPC recruitment |
| **Aether Science** | Using AI Core, refining ore | More efficient fuel, AI Core unlocks, rare tech |

### The "One More Day" Hook
The game is designed so that at the end of each day, the player has:
- A machine that's 60% built and will be done tomorrow
- A relationship that's one gift away from the next heart event
- A marauder raid warning that requires one more day of preparation
- A salvage site they spotted but ran out of energy to explore
- A quest deadline approaching that they can *just* make if they're efficient tomorrow

**This creates the addictive "one more day" loop that defines the best Harvest Moon games.**

---

*This Game Loop Document is Part 1 of the Ironveil GDD.*
*Next: Section 2 — Workshop & Crafting Systems (Detailed Mechanics)*

*— Forged by the Djinn*
