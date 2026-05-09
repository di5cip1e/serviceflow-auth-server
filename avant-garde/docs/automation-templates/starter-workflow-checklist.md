# Starter Workflow Checklist

> $497 Starter Package — Specific automations included and how to implement them.
> Focus: Solopreneur service businesses (photographers, consultants, cleaners, trainers).

---

## Package Overview

**What's included:**
- 1 workflow automation
- Process audit & optimization recommendations
- Tool selection guidance
- 30-day support for adjustments
- Training video walkthrough

**Typical time savings:** 5-10 hours/month

---

## Available Workflow Options

Choose ONE of the following workflows. Each is designed for solopreneurs.

---

### Workflow 1: Client Intake & Inquiry Management

**Best for:** Photographers, Consultants, Trainers  
**Primary tools:** Google Forms + Gmail + Google Sheets  
**Alternatives:** Typeform, HubSpot CRM, Notion

**What it automates:**
New inquiries come in → logged to spreadsheet → confirmation email sent → task created in your task manager

**Checklist:**

- [ ] **Setup Google Form** with fields: Name, Email, Phone, Service Interest, Message, How did you hear about us?
- [ ] **Connect Form to Google Sheet** for automatic logging
- [ ] **Create Gmail template** for auto-reply (confirmation + next steps)
- [ ] **Set up Zapier/Make automation:**
  - Trigger: New form response
  - Action 1: Create row in Google Sheets (inquiry log)
  - Action 2: Send email via Gmail (auto-reply)
  - Action 3 (optional): Create task in Todoist/Asana/Trello
- [ ] **Test with dummy submission**
- [ ] **Verify email deliverability** (check spam folder)

**Time to build:** 2-3 hours

---

### Workflow 2: Appointment Scheduling & Confirmations

**Best for:** Consultants, Personal Trainers, Photographers  
**Primary tools:** Calendly/Acuity + Gmail/Google Calendar  
**Alternatives:** Square Appointments, Setmore

**What it automates:**
Client books appointment → calendar updated → confirmation email sent → reminder sent 24h before

**Checklist:**

- [ ] **Verify Calendly/Acuity account** is connected and working
- [ ] **Create booking types** (if not already set up)
- [ ] **Design confirmation email template** in Calendly (or via Zapier)
- [ ] **Set up Zapier/Make automation:**
  - Trigger: New booking created
  - Action 1: Add to Google Sheets (booking log)
  - Action 2: Send confirmation email (if not built into Calendly)
  - Action 3: Add to Google Calendar (if needed for tracking)
- [ ] **Enable calendar reminders** (24h, 1h before)
- [ ] **Test by making a test booking**

**Time to build:** 1-2 hours

---

### Workflow 3: Invoice Creation & Payment Follow-Ups

**Best for:** All solopreneurs  
**Primary tools:** QuickBooks/Xero + Gmail + Stripe/PayPal  
**Alternatives:** Wave, FreshBooks, Square Invoices

**What it automates:**
Service completed → invoice created → sent to client → payment reminder sent if overdue

**Checklist:**

- [ ] **Confirm QuickBooks/FreshBooks account** access and client list
- [ ] **Create invoice template** with your branding
- [ ] **Set up Zapier/Make automation (Option A — from booking):**
  - Trigger: New Calendly booking / New row in booking log
  - Action: Create invoice in QuickBooks/FreshBooks
  - Action: Send invoice via email
- [ ] **Set up payment reminder automation (Option B — follow-up):**
  - Trigger: Scheduled (every day at 9am)
  - Filter: Invoice status = Overdue
  - Action: Send payment reminder email
- [ ] **Test both flows** with test invoices

**Time to build:** 2-3 hours

---

### Workflow 4: Lead Capture from Website/Forms

**Best for:** All solopreneurs with websites  
**Primary tools:** Contact Form 7 (WordPress) / Typeform / Squarespace Forms + CRM  
**Alternatives:** JotForm, HubSpot Forms

**What it automates:**
Visitor submits contact form → added to CRM → assigned to you → auto-response sent

**Checklist:**

- [ ] **Verify form is working** on website (test submission)
- [ ] **Confirm CRM access** (HubSpot Free, Pipedrive, or Notion database)
- [ ] **Set up Zapier/Make automation:**
  - Trigger: New form submission
  - Action 1: Create contact in CRM
  - Action 2: Send to specific pipeline/stage
  - Action 3: Send auto-response email to lead
- [ ] **Set up notification to you** (Slack or email when new lead)
- [ ] **Test with real form submission**

