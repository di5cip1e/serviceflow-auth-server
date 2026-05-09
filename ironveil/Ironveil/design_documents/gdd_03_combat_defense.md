# 📋 IRONVEIL — GAME DESIGN DOCUMENT
## Section 3: Combat & Defense Systems

---

> **"They come for what we've built. We answer with what we've forged."**

---

## 3.0 OVERVIEW

Combat in Ironveil is **defensive by nature** — the player doesn't seek out fights but must protect Coppervale from marauder raids. The system evolves from **pure tower defense** in the early game to a **hybrid strategic/action system** as the player builds more advanced machines.

### Combat Philosophy
- **Preparation > Reaction**: The best defense is built before the raid, not during it
- **Engineering > Combat Skill**: The player wins by building better defenses, not by being a better fighter
- **Escalation**: Raids grow harder, but the player's technology grows faster
- **Stakes**: Failed defenses have real consequences (damage to town, lost resources, NPC morale)
- **Reward**: Successful defense yields salvage, reputation, and story progression

### Combat Evolution Timeline
| Game Period | Combat Style | Player Role |
|------------|-------------|-------------|
| **Year 1, Spring** | Tutorial raid — scripted, easy | Place a few turrets, watch Captain Harrow's militia fight |
| **Year 1, Summer-Autumn** | Basic tower defense | Place turrets and walls, assign combat automatons |
| **Year 1, Winter** | Intermediate tower defense | More complex layouts, multiple attack vectors, trap placement |
| **Year 2** | Advanced tower defense + first mech | Strategic placement + optional direct mech control |
| **Year 3+** | Full hybrid — strategic command + mech action | Switch freely between overhead strategy and mech cockpit |

---

## 3.1 THE RAID SYSTEM

### Raid Lifecycle
```
INTEL PHASE (1-3 days before raid)
├── Captain Harrow delivers warning
├── Intel reveals: direction, faction, estimated strength
├── Player prepares defenses
└── NPC dialogue reflects tension
        ↓
PREPARATION PHASE (until raid triggers)
├── Place/reposition turrets and walls
├── Assign combat automatons to positions
├── Fuel and repair defense machines
├── Set traps along predicted paths
├── Deploy combat mech (if available)
└── Brief militia (story events only)
        ↓
RAID PHASE (real-time tower defense)
├── Waves of enemies approach from intel-predicted direction(s)
├── Defenses engage automatically
├── Player issues commands (focus fire, activate abilities, reposition)
├── Optional: Switch to mech for direct combat
├── Raid ends when all waves defeated or town center breached
└── Duration: 3-8 real-time minutes per raid
        ↓
AFTERMATH PHASE
├── Damage assessment
├── Salvage collection from fallen enemies
├── Repair damaged structures
├── NPC reactions (gratitude, fear, determination)
├── Reputation impact
└── Story progression (if story raid)
```

### Raid Frequency & Escalation

#### Year 1
| Season | Raids | Type | Faction | Notes |
|--------|-------|------|---------|-------|
| **Spring** | 1 | Tutorial raid | Freelance Raiders | Scripted, easy, teaches mechanics |
| **Summer** | 1-2 | Minor raids | Freelance Raiders | Small groups, one direction |
| **Autumn** | 2-3 | Moderate raids | Rust Wolves appear | Larger groups, may split into two directions |
| **Winter** | 3-4 | Serious raids + 1 Major | Rust Wolves + Iron Marauder scouts | Multiple directions, siege equipment appears |

#### Year 2
| Season | Raids | Type | Faction | Notes |
|--------|-------|------|---------|-------|
| **Spring** | 2 | Moderate | Mixed | Calm before the storm |
| **Summer** | 2-3 | Escalating | Iron Marauders | Organized, tactical, probing defenses |
| **Autumn** | 3-4 | Heavy + 1 Major | Iron Marauders | Full assault, The Marshal sends lieutenants |
| **Winter** | 4-5 + SIEGE | Major campaign | Iron Marauders | Year 2 climax — multi-wave siege event |

#### Year 3+
| Season | Raids | Type | Notes |
|--------|-------|------|-------|
| **All** | 3-5 per season | Escalating to climax | Build toward The Marshal's final campaign |
| **Story Climax** | 1 MASSIVE | Final battle | All factions, multiple fronts, everything at stake |
| **Post-Story** | 1-2 per season | Reduced, manageable | Ongoing challenge, not existential threat |

