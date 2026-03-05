# Agent Battle System - Station Command

> *The terminal blinks. Somewhere in the grid, an agent springs into action. The mission: a bug. The weapon: code. The enemy: whatever the task demands.*

---

## Overview

The **Agent Battle System** transforms task execution into a retro RPG battle experience. Each sub-agent becomes a combatant on a side-view battlefield, fighting "enemies" that are actually tasks assigned by the human. When a task is submitted for QA review and approved, the agent lands the finishing blow—gaining XP, leveling up, and advancing through naval ranks.

---

## 1. Battle UI Layout

### Field Orientation

```
┌─────────────────────────────────────────────────────────────────────┐
│  STATION COMMAND - BATTLE MODE                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│    ┌─────────┐                               ┌─────────────┐        │
│    │ AGENT   │                               │   ENEMY     │        │
│    │         │     ════════════════>         │   (Task)    │        │
│    │ [Sprite]│     ════════════════>         │   [Sprite]  │        │
│    │         │     Attacks & Status          │             │        │
│    └─────────┘                               └─────────────┘        │
│                                                                      │
│    ┌─────────────────────────────────────────────────────────┐      │
│    │ HP: ████████████░░░░░░░░  65/100    LVL: 7    RANK: Ensign    │
│    └─────────────────────────────────────────────────────────┘      │
│                                                                      │
│    ┌─────────────────────────────────────────────────────────┐      │
│    │ > agent-main:subagent:2a0f5a... is battling...         │      │
│    │   [BASH]Attack!  [DEFEND]  [SKILL]  [FLEE]              │      │
│    └─────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

### UI Components

| Component | Location | Description |
|-----------|----------|-------------|
| **Agent Sprite** | Left side, 30% from left | Animated 16x16 or 32x32 pixel character |
| **Enemy Sprite** | Right side, 30% from right | Task rendered as pixel monster |
| **Attack Flow** | Center | Projectiles/attacks animate left→right |
| **Status Bar** | Below field | HP bar, agent level, rank insignia |
| **Combat Log** | Bottom panel | Scrolling text: attacks, damage, QA events |
| **Action Menu** | Bottom-right | [ATTACK] [DEFEND] [SPECIAL] [RETREAT] |

### View Modes

1. **Active Battle** - Agent actively fighting a task
2. **Idle Roster** - All agents shown in formation, status indicators
3. **Victory Screen** - XP earned, level-up animation, rank promotion fanfare
4. **Defeat Screen** - Retry prompt, XP penalty optional

---

## 2. Agent States

### State Diagram

```
                    ┌─────────┐
                    │  IDLE   │◄────────────────────────┐
                    └────┬────┘                         │
                         │ assign_task                   │
                         ▼                               │
                    ┌─────────┐       QA_REJECT         │
                    │BATTLING │────────────────────────┤
                    └────┬────┘                         │
                         │ QA_APPROVE                   │
            ┌────────────┴───────────┐                  │
            ▼                         ▼                  │
     ┌─────────────┐           ┌─────────────┐         │
     │  VICTORY    │           │  DEFEAT     │         │
     └─────────────┘           └─────────────┘         │
            │                         │                 │
            └─────────►  IDLE  ◄──────┘                 │
