# Kingdom Cards - Art Style Guide

**Style:** Zany Super-Jail (inspired by Adult Swim's Superjail!)

---

## Core Style Characteristics

Based on the "Superjail!" animated series aesthetic:

### Visual Elements
- **Hand-drawn, loose, organic look** — Avoid clean vector lines
- **Baroque & complicated** — Elaborate compositions, busy details
- **Psychedelic colors** — Saturated, neon-bright palettes
- **Cartoonish grotesquerie** — Exaggerated features, bulging eyes, wild expressions
- **Constant motion feel** — Dynamic poses, energetic staging
- **Whimsical chaos** — Fun but slightly unhinged energy

### Color Palette
- **Primary:** Hot pinks, electric blues, toxic greens, violent purples
- **Accents:** Neon yellows, blood reds, candy oranges
- **Vibes:** High contrast, oversaturated, neon-soaked

### Character Design
- Exaggerated proportions (big heads, tiny bodies, or vice versa)
- Wacky facial expressions — manic grins, wild eyes, grimaces
- Oversized hands/feet
- Exaggerated accessories (crowns too big, swords too small)
- Cartoonish menace meets slapstick comedy

---

## Cookie-Cutter Prompt Template

### Base Template
```
[Character description], IN THE STYLE OF SUPERJAIL ANIMATED TV SHOW, hand-drawn cartoon aesthetic, psychedelic vibrant colors, baroque elaborate composition, exaggerated features, manic expression, whimsical grotesque cartoon, bold outlines, saturated neon palette, digital painting, character design, centered, isolated figure, no background
```

### By Card Type

**RULERS (Kings, Queens)**
```
Fantasy medieval [king/queen] wearing ornate [crown/regalia], portly or wacky proportions, manic royal grin, psychedelic purple and gold robes, IN THE STYLE OF SUPERJAIL, hand-drawn cartoon, exaggerated facial features, whimsical grotesque, vibrant saturated colors, baroque elaborate details, digital painting
```

**KNIGHTS**
```
Fantasy medieval knight in [armor type], ridiculous oversized helmet, wacky battle stance, manic determined grin, IN THE STYLE OF SUPERJAIL, hand-drawn cartoon, exaggerated armor proportions, psychedelic color scheme, whimsical cartoon, bold outlines, vibrant saturated colors
```

**CREATURES**
```
Fantasy medieval [creature type] with exaggerated features, wacky monstrous expression, psychedelic [color] skin, IN THE STYLE OF SUPERJAIL, hand-drawn cartoon, grotesque whimsical monster, oversaturated colors, baroque elaborate details, chaotic energy
```

**PEASANTS**
```
Fantasy medieval [occupation] with exaggerated features, wacky expression, colorful ragged clothing, IN THE STYLE OF SUPERJAIL, hand-drawn cartoon, manic expression, psychedelic bright colors, whimsical grotesque, bold outlines
```

**BUILDINGS**
```
Fantasy medieval [building type] with exaggerated proportions, wacky architecture, IN THE STYLE OF SUPERJAIL, hand-drawn cartoon, psychedelic colors, baroque elaborate structure, whimsical cartoon, vibrant saturated, bold outlines
```

**CLERGY**
```
Fantasy medieval [priest/mage] with exaggerated features, wild mystic expression, psychedelic [purple/gold] robes, wacky magical accessories, IN THE STYLE OF SUPERJAIL, hand-drawn cartoon, whimsical grotesque, oversaturated colors
```

**DECREES (Spells)**
```
Fantasy medieval spell effect with psychedelic energy, wacky magical swirl, IN THE STYLE OF SUPERJAIL, hand-drawn cartoon, vibrant neon colors, baroque elaborate magical patterns, chaotic magical energy, bold outlines
```

---

## Generation Settings

### CellCog Parameters
```python
result = client.create_chat(
    prompt="[CHOOSE TEMPLATE ABOVE]",
    notify_session_key="agent:main:main",
    task_label="[card-name]-art",
    chat_mode="agent"
)
```

### Quality Notes
- Use "agent" mode for single images
- Complex multi-character scenes → "agent team"
- Files download to `~/.cellcog/chats/{chat_id}/`
- Rename to match card name after download

---

## Rarity Visual Guidelines

| Rarity | Style Tweak |
|--------|-------------|
| Common | Muted colors, simpler lines, more basic wackiness |
| Uncommon | Brighter colors, moderate exaggeration |
| Rare | Saturated neon, heavy baroque details |
| Epic | Maximum psychedelic, extreme proportions |
| Legendary | All-out Superjail madness, glowing effects |

---

## Prohibited Elements
- Realistic rendering
- Clean vector lines
- Muted/dark color palettes
- Serious expressions
- Simple backgrounds

## Required Elements
- Exaggerated features
- Vibrant oversaturated colors
- Hand-drawn cartoon energy
- Whimsical chaos
- Baroque details