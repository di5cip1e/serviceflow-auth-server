# HEARTBEAT.md

## Regular Heartbeat (every 2 hours)
Check HEARTBEAT.md. If empty or nothing needs attention, reply HEARTBEAT_OK.

## CLAWHUB STATS CHECK
Trigger: Every heartbeat

Check stats for published skills:
- `clawhub inspect n8n-workflow-builder`
- `clawhub inspect client-outreach-automator`
- `clawhub inspect business-doc-generator`
- `clawhub inspect meeting-intelligence`
- `clawhub inspect director-content-repurposer`

Note: downloads, stars, and any new reviews. Update memory/clawhub-stats.md with trends.

## Self-Improving Check
- Read `./skills/self-improving/heartbeat-rules.md`
- Use `~/self-improving/heartbeat-state.md` for last-run markers and action notes
- If no file inside `~/self-improving/` changed since the last reviewed change, return `HEARTBEAT_OK`

## Proactivity Check
- Read ~/proactivity/heartbeat.md
- Re-check active blockers, promised follow-ups, stale work, and missing decisions
- Ask what useful check-in or next move would help right now
- Message the user only when something changed or needs a decision
- Update ~/proactivity/session-state.md after meaningful follow-through
