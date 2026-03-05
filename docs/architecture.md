# Station Command - Architecture Document

## Overview

**Project Name:** Station Command  
**Type:** Web-based 16-bit style RPG game with real-time mission control elements  
**Core Functionality:** Top-down pixel art space station exploration with NPC interactions, mission management, and RPG progression  
**Target Users:** Casual gamers, retro game enthusiasts, strategy game fans

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Next.js 14)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │   React     │  │   Zustand   │  │   Canvas/   │  │   Socket.io    │   │
│  │  Components │  │    Store    │  │   Phaser    │  │    Client      │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVER (Next.js API)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │   NextAuth  │  │   Prisma    │  │   Socket.io │  │    Game        │   │
│  │   Handlers  │  │   Client    │  │   Server    │  │    Engine      │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE (PostgreSQL)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │   Users     │  │   Missions  │  │   NPCs      │  │  Achievements   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **State Management:** Zustand (client game state)
- **Game Engine:** Phaser 3 (pixel art rendering)
- **Styling:** CSS Modules + CSS Variables for theming
- **HTTP Client:** Native fetch with React Query patterns

### Key Components

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing/Dashboard
│   ├── game/
│   │   └── [zone]/page.tsx     # Dynamic zone pages
│   └── api/
│       └── [...routes]         # API routes
├── components/
│   ├── game/
│   │   ├── GameCanvas.tsx      # Phaser container
│   │   ├── PlayerSprite.tsx    # Player character
│   │   ├── NPCSprite.tsx       # NPC characters
│   │   ├── ZoneMap.tsx         # Station map renderer
│   │   └── UIOverlay.tsx       # HUD, dialogue boxes
│   ├── ui/
│   │   ├── MissionPanel.tsx    # Active missions display
│   │   ├── CharacterSheet.tsx  # Player stats/XP
│   │   ├── InventoryGrid.tsx   # Item management
│   │   └── AchievementToast.tsx
│   └── dialogue/
│       ├── DialogueBox.tsx     # NPC conversation UI
│       └── ChoiceSelector.tsx  # Dialogue choices
├── stores/
│   ├── playerStore.ts          # Player state (Zustand)
│   ├── missionStore.ts         # Mission tracking
│   ├── dialogueStore.ts        # Current conversation
│   └── socketStore.ts          # WebSocket connection
├── hooks/
│   ├── useGameState.ts         # Game state sync
│   ├── useSocket.ts            # WebSocket hook
│   └── useDialogue.ts          # Dialogue system
├── lib/
│   ├── api.ts                  # API client utilities
│   ├── gameConfig.ts           # Game constants
│   └── pixelArtUtils.ts        # Sprite utilities
└── types/
    └── index.ts                # TypeScript definitions
```

---

## Backend Architecture

### API Structure

```
/api/
├── auth/
│   ├── [...nextauth]/route.ts  # NextAuth handlers
│   └── register/route.ts       # User registration
├── users/
│   ├── me/route.ts             # Current user profile
│   └── [id]/route.ts           # User CRUD
├── missions/
│   ├── route.ts                # List/create missions
│   └── [id]/route.ts           # Mission details/update
├── npcs/
│   ├── route.ts                # NPC list
│   └── [id]/route.ts           # NPC details/dialogue
├── assets/
│   ├── route.ts                # Asset library
│   └── [id]/route.ts           # Asset details
├── achievements/
│   ├── route.ts                # Achievement list
│   └── user/route.ts           # User achievements
└── websocket/
    └── route.ts                # Socket.io upgrade endpoint
```

### Game Engine (Server-Side)

```typescript
// lib/server/gameEngine.ts
class GameEngine {
  // Manages real-time game state
  // Handles mission timers
  // Coordinates multiplayer zones
  // Processes NPC AI schedules
  
  updatePlayerPosition(userId: string, position: Position): void
  triggerMissionEvent(missionId: string, event: MissionEvent): void
  syncGameState(userId: string): GameState
}
```

---

## Database Schema (Prisma)

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    User      │       │   Mission    │       │    NPC       │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │◄──────│ userId       │       │ id           │
│ email        │       │ id           │       │ name         │
│ username     │       │ title        │       │ role         │
│ passwordHash │       │ description  │       │ zoneId       │
│ rank         │       │ status       │       │ positionX    │
│ xp           │       │ type         │       │ positionY    │
│ createdAt    │       │ difficulty   │       │ spriteKey    │
│ updatedAt    │       │ rewards      │       │ dialogueTree │
└──────────────┘       │ startTime    │       └──────┬───────┘
        │              │ endTime      │              │
        │              │ progress     │       ┌──────▼───────┐
        │              └──────────────┘       │  Dialogue    │
        │                                       ├──────────────┤
┌──────▼───────┐                                │ id           │
│   Profile    │                                │ npcId        │
├──────────────┤                                │ trigger      │
│ userId       │◄──────────────────────────────│ nodes        │
│ avatar       │                                │ conditions   │
│ bio          │                                └──────────────┘
│ preferences  │
└──────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Achievement │       │    Asset     │       │    Zone      │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ name         │       │ name         │       │ name         │
│ description  │       │ type         │       │ type         │
│ icon         │       │ rarity       │       │ background   │
│ xpReward     │       │ spriteKey    │       │ npcs         │
│ conditions   │       │ stats        │       │ exits        │
└──────────────┘       └──────────────┘       └──────────────┘
```

