# Phase D.5 — Agent Experience Overhaul Spec

**Author:** The Director  
**Date:** May 24, 2026  
**Status:** Draft — pending Derek approval  
**File:** `agent-saas/docs/OVERHAUL_SPEC.md`

---

## Executive Summary

M.ai.K.R has all the backend pieces. What it lacks is a **coherent, simple, agent-centric user experience**. This spec defines Phase D.5: a ground-up rethink of how customers interact with the platform.

**The thesis:** Every paying customer should feel like they just hired an AI employee — not that they just configured a chatbot.

---

## Part 1: The Three Core Problems (Diagnosis)

### Problem 1 — No Actual OpenClaw Agent

**Current state:** We sell "AI agents" at $50–500/mo but deliver a GPT chatbot behind a dashboard. Users get a wrapper around OpenRouter with a system prompt. That's not an agent. That's a text box.

**What users expect:** An agent with its own identity, memory, skills, and the ability to act autonomously — like The Director does for Derek.

**The fix:** Provision a real OpenClaw agent identity per customer. Each agent gets:
- Its own workspace directory (`/opt/agents/{slug}/`)
- Its own SOUL.md, AGENTS.md, USER.md (pre-configured from template)
- Its own session memory (persistent across conversations)
- Its own skill set (loaded from the blueprint/template they selected)
- Its own channel connections (Telegram, WhatsApp, web chat)

**Technical approach:**
```
Customer pays → Stripe webhook fires → provisioning pipeline:
  1. Create agent directory + bootstrap files
  2. Register agent in OpenClaw (`openclaw agents add`)
  3. Create DB record (agents table)
  4. Provision channels (Telegram bot via BotFather API)
  5. Send welcome message from the agent itself
  6. Redirect customer to "Your Agent" dashboard
```

### Problem 2 — Dashboard Designed for Developers

**Current state:** The dashboard has 10+ tabs: Swarm, Channels, MCP, Optimization, Observe, Command Center, Agent Studio, Analytics, Documents, Settings. This is a control panel, not a customer experience.

**What users want:** "Talk to my agent. See what it did. Change how it behaves. Done."

**The fix:** One unified "Your Agent" view.

### Problem 3 — Features Too Complex to Use

**Current state:** 4-step builder form (Basic Info → Audience/Tone → Use Cases → Review/Pay). Knowledge Ingestion, Guardrail Matrix, Agent Delegation, MCP tools — all buried in tabs nobody finds.

**The fix:** One-page onboarding. Pay → Agent lives immediately. Configuration happens through conversation with the agent itself.

---

## Part 2: The New User Journey

### Step 1 — Landing (maikr.pro)

**No changes to landing page.** Current page is good. Clear value prop, social proof, pricing.

### Step 2 — One-Page Builder (maikr.pro/build)

**Replace the 4-step form with a single page:**

