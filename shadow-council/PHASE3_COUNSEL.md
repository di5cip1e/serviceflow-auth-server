# Phase 3: The Counsel System - COMPLETE ✓

## 🎮 Overview

Phase 3 implements the **core gameplay mechanic**: offering advice to an autonomous AI ruler who decides whether to accept or reject based on their personality, mood, and game state. Players can use **Threaten Tokens** to force compliance when rejected.

---

## ✨ Features Implemented

### 1. **Mobile-Friendly Counsel UI (CounselUI.js)**

**Floating Action Button (FAB):**
- 💬 Icon button in bottom-right corner
- Hover effects and scaling
- Opens/closes message overlay
- Always accessible during gameplay

**Message Overlay (Messenger-Style):**
- Slides up from bottom (70% screen height)
- Dark moody background with golden borders
- Semi-transparent dark overlay behind
- Tap/click overlay to close
- Mobile-optimized with touch support

**Chat Interface:**
- **Header**: Shows ruler name and nation
- **Messages Area**: 
  - Scrollable conversation history
  - Player messages (right-aligned, purple gradient)
  - Ruler responses (left-aligned, golden gradient)
  - System messages (centered, muted gold)
  - "Thinking..." indicator with animated dots
- **Input Area**:
  - Auto-resizing textarea (60-120px)
  - Placeholder: "Offer your counsel..."
  - Send button with arrow icon (➤)
  - Enter to send, Shift+Enter for newlines

**Message Types:**
```
System: "King Aldric awaits your counsel..."
Player: "We should expand north into the plains"
Ruler: "Your counsel is noted. We shall proceed." ✓ Accepted
Ruler: "I disagree with this approach." ✗ Rejected
Ruler: "Under your forceful insistence..." ⚔ Threatened
```

**Visual Polish:**
- Smooth slide-in animations
- Auto-scroll to latest message
- Color-coded acceptance status
- Emoji indicators (✓ ✗ ⚔)
- HTML escaping for security

---

### 2. **LLM Integration & AI Decision Engine (RulerAI.js)**

**System Architecture:**

Uses Rosebud's built-in `ChatManager` API for LLM calls:
```javascript
window.ChatManager.sendMessage(prompt, messages, options)
```

**Context Building:**

Every advice request includes:
1. **Ruler Identity**:
   - Name, gender, pronouns
   - Government type + description
   - All positive traits with impacts
   - All negative traits with impacts

2. **Current State**:
   - Mood (-1 to +1)
   - Trust level (0 to 1)
   - Turn number
   - Cities, population, territory
   - Rival nations info
   - Recent mistake count

3. **Personality Weighting**:
   - Positive traits increase likelihood of acceptance
   - Negative traits decrease likelihood or cause bad decisions
   - Mood affects receptiveness
   - Trust affects weight given to advice

**LLM System Prompt Example:**
```
You are King Aldric, the male ruler of a nation among rivals.

PERSONALITY:
Government: Autocracy - Power is concentrated in the hands 
of a single ruler. Values order, control, and decisive action.

Positive Traits:
- Brilliant: Ruler makes highly intelligent decisions
- Decisive: Ruler makes swift decisions in critical moments
- Ambitious: Ruler pursues growth aggressively

Negative Traits:
- Cruel: Ruler inflicts severe consequences and rules through fear
- Arrogant: Ruler ignores advice and underestimates threats

CURRENT STATE:
- Mood: frustrated (-0.3)
- Trust in Counsel: skeptical (35%)
- Turn: 5
- Cities: 1
- Population: 5,523
- Territory: 87 tiles
- Recent mistakes: 1

DECISION-MAKING:
Your traits heavily influence decisions. Be consistent with 
your personality. Your arrogance may cause you to dismiss 
good advice. Your cruelty affects how you implement decisions.
```

