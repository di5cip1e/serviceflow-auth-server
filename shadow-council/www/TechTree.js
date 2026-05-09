/**
 * TechTree.js - Shadow Council Technology System
 * Phase 4: Complete Tech Tree with Research Points
 */

class TechTree {
    constructor() {
        this.researchPoints = 0;
        this.researchedTechs = new Set();
        this.techDefinitions = this._initializeTechTree();
        this.baseResearchPerCity = 2; // Base RP per city per turn
        
        // Time-based research tracking
        this.lastResearchTime = Date.now();
        this.baseResearchPerSecond = 0.2; // 2 RP per 10 seconds = 0.2 RP/sec at 1x speed
    }

    _initializeTechTree() {
        return {
            // ============ MILITARY TECH ============
            military: {
                name: "Military",
                tiers: {
                    1: {
                        name: "Basic Military",
                        techs: {
                            iron_working: {
                                name: "Iron Working",
                                cost: 50,
                                description: "Master iron smelting and forging",
                                prerequisites: []
                            },
                            advanced_fortification: {
                                name: "Advanced Fortification",
                                cost: 50,
                                description: "Build stronger defensive structures",
                                prerequisites: []
                            }
                        }
                    },
                    2: {
                        name: "Advanced Military",
                        techs: {
                            siege_engines: {
                                name: "Siege Engines",
                                cost: 100,
                                description: "Deploy catapults and ballistas",
                                prerequisites: ["iron_working"]
                            },
                            horse_breeding: {
                                name: "Horse Breeding",
                                cost: 100,
                                description: "Breed superior warhorses",
                                prerequisites: []
                            }
                        }
                    },
                    3: {
                        name: "Elite Military",
                        techs: {
                            elite_armory: {
                                name: "Elite Armory",
                                cost: 200,
                                description: "Forge masterwork equipment",
                                prerequisites: ["siege_engines", "iron_working"]
                            },
                            war_colleges: {
                                name: "War Colleges",
                                cost: 200,
                                description: "Train elite commanders",
                                prerequisites: ["horse_breeding"]
                            }
                        }
                    },
                    4: {
                        name: "Master Military",
                        techs: {
                            logistics: {
                                name: "Logistics",
                                cost: 400,
                                description: "Supply lines that sustain armies",
                                prerequisites: ["elite_armory", "war_colleges"]
                            },
                            total_war: {
                                name: "Total War",
                                cost: 500,
                                description: "Full mobilization of resources",
                                prerequisites: ["logistics"]
                            }
                        }
                    }
                }
            },
            // ============ ECONOMIC TECH ============
            economic: {
                name: "Economic",
                tiers: {
                    1: {
                        name: "Basic Economy",
                        techs: {
                            trade_routes: {
                                name: "Trade Routes",
                                cost: 50,
                                description: "Establish merchant caravans",
                                prerequisites: []
                            },
                            agricultural: {
                                name: "Agricultural",
                                cost: 50,
                                description: "Improved farming techniques",
                                prerequisites: []
                            }
                        }
                    },
                    2: {
                        name: "Advanced Economy",
                        techs: {
                            banking: {
                                name: "Banking",
                                cost: 100,
                                description: "Financial institutions emerge",
                                prerequisites: ["trade_routes"]
                            },
                            irrigation: {
                                name: "Irrigation",
                                cost: 100,
                                description: "Systematic water management",
                                prerequisites: ["agricultural"]
                            }
                        }
                    },
                    3: {
                        name: "Trade Economy",
                        techs: {
                            market_economy: {
                                name: "Market Economy",
                                cost: 200,
                                description: "Supply and demand economics",
                                prerequisites: ["banking", "trade_routes"]
                            },
                            guilds: {
                                name: "Guilds",
                                cost: 200,
                                description: "Organized trade associations",
                                prerequisites: ["irrigation", "agricultural"]
                            }
                        }
                    },
                    4: {
                        name: "Industrial Economy",
                        techs: {
                            merchant_navy: {
                                name: "Merchant Navy",
                                cost: 400,
                                description: "Global sea trade network",
                                prerequisites: ["market_economy", "guilds"]
                            },
                            industrial_revolution: {
                                name: "Industrial Revolution",
                                cost: 500,
                                description: "Mass production and factories",
                                prerequisites: ["merchant_navy"]
                            }
                        }
                    }
                }
            },
            // ============ CIVIC TECH ============
            civic: {
                name: "Civic",
                tiers: {
                    1: {
                        name: "Basic Governance",
                        techs: {
                            codified_laws: {
                                name: "Codified Laws",
                                cost: 50,
                                description: "Written legal code",
                                prerequisites: []
                            },
                            census: {
                                name: "Census",
                                cost: 50,
                                description: "Population tracking and records",
                                prerequisites: []
                            }
                        }
                    },
                    2: {
                        name: "Advanced Governance",
                        techs: {
                            currency: {
                                name: "Currency",
                                cost: 100,
                                description: "Standardized coinage",
                                prerequisites: ["codified_laws"]
                            },
                            propaganda: {
                                name: "Propaganda",
                                cost: 100,
                                description: "State messaging and control",
                                prerequisites: ["census"]
                            }
                        }
                    },
                    3: {
                        name: "Feudal Governance",
                        techs: {
                            feudal_contracts: {
                                name: "Feudal Contracts",
                                cost: 200,
                                description: "Formal lord-vassal agreements",
                                prerequisites: ["currency", "codified_laws"]
                            },
                            postal_system: {
                                name: "Postal System",
                                cost: 200,
                                description: "State-run message delivery",
                                prerequisites: ["propaganda", "census"]
                            }
                        }
                    },
                    4: {
                        name: "Centralized Governance",
                        techs: {
                            divine_right: {
                                name: "Divine Right",
                                cost: 400,
                                description: "Monarchy blessed by the divine",
                                prerequisites: ["feudal_contracts", "postal_system"]
                            },
                            enlightenment: {
                                name: "Enlightenment",
                                cost: 500,
                                description: "Age of reason and philosophy",
                                prerequisites: ["divine_right"]
                            }
                        }
                    }
                }
            }
        };
    }

