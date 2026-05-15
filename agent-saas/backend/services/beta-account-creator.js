/**
 * Beta Account Creator — Creates test accounts with full agent provisioning
 * Skips Stripe payment, directly inserts into DB with 'beta' status.
 * 
 * Usage: node services/beta-account-creator.js
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../database');
const { generateAgentFiles } = require('./agent-generator');
const { startAgentSession } = require('./session-manager');

// ── Beta account definitions ─────────────────────────────────────────────────
const BETA_ACCOUNTS = [
  {
    name: 'Beta Alpha',
    email: 'beta-alpha@maikr.pro',
    password: 'beta1234!',
    agentName: 'AlphaBot',
    businessName: 'Alpha Industries',
    industry: 'Technology',
    targetAudience: 'SaaS founders and CTOs',
    tone: 'Professional, technical, concise',
    useCases: 'Product support, onboarding, technical FAQ',
    plan: 'growth',
    modelTier: 'standard',
    baseTokens: 50000,
    outcomeCredits: 500
  },
  {
    name: 'Beta Bravo',
    email: 'beta-bravo@maikr.pro',
    password: 'beta1234!',
    agentName: 'BravoAssist',
    businessName: 'Bravo Wellness',
    industry: 'Health & Wellness',
    targetAudience: 'Health-conscious adults 25-45',
    tone: 'Warm, encouraging, empathetic',
    useCases: 'Appointment booking, wellness tips, FAQ',
    plan: 'value',
    modelTier: 'standard',
    baseTokens: 20000,
    outcomeCredits: 100
  },
  {
    name: 'Beta Charlie',
    email: 'beta-charlie@maikr.pro',
    password: 'beta1234!',
    agentName: 'CharlieHelper',
    businessName: 'Charlie\'s Plumbing',
    industry: 'Home Services',
    targetAudience: 'Homeowners needing plumbing/HVAC help',
    tone: 'Friendly, trustworthy, straightforward',
    useCases: 'Service inquiries, scheduling, cost estimates',
    plan: 'growth',
    modelTier: 'standard',
    baseTokens: 50000,
    outcomeCredits: 500
  },
  {
    name: 'Beta Delta',
    email: 'beta-delta@maikr.pro',
    password: 'beta1234!',
    agentName: 'DeltaGuide',
    businessName: 'Delta Academy',
    industry: 'Education',
    targetAudience: 'Online course students and prospects',
    tone: 'Patient, educational, motivating',
    useCases: 'Course recommendations, student support, enrollment',
    plan: 'scale',
    modelTier: 'premium',
    baseTokens: 200000,
    outcomeCredits: 2000
  },
  {
    name: 'Beta Echo',
    email: 'beta-echo@maikr.pro',
    password: 'beta1234!',
    agentName: 'EchoSupport',
    businessName: 'Echo E-Commerce',
    industry: 'E-Commerce',
    targetAudience: 'Online shoppers, returns & tracking inquiries',
    tone: 'Helpful, efficient, brand-positive',
    useCases: 'Order tracking, returns, product recommendations',
    plan: 'value',
    modelTier: 'standard',
    baseTokens: 20000,
    outcomeCredits: 100
  }
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateSystemPrompt(data) {
  const { agentName, businessName, industry, targetAudience, tone, useCases } = data;
  return `You are ${agentName}, an AI assistant for ${businessName}.

INDUSTRY: ${industry}
TARGET AUDIENCE: ${targetAudience}
TONE: ${tone}
USE CASES: ${useCases}

INSTRUCTIONS:
- You are a ${tone} AI assistant representing ${businessName}
- Always stay in character as ${agentName}
- Be helpful, accurate, and professional
- Represent ${businessName} well in all interactions
- Keep responses concise but informative`;
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') + '-' + Date.now().toString(36);
}

// ── Create a single beta account ─────────────────────────────────────────────
async function createBetaAccount(config) {
  const {
    name, email, password, agentName, businessName, industry,
    targetAudience, tone, useCases, plan, modelTier, baseTokens, outcomeCredits
  } = config;

  console.log(`\n🔧 Creating beta account: ${name} (${email})`);

  // Check if user already exists
  const existingUser = await new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  if (existingUser) {
    console.log(`  ⚠️  User ${email} already exists, skipping`);
    return { skipped: true, email };
  }

  // 1. Create user
  const userId = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  await new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)',
      [userId, email.toLowerCase().trim(), passwordHash, name],
      (err) => { if (err) reject(err); else resolve(); }
    );
  });
  console.log(`  ✅ User created: ${userId}`);

  // 2. Create customer record
  const customerId = crypto.randomUUID();
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO customers (id, email, stripe_customer_id, stripe_session_id, plan, status, user_id)
       VALUES (?, ?, ?, ?, ?, 'active', ?)`,
      [customerId, email.toLowerCase().trim(), 'beta_' + crypto.randomUUID().slice(0, 8), 'beta_session', plan, userId],
      (err) => { if (err) reject(err); else resolve(); }
    );
  });
  console.log(`  ✅ Customer created: ${customerId}`);

  // 3. Create agent
  const agentId = crypto.randomUUID();
  const slug = slugify(businessName || agentName);
  const systemPrompt = generateSystemPrompt({ agentName, businessName, industry, targetAudience, tone, useCases });
  const monthlyCostCents = 0; // Beta = free

  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO agents (id, customer_id, agent_name, business_name, slug, industry, target_audience, tone, use_cases, system_prompt, stripe_session_id, plan, model_tier, monthly_cost_cents, base_tokens, outcome_credits, plan_name, status, data_opt_out)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0)`,
      [agentId, customerId, agentName, businessName, slug, industry, targetAudience, tone, useCases, systemPrompt, 'beta_session', plan, modelTier, monthlyCostCents, baseTokens, outcomeCredits, plan + ' (beta)'],
      (err) => { if (err) reject(err); else resolve(); }
    );
  });
  console.log(`  ✅ Agent created: ${agentId} (${slug})`);

  // 4. Generate API key
  const apiKeyId = crypto.randomUUID();
  const apiKey = 'makr_' + crypto.randomBytes(24).toString('hex');
  const keyHash = await bcrypt.hash(apiKey, 10);
  const keyPrefix = apiKey.substring(0, 12);

  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO api_keys (id, customer_id, key_hash, key_prefix)
       VALUES (?, ?, ?, ?)`,
      [apiKeyId, customerId, keyHash, keyPrefix],
      (err) => { if (err) reject(err); else resolve(); }
    );
  });
  console.log(`  ✅ API key generated: ${keyPrefix}...`);

  // 5. Generate OpenClaw agent files
  try {
    generateAgentFiles({
      slug, businessName, industry, tone,
      useCases: useCases ? useCases.split(',').map(s => s.trim()) : [],
      businessDetails: targetAudience, plan
    });
    console.log(`  ✅ Agent files generated at /opt/agents/${slug}/`);
  } catch (e) {
    console.warn(`  ⚠️  Agent files generation warning: ${e.message}`);
  }

  // 6. Register session key
  try {
    const sessionResult = await startAgentSession(agentId);
    console.log(`  ✅ Session registered: ${sessionResult.sessionKey}`);
  } catch (e) {
    console.warn(`  ⚠️  Session registration warning: ${e.message}`);
  }

  return {
    success: true,
    name, email, password,
    userId, customerId, agentId, slug, apiKey, plan
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Beta Account Creator — Creating 5 test accounts\n');
  console.log('='.repeat(60));

  const results = [];
  for (const config of BETA_ACCOUNTS) {
    try {
      const result = await createBetaAccount(config);
      results.push(result);
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`);
      results.push({ success: false, email: config.email, error: err.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Beta Account Summary:');
  console.log('-'.repeat(60));

  for (const r of results) {
    if (r.skipped) {
      console.log(`  ⏭️  ${r.email} — already exists`);
    } else if (r.success) {
      console.log(`  ✅ ${r.name}`);
      console.log(`     Email:    ${r.email}`);
      console.log(`     Password: ${r.password}`);
      console.log(`     Plan:     ${r.plan}`);
      console.log(`     Agent:    ${r.slug}`);
      console.log(`     Login:    https://maikr.pro/login`);
      console.log('');
    } else {
      console.log(`  ❌ ${r.email} — ${r.error}`);
    }
  }

  console.log('All beta accounts use password: beta1234!');
  console.log('Login at: https://maikr.pro/login');
}

// Run if called directly
if (require.main === module) {
  main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}

module.exports = { createBetaAccount, BETA_ACCOUNTS };
