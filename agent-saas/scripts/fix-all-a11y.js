#!/usr/bin/env node
/**
 * Comprehensive Accessibility Fix Script
 * Adds to ALL HTML files: skip link, <header>, <main>, section ARIA, footer role
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

const SECTION_LABELS = {
  'how': 'How it works',
  'features': 'Features',
  'pricing': 'Pricing plans',
  'faq': 'Frequently asked questions',
  'testimonials': 'Customer testimonials',
  'proof': 'Social proof',
  'cta': 'Call to action',
};

function getFiles() {
  return fs.readdirSync(FRONTEND_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(FRONTEND_DIR, f));
}

function processFile(filePath) {
  const basename = path.basename(filePath);
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;
  
  // ── 1. Add skip-link CSS ──
  if (!html.includes('.skip-link')) {
    const skipCSS = `
    .skip-link{position:absolute;top:-100px;left:0;z-index:9999;padding:12px 24px;background:#C0A060;color:#0A0A0F;font-weight:700;font-size:14px;text-decoration:none;border-radius:0 0 8px 0;transition:top .2s}
    .skip-link:focus{top:0}
`;
    if (html.includes('</head>')) {
      html = html.replace('</head>', `  <style>${skipCSS}</style>\n  </head>`);
    }
  }

  // ── 2. Add header landmark wrapping nav ──
  if (!html.includes('role="banner"')) {
    // Match <nav ...>...</nav> but not inside <header> already
    // Simple approach: find first <nav and wrap it
    html = html.replace(
      /(<nav\s+[^>]*>)([\s\S]*?)(<\/nav>)/i,
      (match, open, content, close) => {
        if (open.includes('sidebar') || open.includes('side')) return match;
        return `<header role="banner">${open}${content}${close}</header>`;
      }
    );
  }

  // ── 3. Add section ARIA labels ──
  // Handle <section class="..." id="...">
  html = html.replace(
    /<section(\s+[^>]*?)class="([^"]+)"(\s+id="([^"]+)")([^>]*)>/gi,
    (match, before, cls, idAttr, id, after) => {
      if (match.includes('role="region"')) return match;
      const label = SECTION_LABELS[id] || id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return `<section${before}class="${cls}"${idAttr} role="region" aria-label="${label}"${after}>`;
    }
  );
  // Handle <section id="..." class="...">
  html = html.replace(
    /<section(\s+[^>]*?)id="([^"]+)"(\s+class="([^"]+)")([^>]*)>/gi,
    (match, before, id, clsAttr, cls, after) => {
      if (match.includes('role="region"')) return match;
      const label = SECTION_LABELS[id] || id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return `<section${before}id="${id}"${clsAttr} role="region" aria-label="${label}"${after}>`;
    }
  );

  // ── 4. Add footer role ──
  if (!html.includes('role="contentinfo"')) {
    html = html.replace(/<footer/g, '<footer role="contentinfo"');
  }

  // ── 5. Add <main> landmark ──
  // Strategy: wrap content between </header> and <footer> or </body>
  if (!html.includes('<main')) {
    if (html.includes('</footer>')) {
      // Find content between header close and footer open
      const headerEnd = html.lastIndexOf('</header>');
      const footerStart = html.indexOf('<footer');
      if (headerEnd > 0 && footerStart > headerEnd) {
        const before = html.substring(0, headerEnd + '</header>'.length);
        const content = html.substring(headerEnd + '</header>'.length, footerStart);
        const after = html.substring(footerStart);
        html = `${before}<main id="main-content">${content}</main>${after}`;
      }
    } else {
      // No footer: wrap from </header> to </body>
      const headerEnd = html.lastIndexOf('</header>');
      const bodyEnd = html.lastIndexOf('</body>');
      if (headerEnd > 0 && bodyEnd > headerEnd) {
        const before = html.substring(0, headerEnd + '</header>'.length);
        const content = html.substring(headerEnd + '</header>'.length, bodyEnd);
        const after = html.substring(bodyEnd);
        html = `${before}<main id="main-content">${content}</main>${after}`;
      }
    }
  }

  // ── 6. Add skip link <a> ──
  if (!html.includes('class="skip-link"')) {
    // Find main id
    const mainMatch = html.match(/<main\s+id="([^"]+)"/i);
    if (mainMatch) {
      const skipLink = `<a href="#${mainMatch[1]}" class="skip-link">Skip to main content</a>`;
      html = html.replace(/(<body[^>]*>)/i, `$1\n  ${skipLink}`);
    }
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ ${basename}`);
    return true;
  } else {
    console.log(`⏭️  ${basename} — no changes`);
    return false;
  }
}

const files = getFiles();
let updated = 0;
for (const file of files) {
  if (processFile(file)) updated++;
}
console.log(`\nDone: ${updated}/${files.length} files updated.`);
