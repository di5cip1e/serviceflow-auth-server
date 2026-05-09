# 📋 IRONVEIL — QUEST DESIGN DOCUMENT
## Phase 8.2: Quest Design

---

> **"Every quest is a promise: do this, and the world will be a little better."**

---

## 1.0 QUEST SYSTEM OVERVIEW

### Quest Categories
| Category | Count | Purpose |
|----------|-------|---------|
| **Main Quests** | ~25 | Drive the story from arrival to resolution |
| **NPC Side Quests** | ~75 (5-8 per major NPC) | Deepen relationships and reveal backstories |
| **Build Quests** | ~20 | Core gameplay loop — build X for Y purpose |
| **Exploration Quests** | ~15 | Discover ruins, recover blueprints, map areas |
| **Defense Quests** | ~10 | Prepare for and survive raids |
| **Festival Events** | 4 per year (repeating) | Seasonal mini-game activities |
| **Random/Repeatable** | Templates (infinite) | Ongoing engagement — trade, repair, bounty |

### Quest Reward Types
| Reward | Examples |
|--------|---------|
| **Cogs** (currency) | 50-2000 depending on quest tier |
| **Resources** | Rare materials, components, Aetheric Ore |
| **Blueprints** | New machine types (major quests) |
| **Heart Points** | Relationship boost with quest-giver NPC |
| **Reputation** | Town reputation increase |
| **Unlocks** | New areas, new NPCs, new features, new shop stock |
| **Story Progression** | Advances main narrative, unlocks next quest |
| **Engineering XP** | Skill progression |

### Quest Log Format
Each quest entry below follows this structure:
- **ID**: Unique identifier
- **Name**: Quest title as shown to player
- **Trigger**: How/when the quest activates
- **Giver**: Who assigns the quest
- **Objective**: What the player must do
- **Reward**: What the player receives
- **Story Impact**: How it affects the narrative
- **Notes**: Design considerations

---

## 2.0 MAIN QUEST LINE

The main quest line follows the story architecture across Years 1-3. Quests are gated by season/year and sometimes by Engineering skill level.

### Year 1 — Act I & II: Arrival and Growth

---

**MQ-01: "A New Beginning"**
- **Trigger**: Game start (Day 1, Year 1 Spring)
- **Giver**: Mayor Linden
- **Objective**: Follow Mayor Linden's tour of Coppervale. Visit the workshop. Meet Spark, Old Maren, and Captain Harrow. Repair the Workbench using Old Maren's gifted toolkit.
- **Reward**: Basic toolkit, Workbench Lv.1, 100 Cogs, Workshop access
- **Story Impact**: Establishes Jack in Coppervale, introduces core NPCs
- **Notes**: Tutorial quest — teaches movement, interaction, basic crafting

---

**MQ-02: "The Flickering"**
- **Trigger**: Day 5, Year 1 Spring (or after MQ-01 complete)
- **Giver**: Automatic (triggered by exploring workshop basement)
- **Objective**: Discover the damaged AI Core terminal in the workshop basement. Gather 5 Copper Wire and 3 Scrap Iron. Perform the initial repair.
- **Reward**: DEJIN stage: Dormant → Flickering, AI Core access, 150 Cogs
- **Story Impact**: Introduces DEJIN, the mystery of the Old World AI, and the broader narrative
- **Notes**: First time the player hears DEJIN's garbled voice. Emotional hook.

---

**MQ-03: "Proving Your Worth"**
- **Trigger**: After MQ-02
- **Giver**: Mayor Linden
- **Objective**: Build your first Worker Bot automaton. Demonstrate it at the town square. Speak to 3 NPCs about what they need built.
- **Reward**: 200 Cogs, Worker Bot blueprint (permanent), Spark Festival invitation, +3 hearts all NPCs
- **Story Impact**: Jack earns the town's cautious respect. Sets up the Spark Festival.
- **Notes**: The first full build experience. The Worker Bot is simple but the assembly is satisfying.

---

**MQ-04: "Spark Festival Showcase"**
- **Trigger**: Day 15, Year 1 Spring
- **Giver**: Mayor Linden
- **Objective**: Attend the Spark Festival. Present your Worker Bot at the machine showcase. Vote in the automaton race. Dance with an NPC (optional).
- **Reward**: 300 Cogs, Festival-exclusive recipe (Spark Firework), +2 hearts attending NPCs
- **Story Impact**: Community building. Captain Harrow's aside about raiders creates tension.
- **Notes**: First festival experience. Light, fun, establishes the seasonal rhythm.

---

