# Phase 4: Action Execution System

**Status:** ✅ COMPLETE

## Overview

Phase 4 implements the action execution system that translates counsel advice into concrete game actions. When the AI ruler accepts advice (voluntarily or through threats), the ActionExecutor parses the text and executes appropriate changes to the game world.

---

## System Architecture

### Core Components

1. **ActionExecutor** (`ActionExecutor.js`)
   - Parses natural language advice text
   - Matches advice to action categories
   - Executes concrete game world changes
   - Tracks action history

2. **Integration Points**
   - `CounselManager.executeAdvice()` - Entry point from counsel system
   - `WorldManager.showNotification()` - User feedback
   - `Nation.addCity()` - City creation
   - `WorldManager.updateInfluence()` - Territory recalculation

---

## Action Categories

### 1. City Building
**Triggers:** "build city", "found settlement", "establish city", "new city"

**Execution:**
- Finds best available location within player territory
- Prioritizes fertile biomes (grassland > plains > forest > others)
- Enforces 10-tile minimum distance from existing cities
- Generates procedural city name
- Updates world tiles and influence borders

**Constraints:**
- Requires owned land tiles
- Must have suitable spacing from other cities
- Land biomes only (no ocean/lake cities)

**Example Advice:**
- "We should build a new city"
- "Found a settlement in the northern grasslands"
- "Establish a city to expand our reach"

---

### 2. Territory Expansion
**Triggers:** "expand territory", "claim land", "push borders", "annex land"

**Execution:**
- Identifies unclaimed tiles adjacent to player territory
- Claims 5 tiles prioritized by biome fertility
- Updates nation influence calculations
- Shows tile gain notification

**Constraints:**
- Only claims unclaimed (neutral) tiles
- Must be adjacent to existing territory
- Land tiles only

**Example Advice:**
- "Expand our territory westward"
- "Claim more land for our nation"
- "Push our borders toward the forest"

---

### 3. War Declaration
**Triggers:** "declare war", "attack", "invade", "conquer [nation]"

**Execution:**
- Extracts target nation from text (by name or ruler)
- Creates war state entry
- Enables military actions (future phases)
- Notifies player of declaration

**Constraints:**
- Requires mentioning specific rival nation
- Cannot declare war on self
- War mechanics expanded in Phase 5

**Example Advice:**
- "Declare war on the Kingdom of Ashford"
- "Attack our northern rivals"
- "Invade the Empire" (if only one nearby)

---

### 4. Diplomacy & Peace
**Triggers:** "make peace", "negotiate", "alliance", "treaty", "diplomacy"

**Execution:**
- Improves relations with target nation (if mentioned)
- General diplomatic overtures if no target specified
- Foundation for trade/alliance system (Phase 6)

**Constraints:**
- Full diplomacy system coming in Phase 6
- Currently provides flavor/feedback

**Example Advice:**
- "Make peace with the Kingdom of Ashford"
- "Improve diplomatic relations"
- "Negotiate a treaty with our neighbors"

---

### 5. Economic Focus
**Triggers:** "economy", "trade", "gold", "wealth", "prosperity", "commerce"

**Execution:**
- Boosts city growth rates by +1%
- Applies to all player cities
- Stacks with existing growth bonuses
- Represents improved economic policies

**Effects:**
- Faster population growth
- Compounds over time
- Visual feedback in notifications

**Example Advice:**
- "Focus on economic development"
- "Improve our trade networks"
- "Increase tax revenue and commerce"

---

### 6. Military Focus
**Triggers:** "military", "army", "defense", "fortify", "strengthen forces"

**Execution:**
- Increases military strength value
- Prepares for future combat system
- Boosts nation's military power

**Constraints:**
- Full military system in Phase 5
- Currently tracks strength value

**Example Advice:**
- "Strengthen our military forces"
- "Recruit more soldiers"
- "Fortify our defenses"

---

### 7. Generic Growth
**Triggers:** "expand", "grow", "increase", "strengthen", "improve"

**Execution:**
- Intelligent action selection:
  - If < 5 cities and location available → Build city
  - Otherwise → Expand territory
- Ensures advice always has meaningful effect

**Example Advice:**
- "We should expand our nation"
- "Grow our influence"
- "Strengthen our position"

---

### 8. Acknowledged Advice
**Fallback:** Any advice not matching specific patterns

**Execution:**
- Provides acknowledgment feedback
- No immediate game state change
- Represents strategic/philosophical guidance

**Example Advice:**
- "We must remain vigilant against threats"
- "The people's loyalty is our greatest asset"
- "Time favors the patient ruler"

---

## Technical Implementation

### Parsing Algorithm

```javascript
executeAdvice(adviceText) {
  1. Convert to lowercase for matching
  2. Try regex patterns in priority order:
     - City Building
     - Territory Expansion
     - War Declaration
     - Diplomacy
     - Economic Actions
     - Military Actions
     - Generic Growth
  3. Execute first matching action
  4. Return result object with success/message/details
}
```

### Result Structure