---

## 3.2 THE DEFENSE MAP

### Coppervale Defense Layout
The defense map is a **top-down strategic view** of Coppervale and its immediate surroundings, showing:

```
                    N (Ashspine Mountains)
                         │
            ┌────────────┼────────────┐
            │     The Overlook        │
            │         (hill)          │
     W ─────│    ┌──────────────┐     │───── E (The Hollow Road)
 (River)    │    │  COPPERVALE  │     │    (Primary attack vector)
            │    │  ┌────────┐  │     │
            │    │  │Workshop│  │     │
            │    │  └────────┘  │     │
            │    └──────────────┘     │
            │                         │
            └────────────┼────────────┘
                         │
                    S (Rustwood Edge)
```

### Attack Vectors
Marauders can approach from **four directions**, each with different terrain:

| Direction | Terrain | Speed | Cover | Typical Faction |
|-----------|---------|-------|-------|----------------|
| **East (Hollow Road)** | Open road, flat | Fast | Low | Iron Marauders (vehicles, organized infantry) |
| **South (Rustwood Edge)** | Forest, rough | Slow | High | Rust Wolves (ambush tactics, many small groups) |
| **West (River Crossing)** | Water + bridge | Medium | Medium | Tide Reavers (rare, river approach) |
| **North (Mountain Path)** | Narrow, rocky | Slow | Medium | Freelance Raiders (opportunistic) |

### Placement Zones
The player can place defenses in designated **placement zones** around Coppervale:

| Zone | Location | Slots | Best For |
|------|----------|-------|----------|
| **Eastern Gate** | Along Hollow Road approach | 8-12 | Turrets, walls, traps (main defense line) |
| **Southern Treeline** | Forest edge | 6-8 | Traps, spotlights, ambush turrets |
| **Western Bridge** | River crossing | 4-6 | Chokepoint — walls + turrets |
| **Northern Pass** | Mountain path entrance | 4-6 | Chokepoint — walls + turrets |
| **Inner Ring** | Around town center | 6-8 | Last line of defense |
| **Workshop Perimeter** | Around player's property | 4-6 | Personal defense |

---

## 3.3 DEFENSE UNITS

### Walls
| Type | HP | Build Cost | Notes |
|------|-----|-----------|-------|
| **Wooden Palisade** | 100 | Planks × 4 | Cheap, quick to build. Burns in fire attacks |
| **Stone Wall** | 300 | Stone Blocks × 6 | Standard defense. Resistant to most attacks |
| **Reinforced Wall** | 600 | Steel Beams × 4, Stone × 4 | Heavy defense. Resists siege equipment |
| **Aether-Shielded Wall** | 400 + Shield | Reinforced Wall + Aether Cell × 2 | Regenerates HP slowly while powered |

**Wall Mechanics:**
- Walls block enemy movement — marauders must break through or go around
- Walls can be built in **segments** to create corridors and funnels
- Damaged walls must be repaired between raids (or during, using emergency repair kits)
- Wall placement is strategic — funnel enemies past turret kill zones

### Turrets
| Type | Damage | Range | Fire Rate | Cost | Special |
|------|--------|-------|-----------|------|---------|
| **Ballistic Turret** | High | Medium | Slow | Iron × 6, Brass Gears × 2 | Armor-piercing. Best vs. heavy targets |
| **Repeater Turret** | Low | Medium | Very Fast | Iron × 4, Copper Wire × 4 | Rapid fire. Best vs. swarms |
| **Energy Turret** | Medium | Long | Medium | Lens Array × 1, Aether Cell × 2 | Aether beam. Wide arc. Uses fuel |
| **Mortar Emplacement** | Very High (AoE) | Long | Very Slow | Steel × 8, Brass × 4 | Area damage. Best vs. grouped enemies |
| **Tesla Coil** | Medium (Chain) | Short | Medium | Copper Wire × 8, Aether Cell × 3 | Chains lightning between nearby enemies |
| **Flamethrower Turret** | High (DoT) | Short | Continuous | Copper Pipe × 6, Coal × 4 | Cone damage. Ignites wooden enemies/equipment |

