/**
 * AIMemory - Memory system for AI Rulers
 * Tracks past interactions, decisions, and outcomes to enable learning
 */

export class AIMemory {
  constructor(rulerAI) {
    this.rulerAI = rulerAI;
    
    // Core memory storage
    this.decisions = [];           // All past decisions
    this.outcomes = [];            // Outcomes of decisions
    this.trustHistory = [];        // Trust level over time
    this.moodHistory = [];         // Mood over time
    
    // Time-based adaptation tracking
    this.lastAdaptationTime = Date.now();
    this.adaptationInterval = 10000; // Re-analyze strategy every 10 seconds
    
    // Aggregated insights
    this.patterns = {
      acceptedAdvice: [],          // Advice types that were accepted
      rejectedAdvice: [],          // Advice types that were rejected
      successfulDecisions: [],     // Decisions that led to positive outcomes
      failedDecisions: []          // Decisions that led to negative outcomes
    };
    
    // Strategy adaptation
    this.strategyModifiers = {
      receptiveness: 0,            // Adjust based on success rate
      riskTolerance: 0,            // Adjust based on outcome patterns
      trustWeight: 0               // Adjust trust sensitivity
    };
    
    // Configuration
    this.maxMemories = 100;        // Maximum decisions to retain
    this.recentWindow = 10;        // Number of recent decisions for pattern analysis
  }
  
  /**
   * Process elapsed time for time-based strategy adaptation
   * @param {number} elapsedMs - Milliseconds that have elapsed (already scaled by gameSpeed)
   * @returns {object} - Adaptation info if triggered
   */
  processTimeElapsed(elapsedMs) {
    const now = Date.now();
    const timeSinceLastAdapt = now - this.lastAdaptationTime;
    
    // Only adapt periodically (not on every frame)
    if (timeSinceLastAdapt < this.adaptationInterval) {
      return { adapted: false, nextIn: this.adaptationInterval - timeSinceLastAdapt };
    }
    
    // Time to re-analyze and adapt strategy
    this.lastAdaptationTime = now;
    this.adaptStrategy();
    
    return { adapted: true, modifiers: { ...this.strategyModifiers } };
  }
  
  /**
   * Set adaptation interval
   * @param {number} intervalMs - Milliseconds between strategy adaptations
   */
  setAdaptationInterval(intervalMs) {
    this.adaptationInterval = intervalMs;
  }
  
  /**
   * Record a decision with its context and outcome
   * @param {string} advice - The player's advice text
   * @param {object} decision - The ruler's decision (accepted/rejected)
   * @param {string} outcome - Result of the decision ('success', 'failure', 'neutral')
   */
  recordDecision(advice, decision, outcome) {
    const record = {
      id: this.decisions.length,
      timestamp: Date.now(),
      advice: advice,
      accepted: decision.accepted,
      reasoning: decision.reasoning,
      response: decision.response,
      outcome: outcome,
      trustAtTime: this.rulerAI.getTrust(),
      moodAtTime: this.rulerAI.getMood()
    };
    
    this.decisions.push(record);
    
    // Track in patterns
    if (decision.accepted) {
      this.patterns.acceptedAdvice.push({
        advice,
        outcome,
        timestamp: Date.now()
      });
    } else {
      this.patterns.rejectedAdvice.push({
        advice,
        outcome,
        timestamp: Date.now()
      });
    }
    
    // Track outcomes
    if (outcome === 'success') {
      this.patterns.successfulDecisions.push(record);
    } else if (outcome === 'failure') {
      this.patterns.failedDecisions.push(record);
    }
    
    // Record trust and mood history
    this.trustHistory.push({
      timestamp: Date.now(),
      turn: this.rulerAI.worldManager?.turnNumber || 0,
      trust: this.rulerAI.getTrust()
    });
    
    this.moodHistory.push({
      timestamp: Date.now(),
      turn: this.rulerAI.worldManager?.turnNumber || 0,
      mood: this.rulerAI.getMood()
    });
    
    // Trim if over limit
    if (this.decisions.length > this.maxMemories) {
      this.trimMemories();
    }
    
    // Update strategy based on this decision
    this.adaptStrategy();
    
    console.log(`[AIMemory] Recorded decision #${record.id}: ${decision.accepted ? 'ACCEPTED' : 'REJECTED'} → ${outcome}`);
  }
  
  /**
   * Trim oldest memories when over limit
   */
  trimMemories() {
    const toRemove = this.decisions.length - this.maxMemories;
    this.decisions = this.decisions.slice(toRemove);
  }
  
