# Shadow Council - Art Style Guide

**Project:** Shadow Council  
**Art Director:** Mirren  
**Style:** Runic, Dark Fantasy  
**Version:** 1.0

---

## 1. Executive Vision

Shadow Council is a strategy game about supernatural advisors whispering into the minds of rulers. The visual language should evoke **ancient mysteries, arcane wisdom, and shadowed power**. Players should feel like they're peering into a forbidden realm where gods and ghosts walk alongside mortals.

**Core Adjectives:** Mysterious · Powerful · Ancient · Arcane

---

## 2. Color Palette

### Primary Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Void Black** | `#0a0a0f` | Primary backgrounds, deep shadows |
| **Abyss Blue** | `#0d1b2a` | Secondary backgrounds, night skies |
| **Obsidian** | `#1a1a2e` | Card backgrounds, panels |
| **Deep Slate** | `#16213e` | Hover states, subtle depth |

### Accent Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Runic Gold** | `#c9a86a` | Borders, highlights, active states |
| **Eldritch Amber** | `#b8860b` | Secondary accents, hover gold |
| **Blood Crimson** | `#8b0000` | Negative traits, warnings, aggression |
| **Soul Teal** | `#2d6a6a` | Trust indicators, positive states |
| **Spectral Purple** | `#4a0e4e` | Special abilities, magic effects |
| **Ghostly Silver** | `#a8a8b3` | Disabled states, muted text |

### Functional Colors

| Purpose | Color | Hex |
|---------|-------|-----|
| Positive trait | Emerald glow | `#2d6a4f` |
| Negative trait | Crimson stain | `#9d0208` |
| Trust high | Verdant | `#40916c` |
| Trust low | Maroon | `#6a040f` |
| Threaten token | Molten gold | `#ffd700` |
| UI highlight | Runic gold | `#c9a86a` |
| Text primary | Parchment | `#e8e4d9` |
| Text secondary | Faded silver | `#9a9a9a` |

---

## 3. Typography

### Primary Font: Cinzel (Google Fonts)
- **Usage:** Headers, titles, faction names, major UI elements
- **Weight:** 400 (regular), 700 (bold)
- **Style:** Classical Roman inscriptional feel with sharp serifs
- **Mood:** Ancient, authoritative, carved in stone

### Secondary Font: Cormorant Garamond (Google Fonts)
- **Usage:** Body text, descriptions, lore snippets, tooltips
- **Weight:** 400, 500, 600
- **Style:** Elegant, old-world, book-like
- **Mood:** Scholarly, mysterious, timeless

### Monospace: Fira Code
- **Usage:** Numbers, stats, values, debug info
- **Weight:** 400
- **Style:** Clean, technical contrast to ornate headings

### Type Scale

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Game Title | Cinzel | 48px | 700 |
| Section Header | Cinzel | 28px | 700 |
| Card Title | Cinzel | 18px | 600 |
| Body Text | Cormorant | 16px | 400 |
| Stats/Numbers | Fira Code | 14px | 400 |
| Tooltips | Cormorant | 14px | 400 |
| Labels | Cinzel | 12px | 600 |

---

## 4. Visual Themes

### 4.1 Runic Elements

All UI should incorporate subtle runic styling:

- **Border style:** Double-line borders with runic flourish corners
- **Background texture:** Subtle stone/carved texture overlays
- **Divider lines:** Ornamental divider with center rune motif
- **Button style:** Beveled stone tablet aesthetic

**Key Runes to Feature:**
- ᚦ (Thurisaz) - Protection, giant wisdom
- ᛟ (Othala) - Heritage, ancestral power  
- ᚱ (Raido) - Journey, decision-making
- ᛉ (Algiz) - Higher self, guidance

### 4.2 Shadow Imagery

- **Ambient effects:** Subtle fog/mist particles drifting across panels
- **Silhouettes:** Ruler silhouettes with shadow wisps emanating
- **Whisper visual:** Faint golden particle trails when counsel is active
- **Realm divider:** Veil-like gradient between "real" and "shadow" worlds

### 4.3 Ancient Power Symbols

