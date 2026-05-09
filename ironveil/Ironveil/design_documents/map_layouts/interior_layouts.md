# 🏠 IRONVEIL — INTERIOR LAYOUTS
## Phase 12: Tile-Level Interior Map Designs

---

> **"Every room tells you who lives there before they say a word."**

---

## 1.0 INTERIOR SPECIFICATIONS

### Global Rules
| Property | Value |
|----------|-------|
| **Tile Size** | 16×16 pixels |
| **Perspective** | Top-down ¾ view (same as overworld) |
| **Transition** | Fade/dissolve when entering a door |
| **Lighting** | Interior palette is slightly warmer than exterior |
| **Collision** | All walls/furniture blocked; floor walkable; interactable objects marked |

### Layer Structure (Same as Overworld)
| Layer | Contents |
|-------|----------|
| 0 `floor_base` | Wood planks, stone floor, carpet |
| 1 `floor_detail` | Rugs, floor stains, cracks, thresholds |
| 2 `shadows` | Furniture shadows |
| 3 `objects_low` | Chairs, low tables, crates, floor items |
| 4 `objects_mid` | NPCs, tall furniture, machines, counters |
| 5 `objects_high` | Ceiling beams, hanging lamps, shelves (top) |

### Legend (Used Throughout)
```
Wd = Wood floor          St = Stone floor         Cp = Carpet/rug
Wl = Wall (blocked)      Dr = Door (transition)   Wn = Window (blocked, light source)
Tb = Table               Ch = Chair               Bd = Bed
Bk = Bookshelf           Cx = Crate/box           Br = Barrel
Lm = Lamp/lantern        Fr = Fireplace           Sv = Stove/oven
Cn = Counter              Sk = Sink               Cl = Clock
Pt = Plant/potted         Sg = Sign               Pc = Picture/painting
Ix = Interactable object  Np = NPC spawn point
```

---

## 2.0 PLAYER'S WORKSHOP (rm_workshop)

The most important interior — the player spends significant time here daily.

### 2.1 Main Workshop Floor
**Size**: 16×12 tiles (256×192 px)
**Tileset**: `ts_workshop_interior`
**Purpose**: Assembly, crafting, maintenance, AI Core access

```
     0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
  0: Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl
  1: Wl St St St St St St St St St St St St St St Wl
  2: Wl St FG FG FG St St St AC AC AC St St St St Wl
  3: Wl St FG FG FG St St St AC AC AC St St St St Wl
  4: Wl St St St St St St St AC AC AC St WB WB St Wl
  5: Wl St CF CF CF St St St St St St St WB WB St Wl
  6: Wl St CF CF CF St St St St St St St St St St Wl
  7: Wl St St St St St St St St St St St AR AR St Wl
  8: Wl St AI AI AI St St St TP TP St St AR AR St Wl
  9: Wl St AI AI AI St St St TP TP St St St St St Wl
 10: Wl St St St St St St St St St St St St St St Wl
 11: Wl Wl Wl Wl Wl Wl Wl Dr Dr Wl Wl Wl Wl Wl Wl Wl

Legend (Workshop-specific):
  FG = Forge station (3×3)           AC = Assembly Crane base (3×3)
  CF = Component Fabricator (3×2)    WB = Workbench (2×2)
  AI = AI Core Terminal/DEJIN (3×2)  TP = Testing Platform (2×2)
  AR = Aether Refinery (2×2)         Dr = Door (south exit)
```

**Station Positions & Interactions**:
| Station | Grid Position | Size | Interaction |
|---------|-------------|------|-------------|
| Forge | (2,2)-(4,4) | 3×3 | Metalworking menu. Visible fire, bellows, anvil. |
| Assembly Crane | (8,2)-(10,4) | 3×3 | Blueprint selection, component placement. Crane arm visible overhead. |
| Component Fabricator | (2,5)-(4,6) | 3×2 | Precision parts menu. Gears, lenses visible. |
| Workbench | (12,4)-(13,5) | 2×2 | Small items, tools, repairs. Cluttered surface. |
| AI Core (DEJIN) | (2,8)-(4,9) | 3×2 | DEJIN dialogue, automaton management, research. Screen glow (Aether blue). |
| Testing Platform | (8,8)-(9,9) | 2×2 | Machine diagnostics. Raised platform with gauges. |
| Aether Refinery | (12,7)-(13,8) | 2×2 | Ore processing. Purple glow (raw) → blue glow (refined). |

