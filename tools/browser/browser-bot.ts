import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface Account {
  service: string;
  email: string;
  password: string;
  twofa?: string;
  notes?: string;
  createdAt: string;
}

export class BrowserBot {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private accountsFile = path.join(process.cwd(), 'EXTERNAL_ACCOUNTS.md');

  async init(): Promise<void> {
    this.browser = await chromium.launch({ 
      headless: false // Set to true for headless
    });
    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    this.page = await this.context.newPage();
    console.log('Browser initialized');
  }

  async goto(url: string, options?: { timeout?: number; waitUntil?: string }): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.goto(url, { 
      timeout: options?.timeout || 30000,
      waitUntil: (options?.waitUntil as any) || 'domcontentloaded'
    });
    console.log(`Navigated to: ${url}`);
  }

  async fill(selector: string, value: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.fill(selector, value);
    console.log(`Filled ${selector} with: ${value}`);
  }

  async click(selector: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.click(selector);
    console.log(`Clicked: ${selector}`);
  }

  async waitForSelector(selector: string, options?: { timeout?: number }): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.waitForSelector(selector, { timeout: options?.timeout || 30000 });
  }

  async waitForNavigation(timeout = 30000): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  async waitForURL(pattern: string | RegExp, options?: { timeout?: number }): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.waitForURL(pattern, { timeout: options?.timeout || 30000 });
  }

  async screenshot(name: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.screenshot({ path: name, fullPage: true });
    console.log(`Screenshot saved: ${name}`);
  }

  async content(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');
    return await this.page.content();
  }

  async text(selector: string): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');
    return await this.page.textContent(selector) || '';
  }

  async attribute(selector: string, attr: string): Promise<string | null> {
    if (!this.page) throw new Error('Browser not initialized');
    return await this.page.getAttribute(selector, attr);
  }

  async select(selector: string, value: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.selectOption(selector, value);
  }

  async upload(selector: string, filePath: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.setInputFiles(selector, filePath);
  }

  async evaluate<T>(fn: (page: Page) => T): Promise<T> {
    if (!this.page) throw new Error('Browser not initialized');
    return await this.page.evaluate(fn);
  }

  // Handle basic CAPTCHA challenges (image-based)
  async solveImageCaptcha(selector: string): Promise<boolean> {
    console.log('⚠️ Image CAPTCHA solving requires manual intervention or paid service');
    // Could integrate 2Captcha or Anti-Captcha here
    return false;
  }

  // Handle reCAPTCHA (requires paid service)
  async solveRecaptcha(): Promise<boolean> {
    console.log('⚠️ reCAPTCHA solving requires 2Captcha or Anti-Captcha API');
    // Could integrate with 2Captcha API here
    return false;
  }

  // Pause for manual intervention
  async pauseForManual(message = 'Paused for manual intervention'): Promise<void> {
    console.log(`⏸️ ${message}`);
    // In headful mode, user can interact manually
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second pause
  }

  // Store account credentials
  async storeAccount(service: string, email: string, password: string, twofa?: string, notes?: string): Promise<void> {
    const account: Account = {
      service,
      email,
      password,
      twofa,
      notes,
      createdAt: new Date().toISOString()
    };

    let accounts: Account[] = [];
    
    // Load existing accounts
    if (fs.existsSync(this.accountsFile)) {
      const content = fs.readFileSync(this.accountsFile, 'utf-8');
      // Parse existing markdown (basic)
      const lines = content.split('\n');
      let currentService = '';
      for (const line of lines) {
        if (line.startsWith('## ')) {
          currentService = line.replace('## ', '');
        }
        if (line.includes('Email:') && currentService === service) {
          // Found existing, update
          accounts.push(account);
          continue;
        }
      }
    }

    // Add or update account
    accounts = accounts.filter(a => a.service !== service);
    accounts.push(account);

    // Write back
    let md = '# External Accounts\n\n';
    for (const acc of accounts) {
      md += `## ${acc.service}\n`;
      md += `- Email: ${acc.email}\n`;
      md += `- Password: ${acc.password}\n`;
      if (acc.twofa) md += `- 2FA: ${acc.twofa}\n`;
      if (acc.notes) md += `- Notes: ${acc.notes}\n`;
      md += `- Created: ${acc.createdAt}\n\n`;
    }

    fs.writeFileSync(this.accountsFile, md);
    console.log(`✅ Account stored for: ${service}`);
  }

  async close(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    console.log('Browser closed');
  }
}

// CLI usage example
if (require.main === module) {
  (async () => {
    const bot = new BrowserBot();
    
    try {
      await bot.init();
      
      // Example: Sign up for Proton
      await bot.goto('https://proton.me/signup');
      await bot.waitForSelector('input[name="email"]');
      
      // Would fill in actual values here
      // await bot.fill('input[name="email"]', 'test@example.com');
      
      await bot.screenshot('proton-signup.png');
      
      console.log('Done! Check screenshot.');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      await bot.close();
    }
  })();
}
