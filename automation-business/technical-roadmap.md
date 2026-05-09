# AI Automation Consulting Business - Technical Roadmap

> **Business:** AI Automation Consulting for SMBs  
> **Target Client:** Small businesses needing email sequences, lead management, and customer communication automation  
> **Pricing:** $200–700/setup | $2,000–5,000/day consulting  
> **Core Tools:** Zapier, Make (n8n), ChatGPT API

---

## 1. Tech Stack Recommendations

### 1.1 Landing Page & Website

| Option | Recommendation | Cost | Best For |
|--------|----------------|------|----------|
| **Primary** | **Carrd** | $19/year | Single-page sites, fast launch |
| **Alternative** | **Framer** | $15/month | Portfolio + animations |
| **If needing blog** | **Ghost** | $25/month | Content marketing |

**Recommendation:** Start with **Carrd** — build a compelling single-page site in hours, not weeks. Include:
- Hero headline (value prop)
- Services offered
- Pricing tiers
- Lead capture form
- Testimonials section

---

### 1.2 Scheduling & Booking System

| Option | Recommendation | Cost | Notes |
|--------|----------------|------|-------|
| **Primary** | **Cal.com** (self-hosted) | $0–$30/mo | Open-source, your own branding |
| **Alternative** | **Calendly** | $12–$20/mo | Easier, less control |
| **Integration** | Embed directly into Carrd | — | No redirect needed |

**Setup:**
1. Create account on Cal.com (free tier fine to start)
2. Set up event types: "Discovery Call (30 min)", "Strategy Session (60 min)"
3. Connect Google Calendar
4. Embed booking widget into Carrd page

---

### 1.3 Client Intake Forms

| Option | Recommendation | Cost |
|--------|----------------|------|
| **Primary** | **Tally** (notion forms) | Free tier excellent |
| **Alternative** | **Typeform** | $25/mo |
| **Storage** | **Notion** database | Free |

**Flow:**
1. Client books discovery call → Tally form auto-sent via Zapier
2. Form responses → Notion client database
3. New client created → Project board auto-generated

---

### 1.4 Communication Tools

| Tool | Use Case | Cost |
|------|----------|------|
| **Gmail** (Google Workspace) | Client emails, proposals | $6–$12/user/mo |
| **Discord** | Ongoing client comms, support | Free |
| **Loom** | Video walkthroughs for handoff | Free |
| **WhatsApp** (optional) | For international clients | Free |

**Recommendation:** Google Workspace for professional email. Use Discord for ongoing clients who want quick access — much better than email chains.

---

## 2. Service Delivery Workflow

### 2.1 Client Intake Flow

```
[Website Visit] → [Book Discovery Call] → [Discovery Call]
                                          ↓
[Send Proposal] ← [Intake Form Filled] ← [Qualify]
                                          ↓
[Contract Signed] → [Onboarding Form] → [Kickoff Meeting]
```

**Step-by-Step:**

1. **Lead captures** — Books via embedded Cal.com calendar
2. **Intake trigger** — Zapier watches for new bookings → sends Tally intake form
3. **Qualification** — Review form, decide if good fit
4. **Proposal** — Send custom PDF proposal (Google Docs template)
5. **Contract** — Google Forms contract or PandaDoc (free tier)

---

### 2.2 Discovery Process

