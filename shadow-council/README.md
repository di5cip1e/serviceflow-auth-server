# The Counsel - AI-Driven Grand Strategy Game

An experimental grand strategy game where the player acts as **Counsel** to an autonomous AI Ruler, offering advice in plain English while the ruler makes their own decisions based on their personality, traits, and disposition.

## Phase 1: Ruler Creation System ✓ COMPLETE

### Features Implemented

#### 1. Personality Quiz (5 Questions)
- Determines government type based on player choices
- **Government Types**:
  - Autocracy (centralized power, order-focused)
  - Democracy (balanced interests, popular support)
  - Theocracy (religious authority, moral law)
  - Oligarchy (elite council, economic focus)
  - Military Junta (martial strength, expansion)

#### 2. Ruler Identity Creation
- Name your ruler
- Choose gender (Male, Female, Non-Binary)
- Name your nation
- Name your capital city

#### 3. Trait Selection System
- **Base Points**: 7 points to spend on positive traits
- **Point Economy**: Accept negative traits to gain bonus points
- **Maximum Negative Traits**: 3 flaws maximum

#### 4. Positive Traits (10 Available)
**2-Point Traits (Major)**:
- Brilliant (exceptional strategic thinking)
- Charismatic (natural persuasion)
- Decisive (swift action)
- Diplomatic (skilled negotiation)
- Shrewd (cunning perception)

**1-Point Traits (Minor)**:
- Just (fair judgment)
- Ambitious (expansion-driven)
- Pious (religiously guided)
- Merciful (compassionate)
- Brave (fearless)

#### 5. Negative Traits (10 Available)
**2-Point Refund (Major)**:
- Cruel (harsh punishment)
- Paranoid (distrusts everyone)
- Wrathful (quick to anger)
- Slothful (lazy, avoidant)
- Weak-Willed (easily influenced)

**1-Point Refund (Minor)**:
- Greedy (wealth-obsessed)
- Arrogant (dismissive)
- Hateful (prejudiced)
- Impulsive (rash decisions)
- Stubborn (refuses change)

### UI/UX Features

- **Dark & Moody Aesthetic**: Purple, dark brown, and golden color scheme
- **3D Atmospheric Background**: Throne centerpiece with floating particles
- **Empowering Experience**: Players feel influential in shaping their ruler
- **Mobile-Friendly**: Touch-optimized with 44px minimum targets
- **Validation**: Form validation ensures complete data entry
- **Back Navigation**: Can return to identity step before confirming

### Technical Implementation

#### State Management
All ruler data is saved to `window.gameState` for future phases:

```javascript
window.gameState = {
  ruler: {
    name: string,
    gender: string,
    governmentType: string,
    positiveTraits: string[],
    negativeTraits: string[]
  },
  nation: {
    name: string,
    capital: string
  },
  initialized: boolean
}
```

#### Files Structure
```
/config.js              - Game configuration and trait definitions
/main.js                - Game initialization and state management
/QuizScene.js           - Personality quiz implementation
/RulerCreationScene.js  - Identity and trait selection
/Scene3D.js             - 3D atmospheric background
/RULER_STATE.md         - Documentation for AI implementation
/index.html             - HTML structure and styles
```

### Design Philosophy

**Empowerment Through Choice**: Every decision matters. The trait system creates meaningful trade-offs where accepting flaws enables greater strengths.

**Dark Fantasy Aesthetic**: Moody purples, browns, and golds create an atmosphere of medieval power and intrigue.

**Transparent Systems**: Players see exactly how their choices will impact the AI Ruler's behavior through detailed trait descriptions.

## Phase 2: World Generation ✓ COMPLETE

### Features Implemented

#### 1. Procedural Map Generation (100x100 tiles)
- Multi-octave noise for realistic terrain
- Edge dampening for natural ocean borders
- Elevation, temperature, and moisture systems

#### 2. Dynamic Biomes (6 Types)
- **Ocean**: Impassable water
- **Desert**: Hot, dry, low fertility (20%)
- **Arctic**: Cold, low fertility (10%)
- **Plains**: High fertility (80%), ideal for settlement
- **Forest**: Moderate fertility (60%), slower movement
- **Mountains**: High elevation, difficult terrain

#### 3. AI Nation Generation (3-9 Rivals)
- Uses **exact same trait system** as player
- Random ruler names (24 per gender)
- Unique nation and capital names
- 7 base points + negative trait refunds
- Each AI has government type + personality traits

