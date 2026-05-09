# Ironveil Art Production — Phase 2: Sprites, Portraits, UI & Icons

## Task Overview
Derek has requested four categories of art assets to continue Ironveil's art production:
1. ⚙️ Machine Sprites (Mechs, turrets, zeppelins, defense structures)
2. 🖼️ NPC Portrait Art (dialogue box portraits with multiple expressions)
3. 🖥️ UI Elements (HUD, dialogue boxes, inventory, crafting interface)
4. 🎨 Item Icons (tools, resources, gifts, key items)

## Technical Specifications (from Art Style Guide)
- **Base Tile Size**: 16×16 pixels
- **Render Scale**: 3x (48×48 displayed)
- **Character Sprite Size**: 16×24 pixels (chibi proportions)
- **Large Character Sprites**: 16×32 pixels (portraits/cutscenes)
- **Outline**: 1px dark contextual outline (NOT pure black)
  - Organic: dark brown (#3D2B1F)
  - Mechanical: dark steel (#2C3E50)
- **Shading**: 2-3 tone maximum
- **Anti-aliasing**: None — clean pixel edges
- **Perspective**: Top-down ¾ view

## Deliverables Breakdown

### 1. Machine Sprites
Source: GDD Section 2 (Workshop & Crafting) + Section 3 (Combat & Defense)

**Mechs** (from Machine Catalog, Category 3):
- Scout Walker (2×2 tiles, autonomous)
- Utility Mech (2×3 tiles, player-controlled)
- Combat Mech Mk I (2×3 tiles, arm cannon + stomp)
- Combat Mech Mk II (2×3 tiles, dual cannons + missile pod)
- Heavy Mech (3×4 tiles, gatling + rockets)
- Siege Breaker (3×4 tiles, siege cannon + flamethrower)

**Defense Structures** (from Section 3.3):
- Walls: Wooden Palisade, Stone Wall, Reinforced Wall, Aether-Shielded Wall
- Turrets: Ballistic, Repeater, Energy, Mortar Emplacement, Tesla Coil, Flamethrower
- Traps: Spike Strip, Oil Slick, Concussion Mine, Caltrops, Net Trap, EMP Mine

**Vehicles/Airships** (from Machine Catalog, Category 4):
- Personal Flyer
- Cargo Hauler
- Cargo Zeppelin
- Battle Zeppelin

**Color coding per art style guide**:
- Utility machines: green accents
- Combat machines: red accents
- Transport machines: blue accents
- Aetheric glow (#4FC3F7) on powered machines

### 2. NPC Portrait Art
Source: GDD Section 4 (Relationships & Social)

**Core Cast** (13 characters, multiple expressions each):
- Jack Tomilson (player)
- DEJIN (AI terminal — screen states)
- Spark (energetic mechanic)
- Old Maren (retired engineer)
- Captain Harrow (militia leader)
- Mayor Linden (town leader)
- Pip (child)

**Romance Candidates** (6 characters, more expressions):
- Leera Ashford (adventurous tomboy)
- Michelle Weaver (shy helper)
- Kaydee Voss (bold provocateur)
- Janis Beaumont (untouchable elite)
- Kiery Dalton (gentle survivor)
- Paige Thornton (steadfast widow)

**Expressions per character** (minimum set):
- Neutral, Happy, Sad, Angry, Surprised, Embarrassed/Blushing
- Romance candidates get additional: Flirty, Thoughtful, Vulnerable

**Portrait format**: Bust-up view fitting a dialogue box, ~64×64 to 96×96 pixel portraits at render scale

### 3. UI Elements
Source: Art Style Guide Section 7 + GDD Section 6 (Technical Architecture)

**Steampunk instrument panel aesthetic**:
- Brass/copper borders with visible rivets
- Dark leather backgrounds (#2C1810)
- Cream text (#F0E8D0) on dark backgrounds

**Required UI components**:
- HUD frame (health bar, energy gauge, clock/calendar, mini-map border)
- Dialogue box (brass-bordered panel with portrait slot)
- Inventory grid (bag-style with item slots)
- Crafting interface (blueprint display, component slots, progress gauge)
- Workshop station interfaces (Forge, Workbench, Fabricator, Refinery, Assembly Crane)
- Menu panels (pause menu, journal, map overlay)
- Button states (default copper, hover bright copper, pressed dark copper)
- Gear-shaped heart icons (relationship indicators)
- Notification badges

### 4. Item Icons
Source: GDD Section 2 (Resources + Tools) + Section 4 (Gifts)

**Tools** (6 items):
- Wrench, Welding Torch, Salvage Cutter, Scanner, Oil Can, Power Probe

**Raw Materials** (10 items):
- Scrap Iron, Copper Ore, Timber, Coal, Aetheric Ore, Brass Alloy, Steel Plate, Crystal Quartz, Titanium Scrap, Old World Composites

**Refined Materials** (10 items):
- Iron Ingots, Copper Wire, Copper Pipe, Planks, Steel Beams, Brass Gears, Aetheric Cells, Reinforced Plate, Lens Array, Power Core

**Components** (11 items):
- Basic Frame, Reinforced Frame, Steam Engine (Small), Steam Engine (Large), Aether Engine, Locomotion System, Armor Plating, Weapon Mount, AI Module, Flight System, Cockpit Module

**Gift items** (representative set):
- Rare herbs, medical supplies, books, rare spirits, fabrics/dyes, flowers, salvage gadgets, Old World artifacts

**Data Cores** (5 types by color):
- Standard (blue), Military (red), Scientific (green), Administrative (gold), Classified (black)

**Icon size**: 16×16 pixels (consistent with tile size), displayed at 3x scale