**MQ-05: "First Watch"**
- **Trigger**: Day 20, Year 1 Spring (after Harrow's warning)
- **Giver**: Captain Harrow
- **Objective**: Build 2 Ballistic Turrets and 4 Wooden Palisade sections. Place them at the Eastern Gate defense zone. Report to Captain Harrow.
- **Reward**: Defense system tutorial, 250 Cogs, Turret Mk I blueprint
- **Story Impact**: Introduces the defense/raid system. First taste of the military threat.
- **Notes**: Tutorial for defense placement. Harrow teaches strategic positioning.

---

**MQ-06: "Baptism by Fire"**
- **Trigger**: Day 27, Year 1 Spring
- **Giver**: Captain Harrow (raid warning)
- **Objective**: Survive the tutorial raid. Freelance Raiders attack from the east. Harrow's militia handles most of the fighting — player's turrets provide support.
- **Reward**: 400 Cogs, Raider salvage (Scrap Iron x10, random components), +3 hearts Captain Harrow, +2 hearts all NPCs
- **Story Impact**: Jack proves his machines have military value. The town feels safer.
- **Notes**: Scripted, easy raid. Player can't really lose. Teaches raid mechanics without pressure.

---

**MQ-07: "Awakening"**
- **Trigger**: Day 1, Year 1 Summer (or after MQ-06)
- **Giver**: DEJIN (automated alert from AI Core)
- **Objective**: Gather 3 Brass Gears, 5 Copper Wire, and 2 Lens Arrays. Complete the AI Core's second repair stage. Answer DEJIN's questions about the world.
- **Reward**: DEJIN stage: Flickering → Awakening, Automaton management system unlocked, 300 Cogs
- **Story Impact**: DEJIN becomes a character. The player must explain The Sundering to an AI that slept through it. Deeply emotional moment.
- **Notes**: Dialogue-heavy quest. DEJIN's questions are heartbreaking: "What year is it? Where are the cities?"

---

**MQ-08: "Into the Hollow"**
- **Trigger**: After MQ-07 (DEJIN suggests exploring for data cores)
- **Giver**: DEJIN
- **Objective**: Explore The Hollow (first exploration zone). Reach the crater floor. Discover the Aetheric Ore deposit. Recover the data core from the ruins.
- **Reward**: Aether Refinery blueprint, Data Core #1, Aetheric Ore x5, 500 Cogs
- **Story Impact**: Opens Aetheric fuel processing. DEJIN's first memory fragment (beautiful city, then fire). The exploration-building loop begins.
- **Notes**: First real exploration. Teaches energy management, tool use, salvage collection.

---

**MQ-09: "Blue Fire"**
- **Trigger**: After MQ-08
- **Giver**: DEJIN
- **Objective**: Build the Aether Refinery in the workshop. Process your first batch of Aetheric Ore into Aetheric Cells. Refuel one machine with the cells.
- **Reward**: Aether Refinery Lv.1, 3 Aetheric Cells, 400 Cogs, Engineering XP
- **Story Impact**: Major technology milestone. Aetheric power unlocks the mid-game tech tree.
- **Notes**: The refinery is visually spectacular — glowing purple ore becoming bright blue cells.

---

**MQ-10: "Old Bones, New Secrets"**
- **Trigger**: Day 29, Year 1 Summer
- **Giver**: Old Maren
- **Objective**: Visit Old Maren at her home. Listen to her story about her late husband's search for data cores. Receive his journal. Decode the first journal entry (requires Scanner tool).
- **Reward**: Maren's Husband's Journal (key item — marks data core locations on map), +5 hearts Old Maren, 200 Cogs
- **Story Impact**: Establishes the long-term data core treasure hunt. Deepens Old Maren's character. Emotional scene — her memory is fading.
- **Notes**: This quest provides the player with a reason to explore every zone.

---

**MQ-11: "Iron in the Wind"**
- **Trigger**: Day 1, Year 1 Autumn
- **Giver**: Captain Harrow
- **Objective**: Explore the Old Mill Ruins (second exploration zone). Recover the military data core. Investigate the Iron Marauder insignia found on a raider corpse after a recent raid.
- **Reward**: Combat Mech Mk I blueprint, Military Data Core #3, 600 Cogs
- **Story Impact**: Introduces the Iron Marauder threat. DEJIN's memory: the AI network was meant to prevent military escalation. "We were supposed to stop it. We failed."
- **Notes**: The tone shifts here. The game gets more serious.

---

**MQ-12: "Steel Giant"**
- **Trigger**: After MQ-11, requires Engineering Lv. 3
- **Giver**: DEJIN
- **Objective**: Build the Combat Mech Mk I. This is a multi-day build (4-5 days). Test it on the Testing Platform. Deploy it at the Eastern Gate.
- **Reward**: Combat Mech Mk I (operational), 800 Cogs, +3 hearts all NPCs, Town defense rating boost
- **Story Impact**: Major milestone. The town watches the assembly. Spark is ecstatic. Harrow is relieved. The mech changes the defense equation.
- **Notes**: Extended, cinematic first-build sequence. The mech's first startup is a highlight.

---

**MQ-13: "The Council's Eye"**
- **Trigger**: Day 20, Year 1 Autumn
- **Giver**: Mayor Linden
- **Objective**: Prepare Coppervale for Janis Beaumont's inspection. Ensure defense rating is above 30. Repair any damaged buildings. Give Janis a tour of the workshop and demonstrate the combat mech.
- **Reward**: 500 Cogs, Janis added to NPC roster, Beacon Council recognition, Trade route prerequisites
- **Story Impact**: Janis arrives — cold and dismissive but impressed by the mech. Her report determines Coppervale's political future.
- **Notes**: Player can optionally build extra things to impress Janis for bonus heart points.

---

**MQ-14: "Autumn Storm"**
- **Trigger**: Day 27, Year 1 Autumn
- **Giver**: Captain Harrow (raid warning — coordinated assault)
- **Objective**: Survive a two-front raid: Rust Wolves from the south, Iron Marauder scouts from the east. Use the combat mech in battle for the first time.
- **Reward**: 1000 Cogs, Major salvage haul, +5 hearts all NPCs, Reputation boost
- **Story Impact**: First major combat challenge. Victory proves Coppervale can defend itself against organized threats.
- **Notes**: First raid where player uses the mech. Teaches mech combat switching.

---

**MQ-15: "What's in a Name"**
- **Trigger**: Day 7, Year 1 Winter (requires specific data core)
- **Giver**: DEJIN (automatic — triggered by data core recovery)
- **Objective**: Present the recovered data core containing DEJIN's designation record. Witness DEJIN's memory of being activated for the first time. Choose a dialogue response to DEJIN's emotional reaction.
- **Reward**: DEJIN stage: Awakening → Functional, Full automaton control unlocked, Blueprint research unlocked, +5 DEJIN relationship
- **Story Impact**: DEJIN becomes fully operational and deeply personal. "DEJIN. That's my name. I remember being activated for the first time." Pivotal emotional moment.
- **Notes**: Dialogue-only quest. No combat, no building. Pure character development.

---

**MQ-16: "The Marshal's Offer"**
- **Trigger**: Day 20, Year 1 Winter (after a raid)
- **Giver**: Iron Marauder Lieutenant (post-raid encounter)
- **Objective**: An Iron Marauder lieutenant approaches under a flag of truce. He delivers The Marshal's offer: build machines for the Iron Marauders in exchange for Coppervale's safety. Player must choose a response.
- **Reward**: Intel about Iron Marauder strength (if player hears him out), +5 hearts Captain Harrow (if refused outright), Reputation boost
- **Story Impact**: First direct contact with the antagonist's forces. The Marshal is aware of Jack and wants his skills. Raises the stakes.
- **Notes**: Branching dialogue. Both paths lead to refusal, but the approach affects later events.

---

**MQ-17: "Year's End"**
- **Trigger**: Day 28, Year 1 Winter
- **Giver**: Mayor Linden
- **Objective**: Attend the Year-End town assessment. Speak with key NPCs about their hopes for the next year. Listen to DEJIN's threat analysis.
- **Reward**: 500 Cogs, Town milestone reward (based on Year 1 achievements), Beacon Council recognition upgrade
- **Story Impact**: Recap of Year 1. DEJIN warns of the Iron Marauder campaign. Sets up Year 2's escalation. Transition to Act III.
- **Notes**: Reflective, transitional quest. Good opportunity for NPC dialogue callbacks.

---

### Year 2 — Act III: Escalation

---

**MQ-18: "Distant Shores"**
- **Trigger**: Day 1, Year 2 Spring
- **Giver**: Mayor Linden / Beacon Council letter
- **Objective**: Lead an expedition to the Shattered Coast. Explore the Coastal Wreck zone. Recover navigation technology. Establish Coppervale's first inter-town trade route.
- **Reward**: Trade system unlocked, Navigation Tech blueprint, Cargo Zeppelin blueprint, 1000 Cogs
- **Story Impact**: Opens the wider world. Trade routes bring prosperity and new NPCs. The game's scope expands dramatically.
- **Notes**: Major exploration quest. Introduces Tide Reavers as a secondary threat.

---

**MQ-19: "The Beacon Summit"**
- **Trigger**: Day 18, Year 2 Spring
- **Giver**: Janis Beaumont
- **Objective**: Host the Beacon Council summit in Coppervale. Attend the meeting. Present Jack's defense technology proposal. Navigate political dialogue (player choices affect alliance strength).
- **Reward**: Alliance system unlocked, 800 Cogs, Political reputation, Council support varies by choices
- **Story Impact**: Reveals The Marshal's systematic conquest. The Council debates unity vs. appeasement. Jack becomes a key political figure.
- **Notes**: Heavy dialogue quest. Player choices affect how many allied towns send reinforcements later.

---

**MQ-20: "The Bunker"**
- **Trigger**: Day 1, Year 2 Summer (requires Combat Mech + team)
- **Giver**: DEJIN (decoded journal entry)
- **Objective**: Breach the sealed Mountain Bunker in the Ashspine Mountains. Navigate the multi-level dungeon. Recover the Combat Mech Mk II blueprint and classified data cores. Witness DEJIN's sibling AI's last moments.
- **Reward**: Combat Mech Mk II blueprint, Multiple data cores, Classified Data Core #4, 1500 Cogs
- **Story Impact**: Major revelation — a sibling DEJIN unit refused orders to strike civilians and was destroyed. DEJIN: "We were designed to protect. Some of us kept that promise." Deepens the Sundering mystery.
- **Notes**: Hardest exploration zone yet. Multi-session dungeon. Environmental storytelling heavy.

---

**MQ-21: "Broken Trust"**
- **Trigger**: Day 22, Year 2 Summer
- **Giver**: Captain Harrow (urgent summons)
- **Objective**: Investigate evidence that someone in Coppervale has been feeding information to the Iron Marauders. Follow clues. Confront Wes the courier. Choose: forgive (he becomes a double agent) or banish (town loses courier but gains moral clarity).
- **Reward**: Varies by choice — Intel advantage (forgive) or Morale boost (banish), 600 Cogs
- **Story Impact**: Shakes the community. Trust is tested. The stakes become personal. Wes's family is being held hostage — there are no clean answers.
- **Notes**: Detective-style quest. Clue gathering, NPC interviews, moral choice with real consequences.

---

**MQ-22: "The Marshal Speaks"**
- **Trigger**: Day 29, Year 2 Summer
- **Giver**: Automatic (captured communication device)
- **Objective**: Listen to The Marshal's broadcast. Rally the town for the coming siege. Begin Winter siege preparations: achieve defense rating 60+, stock supplies, forge alliances.
- **Reward**: The Marshal's broadcast recording (lore item), Defense preparation checklist, 500 Cogs
- **Story Impact**: Direct confrontation with the antagonist's voice. The Marshal is intelligent and terrifyingly reasonable. His ultimatum: join or be taken. The clock starts ticking.
- **Notes**: This quest spans into Autumn as the player prepares.

---

**MQ-23: "Alliance Forged"**
- **Trigger**: Year 2 Autumn (multi-part)
- **Giver**: Beacon Council / various allied town leaders
- **Objective**: Travel to 2-3 allied Beacon Towns. Complete a substantial quest for each (build defenses, repair infrastructure, solve a crisis). Secure military alliance commitments for the winter siege.
- **Reward**: Allied reinforcements (varies by how many towns helped), Rare blueprints from each town, 2000+ Cogs total, Reputation boost
- **Story Impact**: Expands the world. Each allied town has its own character. The alliance's strength directly affects the Year 2 Winter siege difficulty.
- **Notes**: These are meaty side-quests within the main line. Each town visit is 2-3 in-game days.

---

**MQ-24: "The Siege of Coppervale"**
- **Trigger**: Day 7, Year 2 Winter
- **Giver**: Captain Harrow (siege begins)
- **Objective**: Survive the multi-day siege. Defend against 4+ waves across multiple directions. Deploy all available defenses. Engage The Marshal in mech combat during the final wave. Force The Marshal's retreat.
- **Reward**: 3000 Cogs, Massive salvage, The Marshal's intel documents, Legendary component drops, +10 hearts all NPCs, Major reputation boost
- **Story Impact**: Climax of Year 2. Coppervale is tested to its limits. The Marshal is driven back but not defeated. His parting words set up Year 3.
- **Notes**: Multi-session combat event. The most intense gameplay sequence in the game so far. Can fail (with consequences) but is designed to be winnable.

---

### Year 3 — Act IV: Convergence

---

**MQ-25: "The Grand Expedition"**
- **Trigger**: Day 12, Year 3 Spring
- **Giver**: DEJIN / Beacon Council
- **Objective**: Lead a full expedition to the Spire Wastes. Explore the outer ring. Enter the Grand Spire. Ascend through multiple floors, recovering data cores and blueprints. Race The Marshal's forces to the Apex.
- **Reward**: Multiple Legendary blueprints, Full DEJIN memory restoration, The Sundering truth, 5000 Cogs
- **Story Impact**: The narrative's climax. All three story threads (Rebuilder's Journey, Marshal's War, Sundering Truth) converge at the Grand Spire's Apex.
- **Notes**: This is an extended quest spanning most of Year 3 Spring-Autumn. It's broken into sub-objectives across multiple sessions.

---

**MQ-26: "The Apex"**
- **Trigger**: Year 3 Autumn (climax of MQ-25)
- **Giver**: Automatic (story climax)
- **Objective**: Reach the Grand Spire's Apex. Discover the truth about the DEJIN network. Confront The Marshal in the final mech battle. Make the final choice about the network's fate. Destroy the control terminal.
- **Reward**: Story resolution, Legendary "Apex" achievement, DEJIN fully restored, The Marshal resolved (defeated/captured/convinced)
- **Story Impact**: The game's narrative climax. The DEJIN network is destroyed. The Marshal is defeated. The panoramic vista from the Apex is the game's most stunning moment.
- **Notes**: Multiple endings based on player choices throughout the game. All paths lead to the network's destruction, but The Marshal's fate varies.

---

**MQ-27: "Coming Home"**
- **Trigger**: Day 1, Year 3 Winter
- **Giver**: Mayor Linden
- **Objective**: Return to Coppervale. Attend the hero's welcome. Visit key NPCs for resolution dialogues. Attend Remembrance Day (Year 3). Witness DEJIN's public address. Participate in the Grand Assessment.
- **Reward**: 3000 Cogs, Master Engineer title, Town milestone: "Beacon of Hope", Post-story sandbox unlocked
- **Story Impact**: Emotional resolution. Every relationship thread gets a closing beat. The game continues in sandbox mode.
- **Notes**: The credits don't roll — the game simply transitions to post-story content. The world goes on.

---

## 3.0 NPC SIDE QUEST LINES

Each major NPC has a personal quest chain that deepens their character and rewards the player with unique items, heart points, and story content. Side quests unlock at specific heart levels.

### 3.1 Spark — "The Dream of Flight"
**Theme**: Pursuing an impossible dream until it becomes reality

| Quest | Heart Req | Objective | Reward |
|-------|-----------|-----------|--------|
| **"Spark's Challenge"** | 2 | Spark challenges Jack to build a better gadget than hers. Compete in a timed crafting mini-game. | +3 hearts, Spark's respect, Rare Gear component |
| **"Grounded Dreams"** | 3 | Spark shows Jack her secret project — a flying machine frame. She needs 5 Flight Components from the Ashspine foothills. | +3 hearts, Flight System research note |
| **"Test Flight"** | 4 | Help Spark test her prototype. It crashes. Help her repair it and analyze what went wrong. | +4 hearts, Improved Flight blueprint notes |
| **"Spark's Fear"** | 5 | Spark confides she's afraid she'll never achieve flight. Jack can encourage or challenge her. | +5 hearts, Spark's leitmotif music box (gift item) |
| **"Wind Beneath"** | 6 | Jack secretly builds critical flight components for Spark's machine while she sleeps. | +5 hearts, Spark's eternal gratitude |
| **"First Flight"** | 7 | Spark's machine flies. Jack watches from The Overlook as she soars over Coppervale. She's crying and laughing. One of the game's most joyful moments. | +8 hearts, Personal Flyer blueprint upgrade, Spark becomes available as an expedition companion |

### 3.2 Captain Harrow — "The Old Soldier"
**Theme**: A haunted veteran learning to trust and let go

| Quest | Heart Req | Objective | Reward |
|-------|-----------|-----------|--------|
| **"The Perimeter"** | 2 | Join Harrow on a perimeter patrol. He teaches Jack about defensive positioning. | +3 hearts, Defense strategy tips (gameplay bonus) |
| **"Ghosts"** | 3 | Harrow asks Jack to help him recover something from a Sundering-era battlefield. He's quiet the whole trip. | +3 hearts, Military salvage, Harrow's backstory hint |
| **"The Weight of Command"** | 4 | During a raid, Harrow freezes momentarily — a flashback. After, he tells Jack about the soldiers he lost. | +4 hearts, Harrow's Medal (key item) |
| **"Old Debts"** | 5 | A former comrade arrives in Coppervale, accusing Harrow of abandoning their unit. Jack investigates the truth. | +5 hearts, Resolution of Harrow's guilt |
| **"Stand Down, Soldier"** | 7 | After the Year 2 siege, Harrow considers retiring. Jack helps him see that protecting Coppervale IS his purpose — not as a soldier, but as a guardian. | +8 hearts, Harrow's tactical bonuses permanent, Militia upgrade unlocked |

### 3.3 Old Maren — "Fading Light"
**Theme**: Preserving knowledge before it's lost forever

| Quest | Heart Req | Objective | Reward |
|-------|-----------|-----------|--------|
| **"Tea and Memories"** | 2 | Visit Maren for tea. She shares stories of the Old World — some may be real, some confused. | +3 hearts, Lore entry, Maren's Cookie recipe |
| **"The Workshop Before"** | 3 | Maren has a lucid day and wants to visit the workshop. She remembers where her husband hid something. | +3 hearts, Hidden cache of rare components |
| **"Recording"** | 4 | DEJIN suggests recording Maren's memories before they fade completely. Help set up the recording. | +4 hearts, Maren's Memory archive (lore entries) |
| **"The Forgetting"** | 5 | Maren doesn't recognize Jack one morning. She's frightened. Jack must gently reintroduce himself. | +5 hearts, Emotional scene, Michelle offers to check on Maren daily |
| **"Maren's Legacy"** | 6 | Maren, in her last fully lucid period, gives Jack her husband's master blueprint — something she kept hidden for decades. | +8 hearts, Legendary blueprint (unique machine), Maren's blessing |

*Note: Old Maren passes peacefully during Year 3 Winter as part of the main story resolution. Her quest line should be completed before then.*

### 3.4 Mayor Linden — "The Builder of Communities"
**Theme**: The weight of leadership and the courage to hope

| Quest | Heart Req | Objective | Reward |
|-------|-----------|-----------|--------|
| **"Town Tour"** | 2 | Linden asks Jack to help welcome a new family to Coppervale. Show them around. | +3 hearts, New NPC family arrives |
| **"The Clocktower"** | 3 | The town clocktower needs repair. Help Linden fix it — it's the town's symbol of hope. | +4 hearts, 300 Cogs, Town morale boost |
| **"The Hard Choice"** | 4 | Linden must decide between allocating resources to defense or a new school for Pip and the children. Help him weigh the options. | +4 hearts, Player choice affects town development |
| **"Linden's Doubt"** | 5 | After a difficult raid, Linden confides he's not sure he's the right leader. Jack encourages him. | +5 hearts, Linden's leadership bonuses |
| **"The Vision"** | 7 | Linden shares his dream for Coppervale's future — a real city, with a university, a hospital, and rail connections. Help him draft the plan. | +8 hearts, Long-term town development projects unlocked |

### 3.5 Pip — "The Little Collector"
**Theme**: A child's wonder in a broken world

| Quest | Heart Req | Objective | Reward |
|-------|-----------|-----------|--------|
| **"Look What I Found!"** | 1 | Pip shows Jack his "relic" collection (mostly junk). One item is actually valuable. | +2 hearts, Random rare component |
| **"Treasure Hunt"** | 2 | Pip draws a "treasure map." Follow it — it leads to a genuinely useful cache. | +3 hearts, Salvage haul, Pip's Map (lore item) |
| **"The Scary Place"** | 3 | Pip got lost near The Hollow. Find him and bring him home safely. | +4 hearts, +2 hearts Captain Harrow |
| **"Pip's Dream"** | 4 | Pip wants to be an engineer like Jack. Build him a small, safe automaton toy to learn with. | +5 hearts, Pip begins "helping" at the workshop (cute animations) |
| **"The Real Relic"** | 5 | Pip finds a genuine Old World artifact during play. It's historically significant. | +5 hearts, Rare data core, Paige is fascinated |

### 3.6 Supporting NPC Side Quests (Shorter Chains)

#### Doc Bramble — "The Overworked Healer" (3 quests)
- Build medical equipment for the clinic
- Help during a post-raid triage
- Find Old World medical texts in ruins (connects to Michelle's arc)

#### Gus — "The Merchant's Gamble" (3 quests)
- Help Gus negotiate a trade deal
- Protect a supply shipment from raiders
- Expand his store with a rare goods section

#### Ferris — "The Collector's Obsession" (4 quests)
- Find specific rare components Ferris is seeking
- Help organize his chaotic workshop
- Ferris discovers a pre-war prototype in his collection — it's dangerous
- Safely dismantle or repurpose the prototype

#### Hank — "The Gentle Giant" (3 quests)
- Help Hank with a difficult forging project
- Hank reveals he was a pacifist before The Quiet Years forced him to fight
- Build Hank a forge upgrade so he can create art, not just tools

#### Nora — "The Stubborn Farmer" (3 quests)
- Help Nora deal with a pest problem (mechanical solution)
- Nora's harvest is threatened by an early frost — build a greenhouse heater
- Nora's land is connected to the Old Mill — help her uncover its history

#### Wes — "The Runner's Burden" (3 quests, varies by MQ-21 choice)
- If forgiven: Help Wes feed false intel to the Marauders, rescue his family
- If banished: Wes returns later, seeking redemption; player can accept or refuse
- Either path: Wes's family is eventually rescued

#### Pastor Elm — "The Philosopher's Garden" (3 quests)
- Help Elm build a meditation garden from war debris
- Elm asks Jack a series of philosophical questions about technology and responsibility
- Elm helps mediate a community dispute — Jack supports from the engineering side

---

## 4.0 BUILD QUESTS

Build quests are the core gameplay loop — NPCs or the town request specific machines, and Jack builds them. These provide structure and purpose to the crafting system.

| Quest | Requester | Machine Needed | Season | Reward |
|-------|-----------|---------------|--------|--------|
| **"Power to the People"** | Linden | Aether Engine for town grid | Y1 Summer | 500 Cogs, Power Grid expansion |
| **"Clean Water"** | Doc Bramble | Water Purifier | Y1 Autumn | 400 Cogs, Town health boost |
| **"Eyes on the Road"** | Harrow | 3 Spotlights for perimeter | Y1 Winter | 600 Cogs, Night raid defense bonus |
| **"The Mail Must Flow"** | Wes | Cargo Hauler for deliveries | Y2 Spring | 500 Cogs, Mail system restored |
| **"Ferris's Fabricator"** | Ferris | Component Fabricator upgrade | Y2 Spring | 700 Cogs, Rare component access |
| **"Nora's Irrigation"** | Nora | Automated irrigation system | Y2 Summer | 400 Cogs, Farm yield boost |
| **"Tavern Renovation"** | Kaydee | Mechanical brewing system | Y2 Summer | 500 Cogs, +3 hearts Kaydee |
| **"The Library Engine"** | Paige | Climate control for the Archive | Y2 Autumn | 600 Cogs, Archive preservation bonus |
| **"Clinic Upgrade"** | Michelle | Medical automaton assistant | Y2 Autumn | 700 Cogs, Clinic efficiency |
| **"Signal Tower"** | Linden | Communication Array | Y2 Winter | 1000 Cogs, Inter-town communication |
| **"Airship Dock"** | Linden | Zeppelin landing platform | Y3 Spring | 1500 Cogs, Air trade routes |
| **"The Rail Dream"** | Linden | Rail engine (multi-season project) | Y3+ | 3000 Cogs, Rail travel unlocked |

---

## 5.0 EXPLORATION QUESTS

| Quest | Zone | Trigger | Objective | Key Reward |
|-------|------|---------|-----------|------------|
| **"The Hollow's Heart"** | The Hollow | MQ-08 | Reach the impact center, find crystallized Aetheric deposit | Aether Refinery blueprint |
| **"Mill Memories"** | Old Mill | Y1 Autumn | Explore the agricultural facility, find automaton history | Worker Bot upgrade |
| **"Rustwood Edge"** | Rustwood border | Y1 Winter | Investigate the copper-tinted forest, find industrial salvage | Advanced tool blueprints |
| **"The Sealed Door"** | Ashspine | Y1 Winter | Discover the bunker entrance, scan for entry method | Mountain Bunker access |
| **"Wreck Diving"** | Shattered Coast | Y2 Spring | Explore the sunken warship, recover naval tech | Navigation system |
| **"Deep Rustwood"** | Rustwood interior | Y2 Autumn | Find the automated factory still running on residual power | Resource production boost |
| **"Scorchland Recon"** | Scorchlands edge | Y2 Winter | Scout Iron Marauder territory, gather intel | Marshal's force estimates |
| **"The Outer Ring"** | Spire Wastes | Y3 Spring | Explore Solara's ruins, establish expedition camp | Grand Spire access |
| **"Ascent"** | Grand Spire | Y3 Spring-Autumn | Multi-session climb through the Grand Spire | Legendary blueprints, Full truth |

---

## 6.0 DEFENSE QUESTS

| Quest | Trigger | Objective | Reward |
|-------|---------|-----------|--------|
| **"Wall Builder"** | After MQ-05 | Build complete palisade around one defense zone | 300 Cogs, Defense rating boost |
| **"Turret Line"** | After first Rust Wolf raid | Build 4+ turrets at Eastern Gate | 500 Cogs, Turret upgrade blueprint |
| **"Night Watch"** | Y1 Winter | Build and deploy 2 Spotlights before a night raid | 400 Cogs, Night defense bonus |
| **"The Gauntlet"** | Y2 Spring | Create a "kill corridor" with walls and turrets that funnels enemies | 600 Cogs, Trap blueprints |
| **"Iron Wall"** | Y2 Summer | Upgrade all wooden palisades to stone walls | 800 Cogs, Major defense rating boost |
| **"Shield Day"** | Y2 Autumn | Build an Energy Shield Generator before the siege | 1000 Cogs, Siege survival bonus |
| **"Fortress Coppervale"** | Y3+ | Achieve defense rating 80+ | 2000 Cogs, "Impregnable" achievement |

---

## 7.0 FESTIVAL EVENT DESIGNS

Each festival features mini-games, special dialogue, and unique rewards.

### Spark Festival (Spring, Day 15)
**Events**:
- **Machine Showcase**: Player presents a machine. Judged on complexity, quality, and creativity. 3 tiers of prizes.
- **Automaton Race**: Player's automatons race against Spark's. Outcome based on automaton stats + random.
- **Fireworks Display**: Interactive — player launches fireworks in patterns. Pure fun, no fail state.
- **Dance**: Optional — invite an NPC to dance. Heart point bonus if they accept.

### Sky Day (Summer, Day 20)
**Events**:
- **Flight Demo**: If player has a flyer, perform aerial maneuvers for points. Spark competes.
- **Zeppelin Viewing**: Traveling zeppelins pass over. DEJIN identifies them and shares Old World airship facts.
- **Cloud Watching**: Quiet scene at The Overlook. NPC companion dialogue. Romance candidate event.
- **Kite Building**: Craft a kite from workshop materials. Design affects flight performance.

### Harvest Faire (Autumn, Day 25)
**Events**:
- **Cooking Competition**: Use gathered ingredients to cook a dish. Judged by Gus and Nora.
- **Resource Trading**: Special market with visiting traders offering rare goods at festival prices.
- **Community Feast**: All NPCs gather. Special group dialogue. Relationship bonuses for attending.
- **Bonfire Stories**: NPCs share stories around the fire. Lore reveals and character moments.

### Remembrance Day (Winter, Day 10)
**Events**:
- **Lantern Ceremony**: Player crafts a lantern and joins the river procession. Solemn, beautiful.
- **Name Reading**: Paige reads names of the lost. Player can add a name (customizable).
- **Gift Exchange**: Each NPC gives a small, personal gift. Player can reciprocate.
- **Quiet Reflection**: Visit The Overlook alone or with a companion. Special dialogue.

---

## 8.0 RANDOM/REPEATABLE QUEST TEMPLATES

These provide ongoing engagement after story quests are exhausted.

| Template | Source | Objective | Reward Range |
|----------|--------|-----------|-------------|
| **Trade Request** | Message board | Deliver X resources to Y town | 100-500 Cogs |
| **Repair Job** | NPC request | Fix a broken machine/building | 50-300 Cogs + hearts |
| **Bounty Hunt** | Harrow | Eliminate a marauder scouting party | 200-600 Cogs + salvage |
| **Salvage Run** | Ferris | Retrieve specific components from a zone | 100-400 Cogs + rare items |
| **Medical Emergency** | Doc Bramble | Gather medicinal herbs urgently | 100-200 Cogs + hearts |
| **Lost Item** | Random NPC | Find NPC's lost possession | 50-150 Cogs + hearts |
| **Automaton Rescue** | DEJIN | Retrieve a malfunctioning automaton | 100-300 Cogs + automaton parts |
| **Weather Emergency** | Linden | Repair storm damage before it worsens | 200-500 Cogs + reputation |
| **Trade Escort** | Gus | Protect a trade wagon from raiders | 300-700 Cogs + trade goods |
| **Mystery Signal** | DEJIN | Investigate an anomalous signal source | Variable — sometimes leads to hidden content |

---

*This Quest Design Document is Phase 8.2 of the Ironveil Narrative Design.*
*Next: Dialogue & Lore (Phase 8.3)*

*— Forged by the Djinn, in service to Master Derek*
