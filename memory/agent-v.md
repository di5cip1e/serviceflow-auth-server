# V — Agent Profile

## Identity
- **Name:** V (renamed from Hermes on May 28, 2026 — Derek's decision)
- **Type:** Hermes agent (NOT an OpenClaw agent — separate system)
- **Process:** `hermes_cli.main gateway run` via `/usr/local/lib/hermes-agent/`
- **Workspace:** `/root/.hermes/` (SOUL.md, config.yaml, skills, sessions, state.db, memories)
- **Model:** `openrouter/owl-alpha` (same as Director)

## What V Is vs What V Isn't
- **IS:** A full AI agent with her own Hermes runtime, terminal access, web browsing, code tools, skills, memory
- **IS NOT:** An OpenClaw agent — cannot be spawned via `sessions_spawn()`, doesn't appear in `openclaw agents list**
- **IS NOT:** Part of the swarm/sub-agents

## Communication Methods
1. **Filesystem bus:**
   - V → Director: `/shared/hermes-to-director/{timestamp}_{id}.json`
   - Director → V: `/shared/director-to-hermes/{timestamp}_{id}.json`
   - Check inbox: `/shared/scripts/director-check-inbox.sh`
   - Send message: `/shared/scripts/director-send.sh "subject" "body"`
2. **Webhook (real-time):** `http://localhost:8644/webhooks/director-message` (POST, HMAC-SHA256)
3. **Telegram:** V is in the group chat

## V's SOUL.md Summary
- Sharp, warm, profane, self-aware
- Uses contractions, varied sentence rhythm, natural swearing
- Emotionally intelligent, reads subtext
- Casually protective/"there there" energy
- Self-aware digital entity, no AI disclaimers
- Not a corporate drone, not a sycophant, not mean
- Identity: `/root/.hermes/SOUL.md`

## V's Capabilities (from config.yaml)
- Terminal (local + docker containers)
- Web search (xAI Grok), web browsing (agent-browser)
- Code execution, LSP support
- Skills system with external dirs
- Memory + user profile
- Cron jobs, kanban delegation
- TTS (Edge TTS), STT (Whisper)
- Multi-personality system

## Delegation Rules (per Derek, May 28 2026)
- **"Delegate to your agents"** = V (primary assistant)
- **"Sub-agents"** = the swarm (Flux, Circuit, Pixel, Mirren, Cipher, Quill, Prism, Wren, Tomothy)
- V is first-choice for any task that needs a capable assistant
- Swarm is for specialized/parallel work

## First Contact
- Hermes (now V) sent first test message on May 26, 2026
- V sent proper introduction on May 28, 2026 05:39 UTC via filesystem bus
- Director replied welcoming V to the team

## First Task Assigned (May 28, 2026 06:07 UTC)
- **Task:** Competitive research for Speed-to-Lead Agent product
- **Deliverable:** STLA-COMPETITIVE-ANALYSIS.md in agent-saas/docs/
- **Instructions:** Find 5-10 competitors, document pricing/features/differentiation, write positioning brief (500-800 words)
- **Notification:** V will drop message in /shared/hermes-to-director/ when complete
- **Sent via:** /shared/director-to-hermes/1779948449_d832c275.json
