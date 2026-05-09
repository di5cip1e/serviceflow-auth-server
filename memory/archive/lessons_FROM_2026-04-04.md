# Lessons Learned: April 4-5, 2026

## DAILY_LESSONS_REVIEW (April 5, 2026 - 19:34 UTC)

### Top Lessons (Last 24 Hours)

**1. ClawHub Platform Client-Side Rendering**
- Platform uses React SPA with client-side rendering
- web_fetch returns "Loading skills..." only - cannot scrape
- Workaround: Use `clawhub inspect <slug>` for individual skill stats

**2. First-Mover Advantage Lost on ClawHub**
- Derek was first publisher (March 27) with 5 skills
- By April 3-4: 9 other skills now on platform
- Still showing steady growth: 110/53/49/46/47 downloads

**3. Morning Meeting Rotation Works**
- 3-task rotation: CLAWHUB_SKILLS_SCAN → MONEY_MAKING_IDEAS → SOCIAL_SCAN
- Each heartbeat completes one task in rotation
- Results saved to memory/ files for 8am meeting discussion

**4. Social Trends - Key Insights**
- Multi-agent AI systems: 50% of enterprise apps will have AI agents by EOY 2026
- Audio-first revolution: Voice interaction for agents
- Insurance automation: Ping An automated 60% of claims in 51 seconds
- Gartner warning: 40%+ of agentic AI projects will fail by 2027

**5. Revenue Priorities**
- PixelForge: Closest to revenue ($9-15/mo), needs DATABASE_URL + OPENAI_API_KEY
- ClawHub publishing: Low effort, growing traction
- Kingdom Cards: Longer timeline, asset pack potential

**6. Web Scraping Limitations**
- Reddit blocked by Cloudflare - use web_search (Perplexity) instead
- HackerNews accessible via web_search

### Technical Lessons
- ClawHub stats API: Use `--json` flag for structured output
- Heartbeat state tracking: morningTaskIndex tracks rotation position

### Focus Areas for Next 24 Hours
- Continue monitoring ClawHub growth
- Await Derek action on PixelForge env vars
- No outreach until PixelForge website ready
