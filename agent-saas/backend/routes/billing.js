/**
 * Billing Routes — Stripe Customer Portal & Subscription Management
 */
const express = require('express');
const router = express.Router();
const { getSecret } = require('../bootstrap');
const { requireAuth } = require('../middleware/auth');
const stripe = require('stripe')(getSecret('STRIPE_SECRET_KEY'));
const db = require('../database');

// POST /api/billing/portal — Create Stripe Customer Portal session
router.post('/portal', requireAuth, async (req, res) => {
  try {
    // Get customer's Stripe ID from DB
    const customer = await new Promise((resolve, reject) => {
      db.get(
        'SELECT stripe_customer_id FROM customers WHERE user_id = ? AND stripe_customer_id IS NOT NULL ORDER BY created_at DESC LIMIT 1',
        [req.session.userId],
        (err, row) => { if (err) reject(err); else resolve(row); }
      );
    });

    if (!customer || !customer.stripe_customer_id) {
      return res.status(400).json({ 
        error: 'No subscription found', 
        message: 'You don\'t have an active subscription yet.' 
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: 'https://maikr.pro/settings.html',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/billing/status — Get current subscription status for logged-in user
router.get('/status', requireAuth, async (req, res) => {
  try {
    const customer = await new Promise((resolve, reject) => {
      db.get(
        `SELECT c.stripe_customer_id, c.stripe_subscription_id, c.plan, c.status,
                a.agent_name, a.plan_name, a.base_tokens, a.base_tokens_used, 
                a.outcome_credits, a.outcome_credits_used, a.status as agent_status
         FROM customers c
         LEFT JOIN agents a ON a.customer_id = c.id
         WHERE c.user_id = ?
         ORDER BY c.created_at DESC LIMIT 1`,
        [req.session.userId],
        (err, row) => { if (err) reject(err); else resolve(row); }
      );
    });

    if (!customer) {
      return res.json({ 
        hasSubscription: false, 
        message: 'No subscription found' 
      });
    }

    res.json({
      hasSubscription: true,
      plan: customer.plan_name || customer.plan || 'unknown',
      status: customer.status,
      agentName: customer.agent_name,
      agentStatus: customer.agent_status,
      usage: {
        tokensUsed: customer.base_tokens_used || 0,
        tokensTotal: customer.base_tokens || 20000,
        tokensAvailable: (customer.base_tokens || 20000) - (customer.base_tokens_used || 0),
        creditsUsed: customer.outcome_credits_used || 0,
        creditsTotal: customer.outcome_credits || 100,
        creditsAvailable: (customer.outcome_credits || 100) - (customer.outcome_credits_used || 0),
      },
      upgradeUrl: 'https://maikr.pro/pricing.html'
    });
  } catch (error) {
    console.error('Billing status error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
