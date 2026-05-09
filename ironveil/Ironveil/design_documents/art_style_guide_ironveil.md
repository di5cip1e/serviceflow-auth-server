# 🎨 IRONVEIL — MASTER ART STYLE GUIDE
## Phase 3: Visual Identity

---

> **"The art is the soul made visible. Every pixel must serve the feeling."**

---

## 1.0 THE VISUAL IDENTITY OF IRONVEIL

### The Core Aesthetic Formula
**Ironveil = Harvest Moon: Back to Nature + Post-Apocalyptic Steampunk**

More precisely:
- **70% Harvest Moon Charm**: Warm, cozy, cute, inviting, storybook
- **30% Steampunk Grit**: Copper, brass, gears, steam, war scars, industrial texture

The game should feel like **coming home to a warm workshop after exploring a scarred but beautiful world**. The post-apocalyptic elements are present but never oppressive — they're texture, character, and story, not horror.

### Visual Pillars
1. **WARMTH** — Even in destruction, there is beauty. Craters become ponds. Ruins become gardens.
2. **CHARM** — Characters are endearing. Buildings are cozy. Machines are lovable.
3. **READABILITY** — Every element is instantly recognizable. Function is clear at a glance.
4. **CONTRAST** — The copper-and-brass steampunk tech against soft natural environments creates visual interest.
5. **PROGRESSION** — The world visually brightens and improves as the player succeeds.

---

## 2.0 TECHNICAL SPECIFICATIONS

### 2.1 Tile Size & Grid
| Specification | Value | Notes |
|--------------|-------|-------|
| **Base Tile Size** | 16×16 pixels | Standard for retro-style tile-based games |
| **Render Scale** | 3x (48×48 displayed pixels per tile) | Crisp pixel art at modern resolutions |
| **Character Sprite Size** | 16×24 pixels (1 tile wide, 1.5 tiles tall) | Chibi proportions — head = ~40% of height |
| **Large Character Sprites** | 16×32 pixels (portraits, important NPCs in cutscenes) | For close-up/dialogue views |
| **Map Chunk Size** | 16×16 tiles (256×256 pixels) | For efficient streaming/loading |
| **Screen Viewport** | 20×15 tiles (320×240 pixels native) | Classic 4:3 ratio, scaled to display |
| **Display Resolution** | 960×720 (3x scale) or 1280×960 (4x scale) | Player-selectable |

### 2.2 Perspective & Camera
| Specification | Value |
|--------------|-------|
| **Perspective** | Top-down with ~30° angle (¾ view) |
| **Camera Type** | Fixed follow — smoothly tracks player |
| **Building Visibility** | Front faces visible (doors, windows, signs) |
| **Depth Rendering** | Y-sorting — objects lower on screen render on top |
| **Interior Transition** | Fade/dissolve to interior view (separate tilemap) |

