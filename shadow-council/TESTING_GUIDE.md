# Testing Guide - Phase 4 Complete

## Quick Start Testing

### 1. Start the Game
- Complete personality quiz
- Create your ruler with traits
- Watch world generation (2 seconds)
- Review rival nations
- Click "Begin Your Counsel"

### 2. Test Counsel Actions
Open the counsel interface (💬 button) and try these:

#### City Building
```
"We should build a new city"
"Found a settlement in the grasslands"
"Establish a new city to expand"
```
**Expected**: New city appears, notification shows location and biome

#### Territory Expansion
```
"Expand our territory"
"Claim more land to the north"
"Push our borders outward"
```
**Expected**: Notification shows "+X tiles gained", borders expand

#### Economic Focus
```
"Focus on economic development"
"Improve our trade networks"
"Increase prosperity"
```
**Expected**: "+1% growth rate" notification, cities grow faster

#### Military Actions
```
"Strengthen our military"
"Recruit more soldiers"
"Draft an army"
```
**Expected**: Military strength increases (visible in console)

#### War Declaration
```
"Declare war on [rival nation name]"
"Attack the Kingdom of Ashford"
```
**Expected**: War declaration notification

### 3. Watch AI Actions
Open browser console (F12) and watch the AI tick logs:

```
=== AI ACTION TICK ===
Kingdom of Ashford priorities: {
  foundCity: 75,
  buildFortress: 60,
  constructRoad: 85,
  upgradeInfrastructure: 70,
  draftArmy: 45
}
✓ Kingdom of Ashford - constructRoad: Road: Ashford ↔ Ironburg
```

**What to observe**:
- Actions occur every 8 seconds
- Different nations have different priorities
- Nations with more cities build roads
- Paranoid nations build fortresses
- Ambitious nations found cities

### 4. Visual Verification

**Look for these on the map**:
- **New cities**: Circles appearing in colored territories
- **Roads**: Dashed golden lines between cities
- **Fortresses**: Square structures with corner towers
- **Expanding borders**: Colored influence zones growing
- **Growing cities**: Existing cities getting larger

**Map Controls**:
- Drag to pan
- Scroll to zoom
- Hover tiles for info

---

## Advanced Testing

### Check Action History
```javascript
// In browser console:
worldManager.aiActionEngine.getActionHistory()
```

Returns full log of all AI actions:
```javascript
[{
  nationId: 1,
  nationName: "Kingdom of Ashford",
  action: "foundCity",
  result: { success: true, message: "Founded Ironburg" },
  turn: 15,
  timestamp: 1234567890
}, ...]
```

### Check Nation Resources
```javascript
// Player nation (id 0)
const player = worldManager.nations[0];
console.log("Gold:", player.gold);
console.log("Cities:", player.cities.length);
console.log("Roads:", player.roads?.length || 0);
console.log("Fortresses:", player.fortresses?.length || 0);
console.log("Military:", player.militaryStrength);

// AI nation (id 1+)
const rival = worldManager.nations[1];
console.log(rival.name, "has", rival.cities.length, "cities");
```

### Check City Details
```javascript
const capital = worldManager.nations[0].getCapital();
console.log("Population:", capital.population);
console.log("Infrastructure:", capital.infrastructureLevel || 0);
console.log("Growth bonus:", capital.growthBonus || 0);
console.log("Size:", capital.getSize());
```

### Modify AI Speed
```javascript
// Speed up AI actions (3 seconds instead of 8)
worldManager.aiActionEngine.actionInterval = 3000;

// Slow down AI actions (20 seconds)
worldManager.aiActionEngine.actionInterval = 20000;
```

### Enable Player Autonomous Actions
```javascript
// Make your ruler act autonomously like AI
worldManager.aiActionEngine.setPlayerAutonomous(true);

// Disable (back to counsel-only control)
worldManager.aiActionEngine.setPlayerAutonomous(false);
```

---

## Personality Testing

### Test Different Ruler Types

**Ambitious Democracy**:
- Expect: Rapid city founding, infrastructure upgrades
- Watch console for "foundCity" and "upgradeInfrastructure" actions

**Paranoid Militarism**:
- Expect: Heavy fortress building, army drafting
- Look for fortresses appearing on borders

**Slothful Oligarchy**:
- Expect: Road construction, minimal expansion
- Should avoid "foundCity", favor "constructRoad"

**Wrathful Autocracy**:
- Expect: Military buildup, aggressive expansion
- "draftArmy" should be common

### Verify Trait Influence

Create rulers with specific traits and watch priorities:
- **Ambitious**: Should found cities more
- **Shrewd**: Should build roads more
- **Paranoid**: Should build fortresses more
- **Slothful**: Should act less overall

---

## Debugging Common Issues