**LLM User Prompt:**
```
Your counsel says: "We should expand our borders to the 
fertile plains in the north."

Current situation:
Rival nations:
Thornreach: 1 cities, 5,450 population
Emberfall: 1 cities, 5,523 population

Consider:
1. Does this advice align with your traits?
2. Does your mood make you receptive?
3. Do you trust your counsel?
4. Would your negative traits cause rejection?

Respond with JSON:
{
  "accept": true/false,
  "reasoning": "Internal thought process",
  "response": "What you say to your counsel"
}
```

**Decision Parsing:**

Tries to extract JSON first, falls back to natural language parsing:
```javascript
// Primary: Extract JSON
{"accept": true, "reasoning": "...", "response": "..."}

// Fallback: Keyword analysis
accept keywords: ['accept', 'agree', 'yes', 'wise']
reject keywords: ['reject', 'refuse', 'no', 'foolish']
```

**Fallback System:**

If LLM fails, uses rule-based decision:
```javascript
acceptChance = 0.5
+ government modifier (-0.1 to +0.1)
+ trait modifiers (-0.25 to +0.25 total)
+ mood effect (-0.2 to +0.2)
+ trust effect (-0.3 to +0.3)
= final chance (0 to 1)
```

**Relationship Dynamics:**

**Acceptance:**
- Trust: +5%
- Mood: +10%
- Strengthens bond over time

**Rejection:**
- Trust: -3%
- Mood: -15%
- Damages relationship

**Mood Decay:**
- Naturally drifts toward neutral (×0.9 per decision)
- Prevents permanent states

---

### 3. **Threaten Token System (ThreatenSystem.js)**

**Token Economy:**

**Core Mechanics:**
- Maximum: **3 tokens**
- Start with: **0 tokens**
- Regeneration: **1 token per 2 minutes**
- Alternative gain: **1 token per ruler mistake**

**Visual UI:**

**Top-Center Display:**
```
⚔ Threaten Tokens
2 / 3
[=========>---] Progress bar
```

**Features:**
- Shows current / maximum tokens
- Progress bar for next token
- Tooltip on hover explains system
- Pulse animation when gained/used
- Fixed position, always visible

**Token Generation:**

**Time-Based:**
```javascript
regenRate = 120,000ms (2 minutes)
progress = (timeSinceLastAdvice % regenRate) / regenRate
// Visual progress bar updates every second
// Token granted when progress reaches 100%
```

**Mistake-Based:**
```javascript
ruler.recordMistake() → 
  threatenSystem.grantTokenForMistake() →
    +1 token immediately
```

**Token Usage:**

Can only be used when:
1. Ruler rejects advice
2. Player has ≥1 token
3. Player chooses to threaten

**Effect:**
- Consumes 1 token
- Forces ruler to accept advice
- Damages relationship significantly:
  - Mood: -30%
  - Trust: -20%
- Shows special "⚔ Threatened" status
- Executes advice immediately

**Visual Feedback:**

**Token Gain Notification:**
```
╔════════════════════════╗
║  ⚔ +1 Threaten Token   ║
║  Ruler made a mistake! ║
╚════════════════════════╝
```
- Slides down from top
- Fades in/out over 2 seconds
- Reason displayed (time vs mistake)

**Token Use Animation:**
```
        ⚔
   (Giant icon)
  Pulses/fades
  in center screen
```
- 1 second dramatic effect
- Confirms token spent

---

### 4. **Threaten Dialog System**

**When Triggered:**

Appears when:
- Ruler rejects advice
- Player has ≥1 tokens

**Modal Interface:**

```
╔═══════════════════════════════════════╗
║              ⚔                        ║
║   Ruler Rejected Your Counsel        ║
║                                       ║
║ ╭─────────────────────────────────╮  ║
║ │ King Aldric says:               │  ║
║ │ "I do not believe this is the   │  ║
║ │  right path for our realm."     │  ║
║ ╰─────────────────────────────────╯  ║
║                                       ║
║ King Aldric has dismissed your       ║
║ advice. You can use a Threaten       ║
║ Token to force him to comply...      ║
║ but this may damage your             ║
║ relationship.                        ║
║                                       ║
║ [⚔ Threaten (1 Token)]               ║
║ [Accept Rejection]                   ║
║                                       ║
║ Tokens: 2 / 3                        ║
╚═══════════════════════════════════════╝
```

