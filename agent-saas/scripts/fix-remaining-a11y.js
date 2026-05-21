#!/usr/bin/env node
/**
 * Fix remaining a11y issues for files that already have some landmarks.
 * - Add id="main-content" to existing <main> tags
 * - Add skip links to all pages
 * - Ensure section ARIA on all pages
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

function fixFile(filePath) {
  const basename = path.basename(filePath);
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;
  let changes = [];

  // ── 1. Add skip-link CSS if missing ──
  if (!html.includes('.skip-link')) {
    const skipCSS = `.skip-link{position:absolute;top:-100px;left:0;z-index:9999;padding:12px 24px;background:#C0A060;color:#0A0A0F;font-weight:700;font-size:14px;text-decoration:none;border-radius:0 0 8px 0;transition:top .2s}.skip-link:focus{top:0}`;
    if (html.includes('<style>')) {
      html = html.replace('<style>', `<style>${skipCSS}`);
    } else if (html.includes('</head>')) {
      html = html.replace('</head>', `<style>${skipCSS}</style>\n</head>`);
    }
    changes.push('skip-css');
  }

  // ── 2. Ensure <main> has an id ──
  if (html.match(/<main(?!\s+id=)/i)) {
    html = html.replace(/<main(\s+class="[^"]*")/i, '<main id="main-content"$1');
    html = html.replace(/<main>/i, '<main id="main-content">');
    changes.push('main-id');
  }

  // ── 3. Add section ARIA labels ──
  let sectionFixed = false;
  html = html.replace(
    /<section(\s[^>]*?)class="([^"]+)"(\s+id="([^"]+)")([^>]*)>/gi,
    (match, before, cls, idAttr, id, after) => {
      if (match.includes('role="region"')) return match;
      const label = SECTION_LABELS[id] || id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      sectionFixed = true;
      return `<section${before}class="${cls}"${idAttr} role="region" aria-label="${label}"${after}>`;
    }
  );
  html = html.replace(
    /<section(\s[^>]*?)id="([^"]+)"(\s+class="([^"]+)")([^>]*)>/gi,
    (match, before, id, clsAttr, cls, after) => {
      if (match.includes('role="region"')) return match;
      const label = SECTION_LABELS[id] || id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      sectionFixed = true;
      return `<section${before}id="${id}"${clsAttr} role="region" aria-label="${label}"${after}>`;
    }
  );
  if (sectionFixed) changes.push('section-aria');

  // ── 4. Add footer role ──
  if (!html.includes('role="contentinfo"')) {
    html = html.replace(/<footer/g, '<footer role="contentinfo"');
    changes.push('footer-role');
  }

  // ── 5. Add header role if nav exists but not wrapped ──
  if (!html.includes('role="banner"') && html.includes('<nav')) {
    html = html.replace(
      /(<nav\s+[^>]*>)([\s\S]*?)(<\/nav>)/i,
      (match, open, content, close) => {
        if (open.includes('sidebar') || open.includes('side')) return match;
        return `<header role="banner">${open}${content}${close}</header>`;
      }
    );
    changes.push('header-role');
  }

  // ── 6. Add skip link ──
  if (!html.includes('class="skip-link"')) {
    const mainMatch = html.match(/<main\s+id="([^"]+)"/i);
    if (mainMatch) {
      const skipLink = `<a href="#${mainMatch[1]}" class="skip-link">Skip to main content</a>`;
      html = html.replace(/(<body[^>]*>)/i, `$1\n  ${skipLink}`);
      changes.push('skip-link');
    }
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ ${basename} — ${changes.join(', ')}`);
    return true;
  } else {
    console.log(`⏭️  ${basename} — OK`);
    return false;
  }
}

const files = getFiles();
let updated = 0;
for (const file of files) {
  if (fixFile(file)) updated++;
}
console.log(`\nDone: ${updated}/${files.length} files updated.`);
