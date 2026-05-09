# 🗺️ IRONVEIL — COPPERVALE MASTER LAYOUT
## Phase 12: Tile-Level Map Design

---

> **"Every tile tells a story. Every path has a purpose."**

---

## 1.0 MAP SPECIFICATIONS

### Dimensions
| Property | Value | Notes |
|----------|-------|-------|
| **Map Width** | 80 tiles (1280 px native) | ~4 screen widths |
| **Map Height** | 60 tiles (960 px native) | ~4 screen heights |
| **Total Tiles** | 4,800 | Manageable for GameMaker |
| **Tile Size** | 16×16 pixels | Per Art Style Guide |
| **Render Scale** | 3x (48×48 displayed) | Per Technical Architecture |
| **Screen Viewport** | 20×15 tiles | Camera follows player |

### Tile Layer Structure (Bottom to Top)
| Layer | Name | Contents |
|-------|------|----------|
| 0 | `ground_base` | Grass, dirt, stone, water — fills every tile |
| 1 | `ground_detail` | Paths, cracks, flowers, puddles, road markings |
| 2 | `shadows` | Building/tree shadows (rendered as semi-transparent tiles) |
| 3 | `objects_low` | Fences, low walls, crops, ground items, flower beds |
| 4 | `objects_mid` | Characters, NPCs, machines, furniture, signs (Y-sorted) |
| 5 | `objects_high` | Rooftops, tree canopy, overhead wires, lamp tops |
| 6 | `weather` | Rain, snow, particles (runtime overlay) |
| 7 | `ui_overlay` | HUD, dialogue boxes (runtime overlay) |

### Coordinate System
- Origin (0,0) = Top-Left corner
- X increases rightward (East)
- Y increases downward (South)
- All coordinates in this document are in TILE units (not pixels)

---

## 2.0 ZONE MAP — OVERVIEW

The town is divided into functional zones. Each zone has a primary terrain type, key buildings, and a distinct feel.

```
    0    5    10   15   20   25   30   35   40   45   50   55   60   65   70   75   80
  0 ┌─────────────────────────────────────────────────────────────────────────────────┐
    │ RIVER  │         OVERLOOK HILL                    │   ASHSPINE FOOTHILLS       │
  5 │ (water)│    (grass, wildflowers, benches)          │     (rocky path north)      │
    │  ~~~   │        ☆ Bench & Viewpoint                │         ↑ EXIT N            │
 10 │  ~~~   ├──────────────────────────────────────────┤─────────────────────────────│
    │  ~~~   │  RESIDENTIAL AREA       │  MARKET DISTRICT        │  THE HOLLOW ROAD  │
 15 │  ~~~   │  (NPC homes, gardens)   │  (shops, stalls)        │  (dirt road east)  │
    │  ~~~   │  Maren's House          │  General Store          │  → EXIT E          │
 20 │  ~~~   │  Spark's Garage         │  Parts Dealer           │  (The Hollow)      │
    │  ~~~   │  Kiery's Shop           │  Food Vendor            │                    │
 25 │  ~~~   │  Paige's Home/Archive   ├─────────────────────────┤  EASTERN FIELDS    │
    │  ~~~   │  Elm's Chapel           │  TOWN SQUARE            │  (defense zone)    │
 30 │  ~~~   │  Linden's Home          │  ⛪ Clocktower           │  Turret positions  │
    │  ~~~   │  Michelle's Home        │  Message Board          │  Wall placements   │
 35 │  ~~~   │  NPC Homes (misc)       │  Benches, Lampposts     │                    │
    │  ~~~   ├─────────────────────────┤                         │                    │
 40 │  ~~~   │  WORKSHOP DISTRICT      │  Rusty Gear Tavern ⚙    │  SOUTHERN TREELINE │
    │  BRIDGE│  ╔═══════════════╗      │  Harrow's Quarters      │  (forest edge)     │
 45 │  ══════│  ║  PLAYER'S     ║      │  Doc Bramble's Clinic   │  ↓ Path to         │
    │        │  ║  WORKSHOP     ║      │  Kaydee's Home (above)  │    Rustwood        │
 50 │  ~~~   │  ║  (large plot) ║      │  Wes's Courier Post     │  EXIT S            │
    │  ~~~   │  ╚═══════════════╝      │  Hank's Smithy          │                    │
 55 │  ~~~   │  Storage Yard           │  Nora's Farm Plot       │  RAIL STATION      │
    │  ~~~   │  Automaton Pen          ├────────────────────────┤  🚂 Platform        │
 60 └────────┴─────────────────────────┴────────────────────────┴─────────────────────┘
         ↑ EXIT W                                                    ↑ EXIT S (Rail)
    (River/Bridge to                                              (Future rail line)
     Shattered Coast)
```

