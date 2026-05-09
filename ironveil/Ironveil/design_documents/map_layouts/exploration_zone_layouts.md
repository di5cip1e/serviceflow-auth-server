# 🗺️ IRONVEIL — EXPLORATION ZONE LAYOUTS
## Phase 12: Tile-Level Exploration Zone Designs

---

> **"Every ruin tells a story. Every step into the unknown brings us closer to what we lost — and what we can become."**

---

## 1.0 ZONE DESIGN SPECIFICATIONS

### Global Rules
| Property | Value |
|----------|-------|
| **Tile Size** | 16×16 pixels |
| **Perspective** | Top-down ¾ view |
| **Structure** | Semi-linear dungeon: Entrance → Areas 1-3 → Core → Exit |
| **Fog of War** | Unexplored tiles hidden until player enters range (Scanner extends range) |
| **Energy Cost** | Exploration depletes player energy — food restores, collapse = return home |
| **Danger Levels** | Visual cues: green (safe), yellow (caution), red (dangerous) ambient tint |

### Zone Template Structure
```
ENTRANCE / LOBBY (Safe zone — can save, prepare)
    ↓
AREA 1 (Light danger, basic salvage)
    ↓ (+ optional side path)
AREA 2 (Moderate danger, puzzles, lore)
    ↓ (+ optional side path)
CORE AREA (Dangerous, best rewards, boss/challenge)
    ↓
EXIT (Same as entrance or shortcut)
```

### Legend (Used Throughout)
```
Gs = Grass          Dr = Dirt           St = Stone floor
Rk = Rock (blocked) Wt = Water          Br = Bridge
Sn = Sand           Rv = Rubble         Ic = Ice
Tr = Tree           Bh = Bush           Vn = Vine
Cr = Crate/salvage  Nd = Resource node   Dc = Data core location
Tm = Terminal        Hz = Hazard         En = Enemy spawn
Dx = Door (locked)   Do = Door (open)    Tp = Trap
Sv = Save point     Ch = Chest/cache     Bp = Blueprint location
Lv = Lever/switch    Pt = Platform       Ld = Ladder
Ex = Exit trigger    Sp = Spawn (player)  Np = NPC encounter
```

---

## 2.0 THE HOLLOW (rm_the_hollow)
**Region**: Verdant Basin (East of Coppervale)
**Difficulty**: Easy → Moderate
**Theme**: A massive impact crater, now partially filled with water and overgrown
**Tileset**: `ts_grass_spring`, `ts_water`, `ts_war_scars_ruins`
**Access**: Year 1 Spring, no special requirements
**Key Rewards**: Aether Refinery blueprint, Data Core #1

### Layout: 40×50 tiles

