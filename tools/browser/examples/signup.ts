#!/usr/bin/env npx ts-node

/**
 * Example: Sign up for a service using BrowserBot
 * 
 * Usage:
 *   npx ts-node examples/signup.ts
 * 
 * Requirements:
 *   npm install playwright
 *   npx playwright install chromium
 */

import { BrowserBot } from '../browser-bot';

const PROTON_EMAIL = process.env.PROTON_EMAIL || 'desired-email@proton.me';
const PROTON_PASSWORD = process.env.PROTON_PASSWORD || 'SecurePassword123!';

async function signupProton() {
  console.log('🚀 Starting Proton signup...');
  
  const bot = new BrowserBot();
  
  try {
    await bot.init();
    
    // Go to signup page
    await bot.goto('https://proton.me/signup');
    await bot.waitForSelector('input[name="email"]');
    await bot.screenshot('01-proton-signup.png');
    
    // Step 1: Choose email
    // await bot.fill('input[name="email"]', PROTON_EMAIL);
    // await bot.click('button[type="submit"]');
    
    console.log('📝 Fill in your details manually, then press Enter...');
    await bot.pauseForManual('Complete the signup form');
    
    // Store credentials if signup successful
    // await bot.storeAccount('Proton', PROTON_EMAIL, PROTON_PASSWORD);
    
    await bot.screenshot('02-complete.png');
    console.log('✅ Signup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await bot.close();
  }
}

// Run example
signupProton();
