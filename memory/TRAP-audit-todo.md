# TRAP Game - Comprehensive Audit TODO List

**Updated:** 2026-03-13  
**Status:** P0 100%, P1 ~85%, P2 ~60%

---

## ✅ COMPLETED - 45% TOTAL

### P0 CRITICAL (16/16) - 100%
- [x] NG+ global mutation - FLUX
- [x] loadSaveData crash - FLUX
- [x] playerSprite → player - FLUX
- [x] Memory leak - FLUX
- [x] Frozen status - FLUX
- [x] Economy events - CIRCUIT
- [x] Berserk + Unbreakable - CIRCUIT
- [x] ESC to close - PIXEL
- [x] Heat bar icons - PIXEL
- [x] Quantity input - PIXEL
- [x] Confirmation dialogs - PIXEL
- [x] Touch targets 48px - PIXEL
- [x] Status effect damage - CIRCUIT
- [x] Safehouse tiers - WREN
- [x] Win condition - WREN
- [x] Real-world gangs - WREN

### P1 HIGH (~85% complete)
Done:
- [x] ROI rebalance - CIRCUIT
- [x] HP scaling cap - CIRCUIT
- [x] Junkie steal - CIRCUIT (already existed)
- [x] Death handling - PIXEL
- [x] Buy Max - PIXEL
- [x] Null checks - PIXEL
- [x] Traveling Salesman gating - CIPHER
- [x] Rival NG+ scaling - CIPHER
- [x] Loyalty notifications - CIPHER
- [x] Adjacency sync - TOMOTHY
- [x] Unlock prerequisites - TOMOTHY
- [x] Naming standardization - TOMOTHY
- [x] Preferred drug bonus - CIRCUIT
- [x] Boss special attacks - CIRCUIT
- [x] EquipmentUI performance - CIRCUIT
- [x] Quest completion fix - FLUX
- [x] Pistol ammo - FLUX
- [x] Enemy AI - FLUX
- [x] Supplier dialogue - WREN
- [x] Quest-givers - WREN
- [x] Typo fix - WREN
- [x] Rank notifications - PIXEL
- [x] Sell All - PIXEL
- [x] EquipmentUI tabs - PIXEL

### P2 MEDIUM (~60% complete)
Done:
- [x] Removed atlas loading - MIRREN
- [x] Archived empty NPC folders - MIRREN
- [x] Audio fallback verified - PRISM
- [x] Archived empty gang folders - PRISM
- [x] Asset inventory - PRISM
- [x] Visual assets docs - MIRREN
- [x] Rank change notifications - PIXEL (moved to P1)
- [x] Sell All button - PIXEL (moved to P1)
- [x] EquipmentUI tabs - PIXEL (moved to P1)

---

## 🔴 P0 - COMPLETE

## 🟠 P1 - REMAINING

### Systems
- [ ] Add player death handling in combat (done but verify)
- [ ] Implement Junkie steal behavior (exists, verify)
- [ ] Apply preferred drug bonus to buyers (done)

### Code
- [ ] Use PlayerController throughout GameScene OR remove duplicate

### AI
- [ ] Add supplier loyalty notification (done)

---

## 🟡 P2 - REMAINING

### World (Tomothy)
- [ ] Expand The Maw connections
- [ ] Add faction reputation system (P3)
- [ ] Add neighborhood progression

### Code (Flux)
- [ ] Split GameScene.js (4800+ lines) - DONE (created managers!)
- [ ] Add input validation / bounds checking
- [ ] Fix duplicate tryMove()

### Narrative (Wren)
- [ ] Fix "Brownyan" typo (done)

### Quests
- [ ] Fix quest completion logic (done - Flux)

### AI (Cipher)
- [ ] Add enemy decision-making (done - Flux)
- [ ] Add boss special attacks (done - Circuit)
- [ ] Add NPC schedules

---

## 🟢 P3 LOW PRIORITY

- [ ] Add rank change notifications (done - moved to P1)
- [ ] Fix EquipmentUI tab switch performance (done)
- [ ] Add "Buy Max" button (done)
- [ ] Add faction reputation system
- [ ] Add weather/atmosphere
- [ ] Add "Beyond The Wall"
- [ ] Clarify starting location
- [ ] Adjust XP curve

---

## 📊 STATS

| Priority | Total | Done | % |
|----------|-------|------|---|
| P0 Critical | 16 | 16 | 100% |
| P1 High | 18 | 15 | 83% |
| P2 Medium | 20 | 12 | 60% |
| P3 Low | 12 | 4 | 33% |

**TOTAL: 47/66 (71%)**