```
┌─────────────────────────────────────────────────────┐
│  Build Your Agent                                    │
│                                                      │
│  Agent Name: [________________]                      │
│                                                      │
│  What should it do?                                  │
│  [Natural language description — multiline]          │
│  Example: "Answer customer questions about our       │
│  plumbing service and book appointments"             │
│                                                      │
│  Choose a starting point:                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Customer │ │  Lead    │ │ Schedule │            │
│  │ Support  │ │  Gen     │ │   r      │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                      │
│  Connect:  ☐ Telegram  ☐ WhatsApp  ☐ Web Chat      │
│                                                      │
│  Select Plan:  ○ Free  ○ Growth($99)  ○ Scale($199)│
│                                                      │
│           [ Create My Agent → ]                      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Key principles:**
- One page. No steps. No page reloads.
- Natural language input replaces structured survey
- Blueprint selection is optional (pre-fills the description)
- Channel selection is optional (can add later)
- Plan selection uses current pricing

**On submit:**
1. If Free → create agent immediately, redirect to dashboard
2. If Paid → Stripe checkout → webhook → provision → redirect

### Step 3 — "Your Agent" Dashboard (maikr.pro/dashboard)

**This replaces ALL current dashboard pages.** One URL. One view. Tabbed interface.

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 {Agent Name}                    Status: ● Online       │
│  "Customer Support for ABC Plumbing"                        │
│                                                             │
│  ┌─────────┬──────────┬──────────┬──────────┐              │
│  │  💬 Chat │ 📊 Activity │ ⚙️ Config │ 🔌 Channels │     │
│  └─────────┴──────────┴──────────┴──────────┘              │
│                                                             │
│  [Active tab content below]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Tab 1: 💬 Chat (Default)
- Full-screen chat interface with the agent
- Same style as current chat.html (sidebar + bubbles)
- Quick reply suggestions from agent
- File upload support
- This is the PRIMARY interaction — everything else is secondary

#### Tab 2: 📊 Activity
- Timeline of what the agent has done:
  - "Replied to customer question about pricing"
  - "Booked appointment for Thursday 2pm"
  - "Escalated angry customer to you"
- Daily/weekly summary stats
- Credit usage indicator
- Simple, visual, non-technical

#### Tab 3: ⚙️ Config
- **Simple mode (default):**
  - Agent personality slider (Professional ↔ Casual)
  - Response length (Brief ↔ Detailed)
  - Knowledge: Add URLs, upload documents
  - Guardrails: Checkboxes (same as current matrix)
- **Advanced mode (toggle):**
  - System prompt editor
  - Model selection
  - Token/credit limits
  - MCP tools
  - Agent delegation

#### Tab 4: 🔌 Channels
- Connected channels list (Telegram, WhatsApp, Web)
- Add new channel buttons
- Per-channel settings (working hours, auto-reply toggle)
- Webhook status indicators

---

## Part 3: Real Agent Provisioning

This is the most technically critical part. Here's the detailed flow:

### 3.1 — Stripe Webhook → Provisioning Trigger

```javascript
// backend/routes/webhook.js — Stripe checkout.session.completed
async function handleCheckoutComplete(session) {
  const { customer_email, metadata } = session;
  const { agent_name, plan, description, channels } = metadata;
  
  // 1. Create customer record
  const customer = await db.createCustomer(customer_email, plan);
  
  // 2. Generate unique slug
  const slug = generateSlug(agent_name) + '-' + randomId(6);
  
  // 3. Create agent workspace
  await provisionAgentWorkspace(slug, {
    name: agent_name,
    description,
    plan,
    channels
  });
  
  // 4. Register with OpenClaw
  await exec(`openclaw agents add ${slug} --workspace /opt/agents/${slug} --non-interactive`);
  
  // 5. Create DB record
  await db.createAgent({
    slug, name: agent_name, customer_id: customer.id,
    plan, description, status: 'active'
  });
  
  // 6. Provision channels (async, non-blocking)
  provisionChannels(slug, channels).catch(log);
  
  // 7. Send welcome email
  await sendWelcomeEmail(customer_email, agent_name, slug);
}
```

### 3.2 — Agent Workspace Bootstrap

Each agent gets a minimal but complete OpenClaw workspace:

```
/opt/agents/{slug}/
├── agent/
│   ├── SOUL.md          # Agent personality + role
│   ├── AGENTS.md        # Operating instructions
│   └── USER.md          # Customer context
├── memory/              # Agent's long-term memory
└── skills/              # Loaded from blueprint template
```

**SOUL.md template (generated from user's description):**
```markdown
# {Agent Name}

You are {agent_name}, {description}.

## Your Role
{Generated from blueprint or user description}

## Personality
{personality from config — professional/casual/etc}

## Knowledge
{Loaded from uploaded documents/URLs}

## Guardrails
{From guardrail matrix checkboxes}

## Channels
You communicate via: {channels list}
```

### 3.3 — Channel Provisioning

**Telegram (priority #1):**
```javascript
// Use BotFather API to create bot programmatically
// OR pre-create pool of bots and assign from pool
async function provisionTelegramBot(slug, agentName) {
  // Option A: BotFather API (requires manual setup or automation)
  // Option B: Pre-created bot pool (faster, more reliable)
  const bot = await db.assignBotFromPool(slug);
  await db.updateAgentChannel(slug, 'telegram', bot.chatId);
  return bot;
}
```

**WhatsApp:** Use Twilio WhatsApp API (already integrated)
**Web Chat:** Already works — embed widget

### 3.4 — Agent Session Lifecycle

```
User sends message → Channel webhook → Express backend
  → Look up agent by channel + chat_id
  → Load agent workspace
  → OpenClaw agent processes message (with full context + memory)
  → Response sent back through channel
```

**Key difference from current system:** Instead of routing through a generic swarm, messages go to the specific agent's OpenClaw session. The agent has its own memory, its own SOUL.md, its own skills.

---

## Part 4: Simplified Builder — Technical Spec

### 4.1 — Frontend: Single Page (`/build`)

Replace `build-step1.html` through `build-step4.html` with one page:

```html
<!-- frontend/build.html -->
<div class="build-container">
  <h1>Build Your Agent</h1>
  <p class="subtitle">Describe what you need. We'll handle the rest.</p>
  
  <form id="build-form">
    <div class="form-group">
      <label>Agent Name</label>
      <input type="text" name="agent_name" placeholder="e.g., SupportBot, LeadGen Pro" required>
    </div>
    
    <div class="form-group">
      <label>What should it do?</label>
      <textarea name="description" rows="4" 
        placeholder="Describe in plain English what you want this agent to do..."></textarea>
    </div>
    
    <div class="form-group">
      <label>Starting Point (optional)</label>
      <div class="blueprint-cards">
        <!-- Blueprint cards — clicking one pre-fills description -->
      </div>
    </div>
    
    <div class="form-group">
      <label>Connect Channels (optional)</label>
      <div class="channel-toggles">
        <label><input type="checkbox" name="channels" value="telegram"> Telegram</label>
        <label><input type="checkbox" name="channels" value="whatsapp"> WhatsApp</label>
        <label><input type="checkbox" name="channels" value="web"> Web Chat</label>
      </div>
    </div>
    
    <div class="form-group">
      <label>Plan</label>
      <div class="plan-selector">
        <!-- Plan cards — Free / Growth / Scale -->
      </div>
    </div>
    
    <button type="submit" class="btn-primary">Create My Agent →</button>
  </form>
