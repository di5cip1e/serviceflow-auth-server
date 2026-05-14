# Auth & Onboarding — Task Breakdown

## Project Goal
Implement complete auth system + guided onboarding for maikr.pro so paying customers can sign up, log in, and use their agent securely.

## Completed
- [x] Design phase — AUTH-DESIGN.md created — 2026-05-13
- [x] Task 1 — Database Migration — Users & Sessions Tables — 2026-05-13
- [x] Task 2 — Auth Middleware & Session Setup — 2026-05-13
- [x] Task 3 — Auth Routes (register, login, logout, change-password) — 2026-05-14
- [x] Task 4 — Login & Register UI Pages — 2026-05-14
- [x] Task 5 — Settings Page & Success Page Update — 2026-05-14
- [x] Task 6 — Checkout Integration — 2026-05-14
- [x] Task 7 — Protect All Pages + Nav Updates — 2026-05-14
- [x] Task 8 — E2E Testing & Polish — 2026-05-14

## Up Next

### Task 2: Auth Middleware & Session Setup
- **Status:** [x] — 2026-05-13
- **Files:** `backend/middleware/auth.js` (NEW), `backend/server.js`
- **What:** Install express-session + connect-sqlite3, create auth middleware, wire into server
- **Success:** Server starts, session middleware active, `req.session` available in routes
- **Depends on:** Task 1 ✅
- **Key details:**
  - `npm install express-session connect-sqlite3`
  - auth.js exports: `requireAuth` (redirects to /login if no session), `requireApiAuth` (for API routes)
  - Session config: store=SQLite, cookie={httpOnly:true, secure:true, sameSite:'strict', maxAge:7days}
  - Apply requireAuth to all /dashboard, /chat.html, /observe.html, /swarm.html, /channels.html, /mcp.html, /optimization.html, /settings.html

### Task 3: Auth Routes — Login, Register, Logout
- **Status:** [x] — 2026-05-14
- **Files:** `backend/routes/auth.js` (NEW)
- **What:** POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, POST /api/auth/change-password
- **Success:** Can register via curl, login, access protected route, logout
- **Depends on:** Task 2
- **Key details:**
  - Register: validate email+password, hash with bcrypt(cost=10), create user, auto-login (set req.session.userId)
  - Login: verify bcrypt hash, set req.session.userId
  - Logout: destroy session
  - Change-password: require current password, hash new one
  - Rate limiting: use express-rate-limit, 5 attempts per 15 min on login/register

### Task 4: Frontend — Login & Register Pages
- **Status:** [x] — 2026-05-14
- **Files:** `frontend/login.html` (NEW), `frontend/register.html` (NEW), `frontend/css/auth.css` (NEW)
- **What:** Professional login/register pages matching maikr.pro dark theme
- **Success:** Pages render, forms submit to auth routes, errors display inline
- **Depends on:** Task 3
- **Key details:**
  - Match existing maikr.pro design: dark bg (#0a0a0a), green accent (#2ECC71), Inter font
  - Register form: name, email, password, confirm password
  - Login form: email, password, "Forgot password?" link (placeholder)
  - Client-side validation: password min 8 chars, emails match format
  - Error messages displayed inline (not alerts)
  - "Already have an account? Log in" / "New? Create account" cross-links

### Task 5: Frontend — Settings Page & Success Page Update
- **Status:** [x] — 2026-05-14
- **Files:** `frontend/settings.html` (NEW), `frontend/success.html` (MODIFY)
- **What:** Account settings page + update success page to show credentials
- **Success:** Settings page accessible when logged in, success page shows temp password + dashboard link
- **Depends on:** Task 4
- **Key details:**
  - Settings page: change password form, regenerate API key button, account info display
  - Success page: after payment, show "Create your password" form OR auto-generate temp password + force change on first login
  - Simpler approach: success page shows "Set your password" form that creates the user account

### Task 6: Checkout Flow — Link User Account
- **Status:** [x] — 2026-05-14
- **Files:** `backend/routes/checkout.js` (MODIFY), `backend/services/provisioning.js` (MODIFY)
- **What:** After Stripe payment, create user account + link to customer record
- **Success:** Full flow: register → build → pay → agent created + user linked → auto-login → dashboard
- **Depends on:** Task 3, Task 5
- **Key details:**
  - checkout.js: if user is logged in (req.session.userId), pass customer_id to Stripe metadata
  - provisioning.js: on webhook, if metadata has user_id, UPDATE customers SET user_id=?
  - If no user_id (guest checkout), create user from email + temp password, email credentials
  - Success page: if logged in, redirect to dashboard; if guest, show "Check your email" message

### Task 7: Protect All Existing Pages
- **Status:** [x] — 2026-05-14
- **Files:** `backend/server.js` (MODIFY), all protected frontend pages
- **What:** Add auth check to all existing pages, update nav links
- **Success:** Unauthenticated access to any protected page redirects to /login
- **Depends on:** Task 2
- **Key details:**
  - Add requireAuth middleware to all routes serving: dashboard, chat, observe, swarm, channels, mcp, optimization, settings
  - Landing page, login, register, build steps, success page remain public
  - Update nav in protected pages: show "Log out" link instead of "Log in"
  - API routes (chat API) use X-API-Key auth (unchanged)

### Task 8: End-to-End Testing & Polish
- **Status:** [x] — 2026-05-14
- **Files:** All of the above
- **What:** Full flow testing, fix bugs, edge cases
- **Success:** Complete register → build → pay → use flow works without errors
- **Depends on:** Tasks 1-7
- **Key details:**
  - Test: register → login → build → checkout → success → dashboard → chat
  - Test: direct URL access to /dashboard without login → redirect
  - Test: logout → try to access dashboard → redirect
  - Test: wrong password → error message
  - Test: duplicate email registration → error
  - Test: API key auth still works for existing agents
  - Test: rate limiting on login
  - Fix any bugs found

## Dependencies Graph
```
Task 1 (DB) ✅ → Task 2 (Middleware) ✅ → Task 3 (Auth Routes) ✅ → Task 4 (Login UI)
                                                          → Task 5 (Settings/Success)
                                                          → Task 6 (Checkout Link)
                                            Task 2 → Task 7 (Protect Pages)
                                            All   → Task 8 (E2E Test)
```