```
SECTION: CRATER RIM (Rows 0-10) — ENTRANCE / LOBBY
═══════════════════════════════════════════════════
     0         10        20        30        39
  0: Gs Gs Tr Tr Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Tr Tr Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Tr Tr Gs Gs Gs Gs Gs Gs
  2: Gs Gs Gs Gs Gs Dr Dr Dr Dr Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs
  4: Gs Gs Gs Gs Dr Dr Sv Dr Dr Gs Gs Gs Gs Gs Gs Gs Fe Fe Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs
  6: Gs Gs Gs Dr Dr Dr Dr Dr Dr Dr Gs Gs Gs Gs Fe Vp Fe Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs
  8: Rk Rk Rk Rk Dr Dr Dr Dr Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk
 10: Rk Rk Rk .. .. SLOPE DOWN .. .. Rk Rk Rk Rk Rk Rk Rk .. .. .. SLOPE DOWN .. .. Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk Rk

Key features:
- Sp (Player spawn): (5,4)
- Sv (Save point): (5,4) — campfire with log seats
- Vp (Vista point): (16,6) — fenced overlook, scenic view of crater below
- Two slope paths descend into the crater (cols 4-7 and cols 17-20)

SECTION: SLOPE DESCENT (Rows 10-20) — AREA 1
═══════════════════════════════════════════════
- Narrow switchback paths carved into crater wall
- Loose rock hazards (Hz): 3 locations — player must avoid or use Scanner to detect
- Basic salvage nodes (Nd): 4 scrap piles along the path
- Environmental storytelling: Pre-war settlement foundations visible in crater wall
- Light enemy encounters: 2 En (Freelance Raider scouts, easy)

Key features:
- Path width: 3 tiles (narrow, some single-tile chokepoints)
- Rk walls on both sides
- Hz (loose rocks): Rows 12, 15, 18 — deal damage if stepped on, Scanner reveals
- Nd (salvage): Rows 11, 14, 16, 19 — Scrap Iron, Copper Ore
- En (enemies): Rows 13 (1 Scavenger), Row 17 (1 Raider)

SECTION: CRATER FLOOR (Rows 20-38) — AREA 2
═════════════════════════════════════════════
- Wide open area: 30×18 tiles of mixed terrain
- Shallow lake in center (Wt tiles, 8×6)
- Ruins of pre-war settlement on east side
- Overgrown vegetation: Bh, Vn, wildflowers reclaiming the ruins

Grid (simplified):
  Rows 20-22: Dr Dr Dr .. open ground .. Rv Rv .. Gs Gs Gs
  Rows 23-28: Gs Gs .. Wt Wt Wt Wt .. Gs Rv .. ruins area
  Rows 29-32: Gs Gs .. Wt Wt Wt Wt .. Gs .. .. Cr Cr
  Rows 33-38: Gs Gs Gs .. open ground .. Dr Dr .. rock wall

Key features:
- Lake: Rows 23-32, Cols 12-19 — shallow water (walkable with splash), lily pads
- Ruined settlement: Rows 22-30, Cols 25-35 — crumbled walls, broken floors
  - Cr (salvage crates): 3 locations in ruins
  - Tm (Old World terminal): Row 26, Col 30 — requires Scanner to activate
  - Lore item: "Evacuation Notice" found on wall
- Nd (resource nodes): 5 locations scattered around floor
  - 2× Scrap Iron, 1× Copper Ore, 1× Brass Alloy, 1× herb cluster
- En (enemies): 3 Freelance Raiders patrol the ruins area
- Side path (optional): West wall, Row 25 — narrow tunnel to a hidden cave
  - Contains: Ch (chest) with rare component + lore item

SECTION: IMPACT CENTER (Rows 38-50) — CORE AREA
════════════════════════════════════════════════
- The deepest point of the crater
- Crystallized Aetheric Ore deposit dominates the center (glowing purple, 4×4)
- Data Core #1 location: embedded in the ore deposit
- Increased danger: 2 stronger enemies (Raiders with better equipment)

Grid (simplified):
  Rows 38-40: Rk Rk .. narrow path down .. Rk Rk
  Rows 41-44: St St St .. open cave-like area .. St St
  Rows 44-47: St St .. AO AO AO AO .. St St (Aetheric Ore deposit)
  Rows 47-50: St St .. Dc .. Ch .. St St .. Ex

Key features:
- Aetheric Ore deposit: Rows 44-47, Cols 16-19 — 4×4 glowing crystal formation
  - Nd (mineable): 3 Aetheric Ore (Raw) nodes around the formation
  - Dc (Data Core #1): Center of formation — triggers DEJIN memory cutscene
- Ch (Blueprint chest): Contains Aether Refinery blueprint
- En (enemies): 2 Raiders (stronger variant, guarding the ore)
- Ex (exit shortcut): Row 50 — discovered passage leads back to crater rim
- Visual: The ore casts blue-purple light on surrounding stone tiles
```

---

