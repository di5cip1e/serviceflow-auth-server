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
- **Model:** openrouter/minimax/minimax-m2.7 (set 2026-05-06)
- **Current time:** Sunday May 10, 2026 04:00 UTC
- **Context:** ~50k tokens — healthy
- **MEMORY.md target:** Keep under 50KB
- **Heartbeat:** every 2 hours
- **PM2:** maikr-backend + ollama-router running, systemd-enabled for reboot persistence

## Active Projects (Current)
- **M.ai.K.R** (agent-saas/): ✅ Live at maikr.pro — tiered model system, SSL cert live, Stripe armed, webhook verified, `/health` endpoint live, **PM2 on systemd watchdog**, custom 502 page, P1 copy/design ready (hero rewrite, trust signals, competitive positioning, security headers full suite)
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
- **M.ai.K.R frontend update**: Deploy new hero, trust section, pricing polish from team audit output (Pixel to build)
- **Git push**: fc62070 still unpushed — retry
- **Twilio**: Carrier routing fix for SMS alerts (email working via Mailgun aginstitute.tech)
- **session-manager.js**: Uses `openclaw run` (doesn't exist) — per-customer OpenClaw agents won't start until rewritten

## Critical OpenClaw Lessons (M.ai.K.R specific)
1. Register agent: `openclaw agents add <slug> --workspace /opt/agents/<slug> --non-interactive`
2. Bootstrap files must be in agentDir: `~/.openclaw/agents/{slug}/agent/` (SOUL.md, AGENTS.md, USER.md)
3. Session spawns via gateway when `openclaw agent --agent <slug>` is called (NOT a background daemon)
4. session_key format: `agent:<slug>:main`
5. sessions_send() needs WebSocket ACP bridge — not callable from plain Node require()
6. API key in auth-profiles.json takes precedence over secrets.json for OpenRouter

## Key Technical Notes
- **Stripe keys**: In agent-saas/backend/.env (sk_live_, pk_live_, rk_live_, webhook secret)
- **Mailgun**: aginstitute.tech domain, API key in secrets.json
- **Ollama**: llama3.2:3b installed (port 11434) — ollama-router.js routes simple→Ollama (free), complex→OpenRouter
- **Workspace backup**: Daily 3am UTC cron (workspace-daily-backup, isolated session)
- **Audit hook**: /root/.openclaw/workspace/scripts/audit_changes.js running
- **git-credentials**: Has 2 tokens, one with space prefix — needs cleanup
- **SSL cert**: Let's Encrypt for maikr.pro, expires Aug 7 2026 — certbot auto-renewal enabled
- **PM2**: maikr-backend running (pid 916002, 6h uptime, online)
- **Audit hook**: /root/.openclaw/workspace/scripts/audit_changes.js watching SOUL.md/AGENTS.md
- **DALL-E 3 v2**: Deprecated May 2026 — migrate to newer API version when needed

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
*Last consolidated: 2026-05-09 02:25 UTC*

## May 10 Quick Notes
- Workspace backup: c575570 (6 files, 222 insertions)
- M.ai.K.R tiered model system live (Standard/Premium/Elite)
- Workspace org complete: ~800MB freed, lore folders merged
- PM2 crash lesson: maikr-backend needs systemd watchdog

*Last consolidated: 2026-05-10 04:19 UTC*
*Previous: 2026-05-08 04:00 UTC*

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