### 2.3 Sprite Rules
| Rule | Specification |
|------|--------------|
| **Outline** | 1-pixel dark outline on all characters and interactive objects |
| **Outline Color** | NOT pure black (#000000). Use dark contextual colors: dark brown (#3D2B1F) for organic, dark steel (#2C3E50) for mechanical |
| **Shading** | 2-3 tone shading maximum. Base color + 1 shadow + 1 highlight |
| **Dithering** | Minimal — use only for large gradient areas (sky, water) |
| **Anti-aliasing** | None — clean pixel edges only |
| **Sub-pixel Animation** | Not used — all movement in whole-pixel increments |
| **Animation Frames** | Walk: 4 frames per direction. Idle: 2-4 frames. Actions: 3-6 frames |

---

## 3.0 COLOR PALETTE BIBLE

### 3.1 Master Palette Philosophy
The palette is **warm, saturated but not harsh, and seasonally expressive**. Colors should feel:
- Inviting and safe in town areas
- Mysterious and textured in exploration areas
- Urgent but not garish during combat/raids

### 3.2 Core Palette (Year-Round)

#### Skin Tones (Diverse Cast)
| Name | Hex | Usage |
|------|-----|-------|
| Porcelain | #F5E0D0 | Light skin base |
| Peach | #E8C4A0 | Medium-light skin |
| Warm Sand | #D4A574 | Medium skin |
| Bronze | #B07840 | Medium-dark skin |
| Mahogany | #8B5E3C | Dark skin |
| Deep Umber | #5C3A1E | Very dark skin |
| *Shadow variants* | *-20% brightness* | *Shading for each* |

#### Steampunk Metals (Core Identity Colors)
| Name | Hex | Usage |
|------|-----|-------|
| Bright Copper | #D4854A | Primary metal — machines, rooftops, accents |
| Aged Copper | #B06830 | Weathered surfaces, older machines |
| Patina Green | #5B8C6A | Oxidized copper — decorative accent |
| Brass Gold | #C8A84E | Gears, trim, UI elements, clocktower |
| Dark Steel | #4A5568 | Structural metal, weapons, heavy machinery |
| Rust Red | #8B4513 | War scars, damaged metal, aged surfaces |
| Chrome Silver | #A8B5C0 | Polished/new components, Aetheric tech |

#### Natural Colors
| Name | Hex | Usage |
|------|-----|-------|
| Deep Earth | #5C4033 | Rich soil, tree trunks, wooden structures |
| Warm Wood | #8B6F4E | Fences, furniture, building frames |
| Light Wood | #C4A882 | Interior floors, crafting tables |
| Stone Gray | #7D8491 | Paths, walls, mountain rock |
| River Blue | #4A8DB7 | Water bodies, clean rivers |
| Deep Water | #2C5F7C | Deep water, ocean |
| Sky Clear | #87CEEB | Clear daytime sky |

#### Aetheric Colors (Magic/Tech Glow)
| Name | Hex | Usage |
|------|-----|-------|
| Aether Blue | #4FC3F7 | Aetheric Ore, power cores, energy effects |
| Aether Purple | #7E57C2 | Raw ore deposits, concentrated energy |
| Aether White | #E0F7FA | Refined fuel, activated machines, UI highlights |
| Aether Glow | #00E5FF | Emission/glow effects on powered machines |

### 3.3 Seasonal Palettes

#### 🌸 SPRING — "The Rekindling"
| Element | Colors | Hex Examples |
|---------|--------|-------------|
| Grass | Fresh bright green, yellow-green | #7EC850, #A8D848 |
| Trees | Light green canopy, pale trunk | #68B840, #90C868 |
| Flowers | Cherry pink, lavender, white, yellow | #F0A0B8, #B8A0D8, #F0E8D0, #F8E060 |
| Sky | Soft blue with wispy clouds | #A0D8F0, #E8F4FF |
| Soil | Dark rich brown (wet/thawed) | #5C4033, #6B4E3A |
| Accent | New growth through old ruins — green on rust | #7EC850 on #8B4513 |
| Mood | **Hopeful, fresh, gentle** |

#### ☀️ SUMMER — "The Forge Season"
| Element | Colors | Hex Examples |
|---------|--------|-------------|
| Grass | Warm deep green, golden patches | #5CA038, #C8B850 |
| Trees | Full dense green, rich shadows | #488028, #306818 |
| Light | Golden, warm, long shadows | #F8E8B0, #F0C860 |
| Sky | Deep clear blue, puffy clouds | #60A8E0, #F0F0F0 |
| Soil | Dry, lighter brown | #8B7355, #A09070 |
| Accent | Copper gleams brighter in summer sun | #E0A060 |
| Mood | **Energetic, productive, warm** |

#### 🍂 AUTUMN — "The Copper Season"
| Element | Colors | Hex Examples |
|---------|--------|-------------|
| Grass | Muted green, golden, brown patches | #88A050, #C8A840, #A08848 |
| Trees | Amber, copper, russet, burnt orange | #D08030, #C06020, #A04818, #E0A040 |
| Fallen Leaves | Scattered warm tones on ground | #C87830, #D8A048 |
| Sky | Hazy amber, soft clouds | #C8B888, #E0D0A0 |
| Soil | Rich, leaf-littered | #6B4E3A, #7D5E4A |
| Accent | Steampunk metals BLEND with autumn foliage — copper everywhere | #D4854A = leaf color |
| Mood | **Warm, reflective, beautiful, bittersweet** |

*Note: Autumn is Ironveil's signature season — the steampunk copper aesthetic naturally harmonizes with fall colors, creating the game's most visually distinctive period.*

#### ❄️ WINTER — "The Quiet Iron"
| Element | Colors | Hex Examples |
|---------|--------|-------------|
| Snow | White, blue-white, soft gray | #F0F0F8, #D8E0F0, #C0C8D8 |
| Trees | Bare branches, dark trunks, some evergreens | #4A3828, #386030 |
| Ice | Pale blue, translucent | #C0E0F0, #A0D0E8 |
| Sky | Gray-blue, heavy clouds | #8898A8, #A0A8B8 |
| Interiors | Warm glow — amber, orange, fire-light | #F0C060, #E0A040, #D08030 |
| Accent | Warm interior light spilling through windows onto cold snow | #F0C060 against #D8E0F0 |
| Mood | **Cozy indoors, stark outdoors, community warmth vs. cold world** |

### 3.4 Time-of-Day Lighting
| Time | Light Shift | Application |
|------|-----------|-------------|
| **Dawn** | +warm pink/orange overlay, soft | Multiply layer at 15% opacity: #FFD0B0 |
| **Morning** | Neutral/slightly warm | No overlay — base palette |
| **Afternoon** | +golden warm | Multiply layer at 10% opacity: #FFF0C0 |
| **Evening** | +deep amber/orange | Multiply layer at 25% opacity: #FFB060 |
| **Night** | +cool blue/dark | Multiply layer at 40% opacity: #203060; reduce saturation 30% |
| **Late Night** | +deep blue/near dark | Multiply layer at 55% opacity: #101840; reduce saturation 50% |

---

## 4.0 CHARACTER DESIGN RULES

### 4.1 Proportions (Chibi/Super-Deformed)
Following Harvest Moon: BTN's character style:

| Body Part | Proportion | Notes |
|-----------|-----------|-------|
| **Head** | ~40% of total height | Large, round, expressive |
| **Body** | ~35% of total height | Compact torso, minimal neck |
| **Legs** | ~25% of total height | Short, stubby |
| **Arms** | Reach to mid-thigh | Short, simple shapes |
| **Hands** | Simplified — mitten or 3-finger | Detail not needed at sprite scale |
| **Eyes** | Large, 2-3 pixels tall | Primary expression vehicle |
| **Mouth** | Small, 1-2 pixels | Secondary expression |
| **Hair** | Distinctive silhouette shapes | KEY identifier per character |

### 4.2 Character Identification Rules
At 16×24 pixel scale, characters MUST be identifiable by:
1. **Hair shape & color** — the #1 identifier
2. **Clothing color** — each NPC has a signature color
3. **Silhouette** — unique outline shape even without color
4. **Accessory** — hat, scarf, goggles, tool (one distinguishing item)

### 4.3 Steampunk Character Elements
Characters should incorporate steampunk elements naturally:
- **Goggles** (on head or around neck) — common accessory
- **Tool belts** — wrenches, gears, pouches
- **Patches & rivets** — on clothing, suggesting repaired/reinforced garments
- **Copper/brass accessories** — buttons, buckles, jewelry
- **Functional clothing** — work aprons, heavy boots, gloves

**Important**: These elements add flavor but should NOT overwhelm the Harvest Moon charm. Characters should still look **cute and approachable first**, steampunk second.

---

## 5.0 ENVIRONMENT DESIGN RULES

### 5.1 Building Design Language
| Element | Rule |
|---------|------|
| **Roofs** | Visible from above — strong color identity per building type |
| **Walls** | Front face visible (door, windows, sign) |
| **Materials** | Mix of: wood (warm brown), stone (gray), copper/metal (steampunk accent) |
| **Details** | Chimneys with smoke, window boxes with flowers, visible gears on mechanical buildings |
| **Scale** | Buildings are 3-6 tiles wide, 3-5 tiles tall (as seen from ¾ view) |
| **War Scar Integration** | Patched walls, mismatched materials, repurposed military components — tells a story |

### 5.2 The "Beautiful Ruin" Principle
War scars in Ironveil are NEVER ugly. They are always rendered as:
- **Textured** — adding visual interest, not eyesores
- **Reclaimed** — nature growing through, repurposed by residents
- **Storied** — each scar implies a history that enriches the world
- **Charming** — a crater becomes a lily pond, a tank becomes a flower bed, a broken wall becomes a trellis

### 5.3 Vegetation Rules
| Type | Style |
|------|-------|
| **Trees** | Rounded canopy masses — 2-3 green tones. Trunk is 1-2 tiles wide. Seasonal color shifts |
| **Bushes** | Small rounded shapes — 1 tile. Decorative and boundary markers |
| **Flowers** | Bright accent colors — seasonal varieties. 1-2 pixels each in clusters |
| **Grass** | Subtle variation in base tiles — avoid flat monotone fields |
| **Crops/Resources** | Distinct shape + color per type. Growth stages visually clear (3-4 stages) |

### 5.4 Water Rendering
| Type | Treatment |
|------|-----------|
| **Rivers** | 2-3 frame animation — gentle flow. Reflected light sparkles |
| **Ponds** | Still water with lily pads, occasional ripple animation |
| **Ocean** | Deeper blue, wave animation at shore, foam sprites |
| **Rain** | Overlay particle effect — diagonal streaks. Puddle tiles appear |
| **Snow** | Overlay particle — gentle fall. Accumulation on surfaces |

---

## 6.0 MACHINE & TECHNOLOGY DESIGN RULES

### 6.1 The Steampunk Design Language
All machines in Ironveil follow these visual rules:

| Principle | Application |
|-----------|------------|
| **Visible Mechanics** | Gears, pistons, pipes, valves are EXPOSED, not hidden. The player should see how things work |
| **Warm Metals** | Copper and brass dominant. Steel for structural/military. Chrome for Aetheric tech |
| **Steam & Smoke** | Active machines emit gentle steam puffs. Adds life and atmosphere |
| **Analog Gauges** | Pressure dials, temperature needles, level indicators — visible on machines |
| **Imperfect Craft** | Slight asymmetry, visible welds, patched panels — these are hand-built, not factory-made |
| **Aetheric Glow** | Powered machines have subtle blue glow from their Aetheric power core |
| **Size Hierarchy** | Tools < Automatons < Utility Mechs < Combat Mechs < Zeppelins |

### 6.2 Machine Readability
At tile scale, each machine must be identifiable by:
1. **Silhouette** — unique outline shape
2. **Color coding** — utility (green accents), combat (red accents), transport (blue accents)
3. **Size** — physically larger machines occupy more tiles
4. **Activity indicators** — steam, glow, movement animations when active

### 6.3 Automaton Design
Automatons are the player's robot team — they should be:
- **Cute** — round shapes, expressive "eyes" (lens/visor), personality in posture
- **Functional** — clearly show their purpose (tools attached, cargo arms, patrol gear)
- **Customizable** — paint jobs, accessories that the player can change
- **Emotive** — simple animations that convey mood (happy bounce, tired slump, alert stance)

---

## 7.0 UI DESIGN RULES

### 7.1 UI Aesthetic
The UI follows a **steampunk instrument panel** aesthetic:
- **Frames**: Brass/copper borders with visible rivets
- **Backgrounds**: Dark leather or aged parchment texture
- **Text**: Clean, readable pixel font — warm cream/white on dark backgrounds
- **Icons**: Consistent 16×16 pixel icons with 1px outline
- **Gauges**: Circular/analog style for health, energy, progress
- **Buttons**: Raised brass appearance with subtle highlight

### 7.2 UI Color Scheme
| Element | Color | Hex |
|---------|-------|-----|
| Panel Background | Dark leather brown | #2C1810 |
| Panel Border | Brass gold | #C8A84E |
| Text Primary | Warm cream | #F0E8D0 |
| Text Secondary | Muted gold | #B8A070 |
| Text Highlight | Aether blue | #4FC3F7 |
| Button Default | Copper | #D4854A |
| Button Hover | Bright copper | #E0A060 |
| Button Pressed | Dark copper | #A06030 |
| Health | Warm red | #E05040 |
| Energy | Aether blue | #4FC3F7 |
| Warning | Amber | #F0A030 |
| Danger | Deep red | #C03020 |
| Success | Spring green | #60C060 |

---

## 8.0 ANIMATION GUIDELINES

### 8.1 Frame Counts
| Animation Type | Frames | Loop |
|---------------|--------|------|
| Character Walk (per direction) | 4 | Yes |
| Character Idle | 2-4 | Yes |
| Character Use Tool | 3-6 | No (play once) |
| NPC Idle Unique | 2-4 | Yes |
| Machine Active | 2-4 | Yes |
| Machine Idle | 1-2 | Yes |
| Water Flow | 3 | Yes |
| Steam Puff | 3-4 | Yes (with random delay) |
| Smoke | 4-6 | Yes |
| Fire/Glow | 3-4 | Yes |
| UI Element Hover | 2 | Yes |
| Crop Growth | 4 stages (not animated — state changes) | N/A |

### 8.2 Animation Principles
- **Snappy**: Animations are quick and responsive — no floaty movement
- **Readable**: Every animation clearly communicates its action
- **Charming**: Add personality — automatons bounce when happy, machines rumble when starting
- **Efficient**: Keep frame counts low — charm comes from timing, not frame count

---

## 9.0 DO's AND DON'Ts

### ✅ DO
- Make everything feel warm and inviting, even in damaged areas
- Use copper/brass as the signature accent color throughout
- Keep characters cute and identifiable at small sprite sizes
- Show the passage of time through visual details (wear, growth, repair)
- Let nature and technology coexist beautifully
- Make war scars tell stories, not just show damage
- Ensure every tile, sprite, and UI element serves readability first

### ❌ DON'T
- Make the post-apocalyptic elements feel grimdark or hopeless
- Use pure black (#000000) for outlines — always use contextual dark colors
- Over-detail sprites — clarity > complexity at this scale
- Make machines look threatening or alien — they should feel handcrafted and lovable
- Use harsh, desaturated, or muddy color palettes
- Create visual noise — every pixel should be intentional
- Forget seasonal variation — the world must feel alive and changing

---

## 10.0 REFERENCE TOUCHSTONES

### Primary References
- **Harvest Moon: Back to Nature** (PS1) — Character style, world feel, tile design, color warmth
- **Stardew Valley** — Modern pixel art evolution of the HM style, UI design, seasonal beauty
- **Steamworld Dig/Heist** — Steampunk character design, machine aesthetic
- **Bastion** — Beautiful post-apocalyptic world that feels warm, not bleak

### Secondary References
- **Spirited Away** (Studio Ghibli) — Warm, detailed, lived-in environments
- **Howl's Moving Castle** (Studio Ghibli) — Steampunk aesthetics that feel organic and charming
- **Nausicaä** (Studio Ghibli) — Post-apocalyptic world reclaimed by nature, hopeful tone
- **Final Fantasy Tactics** — Isometric tile-based environments with strong character

---

*This Art Style Guide is the definitive visual reference for all Ironveil assets.*
*Every artist, every asset, every pixel must align with this document.*

*— Forged by the Djinn*
