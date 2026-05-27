const express = require('express');
const router = express.Router();
const { getSecret } = require('../bootstrap');

// POST /api/feedback — receive feedback form and email it
router.post('/', async (req, res) => {
  try {
    const { type, name, email, rating, feedback, bug } = req.body;

    if (!type || !feedback) {
      return res.status(400).json({ error: 'Type and feedback are required' });
    }

    // Build email subject
    const typeLabels = {
      general: 'General Feedback',
      feature: 'Feature Request',
      bug: '🐛 Bug Report',
      ux: 'UX / Design Feedback',
      performance: 'Performance Issue',
      other: 'Other Feedback',
    };
    const subject = `[M.ai.K.R Feedback] ${typeLabels[type] || type}${bug?.title ? ': ' + bug.title : ''}`;

    // Build email body
    let body = `New feedback received on maikr.pro\n`;
    body += `${'='.repeat(50)}\n\n`;
    body += `Type: ${typeLabels[type] || type}\n`;
    body += `From: ${name || 'Anonymous'} ${email ? `<${email}>` : ''}\n`;
    body += `Rating: ${rating > 0 ? '★'.repeat(rating) + '☆'.repeat(5 - rating) + ` (${rating}/5)` : 'Not rated'}\n`;
    body += `Time: ${new Date().toISOString()}\n\n`;
    body += `Feedback:\n${feedback}\n`;

    // Bug-specific fields
    if (type === 'bug' && bug) {
      body += `\n${'─'.repeat(40)}\n`;
      body += `BUG DETAILS\n`;
      body += `${'─'.repeat(40)}\n\n`;
      body += `Title: ${bug.title}\n`;
      body += `Severity: ${bug.severity ? bug.severity.toUpperCase() : 'Not specified'}\n`;
      body += `Page: ${bug.page || 'Not specified'}\n`;
      body += `Device: ${bug.device || 'Not specified'}\n`;
      if (bug.screenshot) body += `Screenshot: ${bug.screenshot}\n`;
      body += `\nSteps to Reproduce:\n${bug.steps || 'Not provided'}\n`;
      body += `\nExpected Behavior:\n${bug.expected || 'Not provided'}\n`;
      body += `\nActual Behavior:\n${bug.actual || 'Not provided'}\n`;
    }

    body += `\n${'='.repeat(50)}\n`;
    body += `Sent from maikr.pro feedback form`;

    // Get Resend credentials from secrets
    const RESEND_API_KEY = getSecret('RESEND_API_KEY');
    const RESEND_FROM = getSecret('RESEND_FROM') || 'feedback@maikr.pro';
    const DEREK_EMAIL = process.env.DEREK_EMAIL || 'derekbrooks@aginstitute.tech';

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      console.log('FEEDBACK (not emailed):', subject, '\n', body);
      return res.json({ success: true, message: 'Feedback logged (email not configured)' });
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: DEREK_EMAIL,
        reply_to: email || undefined,
        subject,
        text: body,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('Resend error:', emailRes.status, errText);
      return res.status(502).json({ error: 'Failed to send email' });
    }

    console.log('Feedback email sent:', subject);
    res.json({ success: true, message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Feedback route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
