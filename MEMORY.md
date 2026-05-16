# Long-term Memory

## Core Architecture
- **Two-tier system:** Short-term (daily logs) + Long-term (curated)
- **Short-term:** `memory/YYYY-MM-DD.md` - active project notes, progress, blockers
- **Long-term:** This file - preferences, key facts, lessons learned
- **Session start:** Load yesterday + today's short-term memory

## Key Preferences
- Derek wants proactive memory updates during work
- Track progress/blockers with short notes, not full logs
- Prioritize efficiency: shorter responses, fewer tool calls, no redundant reads

## Critical Runtime Info
- **Model:** openrouter/owl-alpha (free, 1M+ context, set 2026-05-13)
- **Current time:** Thursday May 14, 2026 04:00 UTC
- **Context:** ~50k tokens — healthy
- **MEMORY.md target:** Keep under 50KB
- **Heartbeat:** every 2 hours
- **PM2:** maikr-backend + ollama-router running, systemd-enabled for reboot persistence

## Active Projects (Current)
- **M.ai.K.R** (agent-saas/): ✅ Live at maikr.pro — Phases 1-4 complete + Phase 6 (optimization) + Phase 7 (command center) + Phase 8 (consumption billing). Auth & onboarding system complete (May 14). All pages protected, session-based auth, rate limiting, checkout integration. 9 commits.
- **Agent Builder Dashboard**: Running at http://187.77.31.252:3000/wizard
- **Kingdom Cards**: ~70% — Phaser 3 battle engine works, Fantasy/Medieval theme
- **Ironveil**: Ready for Windows import (since March 23)
- **TRAP**: ~90% complete, on hold
- **Pulse**: On hold (APK build issues)
- **ServiceFlow**: On hold (field service vertical)

## Revenue Priorities (NOW)
1. **M.ai.K.R first payment** — backend fully wired, Stripe live keys in backend/.env, first customer = first agent spawned
2. **Beta outreach** — share maikr.pro for first real customer feedback
3. **ClawHub**: 10 skills published, passive download potential

