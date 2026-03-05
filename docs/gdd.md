# Station Command - Game Design Document

## Project Overview
A 16-bit style top-down RPG where players walk around an orbital space station, interacting with NPC team members to manage missions, systems, and operations.

---

## Station Rooms

### 1. Command Center
- **NPC:** The Director (you)
- **Purpose:** Main hub, station overview, mission briefing
- **Interactions:** Start new missions, view station status, check leaderboard
- **Dialogue Example:**
  > "Commander, we have a new mission request from the Kepler outpost. Shall I brief you?"

### 2. Engineering Bay
- **NPCs:** Engine Mechanic, DevOps Enforcer
- **Purpose:** Server status, system logs, backend management
- **Interactions:** View server health, restart services, check error logs
- **Dialogue Example (Mechanic):**
  > "The quantum drive is running at 98% efficiency. But I've been seeing some odd latency spikes..."

### 3. Tech Labs
- **NPC:** Front-End Weaver
- **Purpose:** UI customization, visual elements, frontend debugging
- **Interactions:** Customize station visuals, test UI components, view design specs

### 4. Planning Room
- **NPCs:** Blueprint Architect, Game Systems Designer
- **Purpose:** Architecture plans, game mechanics, mission design
- **Interactions:** Review architectural proposals, adjust game balance

### 5. Archive
- **NPC:** Lore Master
- **Purpose:** Story, lore, asset database, mission history
- **Interactions:** Browse lore entries, view asset library, read mission logs

### 6. Testing Arena
- **NPC:** QA Interrogator
- **Purpose:** Bug reports, test results, quality metrics
- **Interactions:** View test reports, file bug reports, check coverage

### 7. Hangar
- **NPC:** DevOps Enforcer
- **Purpose:** Deployment status, external operations, system updates
- **Interactions:** Deploy updates, check deployment status, manage releases

### 8. Living Quarters (Gravity Ring)
- **Purpose:** Earth biome relaxation area, customization
- **Interactions:** Customize personal space, view collection, manage cosmetics

---

## NPC Roster

| NPC | Role | Location | Function |
|-----|------|----------|----------|
| The Director | Commander | Command Center | Mission briefing, overview |
| Engine Mechanic | Backend Dev | Engineering | Server status, DB, APIs |
| DevOps Enforcer | Infrastructure | Engineering/Hangar | Deployments, monitoring |
| Front-End Weaver | UI/UX | Tech Labs | Visual design, frontend |
| Blueprint Architect | Systems Design | Planning Room | Architecture, schemas |
| Game Systems Designer | Game Design | Planning Room | Mechanics, balance, XP |
| Lore Master | Narrative | Archive | Lore, assets, story |
| QA Interrogator | Testing | Testing Arena | Bugs, tests, quality |

---

## Progression System

### Ranks
| Rank | XP Required | Unlocks |
|------|-------------|---------|
| Ensign | 0 | Command Center, Tech Labs |
| Lieutenant | 500 | Engineering Bay |
| Commander | 2000 | Planning Room, Archive |
| Captain | 5000 | Testing Arena |
| Admiral | 15000 | Hangar, Living Quarters |

### XP Sources
- Complete missions: 10-100 XP (difficulty-based)
- Discover lore entries: 5 XP each
- Bug reports (QA): 15 XP
- Help team members: 20 XP

### Unlocks
- **Gear:** Pixel art hats, uniforms, accessories
- **Furniture:** Desk, plants, wall decorations for Living Quarters
- **Visual Effects:** Screen borders, particle effects
- **Rooms:** New station areas

---

## Mission Types

| Type | Description | Difficulty Range |
|------|-------------|------------------|
| **Surveillance** | Monitor systems for anomalies | 1-3 |
| **Logistics** | Transport resources between stations | 1-4 |
| **Repair** | Fix broken systems, debug issues | 2-5 |
| **Exploration** | Discover new content, hidden areas | 1-3 |
| **Crisis Response** | Handle emergencies within time limit | 3-5 |

### Mission Structure
1. **Briefing:** NPC explains mission objectives
2. **Preparation:** Player gathers required resources
3. **Execution:** Complete tasks (timed for higher difficulties)
4. **Completion:** Earn XP, unlock rewards
5. **Debrief:** NPC comments on performance

---

## Interaction Mechanics

### Movement
- **WASD** or **Arrow Keys** to walk
- **SPACE** to interact with NPC/object
- **ESC** to open menu

### NPC Interaction Flow
```
[Player approaches NPC] → [Press SPACE] → [Dialogue box opens]
                                              ↓
                              ┌─────────────────────────────────┐
                              │ NPC Name                        │
                              │ " dialogue text here..."        │
                              │                                 │
                              │ [Option 1] [Option 2] [Option 3]│
                              └─────────────────────────────────┘
                                              ↓
                              [Player selects option]
                                              ↓
                              [Mission panel / Action executes]
```

### Dialogue System
- Branching conversation trees
- Choices affect NPC relationship
- Some dialogues unlock missions

---

## User Interface

### HUD Elements
- **Top-left:** Player name, rank, XP bar
- **Top-right:** Mini-map, current zone name
- **Bottom:** Interaction prompt when near NPC
- **Center:** Dialogue box (when active)

### Panels (via NPC interaction)
- Mission Panel: List, start, track missions
- Inventory: View collected items/cosmetics
- Character Sheet: Stats, achievements, rank
- Station Status: System health, logs

---

## Future Features (Phase 2+)

- Multiplayer co-op missions
- Guild/fleet management
- Procedural mission generation
- Mobile touch controls
- Cross-platform save

---

*Game Design Document v1.0*
*Station Command*