#### 4. Influence Border System
- Each city projects influence in radius
- Influence decreases with distance
- Borders visualized with nation colors
- **Dynamic expansion** as nations grow
- Real-time border recalculation

#### 5. City Population Growth
- Starting population: 5,000
- Growth rate: 2% per turn
- **Visual scaling** based on population:
  - Small (5K): 1x size
  - Medium (15K+): 1.5x size
  - Large (40K+): 2x size
  - Huge (100K+): 2.5x size
- Capital cities marked with golden stars

#### 6. Interactive Map Rendering
- **Pan**: Drag to move camera
- **Zoom**: Scroll wheel (0.3x to 3x)
- **Hover Info**: Biome, owner, influence %
- Touch support for mobile
- Nation legend and tile info panels

### Technical Achievement

**AI Rulers Generated Identically to Player**:
```javascript
// Same 7 point budget
// Same positive/negative trait system
// Same trait costs and refunds
// Each AI is unique and strategic
```

**Example AI Ruler**:
```
King Aldric of Thornreach (Autocracy)
+ Brilliant, Decisive, Ambitious
- Cruel, Arrogant
Points: 6/9 (7 base + 3 from flaws)
```

## Phase 3: The Counsel System ✓ COMPLETE

### Core Gameplay: Offer Advice to AI Ruler

#### 1. Mobile-Friendly Counsel Interface
- **💬 Floating button** to open messenger
- **Messenger-style chat** slides up from bottom
- Player messages (right, purple) vs Ruler responses (left, gold)
- Auto-resizing textarea with send button
- Smooth animations and auto-scroll

#### 2. LLM-Powered Decision Making
- **ChatManager API** integration (Rosebud LLM)
- Ruler evaluates advice based on:
  - Government type ideology
  - All positive traits (enhance judgment)
  - All negative traits (cause bad decisions)
  - Current mood (-1 to +1)
  - Trust level (0% to 100%)
  - Game state (population, rivals, territory)
- JSON response parsing with fallback
- In-character responses matching personality

#### 3. Threaten Token System
- **Tokens: 0-3 maximum**
- **Generation**: 1 token per 2 minutes
- **Alternative gain**: Ruler mistakes grant instant token
- **Usage**: Force rejected advice to be accepted
- **Cost**: Damages mood (-30%) and trust (-20%)
- Visual UI at top-center with progress bar
- Dramatic animations for gain/use

#### 4. Relationship Dynamics
- **Mood System**:
  - 😊 Pleased (+0.3 to +1): More receptive
  - 😐 Neutral (-0.3 to +0.3): Baseline
  - 😠 Frustrated (-1 to -0.3): Resistant
  - Decays toward neutral over time
  
- **Trust System**:
  - 70%+: Trusts greatly (green)
  - 40-70%: Moderate (gold)
  - 0-40%: Skeptical (red)
  - Builds slowly, damages quickly

#### 5. Interactive Threat Dialog
- Appears when advice rejected + tokens available
- Choice: Threaten (force) or Accept rejection
- Shows ruler's original response
- Explains relationship damage
- Confirms token usage

**Example Interaction:**
```
You: "We should expand north into the plains"

[AI processes with ruler's personality]

Ambitious + Decisive King:
"Your counsel is wise. We shall march north!"
✓ Accepted

Paranoid + Stubborn King:
"The north? What threats lurk there? No."
✗ Rejected

[If you have tokens]
⚔ Threaten Dialog Appears
→ Force compliance or accept rejection
```

## Phase 4: Action Execution & AI Engine ✓ COMPLETE

### Part 1: Natural Language Action Parsing

#### 1. Counsel Advice Execution
- **8 Action Categories**: City building, territory expansion, war, diplomacy, economy, military, growth, strategic
- **Regex-based matching** with priority ordering
- **Flexible input**: Handles diverse phrasing and natural language
- **Graceful fallback**: Acknowledges advice even without specific action

#### 2. City Building Actions
- **Automatic location selection**: Finds best available sites
- **Fertility prioritization**: Prefers grassland > plains > forest
- **Spacing enforcement**: 10-tile minimum between cities
- **Procedural naming**: "Crownford", "New Stone", "Goldville"
- **Instant feedback**: Notifications show location and biome

**Example Advice**: "Build a new city", "Found a settlement"

#### 3. Territory Expansion
- **Intelligent expansion**: Claims 5 tiles adjacent to borders
- **Biome optimization**: Prioritizes fertile unclaimed land
- **Border recalculation**: Updates influence automatically
- **Visual feedback**: Shows tiles gained in notification