</div>
```

### 4.2 — Backend: Build Endpoint

```javascript
// backend/routes/build.js
app.post('/api/build', async (req, res) => {
  const { agent_name, description, blueprint, channels, plan } = req.body;
  
  // Validate
  if (!agent_name || !description) {
    return res.status(400).json({ error: 'Name and description required' });
  }
  
  // Free plan — create immediately
  if (plan === 'free') {
    const agent = await provisionFreeAgent({ agent_name, description, channels });
    return res.json({ success: true, agent, redirect: '/dashboard' });
  }
  
  // Paid plan — create Stripe checkout
  const session = await stripe.checkout.sessions.create({
    customer_email: req.body.email,
    metadata: { agent_name, description, plan, channels: JSON.stringify(channels) },
    line_items: [{ price: PRICING[plan].stripe_price_id, quantity: 1 }],
    mode: 'payment',
    success_url: `${BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/build`,
  });
  
  res.json({ success: true, checkout_url: session.url });
});
```

---

## Part 5: Visual Refresh

### 5.1 — Design Principles

The current dark-premium CSS is good but needs refinement for the new simplified UX:

1. **Chat-first layout** — Chat takes 60%+ of screen real estate
2. **Generous whitespace** — Current UI is too dense
3. **Softer colors** — Reduce the military-tech intensity for mainstream users
4. **Larger touch targets** — Mobile-first thinking
5. **Progressive disclosure** — Simple by default, powerful when needed

### 5.2 — Specific Changes

| Element | Current | New |
|---------|---------|-----|
| Dashboard | 10+ separate pages | 1 page, 4 tabs |
| Builder | 4-step wizard | 1 page |
| Chat | Separate page | Embedded in dashboard |
| Config | Scattered across pages | Single Config tab, simple/advanced toggle |
| Navigation | Full nav bar | Minimal — Agent name + 4 tabs |
| Color accent | Amber/gold heavy | Softer amber, more white space |
| Font sizes | Mixed, some too small | 16px base, larger headings |

### 5.3 — Mobile Responsiveness

Current mobile experience is poor. The new dashboard must be:
- Fully responsive (320px+)
- Touch-friendly (44px min tap targets)
- Bottom tab navigation on mobile
- Chat works like a messaging app (WhatsApp/Telegram feel)

---

## Part 6: Migration Plan

### What to keep (don't rebuild):
- ✅ Backend API routes (mostly work)
- ✅ Stripe integration (works)
- ✅ Database schema (extend, don't replace)
- ✅ Channel integrations (Telegram, Twilio, Slack)
- ✅ Auth system (session-based login)
- ✅ Credit system (works)

### What to replace:
- ❌ 4-step builder → single-page builder
- ❌ 10+ dashboard pages → unified dashboard
- ❌ Generic swarm chat → per-agent OpenClaw sessions
- ❌ Static agent config → living agent workspace

### What to add:
- 🆕 Agent workspace provisioning pipeline
- 🆕 Agent SOUL.md generation from description
- 🆕 Activity timeline (agent action log)
- 🆕 Simple/advanced config toggle
- 🆕 Mobile-responsive dashboard

### Phase D.5 Sprint Order:
1. **Sprint 1:** Unified dashboard (frontend only, connects to existing APIs)
2. **Sprint 2:** Single-page builder + Stripe integration
3. **Sprint 3:** Real agent provisioning pipeline
4. **Sprint 4:** Channel provisioning (Telegram bot creation)
5. **Sprint 5:** Activity timeline + agent action logging
6. **Sprint 6:** Mobile responsiveness + visual polish

---

## Part 7: Success Metrics

After Phase D.5 ships, we measure:

| Metric | Current | Target |
|--------|---------|--------|
| Time to first agent message | ~15 min (form + config) | < 2 min |
| Dashboard pages | 10+ | 1 (4 tabs) |
| Builder steps | 4 | 1 |
| Mobile usability | ~4/10 | ~8/10 |
| Agent has persistent memory | ❌ | ✅ |
| Agent has own identity/workspace | ❌ | ✅ |
| Customer can talk to agent on Telegram | ❌ (manual setup) | ✅ (one-click) |

---

## Open Questions for Derek

1. **Free tier:** Should free agents have a Telegram bot, or just web chat?
2. **Bot creation:** Pre-create a pool of Telegram bots, or use BotFather API?
3. **Agent limits:** How many agents per customer on Growth/Scale?
4. **Migration:** What happens to existing beta accounts? Auto-migrate or fresh start?
5. **Priority:** Do we do all 6 sprints, or cut scope to ship faster?

---

*This spec is a living document. Update as decisions are made.*
