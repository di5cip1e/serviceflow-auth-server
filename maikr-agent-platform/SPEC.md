# M.ai.K.R — Full OpenClaw Agent Platform
## Product Spec: Real OpenClaw Agents for Customers

---

## What We Have (Framework)

| Component | Status | Notes |
|-----------|--------|-------|
| Stripe Checkout + Webhook | ✅ Live | Payment → provisioning pipeline |
| Frontend Questionnaire (4 steps) | ✅ Live | Collects business config |
| Frontend Dashboard (4 tabs) | ✅ Live | Customization UI |
| Chat Interface | ✅ Live | maikr.pro/chat.html |
| DB Schema (customers/agents/api_keys) | ✅ Live | SQLite |
| Agent File Scaffold Generator | ✅ Live | Creates /opt/agents/{slug}/ files |
| OpenRouter AI (free Gemini) | ✅ Live | Chat backend |

---

## What We Need (The Gap)

The current "agent" is a **chat bot** — each message is a stateless API call to OpenRouter with a system prompt. After payment, the customer gets a chat window with a configured AI. Useful, but limited.

**What we promised:** Each customer gets their own **persistent OpenClaw agent** — like me, but configured for their business. Real agents that can:
- Remember context across sessions
- Run commands and tools
- Spawn sub-agents
- Coordinate tasks
- Work autonomously between messages

---

## Architecture: How It Works

```
Customer Chat Message
        │
        ▼
Frontend (chat.html?agent={id})
        │ POST /api/chat { message }
        ▼
Backend (server.js)
        │ Looks up customer's agent session key from DB
        │ Routes to OpenClaw agent session via sessions_send()
        ▼
OpenClaw Agent Session (their dedicated agent)
        │ Responds
        ▼
Backend → Frontend → Customer sees response
```

---

## Core Components to Build

### 1. Per-Customer Agent Provisioning

**When Stripe webhook fires (`checkout.session.completed`):**

```
provisionCustomerAgent(event, session)
  ├── Extract customer config from session.metadata
  ├── Create customer DB record
  ├── Create agent DB record
  ├── Generate agent files in /opt/agents/{slug}/
  │   ├── SOUL.md (from questionnaire config)
  │   ├── AGENTS.md (capabilities for their use cases)
  │   ├── USER.md (their business details)
  │   ├── tools/ (enabled tools based on plan)
  │   └── config files
  ├── Register agent: openclaw agents add {slug}
  ├── Spawn agent session: openclaw run --prompt "{system}" --session-key {sessionKey}
  ├── Store session key in DB
  └── Send welcome email with agent link
```

**Agent config files generated from questionnaire answers:**

- **SOUL.md** — "You are {businessName}, a {industry} AI assistant..."
- **AGENTS.md** — Capabilities scoped to their use cases (customer support / sales / etc.)
- **USER.md** — Their business name, industry, target audience, tone preferences
- **Tools** — Enabled based on plan (email, calendar, Slack, etc.)

### 2. Chat → Agent Session Routing

**Current (broken):** `/api/chat` calls OpenRouter directly with system prompt.

**Target:** `/api/chat` sends message to customer's OpenClaw agent session.

```
POST /api/chat { agent_id, message }
  ├── Look up agent session key from DB
  ├── Call sessions_send(sessionKey, message)
  ├── Wait for response (with timeout)
  ├── Return response to frontend
  └── Log conversation to DB
```

**Requirements:**
- `sessions_send()` must work with per-customer session keys
- Agent sessions must be persistent (survive the API call)
- Need a timeout (30-60s) for agent thinking time
- Fallback to OpenRouter if agent session unavailable

### 3. Agent Session Lifecycle Management

Agents run as persistent background processes. Need to manage them:

| Action | How |
|--------|-----|
| **Start** | Spawn on first chat or on provisioning |
| **Stop** | When customer cancels / plan expires |
| **Restart** | If agent crashes or memory fills |
| **Monitor** | Track uptime, response time, errors |
| **Timeout** | Auto-stop inactive sessions after X days |

**Implementation:** PM2 process manager (already used for backend) + agent subprocess per customer.

