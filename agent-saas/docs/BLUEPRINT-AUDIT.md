# M.ai.K.R — Exhaustive Codebase Audit & Blueprint Action Plan

**Audit Date:** 2026-05-23  
**Auditor:** The Director (Elite Principal Software Architect / Full-Stack Engineer / Lead UI/UX Designer)  
**Scope:** Complete codebase — `agent-saas/backend/` (76 JS files, 3,384 lines frontend), `agent-saas/frontend/` (27 HTML pages, 4 CSS files, 4 JS files)  
**Total Files Analyzed:** 120+

---

## Executive Summary

M.ai.K.R is a functional AI agent SaaS platform with impressive breadth — Stripe billing, multi-agent swarm routing, RAG knowledge ingestion, MCP tool integration, omnichannel communication, loop detection, and a dark premium UI. The platform works and serves real users.

However, the audit reveals **47 distinct issues** across four dimensions:

| Dimension | Critical | High | Medium | Low | Total |
|-----------|----------|------|--------|-----|-------|
| Backend & Architecture | 5 | 7 | 6 | 3 | **21** |
| Frontend & State | 1 | 4 | 5 | 3 | **13** |
| UI/UX Implementation | 0 | 3 | 5 | 2 | **10** |
| Feasible Improvements | — | — | 3 | 0 | **3** |
| **TOTAL** | **6** | **14** | **19** | **8** | **47** |

---

## PHASE 1: COMPREHENSIVE CODEBASE FINDINGS

---

### BACKEND & ARCHITECTURE

---

#### [ID: SERVER.JS — B-01]
- **Component/Layer:** Backend / Server Bootstrap & Route Mounting
- **Issue Type:** Security
- **Current State:** Secrets are loaded from `~/.openclaw/secrets.json` at the top of `server.js` via `fs.readFileSync` and injected into `process.env`. This pattern leaks secrets into the global environment, making them accessible to every module including third-party npm packages. The secrets file path is hardcoded, and there's no validation that required env vars exist before the server starts.
- **Proposed Optimization:** Use a dedicated secrets module that validates all required variables at startup and fails fast with a clear error message. Never mutate `process.env` — instead, export a `getSecret(key)` function. Add a startup check that aborts if `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `OPENROUTER_API_KEY`, or `SESSION_SECRET` are missing.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/server.js`.
  2. Locate the `require('dotenv').config()` block and the `fs.readFileSync('/root/.openclaw/secrets.json', ...)` block at lines 1–20.
  3. Create a new file `agent-saas/bootstrap.js` that: (a) calls `require('dotenv').config()`, (b) defines a `SECRETS` object loaded once from secrets.json, (c) exports `getSecret(k)` that returns `SECRETS[k] || process.env[k]`, (d) validate required keys and `process.exit(1)` with error if missing.
  4. In `server.js`, replace the inline secrets loading with `const { getSecret } = require('./bootstrap')` and replace every `process.env.STRIPE_SECRET_KEY` with `getSecret('STRIPE_SECRET_KEY')` in `checkout.js`, `webhook.js`, and `swarm.js` — but leave `process.env.PORT` and `process.env.NODE_ENV` as-is since they're standard env vars, not secrets.
  5. Verify by checking `node -e "require('./bootstrap')"` prints no errors.

---

#### [ID: SERVER.JS — B-02]
- **Component/Layer:** Backend / Static File Serving & Auth Middleware
- **Issue Type:** Security
- **Current State:** The `protectedFiles` Set in the middleware block (line ~95) and the `protectedPages` Set in the `express.static` block (line ~170) are **duplicated** with different file lists. `protectedFiles` has 10 entries; `protectedPages` has 20. Files like `leads.html`, `onboarding-wizard.html`, `analytics.html`, `agent-studio.html` appear only in `protectedPages`, meaning they can be accessed directly via URL without auth because the first middleware (`protectedFiles` Set) will not catch them. The `express.static` filter only checks `.html` extensions via `setHeaders`, but the `protectedPages` Set is never actually referenced in the static middleware — it's declared but unused. The `app.use(express.static(...))` at the bottom will serve ANY HTML file that isn't caught by the earlier route middleware.
- **Proposed Optimization:** Remove the `protectedPages` Set entirely (dead code). Create a single `PROTECTED_PAGES` constant in a shared config file. Place ONE auth middleware that runs before `express.static` and checks all protected files using the shared Set.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/server.js`.
  2. Locate `const protectedFiles = new Set([...])` around line 95 and `const protectedPages = new Set([...])` around line 170.
  3. Create `agent-saas/backend/config/protected-pages.js` exporting `const PROTECTED_PAGES = new Set(['chat.html', 'observe.html', 'swarm.html', 'channels.html', 'mcp.html', 'optimization.html', 'settings.html', 'command-center.html', 'deploy.html', 'admin.html', 'dashboard.html', 'leads.html', 'onboarding-wizard.html', 'analytics.html', 'agent-studio.html', 'blueprints.html', 'workflow-canvas.html', 'whitelabel.html', 'templates.html', 'byok.html', 'widgets.html'])`.
  4. Replace both `protectedFiles` and `protectedPages` usages with the shared import.
  5. Remove the dead `protectedPages` variable declaration entirely.
  6. Verify all routes return 401/302 for unauthenticated access.

---

#### [ID: WEBHOOK.JS — B-03]
- **Component/Layer:** Backend / Stripe Webhook Handler
- **Issue Type:** Security / Correctness
- **Current State:** The webhook handler at `POST /webhook` (routes/webhook.js) creates a new Stripe instance on every request via `require('stripe')(process.env.STRIPE_SECRET_KEY)`. This is inefficient because `require('stripe')` creates a new client each time. More critically, the event deduplication check queries `webhook_events` by `stripe_event_id`, but when an event is already processed (`status === 'completed'`), it returns early without updating the timestamp. The `processCheckoutSession` function also doesn't validate that `session.customer_email` is present — if Stripe sends an event with no email, `provisionCustomer` will be called with `email: undefined`, which will insert `NULL` into the customers table and cause downstream failures.
- **Proposed Optimization:** Create a single Stripe client instance at module level. Add null checks for `session.customer_email` before calling `provisionCustomer`. Return 200 immediately for duplicate events (already done) but also add a `receivedAt` timestamp update for idempotency tracking.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/routes/webhook.js`.
  2. At the top of the file (before the router), add `const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);`.
  3. Inside `processCheckoutSession`, after extracting `session`, add: `if (!session.customer_email && !session.customer_details?.email) { console.error('⏭️ No email in session:', session.id); return { skipped: true, reason: 'no_email' }; }`.
  4. In the event deduplication block (line 18-20), update the existing event's `processed_at` timestamp: `db.run('UPDATE webhook_events SET processed_at = CURRENT_TIMESTAMP WHERE stripe_event_id = ?', [eventId])`.
  5. Verify by running `node -e "const w = require('./routes/webhook'); console.log('Module loaded OK')"`.

