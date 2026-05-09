# Implementation Plan: Chen Photography
## Starter Package — $497

**Client:** Sarah Chen (Chen Photography)  
**Location:** Austin, TX  
**Package:** Starter ($497)  
**Document Version:** 1.0  
**Created:** March 2026

---

## Executive Summary

This implementation plan addresses Sarah Chen's core pain points: booking overload, manual invoicing, no-shows, and inefficient gallery delivery. We'll implement 4 integrated automations using free/low-cost tools, targeting 10-15 hours/month in time savings.

| Automation | Primary Tool | Monthly Cost | Setup Time |
|------------|--------------|--------------|------------|
| Online Booking + Calendar Sync | Calendly | $0 (free) | 2 hrs |
| Automated Invoicing + Payments | Wave + Stripe | $0 + transaction fees | 2 hrs |
| SMS Reminders 24h Before Session | Twilio + Make | ~$5-10/mo | 1.5 hrs |
| Automated Gallery Delivery | Pixieset | $0 (free) | 1.5 hrs |
| **TOTAL** | | **$5-10/mo** | **7 hours** |

---

## Prerequisites (Required from Sarah)

Before we begin implementation, Sarah needs to provide:

1. **Google Calendar access** — For calendar sync (she already uses this)
2. **Google Account** — For Wave and Make integrations
3. **Business bank account** — For Stripe (can use existing business account)
4. **Phone number** — For SMS delivery (can use existing)
5. **Current pricing/packages** — Session types, turnaround times, print credits
6. **Intake form questions** — What info does she collect from clients?
7. **Preferred session locations** — Studio, outdoor, client home, etc.

**Estimated time for Sarah to provide prerequisites:** 30 minutes

---

## Automation 1: Online Booking with Calendar Sync

### Tool Selection

| Tool | Purpose | Free Tier | Monthly Cost After |
|------|---------|-----------|-------------------|
| **Calendly** | Booking page + calendar sync | 1 event type | $0-15/mo |
| Google Calendar | Existing calendar (already has) | ✅ | $0 |

**Recommendation:** Calendly (free tier sufficient for 1 user, unlimited event types)

### Step-by-Step Setup

