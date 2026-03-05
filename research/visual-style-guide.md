# Visual Style Guide - Sci-Fi Station Game

## Overview
Top-down 2D pixel art game set on a space station. Aesthetic should feel lived-in but futuristic—think *Alien* meets *Stardew Valley*.

---

## Color Palette

### Primary Colors
| Role | Color | Hex |
|------|-------|-----|
| Background/Dark | Deep space black | `#0D0D12` |
| Station Walls | Gunmetal gray | `#2A2D36` |
| Metal Surfaces | Steel blue-gray | `#4A5060` |
| Lighting (ambient) | Cyan glow | `#00D4FF` |
| Accent (neon) | Hot magenta | `#FF2D6A` |
| Accent (secondary) | Electric lime | `#A8FF00` |
| Warning/Safety | Orange | `#FF8C00` |

### UI Colors
- Primary text: `#E8E8E8`
- Secondary text: `#8A8A9A`
- Panel backgrounds: `#1A1C24` with `#00D4FF` borders
- Health bar: `#00FF88`
- Energy bar: `#00D4FF`

---

## Character Specifications

### NPC Sprites
- **Size:** 32x32 pixels
- **Hitbox:** 16x16 centered (allows 1-directional tile walking)
- **Frames per animation:** 4-6 frames
- **Animation speed:** 8-12 FPS (game runs at 60, animate every 5-8 frames)

### Player Character
- **Size:** 32x32 pixels
- **Directions:** 4 (up, down, left, right) or 8 for more detail
- **Walk cycle:** 4 frames per direction
- **Idle:** 2-4 frame breathing animation

### Sprite Sheet Layout (Recommended)
```
Row 1: Walk Down (4 frames)
Row 2: Walk Left (4 frames)
Row 3: Walk Right (4 frames)
Row 4: Walk Up (4 frames)
Row 5: Idle Down (2 frames)
Row 6: Idle Left (2 frames)
Row 7: Idle Right (2 frames)
Row 8: Idle Up (2 frames)
```

---

## Tile Specifications

### Base Tiles
- **Size:** 16x16 pixels
- **Grid:** Snap to 16px grid
- **Common tiles needed:**
  - Floor tiles (metal grating, plates)
  - Wall tiles (inner, outer, corner variants)
  - Door tiles (open/closed states)
  - Pipes/cables (horizontal, vertical, junctions)
  - Lights (ceiling, floor indicators)
  - Furniture (tables, chairs, consoles)

### Tile Depth
- Use 1-2px darker edges for floor tiles to create depth
- Wall tiles should have consistent light source (top-left)
- Furniture at 16x16 or 32x32 for larger items

---

## Animation Guidelines

### Character Animations
| Animation | Frames | Speed | Notes |
|-----------|--------|-------|-------|
| Walk cycle | 4 | 8 FPS | Loop smoothly |
| Idle/Breath | 2-4 | 4 FPS | Subtle bob |
| Interact | 1-2 | - | Single frame or quick 2-frame |
| Damage | 4 | 12 FPS | Flash white |

### Environmental Animations
- Blinking lights: 2 frames, 1s cycle
- Computer screens: 4 frames, scrolling data
- Pipes/steam: 3-4 frames, 0.5s cycle
- Elevators: 8+ frames, triggered

---

## Reference Games

### Primary References

**1. Stardew Valley** (ConcernedApe)
- *Why:* Perfect tile-based movement, clear readable sprites, emotional character design
- *Study:* How they handle 32x32 characters in 16x16 world
- *Lesson:* Consistent pixel-perfect rendering, readable silhouettes

**2. FTL: Faster Than Light** (Subset Games)
- *Why:* Best-in-class sci-fi UI and interior design
- *Study:* Ship interiors, control panels, lighting effects
- *Lesson:* Dark palette with selective bright accents

**3. Undertale** (Toby Fox)
- *Why:* Expressive character animation, minimal but impactful pixel art
- *Study:* Character idle animations, screen effects
- *Lesson:* Personality > detail

### Secondary References

**4. Space Station 13** - Station architecture
**5. Escape Velocity** - Space UI aesthetics
**6. Cat Quest 2** - Tile-based world with personality

---

## Do's and Don'ts

### ✅ DO

1. **Use consistent pixel sizes** - All tiles 16x16, all chars 32x32
2. **Limit color palette** - 12-16 colors max for entire scene
3. **Add subtle dithering** - For gradients between similar colors
4. **Use outlines sparingly** - Characters benefit, environment less so
5. **Create clear silhouettes** - Players should recognize NPCs at a glance
6. **Add ambient occlusion** - Darker pixels under objects for depth
7. **Use cyan for tech** - Magenta/orange for alerts/danger
8. **Animate essential elements** - Lights, screens, water/steam

### ❌ DON'T

1. **Mix pixel sizes** - No 8x8 in a 16x16 world
2. **Use too many colors** - Avoid pixel soup
3. **Forget lighting consistency** - Pick a light source and stick with it
4. **Over-detail tiles** - 16x16 needs simple, readable designs
5. **Animate everything** - Static tiles are fine; animate what matters
6. **Use gradients** - Pixel art = stepped color transitions
7. **Skip the edges** - Floor tiles need dark borders for definition

---

## Technical Notes

### Recommended Tools
- Aseprite (paid, best for pixel art)
- Piskel (free, web-based)
- LibreSprite (free, open-source)

### Export Format
- PNG with transparency
- Indexed color (max 256 colors)
- Proper naming: `npc_scientist_walk.png`, `tile_floor_metal.png`

### Performance
- Keep sprite sheets consolidated
- Use sprite batching in engine
- Target 60 FPS on mid-range hardware

---

## Next Steps for Visual Artist

1. **First deliverables:**
   - 3-5 floor tile variants (16x16 each)
   - 3 wall tile variants with corners (16x16 each)
   - Basic NPC template (32x32, 4-direction walk cycle)

2. **Assets to prioritize:**
   - Player character sprite sheet
   - Station corridors (repeatable tiles)
   - Essential furniture (chair, table, console)
   - Door tile (animated open/close)

3. **Questions to answer:**
   - How detailed should background windows be?
   - What's the player character's species/humanoid type?
   - Should we include suit variations for vacuum areas?

---

*Last updated: 2026-03-04 | Researcher subagent*