## 3.0 OLD MILL RUINS (rm_old_mill)
**Region**: Verdant Basin (South of Coppervale)
**Difficulty**: Easy
**Theme**: Pre-war agricultural processing facility, overgrown
**Tileset**: `ts_grass_spring`, `ts_dirt_soil`, `ts_war_scars_ruins`, `ts_decorative_props`
**Access**: Year 1 Summer, Engineering Lv. 2
**Key Rewards**: Worker Bot blueprint, connection to Nora's backstory

### Layout: 30×40 tiles

```
SECTION: EXTERIOR GROUNDS (Rows 0-12) — ENTRANCE
═════════════════════════════════════════════════
- Overgrown farmland: wild crops, collapsed fences, nature reclaiming
- Main mill building visible (large, partially collapsed roof)
- Sp (spawn): Row 2, Col 15
- Sv (save): Row 3, Col 14 — old wagon serves as camp

Key features:
- 4 Nd (herb/plant resources) scattered in overgrown fields
- 1 Np (possible NPC encounter — Nora, if her quest is active)
- Collapsed barn: Rows 4-8, Cols 22-27 — 1 Cr (salvage) inside
- Path leads to mill entrance: Row 12, Col 15

SECTION: MILL INTERIOR — GROUND FLOOR (Rows 12-25) — AREA 1
═══════════════════════════════════════════════════════════════
Size: 20×13 tiles (interior)

     0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19
 12: Wl Wl Wl Wl Wl Wl Wl Do Do Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl
 13: Wl Wd Wd Wd Wd Rv Rv Wd Wd Wd Wd Wd Wd Rv Rv Wd Wd Wd Wd Wl
 14: Wl Wd MG MG MG Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd CB CB Wd Wl
 15: Wl Wd MG MG MG Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd CB CB Wd Wl
 16: Wl Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wl
 17: Wl Wd Cr Cr Wd Wd Wd Wd Wd GR GR Wd Wd Wd Wd Wd Cr Wd Wd Wl
 18: Wl Wd Wd Wd Wd Wd Wd Wd Wd GR GR Wd Wd Wd Wd Wd Wd Wd Wd Wl
 19: Wl Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wl
 20: Wl Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wl
 21: Wl Wl Wl Wl Wl Wl Wl Wl Ld Ld Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl

Key:
  MG = Milling machinery (large, rusted, 3×2) — decorative, scannable for lore
  CB = Conveyor belt (broken, 2×2) — decorative
  GR = Grain storage (large vats, 2×2) — one contains salvageable components
  Cr = Salvage crates (3 total)
  Ld = Ladder down to underground storage

SECTION: UNDERGROUND STORAGE (Rows 25-40) — AREA 2 / CORE
═══════════════════════════════════════════════════════════
Size: 16×15 tiles (underground)

- Cool stone environment, preserved supplies
- Minimal enemies (1 automated security turret — dormant, activates if player triggers)
- Blueprint location: Worker Bot blueprint in sealed cabinet
- Food preservation supplies (Cr × 4)
- Connection to Nora's backstory: her family's name on supply records

Key features:
- Hz (dormant security): Row 30, Col 8 — Old World turret, Scanner can deactivate
- Bp (blueprint): Row 35, Col 10 — sealed metal cabinet, requires Wrench to open
- Dc (lore): Row 33, Col 5 — supply manifest with Nora's family name
- Ch (chest): Row 38, Col 12 — preserved food supplies (valuable trade goods)
- Ex (exit): Row 40 — passage connects back to surface near the farmstead
```

---

## 4.0 RUSTWOOD EDGE (rm_rustwood_edge)
**Region**: Rustwood Forest border (South of Coppervale)
**Difficulty**: Moderate
**Theme**: Dense forest grown over industrial ruins, copper-tinted trees, eerie beauty
**Tileset**: `ts_rustwood_forest`, `ts_vegetation_spring`, `ts_war_scars_ruins`
**Access**: Year 1 Autumn, Engineering Lv. 3, requires tools
**Key Rewards**: Advanced tool blueprints, industrial components

