const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Pricing tiers
const PRICING = {
  value: { price: 4499, name: 'Value Agent', base_tokens: 20000, outcome_credits: 100 },
  growth: { price: 9900, name: 'Growth Agent', base_tokens: 50000, outcome_credits: 500 },
  scale: { price: 19900, name: 'Scale Agent', base_tokens: 200000, outcome_credits: 2000 },
  enterprise: { price: 49900, name: 'Enterprise Agent', base_tokens: 1000000, outcome_credits: 10000 }
};

router.post('/', async (req, res) => {
  try {
    const { 
      industry, 
      targetAudience, 
      tone, 
      customTone,
      websiteUrl,
      agentName,
      businessName,
      useCases,
      skillLevel,
      modelTier
    } = req.body;

    const tier = req.body.plan || skillLevel || 'basic';
    const pricing = PRICING[tier] || PRICING.basic;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pricing.name,
              description: `AI Agent for ${industry} - ${businessName}`,
              metadata: {
                industry,
                targetAudience,
                tone,
                customTone,
                websiteUrl,
                agentName,
                businessName,
                useCases: JSON.stringify(useCases),
                dataAgreement: req.body.dataAgreement ? 'true' : 'false',
                modelTier: req.body.modelTier || 'standard'
              }
            },
            unit_amount: pricing.price,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `http://maikr.pro/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'http://maikr.pro/',
      metadata: {
        industry,
        targetAudience,
        tone,
        agentName,
        businessName
      }
    });

    res.json({ 
      success: true, 
      sessionId: session.id, 
      url: session.url 
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;