#!/usr/bin/env node
/**
 * Fix skip-to-content links in all HTML files.
 * Adds the <a> element if missing, and ensures href matches <main> id.
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

function getFiles() {
  return fs.readdirSync(FRONTEND_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(FRONTEND_DIR, f));
}

function fixFile(filePath) {
  const basename = path.basename(filePath);
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Find the <main> id
  const mainMatch = html.match(/<main\s+id="([^"]+)"/i);
  if (!mainMatch) {
    console.log(`⏭️  ${basename} — no <main> found, skipping`);
    return;
  }
  const mainId = mainMatch[1];
  
  // Check if skip link already exists and is correct
  const skipMatch = html.match(/<a[^>]*class="skip-link"[^>]*href="#([^"]+)"/i);
  if (skipMatch) {
    if (skipMatch[1] === mainId) {
      console.log(`✅ ${basename} — skip link already correct (#${mainId})`);
      return;
    } else {
      // Fix the href
      html = html.replace(
        /(<a[^>]*class="skip-link"[^>]*href=")#[^"]+"/i,
        `$1#${mainId}"`
      );
      console.log(`🔧 ${basename} — fixed skip link target #${skipMatch[1]} → #${mainId}`);
    }
  } else {
    // Insert skip link right after <body ...>
    const skipLink = `<a href="#${mainId}" class="skip-link">Skip to main content</a>`;
    html = html.replace(/(<body[^>]*>)/i, `$1\n  ${skipLink}`);
    console.log(`➕ ${basename} — added skip link → #${mainId}`);
  }
  
  fs.writeFileSync(filePath, html, 'utf8');
}

const files = getFiles();
for (const file of files) {
  fixFile(file);
}
console.log('\nDone.');