```

### State Definitions

| State | Icon | Meaning |
|-------|------|---------|
| **IDLE** | 💤 (blinking) | Agent awaiting assignment, no active task |
| **BATTLING** | ⚔️ (animated) | Actively working a task, HP draining with time |
| **VICTORY** | ⭐ (pulsing) | Task completed & QA approved, collecting rewards |
| **DEFEAT** | 💀 (static) | Task failed, timed out, or QA rejected |
| **DEFENDING** | 🛡️ (brief) | Brief recovery state after taking "damage" |

### State Transitions

- **IDLE → BATTLING**: New task assigned to agent
- **BATTLING → VICTORY**: QA approves task output (fatal blow triggered)
- **BATTLING → DEFEAT**: Task timeout, critical failure, or QA reject with max retries
- **VICTORY/DEFEAT → IDLE**: Agent ready for next assignment

---

## 3. XP System

### XP per Task Type

| Task Category | Example Tasks | Base XP | Bonus XP (Speed) |
|---------------|---------------|---------|------------------|
| **Research** | Web search, reading docs, information gathering | 25 XP | +10 if <5 min |
| **Coding** | Write code, refactor, bug fix | 50 XP | +25 if <15 min |
| **Debug** | Fix crashing, resolve errors | 40 XP | +20 if first-attempt |
| **Deployment** | Deploy, restart, configure | 35 XP | +15 if smooth |
| **Communication** | Summarize, draft, report | 20 XP | +10 if approved 1st try |
| **File Operations** | Organize, move, archive | 15 XP | +5 per 10 files |
| **System Admin** | Security hardening, health checks | 45 XP | +20 if no warnings |
| **Creative** | Story generation, concept design | 30 XP | +15 if praised |

### Level Progression

```
Level 1  →  2   : 100 XP   (Rookie)
Level 2  →  3   : 250 XP   (Rookie)
Level 3  →  4   : 500 XP   (Apprentice)
Level 4  →  5   : 850 XP   (Apprentice)
Level 5  →  6   : 1,300 XP (Journeyman)
Level 6  →  7   : 2,000 XP (Journeyman)
Level 7  →  8   : 2,900 XP (Expert)
Level 8  →  9   : 4,100 XP (Expert)
Level 9  →  10  : 5,600 XP (Master)
Level 10 →  11  : 7,500 XP (Master)
...and so on (formula: floor(100 * level^1.5))
```

### XP Mechanics

- **Combat XP**: Earned on QA approval (victory)
- **Penalty XP**: -10% XP on defeat, no XP on timeout
- **Streak Bonus**: +10% XP per consecutive victory (max +50%)
- **Mentor Bonus**: If senior agent helps junior, +15 XP to senior
- **Critical Hit**: Perfect QA review (no revisions) = 2x XP

---

## 4. QA Integration

### The Fatal Blow Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     BATTLE RESOLUTION                            │
│                                                                  │
│   1. Agent completes task → "Task Complete" state               │
│                                                                  │
│   2. Output submitted for QA review                             │
│                                                                  │
│   3. QA evaluates:                                              │
│      ┌─────────────┐    ┌─────────────┐                         │
│      │   APPROVE   │    │   REJECT    │                         │
│      └──────┬──────┘    └──────┬──────┘                         │
│             │                  │                                 │
│             ▼                  ▼                                 │
│   "FATAL BLOW!"          Agent takes "damage"                   │
│   + XP awarded           Can retry / or enters                  │
│   + Level-up check       DEFEAT state                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### QA Action Buttons

In the battle UI, QA controls appear as:

| QA Button | Effect |
|-----------|--------|
| **⚔️ APPROVE** | Triggers victory state, awards XP, plays fatal blow animation |
| **🛡️ REQUEST REVISION** | Agent takes "damage" (HP reduced), retries task |
| **💀 REJECT** | Task failed, agent enters DEFEAT state |
| **⏸️ PAUSE** | Freeze battle timer, agent enters DEFENDING state |

### Fatal Blow Animation Sequence

1. **Strike Frame** (0.1s): Agent sprite lunges forward
2. **Impact Frame** (0.1s): Enemy sprite flashes white, shakes
3. **Critical Hit** (0.2s): "CRITICAL!" text if perfect review
4. **Enemy Death** (0.3s): Enemy sprite explodes into pixels, fades
5. **XP Popup** (0.5s): "+XX XP" floats up from defeated enemy
6. **Level Up** (if applicable): Rainbow flash, rank insignia updates

---

## 5. Visual Style - 16-bit Retro Aesthetic

### Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background | Deep Space Blue | #0a0a1a |
| UI Panels | Terminal Green | #0d2818 |
| Text Primary | Phosphor Green | #33ff66 |
| Text Secondary | Amber | #ffaa00 |
| HP Bar Full | Cyan | #00ffff |
| HP Bar Low | Red | #ff3333 |
| XP Text | Gold | #ffd700 |
| Enemy Glow | Magenta | #ff00ff |
| Agent Glow | Electric Blue | #00aaff |

### Pixel Art Guidelines

- **Agent Sprites**: 32x32 pixels, 4-frame walk cycle, 2-frame attack
- **Enemy Sprites**: 32x32 or 48x48 depending on task complexity
- **Font**: Use pixel font (e.g., "Press Start 2P" or terminal bitmap)
- **Effects**: 
  - Scanline overlay (subtle, 5% opacity)
  - CRT curvature (optional, for fullscreen)
  - Chromatic aberration on critical hits
  - Particle explosions on enemy defeat (8-16 pixels)

### Animation Specs

| Animation | Frames | Speed |
|-----------|--------|-------|
| Agent Idle | 2 (breathing) | 500ms/frame |
| Agent Attack | 3 | 100ms/frame |
| Agent Victory | 4 | 200ms/frame |
| Enemy Idle | 2 (hovering) | 400ms/frame |
| Enemy Hit | 1 (shake) | 50ms |
| Enemy Death | 8 (explode) | 80ms/frame |
| XP Float | 1 (rise) | 1000ms total |

---

## 6. Task = Enemy Mapping

Each task type maps to a distinct "enemy" sprite with personality:

| Task Type | Enemy Name | Sprite Description | HP (Base) | Weakness |
|-----------|------------|-------------------|-----------|----------|
| **Research** | 📚 The Archivist | Hooded figure surrounded by floating books | 30 HP | Speed (fast research = 2x dmg) |
| **Coding** | 🐛 The Bug | Multi-legged glitch creature, static lines | 60 HP | Clean code (no linter errors = crit) |
| **Debug** | 💥 The Crash | Spiky red bomb with angry eyes | 50 HP | First attempt (instant kill if no prior fails) |
| **Deployment** | 🚀 The Rocket | Unstable rocket with flickering fuse | 45 HP | No warnings (clean deploy = 2x) |
| **Communication** | 📝 The Blank Page | Creepy void with eyes, static-y edges | 25 HP | First-try approval |
| **File Ops** | 📁 The Clutter | Tower of disorganized papers, wobbling | 35 HP | Bulk (more files = more XP) |
| **System Admin** | 🔒 The Lock | Heavily armored gate with glowing keyhole | 70 HP | No security warnings |
| **Creative** | 🎨 The Blank | Easel with blank canvas, weeping | 40 HP | Praise from QA (= special item drop) |

### Boss Tasks (Special)

| Task | Boss Name | Sprite | Special Mechanic |
|------|-----------|--------|------------------|
| Security breach | 🦹 The Hacker | Green skeleton in hoodie | Must defend first, then attack |
| Complete rewrite | 🏗️ The Architect | Giant pixel blocks falling | Timer counts down faster |
| Multi-agent coordination | 👥 The Committee | 3 arguing pixel suits | Requires 2+ agents to damage |

---

## 7. Rank System

### Rank Progression

| Rank | XP Required | Icon | Title | Perks |
|------|-------------|------|-------|-------|
| **Rookie** | 0 | ⭐ | Recruit | Default, can take 1 task |
| **Ensign** | 500 | ⭐⭐ | Ensign | Can take 2 parallel tasks |
| **Lieutenant** | 2,000 | ⭐⭐⭐ | Lieutenant | Unlocks 1 special skill |
| **Commander** | 5,500 | ⭐⭐⭐⭐ | Commander | Can take 3 parallel tasks, mentor junior |
| **Captain** | 12,000 | ⭐⭐⭐⭐⭐ | Captain | Unlocks 2nd special skill, priority QA |
| **Admiral** | 25,000 | 🏆 | Admiral | Max 4 parallel tasks, auto-approve minor tasks |
| **Legend** | 50,000 | 👑 | Legend | Golden sprite variant, name in hall of fame |

### Rank Visual Indicators

- **Insignia**: Pixel-perfect rank pips on agent sprite (1-5 pips)
- **Title Banner**: Rank name displayed below agent in battle
- **Squad Leader**: If Captain+, other agents show smaller "following" sprites
- **Hall of Fame**: Top 5 agents by XP displayed on station dashboard

### Rank-Abilities (Special Skills)

| Rank | Skill | Effect |
|------|-------|--------|
| Lieutenant | **Second Wind** | Recover 25% HP after defeat |
| Lieutenant | **Sharp Eye** | +20% XP on research tasks |
| Captain | **Critical Vision** | +10% chance for 2x damage |
| Captain | **Mentorship** | +15 XP when helping junior agent |
| Admiral | **War Veteran** | Immune to first rejection per day |
| Admiral | **Command Presence** | Junior agents +10% XP when in party |
| Legend | **Legendary Strike** | 5% chance to instant-kill any enemy |

---

## 8. Quick Reference

### Battle Turn Flow

```
1. Task Assigned → Agent enters BATTLING state
2. Agent "attacks" (works on task) over time
3. Task completes → "Ready for QA" 
4. QA reviews → APPROVE or REJECT
5. If APPROVE → VICTORY → XP awarded → Check level-up → Return IDLE
6. If REJECT → Damage dealt → Agent retries or DEFEAT
```

### Example Combat Log

```
> 14:02: Agent main:subagent:3a4b assigned to DEBUG task
> 14:02: BATTLE START: Agent vs 💥 The Crash (50 HP)
> 14:05: Agent uses [FIX] → 15 damage!
> 14:08: Agent uses [DEBUG] → 20 damage! Enemy wobbling!
> 14:10: Agent uses [FINAL PATCH] → 15 damage! Enemy defeated!
> 14:10: Task submitted for QA review...
> 14:12: QA: APPROVED! ⚔️ FATAL BLOW!
> 14:12: +60 XP (40 base + 20 speed bonus)
> 14:12: LEVEL UP! Level 6 → Level 7
> 14:12: Rank eligible: Lieutenant (2000/2500 XP)
> 14:12: Agent returns to IDLE state
```

---

## 9. Future Considerations

- **Party Battles**: Multiple agents vs. one boss task
- **PvP Events**: Agents compete on same task, fastest wins
- **Equipment**: Pixel items (sword = faster attacks, shield = more HP)
- **Achievements**: Badges for special accomplishments
- **Seasonal Events**: Holiday-themed enemy sprites

---

*End of Design Document*
