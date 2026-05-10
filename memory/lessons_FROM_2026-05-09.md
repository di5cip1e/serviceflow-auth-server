# Lessons from May 9, 2026

## Date: 2026-05-09
**Review period:** May 8 04:30 UTC → May 9 04:29 UTC

---

## Key Lesson #1: Ollama Running ≠ Ollama Ready

**What happened:** Ollama daemon was running (port 11434 responding "Ollama is running"), but `api/tags` returned `{"models":[]}` — no models installed. First API call silently failed.

**Lesson:** A running Ollama daemon means nothing without pulled models. Always check `ollama list` or `curl /api/tags` before assuming Ollama is ready.

**Action:** Before integrating Ollama, always run `ollama pull <model>` first.

---

## Key Lesson #2: OpenRouter URL ≠ OpenAI URL

**What happened:** Used `api.openai.com/v1/chat/completions` for OpenRouter — got 401 "Incorrect API key". The key was fine, the URL was wrong.

**Fix:** OpenRouter endpoint = `https://openrouter.ai/api/v1/chat/completions`
Also: `max_tokens` minimum is 16 (not 1-10).

---

## Key Lesson #3: Stripe Has Two IDs — Event vs Session

**What happened:** `provisionCustomer()` stored `event.id` (Stripe event ID) as `stripe_session_id`. Success page passed the real Stripe checkout session ID → DB lookup always failed → "Agent being created" forever.

**Lesson:** Stripe has multiple ID types. Success page uses checkout.session.id. `event.id` is for webhook verification only.

---

## Key Lesson #4: Error Handling Prevents Silent Failure

**What happened:** `startAgentSession()` was called without a .catch() in provisioning.js. If it threw, the entire provisioning promise rejected and no welcome email sent.

**Fix:** Always `.catch(err => { console.warn(...); return fallbackResult; })` around external integrations.

---

## Key Lesson #5: Environment Variables vs Secrets — Different Sources

**What happened:** OpenRouter API key was not in backend/.env (only Stripe keys there). Router defaulted to secrets.json → worked.

**Lesson:** Not all secrets live in the same place. Check .env AND secrets.json. The router now tries .env first, falls back to secrets.json.

---

## Key Lesson #6: Heartbeat Interval — Always Verify with `openclaw cron list`

**What happened:** HEARTBEAT.md said "every 50 min", then I updated to "every 90 min" — both wrong. Actual schedule: "every 2h".

**Lesson:** Runtime truth lives in `openclaw cron list`, not in documentation files. Always verify.

---

## Key Lesson #7: Git Push Timeouts — Background + Wait

**What happened:** `git push` over HTTPS timed out (SIGTERM) every time when run directly. Background `&` + 10s sleep works.

**Fix for scripts:** `git push & sleep 15 && jobs` — background push completes while shell doesn't wait on it.

---

## Key Lesson #8: MEMORY.md Compounding — Weekly Archive Instead

**What happened:** MEMORY.md grew from 7KB to 85KB over 9 weeks of adding weekly entries.

**Lesson:** Archive old weekly entries to memory/archive/ instead of compounding. Target: keep MEMORY.md under 50KB forever. Archive at the end of each week's consolidation.
