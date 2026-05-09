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
  
  // Collect network failures
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push(`${request.url()} - ${request.failure().errorText}`);
  });
  
  try {
    console.log('=== COMPREHENSIVE GAME AUDIT ===\n');
    console.log('1. Navigating to game...');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    console.log('   Page loaded. Waiting for game to initialize...');
    await delay(3000);
    
    // Check if Phaser game loaded
    const gameExists = await page.evaluate(() => {
      return !!document.querySelector('canvas');
    });
    console.log('   Game canvas exists:', gameExists);
    
    // Get canvas dimensions
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        return { width: canvas.width, height: canvas.height };
      }
      return null;
    });
    console.log('   Canvas info:', canvasInfo);
    
    // Wait more for game to initialize
    await delay(5000);
    
    // Check for scene
    const sceneInfo = await page.evaluate(() => {
      // Check if game is running
      const game = window.game;
      if (!game) return { error: 'No game found' };
      
      return {
        running: game.isRunning,
        scene: game.scene.scenes[0]?.constructor.name,
        scenes: game.scene.scenes.map(s => s.constructor.name)
      };
    });
    console.log('   Scene info:', JSON.stringify(sceneInfo, null, 2));
    
    // Wait more for character creation
    await delay(5000);
    
    // Get current scene state
    const characterCreationState = await page.evaluate(() => {
      const game = window.game;
      if (!game || !game.scene.scenes[0]) return { error: 'No scene found' };
      
      const scene = game.scene.scenes[0];
      return {
        name: scene.constructor.name,
        hasStartButton: !!scene.startButton,
        hasNameInput: !!scene.nameInput,
        hasGenderSelection: !!scene.genderSelection,
        visible: scene.visible
      };
    });
    console.log('   Character Creation State:', JSON.stringify(characterCreationState, null, 2));
    
    // Print console errors so far
    console.log('\n2. Checking for errors before gameplay...');
    console.log('   Console messages:');
    consoleMessages.forEach(msg => {
      if (msg.type === 'error' || msg.type === 'warning') {
        console.log(`   [${msg.type}] ${msg.text}`);
      }
    });
    
    console.log('\n   Errors:', errors.length > 0 ? errors.join(', ') : 'None');
    console.log('   Network errors:', networkErrors.length > 0 ? networkErrors.join(', ') : 'None');
    
    // Try to simulate clicking start
    console.log('\n3. Attempting to start game (click START button)...');
    await page.evaluate(() => {
      const game = window.game;
      if (game && game.scene.scenes[0] && game.scene.scenes[0].startButton) {
        console.log('   Found start button, clicking...');
        game.scene.scenes[0].startButton.emit('pointerdown');
      } else {
        console.log('   Could not find start button');
      }
    });
    
    await delay(5000);
    
    // Get scene after clicking
    const afterClickScene = await page.evaluate(() => {
      const game = window.game;
      if (!game) return { error: 'No game found' };
      return {
        scenes: game.scene.scenes.map(s => ({ name: s.constructor.name, visible: s.visible }))
      };
    });
    console.log('   Scenes after start click:', JSON.stringify(afterClickScene, null, 2));
    
    // Check console again
    console.log('\n4. Console messages after start:');
    consoleMessages.forEach(msg => {
      console.log(`   [${msg.type}] ${msg.text}`);
    });
    
    // Check for any new errors
    const newErrors = errors.filter(e => !e.includes('already'));
    console.log('\n   Errors detected:', newErrors.length > 0 ? newErrors.join(', ') : 'None');
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
  
  await browser.close();
  console.log('\n=== AUDIT COMPLETE ===');
})();