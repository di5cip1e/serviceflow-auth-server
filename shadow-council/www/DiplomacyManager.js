import { POSITIVE_TRAITS, NEGATIVE_TRAITS, GOVERNMENT_TYPES } from './config.js';

/**
 * DiplomacyManager - Handles player diplomacy with rival rulers
 * Uses same chat UI as counsel system but routes to different AI rulers
 * Phase 4: Diplomacy System
 */
export class DiplomacyManager {
  constructor(worldManager, counselUI) {
    this.worldManager = worldManager;
    this.counselUI = counselUI;
    // Initialize ChatManager instance
    this.chatManager = window.ChatManager ? new window.ChatManager() : null;
    
    // Track diplomatic relationships
    this.relationships = new Map(); // nationId -> { disposition, history, treaties }
    this.currentRuler = null; // Currently active chat
    
    // Diplomatic actions history
    this.diplomacyLog = [];
    
    this.initializeRelationships();
  }
  
  /**
   * Initialize diplomatic relationships with all rival nations
   */
  initializeRelationships() {
    const playerNation = this.worldManager.getPlayerNation();
    
    this.worldManager.nations.forEach(nation => {
      if (nation.id === playerNation.id) return; // Skip player
      
      // Calculate initial disposition based on government compatibility
      const disposition = this.calculateInitialDisposition(
        playerNation.ruler.governmentType,
        nation.ruler.governmentType
      );
      
      this.relationships.set(nation.id, {
        nationId: nation.id,
        disposition: disposition, // -1 (hostile) to +1 (friendly)
        trustLevel: 0.3, // 0 to 1
        fearLevel: 0, // 0 to 1 (from threats)
        treaties: [], // Trade, alliance, non-aggression
        tradeValue: 0,
        lastContact: 0,
        conversationHistory: []
      });
    });
    
    console.log(`✓ Initialized diplomacy with ${this.relationships.size} rival nations`);
  }
  
  /**
   * Calculate initial disposition based on government types
   */
  calculateInitialDisposition(playerGov, rivalGov) {
    // Compatible governments start friendlier
    const compatibility = {
      'democracy-democracy': 0.4,
      'autocracy-autocracy': 0.2,
      'theocracy-theocracy': 0.3,
      'oligarchy-oligarchy': 0.3,
      'militarism-militarism': 0.1,
      
      'democracy-autocracy': -0.3,
      'democracy-militarism': -0.2,
      'theocracy-oligarchy': -0.1,
      'autocracy-democracy': -0.3,
      'militarism-democracy': -0.2
    };
    
    const key = `${playerGov}-${rivalGov}`;
    const reverseKey = `${rivalGov}-${playerGov}`;
    
    return compatibility[key] || compatibility[reverseKey] || 0;
  }
  
  /**
   * Open diplomacy chat with a specific ruler
   */
  openDiplomacy(nationId) {
    const nation = this.worldManager.nations.find(n => n.id === nationId);
    if (!nation) {
      console.error('Nation not found:', nationId);
      return;
    }
    
    this.currentRuler = nation;
    
    // Update counsel UI to show we're talking to a rival
    this.counselUI.setDiplomacyMode(nation);
    
    // Show greeting message
    const relationship = this.relationships.get(nationId);
    const greeting = this.generateGreeting(nation, relationship);
    this.counselUI.addRulerMessage(greeting, true);
    
    console.log(`Opened diplomacy with ${nation.name}`);
  }
  
  /**
   * Generate contextual greeting from rival ruler
   */
  generateGreeting(nation, relationship) {
    const disposition = relationship.disposition;
    
    if (disposition > 0.5) {
      return `Greetings, friend. ${nation.ruler.name} of ${nation.name} welcomes your emissary. How may we cooperate?`;
    } else if (disposition > 0) {
      return `${nation.ruler.name} acknowledges your presence. State your business.`;
    } else if (disposition > -0.5) {
      return `Our nations have little in common, but I will hear you. Speak quickly.`;
    } else {
      return `You dare approach ${nation.name}? ${nation.ruler.name} does not suffer fools. Make your proposition... if you value your life.`;
    }
  }
  