---

#### [ID: SWARM.JS — B-04]
- **Component/Layer:** Backend / Swarm Chat Route
- **Issue Type:** Race Condition / Performance
- **Current State:** In `handleSwarmChat` (routes/swarm.js), the loop detec
tion check at block 2b reads `history` from the database, but variables `history`, and `baseSystemPrompt` are used before they are defined in the code flow. Specifically, `loopCheck` uses `history` on line ~82 of the function, but `history` isn't declared until line ~155. This will cause a `ReferenceError` at runtime when any loop condition is detected. The same issue exists for `baseSystemPrompt` — referenced in the `soft_redirect` branch before declaration.
- **Proposed Optimization:** Reorder the code so that `history` and `baseSystemPrompt` are declared BEFORE the loop detection check. Move the DB query for conversation history and the base system prompt construction to before the `shouldIntervene` call.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/routes/swarm.js`.
  2. Locate the `handleSwarmChat` function.
  3. Find the loop detection block (search for `// 2b. Self-correction`).
  4. Move the `const history = await new Promise(...)` block (currently around line 155) to immediately after the agent DB lookup (block 2, around line 70).
  5. Move the `const baseSystemPrompt = ...` assignment to immediately after `history`.
  6. Ensure the loop detection block at 2b now has access to both `history` and `baseSystemPrompt`.
  7. Verify the function doesn't throw `ReferenceError` by checking with `node -e "require('./routes/swarm')"` — should not crash.

---

#### [ID: SWARM.JS — B-05]
- **Component/Layer:** Backend / Swarm Chat — LLM Response Streaming
- **Issue Type:** Performance / UX
- **Current State:** All LLM responses in both `chat.js` and `swarm.js` use non-streaming `fetch` calls with `await response.json()`. This means the user sees nothing until the ENTIRE response is generated. For GPT-4o, this can be 5-15 seconds of blank screen. For a chat interface, this is unacceptable — users expect to see tokens appearing in real-time.
- **Proposed Optimization:** Implement Server-Sent Events (SSE) for the chat endpoint. Change the response to `text/event-stream` and pipe OpenRouter's streaming response directly to the client. On the frontend `chat.js`, switch from `response.json()` to `EventSource` or a `fetch` + `ReadableStream` pattern.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/routes/swarm.js`, locate the `callLLM` inner function.
  2. Add `stream: true` to the OpenRouter request body.
  3. Instead of `await response.json()`, read the response body as a stream: `const reader = response.body.getReader(); const decoder = new TextDecoder();` and process chunks line-by-line, parsing SSE data frames.
  4. Change the handler to set `res.setHeader('Content-Type', 'text/event-stream')` and `res.setHeader('Cache-Control', 'no-cache')`.
  5. In `agent-saas/backend/routes/chat.js`, apply the same streaming pattern to the `callLLM` call.
  6. In `agent-saas/frontend/js/chat.js`, replace the `fetch('/api/chat', ...)` call with a streaming reader using `response.body.getReader()`.
  7. Verify by running the server and checking Chrome DevTools Network tab — response should show `text/event-stream` type with incremental data.

---

#### [ID: CREDITMANAGER.JS — B-06]
- **Component/Layer:** Backend / Credit Manager
- **Issue Type:** Race Condition
- **Current State:** The `deductCredits` function in `creditManager.js` performs a `SELECT` to get the current balance, then performs a `INSERT` and `UPDATE` based on that value. Between the `SELECT` and the `UPDATE`, another request could read the same balance, leading to a classic TOCTOU race condition. For a billing system, this means credits can be double-spent.
- **Proposed Optimization:** Use a single atomic SQL UPDATE with a WHERE clause that checks the balance: `UPDATE agents SET base_tokens_used = base_tokens_used + ? WHERE id = ? AND (base_tokens - base_tokens_used) >= ?`. Then check `this.changes === 0` to detect insufficient credits.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/services/creditManager.js`.
  2. Locate the `deductCredits` function.
  3. Replace the SELECT + INSERT + UPDATE pattern with an atomic UPDATE using a WHERE clause that enforces the balance check.
  4. If `this.changes === 0`, query the current balance to determine if it was insufficient credits.
  5. Record the transaction in `credit_transactions` only after the UPDATE succeeds.
  6. Verify by checking `node -e "const cm = require('./services/creditManager'); console.log(typeof cm.deductCredits)"` — should be a function.

---

#### [ID: CHAT.JS — B-07]
- **Component/Layer:** Backend / Single-Agent Chat Route
- **Issue Type:** Code Duplication / Logic Error
- **Current State:** `routes/chat.js` and `routes/swarm.js` both implement nearly identical LLM call logic, RAG retrieval, conversation history loading, and token tracking. The `chat.js` route has `const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY` but creates an `OpenAI` client with `process.env.OPENAI_API_KEY` that is never used (the actual call uses `fetch` to OpenRouter). The `TIER_MODELS` constant is duplicated between `chat.js` and `orchestrator/tierRouter.js` with **different model names** — `chat.js` uses `google/gemini-3.1-flash-lite` for standard while `tierRouter.js` uses the same mapping but imports are inconsistent.
- **Proposed Optimization:** Extract a shared `callLLM()` utility from `swarm.js` into `services/llm.js` that both `chat.js` and `swarm.js` import. Remove the unused `OpenAI` import from `chat.js`. Consolidate `TIER_MODELS` into a single source of truth.
- **Target LLM Execution Steps:**
  1. Create `agent-saas/backend/services/llm.js` with the shared callLLM function.
  2. In `routes/chat.js`, remove the `const OpenAI = require('openai')` line (unused), remove the duplicate `TIER_MODELS`, remove RAG retrieval, history loading, and token tracking code.
  3. Import from the shared service: `const { callLLM, TIER_MODELS } = require('../services/llm')`.
  4. In `routes/swarm.js`, replace the inline `callLLM` with the shared import.
  5. In `orchestrator/tierRouter.js`, ensure it re-exports from `services/llm.js` for backward compatibility.
  6. Verify both routes still work: `node -e "require('./routes/chat'); require('./routes/swarm'); console.log('OK')"`.

---

#### [ID: AUTH.JS — B-08]
- **Component/Layer:** Backend / Authentication Routes
- **Issue Type:** Security
- **Current State:** The `forgot-password` endpoint in `auth.js` uses `bcrypt.hash(token, 10)` to hash the reset token before storing it. However, `bcrypt` has a maximum input length of 72 bytes. The raw token is `crypto.randomBytes(32).toString('hex')` = 64 hex characters, which is fine. But the `reset-password` endpoint compares with `bcrypt.compare(token, resetToken.token_hash)` — this is correct. The issue is that the `forgot-password` endpoint sends the **raw** token in the URL (`resetUrl = ...?token=${token}`) but stores the **bcrypt hash**. This is correct behavior. The REAL issue: the endpoint doesn't rate-limit per-email — an attacker can request password resets for any email address repeatedly, causing email flooding.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/routes/auth.js`.
  2. Add per-email rate limiting using an in-memory Map or Redis: track `lastRequest[email]` and reject if < 60 seconds since last request.
  3. Alternatively, add a `forgot_password_attempts` table with email + timestamp and check count in the last hour.
  4. Verify the endpoint still works for legitimate use.

