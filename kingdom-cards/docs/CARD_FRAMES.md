# Kingdom Cards - Card Frame System

**Purpose:** Provide consistent card framing so AI-generated art is just the illustration portion.

---

## Card Dimensions
- **Total Size:** 400x560px
- **Art Area:** 360x240px (centered, 20px margins)
- **Frame/Border:** 20px surround
- **Stats Area:** Bottom 120px

---

## Frame Templates

### 1. NOBILITY Frames (Rulers, Knights, Advisors)
**Visual:** Ornate gold border with crown motifs
**Border Color:** `#D4AF37` (gold)
**Secondary:** `#8B4513` (saddle brown)
**Art Background:** `#2C1810` (dark mahogany)

### 2. PEASANT Frames (Workers, Merchants, Farmers)
**Visual:** Simple wooden frame with straw accents
**Border Color:** `#8B7355` (wood brown)
**Secondary:** `#D2B48C` (tan)
**Art Background:** `#4A3728` (dark wood)

### 3. BUILDING Frames (Castles, Towers, Structures)
**Visual:** Stone frame with brick pattern
**Border Color:** `#696969` (dim gray)
**Secondary:** `#A9A9A9` (dark gray)
**Art Background:** `#2F2F2F` (charcoal)

### 4. CREATURE Frames (Dragons, Wolves, Mythicals)
**Visual:** Organic frame with vines/claws
**Border Color:** `#4A7C59` (forest green)
**Secondary:** `#2E4A32` (dark green)
**Art Background:** `#1A2F1A` (deep forest)

### 5. CLERGY Frames (Priests, Mages, Scrolls)
**Visual:** Mystical frame with rune accents
**Border Color:** `#6B5B95` (royal purple)
**Secondary:** `#4B3B70` (dark purple)
**Art Background:** `#1F1A2E` (midnight purple)

### 6. DECREE Frames (Spells, Policies)
**Visual:** Parchment/scroll frame
**Border Color:** `#C4A35A` (aged gold)
**Secondary:** `#8B7355` (parchment brown)
**Art Background:** `#F5E6C8` (parchment)

---

## Rarity Borders (Overlay on Frame)
| Rarity | Color | Glow |
|--------|-------|------|
| Common | `#B0B0B0` (silver) | None |
| Uncommon | `#4CAF50` (green) | Subtle |
| Rare | `#2196F3` (blue) | Medium |
| Epic | `#9C27B0` (purple) | Strong |
| Legendary | `#FF9800` (orange) | Pulsing |

---

## Art Generation Prompts

**Template:** Generate ONLY the character/creature illustration. No frame, no text, no border.

**Example Prompt Structure:**
```
Fantasy medieval character, [specific description], centered composition, transparent background preferred, PNG format, [style notes]
```

**Prompt Suffix (always include):**
```
, digital painting, clean illustration, character design, no background scenery, isolated figure
```

---

## Card Layout (Top to Bottom)

```
┌────────────────────────────────────┐
│  [Rarity Gem]        [Elixir Cost] │  ← 40px header
├────────────────────────────────────┤
│                                    │
│                                    │
│         [ILLUSTRATION]             │  ← 240px art area
│           360 x 240                │
│                                    │
│                                    │
├────────────────────────────────────┤
│  [Card Name]                       │  ← Title bar
│  [Type Icon] [Subtype]             │
├────────────────────────────────────┤
│  Kingdom: [Effect]                 │  ← Stats (60px)
│  Battle: [Effect]                  │
└────────────────────────────────────┘
```

---

## Generation Checklist

Before generating art for a card:
1. Identify card category (Nobility/Peasant/Building/Creature/Clergy/Decree)
2. Select matching frame template
3. Generate illustration with prompt suffix
4. Composite: Frame → Illustration → Rarity Border → Stats

---

## Frame Assets Needed
- [ ] 6 base frame PNGs (one per category)
- [ ] 5 rarity border overlays
- [ ] Elixir cost badge
- [ ] Rarity gem icons
- [ ] Type/subtype icons

*Frames can be generated via DALL-E or drawn programmatically via Phaser Graphics API*