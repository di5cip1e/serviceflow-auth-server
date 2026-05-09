# Quick Start Guide - The Counsel

## 🎮 How to Play (Current Build)

### Phase 1: Create Your Ruler (~5 minutes)

1. **Answer 5 Questions**
   - Each question reveals your governance philosophy
   - Determines your government type

2. **Define Identity**
   - Name your ruler
   - Choose gender (Male/Female/Non-Binary)
   - Name your nation
   - Name your capital city

3. **Allocate Traits** (Strategic Decision!)
   - You have **7 base points**
   - Spend on positive traits (1-2 pts each)
   - **Optional:** Take negative traits (refund 1-2 pts each, max 3)
   - Use refunded points to buy more strengths!

**Example Build:**
```
Budget: 7 base + 3 from flaws = 10 points

Positive: Brilliant (2), Diplomatic (2), Just (1), Ambitious (1), Pious (1) = 7 pts
Negative: Impulsive (1), Greedy (1) = +2 pts refund
Total: 9/10 points spent
```

---

### Phase 2: World Generation (~3 seconds)

**Automatic - Just Watch!**

The game generates:
- 100×100 tile procedural map
- 6 biomes (Ocean, Desert, Arctic, Plains, Forest, Mountains)
- 3-9 rival AI nations
- Each AI ruler created with same trait system as you!

**View Summary Screen:**
- See all rival nations
- Their rulers' names and traits
- Their government types
- Your starting position

Click **"Begin Your Counsel"**

---

### Phase 2: Interactive Map (Current Gameplay)

#### 🖱️ **Controls**

**Desktop:**
- **Drag** = Pan camera around map
- **Scroll Wheel** = Zoom in/out (0.3x to 3x)
- **Hover** = See tile information

**Mobile:**
- **Touch Drag** = Pan camera
- **Pinch** = Zoom in/out
- **Tap** = View tile info

#### 📊 **UI Elements**

**Top-Right Panel (Stats):**
- Your nation name
- Current turn number
- Number of cities
- Total population
- Territory controlled
- List of rival nations

**Center-Bottom (Turn Controls):**
- **"Advance Turn →"** = Progress game by 1 turn
- **"⏸ Pause"** = Stop real-time updates

**Hover Info (Top-Right):**
- Biome type
- Grid coordinates
- Owner nation
- Influence %

#### 🎯 **What Happens Each Turn**

1. **Population Growth** (2% per turn)
   - Cities visually grow on map
   - Notification when reaching new size tier

2. **Influence Expansion** (0.5 tiles per turn)
   - Borders naturally expand
   - Territory colors spread
   - Contested zones appear

3. **Stats Update**
   - Real-time population tracking
   - Territory count updates
   - Console logs nation statistics

#### 🏙️ **City Sizes**

Watch your cities grow:
- **Small** (5K): Starting size, 1x scale
- **Medium** (15K+): 1.5x scale, subtle glow
- **Large** (40K+): 2x scale, bright glow
- **Huge** (100K+): 2.5x scale, strong glow

**Capitals** have golden star markers ⭐

---

## 🎨 Visual Guide

### Map Legend

**Biomes:**
- 🌊 Deep Blue = Ocean (impassable)
- 🏜️ Sandy Tan = Desert (low fertility)
- ❄️ Icy White = Arctic (harsh)
- 🌾 Grass Green = Plains (best land!)
- 🌲 Dark Green = Forest (moderate)
- ⛰️ Rocky Gray = Mountains (defensive)

**Nation Colors:**
- Red, Blue, Gold, Green, Purple, Orange, Cyan, Pink, Lime
- Territory tinted with nation color
- Border lines where nations meet

**Cities:**
- Circles colored by nation
- Size = population level
- Star = capital city
- Glow = large population
- Label = city name + pop (when zoomed)

---

## 🎯 Current Objectives

**Phase 2 Goals:**

1. **Explore the World**
   - Pan around to see all nations
   - Find best terrain (green plains)
   - Identify rival positions

2. **Watch Growth**
   - Advance turns to see changes
   - Track your population increase
   - Watch borders expand

3. **Study Rivals**
   - Check their trait combinations
   - Note their government types
   - Observe their territories

4. **Learn the Map**
   - Identify strategic chokepoints
   - Find fertile expansion areas
   - Plan future growth

---

## 💡 Pro Tips

### Trait Selection Strategy

**Balanced Build:**
- 2-3 major traits (2 pts each)
- 2-3 minor traits (1 pt each)
- 1-2 acceptable flaws for extra points

**Specialist Build:**
- Take 3 negative traits (max refund)
- Focus heavily on one area
- Example: Brilliant + Decisive + Shrewd + Diplomatic = master strategist

