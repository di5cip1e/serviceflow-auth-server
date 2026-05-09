# Execution Checklist: Chen Photography — Starter Package

**Client:** Sarah Chen (Chen Photography)  
**Package:** Starter ($497)  
**Status:** Ready to Execute (Pending Prerequisites)

---

## Prerequisites Required from Sarah

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Google Account access (for Wave, Make, Calendly) | ⬜ | |
| 2 | Business bank account (for Stripe) | ⬜ | |
| 3 | Phone number for SMS | ⬜ | |
| 4 | Current pricing/packages | ⬜ | |
| 5 | Intake form questions | ⬜ | |
| 6 | Preferred session locations | ⬜ | |

---

## Automation 1: Calendly Booking Setup

### Phase 1: Account Creation
- [ ] Go to calendly.com, sign up with Google
- [ ] Verify email
- [ ] Complete profile: name, "Chen Photography", timezone CST

### Phase 2: Event Types (45 min)
- [ ] **Portrait Session** (60 min)
  - Duration: 60 min
  - Location: Add studio + outdoor options
  - Buffer: 15 min
  - Availability: M-F 9am-5pm, Sat 9am-2pm
- [ ] **Mini Session** (30 min)
  - Same structure
- [ ] **Free Discovery Call** (15 min)
  - Video call enabled

### Phase 3: Intake Questions (20 min)
- [ ] Name (default)
- [ ] Email (default)
- [ ] Phone number
- [ ] Preferred session location (dropdown)
- [ ] What's the occasion? (birthday, family, headshot, etc.)
- [ ] How did you hear about me?

### Phase 4: Calendar Integration (10 min)
- [ ] Connect Google Calendar
- [ ] Test sync with sample booking

### Phase 5: Branding (10 min)
- [ ] Upload logo
- [ ] Set brand colors
- [ ] Write welcome message
- [ ] Add cancellation policy

### Testing
- [ ] Book test appointment through Calendly
- [ ] Verify appears on Google Calendar
- [ ] Confirm email notification
- [ ] Check intake answers

**Blocked by:** Sarah's Google account, pricing info, intake questions

---

## Automation 2: Wave Invoicing + Stripe Payments

### Phase 1: Wave Setup (30 min)
- [ ] Sign up at waveapps.com with Google
- [ ] Complete business profile: "Chen Photography"
- [ ] Add business address
- [ ] Set payment terms (Due upon receipt)

### Phase 2: Stripe Integration (15 min)
- [ ] Connect Stripe in Wave settings
- [ ] Complete Stripe onboarding
- [ ] Test connection

### Phase 3: Invoice Templates (20 min)
- [ ] Portrait Session template
- [ ] Mini Session template
- [ ] Enable Stripe payment links

### Phase 4: Make Automation (45 min)
- [ ] **Scenario A:** New booking → Create invoice
  - Trigger: Webhook from Calendly
  - Action: Create customer in Wave
  - Action: Create invoice from template
  - Action: Send invoice
- [ ] **Scenario B:** Payment received → Notify Sarah
  - Trigger: Stripe webhook
  - Action: Send notification
- [ ] **Scenario C:** Overdue → Send reminder
  - Trigger: Daily at 9am
  - Action: Get overdue invoices
  - Action: Send reminder

### Testing
- [ ] Create test invoice
- [ ] Send to test email
- [ ] Complete mock payment
- [ ] Verify notification

**Blocked by:** Sarah's Google account, Stripe onboarding, business info

---

## Automation 3: Twilio SMS Reminders

### Phase 1: Twilio Setup (15 min)
- [ ] Sign up at twilio.com
- [ ] Verify email + phone
- [ ] Get phone number ($1/month)
- [ ] Note: Account SID, Auth Token, phone number

### Phase 2: Make Connection (10 min)
- [ ] Add Twilio module in Make
- [ ] Enter credentials
- [ ] Test connection

### Phase 3: Automation Build (30 min)
- [ ] Trigger: Google Calendar event (24h before)
- [ ] Filter: Event is session type
- [ ] Get: Event details (phone, name, time, location)
- [ ] Action: Send SMS via Twilio
- [ ] Message template: "Hi {name}! Reminder: Your session with Chen Photography is tomorrow at {time}. Location: {location}. Reply CANCEL to reschedule."

### Phase 4: Opt-Out Handling (10 min)
- [ ] Add STOP reply handler
- [ ] Create suppression list

### Testing
- [ ] Send test SMS
- [ ] Create calendar event for tomorrow, verify SMS triggers
- [ ] Test opt-out flow

**Blocked by:** Sarah's phone number verification, Twilio account

---

## Automation 4: Pixieset Gallery Delivery

### Phase 1: Account Setup (20 min)
- [ ] Sign up at pixieset.com
- [ ] Complete business profile
- [ ] Upload logo, set brand colors
- [ ] Create "Chen Photography" theme

### Phase 2: Settings (15 min)
- [ ] Gallery expiration: 90 days
- [ ] Password protection (optional)
- [ ] Download options: Original + web
- [ ] Watermark (if desired)
- [ ] Email notifications configured

### Phase 3: Folder Structure (15 min)
- [ ] /Portraits/
- [ ] /Mini Sessions/
- [ ] /Consultations/

### Phase 4: Automation (30 min)
- [ ] Option A: Manual (Sarah uploads, link sent)
- [ ] Option B: Automated (Make triggers on upload)
  - Pixieset sends email (built-in)
  - Make sends follow-up SMS

### Testing
- [ ] Upload test photos
- [ ] Verify client email
- [ ] Test gallery viewing/download
- [ ] Test SMS (if automated)

**Blocked by:** Sarah's Pixieset account, branding assets

---

## Integration Testing (Pre-Handoff)

### Full Journey Test
- [ ] Client books via Calendly
- [ ] Invoice generated in Wave
- [ ] Payment made via Stripe
- [ ] 24h SMS reminder triggers
- [ ] Gallery delivered via Pixieset

### Client Handoff
- [ ] Login credentials documented
- [ ] Workflow diagrams delivered
- [ ] Video walkthroughs (3 x 5-min)
- [ ] Support contact info shared
- [ ] 30-day check-in scheduled

---

## Time Estimates

| Automation | Prep Work | Client-Dependent | Total |
|------------|-----------|------------------|-------|
| Calendly | 45 min | 1.5 hrs | 2 hrs |
| Wave/Stripe | 1 hr | 1.5 hrs | 2.5 hrs |
| Twilio | 30 min | 1 hr | 1.5 hrs |
| Pixieset | 30 min | 1 hr | 1.5 hrs |
| Testing | 1 hr | — | 1 hr |
| **TOTAL** | **3.5 hrs** | **5 hrs** | **8.5 hrs** |

---

## Decisions Needed from Derek

1. **Make vs Zapier:** Implementation plan suggests Make. Confirm?
2. **Twilio phone number:** Use Sarah's existing or new dedicated number?
3. **Automation complexity:** Start with Option A (manual gallery link) or go straight to Option B (automated)?
4. **Timeline:** What's the target completion date once Sarah provides credentials?