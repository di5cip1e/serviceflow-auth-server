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
  
  // Track requests
  const requests = [];
  page.on('request', request => {
    requests.push({ url: request.url(), method: request.method() });
  });
  
  // Collect network failures with URLs
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push({ url: request.url(), error: request.failure().errorText });
  });
  
  // Track responses
  const responses = [];
  page.on('response', response => {
    responses.push({ url: response.url(), status: response.status() });
  });
  
  try {
    console.log('=== COMPREHENSIVE GAME AUDIT - DEBUG VERSION ===\n');
    console.log('1. Navigating to game...');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    console.log('   Page loaded. Waiting for game to initialize...');
    await delay(3000);
    
    // Show all network responses
    console.log('\n2. Network responses:');
    const errorResponses = responses.filter(r => r.status >= 400);
    if (errorResponses.length > 0) {
      errorResponses.forEach(r => {
        console.log(`   ${r.status}: ${r.url}`);
      });
    } else {
      console.log('   No error responses (all < 400)');
    }
    
    // Show network failures
    console.log('\n3. Network failures:');
    if (networkErrors.length > 0) {
      networkErrors.forEach(n => {
        console.log(`   ${n.url} - ${n.error}`);
      });
    } else {
      console.log('   None');
    }
    
    // Print console errors
    console.log('\n4. Console errors:');
    consoleMessages.filter(m => m.type === 'error').forEach(msg => {
      console.log(`   ${msg.text}`);
    });
    
    // Print JavaScript errors
    console.log('\n5. JavaScript errors:');
    if (errors.length > 0) {
      errors.forEach(err => console.log(`   ${err}`));
    } else {
      console.log('   None');
    }
    
    // Check if Phaser game loaded
    const gameExists = await page.evaluate(() => {
      return !!document.querySelector('canvas');
    });
    console.log('\n6. Game canvas exists:', gameExists);
    
    // Get window.game
    const gameInfo = await page.evaluate(() => {
      return {
        hasGame: typeof window !== 'undefined' && typeof window.game !== 'undefined',
        gameType: typeof window.game,
        hasPhaser: typeof window.Phaser !== 'undefined'
      };
    });
    console.log('   Window game:', gameInfo);
    
  } catch (error) {
    console.error('Test error:', error.message);
    console.error(error.stack);
  }
  
  await browser.close();
  console.log('\n=== AUDIT COMPLETE ===');
})();