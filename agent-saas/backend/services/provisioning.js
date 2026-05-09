const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { generateAgentFiles } = require('./agent-generator');
const { startAgentSession } = require('./session-manager');
const { sendEmail } = require('./alerter');
const https = require('https');

// Provision new customer and their agent after payment
async function provisionCustomer(paymentData) {
  const {
    email,
    customerId,
    subscriptionId,
    agentName,
    businessName,
    industry,
    targetAudience,
    tone,
    useCases,
    plan
  } = paymentData;

  console.log('🔄 Starting provisioning for:', email);

  // 1. Create customer
  const customerId_db = uuidv4();
  const customerInsert = new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO customers (id, email, stripe_customer_id, stripe_subscription_id, stripe_session_id, plan, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [customerId_db, email, customerId, subscriptionId, paymentData.sessionId, plan],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });

  // 2. Generate slug for agent URL
  const slug = (businessName || agentName)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    + '-' + Date.now().toString(36);

  // 3. Create agent
  const agentId = uuidv4();
  const systemPrompt = generateSystemPrompt({
    agentName, businessName, industry, targetAudience, tone, useCases
  });

  // Map tier to Derek's monthly cost
  const TIER_COSTS = { standard: 0, premium: 1500, elite: 3000 };
  const modelTier = paymentData.modelTier || 'standard';
  const monthlyCostCents = TIER_COSTS[modelTier] || 0;

  const agentInsert = new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO agents (id, customer_id, agent_name, business_name, slug, industry, target_audience, tone, use_cases, system_prompt, stripe_session_id, plan, model_tier, monthly_cost_cents, status, data_opt_out)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [agentId, customerId_db, agentName, businessName, slug, industry, targetAudience, tone, useCases, systemPrompt, paymentData.eventId, plan, modelTier, monthlyCostCents, paymentData.dataAgreement ? 0 : 1],
      function(err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  // 4. Generate API key
  const apiKeyId = uuidv4();
  const apiKey = 'makr_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const keyHash = apiKey; // In production, hash this!
  const keyPrefix = apiKey.substring(0, 12);

  const apiKeyInsert = new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO api_keys (id, customer_id, key_hash, key_prefix)
       VALUES (?, ?, ?, ?)`,
      [apiKeyId, customerId_db, keyHash, keyPrefix],
      function(err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  // 5. Generate OpenClaw agent config files (SOUL.md, AGENTS.md, USER.md, etc.)
  const agentFilesResult = generateAgentFiles({
    slug,
    businessName,
    industry,
    tone,
    useCases: useCases ? useCases.split(',').map(s => s.trim()) : [],
    businessDetails: targetAudience,
    plan
  });

  // 6. Start persistent OpenClaw agent session
  let sessionKey = null;
  const sessionStartResult = await startAgentSession(agentId).catch(err => {
    console.warn('⚠️ Could not start agent session:', err.message);
    return { sessionKey: null };
  });

  // Wait for all inserts
  await Promise.all([customerInsert, agentInsert, apiKeyInsert]);

  // 7. Send welcome email via Mailgun
  const welcomeEmail = generateWelcomeEmail({
    email,
    agentName,
    businessName,
    dashboardUrl: `https://maikr.pro/dashboard.html?agent=${agentId}&key=${apiKey}`,
    chatUrl: `https://maikr.pro/chat.html?agent=${agentId}`,
    apiKey
  });
  try {
    const emailResult = await sendEmail(email, welcomeEmail.subject, welcomeEmail.body);
    console.log('📧 Welcome email sent:', emailResult.success ? 'OK' : 'FAILED', emailResult.status || emailResult.error);
  } catch(e) {
    console.error('📧 Welcome email failed:', e.message);
  }
  console.log('🔗 Dashboard URL:', `http://maikr.pro/dashboard.html?agent=${agentId}&key=${apiKey}`);

  // Return provisioning results
  return {
    success: true,
    stripeEventId: paymentData.eventId,
    stripeSessionId: paymentData.sessionId,
    customerId: customerId_db,
    customerEmail: email,
    agentId,
    agentSlug: slug,
    dashboardUrl: `http://maikr.pro/dashboard.html?agent=${agentId}&key=${apiKey}`,
    chatUrl: `http://maikr.pro/chat.html?agent=${agentId}`,
    apiKey,
    plan,
    sessionKey: sessionStartResult?.sessionKey || null,
    agentDir: `/opt/agents/${slug}`
  };
}

function generateSystemPrompt(data) {
  const { agentName, businessName, industry, targetAudience, tone, useCases } = data;
  return `You are ${agentName}, an AI assistant for ${businessName}.

INDUSTRY: ${industry}
TARGET AUDIENCE: ${targetAudience}
TONE: ${tone}
USE CASES: ${useCases || 'General customer support'}

INSTRUCTIONS:
- You are a ${tone} AI assistant representing ${businessName}
- Always stay in character as ${agentName}
- Be helpful, accurate, and professional
- Represent ${businessName} well in all interactions
- Keep responses concise but informative`;
}

function generateWelcomeEmail(data) {
  return {
    to: data.email,
    subject: `Welcome to M.ai.K.R - Your AI Agent "${data.agentName}" is Ready!`,
    body: `
Hi there!

🎉 Your custom AI agent "${data.agentName}" is now active!

GET STARTED:
- Dashboard: ${data.dashboardUrl}
- Chat: ${data.chatUrl}

YOUR API KEY (keep secret):
${data.apiKey}

FEATURES INCLUDED:
✅ Custom AI trained on your brand voice
✅ Memory & conversation logs
✅ Appearance customization
✅ Full API access

Need help? Just chat with your agent!

Best,
The M.ai.K.R Team
    `
  };
}

// Update system prompt
function updateAgentSystemPrompt(agentId, newPrompt) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE agents SET system_prompt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPrompt, agentId],
      function(err) {
        if (err) reject(err);
        else resolve({ success: true });
      }
    );
  });
}

// Update agent appearance
function updateAgentAppearance(agentId, updates) {
  const { avatar_url, theme_color } = updates;
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE agents SET avatar_url = COALESCE(?, avatar_url), theme_color = COALESCE(?, theme_color), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [avatar_url, theme_color, agentId],
      function(err) {
        if (err) reject(err);
        else resolve({ success: true });
      }
    );
  });
}

// Get agent memory/conversations
function getAgentMemory(agentId, limit = 50) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM conversations WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?',
      [agentId, limit],
      function(err, rows) {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

// Add to conversation memory
function addToMemory(agentId, role, content) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO conversations (id, agent_id, role, content) VALUES (?, ?, ?, ?)',
      [uuidv4(), agentId, role, content],
      function(err) {
        if (err) reject(err);
        else resolve({ success: true });
      }
    );
  });
}

module.exports = {
  provisionCustomer,
  updateAgentSystemPrompt,
  updateAgentAppearance,
  getAgentMemory,
  addToMemory
};
