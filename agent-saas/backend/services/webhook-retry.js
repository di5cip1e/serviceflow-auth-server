/**
 * Webhook Retry Script
 * Run via cron every 15 minutes to retry failed webhook events
 */

const db = require('../database');
const { provisionCustomer } = require('../services/provisioning');
const { PRICING } = require('../routes/checkout');

async function run() {
  console.log('🔄 Checking for failed webhook events...');

  const failed = await new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM webhook_events WHERE status = 'failed' AND retry_count < 5 ORDER BY created_at ASC LIMIT 10",
      [],
      (err, rows) => { if (err) reject(err); else resolve(rows || []); }
    );
  });

  if (failed.length === 0) {
    console.log('✅ No failed events to retry.');
    return { retried: 0 };
  }

  console.log(`🔄 Retrying ${failed.length} failed events...`);
  const results = [];

  for (const evt of failed) {
    try {
      const payload = JSON.parse(evt.payload);
      if (evt.event_type === 'checkout.session.completed') {
        const paymentData = {
          eventId: evt.stripe_event_id,
          sessionId: payload.id,
          email: payload.customer_email,
          agentName: payload.metadata?.agentName || 'Unnamed Agent',
          businessName: payload.metadata?.businessName || 'Unknown Business',
          industry: payload.metadata?.industry || 'general',
          targetAudience: payload.metadata?.targetAudience || 'general audience',
          tone: payload.metadata?.tone || 'professional',
          useCases: payload.metadata?.useCases || '',
          plan: payload.metadata?.skillLevel || 'value',
          baseTokens: PRICING[payload.metadata?.skillLevel]?.base_tokens || 20000,
          outcomeCredits: PRICING[payload.metadata?.skillLevel]?.outcome_credits || 100,
          modelTier: payload.metadata?.modelTier || 'standard',
          dataAgreement: payload.metadata?.dataAgreement === 'true' ? 1 : 0,
          customerId: payload.customer,
          subscriptionId: payload.subscription,
          userId: payload.metadata?.user_id || null
        };
        const result = await provisionCustomer(paymentData);
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE webhook_events SET status = ?, processed_at = CURRENT_TIMESTAMP WHERE stripe_event_id = ?',
            ['completed', evt.stripe_event_id],
            (err) => { if (err) reject(err); else resolve(); }
          );
        });
        results.push({ eventId: evt.stripe_event_id, status: 'completed', agentId: result.agentId });
        console.log('✅ Retried successfully:', evt.stripe_event_id, '→ Agent:', result.agentId);
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
      console.error('❌ Retry failed:', evt.stripe_event_id, err.message);
    }
  }

  console.log('🔄 Retry complete:', results);
  return { retried: failed.length, results };
}

if (require.main === module) {
  run().then(r => { console.log('Done:', r); process.exit(0); })
       .catch(e => { console.error('Fatal:', e); process.exit(1); });
}

module.exports = { run };
