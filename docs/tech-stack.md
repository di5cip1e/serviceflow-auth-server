# Station Command - Technology Stack

## Overview
16-bit style Next.js web game with RPG elements, mission control mechanics, and real-time features.

---

## Frontend

### Core
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Language:** TypeScript
- **Package Manager:** pnpm

### Game Engine
- **Renderer:** Phaser 3 (2D pixel art)
- **Alternative:** React-based canvas (simpler for UI-heavy games)
- **Decision:** Start with React + CSS for UI, optional Phaser for overworld

### State Management
- **Client State:** Zustand (lightweight, TypeScript-friendly)
- **Server State:** React Query (TanStack Query) for API caching
- **Game State:** Zustand with persistence (localStorage)

### Styling
- **CSS:** CSS Modules + CSS Variables
- **Pixel Art:** Custom sprites, Kenney Assets
- **Fonts:** Pixel-style (e.g., Press Start 2P, VT323)

---

## Backend

### API
- **Runtime:** Next.js API Routes (Serverless)
- **Language:** TypeScript / Node.js

### Database
- **Primary:** PostgreSQL
- **ORM:** Prisma
- **Hosting:** Railway, Supabase, or Neon

### Authentication
- **Library:** NextAuth.js
- **Providers:** Credentials (email/password)
- **JWT:** Access token (15min) + Refresh token (7 days)

---

## Real-Time

### WebSocket
- **Library:** Socket.io
- **Server:** Custom server or Vercel WebSocket (third-party)
- **Alternative:** Pusher (managed, easier)

### Events
- Player movement sync
- Mission timer updates
- NPC state changes
- Achievement notifications

---

## Infrastructure

### Hosting
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend + API routes |
| **Railway** | Backend services, PostgreSQL, Socket.io |
| **Cloudflare** | CDN, DDoS protection |

### Deployment
- **CI/CD:** GitHub Actions
- **Container:** Docker (for Railway)
- **Secrets:** Environment variables

---

## Development Tools

### IDE
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense

### Version Control
- **Git** + GitHub
- **Branch Strategy:** Feature branches, main for deploy

### Testing
- **Unit:** Vitest + React Testing Library
- **E2E:** Playwright
- **Lint:** ESLint + Prettier

---

## File Structure

```
station-command/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth
│   │   │   ├── missions/      # Mission CRUD
│   │   │   ├── users/         # User endpoints
│   │   │   └── socket/        # WebSocket
│   │   ├── game/              # Game pages
│   │   └── layout.tsx
│   ├── components/
│   │   ├── game/              # Game components
│   │   │   ├── GameCanvas.tsx
│   │   │   ├── Player.tsx
│   │   │   ├── NPC.tsx
│   │   │   └── DialogueBox.tsx
│   │   └── ui/                # UI components
│   ├── stores/                # Zustand stores
│   │   ├── playerStore.ts
│   │   ├── missionStore.ts
│   │   └── uiStore.ts
│   ├── lib/                   # Utilities
│   │   ├── api.ts
│   │   ├── socket.ts
│   │   └── gameConfig.ts
│   └── types/                 # TypeScript types
├── prisma/
│   └── schema.prisma
├── public/
│   ├── sprites/               # Pixel art assets
│   └── sounds/
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## Dependencies

### Production
```json
{
  "next": "14.x",
  "react": "18.x",
  "zustand": "4.x",
  "@prisma/client": "5.x",
  "next-auth": "4.x",
  "socket.io": "4.x",
  "socket.io-client": "4.x",
  "zod": "3.x"
}
```

### Development
```json
{
  "typescript": "5.x",
  "prisma": "5.x",
  "eslint": "8.x",
  "prettier": "3.x",
  "vitest": "1.x",
  "@playwright/test": "1.x"
}
```

---

## Security

- **Auth:** NextAuth.js with JWT
- **Password:** Argon2id hashing (via bcrypt)
- **Validation:** Zod schemas on all inputs
- **Rate Limiting:** 100 req/min per user
- **CORS:** Strict origin allowlist
- **CSP:** Content Security Policy headers

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Game Loop FPS | 60fps |
| WebSocket Latency | < 100ms |
| API Response (p95) | < 200ms |

---

## Environment Variables

```env
# Database
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# External
SOCKET_PORT=
```

---

*Technology Stack v1.0*
*Station Command*