```javascript
{
  success: true/false,
  type: 'city_building' | 'territory_expansion' | 'war_declaration' | ...,
  message: 'User-facing notification text',
  details: 'Technical details for console logging',
  [additional data specific to action type]
}
```

---

## Helper Methods

### `findBestCityLocation(nation)`
- Scans player territory for valid city sites
- Filters by 10-tile minimum distance
- Sorts by biome fertility
- Returns random selection from top 5 candidates

### `expandTerritory(nation, tileCount)`
- Finds all unclaimed tiles adjacent to player borders
- Prioritizes by fertility
- Claims specified number of tiles
- Returns actual tiles gained

### `extractTargetNation(advice)`
- Searches advice text for nation/ruler names
- Falls back to largest rival if not specified
- Returns Nation object or null

### `generateCityName(nation)`
- Procedurally generates city names
- 60%: Base + Suffix (e.g., "Ironburg", "Goldville")
- 40%: Prefix + Base (e.g., "New Crown", "Fort Stone")
- Ensures variety without repetition tracking

---

## Integration with Game Systems

### Counsel Flow

```
Player types advice
  ↓
RulerAI evaluates personality match
  ↓
If accepted (or threatened)
  ↓
CounselManager.executeAdvice()
  ↓
ActionExecutor.executeAdvice()
  ↓
Game world updated
  ↓
Notifications shown
  ↓
Action logged to history
```

### World Updates Triggered

- **City Creation:** Adds city to nation, updates tile data, recalculates influence
- **Territory Expansion:** Updates tile ownership, triggers influence recalculation
- **War Declaration:** Creates war state entry
- **Economic Boost:** Modifies city growth rates
- **Military Boost:** Updates nation military strength

---

## Examples by Action Type

### City Building Success
```
Input: "We should found a new city in the grasslands"
Output: 
  ✓ Crownford has been founded!
  Details: New city established at (45, 67) on grassland terrain.
```

### Territory Expansion Success
```
Input: "Expand our borders to the north"
Output:
  ✓ Territory expanded by 5 tiles!
  Details: Influence borders have been pushed outward...
```

### War Declaration Success
```
Input: "Declare war on the Kingdom of Ashford"
Output:
  ✓ War declared against Kingdom of Ashford!
  Details: Your armies prepare to march...
```

### Failed City Building
```
Input: "Build ten new cities immediately"
Output:
  ⚠ No suitable location found for a new city.
  Details: All good locations are too close to existing cities...
```

---

## Action History Tracking

Every executed action is logged:

```javascript
{
  turn: 15,
  advice: "We should build a new city",
  results: [
    {
      success: true,
      type: 'city_building',
      message: 'Crownford has been founded!',
      details: '...',
      location: { x: 45, y: 67, biome: 0 },
      cityName: 'Crownford'
    }
  ],
  timestamp: 1234567890
}
```

Access via: `counselManager.actionExecutor.getActionHistory()`

---

## Future Expansion (Phase 5+)

### Phase 5: Ruler Autonomy
- AI rulers make actions without counsel
- Action system used for autonomous decisions
- Mistake detection triggers token rewards

### Phase 6: Advanced Actions
- Multi-turn actions (city building takes time)
- Resource costs (gold, materials)
- Action prerequisites (tech requirements)
- Combat resolution (military actions)
- Trade route establishment
- Alliance formation

---

## Testing Advice Examples

### Test City Building
- "Build a new city"
- "Found a settlement"
- "We need more cities"

### Test Territory
- "Expand our territory"
- "Claim more land"
- "Push our borders"

### Test War
- "Declare war on [nation name]"
- "Attack our rivals"
- "Invade the north"

### Test Economy
- "Focus on the economy"
- "Improve trade"
- "Increase prosperity"

### Test Military
- "Strengthen our army"
- "Fortify our defenses"
- "Recruit soldiers"

### Test Generic
- "Expand our nation"
- "Grow our influence"
- "Make us stronger"

### Test Strategic
- "We must be cautious"
- "Prepare for winter"
- "The people need hope"

---

## Known Limitations

1. **Single Action Per Advice:** Only first matching pattern executes
2. **No Resource System:** No costs for actions yet
3. **Instant Execution:** No time delays for construction
4. **Simple Parsing:** Regex-based, not NLP
5. **No Failure Conditions:** Actions always attempt execution

These will be addressed in future phases.

---

## Console Logging

All actions log detailed information:

```
=== EXECUTING ADVICE ===
Input: We should build a new city
✓ city_building: New city established at (45, 67) on grassland terrain.
```

Enables debugging and player transparency.

---

## Summary

Phase 4 bridges the gap between AI personality decisions and concrete game state changes. The system is:

- **Flexible:** Handles diverse natural language inputs
- **Robust:** Falls back gracefully when actions can't execute
- **Extensible:** Easy to add new action types
- **Transparent:** Clear feedback on all actions
- **Integrated:** Seamlessly works with existing systems

Players can now see their counsel translate into real world changes, creating a satisfying feedback loop between advice, personality evaluation, and tangible results.