---

## 3.0 ZONE DETAIL — TILE-BY-TILE SPECIFICATIONS

### 3.1 THE OVERLOOK (North — Rows 0-10, Cols 8-55)

**Purpose**: Hilltop viewpoint, romance scenes, quiet reflection, Spark's dreaming spot
**Terrain**: Elevated grass (lighter green variants), wildflower clusters, stone path leading up
**Elevation**: Visually conveyed through tile shading (lighter = higher) — no actual Z-axis

```
Grid (Rows 0-10, Cols 8-55):

Legend:
  G = Grass (base)        Gf = Grass with flowers    Gd = Grass (dark/shadow)
  Sp = Stone path         Sb = Stone bench           Lp = Lamppost
  Fe = Wooden fence       Tr = Tree (canopy)         Tb = Tree (base/trunk)
  Bh = Bush               Wf = Wildflowers           Vp = Viewpoint marker
  -- = Path continuation

Row 0:  G  G  G  Tr Tr G  G  G  G  G  G  G  Tr Tr G  G  G  G  G  G  G  G  G  G  Tr G  G  G  G  G  G  G  Tr Tr G  G  G  G  G  G  G  G  G  G  G  G  G  G
Row 1:  G  G  Tr Tb Tb Tr G  G  G  Gf Gf G  Tb Tb G  G  Gf G  G  G  G  G  G  Gf G  G  G  G  Gf G  G  G  Tb Tb G  G  G  G  G  G  G  G  G  G  G  G  G  G
Row 2:  G  G  G  G  G  G  G  Gf G  Wf Wf Gf G  G  G  Gf Wf Gf G  G  G  Gf G  Wf Gf G  G  Gf Wf Gf G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G
Row 3:  G  G  G  G  Sp Sp Sp Sp Sp Sp G  G  G  G  Gf G  G  G  Gf G  G  G  Gf G  G  G  Gf G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G
Row 4:  G  G  G  Sp G  G  G  G  G  G  Sp G  G  G  G  G  Fe Fe Fe Fe Fe G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G
Row 5:  G  G  Sp G  G  G  Wf Wf G  G  G  Sp G  G  G  Fe Sb G  Vp G  Fe G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G
Row 6:  G  G  Sp G  G  Wf Wf Wf Wf G  G  G  Sp G  G  Fe G  G  Lp G  Fe G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G
Row 7:  G  G  G  Sp G  G  Wf Wf G  G  G  G  G  Sp G  Fe Sb G  G  G  Fe G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G
Row 8:  G  G  G  G  Sp Sp G  G  G  G  G  G  G  G  Sp Fe Fe Fe Fe Fe Fe G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G
Row 9:  G  G  G  G  G  G  Sp Sp Sp Sp Sp Sp Sp Sp Sp -- -- -- -- -- -- Sp Sp Sp Sp G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G
Row10:  G  G  G  G  G  G  G  G  G  G  G  G  G  G  Sp G  G  G  G  G  G  G  G  G  G  Sp G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G  G
```

**Key Features**:
- Fenced viewpoint area (cols 15-20, rows 4-8) with 2 benches, 1 lamppost, viewpoint marker
- Wildflower meadow on approach (cols 6-9, rows 2-7)
- Single stone path winds up from town (connects at row 9-10 heading south)
- Trees frame the edges for a natural canopy feel
- **NPC Positions**: Spark (evening, row 5 col 18), Romance candidates (night events, viewpoint)

