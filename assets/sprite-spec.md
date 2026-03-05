# Sprite Spec - Character Sprites

## Overview
Character sprites for Station Command, following 16-bit pixel art conventions. Characters range from 16x16 (simple NPCs) to 64x64 (player with full animation frames).

---

## Size Standards

| Sprite Type | Size | Grid Alignment |
|-------------|------|----------------|
| Tiny NPCs/ambient | 16x16 | 16px tile |
| Standard NPCs | 32x32 | 32px tile |
| Player character | 32x32 base, 48x48 detailed | 32px tile |
| Boss/large characters | 48x48 to 64x64 | 64px tile |

---

## Color Palette Guidelines

### Primary Station Palette
```
Background/Walls:    #1A1A2E, #16213E, #0F3460
Metal Surfaces:      #4A5568, #718096, #A0AEC0
Accent Lights:       #00FFC6 (cyan), #FF6B6B (warning red), #FFE66D (amber)
Skin Tones:          #D4A574, #C4956A, #A67C52
```

### NPC Palette Variations
- **Engineers**: Orange #E67E22 highlights, gray clothing
- **Scientists**: White/lab coat #ECF0F1, blue #3498DB accents
- **Security**: Dark blue #2C3E50, red #E74C3C accents
- **Aliens/Visitors**: Species-specific palettes (coordinate with narrative)

---

## Animation Frames

### Walking (8-directional)
- 4 frames per direction minimum
- 8 frames for smooth player movement
- Frame rate: 8-12 FPS (game runs at 60 FPS, animate every 5-8 frames)

### Idle
- 2-4 frame breathing animation
- Subtle, not distracting

### Interaction
- 1 frame reach/gesture
- Tool-specific (welding spark, data pad tap, etc.)

---

## Style Guidelines

1. **Outline:** Dark 1px outlines on characters for visibility against varied backgrounds
2. **Shading:** Top-left light source, 2-3 color shifts per sprite
3. **Eyes:** Visible, expressive where relevant (dialogue-heavy game)
4. **Proportions:** Chibi-friendly (large head, small body) at 32x32 for readability; more realistic at 48x48+

---

## Sprite Sheet Layout

```
Row 1: Idle (4 frames)
Row 2: Walk Down (4 frames)
Row 3: Walk Left (4 frames)
Row 4: Walk Right (4 frames)
Row 5: Walk Up (4 frames)
Row 6: Interaction (2 frames)
```

**Total per character:** ~22 frames minimum

---

## References
- Kenney assets (kenney.nl) for placeholder base
- Stardew Valley for walking animation timing
- Undertale for expressive pixel faces
- FTL for industrial/sci-fi color usage
