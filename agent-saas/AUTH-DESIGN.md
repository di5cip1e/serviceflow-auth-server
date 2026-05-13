# M.ai.K.R — Auth & Onboarding Flow

## Project Goal
Implement a complete authentication system and guided onboarding flow so that paying customers can sign up, log in, and start using their AI agent — without anyone being able to access another customer's agent.

## Architecture

### Auth Model: Email + Password (Session-based)
- **No OAuth** — keep it simple, no third-party dependencies
- **bcrypt** for password hashing (already installed)
- **Express sessions** with SQLite store (connect-sqlite3)
- **CSRF protection** via csurf or SameSite cookies
- **Rate limiting** on login/register endpoints

### Database Changes
```
users table (NEW):
  id TEXT PRIMARY KEY
  email TEXT UNIQUE NOT NULL
  password_hash TEXT NOT NULL
  name TEXT
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP

sessions table (NEW — or use connect-sqlite3 store):
  sid TEXT PRIMARY KEY
  sess TEXT NOT NULL
  expired TEXT NOT NULL

customers table (EXISTING — add user_id FK):
  user_id TEXT REFERENCES users(id)
  (rest unchanged)

api_keys table (EXISTING — add user_id FK):
  user_id TEXT REFERENCES users(id)
  (rest unchanged)
```

### Route Structure
```
Public (no auth):
  GET  /           → landing.html
  GET  /login      → login.html
  GET  /register   → register.html
  POST /api/auth/login
  POST /api/auth/register
  POST /api/auth/logout
  GET  /build/*    → build steps (public until payment)
  POST /create-checkout-session
  POST /webhook/stripe
  GET  /success    → success.html (shows temp credentials)

Protected (requires session):
  GET  /dashboard          → command-center.html
  GET  /chat.html          → chat interface
  GET  /observe.html       → agent monitoring
  GET  /swarm.html         → swarm management
  GET  /channels.html      → channel config
  GET  /mcp.html           → MCP tools
  GET  /optimization.html  → optimization proposals
  GET  /settings           → account settings (NEW)
  POST /api/auth/change-password
  POST /api/auth/regenerate-api-key

API Key Auth (for agent chat API):
  Header: X-API-Key: <api_key>
  (existing mechanism, unchanged)
```

### Onboarding Flow
```
1. Landing page → "Get Started" → /register
2. Register: email + password + name → creates user account
3. Build wizard (steps 1-4) → selects plan
4. Stripe checkout → payment
5. Success page → shows:
   - "Your agent is being created"
   - Link to dashboard (auto-logged-in)
   - API key for programmatic access
6. Dashboard first-run:
   - Welcome banner: "Your agent is ready!"
   - Quick-start: "Chat with your agent" button
   - Optional: connect channels, upload docs, customize
```

### Security Requirements
- Passwords: min 8 chars, bcrypt cost 10
- Sessions: HttpOnly, Secure, SameSite=Strict cookies
- Rate limiting: 5 attempts per 15 min on login
- CSRF: SameSite cookies + origin check
- No sensitive data in JWTs (we use server-side sessions)
- API keys: shown once at creation, stored hashed

## File Changes

### New Files
- `backend/routes/auth.js` — login, register, logout, change-password
- `backend/middleware/auth.js` — session verification middleware
- `frontend/login.html` — login page
- `frontend/register.html` — registration page
- `frontend/settings.html` — account settings (password change, API key regen)
- `frontend/css/auth.css` — auth page styles

### Modified Files
- `backend/server.js` — add session middleware, auth routes, protect routes
- `backend/database.js` — add users table, add user_id FK to customers/api_keys
- `backend/routes/checkout.js` — link new customer to user account
- `backend/services/provisioning.js` — create user account during provisioning
- `frontend/success.html` — show credentials + dashboard link
- `frontend/landing.html` — update CTA buttons to point to /register
- `frontend/build-step4.html` — add login prompt for existing users
- All protected pages — add auth check redirect

## Dependencies to Install
```
npm install express-session connect-sqlite3
```

## Testing Checklist
- [ ] Register new account → can log in
- [ ] Login with wrong password → error message
- [ ] Access /dashboard without login → redirect to /login
- [ ] Access /dashboard with valid session → works
- [ ] Logout → session destroyed, redirect to /login
- [ ] Stripe checkout → user account created → auto-login after payment
- [ ] API key auth still works for agent chat
- [ ] Rate limiting blocks after 5 failed attempts
