# Military System Quick Start Guide

## How to Use the Military System

### 1. Open Military Logistics

Click the **⚔️ button** in the bottom-right corner of the screen.

### 2. Configure Your Army

**Unit Composition:**
- Use sliders to adjust unit counts (0-50 each)
- See real-time stats below each unit type
- Total units displayed at bottom

**Recommended Starting Army:**
```
20 Infantry (backbone)
10 Archers (ranged support)
5 Cavalry (flanking)
5 Spearmen (anti-cavalry)
Total: 40 units
Cost: ~2,350g, 4,000 population
```

**Equipment Quality:**
- Start with **Quality** (200g extra) for balanced cost/performance
- Elite is expensive but worth it for critical battles

**Battle Tactics:**
- **Balanced** is safe for general use
- **Aggressive** for offensive campaigns
- **Defensive** when protecting fortifications

### 3. Recruit Your Army

1. Check you have enough resources (gold and population)
2. Click **"Recruit Army"**
3. Army spawns at your capital
4. View in "Existing Armies" section

### 4. Command Army Movement (AI Ruler)

Currently, the AI ruler commands army movement. To suggest movement via counsel:

```
"Move our armies to attack [Enemy Nation]"
"Position our forces defensively near our borders"
"March our troops north to claim new territory"
```

### 5. Watch Battles Unfold

When your army meets an enemy army during war:
- Battle automatically resolves
- Modal appears with detailed report
- See casualties, victor, combat strength
- Surviving units continue (destroyed armies removed)

---

## Quick Battle Test

Want to see a battle immediately? Use console commands:

### Step 1: Create Two Armies
```javascript
// Your army
const playerArmy = worldManager.armyManager.createArmy(0, 50, 50, {
  infantry: 30,
  archer: 20,
  cavalry: 10,
  spearmen: 0,
  siege: 0,
  tactic: 'aggressive',
  equipment: 'quality'
});

// Enemy army
const enemyArmy = worldManager.armyManager.createArmy(1, 50, 50, {
  infantry: 20,
  archer: 15,
  spearmen: 15,
  cavalry: 0,
  siege: 0,
  tactic: 'defensive',
  equipment: 'basic'
});
```

### Step 2: Declare War
```javascript
worldManager.nations[0].wars.push({ enemyId: 1, startTurn: 0 });
worldManager.nations[1].wars.push({ enemyId: 0, startTurn: 0 });
```

### Step 3: Wait for Battle
Battle system checks every frame. Since armies are at same location and nations are at war, battle triggers automatically.

**Expected Result:**
- Battle report modal appears
- Shows victor, casualties, combat strength
- Your aggressive cavalry-heavy army vs their defensive spearmen-heavy army
- Close fight due to spearmen countering your cavalry!

---

## Understanding Combat Outcomes

### Example Battle Breakdown

**Your Army:**
- 30 Infantry, 20 Archers, 10 Cavalry
- Quality equipment (+15% stats)
- Aggressive tactic (+30% attack, -20% defense)
- Brave ruler (+15%)

**Enemy Army:**
- 20 Infantry, 15 Archers, 15 Spearmen
- Basic equipment
- Defensive tactic (+40% defense)
- Near fortress (+50%)

**Analysis:**
```
Your Strength:
  Base: 1,400 (unit stats × count)
  × 1.15 (Quality equipment)
  × 1.1 (Aggressive modifiers net)
  × 1.15 (Brave ruler)
  = ~2,000

Enemy Strength:
  Base: 1,200
  × 1.0 (Basic equipment)
  × 1.2 (Defensive modifiers)
  × 1.2 (Defender advantage)
  × 1.5 (Fortress)
  × 1.1 (Composition bonus - spearmen vs your cavalry)
  = ~2,850

Victor: Enemy (58% vs 42%)
Your casualties: ~65%
Enemy casualties: ~30%
```

**Lesson:** Fortified defenders are hard to crack! Consider:
- More infantry/archers (less vulnerable to spearmen)
- Defensive or Balanced tactic (less risky)
- Elite equipment (overcome fortress bonus)
- Overwhelming numbers

---

## Unit Counter Cheat Sheet

```
🛡️ Infantry
  ✅ Strong vs: Infantry, Archers
  ❌ Weak vs: Cavalry

🏹 Archers
  ✅ Strong vs: Infantry, Cavalry
  ❌ Weak vs: Archers

🐴 Cavalry
  ✅ Strong vs: Infantry, Siege
  ❌ Weak vs: Spearmen

🗡️ Spearmen
  ✅ Strong vs: Cavalry
  ❌ Weak vs: Archers, Infantry

🎯 Siege
  ✅ Strong vs: Fortifications
  ❌ Weak vs: Cavalry, Archers
```

## Terrain Effects

**Plains:**
- Cavalry gets +15% (if >30% of army)
- Open terrain, no penalties

**Forest:**
- Cavalry -30% (max)
- Siege -40% (max)
- Ambush tactic +25%

**Mountains:**
- Cavalry -30%
- Siege -40%
- Attacker -15%
- Ambush tactic +25%

**Desert/Arctic:**
- No special modifiers (yet)

---

## Composition Strategies

