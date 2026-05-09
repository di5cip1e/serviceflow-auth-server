# M.ai.K.R Roadmap

Last updated: 2026-05-05 (Director)

Purpose: A clear, prioritized roadmap for launching M.ai.K.R as a reliable, trust-first AI Agent Builder for small businesses. This document lists milestones, current status, what's complete, what's blocked, and concrete next steps with ownership and rough time estimates.

---

## Vision
Make it trivial for a small business to deploy a brand-trained AI agent on their site that captures leads, answers customers, and automates common business tasks — with enterprise-level reliability and pay-as-you-go costs.

---

## Milestones
1. MVP: Public website + Dashboard + Chat + Alerting + Billing (Target: Minimal sellable product)
2. Beta: Hosted provisioning, payment flow (Stripe webhooks), email/SMS alerts in production, onboarding flow
3. Launch: Customer acquisition, SLAs, analytics, paid subscriptions
4. Scale: Multi-tenant, monitoring, autoscale, regional providers

---

## Current status (high level)
- Website & landing pages: ✅ Completed (index copy, hero, value workflow, two use-cases)
- Visual refresh (SMB-friendly palette & typography): ✅ Completed (frontend styles updated)
- Industry dropdown extended: ✅ Completed
- Pricing reframed (ROI language): ✅ Completed
- Dashboard (Customization engine): ✅ Completed (business description, website URL, style, function, system prompt auto-generation)
- Dashboard (Real-Time Alerts UI + Advanced options): ✅ Completed (Toggles, DND UI, custom triggers)
- Backend: chat escalation parsing and DB logging: ✅ Completed (`chat.js`, `conversations` entries)
- DB schema: alert_settings column added: ✅ Completed
- Model change for Director (OpenClaw): ✅ Completed (openrouter/openai/gpt-5-mini active)
- Director SKILL.md: ✅ Completed (`/workspace/skills/director/SKILL.md`)

---

## Completed items (detailed)
- index.html: Business-value copy + second workflow added (lead capture + quote flow)
- styles.css: switched to trust-building palette, Inter/system fonts, whitespace
- dashboard.html:
  - Customization engine (businessDescription, businessUrl, response style, knowledge level, greeting)
  - Auto-generated system prompt logic (frontend)
  - Real-Time Alerts tab: toggles, notification method, email/phone inputs, Do-Not-Disturb UI, Advanced custom triggers & sensitivity
  - Save action posts `alert_settings` JSON to `/api/update-agent`
- Backend:
  - `/api/update-agent` updated to accept alert_settings and other fields
  - `/api/chat` checks AI replies for `[ESCALATE:TYPE]` and logs `[ALERT:TYPE]` in conversations table
- Devops:
  - Director model switched via `openclaw config set agents.defaults.model "openrouter/openai/gpt-5-mini"` (openclaw config changed)
  - Agent backend running on port 3001/3002 during testing, with chat endpoint working

---

## In progress / Not yet complete (with next steps)

1) Email / SMS delivery pipeline (HIGH PRIORITY - BLOCKED by provider keys)
- Why: Alerts currently log to DB but do not deliver messages to owners.
- Files to add/change: `backend/services/alerter.js`, `backend/routes/alerts.js`, update `chat.js` to call `alerter.send()` when escalation occurs and alert_settings allow it.
- Providers recommended: Twilio (SMS), SendGrid or Postmark (email). Option: use a single provider for both if available (e.g., Twilio Notify + SendGrid).
- Secrets: store provider keys in `~/.openclaw/secrets.json` (already holds OpenAI/OpenRouter keys).
- Steps:
  1. Add `alerter.js` scaffold with `sendEmail()` and `sendSMS()` functions (2-4 hours).
  2. Wire `chat.js` to call `alerter.sendAlertIfNeeded(agentId, escalationType, message)` (1 hour).
  3. Test with sandbox/test keys; run DB check for `[ALERT:TYPE]` (1-2 hours).
- Blockers: need provider test keys from Derek.
- Estimated time: 4-8 hours once keys available.

