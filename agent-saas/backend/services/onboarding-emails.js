/**
 * M.ai.K.R Onboarding Email Sequence
 * Drip campaign sent to new customers after provisioning
 * 
 * Schedule:
 * - Day 0: Welcome (sent immediately after provisioning)
 * - Day 1: Getting Started Guide
 * - - Day 3: Pro Tips + Use Cases
 * - Day 7: Check-in + Support
 * - Day 14: Advanced Features + Upgrade Prompt
 */

const { sendEmail } = require('./alerter');

const BRAND = {
  name: 'M.ai.K.R',
  primaryColor: '#00ff41',
  bgColor: '#0a0a0a',
  textColor: '#ffffff',
  mutedColor: '#888',
  dashboardUrl: 'https://maikr.pro/dashboard',
  chatUrl: 'https://maikr.pro/chat',
};

function wrapEmail(content, title) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bgColor};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td style="text-align:center;padding-bottom:30px;">
        <span style="font-size:28px;font-weight:800;color:${BRAND.primaryColor};letter-spacing:3px;">${BRAND.name}</span>
        <br><span style="color:${BRAND.mutedColor};font-size:13px;">AI Agents That Work 24/7</span>
      </td>
    </tr>
    <tr>
      <td style="background:#111;border:1px solid #222;border-radius:12px;padding:36px;color:${BRAND.textColor};">
        ${content}
      </td>
    </tr>
    <tr>
      <td style="text-align:center;padding-top:24px;color:${BRAND.mutedColor};font-size:12px;">
        Powered by Avant Garde Institute LLC · <a href="https://maikr.pro" style="color:${BRAND.primaryColor};">maikr.pro</a>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function btn(text, url) {
  return `<a href="${url}" style="display:inline-block;background:${BRAND.primaryColor};color:${BRAND.bgColor};padding:13px 26px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">${text}</a>`;
}

// ── Day 1: Getting Started ──────────────────────────────────

function getDay1Email(data) {
  const { agentName, businessName, chatUrl, dashboardUrl } = data;
  const html = wrapEmail(`
    <h2 style="margin-top:0;">Let's get ${agentName} working for you</h2>
    <p>Hi there! It's been a day since you set up <strong>${agentName}</strong> for ${businessName}. Here's how to get the most out of your AI agent:</p>
    
    <h3 style="color:${BRAND.primaryColor};">🎯 Quick Start Checklist</h3>
    <ol style="line-height:1.8;">
      <li><strong>Test your agent</strong> — Start a conversation and see how it responds</li>
      <li><strong>Customize the appearance</strong> — Upload your brand logo and set colors</li>
      <li><strong>Review the system prompt</strong> — Fine-tune your agent's personality</li>
      <li><strong>Set up channels</strong> — Connect Slack, SMS, or WhatsApp</li>
    </ol>
    
    ${btn('Open Dashboard', dashboardUrl)}
    
    <p style="color:${BRAND.mutedColor};font-size:14px;">Need help? Just reply to this email or chat with your agent directly.</p>
  `, 'Getting Started with M.ai.K.R');

  const text = `
Let's get ${agentName} working for you!

Hi there! It's been a day since you set up ${agentName} for ${businessName}. Here's how to get the most out of your AI agent:

QUICK START CHECKLIST:
1. Test your agent — Start a conversation: ${chatUrl}
2. Customize the appearance — Upload your brand logo and set colors
3. Review the system prompt — Fine-tune your agent's personality  
4. Set up channels — Connect Slack, SMS, or WhatsApp

Open Dashboard: ${dashboardUrl}

Need help? Just reply to this email.

— The M.ai.K.R Team
  `.trim();

  return { subject: `Getting started with ${agentName}`, html, text };
}

// ── Day 3: Pro Tips ─────────────────────────────────────────

function getDay3Email(data) {
  const { agentName, businessName, dashboardUrl } = data;
  const html = wrapEmail(`
    <h2 style="margin-top:0;">Pro tips for ${agentName}</h2>
    <p>Hey! Here are 3 ways power users get more value from their AI agents:</p>
    
    <h3 style="color:${BRAND.primaryColor};">💡 Tip 1: Use Cases Matter</h3>
    <p>The more specific your use cases, the better your agent performs. Instead of "customer support," try "answer product questions about our SaaS pricing plans."</p>
    
    <h3 style="color:${BRAND.primaryColor};">💡 Tip 2: Set Up Escalations</h3>
    <p>Configure your agent to escalate to you when it can't handle a request. You'll never miss a hot lead.</p>
    
    <h3 style="color:${BRAND.primaryColor};">💡 Tip 3: Connect Multiple Channels</h3>
    <p>Your agent can handle conversations across your website, Slack, SMS, and WhatsApp — all from one dashboard.</p>
    
    ${btn('Explore Features', dashboardUrl)}
  `, '3 Pro Tips for Your AI Agent');

  const text = `
Pro tips for ${agentName}

Hey! Here are 3 ways power users get more value from their AI agents:

TIP 1: Use Cases Matter
The more specific your use cases, the better your agent performs. 
Instead of "customer support," try "answer product questions about our SaaS pricing plans."

TIP 2: Set Up Escalations
Configure your agent to escalate to you when it can't handle a request. You'll never miss a hot lead.

TIP 3: Connect Multiple Channels
Your agent can handle conversations across your website, Slack, SMS, and WhatsApp — all from one dashboard.

Explore: ${dashboardUrl}

— The M.ai.K.R Team
  `.trim();

  return { subject: `3 pro tips for ${agentName}`, html, text };
}

