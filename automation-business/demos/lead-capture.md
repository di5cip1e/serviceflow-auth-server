# Lead Capture Demo

## Overview
Automated lead capture from form submissions, adding to spreadsheet, sending welcome email, and creating task in project tool.

## Trigger
- Type: Webhook / Form submission
- Source: Typeform, Google Forms, or custom web form

---

## Workflow Steps

### Step 1: Form Submission Trigger
**Action:** Catch hook / Watch form responses

**Tools:** Zapier (Catch Hook) / Make (HTTP Webhook)

**Input Fields Captured:**
- Name
- Email
- Phone
- Company
- Service Interest
- Message/Notes

---

### Step 2: Add to Spreadsheet
**Action:** Create new row in Google Sheets

**Tools:** Google Sheets

**Mapping:**
| Form Field | Spreadsheet Column |
|------------|-------------------|
| Name | A (Name) |
| Email | B (Email) |
| Phone | C (Phone) |
| Company | D (Company) |
| Service Interest | E (Service) |
| Timestamp | F (Date Added) |
| Status | G (New) |

**Conditional Logic:** None

---

### Step 3: Send Welcome Email
**Action:** Send personalized welcome email

**Tools:** Gmail / Mailgun / SendGrid / Loops

**Email Template:**
```
Subject: Thanks for reaching out, {{name}}!

Hi {{name}},

Thanks for your interest in our automation services. We've received your inquiry about {{service_interest}} and will be in touch within 24 hours.

Here's what happens next:
1. We'll review your requirements
2. Schedule a free discovery call
3. Send a custom proposal

Talk soon,
The Team
```

**Personalization:** Use name and service interest from form data

---

### 4: Create Task in Project Tool
**Action:** Create task in project management tool

**Tools:** Asana / Trello / Notion / ClickUp

**Task Details:**
- **Title:** "Follow up: {{name}} - {{company}}"
- **Description:** 
  ```
  New lead from {{service_interest}} inquiry
  
  Contact: {{email}}
  Phone: {{phone}}
  Company: {{company}}
  Notes: {{message}}
  ```
- **Assignee:** Sales team member
- **Due Date:** +1 business day
- **Tag:** "new-lead"

---

## Tools Required

| Tool | Purpose | Cost |
|------|---------|------|
| Typeform / Google Forms | Lead capture form | Free / Free |
| Zapier OR Make | Workflow automation | Free tier / Free tier |
| Google Sheets | Lead database | Free |
| Gmail | Email delivery | Free |
| Asana / Notion | Task management | Free tier / Free |

---

## Time to Build
- **Estimated:** 1-2 hours
- **Breakdown:**
  - Form setup: 15 min
  - Spreadsheet setup: 10 min
  - Zapier/Make workflow: 30-45 min
  - Email template: 15 min
  - Task integration: 15 min
  - Testing: 15 min

---

## Potential Issues

### ⚠️ High Priority
1. **Form submission not triggering** - Ensure webhook is properly connected; test with sample data
2. **Email deliverability** - Warm up new email accounts; check spam filters

### Medium Priority
3. **Spreadsheet sync delays** - Add timestamp to track; consider caching
4. **Task assignment routing** - Need clear rules for auto-assignment

### Low Priority
5. **Duplicate entries** - Add deduplication logic based on email
6. **Data validation** - Form may receive incomplete submissions; add required fields

---

## Implementation Notes

- Start with Zapier for easiest setup, migrate to Make for cost savings at scale
- Use consistent naming convention for spreadsheet columns
- Set up email templates in HTML for branded look
- Consider adding lead scoring based on service interest