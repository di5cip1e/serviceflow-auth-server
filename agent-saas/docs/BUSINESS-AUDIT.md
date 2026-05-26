# M.ai.K.R Business Audit Report

**Date:** 2026-05-25  
**Scope:** Payment flow, auth system, business/profitability, infrastructure  
**Severity scale:** CRITICAL → HIGH → MEDIUM → LOW

---

## Section 1: CRITICAL (Revenue Blocked, Payments Broken)

### 1.1 🔴 Stripe Keys Hardcoded in Watchdog Script
- **File:** `/usr/local/bin/maikr-backend-watchdog.sh`
- **Issue:** Full `STRIPE_SECRET_KEY` (live key) and `STRIPE_WEBHOOK_SECRET` are plaintext in a shell script. This is a secret leak vector — anyone with read access to the server can exfiltrate production Stripe keys.
- **Impact:** Full compromise of Stripe account. An attacker can issue refunds, modify subscriptions, read customer PII.
- **Fix:** Read from `~/.openclaw/secrets.json` or environment variables, same as bootstrap.js does.

### 1.2 🔴 `emails.js` `sendEmail()` is a No-Op (Console Log Only)
- **File:** `backend/services/emails.js` — the `sendEmail()` function just `console.log()`s and returns `{success: true}` without actually sending.
- **Impact:** The `provisioning.js` welcome email calls `sendEmail()` from `emails.js` (via `require('./emails')`), NOT from `alerter.js`. This means **welcome emails with API keys are never actually delivered to customers**. Customers pay, get provisioned, but never receive their API key or dashboard link.
- **Fix:** `provisioning.js` line `const { sendEmail } = require('./emails')` must be changed to `const { sendEmail } = require('./alerter')`.

### 1.3 🔴 No Subscription Management (Cancel/Upgrade/Downgrade)
- **Issue:** There are zero API endpoints for subscription management. No cancel, upgrade, or downgrade flow exists in the backend.
- **Impact:** Customers who want to cancel must email support or just chargeback. Chargebacks incur $15-25 fees each from Stripe and can lead to Stripe account suspension at scale. No upgrade path means customers on Value ($44.99) cannot self-serve upgrade to Growth ($99) or Scale ($199) — leaving significant MRR on the table.
- **Fix:** Implement Stripe Customer Portal integration or build cancel/upgrade endpoints using Stripe Subscription API.

### 1.4 🔴 Webhook Idempotency Has a Race Condition
- **File:** `backend/routes/webhook.js`
- **Issue:** The event processing checks `if (existingEvent && existingEvent.status === 'completed')` but the INSERT and SELECT are not atomic. Under concurrent webhook deliveries (Stripe can send duplicates with different event IDs for the same session), two requests could both pass the "already processed" check simultaneously.
- **Impact:** Double provisioning — customer gets two agents, two API keys, potentially double-charged.
- **Fix:** Use a unique constraint on `stripe_event_id` (already the logical key) and use `INSERT OR IGNORE` + transaction wrapping. The `processCheckoutSession` function already checks for existing `stripe_session_id` in customers table, which provides a second layer, but the webhook_events table itself is not safe.

### 1.5 🔴 `processCheckoutSession` References `res` Without Scope
- **File:** `backend/routes/webhook.js`, line ~22
- **Issue:** Inside `processCheckoutSession()`, there's `return res.status(200).json(...)` but `res` is not passed to this function — it's only in scope for the route handler. This will throw a `ReferenceError` at runtime when the "no email" branch is hit.
- **Impact:** If a checkout session completes without a customer email, the webhook crashes instead of returning gracefully. The event is marked as failed, triggering retries that will also fail.

### 1.6 🔴 No CSRF Protection
- **Issue:** No CSRF tokens or SameSite cookie enforcement on state-changing POST routes (login, register, checkout). The session cookie has `sameSite: 'strict'` which helps, but there's no CSRF token on forms.
- **Impact:** Cross-site request forgery could trick logged-in users into performing actions (e.g., changing password, making purchases) without consent.
- **Fix:** Add `csurf` middleware or implement double-submit cookie pattern for all POST routes.

---

## Section 2: HIGH (Security Gaps, Missing Essential Features)