  /**
   * Handle diplomatic proposal from player
   */
  async handleProposal(proposalText) {
    if (!this.currentRuler) {
      console.error('No active diplomatic session');
      return;
    }
    
    console.log('=== DIPLOMATIC PROPOSAL ===');
    console.log('To:', this.currentRuler.name);
    console.log('Proposal:', proposalText);
    
    const relationship = this.relationships.get(this.currentRuler.id);
    
    // Classify proposal type
    const proposalType = this.classifyProposal(proposalText);
    
    // Build context for AI
    const context = this.buildDiplomaticContext(this.currentRuler, relationship, proposalType);
    
    // Get AI response
    const decision = await this.getAIResponse(
      this.currentRuler,
      proposalText,
      context,
      relationship
    );
    
    // Update relationship based on response
    this.updateRelationship(relationship, proposalType, decision);
    
    // Show response in UI
    this.counselUI.addRulerMessage(decision.response, decision.accepted);
    
    // Execute diplomatic action if accepted
    if (decision.accepted) {
      this.executeDiplomaticAction(proposalType, this.currentRuler, proposalText);
    }
    
    // Log to history
    this.logDiplomacy(this.currentRuler, proposalText, decision, proposalType);
    
    return decision;
  }
  
  /**
   * Classify the type of diplomatic proposal
   */
  classifyProposal(text) {
    const lower = text.toLowerCase();
    
    if (lower.match(/alliance|ally|unite|together|join forces/)) {
      return 'alliance';
    }
    if (lower.match(/trade|commerce|goods|exchange|merchant/)) {
      return 'trade';
    }
    if (lower.match(/peace|cease.*fire|end.*war|treaty/)) {
      return 'peace';
    }
    if (lower.match(/war|attack|invade|destroy|conquer/)) {
      return 'war_request';
    }
    if (lower.match(/threaten|or else|submit|surrender|bow/)) {
      return 'threat';
    }
    if (lower.match(/gold|money|tribute|payment|wealth/)) {
      return 'tribute';
    }
    if (lower.match(/land|territory|border|tile/)) {
      return 'territory';
    }
    if (lower.match(/information|intel|spy|secret/)) {
      return 'intelligence';
    }
    
    return 'general';
  }
  
  /**
   * Build diplomatic context for AI decision
   */
  buildDiplomaticContext(nation, relationship, proposalType) {
    const playerNation = this.worldManager.getPlayerNation();
    
    // Calculate relative strength
    const playerStrength = this.calculateNationStrength(playerNation);
    const rivalStrength = this.calculateNationStrength(nation);
    const strengthRatio = playerStrength / (rivalStrength || 1);
    
    // Check if at war
    const atWar = this.areAtWar(playerNation.id, nation.id);
    
    return {
      proposalType,
      disposition: relationship.disposition,
      trust: relationship.trustLevel,
      fear: relationship.fearLevel,
      strengthRatio,
      atWar,
      playerCities: playerNation.cities.length,
      rivalCities: nation.cities.length,
      playerPopulation: Math.floor(playerNation.getTotalPopulation()),
      rivalPopulation: Math.floor(nation.getTotalPopulation()),
      treaties: relationship.treaties,
      lastContact: relationship.lastContact
    };
  }
  
  /**
   * Calculate nation military/economic strength
   */
  calculateNationStrength(nation) {
    const population = nation.getTotalPopulation();
    const cities = nation.cities.length;
    const military = nation.militaryStrength || 100;
    
    return population * 0.01 + cities * 100 + military;
  }
  
  /**
   * Check if two nations are at war
   */
  areAtWar(nationId1, nationId2) {
    const wars = window.gameState.wars || [];
    return wars.some(w => 
      (w.attacker === nationId1 && w.defender === nationId2) ||
      (w.attacker === nationId2 && w.defender === nationId1)
    );
  }
  
