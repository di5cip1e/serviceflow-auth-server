/**
 * SaaS Revenue Tracker API
 * Tracks MRR, ARR, churn, LTV, and other key metrics
 * 
 * Endpoints:
 * GET /api/revenue/metrics — Overall MRR, ARR, customer count, churn
 * GET /api/revenue/customers — Customer list with revenue data
 * GET /api/revenue/transactions — Revenue transaction history
 */

const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireApiAuth } = require('../middleware/auth');

// All revenue routes require auth
router.use(requireApiAuth);

/**
 * GET /api/revenue/metrics
 * Returns key SaaS metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    // Active customers by plan
    const planCounts = await new Promise((resolve, reject) => {
      db.all(
        `SELECT plan, COUNT(*) as count, 
                SUM(monthly_cost_cents) as total_cost_cents
         FROM customers 
         WHERE status = 'active'
         GROUP BY plan`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // Total MRR (sum of all active customer monthly costs)
    const mrrResult = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as total_customers,
                COALESCE(SUM(monthly_cost_cents), 0) as total_mrr_cents
         FROM customers 
         WHERE status = 'active'`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // Churn rate (customers who cancelled in last 30 days / total customers)
    const churnResult = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as churned_30d
         FROM customers 
         WHERE status = 'cancelled' 
           AND updated_at >= datetime('now', '-30 days')`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // New customers (last 30 days)
    const newCustomers = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as new_30d
         FROM customers 
         WHERE created_at >= datetime('now', '-30 days')`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // Credit purchases revenue
    const creditRevenue = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COALESCE(SUM(amount_cents), 0) as total_credit_revenue_cents,
                COUNT(*) as total_purchases
         FROM credit_purchases
         WHERE status = 'completed'`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const totalMrrCents = (mrrResult?.total_mrr_cents || 0) + (creditRevenue?.total_credit_revenue_cents || 0) / 12; // Amortize credits monthly
    const totalCustomers = mrrResult?.total_customers || 0;
    const churned30d = churnResult?.churned_30d || 0;
    const churnRate = totalCustomers > 0 ? ((churned30d / totalCustomers) * 100).toFixed(1) : 0;
    const arr = totalMrrCents * 12;

    res.json({
      success: true,
      metrics: {
        mrr: {
          cents: totalMrrCents,
          dollars: (totalMrrCents / 100).toFixed(2),
        },
        arr: {
          cents: arr,
          dollars: (arr / 100).toFixed(2),
        },
        customers: {
          total: totalCustomers,
          new_30d: newCustomers?.new_30d || 0,
          churned_30d: churned30d,
          churn_rate_percent: parseFloat(churnRate),
        },
        plans: planCounts.map(p => ({
          plan: p.plan,
          customers: p.count,
          mrr_cents: p.total_cost_cents,
          mrr_dollars: (p.total_cost_cents / 100).toFixed(2),
        })),
        credits: {
          total_revenue_cents: creditRevenue?.total_credit_revenue_cents || 0,
          total_revenue_dollars: ((creditRevenue?.total_credit_revenue_cents || 0) / 100).toFixed(2),
          total_purchases: creditRevenue?.total_purchases || 0,
        },
        ltv: {
          avg_cents: totalCustomers > 0 ? Math.round(totalMrrCents / totalCustomers) : 0,
          avg_dollars: totalCustomers > 0 ? (totalMrrCents / totalCustomers / 100).toFixed(2) : '0.00',
        }
      }
    });
  } catch (err) {
    console.error('Revenue metrics error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/revenue/customers
 * Returns customer list with revenue data
 */
router.get('/customers', async (req, res) => {
  try {
    const customers = await new Promise((resolve, reject) => {
      db.all(
        `SELECT c.id, c.email, c.plan, c.status, c.created_at, c.updated_at,
                c.monthly_cost_cents, c.base_tokens, c.base_tokens_used,
                c.outcome_credits, c.outcome_credits_used,
                a.agent_name, a.business_name
         FROM customers c
         LEFT JOIN agents a ON a.customer_id = c.id
         ORDER BY c.created_at DESC
         LIMIT 100`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    res.json({
      success: true,
      customers: customers.map(c => ({
        id: c.id,
        email: c.email,
        agent_name: c.agent_name,
        business_name: c.business_name,
        plan: c.plan,
        status: c.status,
        monthly_cost_dollars: (c.monthly_cost_cents / 100).toFixed(2),
        tokens_used: c.base_tokens_used || 0,
        tokens_total: c.base_tokens || 0,
        credits_used: c.outcome_credits_used || 0,
        credits_total: c.outcome_credits || 0,
        created_at: c.created_at,
      })),
    });
  } catch (err) {
    console.error('Revenue customers error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/revenue/transactions
 * Returns credit transaction history
 */
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await new Promise((resolve, reject) => {
      db.all(
        `SELECT ct.*, c.email as customer_email, a.agent_name
         FROM credit_transactions ct
         JOIN customers c ON c.id = ct.customer_id
         LEFT JOIN agents a ON a.customer_id = c.id
         ORDER BY ct.created_at DESC
         LIMIT 200`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    res.json({ success: true, transactions });
  } catch (err) {
    console.error('Revenue transactions error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
