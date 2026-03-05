# Agent Battle Visuals - Station Command

> Retro side-view RPG battles (Final Fantasy style) where agents fight tasks.

---

## 1. Agent Sprites

### Overview
- **Base resolution:** 64x64 pixels (scalable to 128x128 for HD)
- **Style:** Pixel art, limited palette (16-24 colors per sprite)
- **Perspective:** Side-view, slight 3/4 angle (like FF4-6)

### Role Color Coding

| Role | Primary Color | Secondary | Outline |
|------|--------------|-----------|---------|
| Frontend | `#4A90D9` (Blue) | `#7CB9E8` | `#1E3A5F` |
| Backend | `#D94A4A` (Red) | `#E87C7C` | `#5F1E1E` |
| QA | `#4AD97A` (Green) | `#7CE8A3` | `#1E5F35` |
| DevOps | `#D9A04A` (Gold) | `#E8C77C` | `#5F4A1E` |
| Research | `#9B4AD9` (Purple) | `#C77CE8` | `#3D1E5F` |
| Design | `#E84AD9` (Magenta) | `#F07CE8` | `#5F1E4A` |

### Sprite States

**1. Idle Animation**
- 2-3 frame loop
- Subtle breathing/bobbing motion
- ~1 second per cycle

**2. Attacking**
- 4-6 frame sequence
- Wind-up → Strike → Follow-through → Return
- Visual indicator of attack type (sword swing, magic cast, etc.)

**3. Victory Pose**
- 1-2 frames
- Arms raised, confident stance
- Triggered when task HP reaches 0

**4. Defeated**
- 1-2 frames
- Kneeling/downed pose
- Grayscale or desaturated palette

### Agent-Specific Details

#### Frontend Agent
- Wields "CSS Blade" - glowing energy sword with code syntax patterns
- Attack: Slash with syntax-highlighted trail
- Idle: Tapping fingers, checking watch

#### Backend Agent
- Wields "Query Spear" - polearm with database icon
- Attack: Thrust with data-stream visual
- Idle: Arms crossed, stoic

#### QA Agent
- Wields "Bug Net" - magical capture tool
- Attack: Sweeping捕获 motion
- Idle: Microscope magnifying, inspecting

#### DevOps Agent
- Wields "Deploy Hammer" - wrench/hammer hybrid
- Attack: Heavy smash with gear effects
- Idle: Checking console output

#### Research Agent
- Wields "Idea Staff" - glowing crystal on staff
- Attack: Beam of light / mind blast
- Idle: Floating, contemplative

#### Design Agent
- Wields "Palette Bow" - bow made of color swatches
- Attack: Arrows of pure color
- Idle: Sketching in air

---

## 2. Enemy/Task Visuals

### Design Philosophy
Tasks appear as monsters/bosses. Each task type has a distinct visual language.

### Bug (QA Tasks)

| Type | Appearance | Size |
|------|-----------|------|
| Minor Bug | Small crawling insectoid, glowing red eyes | 32x32 |
| Critical Bug | Large multi-legged creature, crackling with error energy | 64x64 |
| Security Vulnerability | Hooded shadow figure with glowing red "!" | 48x48 |

**Animation:** Skittering movement, glitch effects on attack

### Code Monster (Backend Tasks)

| Type | Appearance | Size |
|------|-----------|------|
| Syntax Error | Blob of corrupted code, floating brackets | 48x48 |
| Memory Leak | Swirling void entity, consuming everything | 64x64 |
| Race Condition | Split personality twin entities | 80x64 (wide) |
| Legacy Code | Ancient golem made of cobwebs and punch cards | 96x96 |

**Animation:** Pulses, data streams, glitch distortions

### Design Challenge (Frontend Tasks)

| Type | Appearance | Size |
|------|-----------|------|
| Layout Chaos | Shifting geometric shapes, wonky proportions | 48x48 |
| Responsiveness | Morphing blob, never stays in one shape | 64x64 |
| Brand Inconsistency | Duplicate self with color variations | 64x64 (dual) |
| Accessibility Wall | Invisible barrier with "eye" sensors | 80x64 |

**Animation:** Shape-shifting, color flickering, perspective warps

### Research Task

| Type | Appearance | Size |
|------|-----------|------|
| Knowledge Gap | Empty void with question marks | 48x48 |
| Data Fog | Swirling mist cloud | 64x64 |
| Analysis Paralysis | Medusa-like, turns info to stone | 64x64 |
| Information Overload | Mass of overlapping documents/eyes | 96x96 |

**Animation:** Floating, phasing, document flurry

### Common Enemy Traits
- Health bar displayed above
- Weakness indicated by subtle color coding
- Defeat animation: dissolve into pixels → sparkles → disappear

---

## 3. Battle UI Elements

### Layout (Side-View)

```
┌─────────────────────────────────────────────────────────────┐
│  [Agent 1] [Agent 2] [Agent 3]     ← Your party (left side) │
│                                                             │
│                           [Enemy 1] [Enemy 2]               │
│                              ← Tasks to defeat (right)      │
├─────────────────────────────────────────────────────────────┤
│  [Menu: Attack | Magic | Item | Defend | Skill]             │
│  [Target: Enemy 1] [HP: ████████░░ 80/100] [MP: ████░░ 40%] │
└─────────────────────────────────────────────────────────────┘
```