    // ============ CORE METHODS ============

    /**
     * Add research points to the pool
     * @param {number} amount - Amount of research points to add
     */
    addResearchPoints(amount) {
        if (amount > 0) {
            this.researchPoints += amount;
        }
    }

    /**
     * Check if a tech can be researched (has enough RP and prerequisites met)
     * @param {string} techId - The tech identifier
     * @returns {boolean}
     */
    canResearch(techId) {
        const tech = this._findTech(techId);
        if (!tech) return false;
        
        // Check if already researched
        if (this.researchedTechs.has(techId)) return false;
        
        // Check if enough research points
        if (this.researchPoints < tech.cost) return false;
        
        // Check prerequisites
        return tech.prerequisites.every(prereq => this.researchedTechs.has(prereq));
    }

    /**
     * Research a tech (unlock it)
     * @param {string} techId - The tech identifier
     * @returns {object} - Result with success status and details
     */
    research(techId) {
        const tech = this._findTech(techId);
        
        if (!tech) {
            return { success: false, message: `Tech ${techId} not found` };
        }
        
        if (this.researchedTechs.has(techId)) {
            return { success: false, message: `Tech ${techId} already researched` };
        }
        
        if (this.researchPoints < tech.cost) {
            return { 
                success: false, 
                message: `Insufficient research points. Need ${tech.cost}, have ${this.researchPoints}` 
            };
        }
        
        // Check prerequisites
        const missingPrereqs = tech.prerequisites.filter(prereq => !this.researchedTechs.has(prereq));
        if (missingPrereqs.length > 0) {
            return { 
                success: false, 
                message: `Missing prerequisites: ${missingPrereqs.join(', ')}` 
            };
        }
        
        // Research the tech
        this.researchPoints -= tech.cost;
        this.researchedTechs.add(techId);
        
        return { 
            success: true, 
            message: `Researched ${tech.name}!`,
            tech: tech,
            remainingPoints: this.researchPoints
        };
    }

    /**
     * Get all available techs that can be researched
     * @returns {array} - Array of available techs with details
     */
    getAvailableTechs() {
        const available = [];
        
        for (const [categoryKey, category] of Object.entries(this.techDefinitions)) {
            for (const [tierKey, tier] of Object.entries(category.tiers)) {
                for (const [techId, tech] of Object.entries(tier.techs)) {
                    if (!this.researchedTechs.has(techId)) {
                        const prereqsMet = tech.prerequisites.every(prereq => this.researchedTechs.has(prereq));
                        const canAfford = this.researchPoints >= tech.cost;
                        
                        available.push({
                            id: techId,
                            name: tech.name,
                            cost: tech.cost,
                            description: tech.description,
                            category: categoryKey,
                            tier: parseInt(tierKey),
                            prerequisites: tech.prerequisites,
                            prerequisitesMet: prereqsMet,
                            canResearch: prereqsMet && canAfford,
                            currentPoints: this.researchPoints
                        });
                    }
                }
            }
        }
        
        return available.sort((a, b) => {
            // Sort by tier, then by cost
            if (a.tier !== b.tier) return a.tier - b.tier;
            return a.cost - b.cost;
        });
    }

