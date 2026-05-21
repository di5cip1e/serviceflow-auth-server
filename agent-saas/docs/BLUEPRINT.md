# M.ai.K.R — Product Blueprint & Strategic Roadmap

**Source:** Derek, May 21, 2026  
**Purpose:** Definitive UX, feature, and monetization model for maikr.pro  
**Status:** Active reference — all future development should align with this document

---

## 1. Visual & UX Architecture: Form Meets Profit

**Core principle:** Minimize "time-to-value." If a user can't build a working agent in five minutes, they will churn.

### The "Double-Entry" Dashboard
- **Split-screen interface:**
  - **Left:** Simplified configuration panel (or natural language chat assistant that builds the agent for them)
  - **Right:** Live, real-time testing sandbox — chat with the agent instantly as changes are made
- Goal: Zero-latency feedback loop between configuration and behavior

### Blueprint Marketplace
- Highly visible library of **pre-configured templates** categorized by industry:
  - E-commerce Support
  - Real Estate Lead Gen
  - Local Service Scheduler
  - (etc.)
- Functions as both a **UX shortcut** and a **direct monetization vector** through premium templates

### The "Node-Less" Workflow Canvas
- **Default view:** Linear, step-by-step card system (non-intimidating for beginners)
- **Advanced view:** Toggle into a node-based drag-and-drop canvas for power users
- Philosophy: Start simple, reveal complexity only when the user is ready

---

## 2. Core Feature Set: What It Must Do

**Mental model:** Non-coders don't think in terms of APIs, system prompts, or vector databases. They think in terms of **tasks, knowledge, and destinations**.

### Frictionless Knowledge Grounding
- **One-Click Ingestion:**
  - Drop a website URL → agent learns brand voice
  - Upload a PDF → agent trained on document
  - Sync a Google Drive folder → continuous knowledge updates
  - Platform handles chunking and embedding entirely behind the scenes
- **Guardrail Matrix:**
  - Dead-simple toggle system for setting boundaries
  - Instead of writing complex negative prompts, users check boxes:
    - ☐ "Never discuss competitors"
    - ☐ "Do not offer discounts unless authorized"
    - ☐ "Escalate to a human immediately if the tone becomes frustrated"
  - Pre-built guardrail templates per industry

### Spawning & Delegation (Agent-to-Agent)
- **Manager & Sub-Agent Topologies:**
  - Build a "Main Agent" that can automatically spin up or delegate tasks to specialized sub-agents
  - Example: Customer service agent routes a complex billing question → specialized billing sub-agent
  - Visual hierarchy showing agent relationships

### Omni-Channel Deployment
- **One-Click Publishing:**
  - Agent is only valuable where customers can reach it
  - Instant, no-code deployment widgets for websites
  - Simple webhooks/connections for WhatsApp, SMS (Twilio), and popular CRM tools
  - Status dashboard showing all connected channels

---

## 3. The Competitive Edge: How to Win the Market

**Reality:** The no-code AI space is crowded. The platform cannot just be a wrapper for vanilla LLMs — it must solve real-world operational headaches.

### Granular Cost Control & Transparency
- **Usage-Based Analytics:**
  - Clear dashboard showing exactly how much token usage each agent is consuming
  - Ability to set hard daily or monthly spending caps
  - For agency users: easy profit margin visibility per client/agent

### Self-Correction & Loop Detection
- **Autonomous Reliability:**
  - Built-in mechanisms that detect when an agent is stuck in a logic loop or repeatedly hallucinating
  - Platform automatically intervenes:
    - Resets context safely, OR
    - Flags conversation for human review
  - Intervention happens **before** the end-user notices

### White-Labeling & Reseller Capabilities
- **Agency-First Features:**
  - Many no-code tool users are freelancers/agencies building for local businesses
  - White-label tier: rebrand the dashboard with their own logo and domain
  - Resell agent access under their own brand
  - Creates a massive, sticky revenue stream

---

## 4. Profitability & Monetization Model

**Goal:** Balance infrastructure costs (VPS hosting, model APIs, vector storage) with healthy margins.

### Hybrid Pricing Strategy

| Tier | Model | What It Unlocks |
|------|-------|-----------------|
| **Freemium Hook** | Free | Build 1 basic web-widget agent, low monthly token limit. Handles "try before you buy" psychological barrier. |
| **Growth Tier** | Monthly SaaS subscription | Multi-channel deployment (SMS, WhatsApp), multiple sub-agents, deeper knowledge base storage |
| **Value-Driven Markup** | Usage premium OR platform fee | Charge slight premium on token/compute above base subscription, OR allow bring-your-own API keys + flat platform management fee |

### Revenue Vectors (Summary)
1. SaaS subscriptions (Growth/Scale/Enterprise tiers)
2. Premium template marketplace (one-time or subscription)
3. Usage-based markup on tokens/compute
4. White-label/reseller licensing
5. Platform management fee for BYOK (bring your own key) users

---

## Implementation Priority

### Phase A — Foundation (Already Built ✅)
- Agent builder with 4-step form
- Session-based auth & onboarding
- Chat interface with agent communication
- Basic dashboard (Command Center)
- Omnichannel webhooks (Telegram, Twilio, Slack)
- MCP tool integration
- Consumption-based billing with credit system

### Phase B — UX Overhaul (Next)
1. **Double-Entry Dashboard** — Split config + live test sandbox
2. **Blueprint Marketplace** — Pre-configured industry templates
3. **Node-Less Workflow Canvas** — Linear card view with advanced toggle
4. **Guardrail Matrix** — Checkbox-based boundary system

### Phase C — Competitive Moat
5. **One-Click Knowledge Ingestion** — URL/PDF/Google Drive sync
6. **Agent-to-Agent Delegation** — Manager/sub-agent topologies
7. **Self-Correction & Loop Detection** — Autonomous reliability
8. **Usage Analytics Dashboard** — Per-agent cost tracking + spending caps

### Phase D — Scale & Monetization
9. **White-Label Tier** — Rebrandable dashboard for agencies
10. **Premium Template Marketplace** — Monetized industry templates
11. **BYOK + Platform Fee Model** — Bring your own API key option
12. **One-Click Omni-Channel Widgets** — Website embed, WhatsApp, SMS, CRM

---

*This document is the strategic north star. All feature development, design decisions, and prioritization should reference this blueprint.*