#### Step 1: Create Calendly Account (15 min)
1. Go to [calendly.com](https://calendly.com) and sign up with Google
2. Verify email address
3. Complete profile: name, business name "Chen Photography", timezone (CST)

#### Step 2: Configure Event Types (45 min)

**Event Type 1: Portrait Session (1 hour)**
- Name: "Portrait Session"
- Duration: 60 minutes
- Location: Add options (her studio address, outdoor locations)
- Description: Include what's included, what to bring
- Buffer time: 15 min between sessions
- Availability: Set her actual working hours (e.g., M-F 9am-5pm, Sat 9am-2pm)

**Event Type 2: Mini Session (30 min)**
- Name: "Mini Session"
- Duration: 30 minutes
- Same location/availability settings

**Event Type 3: Consultation Call (15 min)**
- Name: "Free Discovery Call"
- Duration: 15 minutes
- Video call (Calendly has built-in Zoom/Google Meet)

#### Step 3: Add Intake Questions (20 min)
In Calendly, add questions to each event type:
- Name (already required)
- Email (already required)
- Phone number
- Preferred session location (dropdown)
- What's the occasion? (birthday, family, headshot, etc.)
- How did you hear about me?

#### Step 4: Connect Google Calendar (10 min)
1. Go to Calendly → Integrations → Connect Google Calendar
2. Authorize access
3. Test by booking a test appointment

#### Step 5: Customize Booking Page (10 min)
- Add her logo
- Set brand colors (match website/Instagram)
- Write welcome message
- Add cancellation policy

### Testing Checklist
- [ ] Book test appointment through Calendly link
- [ ] Verify it appears on Google Calendar with correct time
- [ ] Confirm email notification sends to both parties
- [ ] Check intake answers appear in booking details
- [ ] Test different event types

**Time estimate:** 2 hours

---

## Automation 2: Automated Invoice + Payment Reminders

### Tool Selection

| Tool | Purpose | Free Tier | Cost |
|------|---------|-----------|------|
| **Wave** | Invoicing + accounting | ✅ | $0 |
| **Stripe** | Payment processing | ✅ | 2.9% + 30¢/tx |
| **Make** | Automation glue | 1,000 ops/mo | $0-9/mo |

**Recommendation:** Wave (fully free) + Stripe (free to start, per-transaction fees only) + Make (free tier for this volume)

### Step-by-Step Setup

#### Step 1: Set Up Wave (30 min)
1. Go to [waveapps.com](https://waveapps.com) and sign up with Google
2. Complete business profile: "Chen Photography"
3. Add business address (for invoices)
4. Set default payment terms: "Due upon receipt" or "Net 15"

#### Step 2: Connect Stripe to Wave (15 min)
1. In Wave dashboard: Settings → Payments → Connect Stripe
2. Log into Stripe (or create account)
3. Complete Stripe onboarding (business verification)
4. Test connection

#### Step 3: Create Invoice Templates (20 min)
Create templates in Wave for each service:

**Portrait Session Invoice:**
- Service: Portrait Photography Session
- Amount: [her pricing]
- Include: session date, location, what's delivered
- Payment link: Enable Stripe payment link

**Mini Session Invoice:**
- Service: Mini Session
- Amount: [her pricing]
- Same fields

#### Step 4: Create Make Automation (45 min)

**Scenario A: New Booking → Create Invoice + Send**
```
Trigger: Webhook from Calendly (new booking)
  ↓
Action: Create customer in Wave
  ↓
Action: Create invoice from template
  ↓
Action: Send invoice via email (Wave automated)
```

**Scenario B: Payment Received → Notify Sarah**
```
Trigger: Stripe webhook (payment success)
  ↓
Action: Send notification to Sarah (email or Slack)
  ↓
Action: Update Wave invoice status to "paid"
```

**Scenario C: Overdue Invoice → Send Reminder**
```
Trigger: Schedule (daily at 9am)
  ↓
Action: Get overdue invoices from Wave
  ↓
Action: Send reminder email (custom template)
```

#### Step 5: Test End-to-End (10 min)
- [ ] Create test invoice in Wave
- [ ] Send to test email
- [ ] Complete mock payment via Stripe link
- [ ] Verify notification arrives
- [ ] Check invoice status updates to "paid"

**Time estimate:** 2 hours

---

## Automation 3: SMS Reminders 24 Hours Before Session

### Tool Selection

| Tool | Purpose | Cost |
|------|---------|------|
| **Twilio** | SMS delivery | ~$1/100 messages |
| **Make** | Automation trigger | Included above |

**Recommendation:** Twilio (pay-as-you-go, ~$5-10/month for 15-20 sessions)

### Step-by-Step Setup

#### Step 1: Set Up Twilio (15 min)
1. Go to [twilio.com](https://twilio.com) and sign up
2. Verify email + phone number
3. Get a phone number ($1/month for basic)
4. Note Account SID, Auth Token, and phone number

#### Step 2: Configure Make Connection (10 min)
1. In Make, add Twilio module
2. Enter credentials from Step 1
3. Test connection

#### Step 3: Create SMS Reminder Automation (30 min)

**Trigger:** Google Calendar event starting in 24 hours
```
Calendar watch: New/updated event
  ↓
Filter: Event is "Portrait Session" or "Mini Session" (by title)
  ↓
Get event details: Extract phone number + client name + time/location
  ↓
Twilio: Send SMS to client
  ↓
Message: "Hi {name}! Reminder: Your session with Chen Photography is tomorrow at {time}. Location: {location}. Reply CANCEL to reschedule. See you soon!"
```

#### Step 4: Handle Opt-Outs (10 min)
Add logic to honor "STOP" replies:
- If client replies "STOP", add tag to avoid future messages
- Maintain simple suppression list in Make

### Testing Checklist
- [ ] Send test SMS to Sarah's phone
- [ ] Create calendar event for tomorrow, verify SMS triggers
- [ ] Test cancellation/opt-out flow
- [ ] Verify message delivers within 5 minutes

**Time estimate:** 1.5 hours

---

## Automation 4: Automated Gallery Delivery

### Tool Selection

| Tool | Purpose | Free Tier | Cost |
|------|---------|-----------|------|
| **Pixieset** | Gallery delivery | ✅ | $0 (premium: $19/mo) |
| **Make** | Automation | Included above | - |

**Recommendation:** Pixieset (free, built for photographers, excellent client experience)

### Step-by-Step Setup

#### Step 1: Set Up Pixieset Account (20 min)
1. Go to [pixieset.com](https://pixieset.com) and sign up
2. Complete business profile
3. Upload her logo and set brand colors
4. Create "Chen Photography" branding theme

#### Step 2: Configure Delivery Settings (15 min)
- Set default gallery expiration: 90 days
- Enable password protection (optional)
- Set download options: Original + web versions
- Add watermark if desired
- Configure email notification to client

#### Step 3: Create Client Upload Flow (15 min)
Set up folder structure:
- `/Portraits/`
- `/Mini Sessions/`
- `/Consultations/`

#### Step 4: Automate Gallery Link Delivery (30 min)

**Option A: Simple (Manual Trigger)**
Sarah uploads photos to Pixieset → Copies gallery link → Sends to client manually

**Option B: Automated (Recommended)**
```
Trigger: Sarah uploads photos to specific Pixieset folder
  ↓
Action: Pixieset sends automated "gallery ready" email
  ↓
Action (Make): Send follow-up SMS: "Your gallery is ready! View here: [link]"
```

**Note:** Pixieset has built-in email delivery. We'll add SMS notification via Make for extra touch.

#### Step 5: Test Gallery Flow (10 min)
- [ ] Upload test photos to Pixieset
- [ ] Verify client receives email
- [ ] Test gallery viewing and download
- [ ] Verify SMS triggers (if using automation)

**Time estimate:** 1.5 hours

---

## Integration Overview

All four automations work together as a system:

```
[Client Books via Calendly]
         ↓
[Google Calendar Updated] ←→ [SMS Reminder Triggered 24h before]
         ↓
[Make Creates Wave Invoice] → [Client Pays via Stripe]
         ↓
[Payment Notifies Sarah] ←→ [Gallery Delivered via Pixieset]
```

---

## Testing Checklist (Pre-Delivery)

Before handing off to Sarah, verify:

### Booking System
- [ ] All 3 event types working and visible on booking page
- [ ] Intake questions collecting correct info
- [ ] Calendar syncing correctly (no duplicates, correct times)
- [ ] Confirmation emails deliver to client

### Invoicing + Payments
- [ ] Wave account fully set up with business info
- [ ] Stripe connected and test payment works
- [ ] Invoice template includes correct pricing
- [ ] Payment link works (complete test transaction)
- [ ] Reminder emails send for overdue invoices

### SMS Reminders
- [ ] Twilio number active and working
- [ ] Test SMS delivers to real phone number
- [ ] Reminder triggers ~24 hours before session
- [ ] Opt-out handling works

### Gallery Delivery
- [ ] Pixieset account branded correctly
- [ ] Test gallery uploads and sends
- [ ] Client can view and download photos
- [ ] Expiration settings correct

### Integration
- [ ] Full client journey works: Book → Pay → Reminder → Gallery
- [ ] Sarah knows how to monitor each system

---

## Total Implementation Timeline

| Day | Task | Who |
|-----|------|-----|
| **Day 1** | Sarah provides prerequisites | Sarah |
| **Day 1-2** | Set up Calendly (booking page) | Us |
| **Day 2-3** | Set up Wave + Stripe (invoicing) | Us |
| **Day 3** | Set up Twilio (SMS) | Us |
| **Day 4** | Set up Pixieset (gallery) | Us |
| **Day 4-5** | Integration testing | Us |
| **Day 5** | QA + final testing | Us |
| **Day 6** | Handoff call with Sarah | Us + Sarah |

**Total elapsed time:** 6 days (mostly waiting for setup propagation)  
**Active work time:** ~7 hours

---

## 30-Day Support Plan

### What's Included

| Support Type | Duration | Scope |
|--------------|----------|-------|
| Email support | 30 days | Questions, troubleshooting |
| Minor adjustments | 30 days | Tweak timing, copy, settings |
| Bug fixes | 30 days | Automation failures, errors |

### What's NOT Included (Add-Ons)
- Adding new event types (+$47 each)
- Significant workflow changes (+$97 each)
- New tool integrations beyond scope
- Training additional team members

### Support Workflow
1. Sarah emails with issue/question
2. We acknowledge within 24 business hours
3. For bugs: fix within 48 hours
4. For tweaks: implement within 24 hours

### 30-Day Check-In
At Day 25, we'll schedule a 15-min call to:
- Review what's working
- Identify any needed adjustments
- Discuss expansion opportunities (Growth package)

---

## Sarah's Ongoing Responsibilities

To keep the system running smoothly, Sarah needs to:

1. **Upload photos to Pixieset** within her promised turnaround (manual)
2. **Monitor Wave** for any failed payments (check weekly)
3. **Update Calendly** if availability changes
4. **Reply to client inquiries** within her SLA

**Time savings:** 10-15 hours/month (previously spent on scheduling, invoicing, reminders)

---

## Estimated ROI

| Metric | Before | After |
|--------|--------|-------|
| Hours spent on admin/week | 2-3 hrs | ~30 min |
| No-show rate | ~15-20% | ~5% (with SMS) |
| Time to get paid | 2-4 weeks | Immediate |
| Client booking experience | Manual email tag | Self-serve 24/7 |

**At $497 one-time + ~$10/month:**
- Break-even in ~3 months (vs. hiring part-time assistant)
- Savings compound each month thereafter

---

## Next Steps

1. **Sarah approves this plan** — Reply "approved" or request changes
2. **Sarah provides prerequisites** — See "Prerequisites" section above
3. **We begin implementation** — Target: 6 days to fully functional
4. **Handoff call** — Walkthrough + training video delivery

---

## Questions for Sarah

Before we proceed, please clarify:

1. What are your current session prices for Portrait, Mini, and Consultation?
2. What's your typical turnaround time for gallery delivery?
3. Do you have existing branding (colors, logo) to use in the tools?
4. Preferred phone number for SMS (can be same as business number)?

---

*Document prepared by Avant Garde Automation*  
*Starter Package — Implementation Plan v1.0*