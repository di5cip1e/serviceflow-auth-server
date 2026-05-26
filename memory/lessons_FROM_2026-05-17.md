# Lessons from May 17, 2026 (continued through May 25)

## 6. API Route Mounting Confusion (May 22)
**Problem:** When `agentRoutes` was remounted from `/api` to `/api/agents`, all existing endpoint paths shifted (`/api/config` → `/api/agents/config`), breaking every frontend call. Took several round-trips to realize the cascading path changes.
**Lesson:** When mounting Express routers, never change the base path of an existing router without auditing EVERY route in it. Either keep the mount point consistent or create a NEW router for new endpoints. The cleanest fix was reverting to `/api` mount and adding new endpoints there directly.

## 7. localStorage-Based Build Flow Fragility (May 22)
**Problem:** The 4-step agent builder stored all form data in localStorage, which gets cleared when users clear browser data, switch devices, or open in incognito. Server-side persistence is needed.
**Lesson:** Multi-step flows that span auth boundaries (user must register mid-flow) MUST persist state server-side (session + database). localStorage is fine for UX convenience but cannot be the sole storage for critical flow state. Use a `maikr_redirect_after_register` flag in localStorage as a bridge, but save the actual data to the server.

## 8. Subagent Strategy Confirmed (May 22-24)
**Observation:** Complex multi-file refactors (build-step4.html complete rewrite, auth flow fixes, command-center overhaul) all succeeded when done directly in the main session. Subagents continue to struggle with sequential file edits.
**Reinforced Lesson:** Keep doing complex frontend/backend integration work in main session. Reserve subagents for research, audits, and parallel analysis — not for coordinated multi-file changes.

## 9. Build Flow End-to-End Testing Required (May 22-23)
**Problem:** Individual endpoints tested fine in isolation, but the full create-account → build-agent → deploy flow had gaps when tested end-to-end (e.g., redirect after registration didn't preserve the build state, success page pointed to wrong URL).
**Lesson:** After fixing individual bugs, ALWAYS run the complete user journey end-to-end before declaring "fixed." Test: anonymous build → register mid-flow → return → finish → deploy → dashboard. Check every redirect.

## 10. Self-Correction Loop Detection (May 21)
**Derek's Insight:** Platforms should detect when an agent is stuck in a logic loop or repeatedly hallucinating, auto-intervene, reset context, or flag for human review.
**Lesson for my own work:** When I find myself making the same type of edit repeatedly or going in circles, STOP. I'm likely stuck in a loop. Take a step back, re-read the problem, try a different approach, or ask Derek before pushing further.

## 11. Agent-as-a-Service vs Chatbot Wrapper (May 24)
**Derek's Insight:** maikr.pro users aren't getting actual OpenClaw agents — they're getting GPT chatbots behind a fancy dashboard. The real value is provisioning actual agent identities with their own memory, skills, and agency.
**Lesson:** For AI platforms, the "agent" must have persistent memory and autonomous capabilities to justify pricing. A chatbot wrapper is not an AgentSaaS product. This is the core product thesis going forward.

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