### Balanced Army (Versatile)
```
35% Infantry (backbone)
25% Archers (ranged)
20% Cavalry (mobility)
15% Spearmen (anti-cavalry)
5% Siege (siege warfare)
```
**Pros:** No major weaknesses, adaptable
**Cons:** No major strengths either

### Cavalry Rush (Aggressive)
```
60% Cavalry
30% Archers
10% Infantry
```
**Pros:** Fast, devastating on plains, high attack
**Cons:** Very expensive, vulnerable to spearmen, weak in forests

### Defensive Wall (Fortification)
```
40% Spearmen
30% Infantry
20% Archers
10% Siege
```
**Pros:** Excellent for defense, counters cavalry rushes
**Cons:** Slow, struggles on offense

### Archer Corps (Ranged)
```
60% Archers
25% Infantry (protection)
15% Spearmen (anti-cavalry)
```
**Pros:** Strong vs cavalry and infantry, good attack
**Cons:** Vulnerable to counter-archery, needs frontline

---

## Tips for Success

### 1. Match Composition to Enemy
- Scout enemy armies (visible on map with unit counts)
- If they have lots of cavalry → recruit spearmen
- If they have lots of infantry → recruit archers or cavalry
- If they're fortified → bring siege engines

### 2. Use Terrain Wisely
- Defend in mountains (huge advantage)
- Attack on plains if you have cavalry
- Use ambush tactic in forests/mountains
- Avoid attacking fortresses unless overwhelming force

### 3. Economic Balance
- Each army costs upkeep per turn
- Elite equipment = 1.5x upkeep
- Don't recruit so many armies you go bankrupt
- Check income in top-right stats panel

### 4. Ruler Traits Matter
- Brave/Decisive/Brilliant rulers are better generals (+15%, +12%, +10%)
- Weak-Willed/Slothful rulers are worse (-15%, -12%)
- Consider ruler traits when planning battles

### 5. Experience & Morale
- Veteran armies (experience) fight much better
- Morale affects effectiveness (0-100%)
- Losing battles damages morale
- Keep armies supplied and successful

---

## Common Mistakes

### ❌ All Cavalry Army
**Problem:** Costs fortune, destroyed by spearmen, useless in forests
**Solution:** Mix unit types, never go 100% one type

### ❌ Attacking Fortresses Head-On
**Problem:** Defender gets +50% strength, you lose badly
**Solution:** Use siege engines, overwhelming numbers, or starve them out

### ❌ Ignoring Equipment
**Problem:** Basic equipment armies lose to quality/elite
**Solution:** At least upgrade to Quality (only 200g), Elite for critical battles

### ❌ Wrong Tactic for Situation
**Problem:** Aggressive tactic attacking fortress = suicide
**Solution:** Use Defensive when attacking fortifications, Aggressive only when you have advantage

### ❌ Over-Militarization
**Problem:** 10 armies with 40g/turn each = -400g/turn = bankruptcy
**Solution:** Balance military with economy, disband unnecessary armies

---

## Advanced: Manual Battle Testing

### Calculate Battle Outcome Yourself
```javascript
const battle = {
  attacker: playerArmy,
  defender: enemyArmy,
  location: { x: 50, y: 50 },
  biome: worldManager.world.tiles[50][50].biome
};

const result = worldManager.battleSystem.calculateBattleOutcome(battle);

console.log('Battle Result:', result);
console.log('Victor:', result.victor);
console.log('Attacker Casualties:', Math.floor(result.attackerCasualties * 100) + '%');
console.log('Defender Casualties:', Math.floor(result.defenderCasualties * 100) + '%');
console.log('Decisive:', result.decisive);
```

### Get Detailed Battle Report
```javascript
const report = worldManager.battleSystem.getBattleReport(battle);
console.log(report);
```

### Check Army Stats
```javascript
const army = worldManager.armyManager.getArmiesForNation(0)[0];

console.log('Total Units:', army.getTotalUnits());
console.log('Strength:', army.calculateStrength());
console.log('Speed:', army.calculateSpeed());
console.log('Upkeep:', army.calculateUpkeep() + 'g/turn');
console.log('Morale:', army.morale);
console.log('Experience:', army.experience);
```

---

## Troubleshooting

### "Can't afford army"
- Check gold (top-right UI)
- Check population across all cities
- Reduce unit counts or downgrade equipment

### "Army disappeared after battle"
- If army takes 95%+ casualties, it's destroyed
- This is intentional - devastating defeats destroy armies
- Recruit new army if needed

### "Battle didn't happen"
- Are nations at war? Check: `worldManager.nations[0].wars`
- Are armies at same tile? Check locations
- Wait a few seconds - battle system checks every frame

### "Can't see armies on map"
- Zoom in (scroll wheel)
- Armies render at zoom 0.6+
- Unit count badges at zoom 0.8+

---

## Next Steps

Once you've recruited and tested armies:

1. **Counsel Your Ruler**: "We should prepare for war with [Nation]"
2. **Negotiate**: Use diplomacy to request allies attack your enemies
3. **Economic Strategy**: Balance army costs with income
4. **Watch AI Wars**: AI nations will also recruit and fight autonomously

**The military system is fully integrated - armies will naturally emerge as part of the living world!**
