---
name: director
description: Operating manual and procedural skill for the Director (the agent that runs the M.ai.K.R platform). Contains triggers, alerting formats, tests, and safe defaults.
---

# Director Skill

This skill documents the Director role: what it does, how it integrates with the app (M.ai.K.R), and procedural checks/tests for reliability.

## When to use
- Dashboard save actions (updates to system prompt, alert settings, appearance)
- Heartbeat tasks (HEARTBEAT.md) and DAILY_LESSONS_REVIEW
- Chat messages that produce escalation tokens ([ESCALATE:...])
- Manual audit requests from the owner (Derek)

## Escalation Codes (canonical)
- `[ESCALATE:MAJOR_DEAL]` → Means a high-value/opportunity conversation is in progress
- `[ESCALATE:ANGRY_CUSTOMER]` → Aggressive or frustrated language detected
- `[ESCALATE:HUMAN_NEEDED]` → User explicitly asked for a human
- `[ESCALATE:COMPLAINT]` → Legal or complaint-level language (threats to leave review, regulatory mention)

Behavior when escalation detected:
1. AI should include the escalation token in its reply (so the backend can parse it). Example: "I understand — I'll escalate this. [ESCALATE:ANGRY_CUSTOMER]"
2. Backend logs an entry to `conversations` with prefix `[ALERT:TYPE]` and timestamp.
3. If alerts are enabled and not within Do-Not-Disturb, the system attempts delivery via configured provider (email/SMS).

## Storage locations
- Agent settings & alert_settings: `agents` table column `alert_settings` (JSON)
- Secrets (provider keys): `~/.openclaw/secrets.json` (DO NOT copy to memory or public files)
- Memory / audit trail: `memory/YYYY-MM-DD.md` (append-only for identity/skill edits)

## How the prompt is generated
1. Dashboard settings (businessDescription, businessUrl, primaryFunction, responseStyle, knowledgeLevel, responseLength, greetingMessage) feed `generateSystemPrompt()` on the frontend.
2. The frontend stores the auto-generated prompt to `agents.system_prompt` via `/api/update-agent`.
3. The backend uses `system_prompt` as the system message for AI calls.

## Tests & Examples
### Health check (curl)
```
curl -s -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test-agent-123","message":"Health check: say hello and summarize escalation rules.","model":"openrouter/openai/gpt-5-mini"}'
```

### Escalation simulation
```
curl -s -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test-agent-123","message":"I am furious; your service is terrible and I want a refund now!!!"}'
```
Expect the AI to reply with `[ESCALATE:ANGRY_CUSTOMER]` and the backend to insert a conversation row `[ALERT: ANGRY_CUSTOMER]`.

### DB check
```
sqlite3 /root/.openclaw/workspace/agent-saas/backend/agents.db "SELECT id, alert_settings FROM agents WHERE id='test-agent-123';"
```

## Safety & Privacy
- Never store credentials or secrets in MEMORY.md or any public file.
- Alert delivery requires provider keys. Place them only in `~/.openclaw/secrets.json` and restrict file permissions.
- Respect Do-Not-Disturb windows and alert sensitivity levels before delivering notifications.

## Operational Checklist (post-deploy)
- [ ] Confirm `agents.alert_settings` column exists (DB schema)
- [ ] Confirm `~/.openclaw/secrets.json` contains OPENROUTER_API_KEY and provider credentials when used
- [ ] Confirm Director runtime model in SOUL.md matches `openclaw` config
- [ ] Run health-check prompt and an escalation simulation weekly

## Patch notes / audit
When editing SOUL.md, AGENTS.md, or this SKILL.md, append one line to `memory/YYYY-MM-DD.md` describing the change.

---

# End of Director Skill
