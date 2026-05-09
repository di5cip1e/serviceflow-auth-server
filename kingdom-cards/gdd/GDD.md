# Kingdom Cards - Game Design Document

**Version:** 1.0  
**Theme:** Fantasy/Medieval  
**Genre:** Dual-Deck Strategy Card Game

---

## 🎯 Elevator Pitch

**Clash Royale meets Kingdom (TV show) meets Slay the Spire** — but your deck is literally your kingdom.

Every card in your deck is deployed in two ways:
1. **Kingdom Mode (Passive)** — Cards occupy positions in your prison-kingdom, generating gold, happiness, and defense
2. **Battle Mode (Active)** — The same cards become combat units when you attack or defend

You can't use a card in both modes. Every card decision is a strategic tradeoff.

---

## 👥 Target Audience

- **Primary:** Mobile gamers 18-35 who enjoy deck-builders and idle games
- **Secondary:** Fans of Clash Royale, Clash of Clans, and Slay the Spire
- **Tertiary:** Casual collectors who enjoy visual customization

---

## 🔄 Core Game Loop

### Minute-to-Minute
1. **Check Kingdom** → Collect passive income (gold, food)
2. **Upgrade/Acquire** → Spend resources on new cards
3. **Optimize Decks** — Balance kingdom positions vs. battle deck
4. **Battle** → Attack rival kingdoms, defend against attackers
5. **Repeat**

### Long-Term Progression
- Unlock new card types and positions
- Build rarity collection
- Climb leaderboards
- Seasonal content and events

---

## 🏰 Kingdom System

### Position Slots (8 Total)

| Position | Required Types | Kingdom Effect |
|----------|----------------|----------------|
| **Throne** | Ruler | Determines title, base tax rate |
| **Military** | Nobility, Creatures | Army strength, patrol frequency |
| **Spiritual** | Clergy | Happiness gain, disaster resistance |
| **Treasury** | Peasants, Buildings | Gold generation rate |
| **Keep** | Defensive Buildings | Defense against attacks |
| **Court** | Decrees | Active policy bonuses |
| **Countryside** | Peasants, Farms | Food production |
| **Walls** | Defensive Buildings | Protection level |

### Position Unlocks
- Start with: Throne, Treasury (Day 1)
- Unlock: Countryside (Day 3), Spiritual (Day 7)
- Unlock: Military, Keep (Day 14)
- Unlock: Court, Walls (Day 30)

---

## ⚔️ Battle System

### Combat Flow
1. **Attack Selection** — Choose rival kingdom to attack
2. **Deploy Battle Deck** — Your 10-15 combat cards become units
3. **Auto-Battle** — Units fight automatically (Clash Royale style)
4. **Win/Lose** — Winner steals gold from loser

### Battle Rules
- **Lanes:** 3 lanes (left, center, right)
- **Elixir:** Cards cost elixir to play, regenerates over time
- **King Tower:** Destroy enemy king tower to win
- **4-minute timer** — Sudden death in final minute

### Stakes
- **Attack Win:** Steal 10-50 gold (scales with opponent rank)
- **Attack Lose:** Attacker loses 5-25 gold to defender
- **Defense Win:** Earn gold, defender keeps resources
- **Defense Lose:** Lose gold, attacker takes spoils

---

## 🃏 Card Database (Starter Pool: 30 Cards)

### Rarities
| Rarity | Distribution | Upgrade Potential |
|--------|--------------|-------------------|
| Common | 40% | +1 level per duplicate |
| Uncommon | 30% | +2 levels per duplicate |
| Rare | 18% | +3 levels per duplicate |
| Epic | 10% | +4 levels per duplicate |
| Legendary | 2% | +5 levels per duplicate |

### Card Types by Position

#### 👑 RULER (Throne)
| Name | Rarity | Kingdom Effect | Battle Effect |
|------|--------|----------------|---------------|
| Warden Whiskers | Legendary | Tax +25%, Title: "The Cat Lord" | Leader: +15% all unit stats |
| Boss Betty | Epic | Tax +20%, Title: "The Boss" | Leader: +10% all unit stats |
| Governor Griz | Rare | Tax +15%, Title: "Warden" | Leader: +5% all unit stats |
| Mayor Moe | Uncommon | Tax +10% | Leader buff |
| Keeper Kevin | Common | Tax +5% | Basic leader |

#### ⚔️ NOBILITY (Military)
| Name | Rarity | Kingdom Effect | Battle Effect |
|------|--------|----------------|---------------|
| Captain Ironjaw | Rare | Army: 5 units | Melee: High damage |
| Sgt. Bust-Through | Common | Army: 2 units | Melee: Medium damage |
| Guard Gertrude | Uncommon | Army: 3 units | Melee: Low damage |
| Warden Whiskers* | Legendary | Army: 8 units | Boss: Devastating |
| *Can fill Throne OR Military | | | |

#### ⛪ CLERGY (Spiritual)
| Name | Rarity | Kingdom Effect | Battle Effect |
|------|--------|----------------|---------------|
| Sister Solitaire | Epic | Happiness +30% | Healer: Restores units |
| Reverend Scoops | Uncommon | Happiness +15% | Healer: Light heal |
| Priest Peter | Common | Happiness +5% | Buff: +10% defense |
| Chaplain Chuck | Uncommon | Happiness +10% | Buff: Unit speed |

