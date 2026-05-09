# Shadow Council - Build Plan

## Executive Summary

**Current State**: Phase 5D Complete — Functional grand strategy game with:
- Ruler creation + trait system (10 positive, 10 negative traits)
- Procedural 100×100 world with 6 biomes
- LLM-powered counsel system (advise your AI ruler)
- Autonomous AI nations with personality-driven decisions
- Economic system (income/expenses)
- Military system (5 unit types, 8-factor auto-battler)
- Conquest + siege mechanics
- Mistake detection → threaten token rewards

**Goal**: Complete the game with Victory Conditions, Events, Tech Tree, polish, and missing features to create a full "Shadow Council" experience.

---

## PHASE 1: Stabilize & Audit (Week 1)

### 1.1 Code Audit
- [ ] **Verify all JS modules load without errors** — Run game, check console for import/runtime errors
- [ ] **Test core gameplay loop** — Quiz → Creation → World → Counsel actions
- [ ] **Verify LLM integration** — Test ChatManager calls work (or implement fallback)
- [ ] **Check all UI scenes render** — Quiz, Ruler Creation, World View, Counsel UI, Army UI, Diplomacy UI
- [ ] **Test save/load** — Game state persistence across sessions

### 1.2 Bug Fixes
- [ ] Fix any critical runtime errors
- [ ] Ensure AI actions execute without breaking
- [ ] Verify combat resolves correctly
- [ ] Check income calculations are accurate
- [ ] Test territory conquest works end-to-end

### 1.3 Asset Verification
- [ ] Verify all sprite assets load (trait_icons, ruler_portraits, counsel_ui_overlay, etc.)
- [ ] Check Three.js scene renders correctly
- [ ] Validate UI overlays display properly

---

## PHASE 2: Victory Conditions (Week 2)

### 2.1 Victory System Framework
```
// victortyConditions.js
- checkVictoryConditions()
- notifyVictory(type, winner)
- endGame(winner)
```

### 2.2 Victory Types
| Type | Condition | Token Reward |
|------|-----------|--------------|
| **Domination** | Control 60% of world territory | 10 tokens |
| **Diplomatic** | Allied with 75% of surviving nations | 10 tokens |
| **Economic** | Reach 50,000 gold treasury | 10 tokens |
| **Conquest** | Eliminate all rival nations | 10 tokens |
| **Prestige** | Max city count + population (combined) | 10 tokens |

### 2.3 Defeat Conditions
- [ ] Player nation eliminated → Game Over screen
- [ ] Bankruptcy (gold < 0 for 10+ turns) → Optional game over or crisis mode

### 2.4 End Game UI
- [ ] Victory/Defeat modal overlay
- [ ] Statistics summary (territory, cities, wars, etc.)
- [ ] "Play Again" button → Restart to quiz

---

## PHASE 3: Event System (Week 3)

### 3.1 Event Framework
```javascript
// EventSystem.js
- events: Event[]  // Pool of possible events
- triggerRandomEvent()
- handleEventChoice(event, choice)
- applyEventEffects(effects)
```

### 3.2 Event Categories

**Natural Events** (0-15 turn interval):
| Event | Effect | Ruler Decision |
|-------|--------|----------------|
| Plague | -20% population, -10% city growth | Quarantine vs. Pray vs. Research |
| Famine | -15% food/prosperity | Ration vs. Import vs. Ignore |
| Earthquake | Destroy random city improvement | Rebuild vs. Relocate vs. Blame |
| Great Fire | -10% city population | Fight vs. Rebuild vs. Blame citizens |
| Golden Age | +30% income for 10 turns | Celebrate vs. Invest vs. Save |

**Political Events**:
| Event | Effect | Ruler Decision |
|-------|--------|----------------|
| Succession Crisis | -20 trust, random event triggers | Consolidate vs. Appease vs. Suppress |
| Noble Rebellion | -15% income, war declaration possible | Crush vs. Negotiate vs. Flee |
| Religious Schism | -10 trust with theocratic nations | Suppress vs. Reform vs. Ignore |
| Merchant Guild Demand | +10% income if accepted, -20 if refused | Grant vs. Deny vs. Delay |

**Military Events**:
| Event | Effect | Ruler Decision |
|-------|--------|----------------|
| Great General Rises | +30% army strength | Honor vs. Jealousy vs. Deploy |
| Fortress Complete | +50% defense in capital | Celebrate vs. Expand vs. Ignore |
| Spy Discovered | Can sabotage rival | Execute vs. Turn vs. Release |

**Mystery Events**:
| Event | Effect | Ruler Decision |
|-------|--------|----------------|
| Prophet Appears | Random positive trait for 20 turns | Embrace vs. Dismiss vs. Exile |
| Ancient Ruins Found | Gain random tech or gold | Explore vs. Seal vs. Guard |
| Comet Sighted | Global mood effect | Worship vs. Fear vs. Ignore |

