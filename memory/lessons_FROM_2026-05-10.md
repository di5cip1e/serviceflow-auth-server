# Lessons from May 10, 2026

## Date: 2026-05-10
**Review period:** May 10 04:29 UTC → previous review (May 9 04:29 UTC)

---

## Key Lesson #1: Subagent Model Restrictions — Always Check Allowed Models

**What happened:** Spawned 9 subagents with `openrouter/minimax/minimax-m2.7` — all rejected with "model not allowed." Had to respawn all 9 with `openrouter/auto`.

**Lesson:** Subagent sessions have a separate model allowlist from the main session. The main session runs minimax-m2.7 but subagents may not be permitted to use it. Always use `openrouter/auto` for subagents unless you've verified the model is explicitly allowed for subagent use.

**Fix:** When spawning subagents via `sessions_spawn`, always specify `model: "openrouter/auto"` as the default unless confirmed otherwise.

---

## Key Lesson #2: Sessions Spawn Attachments Must Be Enabled

**What happened:** Tried to attach SOUL.md files to subagent spawns — got `attachments are disabled for sessions_spawn`. Had to remove attachments entirely.

**Lesson:** `sessions_spawn.attachments.enabled` must be set in the OpenClaw config for attachments to work. Since Derek's config doesn't have it, had to spawn without attachments. Subagents can still read their own SOUL.md from their agent directory at `/root/sub_agent/{agent}/SOUL.md`.

**Fix:** Don't rely on attachments for subagent context. Let them read their own files from the filesystem, or provide context inline in the task prompt.

---

## Key Lesson #3: Backend Crash Without Watchdog = Extended Outage

**What happened:** maikr-backend died at ~23:22 UTC. 8 of 9 audit agents all hit 502 simultaneously. No alert, no recovery — just silent failure until someone noticed.

**Root cause:** No PM2 watchdog, no systemd service, no health-check endpoint. Process dead = site down until manual intervention.

**Fix (already applied):** PM2 now on systemd with `pm2-startup` + `pm2 save`. Systemd resurrects processes on reboot. Health endpoint added at `/health` for nginx upstream detection.

---

## Key Lesson #4: SSL Cert Was for Wrong Domain (forgeai.sbs)

**What happened:** maikr.pro SSL cert was issued for `forgeai.sbs` — HTTPS worked but showed wrong cert to browsers. External HTTPS connections failed with cert mismatch.

**Lesson:** When setting up nginx for a new domain, always verify the SSL cert is for the correct domain. Run `openssl s_client -connect domain:443` and check `subject=` before declaring HTTPS working.

**Fix (applied):** Ran certbot with webroot method: `certbot certonly --webroot -w /tmp/letsencrypt -d maikr.pro`. Non-interactive with `--non-interactive --agree-tos --email`.

---

## Key Lesson #5: Nginx `error_page` + `internal` Blocks Direct Access

**What happened:** Pixel created `/error.html` as an internal error page. When testing with `curl https://maikr.pro/error.html`, it returned 404. This was expected behavior but confusing for verification.

**Lesson:** The `internal` nginx directive prevents direct browser access to a location. The error page only renders when nginx triggers the `error_page` directive on an actual 502/503. To verify the page exists: `curl -s https://maikr.pro/` after stopping the upstream — or check the file directly on disk.

---

## Key Lesson #6: Nginx `add_header` Inheritance — `always` Directive Required

**What happened:** When adding security headers to nginx, some `add_header` directives only apply to successful responses, not error responses (502/503 etc.), unless the `always` parameter is used.

**Fix:** When adding security headers to nginx, use `add_header X-Header value always;` — the `always` parameter ensures headers are included on all responses including error pages.

---

## Key Lesson #7: Team Audits Need Staggered Spawn Timing

**What happened:** All 9 agents spawned simultaneously, all tried to hit maikr.pro at once. The backend was already crashing when they started, so all 9 hit the 502 simultaneously with no healthy agent to contrast against.

**Lesson:** For critical audits, spawn agents in two batches: first verify the site is up with a quick probe, then spawn the rest. This way at least one agent gets a clean run and can provide a baseline.

---

## Key Lesson #8: subagent_announce Delivery vs Completion Events

**What happened:** Subagents completed their runs and sent `subagent_announce` events. The system note warned: "If a child completion event arrives AFTER your final answer, reply ONLY with NO_REPLY."

**Lesson:** The main session can receive completion events for subagents that were spawned earlier. If I've already given Derek a final summary of all reports, subsequent completion events should be handled silently (NO_REPLY) to avoid duplicating output. Track which session keys have been reported vs which are still pending.

**Fix:** Track expected vs received subagent completions. Only send a combined report when ALL expected completions have arrived. Use NO_REPLY for late arrivals after the final report has been sent.
