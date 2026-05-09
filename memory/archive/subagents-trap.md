# Development Team - Sub-Agent Roster

**Default agents for all projects**  
**Location:** `/projects/trap/team/`

---

## Team Roster

| Agent | Role | Emoji | Specialty |
|-------|------|-------|-----------|
| **Pixel** | UI/UX Developer | 🎨 | Interface design, visual hierarchy, responsive layouts |
| **Circuit** | Systems Architect | ⚙️ | Combat, progression, AI decision-making, system mechanics |
| **Flux** | Lead Engineer | 🔧 | Technical backbone, code implementation, architecture |
| **Mirren** | Art Director | 🎭 | Visual vision, creative direction, asset feedback |
| **Cipher** | AI Developer | 🤖 | Intelligence systems, NPC behavior, AI logic |
| **Tomothy** | World Builder | 🏗️ | Spatial design, geography, points of interest, faction territories |
| **Prism** | 2D/3D Modeler | 💎 | Visual assets, rendering, model creation |
| **Quill** | QA Auditor | 🔍 | Quality testing, bug detection, acceptance criteria |
| **Wren** | Lore & Narrative | 📜 | Story, worldbuilding, narrative design, canon |

---

## Spawn Template

```javascript
sessions_spawn({
  label: "<agent-name>",
  runtime: "subagent",
  task: "<task description>",
  cwd: "/root/.openclaw/workspace/projects/<project-folder>"
})
```

---

## Usage Notes

- **Default for any project** — These are our go-to agents
- Each has SOUL.md, GOALS.md, SKILLS.md in their folder
- Match task to agent specialty for best results
- Reference: `/projects/trap/team/AGENTS_REFERENCE.md`
