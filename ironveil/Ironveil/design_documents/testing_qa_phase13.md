# 🧪 IRONVEIL — PHASE 13: TESTING & QA PROCESS
## Complete Quality Assurance Specification

---

> **"A machine untested is a machine unfinished. Every rivet must hold. Every gear must turn. Trust nothing until it's proven."**
> *— The Djinn*

---

## TABLE OF CONTENTS

1. [QA Philosophy & Principles](#1-qa-philosophy--principles)
2. [Test Plan Overview](#2-test-plan-overview)
3. [Bug Tracking System](#3-bug-tracking-system)
4. [Art & Asset QA](#4-art--asset-qa)
5. [Core Systems Testing](#5-core-systems-testing)
6. [Gameplay Systems Testing](#6-gameplay-systems-testing)
7. [Combat & Defense Testing](#7-combat--defense-testing)
8. [Narrative & Dialogue Testing](#8-narrative--dialogue-testing)
9. [Performance Testing](#9-performance-testing)
10. [Platform-Specific Testing](#10-platform-specific-testing)
11. [Save/Load & Data Integrity Testing](#11-saveload--data-integrity-testing)
12. [Balance Testing](#12-balance-testing)
13. [Playtest Protocol](#13-playtest-protocol)
14. [Acceptance Criteria](#14-acceptance-criteria)
15. [Release Checklist](#15-release-checklist)

### Appendices
- [A: Test Case Template](#appendix-a-test-case-template)
- [B: Bug Report Template](#appendix-b-bug-report-template)
- [C: Playtest Feedback Form](#appendix-c-playtest-feedback-form)
- [D: Regression Test Suite](#appendix-d-regression-test-suite)

---

## 1. QA PHILOSOPHY & PRINCIPLES

### 1.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Test Early, Test Often** | Testing begins from the Prototype milestone, not after Beta. Every feature is tested as it's integrated. |
| **Data-Driven Validation** | Since Ironveil is data-driven (JSON), many bugs are data bugs. Automated data validation catches these before runtime. |
| **Player Experience First** | Bugs are prioritized by player impact, not technical severity. A minor visual glitch in a heart event is worse than a major performance issue in an unused debug menu. |
| **Regression Is Mandatory** | Every bug fix and new feature requires running the regression suite. No exceptions. |
| **Platform Parity** | A feature isn't done until it works on PC AND mobile. Mobile is not an afterthought. |
| **Defeat Is Not Failure** | Following the GDD's design philosophy — test that raid defeat is a setback, not a game-over. Ensure the player can always recover. |

### 1.2 Quality Gates

No milestone advances until its quality gate is passed:

| Milestone | Quality Gate |
|-----------|-------------|
| **Prototype** | Core loop functional: move, interact, time passes, one NPC, one craft, save/load |
| **Alpha** | All core systems functional, Coppervale playable, one full season, no critical bugs |
| **Beta** | Full content for Year 1, all systems integrated, no critical or high bugs, performance targets met on PC |
| **Release Candidate** | Full 3+ year content, all platforms tested, no known critical/high/medium bugs, localization complete |
| **Gold** | All acceptance criteria met, platform certification passed, 0 known critical bugs, <5 known low bugs |

### 1.3 Testing Team Structure

| Role | Responsibility | When Active |
|------|---------------|-------------|
| **Developer (Derek)** | Unit testing during development, fix bugs | All milestones |
| **QA Lead (Derek or dedicated)** | Test plan execution, regression, bug triage | Alpha onward |
| **Art QA** | Asset consistency review per Art Pipeline checklist | Every art batch |
| **External Playtesters** | Fresh-eyes gameplay feedback, usability testing | Beta onward |
| **Platform Testers** | Mobile-specific testing, device compatibility | Beta onward |

---

## 2. TEST PLAN OVERVIEW

### 2.1 Testing Categories & Schedule

| Category | When Tested | Frequency | Automated? |
|----------|------------|-----------|-----------|
| **Data Validation** | Every build | Every commit | ✅ Yes — JSON schema validator |
| **Art Consistency** | Every art batch | Per batch | ⬜ Manual (checklist) |
| **Tile Seam Testing** | Every tileset change | Per change | ⬜ Manual + visual tool |
| **Unit Testing** | During development | Per feature | Partial (GML test scripts) |
| **Integration Testing** | Every milestone | Weekly in Alpha+ | ⬜ Manual |
| **Gameplay Loop Testing** | Alpha onward | Weekly | ⬜ Manual (structured playtest) |
| **Balance Testing** | Alpha onward | Bi-weekly | ⬜ Manual + spreadsheet models |
| **NPC Behavior Testing** | Alpha onward | Per NPC implementation | Partial (schedule validator) |
| **Combat/Defense Testing** | Alpha onward | Per raid implementation | ⬜ Manual + automated wave runner |
| **Narrative Testing** | Beta onward | Per quest/dialogue batch | Partial (dialogue tree validator) |
| **Performance Testing** | All milestones | Weekly in Beta+ | ✅ Yes — FPS profiler |
| **Save/Load Testing** | Alpha onward | Every save system change | ✅ Yes — automated save/load cycle |
| **Platform Testing** | Beta onward | Weekly | ⬜ Manual (device matrix) |
| **Regression Testing** | Every bug fix | Per fix | Partial (automated suite + manual) |
| **Playtest Sessions** | Beta onward | Bi-weekly | ⬜ Manual (structured sessions) |

### 2.2 Test Environment Configuration

| Environment | Purpose | Configuration |
|-------------|---------|---------------|
| **Dev** | Active development, debugging | Debug build, all debug overlays enabled, verbose logging |
| **Test** | QA testing, regression | Testing build, FPS counter, error logging, no debug overlay |
| **Staging** | Pre-release validation | Release build, production settings, all platforms |
| **Production** | Final release | Release build, optimized, minified data |

### 2.3 Test Data Sets

Pre-configured save files for rapid testing:

| Save File | State | Purpose |
|-----------|-------|---------|
| `test_fresh_start.json` | Year 1, Spring, Day 1 | Test early game, tutorials, first impressions |
| `test_mid_year1.json` | Year 1, Autumn, Day 15 | Test mid-game, first serious raids, workshop progression |
| `test_end_year1.json` | Year 1, Winter, Day 28 | Test year-end evaluation, winter raids, season transition |
| `test_year2_start.json` | Year 2, Spring, Day 1 | Test Year 2 content, escalation, new systems |
| `test_mid_game.json` | Year 2, Autumn, Day 20 | Test advanced combat, mech deployment, deep exploration |
| `test_late_game.json` | Year 3, Summer, Day 10 | Test endgame content, legendary blueprints, story climax |
| `test_post_story.json` | Year 5, Spring, Day 1 | Test sandbox mode, post-story content |
| `test_max_items.json` | Full inventory, max storage | Test inventory overflow, UI scaling |
| `test_max_machines.json` | 30+ machines, all types | Test maintenance scaling, performance |
| `test_max_relationships.json` | All NPCs at 10 hearts | Test post-partnership content, dialogue variety |
| `test_raid_prep.json` | Raid scheduled for tomorrow | Test raid preparation, defense placement |
| `test_all_blueprints.json` | All blueprints discovered | Test crafting menu scaling, recipe display |

---

## 3. BUG TRACKING SYSTEM

### 3.1 Recommended Tool

**GitHub Issues** (integrated with the Git repository)

**Rationale:**
- Code and bugs live in the same place
- Free for small teams
- Labels, milestones, and project boards provide workflow
- Markdown support for detailed reproduction steps
- Integrates with commit messages (`Fixes #123`)

**Alternative:** If Derek prefers a dedicated tool — **Linear** or **Notion** databases work well for solo/small team game dev.

### 3.2 Bug Severity Levels

| Severity | Label | Description | Response Time | Examples |
|----------|-------|-------------|--------------|---------|
| 🔴 **Critical** | `severity:critical` | Game-breaking: crash, data loss, softlock, save corruption | Fix immediately, hotfix if post-release | Crash on room transition, save file corrupted, infinite loop in A* |
| 🟠 **High** | `severity:high` | Major feature broken, significant gameplay impact | Fix before next milestone | NPC schedule completely wrong, raid never ends, crafting produces wrong item |
| 🟡 **Medium** | `severity:medium` | Feature partially broken, workaround exists | Fix before release | Turret targeting wrong enemy type, gift reaction incorrect, UI element misaligned |
| 🟢 **Low** | `severity:low` | Cosmetic, minor inconvenience, edge case | Fix if time permits | 1-pixel gap in tile seam, NPC walks through decoration briefly, tooltip typo |
| ⚪ **Trivial** | `severity:trivial` | Polish items, suggestions | Backlog | Slightly wrong color in one season, animation could be smoother |

### 3.3 Bug Categories

| Category | Label | Scope |
|----------|-------|-------|
| `cat:crash` | Crashes and freezes | Application-level failures |
| `cat:gameplay` | Gameplay mechanics | Systems not working as designed |
| `cat:visual` | Visual/art issues | Tile seams, sprite errors, UI glitches |
| `cat:audio` | Sound/music issues | Missing SFX, wrong music, audio glitches |
| `cat:performance` | FPS drops, memory leaks | Performance below targets |
| `cat:data` | JSON data errors | Wrong values, missing entries, schema violations |
| `cat:save` | Save/load issues | Corruption, missing data, migration failures |
| `cat:narrative` | Story/dialogue issues | Wrong dialogue, broken quest flow, lore errors |
| `cat:balance` | Balance issues | Too easy/hard, economy broken, progression stuck |
| `cat:platform` | Platform-specific | Only occurs on specific OS/device |
| `cat:ux` | User experience | Confusing UI, unclear feedback, accessibility |

### 3.4 Bug Lifecycle

```
NEW → CONFIRMED → IN PROGRESS → FIXED → VERIFIED → CLOSED
  │                                         │
  │   ┌─── CANNOT REPRODUCE ←──────────────┘
  │   │
  └───┤── DUPLICATE (linked to original)
      │
      └── WON'T FIX (with justification)
```

### 3.5 Bug Report Requirements

Every bug report **must** include:

| Field | Required | Description |
|-------|----------|-------------|
| **Title** | ✅ | Clear, concise summary: `[System] Brief description` |
| **Severity** | ✅ | Critical / High / Medium / Low / Trivial |
| **Category** | ✅ | From category labels above |
| **Platform** | ✅ | PC (Win/Mac/Linux) / iOS / Android + device model |
| **Build Version** | ✅ | Game version + build config |
| **Steps to Reproduce** | ✅ | Numbered steps, starting from a known state |
| **Expected Result** | ✅ | What should happen |
| **Actual Result** | ✅ | What actually happens |
| **Reproduction Rate** | ✅ | Always / Often / Sometimes / Rarely / Once |
| **Screenshot/Video** | 🟡 | Strongly recommended for visual/gameplay bugs |
| **Save File** | 🟡 | Attach if bug is state-dependent |
| **Log Output** | 🟡 | Attach if crash or error logged |

---

## 4. ART & ASSET QA

### 4.1 Art Consistency Review

Every art asset batch is reviewed against the Art Production Pipeline (Phase 11) checklist before integration. This section references and extends that checklist.

#### General Asset Checklist
- [ ] **Naming**: Follows convention (`spr_`, `ts_`, `pt_`, `ui_`, `eq_`, `ic_` prefixes, lowercase, underscores)
- [ ] **Dimensions**: Multiples of 16px, matches spec for asset type
- [ ] **Format**: PNG, 32-bit RGBA, sRGB color profile
- [ ] **Palette**: All colors exist in the Color Palette Bible — no unauthorized colors
- [ ] **Scale**: Created at 1x native resolution (16px tiles)
- [ ] **No stray pixels**: Check with zoom tool — no orphaned pixels outside intended bounds
- [ ] **Transparent backgrounds**: Where required (sprites, portraits, UI elements)
- [ ] **Opaque backgrounds**: Where required (tilesets base terrain)

#### Style Consistency Checklist
- [ ] **Outline**: 1px, correct contextual color (brown `#3D2B1F` for organic, steel `#2C3E50` for mechanical)
- [ ] **Shading**: 2-3 tones only (base + shadow + optional highlight)
- [ ] **Anti-aliasing**: None — clean pixel edges
- [ ] **Dithering**: Minimal, only for large gradients
- [ ] **Readability**: Asset identifiable at 1x AND at 3x display scale
- [ ] **Charm Factor**: Warm, inviting, Harvest Moon-esque feel
- [ ] **Steampunk Balance**: 70% charm / 30% steampunk grit

### 4.2 Tile Seam Testing

**When**: After every tileset creation or modification

**Procedure**:
1. Create a test room with a 20×15 grid
2. Fill the grid with the tileset using auto-tile
3. Place every possible edge combination (all 47 blob tiles used)
4. Zoom to 1x (native) — check for visible seams, misaligned pixels, color mismatches
5. Zoom to 3x (default display) — verify readability and visual coherence
6. Place adjacent terrain types — verify transition tiles work correctly
7. Test animated tiles — verify frame alignment and loop smoothness

**Pass Criteria**:
- Zero visible seams at 3x zoom
- All 47 auto-tile configurations render correctly
- Transitions to adjacent terrain types are smooth
- Animated tiles loop without jarring jumps

### 4.3 Sprite Animation Testing

**When**: After every sprite sheet creation or modification

**Procedure**:
1. Import sprite sheet into GameMaker with correct frame dimensions
2. Play each animation row at specified speed (per Art Pipeline Section 5)
3. Verify walk cycles: smooth motion, correct frame order (Stand → Step L → Stand → Step R)
4. Verify idle animations: subtle, not distracting
5. Verify action animations: clear action read, satisfying motion
6. Test at 1x and 3x scale
7. Test depth sorting — character walks behind/in front of objects correctly

**Pass Criteria**:
- All animations play at correct speed without stuttering
- Walk cycles look natural in all 4 directions
- Character is recognizable by silhouette at 16×24px
- No frames are misaligned or shifted

### 4.4 Portrait Testing

**When**: After every portrait sheet creation or modification

**Procedure**:
1. Display each portrait in the dialogue box UI frame
2. Verify all 8 expressions are distinct and readable
3. Verify portrait style is consistent across all characters (same level of detail, same proportion rules)
4. Verify portraits match their corresponding world sprites (recognizable as the same character)

**Pass Criteria**:
- All 8 expressions clearly convey their intended emotion
- Portrait fits correctly within the dialogue box frame (64×64 within the brass border)
- No expression looks out of style compared to others in the same sheet

### 4.5 UI Asset Testing

**When**: After every UI asset creation or modification

**Procedure**:
1. Display UI element at target resolution (320×240 native, scaled to display)
2. Verify text is legible at minimum display scale (3x)
3. Verify touch targets meet minimum 48×48 display pixel requirement (mobile)
4. Verify steampunk aesthetic consistency (brass borders, rivets, gear accents)
5. Test button states (normal, hover, pressed, disabled)
6. Verify icon readability at small sizes (16×16 icons in the hotbar)

---

## 5. CORE SYSTEMS TESTING

### 5.1 Time & Calendar System

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `TIME-001` | Game clock advances during `FREE_ROAM` state | 1 real second ≈ 1.2 game minutes | 🔴 Critical |
| `TIME-002` | Game clock pauses during dialogue | Time frozen, resumes on dialogue exit | 🔴 Critical |
| `TIME-003` | Game clock pauses during menus | Time frozen, resumes on menu close | 🔴 Critical |
| `TIME-004` | Day advances when player sleeps | New day, clock resets to 6:00 AM | 🔴 Critical |
| `TIME-005` | Day does NOT advance at midnight | Clock wraps to 0:00, day stays same | 🟠 High |
| `TIME-006` | Season changes after Day 30 | Correct season transition, events fire | 🔴 Critical |
| `TIME-007` | Year changes after Winter Day 30 | Year increments, Spring begins | 🔴 Critical |
| `TIME-008` | Day/night shader matches time | Visual overlay changes smoothly through 6 time periods | 🟠 High |
| `TIME-009` | Weather rolls at start of each day | New weather type, visual effects match | 🟡 Medium |
| `TIME-010` | Weather affects NPC schedules | Rainy schedule used when raining | 🟡 Medium |
| `TIME-011` | Festival detected on correct day | `time_is_festival_today()` returns correct festival | 🟠 High |
| `TIME-012` | Fatigue at midnight | Energy drain begins after midnight | 🟡 Medium |
| `TIME-013` | Collapse at 2 AM | Player collapses, wakes next day with 50% energy, items may be lost | 🟠 High |

### 5.2 State Machine

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `STATE-001` | Boot → Title transition | Data loads, title screen displays | 🔴 Critical |
| `STATE-002` | Title → New Game | Fresh game state, player in starting room | 🔴 Critical |
| `STATE-003` | Title → Load Game | Saved state restored, player in saved room | 🔴 Critical |
| `STATE-004` | Gameplay → Dialogue → Gameplay | Smooth transition, time paused during dialogue, NPC state preserved | 🔴 Critical |
| `STATE-005` | Gameplay → Menu → Gameplay | Smooth transition, time paused, game state preserved | 🔴 Critical |
| `STATE-006` | Gameplay → Raid → Gameplay | Raid lifecycle complete, state transitions correctly | 🔴 Critical |
| `STATE-007` | Raid: Strategic ↔ Mech toggle | Seamless switch between views, all units preserved | 🟠 High |
| `STATE-008` | Room transition (Fade) | Smooth fade, correct room loads, player positioned correctly | 🔴 Critical |
| `STATE-009` | Room transition (Slide — enter building) | Smooth slide, interior loads, NPCs present | 🟠 High |
| `STATE-010` | No orphan states | Cannot get stuck in a state with no valid exit | 🔴 Critical |

### 5.3 Data Validation (Automated)

A JSON schema validator script runs on every build to catch data errors before runtime:

```gml
/// @function test_data_validate_all()
/// @description Automated data validation — run every build
function test_data_validate_all() {
    var _errors = [];
    
    // Validate all items have required fields
    var _item_keys = variable_struct_get_names(global.data_items);
    for (var i = 0; i < array_length(_item_keys); i++) {
        var _item = global.data_items[$ _item_keys[i]];
        if (!variable_struct_exists(_item, "id")) array_push(_errors, "Item missing id: " + _item_keys[i]);
        if (!variable_struct_exists(_item, "name")) array_push(_errors, "Item missing name: " + _item_keys[i]);
        if (!variable_struct_exists(_item, "category")) array_push(_errors, "Item missing category: " + _item_keys[i]);
        if (!variable_struct_exists(_item, "stack_max")) array_push(_errors, "Item missing stack_max: " + _item_keys[i]);
        if (_item.stack_max <= 0) array_push(_errors, "Item invalid stack_max: " + _item_keys[i]);
        if (!variable_struct_exists(_item, "icon_sprite")) array_push(_errors, "Item missing icon_sprite: " + _item_keys[i]);
        // Verify icon sprite exists as asset
        if (asset_get_index(_item.icon_sprite) == -1) {
            array_push(_errors, "Item references missing sprite: " + _item_keys[i] + " → " + _item.icon_sprite);
        }
    }
    
    // Validate all recipes reference valid items
    var _recipe_keys = variable_struct_get_names(global.data_recipes);
    for (var i = 0; i < array_length(_recipe_keys); i++) {
        var _recipe = global.data_recipes[$ _recipe_keys[i]];
        // Check output item exists
        if (!variable_struct_exists(global.data_items, _recipe.output_item)) {
            array_push(_errors, "Recipe references missing item: " + _recipe_keys[i] + " → " + _recipe.output_item);
        }
        // Check all input items exist
        for (var j = 0; j < array_length(_recipe.inputs); j++) {
            if (!variable_struct_exists(global.data_items, _recipe.inputs[j].item_id)) {
                array_push(_errors, "Recipe input references missing item: " + _recipe_keys[i] + " → " + _recipe.inputs[j].item_id);
            }
        }
    }
    
    // Validate all blueprints reference valid machines
    var _bp_keys = variable_struct_get_names(global.data_blueprints);
    for (var i = 0; i < array_length(_bp_keys); i++) {
        var _bp = global.data_blueprints[$ _bp_keys[i]];
        if (!variable_struct_exists(global.data_machines, _bp.machine_id)) {
            array_push(_errors, "Blueprint references missing machine: " + _bp_keys[i] + " → " + _bp.machine_id);
        }
        // Check all component items exist
        for (var j = 0; j < array_length(_bp.components); j++) {
            if (!variable_struct_exists(global.data_items, _bp.components[j].item_id)) {
                array_push(_errors, "Blueprint component references missing item: " + _bp_keys[i] + " → " + _bp.components[j].item_id);
            }
        }
    }
    
    // Validate all NPC data
    var _npc_keys = variable_struct_get_names(global.data_npcs);
    for (var i = 0; i < array_length(_npc_keys); i++) {
        var _npc = global.data_npcs[$ _npc_keys[i]];
        // Check portrait sprite exists
        if (asset_get_index(_npc.portrait_sprite) == -1) {
            array_push(_errors, "NPC references missing portrait sprite: " + _npc_keys[i]);
        }
        // Check world sprite exists
        if (asset_get_index(_npc.world_sprite) == -1) {
            array_push(_errors, "NPC references missing world sprite: " + _npc_keys[i]);
        }
        // Validate gift preferences reference valid items
        for (var j = 0; j < array_length(_npc.gift_preferences.loved); j++) {
            var _gift_id = _npc.gift_preferences.loved[j];
            if (string_pos("*", _gift_id) == 0 && !variable_struct_exists(global.data_items, _gift_id)) {
                array_push(_errors, "NPC loved gift references missing item: " + _npc_keys[i] + " → " + _gift_id);
            }
        }
    }
    
    // Validate all enemy data
    var _enemy_keys = variable_struct_get_names(global.data_enemies);
    for (var i = 0; i < array_length(_enemy_keys); i++) {
        var _enemy = global.data_enemies[$ _enemy_keys[i]];
        if (_enemy.stats.hp <= 0) array_push(_errors, "Enemy has invalid HP: " + _enemy_keys[i]);
        if (_enemy.stats.speed <= 0) array_push(_errors, "Enemy has invalid speed: " + _enemy_keys[i]);
        // Check loot table items exist
        for (var j = 0; j < array_length(_enemy.loot_table); j++) {
            if (!variable_struct_exists(global.data_items, _enemy.loot_table[j].item_id)) {
                array_push(_errors, "Enemy loot references missing item: " + _enemy_keys[i] + " → " + _enemy.loot_table[j].item_id);
            }
        }
    }
    
    // Validate raid data
    var _raid_keys = variable_struct_get_names(global.data_raids);
    for (var i = 0; i < array_length(_raid_keys); i++) {
        var _raid = global.data_raids[$ _raid_keys[i]];
        for (var w = 0; w < array_length(_raid.waves); w++) {
            for (var u = 0; u < array_length(_raid.waves[w].units); u++) {
                var _eid = _raid.waves[w].units[u].enemy_id;
                if (!variable_struct_exists(global.data_enemies, _eid)) {
                    array_push(_errors, "Raid references missing enemy: " + _raid_keys[i] + " wave " + string(w) + " → " + _eid);
                }
            }
        }
    }
    
    // Report results
    if (array_length(_errors) == 0) {
        show_debug_message("✅ DATA VALIDATION PASSED — All " + 
            string(array_length(_item_keys)) + " items, " +
            string(array_length(_recipe_keys)) + " recipes, " +
            string(array_length(_bp_keys)) + " blueprints, " +
            string(array_length(_npc_keys)) + " NPCs, " +
            string(array_length(_enemy_keys)) + " enemies, " +
            string(array_length(_raid_keys)) + " raids validated.");
    } else {
        show_debug_message("❌ DATA VALIDATION FAILED — " + string(array_length(_errors)) + " errors:");
        for (var i = 0; i < array_length(_errors); i++) {
            show_debug_message("  ERROR: " + _errors[i]);
        }
    }
    
    return _errors;
}
```

### 5.4 Dialogue Tree Validation (Automated)

```gml
/// @function test_dialogue_validate_all()
/// @description Validates all dialogue trees for dead ends and invalid references
function test_dialogue_validate_all() {
    var _errors = [];
    
    var _npc_keys = variable_struct_get_names(global.data_npcs);
    for (var i = 0; i < array_length(_npc_keys); i++) {
        var _npc = global.data_npcs[$ _npc_keys[i]];
        
        for (var f = 0; f < array_length(_npc.dialogue_files); f++) {
            var _dlg_file = data_load_file(_npc.dialogue_files[f]);
            var _dlg_keys = variable_struct_get_names(_dlg_file);
            
            for (var d = 0; d < array_length(_dlg_keys); d++) {
                var _dlg = _dlg_file[$ _dlg_keys[d]];
                
                // Validate each node
                for (var n = 0; n < array_length(_dlg.nodes); n++) {
                    var _node = _dlg.nodes[n];
                    
                    // Check portrait exists in sprite
                    // (portrait is a string like "happy" — mapped to sprite index)
                    
                    // Check response next targets exist
                    if (_node.responses != undefined) {
                        for (var r = 0; r < array_length(_node.responses); r++) {
                            var _resp = _node.responses[r];
                            if (_resp.next != undefined) {
                                // Verify target node exists in this dialogue
                                var _found = false;
                                for (var nn = 0; nn < array_length(_dlg.nodes); nn++) {
                                    if (_dlg.nodes[nn].id == _resp.next) {
                                        _found = true;
                                        break;
                                    }
                                }
                                if (!_found) {
                                    array_push(_errors, "Dialogue node references missing target: " + 
                                        _dlg_keys[d] + " → " + _resp.next);
                                }
                            }
                            
                            // Validate effects
                            if (variable_struct_exists(_resp, "effects")) {
                                for (var e = 0; e < array_length(_resp.effects); e++) {
                                    var _eff = _resp.effects[e];
                                    if (_eff.type == "hearts" && !variable_struct_exists(global.data_npcs, _eff.npc)) {
                                        array_push(_errors, "Dialogue effect references missing NPC: " + 
                                            _dlg_keys[d] + " → " + _eff.npc);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    return _errors;
}
```

---

## 6. GAMEPLAY SYSTEMS TESTING

### 6.1 Inventory System

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `INV-001` | Add item to empty inventory | Item appears in first empty slot | 🔴 Critical |
| `INV-002` | Add stackable item to existing stack | Quantity increases, no new slot used | 🔴 Critical |
| `INV-003` | Add item exceeding stack max | Overflow creates new stack in next empty slot | 🟠 High |
| `INV-004` | Add item to full inventory | Returns overflow count, no items lost | 🔴 Critical |
| `INV-005` | Remove items from inventory | Correct quantity removed, slot cleared if empty | 🔴 Critical |
| `INV-006` | Remove more than available | Only removes what exists, returns actual count | 🟠 High |
| `INV-007` | Transfer between inventories | Item moves correctly, source cleared, destination stacked | 🟠 High |
| `INV-008` | Storage container persistence | Chest contents survive room change and save/load | 🔴 Critical |
| `INV-009` | Hotbar quick-select | Correct item from hotbar used when activated | 🟡 Medium |
| `INV-010` | Item count across all storage | `inventory_count_item` returns correct total | 🟡 Medium |

### 6.2 Crafting System

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `CRAFT-001` | Craft with all ingredients available | Ingredients consumed, output produced, XP awarded | 🔴 Critical |
| `CRAFT-002` | Craft with missing ingredients | Craft blocked, ingredients not consumed | 🔴 Critical |
| `CRAFT-003` | Craft with insufficient engineering level | Recipe not shown or grayed out | 🟠 High |
| `CRAFT-004` | Timed craft at forge | Item appears after correct game time | 🔴 Critical |
| `CRAFT-005` | Timed craft queue (multiple items) | Items complete in order, correct timing | 🟠 High |
| `CRAFT-006` | Assembly crane — first build | Interactive placement, all slots required, quality calculated | 🔴 Critical |
| `CRAFT-007` | Assembly crane — multi-day build | Progress persists across days, resumes correctly | 🟠 High |
| `CRAFT-008` | Assembly crane — quality scoring | Higher engineering level + better components = better quality | 🟡 Medium |
| `CRAFT-009` | Automaton-assisted build | Takes 1.5x longer, slightly lower quality | 🟡 Medium |
| `CRAFT-010` | Station upgrade unlocks new recipes | Upgrading forge/fabricator reveals new recipe list | 🟠 High |

### 6.3 NPC System

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `NPC-001` | NPC follows daily schedule | NPC at correct location at each time period | 🔴 Critical |
| `NPC-002` | NPC uses rainy-day schedule | Different locations/activities when raining | 🟠 High |
| `NPC-003` | NPC respects heart-gated schedule entries | Conditional entry only active when hearts ≥ threshold | 🟠 High |
| `NPC-004` | NPC pathfinds around obstacles | NPC walks around furniture, walls, other NPCs | 🟠 High |
| `NPC-005` | NPC transitions between rooms | NPC deactivates when leaving, appears in target room | 🟠 High |
| `NPC-006` | NPC interaction during valid state | Dialogue opens when player interacts with stationary NPC | 🔴 Critical |
| `NPC-007` | NPC interaction blocked during movement | Cannot interact with NPC mid-walk (or NPC stops to talk) | 🟡 Medium |
| `NPC-008` | Festival schedule override | NPCs attend festival on correct day | 🟡 Medium |
| `NPC-009` | All NPCs have valid schedules for all seasons | No NPC gets stuck without a schedule | 🟠 High |
| `NPC-010` | NPC schedule changes with story progress | Story-flag-gated schedule entries activate correctly | 🟡 Medium |

### 6.4 Relationship System

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `REL-001` | Give loved gift | +65 points, correct reaction dialogue | 🔴 Critical |
| `REL-002` | Give hated gift | -40 points, negative reaction | 🟠 High |
| `REL-003` | Heart level increases at 100 points | Hearts increment, `on_heart_level_up` event fires | 🔴 Critical |
| `REL-004` | Birthday gift double multiplier | Points doubled on NPC's birthday | 🟡 Medium |
| `REL-005` | One gift per day limit | Second gift rejected or reduced value | 🟡 Medium |
| `REL-006` | Heart event triggers at correct level | Heart event fires when heart level + location conditions met | 🔴 Critical |
| `REL-007` | Heart event plays only once | Same event does not re-trigger | 🟠 High |
| `REL-008` | Romance progression (confession at 8) | Confession event available at heart 8 for romance candidates | 🟠 High |
| `REL-009` | Partnership at heart 10 | Partnership ceremony triggers, NPC moves in | 🟠 High |
| `REL-010` | Daily conversation points | Talking to NPC gives points, diminishing returns | 🟡 Medium |
| `REL-011` | `talked_today` resets each day | Flag clears on `on_day_start` event | 🟡 Medium |

### 6.5 Energy System

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `NRG-001` | Tool use consumes energy | Correct amount deducted per action | 🔴 Critical |
| `NRG-002` | Running consumes energy | Gradual drain while holding run input | 🟡 Medium |
| `NRG-003` | Food restores energy | Consuming food item adds correct energy | 🟠 High |
| `NRG-004` | Sleeping restores full energy | Energy at max after sleep | 🔴 Critical |
| `NRG-005` | Zero energy blocks tool use | Player cannot use tools at 0 energy | 🟠 High |
| `NRG-006` | Weather affects energy drain | Storm increases energy cost of outdoor actions | 🟡 Medium |
| `NRG-007` | Collapse mechanic at 2 AM | Player collapses, loses some items, wakes at home | 🟠 High |

### 6.6 Maintenance System

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `MAINT-001` | Machine oil depletes daily | Lubrication meter drops 10-15% per day | 🔴 Critical |
| `MAINT-002` | Oil Can restores lubrication | Quick action restores meter | 🔴 Critical |
| `MAINT-003` | Machine fuel depletes with use | Fuel meter drops based on machine type | 🟠 High |
| `MAINT-004` | Aetheric Cell refuels machine | Fuel meter restored | 🟠 High |
| `MAINT-005` | Random breakdown occurs | 1-5% chance per day, visual/audio indicators | 🟠 High |
| `MAINT-006` | Unmaintained machine loses efficiency | Grinding gears, 20% efficiency drop when oil empty | 🟡 Medium |
| `MAINT-007` | Maintenance Bot handles basic tasks | Bot oils/refuels assigned machines automatically | 🟡 Medium |
| `MAINT-008` | Visual indicators correct | 💧⚡🔩⚠️ icons appear on correct conditions | 🟡 Medium |

---

## 7. COMBAT & DEFENSE TESTING

### 7.1 Tower Defense

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `TD-001` | Place turret in valid zone | Turret appears, grid marked occupied | 🔴 Critical |
| `TD-002` | Cannot place turret on blocked cell | Placement rejected with feedback | 🟠 High |
| `TD-003` | Wall blocks enemy path | Enemies repath around wall | 🔴 Critical |
| `TD-004` | Turret auto-targets enemies | Nearest-to-goal enemy targeted | 🔴 Critical |
| `TD-005` | Turret deals correct damage | Enemy HP reduced by turret damage minus armor | 🔴 Critical |
| `TD-006` | AoE turret (mortar) hits multiple enemies | All enemies in blast radius take damage | 🟠 High |
| `TD-007` | Tesla coil chains between enemies | Lightning chains to nearby enemies | 🟡 Medium |
| `TD-008` | Trap triggers on enemy contact | Single-use trap activates, effect applies | 🟠 High |
| `TD-009` | Wall takes damage from enemies | Wall HP decreases, destroyed at 0 | 🔴 Critical |
| `TD-010` | Medic Bot repairs during waves | Medic Bot moves to damaged structure, repairs HP | 🟡 Medium |

### 7.2 Wave System

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `WAVE-001` | First wave spawns at raid start | Enemies appear at correct spawn point | 🔴 Critical |
| `WAVE-002` | Next wave spawns after delay | Correct pause between waves | 🟠 High |
| `WAVE-003` | Multi-direction raid | Enemies spawn from multiple directions | 🟠 High |
| `WAVE-004` | All enemies killed = wave complete | Wave counter advances | 🔴 Critical |
| `WAVE-005` | All waves complete = victory | Raid ends, aftermath screen shows | 🔴 Critical |
| `WAVE-006` | Enemy reaches town center = defeat | Defeat consequences applied (resource loss, morale drop) | 🔴 Critical |
| `WAVE-007` | Raid salvage collected on victory | Loot from killed enemies added to reward pool | 🟠 High |

### 7.3 Enemy Behavior

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `ENEMY-001` | Enemies pathfind to town center | A* path followed correctly | 🔴 Critical |
| `ENEMY-002` | Enemies attack walls blocking path | Switch to attack behavior when path blocked | 🔴 Critical |
| `ENEMY-003` | Enemies repath when wall destroyed | New path calculated through gap | 🟠 High |
| `ENEMY-004` | Scavenger flees at low HP | Behavior state changes to "flee" | 🟡 Medium |
| `ENEMY-005` | Wolf Sapper targets walls specifically | Plants explosives on walls, high wall damage | 🟡 Medium |
| `ENEMY-006` | Alpha Wolf buffs nearby wolves | Nearby wolves get stat boost | 🟡 Medium |
| `ENEMY-007` | Iron Shieldbearer absorbs damage | Front-facing damage reduced for units behind | 🟡 Medium |
| `ENEMY-008` | Enemy death drops loot | Loot table rolled correctly, items added to raid pool | 🟠 High |

### 7.4 Mech Combat

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `MECH-001` | Deploy mech during raid | Camera switches to mech view, player controls mech | 🔴 Critical |
| `MECH-002` | Mech movement feels weighty | Acceleration/deceleration, momentum-based | 🟠 High |
| `MECH-003` | Primary weapon fires and damages enemies | Projectile created, damage applied on hit | 🔴 Critical |
| `MECH-004` | Stomp attack damages nearby enemies | AoE damage, screen shake, satisfying feedback | 🟠 High |
| `MECH-005` | Component damage affects performance | Leg damage = slower, arm damage = less weapon damage | 🟠 High |
| `MECH-006` | Cockpit breach forces eject | Mech disabled for remainder of raid | 🟠 High |
| `MECH-007` | Switch back to strategic view | Seamless transition, all units preserved | 🔴 Critical |
| `MECH-008` | Special ability activates and cools down | Ability effect applies, cooldown timer starts | 🟡 Medium |

---

## 8. NARRATIVE & DIALOGUE TESTING

### 8.1 Dialogue System

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `DLG-001` | Correct greeting selected by conditions | Season, hearts, story flags all checked | 🔴 Critical |
| `DLG-002` | Typewriter text effect | Text appears character by character at correct speed | 🟡 Medium |
| `DLG-003` | Player can skip text | Button press shows full text immediately | 🟡 Medium |
| `DLG-004` | Response choices displayed | All valid responses shown, selectable | 🔴 Critical |
| `DLG-005` | Response effects applied | Heart points, story flags, item transfers processed | 🔴 Critical |
| `DLG-006` | Dialogue branching works | Selecting response leads to correct next node | 🔴 Critical |
| `DLG-007` | Dialogue ends cleanly | Return to FREE_ROAM state, NPC state preserved | 🟠 High |
| `DLG-008` | Portrait expressions change | Correct portrait shown for each dialogue node | 🟡 Medium |

### 8.2 Quest System

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `QUEST-001` | Quest activates on trigger | Quest added to journal when conditions met | 🔴 Critical |
| `QUEST-002` | Quest objectives tracked | Kill count, item count, location visited tracked correctly | 🔴 Critical |
| `QUEST-003` | Quest completes on all objectives met | Rewards granted, quest moves to completed | 🔴 Critical |
| `QUEST-004` | Quest reward items added to inventory | Correct items and quantities | 🟠 High |
| `QUEST-005` | Quest chain progression | Completing quest A unlocks quest B | 🟠 High |
| `QUEST-006` | Story flags set on quest completion | Correct flags set, downstream systems react | 🟠 High |

### 8.3 DEJIN System

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `DEJIN-001` | DEJIN stage progression | Each repair quest advances DEJIN stage correctly | 🔴 Critical |
| `DEJIN-002` | DEJIN dialogue matches stage | Speech patterns evolve with each stage | 🟠 High |
| `DEJIN-003` | Data core installation | Memory fragments recovered, lore entries added to journal | 🟠 High |
| `DEJIN-004` | DEJIN commentary toggleable | Player can enable/disable DEJIN interjections | 🟡 Medium |
| `DEJIN-005` | DEJIN morning greeting varies | Changes based on weather, season, recent events | 🟡 Medium |

---

## 9. PERFORMANCE TESTING

### 9.1 Performance Targets

| Platform | Target FPS | Minimum FPS | Max Frame Time | Max Memory |
|----------|-----------|-------------|----------------|-----------|
| PC (min spec) | 60 | 30 | 33ms | 512 MB |
| PC (recommended) | 60 | 60 | 16ms | 256 MB |
| Mobile (modern) | 60 | 30 | 33ms | 200 MB |
| Mobile (older) | 30 | 24 | 41ms | 150 MB |

### 9.2 Performance Test Scenarios

| Test ID | Scenario | Metric | Threshold | Priority |
|---------|----------|--------|-----------|----------|
| `PERF-001` | Coppervale overworld, 15+ NPCs active | FPS | ≥ 60 PC, ≥ 30 mobile | 🔴 Critical |
| `PERF-002` | Raid with 20+ enemies, 10+ turrets firing | FPS | ≥ 30 all platforms | 🔴 Critical |
| `PERF-003` | Heavy rain particles (200 PC / 50 mobile) | FPS | ≥ 55 PC, ≥ 28 mobile | 🟠 High |
| `PERF-004` | Workshop with 15+ machines, all animated | FPS | ≥ 55 PC, ≥ 28 mobile | 🟠 High |
| `PERF-005` | Room transition speed | Load time | < 1s PC, < 2s mobile | 🟠 High |
| `PERF-006` | Save file write | Time | < 0.5s | 🟡 Medium |
| `PERF-007` | Save file load | Time | < 1s | 🟡 Medium |
| `PERF-008` | A* pathfinding (20+ simultaneous) | Frame time | < 2ms total | 🟠 High |
| `PERF-009` | Data loading at boot | Time | < 3s PC, < 5s mobile | 🟡 Medium |
| `PERF-010` | 1-hour play session | Memory | No growth > 10% (leak detection) | 🔴 Critical |
| `PERF-011` | Season transition (texture swap) | Hitch | < 100ms | 🟡 Medium |

### 9.3 Profiling Tools

| Tool | Purpose | When Used |
|------|---------|-----------|
| **GameMaker Debug Overlay** | FPS, instance count, draw calls | Always in dev builds |
| **GameMaker Profiler** | Per-function execution time | When investigating frame drops |
| **Custom Memory Tracker** | Track surface/buffer allocations | Weekly memory audits |
| **Custom FPS Logger** | Log FPS every 5 seconds to file | Overnight soak tests |

### 9.4 Soak Testing

Run the game unattended for extended periods to catch memory leaks and rare crashes:

| Test | Duration | Method | Looking For |
|------|----------|--------|-------------|
| **Idle Soak** | 4 hours | Player standing still in Coppervale | Memory growth, FPS degradation |
| **Time Soak** | 2 hours | Accelerated time (10x speed) cycling through seasons | Memory growth, season transition issues |
| **Rain Soak** | 1 hour | Force rain weather, player walking around | Particle system memory leaks |
| **Raid Soak** | 1 hour | Repeated raid cycles (spawn, defeat, aftermath, repeat) | Combat object cleanup, memory recovery |

---

## 10. PLATFORM-SPECIFIC TESTING

### 10.1 PC Testing Matrix

| OS | Minimum Config | Recommended Config |
|-----|---------------|-------------------|
| **Windows 10/11** | Intel i3 / 4GB RAM / Intel HD 4000 | Intel i5 / 8GB RAM / GTX 1050 |
| **macOS 12+** | M1 or Intel i5 / 8GB RAM | M1 Pro / 16GB RAM |
| **Linux (Ubuntu 22.04+)** | Intel i3 / 4GB RAM / Mesa 21 | Intel i5 / 8GB RAM / Mesa 22 |

**PC-Specific Tests:**
- [ ] Keyboard + mouse input all functions correctly
- [ ] Gamepad input (Xbox, PlayStation controllers) if supported
- [ ] Windowed and fullscreen modes
- [ ] Display scaling at 3x, 4x, and 6x
- [ ] Alt+Tab doesn't crash or corrupt state
- [ ] Minimize/restore preserves game state
- [ ] Multiple monitor configurations

### 10.2 Mobile Testing Matrix

| Device Tier | Example Devices | Expected Performance |
|-------------|----------------|---------------------|
| **Modern (Tier 1)** | iPhone 14+, Samsung S23+, Pixel 7+ | 60 FPS, full effects |
| **Mid-range (Tier 2)** | iPhone 11, Samsung A54, Pixel 6a | 60 FPS, reduced particles |
| **Older (Tier 3)** | iPhone 8, Samsung A32, Pixel 4a | 30 FPS, minimal particles, 2x scale |

**Mobile-Specific Tests:**
- [ ] Virtual joystick responsive and comfortable
- [ ] Touch targets ≥ 48×48 display pixels
- [ ] Long press for tooltips works
- [ ] Pinch to zoom (if implemented)
- [ ] App backgrounding preserves state
- [ ] App kill and restart resumes from last save
- [ ] Battery usage reasonable (< 15% per hour)
- [ ] Thermal management (no overheating during raids)
- [ ] Notch/safe area handling
- [ ] Different aspect ratios (16:9, 19.5:9, 20:9)
- [ ] Low storage space handling (save file warnings)
- [ ] Interruptions (phone call, notification) handled gracefully

---

## 11. SAVE/LOAD & DATA INTEGRITY TESTING

### 11.1 Save System Tests

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `SAVE-001` | Save game to slot | File written, no errors | 🔴 Critical |
| `SAVE-002` | Load game from slot | All state restored correctly | 🔴 Critical |
| `SAVE-003` | Auto-save on sleep | Save file created/updated automatically | 🔴 Critical |
| `SAVE-004` | Auto-save before raid | Checkpoint save created | 🟠 High |
| `SAVE-005` | All 3 manual save slots work | Independent saves, correct data per slot | 🟠 High |
| `SAVE-006` | Overwrite existing save | Old data replaced, no corruption | 🔴 Critical |
| `SAVE-007` | Save/load preserves inventory | All items, quantities, slot positions correct | 🔴 Critical |
| `SAVE-008` | Save/load preserves relationships | Hearts, points, events seen, romance state | 🔴 Critical |
| `SAVE-009` | Save/load preserves story flags | All flags restored, downstream systems react correctly | 🔴 Critical |
| `SAVE-010` | Save/load preserves machine state | All machines, maintenance meters, positions | 🟠 High |
| `SAVE-011` | Save/load preserves defense layout | Wall/turret/trap positions and HP | 🟠 High |
| `SAVE-012` | Save/load preserves DEJIN state | Stage, hearts, memories recovered | 🟠 High |
| `SAVE-013` | Save/load preserves time state | Year, season, day, hour, minute, weather | 🔴 Critical |
| `SAVE-014` | Save/load preserves exploration progress | Discovered zones, fog of war, journal entries | 🟠 High |

### 11.2 Data Integrity Tests

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|----------------|----------|
| `DATA-001` | Save version migration | Old save format upgraded correctly | 🟠 High |
| `DATA-002` | Corrupted save detection | Validation fails, user warned, game doesn't crash | 🔴 Critical |
| `DATA-003` | Missing save file handling | Graceful error, no crash | 🟠 High |
| `DATA-004` | Save during low storage (mobile) | Warning shown, save attempt graceful | 🟡 Medium |
| `DATA-005` | Power loss during save | Save file not corrupted (atomic write) | 🟠 High |
| `DATA-006` | 100-hour save file | File size reasonable (<5MB), load time acceptable | 🟡 Medium |

### 11.3 Automated Save/Load Cycle Test

```gml
/// @function test_save_load_cycle()
/// @description Automated test: save, modify state, load, verify state matches original
function test_save_load_cycle() {
    // Capture current state
    var _original_money = global.player_money;
    var _original_hearts = relationship_get_hearts("npc_spark");
    var _original_day = global.time_day;
    var _original_energy = global.player_energy;
    
    // Save
    save_game(99); // Test slot
    
    // Modify state
    global.player_money += 9999;
    relationship_add_points("npc_spark", 500);
    global.time_day = 99;
    global.player_energy = 0;
    
    // Load
    load_game(99);
    
    // Verify restoration
    var _errors = [];
    if (global.player_money != _original_money) array_push(_errors, "Money not restored");
    if (relationship_get_hearts("npc_spark") != _original_hearts) array_push(_errors, "Hearts not restored");
    if (global.time_day != _original_day) array_push(_errors, "Day not restored");
    if (global.player_energy != _original_energy) array_push(_errors, "Energy not restored");
    
    // Cleanup test save
    if (file_exists(SAVE_FILE_PREFIX + "99.json")) {
        file_delete(SAVE_FILE_PREFIX + "99.json");
    }
    
    if (array_length(_errors) == 0) {
        show_debug_message("✅ SAVE/LOAD CYCLE TEST PASSED");
    } else {
        show_debug_message("❌ SAVE/LOAD CYCLE TEST FAILED: " + string(array_length(_errors)) + " errors");
        for (var i = 0; i < array_length(_errors); i++) {
            show_debug_message("  ERROR: " + _errors[i]);
        }
    }
    
    return _errors;
}
```

---

## 12. BALANCE TESTING

### 12.1 Economy Balance

| Test Area | What to Measure | Healthy Range | Warning Signs |
|-----------|----------------|--------------|---------------|
| **Income vs. Expenses** | Net Cogs per season | Positive by Year 1 Autumn | Player bankrupt by Year 1 Winter |
| **Resource Availability** | Can player build first mech by Year 1 Autumn? | Yes, with moderate exploration | Player blocked on key resources |
| **Crafting Bottleneck** | Time spent gathering vs. building | 40% gather / 60% build | >60% gathering = tedious |
| **Shop Pricing** | Are shop prices fair? | Player can afford 1-2 items per visit | Everything too cheap (trivial) or too expensive (frustrating) |
| **Trade Route ROI** | Profit from trade runs | Positive but not game-breaking | Trade makes all other income irrelevant |

### 12.2 Combat Balance

| Test Area | What to Measure | Healthy Range | Warning Signs |
|-----------|----------------|--------------|---------------|
| **Raid Difficulty Curve** | Can player survive with current defenses? | Win ~80% of raids with preparation | <50% win rate = too hard; 100% = too easy |
| **Turret Effectiveness** | Kills per turret per raid | 3-8 enemies per turret | <2 = turrets feel useless; >15 = turrets do everything |
| **Mech Power Level** | Mech kills vs. turret kills | Mech is powerful but not solo solution | Mech trivializes all raids |
| **Defense Economy** | Cost to replace destroyed defenses | Affordable but significant | Free repairs (no stakes) or ruinous (punishing) |
| **Enemy Escalation** | Does difficulty match player capability? | Year 2 enemies require Year 2 tech | Year 2 enemies killable with Year 1 turrets |

### 12.3 Progression Balance

| Test Area | What to Measure | Healthy Range | Warning Signs |
|-----------|----------------|--------------|---------------|
| **Engineering XP Curve** | Level per game year | ~Level 3-4 by end of Year 1 | Level 8+ by Year 1 (too fast) or Level 2 (too slow) |
| **Blueprint Discovery Rate** | New blueprints per season | 1-3 per season | 0 (nothing new to build) or 10+ (overwhelming) |
| **Exploration Gating** | Are gates fair? | Player naturally reaches requirements | Player stuck for multiple seasons on one gate |
| **Maintenance Scaling** | Does maintenance become tedious? | Maintenance Bots reduce burden by Year 2 | 30+ machines, all manual maintenance (nightmare) |
| **"One More Day" Factor** | Does each day end with motivation? | Always 2-3 things pulling player forward | Nothing to look forward to; or too many demands |

### 12.4 Relationship Balance

| Test Area | What to Measure | Healthy Range | Warning Signs |
|-----------|----------------|--------------|---------------|
| **Time to Max Hearts** | Days to reach 10 hearts | 60-90 in-game days per NPC | <30 (too easy) or >150 (endless grind) |
| **Gift Economy** | Are "loved" gifts obtainable? | Findable with effort, not trivial | Loved gifts only from endgame areas |
| **Dialogue Variety** | Repeated lines per season | <10% repeat rate | Player sees same line 3+ times per season |
| **Heart Event Pacing** | Time between heart events | Every 10-20 days of interaction | Events cluster or have huge gaps |

### 12.5 Balance Spreadsheet

Maintain a balance spreadsheet (separate file) tracking:
- Resource costs for every recipe and blueprint
- XP tables and expected level curves
- Enemy stats vs. defense stats per game year
- Income and expense tracking per season
- NPC relationship point math

This spreadsheet is the **living balance document** — updated whenever values change in JSON data.

---

## 13. PLAYTEST PROTOCOL

### 13.1 Internal Playtesting (Derek)

| Session Type | Duration | Focus | Frequency |
|-------------|----------|-------|-----------|
| **Quick Loop Test** | 20 min (1 game day) | Does the daily loop feel good? | Daily during development |
| **Season Playthrough** | 2-3 hours | Full season experience, progression feel | Weekly during Alpha |
| **Feature Deep Dive** | 1-2 hours | Focus on one system (crafting, combat, relationships) | Per feature implementation |
| **Stress Test** | 30 min | Push limits — max enemies, max machines, edge cases | Weekly during Alpha |

### 13.2 External Playtesting

#### Recruitment
- Recruit 5-10 external playtesters for Beta
- Mix of: Harvest Moon fans, tower defense fans, general gamers, non-gamers (accessibility)
- NDA required for pre-release builds

#### Session Structure
1. **Pre-Session**: Provide build, test save files (if needed), feedback form
2. **Play Session**: 2-4 hours of unguided play
3. **Post-Session**: Complete feedback form + optional 30-minute debrief call
4. **Analysis**: Compile feedback, identify common issues, prioritize fixes

#### What to Observe/Ask
- **First Impressions**: What did the player notice first? Was the tutorial effective?
- **Confusion Points**: Where did the player get lost or confused?
- **Fun Moments**: What did the player enjoy most? What made them smile?
- **Frustration Points**: What made the player annoyed or want to quit?
- **Pacing**: Did time feel right? Too fast? Too slow?
- **Character Connection**: Which NPCs did they care about? Which felt flat?
- **Combat Engagement**: Was defense preparation satisfying? Were raids exciting?
- **"One More Day" Check**: At session end, did they want to keep playing?

### 13.3 Playtest Frequency

| Milestone | Internal Frequency | External Frequency |
|-----------|-------------------|-------------------|
| **Prototype** | Daily | None |
| **Alpha** | Weekly (structured) | None |
| **Early Beta** | Weekly | Monthly (small group, 3-5 people) |
| **Late Beta** | Bi-weekly | Bi-weekly (larger group, 8-10 people) |
| **Release Candidate** | Daily | Weekly (full group + new testers for fresh eyes) |

---

## 14. ACCEPTANCE CRITERIA

### 14.1 Per-Feature Acceptance Criteria

A feature is **DONE** when ALL of the following are true:

| Criteria | Description |
|----------|-------------|
| ✅ **Functional** | Feature works as described in the GDD |
| ✅ **Data-Driven** | Content is defined in JSON, not hardcoded |
| ✅ **Tested** | All related test cases pass |
| ✅ **No Critical/High Bugs** | Zero critical or high severity bugs |
| ✅ **Performance** | Meets FPS targets on all platforms |
| ✅ **Save Compatible** | Feature state saves and loads correctly |
| ✅ **Mobile Ready** | Works with touch input, meets mobile performance targets |
| ✅ **Integrated** | Works correctly with dependent systems (events fire, data flows) |
| ✅ **Art Approved** | All art assets pass the Art Consistency Review |

### 14.2 Per-Milestone Acceptance Criteria

#### Prototype ✅ Done When:
- [ ] Player can walk around one room
- [ ] Time passes (day/night cycle visible)
- [ ] One NPC follows a schedule and can be talked to
- [ ] One crafting recipe works (input → output)
- [ ] Basic inventory works (add, remove, view)
- [ ] Save/load works (save state, quit, reload, state restored)
- [ ] Basic HUD displays (time, energy)

#### Alpha ✅ Done When:
- [ ] Full Coppervale tilemap implemented
- [ ] All core NPCs present with schedules (Spark, Old Maren, Captain Harrow, Mayor Linden, Pip)
- [ ] Workshop stations functional (all 5, level 1)
- [ ] 10+ craftable items/machines
- [ ] One complete raid (tutorial raid)
- [ ] Basic tower defense functional (place turrets, enemies pathfind, turrets fire)
- [ ] Relationship system functional (gifts, hearts, basic dialogue)
- [ ] One exploration zone (The Hollow)
- [ ] Seasonal cycle working (visual change, NPC schedule change)
- [ ] HUD, inventory, crafting UI functional
- [ ] Save/load captures all implemented state
- [ ] FPS ≥ 60 on PC, ≥ 30 on mobile
- [ ] Zero critical bugs, <5 high bugs
- [ ] Data validation passes 100%

#### Beta ✅ Done When:
- [ ] All exploration zones accessible
- [ ] Full machine catalog buildable
- [ ] All NPC dialogue for Year 1 complete
- [ ] Full raid system with mech combat
- [ ] Romance system functional (all 6 candidates, heart events through confession)
- [ ] DEJIN fully implemented (all stages)
- [ ] All 4 festivals functional
- [ ] Sound and music integrated
- [ ] Mobile UI adaptation complete
- [ ] FPS targets met on all platforms
- [ ] Zero critical bugs, zero high bugs, <10 medium bugs
- [ ] Balance spreadsheet reviewed and approved
- [ ] External playtest feedback addressed

#### Release Candidate ✅ Done When:
- [ ] Full 3+ year story content complete
- [ ] All dialogue and quest content implemented
- [ ] All heart events for all romance candidates implemented
- [ ] Post-story sandbox content functional
- [ ] Polish pass complete (animations, SFX, juice)
- [ ] All platform testing passed
- [ ] Localization complete (if applicable)
- [ ] Zero critical bugs, zero high bugs, zero medium bugs
- [ ] <5 low bugs (documented, accepted)
- [ ] Performance targets met on all devices in testing matrix
- [ ] Save migration tested from Alpha → Beta → RC
- [ ] 10+ hours of external playtest with no new critical/high bugs

#### Gold ✅ Done When:
- [ ] All Release Candidate criteria met
- [ ] Platform certification passed (App Store / Google Play if applicable)
- [ ] Marketing materials ready (Steam page, screenshots, trailer)
- [ ] Final build signed off by Derek
- [ ] Zero known critical bugs
- [ ] Release notes prepared

---

## 15. RELEASE CHECKLIST

### 15.1 Pre-Release (1 week before)

- [ ] Final regression suite pass — 100% green
- [ ] Soak test — 4-hour idle, no memory growth
- [ ] All save slots tested — fresh game, mid-game load, late-game load
- [ ] All platforms tested — Windows, macOS, Linux, iOS, Android
- [ ] Performance validation — all targets met
- [ ] Data validation — 100% pass
- [ ] Dialogue validation — 100% pass
- [ ] Final balance review — no game-breaking exploits
- [ ] Final playtest session — no new issues

### 15.2 Release Day

- [ ] Build tagged in Git (`release/v1.0.0`)
- [ ] Builds created for all target platforms
- [ ] Store page assets uploaded (screenshots, description, trailer)
- [ ] First-day hotfix process prepared (can build and deploy within 2 hours)
- [ ] Community channels monitored for crash reports
- [ ] Crash reporting enabled in release build

### 15.3 Post-Release (First week)

- [ ] Monitor crash reports daily
- [ ] Collect player feedback from reviews and community
- [ ] Triage any new bugs
- [ ] Prepare hotfix if critical issues found
- [ ] Track key metrics: retention, play time, common quit points

---

# APPENDICES

---

## APPENDIX A: TEST CASE TEMPLATE

```
Test ID:     [SYSTEM-NNN]
Title:       [Clear description of what's being tested]
Priority:    [Critical / High / Medium / Low]
Precondition: [Required state before test — e.g., "Player has 5 Scrap Iron in inventory"]
Steps:
  1. [Action]
  2. [Action]
  3. [Action]
Expected:    [What should happen]
Actual:      [What actually happened — filled during testing]
Result:      [PASS / FAIL / BLOCKED]
Notes:       [Any additional context]
Linked Bug:  [Bug ID if failed]
```

---

## APPENDIX B: BUG REPORT TEMPLATE

```
Title:       [SYSTEM] Brief description of the bug
Severity:    [Critical / High / Medium / Low / Trivial]
Category:    [crash / gameplay / visual / audio / performance / data / save / narrative / balance / platform / ux]
Platform:    [PC-Win / PC-Mac / PC-Linux / iOS / Android] + device model
Build:       [Version number + build config]
Reproduction Rate: [Always / Often / Sometimes / Rarely / Once]

Steps to Reproduce:
  1. Start from [test save file or fresh game]
  2. [Step]
  3. [Step]
  4. [Step]

Expected Result:
  [What should happen]

Actual Result:
  [What actually happens]

Attachments:
  - [ ] Screenshot / Video
  - [ ] Save file
  - [ ] Log output

Additional Context:
  [Anything else relevant]
```

---

## APPENDIX C: PLAYTEST FEEDBACK FORM

```
Playtest Feedback — Ironveil [Version]
Date: [Date]
Tester: [Name/ID]
Platform: [PC / Mobile]
Session Duration: [Hours]
Save File Used: [Which test save or fresh start]

=== FIRST IMPRESSIONS ===
1. What was the first thing you noticed?
2. Was the tutorial/opening clear? (1-5)
3. What confused you in the first 30 minutes?

=== GAMEPLAY ===
4. What did you enjoy most?
5. What frustrated you?
6. Did the daily loop feel right? (1-5: too slow → too fast)
7. Did maintenance feel satisfying or tedious? (1-5)
8. Did crafting/building feel rewarding? (1-5)

=== COMBAT ===
9. Were raids exciting? (1-5)
10. Did defense preparation feel strategic? (1-5)
11. Was combat difficulty appropriate? (1-5: too easy → too hard)
12. Did mech combat feel weighty and fun? (1-5)

=== CHARACTERS ===
13. Which NPC did you connect with most? Why?
14. Which NPC felt flat or uninteresting?
15. Did dialogue feel natural? (1-5)
16. Did you pursue any romance? Which candidate?

=== PACING & PROGRESSION ===
17. Did you feel a sense of progress each day? (1-5)
18. Were there any points where you felt stuck?
19. At the end of your session, did you want to keep playing? (Yes/No)

=== TECHNICAL ===
20. Did you experience any crashes?
21. Did you notice any visual glitches?
22. Did the game feel smooth? (1-5)
23. Any UI elements that were hard to read or use?

=== OPEN FEEDBACK ===
24. What one thing would you change?
25. What one thing should never change?
26. Any other comments?
```

---

## APPENDIX D: REGRESSION TEST SUITE

The regression suite is a subset of all test cases that must pass before every milestone and major bug fix. Run in this order:

### Tier 1: Critical Path (Must pass — blocks release)
1. `STATE-001` through `STATE-010` (State machine)
2. `TIME-001` through `TIME-007` (Time system)
3. `SAVE-001` through `SAVE-003` (Core save/load)
4. `INV-001` through `INV-005` (Inventory basics)
5. `CRAFT-001`, `CRAFT-002`, `CRAFT-004` (Crafting core)
6. `NPC-001`, `NPC-006` (NPC basics)
7. `DLG-001`, `DLG-004`, `DLG-006` (Dialogue basics)
8. `TD-001`, `TD-003`, `TD-004`, `TD-005` (Combat core)
9. `WAVE-001`, `WAVE-005`, `WAVE-006` (Raid lifecycle)
10. Data Validation (automated — 100% pass)

### Tier 2: High Priority (Must pass for milestone)
11. All remaining High priority test cases
12. Dialogue Validation (automated)
13. Save/Load Cycle Test (automated)
14. Performance test `PERF-001`, `PERF-002`, `PERF-010`

### Tier 3: Full Suite (Run for release candidates)
15. All test cases across all categories
16. Full platform testing matrix
17. Soak tests
18. Balance review

---

*This Testing & QA Process Document is Phase 13 of the Ironveil Development Roadmap.*
*It completes the pre-production documentation suite.*
*With this document, all 13 phases are COMPLETE — Ironveil is ready for production.*

*— Forged by the Djinn, in service to Master Derek*
