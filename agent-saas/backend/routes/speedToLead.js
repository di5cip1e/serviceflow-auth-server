/**
 * Speed-to-Lead Routes
 * 
 * Instant lead ingestion + AI-powered outreach the moment a lead comes in.
 * 
 * PUBLIC (webhook — no auth):
 *   POST /api/speed-to-lead/ingest/:agentId          — Ingest a lead from ad platform / form
 *   POST /api/speed-to-lead/webhook/google-ads       — Google Ads lead form webhook
 *   POST /api/speed-to-lead/webhook/meta-leads       — Meta Lead Ads webhook
 *   GET  /api/speed-to-lead/webhook/meta-leads       — Meta webhook verification
 *   POST /api/speed-to-lead/webhook/form             — Generic form submission webhook
 * 
 * PROTECTED (auth required):
 *   GET    /api/speed-to-lead/:agentId                — Get all speed-to-lead events
 *   GET    /api/speed-to-lead/stats/:agentId          — Get response time + conversion stats
 *   GET    /api/speed-to-lead/event/:eventId          — Get single event with outreach history
 *   POST   /api/speed-to-lead/config/:agentId         — Configure speed-to-lead settings
 *   GET    /api/speed-to-lead/config/:agentId         — Get current config
 *   POST   /api/speed-to-lead/retry/:eventId          — Manually retry outreach
 *   PUT    /api/speed-to-lead/status/:eventId         — Update lead status
 *   DELETE /api/speed-to-lead/event/:eventId          — Delete event
 */

const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');
const alerter = require('../services/alerter');

// ── Helpers ──────────────────────────────────────────────────────────────────

// Auth middleware (for protected routes only)
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Verify agent ownership
async function verifyAgentAccess(agentId, userId) {
  return new Promise((resolve) => {
    db.get(
      `SELECT a.id, a.agent_name, a.business_name, a.industry, a.tone,
              a.target_audience, a.use_cases, c.user_id
       FROM agents a
       JOIN customers c ON a.customer_id = c.id
       WHERE a.id = ? AND c.user_id = ?`,
      [agentId, userId],
      (err, row) => resolve(row || null)
    );
  });
}

// Get speed-to-lead config (with defaults)
async function getSpeedConfig(agentId) {
  return new Promise((resolve) => {
    db.get(
      `SELECT * FROM speed_to_lead_configs WHERE agent_id = ?`,
      [agentId],
      (err, row) => {
        if (row) return resolve(row);
        resolve({
          agent_id: agentId,
          enabled: 0,
          auto_sms: 1,
          auto_email: 1,
          response_delay_seconds: 0,
          sms_template: '',
          email_subject: '',
          email_template: '',
          booking_enabled: 1,
          quiet_hours_start: 22,
          quiet_hours_end: 8,
          max_outreach_per_day: 100
        });
      }
    );
  });
}

