import { POSITIVE_TRAITS, NEGATIVE_TRAITS, GOVERNMENT_TYPES } from './config.js';

export class RulerAI {
  constructor(worldManager) {
    this.worldManager = worldManager;
    // Initialize ChatManager instance
    this.chatManager = window.ChatManager ? new window.ChatManager() : null;
    this.conversationHistory = [];
    this.mood = 0; // -1 (angry) to +1 (pleased)
    this.trustLevel = 0.5; // 0 (no trust) to 1 (full trust)
    this.mistakeCount = 0; // Track ruler mistakes
  }
  
  async evaluateAdvice(adviceText, canThreaten = false) {
    const playerNation = this.worldManager.getPlayerNation();
    const ruler = playerNation.ruler;
    
    // Build context
    const context = this.buildContext(ruler, playerNation);
    
    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(ruler, context);
    
    // Build user prompt
    const userPrompt = this.buildUserPrompt(adviceText, context, canThreaten);
    
    try {
      // Call LLM via ChatManager
      const response = await this.callLLM(systemPrompt, userPrompt);
      
      // Parse response
      const decision = this.parseResponse(response);
      
      // Update mood and trust based on decision
      this.updateRelationship(decision);
      
      return decision;
      
    } catch (error) {
      console.error('LLM Error:', error);
      
      // Fallback to rule-based decision
      return this.fallbackDecision(adviceText, ruler);
    }
  }
  
  buildContext(ruler, nation) {
    const turn = this.worldManager.turnNumber;
    const population = nation.getTotalPopulation();
    const cityCount = nation.cities.length;
    
    // Count territory
    let territoryCount = 0;
    for (let y = 0; y < this.worldManager.world.height; y++) {
      for (let x = 0; x < this.worldManager.world.width; x++) {
        if (this.worldManager.world.tiles[y][x].nationId === 0) {
          territoryCount++;
        }
      }
    }
    
    // Get rival info
    const rivals = this.worldManager.nations.slice(1).map(n => ({
      name: n.name,
      cities: n.cities.length,
      population: Math.floor(n.getTotalPopulation())
    }));
    
    return {
      turn,
      population: Math.floor(population),
      cityCount,
      territoryCount,
      rivals,
      mood: this.mood,
      trust: this.trustLevel,
      recentMistakes: this.mistakeCount
    };
  }
  
  buildSystemPrompt(ruler, context) {
    const govType = GOVERNMENT_TYPES[ruler.governmentType];
    
    const positiveTraitDescriptions = ruler.positiveTraits.map(id => {
      const trait = POSITIVE_TRAITS.find(t => t.id === id);
      return `- ${trait.name}: ${trait.impact}`;
    }).join('\n');
    
    const negativeTraitDescriptions = ruler.negativeTraits.map(id => {
      const trait = NEGATIVE_TRAITS.find(t => t.id === id);
      return `- ${trait.name}: ${trait.impact}`;
    }).join('\n');
    
    const pronouns = ruler.gender === 'male' ? 'he/him' : 
                     ruler.gender === 'female' ? 'she/her' : 'they/them';
    
    const moodText = context.mood > 0.3 ? 'pleased' : 
                     context.mood < -0.3 ? 'frustrated' : 'neutral';
    
    const trustText = context.trust > 0.7 ? 'trusts their counsel greatly' :
                      context.trust > 0.4 ? 'has moderate trust in their counsel' :
                      'is skeptical of their counsel';
    
    return `You are ${ruler.name}, the ${ruler.gender} ruler of ${context.rivals.length > 0 ? 'a nation among rivals' : 'a growing nation'}.

PERSONALITY:
Government: ${govType.name} - ${govType.description}

Positive Traits:
${positiveTraitDescriptions}

Negative Traits:
${negativeTraitDescriptions || 'None'}

CURRENT STATE:
- Mood: ${moodText} (${context.mood > 0 ? '+' : ''}${context.mood.toFixed(1)})
- Trust in Counsel: ${trustText} (${(context.trust * 100).toFixed(0)}%)
- Turn: ${context.turn}
- Cities: ${context.cityCount}
- Population: ${context.population.toLocaleString()}
- Territory: ${context.territoryCount} tiles
- Recent mistakes: ${context.recentMistakes}

Pronouns: ${pronouns}

DECISION-MAKING:
Your traits heavily influence decisions:
- Positive traits make you MORE likely to accept aligned advice
- Negative traits make you LESS likely to accept good advice that conflicts with your flaws
- Your mood affects receptiveness (pleased = more open, frustrated = more resistant)
- Your trust level affects how much weight you give to counsel's advice
- Recent mistakes lower your confidence

You must respond in character, considering ALL your traits. Be consistent with your personality.`;
  }
  
