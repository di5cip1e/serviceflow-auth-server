const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  
  // Collect errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  // Track network failures with URLs
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push({ url: request.url(), error: request.failure().errorText });
  });
  
  try {
    console.log('=== COMPREHENSIVE GAME AUDIT ===\n');
    console.log('1. Navigating to game...');
    
    // Use domcontentloaded instead of networkidle0
    await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    console.log('   Page loaded (domcontentloaded). Waiting for game...');
    await delay(8000);
    
    // Show console errors
    console.log('\n2. Console messages:');
    consoleMessages.forEach(msg => {
      console.log(`   [${msg.type}] ${msg.text}`);
    });
    
    // Show JavaScript errors
    console.log('\n3. JavaScript errors:');
    if (errors.length > 0) {
      errors.forEach(err => console.log(`   ${err}`));
    } else {
      console.log('   None');
    }
    
    // Show network failures
    console.log('\n4. Network failures:');
    if (networkErrors.length > 0) {
      networkErrors.forEach(n => {
        console.log(`   ${n.url} - ${n.error}`);
      });
    } else {
      console.log('   None');
    }
    
    // Check if Phaser game loaded
    const gameExists = await page.evaluate(() => {
      return !!document.querySelector('canvas');
    });
    console.log('\n5. Game canvas exists:', gameExists);
    
    // Get window.game
    const gameInfo = await page.evaluate(() => {
      return {
        hasGame: typeof window !== 'undefined' && typeof window.game !== 'undefined',
        hasPhaser: typeof window.Phaser !== 'undefined'
      };
    });
    console.log('   Window game info:', gameInfo);
    
    // Get the page title
    const title = await page.title();
    console.log('   Page title:', title);
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
  
  await browser.close();
  console.log('\n=== AUDIT COMPLETE ===');
})();