# Lessons from March 13, 2026

## Subagent Task Delegation
- **Wren delivered 33 quests** exceeding 20-30 requirement - clear requirements yield results
- Parallel execution of 9+ subagents in one session is viable

## Game Architecture (TRAP)
- Separate system files scale better: RiversidePolice.js, BigCityPolice.js
- Equipment: 8 slots with skill-gated unlocks (Slot 2 requires Dual Wield)
- Law enforcement: 0-100 suspicion scale with behavioral patrol changes
- Money drain mechanics keep players engaged (hospital bills, home upkeep)

## Technical Lessons
- **DALL-E batch size:** Too many requests = timeouts + truncated files. Use smaller batches.
- **File save debug needed:** Some generated images truncating at 248 bytes
- **Git commit strategy:** Smaller, focused commits track progress better

## Design Decisions
- Starting town (Riverside) with full NPC schedules > generic docks
- Emotional hook (mom diagnosis, family villain twist) creates investment
- Equipment slots locked until skills acquired = progression incentive

## Bug Tracking
- P0-P2 priority system effective for categorizing issues
- Key fixes: NG+ global mutation, loadSaveData crash, PlayerSprite refs, status effects

## Documentation Value
- ASSET_STYLE_GUIDE with hex codes ensures consistency
- EQUIPMENT_SPEC and EQUIPMENT_LORE separate spec from flavor