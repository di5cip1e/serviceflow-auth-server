/**
 * AIDiplomacy - Autonomous AI-to-AI diplomatic interactions
 * AI nations negotiate, form alliances, declare wars without player input
 * Creates a living, reactive world
 */
export class AIDiplomacy {
  constructor(worldManager) {
    this.worldManager = worldManager;
    this.aiRelationships = new Map(); // Track all AI-to-AI relationships
    this.diplomacyInterval = 15000; // AI diplomacy every 15 seconds
    this.lastDiplomacyTime = 0;
    
    this.initializeAIRelationships();
  }
  
  /**
   * Initialize relationships between all AI nations
   */
  initializeAIRelationships() {
    const nations = this.worldManager.nations.filter(n => n.id !== 0); // Exclude player
    
    // Create pairwise relationships
    for (let i = 0; i < nations.length; i++) {
      for (let j = i + 1; j < nations.length; j++) {
        const nation1 = nations[i];
        const nation2 = nations[j];
        
        const key = this.getRelationshipKey(nation1.id, nation2.id);
        const disposition = this.calculateInitialDisposition(nation1, nation2);
        
        this.aiRelationships.set(key, {
          nation1: nation1.id,
          nation2: nation2.id,
          disposition: disposition, // -1 to +1
          atWar: false,
          alliance: false,
          tradeAgreement: false,
          nonAggressionPact: false,
          lastInteraction: 0,
          interactionCount: 0
        });
      }
    }
    
    console.log(`✓ Initialized ${this.aiRelationships.size} AI-AI relationships`);
  }
  
  /**
   * Calculate initial disposition between two AI nations
   */
  calculateInitialDisposition(nation1, nation2) {
    let disposition = 0;
    
    // Government compatibility
    if (nation1.ruler.governmentType === nation2.ruler.governmentType) {
      disposition += 0.2; // Same government = friendlier
    }
    
    const incompatible = [
      ['democracy', 'autocracy'],
      ['democracy', 'militarism'],
      ['theocracy', 'oligarchy']
    ];
    
    const types = [nation1.ruler.governmentType, nation2.ruler.governmentType].sort();
    if (incompatible.some(pair => pair[0] === types[0] && pair[1] === types[1])) {
      disposition -= 0.3;
    }
    
    // Proximity (closer nations are more likely to conflict)
    const distance = this.getDistance(nation1, nation2);
    if (distance < 20) {
      disposition -= 0.2; // Close = more territorial tension
    }
    
    // Trait influences
    if (nation1.ruler.positiveTraits.includes('diplomatic')) disposition += 0.1;
    if (nation2.ruler.positiveTraits.includes('diplomatic')) disposition += 0.1;
    if (nation1.ruler.negativeTraits.includes('wrathful')) disposition -= 0.15;
    if (nation2.ruler.negativeTraits.includes('wrathful')) disposition -= 0.15;
    if (nation1.ruler.negativeTraits.includes('paranoid')) disposition -= 0.1;
    if (nation2.ruler.negativeTraits.includes('paranoid')) disposition -= 0.1;
    
    return Math.max(-1, Math.min(1, disposition));
  }
  
  /**
   * Get distance between two nations (closest cities)
   */
  getDistance(nation1, nation2) {
    let minDistance = Infinity;
    
    nation1.cities.forEach(city1 => {
      nation2.cities.forEach(city2 => {
        const dx = city1.x - city2.x;
        const dy = city1.y - city2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        minDistance = Math.min(minDistance, distance);
      });
    });
    
    return minDistance;
  }
  
  /**
   * Generate unique key for relationship pair
   */
  getRelationshipKey(id1, id2) {
    return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
  }
  
  /**
   * Get relationship between two nations
   */
  getRelationship(id1, id2) {
    const key = this.getRelationshipKey(id1, id2);
    return this.aiRelationships.get(key);
  }
  
  /**
   * Update loop - called every frame
   */
  update(deltaTime) {
    const currentTime = Date.now();
    
    if (currentTime - this.lastDiplomacyTime >= this.diplomacyInterval) {
      this.lastDiplomacyTime = currentTime;
      this.performDiplomaticActions();
    }
  }
  
  /**
   * AI nations perform diplomatic actions
   */
  performDiplomaticActions() {
    console.log('=== AI DIPLOMACY TICK ===');
    
    const aiNations = this.worldManager.nations.filter(n => n.id !== 0);
    
    // Each nation considers diplomatic actions
    aiNations.forEach(nation => {
      // Decide what diplomatic action to take
      const action = this.decideAction(nation);
      
      if (action) {
        this.executeAIDiplomaticAction(nation, action);
      }
    });
  }
  
