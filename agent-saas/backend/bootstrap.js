/**
 * Bootstrap — centralized secrets loading & env validation.
 * Loads secrets from ~/.openclaw/secrets.json and validates required env vars.
 * Never mutates process.env with secrets — use getSecret() instead.
 */
const fs = require('fs');

const REQUIRED_KEYS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'OPENROUTER_API_KEY',
];

const WARN_KEYS = [
  'SESSION_SECRET',
];

// Load secrets from secrets.json into a private object
const SECRETS = {};
try {
  const raw = fs.readFileSync('/root/.openclaw/secrets.json', 'utf8');
  const parsed = JSON.parse(raw);
  Object.assign(SECRETS, parsed);
} catch (e) {
  console.warn('[bootstrap] Could not load secrets.json:', e.message);
}

/**
 * Get a secret by key. Checks secrets.json first, then process.env.
 * Use this instead of process.env for sensitive keys.
 */
function getSecret(key) {
  return SECRETS[key] || process.env[key] || null;
}

/**
 * Validate that all required keys are present. Exit if missing.
 */
function validate() {
  const missing = REQUIRED_KEYS.filter(k => !getSecret(k));
  if (missing.length > 0) {
    console.error('[bootstrap] FATAL — Missing required environment variables:');
    missing.forEach(k => console.error(`  ✗ ${k}`));
    console.error('[bootstrap] Set them in .env or ~/.openclaw/secrets.json');
    process.exit(1);
  }
  const warnMissing = WARN_KEYS.filter(k => !getSecret(k));
  if (warnMissing.length > 0) {
    console.warn('[bootstrap] WARNING — Missing recommended keys (using defaults):');
    warnMissing.forEach(k => console.warn(`  ⚠ ${k}`));
  }
  console.log('[bootstrap] All required secrets present.');
}

module.exports = { getSecret, validate, SECRETS };