### Layout: 35×45 tiles

```
SECTION: FOREST ENTRANCE (Rows 0-10) — ENTRANCE
════════════════════════════════════════════════
- Dense copper-tinted trees form a canopy (objects_high layer)
- Narrow winding path through undergrowth
- Sp/Sv: Row 2, Col 17 — small clearing with campfire

SECTION: OVERGROWN FACTORY EXTERIOR (Rows 10-25) — AREA 1
══════════════════════════════════════════════════════════
- Factory walls visible through trees, vines covering everything
- 5 Nd (industrial salvage, timber, rare fungi)
- 2 En (Rust Wolf Scouts — fast, light)
- Side path: Row 18, Col 5 — hidden trail to a fungal grove
  - Contains: 3 Medicinal Fungi nodes (rare crafting ingredient)
- Ambient: distant metallic groaning from machines still running on residual power

SECTION: FACTORY INTERIOR (Rows 25-38) — AREA 2
════════════════════════════════════════════════
Interior: 20×13 tiles
- Partially collapsed factory floor
- Trees growing THROUGH the floor and ceiling — nature reclaiming industry
- Assembly line machinery (rusted but scannable for data)
- Puzzle: Restore power to a section by connecting copper pipes (Lv × 3)
  - Requires: Wrench tool + Copper Pipe × 2 from inventory
  - Reward: Opens sealed room with blueprint chest

Key features:
- MG (machinery): 4 large rusted machines (decorative + scannable)
- Hz (toxic pool): Row 30, Cols 8-10 — green liquid, damages if stepped in
- Lv (pipe puzzle): Row 28, Col 15 — connect pipes to restore power
- Dx (powered door): Row 32, Col 18 — opens when puzzle solved

SECTION: SEALED WORKSHOP (Rows 38-45) — CORE
═════════════════════════════════════════════
- Behind the powered door
- Intact Old World workshop — surprisingly preserved
- Bp (blueprints): Advanced tool upgrades (Wrench Mk II, Scanner Mk II)
- Cr (salvage): High-quality industrial components × 5
- Tm (terminal): Factory production logs — lore about pre-war industry
- En (enemies): 2 Rust Wolf Raiders guarding the entrance
- Ex: Back door leads to forest surface shortcut
```

---

## 5.0 ASHSPINE FOOTHILLS (rm_ashspine_foothills)
**Region**: Ashspine Mountains (North of Coppervale)
**Difficulty**: Moderate
**Theme**: Rocky mountain terrain, snow patches, hidden military bunker entrance
**Tileset**: `ts_ashspine_mountains`, `ts_grass_winter`
**Access**: Year 1 Winter, requires Utility Mech
**Key Rewards**: Bunker entrance discovery, rare metals, military salvage

### Layout: 35×40 tiles

```
SECTION: MOUNTAIN PATH (Rows 0-15) — ENTRANCE
═════════════════════════════════════════════
- Rocky switchback trail ascending from Coppervale's north exit
- Narrow paths (2-3 tiles wide) between rock walls
- Snow patches increase with altitude
- Sp/Sv: Row 3, Col 17

Key features:
- 3 Nd (rare metal ore veins in rock walls)
- Hz (unstable ground): 2 locations — collapse if stepped on, Scanner detects
- Wind ambient: strong, howling
- Vista point: Row 8, Col 25 — view of Coppervale far below

SECTION: ALPINE MEADOW (Rows 15-28) — AREA 1
═════════════════════════════════════════════
- Open mountain meadow with scattered boulders
- Old military wreckage (crashed supply vehicle)
- En (enemies): 2 Freelance Raiders (mountain bandits), 1 patrol route

Key features:
- Crashed vehicle: Rows 20-22, Cols 12-16 — 3 Cr (military salvage)
- Nd: 2 Aetheric Ore deposits (exposed by altitude)
- Bh (alpine flowers): Decorative, some harvestable for Michelle's quests

SECTION: BUNKER ENTRANCE (Rows 28-40) — AREA 2 / CORE
═════════════════════════════════════════════════════════
- Hidden in a rock face — requires Scanner to detect the sealed door
- Door is initially unpowerable — this zone just discovers the entrance
- The full Mountain Bunker (rm_mountain_bunker) is a separate, larger zone unlocked in Y2

Key features:
- Dx (sealed bunker door): Row 35, Col 18 — massive, military-grade
  - Scanner reveals: "Structure detected. Military installation. Power offline."
  - Cannot be opened in Y1 — sets up the Y2 quest
- Ch (surface cache): Row 33, Col 10 — hidden military supply box
  - Contains: Titanium Scrap × 2, Military Rations, Signal Flare
- Tm (external terminal): Row 34, Col 20 — partially functional
  - Reveals: Bunker designation "ASHSPINE-7", last log date from The Sundering
- Ex: Return path down the mountain
```

