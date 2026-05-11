/**
 * M.ai.K.R Swarm Orchestrator — State Machine
 * Manages transitions between sub-agents based on user intent.
 */

const { classify } = require('../services/intentClassifier');

// All possible swarm states
const SWARM_STATES = {
  ROUTING:     'ROUTING',     // Supervisor is classifying intent
  SUPPORT:     'SUPPORT',     // Customer Support sub-agent active
  SALES:       'SALES',       // Sales sub-agent active
  ONBOARDING:  'ONBOARDING',  // Onboarding/welcome flow active
  GENERAL:     'GENERAL',    // General conversational agent
  ADMIN:       'ADMIN',      // Admin/management tasks
};

// Intent → State mapping
const INTENT_TO_STATE = {
  'support':    SWARM_STATES.SUPPORT,
  'sales':      SWARM_STATES.SALES,
  'onboarding': SWARM_STATES.ONBOARDING,
  'admin':      SWARM_STATES.ADMIN,
  'general':    SWARM_STATES.GENERAL,
};

/**
 * The main SwarmState machine.
 * Call classify(message) → returns a state string.
 */
class SwarmStateMachine {
  constructor(options = {}) {
    this.lastState = null;
    this.conversationState = {}; // per-conversation state
  }

  /**
   * Get or create state for a given conversation.
   */
  getConversationState(conversationId) {
    if (!this.conversationState[conversationId]) {
      this.conversationState[conversationId] = {
        currentState: SWARM_STATES.ROUTING,
        history: [],
        lastIntent: null,
      };
    }
    return this.conversationState[conversationId];
  }

  /**
   * Classify a user message and return the target state.
   */
  async classify(message, conversationId = 'default') {
    const state = this.getConversationState(conversationId);
    
    // Run intent classification
    const result = await classify(message);
    const targetState = INTENT_TO_STATE[result.intent] || SWARM_STATES.GENERAL;
    
    // Record transition
    state.history.push({
      from: state.currentState,
      to: targetState,
      intent: result.intent,
      confidence: result.confidence,
      timestamp: new Date().toISOString(),
      messagePreview: message.slice(0, 100),
    });
    
    state.currentState = targetState;
    state.lastIntent = result.intent;
    this.lastState = targetState;
    
    return {
      state: targetState,
      confidence: result.confidence,
      intent: result.intent,
      trace: state.history,
    };
  }

  /**
   * Force a transition to a specific state (for manual override).
   */
  forceState(conversationId, targetState) {
    const state = this.getConversationState(conversationId);
    state.history.push({
      from: state.currentState,
      to: targetState,
      intent: 'manual_override',
      timestamp: new Date().toISOString(),
    });
    state.currentState = targetState;
    return { state: targetState, trace: state.history };
  }

  /**
   * Reset conversation state.
   */
  reset(conversationId) {
    delete this.conversationState[conversationId];
    return { ok: true };
  }

  /**
   * Get full trace for a conversation.
   */
  getTrace(conversationId) {
    const state = this.getConversationState(conversationId);
    return state.history;
  }
}

module.exports = { SwarmStateMachine, SWARM_STATES };