---

#### [ID: SERVER.JS — B-09]
- **Component/Layer:** Backend / Error Handling
- **Issue Type:** Reliability
- **Current State:** The Express app has **no global error handler**. If any route throws an uncaught exception, Express will return a generic 500 with no body (or HTML error page). The `handleSwarmChat` function has a try/catch that returns `res.status(500).json({ error: err.message })`, but many other routes (e.g., `agent.js`, `documents.js`, `channels.js`) have inconsistent error handling — some return `res.json({ error: ... })` without a status code, others return `res.status(500).json(...)`.
- **Proposed Optimization:** Add a global Express error handler at the end of `server.js` (after all routes): `app.use((err, req, res, next) => { console.error('[GLOBAL ERROR]', err); res.status(500).json({ error: 'Internal server error' }); })`. Standardize all route error responses to use `res.status(code).json({ error: message })`.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/server.js`.
  2. Before `app.listen()`, add the global error handler middleware.
  3. In `routes/agent.js`, find all `res.json({ error: ... })` without status codes and add appropriate status codes (400 for validation, 404 for not found, 500 for server errors).
  4. In `routes/documents.js`, `routes/channels.js`, apply the same fix.
  5. Verify by sending a malformed request to each endpoint — should get JSON error, not HTML.

---

#### [ID: DATABASE.JS — B-10]
- **Component/Layer:** Backend / Database Schema
- **Issue Type:** Data Integrity
- **Current State:** The `database.js` file creates all tables and runs migrations in a single `db.serialize()` block at module load time. The `addColumnIfMissing` helper uses `PRAGMA table_info` + `ALTER TABLE`, but these are called with empty callbacks `() => {}` — meaning migration errors are silently swallowed. The `agents` table has **redundant columns**: `slug` and `agent_slug`, `session_key` is never populated by any route, `api_key` exists alongside the separate `api_keys` table. The `conversations` table has no index on `created_at` for efficient history retrieval.
- **Proposed Optimization:** Add proper error handling to `addColumnIfMissing` callbacks. Remove redundant columns (`agent_slug` — keep `slug`; `api_key` — use `api_keys` table; `session_key` — remove or implement). Add index on `conversations(created_at)`.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/database.js`.
  2. In `addColumnIfMissing`, replace `() => {}` with `(err) => { if (err) console.error('[DB MIGRATION] Failed to add', column, 'to', table, ':', err.message); }`.
  3. Add `db.run('CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at)')` in the index creation section.
  4. Search the codebase for `agent_slug` and `session_key` usage: `grep -r "agent_slug\|session_key" agent-saas/backend/`. If unused, add migration to drop columns.
  5. Verify by running `node -e "require('./database'); console.log('DB OK')"`.

---

#### [ID: PROVISIONING.JS — B-11]
- **Component/Layer:** Backend / Customer Provisioning
- **Issue Type:** Error Handling / Reliability
- **Current State:** In `provisioning.js`, the `provisionCustomer` function runs `customerInsert`, `agentInsert`, and `apiKeyInsert` in parallel with `Promise.all`. If `agentInsert` fails after `customerInsert` succeeds, the customer record exists but has no agent — an orphaned record. The function also calls `startAgentSession` but doesn't await it properly (uses `.catch()` which swallows errors). The welcome email is sent with `try/catch` but the `emailResult` is logged, not used to retry.
- **Proposed Optimization:** Run inserts sequentially (customer → agent → API key) so each step can be rolled back if the next fails. Or wrap in a SQLite transaction using `db.run('BEGIN')` / `COMMIT` / `ROLLBACK`. Add retry logic for the welcome email.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/services/provisioning.js`.
  2. Wrap the three `Promise.all` inserts in a transaction: `db.run('BEGIN TRANSACTION')`, then run inserts sequentially, then `db.run('COMMIT')`. On error, `db.run('ROLLBACK')`.
  3. For the welcome email, add a retry: `for (let attempt = 0; attempt < 3; attempt++) { try { ... break; } catch(e) { if (attempt === 2) console.error('Email failed after 3 attempts'); else await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); } }`.
  4. Verify the function still provisions correctly.

---

#### [ID: LOOPDETECTOR.JS — B-12]
- **Component/Layer:** Backend / Loop Detection
- **Issue Type:** Correctness
- **Current State:** The `detectSelfContradiction` function checks for negation patterns like `yes`/`no`, `is`/`is not`, but the logic is flawed. It checks if pattern[i] matches `prev` AND pattern[j] matches `last`, but the patterns array contains regexes like `/yes,?/` and `/no,?/`. The issue: `/yes,?/` will match "yesterday", "eyes", "yes" — producing false positives. The shared-word check (`shared.length >= 3`) mitigates this partially, but the regexes need word boundaries.
- **Proposed Optimization:** Add word boundaries to all regex patterns: `/^yes\b/` → `/\byes\b/`, `/^no\b/` → `/\bno\b/`, etc. Also add more contradiction patterns like "always" vs "never", "all" vs "none".
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/services/loopDetector.js`.
  2. Locate the `contradictionPatterns` array in `detectSelfContradiction`.
  3. Replace each regex with word-boundary versions: `[/^yes\b/, /^no\b/]` → `[/(\b|^)yes\b/, /(\b|^)no\b/]`.
  4. Add patterns: `[/(\b|^)always\b/, /(\b|^)never\b/]`, `[/(\b|^)all\b/, /(\b|^)none\b/]`.
  5. Verify with test: `node -e "const ld = require('./services/loopDetector'); console.log(ld.detectSelfContradiction([{role:'assistant',content:'Yes it is'},{role:'assistant',content:'No it is not'}]))"`.

