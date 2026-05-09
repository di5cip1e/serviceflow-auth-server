import { AgentGenerator } from './services/agent-generator.ts';
import fs from 'fs';
import path from 'path';

async function testGenerator() {
  const generator = new AgentGenerator('/tmp/test-agents');
  
  const testConfig = {
    slug: 'coffee-shop-daily',
    businessName: 'The Daily Grind',
    industry: 'Hospitality/Coffee',
    tone: 'Cheerful and Energetic',
    useCases: ['Customer Support', 'Menu Information', 'Order Research'],
    businessDetails: 'A boutique coffee shop focusing on ethically sourced beans and community vibes.',
    plan: 'pro',
    apiKey: 'makr_test_123456789'
  };

  console.log('🚀 Starting test generation for:', testConfig.slug);
  
  try {
    const outputPath = await generator.generate(testConfig);
    console.log('✅ Generation complete at:', outputPath);

    // Verify files
    const files = [
      'SOUL.md',
      'AGENTS.md',
      'USER.md',
      'memory/blank-memory.md',
      '.env'
    ];

    files.forEach(file => {
      const fullPath = path.join(outputPath, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log(`  📄 ${file}: EXISTS (${stats.size} bytes)`);
        if (stats.size === 0) {
          console.error(`  ❌ ERROR: ${file} is empty!`);
        }
      } else {
        console.error(`  ❌ ERROR: ${file} is missing!`);
      }
    });

    // Clean up
    console.log('🧹 Cleaning up test directory...');
    // fs.rmSync('/tmp/test-agents', { recursive: true, force: true });
    // console.log('✨ Cleanup done.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGenerator();