---

## 6.0 MOUNTAIN BUNKER (rm_mountain_bunker)
**Region**: Ashspine Mountains (Interior)
**Difficulty**: Hard
**Theme**: Sealed military installation, partially explored, DEJIN sibling discovery
**Tileset**: `ts_workshop_interior` (adapted), `ts_stone_road`, custom military tiles
**Access**: Year 2 Summer, requires Combat Mech + team
**Key Rewards**: Combat Mech Mk II blueprint, Classified Data Core #4

### Layout: 30×60 tiles (multi-level, vertical progression)

```
LEVEL 1: DECONTAMINATION (Rows 0-15)
═════════════════════════════════════
- Airlock entrance (player must solve power puzzle to open inner doors)
- Clean, sterile environment — stark contrast to the organic world outside
- Lv (power puzzle): Route emergency power from generator to door controls
  - Requires: Power Probe tool + Aetheric Cell × 1
- No enemies on this level

LEVEL 2: BARRACKS (Rows 15-30)
══════════════════════════════
- Soldier quarters: rows of bunk beds, personal lockers, mess hall
- Environmental storytelling: personal effects, letters, photos left behind
  - Lore item: "Letter Home" (Private Thomas Reade)
  - Lore item: Squad photo with names
- 2 En (reactivated security drones — Old World defense, medium difficulty)
- 3 Cr (military supplies: rations, tools, uniform patches)
- Nd: 1 Titanium Scrap deposit

LEVEL 3: ARMORY (Rows 30-45)
════════════════════════════
- Weapons research lab and storage
- Bp (Combat Mech Mk II blueprint): In sealed weapons locker
  - Requires: Wrench + specific keycard found in barracks
- 2 Dc (military data cores): Weapons research logs, combat AI protocols
- 3 En (security drones — harder, armed)
- Hz (trip wire traps): 3 locations — Scanner detects
- Ch (armory chest): Advanced combat components

LEVEL 4: COMMAND CENTER (Rows 45-60) — CORE
═══════════════════════════════════════════
- The heart of the bunker: command screens, strategic maps, communications
- DEJIN sibling discovery: A dormant AI terminal identical to DEJIN's
  - It's offline — permanently. Destroyed by its own refusal to comply
  - Dc (Classified Data Core #4): Contains DEJIN sibling's last moments
  - Triggers major cutscene: DEJIN recognizes the installation
- Tm (strategic map terminal): Reveals Iron Marauder force positions
- Ch (command safe): Contains classified documents, rare Old World composites
- Ex: Emergency exit shaft leads to surface (one-way shortcut out)
```

---

## 7.0 COASTAL WRECK (rm_coastal_wreck)
**Region**: Shattered Coast (West)
**Difficulty**: Moderate
**Theme**: Wrecked Old World naval vessel on a rocky shore
**Tileset**: `ts_shattered_coast`, `ts_water`
**Access**: Year 2 Spring, story quest
**Key Rewards**: Navigation technology, Cargo Zeppelin blueprint