### HP Bar (Task Progress)

- **Style:** Classic RPG - segmented blocks
- **Colors:** 
  - Full: Green `#4AD97A`
  - Medium (50-25%): Yellow `#D9D94A`
  - Low (<25%): Red `#D94A4A`
- **Size:** 120px wide, 16px tall
- **Animation:** Smooth drain, no instant jumps

### Attack Animation Frames

**Physical Attack (6 frames)**
1. Wind-up (0.1s)
2. Strike pose (0.05s)
3. Contact flash (0.05s)
4. Follow-through (0.1s)
5. Return start (0.1s)
6. Return complete (0.1s)

**Magic/Ability (8 frames)**
1. Cast start (0.15s)
2. Charge (hands glow) (0.2s)
3. Release (0.05s)
4. Projectile forms (0.1s)
5. Travel (variable)
6. Impact (0.05s)
7. Effect lingers (0.15s)
8. Fade (0.1s)

### Fatal Blow Animation

Triggered when enemy HP hits 0:
1. **Freeze frame** (0.1s) - Enemy paused
2. **Flash white** (0.1s)
3. **Shatter** - Break into large pixels (0.2s)
4. **Dissolve** - Pixels float up and fade (0.3s)
5. **Sparkles** - Victory particles (0.2s)
6. **Empty space** - Enemy slot cleared

### XP Gain Popup

- **Style:** Floating text, 8-bit font
- **Colors:** Yellow `#FFE066` with white outline
- **Animation:** 
  - Appears above defeated enemy
  - Floats upward while fading
  - Duration: 1.5 seconds

**Example:**
```
+50 XP [Frontend Lv.3 → Lv.4]
```

---

## 4. Station Map

### Overview
The station is the overworld where players navigate between battle locations.

### Locations & Battle Types

| Location | Visible Agents | Common Enemies |
|----------|---------------|----------------|
| **Command Center** | All types gathered | Mini-bosses, story encounters |
| **Frontend Suite** | Frontend, Design | Layout Chaos, Responsiveness |
| **Backend Server Room** | Backend, DevOps | Code Monsters, Syntax Errors |
| **QA Lab** | QA, Frontend | Bugs, Security Vulnerabilities |
| **Research Wing** | Research, Backend | Knowledge Gaps, Data Fog |
| **DevOps Control** | DevOps, Research | Deployment failures, Infrastructure |

### Visual Style

- **Top-down/Isometric** map view
- Each room has distinct color palette matching its role
- Agents visible in rooms when not in battle
- Battle transitions: Camera zooms in → screen fades → battle begins

### Room Details

**Command Center**
- Central hub, screens showing all agent statuses
- Where full party assembles
- Boss battles occur here

**Frontend Suite**
- Bright, colorful, lots of "design" elements floating
- Screens showing wireframes and layouts
- Battle triggers on entering

**Backend Server Room**
- Darker, matrix-like background
- Green text/terminal aesthetic
- Server racks as scenery

**QA Lab**
- Clinical white/green theme
- Microscopes, test tubes, bug catchers
- "Sterile" but with character

---

## 5. Reference Images

### Visual Style References

**Final Fantasy IV-VI (SNES Era)**
- Side-view party positioning
- ATB (Active Time Battle) system aesthetic
- Pixel art sprite fidelity
- Color palette limitations

**Chrono Trigger**
- Overworld → Battle transition (no separate screen)
- Dynamic battle backgrounds
- Enemy sprite design (distinct, memorable)
- Attack animations (limit breaks, double/triple techs)

**Secret of Mana**
- Isometric overworld
- Smooth action RPG feel
- Colorful, vibrant palette

### Suggested Reference Images

| Game | Scene | URL (placeholder) |
|------|-------|-------------------|
| FF6 | Battle with Kefka | [Reference] |
| FF6 | Esper summon | [Reference] |
| Chrono Trigger | Battle with Lavos | [Reference] |
| Chrono Trigger | Double Tech | [Reference] |
| Secret of Mana | Overworld | [Reference] |
| Terraria | Pixel art examples | [Reference] |

> **Note:** Researcher to populate actual reference URLs from web search.

### Style Guidelines Summary

1. **Resolution:** 64x64 sprites, 16-24 color palette
2. **Animation:** 2-8 frames per action, ~60fps equivalent
3. **Perspective:** Side-view for battle, isometric for map
4. **UI:** Classic RPG menus, segmented HP bars
5. **Transitions:** Smooth zoom/fade between map and battle
6. **FX:** Particle effects for magic, screen shake for heavy hits

---

## 6. Implementation Notes

### Sprite Sheets
- Each agent: 4 states × 4 frames = 16 sprite positions
- Organized in 256x256 or 512x512 sheets
- Export with transparent backgrounds

### Animation Specs
- Frame timing stored in JSON config
- Support for additive blending on magic effects
- Particle system for: damage numbers, XP popups, defeat sparkles

### UI Scalability
- Vector-style menus (render scalable)
- Pixel-perfect HP bars (render at 1x, scale up)

---

*Document Version: 1.0*  
*For: Station Command Game Design*  
*Next: Game Systems Designer → Battle System Spec*
