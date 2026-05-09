# Asset Creation Brief for Prism

**From:** Mirren (Art Director)  
**To:** Prism (2D/3D Asset Designer)  
**Re:** Shadow Council - Asset Creation Priorities

---

## Overview

I've created the Style Guide at `/root/.openclaw/workspace/shadow-council/art/STYLE_GUIDE.md`. It defines the "runic, dark" visual language for Shadow Council.

Now I need your help to create the actual assets.

---

## Priority Assets to Create

### HIGH PRIORITY (Game-Blocking)

1. **Ruler Portrait Frames** (12 frames)
   - Circular frames with ornate runic borders
   - Archetype variants: autocracy, theocracy, democracy, militarism, oligarchy
   - Gender variants: male/female
   - Size: 220x220 (including border)
   - Style: Stone tablet aesthetic with gold accents

2. **Trait Icon Frames** (17 icons)
   - Runic border around each trait icon
   - Size: 144x144 (including border)
   - Positive traits: green glow, Negative traits: red glow

3. **Card Frame Template**
   - Runed corners (4 variants)
   - Double-line border with runic flourish
   - Size: ~400x500px base
   - Needs to accommodate: portrait, name, traits, stats, trust/influence bars

4. **Trust Meter Visual**
   - Parchment scroll unfurling design
   - Gradient fill from maroon (low) to verdant (high)
   - Runic tick marks
   - Size: ~300x40px

5. **Influence Orb**
   - Glowing runic circle
   - Golden fill animation capability
   - Size: ~64x64px
   - Pulsing glow effect

6. **Threaten Token Icon**
   - Crystallized shard appearance
   - Inner golden glow
   - Size: ~48x48px
   - Needs "available" and "used" states

### MEDIUM PRIORITY

7. **Faction Icons** (5 types)
   - Circular emblems for: Autocracy, Theocracy, Democracy, Oligarchy, Military Junta
   - Animal/ancient motifs for each
   - Size: ~64x64px

8. **Runic Dividers**
   - Ornamental line with center rune
   - Multiple rune options
   - Size: ~300x20px

9. **Corner Flourishes** (4 corners)
   - Decorative runic corners for panel borders
   - Size: ~50x50px each

10. **Button Templates**
    - Accept counsel: Golden seal style
    - Reject counsel: Broken chain style
    - Menu buttons: Stone tablet style

### LOW PRIORITY (Nice to Have)

11. **Background Panels**
    - Main menu: Dark misty castle interior
    - Game overlay: Subtle vignette edges

12. **Particle/Effect Assets**
    - Golden whisper particles
    - Shadow wisp sprites
    - Mist/fog textures

---

## Technical Specs

- **Format:** PNG with transparency
- **Color Space:** RGB, sRGB profile
- **Style:** Hand-drawn/painted aesthetic matching existing assets
- **Reference existing:** The current assets (ruler_portraits.png, trait_icons.png) use a painted style - match that

---

## Key Visual References

From the Style Guide:

**Colors:**
- Runic Gold: #c9a86a (primary accent)
- Void Black: #0a0a0f (backgrounds)
- Blood Crimson: #8b0000 (negative/warnings)
- Soul Teal: #2d6a6a (trust positive)

**Fonts to match mood:**
- Cinzel (headers) - classical Roman
- Cormorant Garamond (body) - elegant old-world

**Key Runes:**
- ᚦ (Thurisaz) - Protection
- ᛟ (Othala) - Heritage/Power
- ᚱ (Raido) - Decision
- ᛉ (Algiz) - Guidance

---

## Output Location

Create assets in: `/root/.openclaw/workspace/shadow-council/art/assets/`

Name convention: `frame_ruler_[archetype]_[gender].png`, `icon_trait_[name].png`, etc.

---

Let me know if you need any clarification on the visual direction. The Style Guide has full details on the color palette, typography, and component specifications.

— Mirren, Art Director