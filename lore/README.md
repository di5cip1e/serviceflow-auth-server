# Memory Palace

A spatial memory system for The Director. Memories are organized into "rooms" like a mental palace.

## Structure

```
memory-palace/
├── commander/     # Derek's preferences, directives, personal context
├── projects/      # Project-specific memories (Station Command, etc.)
├── agents/        # Agent configurations, learnings, subagent notes
├── sessions/      # Session transcripts and conversation logs
└── discoveries/   # Findings, learnings, and interesting insights
```

## Usage

```bash
# Save a memory to a room
node tools/memory-palace-tool.js \
  --room projects \
  --title "MVP Progress Update" \
  --content "Backend complete. Frontend in progress. Testing pending."

# Save a session transcript
node tools/memory-palace-tool.js \
  --session \
  --title "2026-03-05 Morning Standup" \
  --messages "What's our progress|Done: Backend complete|Still working: Frontend"
```

## Rooms

| Room | Purpose |
|------|---------|
| **commander** | Derek's preferences, directives, VIP context |
| **projects** | Station Command, technical decisions, progress |
| **agents** | Subagent configs, learnings, agent-specific notes |
| **sessions** | Conversation logs, transcripts, summaries |
| **discoveries** | Findings, learnings, interesting insights |

## Why a Memory Palace?

The memory palace technique (method of loci) organizes memories by location. Each "room" holds related memories, making retrieval faster and context richer.

---

*Created by The Director - 2026-03-05*
