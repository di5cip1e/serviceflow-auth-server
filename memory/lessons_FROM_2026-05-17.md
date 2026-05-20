# Lessons from May 17, 2026

## 1. Subagent File-Write Reliability
**Problem:** Spawned 3 subagents (owl-alpha model) to parallelize frontend redesign — all 3 failed within 1 second. The model has poor tool use for file read/write operations.
**Lesson:** For tasks involving multiple file edits, do the work directly in the main session. Subagents are better for research/analysis tasks, not bulk file operations.
**Time lost:** ~5 minutes waiting for subagents that produced no output.

## 2. CSS Custom Properties + External Stylesheets
**Problem:** Landing page used `var(--amber)` etc. in inline `<style>` block, which depends on `dark-premium.css` loading first. If the external CSS fails to load (wrong path, caching), ALL variables resolve to nothing and the page looks completely broken.
**Lesson:** When using CSS custom properties across external + inline styles, either:
- Define the variables in a `<style>` block BEFORE the external stylesheet reference
- Or include fallback values: `color: var(--amber, #C0A060)`
- Test with external CSS disabled to ensure graceful degradation

## 3. Bulk Color Replacement via sed
**Problem:** Used `sed` to replace `#2ECC71` → `#C0A060` across 20+ HTML files. This worked for simple cases but could miss variations (e.g., `rgb(46,204,113)`, `#2ecc71` lowercase, or colors defined in JS).
**Lesson:** For future theme changes, define colors as CSS custom properties in ONE place, then only change the variable definitions. Already done for the new `dark-premium.css` — future palette changes will only need `:root` updates.

## 4. Brand Color Extraction from Images
**Problem:** Could not use the `image` tool to analyze brand images (failed with "Failed to optimize image"). Worked around it with Python/Pillow to extract dominant colors.
**Lesson:** For image color analysis, use Python with PIL as a reliable fallback. Command:
```python
from PIL import Image
import collections
img = Image.open('file.png').convert('RGB').resize((150,150))
pixels = list(img.getdata())
rounded = [(r//32*32, g//32*32, b//32*32) for r,g,b in pixels]
counter = collections.Counter(rounded)
print(counter.most_common(8))
```

## 5. "Parked Domain" Reports Despite Healthy Backend
**Problem:** Derek reported maikr.pro showed a "parked domain" page, but backend was returning 200, DNS resolved correctly, HTTPS worked.
**Lesson:** This is likely a client-side issue (DNS cache, browser cache, ISP-level cache). Always verify from multiple angles before assuming backend is down:
- `curl -I https://site.com` from server
- `dig +short site.com` for DNS
- Check from a different network/device
