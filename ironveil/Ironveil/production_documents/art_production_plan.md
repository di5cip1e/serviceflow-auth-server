# Ironveil Art Production — Execution Plan

## Generation Strategy
Each asset category will be produced as sprite sheets using Image_Generate, with existing Ironveil assets passed as style references for consistency. The dark background (#1A1A2E-ish) with labeled rows style established by the Jack and Automaton sprite sheets will be maintained.

## Production Order (Priority)

### Phase A: Machine Sprites (Most game-critical for defense/combat systems)
1. **Sheet 1 — Mechs**: All 6 mech types on one sheet (idle + walk frames)
2. **Sheet 2 — Defense Turrets**: All 6 turret types (idle + firing frames)
3. **Sheet 3 — Walls & Traps**: 4 wall types + 6 trap types
4. **Sheet 4 — Vehicles/Zeppelins**: Flyer, Hauler, Cargo Zeppelin, Battle Zeppelin

### Phase B: NPC Portraits (Critical for dialogue system)
5. **Sheet 5 — Core NPC Portraits**: Jack, Spark, Old Maren, Captain Harrow, Mayor Linden, Pip (6 expressions each)
6. **Sheet 6 — Romance Portraits Part 1**: Leera, Michelle, Kaydee (8 expressions each)
7. **Sheet 7 — Romance Portraits Part 2**: Janis, Kiery, Paige (8 expressions each)
8. **Sheet 8 — DEJIN States**: Terminal screen states (Dormant, Flickering, Awakening, Functional, Recovering, Restored)

### Phase C: UI Elements (Needed for game interface)
9. **Sheet 9 — HUD & Core UI**: Health/energy bars, clock, mini-map frame, notification badges
10. **Sheet 10 — Dialogue & Menu UI**: Dialogue box, menu panels, button states, gear hearts
11. **Sheet 11 — Crafting & Inventory UI**: Inventory grid, crafting slots, station interfaces

### Phase D: Item Icons (Needed for inventory/crafting systems)
12. **Sheet 12 — Tools & Raw Materials**: 6 tools + 10 raw materials
13. **Sheet 13 — Refined Materials & Components**: 10 refined + 11 components
14. **Sheet 14 — Gifts, Data Cores & Misc**: Gift items + 5 data core types + currency (Cogs)

## Reference Images for Each Generation
- **Style consistency**: Jack sprite sheet + Automatons sprite sheet (pixel art style, layout)
- **Character accuracy**: Character concepts + Romance candidates concept art
- **Enemy accuracy**: Enemy factions concept art
- **Color accuracy**: Color palette bible
- **World feel**: Hero art

## Quality Checks
- Verify steampunk metal palette is consistent (#D4854A copper, #C8A84E brass, #4A5568 steel)
- Verify aetheric glow uses correct blue (#4FC3F7)
- Verify no pure black outlines — use contextual dark colors
- Verify chibi proportions match existing sprites
- Verify machine color coding (green=utility, red=combat, blue=transport)

## Self-Review Notes
- The scope is large (14 sheets). Each Image_Generate call produces one sheet.
- Must pass existing sprite sheets as references for EVERY generation to maintain consistency.
- Machine sizes vary (1-tile turrets up to 3×4-tile heavy mechs) — need to show scale clearly.
- Portrait art is a different style from sprite art — larger, more detailed bust-up views.
- UI elements need to be functional and readable, not just decorative.
- Item icons at 16×16 are tiny — need maximum clarity and silhouette readability.