**Time to build:** 1-2 hours

---

### Workflow 5: Client Communication Templates

**Best for:** Photographers, Consultants, Trainers  
**Primary tools:** Gmail + Google Sheets (for personalization)  
**Alternatives:** Mailchimp, ConvertKit

**What it automates:**
You label an email in Gmail → templated response sent → logged to spreadsheet

**Checklist:**

- [ ] **Create template texts** for common responses:
  - Initial inquiry response
  - Booking confirmation
  - Follow-up after service
  - Thank you / review request
- [ ] **Set up Google Sheet** with template rows (if using dynamic data)
- [ ] **Set up Zapier/Make automation:**
  - Trigger: Label added to Gmail message (e.g., "Send Quote")
  - Action 1: Look up template in Google Sheet
  - Action 2: Send templated email via Gmail
  - Action 3: Log to spreadsheet (tracking)
- [ ] **Create Gmail labels** for each workflow trigger
- [ ] **Test by labeling a test email**

**Time to build:** 1-2 hours

---

### Workflow 6: Social Media Content Scheduling

**Best for:** Photographers, Consultants, Trainers  
**Primary tools:** Buffer / Later / Planable + Google Sheets (content calendar)  
**Alternatives:** Publer, MeetEdgar

**What it automates:**
You add content to spreadsheet → automation posts to social media on scheduled date

**Checklist:**

- [ ] **Create content calendar in Google Sheets** with columns: Date, Platform, Content, Image URL, Link
- [ ] **Connect Buffer/Later account** via API
- [ ] **Set up Zapier/Make automation:**
  - Trigger: New row added to Google Sheets (or date reached)
  - Action: Format post for platform
  - Action: Create post in Buffer/Later
  - Action: Mark row as "Posted" in sheet
- [ ] **Set up image handling** (upload to platform or use URL)
- [ ] **Test with one scheduled post**

**Time to build:** 2-3 hours

---

## Standard Implementation Checklist (Any Workflow)

### Phase 1: Discovery & Prep

- [ ] Client questionnaire completed
- [ ] Current process documented (client provides screenshots/steps)
- [ ] Tools identified and access confirmed
- [ ] Tool accounts verified (can log in, have permissions)

### Phase 2: Build

- [ ] Set up Zapier/Make account (or confirm client has one)
- [ ] Create required accounts in connected tools
- [ ] Build trigger configuration
- [ ] Build action steps
- [ ] Add filters/conditions (if needed)
- [ ] Add error handling (failure notifications)

### Phase 3: Test

- [ ] Run at least 3 test scenarios
- [ ] Test edge cases (empty fields, unusual inputs)
- [ ] Verify data maps correctly between tools
- [ ] Confirm error notifications work

### Phase 4: Deliver

- [ ] Create workflow diagram
- [ ] Record walkthrough video (Loom)
- [ ] Write runbook (1 page)
- [ ] Send handoff email with all materials
- [ ] Schedule walkthrough call with client

### Phase 5: Support (30 Days)

- [ ] Respond to questions within 48 hours
- [ ] Fix any bugs discovered
- [ ] Make reasonable adjustments
- [ ] Day 30: Check-in for testimonial

---

## Common Issues & Fixes

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| Trigger not firing | Wrong account connected, filter too strict | Check connected account, review trigger logs |
| Data not mapping | Field names don't match | Verify field mapping in Zapier/Make |
| Email not sending | Permission issues, spam filter | Use "Send via Gmail" action, check sent folder |
| Infinite loop | Action triggers another run | Add filter to prevent re-triggering |
| Test works, live fails | Real data different from test | Add default fallbacks for empty fields |

---

## Tools Quick Reference

| Purpose | Free Tier Options | Paid (if needed) |
|---------|-------------------|------------------|
| Automation | Zapier (free up to 100 runs), Make (free up to 1000 ops) | Zapier $20/mo, Make $9/mo |
| Forms | Google Forms (free), Typeform (free up to 10 Qs) | Typeform $25/mo |
| Spreadsheets | Google Sheets (free) | — |
| CRM | HubSpot Free CRM, Pipedrive (free trial) | — |
| Calendar | Calendly (free), Google Calendar (free) | Calendly $8/mo |
| Invoicing | Wave (free), Square Invoices (free) | — |
| Email | Gmail (free), Google Workspace $6/mo | — |
| Scheduling | Buffer (free), Later (free) | Buffer $15/mo, Later $12.50/mo |

---

*Document version: 1.0 | For $497 Starter Package | Created: March 2025*