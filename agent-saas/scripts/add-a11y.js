#!/usr/bin/env node
/**
 * Accessibility Enhancement Script
 * Adds to all HTML files:
 * 1. Skip-to-content link
 * 2. <header> landmark wrapping <nav>
 * 3. <main> landmark wrapping main content
 * 4. role="region" + aria-label on <section> elements
 * 5. role="contentinfo" on <footer>
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// Files to skip (minimal pages that don't need full treatment)
const SKIP_FILES = new Set([]);

// Section ID → human-readable label mapping (common across pages)
const SECTION_LABELS = {
  'how': 'How it works',
  'features': 'Features',
  'pricing': 'Pricing plans',
  'faq': 'Frequently asked questions',
  'testimonials': 'Customer testimonials',
  'proof': 'Social proof',
  'cta': 'Call to action',
  'hero': 'Hero section',
};

function getFiles() {
  return fs.readdirSync(FRONTEND_DIR)
    .filter(f => f.endsWith('.html') && !SKIP_FILES.has(f))
    .map(f => path.join(FRONTEND_DIR, f));
}

function addSkipLink(html) {
  // Add skip link right after <body>
  if (html.includes('skip-to-content') || html.includes('skip-link')) return html;
  
  // Find the first significant content after body
  const bodyMatch = html.match(/<body([^>]*)>/i);
  if (!bodyMatch) return html;
  
  const skipLink = `\n  <a href="#main-content" class="skip-link">Skip to main content</a>`;
  return html.replace(/(<body[^>]*>)/i, `$1${skipLink}`);
}

function addHeaderLandmark(html) {
  // Wrap <nav> in <header role="banner"> if not already wrapped
  if (html.includes('role="banner"')) return html;
  
  // Find <nav ...>...</nav> and wrap it
  // Handle nav with aria-label
  html = html.replace(
    /<nav\s+([^>]*)>([\s\S]*?)<\/nav>/i,
    (match, attrs, content) => {
      // Only wrap top-level navs (not sidebar navs)
      if (attrs.includes('sidebar') || attrs.includes('side-nav')) return match;
      return `<header role="banner"><nav ${attrs}>${content}</nav></header>`;
    }
  );
  
  return html;
}

function addMainLandmark(html) {
  // Wrap the main content area in <main id="main-content">
  if (html.includes('<main')) return html;
  
  // Strategy: find the first <section> or main content div and wrap from there to <footer>
  // For pages with <footer>, wrap everything between nav/header and footer
  if (html.includes('<footer')) {
    // Find the content between header/nav and footer
    html = html.replace(
      /(<\/header>|<\/nav>)([\s\S]*?)(<footer)/i,
      (match, before, content, footerTag) => {
        // Don't wrap if content already has <main>
        if (content.includes('<main')) return match;
        return `${before}<main id="main-content">${content}</main>${footerTag}`;
      }
    );
  } else {
    // Pages without footer: wrap from first section to end of body
    html = html.replace(
      /(<body[^>]*>[\s\S]*?)(<section|<div class="auth-page|<div class="page)/i,
      (match, before, contentStart) => {
        if (match.includes('<main')) return match;
        // Find the last closing </div> before </body>
        return `${before}<main id="main-content">${contentStart}`;
      }
    );
    // Close main before </body>
    if (html.includes('<main') && !html.includes('</main>')) {
      html = html.replace(/([\s\S]*)(<\/body>)/i, (match, content, bodyEnd) => {
        return `${content}</main>\n${bodyEnd}`;
      });
    }
  }
  
  return html;
}

function addSectionAriaLabels(html) {
  // Add role="region" and aria-label to <section> elements that have an id
  html = html.replace(
    /<section\s+([^>]*?)class="([^"]*)"\s+id="([^"]*)"([^>]*)>/gi,
    (match, before, className, id, after) => {
      if (match.includes('role="region"')) return match;
      const label = SECTION_LABELS[id] || id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return `<section ${before}class="${className}" id="${id}" role="region" aria-label="${label}"${after}>`;
    }
  );
  
  // Also handle sections with id before class
  html = html.replace(
    /<section\s+([^>]*?)id="([^"]*)"\s+class="([^"]*)"([^>]*)>/gi,
    (match, before, id, className, after) => {
      if (match.includes('role="region"')) return match;
      const label = SECTION_LABELS[id] || id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return `<section ${before}id="${id}" class="${className}" role="region" aria-label="${label}"${after}>`;
    }
  );
  
  return html;
}

function addFooterRole(html) {
  if (html.includes('role="contentinfo"')) return html;
  html = html.replace(/<footer/g, '<footer role="contentinfo"');
  return html;
}

function addSkipLinkStyles(html) {
  // Add skip-link CSS if not present
  if (html.includes('.skip-link')) return html;
  
  const skipStyles = `
    .skip-link {
      position: absolute; top: -100px; left: 0; z-index: 9999;
      padding: 12px 24px; background: #C0A060; color: #0A0A0F;
      font-weight: 700; font-size: 14px; text-decoration: none;
      border-radius: 0 0 8px 0; transition: top 0.2s;
    }
    .skip-link:focus { top: 0; }
`;
  
  // Insert before </head> or inside existing <style>
  if (html.includes('</head>')) {
    html = html.replace('</head>', `  <style>${skipStyles}</style>\n  </head>`);
  } else if (html.includes('<style>')) {
    html = html.replace('<style>', `<style>${skipStyles}`);
  }
  
  return html;
}

function processFile(filePath) {
  const basename = path.basename(filePath);
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;
  
  // 1. Add skip link styles
  html = addSkipLinkStyles(html);
  
  // 2. Add skip link
  html = addSkipLink(html);
  
  // 3. Add header landmark
  html = addHeaderLandmark(html);
  
  // 4. Add main landmark
  html = addMainLandmark(html);
  
  // 5. Add section ARIA labels
  html = addSectionAriaLabels(html);
  
  // 6. Add footer role
  html = addFooterRole(html);
  
  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ ${basename} — updated`);
    return true;
  } else {
    console.log(`⏭️  ${basename} — no changes needed`);
    return false;
  }
}

// Run
const files = getFiles();
let updated = 0;
for (const file of files) {
  if (processFile(file)) updated++;
}
console.log(`\nDone: ${updated}/${files.length} files updated.`);
