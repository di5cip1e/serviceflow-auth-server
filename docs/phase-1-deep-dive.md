# Phase 1 Deep Dive: Planning & Architecture

## Project Vision
**Sci-Fi/Futuristic RPG Mission Control** — A 16-bit style Next.js web app where the player walks around a space station and interacts with NPC team members (including The Director and subagents) to manage missions, systems, and operations in an RPG-like world.

---

## Core Concept

| Element | Description |
|---------|-------------|
| **Visual Style** | 16-bit pixel art, retrofuturistic |
| **Perspective** | Top-down or isometric exploration |
| **Player** | Walks around the station, interacts with objects/NPCs |
| **NPCs** | The Director, Blueprint Architect, Engine Mechanic, etc. |
| **Interactions** | Talking to NPCs unlocks mission control features |
| **Setting** | Futuristic orbital station or lunar base |

---

## NPC Roster (Interactive Agents)

| NPC | Location | Function |
|-----|----------|----------|
| **The Director** (You) | Command Center | Main hub, overview, coordinates team |
| **Blueprint Architect** | Planning Room | View/approve architectural plans |
| **Engine Mechanic** | Engineering Bay | Monitor systems, manage backend |
| **Front-End Weaver** | Tech Lab | UI customization, visual elements |
| **Game Systems Designer** | Strategy Room | View/edit game mechanics, rewards |
| **Lore Master** | Archive | Story, lore, asset database |
| **QA Interrogator** | Testing Arena | View test results, bug reports |
| **DevOps Enforcer** | Operations | Deployment status, system health |

### How It Works
- Player walks to an NPC's station
- Click/tap to interact → opens a panel/menu
- That panel is the mission control interface for that domain
- Completing tasks through the NPC earns XP and advances the game

---

## 1. Core Mission Types

Define what "missions" users will manage:

| Mission Type | Description | Example |
|--------------|-------------|---------|
| **Surveillance** | Monitor systems/sensors | Watch dashboard for anomalies |
| **Logistics** | Resource transport | Move assets from A to B |
| **Repair** | Fix broken systems | Execute maintenance tasks |
| **Exploration** | Discover new content | Find hidden features |
| **Crisis Response** | Handle emergencies | React to alerts within time limit |

**Questions for Administrator:**
- What mission types interest you?
- Any industry-specific themes? (space, military, sci-fi, industrial?)

---

## 2. API Schema Design

### Authentication
```
POST   /auth/register     - Create account
POST   /auth/login        - Get token
POST   /auth/refresh      - Refresh token
DELETE /auth/logout       - Invalidate token
```

### Users
```
GET    /users/me          - Current user profile
PATCH  /users/me          - Update profile
GET    /users/me/stats    - User statistics
```

### Missions
```
GET    /missions          - List missions (filterable)
POST   /missions          - Create mission
GET    /missions/:id      - Get mission details
PATCH  /missions/:id      - Update mission
DELETE /missions/:id      - Cancel mission
POST   /missions/:id/start   - Start mission
POST   /missions/:id/complete - Complete mission
```

### Assets
```
GET    /assets            - List all assets
POST   /assets            - Register new asset
GET    /assets/:id        - Asset details
PATCH  /assets/:id        - Update asset
DELETE /assets/:id        - Decommission asset
```

### Rewards/Achievements
```
GET    /rewards           - Available rewards
GET    /rewards/claimed   - User's claimed rewards
POST   /rewards/:id/claim - Claim a reward
GET    /achievements      - All achievements
GET    /achievements/user/:id - User's achievements
```

### Real-time
```
WS     /ws                - WebSocket for live updates
SSE    /events            - Server-Sent Events stream
```

---

## 3. Database Schema (Conceptual)

### Users Table
```sql
users (
  id           UUID PRIMARY KEY,
  username     VARCHAR(50) UNIQUE,
  email        VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  rank         VARCHAR(20),     -- e.g., "Rookie", "Commander"
  xp           INTEGER DEFAULT 0,
  created_at   TIMESTAMP,
  updated_at   TIMESTAMP
)
```