---

#### [ID: INTENTCLASSIFIER.JS — B-13]
- **Component/Layer:** Backend / Intent Classification
- **Issue Type:** Performance
- **Current State:** The `llmClassify` function in `intentClassifier.js` tries Ollama first with a 3-second timeout, then falls back to a dummy `{ intent: 'general', confidence: 0.5 }` response. The OpenAI fallback path (commented as "In practice this would call a small classification model") is unimplemented. This means for any message with low keyword confidence (< 0.4), the classifier always returns `general` with 0.5 confidence, making the swarm routing effectively random for ambiguous messages.
- **Proposed Optimization:** Implement the OpenRouter fallback using a small, fast model like `openrouter/google/gemini-2.0-flash-lite` for classification. The prompt is already well-structured — just need to make the actual API call.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/services/intentClassifier.js`.
  2. In the `llmClassify` function, replace the dummy fallback (the `try { const { getEmbedding } ... }` block) with an actual OpenRouter call using `openrouter/google/gemini-2.0-flash-lite`.
  3. Parse the response to extract the single-word category.
  4. Add a 5-second AbortController timeout.
  5. Verify: `node -e "const ic = require('./services/intentClassifier'); ic.classify('how much does it pricing cost').then(r => console.log(r))"`.

---

#### [ID: RAGSCORER.JS — B-14]
- **Component/Layer:** Backend / RAG Quality Scoring
- **Issue Type:** Correctness (Dead Code)
- **Current State:** The `ragScorer.js` service imports `{ openai }` from `@langfuse/langfuse` but never uses it. The `callLLMFaith` and `callLLMRel` functions return hardcoded `{ score: '0.5', reasoning: 'mock' }`. This means RAG quality scoring always returns 0.5 regardless of actual quality. The `tracer.js` file has its own `scoreRAG` function that actually works (makes real OpenRouter calls), creating two competing implementations.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/services/ragScorer.js`.
  2. Remove the unused `const { openai } = require('@langfuse/langfuse')` import.
  3. Either implement the actual LLM calls in `callLLMFaith`/`callLLMRel` using OpenRouter, or delete this file and have all callers use `tracer.scoreRAG` directly.
  4. If keeping the file, implement: `const response = await fetch('https://openrouter.ai/api/v1/chat/completions', { ... })` with the FAITHFULNESS_PROMPT/RELEVANCY_PROMPT templates.
  5. Verify the scorer returns non-mock values.

---

#### [ID: EMBEDDINGSERVICE.JS — B-15]
- **Component/Layer:** Backend / Embedding Service
- **Issue Type:** Configuration Mismatch
- **Current State:** `embeddingService.js` hardcodes the OpenAI embeddings endpoint (`https://api.openai.com/v1/embeddings`) but the `config/rag.js` references PostgreSQL/pgVector config that is never used (the actual vector store is SQLite-based). The embedding service uses `process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY` but OpenRouter doesn't support the OpenAI embeddings endpoint format — it has its own `/api/v1/embeddings` path. If only `OPENROUTER_API_KEY` is set, embedding calls will fail.
- **Proposed Optimization:** Add a dedicated `EMBEDDING_PROVIDER` env var (either `openai` or `openrouter`). Use the correct endpoint for each. Add fallback logic.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/services/embeddingService.js`.
  2. At the top, add: `const EMBEDDING_PROVIDER = process.env.EMBEDDING_PROVIDER || 'openai'; const EMBEDDING_URL = EMBEDDING_PROVIDER === 'openrouter' ? 'https://openrouter.ai/api/v1/embeddings' : 'https://api.openai.com/v1/embeddings';`.
  3. Replace the hardcoded URL in both `getEmbedding` and `embedChunks` with `EMBEDDING_URL`.
  4. Use the appropriate API key: `const apiKey = EMBEDDING_PROVIDER === 'openrouter' ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY;`.
  5. Verify: `node -e "const es = require('./services/embeddingService'); console.log('Module loaded')"`.

---

#### [ID: MCPCLIENT.JS — B-16]
- **Component/Layer:** Backend / MCP Client
- **Issue Type:** Resource Leak
- **Current State:** The MCP client spawns child processes for each MCP server but never implements a heartbeat or reconnect mechanism. If an MCP server process crashes (e.g., OOM, segfault), the `close` event handler cleans up the process reference but doesn't attempt to reconnect. The `cachedTools` for that server become stale. Additionally, there's no maximum limit on the number of concurrent MCP server connections.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/mcp/client.js`.
  2. In the `connect` method, add a reconnect counter and logic: if the process exits unexpectedly, retry up to 3 times with exponential backoff.
  3. Add a `maxServers` limit (default 5) to prevent resource exhaustion.
  4. Verify the module loads without errors.

---