---

### 3.2 RIVER & WESTERN EDGE (West — Rows 0-60, Cols 0-7)

**Purpose**: Natural western boundary, fishing spot, bridge crossing, zeppelin dock area
**Terrain**: Water tiles (animated), riverbank grass, bridge (stone/wood)

```
Key Features (Col 0-7):
- Cols 0-3: Deep water (impassable)
- Cols 4-5: Shallow water / riverbank transition
- Cols 6-7: Grass bank with occasional reeds, fishing spots
- Row 42-44: BRIDGE — stone/wood construction, 3 tiles wide, connects to west exit
- Row 55-58: ZEPPELIN DOCK — small wooden platform extending over water (post-game)

Bridge Detail (Rows 42-44, Cols 0-7):
  Row 42: Wt Wt Wt Br Br Br Sp Sp    (Wt=water, Br=bridge plank, Sp=stone path)
  Row 43: Wt Wt Wt Br Br Br Sp Sp
  Row 44: Wt Wt Wt Br Br Br Sp Sp
```

**Collision**: Water tiles are impassable. Bridge tiles are walkable. Riverbank has 1-tile walkable strip.

---

### 3.3 RESIDENTIAL AREA (Northwest — Rows 10-38, Cols 8-28)

**Purpose**: NPC homes, gardens, character interactions, daily routine pathways
**Terrain**: Grass base with dirt paths between houses, small gardens, fences

**Building Footprints** (exterior only — interiors are separate rooms):

| Building | Position (Top-Left Tile) | Size (W×H tiles) | Door Tile | Notes |
|----------|-------------------------|-------------------|-----------|-------|
| Old Maren's House | (10, 12) | 5×4 | (12, 15) | Small, cozy, flower garden out front |
| Spark's Garage | (10, 18) | 6×4 | (13, 21) | Larger, chimney smoking, parts scattered |
| Kiery's Shop | (18, 10) | 5×4 | (21, 12) | Fabric display in window, flower boxes |
| Paige's Home/Archive | (18, 18) | 6×5 | (22, 21) | Larger building, "ARCHIVE" sign, book cart |
| Pastor Elm's Chapel | (26, 10) | 5×5 | (29, 12) | Small steeple, garden with memorial stones |
| Mayor Linden's Home | (26, 18) | 5×4 | (29, 20) | Well-maintained, Coppervale flag |
| Michelle's Home | (32, 10) | 4×4 | (35, 12) | Greenhouse attached (2×3 glass structure) |
| Misc NPC Homes ×3 | (32, 18), (32, 23), (36, 10) | 4×3 each | South-facing doors | Background NPC residences |

**Path Network**:
- Main north-south dirt path: Col 15, Rows 10-38
- Main east-west dirt path: Row 25, Cols 8-28
- Smaller paths branch to each house entrance
- Garden plots between houses (2×2 flower/vegetable patches)

**Decorative Elements**:
- Lampposts every 8 tiles along main paths
- Wooden fences around properties
- Repurposed war debris as planters (rows 14-16, col 24-26 — old tank hull with flowers)
- Community well (row 20, col 15) — stone circle, 2×2 tiles
- Small playground near Pip's area (row 35, cols 12-14) — swing set, sandbox

---

### 3.4 MARKET DISTRICT (Center-North — Rows 10-25, Cols 29-52)

**Purpose**: Commerce hub, daily shopping, NPC gathering, visiting merchants
**Terrain**: Cobblestone paths, stone/dirt ground, market stalls

**Building Footprints**:

| Building | Position (Top-Left) | Size (W×H) | Door | Notes |
|----------|-------------------|-------------|------|-------|
| General Store (Gus) | (12, 30) | 6×5 | (16, 33) | Large storefront, awning, goods display |
| Parts Dealer (Ferris) | (12, 38) | 5×5 | (16, 40) | Cluttered exterior, gear sign, components |
| Food Vendor | (20, 30) | 4×4 | (23, 32) | Open stall area, cooking steam |

**Market Stalls** (open-air, 2×2 tiles each):
- Stall positions: (14, 34), (14, 36), (18, 34), (18, 36)
- Rotating merchants occupy these on Market Days
- Empty most days (just the wooden frame)

