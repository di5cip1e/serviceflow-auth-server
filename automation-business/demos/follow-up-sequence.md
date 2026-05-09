# Follow-up Sequence Demo

## Overview
Automated follow-up sequence for new leads: wait period, send follow-up, check response, and escalate if no reply.

## Trigger
- Type: New row added to Google Sheets
- Source: Lead Capture workflow or manual entry

---

## Workflow Steps

### Step 1: New Lead Added to Spreadsheet
**Action:** Watch for new rows

**Tools:** Zapier (New Spreadsheet Row) / Make (Watch Rows)

**Spreadsheet Columns Required:**
- Email
- Name
- Company
- Status (New → Contacted → Qualified → Lost)
- Last Contact Date
- Response Status

---

### Step 2: Wait 1 Day
**Action:** Delay before first follow-up

**Tools:** Zapier (Delay) / Make (Sleep)

**Duration:** 1 day (24 hours)

**Optional Enhancement:**
- Set different wait times based on lead source
- Skip weekends option

---

### Step 3: Send Follow-up Email
**Action:** Send second email if no response

**Tools:** Gmail / Mailgun

**Email Template:**
```
Subject: Following up on your inquiry, {{name}}

Hi {{name}},

Just wanted to follow up on our initial message about {{service_interest}} for {{company}}.

I understand things get busy - would you have 15 minutes this week for a quick chat? We're happy to help with:

• Process automation to save time
• Integrating your tools seamlessly  
• Building custom workflows

Reply to schedule or just book a time directly: [calendar_link]

Best,
The Team
```

**Conditional Logic:**
- Only send if Status = "New" (not already converted)

---

### Step 4: Check for Response
**Action:** Wait for reply to follow-up email

**Tools:** Zapier (Email Parser) / Make (Email module)

**Check Duration:** 2 days

**Response Indicators:**
- Email reply received
- Calendar booking made
- Form submission updated

---

### Step 5: Update Lead Status
**Action:** Update spreadsheet based on response

**Tools:** Google Sheets (Update Row)

**If Responded:**
- Status → "Contacted"
- Response Status → "Replied"
- Last Contact Date → NOW()

**If No Response After 2 Days:**
- Proceed to Step 6 (Escalation)

---

### Step 6: Escalate if No Reply
**Action:** Alert team and flag lead

**Tools:** Slack / Email to manager / Trello

**Actions:**
1. Send Slack alert: "🔔 Lead needs attention: {{name}} ({{company}}) hasn't responded after 2 follow-ups"
2. Update spreadsheet: Status → "Needs Attention"
3. Create task in project tool for manual follow-up
4. Move to "stale leads" view

---

## Tools Required

| Tool | Purpose | Cost |
|------|---------|------|
| Google Sheets | Lead tracking | Free |
| Zapier OR Make | Workflow automation | Free tier / Free tier |
| Gmail | Follow-up emails | Free |
| Slack | Team notifications | Free |
| Asana / Notion | Task management | Free tier |

---

## Time to Build
- **Estimated:** 1.5-2 hours
- **Breakdown:**
  - Spreadsheet setup with status columns: 15 min
  - Initial workflow: 30 min
  - Wait/delay setup: 10 min
  - Email templates: 20 min
  - Response tracking logic: 20 min
  - Escalation notifications: 15 min
  - Testing: 20 min

---

## Potential Issues

### ⚠️ High Priority
1. **Email going to spam** - Authenticate domain, use dedicated sending address
2. **Response detection failing** - Use email thread tracking, not just new emails

### Medium Priority
3. **Time zone handling** - Set business hours, consider sender timezone
4. **Reply coming from different email** - Use email matching on thread ID

### Low Priority
5. **Lead receiving both emails** - Add check for existing communication
6. **Too many escalations** - Tune timing before flagging as "stale"
7. **GDPR compliance** - Include unsubscribe link, honor opt-outs

---

## Implementation Notes

- Start with simple 2-step follow-up, expand as needed
- Track email open rates to optimize send times
- Consider lead value when deciding escalation urgency
- Build "do not contact" logic for unsubscribe requests
- A/B test email subject lines for higher open rates