**Example Advice**: "Expand our territory", "Claim more land"

#### 4. War Declaration
- **Target extraction**: Parses nation/ruler names from text
- **War state tracking**: Records active conflicts
- **Smart fallback**: Targets largest rival if unspecified
- **Future-ready**: Foundation for Phase 5 combat

**Example Advice**: "Declare war on Kingdom of X", "Attack our rivals"

#### 5. Economic Policies
- **Growth boost**: +1% population growth to all cities
- **Stacking bonuses**: Multiple economic focuses compound
- **Tangible effects**: Visible in long-term city development

**Example Advice**: "Focus on economy", "Improve trade"

#### 6. Military Strengthening
- **Force buildup**: Increases military strength value
- **Combat preparation**: Ready for Phase 5 military system
- **Progressive enhancement**: Can strengthen repeatedly

**Example Advice**: "Strengthen our army", "Recruit soldiers"

#### 7. Action Execution Flow

```
Player types advice → Ruler accepts/rejects
                              ↓
                      If accepted (or threatened)
                              ↓
                    ActionExecutor parses text
                              ↓
                      Match to action category
                              ↓
                       Execute game changes
                              ↓
                      Notify player of result
                              ↓
                         Log to history
```

#### 8. Comprehensive Feedback
- **Success notifications**: "✓ Crownford has been founded!"
- **Warning notifications**: "⚠ No suitable location found"
- **Error notifications**: "✗ Unable to execute advice"
- **Console logging**: Detailed technical information
- **Action history**: Complete record of all executions

### Technical Implementation

**Files Added**:
- `/ActionExecutor.js` - Core parsing and execution engine
- `/PHASE4_ACTIONS.md` - Complete documentation

**Integrations**:
- `CounselManager.executeAdvice()` - Entry point
- `WorldManager.showNotification()` - User feedback
- `Nation.addCity()` - City creation
- City growth bonus system

**Action Categories Implemented**:
1. City Building (`matchesCityBuilding`)
2. Territory Expansion (`matchesTerritoryExpansion`)
3. War Declaration (`matchesWarDeclaration`)
4. Diplomacy (`matchesDiplomacy`)
5. Economic Actions (`matchesEconomicAction`)
6. Military Actions (`matchesMilitaryAction`)
7. Generic Growth (`matchesGenericGrowth`)
8. Strategic Acknowledgment (fallback)

### Examples in Action

**City Building Success**:
```
Advice: "We should build a new city"
Result: ✓ Crownford has been founded!
        New city established at (45, 67) on grassland terrain.
```

**Territory Expansion**:
```
Advice: "Expand our borders"
Result: ✓ Territory expanded by 5 tiles!
        Influence borders have been pushed outward.
```

**War Declaration**:
```
Advice: "Attack the Kingdom of Ashford"
Result: ✓ War declared against Kingdom of Ashford!
        Your armies prepare to march.
```

**Economic Policy**:
```
Advice: "Focus on economic growth"
Result: ✓ Economic policies enacted!
        City growth rate increased by 1%.
```

### Part 2: AI Ruler Action Engine

#### 1. Autonomous Decision-Making System
- **Action Loop**: Every 8 seconds, all nations take actions
- **5 Action Types**: Found City, Build Fortress, Construct Road, Upgrade Infrastructure, Draft Army
- **Personality-Driven**: Each ruler's traits influence action priorities
- **Resource Economy**: Gold and population costs create strategic trade-offs
- **Dynamic World**: Nations build and expand without player input

#### 2. The Five Autonomous Actions

**Found City** 🏛️
- Spawns new settlement on empty tiles
- Cost: 500 gold, 1000 population
- 10-tile spacing requirement
- Expands influence borders immediately
- Priority: Democracy, Oligarchy, Ambitious trait

**Build Fortress** 🏰
- Constructs defensive structure on borders
- Cost: 300 gold
- Provides 2x defense bonus
- Visual: Square fortress with towers and shield icon
- Priority: Militarism, Paranoid trait, hostile neighbors

**Construct Road** 🛤️
- Connects two cities with trade route
- Cost: 200 gold
- +0.5% growth bonus to both cities
- Visual: Dashed golden line
- Priority: Oligarchy, Shrewd trait, 3+ cities

**Upgrade Infrastructure** 🏗️
- Improves existing city development
- Cost: 250 gold
- +500 population, +0.8% permanent growth
- Stacks with multiple upgrades
- Priority: Oligarchy, Just trait, small cities

