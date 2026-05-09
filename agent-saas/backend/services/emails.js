/**
 * M.ai.K.R Email Service
 * Professional email templates for customer onboarding
 * 
 * Branding: Matrix green (#00ff41), dark theme
 * Powered by Avant Garde Institute LLC
 */

const BRANDING = {
  name: 'M.ai.K.R',
  tagline: 'The AI Agent Builder',
  primaryColor: '#00ff41',
  backgroundColor: '#0a0a0a',
  textColor: '#ffffff',
  mutedColor: '#888888',
  footerText: 'Powered by Avant Garde Institute LLC',
  dashboardUrl: 'https://maikr.ai/dashboard',
  chatUrl: 'https://maikr.ai/chat',
};

/**
 * Generate HTML email wrapper with branding
 */
function wrapEmail(content, title) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: ${BRANDING.backgroundColor};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: ${BRANDING.primaryColor};
      letter-spacing: 4px;
      text-shadow: 0 0 20px ${BRANDING.primaryColor}40;
    }
    .tagline {
      color: ${BRANDING.mutedColor};
      font-size: 14px;
      margin-top: 8px;
    }
    .content {
      background: #111111;
      border: 1px solid #222222;
      border-radius: 12px;
      padding: 40px;
      color: ${BRANDING.textColor};
    }
    .content h1 {
      margin: 0 0 20px 0;
      font-size: 24px;
      color: ${BRANDING.textColor};
    }
    .content p {
      line-height: 1.6;
      color: ${BRANDING.textColor};
      margin: 0 0 16px 0;
    }
    .content a {
      color: ${BRANDING.primaryColor};
      text-decoration: none;
    }
    .btn {
      display: inline-block;
      background: ${BRANDING.primaryColor};
      color: ${BRANDING.backgroundColor};
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
    }
    .btn:hover {
      box-shadow: 0 0 20px ${BRANDING.primaryColor}60;
    }
    .code-block {
      background: #1a1a1a;
      border: 1px solid ${BRANDING.primaryColor}30;
      border-radius: 8px;
      padding: 16px;
      font-family: 'Monaco', 'Consolas', monospace;
      color: ${BRANDING.primaryColor};
      overflow-x: auto;
      margin: 16px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #222222;
      color: ${BRANDING.mutedColor};
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">${BRANDING.name}</div>
      <div class="tagline">${BRANDING.tagline}</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      ${BRANDING.footerText}
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Plain text email wrapper
 */
function wrapEmailPlain(content, title) {
  const separator = '='.repeat(50);
  return `
${separator}
${BRANDING.name} - ${BRANDING.tagline}
${separator}

${content}

${separator}
${BRANDING.footerText}
  `.trim();
}

// ============================================================
// WELCOME EMAIL - Sent when agent is first provisioned
// ============================================================

function getWelcomeEmailHTML(data) {
  const { agentName, businessName, dashboardUrl, chatUrl, apiKey } = data;
  return wrapEmail(`
    <h1>Welcome to M.ai.K.R, ${agentName}!</h1>
    <p>Your AI agent has been successfully provisioned. We're excited to have you on board!</p>
    <p>Your agent <strong>${businessName}</strong> is ready to serve. Here's what you can do next:</p>
    <ul>
      <li>Access your dashboard to configure your agent</li>
      <li>Start chatting with your agent</li>
      <li>Integrate using your API key</li>
    </ul>
    <a href="${dashboardUrl}" class="btn">Go to Dashboard</a>
    <div class="code-block">API Key: ${apiKey}</div>
    <p style="color: ${BRANDING.mutedColor}; font-size: 14px;">
      Keep your API key secure — it's used to authenticate requests to your agent.
    </p>
  `, 'Welcome to M.ai.K.R');
}

function getWelcomeEmailPlain(data) {
  const { agentName, businessName, dashboardUrl, chatUrl, apiKey } = data;
  return wrapEmailPlain(`
Welcome to M.ai.K.R, ${agentName}!

Your AI agent has been successfully provisioned. We're excited to have you on board!

Your agent "${businessName}" is ready to serve. Here's what you can do next:

1. Access your dashboard to configure your agent
2. Start chatting with your agent
3. Integrate using your API key

Dashboard: ${dashboardUrl}
Chat: ${chatUrl}

Your API Key: ${apiKey}

Keep your API key secure — it's used to authenticate requests to your agent.
  `, 'Welcome to M.ai.K.R');
}

// ============================================================
// CONFIRMATION EMAIL - Sent after successful payment
// ============================================================

function getConfirmationEmailHTML(data) {
  const { agentName, businessName, dashboardUrl, chatUrl } = data;
  return wrapEmail(`
    <h1>Payment Confirmed!</h1>
    <p>Hi ${agentName},</p>
    <p>Great news! Your payment has been successfully processed.</p>
    <p>Your subscription for <strong>${businessName}</strong> is now active. You have full access to all premium features.</p>
    <a href="${dashboardUrl}" class="btn">Access Dashboard</a>
    <p>Thank you for choosing M.ai.K.R!</p>
  `, 'Payment Confirmed - M.ai.K.R');
}

function getConfirmationEmailPlain(data) {
  const { agentName, businessName, dashboardUrl, chatUrl } = data;
  return wrapEmailPlain(`
Payment Confirmed!

Hi ${agentName},

Great news! Your payment has been successfully processed.

Your subscription for "${businessName}" is now active. You have full access to all premium features.

Dashboard: ${dashboardUrl}
Chat: ${chatUrl}

Thank you for choosing M.ai.K.R!
  `, 'Payment Confirmed - M.ai.K.R');
}

// ============================================================
// RESET PASSWORD EMAIL - For password resets
// ============================================================

function getResetPasswordEmailHTML(data) {
  const { agentName, resetLink, dashboardUrl } = data;
  return wrapEmail(`
    <h1>Reset Your Password</h1>
    <p>Hi ${agentName},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <a href="${resetLink}" class="btn">Reset Password</a>
    <p style="color: ${BRANDING.mutedColor}; font-size: 14px;">
      This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
    </p>
  `, 'Reset Your Password - M.ai.K.R');
}

function getResetPasswordEmailPlain(data) {
  const { agentName, resetLink, dashboardUrl } = data;
  return wrapEmailPlain(`
Reset Your Password

Hi ${agentName},

We received a request to reset your password. Click the link below to create a new password:

Reset Link: ${resetLink}

This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
  `, 'Reset Your Password - M.ai.K.R');
}

// ============================================================
// EMAIL SENDING (Console log for now - integrate SendGrid/SMTP later)
// ============================================================

/**
 * Send email - currently logs to console
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendEmail(to, subject, html, text) {
  // TODO: Integrate SendGrid, AWS SES, or SMTP
  console.log('='.repeat(60));
  console.log('📧 EMAIL SENT');
  console.log('='.repeat(60));
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('-'.repeat(60));
  console.log('HTML Preview (first 500 chars):');
  console.log(html.substring(0, 500) + '...');
  console.log('-'.repeat(60));
  console.log('Text Preview (first 500 chars):');
  console.log(text.substring(0, 500) + '...');
  console.log('='.repeat(60));
  
  // Simulate sending - replace with actual email service integration
  return {
    success: true,
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(to, data) {
  const html = getWelcomeEmailHTML(data);
  const text = getWelcomeEmailPlain(data);
  return sendEmail(to, `Welcome to M.ai.K.R, ${data.agentName}!`, html, text);
}

/**
 * Send confirmation email
 */
async function sendConfirmationEmail(to, data) {
  const html = getConfirmationEmailHTML(data);
  const text = getConfirmationEmailPlain(data);
  return sendEmail(to, 'Payment Confirmed - M.ai.K.R', html, text);
}

/**
 * Send reset password email
 */
async function sendResetPasswordEmail(to, data) {
  const html = getResetPasswordEmailHTML(data);
  const text = getResetPasswordEmailPlain(data);
  return sendEmail(to, 'Reset Your Password - M.ai.K.R', html, text);
}

module.exports = {
  BRANDING,
  sendEmail,
  sendWelcomeEmail,
  sendConfirmationEmail,
  sendResetPasswordEmail,
  getWelcomeEmailHTML,
  getWelcomeEmailPlain,
  getConfirmationEmailHTML,
  getConfirmationEmailPlain,
  getResetPasswordEmailHTML,
  getResetPasswordEmailPlain,
};