**Path Network**:
- Wide cobblestone avenue: Cols 33-37, Rows 10-24 (4 tiles wide — the "main street")
- Side paths to each shop entrance
- Connection south to Town Square at Row 25

---

### 3.5 TOWN SQUARE (Center — Rows 25-38, Cols 29-52)

**Purpose**: Community heart, clocktower, festivals, message board, gathering space
**Terrain**: Stone/cobblestone center, grass edges, decorative elements

```
Grid Detail (Rows 25-38, Cols 29-52):

Legend:
  Cs = Cobblestone         Gs = Grass (town)         Sp = Stone path
  Ct = Clocktower (3×3)    Mb = Message board        Bn = Bench
  Lp = Lamppost            Fl = Flower bed           Ft = Fountain (2×2)
  Sg = Stage area          Fg = Flagpole

Row 25: Gs Gs Gs Gs Sp Sp Sp Sp Sp Sp Sp Sp Sp Sp Sp Sp Sp Sp Gs Gs Gs Gs Gs Gs
Row 26: Gs Gs Gs Sp Cs Cs Cs Cs Cs Cs Cs Cs Cs Cs Cs Cs Cs Cs Sp Gs Gs Gs Gs Gs
Row 27: Gs Gs Sp Cs Cs Fl Cs Cs Cs Cs Cs Cs Cs Cs Cs Cs Fl Cs Cs Sp Gs Gs Gs Gs
Row 28: Gs Sp Cs Cs Cs Fl Cs Cs Bn Cs Cs Cs Cs Bn Cs Cs Fl Cs Cs Cs Sp Gs Gs Gs
Row 29: Gs Sp Cs Cs Cs Cs Cs Cs Cs Cs Ct Ct Ct Cs Cs Cs Cs Cs Cs Cs Sp Gs Gs Gs
Row 30: Gs Sp Cs Cs Lp Cs Cs Cs Cs Cs Ct Ct Ct Cs Cs Cs Cs Cs Lp Cs Sp Gs Gs Gs
Row 31: Gs Sp Cs Cs Cs Cs Cs Cs Cs Cs Ct Ct Ct Cs Cs Cs Cs Cs Cs Cs Sp Gs Gs Gs
Row 32: Gs Sp Cs Cs Cs Cs Cs Bn Cs Cs Cs Cs Cs Cs Cs Bn Cs Cs Cs Cs Sp Gs Gs Gs
Row 33: Gs Sp Cs Cs Cs Cs Cs Cs Cs Cs Ft Ft Cs Cs Cs Cs Cs Cs Cs Cs Sp Gs Gs Gs
Row 34: Gs Sp Cs Cs Mb Cs Cs Cs Cs Cs Ft Ft Cs Cs Cs Cs Cs Fg Cs Cs Sp Gs Gs Gs
Row 35: Gs Gs Sp Cs Cs Cs Cs Cs Cs Cs Cs Cs Cs Cs Cs Cs Cs Cs Cs Sp Gs Gs Gs Gs
Row 36: Gs Gs Gs Sp Cs Cs Sg Sg Sg Sg Sg Sg Sg Sg Sg Cs Cs Cs Sp Gs Gs Gs Gs Gs
Row 37: Gs Gs Gs Gs Sp Sp Sp Sp Sp Sp Sp Sp Sp Sp Sp Sp Sp Sp Gs Gs Gs Gs Gs Gs
Row 38: Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs Gs
```

**Key Features**:
- **Clocktower**: 3×3 tiles (rows 29-31, cols 39-41) — tallest structure, animated clock face
- **Fountain**: 2×2 tiles (rows 33-34, cols 39-40) — animated water, Beautiful Ruin (repurposed gear mechanism)
- **Message Board**: Row 34, col 33 — quest board, daily notices
- **Festival Stage**: Row 36, cols 35-47 — raised wooden platform for Spark Festival, Harvest Faire etc.
- **Flagpole**: Row 34, col 46 — Coppervale flag
- **Benches**: 4 placed around the square for NPC sitting
- **Lampposts**: 2 flanking the square (rows 30, cols 33 and 47)
- **Flower beds**: 4 corners (rows 27-28, cols 34 and 45)