### 2.1 🟠 No Email Verification
- **Issue:** Users can register with any email address without verification. The `users` table has no `email_verified` column. No verification email is sent post-registration.
- **Impact:** Anyone can register with someone else's email, potentially intercepting account access. Also means the email list is unreliable for marketing.

### 2.2 🟠 API Key Auth Uses Prefix Match Only (Not Full Hash Verification)
- **File:** `backend/middleware/auth.js`
- **Issue:** `requireApiAuth` matches API keys by `key_prefix` (first 8 chars) and then trusts the match without verifying the full hash. The comment says "full hash check done at creation" but this is incorrect — the hash is never checked during API auth.
- **Impact:** If two API keys share the same 8-character prefix (collision), one key grants access to another's resources. With random 32-char keys, collision is unlikely but the design is fundamentally insecure. More critically, if the `api_keys` table is leaked, all keys are immediately usable.

### 2.3 🟠 Session Secret Falls Back to Hardcoded Default
- **File:** `backend/server.js`
- **Issue:** `secret: getSecret('SESSION_SECRET') || 'maikr-secret-change-in-prod'` — if `SESSION_SECRET` is not set, all sessions are signed with a publicly known string.
- **Impact:** Session forgery. An attacker can craft valid session cookies and impersonate any user. The `.env` file does not set `SESSION_SECRET`, and `bootstrap.js` only warns (doesn't exit) if it's missing.
- **Fix:** Add `SESSION_SECRET` to `REQUIRED_KEYS` in bootstrap.js and set a strong random value.

### 2.4 🟠 `NODE_ENV` Not Set — Session Cookies Not Marked Secure
- **File:** `backend/.env`
- **Issue:** `NODE_ENV` is not set in `.env`. The session config uses `secure: process.env.NODE_ENV === 'production'`. If NODE_ENV is not "production", cookies are sent over HTTP.
- **Impact:** Session cookies transmitted in plaintext on non-HTTPS connections, enabling session hijacking via MITM.
- **Fix:** Add `NODE_ENV=production` to `.env`.

### 2.5 🟠 Password Reset Token Not Hashed Consistently
- **File:** `backend/routes/auth.js`
- **Issue:** The reset token is stored as `bcrypt.hash(token, 10)` but bcrypt truncates input at 72 bytes. The token is `crypto.randomBytes(32).toString('hex')` = 64 hex chars = 32 bytes, so this is fine. However, the token is sent in the URL as raw hex and compared with `bcrypt.compare()` — this works but the token in the URL is the only secret. If the URL is logged (browser history, server logs, referrer headers), the account is compromised.
- **Impact:** Token leakage via referrer headers, browser history, or proxy logs.

### 2.6 🟠 No Rate Limiting on Checkout Endpoint
- **Issue:** The `/create-checkout-session` POST route has no rate limiting. The auth routes have `authLimiter` (20 req/15min) but checkout does not.
- **Impact:** An attacker could create thousands of Stripe checkout sessions, potentially triggering Stripe fraud detection and account review.

### 2.7 🟠 Credit System Allows Overdraft by Default
- **File:** `backend/services/creditManager.js`
- **Issue:** When `checkAgentLimits` returns `allowed: false`, the calling code in `swarm.js` or `chat.js` should block the request, but the `deductCredits` function performs an "overdraft deduction and warn" when balance is insufficient — it doesn't block.
- **Impact:** Agents can consume unlimited tokens/credits beyond their plan limits. A single agent could generate thousands of dollars in OpenRouter API costs before anyone notices.

### 2.8 🟠 Onboarding Emails Not Scheduled via Cron
- **File:** `backend/services/onboarding-scheduler.js`
- **Issue:** The scheduler script exists and has correct logic (day 1, 3, 7, 14 drip campaign), but there is no cron job to run it. The crontab only has the watchdog script.
- **Impact:** Zero onboarding emails are ever sent. Customers are left alone after payment, leading to confusion, support requests, and churn.

---

## Section 3: MEDIUM (Conversion Optimizations, Missing Flows)

### 3.1 🟡 No Free Tier or Freemium Model
- **Issue:** The pricing page shows 4 paid tiers ($44.99–$499/mo) with no free option. There's no free trial, no "starter" tier, no pay-as-you-go option.
- **Impact:** High barrier to entry. Potential customers who want to "try before they buy" have no path to experience the product. This dramatically reduces top-of-funnel conversion.

### 3.2 🟡 No Analytics Tracking Configured
- **File:** `frontend/analytics-config.json`
- **Issue:** Umami analytics is configured with `"enabled": false` and `site_id: "YOUR_SITE_ID_HERE"`.
- **Impact:** Zero visibility into user behavior, conversion funnels, drop-off points, or traffic sources. Flying blind on all growth metrics.

### 3.3 🟡 No Referral/Affiliate System
- **Issue:** No referral codes, affiliate links, or "invite a friend" features exist anywhere in the codebase.
- **Impact:** Missing a key growth lever for B2B SaaS. Competitors like Intercom, HubSpot, and others use referral programs for low-CAC customer acquisition.

### 3.4 🟡 No Demo or Trial Experience
- **Issue:** No demo agent, sandbox environment, or interactive trial exists. The build flow (build-step1 through build-step4) requires going through the full configuration before seeing anything.
- **Impact:** Prospects can't experience the product value before committing. This reduces conversion rates significantly.

### 3.5 🟡 No Social Proof on Landing Page (Real Data)
- **File:** `frontend/landing.html`
- **Issue:** The landing page has testimonials and stats sections, but they appear to be placeholder/lorem ipsum content (generic names, no real company names, round-number stats).
- **Impact:** Social proof only works when it's authentic. Fake or generic testimonials reduce trust rather than build it.

### 3.6 🟡 No Churn Prevention Flow
- **Issue:** No dunning emails (payment failed notifications), no "we miss you" re-engagement, no exit survey on cancellation.
- **Impact:** Involuntary churn from failed payments (estimated 20-40% of all churn in SaaS) goes unaddressed. No feedback loop to understand why customers leave.

### 3.7 🟡 No Pricing Anchors or Urgency Tactics
- **Issue:** The pricing page shows 4 tiers but lacks anchoring (e.g., "most teams choose Growth"), no annual discount, no limited-time offers, no "X customers signed up this week" social urgency.
- **Impact:** Reduced conversion from pricing page visitors.

### 3.8 🟡 Success Page Doesn't Verify Payment
- **File:** `frontend/success.html`
- **Issue:** The success page likely shows the success message based on URL parameters (`?session_id=...`) without actually verifying the payment with the backend.
- **Impact:** Users can bookmark or fabricate the success URL and access the dashboard without paying.

### 3.9 🟡 No Content Marketing / SEO Blog
- **Issue:** No blog, resource center, or content marketing pages exist.
- **Impact:** Zero organic search traffic potential. All customer acquisition must be paid or direct.

### 3.10 🟡 Settings Page Lacks Subscription Management
- **File:** `frontend/settings.html`
- **Issue:** The settings page has profile fields and a logout button but no subscription management (view current plan, cancel, update payment method, view invoices).
- **Impact:** Users who want to manage their subscription have no self-serve option, leading to support tickets or chargebacks.

---

## Section 4: LOW (Nice-to-Have Improvements)

### 4.1 🔵 No Multi-Language Support
- All UI is English-only. No i18n framework in place.

### 4.2 🔵 No Dark/Light Mode Toggle
- The UI is dark-only. Some users prefer light mode.

### 4.3 🔵 No Keyboard Shortcuts or Power User Features
- No keyboard navigation hints, no command palette, no quick actions.

### 4.4 🔵 No Export/Data Portability
- Users can't export their agent configuration, conversation history, or data in standard formats.

### 4.5 🔵 No Team/Multi-User Access
- No concept of team members, roles, or permissions. Each account is single-user.

### 4.6 🔵 No API Documentation Page
- No public API docs, no interactive API explorer (Swagger/OpenAPI), no code examples.

### 4.7 🔵 No Status Page
- No public status page (e.g., status.maikr.pro) for uptime transparency.

### 4.8 🔵 No GDPR/Privacy Compliance UI
- Privacy policy and terms exist as static pages, but no cookie consent banner, no data deletion request flow, no data export for GDPR.

### 4.9 🔵 Landing Page OG Image is a Relative Path
- **File:** `frontend/landing.html`
- `og:image` points to `https://maikr.pro/assets/maikr-banner.jpg` — if this image doesn't exist, social previews will be broken on Twitter/LinkedIn/Facebook.

### 4.10 🔵 No Automated Tests
- No test suite exists. The `test-runner.js` file exists but there are no actual test files. No CI/CD pipeline.

---

## Section 5: Step-by-Step Fix Guide

### Immediate (Do Today — Revenue Blocking)

1. **Fix welcome email delivery**
   - In `backend/services/provisioning.js`, change `require('./emails')` to `require('./alerter')`
   - Verify `RESEND_API_KEY` is set in `~/.openclaw/secrets.json`
   - Test by creating a test checkout session and confirming the email arrives

2. **Remove hardcoded Stripe keys from watchdog**
   - Rewrite `/usr/local/bin/maikr-backend-watchdog.sh` to source secrets from `~/.openclaw/secrets.json`
   - Rotate the exposed Stripe keys immediately via Stripe Dashboard (they are in a file that could be leaked)

3. **Set `SESSION_SECRET` and `NODE_ENV`**
   - Run: `openssl rand -hex 32` to generate a secret
   - Add to `~/.openclaw/secrets.json`: `"SESSION_SECRET": "<generated>"`
   - Add to `backend/.env`: `NODE_ENV=production`

4. **Fix webhook `res` reference bug**
   - In `backend/routes/webhook.js`, change `processCheckoutSession` to return an object instead of calling `res.status()`
   - Let the route handler function manage the response

### This Week (Security & Reliability)

5. **Add CSRF protection**
   - Install `csurf` or implement double-submit cookie pattern
   - Add CSRF token to all forms (login, register, checkout, settings)

6. **Fix API key authentication**
   - In `requireApiAuth`, after prefix match, verify the full key against `key_hash` using `bcrypt.compare()`
   - This prevents prefix collision attacks

7. **Add rate limiting to checkout**
   - Apply `authLimiter` or a dedicated limiter to the `/create-checkout-session` route

8. **Enable webhook idempotency**
   - Add `UNIQUE(stripe_event_id)` constraint to `webhook_events` table
   - Use `INSERT OR IGNORE` for event recording
   - Wrap processing in a database transaction

9. **Schedule onboarding emails**
   - Add to crontab: `0 10 * * * cd /root/.openclaw/workspace/agent-saas/backend && node services/onboarding-scheduler.js >> /tmp/onboarding-emails.log 2>&1`

### This Month (Growth & Conversion)

10. **Set up analytics**
    - Create a free Umami Cloud account
    - Update `frontend/analytics-config.json` with real site_id and `"enabled": true`
    - Add tracking events to key flows: signup, checkout start, checkout complete, first chat

11. **Build subscription management**
    - Implement Stripe Customer Portal (simplest) or build custom cancel/upgrade endpoints
    - Add subscription info to settings page
    - Add dunning email sequence for failed payments

12. **Add email verification**
    - Add `email_verified` and `email_verification_token` columns to `users` table
    - Send verification email on registration (using alerter.js)
    - Restrict dashboard access until verified

13. **Create a free tier or trial**
    - Add a "Starter" plan with limited tokens (e.g., 5,000 tokens, 10 outcome credits)
    - Set `monthly_cost_cents: 0` and enforce limits in `checkAgentLimits`
    - Add upgrade prompts in the dashboard when limits are approached

---

## Section 6: Profitability Roadmap

### Phase 1: Stop the Bleeding (Week 1-2)
**Goal:** Ensure every paying customer actually gets their agent and can use it.

| Priority | Action | Expected Impact |
|----------|--------|-----------------|
| P0 | Fix welcome email (use alerter.js) | Customers can actually access their agent |
| P0 | Rotate exposed Stripe keys | Prevent financial compromise |
| P0 | Set SESSION_SECRET + NODE_ENV | Prevent session hijacking |
| P0 | Fix webhook res reference | Prevent silent provisioning failures |
| P1 | Add rate limiting to checkout | Prevent abuse/fraud flags |
| P1 | Enable webhook idempotency | Prevent double provisioning |

**Estimated revenue recovery:** Every customer who paid but never got their agent is a support ticket or chargeback waiting to happen. If even 5 customers hit this, that's ~$500-2,500 in saved chargebacks + preserved Stripe account health.

### Phase 2: Optimize Conversion (Week 3-6)
**Goal:** Convert more visitors into paying customers.

| Priority | Action | Expected Impact |
|----------|--------|-----------------|
| P1 | Set up Umami analytics | Know your funnel, find drop-off points |
| P1 | Add free tier/trial | 3-5x increase in signup conversion |
| P1 | Add email verification | Clean email list, reduce fake accounts |
| P2 | Create demo/sandbox experience | Reduce time-to-value for prospects |
| P2 | Add social proof (real testimonials) | Increase landing page conversion 10-30% |
| P2 | Add pricing anchors + annual discount | Increase AOV (average order value) |

**Estimated revenue impact:** A free tier typically converts 2-5% to paid. If you get 100 free signups/month, that's 2-5 additional paying customers = $90-250 MRR. Annual billing (with 20% discount) improves cash flow and reduces churn.

### Phase 3: Retain & Expand (Month 2-3)
**Goal:** Keep customers longer and increase revenue per customer.

| Priority | Action | Expected Impact |
|----------|--------|-----------------|
| P1 | Build subscription management | Reduce chargebacks, enable self-serve upgrades |
| P1 | Enable onboarding email drip | Reduce early churn by 15-25% |
| P2 | Add dunning emails | Recover 20-40% of failed payments |
| P2 | Add upgrade prompts in dashboard | Increase MRR through expansion revenue |
| P2 | Add spending caps + credit packs | Prevent cost overruns, create add-on revenue |
| P3 | Build referral program | Low-CAC customer acquisition channel |

**Estimated revenue impact:** Onboarding emails alone can reduce churn by 15-25%. Dunning emails recover ~30% of failed payments. If you have 50 customers at $100/mo average, reducing churn by 20% = +$1,000 MRR retained.

### Phase 4: Scale (Month 3-6)
**Goal:** Build compounding growth engines.

| Priority | Action | Expected Impact |
|----------|--------|-----------------|
| P2 | Launch template marketplace | New revenue stream + stickiness |
| P2 | Add team/multi-user access | Higher ACV, enterprise readiness |
| P3 | Build affiliate/referral system | Viral growth loop |
| P3 | Add content marketing / SEO | Organic traffic pipeline |
| P3 | Public API + developer docs | Ecosystem growth, integration revenue |
| P3 | White-label offering | Enterprise tier at 2-5x price point |

**Projected MRR trajectory (conservative):**
- Current: Assume 20 paying customers × $100 avg = **$2,000 MRR**
- After Phase 1: Fix leaks → **$2,500 MRR** (recover failed provisions)
- After Phase 2: Free tier + conversion optimization → **$5,000-8,000 MRR** (2-3 months)
- After Phase 3: Retention + expansion → **$8,000-12,000 MRR** (4-6 months)
- After Phase 4: Scale channels → **$15,000-25,000 MRR** (6-12 months)

---

## Infrastructure Summary

| Component | Status | Notes |
|-----------|--------|-------|
| PM2 | ✅ Running | `maikr-backend` online, 66 restarts (concerning — indicates crashes) |
| Disk | ✅ 63% used | 36GB available — healthy |
| Memory | ✅ 6GB available | 7.9GB total, 1.8GB used — healthy |
| Nginx | ✅ Configured | SSL via Let's Encrypt, security headers present, HSTS enabled |
| Watchdog | ✅ Running | 5-min interval cron — but has hardcoded secrets (CRITICAL) |
| Backups | ❌ None | No database backup strategy. `maikr.db` is a single SQLite file with no replication. |
| Monitoring | ❌ None | No uptime monitoring (no Pingdom, UptimeRobot, etc.) |
| CI/CD | ❌ None | No automated testing or deployment pipeline |

### Infrastructure Recommendations
1. **Add database backups:** `sqlite3 maikr.db ".backup 'maikr-$(date +%Y%m%d).db'"` via daily cron, sync to S3
2. **Add uptime monitoring:** Free tier of UptimeRobot or Better Uptime
3. **Investigate PM2 restarts:** 66 restarts in 15 minutes of uptime indicates a crash loop. Check logs: `pm2 logs maikr-backend`
4. **Add log rotation:** PM2 logs and watchdog logs will fill disk over time