**Decision Outcomes:**

**Choose "Threaten":**
1. Token consumed
2. Mood drops significantly
3. Trust damaged
4. Ruler forced to comply
5. Special message: "Under your forceful insistence..."
6. Advice executed

**Choose "Accept":**
1. No token used
2. Rejection stands
3. No additional damage
4. Advice not executed

---

### 5. **Mood & Trust System**

**Mood (-1 to +1):**

**States:**
- **+0.3 to +1.0**: 😊 Pleased
  - More receptive to advice
  - Positive responses
  - +20% acceptance modifier
  
- **-0.3 to +0.3**: 😐 Neutral
  - Baseline behavior
  - Standard acceptance rates
  - No modifier
  
- **-1.0 to -0.3**: 😠 Frustrated
  - More resistant to advice
  - Negative responses
  - -20% acceptance modifier

**Mood Changes:**
```javascript
Accept advice: +0.10
Reject advice: -0.15
Threaten used: -0.30
Ruler mistake: -0.20
Natural decay: ×0.90 (toward neutral)
```

**Trust (0% to 100%):**

**Levels:**
- **70%+**: Trusts Greatly
  - +30% acceptance modifier
  - Ruler listens carefully
  - Green display color
  
- **40-70%**: Moderate Trust
  - No modifier
  - Baseline relationship
  - Gold display color
  
- **0-40%**: Skeptical
  - -30% acceptance modifier
  - Ruler doubts advice
  - Red display color

**Trust Changes:**
```javascript
Accept advice: +5%
Reject advice: -3%
Threaten used: -20%
Ruler mistake: -10%
```

**Display in Stats Panel:**
```
Ruler State:
Mood: 😊 Pleased       (Green text)
Trust: 75%             (Green text)

Ruler State:
Mood: 😐 Neutral       (White text)
Trust: 55%             (Gold text)

Ruler State:
Mood: 😠 Frustrated    (Red text)
Trust: 25%             (Red text)
```

---

### 6. **Counsel Log System**

**Data Persistence:**

Every advice interaction logged to `window.gameState.counselLog[]`:

```javascript
{
  turn: 5,
  advice: "We should expand our borders north",
  accepted: true,
  threatened: false,
  response: "Your counsel is wise. We shall proceed.",
  mood: 0.2,
  trust: 0.65,
  timestamp: 1699564823451
}
```

**Accessible via Console:**
```javascript
// View all counsel history
console.log(window.gameState.counselLog);

// Filter accepted advice
window.gameState.counselLog.filter(a => a.accepted);

// Filter threatened decisions
window.gameState.counselLog.filter(a => a.threatened);

// Count acceptance rate
const total = window.gameState.counselLog.length;
const accepted = window.gameState.counselLog.filter(a => a.accepted).length;
const rate = (accepted / total * 100).toFixed(1);
console.log(`Acceptance rate: ${rate}%`);
```

---

## 🔧 Technical Implementation

### File Structure

```
/CounselUI.js         - Message interface and UI
/RulerAI.js           - LLM integration and decision logic
/ThreatenSystem.js    - Token economy and UI
/CounselManager.js    - Coordinates all systems
/WorldManager.js      - Integrates counsel into world
/GameUI.js           - Displays mood/trust stats
```

### Integration Points

**WorldManager.js:**
```javascript
this.counselManager = new CounselManager(this);
// - Creates UI, AI, and token systems
// - Handles advice flow
// - Updates game state
```

**GameUI.js:**
```javascript
// Display ruler mood and trust
const mood = worldManager.counselManager.getMood();
const trust = worldManager.counselManager.getTrust();
```

**ChatManager API:**
```javascript
// Rosebud's built-in LLM service
const response = await window.ChatManager.sendMessage(
  userPrompt,
  messages,
  { temperature: 0.8, maxTokens: 300 }
);
```

