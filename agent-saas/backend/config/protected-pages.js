// Single source of truth for protected page lists
const PROTECTED_PAGES = new Set([
  'chat.html', 'observe.html', 'swarm.html', 'channels.html',
  'mcp.html', 'optimization.html', 'settings.html', 'command-center.html',
  'deploy.html', 'admin.html', 'dashboard.html',
  'leads.html', 'onboarding-wizard.html', 'analytics.html', 'agent-studio.html',
  'blueprints.html', 'workflow-canvas.html', 'whitelabel.html',
  'templates.html', 'byok.html', 'widgets.html',
  'speed-to-lead.html'
]);

module.exports = { PROTECTED_PAGES };
