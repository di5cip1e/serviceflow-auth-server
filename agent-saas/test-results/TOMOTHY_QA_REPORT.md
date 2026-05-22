# 🎬 Tomothy QA Report — M.ai.K.R Content & UX Audit

**Date:** 2026-05-22  
**Auditor:** Tomothy (World Builder)  
**Scope:** All HTML pages in `/root/.openclaw/workspace/agent-saas/frontend/`  
**Total Pages Audited:** 39 HTML files

---

## Executive Summary

M.ai.K.R is a well-structured AI agent platform with a dark premium aesthetic and comprehensive feature set. The landing page is polished and conversion-focused. The build flow is functional. However, significant inconsistencies exist across the app in navigation, pricing, terminology, and user flow coherence. Several pages have placeholder content, dead ends, and edge case gaps that need addressing before production.

**Overall Score: 6.5/10**

---

## 1. Content & Copy Audit

### 1.1 Typos & Grammar

| # | File | Issue | Severity |
|---|------|-------|----------|
| 1 | `channels.html` | `<h1>Maikr Phase 3 - Omnichannel Dashboard (Mock)</h1>` — "Maikr" instead of "M.ai.K.R", and "(Mock)" label left in production | 🔴 High |
| 2 | `channels.html` | Comment at bottom: `<!-- channels.html generated mockup by Prism -->` — developer artifact left in production | 🔴 High |
| 3 | `swarm.html` | `<title>Swarm Control — M.ai.K.R</title>` but `<h1>Swarm Control</h1>` with `Phase 2` badge — inconsistent with "Phase 3" reference in channels | 🟡 Medium |
| 4 | `mcp.html` | Duplicate nav — both `maikr-nav` and `topnav` classes used, creating two nav bars stacked | 🔴 High |
| 5 | `observe.html` | Duplicate nav — same `maikr-nav` + custom nav pattern creating double navigation | 🔴 High |
| 6 | `optimization.html` | Duplicate nav — same issue | 🔴 High |
| 7 | `error.html` | Title says "M.ai.K.R - Maintenance" but body says "Taking a short break" — inconsistent messaging | 🟡 Medium |
| 8 | `error.html` | Button text `_RETRY_CONNECTION` uses underscore prefix — looks like a code artifact | 🟡 Medium |
| 9 | `landing.html` | `M<span>.ai</span><span style="color:#fff">.K.R</span>` — logo rendering is fragile, the dot styling depends on span nesting | 🟢 Low |
| 10 | `contact.html` | Email is `derekbrooks@aginstitute.tech` — should this be a more generic `hello@maikr.pro`? | 🟡 Medium |
| 11 | `success.html` | Hardcoded `fetch('https://maikr.pro/api/get-agent?session_id=...')` — absolute URL won't work on staging/local | 🔴 High |
| 12 | `swarm.html` | `const API = 'https://maikr.pro'; // Change to http://127.0.0.1:3001 for local` — hardcoded production URL with dev comment | 🔴 High |

### 1.2 Terminology Inconsistencies

| # | Issue | Files Affected | Severity |
|---|-------|---------------|----------|
| 1 | **Product name inconsistency:** "M.ai.K.R" vs "Maikr" vs "M.ai.K.R" vs "MAIKR" | `channels.html` uses "Maikr", `swarm.html` uses "M.ai.K.R" in nav but title says "Swarm Control" | 🟡 Medium |
| 2 | **"Outcome Credits" vs "Credits" vs "Outcome Credits"** — the landing page uses "outcome credits", build-step4 uses "Outcome Credits", but dashboard uses just "Credits" in the credit status section | 🟡 Medium |
| 3 | **"Value" plan naming** — landing page says "Value", build-step4 says "Value", but the plan description says "For small teams" on landing and "For small teams getting started" on build — minor but inconsistent | 🟢 Low |
| 4 | **"Intelligence Tier" vs "Model Tier"** — build-step4 uses "Intelligence Tier" (Standard/Premium/Elite), but swarm.html uses "Model Tier" (basic/standard/premium/ultra) | 🟡 Medium |
| 5 | **"Swarm" vs "Swarm Control" vs "Visual Swarm Map"** — inconsistent naming for the same concept across pages | 🟢 Low |
| 6 | **"Dashboard" vs "Command Center"** — some pages link to `/dashboard`, others to `/command-center.html`. The `dashboard.html` page title says "Dashboard" but nav link in command-center says "Dashboard" pointing to `/dashboard.html` | 🟡 Medium |

