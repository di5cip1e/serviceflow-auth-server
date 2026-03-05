# Station Command - Deployment Checklist

## Pre-Deployment

- [ ] Review architecture docs in `/docs`
- [ ] Verify all API routes are implemented
- [ ] Test locally with Docker

## Infrastructure Setup

- [ ] **Set up PostgreSQL database**
  - [ ] Choose provider (Docker/Railway/Neon/Supabase)
  - [ ] Create database instance
  - [ ] Note connection string

- [ ] **Set up Redis** (for caching/sessions)
  - [ ] Docker: Already in docker-compose.yml
  - [ ] Managed: Redis Cloud, Upstash, etc.

- [ ] **Set up Qdrant** (vector database)
  - [ ] Docker: Already in docker-compose.yml
  - [ ] Managed: Qdrant Cloud

## Configuration

- [ ] **Configure environment variables**
  - [ ] Copy `infrastructure/.env.production` to `.env`
  - [ ] Set `DATABASE_URL` (PostgreSQL connection)
  - [ ] Set `NEXTAUTH_SECRET` (run: `openssl rand -base64 32`)
  - [ ] Set `NEXTAUTH_URL` (production domain)

- [ ] **Update docker-compose.yml**
  - [ ] Set production passwords
  - [ ] Configure ports if needed
  - [ ] Enable health checks

## Build

- [ ] **Build backend**
  ```bash
  cd backend
  npm install
  npm run build
  # Verify: .next/standalone exists
  ```

- [ ] **Build frontend**
  ```bash
  cd frontend
  npm install
  npm run build
  # Verify: .next/standalone exists
  ```

- [ ] **Run database migrations**
  ```bash
  cd backend
  npx prisma migrate deploy
  npx prisma generate
  ```

## Deployment

- [ ] **Deploy to hosting platform**
  - [ ] Vercel (recommended)
  - [ ] Railway
  - [ ] Docker + VPS
  - [ ] Custom server

- [ ] **Set up reverse proxy** (if needed)
  - [ ] Nginx configuration
  - [ ] SSL certificates (Let's Encrypt)
  - [ ] Domain pointing

- [ ] **Configure domain**
  - [ ] Point DNS to server/CDN
  - [ ] Set up subdomains (api., app.)
  - [ ] Configure SSL/TLS

## Security

- [ ] **Environment variables**
  - [ ] No secrets in git
  - [ ] Use platform secrets (Vercel/Railway)

- [ ] **Network security**
  - [ ] Firewall rules configured
  - [ ] No exposed databases
  - [ ] HTTPS enforced

- [ ] **Application security**
  - [ ] `NODE_ENV=production`
  - [ ] NextAuth secret set
  - [ ] CORS configured

## Monitoring

- [ ] **Set up monitoring**
  - [ ] Error tracking (Sentry)
  - [ ] Uptime checks (UptimeRobot)
  - [ ] Log aggregation

- [ ] **Health checks**
  - [ ] `/api/health` endpoint working
  - [ ] Database connectivity
  - [ ] External service status

## Post-Deployment

- [ ] **Verify functionality**
  - [ ] Frontend loads
  - [ ] API responds
  - [ ] Authentication works
  - [ ] Database operations work

- [ ] **Test critical flows**
  - [ ] User registration/login
  - [ ] Agent creation
  - [ ] Mission starting
  - [ ] Memory operations

---

## Quick Start Commands

```bash
# 1. Set up environment
cp infrastructure/.env.production infrastructure/.env
nano infrastructure/.env  # Fill in values

# 2. Start locally
cd infrastructure
docker-compose up --build

# 3. Run migrations (in another terminal)
docker-compose exec app npx prisma migrate dev

# 4. Deploy
vercel --prod  # or Railway, or your platform of choice
```
