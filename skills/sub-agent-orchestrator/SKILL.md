---
name: sub-agent-orchestrator
description: Use when coordinating multiple sub-agents for parallel development. Defines best practices for spawning, managing, and getting results from sub-agents. Triggers on phrases like "use the team", "spawn sub-agents", "parallel development", "delegate to agents".
---

# Sub-Agent Orchestrator Skill

Best practices for effectively using sub-agents in OpenClaw.

## Why Sub-Agents Fail

Common failure modes:
1. **Task too large** - Agent times out before completing
2. **No checkpoints** - Partial work lost on failure
3. **Unclear output** - Results not delivered properly
4. **Network instability** - File writes fail mid-task

## Optimal Task Design

### Rule: One Task Per Agent, 60-120 Seconds Max

Break large tasks into smaller, focused pieces:
- ✅ "Create 3 UI components (Button, Input, Card)" 
- ❌ "Build the entire app"

### Rule: Clear Success Criteria

Tell the agent exactly what to deliver:
```
Create these files:
1. lib/supabase.ts - Supabase client with environment variables
2. types/index.ts - TypeScript interfaces for Profile, Customer, Job
Report the exact files created.
```

### Rule: Report-Based Progress

Ask agents to report what they created:
```
Report in this format:
- Created: [filename] - [what it contains]
- Status: [success/failed]
```

## Spawning Best Practices

### Timeout Guidelines (MANDATORY)

| Task Type | Default Timeout | When to Increase |
|-----------|-----------------|------------------|
| File write / code generation | **300 seconds (5 min)** | Add 120s for complex modules |
| API/debugging | 300 seconds | Add 120s for multi-file changes |
| Research/analysis | 180 seconds | Add 120s for large codebases |
| Simple queries | 60 seconds | N/A |

**DEFAULT = 300 seconds for any code/file work.** Only use less than 60s for trivial queries.

### Spawn Command Structure

```typescript
sessions_spawn({
  task: `Specific, bounded task. 
  Deliverable: [exact file or output]
  Success: [what success looks like]`,
  label: "agent-name-task",
  timeoutSeconds: 300,  // DEFAULT - always set this
  runtime: "subagent"
})
```

### Parallel Execution

Spawn agents in sequence, not parallel if they might conflict:
```
1. Spawn Circuit (DB schema) → wait for done
2. Spawn Flux (lib/api) → wait for done  
3. Spawn Pixel (UI) → wait for done
```

Or spawn with unique working directories to avoid conflicts.

## Recovery Patterns

### If Agent Times Out

1. Check what was created: `find /project -type f -newer /checkpoint`
2. Analyze partial output from sessions_history
3. Complete manually or respawn with smaller task

### If Agent Reports Network Error

1. Verify the file was partially written
2. Complete the write manually
3. Adjust task to be smaller

## Skill for Team Members

When assigning tasks to specific agents:

**Flux (Lead Engineer)**: Core logic, API, data
- Keep tasks to 60 seconds max
- Focus on one module at a time

**Pixel (UI/UX)**: Screens, components, navigation
- One screen or 2-3 components per task
- Use existing design tokens

**Circuit (Systems Architect)**: DB, config, architecture
- Single file or schema per task
- Output SQL or config directly

**Quill (QA)**: Testing, verification
- Run after features are built
- Keep test scope small

## Anti-Patterns to Avoid

❌ Don't spawn 5 agents simultaneously on same project
❌ Don't give 5-minute tasks (they'll timeout)
❌ Don't skip reporting requirement
❌ Don't assume partial writes succeeded

## Output Format

When completing a sub-agent task, report immediately:

```
✅ Completed: [what]
Files: [list of files created]
Status: [success/partial/failed]
```

Then the session auto-terminates.