### 1.3 Placeholder Text & Content

| # | File | Placeholder | Severity |
|---|------|-------------|----------|
| 1 | `landing.html` | `data-website-id="YOUR_SITE_ID_HERE"` — Umami analytics not configured | 🟡 Medium |
| 2 | `login.html` | Same `YOUR_SITE_ID_HERE` placeholder | 🟡 Medium |
| 3 | `register.html` | Same `YOUR_SITE_ID_HERE` placeholder | 🟡 Medium |
| 4 | `deploy.html` | `YOUR_AGENT_ID` used as literal placeholder in code snippets — users need clear instructions on where to find their actual ID | 🟡 Medium |
| 5 | `brand-assets.html` | `agentId = 'TEST_AGENT_ID'` and `userId = 'TEST_USER_ID'` — hardcoded test values | 🔴 High |
| 6 | `command-center.html` | Charts section says "Charts will be connected to real API data in next iteration" — placeholder note | 🟡 Medium |
| 7 | `onboarding-wizard.html` | Uses `'default'` as fallback agentId — may cause confusion | 🟢 Low |

---

## 2. User Flow Coherence

### 2.1 Landing → Sign Up → Build → Pay → Dashboard → Chat

| Step | Flow | Issue | Severity |
|------|------|-------|----------|
| 1 | Landing → Sign Up | ✅ Clear CTA "Get Started Free" → `register.html` | — |
| 2 | Sign Up → Build | ✅ Register redirects to `/dashboard` (per JS). But no intermediate "create your agent" step — user lands on empty dashboard | 🟡 Medium |
| 3 | Build (Step 1-4) | ⚠️ Build flow uses separate pages (`build-step1.html` through `build-step4.html`) BUT there's also `onboarding.html` which is a single-page wizard with the same 4 steps. **Two competing build flows exist.** | 🔴 High |
| 4 | Build Step 1 → 2 | ✅ `build-step1.html` submits to `/build/audience` but the file is `build-step2.html` — **route mismatch** | 🔴 High |
| 5 | Build Step 2 → 3 | ✅ Submits to `/build/usecases` but file is `build-step3.html` — **route mismatch** | 🔴 High |
| 6 | Build Step 3 → 4 | ✅ Submits to `/build/plan` but file is `build-step4.html` — **route mismatch** | 🔴 High |
| 7 | Build Step 4 → Payment | ⚠️ Calls `/create-checkout-session` but has a hardcoded Stripe test key `pk_test_51TH2qP...` and placeholder `priceId` values (`price_value_id`, etc.) | 🔴 High |
| 8 | Payment → Success | ✅ `success.html` handles post-payment with session_id, agent URL, and guest account creation | — |
| 9 | Success → Dashboard | ✅ "Go to Dashboard" button present | — |
| 10 | Dashboard → Chat | ⚠️ `dashboard.html` is a config+chat sandbox, but `chat.html` is a separate full chat interface. Two different chat experiences exist. | 🟡 Medium |
| 11 | Onboarding Wizard | ⚠️ `onboarding-wizard.html` is a completely separate flow from `onboarding.html` and `build-step1-4.html`. Three competing onboarding flows. | 🔴 High |

### 2.2 Navigation Inconsistencies

| # | Issue | Severity |
|---|-------|----------|
| 1 | **Three different nav patterns exist:** (a) `maikr-nav` class used on most inner pages, (b) custom nav on `landing.html` (`lp-nav`), (c) double nav on `mcp.html`, `observe.html`, `optimization.html` | 🔴 High |
| 2 | `dashboard.html` links to `/dashboard` (itself) but `command-center.html` links to `/dashboard.html` — inconsistent URL patterns | 🟡 Medium |
| 3 | `onboarding.html` nav links to `/build-step1.html` but the build step pages link to `/build/audience` etc. — routing mismatch | 🔴 High |
| 4 | `blueprints.html` nav links to `/dashboard` (no .html) while other pages use `.html` extensions | 🟡 Medium |
| 5 | `leads.html` has a completely different nav style (minimal, no maikr-nav class) | 🟡 Medium |
| 6 | `error.html` has no navigation back to the app — only a "Retry" button that goes to `https://maikr.pro/` | 🟡 Medium |