#### 🌾 PEASANTS (Treasury, Countryside)
| Name | Rarity | Kingdom Effect | Battle Effect |
|------|--------|----------------|---------------|
| Tunnel Terry | Common | Gold +10/turn | Swarm: 3 weak units |
| Shank-Shank | Rare | Gold +25/turn | Assassin: High damage, low HP |
| Chef Sack-O-Rice | Common | Food +15/turn | Support: Feeding buff |
| Farmer Frank | Uncommon | Gold +15, Food +10 | Swarm: 2 units |
| Miner Mike | Rare | Gold +30/turn | Siege: Destructures |

#### 🏰 BUILDINGS (Keep, Walls)
| Name | Rarity | Kingdom Effect | Battle Effect |
|------|--------|----------------|---------------|
| The Block | Uncommon | Defense +20 | Structure: Blocks 3 units |
| Yard Tower | Rare | Defense +35 | Structure: Ranged attacks |
| Stone Citadel | Epic | Defense +50 | Boss structure: Tank |
| Motte & Bailey | Common | Defense +10 | Basic structure |
| Blacksmith Bob | Uncommon | Defense +15, Army +1 | Repair: Heals structures |

#### 🐉 CREATURES (Military)
| Name | Rarity | Kingdom Effect | Battle Effect |
|------|--------|----------------|---------------|
| McFluff | Legendary | Guardian: +20 all | Boss: AoE fire, tank |
| Chimera Chomp | Epic | Guardian: +15 | Boss: Poison attacks |
| Griffin Greg | Rare | Guardian: +10 | Flying: Skips lanes |
| Wolfie | Common | Guardian: +5 | Fast: Low HP |

#### 📜 DECREES (Court)
| Name | Rarity | Kingdom Effect | Battle Effect |
|------|--------|----------------|---------------|
| FREE FOR ALL | Epic | -30% defense, +50% gold | Instant: All units go wild |
| LOCKDOWN | Rare | +40% defense | Instant: Freeze enemy 3s |
| SNITCH | Uncommon | +20% income | Instant: See enemy deck |
| AMNESTY | Common | +10% happiness | Instant: Heal all units 20% |

---

## 💰 Economy

### Currencies
| Currency | Source | Use |
|----------|--------|-----|
| **Gold** | Kingdom income, battles, dailies | Card packs, upgrades |
| **Gems** | Achievements, ads, purchased | Premium packs, speed-ups |
| **Food** | Countryside | Troop training (future) |

### Income Rates (Base)
- Per peasant: +5 gold/turn
- Per building: +10 gold/turn
- Ruler bonus: +5-25 gold/turn (rarity)
- Turn duration: 5 minutes real-time

### Acquisition
| Source | Cost | Notes |
|--------|------|-------|
| Daily Login | Free | 1 pack/day |
| Watch Ads | Free | 3 packs/day |
| Gold Packs | 100 gold | 5 cards, 1 guaranteed Uncommon+ |
| Gem Packs | 50 gems | 5 cards, 1 guaranteed Rare+ |
| Season Pass | $4.99/mo | Daily premium card, exclusive |
| Trading | Cards | Player marketplace |

### Progression
- **Level 1-10:** Unlocks positions, basic cards
- **Level 11-30:** Unlocks epics, trading
- **Level 31+:** Legendary acquisition, competitive

---

## 💎 Monetization

### Revenue Streams
1. **Season Pass** — $4.99/month
   - 30 exclusive cards (1/day)
   - Premium currency bonus
   - Exclusive crate

2. **Gem Pack** — $0.99-99.99
   - Premium currency
   - Value bundles

3. **VIP Tiers** — $9.99-49.99
   - Ad removal
   - Bonus gold daily
   - Exclusive avatar frame

### Conversion Strategy
- **Day 1-3:** Free packs hook player
- **Day 7:** First gem pack offer ($0.99)
- **Day 14:** Season pass popup (20% off first month)
- **Day 30:** Bundle offer (best value)

---

## 🎮 Technical

### Platform
- **Primary:** Android (APK)
- **Secondary:** iOS (future)
- **Engine:** React Native (mobile), Phaser (web)

### Scope
- **MVP:** 30 cards, 8 positions, basic battle
- **Post-MVP:** Events, clans, tournaments, guild wars

### Offline
- Kingdom generates offline (catch up on login)
- Battles require online connection

---

## 🗺️ Roadmap

### Phase 1: MVP (Month 1-2)
- [x] Core concept finalized
- [ ] GDD complete
- [ ] 12 demo cards
- [ ] Kingdom positions working
- [ ] Basic battle system
- [ ] 30 starter cards

### Phase 2: Polish (Month 3)
- [ ] Visual kingdom rendering
- [ ] Card synergies
- [ ] Leaderboards
- [ ] Trading system

### Phase 3: Live (Month 4+)
- [ ] Season 1 launch
- [ ] Events system
- [ ] Clans/guilds
- [ ] Tournament mode

---

## ✅ Success Metrics

- **DAU/MAU Ratio:** 40%+ (daily engagement)
- **Retention D1:** 60%+
- **Retention D7:** 30%+
- **Retention D30:** 15%+
- **ARPDAU:** $0.05+ (ad-supported)
- **Conversion:** 3%+ (free → paying)

---

*Document Version: 1.0*  
*Last Updated: 2026-03-24*