**Draft Army** ⚔️
- Recruits military units
- Cost: 150 gold, 500 population
- +50-80 military strength
- Prepares for future combat system
- Priority: Militarism, Brave/Paranoid/Wrathful traits

#### 3. Personality-Based Decision Making

Each ruler calculates priority scores for all actions based on:
- **Government type** (Democracy favors expansion, Militarism favors armies)
- **Positive traits** (Ambitious boosts city founding, Shrewd boosts roads)
- **Negative traits** (Slothful reduces expansion, Paranoid boosts fortresses)
- **Strategic situation** (Hostile borders, low resources)
- **Game stage** (Early game expands, late game consolidates)

**Example Priority Calculation**:
```
Ambitious Democracy:
  Found City: 95 (base 50 + democracy 20 + ambitious 25)
  Upgrade Infrastructure: 80
  Construct Road: 65
  Build Fortress: 45
  Draft Army: 50
→ Result: Founds a new city
```

#### 4. Dynamic World Development

**Influence Border Expansion**:
- New cities project influence immediately
- Roads boost connected city growth → larger influence
- Infrastructure upgrades increase population → stronger borders
- Fortresses secure defensive perimeter

**Visual Feedback**:
- Roads appear as dashed lines between cities
- Fortresses render as nation-colored structures
- Cities grow visually based on population + infrastructure
- Borders expand organically as nations build

#### 5. Resource Economy

**Starting Resources**:
- Gold: 1,000 per nation
- Population: 5,000 (capital)
- Military: 100 strength

**Cost Balance**:
- Cheap: Draft Army (150g), Roads (200g)
- Medium: Fortresses (300g), Infrastructure (250g)
- Expensive: New Cities (500g + 1000 pop)

**Strategic Choices**: Limited resources force rulers to prioritize based on personality.

#### 6. Action Logging & History

Every action logged with:
- Nation name and ID
- Action type and result
- Turn number and timestamp
- Success/failure status

Console output shows AI thinking:
```
=== AI ACTION TICK ===
Kingdom of Ashford priorities: { foundCity: 75, buildFortress: 60, ... }
✓ Kingdom of Ashford - constructRoad: Road: Ashford ↔ Ironburg
```

#### 7. Player Nation Control

**Current Mode**: Player ruler only acts through counsel system
**Future Toggle**: Enable/disable autonomous player actions
```javascript
worldManager.aiActionEngine.setPlayerAutonomous(true)
```

### Technical Implementation

**Files Added**:
- `/AIActionEngine.js` - Autonomous decision engine (700+ lines)
- `/PHASE4_AI_ENGINE.md` - Complete AI engine documentation
- `/ActionExecutor.js` - Counsel advice parser
- `/PHASE4_ACTIONS.md` - Counsel action documentation

**Integrations**:
- `WorldManager.update()` - Calls AI engine every frame
- `MapRenderer` - Renders roads and fortresses
- `Nation` - Extended with roads[], fortresses[], armies[]
- `City` - Added infrastructureLevel and stacking growthBonus

**Game Loop**:
```
Player offers counsel → Ruler accepts/rejects
                              ↓
                      If accepted, ActionExecutor parses
                              ↓
                      Meanwhile, every 8 seconds...
                              ↓
                      All AI rulers calculate priorities
                              ↓
                      Execute highest priority action
                              ↓
                      Influence borders update
                              ↓
                      World evolves dynamically
```

## Phase 5: Economic System & Combat ✓ PHASE 5A-5C COMPLETE

### Part 1: Income Generation System ✅

#### 1. Sustainable Economy
- **Income Tick**: Every 5 seconds (1 turn)
- **Multiple Income Sources**: Cities, trade routes, territory, treaties
- **Strategic Expenses**: City maintenance, army upkeep, infrastructure costs
- **Real-time Display**: Gold and net income shown in UI

#### 2. Income Sources

**City Income**:
- Base: 10g per 1,000 population
- Infrastructure bonus: +5g per level
- Capital bonus: +50% income
- Scales with city growth

**Trade Route Income**:
- Base: 15g per road
- Distance bonus: +5g per 10 tiles
- Encourages connecting distant cities

**Territory Income**:
- Mountains: 3g/tile (mining)
- Plains: 2g/tile (farming)
- Forest: 1.5g/tile (lumber)
- Desert: 0.5g/tile
- Arctic: 0.3g/tile

**Treaty Income**:
- Trade agreements: 20g/turn

#### 3. Expenses

**City Maintenance**:
- Small: 5g/turn
- Medium: 15g/turn
- Large: 30g/turn
- Huge: 50g/turn

