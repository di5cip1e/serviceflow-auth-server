# Appointment Scheduling Demo

## Overview
Complete appointment workflow: Calendly booking → Add to CRM → Send confirmation → Reminder 24h before → Post-meeting follow-up.

## Trigger
- Type: Calendly event booked
- Source: Calendly / Cal.com / Acuity Scheduling

---

## Workflow Steps

### Step 1: Calendly Booking Trigger
**Action:** Watch for new event

**Tools:** Zapier (Calendly Invitee Created) / Make (Calendly module)

**Captured Data:**
- Invitee name
- Invitee email
- Event type
- Event start time
- Event end time
- Location/Zoom link
- Questions/notes

---

### Step 2: Add to CRM
**Action:** Create contact in CRM

**Tools:** HubSpot / Pipedrive / Salesforce / Notion

**Contact Fields:**
| Calendly Data | CRM Field |
|--------------|-----------|
| Name | Contact Name |
| Email | Email |
| Event Type | Deal/Opportunity Type |
| Start Time | Appointment Date |
| Notes | Description |

**Optional Enhancement:**
- Create deal/opportunity attached to contact
- Set appointment reminder task

---

### Step 3: Send Confirmation Email
**Action:** Send booking confirmation

**Tools:** Gmail / SendGrid

**Email Template:**
```
Subject: Your appointment is confirmed - {{event_date}} at {{event_time}}

Hi {{name}},

Your appointment has been scheduled!

📅 **Date:** {{event_date}}
🕐 **Time:** {{event_time}}
📍 **Location:** {{meeting_location}}

**Preparing for our call:**
1. [Pre-call questionnaire link]
2. [Relevant resources]
3. [What to expect]

Need to reschedule? [Calendly reschedule link]

See you soon!
```

**Timing:** Immediate (within 1 minute of booking)

---

### Step 4: Schedule Reminder (24h Before)
**Action:** Delay then send reminder

**Tools:** Zapier (Delay until) / Make (Sleep + Schedule)

**Trigger Time:** Event start - 24 hours

**Reminder Email Template:**
```
Subject: Reminder: Our meeting tomorrow at {{event_time}}

Hi {{name}},

Just a friendly reminder about our meeting tomorrow!

📅 **Tomorrow at {{event_time}}**
📍 **{{meeting_location}}**

**To prepare:**
- [Link to pre-meeting prep]
- [Any documents to have ready]

Questions before we meet? Just reply to this email.

See you tomorrow!
```

---

### Step 5: Post-Meeting Follow-up
**Action:** Send follow-up after meeting ends

**Tools:** Zapier (Delay until) / Make (Sleep + Email)

**Trigger Time:** Event end time

**Follow-up Email Template:**
```
Subject: Thanks for meeting, {{name}}!

Hi {{name}},

Thanks for taking the time to meet today. I enjoyed our conversation about {{topics_discussed}}.

**Next steps:**
- [Action item 1]
- [Action item 2]
- [Proposal/follow-up timeline]

[Meeting notes summary - if applicable]

Looking forward to working together!

Best,
The Team
```

---

## Tools Required

| Tool | Purpose | Cost |
|------|---------|------|
| Calendly / Cal.com | Scheduling | Free / Free |
| Zapier OR Make | Workflow automation | Free tier / Free tier |
| HubSpot / Notion | CRM | Free tier / Free |
| Gmail | Emails | Free |
| Google Calendar | Calendar sync | Free |

---

## Time to Build
- **Estimated:** 1.5-2.5 hours
- **Breakdown:**
  - Calendly setup: 15 min
  - CRM integration: 20 min
  - Confirmation email: 15 min
  - Reminder workflow: 20 min
  - Post-meeting setup: 20 min
  - Testing with test events: 30 min
  - Edge case handling: 30 min

---

## Potential Issues

### ⚠️ High Priority
1. **Time zone confusion** - Always store in UTC, display in local time
2. **Booking cancellations** - Handle cancelled events gracefully
3. **No-show handling** - Send follow-up email even if no show

### Medium Priority
4. **Double bookings** - Calendly handles this, but verify CRM doesn't create dupes
5. **Email deliverability** - Use authenticated domain
6. **Missing meeting link** - Include fallback Zoom/link in CRM

### Low Priority
7. **Different event types** - Create separate workflows per event type
8. **Attendee vs. invitee** - Handle both primary and additional attendees
9. **Rescheduling** - Update CRM on reschedule, don't create duplicate

---

## Implementation Notes

- Use Calendly's native notifications + custom workflow for redundancy
- Store meeting notes in CRM for post-meeting reference
- Track "no-show" rate for sales optimization
- Add booking to Google Calendar automatically via Zapier
- Include one-click feedback survey link in follow-up
- Consider: Slack notification to sales rep on new booking