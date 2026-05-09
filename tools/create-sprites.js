const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const SPRITES_DIR = '/root/.openclaw/workspace/projects/trap/assets/sprites/suppliers';

// Helper to load and mirror an image horizontally
async function mirrorImage(inputPath, outputPath) {
    const img = await loadImage(inputPath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    // Scale and translate to flip horizontally
    ctx.scale(-1, 1);
    ctx.drawImage(img, -img.width, 0);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Created: ${outputPath}`);
}

// Helper to create a simple colored portrait with different expression
async function createPortrait(baseImagePath, outputPath, type) {
    const img = await loadImage(baseImagePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    // Draw base image first
    ctx.drawImage(img, 0, 0);
    
    // Now apply color tint based on expression type
    // Get image data and modify colors
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        if (a > 50) { // Only modify non-transparent pixels
            if (type === 'angry') {
                // Add red tint, darken
                data[i] = Math.min(255, r * 1.1);     // More red
                data[i + 1] = Math.max(0, g * 0.7);   // Less green
                data[i + 2] = Math.max(0, b * 0.7);   // Less blue
            } else if (type === 'neutral') {
                // Desaturate slightly, add slight blue
                const avg = (r + g + b) / 3;
                data[i] = Math.min(255, r * 0.7 + avg * 0.3);
                data[i + 1] = Math.min(255, g * 0.7 + avg * 0.3);
                data[i + 2] = Math.min(255, b * 0.7 + avg * 0.3 + 20); // Slight blue
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Created: ${outputPath}`);
}

// For walk_up, we'll mirror walk_down or create a simple vertical flip
async function createWalkUp(inputPath, outputPath) {
    const img = await loadImage(inputPath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    // Flip vertically
    ctx.scale(1, -1);
    ctx.drawImage(img, 0, -img.height);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Created: ${outputPath}`);
}

async function main() {
    console.log('Creating missing sprites...\n');
    
    // Priority 1: Complete Supplier Animations
    
    // 1. Fang: walk_right (mirror walk_left)
    const fangWalkLeft = path.join(SPRITES_DIR, 'Fang', 'walk_left', 'walk_left.png');
    const fangWalkRight = path.join(SPRITES_DIR, 'Fang', 'walk_right', 'walk_right.png');
    await mirrorImage(fangWalkLeft, fangWalkRight);
    
    // 2. TheDon: walk_up (mirror walk_left since that's the only one with sprite.png)
    const theDonWalkLeft = path.join(SPRITES_DIR, 'TheDon', 'walk_left', 'sprite.png');
    const theDonWalkUp = path.join(SPRITES_DIR, 'TheDon', 'walk_up', 'walk_up.png');
    await createWalkUp(theDonWalkLeft, theDonWalkUp);
    
    // 3. Razor: portrait_angry (tint portrait_happy red)
    const razorHappy = path.join(SPRITES_DIR, 'Razor', 'portrait', 'portrait_happy.png');
    const razorAngry = path.join(SPRITES_DIR, 'Razor', 'portrait', 'portrait_angry.png');
    await createPortrait(razorHappy, razorAngry, 'angry');
    
    // 4. Razor: portrait_neutral (desaturate portrait_suspicious)
    const razorSuspicious = path.join(SPRITES_DIR, 'Razor', 'portrait', 'portrait_suspicious.png');
    const razorNeutral = path.join(SPRITES_DIR, 'Razor', 'portrait', 'portrait_neutral.png');
    await createPortrait(razorSuspicious, razorNeutral, 'neutral');
    
    console.log('\n✓ All sprites created successfully!');
}

main().catch(console.error);