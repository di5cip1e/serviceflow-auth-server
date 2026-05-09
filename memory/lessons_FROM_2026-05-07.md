# Lessons — May 4-7, 2026

## 1. Mailgun Domain Format: Derek Knows His DNS Better Than Assumptions
- Assumed the domain was `mg.aginstitute.tech` (standard Mailgun subdomain pattern)
- Derek corrected: the actual sending domain is `aginstitute.tech` directly (no `mg.` prefix)
- Lesson: Always confirm exact domain format with the customer; don't apply standard patterns without verification

## 2. Sandbox vs Production Domain — DNS Verification Gates API Access
- The Mailgun sandbox domain worked immediately with the API key
- The production domain (aginstitute.tech) returned 401 Forbidden until DNS was verified in Mailgun dashboard
- When DNS was verified and correct API key provided, live domain worked (200 Queued)
- Lesson: When an API key returns 401 on a new domain, check if DNS verification is pending before assuming the key is wrong

## 3. Multiple API Keys — The First One Was Right, The New Ones Were Wrong
- Derek provided multiple API keys over time: `94b6d95c...`, `f3329607...`, `428c42a0-eece5505`
- The original key (`f3329607...`) was actually correct — new keys were not needed
- Attempting to use new keys caused confusion and delays
- Lesson: When something isn't working, verify the existing key is actually being used correctly before looking for replacements

## 4. Stripe Webhook Secret ≠ Publishable Key — Different Credentials for Different Uses
- Derek already had a webhook signing key (cf7493ef...) stored from earlier
- Still needed separate publishable key (pk_live_/pk_test_) and secret key (sk_live_/sk_test_)
- Lesson: Stripe has distinct credentials for different purposes; having one doesn't mean you have all

## 5. Audit Hook: fs.watch Survives Session Deaths If Run as Persistent Background Process
- The audit hook was started with nohup and persistent (PID 4063924)
- Session compaction/recycling kills the shell but the background process continues
- Re-verified alive at 04:20 UTC next day with PID 343554 (same process respawned via pgrep check)
- Lesson: Use nohup + background for any persistent monitoring that must survive session boundaries

## 6. Escalation Pipeline End-to-End Test Requires Forcing the Token
- AI refusals don't emit [ESCALATE:] tokens — test prompts that refuse to comply
- To test the full pipeline, send a prompt that explicitly tells the AI to include the token (controlled test only)
- Confirmed: token detection → DB row insert → alerter called → delivery attempted
- Lesson: Plan for AI refusals in test scenarios; have a controlled test method that forces the escalation path

## 7. Email More Reliable Than SMS for Transactional Alerts
- Twilio SMS consistently returned error 30032 (carrier blocking, undelivered)
- Mailgun email delivered successfully (200 Queued) once domain and DNS were correct
- Derek pushed email forward as the primary alerting channel
- Lesson: When SMS carrier routing is problematic, prioritize email; it's more reliable for transactional alerts anyway

## 8. Memory Consolidation — Weekly Reviews Keep Context Actionable
- Consolidated April 29 – May 7 into MEMORY.md; distilled 8 key lessons
- Without consolidation, context window fills with stale project history
- New sessions can get up to speed quickly from MEMORY.md without re-reading all daily logs
- Lesson: Keep MEMORY.md updated; it is the single source of truth for project state

## 9. Model Switch — Confirm Active Model With session_status After Config Change
- Changed model via openclaw config set; Derek confirmed with "Status" message
- Session_status showed model had switched successfully
- Lesson: After any model or config change, do a quick session_status check to confirm it took effect

## 10. Stripe Live Keys — Test Cards Rejected on Live Account
- Using Stripe test card `4242 4242 4242 4242` on a live (sk_live_) account returns "known test card" rejection
- Stripe live accounts only accept real cards; test cards only work on test mode accounts
- Lesson: To test live Stripe flow end-to-end without spending real money: use a small $1 charge + immediate refund, or add a test customer in Stripe Dashboard

## 11. Secrets.json Property Name Fix — openai_api_key vs OPENAI_API_KEY
- server.js was reading `secrets.openai_api_key` but the code checked `if (!process.env.OPENAI_API_KEY)` before assigning
- If .env already had a value (even wrong/stale), the secrets.json value was skipped
- Lesson: When loading secrets, always use conditional assignment with !process.env.X checks, and ensure property names in secrets.json match what the code expects

## 12. Database Schema Changes Need New Column Before New Code Can Use It
- Webhook code tried to store `stripe_session_id` but the column didn't exist yet → crashes
- Fix: Add column first (ALTER TABLE ADD COLUMN), then deploy code that uses it
- Lesson: Schema changes must precede code changes that depend on them

## 13. Stripe Session ID — Three Places It Must Be Connected
- Checkout creates session → webhook receives event with session ID → must store in customers AND agents tables
- Success page looks up by stripe_session_id → needs JOIN across both tables
- Lesson: In a multi-table flow, map every field to every table that needs it before going live

## 14. PM2 Beats Nohup for Long-Running Node Processes
- PM2 keeps node processes alive reliably across session boundaries
- Nohup was being killed repeatedly; PM2 managed process survived cleanly
- Lesson: For any production Node.js service, use PM2 from the start