// OpenRouter LLM call for outreach generation
async function callLLM(systemPrompt, userPrompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY not set');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'openai/gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// Generate personalized outreach message
async function generateOutreach(agent, lead, channel) {
  const personalityNote = agent.tone ? `Personality/Tone: ${agent.tone}.` : '';
  const industryNote = agent.industry ? `Industry: ${agent.industry}.` : '';
  const systemPrompt = `You are ${agent.agent_name || 'an AI assistant'} for ${agent.businessName || agent.business_name || 'a business'}. ${industryNote} ${personalityNote}
You are reaching out to a potential customer who JUST submitted their information. This is the critical first contact — speed matters.
Write a ${channel === 'sms' ? 'short SMS (under 160 chars)' : 'personalized email'} that:
1. Acknowledges their specific interest
2. Shows you understand their needs (use the form data/ad they responded to)
3. Offers immediate value or next step
4. For emails: includes a clear call-to-action (book a call, reply, etc.)
5. Feels human and urgent — not robotic

Keep it conversational, warm, and action-oriented.`;

  const userPrompt = `Lead details:
- Name: ${lead.first_name || lead.name || 'there'}${lead.last_name ? ' ' + lead.last_name : ''}
- Phone: ${lead.phone || 'not provided'}
- Email: ${lead.email || 'not provided'}
- Source: ${lead.source || 'unknown'}
- Ad they responded to: ${lead.ad_name || lead.campaign_name || 'not available'}
- Form data / interests: ${JSON.stringify(lead.form_data || lead.custom_data || {})}
- Company: ${lead.company || 'not provided'}
- Message/Notes: ${lead.message || lead.notes || ''}
- responded at: ${lead.timestamp || new Date().toISOString()}

Generate the outreach ${channel === 'sms' ? 'SMS message' : 'email body (no subject line)'}.`;

  return await callLLM(systemPrompt, userPrompt);
}

// Send outreach and log it
async function sendOutreach(agentId, eventId, lead, config) {
  const agent = await new Promise((resolve) => {
    db.get(`SELECT * FROM agents WHERE id = ?`, [agentId], (err, row) => resolve(row || {}));
  });

  const results = [];

  // ── SMS ────────────────────────────────────────────────────────────────
  if (config.auto_sms && lead.phone) {
    try {
      const smsBody = config.sms_template || await generateOutreach(agent, lead, 'sms');
      await alerter.sendSMS(lead.phone, smsBody);
      
      const itemId = uuidv4();
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO outreach_log (id, event_id, agent_id, channel, recipient, body, status, sent_at)
           VALUES (?, ?, ?, 'sms', ?, ?, 'sent', datetime('now'))`,
          [itemId, eventId, agentId, lead.phone, smsBody],
          (err) => err ? reject(err) : resolve()
        );
      });
      results.push({ channel: 'sms', status: 'sent' });
    } catch (err) {
      console.error('SMS send failed:', err.message);
      const itemId = uuidv4();
      db.run(
        `INSERT INTO outreach_log (id, event_id, agent_id, channel, recipient, body, status, error, sent_at)
         VALUES (?, ?, ?, 'sms', ?, ?, 'failed', ?, datetime('now'))`,
        [itemId, eventId, agentId, lead.phone, '', err.message]
      );
      results.push({ channel: 'sms', status: 'failed', error: err.message });
    }
  }

  // ── Email ──────────────────────────────────────────────────────────────
  if (config.auto_email && lead.email) {
    try {
      const emailBody = config.email_template || await generateOutreach(agent, lead, 'email');
      const subject = config.email_subject || `Re: Your inquiry${agent.business_name ? ' — ' + agent.business_name : ''}`;
      
      await alerter.sendEmail(lead.email, subject, emailBody,
        `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;"><div style="white-space:pre-wrap;line-height:1.6;color:#333;">${emailBody.replace(/\n/g, '<br>')}</div><hr style="border:none;border-top:1px solid #eee;margin:24px 0;"><p style="font-size:12px;color:#888;">Powered by <a href="https://maikr.pro" style="color:#C0A060;text-decoration:none;">M.ai.K.R</a></p></div>`
      );

      const itemId = uuidv4();
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO outreach_log (id, event_id, agent_id, channel, recipient, body, status, sent_at)
           VALUES (?, ?, ?, 'email', ?, ?, 'sent', datetime('now'))`,
          [itemId, eventId, agentId, lead.email, emailBody],
          (err) => err ? reject(err) : resolve()
        );
      });
      results.push({ channel: 'email', status: 'sent' });
    } catch (err) {
      console.error('Email send failed:', err.message);
      const itemId = uuidv4();
      db.run(
        `INSERT INTO outreach_log (id, event_id, agent_id, channel, recipient, body, status, error, sent_at)
         VALUES (?, ?, ?, 'email', ?, ?, 'failed', ?, datetime('now'))`,
        [itemId, eventId, agentId, lead.email, '', err.message]
      );
      results.push({ channel: 'email', status: 'failed', error: err.message });
    }
  }

  // Update event with outreach timestamp
  db.run(
    `UPDATE speed_to_lead_events 
     SET first_outreach_at = COALESCE(first_outreach_at, datetime('now')),
         last_outreach_at = datetime('now'),
         outreach_count = outreach_count + 1
     WHERE id = ?`,
    [eventId]
  );

  return results;
}

// ── PUBLIC: Lead Ingestion (webhook from any source) ────────────────────────

// POST /api/speed-to-lead/ingest/:agentId
router.post('/ingest/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const lead = req.body;

    // Validate agent exists and has speed-to-lead enabled
    const config = await getSpeedConfig(agentId);
    if (!config.enabled) {
      return res.json({ received: true, processed: false, reason: 'speed-to-lead not enabled' });
    }

    if (!lead.phone && !lead.email) {
      return res.status(400).json({ error: 'Lead must have phone or email' });
    }

    // Check daily cap
    const todayCount = await new Promise((resolve) => {
      db.get(
        `SELECT COUNT(*) as cnt FROM speed_to_lead_events 
         WHERE agent_id = ? AND date(created_at) = date('now')`,
        [agentId],
        (err, row) => resolve(row?.cnt || 0)
      );
    });
    if (todayCount >= (config.max_outreach_per_day || 100)) {
      return res.json({ received: true, processed: false, reason: 'daily cap reached' });
    }

    // Create event
    const eventId = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO speed_to_lead_events 
         (id, agent_id, lead_name, lead_email, lead_phone, lead_company, source, 
          campaign_name, ad_name, form_data, raw_payload, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', datetime('now'))`,
        [
          eventId,
          agentId,
          lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || null,
          lead.email || lead.email_address || null,
          lead.phone || lead.phone_number || null,
          lead.company || null,
          lead.source || (req.headers['x-source'] ? req.headers['x-source'] : 'api'),
          lead.campaign_name || lead.form_name || null,
          lead.ad_name || null,
          JSON.stringify(lead.form_data || lead.custom_data || lead || {}),
          JSON.stringify(lead)
        ],
        (err) => err ? reject(err) : resolve()
      );
    });

    console.log(`⚡ Speed-to-lead: New lead ingested for agent ${agentId}: ${lead.name || lead.email || lead.phone}`);

    // Calculate response delay (0 = instant)
    const delayMs = (config.response_delay_seconds || 0) * 1000;

    // Send outreach (delayed if configured, otherwise instant)
    if (delayMs > 0) {
      setTimeout(() => {
        sendOutreach(agentId, eventId, lead, config).catch(e => console.error('Delayed outreach error:', e));
      }, delayMs);
    } else {
      // Non-blocking: fire and forget
      sendOutreach(agentId, eventId, lead, config).catch(e => console.error('Outreach error:', e));
    }

    res.json({
      received: true,
      processed: true,
      eventId,
      message: delayMs > 0 ? `Outreach scheduled in ${config.response_delay_seconds}s` : 'Outreach triggered immediately'
    });

  } catch (err) {
    console.error('Speed-to-lead ingest error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PUBLIC: Google Ads Lead Form Webhook ─────────────────────────────────────

// POST /api/speed-to-lead/webhook/google-ads
router.post('/webhook/google-ads', async (req, res) => {
  try {
    const { agent_id, lead_id, form_id, campaign_name, ad_group_name, 
            gclid, user_column_data } = req.body;

    if (!agent_id) return res.status(400).json({ error: 'agent_id required' });

    // Parse Google Ads user column data
    const formData = {};
    if (user_column_data) {
      user_column_data.forEach(col => {
        if (col.column_name && col.value) {
          formData[col.column_name.toLowerCase().replace(/\s+/g, '_')] = col.value;
        }
      });
    }

    const lead = {
      source: 'google_ads',
      name: formData.full_name || formData.name || '',
      email: formData.email || formData.email_address || '',
      phone: formData.phone || formData.phone_number || '',
      company: formData.company || formData.company_name || '',
      campaign_name,
      ad_name: ad_group_name,
      form_data: formData,
      google_lead_id: lead_id,
      gclid
    };

    // Forward to the ingest handler
    const ingestUrl = `/api/speed-to-lead/ingest/${agent_id}`;
    const config = await getSpeedConfig(agent_id);
    if (!config.enabled) return res.json({ received: true, processed: false, reason: 'not enabled' });

    const eventId = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO speed_to_lead_events 
         (id, agent_id, lead_name, lead_email, lead_phone, lead_company, source,
          campaign_name, ad_name, form_data, external_id, raw_payload, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'google_ads', ?, ?, ?, ?, ?, 'new', datetime('now'))`,
        [eventId, agent_id, lead.name, lead.email, lead.phone, lead.company,
         campaign_name, ad_group_name, JSON.stringify(formData), 
         lead_id || gclid, JSON.stringify(req.body)],
        (err) => err ? reject(err) : resolve()
      );
    });

    sendOutreach(agent_id, eventId, lead, config).catch(e => console.error('Google Ads outreach error:', e));

    res.json({ received: true, processed: true, eventId });
  } catch (err) {
    console.error('Google Ads webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PUBLIC: Meta Lead Ads Webhook ────────────────────────────────────────────

// GET — Meta verification challenge
router.get('/webhook/meta-leads', (req, res) => {
  const VERIFY_TOKEN = process.env.META_LEADS_VERIFY_TOKEN || 'maikr_speed_to_lead';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Meta Lead Ads webhook verified');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Verification failed');
  }
});

// POST — Meta lead events
router.post('/webhook/meta-leads', async (req, res) => {
  try {
    const entries = req.body.entry || [];
    
    for (const entry of entries) {
      for (const change of (entry.changes || [])) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value?.leadgen_id;
          const formId = change.value?.form_id;
          const pageId = change.value?.page_id;
          const adId = change.value?.ad_id;
          const campaignName = change.value?.campaign_name;

          // Note: To get actual lead data, you'd fetch from Meta Graph API
          // using leadgenId + access_token. For now, store the webhook data
          // and flag for processing.
          
          // Find agent by meta_form_id (configured in speed-to-lead settings)
          const agentConfig = await new Promise((resolve) => {
            db.get(
              `SELECT * FROM speed_to_lead_configs 
               WHERE meta_form_id = ? OR meta_page_id = ? LIMIT 1`,
              [formId, pageId],
              (err, row) => resolve(row)
            );
          });

          if (!agentConfig?.agent_id) {
            console.log(`⚠️ No agent configured for Meta form ${formId}, page ${pageId}`);
            continue;
          }

          const config = await getSpeedConfig(agentConfig.agent_id);
          if (!config.enabled) continue;

          const eventId = uuidv4();
          db.run(
            `INSERT INTO speed_to_lead_events 
             (id, agent_id, source, campaign_name, form_data, external_id, 
              raw_payload, status, needs_fetch, created_at)
             VALUES (?, ?, 'meta_leads', ?, ?, ?, ?, 'pending', 1, datetime('now'))`,
            [eventId, agentConfig.agent_id, campaignName, JSON.stringify({ formId, adId }),
             leadgenId, JSON.stringify(change.value)]
          );

          console.log(`⚡ Meta lead captured: form=${formId}, leadgen=${leadgenId}`);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Meta webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PUBLIC: Generic Form Webhook ─────────────────────────────────────────────

// POST /api/speed-to-lead/webhook/form
router.post('/webhook/form', async (req, res) => {
  try {
    const { agent_id, ...lead } = req.body;
    if (!agent_id) return res.status(400).json({ error: 'agent_id required' });

    const config = await getSpeedConfig(agent_id);
    if (!config.enabled) return res.json({ received: true, processed: false });

    const eventId = uuidv4();
    const leadName = lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
    const leadEmail = lead.email || lead.email_address;
    const leadPhone = lead.phone || lead.phone_number;
    const leadCompany = lead.company || lead.company_name;

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO speed_to_lead_events 
         (id, agent_id, lead_name, lead_email, lead_phone, lead_company, source,
          campaign_name, form_data, raw_payload, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'form', ?, ?, ?, 'new', datetime('now'))`,
        [eventId, agent_id, leadName, leadEmail, leadPhone, leadCompany,
         lead.form_name || lead.page_url || null,
         JSON.stringify(lead), JSON.stringify(req.body)],
        (err) => err ? reject(err) : resolve()
      );
    });

    sendOutreach(agent_id, eventId, lead, config).catch(e => console.error('Form outreach error:', e));

    res.json({ received: true, processed: true, eventId });
  } catch (err) {
    console.error('Form webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PROTECTED: Get all speed-to-lead events ─────────────────────────────────

router.get('/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await verifyAgentAccess(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    const { status, limit, offset } = req.query;
    const lim = parseInt(limit) || 50;
    const off = parseInt(offset) || 0;

    let sql = `SELECT e.*, 
                (SELECT COUNT(*) FROM outreach_log WHERE event_id = e.id) as outreach_count,
                (SELECT GROUP_CONCAT(channel || ':' || status) FROM outreach_log WHERE event_id = e.id) as outreach_channels
               FROM speed_to_lead_events e WHERE e.agent_id = ?`;
    const params = [agentId];

    if (status) { sql += ` AND e.status = ?`; params.push(status); }
    sql += ` ORDER BY e.created_at DESC LIMIT ? OFFSET ?`;
    params.push(lim, off);

    const events = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows || []));
    });

    // Parse outreach channels
    events.forEach(e => {
      e.outreach_summary = (e.outreach_channels || '').split(',').map(s => {
        const [ch, st] = s.split(':');
        return { channel: ch, status: st };
      }).filter(x => x.channel);
      delete e.outreach_channels;
    });

    res.json({ success: true, events });
  } catch (err) {
    console.error('GET speed-to-lead events error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PROTECTED: Get stats ─────────────────────────────────────────────────────

router.get('/stats/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await verifyAgentAccess(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_leads,
          SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) as new_count,
          SUM(CASE WHEN status='contacted' THEN 1 ELSE 0 END) as responded_count,
          SUM(CASE WHEN status='booked' THEN 1 ELSE 0 END) as booked_count,
          SUM(CASE WHEN status='converted' THEN 1 ELSE 0 END) as converted_count,
          SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) as rejected_count,
          SUM(CASE WHEN first_outreach_at IS NOT NULL THEN 1 ELSE 0 END) as contacted,
          ROUND(AVG(CASE WHEN first_outreach_at IS NOT NULL 
            THEN (julianday(first_outreach_at) - julianday(created_at)) * 24 * 60 * 60 
            ELSE NULL END)) as avg_response_seconds
        FROM speed_to_lead_events WHERE agent_id = ?
      `, [agentId], (err, row) => err ? reject(err) : resolve(row));
    });

    const outreachStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_sent,
          SUM(CASE WHEN status='sent' THEN 1 ELSE 0 END) as sent_count,
          SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed_count,
          SUM(CASE WHEN channel='sms' THEN 1 ELSE 0 END) as sms_count,
          SUM(CASE WHEN channel='email' THEN 1 ELSE 0 END) as email_count
        FROM outreach_log WHERE agent_id = ?
      `, [agentId], (err, row) => err ? reject(err) : resolve(row));
    });

    const sourceBreakdown = await new Promise((resolve, reject) => {
      db.all(`
        SELECT source, COUNT(*) as count 
        FROM speed_to_lead_events WHERE agent_id = ?
        GROUP BY source ORDER BY count DESC
      `, [agentId], (err, rows) => err ? reject(err) : resolve(rows || []));
    });

    const todayCount = await new Promise((resolve) => {
      db.get(
        `SELECT COUNT(*) as cnt FROM speed_to_lead_events 
         WHERE agent_id = ? AND date(created_at) = date('now')`,
        [agentId],
        (err, row) => resolve(row?.cnt || 0)
      );
    });

    res.json({
      success: true,
      stats: {
        ...stats,
        ...outreachStats,
        source_breakdown: sourceBreakdown,
        today_count: todayCount
      }
    });
  } catch (err) {
    console.error('GET speed-to-lead stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PROTECTED: Get single event detail ───────────────────────────────────────

router.get('/event/:eventId', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await new Promise((resolve, reject) => {
      db.get(
        `SELECT e.*, a.agent_name
         FROM speed_to_lead_events e
         JOIN agents a ON e.agent_id = a.id
         WHERE e.id = ?`,
        [eventId],
        (err, row) => err ? reject(err) : resolve(row)
      );
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Verify ownership
    const agent = await verifyAgentAccess(event.agent_id, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    const outreachLog = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM outreach_log WHERE event_id = ? ORDER BY sent_at ASC`,
        [eventId],
        (err, rows) => err ? reject(err) : resolve(rows || [])
      );
    });

    res.json({ success: true, event, outreach_log: outreachLog });
  } catch (err) {
    console.error('GET speed-to-lead event error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PROTECTED: Configure speed-to-lead ───────────────────────────────────────

router.post('/config/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await verifyAgentAccess(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    const {
      enabled, auto_sms, auto_email, response_delay_seconds,
      sms_template, email_subject, email_template,
      booking_enabled, quiet_hours_start, quiet_hours_end,
      max_outreach_per_day, meta_form_id, meta_page_id,
      google_ads_customer_id, meta_access_token
    } = req.body;

    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO speed_to_lead_configs 
          (agent_id, enabled, auto_sms, auto_email, response_delay_seconds,
           sms_template, email_subject, email_template,
           booking_enabled, quiet_hours_start, quiet_hours_end,
           max_outreach_per_day, meta_form_id, meta_page_id,
           google_ads_customer_id, meta_access_token, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(agent_id) DO UPDATE SET
          enabled = excluded.enabled,
          auto_sms = excluded.auto_sms,
          auto_email = excluded.auto_email,
          response_delay_seconds = excluded.response_delay_seconds,
          sms_template = excluded.sms_template,
          email_subject = excluded.email_subject,
          email_template = excluded.email_template,
          booking_enabled = excluded.booking_enabled,
          quiet_hours_start = excluded.quiet_hours_start,
          quiet_hours_end = excluded.quiet_hours_end,
          max_outreach_per_day = excluded.max_outreach_per_day,
          meta_form_id = excluded.meta_form_id,
          meta_page_id = excluded.meta_page_id,
          google_ads_customer_id = excluded.google_ads_customer_id,
          meta_access_token = excluded.meta_access_token,
          updated_at = datetime('now')
      `, [
        agentId, enabled ? 1 : 0, auto_sms ? 1 : 0, auto_email ? 1 : 0,
        response_delay_seconds || 0, sms_template || '', email_subject || '',
        email_template || '', booking_enabled ? 1 : 0,
        quiet_hours_start || 22, quiet_hours_end || 8,
        max_outreach_per_day || 100, meta_form_id || null, meta_page_id || null,
        google_ads_customer_id || null, meta_access_token || null
      ], (err) => err ? reject(err) : resolve());
    });

    res.json({ success: true, message: 'Speed-to-lead config updated' });
  } catch (err) {
    console.error('POST speed-to-lead config error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/speed-to-lead/config/:agentId
router.get('/config/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await verifyAgentAccess(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    const config = await getSpeedConfig(agentId);
    res.json({ success: true, config });
  } catch (err) {
    console.error('GET speed-to-lead config error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PROTECTED: Retry outreach ────────────────────────────────────────────────

router.post('/retry/:eventId', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM speed_to_lead_events WHERE id = ?`, [eventId],
        (err, row) => err ? reject(err) : resolve(row));
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const agent = await verifyAgentAccess(event.agent_id, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    const config = await getSpeedConfig(event.agent_id);
    const lead = {
      name: event.lead_name,
      email: event.lead_email,
      phone: event.lead_phone,
      company: event.lead_company,
      source: event.source,
      form_data: JSON.parse(event.form_data || '{}')
    };

    const results = await sendOutreach(event.agent_id, eventId, lead, config);
    res.json({ success: true, results });
  } catch (err) {
    console.error('POST speed-to-lead retry error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PROTECTED: Update status ─────────────────────────────────────────────────

router.put('/status/:eventId', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, notes } = req.body;

    if (!status || !['new', 'contacted', 'responded', 'booked', 'converted', 'rejected', 'spam'].includes(status)) {
      return res.status(400).json({ error: 'Valid status required' });
    }

    const event = await new Promise((resolve) => {
      db.get(`SELECT agent_id FROM speed_to_lead_events WHERE id = ?`, [eventId],
        (err, row) => resolve(row));
    });
    if (!event) return res.status(404).json({ error: 'Not found' });

    const agent = await verifyAgentAccess(event.agent_id, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE speed_to_lead_events SET status = ?, notes = COALESCE(?, notes) WHERE id = ?`,
        [status, notes || null, eventId],
        (err) => err ? reject(err) : resolve()
      );
    });

    res.json({ success: true });
  } catch (err) {
    console.error('PUT speed-to-lead status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PROTECTED: Delete event ──────────────────────────────────────────────────

router.delete('/event/:eventId', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await new Promise((resolve) => {
      db.get(`SELECT agent_id FROM speed_to_lead_events WHERE id = ?`, [eventId],
        (err, row) => resolve(row));
    });
    if (!event) return res.status(404).json({ error: 'Not found' });

    const agent = await verifyAgentAccess(event.agent_id, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    // Wrap in transaction to prevent orphaned outreach_log records
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) return reject(err);
        db.run(`DELETE FROM outreach_log WHERE event_id = ?`, [eventId], (err) => {
          if (err) { db.run('ROLLBACK'); return reject(err); }
          db.run(`DELETE FROM speed_to_lead_events WHERE id = ?`, [eventId], (err) => {
            if (err) { db.run('ROLLBACK'); return reject(err); }
            db.run('COMMIT', (err) => err ? reject(err) : resolve());
          });
        });
      });
    });

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE speed-to-lead event error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
