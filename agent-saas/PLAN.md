# M.ai.K.R — Feature Plan & Progress

> Created: 2026-05-21 02:49 UTC
> Status: IN PROGRESS

---

## 🔴 Critical (Blocking Revenue)

### Task 1: First-Run Onboarding Wizard
**Status:** ✅ Complete
**Started:** 2026-05-21 02:50 UTC
**Completed:** 2026-05-21 03:10 UTC
**Commit:** (see below)
**Priority:** P0 — Directly impacts conversion
**Scope:**
- Post-payment guided setup flow
- Step 1: Welcome + agent overview
- Step 2: Connect a channel (Telegram/Slack/SMS)
- Step 3: Test chat with agent
- Step 4: See first lead (trigger lead search)
- Step 5: "Your agent is live!" celebration + dashboard redirect
**Files to create:**
- `frontend/onboarding-wizard.html`
- `backend/routes/onboarding.js`
- `backend/services/onboardingService.js`
**Research needed:** Best onboarding patterns for SaaS (check Linear, Stripe, Vercel onboarding flows)

---

### Task 2: Chat Page Overhaul
**Status:** ✅ Complete
**Started:** 2026-05-21 03:10 UTC
**Completed:** 2026-05-21 03:25 UTC
**Commit:** (see below)
**Priority:** P0 — Core product experience
**Scope:**
- Conversation history with timestamps
- Agent personality display (name, avatar, tone indicator)
- Quick-reply suggestions
- Typing indicator
- Message status (sent/delivered/read)
- Responsive mobile layout
**Files to modify:**
- `frontend/chat.html`
- `frontend/css/chat.css` (new)
- `backend/routes/chat.js` (enhance)
**Research needed:** Chat UI patterns (Intercom, Drift, Crisp)

---

### Task 3: Email System Fix (Resend)
**Status:** 🔲 Not Started
**Priority:** P0 — Every signup needs a working email
**Scope:**
- Verify Resend API key and domain configuration
- Test welcome email flow end-to-end
- Test password reset email
- Add email templates (branded HTML)
- Fallback to Mailgun if Resend fails
**Files to modify:**
- `backend/services/alerter.js`
- `backend/services/emails.js`
- `backend/routes/auth.js` (password reset)
- `backend/services/provisioning.js` (welcome email)
**Research needed:** Resend API docs, verify domain status

---

## 🟡 High Priority (Conversion Drivers)

### Task 4: Social Proof & Testimonials
**Status:** 🔲 Not Started
**Priority:** P1 — Landing page credibility
**Scope:**
- Add 2-3 testimonial cards to landing page
- Create testimonial collection form for beta users
- Add "as seen in" or trust badges section
- Add usage stats (X agents created, Y leads found)
**Files to modify:**
- `frontend/landing.html` (or index.html)
**Research needed:** Testimonial best practices, competitor social proof

---

### Task 5: Pricing Page Enhancement
**Status:** 🔲 Not Started
**Priority:** P1 — Clear feature differentiation
**Scope:**
- Feature comparison table (all 4 tiers)
- "Most popular" badge on Growth tier
- FAQ section (6-8 common questions)
- Lead gen feature highlighted as Growth+ differentiator
- Annual vs monthly toggle
**Files to modify:**
- `frontend/build-step4.html` (pricing step)
- `frontend/landing.html` (pricing section)
**Research needed:** SaaS pricing page best practices (check Stripe, Linear, Notion)

---

### Task 6: Customer Analytics Dashboard
**Status:** 🔲 Not Started
**Priority:** P1 — Show ROI to prevent churn
**Scope:**
- Messages per day/week/month chart
- Leads found over time
- Credits used vs remaining
- Cost trends
- Agent performance metrics
**Files to create:**
- `frontend/analytics.html`
- `backend/routes/analytics.js`
- `backend/services/analyticsService.js`
**Files to modify:**
- `backend/database.js` (analytics tables)
**Research needed:** SaaS analytics dashboard patterns

---

## 🟢 Nice to Have (Polish)

### Task 7: Agent Personality Editor
**Status:** 🔲 Not Started
**Priority:** P2 — Fun/shareable feature
**Scope:**
- Upload logo/avatar for agent
- Set brand colors
- Define personality traits (dropdown sliders)
- Preview agent card
- Export agent config
**Files to modify:**
- `frontend/command-center.html` (appearance section)
- `backend/routes/agent.js` (update appearance)
**Research needed:** Character/AI personality design patterns

---

### Task 8: Webhook Retry UI
**Status:** 🔲 Not Started
**Priority:** P2 — Transparency for customers
**Scope:**
- Show webhook status on channels page
- Failed event list with error messages
- Manual retry button
- Auto-retry status indicator
**Files to modify:**
- `frontend/channels.html`
- `backend/routes/channels.js` (add status endpoint)
**Research needed:** Webhook management UI patterns

---

### Task 9: Mobile Responsiveness
**Status:** 🔲 Not Started
**Priority:** P2 — Mobile-first founders
**Scope:**
- Audit all dashboard pages for mobile
- Responsive nav (hamburger menu)
- Touch-friendly buttons and forms
- Optimized tables (card layout on mobile)
**Files to modify:**
- All `frontend/*.html` files
- `frontend/css/dark-premium.css`
**Research needed:** Mobile SaaS dashboard patterns

---

## Progress Log

| # | Task | Status | Started | Completed | Commit |
|---|------|--------|---------|-----------|--------|
| 1 | Onboarding Wizard | 🔲 | — | — | — |
| 2 | Chat Overhaul | 🔲 | — | — | — |
| 3 | Email Fix | 🔲 | — | — | — |
| 4 | Social Proof | 🔲 | — | — | — |
| 5 | Pricing Page | 🔲 | — | — | — |
| 6 | Analytics Dashboard | 🔲 | — | — | — |
| 7 | Personality Editor | 🔲 | — | — | — |
| 8 | Webhook UI | 🔲 | — | — | — |
| 9 | Mobile Polish | 🔲 | — | — | — |