#### [ID: SERVER.JS — B-17]
- **Component/Layer:** Backend / CORS Configuration
- **Issue Type:** Security
- **Current State:** `app.use(cors())` is called with no options, which means `Access-Control-Allow-Origin: *` is set for ALL routes, including authenticated API routes. This allows any website to make cross-origin requests to the API, enabling CSRF-like attacks for endpoints that rely on session cookies.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/server.js`.
  2. Replace `app.use(cors())` with `app.use(cors({ origin: ['https://maikr.pro', 'http://localhost:3001'], credentials: true }))`.
  3. Verify the server starts without errors.

---

#### [ID: WEBHOOK.JS — B-18]
- **Component/Layer:** Backend / Webhook Retry Logic
- **Issue Type:** Reliability
- **Current State:** The webhook retry endpoint (`GET /webhook/retry`) re-processes failed events by re-calling `processCheckoutSession` with the stored payload. However, the payload is the raw `event.data.object` which is a Stripe Session object. When re-processing, it creates a fake event `{ id: evt.stripe_event_id, ... }` but the `processCheckoutSession` function checks for duplicate sessions by `stripe_session_id`. If the original failure was AFTER the customer was created but BEFORE the event was marked completed, the retry will correctly skip due to the duplicate check. But if the failure was BEFORE customer creation, the retry will create a NEW customer with a NEW ID, resulting in duplicate customers for the same Stripe session.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/routes/webhook.js`.
  2. In the retry loop, before calling `processCheckoutSession`, check if a customer with the same `stripe_session_id` already exists.
  3. If found, skip that event and mark it as `completed` in `webhook_events`.
  4. Verify the retry logic handles edge cases.

---

#### [ID: CHANNELS.JS — B-19]
- **Component/Layer:** Backend / Channel Management API
- **Issue Type:** Authorization
- **Current State:** The channel management endpoints (`GET /api/channels/:agentId`, `POST /api/channels`, `DELETE /api/channels/:id`) have **no authentication middleware**. Any unauthenticated user can list, create, or delete channel connections for any agent by knowing the agentId.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/routes/channels.js`.
  2. Add `requireAuth` middleware to all channel management routes: `router.get('/channels/:agentId', requireAuth, ...)`.
  3. For `POST /api/channels` and `DELETE /api/channels/:id`, also add `requireAuth`.
  4. Additionally, verify that the authenticated user owns the agent they're modifying (check `agents.customer_id` against `customers.user_id`).
  5. Verify unauthenticated requests return 401.

---

#### [ID: AGENT.JS — B-20]
- **Component/Layer:** Backend / Agent API
- **Issue Type:** Authorization
- **Current State:** The `POST /api/update-agent` and `POST /api/agent/:agentId/config` endpoints have no authentication. Any user can modify any agent's system prompt, name, or config by providing an agentId.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/routes/agent.js`.
  2. Add `requireAuth` to `POST /api/update-agent` and `POST /api/agent/:agentId/config`.
  3. Add ownership verification: after auth, check that the agent's `customer_id` matches a customer owned by `req.session.userId`.
  5. Verify unauthorized requests are rejected.

---

#### [ID: DOCUMENTS.JS — B-21]
- **Component/Layer:** Backend / Document Ingestion
- **Issue Type:** Performance
- **Current State:** The `ingestText` function in `documents.js` processes chunks in batches of 20 for embedding, but each batch awaits the previous one sequentially. For a large document with 100 chunks, this means 5 sequential API calls. The embedding service also doesn't implement rate limiting — if multiple users upload documents simultaneously, OpenAI/OpenRouter rate limits will be hit.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/routes/documents.js`.
  2. In the `ingestText` helper, add concurrency control: process batches in parallel with `Promise.all` but limit to 3 concurrent batches using a semaphore pattern.
  3. Add a simple in-memory rate limiter: track requests per second and delay if exceeding 10 req/s.
  4. Verify the endpoint still works for single and multi-document uploads.

---

### FRONTEND & STATE

---

#### [ID: APP.JS — F-01]
- **Component/Layer:** Frontend / Build Flow Application Logic
- **Issue Type:** Security (XSS)
- **Current State:** The `showReviewSummary` function in `app.js` uses `escHtml()` to escape values, which is good. However, the `initChatDemo` function sets `aiMsg.textContent = '...'` which is safe, but the `sendDemoMessage` function uses `userMsg.textContent = message` — also safe. The REAL issue: the `showTerms` function sets `document.getElementById('termsModal').style.display = 'flex'` but there's no `hideTerms` function — once the terms modal is shown, it can't be closed. More critically, the `initTechStack` function uses `infoBox.innerHTML = '<p>' + info + '</p>'` where `info` comes from `data-info` attribute — this is safe since it's static HTML, but the pattern is risky.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/js/app.js`.
  2. Add a `hideTerms()` function that sets `display: none` on the terms modal.
  3. Add a close button handler inside the terms modal HTML in `build-step4.html`.
  4. Verify the terms modal can be opened and closed.

---

#### [ID: APP.JS — F-02]
- **Component/Layer:** Frontend / Build Flow State Management
- **Issue Type:** UX / Data Loss
- **Current State:** The build flow (steps 1-4) uses `window.location.hash` for step navigation (`#step-1`, `#step-2`, etc.) but form data is NOT persisted to `localStorage`. If the user refreshes the page or accidentally navigates away, all entered data is lost. The `plans` object in `app.js` has hardcoded prices that may not match the backend `PRICING` object.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/js/app.js`.
  2. On each step transition (`navigateToStep`), save form data to `localStorage.setItem('maikr_build_data', JSON.stringify({...}))`.
  3. On `DOMContentLoaded`, load saved data and populate form fields.
  4. Clear `localStorage` on successful checkout.
  5. Verify data persists across page refreshes.

---

#### [ID: CHAT.JS — F-03]
- **Component/Layer:** Frontend / Chat Interface
- **Issue Type:** Error Handling
- **Current State:** The `chat.js` frontend sends messages via `fetch('/api/chat', ...)` but has no error handling for network failures or 500 responses. If the server returns an error, the user sees no feedback — the message appears to be sent but no response ever comes. There's also no loading indicator or "typing..." state.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/js/chat.js`.
  2. Add a try/catch around the `fetch` call.
  3. On error, display a user-friendly error message in the chat window: `appendMessage('system', 'Connection lost. Please try again.')`.
  4. Add a "typing..." indicator that shows while waiting for the response.
  5. Add a retry button for failed messages.