**Army Upkeep**:
- 1g per 10 military strength
- 5g per army unit
- Discourages over-militarization

**Infrastructure Maintenance**:
- Roads: 2g each
- Fortresses: 5g each
- City infrastructure: 3g per level

#### 4. Income-Aware AI Decisions

AI rulers now consider economic health:
- **Negative income**: Prioritize roads (+income), avoid expansion (-expenses)
- **Near bankruptcy**: Conservative spending, emergency measures
- **Healthy income**: Normal personality-driven priorities

**Example**:
```
Ambitious Democracy with -15g/turn:
  Before: Found City (95 priority)
  After:  Construct Road (90 priority)
  → Builds income-generating road instead of expensive city
```

#### 5. Strategic Depth

**Economic Management**:
- Balance expansion with sustainability
- Calculate ROI on investments
- Avoid bankruptcy through smart building
- Trade agreements provide steady income

**Player Awareness**:
- See gold and net income in UI
- Get warnings when income goes negative
- Counsel ruler on economic policies
- Watch AI nations succeed or fail economically

### Technical Implementation

**Files Added**:
- `/IncomeSystem.js` (380 lines) - Income/expense calculation engine
- `/PHASE5_INCOME.md` - Complete income system documentation

**Integrations**:
- `WorldManager` - Income system update loop
- `GameUI` - Gold and income display
- `AIActionEngine` - Income-aware decision making
- `Nation.js` - Structure tracking for income calculation

**Income Calculation**:
```
Every 5 seconds:
  Calculate income (cities + trade + territory + treaties)
  Calculate expenses (maintenance + upkeep)
  Update nation.gold by net income
  AI uses income health in next decision
```

### Part 2: Military System ✅

#### 1. Army Management & Logistics

**Unit Types (5 Classes):**
- 🛡️ **Infantry**: Versatile backbone (Strong vs Infantry/Archers, Weak vs Cavalry)
- 🏹 **Archers**: Ranged attackers (Strong vs Infantry/Cavalry, Weak vs Archers)
- 🐴 **Cavalry**: Fast shock troops (Strong vs Infantry/Siege, Weak vs Spearmen)
- 🗡️ **Spearmen**: Anti-cavalry (Strong vs Cavalry, Weak vs Archers/Infantry)
- 🎯 **Siege**: Fortification destroyers (Strong vs Fortifications, Weak vs Cavalry/Archers)

**Equipment Quality:**
- Basic (free), Quality (+200g, +15% stats), Elite (+500g, +30% stats)
- Elite equipment has 1.5x upkeep cost

**Battle Tactics:**
- ⚔️ Aggressive (+30% attack, -20% defense)
- 🛡️ Defensive (-10% attack, +40% defense)
- ↔️ Flanking (+20% attack, +30% speed)
- ⚖️ Balanced (+10% all-around)
- 🌲 Ambush (+25% terrain bonus in forests/mountains)

#### 2. Division of Labor

**AI Ruler Commands:**
- Declares war
- Orders army movement
- Strategic positioning

**Player (Counsel) Manages:**
- Unit composition (sliders for each type)
- Equipment quality selection
- Battle tactics choice
- Army recruitment from capital

#### 3. Auto-Battler Combat System

**8 Comprehensive Combat Factors:**

1. **Base Strength** - Unit count, stats, composition
2. **Tactical Modifiers** - Chosen tactics with counter-tactics (rock-paper-scissors)
3. **Terrain Effects** - Cavalry struggles in forests/mountains, siege weak on rough terrain
4. **Ruler Aptitude** - Brave/Decisive/Brilliant boost strength, Weak-Willed/Slothful reduce it
5. **Equipment Quality** - Elite armies 1.55x stronger than basic
6. **Unit Composition** - Counter units (Spearmen vs Cavalry, etc.) up to ±20%
7. **Defender Advantage** - +20% base, +50% if fortified
8. **Morale & Experience** - Veterans fight better, low morale reduces effectiveness

**Battle Resolution:**
- Armies collide when at same location
- Auto-calculated based on all factors
- Victor determined by strength ratio
- Casualties: Victor 10-30%, Loser 40-80%
- Decisive victory when 2x+ stronger

**Example Battle:**
```
Attacker: 50 units (30 infantry, 20 archers)
  Quality equipment, Aggressive tactic, Brave ruler
  Plains terrain, no fortification
  Strength: 2,118

Defender: 40 units (25 spearmen, 15 infantry)
  Basic equipment, Defensive tactic, Paranoid ruler
  Fortress nearby (+50%)
  Strength: 2,808

Result: Defender Victory (57% vs 43%)
Attacker: 60% casualties
Defender: 25% casualties
```