---

### 3.6 THE RUSTY GEAR & SOUTH-CENTER BUILDINGS (Rows 38-55, Cols 29-52)

**Building Footprints**:

| Building | Position (Top-Left) | Size (W×H) | Door | Notes |
|----------|-------------------|-------------|------|-------|
| The Rusty Gear Tavern | (39, 38) | 7×5 | (43, 41) | Largest commercial building. Gear-shaped sign. Warm light. |
| Captain Harrow's Quarters | (39, 30) | 5×4 | (42, 32) | Militia headquarters. Weapon rack visible. Coppervale flag. |
| Doc Bramble's Clinic | (45, 30) | 5×4 | (48, 32) | Red cross sign. Herb garden. |
| Kaydee's Home (above tavern) | — | — | Internal | Accessed via stairs inside Rusty Gear |
| Wes's Courier Post | (45, 38) | 4×3 | (47, 40) | Small building. Mailboxes. Speed-delivery sign. |
| Hank's Smithy | (45, 44) | 5×4 | (48, 46) | Open-air forge visible. Anvil outside. Smoke. |
| Nora's Farm Plot | (50, 30) | 8×5 area | Open | Fenced crop rows, scarecrow, tool shed (2×2) |

---

### 3.7 PLAYER'S WORKSHOP DISTRICT (Southwest — Rows 38-58, Cols 8-28)

**Purpose**: The player's home base — equivalent of the farm in Harvest Moon
**Terrain**: Dirt/packed earth ground, grass edges, fenced perimeter

```
Workshop District Layout (Rows 38-58, Cols 8-28):

Legend:
  Dt = Dirt/packed earth    Gs = Grass              Fe = Fence
  WS = Workshop building    LQ = Living Quarters    Fg = Forge (outdoor)
  AC = Assembly Crane area  SY = Storage Yard       AP = Automaton Pen
  Dp = Defense placement    Gt = Gate               Sp = Stone path

Row 38: Gs Gs Gs Gs Fe Fe Fe Fe Gt Gt Fe Fe Fe Fe Fe Fe Fe Fe Fe Fe Gs
Row 39: Gs Gs Gs Fe Dt Dt Dt Dt Sp Sp Dt Dt Dt Dt Dt Dt Dt Dt Fe Gs Gs
Row 40: Gs Gs Fe Dt Dt ╔═══════════════╗ Dt Dt Dt Dt Dt Dt Dt Fe Gs Gs
Row 41: Gs Gs Fe Dt Dt ║               ║ Dt Dt Fg Fg Dt Dt Dt Fe Gs Gs
Row 42: Gs Gs Fe Dt Dt ║   WORKSHOP    ║ Dt Dt Fg Fg Dt Dt Dt Fe Gs Gs
Row 43: Gs Gs Fe Dt Dt ║   (main bldg) ║ Dt Dt Dt Dt Dt Dt Dt Fe Gs Gs
Row 44: Gs Gs Fe Dt Dt ║   8×6 tiles   ║ Dt Dt Dt Dt Dt Dt Dt Fe Gs Gs
Row 45: Gs Gs Fe Dt Dt ║               ║ Dt Dt LQ LQ LQ Dt Dt Fe Gs Gs
Row 46: Gs Gs Fe Dt Dt ╚══════╦╦═══════╝ Dt Dt LQ LQ LQ Dt Dt Fe Gs Gs
Row 47: Gs Gs Fe Dt Dt Dt Dt Sp Sp Dt Dt Dt Dt Dt Dt Dt Dt Dt Fe Gs Gs
Row 48: Gs Gs Fe Dt AC AC AC Sp Sp Dt SY SY SY SY Dt Dt Dt Dt Fe Gs Gs
Row 49: Gs Gs Fe Dt AC AC AC Dt Dt Dt SY SY SY SY Dt Dt Dt Dt Fe Gs Gs
Row 50: Gs Gs Fe Dt AC AC AC Dt Dt Dt SY SY SY SY Dt AP AP AP Fe Gs Gs
Row 51: Gs Gs Fe Dt Dt Dt Dt Dt Dt Dt Dt Dt Dt Dt Dt AP AP AP Fe Gs Gs
Row 52: Gs Gs Fe Dt Dt Dp Dp Dp Dp Dp Dp Dp Dp Dt Dt AP AP AP Fe Gs Gs
Row 53: Gs Gs Fe Dt Dt Dp Dp Dp Dp Dp Dp Dp Dp Dt Dt Dt Dt Dt Fe Gs Gs
Row 54: Gs Gs Gs Fe Fe Fe Fe Fe Fe Fe Fe Fe Fe Fe Fe Fe Fe Fe Fe Gs Gs Gs
```