### 2.3 Dead Ends

| # | Page | Dead End | Severity |
|---|------|----------|----------|
| 1 | `error.html` | No nav, no way to go back except retry button | 🟡 Medium |
| 2 | `success.html` | After guest account creation, redirects to `/dashboard` — but if the user came from a guest checkout, they may not have an agent yet | 🟡 Medium |
| 3 | `build-step4.html` | If Stripe checkout fails, user is stuck on step 4 with no way to go back to change plan | 🟡 Medium |
| 4 | `templates.html` | "Use Template" prompts for an Agent ID via `alert()`/`prompt()` — terrible UX, no agent selection UI | 🔴 High |
| 5 | `onboarding-wizard.html` | If provisioning fails, shows error with link to `/command-center.html` but no retry mechanism | 🟡 Medium |

---

## 3. Edge Cases

### 3.1 Refresh Mid-Build

| # | Issue | Severity |
|---|-------|----------|
| 1 | `build-step1.html` through `build-step3.html` store form data in `localStorage` under `maikr_form` — refreshing preserves data ✅ | — |
| 2 | `build-step4.html` reads from localStorage ✅ but if user refreshes on step 4, the "Building: agentName" summary shows correctly | — |
| 3 | **However**, if user starts build on one device and continues on another, localStorage won't transfer — no server-side session | 🟡 Medium |
| 4 | If user goes back in browser history from step 4 to step 1, the form data loads from localStorage but the step indicator still shows "Step 1 of 4" — no active step highlighting | 🟢 Low |

### 3.2 Payment Failure

| # | Issue | Severity |
|---|-------|----------|
| 1 | `build-step4.html` — if Stripe redirect fails, user sees "Something went wrong" alert and button resets. No error logging or recovery path. | 🟡 Medium |
| 2 | `success.html` — if `session_id` is invalid or expired, the agent URL input shows "Loading…" forever with no error state | 🟡 Medium |
| 3 | No handling for partial payment (e.g., card declined after form submission) | 🟡 Medium |

### 3.3 No Credits / Zero Credits

| # | Issue | Severity |
|---|-------|----------|
| 1 | `command-center.html` credit bars show 0% used when no data — acceptable fallback | — |
| 2 | `leads.html` shows upgrade banner for non-Growth plans — good | — |
| 3 | No warning/notification system for low credits anywhere in the UI | 🟡 Medium |
| 4 | `dashboard.html` sandbox chat doesn't check credit availability before sending | 🟢 Low |

### 3.4 Concurrent Sessions

| # | Issue | Severity |
|---|-------|----------|
| 1 | No session management visible — if user opens two tabs, both can send chat messages with the same `agentId` | 🟢 Low |
| 2 | `swarm.html` generates `currentConversationId` per page load — no cross-tab sync | 🟢 Low |

### 3.5 LLM API Down

| # | Issue | Severity |
|---|-------|----------|
| 1 | `chat.html` — shows "Connection error. Please check your connection and try again." — acceptable | — |
| 2 | `dashboard.html` sandbox — shows "Connection error. Is the backend running?" — good | — |
| 3 | `onboarding-wizard.html` chat step — shows "Connection error. You can still continue." — allows bypass, good | — |
| 4 | No global error boundary or graceful degradation pattern across pages | 🟡 Medium |

---

## 4. Phase D Content Audit

### 4.1 `/whitelabel.html`

| # | Issue | Severity |
|---|-------|----------|
| 1 | Clear explanation of what white-label does ✅ | — |
| 2 | Live preview updates in real-time ✅ | — |
| 3 | Domain status section exists but shows nothing until user enters a domain — should show "No custom domain configured" | 🟢 Low |
| 4 | No explanation of DNS setup process for custom domain | 🟡 Medium |
| 5 | "Checking..." badge on load — if API fails, it stays as "Checking..." forever | 🟡 Medium |
| 6 | Nav links to `/agents.html` which doesn't exist in the frontend directory | 🔴 High |