  /**
   * Get relevant past context for current decision-making
   * @param {number} maxItems - Maximum number of memories to return
   * @returns {object} Context object with relevant memories
   */
  getMemory(maxItems = 5) {
    const recent = this.decisions.slice(-maxItems);
    
    // Analyze success rate
    const recentOutcomes = recent.filter(d => d.outcome !== 'neutral');
    const successCount = recentOutcomes.filter(d => d.outcome === 'success').length;
    const successRate = recentOutcomes.length > 0 
      ? successCount / recentOutcomes.length 
      : 0.5;
    
    // Find patterns in accepted vs rejected
    const acceptedWithGoodOutcome = this.patterns.acceptedAdvice
      .filter(a => a.outcome === 'success')
      .slice(-3);
    
    const rejectedWithGoodOutcome = this.patterns.rejectedAdvice
      .filter(a => a.outcome === 'success')
      .slice(-3);
    
    return {
      recentDecisions: recent.map(d => ({
        advice: d.advice.substring(0, 100),
        accepted: d.accepted,
        outcome: d.outcome
      })),
      successRate: successRate.toFixed(2),
      totalDecisions: this.decisions.length,
      acceptedCount: this.patterns.acceptedAdvice.length,
      rejectedCount: this.patterns.rejectedAdvice.length,
      successfulDecisions: this.patterns.successfulDecisions.length,
      failedDecisions: this.patterns.failedDecisions.length,
      learnedFromAcceptance: acceptedWithGoodOutcome.map(a => a.advice.substring(0, 50)),
      missedOpportunities: rejectedWithGoodOutcome.map(a => a.advice.substring(0, 50)),
      strategyModifiers: { ...this.strategyModifiers },
      trustTrend: this.getTrustTrend(),
      moodTrend: this.getMoodTrend()
    };
  }
  
  /**
   * Get trust trend over recent decisions
   * @returns {string} Trend description
   */
  getTrustTrend() {
    if (this.trustHistory.length < 2) return 'insufficient_data';
    
    const recent = this.trustHistory.slice(-this.recentWindow);
    const first = recent[0].trust;
    const last = recent[recent.length - 1].trust;
    const diff = last - first;
    
    if (diff > 0.1) return 'rising';
    if (diff < -0.1) return 'falling';
    return 'stable';
  }
  
  /**
   * Get mood trend over recent decisions
   * @returns {string} Trend description
   */
  getMoodTrend() {
    if (this.moodHistory.length < 2) return 'insufficient_data';
    
    const recent = this.moodHistory.slice(-this.recentWindow);
    const first = recent[0].mood;
    const last = recent[recent.length - 1].mood;
    const diff = last - first;
    
    if (diff > 0.2) return 'improving';
    if (diff < -0.2) return 'declining';
    return 'stable';
  }
  
  /**
   * Analyze patterns and adjust AI behavior accordingly
   * This is called after each decision to refine strategy
   */
  adaptStrategy() {
    if (this.decisions.length < 3) return;
    
    // Calculate success metrics
    const recentDecisions = this.decisions.slice(-this.recentWindow);
    const recentAccepted = recentDecisions.filter(d => d.accepted);
    const recentWithOutcome = recentDecisions.filter(d => d.outcome !== 'neutral');
    
    // Success rate for accepted decisions
    const acceptedSuccessRate = recentAccepted.length > 0
      ? recentAccepted.filter(d => d.outcome === 'success').length / recentAccepted.length
      : 0.5;
    
    // Adjust receptiveness based on success rate
    if (acceptedSuccessRate > 0.7) {
      // High success rate = more receptive
      this.strategyModifiers.receptiveness = Math.min(0.2, this.strategyModifiers.receptiveness + 0.02);
    } else if (acceptedSuccessRate < 0.4) {
      // Low success rate = less receptive
      this.strategyModifiers.receptiveness = Math.max(-0.2, this.strategyModifiers.receptiveness - 0.02);
    }
    
    // Adjust based on failed decisions
    const recentFailures = recentWithOutcome.filter(d => d.outcome === 'failure').length;
    const failureRate = recentWithOutcome.length > 0 
      ? recentFailures / recentWithOutcome.length 
      : 0;
    
    if (failureRate > 0.5) {
      // High failure rate = more cautious
      this.strategyModifiers.riskTolerance = Math.max(-0.2, this.strategyModifiers.riskTolerance - 0.03);
    } else if (failureRate < 0.2) {
      // Low failure rate = more confident
      this.strategyModifiers.riskTolerance = Math.min(0.2, this.strategyModifiers.riskTolerance + 0.03);
    }
    
    // Adjust trust weight based on trust trend
    const trustTrend = this.getTrustTrend();
    if (trustTrend === 'falling') {
      this.strategyModifiers.trustWeight = Math.max(-0.2, this.strategyModifiers.trustWeight - 0.05);
    } else if (trustTrend === 'rising') {
      this.strategyModifiers.trustWeight = Math.min(0.2, this.strategyModifiers.trustWeight + 0.05);
    }
    
    console.log(`[AIMemory] Strategy updated:`, this.strategyModifiers);
  }
  