**Key Features**:
- **Main Workshop Building**: 8×6 tiles (rows 40-46, cols 12-19) — largest building on the map. Door faces south (row 46, cols 15-16). Chimney with smoke on roof.
- **Living Quarters**: 3×2 tiles (rows 45-46, cols 21-23) — attached to workshop. Separate door.
- **Outdoor Forge**: 2×2 tiles (rows 41-42, cols 21-22) — visible anvil, fire, bellows.
- **Assembly Crane Area**: 3×3 tiles (rows 48-50, cols 12-14) — open-air construction zone. Crane structure visible in objects_high layer.
- **Storage Yard**: 4×3 tiles (rows 48-50, cols 18-21) — crates, barrels, salvage piles. Visual clutter that grows with game progress.
- **Automaton Pen**: 3×3 tiles (rows 50-52, cols 23-25) — fenced area where automatons idle. Visual: sleeping bots, charging stations.
- **Defense Placement Zone**: 8×2 tiles (rows 52-53, cols 13-20) — workshop perimeter defense slots.
- **Perimeter Fence**: Wooden fence around entire property with gate at north (row 38, cols 16-17).

---

### 3.8 THE HOLLOW ROAD & EASTERN GATE (East — Rows 10-40, Cols 53-79)

**Purpose**: Primary exit east toward The Hollow, main marauder attack vector, defense zone
**Terrain**: Dirt road transitioning to rough path, grass fields, scattered war debris

**Key Features**:
- **Eastern Road**: 3-tile wide dirt road (cols 55-57) running north-south, connecting to The Hollow exit at (row 20, col 79)
- **Eastern Gate**: Defensive chokepoint (rows 18-22, cols 60-65) — wall placement zone, turret positions
- **Defense Placement Zones**:
  - Eastern Gate: 12 turret slots, 20 wall segments
  - Field positions: 6 additional turret slots in open ground
  - Trap zones: 8 trap placement tiles along the road approach
- **War Debris**: Scattered across the fields — rusted tank hull (3×2, row 15 col 65), broken concrete slabs, crater-pond (3×3, row 12 col 70)
- **Watchtower**: Small raised platform (2×2, row 16 col 58) — Harrow's lookout post

```
Defense Zone Detail (Rows 16-24, Cols 55-72):

Legend:
  Dr = Dirt road           Gs = Grass              Wd = War debris
  Tw = Turret slot (wall)  Tt = Turret slot (tower) Tp = Trap placement
  Wl = Wall segment slot   Gt = Gate               Wt = Watchtower

Row 16: Gs Gs Dr Dr Dr Gs Gs Wt Wt Gs Gs Gs Gs Gs Gs Gs Gs Gs
Row 17: Gs Gs Dr Dr Dr Gs Gs Wt Wt Gs Gs Tp Tp Gs Gs Gs Wd Gs
Row 18: Gs Wl Wl Wl Wl Wl Wl Wl Gt Gt Wl Wl Wl Wl Wl Gs Gs Gs
Row 19: Gs Tw Gs Dr Dr Dr Gs Gs Gs Gs Gs Gs Gs Gs Tw Gs Gs Gs
Row 20: Gs Gs Gs Dr Dr Dr Gs Gs Gs Gs Gs Tp Tp Gs Gs →→ EXIT
Row 21: Gs Tw Gs Dr Dr Dr Gs Gs Gs Gs Gs Gs Gs Gs Tw Gs Gs Gs
Row 22: Gs Wl Wl Wl Wl Wl Wl Wl Gt Gt Wl Wl Wl Wl Wl Gs Gs Gs
Row 23: Gs Gs Dr Dr Dr Gs Gs Gs Gs Gs Tp Tp Gs Gs Gs Wd Wd Gs
Row 24: Gs Gs Dr Dr Dr Gs Gs Gs Tt Gs Gs Gs Gs Tt Gs Gs Gs Gs
```