  buildUserPrompt(adviceText, context, canThreaten) {
    const rivalInfo = context.rivals.map(r => 
      `${r.name}: ${r.cities} cities, ${r.population.toLocaleString()} population`
    ).join('\n');
    
    return `Your counsel says: "${adviceText}"

Current situation:
${rivalInfo ? `Rival nations:\n${rivalInfo}\n` : ''}
Your position: ${context.cityCount} cities, ${context.population.toLocaleString()} population, ${context.territoryCount} tiles

Consider:
1. Does this advice align with your government type and traits?
2. Does your current mood make you more/less receptive?
3. Do you trust your counsel enough to listen?
4. Would your negative traits cause you to reject good advice?

Respond with a JSON object:
{
  "accept": true/false,
  "reasoning": "Internal thought process (1-2 sentences)",
  "response": "What you say to your counsel (1-3 sentences, in character)"
}

Be authentic to your personality. Your negative traits SHOULD cause you to make suboptimal decisions sometimes.`;
  }
  
  async callLLM(systemPrompt, userPrompt) {
    if (!this.chatManager) {
      throw new Error('ChatManager not available');
    }
    
    // Reset conversation for each new advice (stateless per request)
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    // Call ChatManager
    const response = await this.chatManager.sendMessage(
      userPrompt,
      messages,
      {
        temperature: 0.8, // Allow personality variance
        maxTokens: 300
      }
    );
    
    return response;
  }
  
  parseResponse(response) {
    try {
      // Try to extract JSON from response
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
      console.warn('Failed to parse LLM JSON response:', e);
    }
    
    // Fallback: parse natural language
    const acceptKeywords = ['accept', 'agree', 'yes', 'will do', 'wise', 'good counsel'];
    const rejectKeywords = ['reject', 'refuse', 'no', 'disagree', 'foolish', 'will not'];
    
    const lowerResponse = response.toLowerCase();
    const acceptCount = acceptKeywords.filter(k => lowerResponse.includes(k)).length;
    const rejectCount = rejectKeywords.filter(k => lowerResponse.includes(k)).length;
    
    return {
      accepted: acceptCount > rejectCount,
      reasoning: 'Parsed from natural language',
      response: response.trim(),
      llmRaw: response
    };
  }
  
  fallbackDecision(adviceText, ruler) {
    // Simple rule-based fallback if LLM fails
    let acceptChance = 0.5;
    
    // Government modifiers
    if (ruler.governmentType === 'democracy') acceptChance += 0.1;
    if (ruler.governmentType === 'autocracy') acceptChance -= 0.1;
    
    // Trait modifiers
    if (ruler.positiveTraits.includes('diplomatic')) acceptChance += 0.1;
    if (ruler.positiveTraits.includes('shrewd')) acceptChance += 0.05;
    if (ruler.negativeTraits.includes('arrogant')) acceptChance -= 0.15;
    if (ruler.negativeTraits.includes('stubborn')) acceptChance -= 0.1;
    
    // Mood and trust
    acceptChance += this.mood * 0.2;
    acceptChance += (this.trustLevel - 0.5) * 0.3;
    
    const accepted = Math.random() < acceptChance;
    
    return {
      accepted,
      reasoning: 'Fallback decision (LLM unavailable)',
      response: accepted ? 
        'Your counsel is noted. I shall consider this course of action.' :
        'I do not believe this is the right path for our realm.',
      llmRaw: null
    };
  }
  
  updateRelationship(decision) {
    if (decision.accepted) {
      // Accepting advice improves trust slowly
      this.trustLevel = Math.min(1, this.trustLevel + 0.05);
      this.mood = Math.min(1, this.mood + 0.1);
    } else {
      // Rejecting advice damages trust and mood
      this.trustLevel = Math.max(0, this.trustLevel - 0.03);
      this.mood = Math.max(-1, this.mood - 0.15);
    }
    
    // Mood decays toward neutral over time
    this.mood *= 0.9;
  }
  
  recordMistake() {
    this.mistakeCount++;
    this.mood = Math.max(-1, this.mood - 0.2);
    this.trustLevel = Math.max(0, this.trustLevel - 0.1);
    
    console.log(`Ruler made a mistake! Total: ${this.mistakeCount}`);
  }
  
  getMood() {
    return this.mood;
  }
  
  getTrust() {
    return this.trustLevel;
  }
  
  getMistakeCount() {
    return this.mistakeCount;
  }
}
