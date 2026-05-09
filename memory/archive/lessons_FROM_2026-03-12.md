# Lessons Learned - Week of March 12, 2026

## Bug Fixes
1. **Labs neighborhood check:** Used wrong variable (neighborhood.key → this.neighborhood)
2. **Buyer preferences +20%:** Circuit fixed the missing preference application
3. **Drug processing:** Flux fixed dropdown selection being ignored
4. **Traveling Salesman:** Fixed interactability issue

## Architecture Decisions
1. **Drug system:** 7 drug types with processing chains (Cocaine→Crack, Precursors→Meth)
2. **Economy events:** 10 dynamic events (5 negative/5 positive) with area-based demand
3. **Event timing:** Random events every 3-7 days, lasting 2-4 days
4. **Buyer AI:** React to events (raids reduce buyers by 70%, drought makes them paranoid)

## Agent Performance
1. **Designated sub-agents:** Using Pixel, Circuit, Flux, Mirren, Cipher, Tomothy, Prism, Quill, Wren - specific roles work better
2. **Verification → Bug Finding → Fix:** Proven workflow
3. **Parallel execution:** 5 sub-agents running audit simultaneously effective

## Code Quality
1. **Console.log cleanup:** Removed 136 statements - significant improvement
2. **Error handling:** Added localStorage error handling
3. **Duplicate code:** Fixed duplicate loadGame() in SaveLoadSystem.js

## Team Recognition
1. **MVP vote:** Team chose "THE DIRECTOR" as orchestrator (4 votes)
2. **Comprehensive audit:** Cover-to-cover before game completion - quality over speed