- **Faction crests:** Circular emblems with animal/ancient motifs
- **Influence meter:** Glowing runic circle that fills with golden light
- **Threaten tokens:** Crystallized shard icons with inner glow
- **Trust meter:** Parchment scroll unfurling animation

---

## 5. UI Component Styling

### 5.1 Cards (Ruler/Counsel Cards)

**Card Specs:**
- Background: #1a1a2e with rgba(201, 168, 106, 0.1) inner glow
- Border: 2px #c9a86a solid
- Corner radius: 8px
- Shadow: 0 4px 20px rgba(0, 0, 0, 0.5)
- Hover: Border brightens to #ffd700, slight scale (1.02)

### 5.2 Buttons

- **Default:** Obsidian background, gold border, gold text
- **Hover:** Subtle inner glow, border brightens
- **Active:** Pressed stone effect (inset shadow)
- **Disabled:** Grayed out, no border glow

### 5.3 Panels/Modals

- Background: #0d1b2a with subtle noise texture
- Border: 3px decorative runic frame
- Header: Darker bar with title in Cinzel
- Close button: X with runic circle surround

### 5.4 Portrait Frames

- Shape: Perfect circle (or oval for variety)
- Border: 3px gold with decorative corner flourishes
- Inner glow: Subtle radial gradient from center
- Shadow: Long shadow extending diagonally down-right

---

## 6. Animation & Effects

### Transitions
- **Card hover:** 200ms ease-out scale and glow
- **Panel open:** 300ms fade-in with slight slide-up
- **Value changes:** Counter animation with golden particle burst

### Ambient Effects
- **Counsel whisper:** Golden particles flowing from shadow to ruler
- **Trust change:** Ripple effect on trust meter
- **Threaten token:** Pulsing glow when token is available

---

## 7. Asset Requirements

### High Priority

1. **Background Panels** 
   - Main menu background (dark, misty castle interior)
   - Game board overlay (subtle vignette edges)
   
2. **UI Frames**
   - Ruler portrait frame (circular, ornate)
   - Trait icon frame (runic border)
   - Card frame (runed corners)
   
3. **Status Indicators**
   - Trust meter (scroll/unfurling visual)
   - Influence orb (glowing runic circle)
   - Threaten token (crystallized shard)

4. **Interaction Elements**
   - Accept counsel button (golden seal)
   - Reject counsel button (broken chain)
   - Menu buttons (stone tablet style)

### Medium Priority

5. **Decorative Elements**
   - Runic dividers
   - Corner flourishes (4 variants)
   - Faction icons for each government type
   
6. **Portrait Frames**
   - 12 unique ruler portrait frames (one per archetype)
   - Gender variants (male/female versions)

### Low Priority

7. **Environmental**
   - Particle systems for mist/fog
   - Shadow wisp animations
   - Golden whisper particle trails

---

## 8. Existing Assets to Reference

Current assets in /assets/:
- ruler_portraits.png.webp - 12 ruler portraits (200x200)
- trait_icons.png.webp - 17 trait icons (128x128)
- counsel_ui_overlay.png.webp - Counsel UI overlay
- strategy_game_spritesheet.png.webp - Game sprites (terrain, cities, structures)

---

## 9. CSS Variables Quick Reference

```css
:root {
  /* Primary */
  --void-black: #0a0a0f;
  --abyss-blue: #0d1b2a;
  --obsidian: #1a1a2e;
  --deep-slate: #16213e;
  
  /* Accents */
  --runic-gold: #c9a86a;
  --eldritch-amber: #b8860b;
  --blood-crimson: #8b0000;
  --soul-teal: #2d6a6a;
  --spectral-purple: #4a0e4e;
  --ghostly-silver: #a8a8b3;
  
  /* Text */
  --text-primary: #e8e4d9;
  --text-secondary: #9a9a9a;
  
  /* Functional */
  --trust-high: #40916c;
  --trust-low: #6a040f;
  --trait-positive: #2d6a4f;
  --trait-negative: #9d0208;
  --token-gold: #ffd700;
}
```

---

*Art Direction by Mirren - For the Shadow Council*