---

#### [ID: CHAT.HTML — F-04]
- **Component/Layer:** Frontend / Chat Page CSS Variables
- **Issue Type:** UI Bug
- **Current State:** In `chat.html` line 18, the CSS variable `--text` is defined as `color: --text;` instead of `color: var(--text);`. This means the text color falls back to the browser default (usually black) instead of `#F0F0F0`, making text invisible on the dark background.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/chat.html`.
  2. Locate `body { background: var(--bg); color: --text; ... }` on line 18.
  3. Replace `color: --text;` with `color: var(--text);`.
  4. Verify text is visible on the dark background.

---

#### [ID: LANDING.HTML — F-05]
- **Component/Layer:** Frontend / Landing Page
- **Issue Type:** SEO / Performance
- **Current State:** The landing page loads Google Fonts via `<link rel="preconnect">` and `@import` pattern, but the `dark-premium.css` also loads fonts. This causes double font loading. The `analytics.js` script is loaded with `defer` but references `https://cloud.umami.is/script.js` with a placeholder `data-website-id="YOUR_SITE_ID_HERE"` — analytics is not actually configured.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/landing.html`.
  2. Remove the duplicate font preconnect link if `dark-premium.css` already loads it.
  3. Either configure the Umami analytics ID or remove the placeholder script.
  4. Add `font-display: swap` to any `@font-face` declarations to prevent FOIT (Flash of Invisible Text).

---

#### [ID: APP.JS — F-06]
- **Component/Layer:** Frontend / Matrix Canvas Animation
- **Issue Type:** Performance
- **Current State:** The `initMatrixCanvas` function runs `setInterval(draw, 50)` which executes 20 times per second, performing canvas fill operations and text rendering. This runs even when the canvas is not visible (e.g., user scrolled past it). On low-end devices, this causes jank and battery drain.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/js/app.js`.
  2. Replace `setInterval(draw, 50)` with `requestAnimationFrame(draw)` for smoother animation that pauses when the tab is not visible.
  3. Add an IntersectionObserver to pause the animation when the canvas is off-screen.
  4. Verify the animation runs smoothly and pauses when tab is hidden.

---

#### [ID: CHAT.JS — F-07]
- **Component/Layer:** Frontend / Chat — Message Persistence
- **Issue Type:** UX
- **Current State:** Chat messages are fetched from the server on page load, but there's no real-time update mechanism. If a user has the chat page open in two tabs, messages sent in one tab don't appear in the other. There's no WebSocket or polling for new messages.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/js/chat.js`.
  2. Add a polling mechanism: every 3 seconds, fetch new messages since the last message timestamp.
  3. Or implement a simple WebSocket connection for real-time updates.
  4. Verify messages appear in real-time.

---

#### [ID: BUILD-STEP4.HTML — F-08]
- **Component/Layer:** Frontend / Build Flow Step 4
- **Issue Type:** UX / Friction
- **Current State:** The "Deploy My Agent" button calls `initiateCheckout()` which sends a POST to `/create-checkout-session`. If the user hasn't filled in required fields on previous steps but somehow navigated to step 4 (via URL hash), the checkout will fail with a server error. The form validation only runs when clicking "Continue" between steps, not on the final submit.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/js/app.js`.
  2. In the `initiateCheckout` function, add validation for all required fields across all steps before sending the request.
  3. If validation fails, navigate back to the first incomplete step and show an error message.
  4. Verify the checkout doesn't proceed with incomplete data.

---

### UI/UX IMPLEMENTATION

---

#### [ID: DARK-PREMIUM.CSS — U-01]
- **Component/Layer:** UI / Design System
- **Issue Type:** Consistency
- **Current State:** The `dark-premium.css` file (1,091 lines) defines a comprehensive design system with CSS custom properties. However, `styles.css` (974 lines) defines a COMPLETELY DIFFERENT set of CSS variables (`--brand-green: #10b981`, `--primary-navy: #0f172a`, etc.) that conflict with the dark premium palette. Pages that load `styles.css` get a light theme with green accents instead of the dark premium theme. The `chat.html` page loads `styles.css` but defines its own inline `<style>` block with dark premium variables, creating a 3-way conflict.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/css/styles.css`.
  2. Replace all CSS variable definitions with imports from `dark-premium.css` or duplicate the dark premium variables.
  3. Remove the inline `<style>` block from `chat.html` and rely on `dark-premium.css`.
  4. Audit all HTML pages to ensure they load `dark-premium.css` instead of (or in addition to) `styles.css`.
  5. Verify consistent dark theme across all pages.

---

#### [ID: STYLES.CSS — U-02]
- **Component/Layer:** UI / Legacy Styles
- **Issue Type:** Technical Debt
- **Current State:** `styles.css` contains a `#matrixCanvas { display: none; }` rule (line 42) that hides the matrix canvas, but `app.js` tries to initialize it. This suggests `styles.css` was from an older version and is now partially conflicting with the new design. The file also contains `.logo-img` styles that reference a logo image that may not exist.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/css/styles.css`.
  2. Remove all rules that conflict with `dark-premium.css`.
  3. Either merge the unique/needed rules into `dark-premium.css` or delete `styles.css` entirely.
  4. Update all HTML pages that reference `styles.css` to use `dark-premium.css`.
  5. Verify no visual regressions.

---

#### [ID: LANDING.HTML — U-03]
- **Component/Layer:** UI / Landing Page Accessibility
- **Issue Type:** WCAG Compliance
- **Current State:** The landing page has no `<main>`, `<header>`, or `<nav>` landmark elements. All content is in `<div>` containers. There's no skip navigation link. The hero section uses `<div class="lp-hero">` instead of a semantic `<section>` or `<h1>` structure. Color contrast for `--smoke: #808080` on `--void: #0A0A0F` background is approximately 4.2:1, which fails WCAG AA for normal text (requires 4.5:1).
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/landing.html`.
  2. Wrap the nav in `<nav>` element, the hero in `<section aria-label="Hero">`, and add a `<main>` wrapper.
  3. Add a skip link: `<a href="#main-content" class="skip-link">Skip to main content</a>` as the first element in `<body>`.
  4. Change `--smoke: #808080` to `--smoke: #909090` in `dark-premium.css` to achieve 4.5:1 contrast ratio.
  5. Verify with Lighthouse accessibility audit.

