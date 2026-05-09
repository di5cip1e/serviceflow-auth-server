# 🎴 Kingdom Cards - Artist Guide

**Project:** Kingdom Cards (Dual-Deck Strategy Game)  
**Style:** Zany Super-Jail  
**Version:** 1.0  
**Art Director:** Mirren

---

## 🎨 Core Visual Identity

### The Vibe
- **Tone:** Unhinged fun — think Cartoon Network meets prison break comedy
- **Energy:** High, chaotic, exaggerated expressions
- **Humor:** Slapstick meets dark comedy — prisoners making the best of a terrible situation

### The "Super-Jail" World
Your kingdom is a **prison** that you're both the inmate AND the warden. Cards represent:
- Inmates (your subjects)
- Guards (your military/nobility)
- contraband (your Creatures)
- Cell blocks (your Buildings)
- The Warden (your Ruler)

The irony: You run the jail, but it's chaos. Your "kingdom" is a maximum-security facility where the prisoners have formed a quirky society.

---

## 🎭 Character Design Rules

### All Characters Have:
1. **Exaggerated Proportions** — Big heads, tiny bodies, or vice versa
2. **Expressive Faces** — Emotion is EVERYTHING
3. **Prison Theme Elements** — Striped clothing, ball & chain, ID numbers, jumpsuits
4. **Personality First** — Each card should make you laugh or go "that's hilarious"

### Style Examples

| Card Type | Style Treatment |
|-----------|-----------------|
| 👑 Ruler | Wears a crown made of spoons. Holding a shiv like a scepter. |
| ⚔️ Nobility | Overly aggressive guard uniform. Tiny mustache. Steroid muscles. |
| ⛪ Clergy | Prison chaplain who somehow runs a meth operation in the basement. |
| 🌾 Peasants | Scrawny inmates. One's tunneling. One's cooking mash in a sock. |
| 🏰 Buildings | Graffiti-covered cell blocks. "KEEP OUT" signs with cartoonish warnings. |
| 📜 Decrees | Prison paperwork that's been hilariously abused/stamped. |
| 🐉 Creatures | The "trust fund inmate" — got a dragon as a "emotional support animal." |

---

## 🃏 Card Frame Design

### Card Structure
```
┌─────────────────────────────────────┐
│ [RARITY]              [CARD ART]    │
│                                     │
│         CHARACTER ART               │
│                                     │
│ ════════════════════════════════════ │
│ CARD NAME                           │
│ ─────────────────────────────────── │
│ Type: [Kingdom/Battle/Both]         │
│ Position: [Throne/Military/etc]     │
│ ═══════════════════════════════════ │
│ STATS BLOCK                         │
│ [Attack] [Defense] [Gold/turn] etc  │
│ ═══════════════════════════════════ │
│ FLAVOR TEXT (funny)                 │
└─────────────────────────────────────┘
```

### Rarity Colors
| Rarity | Color | Border Style |
|--------|-------|--------------|
| Common | Gray | Dashed, worn |
| Uncommon | Green | Solid, scratched |
| Rare | Blue | Shiny, slight glow |
| Epic | Purple | Ornate, glowing |
| Legendary | Gold | Glittering, animated feel |

### Card Frame Style
- **Material:** Metal prison bars as decorative elements
- **Background:** Dirty cell wall texture
- **Corners:** Rounded like old polaroids
- **Text:** Stamped typewriter font for flavor, clean bold for stats

---

## 📋 Initial Card Batch (Demo)

Create **12 demo cards** in this order:

### Ruler Type (1 card)
1. **Warden Whiskers** — The cat who runs the joint. Legendary.

### Nobility Type (2 cards)
2. **Sgt. Bust-Through** — Guard who can never catch inmates. Common.
3. **Captain Ironjaw** — Punches through walls. Rare.

### Clergy Type (2 cards)
4. **Reverend Scoops** — Runs the contraband ice cream stand. Uncommon.
5. **Sister Solitaire** — Plays cards with inmates for souls. Epic.

### Peasants Type (3 cards)
6. **Tunnel Terry** — Always digging. Common.
7. **Shank-Shank** — Has 47 hidden weapons. Rare.
8. **Chef Sack-O-Rice** — Cooks in a sock. Common.

### Building Type (2 cards)
9. **The Block** — 4-person cell. Uncommon.
10. **Yard Tower** — Watchtower with broken spotlight. Rare.

### Creature Type (1 card)
11. **McFluff** — "Emotional support dragon." Actually terrifying. Legendary.

### Decree Type (1 card)
12. **FREE FOR ALL** — All-out prison riot. Everyone fights. Epic.

---

## 🎨 Prompt Guidelines for DALL-E

When generating card art, use prompts like:

**Example 1: Warden Whiskers**
> "Cartoon cat wearing a crooked warden hat made of spoons, holding a golden shiv like a scepter, behind bars, silly confident expression, striped prison suit, bright colors, zany style, animated character design, white background"

**Example 2: Tunnel Terry**
> "Cartoon inmate with huge nose digging with spoon, tiny body giant head proportion, excited expression, striped prison jumpsuit, underground tunnel setting, comedic, zany style, bright bold colors, white background"

**Example 3: McFluff**
> "adorable tiny dragon with giant wings, wearing emotional support animal vest, cute but accidentally terrifying, tiny flames coming out of ears, surrounded by inmates who think it's cute, comedic, zany style, vibrant colors, white background"

---

## ❌ What NOT To Do

- **No realistic art** — This is cartoon, not gritty
- **No dark/gruesome imagery** — Keep it funny, not disturbing  
- **No modern technology** — Period: unclear, feels like jail but timeless
- **No sad characters** — Everyone's weirdly happy about their situation
- **No complex backgrounds** — Cards need clean art, simple backgrounds

---

## 📁 Output Structure

```
kingdom-cards/
├── assets/
│   └── demo-cards/
│       ├── warden-whiskers.png
│       ├── sgt-bust-through.png
│       └── ... (12 total)
├── gdd/
└── guides/
    └── ARTIST_GUIDE.md (this file)
```

---

## 🔧 Tools

- **Image Generation:** OpenAI DALL-E via API
- **API Key:** Stored in `~/.openclaw/secrets.json` (openai_service_key)
- **Output:** Save to `/root/.openclaw/workspace/kingdom-cards/assets/demo-cards/`

---

## ✅ Deliverables

1. This guide reviewed and confirmed
2. 12 demo card images generated
3. Quick review with Art Director (Mirren)

**Let's make some zany cards.** 🎨