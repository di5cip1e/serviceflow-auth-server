# Browser Automation Tool

A Playwright-based tool for web automation, form filling, and account creation.

## Installation

```bash
npm install playwright @playwright/test
npx playwright install chromium
```

## Usage

```typescript
import { BrowserBot } from './browser-bot';

const bot = new BrowserBot();

// Navigate and fill forms
await bot.goto('https://proton.me');
await bot.fill('input[name="email"]', 'myemail@example.com');
await bot.fill('input[name="password"]', 'SecurePassword123!');
await bot.click('button[type="submit"]');
await bot.waitForNavigation();

// Take screenshot
await bot.screenshot('signup-result.png');

// Get page content
const content = await bot.content();

// Close browser
await bot.close();
```

## Features

- Navigate to URLs
- Fill forms (input, textarea, select)
- Click elements (buttons, links)
- Wait for navigation, selectors, or network idle
- Handle iframes
- Upload files
- Screenshot capture
- Extract data from pages
- Store credentials securely

## CAPTCHA Handling

CAPTCHAs are difficult to solve programmatically. Options:

1. **2Captcha API** - Paid service, ~$3/1000 solves
2. **Anti-Captcha API** - Similar pricing
3. **Manual intervention** - Pause and let human solve
4. **Avoid** - Use services with email/password APIs instead

## Security

Store credentials in `EXTERNAL_ACCOUNTS.md` with encryption:

```markdown
# External Accounts

## Proton
- Email: [stored securely]
- Password: [encrypted]
- 2FA: [if enabled]

## GitHub
- Email: [stored securely]
- Password: [encrypted]
```
