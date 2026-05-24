const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { provisionCustomer } = require('../services/provisioning');
const { PRICING } = require('./checkout');
const { getSecret } = require('../bootstrap');
const stripe = require('stripe')(getSecret('STRIPE_SECRET_KEY'));

// Process a checkout.session.completed event
async function processCheckoutSession(session, event) {
  const existing = await new Promise((resolve) => {
    db.get('SELECT id FROM customers WHERE stripe_session_id = ? LIMIT 1', [session.id], (err, row) => resolve(row));
  });
  if (existing) {
    console.log('⏭️  Already processed session:', session.id);
    return { duplicate: true };
  }

  const email = session.customer_email || session.customer_details?.email;
  if (!email) {
    console.error('⏭️ No email in session:', session.id);
    return res.status(200).json({ received: true, skipped: true, reason: 'no_email' });
  }

  const paymentData = {
    eventId: event.id,
    sessionId: session.id,
    email: email,
    agentName: session.metadata?.agentName || 'Unnamed Agent',
    businessName: session.metadata?.businessName || 'Unknown Business',
    industry: session.metadata?.industry || 'general',
    targetAudience: session.metadata?.targetAudience || 'general audience',
    tone: session.metadata?.tone || 'professional',
    useCases: session.metadata?.useCases || '',
    plan: session.metadata?.skillLevel || 'value',
    baseTokens: PRICING[session.metadata?.skillLevel]?.base_tokens || 20000,
    outcomeCredits: PRICING[session.metadata?.skillLevel]?.outcome_credits || 100,
    modelTier: session.metadata?.modelTier || 'standard',
    dataAgreement: session.metadata?.dataAgreement === 'true' ? 1 : 0,
    customerId: session.customer,
    subscriptionId: session.subscription,
    userId: session.metadata?.user_id || null
  };

  const result = await provisionCustomer(paymentData);
  console.log('🤖 Agent provisioned:', result.agentId);
  return result;
}

// POST /webhook — Stripe webhook endpoint
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      getSecret('STRIPE_WEBHOOK_SECRET')
    );
  } catch (err) {
    console.error('❌ Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const eventId = event.id;

  // Check if event already processed
  const existingEvent = await new Promise((resolve) => {
    db.get('SELECT id, status FROM webhook_events WHERE stripe_event_id = ?', [eventId], (err, row) => resolve(row));
  });

  if (existingEvent && existingEvent.status === 'completed') {
    console.log('⏭️  Event already processed:', eventId);
    // Update timestamp for idempotency tracking
    db.run('UPDATE webhook_events SET processed_at = CURRENT_TIMESTAMP WHERE stripe_event_id = ?', [eventId]);
    return res.json({ received: true, duplicate: true });
  }

  // Insert event record
  if (!existingEvent) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO webhook_events (id, stripe_event_id, event_type, status, payload) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), eventId, event.type, 'processing', JSON.stringify(event.data.object).substring(0, 4000)],
        (err) => { if (err) reject(err); else resolve(); }
      );
    });
  }

  // Process checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('✅ Payment received:', session.id, 'Email:', session.customer_email);

    try {
      const result = await processCheckoutSession(session, event);

      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE webhook_events SET status = ?, processed_at = CURRENT_TIMESTAMP WHERE stripe_event_id = ?',
          ['completed', eventId],
          (err) => { if (err) reject(err); else resolve(); }
        );
      });

      return res.json({ received: true, ...result });
    } catch (err) {
      console.error('❌ Provisioning failed:', err.message);

      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE webhook_events SET status = ?, error = ?, retry_count = retry_count + 1 WHERE stripe_event_id = ?',
          ['failed', err.message.substring(0, 500), eventId],
          (err) => { if (err) reject(err); else resolve(); }
        );
      });

      return res.json({ received: true, error: 'provisioning_failed', willRetry: true });
    }
  } else {
    // Non-checkout events — just acknowledge
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE webhook_events SET status = ?, processed_at = CURRENT_TIMESTAMP WHERE stripe_event_id = ?',
        ['completed', eventId],
        (err) => { if (err) reject(err); else resolve(); }
      );
    });
    return res.json({ received: true });
  }
});

// GET /webhook/retry — manually trigger retry of failed events
router.get('/retry', async (req, res) => {
  const failed = await new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM webhook_events WHERE status = 'failed' AND retry_count < 5 ORDER BY created_at ASC LIMIT 10",
      [],
      (err, rows) => { if (err) reject(err); else resolve(rows || []); }
    );
  });

  const results = [];
  for (const evt of failed) {
    try {
      const payload = JSON.parse(evt.payload);
      if (evt.event_type === 'checkout.session.completed') {
        // Check if customer already exists for this session (prevent duplicates on retry)
        const existingCustomer = await new Promise((resolve) => {
          db.get('SELECT id FROM customers WHERE stripe_session_id = ? LIMIT 1', [payload.id], (err, row) => resolve(row));
        });
        if (existingCustomer) {
          console.log('⏭️  Customer already exists for session, marking event completed:', evt.stripe_event_id);
          await new Promise((resolve, reject) => {
            db.run('UPDATE webhook_events SET status = ?, processed_at = CURRENT_TIMESTAMP WHERE stripe_event_id = ?',
              ['completed', evt.stripe_event_id], (err) => { if (err) reject(err); else resolve(); });
          });
          results.push({ eventId: evt.stripe_event_id, status: 'skipped', reason: 'customer_exists' });
          continue;
        }
        const fakeEvent = { id: evt.stripe_event_id, type: evt.event_type, data: { object: payload } };
        const result = await processCheckoutSession(payload, fakeEvent);
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE webhook_events SET status = ?, processed_at = CURRENT_TIMESTAMP WHERE stripe_event_id = ?',
            ['completed', evt.stripe_event_id],
            (err) => { if (err) reject(err); else resolve(); }
          );
        });
        results.push({ eventId: evt.stripe_event_id, status: 'completed', agentId: result.agentId });
      }
    } catch (err) {
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE webhook_events SET error = ?, retry_count = retry_count + 1 WHERE stripe_event_id = ?',
          [err.message.substring(0, 500), evt.stripe_event_id],
          (err2) => { if (err2) reject(err2); else resolve(); }
        );
      });
      results.push({ eventId: evt.stripe_event_id, status: 'failed', error: err.message });
    }
  }

  res.json({ success: true, retried: results.length, results });
});

module.exports = router;