**Turret Mechanics:**
- Turrets auto-target enemies within range
- Player can **manually focus fire** by selecting a turret and clicking a target
- Turrets consume ammo/fuel during raids (must be stocked beforehand)
- Turrets can be **upgraded** (Mk I → Mk II → Mk III) for improved stats
- Damaged turrets have reduced effectiveness

### Traps
| Type | Effect | Uses | Cost | Notes |
|------|--------|------|------|-------|
| **Spike Strip** | Damage + slow | 3 triggers | Iron × 2 | Simple, effective |
| **Oil Slick** | Slow (major) | 1 trigger | Oil × 4 | Can be ignited for massive damage |
| **Concussion Mine** | Damage + stun | 1 trigger | Iron × 3, Aether Cell × 1 | Stuns enemies for 3 seconds |
| **Caltrops** | Damage + slow (persistent) | Infinite (area denial) | Iron × 3 | Stays active all raid |
| **Net Trap** | Immobilize 1 large target | 1 trigger | Rope × 4, Iron × 2 | Stops heavy units cold |
| **EMP Mine** | Disables enemy machines | 1 trigger | Aether Cell × 3, Copper Wire × 4 | Only works on mechanical enemies |

**Trap Mechanics:**
- Traps are invisible to enemies
- Placed before the raid on the defense map
- Single-use traps must be rebuilt after each raid
- Strategic placement in choke points and kill zones is key

### Combat Automatons
| Type | Role | Stats | AI Behavior |
|------|------|-------|-------------|
| **Guard Bot** | Stationary point defense | Medium armor, medium damage | Holds position, engages anything in range |
| **Patrol Bot** | Mobile perimeter defense | Light armor, medium damage | Patrols assigned route, engages contacts |
| **Assault Bot** | Aggressive mobile combat | Heavy armor, high damage | Charges enemy groups, prioritizes threats |
| **Medic Bot** | Repair support | Light armor, no damage | Repairs damaged turrets and walls during raids |
| **Shield Bot** | Mobile cover | Very heavy armor, no damage | Projects energy shield for nearby units |

### Combat Mechs (Player-Controlled)
| Mech | Weapons | Special Ability | Unlock |
|------|---------|----------------|--------|
| **Combat Mech (Mk I)** | Arm-mounted cannon, stomp attack | Overdrive: +50% fire rate for 10 seconds | Year 1, Autumn |
| **Combat Mech (Mk II)** | Dual cannons, missile pod | Energy Shield: 5-second invulnerability | Year 2, Spring |
| **Heavy Mech** | Gatling cannon, rocket launcher, stomp | Siege Mode: Plant feet for massive damage boost | Year 2, Autumn |
| **Siege Breaker** | Siege cannon, flamethrower, ram | Charge: Devastating forward rush | Year 3 |

---

## 3.4 ENEMY FORCES

### Freelance Raiders (Tier 1 — Easy)
Unorganized bandits. First enemies encountered.

| Unit | HP | Speed | Damage | Behavior |
|------|-----|-------|--------|----------|
| **Scavenger** | 50 | Fast | Low (club) | Rushes walls, flees at low HP |
| **Raider** | 80 | Medium | Medium (axe) | Attacks walls and turrets |
| **Raider Archer** | 40 | Medium | Medium (ranged) | Hangs back, shoots over walls |

### Rust Wolves (Tier 2 — Moderate)
Forest-dwelling bandits with guerrilla tactics.

| Unit | HP | Speed | Damage | Behavior |
|------|-----|-------|--------|----------|
| **Wolf Scout** | 60 | Very Fast | Low | Probes defenses, reveals trap locations |
| **Wolf Raider** | 100 | Medium | Medium | Standard infantry, attacks in packs |
| **Wolf Berserker** | 150 | Fast | High | Charges strongest defense point |
| **Wolf Sapper** | 70 | Slow | Low | Plants explosives on walls (high wall damage) |
| **Alpha Wolf** | 300 | Medium | High | Pack leader. Buffs nearby Wolves. Mini-boss |

### Iron Marauders (Tier 3 — Hard)
Disciplined military remnants. The primary antagonist faction.