**Pre-call:** Complete intake form with:
- Current tools they use (CRM, email, calendar)
- Pain points (what's broken?)
- Goals (what does success look like?)
- Budget and timeline

**Discovery call agenda (30 min):**
1. 5 min — Validate fit, confirm pain points
2. 15 min — Deep dive on current workflow
3. 10 min — Propose 2–3 automation solutions with pricing

**Post-call:** Send follow-up email within 24 hours with:
- Summary of discussion
- Link to proposal
- Next steps

---

### 2.3 Implementation Steps

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **1. Kickoff** | Day 1 | Access credentials, project brief, timeline |
| **2. Design** | Days 2–3 | Flow diagrams, tool mapping |
| **3. Build** | Days 4–7 | Zaps/Make workflows, API integrations |
| **4. Test** | Day 8 | Sandbox testing, edge cases |
| **5. Handoff** | Day 9 | Training video, documentation |
| **6. Launch** | Day 10 | Go-live, monitoring period |

**Total timeline:** 7–14 days for typical setup project

---

### 2.4 Handoff & Training

Deliverables to client:
- [ ] Video walkthrough (Loom) explaining each automation
- [ ] Written documentation (Notion page per automation)
- [ ] Access credentials (password manager recommended)
- [ ] "What to do if things break" guide

**Training session (60 min):**
- Walk through each workflow
- Show how to edit basic rules
- Q&A

---

### 2.5 Ongoing Maintenance Model

| Tier | Price | What's Included |
|------|-------|-----------------|
| **One-time** | $200–$700 | Build only, 30-day bugfix warranty |
| **Retainer** | $200–$500/mo | Monthly tweaks (≤5 hrs), monitoring, priority support |
| **Full** | $1,000–$2,000/mo | Ongoing development, new automations, 24hr response |

**Retainer includes:**
- Monthly health check on all automations
- Fixes within 48 hours
- Up to 5 hours of modifications/month
- Quarterly strategy call

---

## 3. Automation Templates

### 3.1 Email Sequences

| Template | Trigger | Sequence |
|----------|---------|----------|
| **Welcome** | New lead from form/booking | 3-email sequence: Welcome → Value add → CTA |
| **Nurture** | No reply after 3 days | 5-email sequence over 2 weeks |
| **Follow-up** | Post-purchase | Thank you → Tips → Upsell → Review request |
| **Re-engagement** | Inactive for 30 days | 2-email "We miss you" sequence |

**Tools:** Mailchimp (free to 500 contacts) or ConvertKit (better for creators)

---

### 3.2 Lead Generation Flows

| Flow | Description |
|------|-------------|
| **Lead capture → CRM** | Form submission → Create contact in HubSpot/Pipedrive + tag |
| **Lead routing** | New lead → Assign to rep → Send notification → Create task |
| **Lead scoring** | Engagement (email opens, page visits) → Score update → Alert on threshold |
| **Webhook → Action** | External trigger (ad click, landing page) → Immediate follow-up |

---

### 3.3 Customer Onboarding

| Trigger | Automation |
|---------|------------|
| **Contract signed** | Create project in Notion, schedule kickoff, send welcome email |
| **Kickoff complete** | Send onboarding form, create tasks in client's tools |
| **Milestone reached** | Send milestone email, request testimonial |
| **Project complete** | Send handoff package, schedule training, invite to retainer |

---

### 3.4 Appointment Scheduling

| Scenario | Automation |
|----------|-------------|
| **Booking confirmed** | Add to calendar, send confirmation + prep email |
| **Day before** | Send reminder + reschedule link |
| **No-show** | Send follow-up, offer reschedule |
| **Post-call** | Send follow-up email, create follow-up task |

---

### 3.5 Follow-Up Systems

| Type | Use Case |
|------|----------|
| **Task reminders** | Create todo in Notion/Trello → Notify 24hr before due |
| **Invoice follow-up** | Invoice unpaid 7 days → Reminder email |
| **Review request** | Purchase complete 7 days → Request review |
| **Check-in sequence** | Client inactive 30/60/90 days → Re-engagement emails |

---

## 4. Infrastructure Needed

### 4.1 Tools to Subscribe

| Category | Tool | Tier | Monthly Cost |
|----------|------|------|--------------|
| **Website** | Carrd | Pro | $2 |
| **Scheduling** | Cal.com | Free | $0 |
| **Intake Forms** | Tally | Free | $0 |
| **CRM** | HubSpot | Free | $0 |
| **Email Marketing** | Mailchimp | Free | $0 |
| **Video** | Loom | Free | $0 |
| **Automation** | Zapier | Team (if needed) | $20–$50 |
| **Alternative Automation** | Make.com | Free tier | $0–$9 |
| **Communication** | Discord | Free | $0 |
| **Email** | Google Workspace | Starter | $6/user |
| **Notion** | Notion | Team | $8 |

**Minimum viable stack:** $8–15/month  
**Production stack:** $40–80/month

---

### 4.2 Estimated Costs Summary

| Item | One-Time | Monthly |
|------|----------|---------|
| Website (Carrd) | $19/year | $2 |
| Google Workspace | — | $6 |
| Zapier Team | — | $30 |
| Notion Team | — | $8 |
| Cal.com Pro (optional) | — | $12 |
| **Total** | **$19** | **$58** |

---

### 4.3 Time to Set Up

| Phase | Time Estimate |
|-------|---------------|
| Website (Carrd) | 2–4 hours |
| Cal.com + forms | 1–2 hours |
| Zapier/Make account | 1 hour |
| Google Workspace | 30 min |
| Notion client database | 2–3 hours |
| **Total** | **~8 hours** |

---

## 5. Differentiation

### 5.1 What Makes Us Different

| Factor | Competitors | Our Advantage |
|--------|-------------|---------------|
| **Pricing** | Hourly ($150–300/hr) | Fixed packages — clients know cost upfront |
| **Speed** | 4–8 weeks | 1–2 weeks delivery |
| **Transparency** | Black box | Full documentation + training included |
| **Support** | Email only | Discord access for quick questions |
| **Technology** | Single platform | Best tool for each job (Zapier + Make + Custom) |
| **Ongoing** | One-and-done | Retainer options for continuous improvement |

---

### 5.2 Industry Specialization

**Focus on 2–3 industries initially:**

| Industry | Pain Points | High-Value Automations |
|----------|-------------|------------------------|
| **Real Estate Agents** | Lead follow-up, showing scheduling, CRM updates | Lead routing, automated listings, follow-up sequences |
| **Digital Agencies** | Client onboarding, project management, invoicing | Onboarding pipelines, time tracking → invoicing |
| **E-commerce** | Abandoned cart, post-purchase, reviews | Abandoned cart recovery, review requests, upsells |
| **Consultants/Coaches** | Booking, intake, follow-up | Scheduling → intake → onboarding → billing |
| **Local Service Businesses** | Lead capture, quotes, scheduling | Online booking, quote follow-up, reminders |

**Recommendation:** Start with **consultants/coaches and real estate** — easiest to sell to, clearest ROI, repeatable processes.

---

### 5.3 Unique Selling Proposition (USP)

> "We build automation systems that pay for themselves in 60 days — or the work is free."

**Key differentiators:**
1. **Money-back guarantee** — Confidence in delivery
2. **Fixed pricing** — No scope creep surprises
3. **Fast turnaround** — 2 weeks, not 2 months
4. **Done-for-you training** — Client can manage after handoff
5. **Retainer model** — Continuous improvement, not one-and-done

---

## 6. Quick Start Checklist

### This Week
- [ ] Set up Carrd website with services + booking
- [ ] Create Cal.com account with discovery call event type
- [ ] Set up Tally intake form
- [ ] Create Notion client database template

### This Month
- [ ] Build 3 template automations (lead capture, onboarding, follow-up)
- [ ] Get first 3 clients at discounted rate
- [ ] Document your process for each delivery phase
- [ ] Collect testimonials

### Ongoing
- [ ] Refine templates based on client feedback
- [ ] Add one new automation template per month
- [ ] Build case studies from successful projects
- [ ] Test and switch automation tools as needed

---

*Last updated: 2026-03-24*  
*Created for: Derek's AI Automation Consulting Business*