### "No suitable location for city"
**Cause**: All good locations taken or too close to existing cities
**Solution**: Expected behavior, nations eventually run out of space
**Check**: Look at map - are there any large empty spaces in nation color?

### "No tokens available for threaten"
**Cause**: All threaten tokens used
**Solution**: Wait 2 minutes for regeneration
**Check**: Token UI shows count and progress bar

### AI not acting
**Cause**: Game might be paused
**Solution**: Click "▶ Resume" button
**Check**: Console should show AI ACTION TICK every 8 seconds

### Fortresses not visible
**Cause**: Might be zoomed out too far
**Solution**: Scroll to zoom in on borders
**Check**: Look for square structures with towers

### Roads not visible
**Cause**: Normal - roads are subtle dashed lines
**Solution**: Zoom in between two connected cities
**Check**: Should see golden dashed line

---

## Performance Testing

### Check Frame Rate
```javascript
// Monitor FPS (should stay near 60)
setInterval(() => {
  console.log("FPS:", Math.round(1000 / (performance.now() - lastTime)));
  lastTime = performance.now();
}, 1000);
```

### Check Memory Usage
- Open DevTools → Performance → Memory
- Record for 30 seconds
- Check for memory leaks (should be stable)

### Stress Test
```javascript
// Speed up everything for stress test
worldManager.aiActionEngine.actionInterval = 1000; // Every 1 second
```
Game should remain smooth even with rapid AI actions.

---

## Expected Behaviors

### Turn 0-10 (Early Game)
- AI nations found 1-2 cities
- Some fortress building on borders
- Limited roads (need 2+ cities first)
- Rapid expansion into neutral territory

### Turn 11-30 (Mid Game)
- City founding slows (spacing constraints)
- Road construction increases
- Infrastructure upgrades begin
- Military buildup starts
- Borders stabilize

### Turn 31+ (Late Game)
- Fewer new cities
- Heavy infrastructure investment
- Road networks complete
- Fortress chains on borders
- Large armies

---

## Known Quirks

1. **AI can temporarily go negative gold**: Working as intended, income system in Phase 5
2. **Multiple roads to same city**: Can happen, represents multiple routes
3. **Fortresses in interior**: Rare but possible if borders shift
4. **Notifications for all AI actions**: Intentional at 30% rate for awareness
5. **Roads through enemy territory**: Visual only, pathfinding in future phase

---

## Success Checklist

After 5 minutes of gameplay, you should see:

✅ Player nation has 1-2 counsel-founded cities  
✅ AI nations have founded 2-4 cities each  
✅ Roads connecting major cities  
✅ Fortresses on tense borders  
✅ Borders visibly expanding  
✅ Cities growing in size  
✅ Console logs showing AI decisions  
✅ Smooth 60fps performance  
✅ No console errors  

---

## Reporting Issues

If something doesn't work:

1. Open browser console (F12)
2. Look for error messages (red text)
3. Check what action was attempted
4. Verify game state:
   ```javascript
   console.log(window.gameState);
   console.log(worldManager.nations);
   ```
5. Note reproduction steps

---

## Fun Experiments

### Create a Militaristic World
- Generate rulers with Brave, Ambitious, Wrathful traits
- Watch fortress chains and armies
- Expect aggressive expansion

### Create a Peaceful World
- Generate rulers with Merciful, Diplomatic, Just traits
- Watch infrastructure and roads
- Expect slow, stable growth

### Speed Run
```javascript
worldManager.aiActionEngine.actionInterval = 500; // 0.5s actions
```
Watch nations explode across the map

### Giant Nation
Use counsel to:
1. "Build a new city" (repeat 5x)
2. "Expand our territory" (repeat 3x)
3. "Focus on economy" (repeat 2x)
4. "Construct roads between cities"

Watch your influence dominate the map

---

## Console Commands Cheat Sheet

```javascript
// View all nations
worldManager.nations

// Get player nation
worldManager.getPlayerNation()

// Get action history
worldManager.aiActionEngine.getActionHistory()

// Change AI speed
worldManager.aiActionEngine.actionInterval = 5000 // milliseconds

// Enable player autonomy
worldManager.aiActionEngine.setPlayerAutonomous(true)

// Advance turn manually
worldManager.advanceTurn()

// Check counsel log
window.gameState.counselLog

// Get nation by name
worldManager.nations.find(n => n.name.includes("Ashford"))
```

---

## Final Notes

- **Be patient**: AI ticks every 8 seconds, not instantly
- **Watch the console**: Most interesting info is logged there
- **Zoom in/out**: Details visible at different zoom levels
- **Hover tiles**: Shows owner, biome, influence percentage
- **Try different advice**: Parser handles many phrasings

**Enjoy watching your world come alive!** 🎮👑