### Layout: 35×40 tiles

```
SECTION: ROCKY SHORE (Rows 0-12) — ENTRANCE
════════════════════════════════════════════
- Jagged coastline, tide pools, sea caves
- Ship wreck visible in background (half-submerged)
- Sp/Sv: Row 3, Col 17

SECTION: SHIP EXTERIOR (Rows 12-25) — AREA 1
════════════════════════════════════════════
- Clambering across the tilted deck of the wrecked warship
- Tilted floor tiles (visual effect — diagonal shading)
- 4 Nd (naval salvage: brass fittings, copper pipe, steel plate)
- 2 En (Tide Reaver scouts — they've been picking over the wreck)
- Hz (unstable deck): 2 sections that collapse if too much weight

SECTION: SHIP INTERIOR (Rows 25-35) — AREA 2
═════════════════════════════════════════════
- Below decks: engine room, navigation room, captain's quarters
- Flooded sections (Wt tiles — waist-deep, slows movement)
- Puzzle: Drain flooded section by finding and turning valve wheel
  - Lv (valve): Row 28, Col 8 — opens drain, reveals navigation room

Key features:
- Navigation room (drained): Contains navigation technology (quest item)
- Captain's quarters: Bp (Cargo Zeppelin blueprint) in captain's safe
- Tm (ship's log terminal): Records of last voyage before The Sundering
- 2 En (Tide Reaver Raiders — tougher, defending their salvage claim)

SECTION: CARGO HOLD (Rows 35-40) — CORE
═══════════════════════════════════════
- Massive cargo bay, partially flooded
- Bulk salvage: 5 Cr (high-value naval components)
- 1 Dc (data core): Naval communications protocols
- Boss: Tide Reaver Captain (mini-boss, arrives by boat)
- Ex: Hole in hull leads to shore (shortcut out)
```

---

## 8.0 DEEP RUSTWOOD (rm_deep_rustwood)
**Region**: Rustwood Forest interior
**Difficulty**: Hard
**Theme**: The heart of the copper forest — functioning automated factory
**Tileset**: `ts_rustwood_forest`, `ts_workshop_interior`
**Access**: Year 2 Autumn, advanced tools + mech
**Key Rewards**: Automated factory access (resource production boost), advanced industrial blueprints

### Layout: 30×50 tiles

```
SECTION: DEEP FOREST (Rows 0-15) — ENTRANCE
════════════════════════════════════════════
- Extremely dense copper-tinted canopy — near darkness
- Bioluminescent fungi provide ambient light (blue-green glow)
- Narrow paths, frequent obstacles requiring Salvage Cutter
- Sp/Sv: Row 3, Col 15

SECTION: FACTORY APPROACH (Rows 15-30) — AREA 1
════════════════════════════════════════════════
- Trees thin as industrial infrastructure appears
- Pipes running along the ground, some still carrying fluid
- Steam vents (Hz): 3 locations — periodic steam bursts deal damage
- 3 En (Rust Wolf Raiders — ambush tactics from trees)
- 4 Nd (high-quality industrial salvage)

SECTION: THE LIVING FACTORY (Rows 30-45) — AREA 2 / CORE
═══════════════════════════════════════════════════════════
Interior: 25×15 tiles
- A functioning automated factory — still producing components on residual Aetheric power
- Machines running, conveyor belts moving, robotic arms assembling
- The player must navigate around active machinery (moving hazards)

Key features:
- Active assembly lines: Moving hazard tiles (timed, pattern-based)
- Control room: Row 38, Cols 10-15 — player can activate/deactivate sections
  - Lv (master control): Shut down dangerous lines, open access to core
- Bp (advanced blueprints): Industrial automation components
- Tm (production terminal): Shows 50 years of unmanned production logs
  - Lore: The factory has been building components for no one, endlessly
- Resource boon: If secured (quest completion), factory provides passive component production
- En: 2 automated security units (factory defense, challenging)
- Ex: Loading dock leads to forest trail back to Rustwood Edge
```