#### 4. Visual Representation

**Armies on Map:**
- Nation-colored flag/banner
- Crossed swords icon ⚔
- Unit count badge (e.g., "47")
- Movement arrows showing destination
- Size scales with unit count

**Battle Reports:**
- Modal overlay for player battles
- Victor announcement (decisive or standard)
- Casualty breakdown
- Combat strength comparison
- Special factors (fortified, terrain, etc.)

#### 5. Strategic Depth

**Composition Strategy:**
- Balanced: Mix of all types
- Cavalry Rush: Fast, expensive, vulnerable to spearmen
- Defensive Wall: Infantry/spearmen for holding ground
- Archer Corps: Ranged dominance, weak in melee

**Terrain Tactics:**
- Forest: Use ambush tactic, avoid cavalry
- Plains: Cavalry excels (+15%)
- Mountains: Major defender advantage, attacker -15%

**Economic Tradeoffs:**
- Small elite army: High strength/unit, expensive upkeep
- Large basic army: Raw numbers, cost-effective
- Army upkeep drains treasury if over-militarized

### Technical Implementation

**Files Added:**
- `/ArmyManager.js` (450 lines) - Army creation, composition, movement, upkeep
- `/BattleSystem.js` (550 lines) - Auto-battler combat resolution with 8 factors
- `/ArmyUI.js` (600 lines) - Military logistics interface with sliders
- `/PHASE5B_MILITARY.md` - Complete military system documentation

**Integrations:**
- `WorldManager` - Army manager, battle system, army UI initialization
- `MapRenderer` - Army visualization with banners and movement indicators
- `GameUI` - Battle report modal
- `IncomeSystem` - Army upkeep calculations
- `Nation.js` - War state tracking

**Military Loop:**
```
Player configures army (composition, equipment, tactics)
  → Recruit at capital (costs gold + population)
  → AI ruler commands movement
  → Army travels to destination
  → Meets enemy army at war
  → Auto-battler resolves combat
  → Battle report shows outcome
  → Casualties applied, experience gained
  → Destroyed armies removed
```

### Part 3: Conquest Mechanics ✅

#### 1. City Conquest System

**Capture Calculation:**
- Based on 6 factors: battle decisiveness, siege equipment, city size, fortifications, capital status
- Capture chance: 20-95%
- Failed captures start automatic sieges

**Example:**
```
Decisive victory + 20% siege units vs Medium fortified city:
  Attack Strength: 1.68
  Defense Strength: 1.95
  Capture Chance: 46%
  
Roll: 0.38 → City captured!
```

**Capture Effects:**
- Ownership transfers to victor
- City loses 20-40% population
- Treasury looted (pop/10 gold)
- Borders update automatically
- If capital captured → new capital chosen

#### 2. Siege Warfare

**Automatic Sieges:**
- Start when capture fails
- Progress based on siege strength (units × 2 + siege engines × 10)
- Visual indicator: pulsing red ring with progress arc
- Complete at 100% progress → city captured

**Siege Example:**
```
40-unit army (10 siege engines):
  Strength: 40×2 + 10×10 = 180
  Progress: 36% per second
  Time: ~3 seconds to capture

⏳ Siege begun: Kingdom besieges Fortress City
  Siege Strength: 180
  Progress: 67%...

🏰 Siege complete! City captured
```

#### 3. Territory Conquest

**Field Battles:**
- Capture tiles in radius around battle
- Base radius: 3-4 tiles (decisive = 4)
- Bonus: +1 radius per 30 units (max 8)
- Only captures enemy/neutral land (not ocean)

**Example:**
```
Decisive victory with 90 units:
  Radius: 4 + 3 = 7 tiles
  Tiles captured: ~147

📍 Kingdom captures 147 tiles around (50, 50)
```

#### 4. Spoils of War

**Immediate Rewards:**
- Gold looting: 100-200g base × wealth factor
- City treasuries: population/10 gold
- Territory income increases

**Example:**
```
Capture large city from wealthy nation:
  City treasury: 45,000 pop / 10 = 4,500g
  Battle spoils: 200g × 1.5 = 300g
  Total: 4,800g gained
  New income: +350g/turn from city
```

#### 5. Nation Elimination

**When all cities lost:**
- All remaining gold → victor
- All territory → victor
- All armies destroyed
- All treaties canceled
- Nation marked "eliminated" (stays in history)