2) DND enforcement and Alert Sensitivity (MEDIUM)
- Why: UI can set DND days & times and sensitivity; backend must respect them.
- Implementation:
  - Add `alerter.isSuppressed(settings)` to evaluate current timestamp vs DND and sensitivity.
  - Use server time with user's timezone (USER.md has timezone UTC) or agent-specific timezone field in `agents`.
- Files: `alerter.js` and small helper in `utils/time.js`.
- Estimated time: 1-2 hours.

3) Automated Audit Hook for identity edits (SOUL.md / AGENTS.md) (LOW-MEDIUM)
- Why: For traceability we must log identity file changes.
- Options:
  - Wrap `openclaw config set` changes with a hook (harder)
  - Add a lightweight watcher (fs.watch) for these files to append to `memory/YYYY-MM-DD.md` upon change (easiest)
  - Or require edits go through an API endpoint that logs updates (most controlled)
- Recommended: implement `fs.watch` + append (low friction) and add a record when the Director performs a config change.
- Estimated time: 1-2 hours.

4) Stripe webhook secret + payment flow finalization (HIGH)
- Why: test-mode payments currently lack local webhook forwarding; production requires webhook secret.
- Tasks:
  - Add `STRIPE_WEBHOOK_SECRET` to `~/.openclaw/secrets.json`.
  - Update backend to verify webhook signature in `routes/payments.js`.
  - Test with `stripe-cli` (or configure public webhook) and confirm provisioning flow calls provisioning.js.
- Blockers: need webhook secret or access to a public webhook receiver; Derek to provide or I can set up tunnel.
- Estimated time: 2-4 hours with keys.

5) Standardize CSS variables and finalize theme (LOW)
- Why: cleanup, ensure no leftover matrix-* variables remain after redesign.
- Implementation: search/replace, smoke-check across pages.
- Estimated time: 1-2 hours.

6) Onboarding & Documentation (Beta requirement)
- Create quick onboarding checklist for new customers: dashboard walkthrough, alert setup, payment, test agent.
- Files: `docs/ONBOARDING.md`, `frontend/success.html` tweaks, sample email templates.
- Estimated time: 4-8 hours.

7) Monitoring & Ops (MEDIUM)
- Add basic uptime/health checks, automated alerting for server exceptions, and logs retention.
- Tools: PM2 logs already used; add log rotation + simple uptime endpoint + small cron check.
- Estimated time: 3-6 hours.

---

## Roadmap timeline (suggested)
- Week 0 (now): Stabilize alerts UI + backend hooks, add `alerter.js` scaffold (start with sandbox keys) — 1-2 days
- Week 1: Integrate SMS/Email providers, DND enforcement, run integration tests — 2-3 days
- Week 2: Stripe webhook finalization + provisioning automation end-to-end tests — 2-4 days
- Week 3: Onboarding docs, frontend polish, finalize CSS variables, marketing prep — 3-5 days
- Week 4+: Beta signups, monitoring, iterate on user feedback

---

## Immediate recommended next actions (pick 1)
1. Provide test SendGrid (email) and Twilio (SMS) credentials so I can implement and test live alerts.
2. Provide Stripe webhook details (or allow me to run stripe-cli/tunnel) so I can finish payment -> provisioning flow.
3. I can start by adding the audit-hook and CSS standardization if you prefer infrastructure-first changes.

---

## Owner & contacts
- Primary owner: Derek (you) — product/market decisions, credentials
- Implementation: The Director (me) + sub-agents (Flux for backend, Pixel for UI, Prism for images)
- Files I will update: `skills/director/SKILL.md`, `backend/services/alerter.js`, `backend/routes/alerts.js`, small DND helper, and documentation in `/docs`.

---

If you want, I will:
- Create `backend/services/alerter.js` scaffold now and run a dry-run using no-op providers (no keys) so the pipeline is in place. This is a low-risk change and makes the following step quicker.
- Or start with implementing the audit-hook for SOUL.md/AGENTS.md edits.

Which immediate step should I take? If you want me to proceed, I will implement the chosen item and report back with a short test plan and progress ETA.
