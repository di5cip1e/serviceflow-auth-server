const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

const SECRETS_PATH = '/root/.openclaw/secrets.json';
let secrets = {};
try { secrets = require(SECRETS_PATH); } catch(e) { secrets = {}; }

// Resend API integration
async function sendViaResend(to, subject, text, html) {
  if (!secrets.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secrets.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: secrets.RESEND_FROM || 'M.ai.K.R <noreply@maikr.pro>',
        to: [to],
        subject: subject,
        text: text,
        html: html || undefined
      })
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('Resend API error:', res.status, json);
      return { success: false, error: json.message || 'Resend API error', status: res.status };
    }
    return { success: true, messageId: json.id };
  } catch (e) {
    console.error('Resend send error:', e.message);
    return { success: false, error: e.message };
  }
}

module.exports = {
  isSuppressed(agentSettings) {
    // Simple stub: check DND window in agentSettings (expects dnd_start_time/dnd_end_time and dnd_days)
    if (!agentSettings || !agentSettings.dnd_days) return false;
    try {
      const now = new Date();
      const day = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
      if (agentSettings.dnd_days.includes(day)) {
        const start = agentSettings.dnd_start_time || '22:00';
        const end = agentSettings.dnd_end_time || '08:00';
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        const nowMinutes = now.getUTCHours()*60 + now.getUTCMinutes();
        const startMinutes = sh*60 + sm;
        const endMinutes = eh*60 + em;
        if (startMinutes < endMinutes) {
          return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
        }
        return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
      }
    } catch(e) {
      return false;
    }
    return false;
  },

  async sendEmail(to, subject, body, htmlBody) {
    // 1. Try Resend first (preferred provider)
    if (secrets.RESEND_API_KEY) {
      const resendResult = await sendViaResend(to, subject, body, htmlBody);
      if (resendResult.success) return resendResult;
      console.error('Resend failed, trying fallback:', resendResult.error);
    }

    // 2. Fallback: Mailgun
    if (secrets.MAILGUN_API_KEY) {
      try {
        const domain = secrets.MAILGUN_DOMAIN || (secrets.MAILGUN_FROM || secrets.SENDGRID_FROM || secrets.SMTP_FROM || '').split('@')[1];
        if (!domain) {
          console.log('alerter.sendEmail: MAILGUN_DOMAIN not configured, cannot send');
          return { success: false, error: 'MAILGUN_DOMAIN missing' };
        }
        const url = `https://api.mailgun.net/v3/${domain}/messages`;
        const params = new URLSearchParams();
        params.append('from', secrets.MAILGUN_FROM || (secrets.SENDGRID_FROM || 'no-reply@maikr.pro'));
        params.append('to', to);
        params.append('subject', subject);
        params.append('text', body);
        if (htmlBody) params.append('html', htmlBody);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from('api:' + secrets.MAILGUN_API_KEY).toString('base64')
          },
          body: params
        });
        const json = await res.text();
        if (!res.ok) {
          console.error('Mailgun API error:', res.status, json);
        }
        return { success: res.ok, status: res.status, resp: json };
      } catch (e) {
        console.error('Mailgun send error', e.message);
        return { success: false, error: e.message };
      }
    }

    if (!secrets.SENDGRID_API_KEY && !secrets.SMTP_HOST) {
      console.log('alerter.sendEmail: no email provider configured (dry run)');
      return { success: true, dryRun: true };
    }
    if (secrets.SENDGRID_API_KEY) {
      // Simple SendGrid v3 mail send
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secrets.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: secrets.SENDGRID_FROM || 'no-reply@maikr.pro' },
          subject: subject,
          content: [{ type: 'text/plain', value: body }]
        })
      });
      return { success: res.ok, status: res.status };
    }
    // Fallback: SMTP
    const transporter = nodemailer.createTransport({
      host: secrets.SMTP_HOST,
      port: secrets.SMTP_PORT || 587,
      secure: !!secrets.SMTP_SECURE,
      auth: { user: secrets.SMTP_USER, pass: secrets.SMTP_PASS }
    });
    await transporter.sendMail({ from: secrets.SMTP_FROM, to, subject, text: body });
    return { success: true };
  },

  async sendSMS(to, body) {
    if (!secrets.TWILIO_API_KEY || !secrets.TWILIO_API_SECRET) {
      console.log('alerter.sendSMS: no twilio creds (dry run)');
      return { success: true, dryRun: true };
    }
    // Twilio API (API Key + Secret backing account credentials) - using basic auth with account SID would be better
    // Here we expect TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in secrets for a full implementation.
    if (!secrets.TWILIO_ACCOUNT_SID || !secrets.TWILIO_AUTH_TOKEN) {
      console.log('alerter.sendSMS: twilio account credentials missing (dry run)');
      return { success: true, dryRun: true };
    }
    const url = `https://api.twilio.com/2010-04-01/Accounts/${secrets.TWILIO_ACCOUNT_SID}/Messages.json`;
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', secrets.TWILIO_FROM);
    params.append('Body', body);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + Buffer.from(secrets.TWILIO_ACCOUNT_SID + ':' + secrets.TWILIO_AUTH_TOKEN).toString('base64') },
      body: params
    });
    const json = await resp.json();
    return { success: resp.ok, resp: json };
  },

  async sendAlertIfNeeded(agentId, escalationType, customerMessage, alertSettings) {
    try {
      const settings = alertSettings || {};
      if (this.isSuppressed(settings)) {
        console.log('Alert suppressed by DND');
        return { suppressed: true };
      }
      const method = settings.notification_method || 'email';
      const recipientEmail = settings.alert_email;
      const recipientPhone = settings.alert_phone;
      const subject = `M.ai.K.R Alert: ${escalationType} for agent ${agentId}`;
      const body = `Escalation detected: ${escalationType}\nAgent: ${agentId}\nCustomer message: ${customerMessage}`;
      const results = {};
      if ((method === 'email' || method === 'both') && recipientEmail) {
        results.email = await this.sendEmail(recipientEmail, subject, body);
      }
      if ((method === 'sms' || method === 'both') && recipientPhone) {
        results.sms = await this.sendSMS(recipientPhone, body);
      }
      console.log('alerter.sendAlertIfNeeded results:', results);
      return { success: true, results };
    } catch(e) {
      console.error('alerter error', e);
      return { success: false, error: e.message };
    }
  }
};
