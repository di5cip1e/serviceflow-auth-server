# M.ai.K.R Live Audit Report

**Date:** 2026-05-25 19:10 UTC  
**Target:** https://maikr.pro  
**Tester:** OWL (automated subagent)

---

## 1. Site Status

| Check | Result |
|-------|--------|
| HTTPS | ✅ UP (HTTP/2, nginx/1.24.0) |
| Root `/` | ✅ 200 |
| `landing.html` | ✅ 200 |
| `login.html` | ✅ 200 |
| Server | nginx/1.24.0 (Ubuntu) → Express backend |
| Backend | ✅ Running on port 3001 via PM2 (`maikr-backend`) |

---

## 2. Page-by-Page Status

### ✅ Public Pages (200 OK)

| Page | Status |
|------|--------|
| `/` | 200 |
| `/landing.html` | 200 |
| `/login.html` | 200 |
| `/register.html` | 200 |
| `/privacy.html` | 200 |
| `/terms.html` | 200 |
| `/build` | 200 |
| `/build-step2.html` | 200 |
| `/build-step3.html` | 200 |
| `/build-step4.html` | 200 |
| `/success.html` | 200 |
| `/forgot-password.html` | 200 |
| `/reset-password.html` | 200 |
| `/contact.html` | 200 |
| `/onboarding.html` | 200 |
| `/brand-assets.html` | 200 |

### 🔒 Auth-Gated Pages (302 → `/login`)

These pages correctly redirect unauthenticated users to `/login`:

| Page | Status | Redirects To |
|------|--------|--------------|
| `/chat.html` | 302 | `/login` |
| `/command-center.html` | 302 | `/login` |
| `/observe.html` | 302 | `/login` |
| `/swarm.html` | 302 | `/login` |
| `/channels.html` | 302 | `/login` |
| `/mcp.html` | 302 | `/login` |
| `/optimization.html` | 302 | `/login` |
| `/analytics.html` | 302 | `/login` |
| `/agent-studio.html` | 302 | `/login` |
| `/blueprints.html` | 302 | `/login` |
| `/workflow-canvas.html` | 302 | `/login` |
| `/templates.html` | 302 | `/login` |
| `/widgets.html` | 302 | `/login` |
| `/whitelabel.html` | 302 | `/login` |
| `/byok.html` | 302 | `/login` |
| `/leads.html` | 302 | `/login` |
| `/onboarding-wizard.html` | 302 | `/login` |
| `/admin.html` | 302 | `/login` |
| `/settings.html` | 302 | `/login` |
| `/deploy.html` | 302 | `/login` |
| `/dashboard.html` | 302 | `/login` |

### ❌ Broken Pages (404 Not Found)

| Page | Status | Notes |
|------|--------|-------|
| `/pricing.html` | **404** | Missing page — likely not yet created or removed |
| `/error.html` | **404** | Missing error page — breaks error handling fallback |

---

## 3. API Endpoint Status

| Endpoint | Status | Response Body | Notes |
|----------|--------|---------------|-------|
| `/api/health` | **404** | HTML error page | No health check endpoint configured |
| `/api/auth/me` | 401 | `{"error":"Unauthorized"}` | ✅ Correct — unauthenticated |
| `/api/agent` | **404** | HTML error page | Endpoint missing or misrouted |
| `/api/config` | 200 | JSON | ✅ Working |
| `/api/blueprints` | 200 | JSON | ✅ Working |
| `/api/templates` | 200 | JSON | ✅ Working (6 seeded) |

---

## 4. SSL Certificate

| Field | Value |
|-------|-------|
| Issuer | Let's Encrypt |
| Valid From | 2026-05-09 12:35:21 UTC |
| Valid Until | **2026-08-07 12:35:20 UTC** |
| Days Remaining | ~74 days |
| Status | ✅ Valid |

**Note:** Certificate will expire in ~74 days. Auto-renewal should be verified (certbot timer).

---

## 5. Backend Error Log Analysis

**Log file:** `/root/.pm2/logs/maikr-backend-error.log` (3,748 lines total)

### Critical Errors

#### 🔴 SQLITE_ERROR — 39 occurrences
```
[Error: SQLITE_ERROR: near "DEFAULT": syntax error]
```
- **Severity:** HIGH — Database query syntax error
- **Impact:** Some database operations are failing. This suggests a query using `DEFAULT` keyword not supported by SQLite (e.g., `INSERT ... VALUES (DEFAULT, ...)` or `ALTER TABLE ... ADD COLUMN ... DEFAULT ...` with incorrect syntax).
- **Location:** Multiple database operations throughout the backend