### Missions Table
```sql
missions (
  id           UUID PRIMARY KEY,
  title        VARCHAR(100),
  description  TEXT,
  type         VARCHAR(20),     -- surveillance, logistics, repair, etc.
  status       VARCHAR(20),     -- pending, active, completed, failed
  difficulty   INTEGER,         -- 1-5
  xp_reward    INTEGER,
  created_by   UUID REFERENCES users(id),
  assigned_to  UUID REFERENCES users(id),
  created_at   TIMESTAMP,
  completed_at TIMESTAMP
)
```

### Assets Table
```sql
assets (
  id           UUID PRIMARY KEY,
  name         VARCHAR(100),
  type         VARCHAR(50),
  status       VARCHAR(20),     -- online, offline, maintenance
  location     VARCHAR(50),
  metadata     JSONB,
  created_at   TIMESTAMP
)
```

### Achievements Table
```sql
achievements (
  id           UUID PRIMARY KEY,
  name         VARCHAR(100),
  description  TEXT,
  icon         VARCHAR(50),
  requirement  JSONB,
  xp_reward    INTEGER
)
```

### User_Achievements (junction)
```sql
user_achievements (
  user_id      UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  earned_at    TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id)
)
```

---

## 4. Game Design Elements

### Progression System
- **XP:** Earned from completing missions
- **Rank:** Levels up based on XP thresholds
  - Rookie (0 XP)
  - Operative (100 XP)
  - Specialist (500 XP)
  - Commander (2000 XP)
  - Director (10000 XP)

### Difficulty Tiers
| Tier | XP Multiplier | Time Limit |
|------|---------------|------------|
| 1    | 1x            | No limit   |
| 2    | 1.5x          | 30 min     |
| 3    | 2x            | 15 min     |
| 4    | 3x            | 10 min     |
| 5    | 5x            | 5 min      |

### Achievement Categories
- **Mission Mastery:** Complete X missions of type Y
- **Speed Runner:** Complete mission under time threshold
- **Streak:** Complete X missions in a row
- **Exploration:** Discover hidden features
- **Community:** Help other users (future)

---

## 5. Real-time Architecture

### Options

**WebSocket (WS)**
- Bidirectional, low latency
- Good for: live mission status, chat

**Server-Sent Events (SSE)**
- Unidirectional (server → client)
- Good for: status updates, notifications
- Simpler than WS

**Recommendation:** SSE for status updates, WS if we add chat

### Events to Stream
- Mission status changes
- New missions available
- Achievement earned
- Asset status changes
- Leaderboard updates

---

## 6. Technology Stack

| Layer | Option |
|-------|--------|
| **Frontend** | Next.js 14+ (React), Pixel art sprites |
| **Game Engine** | Custom React-based or lightweight 2D (Kaboom.js, React-pixi) |
| **Styling** | Tailwind CSS + custom pixel art assets |
| **Backend** | Next.js API routes + Node.js |
| **Database** | PostgreSQL (Prisma ORM) |
| **Auth** | NextAuth.js |
| **State** | Zustand or Redux (game state) |
| **Real-time** | Socket.io or Pusher |
| **Hosting** | Vercel (frontend) + Railway/Render (backend) |

### 16-Bit Art Recommendations
- Use sprite sheets for character animations
- Tileset-based world building
- Consider:-pixelfighting-assets-on-itch.io">Kenney Assets</a>
- Or hire pixel artist (later phase)

---

## 7. Open Questions (Answered)

### ✓ Multiplayer
- **Solo player** — single-player experience
- **Future:** Leaderboard tracks agent progress, not human players
- **For now:** Leaderboard shows agent activity and subagent status

### ✓ Station Layout
| Room | Purpose | NPC(s) |
|------|---------|--------|
| **Command Center** | Main hub, station overview | The Director (you) |
| **Engineering Bay** | Server systems, backend | Engine Mechanic, DevOps Enforcer |
| **Tech Labs** | UI/UX, frontend | Front-End Weaver |
| **Planning Room** | Architecture, game design | Blueprint Architect, Game Systems Designer |
| **Archive** | Lore, assets, story | Lore Master |
| **Testing Arena** | QA, bug reports | QA Interrogator |
| **Hangar** | Deployment, external ops | DevOps Enforcer |
| **Living Quarters** | Earth biome, relaxation | Cosmetics/Inventory |