    /**
     * Get tech progress for UI display
     * @returns {object} - Progress data for UI
     */
    getTechProgress() {
        const allTechs = this._getAllTechs();
        const researched = Array.from(this.researchedTechs);
        
        // Group by category and tier
        const progress = {
            total: allTechs.length,
            researched: researched.length,
            researchPoints: this.researchPoints,
            categories: {}
        };
        
        for (const [categoryKey, category] of Object.entries(this.techDefinitions)) {
            progress.categories[categoryKey] = {
                name: category.name,
                tiers: {}
            };
            
            for (const [tierKey, tier] of Object.entries(category.tiers)) {
                const tierTechs = Object.keys(tier.techs);
                const tierResearched = tierTechs.filter(t => this.researchedTechs.has(t));
                
                progress.categories[categoryKey].tiers[tierKey] = {
                    name: tier.name,
                    total: tierTechs.length,
                    researched: tierResearched.length,
                    complete: tierResearched.length === tierTechs.length,
                    techs: tierTechs.map(techId => ({
                        id: techId,
                        name: tier.techs[techId].name,
                        researched: this.researchedTechs.has(techId)
                    }))
                };
            }
        }
        
        return progress;
    }

    /**
     * Process elapsed time for research point generation
     * @param {number} elapsedMs - Milliseconds that have elapsed (already scaled by gameSpeed)
     */
    processTimeElapsed(elapsedMs) {
        const elapsedSeconds = elapsedMs / 1000;
        const rpGained = elapsedSeconds * this.baseResearchPerSecond;
        
        if (rpGained > 0) {
            this.addResearchPoints(rpGained);
        }
        
        this.lastResearchTime = Date.now();
        
        return {
            secondsElapsed: elapsedSeconds,
            pointsGained: rpGained,
            totalPoints: this.researchPoints
        };
    }

    /**
     * Process end of turn - DEPRECATED: Use processTimeElapsed instead
     * Kept for backward compatibility
     * @param {number} cityCount - Number of cities owned (ignored in time-based mode)
     * @returns {object} - Turn results with RP gained
     * @deprecated Use processTimeElapsed() for real-time speed slider support
     */
    processTurn(cityCount) {
        // For backward compatibility - estimate time since last turn (~2 seconds at 1x)
        return this.processTimeElapsed(2000 * (cityCount || 1));
    }

    /**
     * Get all tech definitions as flat list
     * @returns {array}
     */
    _getAllTechs() {
        const all = [];
        for (const category of Object.values(this.techDefinitions)) {
            for (const tier of Object.values(category.tiers)) {
                for (const [techId, tech] of Object.entries(tier.techs)) {
                    all.push({ id: techId, ...tech });
                }
            }
        }
        return all;
    }

    /**
     * Find a tech by ID across all categories
     * @param {string} techId 
     * @returns {object|null}
     */
    _findTech(techId) {
        for (const category of Object.values(this.techDefinitions)) {
            for (const tier of Object.values(category.tiers)) {
                if (tier.techs[techId]) {
                    return tier.techs[techId];
                }
            }
        }
        return null;
    }

    /**
     * Get tech details by ID
     * @param {string} techId 
     * @returns {object|null}
     */
    getTech(techId) {
        const tech = this._findTech(techId);
        if (!tech) return null;
        
        return {
            id: techId,
            ...tech,
            researched: this.researchedTechs.has(techId)
        };
    }

    /**
     * Get list of researched techs
     * @returns {array}
     */
    getResearchedTechs() {
        return Array.from(this.researchedTechs).map(techId => this.getTech(techId));
    }

    /**
     * Set base research rate per city
     * @param {number} rate 
     */
    setBaseResearchRate(rate) {
        this.baseResearchPerCity = rate;
    }
    
    /**
     * Set research rate per second (for time-based mode)
     * @param {number} rpPerSecond - Research points per second at 1x speed
     */
    setResearchRatePerSecond(rpPerSecond) {
        this.baseResearchPerSecond = rpPerSecond;
    }
    
    /**
     * Get current research rate per second
     * @returns {number}
     */
    getResearchRatePerSecond() {
        return this.baseResearchPerSecond;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TechTree;
}