---

## 9.0 SCORCHLAND OUTPOST (rm_scorchland_outpost)
**Region**: Scorchlands edge (East)
**Difficulty**: Hard
**Theme**: The devastated eastern wasteland — Iron Marauder forward base
**Tileset**: `ts_scorchlands`, `ts_war_scars_ruins`
**Access**: Year 2 Winter, Heavy Mech or Zeppelin
**Key Rewards**: Aetheric Ore deposits, combat tech, Marshal intel

### Layout: 40×40 tiles

```
SECTION: WASTELAND APPROACH (Rows 0-12) — ENTRANCE
═══════════════════════════════════════════════════
- Cracked earth, glass fields (sand fused by heat), dust
- The most desolate environment in the game
- Sparse scrubland, no trees, harsh lighting
- Sp/Sv: Row 3, Col 20 — makeshift camp behind rock formation

SECTION: GLASS FIELDS (Rows 12-25) — AREA 1
═══════════════════════════════════════════════
- Vast fields of fused glass — reflective, beautiful, deadly
- Hz (sharp glass): Cuts through basic boots, requires reinforced equipment
- 5 Nd (Aetheric Ore deposits — abundant, pushed to surface by bombardment)
- En: 3 Iron Marauder patrols (organized, tactical)
- Environmental: Heat shimmer visual effect, cracked earth audio

SECTION: ABANDONED OUTPOST (Rows 25-35) — AREA 2
═══════════════════════════════════════════════════
- Former Iron Marauder forward operating base — recently evacuated
- Military tents, supply caches, vehicle wreckage
- Intel documents scattered: troop movements, supply routes, Marshal's orders
- 4 Cr (military supplies: weapons components, fuel, rations)
- Tm (communications terminal): Interceptable messages to/from The Marshal
- Bp: Heavy weapons component blueprints

SECTION: BUNKER CACHE (Rows 35-40) — CORE
══════════════════════════════════════════
- Underground ammunition bunker beneath the outpost
- Heavily trapped (Tp × 5: mines, tripwires)
- En: 2 Iron Marauder guards (elite, stayed behind)
- Ch (main cache): Advanced combat components, Aetheric Cells × 10
- Dc (data core): Marshal's campaign plans — critical story intel
- Ex: Tunnel leads to surface behind a rock formation
```

---

## 10.0 SPIRE WASTES / GRAND SPIRE (rm_spire_wastes, rm_grand_spire)
**Region**: Central-East Vantara
**Difficulty**: Very Hard (Late Game)
**Theme**: The ruins of Solara — humanity's greatest city, shattered
**Tileset**: `ts_spire_wastes`, `ts_stone_road`, custom interior tiles
**Access**: Year 3 Spring, full expedition team
**Key Rewards**: Legendary blueprints, full Sundering truth, DEJIN restoration

### Spire Wastes Outer Ring: 50×50 tiles

```
SECTION: EXPEDITION CAMP (Rows 0-8) — ENTRANCE
═══════════════════════════════════════════════
- Established base camp at the edge of the ruins
- Full expedition support: save, resupply, automaton staging
- Sp/Sv: Row 4, Col 25
- Panoramic view of the ruined city skyline — the Grand Spire looming

SECTION: CITY RUINS (Rows 8-35) — AREAS 1-2
═════════════════════════════════════════════
- Massive area: shattered buildings, overgrown plazas, metro tunnels
- Multiple paths through the ruins (non-linear exploration)
- 8 Nd (Old World salvage — highest quality)
- 5 En (mixed enemies: scavengers, remnant defense systems, Marauder scouts)
- 3 Dc (data cores with Sundering history)
- 2 Bp (rare blueprints from research labs)
- Tm (multiple terminals): University records, government broadcasts, personal logs
- Hz (structural collapse): 3 locations — unstable buildings
- Side areas: Library archive, hospital, government office — each with unique lore

SECTION: GRAND SPIRE BASE (Rows 35-50) — TRANSITION
════════════════════════════════════════════════════
- The base of the Grand Spire tower — massive entrance plaza
- Rubble cleared enough to enter
- Transition to rm_grand_spire interior
```

