# SMB Automation Workflow Templates

> Production-ready automation blueprints for small-to-medium businesses. Each template includes architecture, tool stack, implementation steps, and ROI justification.

---

## 1. Starter Package — Lead Capture & Follow-up

### Value Proposition

- **Reduce response time from hours to seconds** — automated welcome emails eliminate manual outreach delays
- **Zero lead leakage** — every form submission instantly creates a CRM record and task
- **Scalable without hiring** — handles 100 or 10,000 submissions with identical effort

### Workflow Architecture

```
[Web Form] → [Google Sheets] → [Make/Zapier] → [CRM] → [Gmail] → [Task Manager]
     │           │                  │            │        │            │
   Submit    Record            Trigger      Create   Send        Assign
   lead      entry             workflow     contact  welcome    follow-up
```

### Tool Stack

| Function | Tool | Free Tier | Paid Tier |
|----------|------|-----------|-----------|
| Form | Google Forms / Typeform | ✅ | $0-20/mo |
| Database | Google Sheets | ✅ | ✅ |
| Automation | Make (Integromat) | 1,000 ops/mo | $9+/mo |
| CRM | HubSpot Free / Pipedrive | ✅ | $15+/mo |
| Email | Gmail (workspace) | ✅ | $6+/mo |
| Tasks | Todoist / Trello | ✅ | $10+/mo |

### Setup Instructions

1. **Create Google Form** with fields: name, email, company, phone, interest
2. **Connect form to Sheets** — enable "Scripting" for advanced triggers
3. **Set up Make scenario:**
   - Watch for new Sheet row
   - Create/update CRM contact
   - Send Gmail welcome email (HTML template)
   - Create task in Todoist for manual follow-up
4. **Configure email templates** — personalize with merge tags
5. **Test end-to-end** — submit test form, verify all downstream actions

### Complexity

- **Setup time:** 2–3 hours
- **Monthly cost:** $10–20 (Make Pro + optional CRM tier)
- **Maintenance:** Low — monitor for failed emails quarterly

---

## 2. Growth Package — Social Media Auto-Poster

### Value Proposition

- **Consistency at scale** — queue content once, publish across LinkedIn, Twitter, Instagram automatically
- **Optimal timing** — buffer scheduling maximizes reach based on audience activity
- **Engagement insights** — automated tracking surfaces top-performing content

### Workflow Architecture

```
[Content Calendar] → [Make] → [Buffer/Hootsuite] → [Social Platforms]
       │               │              │                    │
   Draft &      Transform       Queue for        Publish
   approve      to platform-    optimal          to all
   content      specific        times            channels
                format

[Social APIs] → [Engagement Tracker] → [Weekly Report]
      │              │                    │
  Pull likes,    Aggregate            Auto-email
  comments,      metrics              performance digest
  shares
```

### Tool Stack

| Function | Tool | Free Tier | Paid Tier |
|----------|------|-----------|-----------|
| Content Queue | Google Sheets / Airtable | ✅ | $0-20/mo |
| Automation | Make | 1,000 ops/mo | $29+/mo |
| Scheduler | Buffer | 2 channels | $15+/mo |
| Social APIs | Native platform APIs | ✅ | ✅ |
| Reporting | Databox / Google Data Studio | ✅ | $20+/mo |

### Setup Instructions

1. **Build content calendar** in Airtable with fields: content, platforms, scheduled date, status
2. **Create Make scenario:**
   - Watch Airtable for "ready" content
   - Transform content to each platform's format (truncate for Twitter, add hashtags for Instagram)
   - Push to Buffer queue
   - Post to each social platform via API
3. **Set up engagement polling:**
   - Scheduled scenario runs every 6 hours
   - Query each platform's API for new likes/comments
   - Update tracker with engagement counts
4. **Build weekly report** — Data Studio pulls from tracker, emails summary Saturday 9am

### Complexity

- **Setup time:** 4–5 hours
- **Monthly cost:** $20–30 (Make + Buffer + optional reporting)
- **Maintenance:** Medium — adjust posting times seasonally, update API connections quarterly

---

## 3. Pro Package — Invoice to Payment Pipeline

### Value Proposition

- **Cash flow visibility** — real-time payment status eliminates surprise outstanding balances
- **Dunning automation** — polite but firm reminders recover 15–30% more late payments
- **Full sync with accounting** — QuickBooks stays accurate without manual data entry

### Workflow Architecture

```
[Invoice Created] → [Stripe] → [Email to Client] → [Track Status]
       │              │              │                  │
   Generate     Create         Send invoice      Update
   in           payment        with secure       payment
   QuickBooks   link           link               status

[Payment Received] → [QuickBooks] → [Completion Task]
        │               │              │
    Webhook          Mark           Notify
    triggers         invoice        team &
    payment          paid           archive
    confirmed

[Overdue] → [Reminder 1] → [Reminder 2] → [Final Notice] → [Escalation]
  Check daily     7 days        14 days        21 days        30 days
```

### Tool Stack

| Function | Tool | Free Tier | Paid Tier |
|----------|------|-----------|-----------|
| Accounting | QuickBooks Online | $30/mo | $55+/mo |
| Payments | Stripe | 1.4% + 25¢ | 1.4% + 25¢ |
| Automation | Make | 1,000 ops/mo | $29+/mo |
| Email | Gmail / Postmark | ✅ / $10/mo | $10+/mo |
| SMS | Twilio | $1/msg | $1/msg |

### Setup Instructions

1. **Configure QuickBooks:**
   - Enable Stripe integration in QuickBooks settings
   - Set up payment terms (Net 30 default)
   - Create invoice templates with payment links
2. **Build Make scenarios:**
   - **Scenario A (Invoice Created):** Watch QuickBooks for new invoice → send Stripe payment link via email → create task to track
   - **Scenario B (Payment Received):** Stripe webhook on `payment_intent.succeeded` → update QuickBooks invoice → notify team → create completion task
   - **Scenario C (Dunning Sequence):** Scheduled daily → query overdue invoices → send reminder via email (day 7) → SMS (day 14) → final notice (day 21)
3. **Set up Twilio** for SMS reminders (optional, recommended for high-value clients)
4. **Test edge cases:** partial payments, refunds, failed charges

### Complexity

- **Setup time:** 6–8 hours
- **Monthly cost:** $30–50 (QuickBooks + Make + Stripe fees + optional SMS)
- **Maintenance:** Medium — review failed payments weekly, reconcile monthly

---

## Cost Comparison Summary

| Package | Setup | Monthly Run | Main Benefit |
|---------|-------|-------------|--------------|
| Starter | 2–3 hrs | $10–20 | Never miss a lead |
| Growth | 4–5 hrs | $20–30 | Consistent social presence |
| Pro | 6–8 hrs | $30–50 | Automated cash flow |

---

## Getting Started

1. **Assess your biggest bottleneck** — Is it lead response time? Social consistency? Cash flow?
2. **Start with Starter** — Simplest to implement, fastest time-to-value
3. **Iterate** — Each package can run independently or layer together
4. **Measure** — Track conversion rate, engagement, and DSO (days sales outstanding) before and after

---

*Document version: 1.0 | Last updated: 2026-03-25*