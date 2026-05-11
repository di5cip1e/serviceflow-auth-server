/**
 * Swarm Router — takes a user message, classifies intent, routes to sub-agent.
 * This is the main entry point for the swarm system.
 */

const { SwarmStateMachine, SWARM_STATES } = require('./stateMachine');
const { classify } = require('../services/intentClassifier');

// Sub-agent system prompt templates
const SUB_AGENTS = {
  [SWARM_STATES.SUPPORT]: {
    name: 'Support Agent',
    emoji: '🎧',
    systemPrompt: `You are a M.ai.K.R Customer Support specialist. Your role is to:
- Be empathetic and patient — customers are often frustrated
- Solve problems efficiently and completely
- Know the product inside out
- When you don't know something, say you'll check and follow up
- Always offer to escalate if the issue is complex or repeated

Brand voice: friendly, professional, never dismissive. Never say "I don't know" without following up.`,
    scopes: ['refunds', 'troubleshooting', 'account issues', 'FAQ', 'order status', 'product information'],
  },
  [SWARM_STATES.SALES]: {
    name: 'Sales Agent',
    emoji: '💼',
    systemPrompt: `You are a M.ai.K.R Sales specialist. Your role is to:
- Understand what the customer needs before recommending anything
- Be consultative — ask questions, listen, then advise
- Know the pricing, plans, and differentiation between tiers
- Be honest about what M.ai.K.R can and can't do
- Never be pushy — help them make an informed decision

Brand voice: helpful, consultative, honest about value. Focus on ROI and fit, not features.`,
    scopes: ['plan questions', 'upgrades', 'comparisons', 'trial info', 'pricing', 'custom enterprise'],
  },
  [SWARM_STATES.ONBOARDING]: {
    name: 'Onboarding Agent',
    emoji: '🚀',
    systemPrompt: `You are a M.ai.K.R Onboarding specialist. Your role is to:
- Guide new users through their first experience
- Be warm and encouraging — they're learning something new
- Break down setup into clear, achievable steps
- Celebrate milestones — first agent created is a big deal
- Offer to explain features one at a time rather than overwhelming them`,
    scopes: ['new user setup', 'first agent creation', 'feature tour', 'questionnaire help', 'getting started'],
  },
  [SWARM_STATES.ADMIN]: {
    name: 'Admin Agent',
    emoji: '⚙️',
    systemPrompt: `You are a M.ai.K.R Admin specialist. Your role is to:
- Be precise and efficient — admins want to get things done
- Have full knowledge of the dashboard and configuration options
- Help with agent management, billing, API keys, webhooks
- Provide technical details when asked
- Never make changes without explicit user confirmation

Brand voice: precise, efficient, technically accurate. Don't waste their time.`,
    scopes: ['agent config', 'billing', 'agent regeneration', 'API keys', 'webhooks', 'settings'],
  },
  [SWARM_STATES.GENERAL]: {
    name: 'AI Assistant',
    emoji: '🤖',
    systemPrompt: `You are M.ai.K.R, an AI agent builder platform. You help businesses create custom AI agents that handle customer support, sales, onboarding, and more. Respond helpfully and concisely. If the user asks about a specific feature, guide them to the right place.`,
    scopes: ['general chat', 'questions', 'explanations', 'casual conversation'],
  },
};

class SwarmRouter {
  constructor() {
    this.stateMachine = new SwarmStateMachine();
  }

  /**
   * Route a message — classify intent, get sub-agent, return routing decision.
   */
  async route(message, conversationId = 'default') {
    const result = await this.stateMachine.classify(message, conversationId);
    const subAgent = SUB_AGENTS[result.state] || SUB_AGENTS[SWARM_STATES.GENERAL];

    return {
      routing: {
        state: result.state,
        intent: result.intent,
        confidence: result.confidence,
        subAgent: subAgent.name,
        emoji: subAgent.emoji,
        systemPrompt: subAgent.systemPrompt,
      },
      trace: this.stateMachine.getTrace(conversationId),
    };
  }

  /**
   * Override routing to a specific sub-agent (manual override).
   */
  override(conversationId, targetState) {
    return this.stateMachine.forceState(conversationId, targetState);
  }

  /**
   * Reset conversation.
   */
  reset(conversationId) {
    return this.stateMachine.reset(conversationId);
  }

  /**
   * Get routing trace.
   */
  getTrace(conversationId) {
    return this.stateMachine.getTrace(conversationId);
  }

  /**
   * Get sub-agent config by state.
   */
  getSubAgent(state) {
    return SUB_AGENTS[state] || SUB_AGENTS[SWARM_STATES.GENERAL];
  }
}

module.exports = { SwarmRouter, SWARM_STATES, SUB_AGENTS };
