/**
 * Shadow Council - Event System
 * Phase 3: Random Event Management
 * 
 * Handles random events that occur throughout the game,
 * affecting kingdom stats, player decisions, and narrative flow.
 */

class EventSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentEvent = null;
        this.eventHistory = [];
        
        // Time-based event tracking (replaces turnsSinceLastEvent)
        this.lastEventTime = Date.now();
        this.nextEventTimeRange = { min: 15000, max: 30000 }; // 15-30 seconds at 1x speed
        
        // Initialize event database
        this.events = this._initializeEvents();
        
        // Active event effects (for duration-based effects)
        this.activeEffects = [];
    }

    /**
     * Initialize all 15+ events across categories
     */
    _initializeEvents() {
        return {
            // ==================== NATURAL EVENTS ====================
            plague: {
                id: 'plague',
                name: 'The Great Plague',
                category: 'natural',
                description: 'A deadly pestilence sweeps through your kingdom. Cities are decimated and people flee in terror.',
                icon: '☠️',
                turnsUntilTrigger: 0,
                choices: [
                    {
                        id: 'quarantine',
                        label: 'Enforce Quarantine',
                        description: 'Isolate affected areas at great economic cost',
                        effects: {
                            population: -0.10,  // Less severe due to quarantine
                            prosperity: -0.10,
                            trust: -5
                        }
                    },
                    {
                        id: 'let_run',
                        label: 'Let It Run Its Course',
                        description: 'Allow the plague to spread naturally',
                        effects: {
                            population: -0.20,
                            trust: +5  // People appreciate not being imprisoned
                        }
                    },
                    {
                        id: 'pray',
                        label: 'Pray and Wait',
                        description: 'Seek divine intervention',
                        effects: {
                            population: -0.15,
                            trust: -10  // Clergy blame the ruler
                        }
                    }
                ],
                baseProbability: 0.05
            },

            famine: {
                id: 'famine',
                name: 'The Great Famine',
                category: 'natural',
                description: 'Crops have failed across the realm. Starvation looms and peasants grow desperate.',
                icon: '🌾',
                choices: [
                    {
                        id: 'import',
                        label: 'Import Grain',
                        description: 'Buy food from foreign merchants',
                        effects: {
                            prosperity: -0.20,
                            trust: +10
                        }
                    },
                    {
                        id: 'ration',
                        label: 'Enforce Rationing',
                        description: 'Distribute what food exists fairly',
                        effects: {
                            prosperity: -0.05,
                            population: -0.05,
                            trust: -5
                        }
                    },
                    {
                        id: 'ignore',
                        label: 'Do Nothing',
                        description: 'Let the market handle it',
                        effects: {
                            population: -0.15,
                            trust: -15,
                            prosperity: -0.10
                        }
                    }
                ],
                baseProbability: 0.06
            },

            earthquake: {
                id: 'earthquake',
                name: 'The Great Quake',
                category: 'natural',
                description: 'The earth shakes! Buildings crumble and panic spreads through the capital.',
                icon: '🏚️',
                choices: [
                    {
                        id: 'rebuild',
                        label: 'Rebuild Immediately',
                        description: 'Spend lavishly to restore the city',
                        effects: {
                            prosperity: -0.15,
                            trust: +15
                        }
                    },
                    {
                        id: 'accept_loss',
                        label: 'Accept the Loss',
                        description: 'Focus resources elsewhere',
                        effects: {
                            trust: -10,
                            capitalDefense: -0.10
                        }
                    }
                ],
                baseProbability: 0.04
            },

            greatFire: {
                id: 'great_fire',
                name: 'The Great Fire',
                category: 'natural',
                description: 'A massive fire engulfs the city! The flames consume homes and businesses.',
                icon: '🔥',
                choices: [
                    {
                        id: 'fight',
                        label: 'Fight the Fire',
                        description: 'Mobilize all available forces',
                        effects: {
                            population: -0.05,
                            prosperity: -0.10,
                            trust: +5
                        }
                    },
                    {
                        id: 'evacuate',
                        label: 'Focus on Evacuation',
                        description: 'Save who you can, lose the rest',
                        effects: {
                            population: -0.10,
                            trust: +10
                        }
                    }
                ],
                baseProbability: 0.05
            },

            goldenAge: {
                id: 'golden_age',
                name: 'The Golden Age Begins',
                category: 'natural',
                description: 'Prosperity and peace flourish! Your kingdom experiences unprecedented growth.',
                icon: '✨',
                choices: [
                    {
                        id: 'embrace',
                        label: 'Embrace the Prosperity',
                        description: 'Let the good times roll',
                        effects: {
                            income: +0.30,
                            duration: 10
                        }
                    },
                    {
                        id: 'invest',
                        label: 'Invest in Infrastructure',
                        description: 'Build for the future',
                        effects: {
                            income: +0.15,
                            prosperity: +0.10,
                            duration: 10
                        }
                    }
                ],
                baseProbability: 0.03,
                isPositive: true
            },

            // ==================== POLITICAL EVENTS ====================
            successionCrisis: {
                id: 'succession_crisis',
                name: 'Succession Crisis',
                category: 'political',
                description: 'Your lack of an heir has become public knowledge. Nobles scheme and factions form.',
                icon: '👑',
                choices: [
                    {
                        id: 'name_heir',
                        label: 'Name an Heir',
                        description: 'Appoint a successor to end the uncertainty',
                        effects: {
                            trust: -10,
                            // Could trigger succession logic
                        }
                    },
                    {
                        id: 'delay',
                        label: 'Delay the Matter',
                        description: 'Buy time with promises',
                        effects: {
                            trust: -20,
                            prosperity: -0.05
                        }
                    },
                    {
                        id: 'adopt',
                        label: 'Adopt a Worthy Candidate',
                        description: 'Find a suitable heir from another house',
                        effects: {
                            prosperity: -0.10,
                            trust: +5
                        }
                    }
                ],
                baseProbability: 0.04
            },

            nobleRebellion: {
                id: 'noble_rebellion',
                name: 'Noble Rebellion',
                category: 'political',
                description: 'The nobles have risen in arms! They demand more autonomy and threaten war.',
                icon: '⚔️',
                choices: [
                    {
                        id: 'crush',
                        label: 'Crush the Rebellion',
                        description: 'Use military force to end the uprising',
                        effects: {
                            income: -0.15,
                            trust: +10,
                            armyStrength: +0.10
                        }
                    },
                    {
                        id: 'negotiate',
                        label: 'Negotiate Terms',
                        description: 'Grant concessions to end the conflict',
                        effects: {
                            income: -0.10,
                            trust: -15,
                            prosperity: +0.05
                        }
                    },
                    {
                        id: 'delay',
                        label: 'Stall for Time',
                        description: 'Buy time hoping they reconsider',
                        effects: {
                            trust: -20,
                            possibleWar: true
                        }
                    }
                ],
                baseProbability: 0.04
            },

            religiousSchism: {
                id: 'religious_schism',
                name: 'Religious Schism',
                category: 'political',
                description: 'The clergy is divided! Traditionalists and reformers clash over doctrine.',
                icon: '⛪',
                choices: [
                    {
                        id: 'support_reform',
                        label: 'Support Reformers',
                        description: 'Align with the progressive faction',
                        effects: {
                            trustTheocratic: -10,
                            trust: +5
                        }
                    },
                    {
                        id: 'support_tradition',
                        label: 'Support Tradition',
                        description: 'Back the conservative clergy',
                        effects: {
                            trustTheocratic: +10,
                            trust: -5
                        }
                    },
                    {
                        id: 'remain_neutral',
                        label: 'Remain Neutral',
                        description: 'Stay out of religious disputes',
                        effects: {
                            trustTheocratic: -10,
                            trust: -5
                        }
                    }
                ],
                baseProbability: 0.04
            },

            merchantGuildDemand: {
                id: 'merchant_guild_demand',
                name: 'Merchant Guild Demands',
                category: 'political',
                description: 'The Merchant Guild approaches with demands for favorable trade policies.',
                icon: '💰',
                choices: [
                    {
                        id: 'accept',
                        label: 'Accept Their Demands',
                        description: 'Grant them reduced tariffs',
                        effects: {
                            income: +0.10,
                            trust: -5
                        }
                    },
                    {
                        id: 'reject',
                        label: 'Reject Their Demands',
                        description: 'Refuse to change current policy',
                        effects: {
                            trust: +5,
                            prosperity: -0.05
                        }
                    },
                    {
                        id: 'negotiate',
                        label: 'Counter-Offer',
                        description: 'Offer partial concessions',
                        effects: {
                            income: +0.05,
                            trust: 0
                        }
                    }
                ],
                baseProbability: 0.05,
                isPositive: true
            },

            // ==================== MILITARY EVENTS ====================
            greatGeneralRises: {
                id: 'great_general_rises',
                name: 'A Great General Rises',
                category: 'military',
                description: 'A military genius emerges from your armies! Soldiers rally to their cause.',
                icon: '🎖️',
                choices: [
                    {
                        id: 'promote',
                        label: 'Promote to High Command',
                        description: 'Give them full authority',
                        effects: {
                            armyStrength: +0.30,
                            trust: +5
                        }
                    },
                    {
                        id: 'jealous',
                        label: 'Keep Them in Check',
                        description: 'Promote cautiously to avoid rivalry',
                        effects: {
                            armyStrength: +0.10,
                            trust: -5
                        }
                    },
                    {
                        id: 'exile',
                        label: 'Exile the General',
                        description: 'Remove the threat to your power',
                        effects: {
                            armyStrength: -0.10,
                            trust: -10
                        }
                    }
                ],
                baseProbability: 0.03,
                isPositive: true
            },

            fortressComplete: {
                id: 'fortress_complete',
                name: 'Fortress Construction Complete',
                category: 'military',
                description: 'The great fortress at your capital has been completed! Your defenses are formidable.',
                icon: '🏰',
                choices: [
                    {
                        id: 'celebrate',
                        label: 'Hold a Grand Celebration',
                        description: 'Throw a feast to mark the occasion',
                        effects: {
                            capitalDefense: +0.50,
                            prosperity: -0.05,
                            trust: +10
                        }
                    },
                    {
                        id: 'garrison',
                        label: 'Garrison Heavily',
                        description: 'Station your best troops there',
                        effects: {
                            capitalDefense: +0.50,
                            armyStrength: +0.10
                        }
                    }
                ],
                baseProbability: 0.03,
                isPositive: true
            },

            spyDiscovered: {
                id: 'spy_discovered',
                name: 'Foreign Spy Discovered',
                category: 'military',
                description: 'Your spymasters have captured a foreign agent! They offer valuable information.',
                icon: '🕵️',
                choices: [
                    {
                        id: 'turn',
                        label: 'Turn the Spy',
                        description: 'Flip them to work for you',
                        effects: {
                            intelligence: +20,
                            trust: +5
                        }
                    },
                    {
                        id: 'interrogate',
                        label: 'Interrogate Ruthlessly',
                        description: 'Extract every secret they know',
                        effects: {
                            intelligence: +10,
                            possibleWar: true
                        }
                    },
                    {
                        id: 'execute',
                        label: 'Execute Publicly',
                        description: 'Make an example of them',
                        effects: {
                            trust: +10,
                            prosperity: -0.05
                        }
                    }
                ],
                baseProbability: 0.05
            },

            // ==================== MYSTERY EVENTS ====================
            prophetAppears: {
                id: 'prophet_appears',
                name: 'A Prophet Appears',
                category: 'mystery',
                description: 'A mysterious prophet arrives in the capital, speaking of visions and destiny.',
                icon: '🔮',
                choices: [
                    {
                        id: 'embrace',
                        label: 'Embrace the Prophet',
                        description: 'Grant them your ear and favor',
                        effects: {
                            duration: 20,
                            randomTrait: true,
                            trust: +10
                        }
                    },
                    {
                        id: 'ignore',
                        label: 'Ignore the Prophet',
                        description: 'Pay them no mind',
                        effects: {
                            trust: -5
                        }
                    },
                    {
                        id: 'expel',
                        label: 'Expel from Kingdom',
                        description: 'Send them packing',
                        effects: {
                            trust: -10
                        }
                    }
                ],
                baseProbability: 0.03,
                isPositive: true
            },

            ancientRuinsFound: {
                id: 'ancient_ruins_found',
                name: 'Ancient Ruins Discovered',
                category: 'mystery',
                description: 'Explorers have uncovered ancient ruins! Treasure and knowledge await inside.',
                icon: '🏛️',
                choices: [
                    {
                        id: 'explore',
                        label: 'Explore Immediately',
                        description: 'Send your best to investigate',
                        effects: {
                            gold: +500,
                            tech: true,
                            prosperity: +0.05
                        }
                    },
                    {
                        id: 'seal',
                        label: 'Seal the Ruins',
                        description: 'Keep others from what lies within',
                        effects: {
                            trust: -5,
                            intelligence: +5
                        }
                    },
                    {
                        id: 'trade',
                        label: 'Sell Exploration Rights',
                        description: 'Let others take the risk',
                        effects: {
                            gold: +300,
                            prosperity: +0.10
                        }
                    }
                ],
                baseProbability: 0.04,
                isPositive: true
            },

            cometSighted: {
                id: 'comet_sighted',
                name: 'Comet Sighted in the Night Sky',
                category: 'mystery',
                description: 'A blazing comet streaks across the sky! The people are terrified and excited.',
                icon: '☄️',
                choices: [
                    {
                        id: 'interpret_good',
                        label: 'Proclaim It a Blessing',
                        description: 'Tell the people it brings good fortune',
                        effects: {
                            trust: +10,
                            globalMood: 'positive'
                        }
                    },
                    {
                        id: 'interpret_bad',
                        label: 'Proclaim It a Warning',
                        description: 'Tell the people doom approaches',
                        effects: {
                            trust: -5,
                            globalMood: 'negative'
                        }
                    },
                    {
                        id: 'ignore',
                        label: 'Ignore the Omen',
                        description: 'It is merely a rock in the sky',
                        effects: {
                            trust: -5
                        }
                    }
                ],
                baseProbability: 0.04
            },

            // Additional mystery event
            strangeLights: {
                id: 'strange_lights',
                name: 'Strange Lights in the Mountains',
                category: 'mystery',
                description: 'Villagers report mysterious lights dancing on the mountain peaks at night.',
                icon: '🌟',
                choices: [
                    {
                        id: 'investigate',
                        label: 'Send Investigators',
                        description: 'Find out what the lights truly are',
                        effects: {
                            intelligence: +15,
                            possibleDiscovery: true
                        }
                    },
                    {
                        id: 'dismiss',
                        label: 'Dismiss as Folklore',
                        description: 'Let the stories continue',
                        effects: {
                            trust: +5
                        }
                    }
                ],
                baseProbability: 0.03
            }
        };
    }

    /**
     * Process elapsed time and potentially trigger a random event
     * @param {number} elapsedMs - Milliseconds that have elapsed (already scaled by gameSpeed)
     * @returns {object|null} - Event display data if event triggered, null otherwise
     */
    processTimeElapsed(elapsedMs) {
        const now = Date.now();
        const timeSinceLastEvent = now - this.lastEventTime;
        
        // Check if it's time for an event
        const nextEventTime = this._getNextEventTimeMs();
        
        if (timeSinceLastEvent < nextEventTime) {
            return null; // Not time yet
        }

        // Reset timer
        this.lastEventTime = now;

        // Select random event based on probability
        const event = this._selectRandomEvent();
        
        if (event) {
            this.currentEvent = event;
            return this.getEventDisplay();
        }

        return null;
    }

    /**
     * Get random milliseconds until next event
     */
    _getNextEventTimeMs() {
        return Math.floor(
            Math.random() * (this.nextEventTimeRange.max - this.nextEventTimeRange.min + 1)
        ) + this.nextEventTimeRange.min;
    }

    /**
     * Trigger a random event based on probability
     * Called every turn by the game loop
     * @deprecated Use processTimeElapsed() instead
     */
    triggerRandomEvent() {
        // Estimate elapsed time since last event (~2 seconds per turn at 1x)
        return this.processTimeElapsed(2000);
    }

    /**
     * Select a random event based on probability weights
     */
    _selectRandomEvent() {
        const availableEvents = Object.values(this.events);
        
        // Filter by base probability
        const candidates = availableEvents.filter(event => {
            return Math.random() < event.baseProbability;
        });

        if (candidates.length === 0) {
            // Force an event occasionally if none triggered by probability
            if (Math.random() < 0.1) {
                return availableEvents[Math.floor(Math.random() * availableEvents.length)];
            }
            return null;
        }

        // Pick one from candidates
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    /**
     * Handle player's choice for the current event
     */
    handleEventChoice(eventId, choiceId) {
        const event = this.currentEvent || this.events[eventId];
        
        if (!event) {
            return { success: false, error: 'Event not found' };
        }

        const choice = event.choices.find(c => c.id === choiceId);
        
        if (!choice) {
            return { success: false, error: 'Choice not found' };
        }

        // Apply the effects
        const result = this.applyEventEffects(choice.effects, event);

        // Record in history
        this.eventHistory.push({
            event: event.id,
            choice: choiceId,
            turn: this.gameState.turn || 0,
            timestamp: Date.now()
        });

        // Clear current event
        this.currentEvent = null;

        return {
            success: true,
            event: event,
            choice: choice,
            result: result
        };
    }

    /**
     * Apply event effects to game state
     */
    applyEventEffects(effects, event) {
        const result = {
            messages: [],
            statChanges: {}
        };

        // Apply population change
        if (effects.population) {
            const currentPop = this.gameState.population || 10000;
            const change = Math.floor(currentPop * effects.population);
            this.gameState.population = Math.max(0, currentPop + change);
            result.statChanges.population = effects.population;
            result.messages.push(
                `${effects.population > 0 ? 'Gained' : 'Lost'} ${Math.abs(change)} population`
            );
        }

        // Apply prosperity change
        if (effects.prosperity) {
            this.gameState.prosperity = (this.gameState.prosperity || 50) + (effects.prosperity * 100);
            result.statChanges.prosperity = effects.prosperity;
            result.messages.push(
                `Prosperity ${effects.prosperity > 0 ? 'increased' : 'decreased'} by ${Math.abs(Math.round(effects.prosperity * 100))}%`
            );
        }

        // Apply income change
        if (effects.income) {
            this.gameState.income = (this.gameState.income || 100) * (1 + effects.income);
            result.statChanges.income = effects.income;
            result.messages.push(
                `Income ${effects.income > 0 ? 'increased' : 'decreased'} by ${Math.abs(Math.round(effects.income * 100))}%`
            );
        }

        // Apply trust change
        if (effects.trust) {
            this.gameState.trust = (this.gameState.trust || 50) + effects.trust;
            result.statChanges.trust = effects.trust;
            result.messages.push(
                `Trust ${effects.trust > 0 ? 'increased' : 'decreased'} by ${Math.abs(effects.trust)}`
            );
        }

        // Apply theocratic trust change
        if (effects.trustTheocratic) {
            this.gameState.trustTheocratic = (this.gameState.trustTheocratic || 50) + effects.trustTheocratic;
            result.statChanges.trustTheocratic = effects.trustTheocratic;
            result.messages.push(
                `Clerical influence ${effects.trustTheocratic > 0 ? 'increased' : 'decreased'} by ${Math.abs(effects.trustTheocratic)}`
            );
        }

        // Apply army strength change
        if (effects.armyStrength) {
            this.gameState.armyStrength = (this.gameState.armyStrength || 50) + (effects.armyStrength * 100);
            result.statChanges.armyStrength = effects.armyStrength;
            result.messages.push(
                `Army strength ${effects.armyStrength > 0 ? 'increased' : 'decreased'} by ${Math.abs(Math.round(effects.armyStrength * 100))}%`
            );
        }

        // Apply defense change
        if (effects.capitalDefense) {
            this.gameState.capitalDefense = (this.gameState.capitalDefense || 50) + (effects.capitalDefense * 100);
            result.statChanges.capitalDefense = effects.capitalDefense;
            result.messages.push(
                `Capital defense ${effects.capitalDefense > 0 ? 'increased' : 'decreased'} by ${Math.abs(Math.round(effects.capitalDefense * 100))}%`
            );
        }

        // Apply gold change
        if (effects.gold) {
            this.gameState.gold = (this.gameState.gold || 0) + effects.gold;
            result.statChanges.gold = effects.gold;
            result.messages.push(`${effects.gold > 0 ? 'Gained' : 'Lost'} ${Math.abs(effects.gold)} gold`);
        }

        // Apply intelligence change
        if (effects.intelligence) {
            this.gameState.intelligence = (this.gameState.intelligence || 0) + effects.intelligence;
            result.statChanges.intelligence = effects.intelligence;
            result.messages.push(`Intelligence ${effects.intelligence > 0 ? 'increased' : 'decreased'} by ${Math.abs(effects.intelligence)}`);
        }

        // Handle duration-based effects (like Golden Age)
        if (effects.duration) {
            this.activeEffects.push({
                type: event.id,
                duration: effects.duration,
                effects: {
                    income: effects.income || 0,
                    prosperity: effects.prosperity || 0
                },
                startTurn: this.gameState.turn || 0
            });
            result.messages.push(`Effect will last for ${effects.duration} turns`);
        }

        // Handle random positive trait (for Prophet event)
        if (effects.randomTrait) {
            const traits = ['wisdom', 'charisma', 'martial', 'stewardship'];
            const randomTrait = traits[Math.floor(Math.random() * traits.length)];
            this.gameState[`trait_${randomTrait}`] = (this.gameState[`trait_${randomTrait}`] || 0) + 1;
            result.messages.push(`Gained +1 ${randomTrait} for 20 turns`);
            // Store as active effect
            this.activeEffects.push({
                type: 'prophet_blessing',
                duration: 20,
                stat: `trait_${randomTrait}`,
                amount: 1,
                startTurn: this.gameState.turn || 0
            });
        }

        // Handle tech discovery
        if (effects.tech) {
            this.gameState.techs = this.gameState.techs || [];
            const newTechs = ['advanced_crafting', 'iron_working', 'advanced_architecture'];
            const tech = newTechs[Math.floor(Math.random() * newTechs.length)];
            if (!this.gameState.techs.includes(tech)) {
                this.gameState.techs.push(tech);
                result.messages.push(`Discovered: ${tech.replace('_', ' ')}`);
            }
        }

        // Handle possible war flag
        if (effects.possibleWar) {
            this.gameState.possibleWar = true;
            result.messages.push('⚠️ War may be imminent...');
        }

        // Handle possible discovery flag
        if (effects.possibleDiscovery) {
            this.gameState.possibleDiscovery = true;
            result.messages.push('Something awaits discovery...');
        }

        // Handle global mood effect
        if (effects.globalMood) {
            this.gameState.globalMood = effects.globalMood;
            result.messages.push(`The realm is filled with ${effects.globalMood} sentiment`);
        }

        return result;
    }

    /**
     * Process active effects each turn (call from game loop)
     */
    processActiveEffects() {
        const currentTurn = this.gameState.turn || 0;
        
        this.activeEffects = this.activeEffects.filter(effect => {
            const elapsed = currentTurn - (effect.startTurn || 0);
            const remaining = effect.duration - elapsed;

            if (remaining <= 0) {
                // Effect expired - remove bonus
                if (effect.stat) {
                    this.gameState[effect.stat] = Math.max(0, (this.gameState[effect.stat] || 0) - effect.amount);
                }
                return false; // Remove from active
            }

            // Apply ongoing effects
            if (effect.effects) {
                if (effect.effects.income) {
                    // Already applied when event triggered
                }
            }

            return true; // Keep active
        });
    }

    /**
     * Get UI-friendly event display data
     */
    getEventDisplay() {
        if (!this.currentEvent) {
            return null;
        }

        const event = this.currentEvent;
        
        return {
            id: event.id,
            name: event.name,
            icon: event.icon,
            category: event.category,
            description: event.description,
            isPositive: event.isPositive || false,
            choices: event.choices.map(choice => ({
                id: choice.id,
                label: choice.label,
                description: choice.description,
                effects: this._summarizeEffects(choice.effects)
            })),
            turn: this.gameState.turn || 0
        };
    }

    /**
     * Summarize effects for UI display
     */
    _summarizeEffects(effects) {
        const summary = [];
        
        if (effects.population) summary.push(`${effects.population > 0 ? '+' : ''}${Math.round(effects.population * 100)}% Population`);
        if (effects.prosperity) summary.push(`${effects.prosperity > 0 ? '+' : ''}${Math.round(effects.prosperity * 100)}% Prosperity`);
        if (effects.income) summary.push(`${effects.income > 0 ? '+' : ''}${Math.round(effects.income * 100)}% Income`);
        if (effects.trust) summary.push(`${effects.trust > 0 ? '+' : ''}${effects.trust} Trust`);
        if (effects.trustTheocratic) summary.push(`${effects.trustTheocratic > 0 ? '+' : ''}${effects.trustTheocratic} Religious Trust`);
        if (effects.armyStrength) summary.push(`${effects.armyStrength > 0 ? '+' : ''}${Math.round(effects.armyStrength * 100)}% Army`);
        if (effects.capitalDefense) summary.push(`${effects.capitalDefense > 0 ? '+' : ''}${Math.round(effects.capitalDefense * 100)}% Defense`);
        if (effects.gold) summary.push(`${effects.gold > 0 ? '+' : ''}${effects.gold} Gold`);
        if (effects.duration) summary.push(`${effects.duration} turns`);
        
        return summary;
    }

    /**
     * Get event by ID (for direct triggering)
     */
    getEvent(eventId) {
        return this.events[eventId] || null;
    }

    /**
     * Force trigger a specific event
     */
    triggerEvent(eventId) {
        const event = this.events[eventId];
        
        if (!event) {
            return { success: false, error: 'Event not found' };
        }

        this.currentEvent = event;
        this.turnsSinceLastEvent = 0;
        
        return {
            success: true,
            event: this.getEventDisplay()
        };
    }

    /**
     * Get event history
     */
    getEventHistory() {
        return this.eventHistory;
    }

    /**
     * Get all active effects
     */
    getActiveEffects() {
        return this.activeEffects.map(effect => {
            const elapsed = (this.gameState.turn || 0) - (effect.startTurn || 0);
            return {
                ...effect,
                remainingTurns: effect.duration - elapsed
            };
        });
    }

    /**
     * Check if there's a current event waiting for input
     */
    hasActiveEvent() {
        return this.currentEvent !== null;
    }

    /**
     * Get events by category
     */
    getEventsByCategory(category) {
        return Object.values(this.events).filter(e => e.category === category);
    }

    /**
     * Get all event categories
     */
    getCategories() {
        return ['natural', 'political', 'military', 'mystery'];
    }

    /**
     * Set custom event time range (for different difficulty levels)
     * @param {number} minMs - Minimum milliseconds between events at 1x speed
     * @param {number} maxMs - Maximum milliseconds between events at 1x speed
     */
    setEventFrequency(minMs, maxMs) {
        this.nextEventTimeRange = { min: minMs, max: maxMs };
    }

    /**
     * Set custom event turn range (for different difficulty levels)
     * @deprecated Use setEventFrequency() with milliseconds instead
     * @param {number} minTurns 
     * @param {number} maxTurns 
     */
    setEventFrequency(minTurns, maxTurns) {
        this.nextEventTurnRange = { min: minTurns, max: maxTurns };
    }

    /**
     * Add custom event to the system
     */
    addCustomEvent(event) {
        if (!event.id || !event.name || !event.choices) {
            return { success: false, error: 'Invalid event format' };
        }
        
        this.events[event.id] = event;
        return { success: true };
    }
}

// Export for Node.js / CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventSystem;
}

// Export for ES6
if (typeof exports !== 'undefined') {
    exports.EventSystem = EventSystem;
}