| Unit | HP | Speed | Damage | Behavior |
|------|-----|-------|--------|----------|
| **Iron Infantry** | 120 | Medium | Medium | Organized, advances in formation |
| **Iron Shieldbearer** | 200 | Slow | Low | Absorbs damage for units behind them |
| **Iron Gunner** | 80 | Slow | High (ranged) | Long-range suppression fire |
| **Iron Technician** | 100 | Medium | Low | Repairs enemy machines, disables traps |
| **Iron Mech** | 500 | Slow | Very High | Salvaged war mech. Mini-boss level threat |
| **Siege Ram** | 800 | Very Slow | Extreme (walls only) | Battering ram. Must be stopped before reaching walls |
| **Iron Lieutenant** | 400 | Medium | High | Commander unit. Buffs all nearby Iron Marauders. Boss |
| **The Marshal** | 1000 | Medium | Very High | Final boss. Unique mechanics. Story climax |

### Tide Reavers (Tier 2.5 — Moderate-Hard, Rare)
Maritime raiders. Only attack from the western river approach.

| Unit | HP | Speed | Damage | Behavior |
|------|-----|-------|--------|----------|
| **Reaver Raider** | 90 | Fast (on water), Medium (on land) | Medium | Arrives by boat, attacks bridge |
| **Reaver Diver** | 70 | Medium | Medium | Can bypass walls by swimming under |
| **Reaver Captain** | 250 | Medium | High | Arrives on armed boat. Mini-boss |

---

## 3.5 RAID MECHANICS

### Wave System
Each raid consists of **2-5 waves** with brief pauses between:

| Raid Size | Waves | Duration | Pause Between |
|-----------|-------|----------|---------------|
| **Minor** | 2 | ~3 min | 30 seconds |
| **Moderate** | 3 | ~5 min | 30 seconds |
| **Major** | 4 | ~7 min | 45 seconds |
| **Siege** | 5+ | ~10 min | 60 seconds |

**Between waves:**
- Player can reposition mobile units
- Medic Bots repair damaged structures
- Player can switch between strategic view and mech cockpit
- New enemy composition is previewed

### Multi-Direction Raids
Starting in Year 1 Autumn, raids can come from **multiple directions simultaneously**:
- Intel warns of primary AND secondary attack vectors
- Player must split defenses
- Some raids use a feint — light force on one side, heavy force on the other
- This is where strategic depth emerges

### Raid Objectives
Not all raids are simple "kill everything" scenarios:

| Objective | Description | Frequency |
|-----------|-------------|-----------|
| **Assault** | Standard — marauders try to reach town center | Common |
| **Theft** | Marauders target the workshop — steal resources | Uncommon |
| **Sabotage** | Marauders target specific structures (turrets, walls, power grid) | Uncommon |
| **Kidnap** | Marauders try to capture an NPC | Rare (story events) |
| **Siege** | Sustained assault over multiple waves, siege equipment involved | Major events only |
| **Boss Raid** | Faction leader personally attacks with elite guard | Story climax |

### Raid Difficulty Modifiers
| Modifier | Effect | Trigger |
|----------|--------|---------|
| **Night Raid** | Reduced turret range, enemies harder to see | Random (more common in Winter) |
| **Storm Raid** | Energy turrets less effective, traps can malfunction | During storms |
| **Fog Raid** | Massively reduced vision, scouts more dangerous | Rare weather event |
| **Coordinated Assault** | Two factions attack simultaneously | Late game, story events |
| **Betrayal** | An NPC sabotages defenses (story event) | Major story twist |

---

## 3.6 MECH COMBAT (DIRECT CONTROL)

### Unlocking Mech Combat
1. Player builds a **Combat Mech** (requires Cockpit Module — Year 1 Autumn earliest)
2. During a raid, a "DEPLOY MECH" button appears on the strategic view
3. Camera switches to **third-person overhead view** of the mech
4. Player directly controls the mech in real-time

### Mech Controls (Top-Down Action)
| Action | Description |
|--------|-------------|
| **Move** | Direct movement control — mech walks/runs |
| **Primary Fire** | Main weapon (cannon, gatling, etc.) |
| **Secondary Fire** | Alt weapon (missiles, flamethrower, etc.) |
| **Stomp** | Area-of-effect melee attack (damages nearby ground units) |
| **Special Ability** | Mech-specific ability (shield, overdrive, charge, siege mode) |
| **Return to Strategy** | Switch back to overhead strategic view |

