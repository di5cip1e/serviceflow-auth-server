# Ironveil Art Production Plan — Batch 2

## Deliverables Overview

### 1. Workshop Equipment Sprites
Large-scale workshop station sprites showing the 4 key crafting stations from GDD Section 2.
Each station needs: **Idle state** + **Active/Working state** (2-4 animation frames per state).

| Station | Description | Size | Key Visual Elements |
|---------|-------------|------|-------------------|
| **The Forge** | Metalworking furnace | ~3x3 tiles (48x48px sprite area) | Anvil, furnace mouth with fire, bellows, coal bin, copper/iron tones |
| **Assembly Crane** | Central overhead crane for building large machines | ~4x4 tiles (64x64px sprite area) | Overhead arm, hook/claw, platform below, gears, chains |
| **Component Fabricator** | Precision parts machine | ~3x3 tiles (48x48px sprite area) | Lens/magnifier, gears, workbed, technical readouts, brass fittings |
| **Aether Refinery** | Processes Aetheric Ore into fuel cells | ~3x3 tiles (48x48px sprite area) | Glowing purple ore input, blue fuel cell output, pipes, glass tubes, steam |

**Style**: Match existing workshop_interior_tileset.png — same copper/brass/dark steel palette, 16x16 base grid, 1px dark contextual outlines, 2-3 tone shading.

### 2. Supporting NPC Dialogue Portraits
7 supporting NPCs, each with 8 emotional expressions for dialogue boxes.
Must match the established portrait style from core_npcs_portraits.png and romance_portraits sets.

| NPC | Key Visual ID | Expression Set |
|-----|--------------|----------------|
| **Doc Bramble** | Doctor coat, stethoscope, elderly, glasses | neutral, happy, concerned, surprised, tired, stern, relieved, thinking |
| **Gus** | Bald, mustache, green apron | neutral, happy, gossipy, surprised, laughing, concerned, proud, winking |
| **Ferris** | Wild hair, goggles on head, duster coat | neutral, excited, manic, surprised, scheming, disappointed, proud, confused |
| **Hank** | Huge, bald, beard, hammer/apron | neutral, gentle smile, focused, surprised, amused, stern, proud, shy |
| **Nora** | Straw hat, farm clothes, practical | neutral, happy, no-nonsense, surprised, tired, satisfied, worried, laughing |
| **Wes** | Backwards cap, messenger bag, young | neutral, excited, hurried, surprised, proud, worried, happy, out-of-breath |
| **Pastor Elm** | White beard, dark robes, medallion | neutral, serene, contemplative, surprised, warm smile, solemn, amused, wise |

**Style**: Bust-up portraits, dark navy background (#1A1A2E), warm lighting, consistent with existing portrait sheets. Each portrait ~200x200px area within the sheet.

### 3. Mortar Emplacement Turret Sprite
New defense turret to complement the existing 5 turrets on turrets_sprite_sheet.png.

**From GDD**: "Very High (AoE) damage, Long range, Very Slow fire rate. Splash damage, best vs. grouped enemies. Size: 2x2 tiles. Cost: Steel × 8, Brass × 4."

**States needed**: Idle, Aiming/Elevating, Firing (with explosive shell visible), Reload/Cooldown
**Style**: Must match the existing turret sheet — copper/brass base, dark steel barrel, visible gears, steampunk aesthetic. Similar scale to the Ballistic Turret but with a shorter, wider barrel angled upward (mortar arc).

### 4. Remaining UI Screens
Full mockup screens matching the established steampunk UI kit aesthetic.

| Screen | Key Elements | Layout |
|--------|-------------|--------|
| **Title Screen** | Ironveil logo, "New Game / Continue / Settings / Quit" buttons, hero art background, steampunk frame | Full screen, centered menu |
| **Save/Load Screen** | 3 save slots with preview (season, day, playtime), character portrait, brass frame panels | Panel layout with 3 slot cards |
| **Automaton Management Panel** | Automaton list with status, task assignment dropdown, health/fuel gauges, personality indicator | Split panel — list left, detail right |
| **World Map Screen** | Stylized map of Vantara regions, fog of war for undiscovered areas, player location marker, fast travel nodes | Full screen map with overlay UI |

**Style**: Dark leather background (#2C1810), brass/copper borders (#C8A84E), cream text (#F0E8D0), consistent with ui_elements_kit.png.

## Production Order
1. Workshop Equipment Sprites (foundational game assets)
2. Mortar Emplacement Turret (extends existing sheet)
3. Supporting NPC Portraits (dialogue system asset)
4. UI Screens (interface design)

## Reference Assets Used
- workshop_interior_tileset.png (style/palette match for equipment)
- turrets_sprite_sheet.png (style/palette match for mortar)
- core_npcs_portraits.png (style match for portraits)
- supporting_npcs_sprite_sheet.png (character visual reference)
- ui_elements_kit.png (UI component reference)
- color_palette_bible.png (master color reference)
- character_concepts.png (character art style)
- hero_art.png (overall visual target)
- art_style_guide.md (master rules)