---

## 🎯 Strategic Gameplay

### Optimal Counsel Strategy

**Build Trust Early:**
- Give advice aligned with ruler's traits
- Accept rejections gracefully (don't threaten)
- Build to 70%+ trust for maximum influence

**Use Threatens Wisely:**
- Save for critical decisions
- Only when ruler makes bad choice
- Understand it damages relationship

**Read the Mood:**
- Pleased rulers more receptive
- Frustrated rulers resist more
- Wait for good mood if possible

**Align with Traits:**

**For Ambitious Ruler:**
✓ "We should expand our territory"
✗ "We should focus on internal development"

**For Arrogant Ruler:**
✗ "Your decision last turn was flawed"
✓ "Your wisdom guides us well, perhaps consider..."

**For Diplomatic Ruler:**
✓ "We should negotiate with our neighbors"
✗ "We should crush them with military force"

---

## 📊 System Parameters

**Token System:**
- Max tokens: 3
- Regen time: 2 minutes (120,000ms)
- Mistake reward: 1 token instant

**Mood:**
- Range: -1.0 to +1.0
- Accept bonus: +0.10
- Reject penalty: -0.15
- Threaten penalty: -0.30
- Decay rate: ×0.90

**Trust:**
- Range: 0.0 to 1.0 (0% to 100%)
- Accept bonus: +0.05 (+5%)
- Reject penalty: -0.03 (-3%)
- Threaten penalty: -0.20 (-20%)

**LLM:**
- Temperature: 0.8 (allow variance)
- Max tokens: 300
- Timeout: 30 seconds
- Fallback: Rule-based if fails

---

## 🎮 Player Experience Flow

**1. Open Counsel (Click 💬 button)**
```
[Message overlay slides up]
"King Aldric awaits your counsel..."
```

**2. Type Advice**
```
Player: "We should expand our influence into 
         the western forests."
```

**3. AI Processes**
```
[Thinking animation with dots]
● ● ● Considering your counsel...
```

**4a. Acceptance Path**
```
King Aldric: "Your counsel is wise. We shall 
              send settlers westward."
              ✓ Accepted

[Advice executed]
[Trust +5%, Mood +10%]
```

**4b. Rejection Path (No Token)**
```
King Aldric: "I do not believe the forests 
              are worth our attention."
              ✗ Rejected

[No execution]
[Trust -3%, Mood -15%]
```

**4c. Rejection Path (With Token)**
```
[Modal appears]
╔═══════════════════════════╗
║ Ruler Rejected Your       ║
║ Counsel                   ║
║                           ║
║ [⚔ Threaten (1 Token)]    ║
║ [Accept Rejection]        ║
╚═══════════════════════════╝

[If Threaten chosen:]
King Aldric: "Under your forceful insistence, 
              I shall comply. My displeasure 
              is evident."
              ⚔ Threatened

[Advice executed]
[Token -1, Trust -20%, Mood -30%]
```

---

## 🚀 Ready for Future Phases

Phase 3 provides foundation for:

**Phase 4: Action Execution**
- Parse advice into game actions
- Expand territory based on counsel
- Build cities where advised
- Declare war/peace
- Manage resources

**Phase 5: Ruler Autonomy**
- AI makes decisions without counsel
- Background management
- Mistakes trigger token rewards
- Player sees consequences

**Phase 6: Complex Events**
- Plagues, rebellions, discoveries
- Ruler handles autonomously
- Player offers guidance
- Trait-based outcomes

---

## 📈 Success Metrics

Phase 3 Achievements:

✅ Mobile-friendly messenger UI
✅ LLM integration with personality context
✅ Mood and trust relationship system
✅ Threaten token economy
✅ Time-based + mistake-based token generation
✅ Interactive threat dialog
✅ Complete advice logging
✅ Fallback decision system
✅ Visual feedback for all actions
✅ Stats panel integration

**The Counsel system is live and fully functional!** 🎮👑
