# Task Decomposer Skill

## Purpose
Break large projects into context-window-sized sub-tasks that can be executed independently across sessions, using memory files for continuity.

## When to Use
- Any task that involves 3+ files or complex multi-step work
- When approaching context window limits
- Projects that span multiple sessions

## Workflow

### 1. Design → TASKS.md
Create a `TASKS.md` in the project directory with:
```markdown
# [Project] — Task Breakdown

## Project Goal
[One sentence]

## Completed
- [x] Task 0: [description] — [date]

## Up Next
- [ ] Task 1: [description]
  - Files: [list]
  - Expected output: [what success looks like]
  - Depends on: [none / Task X]
  - CLI commands needed: [any new installs]

- [ ] Task 2: [description]
  ...

## Dependencies Graph
Task 0 → Task 1 → Task 2
                 → Task 3 (parallel)
```

### 2. Design → Subagent Spec
For each task, create a precise subagent prompt:
```
You are [role]. Task: [specific goal].

Context:
- Project: [path]
- Prerequisite files: [what was already changed]
- Depends on: [completed tasks if any]

Steps:
1. [exact step]
2. [exact step]

Success Criteria:
- [verifiable outcome]
- [test command if applicable]

Memory:
- After completion, update TASKS.md marking this task complete
- Save any learnings to ~/self-improving/ERRORS.md if issues arose
- Log one line to today's memory file: memory/YYYY-MM-DD.md
```

### 3. Execution
Run each task as `sessions_spawn` with `runtime="subagent"`, `mode="run"`, `timeoutSeconds=300`.

### 4. Continuity Between Sessions
At start of each new session working on this project:
1. Read `TASKS.md` first
2. Read today's and yesterday's `memory/YYYY-MM-DD.md`
3. Read `~/self-improving/memory.md`
4. Pick up at next incomplete task

## File Conventions
```
project-root/
├── TASKS.md              # Master task tracker
├── DESIGN.md             # Architecture decisions
└── memory/
    └── YYYY-MM-DD.md     # Daily notes for this project
```

## Rules
- One task = one subagent (or one focused main session turn)
- Each task should completable in under 30k tokens
- Always read TASKS.md before starting work
- Update TASKS.md immediately after task completion
- If a task fails, log the error and move on — don't retry in the same turn
- Use `memory/YYYY-MM-DD.md` for volatile notes, `MEMORY.md` for curated learnings