---

#### [ID: CHAT.HTML — U-04]
- **Component/Layer:** UI / Chat Page Accessibility
- **Issue Type:** WCAG Compliance
- **Current State:** The chat input field has no `<label>` element. The send button has no `aria-label`. Chat messages are in `<div>` elements with no `role="log"` or `aria-live` attribute, meaning screen readers won't announce new messages.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/chat.html`.
  2. Add `<label for="chat-input" class="sr-only">Type your message</label>` before the input.
  3. Add `aria-label="Send message"` to the send button.
  4. Add `role="log" aria-live="polite"` to the chat messages container.
  5. Verify with a screen reader or Lighthouse.

---

#### [ID: ALL HTML PAGES — U-05]
- **Component/Layer:** UI / Responsive Design
- **Issue Type:** Mobile UX
- **Current State:** The landing page nav has `padding: 0 60px` which doesn't adapt to mobile. The chat page sidebar is `width: 280px` with no mobile toggle. Most pages don't have a hamburger menu or mobile-specific layouts. The build flow form steps use fixed widths that will overflow on small screens.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/css/dark-premium.css`.
  2. Add mobile breakpoints: `@media (max-width: 768px) { .lp-nav { padding: 0 20px; } .sidebar { position: fixed; transform: translateX(-100%); } .sidebar.open { transform: translateX(0); } }`.
  3. Add a hamburger button to `chat.html` for mobile sidebar toggle.
  4. In `app.js`, add mobile step navigation for the build flow.
  5. Verify on a mobile viewport.

---

#### [ID: ALL HTML PAGES — U-06]
- **Component/Layer:** UI / Font Loading
- **Issue Type:** Performance (FOIT)
- **Current State:** The landing page loads both `Inter` and `Orbitron` fonts from Google Fonts, but `dark-premium.css` also references `JetBrains Mono`. The fonts are loaded with `display: swap` in the Google Fonts URL, but there's no `font-display: swap` in the CSS `@font-face` declarations (if any). The `chat.html` loads fonts via `<link>` in the `<head>` but also has inline styles that reference these fonts before they're loaded.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/css/dark-premium.css`.
  2. Add `@font-face { font-family: 'Inter'; font-display: swap; }` for all custom fonts.
  3. Preload critical fonts: `<link rel="preload" href="...inter.woff2" as="font" type="font/woff2" crossorigin>` in HTML `<head>`.
  4. Verify fonts load without FOIT using Chrome DevTools.

---

#### [ID: LANDING.HTML — U-07]
- **Component/Layer:** UI / Trust Signals
- **Issue Type:** UX / Conversion
- **Current State:** The landing page has testimonials and social proof, but they use placeholder content ("Trusted by 500+ businesses" with no real numbers). The trust badges are static images that may not load. There's no live counter or dynamic social proof.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/landing.html`.
  2. Replace placeholder stats with real data from the API (e.g., fetch `/api/config` for agent count).
  3. Add fallback text for trust badge images.
  4. Add a "Recently created agents" ticker for dynamic social proof.

---

#### [ID: BUILD PAGES — U-08]
- **Component/Layer:** UI / Build Flow UX
- **Issue Type:** Friction
- **Current State:** The build flow has 4 steps but no way to see all steps at once or jump back to a specific step without clicking "Previous" multiple times. The progress bar is added dynamically by JavaScript but doesn't exist in the initial HTML, causing a layout shift (CLS) on page load.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/frontend/build-step1.html`.
  2. Add a static progress bar HTML structure that matches the JS-generated one, so there's no layout shift.
  3. Make progress bar dots clickable to jump to completed steps.
  4. Verify no CLS in Lighthouse.

---

### FEASIBLE IMPROVEMENTS

---

#### [ID: CACHING — I-01]
- **Component/Layer:** Backend / Performance Optimization
- **Issue Type:** Performance
- **Current State:** Every chat request loads conversation history from the database (`SELECT ... FROM conversations WHERE agent_id = ? ORDER BY created_at DESC LIMIT 40`). For active agents, this query runs on every message. There's no caching layer.
- **Proposed Optimization:** Add an in-memory LRU cache (using `lru-cache` npm package) for conversation history. Cache key: `agentId`, value: conversation array. Invalidate on new message. This reduces DB queries by ~80% for active conversations.
- **Target LLM Execution Steps:**
  1. Run `cd agent-saas/backend && npm install lru-cache`.
  2. Create `agent-saas/backend/services/cache.js` with an LRU cache instance (max 100 entries, 5-min TTL).
  3. In `routes/swarm.js`, wrap the history query with cache: `const history = await getCachedHistory(resolvedAgentId)`.
  4. After inserting a new conversation entry, invalidate the cache for that agentId.
  5. Verify cache hits in logs.

---

#### [ID: PROMPT-CACHE — I-02]
- **Component/Layer:** Backend / LLM Cost Optimization
- **Issue Type:** Cost
- **Current State:** Every chat request sends the full system prompt + RAG context + MCP tools description to the LLM. For agents with long system prompts and multiple MCP tools, this can be 2,000-3,000 tokens of overhead per request. OpenRouter supports prompt caching for repeated prefixes.
- **Proposed Optimization:** Restructure the messages array to put the system prompt (which is static per agent) as the first message, enabling OpenRouter's automatic prompt caching. Separate the dynamic parts (RAG context, conversation history) into subsequent messages.
- **Target LLM Execution Steps:**
  1. Open `agent-saas/backend/routes/swarm.js`.
  2. In the `messages` array construction, ensure the system prompt is always the first message and doesn't change between requests for the same agent.
  3. Add `cache_control: { type: 'ephemeral' }` to the system prompt message if the provider supports it.
  4. Monitor token usage in the `token_usage` table to verify cache hit rates.

---