### Mech Combat Feel
- **Weighty**: Mechs are powerful but not nimble. Turning takes time. Movement has momentum.
- **Impactful**: Every shot shakes the screen slightly. Stomp attacks send enemies flying. Explosions are satisfying.
- **Vulnerable**: The mech is strong but not invincible. Taking too much damage forces retreat for repairs.
- **Strategic**: The mech is most effective when supported by turrets and automatons. Lone mech = surrounded mech.

### Mech Damage & Repair
- Mech has **component-based HP**: Legs, arms, torso, cockpit each have separate HP
- Damage to legs = slower movement
- Damage to arms = reduced weapon effectiveness
- Damage to torso = overall HP loss
- Cockpit breach = forced eject (mech disabled for remainder of raid)
- Post-raid: Damaged mech components must be repaired/replaced (uses same maintenance system)

---

## 3.7 VICTORY & DEFEAT CONDITIONS

### Victory
- All raid waves defeated
- Town center not breached
- **Rewards**: Marauder salvage, reputation gain, NPC gratitude, potential blueprint drops, story progression

### Partial Victory
- Raid repelled but significant damage to town
- Some structures destroyed, resources lost
- NPC morale drops
- Repair costs are significant

### Defeat
- Town center breached (marauders reach the clocktower square)
- **Consequences** (NOT game over — Ironveil doesn't punish failure harshly):
  - Resources stolen (lose 20-30% of stored resources)
  - Structures damaged/destroyed
  - NPC morale drops significantly
  - Some NPCs may temporarily leave town (return after rebuilding)
  - The player must rebuild damaged defenses
  - Story acknowledges the defeat (NPCs reference it, adds motivation)

**Design Philosophy**: Defeat is a setback, not a game-over. The player should feel the sting of failure but be motivated to rebuild stronger, not frustrated into quitting. This aligns with Harvest Moon's forgiving design philosophy.

---

## 3.8 DEFENSE RATING & REPUTATION

### Defense Rating
Coppervale has a **Defense Rating** that reflects its overall military strength:

| Rating | Level | Description | Effect |
|--------|-------|-------------|--------|
| 0-20 | **Vulnerable** | Minimal defenses | Raids more frequent, NPCs anxious |
| 21-40 | **Guarded** | Basic perimeter | Standard raid frequency |
| 41-60 | **Defended** | Solid defenses | Reduced raid frequency, better intel |
| 61-80 | **Fortified** | Strong military presence | Rare raids, marauders may avoid Coppervale |
| 81-100 | **Impregnable** | Legendary defenses | Major raids only (story-driven), NPCs feel safe |

**Defense Rating is calculated from:**
- Wall coverage (% of perimeter walled)
- Turret count and quality
- Combat automaton count
- Combat mech availability
- Trap coverage
- Recent raid performance

### Reputation Impact
- High defense rating + successful defenses = NPC morale boost
- Other Beacon Towns hear of Coppervale's strength → better trade offers
- The Marshal takes notice → escalates his campaign (story progression)
- New NPCs may be attracted to settle in a well-defended town

---

## 3.9 STRATEGIC CONSIDERATIONS

### Defense Economy
Building and maintaining defenses costs resources. The player must balance:
- **Offense vs. Defense**: Resources spent on turrets can't be spent on trade zeppelins
- **Breadth vs. Depth**: Cover all approaches lightly, or fortify one approach heavily?
- **Active vs. Passive**: Invest in expensive automated turrets, or cheaper walls that require manual defense?
- **Short-term vs. Long-term**: Build cheap wooden palisades now, or save for stone walls?

### Terrain Exploitation
- **Chokepoints**: Narrow passes (North, West) are easier to defend with fewer resources
- **Open Terrain**: The East road is wide and hard to block — requires more investment
- **Elevation**: The Overlook hill provides bonus range for turrets placed there
- **Water**: The river provides natural defense on the West — only the bridge needs guarding

### NPC Contributions
Some NPCs contribute to defense:
- **Captain Harrow**: Provides intel quality bonuses, commands militia during raids
- **Spark**: Can boost turret fire rate temporarily during raids (if friendship is high)
- **Other NPCs**: May volunteer for watch duty, provide resources for defense, or boost morale

---

*This Combat & Defense Systems Document is Part 3 of the Ironveil GDD.*
*Next: Section 4 — Relationship & Social Systems*

*— Forged by the Djinn*
