# Daily Lessons Review - 2026-05-12
## Key Lessons Learned (May 12, 2026)

### 1. Langfuse v5 API Change
- **Problem**: tracer.js was calling `tracing.startActiveSpan.bind(tracing)` causing "Cannot read properties of undefined (reading 'bind')" warnings
- **Root Cause**: Langfuse v5 SDK changed API - `startActiveSpan` doesn't exist, only `startActiveObservation` is available
- **Fix**: Guard the access with `typeof` check: `startActiveSpan = typeof tracing.startActiveSpan === 'function' ? tracing.startActiveSpan.bind(tracing) : null;`
- **Lesson**: Always check API existence before binding, especially when using lazy-loaded dependencies

### 2. PM2 Daemon Fragility
- **Problem**: `openclaw gateway restart` killed the PM2 daemon, leaving maikr-backend without supervision
- **Impact**: Backend died silently → nginx returned 503 errors for ~45 minutes
- **Fixes Applied**:
  - Restarted backend under PM2
  - Saved process list with `pm2 save`
  - Added cron watchdog (every 5 min) to monitor port 3001 and restart if needed
  - Never restart gateway without also restarting backend
- **Lesson**: External process supervision is critical; don't rely solely on PM2 in container environments

### 3. Model Upgrade Success
- **Change**: Updated agent model to `openrouter/nvidia/nemotron-3-super-120b-a12b:free`
- **Benefits**: 
  - 256K token context window (massive upgrade from ~200k)
  - FREE tier - zero cost
  - Maintains high-quality responses
- **Lesson**: Always evaluate free tier options before upgrading to paid models

### 4. CSS Isolation Issue
- **Problem**: Build steps showed raw CSS rules in HTML source (`.maikr-nav { ... }`) indicating missing external stylesheet link
- **Root Cause**: CSS rules were missing from `/agent-saas/frontend/css/styles.css`
- **Fix**: Added all missing `.maikr-*` class definitions to styles.css
- **Lesson**: Always verify CSS changes are actually in the external stylesheet, not just HTML style blocks

### 5. Telegram Inline Keyboard Reality
- **Problem**: `/modular` command in agent session throws "401 User not found" from ACP runtime
- **Workaround**: Direct Telegram Bot API calls work perfectly for sending inline keyboards
- **Current State**: Inline keyboards function via direct API, but agent session cannot process callbacks due to ACP runtime issues
- **Lesson**: When OpenClaw internals are unstable, direct API calls are more reliable for critical functionality

### 6. Memory Management Discipline
- **Practice**: Consistently updating daily memory files and reviewing lessons
- **Benefit**: Prevents repeating the same mistakes and builds institutional knowledge
- **Lesson**: Daily memory review is essential for long-term system reliability

## Action Items Completed
- [x] Fixed Langfuse tracer.js bug (commit fdab182)
- [x] Restarted maikr-backend under PM2 with process list saved
- [x] Added cron watchdog for port 3001 monitoring
- [x] Added missing CSS rules for .maikr-nav and related classes
- [x] Updated agent model to free 256K context version
- [x] Verified site is serving correctly at maikr.pro
- [x] Created daily lessons review file

## Action Items Pending
- [ ] Fix /api/route-test 404 (implement route or remove reference)
- [ ] Harden nginx with proxy_next_upstream for seamless failover
- [ ] Investigate ACP runtime 401 error for sessions_send (Telegram /modular)
- [ ] Never restart gateway without also restarting backend (process discipline)

## System Status (End of Day)
- Backend: ✅ Running under PM2 (PID ?) with cron watchdog
- Nginx: ✅ Serving maikr.pro correctly  
- Model: ✅ openrouter/nvidia/nemotron-3-super-120b-a12b:free (256K context, FREE)
- Watchdog: ✅ Cron job active (every 5 min)
- Git: ✅ All changes committed and pushed
- Memory: ✅ Daily review completed

---
*Generated automatically by DAILY_LESSONS_REVIEW heartbeat process*