**Player Defeat:**
- Full-screen game over overlay
- Eliminator name displayed
- "Start New Game" button

**Notification Example:**
```
💀 Republic of Vale eliminated by Kingdom of Iron!
  
👑 VICTORY! (if you're victor)
💀 DEFEAT! (if you're eliminated)
📰 [Nation] eliminated (if observer)
```

#### 6. Strategic Depth

**Siege Composition:**
- Siege-heavy: Fast captures (2-3 seconds), expensive, slow movement
- Balanced: Moderate sieges (5 seconds), versatile
- No siege: Slow captures (10 seconds), cheaper, better field battles

**City Defense:**
- Fortify capitals: Fortress + huge size = 4.5x defense
- Makes capture very difficult (15-35% chance)
- Forces extended sieges

**Territorial Strategy:**
- Field battles: Large area gains, no siege
- City battles: Economic centers, eliminates enemy production
- Hybrid: Claim territory via fields, cities via siege

### Technical Implementation

**Files Added:**
- `/ConquestSystem.js` (550 lines) - City capture, siege mechanics, elimination
- `/PHASE5C_CONQUEST.md` - Complete conquest documentation

**Integrations:**
- `BattleSystem` - Conquest processing after victories
- `WorldManager` - Siege updates every frame
- `MapRenderer` - Siege visual indicators with progress
- `GameUI` - Game over screen
- `DiplomacyManager` - Treaty cancellation methods

**Conquest Loop:**
```
Army wins battle
  → Attempt city capture (if near city)
  → Success: City captured, borders shift
  → Failure: Siege starts, progress bar appears
  → Siege completes: City captured
  OR
  → Field battle: Capture surrounding tiles
  → Spoils awarded (gold)
  → If last city: Nation eliminated
  → Game over (if player eliminated)
```

---

## Phase 5D: Mistake Detection System ✓ COMPLETE

### Overview

Rewards observant players by detecting when their AI ruler makes objectively poor decisions and granting threaten tokens as compensation.

**Philosophy:** Being a good counsel isn't just about giving advice - it's about recognizing when your ruler screws up. This system validates player expertise and creates "I told you so" moments.

### Mistake Categories

#### 1. Economic Mistakes (4 types)

**Bankruptcy** - Critical (3 tokens)
- Gold reaches 0 or negative
- Treasury depleted through poor management

**Economic Crisis** - Major (2 tokens)
- Treasury < 100g with net income < -50g/turn
- Heading toward bankruptcy

**Rapid Economic Decline** - Major (2 tokens)
- Lost 30%+ of treasury in short period
- Reckless spending

**Wasteful Expansion** - Minor (1 token)
- City maintenance exceeds city income by 50%+
- Expanding faster than economy can support

#### 2. Military Mistakes (5 types)

**Crushing Defeat** - Critical (3 tokens)
- Lost battle with 80%+ casualties
- Army annihilated

**Severe Defeat** - Major (2 tokens)
- Lost battle with 60-79% casualties
- Heavy losses indicate poor preparation

**Numerical Advantage Squandered** - Major (2 tokens)
- Lost despite having 30%+ more units
- Wasted superiority through bad tactics

**Foolish Assault** - Major (2 tokens)
- Attacked fortified position (2x+ defense)
- Took 50%+ casualties assaulting fortress

**Pyrrhic Victory** - Minor (1 token)
- Won but lost more units than enemy
- Victory too costly

#### 3. Diplomatic Mistakes (3 types)

**Alliance Broken** - Major (2 tokens)
- Ended alliance with nation
- Damages reputation, loses military support

**Overextended in War** - Major (2 tokens)
- At war with 3+ nations simultaneously
- Divides forces, drains economy

**Suicidal War Declared** - Critical (3 tokens)
- Declared war on nation 2x+ stronger
- No allies to help, unwinnable war

#### 4. Strategic Mistakes (1 type)

**Abandoned Siege** - Major (2 tokens)
- Army moved away during 70%+ complete siege
- Wastes time investment

### Visual Feedback

**Notification Design:**
- Slides in from right side of screen
- Red/orange gradient with glowing border
- Shows mistake title and token reward
- Brief explanation of what went wrong
- Auto-dismisses after 6 seconds

**Example:**
```
┌─────────────────────────────────┐
│ 💸 BANKRUPTCY DETECTED    +3 🗡️ │
│                                 │
│ Your ruler has depleted the     │
│ national treasury! Gold: -15g   │
└─────────────────────────────────┘
```