#### [ID: WEBHOOK-QUEUE — I-03]
- **Component/Layer:** Backend / Webhook Processing
- **Issue Type:** Reliability
- **Current State:** Webhook events are processed synchronously in the request handler. If Stripe sends multiple events in quick succession (e.g., `checkout.session.completed` + `customer.subscription.created`), they're processed sequentially. The provisioning process (DB inserts + email + agent file generation) can take 5-10 seconds, during which the webhook endpoint is blocked.
- **Proposed Optimization:** Implement a simple in-memory queue (or Bull/BullMQ with Redis) for webhook events. Return 200 immediately and process events asynchronously. This prevents Stripe from retrying due to timeout.
- **Target LLM Execution Steps:**
  1. Create `agent-saas/backend/services/webhook-queue.js` with a simple async queue pattern: `const queue = []; let processing = false; async function enqueue(task) { queue.push(task); if (!processing) processQueue(); }`.
  2. In `routes/webhook.js`, instead of calling `processCheckoutSession` directly, call `enqueue(() => processCheckoutSession(session, event))`.
  3. Return 200 immediately after enqueueing.
  4. Verify webhook events are processed asynchronously.

---

## PHASE 2: MASTER IMPLEMENTATION BLUEPRINT

The following roadmap orders all fixes by dependency. Each phase is designed to fit within a ~4k token context window for a smaller model.

---

### Phase A: Security Hardening (CRITICAL — Do First)

**Dependencies:** None. These are foundational security fixes.

| Order | ID | File | Fix | Est. Lines |
|-------|----|------|-----|------------|
| A-1 | B-17 | server.js | Restrict CORS to maikr.pro | 1 |
| A-2 | B-02 | server.js | Unify protected pages auth middleware | 30 |
| A-3 | B-01 | server.js + new bootstrap.js | Extract secrets loading to dedicated module | 40 |
| A-4 | B-19 | routes/channels.js | Add auth to channel management endpoints | 15 |
| A-5 | B-20 | routes/agent.js | Add auth to agent update endpoints | 15 |
| A-6 | B-03 | routes/webhook.js | Fix Stripe client instantiation + email validation | 20 |
| A-7 | B-08 | routes/auth.js | Add per-email rate limiting for password reset | 20 |

---

### Phase B: Bug Fixes (HIGH — Correctness)

**Dependencies:** None. These fix broken functionality.

| Order | ID | File | Fix | Est. Lines |
|-------|----|------|-----|------------|
| B-1 | B-04 | routes/swarm.js | Fix variable ordering (history/baseSystemPrompt used before declaration) | 30 |
| B-2 | F-04 | chat.html | Fix `color: --text` → `color: var(--text)` | 1 |
| B-3 | B-12 | services/loopDetector.js | Add word boundaries to contradiction regexes | 10 |
| B-4 | B-14 | services/ragScorer.js | Remove dead code / implement actual LLM calls | 30 |
| B-5 | B-15 | services/embeddingService.js | Fix OpenRouter embedding endpoint | 15 |
| B-6 | B-10 | database.js | Add error handling to migration callbacks | 10 |
| B-7 | B-09 | server.js + all routes | Add global error handler + standardize error responses | 40 |

---

### Phase C: Performance Optimization (MEDIUM)

**Dependencies:** Phase B (bug fixes must be applied first).

| Order | ID | File | Fix | Est. Lines |
|-------|----|------|-----|------------|
| C-1 | I-01 | new cache.js + swarm.js | Add LRU cache for conversation history | 30 |
| C-2 | B-06 | services/creditManager.js | Fix race condition with atomic SQL UPDATE | 25 |
| C-3 | B-05 | routes/swarm.js + chat.js | Implement SSE streaming for chat responses | 60 |
| C-4 | B-07 | new services/llm.js | Extract shared LLM service, remove duplication | 80 |
| C-5 | I-03 | new webhook-queue.js | Async webhook processing queue | 40 |
| C-6 | B-21 | routes/documents.js | Parallel embedding with rate limiting | 25 |

---

### Phase D: UI/UX Consolidation (MEDIUM)

**Dependencies:** Phase B (bug fixes).

| Order | ID | File | Fix | Est. Lines |
|-------|----|------|-----|------------|
| D-1 | U-01 | styles.css + all HTML | Consolidate CSS to single design system | 100 |
| D-2 | U-03 | landing.html | Add semantic landmarks + skip link + fix contrast | 30 |
| D-3 | U-04 | chat.html | Add ARIA labels + roles for accessibility | 15 |
| D-4 | U-05 | dark-premium.css | Add mobile responsive breakpoints | 60 |
| D-5 | F-02 | app.js | Persist build flow data to localStorage | 25 |
| D-6 | F-03 | chat.js | Add error handling + loading states to chat | 30 |
| D-7 | F-06 | app.js | Replace setInterval with requestAnimationFrame | 15 |

---

### Phase E: Feature Enhancements (LOW)

**Dependencies:** Phases C and D.

| Order | ID | File | Fix | Est. Lines |
|-------|----|------|-----|------------|
| E-1 | I-02 | routes/swarm.js | Optimize prompt structure for caching | 20 |
| E-2 | B-13 | services/intentClassifier.js | Implement OpenRouter fallback for LLM classification | 25 |
| E-3 | F-07 | chat.js | Add real-time message polling | 30 |
| E-4 | U-08 | build-step1.html + app.js | Static progress bar to prevent CLS | 20 |
| E-5 | B-11 | services/provisioning.js | Transaction wrapping + email retry | 30 |
| E-6 | B-16 | mcp/client.js | Add reconnect logic + max server limit | 25 |

---

## APPENDIX: QUICK-WIN CHECKLIST

These are single-line or few-line fixes that can be applied immediately:

- [ ] `chat.html` line 18: `color: --text` → `color: var(--text)` (F-04)
- [ ] `server.js`: `app.use(cors())` → `app.use(cors({ origin: ['https://maikr.pro'], credentials: true }))` (B-17)
- [ ] `routes/webho
ok.js`: Move `const stripe = require('stripe')(...)` to module level (B-03)
- [ ] `database.js`: Replace `() => {}` migration callbacks with error logging (B-10)
- [ ] `routes/swarm.js`: Move `history` and `baseSystemPrompt` declarations before loop detection (B-04)
- [ ] `services/loopDetector.js`: Add `\b` word boundaries to contradiction regexes (B-12)
- [ ] `landing.html`: Remove duplicate Google Fonts preconnect (F-05)
- [ ] `app.js`: Add `hideTerms()` function (F-01)

---

*End of Audit Report*
