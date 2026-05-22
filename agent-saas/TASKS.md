# M.ai.K.R — Task Tracker

## 🔴 CRITICAL — Build Flow Fix (May 22, 2026)

Derek reported: "The four step agent builder needs redesigning and fixed. I couldn't finish onboarding because I couldn't get my agent to create. The dashboard didn't look complete either."

### Completed
- [x] Add `/api/config` endpoint (Stripe PK + auth status)
- [x] Add `/api/agents/create` endpoint (direct agent creation, free tier)
- [x] Add `req.session.userEmail` to auth routes
- [x] Fix hardcoded URLs in success page + get-agent API
- [x] Rebuild build-step4.html with working "Create My Agent" button
- [x] Add redirect-after-auth handling to login/register pages
- [x] Fix "next iteration" placeholder text in command-center.html

### In Progress
- [ ] **Rebuild dashboard** — Derek said "complete rebuild may be necessary". Remove broken links, placeholder content, fix navigation. Make it a cohesive hub.
- [ ] **Test build steps 1-3** — Ensure form data flows correctly to step 4
- [ ] **Test onboarding wizard** — Verify it works with new agent creation flow
- [ ] **Deploy to production** — Push changes, restart backend
- [ ] **End-to-end test** — Full flow: Register → Build → Create → Onboard → Dashboard

### Key Technical Details
- Build flow: steps 1-3 use localStorage → step 4 requires login → POST `/api/agents/create` → onboarding wizard
- Free tier: 5000 tokens/mo, 10 outcome credits, 1 agent
- `maikr_redirect_after_register` localStorage preserves build flow across auth
- `maikr_active_agent` localStorage set after agent creation
- Backend routes modified: `routes/agent.js`, `routes/auth.js`
- Frontend files modified: `build-step4.html`, `success.html`, `register.html`, `login.html`, `command-center.html`

## 🟡 Pending (After Build Flow Fix)

### Dashboard Pages Audit
Each of these pages needs to be checked for broken links, placeholder text, and non-functional features:
- command-center.html (main dashboard — partially fixed)
- dashboard.html (old dashboard — may need deprecation)
- chat.html
- observe.html
- analytics.html
- agent-studio.html
- channels.html
- swarm.html
- mcp.html
- optimization.html
- deploy.html
- widgets.html
- templates.html
- byok.html
- whitelabel.html
- leads.html
- settings.html

### Known Issues
- session-manager.js: uses `openclaw agent` command — needs testing
- MCP tools injection into swarm agent system prompts — verify working
- Outcome credits for lead_qualified/appointment_booked — verify wired into swarm flow