  /**
   * Get modified decision parameters based on learned patterns
   * @returns {object} Modified parameters for RulerAI
   */
  getModifiedParams() {
    return {
      receptiveness: this.strategyModifiers.receptiveness,
      riskTolerance: this.strategyModifiers.riskTolerance,
      trustWeight: this.strategyModifiers.trustWeight,
      // Effective trust/mood with modifiers
      effectiveTrust: Math.max(0, Math.min(1, 
        this.rulerAI.getTrust() + this.strategyModifiers.trustWeight
      )),
      effectiveMood: Math.max(-1, Math.min(1, 
        this.rulerAI.getMood() + this.strategyModifiers.receptiveness
      ))
    };
  }
  
  /**
   * Get advice that was previously rejected but turned out well
   * Useful for showing the ruler what they missed
   * @returns {Array} List of missed opportunities
   */
  getMissedOpportunities() {
    return this.patterns.rejectedAdvice
      .filter(a => a.outcome === 'success')
      .map(a => a.advice);
  }
  
  /**
   * Get advice that was accepted and succeeded
   * @returns {Array} List of successful accepted advice
   */
  getSuccessfulAdvice() {
    return this.patterns.successfulDecisions.map(d => d.advice);
  }
  
  /**
   * Get a summary of the ruler's memory state
   * @returns {string} Human-readable summary
   */
  getSummary() {
    const memory = this.getMemory();
    const trends = {
      trust: this.getTrustTrend(),
      mood: this.getMoodTrend()
    };
    
    return `
Memory Summary:
- Total decisions recorded: ${memory.totalDecisions}
- Accepted: ${memory.acceptedCount} | Rejected: ${memory.rejectedCount}
- Success Rate: ${(memory.successRate * 100).toFixed(0)}%
- Successful outcomes: ${memory.successfulDecisions}
- Failed outcomes: ${memory.failedDecisions}
- Trust trend: ${trends.trust}
- Mood trend: ${trends.mood}
- Strategy modifiers: R=${this.strategyModifiers.receptiveness.toFixed(2)}, 
  Risk=${this.strategyModifiers.riskTolerance.toFixed(2)}, 
  TrustW=${this.strategyModifiers.trustWeight.toFixed(2)}
    `.trim();
  }
  
  /**
   * Clear all memories (for testing or reset)
   */
  clear() {
    this.decisions = [];
    this.outcomes = [];
    this.trustHistory = [];
    this.moodHistory = [];
    this.patterns = {
      acceptedAdvice: [],
      rejectedAdvice: [],
      successfulDecisions: [],
      failedDecisions: []
    };
    this.strategyModifiers = {
      receptiveness: 0,
      riskTolerance: 0,
      trustWeight: 0
    };
    console.log('[AIMemory] Memory cleared');
  }
}

/**
 * Integration helper to add memory to existing RulerAI
 * This can be used to patch the existing RulerAI class
 */
export function integrateMemory(rulerAI) {
  const memory = new AIMemory(rulerAI);
  
  // Wrap the evaluateAdvice method to include memory context
  const originalEvaluateAdvice = rulerAI.evaluateAdvice.bind(rulerAI);
  
  rulerAI.evaluateAdvice = async function(adviceText, canThreaten = false) {
    // Get memory context
    const memoryContext = memory.getMemory(3);
    const modifiedParams = memory.getModifiedParams();
    
    // Inject memory context into the evaluation
    this._memoryContext = memoryContext;
    this._modifiedParams = modifiedParams;
    
    // Call original method
    const decision = await originalEvaluateAdvice(adviceText, canThreaten);
    
    // Store decision for later outcome tracking
    this._lastDecision = decision;
    this._lastAdvice = adviceText;
    
    return decision;
  };
  
  // Add method to record outcome
  rulerAI.recordOutcome = function(outcome) {
    if (this._lastDecision && this._lastAdvice) {
      memory.recordDecision(this._lastAdvice, this._lastDecision, outcome);
      this._lastDecision = null;
      this._lastAdvice = null;
    }
  };
  
  // Add memory reference to rulerAI
  rulerAI.memory = memory;
  
  console.log('[AIMemory] Integrated with RulerAI');
  return memory;
}