### Grand Spire Interior: 25×80 tiles (vertical tower, multi-floor)

```
FLOOR 1: LOBBY/ATRIUM (Rows 0-15)
- Grand entrance hall, shattered crystal ceiling, overgrown fountain
- Elevator shaft (non-functional — must climb via stairs)
- 2 Dc, 1 Tm, environmental storytelling

FLOOR 2: DATA CENTERS (Rows 15-30)
- Server rooms, some still humming with residual power
- DEJIN memory fragments intensify here
- Dc (multiple): DEJIN's creation, the arms race, the diplomatic failure

FLOOR 3: RESEARCH LABS (Rows 30-45)
- Where the DEJIN network was designed
- Dr. Voss's office: Lore item "Dr. Voss's Last Entry"
- Bp (Legendary blueprints): Prototype technology
- En: Marshal's advance team (combat encounters)

FLOOR 4: GOVERNMENT CHAMBERS (Rows 45-65)
- Council chambers where the final decisions were made
- Running battle with Marshal's forces
- Dc: The decision to give DEJIN strike authority
- Dc: DEJIN's choice to shut down

FLOOR 5: THE APEX (Rows 65-80) — FINAL CORE
- Partially collapsed observation deck
- The DEJIN network control terminal
- Final confrontation with The Marshal
- Dc #9 (final): DEJIN's full restoration
- Dc #10 (secret, hidden): Found only by thorough exploration
- Vista: Panoramic view of all Vantara — the game's most stunning moment
- Ex: Elevator restored after story completion (fast exit)
```

---

## 11.0 ZONE SUMMARY TABLE

| Zone | Room ID | Size (tiles) | Difficulty | Key Blueprint | Key Data Core | Enemy Types |
|------|---------|-------------|------------|---------------|---------------|-------------|
| The Hollow | `rm_the_hollow` | 40×50 | Easy-Mod | Aether Refinery | #1 (First Light) | Freelance Raiders |
| Old Mill | `rm_old_mill` | 30×40 | Easy | Worker Bot | Lore only | Security drone |
| Rustwood Edge | `rm_rustwood_edge` | 35×45 | Moderate | Tool upgrades | Lore only | Rust Wolves |
| Ashspine Foothills | `rm_ashspine_foothills` | 35×40 | Moderate | Discovery only | Surface lore | Mountain Raiders |
| Mountain Bunker | `rm_mountain_bunker` | 30×60 | Hard | Combat Mech Mk II | #4 (The Sibling) | Security drones |
| Coastal Wreck | `rm_coastal_wreck` | 35×40 | Moderate | Cargo Zeppelin | Naval lore | Tide Reavers |
| Deep Rustwood | `rm_deep_rustwood` | 30×50 | Hard | Industrial auto | Factory lore | Rust Wolves |
| Scorchland Outpost | `rm_scorchland_outpost` | 40×40 | Hard | Heavy weapons | Marshal intel | Iron Marauders |
| Spire Wastes | `rm_spire_wastes` | 50×50 | Very Hard | Legendary ×2 | #5-8 | Mixed |
| Grand Spire | `rm_grand_spire` | 25×80 | Very Hard | Legendary ×3 | #9-10 | Marshal's forces |

---

*This Exploration Zone Layouts Document covers all explorable areas outside Coppervale.*
*Each zone is specified with tile-level detail, enemy placement, puzzle mechanics, and reward locations.*

*— Forged by the Djinn, in service to Master Derek*