  /**
   * Get AI response using LLM or fallback
   */
  async getAIResponse(nation, proposal, context, relationship) {
    const systemPrompt = this.buildDiplomaticSystemPrompt(nation, context);
    const userPrompt = this.buildDiplomaticUserPrompt(proposal, context);
    
    try {
      if (this.chatManager) {
        const response = await this.chatManager.sendMessage(
          userPrompt,
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          { temperature: 0.8, maxTokens: 300 }
        );
        
        return this.parseResponse(response);
      }
    } catch (error) {
      console.warn('LLM failed, using fallback:', error);
    }
    
    // Fallback decision
    return this.fallbackDecision(nation, context);
  }
  
  /**
   * Build system prompt for diplomatic AI
   */
  buildDiplomaticSystemPrompt(nation, context) {
    const ruler = nation.ruler;
    const govType = GOVERNMENT_TYPES[ruler.governmentType];
    
    const positiveTraits = ruler.positiveTraits.map(id => {
      const trait = POSITIVE_TRAITS.find(t => t.id === id);
      return `- ${trait.name}: ${trait.impact}`;
    }).join('\n');
    
    const negativeTraits = ruler.negativeTraits.map(id => {
      const trait = NEGATIVE_TRAITS.find(t => t.id === id);
      return `- ${trait.name}: ${trait.impact}`;
    }).join('\n');
    
    const dispositionText = context.disposition > 0.5 ? 'friendly' :
                            context.disposition > 0 ? 'neutral' :
                            context.disposition > -0.5 ? 'suspicious' : 'hostile';
    
    return `You are ${ruler.name}, ruler of ${nation.name}, receiving a diplomatic proposal from a rival nation.

PERSONALITY:
Government: ${govType.name} - ${govType.description}

Positive Traits:
${positiveTraits}

Negative Traits:
${negativeTraits || 'None'}

CURRENT RELATIONSHIP:
- Disposition: ${dispositionText} (${context.disposition.toFixed(2)})
- Trust Level: ${(context.trust * 100).toFixed(0)}%
- Fear Level: ${(context.fear * 100).toFixed(0)}%
${context.atWar ? '- STATUS: AT WAR' : ''}

POWER BALANCE:
- Your Cities: ${context.rivalCities}
- Their Cities: ${context.playerCities}
- Relative Strength: ${context.strengthRatio < 0.7 ? 'They are stronger' : context.strengthRatio > 1.3 ? 'You are stronger' : 'Roughly equal'}

EXISTING TREATIES:
${context.treaties.length > 0 ? context.treaties.map(t => `- ${t.type}`).join('\n') : '- None'}

DECISION-MAKING:
Your personality HEAVILY influences your response:
- Diplomatic trait makes you favor cooperation
- Arrogant trait makes you dismissive
- Paranoid trait makes you suspicious of all proposals
- Greedy trait makes you want payment
- Brave/Ambitious traits favor aggressive actions
- Weak-willed trait makes you susceptible to threats
- Your government type affects what you value

Be consistent with your personality. Negative traits should cause you to reject good deals sometimes.`;
  }
  
  /**
   * Build user prompt for diplomatic request
   */
  buildDiplomaticUserPrompt(proposal, context) {
    return `The emissary from the rival nation proposes: "${proposal}"

Type of proposal: ${context.proposalType}
Current situation: ${context.atWar ? 'You are at war with them' : 'You are at peace'}

Consider:
1. Does this proposal benefit you given your traits and government?
2. Can you trust them based on your relationship history?
3. Does your personality make you receptive or hostile to this type of deal?
4. Are they strong enough to threaten you, or weak enough to exploit?
5. Would your negative traits cause you to reject a good deal?

Respond with JSON:
{
  "accept": true/false,
  "reasoning": "Why you accepted/rejected (1-2 sentences)",
  "response": "What you say to their emissary (2-3 sentences, in character, addressing them directly)"
}

Be authentic. Your flaws should influence your decisions.`;
  }
  
