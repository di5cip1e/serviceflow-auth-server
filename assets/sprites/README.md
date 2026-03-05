# Station Command - Sprite Assets

## Directory Structure
```
assets/sprites/
├── agents/          # Crew member sprites
├── enemies/         # Task/enemy sprites  
├── ui/              # UI elements
└── README.md        # This file
```

## Agent Sprites (64x64)
| File | Role | Color |
|------|------|-------|
| frontend_idle.svg | Frontend | Blue (#4A90D9) |
| backend_idle.svg | Backend | Red (#D94A4A) |
| qa_idle.svg | QA | Green (#4AD97A) |
| devops_idle.svg | DevOps | Gold (#D9A04A) |
| research_idle.svg | Research | Purple (#9B4AD9) |
| design_idle.svg | Design | Magenta (#E84AD9) |
| coordinator_idle.svg | Coordinator | Cyan (#00CED1) |

## Enemy Sprites
| File | Type | Size |
|------|------|------|
| bug_minor.svg | Minor Bug | 32x32 |
| bug_critical.svg | Critical Bug | 48x48 |
| code_monster.svg | Code Monster | 64x64 |
| syntax_error.svg | Syntax Error | 48x48 |
| design_challenge.svg | Design Challenge | 48x48 |
| research_task.svg | Research Task | 64x64 |

## UI Elements
| File | Description | Size |
|------|-------------|------|
| hp_full.svg | HP bar (100%) | 120x16 |
| hp_medium.svg | HP bar (50-25%) | 120x16 |
| hp_low.svg | HP bar (<25%) | 120x16 |
| xp_popup.svg | XP gain popup | 80x24 |
| attack_effect.svg | Attack slash FX | 48x48 |
| victory_effect.svg | Victory sparkles | 64x64 |

## Notes
- All sprites are SVG placeholders (simple colored shapes)
- Replace with real pixel art (64x64 for agents, 32-96px for enemies)
- Animation frames should be added later (idle, attack, victory, defeat)
- Use 16-24 color palette for authentic pixel art look