  /**
   * Decide what diplomatic action a nation should take
   */
  decideAction(nation) {
    const ruler = nation.ruler;
    const traits = ruler.positiveTraits.concat(ruler.negativeTraits);
    
    // Calculate probabilities for different actions
    let warProbability = 10;
    let allianceProbability = 15;
    let tradeProbability = 20;
    let peaceProbability = 10;
    
    // Trait modifiers
    if (traits.includes('ambitious')) {
      warProbability += 15;
      allianceProbability += 10;
    }
    if (traits.includes('diplomatic')) {
      allianceProbability += 20;
      tradeProbability += 15;
      peaceProbability += 15;
      warProbability -= 10;
    }
    if (traits.includes('brave')) {
      warProbability += 10;
    }
    if (traits.includes('wrathful')) {
      warProbability += 20;
      peaceProbability -= 10;
    }
    if (traits.includes('shrewd')) {
      tradeProbability += 15;
      allianceProbability += 10;
    }
    if (traits.includes('paranoid')) {
      allianceProbability -= 15;
      tradeProbability -= 10;
    }
    if (traits.includes('merciful')) {
      warProbability -= 15;
      peaceProbability += 15;
    }
    
    // Government modifiers
    if (ruler.governmentType === 'militarism') {
      warProbability += 20;
      peaceProbability -= 10;
    }
    if (ruler.governmentType === 'oligarchy') {
      tradeProbability += 20;
    }
    if (ruler.governmentType === 'democracy') {
      allianceProbability += 15;
      peaceProbability += 10;
    }
    
    // Find best target for action
    const potentialTargets = this.findDiplomaticTargets(nation);
    
    if (potentialTargets.length === 0) return null;
    
    // Roll for action type
    const total = warProbability + allianceProbability + tradeProbability + peaceProbability;
    const roll = Math.random() * total;
    
    let actionType;
    if (roll < warProbability) {
      actionType = 'war';
    } else if (roll < warProbability + allianceProbability) {
      actionType = 'alliance';
    } else if (roll < warProbability + allianceProbability + tradeProbability) {
      actionType = 'trade';
    } else {
      actionType = 'peace';
    }
    
    // Find appropriate target for action
    const target = this.findBestTarget(nation, potentialTargets, actionType);
    
    if (!target) return null;
    
    return {
      type: actionType,
      target: target,
      initiator: nation
    };
  }
  
  /**
   * Find potential diplomatic targets for a nation
   */
  findDiplomaticTargets(nation) {
    return this.worldManager.nations.filter(n => 
      n.id !== nation.id && n.id !== 0 // Exclude self and player
    );
  }
  
  /**
   * Find best target for a specific diplomatic action
   */
  findBestTarget(nation, potentialTargets, actionType) {
    const scored = potentialTargets.map(target => {
      const relationship = this.getRelationship(nation.id, target.id);
      let score = 0;
      
      switch (actionType) {
        case 'war':
          // Prefer weak, hostile neighbors
          if (relationship.atWar || relationship.alliance) return null; // Already at war or allied
          score = -relationship.disposition * 10; // More hostile = higher score
          score += relationship.nonAggressionPact ? -20 : 0;
          
          const strengthRatio = this.calculateStrength(nation) / this.calculateStrength(target);
          if (strengthRatio > 1.3) score += 15; // Prefer weaker targets
          if (this.getDistance(nation, target) < 20) score += 10; // Prefer close targets
          break;
          
        case 'alliance':
          // Prefer friendly, similar strength nations
          if (relationship.atWar || relationship.alliance) return null;
          score = relationship.disposition * 10; // More friendly = higher score
          score += relationship.tradeAgreement ? 10 : 0;
          
          if (nation.ruler.governmentType === target.ruler.governmentType) score += 10;
          break;
          
        case 'trade':
          // Prefer any non-hostile nation without existing trade
          if (relationship.atWar || relationship.tradeAgreement) return null;
          score = (relationship.disposition + 0.5) * 10;
          break;
          
        case 'peace':
          // Only consider nations we're at war with
          if (!relationship.atWar) return null;
          score = 10;
          
          // More likely if losing
          const strength = this.calculateStrength(nation) / this.calculateStrength(target);
          if (strength < 0.8) score += 20;
          break;
      }
      
      return { target, score };
    }).filter(t => t !== null && t.score > 0);
    
    if (scored.length === 0) return null;
    
    // Sort by score and pick best
    scored.sort((a, b) => b.score - a.score);
    return scored[0].target;
  }
  
  /**
   * Calculate nation strength
   */
  calculateStrength(nation) {
    return nation.getTotalPopulation() * 0.01 + 
           nation.cities.length * 100 + 
           (nation.militaryStrength || 100);
  }
  