### Prisma Schema

```prisma
// schema.prisma (key models)

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  rank          Rank      @default(ENSIGN)
  xp            Int       @default(0)
  profile       Profile?
  missions      Mission[]
  achievements  UserAchievement[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Mission {
  id          String        @id @default(cuid())
  userId      String
  user        User          @relation(fields: [userId], references: [id])
  title       String
  description String
  status      MissionStatus @default(AVAILABLE)
  type        MissionType
  difficulty  Difficulty
  rewards     Json
  progress    Json          @default("{}")
  startTime   DateTime?
  endTime     DateTime?
  zoneId      String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model NPC {
  id            String    @id @default(cuid())
  name          String
  role          String
  zoneId        String
  positionX     Int
  positionY     Int
  spriteKey     String
  defaultDialogue String?
  dialogueTree  Json
  gifts         String[]  @default([])
  schedule      Json?
}

model Zone {
  id          String   @id @default(cuid())
  name        String
  type        String
  background  String
  width       Int
  height      Int
  spawnX      Int
  spawnY      Int
  npcs        NPC[]
  connections Json
}

model Achievement {
  id          String             @id @default(cuid())
  name        String
  description String
  icon        String
  xpReward    Int
  conditions  Json
  users       UserAchievement[]
}
```

---

## API Design

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user |
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me` | Update profile |
| GET | `/api/missions` | List available missions |
| POST | `/api/missions` | Create new mission |
| GET | `/api/missions/[id]` | Get mission details |
| PATCH | `/api/missions/[id]` | Update mission progress |
| POST | `/api/missions/[id]/complete` | Complete mission |
| GET | `/api/npcs` | List all NPCs |
| GET | `/api/npcs/[id]` | Get NPC with dialogue |
| POST | `/api/npcs/[id]/dialogue` | Advance dialogue |
| GET | `/api/achievements` | List achievements |
| GET | `/api/achievements/user` | User's achievements |
| POST | `/api/achievements/[id]/unlock` | Unlock achievement |

### WebSocket Events

```typescript
// Client -> Server
'player:move'       // { x, y, zoneId }
'mission:start'     // { missionId }
'mission:progress'  // { missionId, progress }
'npc:interact'      // { npcId }
'dialogue:choice'   // { dialogueId, choiceIndex }

// Server -> Client
'game:sync'         // Full game state
'player:update'     // Player position/state
'mission:update'    // Mission state changes
'npc:state'         // NPC availability
'dialogue:start'    // Begin dialogue
'achievement:unlock' // New achievement
'zone:event'        // Zone-specific events
```

---

## Game State Management

### Client State (Zustand)

```typescript
// stores/playerStore.ts
interface PlayerState {
  user: User | null;
  position: { x: number; y: number };
  zoneId: string;
  inventory: Asset[];
  activeMissions: Mission[];
  
  // Actions
  movePlayer: (x: number, y: number) => void;
  updateXP: (amount: number) => void;
  addToInventory: (asset: Asset) => void;
}

// stores/gameSyncStore.ts
interface GameSyncState {
  lastSync: number;
  pendingChanges: GameAction[];
  isConnected: boolean;
  
  syncWithServer: () => Promise<void>;
  queueAction: (action: GameAction) => void;
}
```

### State Flow

```
User Input → Zustand Store → Game Engine → Socket Emit
                                    ↓
                              Optimistic Update
                                    ↓
                              Server Validation
                                    ↓
                              State Reconciliation
                                    ↓
                              UI Re-render
```

---

## Real-Time Strategy Elements

### Mission System

- **Timed Missions:** Countdown timers with real-time progression
- **Resource Management:** Allocate assets to mission success
- **Multi-player Coordination:** Team missions requiring multiple players
- **Dynamic Events:** Random zone events affecting mission difficulty

### Event System

```typescript
interface ZoneEvent {
  id: string;
  type: 'emergency' | 'visitor' | 'malfunction' | 'opportunity';
  zoneId: string;
  message: string;
  choices?: EventChoice[];
  duration?: number;
  spawnsNPC?: string;
}
```

---

## Security Considerations

1. **Authentication:** NextAuth.js with JWT strategy
2. **Password:** Argon2id hashing
3. **API Rate Limiting:** 100 req/min per user
4. **WebSocket:** Auth token validation on connect
5. **Input Validation:** Zod schemas on all endpoints
6. **XSS Prevention:** React auto-escaping + Content Security Policy

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (Frontend)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Next.js    │  │   Static    │  │    Serverless       │ │
│  │   App       │  │   Assets    │  │    Functions        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   RAILWAY (Backend + DB)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Node.js    │  │  Socket.io  │  │    PostgreSQL       │ │
│  │   API       │  │   Server    │  │    (Prisma)         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Game Loop FPS | 60fps |
| WebSocket Latency | < 100ms |
| API Response Time | < 200ms |

---

## Future Considerations (Phase 2+)

- Multiplayer co-op missions
- Guild/system fleet management
- Procedural mission generation
- Mobile touch controls
- Cross-platform cloud save