### 4.2 `/templates.html`

| # | Issue | Severity |
|---|-------|----------|
| 1 | Template cards look good with ratings, categories, pricing ✅ | — |
| 2 | "Use Template" uses `prompt()` to ask for Agent ID — very bad UX | 🔴 High |
| 3 | Modal shows template details well ✅ | — |
| 4 | No "preview template" functionality — user can only see description | 🟡 Medium |
| 5 | Purchase flow for premium templates works but reloads page on success | 🟢 Low |
| 6 | Nav links to `/agents.html` — doesn't exist | 🔴 High |

### 4.3 `/byok.html`

| # | Issue | Severity |
|---|-------|----------|
| 1 | Clear explanation of BYOK with info box ✅ | — |
| 2 | Platform fee slider (0-10%) is a nice touch ✅ | — |
| 3 | Toggle validation prevents enabling without keys ✅ | — |
| 4 | No provider-specific instructions (e.g., where to find OpenAI API key) | 🟡 Medium |
| 5 | No warning about minimum key permissions required | 🟡 Medium |
| 6 | Key shown as `key_prefix` only — good security practice ✅ | — |

### 4.4 `/widgets.html`

| # | Issue | Severity |
|---|-------|----------|
| 1 | Clear widget type selection with visual cards ✅ | — |
| 2 | Channel overview stats at top ✅ | — |
| 3 | Embed code generation with copy button ✅ | — |
| 4 | No preview of what each widget type looks like | 🟡 Medium |
| 5 | Widget list shows truncated embed code — hard to verify | 🟢 Low |
| 6 | Nav links to `/agents.html` — doesn't exist | 🔴 High |

---

## 5. Empty States

| # | Page | Empty State | Quality |
|---|------|-------------|---------|
| 1 | `dashboard.html` | "Test your agent in real-time" with icon — good | ✅ |
| 2 | `chat.html` | "No Agent Connected" with API key input — good | ✅ |
| 3 | `leads.html` | "No leads yet" with CTA to find leads — good | ✅ |
| 4 | `command-center.html` | "No pending approvals" / "No recent activity" — good | ✅ |
| 5 | `templates.html` | "No templates found for this filter" — good | ✅ |
| 6 | `blueprints.html` | "No blueprints match your filters" — good | ✅ |
| 7 | `widgets.html` | "No widgets yet. Create one above!" — good | ✅ |
| 8 | `byok.html` | "No API keys added yet" — good | ✅ |
| 9 | `brand-assets.html` | "No documents yet. Upload your first brand asset above." — good | ✅ |
| 10 | `observe.html` | "No traces yet. Send a message to your agent" — good | ✅ |
| 11 | `optimization.html` | "No pending proposals" with CTA — good | ✅ |
| 12 | `swarm.html` | "No routing events yet" / "No sub-agents spawned yet" — good | ✅ |
| 13 | `error.html` | Only says "Taking a short break" — no helpful links or suggestions | ⚠️ |
| 14 | `mcp.html` | "No servers connected yet" — good | ✅ |

---

## 6. Trust & Social Proof

### 6.1 Landing Page

| Element | Present | Quality |
|---------|---------|---------|
| Hero stats (50+ agents, 200+ leads, 99.9% uptime, <2s response) | ✅ | Good but appear fabricated — no dynamic backing |
| Testimonials (3) | ✅ | Good variety (SaaS, Home Services, B2B) |
| Trust badges (SOC 2, GDPR, 99.9% Uptime, Cancel Anytime) | ✅ | Standard but effective |
| "No credit card required" in CTA section | ✅ | Good trust signal |
| Pricing transparency | ✅ | 4 tiers clearly displayed |
| FAQ section | ✅ | 5 common questions covered |
| **Missing:** Customer logos, case studies, "Trusted by X companies" | ❌ | Would strengthen trust |
| **Missing:** Security details page link | ❌ | SOC 2 is claimed but no proof/detail page |

### 6.2 Pricing Consistency