### 3.3 Event Integration
- [ ] Random event triggers every 10-20 turns (configurable)
- [ ] Events pause game briefly for player awareness
- [ ] AI rulers also receive events and make decisions
- [ ] Counsel can advise on event responses

---

## PHASE 4: Technology Tree (Week 4)

### 4.1 Tech Categories

**Military Tech**:
| Tier | Tech | Effect | Cost |
|------|------|--------|------|
| 1 | Iron Working | Unlock Quality equipment | 500 |
| 1 | Advanced Fortification | Fortresses +25% defense | 500 |
| 2 | Siege Engines | Unlock Siege units | 800 |
| 2 | Horse Breeding | Cavalry +15% speed | 800 |
| 3 | Elite Armory | Unlock Elite equipment | 1200 |
| 3 | War Colleges | All armies +10% strength | 1200 |
| 4 | Logistics | Army upkeep -20% | 2000 |
| 4 | total War | Conquered cities +20% population kept | 2000 |

**Economic Tech**:
| Tier | Tech | Effect | Cost |
|------|------|--------|------|
| 1 | Trade Routes | Roads +25% income | 500 |
| 1 | Agricultural | +15% city growth | 500 |
| 2 | Banking | +30% gold from trade | 800 |
| 2 | Irrigation | Plains +50% income | 800 |
| 3 | Market Economy | All income +15% | 1200 |
| 3 | Guilds | +1 extra trade route capacity | 1200 |
| 4 | Merchant Navy | Trade route income +50% | 2000 |
| 4 | Industrial Revolution | Unlock factories (future) | 2000 |

**Civic Tech**:
| Tier | Tech | Effect | Cost |
|------|------|--------|------|
| 1 | codified Laws | +10 trust gain | 500 |
| 1 | Census | Better city management | 500 |
| 2 | Currency | -10% all expenses | 800 |
| 2 | Propaganda | Enemy nations -10 trust | 800 |
| 3 | Feudal Contracts | AI allies +20% army strength | 1200 |
| 3 | Postal System | AI action speed +15% | 1200 |
| 4 | Divine Right | Theocracy +30% income | 2000 |
| 4 | Enlightenment | All positive traits +1 effectiveness | 2000 |

### 4.2 Tech Implementation
- [ ] Tech tree UI panel (accessible from main UI)
- [ ] Research points system (gain per turn based on cities)
- [ ] Tech progress visualization
- [ ] AI prioritizes tech based on personality
- [ ] Unlock new unit types/buildings when researched

---

## PHASE 5: Shadow Council Mechanics (Week 5)

### 5.1 Reframe: "Shadow Council"
This is the thematic layer — player is invisible counsel guiding the AI.

**Rename Phases**:
- "Counsel" → "Shadow Council"
- "Threaten Tokens" → "Shadow Influence"
- Visual theme: Hooded figures, whispers,暗中 (Chinese for "in shadow")

### 5.2 Expanded Influence System
- [ ] **Shadow Influence Points** (rename threaten tokens)
  - Generate 1 per 2 minutes
  - Gain 1-3 from ruler mistakes
  - Can use to: Force decisions, Plant ideas, Suppress dissent
- [ ] **Whisper System** — Pre-fill AI decision-making
  - Spend 2 influence to "plant an idea" → AI gets +20% bias toward your next advice
  - Doesn't guarantee acceptance, just tilts the scale
- [ ] **Court Intrigue** — Negative events create opportunities
  - Noble rebellion? Spend influence to guide response toward mercy or cruelty
  - Economic crisis? Influence toward expansion or consolidation

### 5.3 Council UI Refresh
- [ ] New "Shadow Council" themed UI overlay
- [ ] Influence meter with shadow/void aesthetic
- [ ] "Whisper" button (plant idea) vs "Command" button (threaten)
- [ ] History of past whispers and their outcomes

---

## PHASE 6: AI Improvements (Week 6)

### 6.1 Smarter AI Rulers
- [ ] **Memory** — AI remembers past player advice and outcomes
  - "Last time we attacked, we lost — now hesitant to wage war"
- [ ] **Adaptation** — AI learns from mistakes
  - If bankrupt once, future AI prioritizes economy
- [ ] **Personality Evolution** — Traits can shift slightly based on events
  - Defeats make rulers more Paranoid
  - Victories make rulers more Arrogant (possible negative!)

### 6.2 AI Coalition Dynamics
- [ ] **Balance of Power** — AI nations ally against strongest
- [ ] **Cold Wars** — AI nations compete without direct war
- [ ] **Diplomatic Cycles** — Alliances form and break organically