#### 🔴 Embedding Service 401 — 2 occurrences
```
URL embed error: Error: Batch embedding failed: 401
  at embedChunks (embeddingService.js:45:27)
  at async ingestText (documents.js:16:24)
```
- **Severity:** HIGH — API key expired or invalid
- **Impact:** Document ingestion / RAG embedding completely broken. Users cannot upload/ingest documents.
- **Location:** `backend/services/embeddingService.js`
- **Fix:** The embedding API key needs to be rotated/renewed.

#### 🔴 SWARM `history` ReferenceError — 4 occurrences
```
[SWARM] Error: ReferenceError: Cannot access 'history' before initialization
  at handleSwarmChat (swarm.js:144:45)
```
- **Severity:** HIGH — Feature broken
- **Impact:** Swarm chat feature is completely non-functional. Variable `history` is referenced before declaration at line 144 of `swarm.js`.
- **Location:** `backend/routes/swarm.js:144`
- **Fix:** Variable declaration order bug — move `let history` / `const history` before its first use.

#### 🟡 X-Forwarded-For Misconfiguration — 12 occurrences
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
  code: 'ERR_ERL_UNEXPECTED_X_FORWARDED_FOR'
```
- **Severity:** MEDIUM — Security/rate-limiting impact
- **Impact:** `express-rate-limit` cannot correctly identify client IPs through nginx proxy. Rate limiting may be inaccurate or fail open.
- **Fix:** Add `app.set('trust proxy', 1)` in Express app configuration since nginx is the reverse proxy.

#### 🟡 SESSION_SECRET Missing — 3 occurrences (WARNING)
```
[bootstrap] WARNING — Missing recommended keys: ⚠ SESSION_SECRET
```
- **Severity:** MEDIUM — Security concern
- **Impact:** Sessions are using a default/placeholder secret. In production this could allow session forgery.
- **Fix:** Set `SESSION_SECRET` environment variable with a cryptographically random value.

---

## 6. Nginx Access Log — Error Patterns (Last 24h)

### No 500 or 502 Errors Found ✅
No server-side crashes or upstream failures detected.

### 404 Errors (External Traffic)
All 404s are from:
- **WordPress scans** (`/wp-admin/install.php`) — bot noise, not a concern
- **Let's Encrypt challenges** (`.well-known/acme-challenge/`) — expired challenges, not a concern
- **Missing `sitemap.xml`** — Bingbot requesting sitemap that doesn't exist
- **Missing `favicon.ico`** — minor, should add a favicon
- **SVG data URIs sent as paths** — malformed requests, not a concern

### No Nginx Error Logs
`/var/log/nginx/error.log` and `maikr*.error.log` are empty — nginx is operating cleanly.

---

## 7. Summary & Recommendations

### 🔴 Critical (Fix Immediately)

| # | Issue | Location |
|---|-------|----------|
| 1 | **Embedding API key expired (401)** | `embeddingService.js` — RAG/documents feature broken |
| 2 | **Swarm chat broken (ReferenceError)** | `swarm.js:144` — variable declaration order bug |
| 3 | **SQLite syntax errors (39 hits)** | DB queries using unsupported `DEFAULT` syntax |

### 🟡 Medium (Fix Soon)

| # | Issue | Location |
|---|-------|----------|
| 4 | **Express `trust proxy` not set** | Express app config — rate limiting inaccurate |
| 5 | **SESSION_SECRET not set** | Environment config — session security |
| 6 | **Missing `/pricing.html`** | No pricing page exists |
| 7 | **Missing `/error.html`** | Error fallback page not found |

### 🟢 Low (Nice to Have)

| # | Issue |
|---|-------|
| 8 | No `/`sitemap.xml` — Bingbot 404s |
| 9 | No `favicon.ico` — browser tab icon missing |
| 10 | No `/api/health` endpoint — monitoring gap |
| 11 | SSL cert expires in ~74 days — verify auto-renewal |

### ✅ What's Working Well

- All public pages load correctly (200)
- Auth gating works correctly (302 → login)
- API endpoints for config, blueprints, templates functional
- Nginx reverse proxy operating cleanly (no error logs)
- No 500/502 errors in access logs
- Backend process stable under PM2 (multiple restarts visible but running)
- SSL certificate valid

---

*Report generated by OWL live audit — 2026-05-25T19:10Z*