| Plan | Landing Page | Build Step 4 | Dashboard Reference |
|------|-------------|-------------|-------------------|
| Value | $45/mo | $45/mo | — |
| Growth | $100/mo | $100/mo (shows $99 in text) | — |
| Scale | $200/mo | $200/mo | — |
| Enterprise | $499/mo | Not shown | — |

**Issue:** Build step 4 shows Growth as `$99/mo` in the plan card text but `$100/mo` in the comparison table. Landing page says `$100/mo`. **Inconsistent pricing.**

| # | Issue | Severity |
|---|-------|----------|
| 1 | Growth plan price: `$99` on card vs `$100` in table vs `$100` on landing | 🔴 High |
| 2 | Growth plan tokens: `100,000` on landing vs `50,000` on build step 4 | 🔴 High |
| 3 | Growth plan outcome credits: `300` on landing vs `500` on build step 4 | 🔴 High |
| 4 | Scale plan tokens: `500,000` on landing vs `200,000` on build step 4 | 🔴 High |
| 5 | Scale plan outcome credits: `1,000` on landing vs `2,000` on build step 4 | 🔴 High |
| 6 | Enterprise plan not shown on build step 4 at all | 🟡 Medium |

---

## 7. Detailed Scores

| Area | Score | Notes |
|------|-------|-------|
| **Content & Copy** | 6/10 | Several production artifacts left in code, terminology inconsistencies, hardcoded test values |
| **User Flow** | 5/10 | Three competing build/onboarding flows, route mismatches, dead ends |
| **Edge Cases** | 6/10 | Basic error handling exists but no global patterns, payment recovery weak |
| **Phase D Content** | 7/10 | Good feature coverage but broken nav links, poor template UX |
| **Empty States** | 8/10 | Comprehensive coverage across most pages |
| **Trust & Social Proof** | 6/10 | Good foundation but pricing inconsistencies undermine trust |
| **Visual Design** | 8/10 | Consistent dark premium aesthetic, good use of gradients and animations |
| **Navigation** | 5/10 | Three nav patterns, duplicate navs on some pages, broken links |
| **Accessibility** | 7/10 | Skip links present on all pages, ARIA labels used, good color contrast |
| **Overall** | **6.5/10** | Solid foundation with polish needed on flows, consistency, and production readiness |

---

## 8. Top 10 Priority Fixes

| Priority | Issue | Effort |
|----------|-------|--------|
| 1 | **Resolve three competing build flows** — pick one (onboarding.html, build-step1-4, or onboarding-wizard.html) and remove/redirect the others | Medium |
| 2 | **Fix pricing inconsistencies** — ensure plan names, prices, tokens, and credits match across landing, build, and all references | Low |
| 3 | **Fix route mismatches** — build-step1 submits to `/build/audience` but file is `build-step2.html` | Low |
| 4 | **Remove production artifacts** — "(Mock)" labels, developer comments, hardcoded test IDs, `YOUR_SITE_ID_HERE` placeholders | Low |
| 5 | **Fix duplicate navigation** on `mcp.html`, `observe.html`, `optimization.html` | Low |
| 6 | **Fix broken nav links** — `/agents.html` referenced but doesn't exist | Low |
| 7 | **Replace `prompt()`-based template application** in `templates.html` with proper agent selection UI | Medium |
| 8 | **Add error states** to `success.html` for invalid/expired sessions | Low |
| 9 | **Standardize navigation** — pick one nav pattern across all pages | Medium |
| 10 | **Add spending cap / low credit warnings** to prevent surprise bills | Medium |

---

## 9. Positive Highlights

- ✅ **Skip links** present on every single page — excellent accessibility
- ✅ **Consistent dark premium aesthetic** across all 39 pages
- ✅ **Comprehensive empty states** with helpful CTAs
- ✅ **Good error handling** in chat interfaces with graceful fallbacks
- ✅ **Live preview** in whitelabel and agent studio pages
- ✅ **Feature-rich** — MCP, swarm, observability, optimization, BYOK, templates, blueprints
- ✅ **Responsive design** with mobile breakpoints on all pages
- ✅ **Toast notifications** pattern used consistently
- ✅ **Confirmation dialogs** on destructive actions (delete, remove)

---

*Report generated by Tomothy, World Builder. All findings based on static analysis of HTML/JS source code.*