**Safe Build:**
- No negative traits
- Spread 7 points across varied traits
- Well-rounded, no weaknesses

### Map Awareness

**Good Starting Positions:**
- Near large plains areas (80% fertility)
- Some forest for variety
- Natural borders (ocean, mountains)
- Distance from aggressive neighbors

**Expansion Priorities:**
- Secure plains first (high growth)
- Create buffer zones
- Contest chokepoints
- Avoid arctic/desert until later

---

## 🐛 Debug Console

Press **F12** to open browser console:

```javascript
// View complete game state
console.log(window.gameState);

// Check all nations
console.log(window.gameState.world.nations);

// See specific AI ruler
const aiRuler = window.gameState.world.nations[1].ruler;
console.log(aiRuler);

// List all traits
console.log('Positive:', aiRuler.positiveTraits);
console.log('Negative:', aiRuler.negativeTraits);
```

---

## 📋 Keyboard Shortcuts

Currently none - use mouse/touch controls.

(Phase 3+ will add hotkeys for common actions)

---

## 💬 Phase 3: Using the Counsel System

### Opening the Counsel Interface

**Click the 💬 button** in bottom-right corner

**What you'll see:**
- Messenger-style chat interface
- Your ruler's name at top
- Message history area
- Text input at bottom

### Giving Advice

**Type your counsel:**
```
"We should expand our borders to the fertile 
plains in the north."
```

**Press Enter or click ➤ to send**

### Reading Ruler Responses

**Acceptance (✓):**
```
King Aldric: "Your counsel is wise. We shall 
              march north immediately!"
              ✓ Accepted
```
- Green checkmark
- Trust increases
- Mood improves
- Advice executed (future phase)

**Rejection (✗):**
```
King Aldric: "I do not believe this is the 
              right path for our realm."
              ✗ Rejected
```
- Red X mark
- Trust decreases slightly
- Mood worsens
- Advice ignored

### Using Threaten Tokens

**When Ruler Rejects + You Have Tokens:**

A dialog appears:
```
╔═══════════════════════════╗
║ ⚔ Ruler Rejected Your    ║
║    Counsel                ║
║                           ║
║ [⚔ Threaten (1 Token)]    ║
║ [Accept Rejection]        ║
╚═══════════════════════════╝
```

**Choose "Threaten":**
- Forces ruler to accept
- Costs 1 token
- Damages trust (-20%)
- Damages mood (-30%)
- Shows ⚔ Threatened status

**Choose "Accept":**
- No token used
- Rejection stands
- No extra damage

### Earning Threaten Tokens

**Two Ways to Gain:**

1. **Time-Based (Slow)**:
   - 1 token per 2 minutes
   - Progress bar shows next token
   - Maximum 3 tokens

2. **Mistake-Based (Instant)**:
   - When ruler makes bad decision
   - Grants 1 token immediately
   - Notification appears

**Token Display (Top-Center):**
```
⚔ Threaten Tokens
2 / 3
[========>-----]
```

### Understanding Mood & Trust

**Stats Panel (Top-Right):**

**Mood:**
- 😊 Pleased: Ruler is happy, more receptive
- 😐 Neutral: Normal behavior
- 😠 Frustrated: Ruler is angry, resistant

**Trust:**
- 75%+ (Green): Ruler trusts you greatly
- 40-75% (Gold): Moderate trust
- Below 40% (Red): Ruler is skeptical

**How to Build Trust:**
- Give advice aligned with their traits
- Accept rejections gracefully
- Don't overuse Threaten tokens

### Strategy Tips

**Match Advice to Traits:**

**Ambitious Ruler:**
✓ "Let's expand our territory"
✗ "Let's focus internally"

**Diplomatic Ruler:**
✓ "We should negotiate peace"
✗ "We should crush them"

**Arrogant Ruler:**
✗ "Your last decision was wrong"
✓ "Your wisdom guides us..."

**Read the Mood:**
- Wait for good mood if possible
- Frustrated rulers reject more
- Pleased rulers more open

**Save Tokens:**
- Don't threaten unless critical
- Each threat damages relationship
- Build up emergency reserve

---

## 🏁 Current Phase Status

✅ **Phase 1:** Ruler Creation - COMPLETE
✅ **Phase 2:** World Generation - COMPLETE
✅ **Phase 3:** Counsel System - COMPLETE
⏳ **Phase 4:** Action Execution - NEXT UP

---

## 🎮 Enjoy the Game!

Your ruler awaits your counsel. The world is alive with rival nations, each driven by their unique AI personalities. Watch them grow, expand, and compete for dominance!

**Remember:** This is a *grand strategy* game. Take your time, observe patterns, and prepare to offer wise counsel when Phase 3 arrives! 👑
