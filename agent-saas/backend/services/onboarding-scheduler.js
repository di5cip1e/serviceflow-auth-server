/**
 * Onboarding Email Scheduler
 * Run daily via cron to send drip campaign emails to new customers
 * 
 * Schedule: Daily at 10:00 UTC
 * 
 * Checks for customers who:
 * - Are active (status = 'active')
 * - Have not received the specific onboarding email yet
 * - Are at the right day offset from their creation date
 */

const db = require('../database');
const { sendOnboardingEmail } = require('./onboarding-emails');

const DAYS_OFFSET = {
  day1: 1,
  day3: 3,
  day7: 7,
  day14: 14,
};

/**
 * Get customers who need a specific onboarding email
 */
async function getCustomersForEmail(emailType) {
  const days = DAYS_OFFSET[emailType];
  const customers = await new Promise((resolve, reject) => {
    db.all(
      `SELECT c.id, c.email, a.agent_name, a.business_name, c.plan, c.created_at,
              a.id as agent_id
       FROM customers c
       LEFT JOIN agents a ON a.customer_id = c.id
       WHERE c.status = 'active'
         AND c.created_at >= datetime('now', '-${days} days')
         AND c.created_at < datetime('now', '-${days - 1} days')
         AND NOT EXISTS (
           SELECT 1 FROM email_log el 
           WHERE el.customer_id = c.id AND el.email_type = ?
         )
       LIMIT 50`,
      [emailType],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
  return customers;
}

/**
 * Log that an email was sent
 */
async function logEmail(customerId, emailType, success, error) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO email_log (id, customer_id, email_type, sent_at, success, error)
       VALUES (?, ?, ?, datetime('now'), ?, ?)`,
      [require('uuid').v4(), customerId, emailType, success ? 1 : 0, error || null],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

/**
 * Run the onboarding email scheduler
 */
async function run() {
  console.log('📧 Running onboarding email scheduler...');
  const results = { day1: 0, day3: 0, day7: 0, day14: 0, errors: 0 };

  for (const emailType of Object.keys(DAYS_OFFSET)) {
    try {
      const customers = await getCustomersForEmail(emailType);
      console.log(`  ${emailType}: ${customers.length} customers to email`);

      for (const customer of customers) {
        try {
          const data = {
            agentName: customer.agent_name || 'Your Agent',
            businessName: customer.business_name || 'Your Business',
            plan: customer.plan || 'value',
            chatUrl: `https://maikr.pro/chat.html?agent=${customer.agent_id}`,
            dashboardUrl: `https://maikr.pro/dashboard?agent=${customer.agent_id}`,
          };
          const result = await sendOnboardingEmail(customer.email, emailType, data);
          await logEmail(customer.id, emailType, result.success, result.error);
          if (result.success) {
            results[emailType]++;
          } else {
            results.errors++;
            console.error(`  ❌ Failed to send ${emailType} to ${customer.email}:`, result.error);
          }
        } catch (e) {
          results.errors++;
          console.error(`  ❌ Error sending ${emailType} to ${customer.email}:`, e.message);
          await logEmail(customer.id, emailType, false, e.message);
        }
      }
    } catch (e) {
      console.error(`  ❌ Error processing ${emailType}:`, e.message);
      results.errors++;
    }
  }

  console.log('📧 Onboarding email results:', results);
  return results;
}

// Run if called directly
if (require.main === module) {
  run()
    .then(results => {
      console.log('Done:', results);
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { run };
