# Daily Lessons — From May 18, 2026

## Top Lessons Learned

### 1. Express Static Middleware Order Matters for Auth
**Category:** Security / Architecture  
**Lesson:** `express.static` serves files directly from disk, bypassing route handlers. If mounted before session middleware, protected HTML files are accessible to anyone. Always place session/auth middleware before static serving, or use explicit route handlers for protected files with auth middleware applied *before* the static middleware.

### 2. Build Flow Form Submission via Button Click Can Fail Silently
**Category:** UX / Frontend Bug  
**Lesson:** A `<button type="submit">` inside a `<form>` may not trigger form submission if the click handler calls `e.preventDefault()` without properly handling the submit. Test form submission end-to-end, not just button click handlers. Using `form.dispatchEvent(new Event('submit'))` can bypass broken click handlers.

### 3. CSS External Dependencies Can Break Entire Pages
**Category:** Frontend Resilience  
**Lesson:** When critical CSS variables (like colors) come from an external stylesheet that fails to load, inline styles using those variables all break simultaneously. For critical visual elements, use inline styles with hardcoded values as a fallback, or ensure the CSS file path is always correct.

### 4. Subagent File Operations Are Unreliable on owl-alpha
**Category:** Agent Operations  
**Lesson:** The owl-alpha model consistently fails on file read/write tasks. Use subagents only for research and analysis. Handle all file editing directly in the main session.

### 5. SEO Requires More Than Just Content
**Category:** Marketing / SEO  
**Lesson:** A technically functional site can still have zero SEO presence. Open Graph tags, Twitter Cards, JSON-LD structured data, canonical URLs, and robots meta are essential for discoverability. These should be part of the initial page template, not added later.

### 6. Accessibility Is More Than Color Contrast
**Category:** Accessibility  
**Lesson:** Good color contrast and ARIA labels are necessary but not sufficient. Landmark elements (`<main>`, `<header>`, `<nav>`, `<footer>`), skip links, and proper heading hierarchy are essential for screen reader users. Use semantic HTML5 elements instead of generic `<div>` wrappers.

### 7. DNS Issues Can Mimic Server Downtime
Category:** Infrastructure  
**Lesson:** When a domain shows a "parked" page but the server is healthy, check the DNS A record. Hostinger (and other providers) have parking IPs that intercept traffic before it reaches your server. Always verify DNS resolution with `dig` or `nslookup` before debugging server issues.

### 8. Logo Brand Consistency Requires Explicit Rules
**Category:** Design  
**Lesson:** Logo color patterns (e.g., "M" white, ".ai" amber, ".K.R" white) need to be documented and applied consistently across nav, footer, and any other occurrences. Without explicit rules, different pages may render the logo differently.