### 6.3 AI Counsel Responses (Quality of Life)
- [ ] More varied, colorful dialogue
- [ ] Inside jokes referencing past events
- [ ] Rulers acknowledge when player was right ("As you predicted...")

---

## PHASE 7: Content Expansion (Week 7)

### 7.1 Additional Nations
- [ ] Expand AI name pools (24 → 100+ per gender)
- [ ] Unique nation names and backstories
- [ ] Special nation archetypes:
  - Island nations (naval focus)
  - Desert empires (economic focus)
  - Mountain dwarves (fortress focus)
  - Nomadic hordes (cavalry focus)

### 7.2 Expanded Trait Interactions
- [ ] **Trait Synergies**: Certain combos unlock special behaviors
  - Charismatic + Diplomatic: Automatic trade deal attempts
  - Brilliant + Ambitious: Faster tech research
  - Paranoid + Cruel: Aggressive fortification
- [ ] **Hidden Traits**: Rare events can unlock secret traits
  - "The Mad" — Unpredictable but powerful
  - "The Blessed" — Random positive events
  - "The Cursed" — Random negative events

### 7.3 Additional Unit Types
- [ ] **Naval Units** (if map has significant water)
  - Galleys, Frigates, Man-o-War
- [ ] **Special Units**
  - Royal Guard (elite infantry)
  - Assassin (diplomatic sabotage)
  - Scout (map exploration)

---

## PHASE 8: Polish & UX (Week 8)

### 8.1 Visual Polish
- [ ] Enhanced particle effects for 3D scene
- [ ] Smooth city growth animations
- [ ] Battle animations (not just reports)
- [ ] New UI themes (dark fantasy, parchment, etc.)

### 8.2 Audio (Optional)
- [ ] Ambient medieval music
- [ ] Sound effects (city bells, battle drums, counsel whispers)
- [ ] TTS for ruler responses (optional "storytime" mode)

### 8.3 Mobile Optimization
- [ ] Touch controls refined
- [ ] UI scales for phones
- [ ] Performance optimization for lower-end devices

### 8.4 Tutorial System
- [ ] First-time player guided tour
- [ ] Tooltips for all major systems
- [ ] "Advice for new Counselors" tips

---

## PHASE 9: Post-Launch / Future (Ongoing)

### 9.1 Mod Support
- [ ] Custom nation templates
- [ ] Custom event definitions
- [ ] Custom tech trees

### 9.2 Multiplayer (Future)
- [ ] Local hot-seat multiplayer
- [ ] Async multiplayer (email notifications)

### 9.3 Community Features
- [ ] Leaderboards
- [ ] Replay sharing
- [ ] Strategy guides

---

## Implementation Priority

```
Week 1: Audit & Stabilize
  ↓
Week 2: Victory Conditions
  ↓  
Week 3: Event System
  ↓
Week 4: Technology Tree
  ↓
Week 5: Shadow Council Rebrand
  ↓
Week 6: AI Improvements
  ↓
Week 7: Content Expansion
  ↓
Week 8: Polish & UX
```

---

## Key Files to Create/Modify

**New Files**:
- `VictorySystem.js` — Victory condition checking
- `EventSystem.js` — Random event triggers
- `TechTree.js` — Research and unlock system
- `CouncilMechanics.js` — Shadow influence, whispers
- `AIImprovements.js` — Memory, adaptation, evolution
- `TutorialSystem.js` — Onboarding

**Modified Files**:
- `config.js` — Add victory/tech/event config
- `GameUI.js` — Add victory screens, tech panel, event notifications
- `WorldManager.js` — Integrate new systems into game loop
- `CounselManager.js` — Add whisper mechanics
- `index.html` — New CSS for event/modals

---

## Success Metrics

- [ ] Full game playable start-to-victory in <60 minutes
- [ ] No critical bugs in core loop
- [ ] All 5 victory types achievable
- [ ] At least 20 unique events triggering
- [ ] Tech tree provides meaningful progression
- [ ] "Shadow Council" theme feels cohesive
- [ ] AI feels intelligent and personality-driven

---

## Notes for Derek

1. **Start with Week 1** — Don't skip the audit. Know what's broken before adding features.

2. **Victory conditions are foundational** — Without them, games have no endpoint. Build these first after stabilization.

3. **Events bring life** — The game feels "dead" without random events. This is high-impact for relatively low code cost.

4. **Shadow Council rebrand is mostly aesthetic** — Rename tokens, adjust UI colors, add "whisper" mechanics. Low effort, high thematic payoff.

5. **AI improvements are iterative** — Don't try to build perfect AI week 1. Add memory, then adaptation, then evolution — each builds on the last.

Ready to begin? Say the word and we'll kick off with Phase 1.