  /**
   * Parse LLM response
   */
  parseResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          accepted: Boolean(data.accept),
          reasoning: data.reasoning || 'No reasoning provided',
          response: data.response || 'I have made my decision.',
          llmRaw: response
        };
      }
    } catch (e) {
      console.warn('Failed to parse diplomatic response:', e);
    }
    
    // Fallback parsing
    const acceptKeywords = ['accept', 'agree', 'yes', 'deal', 'treaty'];
    const rejectKeywords = ['reject', 'refuse', 'no', 'never', 'decline'];
    
    const lower = response.toLowerCase();
    const acceptCount = acceptKeywords.filter(k => lower.includes(k)).length;
    const rejectCount = rejectKeywords.filter(k => lower.includes(k)).length;
    
    return {
      accepted: acceptCount > rejectCount,
      reasoning: 'Parsed from natural language',
      response: response.trim()
    };
  }
  
  /**
   * Fallback decision logic
   */
  fallbackDecision(nation, context) {
    let acceptChance = 0.5;
    
    // Disposition heavily influences
    acceptChance += context.disposition * 0.5;
    
    // Proposal type modifiers
    const typeModifiers = {
      'alliance': 0.2,
      'trade': 0.3,
      'peace': 0.2,
      'war_request': -0.3,
      'threat': -0.4,
      'tribute': -0.2,
      'territory': -0.3,
      'intelligence': 0.1,
      'general': 0
    };
    acceptChance += typeModifiers[context.proposalType] || 0;
    
    // Strength ratio affects threats
    if (context.proposalType === 'threat') {
      if (context.strengthRatio > 1.5) {
        acceptChance += 0.3; // More likely if player is strong
      } else {
        acceptChance -= 0.2; // Less likely if player is weak
      }
    }
    
    // Trait modifiers
    const ruler = nation.ruler;
    if (ruler.positiveTraits.includes('diplomatic')) acceptChance += 0.2;
    if (ruler.negativeTraits.includes('arrogant')) acceptChance -= 0.2;
    if (ruler.negativeTraits.includes('paranoid')) acceptChance -= 0.15;
    if (ruler.negativeTraits.includes('greedy') && context.proposalType !== 'tribute') acceptChance -= 0.1;
    
    const accepted = Math.random() < acceptChance;
    
    return {
      accepted,
      reasoning: 'Fallback decision',
      response: accepted ?
        `${nation.ruler.name} finds your proposal... acceptable. Let it be so.` :
        `${nation.ruler.name} rejects your proposal. We have no interest in this arrangement.`
    };
  }
  
  /**
   * Update relationship based on interaction
   */
  updateRelationship(relationship, proposalType, decision) {
    if (decision.accepted) {
      // Successful diplomacy improves relations
      relationship.disposition = Math.min(1, relationship.disposition + 0.1);
      relationship.trustLevel = Math.min(1, relationship.trustLevel + 0.05);
      
      if (proposalType === 'threat') {
        relationship.fearLevel = Math.min(1, relationship.fearLevel + 0.2);
        relationship.disposition = Math.max(-1, relationship.disposition - 0.15);
      }
    } else {
      // Rejection damages relations slightly
      relationship.trustLevel = Math.max(0, relationship.trustLevel - 0.02);
      
      if (proposalType === 'threat') {
        relationship.disposition = Math.max(-1, relationship.disposition - 0.3);
        relationship.fearLevel = Math.max(0, relationship.fearLevel - 0.1);
      }
    }
    
    relationship.lastContact = this.worldManager.turnNumber;
  }
  
  /**
   * Execute diplomatic action
   */
  executeDiplomaticAction(type, nation, proposalText) {
    const relationship = this.relationships.get(nation.id);
    const playerNation = this.worldManager.getPlayerNation();
    
    switch (type) {
      case 'alliance':
        relationship.treaties.push({
          type: 'alliance',
          turn: this.worldManager.turnNumber,
          terms: 'Military alliance and mutual defense'
        });
        this.worldManager.showNotification(`Alliance formed with ${nation.name}!`, 'success');
        break;
        
      case 'trade':
        relationship.treaties.push({
          type: 'trade',
          turn: this.worldManager.turnNumber,
          terms: 'Trade agreement'
        });
        relationship.tradeValue = 100; // Base trade value
        
        // Boost both nations' economies
        playerNation.cities.forEach(c => c.growthBonus = (c.growthBonus || 0) + 0.003);
        nation.cities.forEach(c => c.growthBonus = (c.growthBonus || 0) + 0.003);
        
        this.worldManager.showNotification(`Trade agreement with ${nation.name}!`, 'success');
        break;
        
      case 'peace':
        // End war if exists
        if (!window.gameState.wars) window.gameState.wars = [];
        window.gameState.wars = window.gameState.wars.filter(w =>
          !((w.attacker === playerNation.id && w.defender === nation.id) ||
            (w.attacker === nation.id && w.defender === playerNation.id))
        );
        
        relationship.treaties.push({
          type: 'peace',
          turn: this.worldManager.turnNumber,
          terms: 'Peace treaty and non-aggression pact'
        });
        
        this.worldManager.showNotification(`Peace with ${nation.name}!`, 'success');
        break;
        
      case 'war_request':
        // Joint war declaration (Phase 5)
        this.worldManager.showNotification(`${nation.name} will support your war!`, 'info');
        break;
        
      default:
        this.worldManager.showNotification(`Agreement reached with ${nation.name}`, 'info');
    }
  }
  
  /**
   * Log diplomatic interaction
   */
  logDiplomacy(nation, proposal, decision, type) {
    this.diplomacyLog.push({
      turn: this.worldManager.turnNumber,
      nationId: nation.id,
      nationName: nation.name,
      proposal: proposal,
      type: type,
      accepted: decision.accepted,
      response: decision.response,
      timestamp: Date.now()
    });
    
    const relationship = this.relationships.get(nation.id);
    relationship.conversationHistory.push({
      turn: this.worldManager.turnNumber,
      proposal,
      response: decision.response,
      accepted: decision.accepted
    });
  }
  
  /**
   * Get relationship status with a nation
   */
  getRelationship(nationId) {
    return this.relationships.get(nationId);
  }
  
  /**
   * Get all relationships
   */
  getAllRelationships() {
    return Array.from(this.relationships.values());
  }
  
  /**
   * Close diplomacy session
   */
  closeDiplomacy() {
    this.currentRuler = null;
    this.counselUI.setDiplomacyMode(null);
  }
  
  /**
   * Cancel all treaties with a nation (for elimination)
   */
  cancelAllTreatiesWithNation(nationId) {
    // Remove treaties from this nation
    this.relationships.delete(nationId);
    
    // Remove treaties from all other nations involving this nation
    for (const [otherNationId, relationship] of this.relationships.entries()) {
      if (relationship.treaties) {
        relationship.treaties = relationship.treaties.filter(
          treaty => !treaty.nations || !treaty.nations.includes(nationId)
        );
      }
    }
  }
  
  /**
   * Check if two nations are at war
   */
  areNationsAtWar(nationId1, nationId2) {
    const nation1 = this.worldManager.nations.find(n => n.id === nationId1);
    const nation2 = this.worldManager.nations.find(n => n.id === nationId2);
    
    if (!nation1 || !nation2) return false;
    
    // Check war arrays
    if (nation1.wars && nation1.wars.some(w => w.enemyId === nationId2)) {
      return true;
    }
    if (nation2.wars && nation2.wars.some(w => w.enemyId === nationId1)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get treaties for a nation (for income system)
   */
  getTreatiesForNation(nationId) {
    const relationship = this.relationships.get(nationId);
    return relationship ? relationship.treaties : [];
  }
}