---

### 3.9 SOUTHERN TREELINE & RUSTWOOD EXIT (South — Rows 50-60, Cols 53-65)

**Purpose**: Path to Rustwood Forest, secondary defense zone, Nora's extended farmland
**Terrain**: Grass transitioning to forest floor, increasing tree density

**Key Features**:
- Forest path exit at (row 59, col 58) — leads to Rustwood Edge
- Tree density increases from row 52 southward
- Secondary defense zone: 6 turret slots, 8 wall segments along treeline
- Ambient: darker lighting, rustling sound effects

---

### 3.10 RAIL STATION (Southeast — Rows 54-60, Cols 66-79)

**Purpose**: Future rail connection (non-functional until late game), story location
**Terrain**: Stone platform, rail tracks, weathered structure

**Key Features**:
- **Platform**: 6×3 tiles (rows 55-57, cols 68-73) — raised stone surface
- **Station Building**: 4×3 tiles (rows 55-57, cols 74-77) — small waiting room, ticket window (boarded up early game)
- **Rail Tracks**: 2-tile wide track bed (rows 58-59) running east-west across bottom of map
- **State Changes**: Boarded up (Year 1-2) → Under repair (Year 3) → Functional (Year 3+)

---

## 4.0 NPC SPAWN POSITIONS & DAILY ROUTES

### Default Morning Positions (Spring, Clear Weather)

| NPC | Home Position | Morning (8AM) | Midday (12PM) | Evening (6PM) | Night (10PM) |
|-----|--------------|---------------|---------------|----------------|--------------|
| Spark | (10, 18) | Garage interior | Market District (34, 14) | Overlook (5, 18) | Rusty Gear interior |
| Old Maren | (10, 12) | Home interior | Home garden (13, 12) | Home interior | Home (sleeping) |
| Harrow | (39, 30) | Quarters interior | Eastern Gate patrol (19, 60) | Town Square (30, 40) | Quarters (sleeping) |
| Linden | (26, 18) | Town Square (30, 35) | Town Hall area (28, 35) | Rusty Gear interior | Home (sleeping) |
| Pip | — | Town Square (32, 38) | The Hollow Road area (25, 60) | Residential (28, 14) | Home (sleeping) |
| Leera | — | Hollow Road exit (15, 70) | AWAY (exploring) | Rusty Gear interior | Home or away |
| Michelle | (32, 10) | Clinic interior | Greenhouse (34, 14) | Home or Clinic | Home (sleeping) |
| Kaydee | Tavern upstairs | Rusty Gear (sleeping) | Rusty Gear interior | Rusty Gear interior | Rusty Gear interior |
| Janis | — (arrives Y1 Autumn) | Town Hall area | Inspection route | Overlook or Tavern | Quarters (sleeping) |
| Kiery | (18, 10) | Shop interior | River bank (25, 6) | Shop interior | Home (sleeping) |
| Paige | (18, 18) | Archive interior | Archive interior | Archive interior | Home (sleeping) |
| Gus | General Store | Store interior | Store interior | Rusty Gear interior | Home (sleeping) |
| Ferris | Parts Dealer | Shop interior | Shop interior | Shop interior | Home (sleeping) |
| Hank | (45, 44) | Smithy (working) | Smithy (working) | Rusty Gear interior | Home (sleeping) |
| Nora | Farm | Farm plot (52, 32) | Farm plot | Home (cooking) | Home (sleeping) |
| Wes | Courier Post | OUT (delivering) | Town Square (33, 42) | Rusty Gear interior | Post (sleeping) |
| Elm | (26, 10) | Chapel interior | Memorial garden | Chapel | Chapel (meditating) |
| Bramble | Clinic | Clinic interior | Clinic interior | Clinic interior | Clinic or Home |

