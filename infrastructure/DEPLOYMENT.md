# Station Command - Deployment Guide

## Overview

This document covers deploying Station Command to production.

**Architecture:**
- **Frontend:** Next.js app at `/frontend` (port 3001)
- **Backend:** Next.js API at `/backend` (port 3000)
- **Database:** PostgreSQL (via Docker or managed service)
- **Vector DB:** Qdrant (for semantic memory)
- **Cache:** Redis (for short-term memory)

---

## Current Build Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | Not built | Run `npm run build` in /backend |
| Frontend | Not built | Run `npm run build` in /frontend |
| Database Schema | Ready | Prisma schema at /backend/prisma/schema.prisma |
| Docker Setup | Ready | docker-compose.yml in /infrastructure |

**API Routes (25+):**
- `/api/agents` - Agent CRUD
- `/api/agents/[id]` - Single agent operations
- `/api/agents/[id]/xp` - XP management
- `/api/missions` - Mission management
- `/api/tasks` - Task operations
- `/api/events` - Event handling
- `/api/users/me` - Current user profile
- `/api/assets` - Asset management
- `/api/achievements` - Achievement system
- `/api/memory` - Memory/vector operations
- `/api/health` - Health check
- `/api/npcs` - NPC management
- `/api/auth/*` - Authentication (login, register, me, nextauth)

---

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL client (for migrations)

---

## Environment Variables

### Required for Production

Create `.env` from the template:

```bash
cp infrastructure/.env.production infrastructure/.env
# Edit with actual values
```

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Auth secret (generate with `openssl rand -base64 32`) | `your-secret-here` |
| `NEXTAUTH_URL` | Production URL | `https://your-domain.com` |

### Local Development

```bash
# Start all services
cd infrastructure
docker-compose up --build

# Run migrations
docker-compose exec app npx prisma migrate dev

# Open http://localhost:3000 (backend) or http://localhost:3001 (frontend)
```

---

## Database Setup

### Option 1: Docker (Development)

```bash
cd infrastructure
docker-compose up -d postgres
```

### Option 2: Managed PostgreSQL (Production)

Use a managed service like:
- **Railway** - `railway add postgresql`
- **Neon** - Serverless PostgreSQL
- **Supabase** - PostgreSQL + extras
- **AWS RDS** - Enterprise option

### Database Migrations

```bash
# Development
cd backend
npx prisma migrate dev

# Production
npx prisma migrate deploy

# After schema changes
npx prisma generate
```

---

## Build Commands

### Backend

```bash
cd backend
npm install
npm run build
```

### Frontend

```bash
cd frontend
npm install
npm run build
```

### Docker (All-in-one)

```bash
cd infrastructure
docker-compose up --build
```

---

## Deployment Platforms

### Vercel (Recommended)

1. **Frontend + API:**
   ```bash
   npm i -g vercel
   vercel link
   vercel --prod
   ```

2. **Set environment variables in Vercel dashboard**

### Railway

1. **Backend service:**
   ```bash
   npm i -g @railway/cli
   railway init
   railway up
   ```

2. **Add PostgreSQL:**
   ```bash
   railway add postgresql
   ```

### Docker Production

```bash
# Build and run
cd infrastructure
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f
```

---

## Troubleshooting

### Build Issues

```bash
# Clear Next.js cache
rm -rf frontend/.next backend/.next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Issues

```bash
# Check DATABASE_URL format
# Should be: postgresql://user:password@host:port/database

# Test connection
npx prisma db execute --stdin
```

### Container Issues

```bash
# Rebuild without cache
docker-compose build --no-cache

# Check logs
docker-compose logs app
docker-compose logs postgres
```

---

## Quick Reference

```bash
# Development
docker-compose up

# Production build
docker-compose -f docker-compose.yml up -d --build

# Stop all
docker-compose down

# Reset everything
docker-compose down -v
```
