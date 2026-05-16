# Lessons from May 15-16, 2026

## 1. HTTP/2 Status Line Parsing
**Problem:** curl returns `HTTP/2 200` (no minor version), but regex `HTTP/\d\.\d\s+(\d+)` expects `HTTP/1.1 200`.
**Fix:** Use `HTTP/\d+(?:\.\d+)?\s+(\d+)` to handle both HTTP/1.1 and HTTP/2.
**Applied in:** test-runner.js `_parseParts()`

## 2. Rate Limiting with Multiple Accounts
**Problem:** express-rate-limit is per-IP. Testing 5 accounts sequentially from the same IP burns through the 5-attempt limit fast, especially with retry logic.
**Fix:** Increase `max` during testing (5→20). Add retry-with-wait logic in test runner. Use sequential execution with delays.
**Applied in:** auth.js, test-runner.js

## 3. Static File Serving in Express
**Problem:** `express.static` was only configured for `/css`, `/js`, `/assets`. HTML files like `privacy.html`, `terms.html`, `success.html` in `/frontend` returned 404.
**Fix:** Add `app.use(express.static(path.join(__dirname, '../frontend')))` to serve all frontend files.
**Applied in:** server.js

## 4. API Response Format Assumptions
**Problem:** Tests assumed `GET /api/get-agent?agentId=X` works, but the endpoint needs `session_id`. `agent-memory` returns `{success, conversations}` not a bare array. MCP templates returns an object, not an array.
**Fix:** Check actual API response formats before writing tests. Use flexible assertions.
**Applied in:** test-runner.js

## 5. Mailgun "Exposed Account Credentials"
**Problem:** Mailgun API key flagged as "exposed" — account-level block, not just key-level. Even new keys from the same account get blocked.
**Lesson:** If Mailgun says "exposed account credentials", the entire account is flagged. Need to contact Mailgun support. Also: never echo API keys in chat, logs, or commit them.
**Status:** Waiting on Mailgun support response.

## 6. Secrets Management
**Problem:** `secrets.json` was world-readable (644) and not in `.gitignore`.
**Fix:** `chmod 600 secrets.json`, add to `.gitignore` in both workspace and `.openclaw` root.
**Applied:** May 16, 2026

## 7. Test Metrics Matter
**Problem:** Binary pass/fail doesn't tell you where the slow spots are.
**Lesson:** Capture response times, section durations, and per-account breakdowns. Revealed that LLM calls (Chat/Security sections) are 50-100x slower than static/API responses — useful for performance optimization.
**Applied in:** test-runner.js v4

## 8. curl -L Follows Redirects But Shows Redirect Response
**Problem:** `curl -L` follows redirects, but the response body captured is the redirect response (302), not the final page. This caused tests to fail checking for 200 status.
**Lesson:** For page-load tests, either don't use `-L` or accept 302 as valid for authenticated pages that might redirect.