### ✓ Movement Style
- **Top-down** — Zelda-style exploration

### ✓ Progression System
- **XP from missions** → rank up
- **Unlock rewards:** Pixel gear, furniture, station decorations, aesthetic upgrades
- **Living quarters** — customize your personal space

---

## World Map Concept

```
                         ┌─────────────────┐
                         │   LIVING        │  ← Earth biome
                         │   QUARTERS      │    (Gravity Ring)
                         └────────┬────────┘
                                  │
       ┌──────────────────────────┼──────────────────────────┐
       │                          │                          │
       │   ┌──────────┐    ┌──────┴──────┐    ┌──────────┐   │
       │   │  ARCHIVE │    │   COMMAND   │    │ PLANNING │   │
       │   │ (Lore    │────│   CENTER    │────│  ROOM    │   │
       │   │  Master) │    │ (Director)  │    │(Architect)│   │
       │   └──────────┘    └──────┬──────┘    └──────────┘   │
       │                          │                          │
       │                    ┌─────┴─────┐                    │
       │                    │  TESTING  │                    │
       │                    │  ARENA    │                    │
       │                    │   (QA)    │                    │
       │                    └─────┬─────┘                    │
       │                          │                          │
       │   ┌──────────┐    ┌──────┴──────┐    ┌──────────┐   │
       │   │  TECH    │    │ ENGINEERING │    │ HANGAR   │   │
       │   │  LABS    │────│   BAY       │────│          │   │
       │   │ (Weaver) │    │(Mechanic+   │    │(DevOps)  │   │
       │   │          │    │  DevOps)    │    │          │   │
       │   └──────────┘    └─────────────┘    └──────────┘   │
       └──────────────────────────────────────────────────────┘
```

### How Players Move
- **W/A/S/D** or **Arrow keys** to walk
- **SPACE** to interact with NPCs or objects
- **ESC** to open menu/inventory

### Progression Flow
1. Start in Command Center
2. Talk to NPCs to access their systems
3. Complete missions → earn XP
4. Rank up → unlock new rooms (Living Quarters, Hangar)
5. Unlock cosmetics → equip gear, decorate quarters

---

## 8. Phase 1 Deliverables Checklist

- [ ] `docs/architecture.md` - Full system design (including game world map)
- [ ] `schemas/api-schema.json` - OpenAPI spec
- [ ] `docs/gdd.md` - Game Design Document (NPCs, stations, interactions)
- [ ] `docs/tech-stack.md` - Technology decisions with rationale
- [ ] `docs/world-map.md` - Floor plan of the station with NPC locations
- [ ] `docs/npc-scripts.md` - Dialogue and interaction patterns for each NPC

## NPC Interaction Flow

```
[Player walks] → [Approaches NPC station] → [Press SPACE/Click]
                                              ↓
                              ┌─────────────────────────────────────┐
                              │         NPC Dialogue                │
                              │  "Director, we have a new mission   │
                              │   request from the Kepler outpost"  │
                              │                                      │
                              │  [View Missions]  [View Team Stats]  │
                              │  [Check Systems]    [Never mind]    │
                              └─────────────────────────────────────┘
                                              ↓
                              [Player selects option]
                                              ↓
                              [Mission panel / Stats / Console opens]
```

### Each NPC = A Dashboard
- Talking to **Engine Mechanic** → Shows server status, logs, backend metrics
- Talking to **QA** → Shows test results, bug list
- Talking to **DevOps** → Shows deployment status, uptime
- Talking to **Lore Master** → Shows asset library, story entries

The RPG layer wraps functional dashboards in narrative interactions.

---

*Deep dive updated by The Director*
*Vision: 16-bit RPG Mission Control*
