/**
 * Daily Revenue Snapshot
 * Logs MRR, customer count, and key metrics to a daily snapshot table
 * Run via cron at end of day (23:59 UTC)
 */

const db = require('../database');

async function run() {
  console.log('📊 Taking daily revenue snapshot...');

  // Get current metrics
  const metrics = await new Promise((resolve, reject) => {
    db.get(
      `SELECT 
         COUNT(*) as total_customers,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_customers,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_customers,
         COALESCE(SUM(CASE WHEN status = 'active' THEN monthly_cost_cents ELSE 0 END), 0) as mrr_cents,
         SUM(CASE WHEN created_at >= datetime('now', '-1 day') THEN 1 ELSE 0 END) as new_customers_1d,
         SUM(CASE WHEN status = 'cancelled' AND updated_at >= datetime('now', '-1 day') THEN 1 ELSE 0 END) as churned_1d
       FROM customers`,
      [],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  // Get credit purchase revenue today
  const creditRevenue = await new Promise((resolve, reject) => {
    db.get(
      `SELECT COALESCE(SUM(price_paid_cents), 0) as revenue_cents, COUNT(*) as purchases
       FROM credit_purchases 
       WHERE status = 'completed' 
         AND created_at >= datetime('now', '-1 day')`,
      [],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  // Insert snapshot
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO revenue_snapshots (id, snapshot_date, total_customers, active_customers, cancelled_customers, mrr_cents, new_customers_1d, churned_1d, credit_revenue_cents, credit_purchases)
       VALUES (?, date('now'), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        require('uuid').v4(),
        metrics.total_customers,
        metrics.active_customers,
        metrics.cancelled_customers,
        metrics.mrr_cents,
        metrics.new_customers_1d,
        metrics.churned_1d,
        creditRevenue.revenue_cents,
        creditRevenue.purchases
      ],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  console.log('📊 Revenue snapshot saved:', {
    mrr: `$${(metrics.mrr_cents / 100).toFixed(2)}`,
    customers: metrics.active_customers,
    new_1d: metrics.new_customers_1d,
    churned_1d: metrics.churned_1d,
    credit_revenue: `$${(creditRevenue.revenue_cents / 100).toFixed(2)}`,
  });

  return metrics;
}

// Create table if not exists (run on module load)
const db2 = require('../database');
// Table creation handled in database.js migration

if (require.main === module) {
  run()
    .then(m => { console.log('Done:', m); process.exit(0); })
    .catch(e => { console.error('Error:', e); process.exit(1); });
}

module.exports = { run };