### Smart Detection

**Cooldown System:**
- 30-second cooldown per category
- Prevents spam of same mistake type
- Different categories can trigger simultaneously

**Objective Criteria:**
- Only detects measurable, unambiguous failures
- Ruler-caused mistakes (not player's bad advice)
- Strategic failures, not personality choices

**Examples:**
- ✅ Detects: Bankruptcy, crushing defeat
- ❌ Doesn't detect: Cruel ruler's harsh policies (personality trait)

### Token Economics

**Threaten Token Sources:**
1. Advice rejections: 0-2 tokens per rejection
2. Mistake detection: 1-3 tokens per mistake

**Average Game:**
- Typical ruler makes 2-4 detectable mistakes
- Each mistake: 1-3 tokens
- Total from mistakes: 4-10 tokens per game
- Combined with rejections: 8-20 total tokens

**Strategic Impact:**
- Players can "bank" tokens by waiting for mistakes
- Rewards patient, observant gameplay
- Mistakes feel less frustrating (silver lining)
- "I told you so" satisfaction

### Technical Implementation

**Files Added:**
- `/MistakeDetector.js` (550 lines) - Detection engine with 12 mistake types
- `/PHASE5D_MISTAKES.md` - Complete documentation (1,800 lines)

**Integrations:**
- `WorldManager` - Periodic economic/diplomatic checks
- `BattleSystem` - Battle outcome analysis
- `ConquestSystem` - Siege abandonment detection
- `index.html` - Notification CSS styles

**Detection Flow:**
```
WorldManager.update()
  → MistakeDetector.update()
    → Check economic state
    → Check diplomatic relationships
    → Compare vs historical data
    → detectMistake() if threshold crossed
      → Award threaten tokens
      → Show notification
      → Update stats

BattleSystem.processBattle()
  → MistakeDetector.checkBattleResult()
    → Analyze casualties, outcomes
    → detectMistake() if poor performance
      
ConquestSystem.updateSieges()
  → If siege abandoned:
    → MistakeDetector.checkSiegeAbandoned()
      → Check completion percentage
      → detectMistake() if nearly done
```

### Player Experience

**Scenario: Economic Disaster**
```
Player: "We should build roads for income"
Ruler: "No, I will expand the army instead"
[Ruler recruits 3 armies, income goes negative]
[20 seconds later]

💸 BANKRUPTCY DETECTED - +3 🗡️
Your ruler has depleted the national treasury!

Player: "I TOLD YOU SO!"
[Uses 3 tokens to threaten economic reforms]
```

**Scenario: Military Blunder**
```
[AI ruler attacks fortified mountain city]
[Battle: 75% casualties]

🏰 FOOLISH ASSAULT - +2 🗡️
Attacked fortified position and took heavy casualties

Player: "That was terrible. Let me configure better armies."
[Opens Army UI, adds siege equipment]
```

**Learning Moments:**
- Notifications explain why it was a mistake
- Educational advice text teaches strategy
- Validates player's strategic understanding
- Creates clear feedback loops

---

## Next Steps: Phase 6+

Future phases will implement:
1. ~~**Ruler Autonomy**~~: ✅ COMPLETE - AI rulers act independently
2. ~~**Income Generation**~~: ✅ COMPLETE - Sustainable economy with income/expenses
3. ~~**Combat Resolution**~~: ✅ COMPLETE - Auto-battler with 8 combat factors
4. ~~**Conquest Mechanics**~~: ✅ COMPLETE - City capture, sieges, elimination
5. ~~**Mistake Detection System**~~: ✅ COMPLETE - Detect poor AI decisions, grant threaten tokens
6. ~~**Diplomatic Relations**~~: ✅ COMPLETE - Player & AI diplomacy
7. **Event System**: Random events (plagues, discoveries, rebellions)
8. **Technology Tree**: Research unlocks advanced units/actions
9. **Victory Conditions**: Domination (eliminate all), diplomatic, economic

## Development Notes

- **Browser Console**: Open dev tools to see saved ruler data
- **Modular Design**: Each scene is self-contained for easy expansion
- **ESM Modules**: No build step required, runs directly in browser
- **Three.js**: 3D scene provides atmospheric backdrop
- **Responsive**: Works on desktop and mobile devices

---

**Current Status**: Phase 5D Complete - Full mistake detection system that rewards observant players with threaten tokens. The game now recognizes when your AI ruler makes poor decisions (bankruptcy, crushing defeats, diplomatic blunders) and validates your strategic expertise with automatic token rewards and educational notifications.