  /**
   * Execute AI diplomatic action
   */
  executeAIDiplomaticAction(initiator, action) {
    const relationship = this.getRelationship(initiator.id, action.target.id);
    
    // Determine if target accepts (based on their traits and relationship)
    const accepted = this.willAccept(action.target, initiator, action.type, relationship);
    
    if (accepted) {
      this.applyDiplomaticOutcome(initiator, action.target, action.type, relationship);
    } else {
      // Rejection damages relationship
      relationship.disposition = Math.max(-1, relationship.disposition - 0.05);
    }
    
    relationship.lastInteraction = this.worldManager.turnNumber;
    relationship.interactionCount++;
    
    // Log action
    console.log(`${accepted ? '✓' : '✗'} ${initiator.name} ${action.type} with ${action.target.name}: ${accepted ? 'ACCEPTED' : 'REJECTED'}`);
    
    // Occasionally notify player of major AI diplomatic events
    if (Math.random() < 0.3 && accepted) {
      let message;
      switch (action.type) {
        case 'war':
          message = `${initiator.name} declares war on ${action.target.name}!`;
          break;
        case 'alliance':
          message = `${initiator.name} and ${action.target.name} form an alliance!`;
          break;
        case 'trade':
          message = `${initiator.name} establishes trade with ${action.target.name}`;
          break;
        case 'peace':
          message = `${initiator.name} makes peace with ${action.target.name}`;
          break;
      }
      
      if (message) {
        this.worldManager.showNotification(message, 'info');
      }
    }
  }
  
  /**
   * Determine if target nation will accept diplomatic proposal
   */
  willAccept(target, initiator, actionType, relationship) {
    let acceptChance = 0.5;
    
    // Disposition heavily influences
    acceptChance += relationship.disposition * 0.5;
    
    // Action-specific modifiers
    switch (actionType) {
      case 'war':
        return true; // Can't reject war declaration
        
      case 'alliance':
        acceptChance += 0.2;
        if (target.ruler.positiveTraits.includes('diplomatic')) acceptChance += 0.2;
        if (target.ruler.negativeTraits.includes('paranoid')) acceptChance -= 0.3;
        break;
        
      case 'trade':
        acceptChance += 0.3;
        if (target.ruler.positiveTraits.includes('shrewd')) acceptChance += 0.2;
        if (target.ruler.negativeTraits.includes('greedy')) acceptChance += 0.1;
        break;
        
      case 'peace':
        acceptChance += 0.2;
        
        // More likely if losing
        const strength = this.calculateStrength(target) / this.calculateStrength(initiator);
        if (strength < 0.8) acceptChance += 0.3;
        break;
    }
    
    return Math.random() < acceptChance;
  }
  
  /**
   * Apply diplomatic outcome
   */
  applyDiplomaticOutcome(initiator, target, actionType, relationship) {
    switch (actionType) {
      case 'war':
        relationship.atWar = true;
        relationship.alliance = false;
        relationship.tradeAgreement = false;
        relationship.disposition = Math.max(-1, relationship.disposition - 0.5);
        
        // Add to global wars
        if (!window.gameState.wars) window.gameState.wars = [];
        window.gameState.wars.push({
          attacker: initiator.id,
          defender: target.id,
          turnDeclared: this.worldManager.turnNumber
        });
        break;
        
      case 'alliance':
        relationship.alliance = true;
        relationship.disposition = Math.min(1, relationship.disposition + 0.3);
        break;
        
      case 'trade':
        relationship.tradeAgreement = true;
        relationship.disposition = Math.min(1, relationship.disposition + 0.15);
        
        // Economic benefits
        initiator.cities.forEach(c => c.growthBonus = (c.growthBonus || 0) + 0.002);
        target.cities.forEach(c => c.growthBonus = (c.growthBonus || 0) + 0.002);
        break;
        
      case 'peace':
        relationship.atWar = false;
        relationship.nonAggressionPact = true;
        relationship.disposition = Math.min(1, relationship.disposition + 0.2);
        
        // Remove from global wars
        if (window.gameState.wars) {
          window.gameState.wars = window.gameState.wars.filter(w =>
            !((w.attacker === initiator.id && w.defender === target.id) ||
              (w.attacker === target.id && w.defender === initiator.id))
          );
        }
        break;
    }
  }
  
  /**
   * Get all AI relationships for display
   */
  getAllRelationships() {
    return Array.from(this.aiRelationships.values());
  }
  
  /**
   * Get relationships involving a specific nation
   */
  getNationRelationships(nationId) {
    return Array.from(this.aiRelationships.values()).filter(r =>
      r.nation1 === nationId || r.nation2 === nationId
    );
  }
}