### 4. Dashboard: Full Agent Configuration

Expand the existing dashboard to configure the real agent:

| Tab | Current | Target |
|-----|---------|--------|
| Customization Engine | Edits system prompt | Edit SOUL.md + AGENTS.md |
| Memory & Logs | Shows chat history | View agent memory, conversation logs |
| Appearance Editor | Avatar + theme | Avatar + theme + agent name |
| Alert Settings | Email/SMS alerts | Alert settings + escalation triggers |
| **NEW: Agent Settings** | — | Tools enabled, proactive behaviors, working hours |

### 5. Plan-Based Capability Gating

Different plans get different capabilities:

| Feature | Basic ($49) | Pro ($99) | Enterprise ($199) |
|---------|-------------|-----------|-------------------|
| Chat responses | ✅ | ✅ | ✅ |
| Persistent memory | ❌ | ✅ (7 days) | ✅ (30 days) |
| Tools (Email) | ❌ | ✅ | ✅ |
| Tools (Calendar) | ❌ | ❌ | ✅ |
| Tools (Slack) | ❌ | ❌ | ✅ |
| Sub-agents | ❌ | ❌ | ✅ |
| Custom training | ❌ | ❌ | ✅ |

---

## Plan: What to Build

### Phase 1: Agent Spawning + Session Routing (CRITICAL PATH)
- [ ] Create agent file generator that produces real OpenClaw agent configs (SOUL.md, AGENTS.md, USER.md)
- [ ] Wire provisioning pipeline to call `openclaw agents add` + spawn session
- [ ] Implement `/api/chat` routing via `sessions_send()`
- [ ] Test end-to-end: chat message → agent → response

### Phase 2: Agent Lifecycle Management
- [ ] PM2 config to run customer agents as persistent processes
- [ ] Health check endpoint per agent
- [ ] Auto-restart on crash
- [ ] Session cleanup on plan cancellation

### Phase 3: Dashboard (Full Agent Config)
- [ ] SOUL.md editor in Customization Engine tab
- [ ] Agent Settings tab (tools, proactive behaviors)
- [ ] Real-time agent status in dashboard header

### Phase 4: Advanced Capabilities
- [ ] Persistent memory across sessions
- [ ] Tool integrations (email, calendar)
- [ ] Sub-agent coordination (Enterprise)
- [ ] Usage analytics + per-agent metrics

---

## Technical Notes

**Session key storage:**
- Each agent's session key stored in `agents.session_key` column
- Added to DB schema during provisioning

**Security isolation:**
- Each agent runs with its own system prompt + tools
- Agents can't access each other's memory or data
- Rate limiting per customer to prevent abuse

**Scaling approach:**
- Single VPS can handle ~20-50 concurrent agent sessions
- Monitor CPU/memory, scale to additional VPS as needed
- Port range 3001-3999 for agent HTTP interfaces

**Fallback if OpenClaw sessions unavailable:**
- Continue using OpenRouter Gemini for chat responses
- Agent features (memory, tools) become premium add-ons
- Maintains platform revenue while full agent capability is built

---

## Revenue Impact

| Plan | Price | Revenue Potential |
|------|-------|-------------------|
| Basic | $49/mo | Per customer |
| Pro | $99/mo | +$50/customer |
| Enterprise | $199/mo | +$150/customer |

**20 basic customers = $11,800/year**
**20 mixed customers = $23,600/year**

Full OpenClaw agents justify the higher price points — customers get actual autonomous AI workers, not just a chatbot.

---

## Dependencies

- OpenClaw CLI (`openclaw agents add`, `openclaw run`)
- PM2 (already installed)
- Existing Stripe + provisioning pipeline
- Existing SQLite schema (needs session_key column added)
- `sessions_send()` available in OpenClaw API

---

## What Derek Needs to Do

1. **Confirm scope** — Does this spec match what you imagined?
2. **Priortize Phase 1** — Chat + agent spawning is the critical path to first revenue
3. **Test the spawning flow** — `openclaw agents add` + `openclaw run` needs to work on the VPS first

Let's build Phase 1. What do you want to tackle first?
