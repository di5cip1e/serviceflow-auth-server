const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('crypto').randomUUID ? { v4: () => require('crypto').randomUUID() } : require('uuid');

// Seed initial templates if table is empty
function seedTemplates() {
  db.get('SELECT COUNT(*) as cnt FROM templates', [], (err, row) => {
    if (err || row.cnt > 0) return;
    const templates = [
      {
        id: uuidv4(), name: 'E-Commerce Support Pro', slug: 'ecommerce-support-pro',
        description: 'Full customer service agent for e-commerce stores. Handles returns, shipping questions, product recommendations, and upsells.',
        category: 'Support', industry: 'E-Commerce',
        price_cents: 0, is_premium: 0, rating: 4.8, downloads: 342,
        config: JSON.stringify({ tone: 'friendly', response_length: 'medium', escalation_threshold: 'frustrated' }),
        guardrays: JSON.stringify(['never_discount_unauthorized', 'escalate_complaints', 'no_competitor_mentions']),
        system_prompt: 'You are a customer service representative for an online store. Be helpful, friendly, and solution-oriented. Always try to resolve issues before escalating.'
      },
      {
        id: uuidv4(), name: 'Real Estate Lead Gen', slug: 'real-estate-lead-gen',
        description: 'Captures and qualifies real estate leads. Schedules viewings, answers property questions, and nurtures cold leads into appointments.',
        category: 'Sales', industry: 'Real Estate',
        price_cents: 499, is_premium: 1, rating: 4.9, downloads: 218,
        config: JSON.stringify({ tone: 'professional', response_length: 'detailed', collect_contact_info: true }),
        guardrails: JSON.stringify(['never_guarantee_price', 'escalate_legal_questions', 'alway_schedule_followup']),
        system_prompt: 'You are a real estate assistant. Your goal is to qualify leads by understanding their budget, timeline, and property preferences. Always aim to schedule a viewing or call with an agent.'
      },
      {
        id: uuidv4(), name: 'Local Service Scheduler', slug: 'local-service-scheduler',
        description: 'Automated scheduling and FAQ for local service businesses — plumbers, HVAC, electricians, cleaning services.',
        category: 'Operations', industry: 'Home Services',
        price_cents: 299, is_premium: 1, rating: 4.7, downloads: 156,
        config: JSON.stringify({ tone: 'friendly_professional', response_length: 'concise', collect_address: true }),
        guardrails: JSON.stringify(['never_quote_exact_price', 'escalate_emergency', 'confirm_before_scheduling']),
        system_prompt: 'You are a scheduling assistant for a local service business. Help customers book appointments, answer service area questions, and provide general pricing ranges. Always confirm appointments.'
      },
      {
        id: uuidv4(), name: 'Healthcare Front Desk', slug: 'healthcare-front-desk',
        description: 'Manages patient inquiries, appointment booking, and insurance questions for medical practices. HIPAA-aware responses.',
        category: 'Support', industry: 'Healthcare',
        price_cents: 799, is_premium: 1, rating: 4.6, downloads: 89,
        config: JSON.stringify({ tone: 'empathetic', response_length: 'detailed', collect_insurance: true }),
        guardrails: JSON.stringify(['never_diagnose', 'escalate_medical_urgent', 'privacy_first', 'hipaa_compliant']),
        system_prompt: 'You are a front desk assistant for a medical practice. Help patients schedule appointments, answer insurance questions, and provide office information. Never provide medical advice.'
      },
      {
        id: uuidv4(), name: 'SaaS Onboarding Guide', slug: 'saas-onboarding-guide',
        description: 'Guides new users through product onboarding, answers feature questions, and reduces churn with proactive check-ins.',
        category: 'Onboarding', industry: 'Technology',
        price_cents: 0, is_premium: 0, rating: 4.5, downloads: 274,
        config: JSON.stringify({ tone: 'enthusiastic', response_length: 'adaptive', track_progress: true }),
        guardrails: JSON.stringify(['never_share_internal_data', 'escalate_billing_disputes', 'no_promises_without_pm']),
        system_prompt: 'You are a customer success assistant for a SaaS product. Help new users get started, answer feature questions, and ensure they reach their aha moment quickly.'
      },
      {
        id: uuidv4(), name: 'Restaurant Reservations & FAQ', slug: 'restaurant-reservations',
        description: 'Handles table reservations, menu questions, dietary accommodations, and waitlist management for restaurants.',
        category: 'Hospitality', industry: 'Food & Beverage',
        price_cents: 199, is_premium: 1, rating: 4.4, downloads: 112,
        config: JSON.stringify({ tone: 'warm_hospitable', response_length: 'concise', require_phone: true }),
        guardrails: JSON.stringify(['never_guarantee_table', 'confirm_parties_over_8', 'escalate_complaints_to_manager']),
        system_prompt: 'You are a restaurant reservations assistant. Help guests book tables, answer menu and dietary questions, and create a welcoming experience. Always confirm details before finalizing.'
      }
    ];

    const stmt = db.prepare(`INSERT OR IGNORE INTO templates
      (id, name, slug, description, category, industry, price_cents, is_premium, rating, downloads, config, guardrails, system_prompt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    templates.forEach(t => stmt.run(t.id, t.name, t.slug, t.description, t.category, t.industry, t.price_cents, t.is_premium, t.rating, t.downloads, t.config, t.guardrails, t.system_prompt));
    stmt.finalize();
    console.log('[Templates] Seeded', templates.length, 'default templates');
  });
}
seedTemplates();

// List all templates (public)
router.get('/', (req, res) => {
  const { category, industry, premium } = req.query;
  let sql = 'SELECT id, name, slug, description, category, industry, thumbnail_url, price_cents, is_premium, rating, downloads, created_at FROM templates WHERE 1=1';
  const params = [];

  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (industry) { sql += ' AND industry = ?'; params.push(industry); }
  if (premium === '1') { sql += ' AND is_premium = 1'; }
  if (premium === '0') { sql += ' AND is_premium = 0'; }

  sql += ' ORDER BY is_premium DESC, downloads DESC, name ASC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.json({ error: err.message });
    res.json(rows || []);
  });
});

// Get single template detail
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM templates WHERE id = ? OR slug = ?', [req.params.id, req.params.id], (err, row) => {
    if (err) return res.json({ error: err.message });
    if (!row) return res.json({ error: 'Not found' });

    // Check if customer has unlocked
    let unlocked = row.price_cents === 0;
    if (!unlocked && req.session.userId) {
      db.get('SELECT 1 FROM customer_templates WHERE customer_id = (SELECT id FROM customers WHERE user_id = ?) AND template_id = ?',
        [req.session.userId, row.id], (err2, purchase) => {
          if (purchase) unlocked = true;
          const result = {
            ...row,
            price: (row.price_cents / 100).toFixed(2),
            unlocked,
            config: safeParse(row.config),
            guardrails: safeParse(row.guardrails)
          };
          res.json(result);
        });
    } else {
      const result = {
        ...row,
        price: (row.price_cents / 100).toFixed(2),
        unlocked,
        config: safeParse(row.config),
        guardrails: safeParse(row.guardrails)
      };
      res.json(result);
    }
  });
});

// Purchase a premium template (via Stripe — simplified as direct unlock for now)
router.post('/:id/purchase', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  db.get('SELECT id, price_cents, name FROM templates WHERE id = ? OR slug = ?', [req.params.id, req.params.id], (err, tmpl) => {
    if (err) return res.json({ error: err.message });
    if (!tmpl) return res.json({ error: 'Template not found' });
    if (tmpl.price_cents === 0) return res.json({ error: 'This template is free — use it directly' });

    // Check if already purchased
    db.get(`SELECT 1 FROM customer_templates ct
            JOIN customers c ON ct.customer_id = c.id
            WHERE c.user_id = ? AND ct.template_id = ?`,
      [req.session.userId, tmpl.id], (err2, existing) => {
        if (err2) return res.json({ error: err2.message });
        if (existing) return res.json({ success: true, alreadyUnlocked: true });

        // Get or create customer, then record purchase
        getOrCreateCustomer(req.session.userId, (err3, customer) => {
          if (err3) return res.json({ error: err3.message });
          if (!customer) return res.json({ error: 'Customer not found' });

          const purchaseId = uuidv4();
          db.run('INSERT INTO template_purchases (id, customer_id, template_id, price_paid_cents, status) VALUES (?, ?, ?, ?, ?)',
            [purchaseId, customer.id, tmpl.id, tmpl.price_cents, 'completed'], (err4) => {
              if (err4) return res.json({ error: err4.message });
              db.run('INSERT OR IGNORE INTO customer_templates (customer_id, template_id) VALUES (?, ?)',
                [customer.id, tmpl.id], (err5) => {
                  if (err5) return res.json({ error: err5.message });
                  db.run('UPDATE templates SET downloads = downloads + 1 WHERE id = ?', [tmpl.id]);
                  res.json({ success: true, templateId: tmpl.id, templateName: tmpl.name });
                });
            });
        });
      });
  });
});

// Apply template to an agent
router.post('/:id/apply', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });
  const { agentId } = req.body;
  if (!agentId) return res.json({ error: 'agentId required' });

  db.get('SELECT * FROM templates WHERE id = ? OR slug = ?', [req.params.id, req.params.id], (err, tmpl) => {
    if (err) return res.json({ error: err.message });
    if (!tmpl) return res.json({ error: 'Template not found' });

    // Verify unlocked
    db.get(`SELECT 1 FROM customer_templates ct
            JOIN customers c ON ct.customer_id = c.id
            WHERE c.user_id = ? AND ct.template_id = ?`,
      [req.session.userId, tmpl.id], (err2, access) => {
        if (err2) return res.json({ error: err2.message });
        if (!access && tmpl.price_cents > 0) return res.json({ error: 'Template not purchased' });

        const config = safeParse(tmpl.config) || {};
        const updates = [];
        const params = [];
        if (tmpl.system_prompt) { updates.push('system_prompt = ?'); params.push(tmpl.system_prompt); }
        if (config.tone) { updates.push('tone = ?'); params.push(config.tone); }
        if (tmpl.industry) { updates.push('industry = ?'); params.push(tmpl.industry); }
        if (tmpl.guardrails) { updates.push('guardrails = ?'); params.push(tmpl.guardrails); }

        if (updates.length > 0) {
          updates.push('updated_at = CURRENT_TIMESTAMP');
          params.push(agentId);
          db.run(`UPDATE agents SET ${updates.join(', ')} WHERE id = ?`, params, function(err3) {
            if (err3) return res.json({ error: err3.message });
            res.json({ success: true, changes: this.changes, template: tmpl.name });
          });
        } else {
          res.json({ success: true, message: 'No config to apply', template: tmpl.name });
        }
      });
  });
});

// Get customer's unlocked templates
router.get('/mine/list', (req, res) => {
  if (!req.session.userId) return res.json({ error: 'Unauthorized' });

  db.all(`SELECT t.id, t.name, t.slug, t.category, t.industry, t.price_cents, t.is_premium, ct.unlocked_at
          FROM customer_templates ct
          JOIN customers c ON ct.customer_id = c.id
          JOIN templates t ON ct.template_id = t.id
          WHERE c.user_id = ?
          ORDER BY ct.unlocked_at DESC`,
    [req.session.userId], (err, rows) => {
      if (err) return res.json({ error: err.message });
      res.json(rows || []);
    });
});

function safeParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

// Helper: get or create customer row
function getOrCreateCustomer(userId, callback) {
  db.get('SELECT * FROM customers WHERE user_id = ?', [userId], (err, row) => {
    if (err) return callback(err);
    if (row) return callback(null, row);
    const custId = uuidv4();
    db.run('INSERT INTO customers (id, user_id, email, status) VALUES (?, ?, (SELECT email FROM users WHERE id = ?), ?)',
      [custId, userId, userId, 'active'], function(err2) {
        if (err2) return callback(err2);
        db.get('SELECT * FROM customers WHERE id = ?', [custId], (err3, newRow) => {
          callback(err3, newRow);
        });
      });
  });
}

module.exports = router;
