# HEARTBEAT.md

# Heartbeat Events

## Regular Heartbeat (every 2 hours)
**Actual interval:** OpenClaw runs `heartbeat-90min` every 2 hours (the "90min" label is just a name, the actual schedule is "every 2h"). Updated 2026-05-09.
Check HEARTBEAT.md. If empty, reply HEARTBEAT_OK. Otherwise follow tasks below.

## MORNING_MEETING_PREP (Daily at ~7am CST / 1pm UTC)
Rotate through these tasks (do 1 per heartbeat, cycle through):

### 1. CLAWHUB_SKILLS_SCAN
- Browse clawhub.com for new skills/tools
- Find 3 skills that could help the project or make money
- Note: name, what it does, why it's useful
- Save to memory/clawhub-ideas.md for 8am meeting

### 2. MONEY_MAKING_IDEAS
- Think of 3 autonomous tasks I could do to generate income
- Examples: arbitrage, content creation, data analysis, automation services
- Consider: skills I have, market opportunities, time requirements
- Save to memory/money-ideas.md for 8am meeting

### 3. SOCIAL_SCAN
- Browse Reddit (r/AI, r/automation, r/sidehustle), Discord AI communities
- Find 3 interesting topics, trends, or discussions
- Note: topic, why Derek should care, link if available
- Save to memory/social-topics.md for 8am meeting

## DAILY_LESSONS_REVIEW
Trigger: Every 24 hours

1. Read all memory/YYYY-MM-DD.md files from the last 24 hours
2. Identify top 20 lessons learned
3. Write to memory/lessons_FROM_YYYY-MM-DD.md
4. Focus on: bug fixes, architectural decisions, agent performance, workflow improvements
5. Keep it selective — quality over quantity

## MEMORY_DREAM_TRANSFER
Trigger: 10pm CST (4am UTC)

1. Review past week's short-term memory (memory/YYYY-MM-DD.md)
2. Review previous week's memory
3. Extract:
   - Goals achieved vs. missed
   - Key decisions and outcomes
   - Lessons that matter for next week's goals
   - Anything that makes me a better assistant
4. Update MEMORY.md with distilled insights
5. Keep only what truly counts — don't muddy context with trivia
6. Focus on: helping Derek make money, learn, grow

## CLAWHUB STATS CHECK
Trigger: Every heartbeat (every 50 min)

Check stats for published skills:
- `clawhub inspect n8n-workflow-builder`
- `clawhub inspect client-outreach-automator`
- `clawhub inspect business-doc-generator`
- `clawhub inspect meeting-intelligence`
- `clawhub inspect director-content-repurposer`

Note: downloads, stars, and any new reviews. Update memory/clawhub-stats.md with trends.

---

## AVANT GARDE AUTOMATION PROJECT
Trigger: Every 20 minutes

Progress through phases (check /avant-garde/docs/ for completed work):

### Phase 1: Research (COMPLETE)
- ✅ Market research + competitor pricing
- ✅ Service offering document (3 tiers: $497/$1,497/$3,997)
- Status: Done

### Phase 2: Workflow Templates (COMPLETE)
- Documented 3 automation templates (Lead Capture, Social Auto-poster, Invoice Pipeline)
- Status: Done

### Phase 3: Website/Portfolio (COMPLETE)
- Landing page live at /avant-garde/website/index.html
- Server running at http://187.77.31.252:8080/

### Phase 4: Client Outreach (COMPLETE)
- Platforms research: /avant-garde/outreach/platforms.md
- Templates: /avant-garde/outreach/templates.md

### Phase 5: First Client
- If Phase 4 complete → Draft cold outreach messages
- Goal: Secure first paying client

Each heartbeat checks phase status and advances to next if ready.

---

## Self-Improving Check

- Read `./skills/self-improving/heartbeat-rules.md`
- Use `~/self-improving/heartbeat-state.md` for last-run markers and action notes
- If no file inside `~/self-improving/` changed since the last reviewed change, return `HEARTBEAT_OK`

---

## Proactivity Check

- Read ~/proactivity/heartbeat.md
- Re-check active blockers, promised follow-ups, stale work, and missing decisions
- Ask what useful check-in or next move would help right now
- Message the user only when something changed or needs a decision
- Update ~/proactivity/session-state.md after meaningful follow-through