**Visual Details**:
- Floor: Stone tiles with oil stains and gear-print patterns
- Walls: Wood paneling lower half, exposed brick upper half, copper pipes visible
- Ceiling (objects_high): Wooden beams, hanging lanterns, crane arm extends from Assembly Crane
- Tool racks on east and west walls (decorative)
- Scattered small gears, bolts on floor (decorative detail tiles)
- DEJIN terminal has progressive visual states matching story (Dormant → Restored)

**State Changes**:
| Trigger | Visual Change |
|---------|--------------|
| Forge upgraded | Larger fire, better equipment visible |
| DEJIN awakened | Screen lights up, blue glow |
| DEJIN functional | Full terminal active, holographic display |
| Aether Refinery built | New station appears (empty spot before) |
| Testing Platform built | New station appears |

---

### 2.2 Player's Living Quarters
**Size**: 10×8 tiles
**Tileset**: `ts_interior_furniture`
**Purpose**: Sleep (save game), eat (buffs), personal space
**Access**: Door on east wall of workshop, or separate exterior door

```
     0  1  2  3  4  5  6  7  8  9
  0: Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl
  1: Wl Wd Wd Wd Wd Wd Wd Wd Wd Wl
  2: Wl Wd Bd Bd Wd Wd Wd Tb Ch Wl
  3: Wl Wd Bd Bd Wd Wd Wd Tb Ch Wl
  4: Wl Wd Wd Wd Wd Wd Cp Cp Wd Wl
  5: Wl Wd Bk Bk Wd Sv Sk Wd Wd Wl
  6: Wl Wd Wd Wd Wd Cn Cn Wd Pt Wl
  7: Wl Wl Wl Dr Dr Wl Wl Wl Wl Wl

Key:
  Bd = Bed (2×2, interactable — sleep/save)
  Tb+Ch = Table and chair (eating area)
  Bk = Bookshelf (DEJIN's recovered lore appears here)
  Sv = Stove       Sk = Sink       Cn = Counter (kitchen area)
  Cp = Carpet (decorative)         Pt = Potted plant
```

**Upgradeable Elements**:
- Bed: Basic cot → proper bed → luxury bed (visual upgrade with gameplay buffs)
- Kitchen: Basic stove → full kitchen (unlocks cooking recipes)
- Bookshelf: Fills with books as lore is discovered
- Post-partnership: Partner's belongings appear (varies by romance candidate)

---

## 3.0 THE RUSTY GEAR TAVERN (rm_rusty_gear)

**Size**: 14×10 tiles
**Tileset**: `ts_interior_furniture`
**Purpose**: Socializing, evening NPC gathering, Kaydee's domain, festival after-parties

```
     0  1  2  3  4  5  6  7  8  9  10 11 12 13
  0: Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl
  1: Wl Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wl
  2: Wl Wd Tb Tb Ch Wd Wd Wd Tb Tb Ch Wd Wd Wl
  3: Wl Wd Ch Tb Tb Wd Wd Wd Ch Tb Tb Wd St Wl
  4: Wl Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd St Wl
  5: Wl Wd Tb Ch Wd Wd FR FR Wd Wd Wd Wd St Wl
  6: Wl Wd Tb Ch Wd Wd FR FR Wd BR BR Cn Cn Wl
  7: Wl Wd Wd Wd Wd Wd Wd Wd Wd BR BR Cn Cn Wl
  8: Wl Wd SG SG SG SG Wd Wd Wd Wd Wd Wd Wd Wl
  9: Wl Wl Wl Wl Dr Dr Wl Wl Wl Wl Wl Wl Wl Wl

Key:
  Tb+Ch = Table and chair sets (seating for 4 groups)
  FR = Fireplace (2×2, warm glow, crackling animation)
  BR = Bar (beer barrels, 2×2)
  Cn = Counter/Bar top (2×2, Kaydee's station)
  SG = Stage area (4×1, for performances and festival events)
  St = Stairs (to Kaydee's upstairs quarters — transition)
```

