const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { provisionCustomer } = require('../services/provisioning');
const { PRICING } = require('./checkout');

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = require('stripe')(process.env.STRIPE_SECRET_KEY).webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    console.log('✅ Payment received:', session.id);
    console.log('Customer:', session.customer_email);

    // Idempotency check: has this Stripe event already been processed?
    // If the customer already exists with this session_id, skip provisioning.
    const existingCustomer = await new Promise((resolve) => {
      db.get(
        'SELECT id FROM customers WHERE stripe_session_id = ? LIMIT 1',
        [session.id],
        (err, row) => resolve(row)
      );
    });
    if (existingCustomer) {
      console.log('⏭️  Webhook already processed (idempotency hit) — skipping duplicate for event:', event.id);
      return res.json({ received: true, duplicate: true });
    }

    // Prepare payment data for provisioning
    const paymentData = {
      eventId: event.id,
      sessionId: session.id,
      email: session.customer_email,
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

    // Call provisioning service
    try {
      const result = await provisionCustomer(paymentData);
      console.log('🤖 Agent provisioned:', result.agentId);
      console.log('🔗 Access URL:', result.chatUrl);
      console.log('📧 API Key:', result.apiKey);
    } catch (err) {
      console.error('❌ Provisioning failed:', err.message);
      // Return 200 so Stripe doesn't retry permanent failures
      // Only return non-200 for truly irrecoverable errors if needed
    }
  }

  res.json({ received: true });
});

module.exports = router;