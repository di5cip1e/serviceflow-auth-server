# M.ai.K.R — Full System Audit Plan

> Created: 2026-05-21 08:22 UTC
> Requested by: Derek

## Audit Teams

### Agent 1: Frontend UI/UX Audit
**Focus:** All HTML pages, CSS consistency, mobile responsiveness, accessibility
**Pages:** All 14 frontend HTML files
**Check:** viewport, media queries, color contrast, WCAG, broken links, console errors

### Agent 2: Backend API Audit
**Focus:** All API routes, error handling, security, rate limiting
**Routes:** All files in backend/routes/
**Check:** auth middleware, input validation, error responses, SQL injection, rate limits

### Agent 3: Database Audit
**Focus:** Schema design, indexes, migrations, data integrity
**Files:** database.js, all route files that query DB
**Check:** missing indexes, unused tables, data types, foreign keys, migration consistency

### Agent 4: Security Audit
**Focus:** Secrets management, auth flow, session handling, XSS, CSRF, injection
**Files:** auth.js, server.js, secrets.json config, all routes
**Check:** password hashing, session config, CORS, CSP, input sanitization

### Agent 5: Performance Audit
**Focus:** Page load times, API response times, bundle size, caching
**Files:** All frontend pages, server.js, nginx config
**Check:** static asset caching, DB query efficiency, response headers, compression

### Agent 6: Feature Completeness Audit
**Focus:** Do all features work end-to-end? Missing error states? Broken flows?
**Scope:** Onboarding wizard, chat, leads, analytics, channels, MCP, optimization
**Check:** Happy path + error path for each major feature

## Output
Each agent saves findings to /root/.openclaw/workspace/agent-saas/audit/[agent-name].md
Final report compiled at /root/.openclaw/workspace/agent-saas/audit/REPORT.md