**NPC Positions (Evening)**:
| NPC | Position | Activity |
|-----|----------|----------|
| Kaydee | Behind bar (11,6) | Serving, dialogue |
| Spark | Table (2,2) | Eating, talking |
| Harrow | Bar stool (10,7) | Drinking quietly |
| Leera | Table (8,2) | Telling stories |
| Linden | Table (2,5) | Socializing |
| Hank | Near fireplace (7,5) | Warming hands |

---

## 4.0 GENERAL STORE — GUS'S (rm_general_store)

**Size**: 10×8 tiles
**Purpose**: Buy/sell items, daily supplies, Gus's dialogue

```
     0  1  2  3  4  5  6  7  8  9
  0: Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl
  1: Wl Wd Wd Wd Wd Wd Wd Wd Wd Wl
  2: Wl SH SH SH Wd Wd SH SH SH Wl
  3: Wl SH SH SH Wd Wd SH SH SH Wl
  4: Wl Wd Wd Wd Wd Wd Wd Wd Wd Wl
  5: Wl Wd Wd Wd Wd Wd Wd Wd Wd Wl
  6: Wl Cx Cx Wd Cn Cn Cn Wd Wd Wl
  7: Wl Wl Wl Wl Wl Dr Dr Wl Wl Wl

Key:
  SH = Shelving units (goods display — visual changes with stock)
  Cn = Counter (Gus stands behind, 3-tile long)
  Cx = Crate stacks (storage, decorative)
  Gus NPC position: (5,6) behind counter
```

---

## 5.0 PARTS DEALER — FERRIS'S (rm_parts_dealer)

**Size**: 10×8 tiles
**Purpose**: Buy rare components, sell salvage, Ferris's eccentric collection

```
     0  1  2  3  4  5  6  7  8  9
  0: Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl
  1: Wl Wd GR GR Wd Wd Wd CL CL Wl
  2: Wl Wd GR GR Wd Cx Cx CL CL Wl
  3: Wl Wd Wd Wd Wd Cx Cx Wd Wd Wl
  4: Wl SH SH Wd Wd Wd Wd Wd SH Wl
  5: Wl SH SH Wd Wd Wd Wd Wd SH Wl
  6: Wl Wd Wd Wd Cn Cn Cn Wd Wd Wl
  7: Wl Wl Wl Wl Dr Dr Wl Wl Wl Wl

Key:
  GR = Gear display racks (large gears, components on stands)
  CL = Collector's shelf (Ferris's prized rare finds, glass cases)
  SH = Standard shelving (purchasable components)
  Cx = Crate stacks (overflow inventory, messy)
  Cn = Counter (Ferris position: behind counter)
```

**Visual**: The most cluttered interior in the game. Gears hanging from ceiling, components scattered everywhere, barely organized chaos. Reflects Ferris's eccentric personality.

---

## 6.0 DOC BRAMBLE'S CLINIC (rm_clinic)

**Size**: 12×8 tiles
**Purpose**: Healing (post-raid), Michelle's workplace, medical supplies

```
     0  1  2  3  4  5  6  7  8  9  10 11
  0: Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl
  1: Wl St St St Wl St St St St St St Wl
  2: Wl St CB CB Wl St BD BD St MC MC Wl
  3: Wl St CB CB Wl St BD BD St MC MC Wl
  4: Wl St St St Dr St St St St St St Wl
  5: Wl St Bk Bk St St Tb Ch St SH SH Wl
  6: Wl St St St St St St St St St St Wl
  7: Wl Wl Wl Wl Wl Dr Dr Wl Wl Wl Wl Wl

Key:
  CB = Curtained bed (examination area, 2×2)
  BD = Patient bed (recovery area, 2×2)
  MC = Medicine cabinet (2×2, herbs, supplies)
  SH = Supply shelving
  Internal wall divides exam room from patient area
  Bramble position: (3,5) near bookshelf
  Michelle position: (9,5) near medicine cabinet
```