// ── Day 7: Check-in ─────────────────────────────────────────

function getDay7Email(data) {
  const { agentName, businessName, chatUrl, dashboardUrl } = data;
  const html = wrapEmail(`
    <h2 style="margin-top:0;">How's ${agentName} doing?</h2>
    <p>It's been a week since you launched your AI agent. We'd love to know how it's going!</p>
    
    <p>Here's what you can check in your dashboard:</p>
    <ul style="line-height:1.8;">
      <li>📊 <strong>Conversation volume</strong> — How many chats has your agent handled?</li>
      <li>⚡ <strong>Response quality</strong> — Are customers getting helpful answers?</li>
      <li>🎯 <strong>Escalations</strong> — Did any conversations need human help?</li>
    </ul>
    
    ${btn('View Dashboard', dashboardUrl)}
    
    <p style="margin-top:24px;">If you have any questions or feedback, just hit reply. We read every message.</p>
  `, 'How\'s Your AI Agent Doing?');

  const text = `
How's ${agentName} doing?

It's been a week since you launched your AI agent. We'd love to know how it's going!

Check your dashboard for:
📊 Conversation volume — How many chats has your agent handled?
⚡ Response quality — Are customers getting helpful answers?
🎯 Escalations — Did any conversations need human help?

Dashboard: ${dashboardUrl}

If you have questions or feedback, just hit reply. We read every message.

— The M.ai.K.R Team
  `.trim();

  return { subject: `How's ${agentName} doing?`, html, text };
}

// ── Day 14: Advanced + Upgrade ──────────────────────────────

function getDay14Email(data) {
  const { agentName, businessName, plan, dashboardUrl } = data;
  const isUpgrade = plan === 'value' || plan === 'growth';
  const upgradeText = isUpgrade 
    ? `<p>Ready for more power? Upgrading unlocks:</p>
       <ul style="line-height:1.8;">
         <li>🚀 <strong>More tokens</strong> — Handle higher conversation volume</li>
         <li>🧠 <strong>Premium models</strong> — GPT-4.1 and MiniMax for smarter responses</li>
         <li>📡 <strong>More channels</strong> — Connect all your communication platforms</li>
         <li>🔧 <strong>Priority support</strong> — Get help when you need it</li>
       </ul>
       ${btn('View Upgrade Options', dashboardUrl)}`
    : `<p>You're on the ${plan} plan — great choice! Make sure you're using all your features:</p>
       <ul style="line-height:1.8;">
         <li>🔌 <strong>MCP integrations</strong> — Connect GitHub, Notion, Slack, and more</li>
         <li>🤖 <strong>Swarm mode</strong> — Deploy multiple specialized agents</li>
         <li>📈 <strong>Optimization</strong> — Let AI improve your agent automatically</li>
       </ul>
       ${btn('Explore Advanced Features', dashboardUrl)}`;

  const html = wrapEmail(`
    <h2 style="margin-top:0;">${agentName} — 2 week milestone 🎉</h2>
    <p>Two weeks in! By now, ${agentName} has been working around the clock for ${businessName}.</p>
    ${upgradeText}
    <p style="color:${BRAND.mutedColor};font-size:14px;margin-top:24px;">Thank you for being part of the M.ai.K.R family!</p>
  `, '2 Week Milestone — M.ai.K.R');

  const text = `
${agentName} — 2 week milestone 🎉

Two weeks in! By now, ${agentName} has been working around the clock for ${businessName}.

${isUpgrade ? `Ready for more power? Upgrade to unlock:
🚀 More tokens — Handle higher conversation volume
🧠 Premium models — GPT-4.1 and MiniMax for smarter responses
📡 More channels — Connect all your communication platforms
🔧 Priority support — Get help when you need it` : `You're on the ${plan} plan! Make sure you're using MCP integrations, Swarm mode, and Optimization.`}

Dashboard: ${dashboardUrl}

Thank you for being part of the M.ai.K.R family!

— The M.ai.K.R Team
  `.trim();

  return { subject: `${agentName} — 2 week milestone 🎉`, html, text };
}

// ── Send onboarding email ───────────────────────────────────

async function sendOnboardingEmail(to, type, data) {
  let email;
  switch (type) {
    case 'day1': email = getDay1Email(data); break;
    case 'day3': email = getDay3Email(data); break;
    case 'day7': email = getDay7Email(data); break;
    case 'day14': email = getDay14Email(data); break;
    default: throw new Error(`Unknown onboarding email type: ${type}`);
  }
  return sendEmail(to, email.subject, email.text, email.html);
}

module.exports = {
  sendOnboardingEmail,
  getDay1Email,
  getDay3Email,
  getDay7Email,
  getDay14Email,
};