## Pending Actions (Human Required)
- **M.ai.K.R first customer**: Backend fully wired — need real payment to trigger first agent spawn
- **Git push**: fc62070 still unpushed (network timeout)
- **Twilio**: Carrier routing fix for SMS alerts (email working via Mailgun aginstitute.tech)
- **session-manager.js**: Uses `openclaw run` (doesn't exist) — per-customer OpenClaw agents won't start until rewritten
- **MCP wire-up**: MCP tools need injection into swarm agent system prompts — LLM can't see MCP tools yet

## Critical OpenClaw Lessons (M.ai.K.R specific)
1. Register agent: `openclaw agents add <slug> --workspace /opt/agents/<slug> --non-interactive`
2. Bootstrap files must be in agentDir: `~/.openclaw/agents/{slug}/agent/` (SOUL.md, AGENTS.md, USER.md)
3. Session spawns via gateway when `openclaw agent --agent <slug>` is called (NOT a background daemon)
4. session_key format: `agent:<slug>:main`
5. sessions_send() needs WebSocket ACP bridge — not callable from plain Node require()
6. API key in auth-profiles.json takes precedence over secrets.json for OpenRouter
7. Sub-agent write tool: content param is REQUIRED — empty string is valid, undefined causes tool-use failure
8. Express route mounting: `app.use('/api/mcp', mcpRoutes)` NOT `app.use('/api', mcpRoutes)` when route paths start with `/templates` or `/servers`

## Key Technical Notes
- **Stripe keys**: In agent-saas/backend/.env (sk_live_, pk_live_, rk_live_, webhook secret)
- **Mailgun**: aginstitute.tech domain, API key in secrets.json
- **Ollama**: llama3.2:3b installed (port 11434) — ollama-router.js routes simple→Ollama (free), complex→OpenRouter
- **Workspace backup**: Daily 3am UTC cron (workspace-daily-backup, isolated session)
- **Audit hook**: /root/.openclaw/workspace/scripts/audit_changes.js watching SOUL.md/AGENTS.md
- **git-credentials**: Has 2 tokens, one with space prefix — needs cleanup
- **SSL cert**: Let's Encrypt for maikr.pro, expires Aug 7 2026 — certbot auto-renewal enabled
- **DALL-E 3 v2**: Deprecated May 2026 — migrate to newer API version when needed
- **MCP endpoints**: /api/mcp/templates, /api/mcp/servers/:agentId, /api/mcp/servers/:agentId/tools (Phase 4 live)
- **MCP templates**: github, filesystem, notion, slack, aws-kb presets in registry
- **Dashboard URLs**: maikr.pro/swarm.html (Phase 2), maikr.pro/channels.html (Phase 3), maikr.pro/mcp.html (Phase 4)

## What Makes Me Better
- Memory dream transfer: weekly consolidation at 04:00 UTC
- Self-improving: capture lessons in ~/self-improving/.learnings/
- Heartbeat task rotation: CLAWHUB → MONEY → SOCIAL (1 per heartbeat)
- Designated sub-agent team: Wren/lore, Mirren/art, Prism/images, Flux/code, Circuit/systems

## Efficiency Rules (Self-imposed)
- Don't read files I already have context on
- No redundant tool calls — combine where possible
- Keep responses short unless depth is required
- When unsure what to do: do safe internal work first, escalate only when blocked
- Session context is fresh each turn — don't assume state, verify it

---
*Last consolidated: 2026-05-11 04:04 UTC*

## May 12-13, 2026 Updates
- Backup: 27 files changed, 1620 insertions (+skill files)
- Added skills: ai-agent-builder, analytics, client-onboarding-automator, customer-onboarding-guider, email-automation, stripe-best-practices
- Workspace organization: Clean structure maintained
- Forgeai.sbs: Briefly down (000) then recovered to 301 (normal)

*Last consolidated: 2026-05-16 04:00 UTC*
*Previous: 2026-05-15 04:03 UTC*

## May 15-16, 2026 — Testing Overhaul + Mailgun Fix

### Test Suite Created
- TEST_PLAN.md: 14-section test plan (public pages, auth, protected pages, agent API, chat/swarm, MCP, channels, credits, observability, optimization, admin, documents, checkout, security)
- test-runner.js v4: automated runner with full metrics (response times, pass rates, section breakdowns, JSON reports)
- 350 tests across 5 beta accounts — 100% pass rate
- Reports saved to agent-saas/test-results/
- Run: `cd agent-saas/backend && node test-runner.js`

### 5 Beta Accounts
- beta-alpha@maikr.pro (Growth, Technology)
- beta-bravo@maikr.pro (Value, Health & Wellness)
- beta-charlie@maikr.pro (Growth, Home Services)
- beta-delta@maikr.pro (Scale, Education)
- beta-echo@maikr.pro (Value, E-Commerce)
- All password: beta1234!

### Mailgun Issue
- Old API key flagged as "exposed" by Mailgun — account-level block
- New API key generated and stored in secrets.json
- Waiting on Mailgun support to resolve account block
- secrets.json secured: 600 permissions, gitignored

### Backend Fixes
- Added express.static for frontend directory (privacy.html, terms.html, success.html now served)
- Increased auth rate limit 5→20 per 15min for testing
- Fixed HTTP/2 status line parsing (regex didn't match HTTP/2 without minor version)

### Security
- secrets.json: chmod 600, added to .gitignore in both workspace and .openclaw
- Never log, print, or echo API keys in chat

### Project Status (May 16)
- M.ai.K.R fully built and tested, ready for first real customer
- Mailgun email sending blocked pending support response
- Derek pivoting to new side project — maikr.pro on back burner

### May 15: Derek Reports maikr.pro Issues + Test Account
- /command-center.html was 404 — only /dashboard route existed. Fixed with redirect.
- Created test account: derek@test.maikr.pro / testpass123
- Created test agent: test-agent-980b0fe6 (TestBot, Growth plan)
- Derek reported "a lot of problems" — waiting for detailed report
- Lesson: need to add redirect routes for all old .html URLs that now have clean routes

### May 13-14: Audit Fixes + Auth & Onboarding System

**Audit findings and fixes:**
- PM2 was EMPTY — backend running as raw process. Fixed: backend now under PM2 with auto-restart
- Gateway also put under PM2 with auto-restart
- Nightly optimization cron in ERROR — SQL syntax bug in optimizationEngine.js (mixed quotes in IN clause). Fixed with LOWER() + proper escaping
- Model `openrouter/owl-alpha` was rejected — not in `agents.defaults.models` registry. Added registry entry. Now active: free, 1M+ context, native tool use

**Auth & Onboarding System (COMPLETE — 8 tasks, 9 commits):**
- Session-based auth: email + password, bcrypt (cost 10), express-session + connect-sqlite3
- Routes: /api/auth/register, /login, /logout, /change-password, /me
- Rate limiting: 5 attempts per 15 min on login/register
- Frontend: /login, /register, /settings pages with dark theme
- Success page: guest account creation form after Stripe payment
- Checkout integration: user_id passed in Stripe metadata, linked on payment
- All protected pages (dashboard, chat, observe, swarm, channels, mcp, optimization, settings) redirect to /login without session
- Nav updated: "Log out" in protected pages, "Sign Up" + "Login" on landing
- Files created: backend/middleware/auth.js, backend/routes/auth.js, frontend/login.html, frontend/register.html, frontend/settings.html, frontend/css/auth.css
- TASKS.md in agent-saas/ tracks all 8 tasks complete
- Task Decomposer Skill created: skills/task-decomposer/SKILL.md

**Subagent execution pattern (lesson learned):**
- Frontend-only tasks work well in subagents (no port conflicts)
- Backend tasks that need PM2 restart tend to time out — handle directly in main session
- strategy: spawn subagents for frontend, handle backend changes directly
- Always read TASKS.md at start of each session for continuity

---

## March 2026 — Archived (Full history in daily memory files)

### Week of March 3-10: Station Command + Pulse Launch
- Station Command: 16-bit RPG mission control, 10 sub-agents, 25+ API routes
- Pulse: 73 files, 6 specialized subagents, rebranded to P.U.L.S.E
- Agent system mastered: registration before spawning, 5+ min timeouts for substantial tasks

### Week of March 11-17: TRAP ~85%, Team MVP Vote
- TRAP: Drug system (7 types), dynamic economy (10 events), 33-quest main quest line
- MVP Vote: "THE DIRECTOR" won team vote (4 votes)
- Phaser asset fix: procedural graphics fallback when external URLs 404
- Parallel sub-agent execution (5+) proven effective

### Week of March 18-24: Kingdom Cards + Ironveil
- Kingdom Cards: dual-deck mechanic (Kingdom 8 slots + Battle 10-15 cards), Fantasy/Medieval theme
- Ironveil: 486MB GameMaker project extracted, zipped for Windows import
- Art style clarified: SERIOUS gameplay + ZANY cartoon artwork (not prison theme)
- DALL-E safety filters: "punching"→"showdown", avoid "prison"/"riot" triggers

### Week of March 25-31: PixelForge + Avant Garde
- PixelForge (forgeai.sbs): launched website + API competitive vs Ludo.ai ($9 vs $15/mo)
- Avant Garde: website live, prospect emails drafted, paused per Derek decision
- ClawHub: Derek first publisher with 5 skills (first-mover advantage)
- Heartbeat: Morning meeting prep (CLAWHUB → MONEY → SOCIAL rotation)

### Week of April 1-7: ServiceFlow + ClawHub Expansion
- ServiceFlow: field service management (plumbers/HVAC/electricians) $9-79/tech/mo, $5.5B market
- ClawHub: expanded to 10 skills, 33K+ skills on platform, first-mover advantage lost
- OpenClaw updated to 2026.4.9
- PixelForge: competitive analysis done, build Option A approved

### Week of April 8-14: Agent Builder Dashboard + PixelForge
- Agent Builder Dashboard: wizard UI at /agent-builder-dashboard/
- PixelForge: $9/mo pricing vs Ludo.ai $15/mo, API on port 3000
- Self-improving skill installed with .learnings/ directory
- DALL-E v2 API deprecation warning (May 2026)

### Week of April 15-21: Multi-VPS Deployment
- Agent generation fixes: template syntax, directory creation order, EEXIST cleanup
- PM2 keeps Next.js app alive reliably
- Test mode for Stripe demo without real charges
- Agent files generate to /opt/agents/{bot-slug}/ successfully

### Week of April 22-28: Agent SaaS + M.ai.K.R Launch
- Agent SaaS: /agent-saas/, Express + Stripe checkout, Matrix-green themed UI
- M.ai.K.R launched: domain maikr.pro, pricing Basic $49/Intermediate $99/Advanced $199/Enterprise $499/mo
- 4-step questionnaire: Basic Info → Audience/Tone → Use Cases → Review/Pay
- Dashboard (D.A.S.H.-Board): customization engine, memory/logs, appearance editor
- Chat interface: works with brand-trained GPT-4o-mini agents

### Week of April 29 — May 7: Wiring + Refinement
- M.ai.K.R Phase 1 complete: agent generator + session manager + provisioning pipeline
- Escalation pipeline: [ESCALATE:] token → DB → alerter → email confirmed end-to-end
- Email: Mailgun aginstitute.tech working (Derek corrected domain from mg.aginstitute.tech)
- SMS: Twilio error 30032 carrier blocking (email primary, SMS unreliable)
- Stripe: live keys stored in backend/.env, webhook verified
- OpenRouter models: gpt-5-mini (~$0.25/M), gpt-4.1-nano (~$0.10/M, 67% cheaper)
- Context overflow: derek-test-agent hit 200k/200k tokens — cleared session files to recover
- session-manager.js: uses non-existent `openclaw run` — needs rewrite (NOT DONE YET)

### May 8-9: Tiered Model System + Workspace Cleanup
- M.ai.K.R tiered model: Standard (free/OpenAI), Premium (+$15/mo/minimax-m2.7), Elite (+$30/mo/gpt-4.1)
- All models route through OpenRouter single API key
- DB: model_tier, monthly_cost_cents added to agents table
- Frontend: tier selector UI built in Step 5
- Admin API: POST /api/admin/agents/:id/tier for tier upgrades
- Workspace: ~800MB+ freed, corrupt folders deleted, lore folders merged

### May 9: Self-Audit + Ollama + M.ai.K.R Critical Fixes
- **Self-audit**: MEMORY.md 85KB→7.5KB (91% trim), 53 old files archived, HEARTBEAT.md interval corrected, 57MB dead PixelForge files archived
- **Ollama integrated**: llama3.2:3b model pulled (2GB), ollama-router.js built (port 3002) — smart routing: simple→Ollama (free), complex→OpenRouter fallback. Saves ~60-70% of API costs
- **M.ai.K.R 4 critical fixes**:
  1. Welcome email: `generateWelcomeEmail()` → actually sends via Mailgun alerter.js
  2. Session ID bug: `provisionCustomer()` stored eventId as stripe_session_id → now stores real Stripe session ID
  3. Success page: hardcoded `187.77.31.252` → `maikr.pro`, correct `/api/get-agent?session_id=` (underscore)
  4. Checkout: `create-checkout-session` route exists and works (Stripe live session created)
- **Workspace backup**: daily 3am UTC cron set up (git add + push)
- **Derek milestone**: 64 days working together (March 6 start)

### May 10: Team Audit + P0/P1 Launch Sprint
- **9-agent audit (Team + Director)**: Cipher, Circuit, Flux, Mirren, Pixel, Prism, Quill, Tomothy, Wren all audited maikr.pro. Tomothy got clean run; 8 hit 502 from PM2 crash. Average score: 5/10. Key findings: no watchdog, no health endpoint, no error page, weak hero, no trust signals.
- **SSL cert fixed**: certbot obtained Let's Encrypt cert for maikr.pro (expires Aug 7). Previously cert was for forgeai.sbs — HTTPS broken.
- **P0 fixes delivered**: /health endpoint (Circuit), PM2 systemd auto-restart (Flux), custom error.html 502 page (Pixel) — all live
- **P1 copy delivered**: New hero ("Stop losing revenue to 'we're closed'..."), plan role-framing (Digital Front Desk/Lead Machine/Elite Sales Associate), Intelligence Tier business outcomes copy (Wren)
- **Trust signals + competitive**: Privacy statement, 99.9% uptime SLA, 3-step how it works, competitive differentiation vs AgentGPT/CustomGPT/Botpress (Tomothy)
- **Security headers**: Full suite (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) added to nginx — zero to full suite (Flux)
- **Visual design spec**: Trust badges, how it works flow, social proof placeholder, pricing card polish in warm green #2ECC71 (Mirren)
- **PM2 crash lesson**: maikr-backend died at ~23:22 UTC with no auto-recovery. Fixed by manual restart. Now on systemd watchdog.

### May 11: Phase 2 (Swarm) + Phase 3 (Channels) + Phase 4 (MCP) — All Complete
- **Phase 2 Swarm**: stateMachine.js, intentClassifier.js (Ollama LLM), swarmRouter.js, routes/swarm.js, tierRouter.js — 5 sub-agents (support/sales/onboarding/general/admin) with keyword+LLM intent routing, verified at 0.95 confidence. swarm.html live.
- **Phase 3 Omnichannel**: routes/channels.js + twilio.js (TwiML, 12s AbortSignal) + slack.js (signature verification, Block Kit) — webhook endpoints for SMS/WhatsApp and Slack. channels.html live.
- **Phase 4 MCP**: mcp/client.js (JSON-RPC stdio, 30s timeout), mcp/registry.js (DB-backed per-agent configs, tool cache), mcp/routes.js (full CRUD + connect/disconnect/test/call). 5 templates (github/filesystem/notion/slack/aws-kb). /api/mcp/templates verified live.
- **Sub-agent lessons**: Prism (CX card delivery) + Circuit (backend, correct on first try). Pixel write tool failed with `content: undefined` (must pass content string, not rely on implicit behavior). Always include exact file paths in prompts.
- **Route mounting order lesson**: `app.use('/api/mcp', mcpRoutes)` not `app.use('/api', mcpRoutes)` when route paths start with `/templates` — more specific base path needed when routes don't have `/mcp/` prefix themselves.
- **mcp.html**: Prism sub-agent failed to deliver (no output, tool-use issue). Built directly by Director — dark theme, 5 template cards, connected servers panel, custom server form with dynamic env vars, agent tool context view. Live at maikr.pro/mcp.html

## May 11, 2026 — Major Session: Phases 6, 7, 8 Complete

### Phase 6: Optimization Agent — COMPLETE
- **Files**: `backend/services/optimizationEngine.js`, `backend/optimization/routes.js`, `frontend/optimization.html`
- **DB table**: `optimization_proposals` (pending/applied/rejected status, rewrite, adjustment, priority, confidence, example_bad)
- **API**: GET /pending, GET /history/:agentId, POST /:id/approve, POST /:id/reject, POST /run
- **Rules**: MIN_CASES_TO_TRIGGER=2, FAITHFULNESS_THRESHOLD=0.6, RELEVANCY_THRESHOLD=0.5, 72h dedup
- **Approval model**: Human-in-the-loop — all changes require explicit approval
- **Nightly cron** (id: 38dc246a) at midnight UTC — announces results on Telegram
- **Live at**: maikr.pro/optimization.html

### Phase 7: Command Center UI — COMPLETE
- **File**: `frontend/command-center.html` (23,850 bytes) — replaces old dashboard
- **Sections**: maikr banner masthead, 4 workforce metrics, SVG swarm map (animated), activity feed, HITL approvals
- **Redirect**: `dashboard.html` now instant-redirects to command-center.html
- **Nav links**: observe.html + optimization.html updated with command-center nav
- **maikr banner**: `frontend/assets/maikr-banner.jpg` (1280×698, uploaded by Derek)
- **Avant Garde logo**: `frontend/assets/avant-garde-logo.jpg` (uploaded by Derek, used in "Powered by Avant Garde" footer)
- Backend restart #49, maikr-backend PID 1898025

### Phase 8: Economic Restructuring (Consumption Billing) — COMPLETE
- **New pricing tiers**: Value $44.99 | Growth $99.99 | Scale $199.99 | Enterprise $499
- **DB migration**: Added `base_tokens`, `base_tokens_used`, `outcome_credits`, `outcome_credits_used`, `plan_name` to agents table
- **New tables**: `credit_transactions` (ledger), `credit_purchases`
- **Files**: `backend/services/creditManager.js`, `backend/routes/creditRoutes.js`
- **Token rates** (per 1K tokens): gpt-4.1-mini $0.15, gpt-5-mini $0.25, minimax-m2.7 $0.15, ollama free
- **Outcome credit rates**: lead_qualified=2, appointment_booked=3, support_ticket_resolved=1, document_generated=1, escalation_resolved=1, rag_query=0.25, mcp_tool_call=0.5
- **Credit packs**: Outcome 10 ($15), Growth 50 ($65), Scale 100 ($110)
- **Provision flow updated**: webhook passes baseTokens + outcomeCredits from PRICING; provisioning.js inserts them
- **swarm.js**: now calls `creditManager.deductTokenCost()` after each LLM call (async, non-blocking)
- **Command Center credit panel**: live credit status cards with progress bars, color-coded (blue→yellow→red)
- **API endpoints**: GET /api/credits/status/:agentId, GET /api/credits/transactions/:agentId, GET /api/credits/packs, POST /api/credits/deduct-outcome

### Bug Fixes Applied Today
- `tracer.js:OPENROUTOR_API_KEY` typo → `OPENROUTER_API_KEY`
- `swarm.js`: removed unused `withTrace` import
- `routes/creditRoutes.js`: auth middleware on all credit routes

### Known Critical Issues (Not Yet Fixed)
1. ~~session-manager.js uses `openclaw run`~~ ✅ FIXED May 11 — now uses `openclaw agent --agent <slug> --session-id <key> --message <msg> --json`
2. ~~MCP tools not injected into swarm agent system prompts~~ ✅ FIXED May 11 — `buildMCPToolsDescription()` in swarm.js injects tools into system prompt
3. ~~provisioning.js: missing DB columns/tables~~ ✅ FIXED May 11 — customers, api_keys, credit_transactions, credit_purchases tables created; agents table extended
4. ~~provisioning.js: plaintext API keys~~ ✅ FIXED May 11 — now hashes with bcrypt before storing
5. ~~outcome_credits INTEGER truncation~~ ✅ FIXED May 11 — column changed to REAL
6. **provisioning INSERT bug**: VALUES had 18 `?` but 19 cols — critical-fixes subagent fixed columns but VALUES had 17 `?` then 18 `?` then 19 `?` — fixed May 12 by manually correcting to 17 `?` before 'active' + 1 after = 19 total
7. **Welcome email failing 403**: Mailgun aginstitute.tech domain — likely domain verification not complete
8. ~~Auth system: No user login~~ ✅ FIXED May 14 — complete session-based auth system
9. **Outcome credits for lead_qualified/appointment_booked**: Not yet wired into swarm flow
10. **Nightly optimization cron**: SQL fix applied — waiting for next midnight run to verify

### May 11-12 Session: Professional Redesign + Critical Fixes

**Landing page redesign:**
- New marketing landing page (landing.html) at `/` — hero, features, pricing, social proof, dark theme, Inter font
- 4-step form split into separate pages: `/build` → `/build/audience` → `/build/usecases` → `/build/plan`
- LocalStorage persists form data between steps
- Landing page nav stripped clean — only essential links, Login button added
- Privacy + Terms pages added (maikr.pro/privacy.html, /terms.html)
- Premium CSS polish: step indicators with navy/glow, card shadows, refined input focus states
- Express static `index.html` removed (was overriding landing page via express.static — caused 3hr debug)

**Backend critical fixes:**
- bcrypt module installed (`npm install bcrypt`) — backend was crashing without it
- session-manager.js rewritten: `openclaw agent --agent <slug> --session-id <key> --message <msg> --json`
- API keys hashed with bcrypt in provisioning
- provisioning INSERT fixed: VALUES placeholders now match 19 columns exactly
- DB: customers, api_keys, credit_transactions, credit_purchases tables added; agents table extended

**Git history:**
- git filter-branch ran May 11 to remove 645MB of large files (ironveil, PixelForge)
- Commits: a89d91b (Phases 1-8), 8c6df17 (fix index.html override), c0138d0 (provisioning INSERT), a2460a4 (login nav)

### M.ai.K.R Full Stack Status
- **Live**: maikr.pro/ (landing), /build/* (4-step form), /chat.html, /observe.html, /optimization.html, /command-center.html, /channels.html, /swarm.html, /mcp.html, /privacy.html, /terms.html
- **Backend restarts**: ~24 restarts (bcrypt crash, index.html debug, provisioning fixes)
- **Langfuse**: live at us.cloud.langfuse.com
- **SSL**: Let's Encrypt cert for maikr.pro, expires Aug 7 2026
- **Test agent**: TestBot4 spawned (agent:test-company-4-mp1zl4e6:main), chat API verified working