---

## 7.0 THE ARCHIVE — PAIGE'S (rm_archive)

**Size**: 12×10 tiles
**Purpose**: Lore access, Paige's workplace/home, research, data core reading

```
     0  1  2  3  4  5  6  7  8  9  10 11
  0: Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl
  1: Wl Wd Bk Bk Bk Bk Wd Bk Bk Bk Wd Wl
  2: Wl Wd Bk Bk Bk Bk Wd Bk Bk Bk Wd Wl
  3: Wl Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wl
  4: Wl Wd Wd RD RD Wd Wd Wd Tb Tb Wd Wl
  5: Wl Wd Wd RD RD Wd Wd Wd Ch Wd Wd Wl
  6: Wl Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wl
  7: Wl Wd DC DC Wd Lm Wd Wd Cx Cx Wd Wl
  8: Wl Wd Wd Wd Wd Wd Wd Wd Wd Wd Wd Wl
  9: Wl Wl Wl Wl Wl Dr Dr Wl Wl Wl Wl Wl

Key:
  Bk = Bookshelves (filling both walls — massive collection)
  RD = Reading desk (Paige's main workspace, 2×2, papers, lamp)
  Tb+Ch = Visitor reading table
  DC = Data core reader (Old World terminal, 2×1, blue glow)
  Cx = Archive crates (unsorted documents)
  Lm = Standing lamp (warm glow)
  Paige position: (4,4) at reading desk
```

**Visual**: Warm wood floors, golden light through tall windows. Every wall lined with bookshelves floor to ceiling. The most peaceful interior in the game. Paige's wedding ring box is visible on a small shelf near her desk (after Heart Event 8).

---

## 8.0 HANK'S SMITHY (rm_smithy)

**Size**: 10×8 tiles
**Purpose**: Blacksmithing services, tool upgrades, Hank's dialogue

```
     0  1  2  3  4  5  6  7  8  9
  0: Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl
  1: Wl St St St St St St St St Wl
  2: Wl St FG FG FG St Wd Wd St Wl
  3: Wl St FG FG FG St AV AV St Wl
  4: Wl St St St St St AV AV St Wl
  5: Wl St WR WR St St St St St Wl
  6: Wl St WR WR St Cn Cn St St Wl
  7: Wl Wl Wl Wl Dr Dr Wl Wl Wl Wl

Key:
  FG = Forge (3×2, large, open flame)
  AV = Anvil area (2×2, Hank's main workspace)
  WR = Weapon/tool rack (2×2, displays)
  Cn = Service counter (2×1)
  Hank position: (7,3) at anvil
```

---

## 9.0 NPC HOME TEMPLATE (Residential Houses)

Most NPC homes follow a similar template (8×6 tiles) with personal customization:

```
     0  1  2  3  4  5  6  7
  0: Wl Wl Wl Wl Wl Wl Wl Wl
  1: Wl Wd Wd Wd Wd Wd Wd Wl
  2: Wl Wd Bd Bd Wd Tb Ch Wl
  3: Wl Wd Wd Wd Wd Wd Wd Wl
  4: Wl Wd [PERSONAL] Wd Wd Wl
  5: Wl Wl Wl Dr Dr Wl Wl Wl

Standard: Bed, table, chair, personal item area
```

### Personal Customizations:

| NPC Home | Personal Area (Row 4) | Unique Details |
|----------|----------------------|----------------|
| **Old Maren** | Rocking chair, photo frames, herb collection | Faded, cozy, slightly cluttered with memories. Tea set always on table. Cat sleeping on chair. |
| **Spark** | Workbench with scattered parts, blueprint pinboard | Organized chaos. Half-built gadgets. Flight diagrams on walls. Oil stains on floor. |
| **Mayor Linden** | Desk with papers, Coppervale flag, town planning map | Tidy, warm. Family photos. "Coppervale Founder" plaque on wall. |
| **Michelle** | Herb drying rack, medical books, small altar with flowers | Gentle, clean, slightly sparse. Lavender bundles hanging. Soft rug. |
| **Kiery** | Sewing table, fabric bolts, dress form mannequin | Colorful — the most vibrant interior. Fabrics draped everywhere. Handmade curtains. |
| **Leera** | Map wall, salvage display shelf, expedition pack by door | Functional, sparse. Maps pinned everywhere. Binoculars on table. Always ready to leave. |
| **Paige** | (Lives in Archive — see Section 7. Has a small sleeping area in the back) | Books even in her personal space. Wren's photo on nightstand. |
| **Kaydee** | (Above tavern — small apartment with bar memorabilia, surprisingly cozy) | Hidden softness. Flower on windowsill. Journal she doesn't want anyone to see. |
| **Janis** | (Arrives Y1 Autumn — given guest quarters in Town Hall. Later moves to own house) | Impeccably organized. Fine things from Council cities. Gradually adds Coppervale touches. |
| **Elm** | Prayer area, philosophy books, small garden visible through window | Simplest home. Meditation cushion. Single candle. Profound peace. |

---

## 10.0 TOWN HALL (rm_town_hall)

**Size**: 12×10 tiles
**Purpose**: Council meetings, Linden's office, Janis's temporary quarters, community events

```
     0  1  2  3  4  5  6  7  8  9  10 11
  0: Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl Wl
  1: Wl St St St St St St St St St St Wl
  2: Wl St Tb Tb Tb Tb Tb Tb Tb St St Wl
  3: Wl St Ch Wd Ch Wd Ch Wd Ch St St Wl
  4: Wl St St St St St St St St St St Wl
  5: Wl St St St St Pd Pd St St St St Wl
  6: Wl St St Wl Wl Wl Wl Wl St St St Wl
  7: Wl St St Wl OF OF OF Wl St GQ GQ Wl
  8: Wl St St Wl OF OF OF Wl St GQ GQ Wl
  9: Wl Wl Wl Wl Wl Dr Dr Wl Wl Wl Wl Wl

Key:
  Tb+Ch = Council meeting table (long table, 7 chairs)
  Pd = Podium (2×1, for speeches)
  OF = Linden's Office (3×2, desk, chair, filing cabinet)
  GQ = Guest Quarters (2×2, Janis lives here initially)
```

---

## 11.0 CHAPEL (rm_chapel)

**Size**: 8×10 tiles
**Purpose**: Elm's domain, meditation, memorial, community mediation

```
     0  1  2  3  4  5  6  7
  0: Wl Wl Wl Wl Wl Wl Wl Wl
  1: Wl St St St St St St Wl
  2: Wl St AL AL AL AL St Wl
  3: Wl St St St St St St Wl
  4: Wl St PW PW PW PW St Wl
  5: Wl St PW PW PW PW St Wl
  6: Wl St St St St St St Wl
  7: Wl St Ch Ch Ch Ch St Wl
  8: Wl St St St St St St Wl
  9: Wl Wl Wl Dr Dr Wl Wl Wl

Key:
  AL = Altar area (candles, memorial items, flowers, 4×1)
  PW = Pew seating (4×2, wooden benches)
  Ch = Additional seating (for larger gatherings)
  Elm position: (3,2) near altar
```

**Visual**: Stained glass window effect (colored light tiles on floor from north window). Candle glow. Memorial wall with names. Simple, dignified.

---

*This Interior Layouts Document covers all enterable buildings in Coppervale.*
*Each room is specified at tile-level with collision data, NPC positions, and interactive objects.*

*— Forged by the Djinn, in service to Master Derek*
