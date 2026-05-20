# Lessons from May 19, 2026

## 1. Server-Side Auth Redirect Bypass
**Issue:** Protected HTML pages were accessible without login because `express.static` served them before session middleware ran.
**Fix:** Moved session middleware before static serving, added protected-file middleware that intercepts requests to protected HTML filenames and runs `requireAuth`, moved `express.static` for frontend to after all route definitions.
**Lesson:** Always ensure auth middleware runs before static file serving for protected routes. Order of middleware in Express matters critically.

## 2. Build Flow Conversion Blocker (Stripe.js Missing)
**Issue:** The "Deploy My Agent" button on build-step4.html called `Stripe(STRIPE_PK)` but the Stripe.js library was never loaded. Silent JS error = button did nothing.
**Fix:** Added `<script src="https://js.stripe.com/v3/">` to the page's `<head>`.
**Lesson:** Always verify third-party JS libraries are actually loaded before calling their APIs. Silent failures are worse than loud errors.

## 3. Temporal Dead Zone with `const` in Checkout Route
**Issue:** `checkout.js` referenced `session.customer_email` in an object literal passed to `stripe.checkout.sessions.create()`, but `session` was declared as `const` on the next line. This caused `ReferenceError: Cannot access 'session' before initialization`.
**Fix:** Changed to `req.body.email` instead of `session.customer_email`.
**Lesson:** In JavaScript, `const` and `let` are hoisted but not initialized. Referencing them before the declaration line throws a TDZ error. This applies even within object literals passed to async functions.

## 4. OpenClaw v2026.5.12 Broke Isolated Cron Sessions
**Issue:** All 5 cron jobs using `sessionTarget: "isolated"` with `agentTurn` payloads started failing with `ERR_MODULE_NOT_FOUND` after the OpenClaw update.
**Fix:** Converted all to `sessionTarget: "main"` with `systemEvent` payloads.
**Lesson:** Isolated agentTurn sessions have a dependency on OpenClaw's internal module catalog. When OpenClaw updates, these can break. For simple script execution, main-session systemEvents are more resilient.

## 5. DB Schema Drift Across Services
**Issue:** Multiple services failed with `SQLITE_ERROR: no such column` because tables were created at different times with different schemas. Missing columns: `retry_count`, `stripe_event_id`, `processed_at`, `error` on `webhook_events`; `monthly_cost_cents`, `updated_at` on `customers`; column name mismatch (`amount_cents` vs `price_paid_cents`); wrong table reference (`c.agent_name` vs `a.agent_name`).
**Fix:** Added missing columns via `ALTER TABLE`, fixed column name references in queries.
**Lesson:** When adding new features that reference existing tables, always verify the current schema with `PRAGMA table_info(table)` rather than assuming columns exist.

## 6. CSS External Dependency Risk
**Issue:** Landing page used CSS variables from external `dark-premium.css`. When that file didn't load (path issue), all inline styles broke.
**Lesson:** Critical pages should be self-contained with inline styles and hardcoded color values. Never depend on external CSS for core layout/colors.

## 7. Subagent File Operations Unreliable
**Issue:** owl-alpha model consistently fails on file read/write tasks. Multiple subagents spawned for parallel redesign work all failed.
**Lesson:** Use subagents only for research/analysis, not bulk file editing. Do file operations directly in the main session.