---

## 5.0 COLLISION MAP

### Collision Types
| Type | Code | Behavior |
|------|------|----------|
| **Walkable** | 0 | Player and NPCs can traverse |
| **Blocked** | 1 | Impassable (buildings, deep water, dense trees) |
| **Interactable** | 2 | Triggers interaction (doors, message board, NPCs) |
| **Transition** | 3 | Map exit / room transition trigger |
| **Water (shallow)** | 4 | Walkable with splash animation, slows movement |
| **Defense Zone** | 5 | Walkable; also accepts defense structure placement |

### General Rules
- All building footprints are Blocked (1) except door tiles (2=Interactable)
- All water cols 0-3 are Blocked (1); cols 4-5 are Water-shallow (4)
- Bridge tiles are Walkable (0)
- Tree trunks are Blocked (1); canopy is on objects_high layer (no collision)
- Fence tiles are Blocked (1) except gate tiles (0)
- All map edge tiles are Blocked (1) except exit points (3=Transition)

### Map Exits (Transition Tiles)
| Exit | Position | Destination Room |
|------|----------|-----------------|
| **North** | Row 0, Cols 45-47 | `rm_ashspine_foothills` |
| **East** | Rows 19-21, Col 79 | `rm_hollow_road` → `rm_the_hollow` |
| **South (Rustwood)** | Row 59, Cols 57-59 | `rm_rustwood_edge` |
| **South (Rail)** | Row 59, Cols 70-72 | `rm_rail_station_platform` (interior) |
| **West (Bridge)** | Rows 42-44, Col 0 | `rm_western_road` → `rm_shattered_coast` |

---

## 6.0 SEASONAL TILE SWAPS

The base map uses Spring palette tiles. Seasonal changes are implemented via palette swaps and overlay additions:

| Element | Spring | Summer | Autumn | Winter |
|---------|--------|--------|--------|--------|
| Grass base | `ts_grass_spring` | `ts_grass_summer` | `ts_grass_autumn` | `ts_grass_winter` |
| Trees | `ts_vegetation_spring` | `ts_vegetation_summer` | `ts_vegetation_autumn` | `ts_vegetation_winter` |
| Flower beds | Cherry blossoms, tulips | Sunflowers, roses | Mums, dried stalks | Empty / snow-dusted |
| Nora's farm | Seedlings | Full crops | Harvest-ready / pumpkins | Fallow / snow |
| Water | Standard blue | Warm blue | Amber-tinted | Partially frozen edges |
| Ground detail | Puddles (rain) | Dry cracks (heat) | Fallen leaves | Snow patches |
| Decorative | Bird nests in trees | Bunting on shops | Harvest garlands | Lanterns, warm windows |

---

## 7.0 EVENT-TRIGGERED MAP CHANGES

| Trigger | Map Change | Permanent? |
|---------|-----------|------------|
| **First Worker Bot built** | Small bot visible in workshop yard | Yes |
| **Combat Mech built** | Mech visible in Assembly Crane area | Yes (upgrades visually) |
| **Trade routes opened** | Market stalls gain visiting merchants | Seasonal |
| **Post-raid damage** | Damaged wall/turret tiles replace intact ones | Until repaired |
| **Festival day** | Stage decorated, stalls set up, banners hung | 1 day |
| **Year 2+ growth** | New NPC homes appear in empty residential lots | Yes |
| **Rail restoration** | Station building repaired, tracks cleared | Yes |
| **Defense upgrades** | Wall types visually upgrade (wood → stone → steel) | Yes |
| **Maren's passing** | Her house gets a memorial flower arrangement | Yes |
| **Partnership** | Partner's possessions visible in Living Quarters area | Yes |

---

*This Coppervale Master Layout is the primary map document for Phase 12.*
*Next: Interior Layouts, Exploration Zone Layouts, and the rendered visual map.*

*— Forged by the Djinn, in service to Master Derek*
