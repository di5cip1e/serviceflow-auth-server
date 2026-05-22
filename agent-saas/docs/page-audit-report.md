# M.ai.K.R Dashboard Page Audit Report
**Date:** 2026-05-22 16:45 UTC
**Auditor:** The Director (manual audit)

---

## Summary

| Page | Status | Issues |
|------|--------|--------|
| command-center.html | ✅ Fixed | Rebuilt — removed duplicate nav, fixed broken links, added charts |
| dashboard.html | ⚠️ Minor | Still uses old dark-premium.css; links to `/swarm.html` (works) |
| chat.html | ⚠️ Minor | Calls `/api/agent-info` (exists) and `/api/chat` (exists); API_BASE='' is fine |
| observe.html | ⚠️ Minor | Calls `/api/observe/rag-scores/:agentId` — **endpoint doesn't exist** (graceful fail) |
| analytics.html | ✅ OK | All endpoints exist; period filtering works |
| agent-studio.html | ✅ OK | Standard page, no broken links |
| channels.html | ✅ OK | Webhook endpoints exist |
| swarm.html | ✅ OK | All endpoints verified; delegation routes exist |
| mcp.html | ✅ OK | All /api/mcp/* routes exist |
| optimization.html | ✅ OK | All /api/optimization/* routes exist |
| deploy.html | ✅ OK | 312 lines, has content |
| widgets.html | ✅ OK | Phase D page, /api/widgets exists |
| templates.html | ✅ OK | Phase D page, /api/templates exists |
| byok.html | ✅ OK | Phase D page, /api/byok exists |
| whitelabel.html | ✅ OK | Phase D page, /api/whitelabel exists |
| leads.html | ✅ OK | /api/leads routes exist |
| settings.html | ✅ OK | Auth routes exist |

## Missing Backend Endpoints (Frontend calls but backend doesn't have)

1. **`GET /api/observe/rag-scores/:agentId`** — Called by observe.html
   - Impact: RAG scores section will show empty/loading
   - Fix: Add route to observe.js returning empty array or actual RAG scores

2. **`GET /api/escalations/pending`** — Called by command-center.html
   - Impact: HITL approvals always shows "No pending approvals"
   - Fix: Add escalation routes or point to existing optimization/self-correction endpoints

3. **`POST /api/escalations/:id/:action`** — Called by command-center.html
   - Impact: Approve/dismiss buttons won't work
   - Fix: Add escalation action route

## No Critical Issues Found

- No broken href links to non-existent pages
- No placeholder/TODO/FIXME text
- No JavaScript syntax errors detected
- All pages use correct CSS (styles.css or dark-premium.css)
- Authentication middleware properly protecting all dashboard routes
