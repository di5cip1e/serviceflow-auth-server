# The Counsel - Complete Game Flow

## Overview

A grand strategy game where you serve as Counsel to an autonomous AI Ruler. The ruler makes their own decisions based on their personality traits, and you influence (but do not control) their choices.

---

## Game Flow: Phase 1 & 2

### Step 1: Personality Quiz (QuizScene.js)
**Duration**: ~2 minutes

1. Player answers 5 questions about governance
2. Each answer weights different government types:
   - Autocracy (control, order)
   - Democracy (representation, balance)
   - Theocracy (divine guidance, morals)
   - Oligarchy (wealth, elite power)
   - Militarism (expansion, martial strength)
3. Highest score determines government type

**Result**: Government type selected

---

### Step 2: Identity Creation (RulerCreationScene.js)
**Duration**: ~3 minutes

**Part A: Names & Gender**
1. Name your ruler
2. Choose gender (Male/Female/Non-Binary)
3. Name your nation
4. Name your capital city

**Part B: Trait Selection**
1. **Budget**: 7 base points
2. **Positive Traits** (10 available):
   - 2-point traits: Brilliant, Charismatic, Decisive, Diplomatic, Shrewd
   - 1-point traits: Just, Ambitious, Pious, Merciful, Brave
3. **Negative Traits** (10 available, max 3):
   - 2-point refund: Cruel, Paranoid, Wrathful, Slothful, Weak-Willed
   - 1-point refund: Greedy, Arrogant, Hateful, Impulsive, Stubborn
4. Strategic decision: Accept flaws to gain more strengths

**Result**: Fully defined player ruler saved to `window.gameState`

---

### Step 3: World Generation (WorldManager.js)
**Duration**: ~3 seconds

**Automated Process**:
1. Generate 100x100 tile map with procedural terrain
2. Create 6 biomes: Ocean, Desert, Arctic, Plains, Forest, Mountains
3. Determine number of nations (3-9 including player)
4. Generate 2-8 AI rivals using **exact same trait system**:
   - Each AI gets random gender, unique names
   - Random government type
   - 7 points + negative trait refunds
   - Unique personality combinations
5. Select fair starting locations (high fertility, well-spaced)
6. Create capital city for each nation
7. Calculate initial influence borders
8. Center camera on player's capital

**Result**: Living world with diverse rival rulers

---

### Step 4: World Summary Screen
**Duration**: Player-paced

**Display**:
- Player nation overview
- List of all rival nations showing:
  - Ruler name and government type
  - Nation color
  - Top 3 positive traits
  - Top 2 negative traits
- Phase 2 completion message

**Action**: Click "Begin Your Counsel" to start

---

### Step 5: Map View (CURRENT STATE)
**Duration**: Ongoing

**Interactive Map Features**:
- Pan by dragging
- Zoom with scroll wheel (0.3x to 3x)
- Hover tiles to see:
  - Biome type
  - Grid coordinates
  - Owning nation
  - Influence percentage

**Visual Elements**:
- Territory shaded with nation colors
- Border lines between nations
- Cities displayed as circles
- City size grows with population
- Capital cities marked with golden stars
- City names visible when zoomed in

**Background Systems Running**:
- Population growth (2% per turn)
- Influence expansion (0.5 tiles per turn)
- Border recalculation (every 1 second)
- Visual scaling of cities

---

## Data Saved in window.gameState

```javascript
{
  // Player ruler
  ruler: {
    name: "Queen Elara",
    gender: "female",
    governmentType: "democracy",
    positiveTraits: ["brilliant", "diplomatic", "just"],
    negativeTraits: ["impulsive"]
  },
  
  // Player nation
  nation: {
    name: "Valdoria",
    capital: "Thornhaven"
  },
  
  // World data
  world: {
    nations: [
      // Player nation (id: 0)
      {
        id: 0,
        name: "Valdoria",
        ruler: { /* full ruler data */ },
        color: "#c94a4a",
        cities: [
          { name: "Thornhaven", x: 45, y: 52, population: 5123, isCapital: true }
        ]
      },
      // AI nations (id: 1-8)
      // ... each with unique ruler, traits, cities
    ],
    turnNumber: 0
  },
  
  initialized: true
}
```

---

## What's Ready for Phase 3

### 1. AI Ruler Personalities (Fully Defined)
Every AI nation has:
- Government ideology
- Positive traits (strategic strengths)
- Negative traits (character flaws)
- Unique ruler name and gender

**Example AI Ruler**:
```
King Lysander of Emberfall (Militarism)
Capital: Stormbreak
Positive: Decisive, Brave, Ambitious
Negative: Wrathful, Arrogant
```

### 2. World State (Live Data)
- 100x100 tile map with biomes
- 3-9 nations with growing cities
- Dynamic influence borders
- Population tracking per city
- Turn counter system

### 3. Foundation for Gameplay
Ready to implement:
- **Counsel System**: Player types advice in plain English
- **LLM Integration**: AI ruler processes advice through personality filter
- **Decision Making**: Traits influence ruler's response
- **Actions**: Expand territory, build cities, wage war, make peace
- **Events**: Random challenges requiring ruler decisions
- **Resources**: Gold, food, military (already have placeholder variables)

---

## Phase 3 Preview: The Counsel Interface

### How it will work:

1. **Player types advice**: "We should expand our borders to the north"

2. **LLM receives context**:
   ```
   You are King Lysander, ruler of Emberfall.
   Government: Militarism
   Traits: Decisive, Brave, Ambitious, Wrathful, Arrogant
   
   Your counsel advises: "We should expand our borders to the north"
   
   Given your personality, will you:
   A) Listen and expand north
   B) Ignore and pursue a different strategy
   C) Agree but modify the approach
   ```

3. **AI makes autonomous decision** based on traits:
   - Ambitious + Decisive → Likely to expand aggressively
   - Arrogant → Might dismiss counsel's reasoning
   - Wrathful → Could escalate to military conquest
   - Result: "Your counsel's advice is noted. We shall march north immediately and claim those lands by force!"

4. **Game executes decision**: Borders expand, troops move, events trigger

---

## Current Phase Status

✅ **Phase 1**: Ruler creation with trait system
✅ **Phase 2**: World generation with AI rivals
⏳ **Phase 3**: Counsel system + AI decision making (NEXT)

---

## Console Commands for Debugging

```javascript
// View complete game state
console.log(window.gameState);

// Check all nations
console.log(window.gameState.world.nations);

// See specific nation
console.log(window.gameState.world.nations[1]); // First AI nation

// Check ruler traits
window.gameState.world.nations.forEach(n => {
  console.log(`${n.name}: +${n.ruler.positiveTraits.length} traits, -${n.ruler.negativeTraits.length} flaws`);
});
```

---

## Design Philosophy

**Player as Counsel, Not Commander**:
- You advise, the AI decides
- Ruler's personality determines response
- Traits create consistent but unpredictable behavior
- Player influence grows through trust and wise counsel

**Autonomous AI Rulers**:
- Every nation (including rivals) has full personality
- Decisions driven by government type + traits
- Background macro-management (city growth, borders)
- Creates living, dynamic world

**Strategic Depth Through Personality**:
- Brilliant ruler sees through deception
- Arrogant ruler ignores good advice
- Ambitious ruler expands aggressively
- Merciful ruler avoids harsh punishments
- Trait combinations create unique rulers

---

**Ready to build Phase 3 when you are!** 🎮👑
