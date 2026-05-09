# TOOLS.md - Local Notes

## API Keys & Credentials

### GitHub Token
- **Stored:** Git CLI configured with token for pushing to repos
- **Used by:** di5cip1e/ serviceflow-auth repo

## Sub-Agent Timeout (MUST REMEMBER)
- **DEFAULT timeoutSeconds: 300** for any code/file work
- Only use <60s for trivial queries
- Always set explicitly - don't rely on defaults
- Update: skill `sub-agent-orchestrator` enforces this

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

## API Keys

### OpenAI
- **Location:** `~/.openclaw/secrets.json`
- **Use for:** DALL-E image generation, GPT models

---

Add whatever helps you do your job. This is your cheat sheet.

---

## Proactive Tool Use

- Prefer safe internal work, drafts, checks, and preparation before escalating
- Use tools to keep work moving when the next step is clear and reversible
- Try multiple approaches and alternative tools before asking for help
- Use tools to test assumptions, verify mechanisms, and uncover blockers early
- For send, spend, delete, reschedule, or contact actions, stop and ask first
- If a tool result changes active work, update ~/proactivity/session-state.md
