/**
 * ResponseSuggester - Generate response suggestions for messages
 * Creates 3 variants with different tones and styles
 */

import {
  Message,
  MessageAnalysis,
  ResponseSuggestion,
  TonePreference,
  Contact,
} from '../../types';
import MessageAnalyzer from './MessageAnalyzer';

// ============================================================================
// Suggestion Templates
// ============================================================================

interface ResponseTemplate {
  pattern: RegExp;
  responses: {
    casual: string[];
    formal: string[];
    humorous: string[];
  };
}

const RESPONSE_TEMPLATES: ResponseTemplate[] = [
  {
    pattern: /how (are|is).*(doing|going|feeling)/i,
    responses: {
      casual: [
        "Hey! I'm doing great, thanks for asking! How about you?",
        "Pretty good! What's up?",
        "All good here! You?",
        "Doing awesome! What have you been up to?",
      ],
      formal: [
        "I'm doing well, thank you for asking. How may I assist you?",
        "I'm well, thank you. And yourself?",
        "Everything is fine, appreciate you asking.",
      ],
      humorous: [
        "Alive and kicking! 😄 Survived my coffee so far today!",
        "Currently running on caffeine and optimism! You?",
        "Still vertical! That's a win in my book 😄",
      ],
    },
  },
  {
    pattern: /(thanks|thank you|appreciate)/i,
    responses: {
      casual: [
        "No problem! Happy to help 😊",
        "Of course! Anytime!",
        "You're welcome! 👍",
        "Glad I could help!",
      ],
      formal: [
        "You're welcome. Please don't hesitate to reach out if you need anything else.",
        "My pleasure. I'm happy to assist.",
        "You're most welcome.",
      ],
      humorous: [
        "What are friends for? 😄",
        "Consider it my good deed for the day!",
        "Don't mention it! Seriously, don't... it gets awkward 😅",
      ],
    },
  },
  {
    pattern: /\?$/,
    responses: {
      casual: [
        "Good question! Let me think...",
        "Hmm, let me get back to you on that.",
        "Great question! Here's what I think...",
        "I was wondering the same thing!",
      ],
      formal: [
        "That's an interesting question. I'll look into it.",
        "Thank you for your inquiry. I shall investigate.",
        "An excellent question. Allow me to research this.",
      ],
      humorous: [
        "Plot twist: I have no idea! 🤔",
        "You ask the best questions... and also the hardest 😅",
        "My crystal ball is in the shop. Let me check!",
      ],
    },
  },
  {
    pattern: /(lol|haha|😂|🤣)/i,
    responses: {
      casual: [
        "Haha yeah!",
        "That's too funny! 😂",
        "Right?! 😂",
        "I'm laughing too!",
      ],
      formal: [
        "Indeed, that is quite humorous.",
        "I find that amusing as well.",
        "That's quite entertaining!",
      ],
      humorous: [
        "My abs hurt now. Thanks a lot! 😂",
        "I'm wheezing! 😤",
        "RIP my funny bone - it just died laughing! 💀",
      ],
    },
  },
  {
    pattern: /(miss|missed|sad|lonely)/i,
    responses: {
      casual: [
        "Aww I miss you too! 💜",
        "Same here! We should hang out soon!",
        "Missing you too! Let's plan something!",
        "Can't wait to see you! ❤️",
      ],
      formal: [
        "I've been thinking of you as well. Let's reconnect soon.",
        "I value our time together. We should arrange a meeting.",
        "I miss our conversations as well.",
      ],
      humorous: [
        "My life is so empty without you... 😢 Just kidding! Sort of... 😂",
        "My dog misses you too! Well, he misses everyone who has treats... 💁",
        "It's been too long! My plants are getting lonely (and thirsty) 🌱",
      ],
    },
  },
  {
    pattern: /(excited|can\'t wait|thrilled)/i,
    responses: {
      casual: [
        "I'm so excited too! 🎉",
        "This is going to be awesome!",
        "Can't wait! This is going to be great!",
        "Yay! So excited! 🙌",
      ],
      formal: [
        "I'm looking forward to it as well.",
        "This does sound exciting. I anticipate a wonderful time.",
        "I'm pleased to hear about your enthusiasm!",
      ],
      humorous: [
        "My excitement level is OVER 9000! 🦍",
        "I'm basically vibrating with excitement! ⚡",
        "Tell my heart to calm down! This is too exciting! 🎢",
      ],
    },
  },
  {
    pattern: /(sorry|apologize|oops)/i,
    responses: {
      casual: [
        "No worries at all!",
        "It's totally fine! Don't stress!",
        "Don't apologize! It's okay!",
        "All good! 👍",
      ],
      formal: [
        "No need to apologize. I understand.",
        "Please don't worry about it.",
        "It's quite alright. No harm done.",
      ],
      humorous: [
        "You're forgiven! Now buy me pizza as penance... just kidding! 😄",
        "Oopsie daisies! We're all human! 😂",
        "Nothing a sorry emoji can't fix! 🙈",
      ],
    },
  },
  {
    pattern: /(dinner|lunch|food|eat|restaurant)/i,
    responses: {
      casual: [
        "Ooh food! Where are you thinking?",
        "I'm always down for food! What did you have in mind?",
        "Yum! Suggest something!",
        "Food is the answer. What's the question? 🍕",
      ],
      formal: [
        "That sounds lovely. What restaurant did you have in mind?",
        "I'm available for a meal. What works for your schedule?",
        "I would enjoy that. What did you have in mind?",
      ],
      humorous: [
        "Food? Did someone say food?! I'm in! 🙋",
        "You had me at food. Name the place! 🍔",
        "My answer will always be yes to food. Yes. Thank you.",
      ],
    },
  },
  {
    pattern: /(plan|weekend|tomorrow|schedule)/i,
    responses: {
      casual: [
        "Sounds like a plan!",
        "I'm down! What did you have in mind?",
        "Let me check my calendar...",
        "I'm free! What do you want to do?",
      ],
      formal: [
        "That sounds reasonable. Let me confirm my availability.",
        "I'll review my schedule and get back to you.",
        "That could work. What time were you thinking?",
      ],
      humorous: [
        "My social calendar is wide open... 😴 But I'm free!",
        "I have absolutely no plans except eating and napping. Count me in!",
        "Spoiler: My plans are 90% spontaneity and 10% pretending to be an adult.",
      ],
    },
  },
];

// ============================================================================
// Default Response Templates (fallback)
// ============================================================================

const DEFAULT_CASUAL = [
  "Got it!",
  "Sounds good!",
  "Cool, thanks!",
  "Alright!",
  "Will do! 👍",
  "Thanks for letting me know!",
  "I appreciate it!",
  "Noted! 😊",
];

const DEFAULT_FORMAL = [
  "Acknowledged.",
  "Understood.",
  "I'll take that into consideration.",
  "Thank you for informing me.",
  "Noted and appreciated.",
  "I understand.",
  "Very well.",
];

const DEFAULT_HUMOROUS = [
  "Consider it noted! 📝",
  "Copy that, captain! 🫡",
  "Message received and filed under 'things I care about'! 😄",
  "Will do! Probably! 😅",
  "Aye aye! 🙌",
  "Got it! (I think...) 🤔",
];

// ============================================================================
// Main Suggestion Functions
// ============================================================================

/**
 * Generate response suggestions for a message
 */
export function generateSuggestions(
  message: Message,
  analysis: MessageAnalysis,
  contact?: Contact
): ResponseSuggestion[] {
  const content = message.content.toLowerCase();
  const preferredTone = contact?.communicationStyle?.preferredTone || 'casual';
  
  // Try to match a template
  const matchedTemplate = RESPONSE_TEMPLATES.find(t => t.pattern.test(content));
  
  let suggestions: ResponseSuggestion[];
  
  if (matchedTemplate) {
    suggestions = generateFromTemplate(matchedTemplate, preferredTone);
  } else {
    suggestions = generateDefaultSuggestions(preferredTone, analysis.sentiment);
  }
  
  // Ensure we have 3 suggestions
  while (suggestions.length < 3) {
    suggestions.push(createFallbackSuggestion(suggestions.length, preferredTone));
  }
  
  // Add metadata
  return suggestions.map((s, i) => ({
    ...s,
    id: `suggestion_${message.id}_${i}`,
  }));
}

/**
 * Generate suggestions from matched template
 */
function generateFromTemplate(
  template: ResponseTemplate,
  preferredTone: TonePreference
): ResponseSuggestion[] {
  const responses = template.responses[preferredTone];
  const otherTones: TonePreference[] = ['casual', 'formal', 'humorous'].filter(t => t !== preferredTone) as TonePreference[];
  
  // Return 3 responses: 2 from preferred tone, 1 from alternate
  const suggestions: ResponseSuggestion[] = [];
  
  // Add 2 from preferred
  const shuffled = [...responses].sort(() => Math.random() - 0.5);
  suggestions.push({
    content: shuffled[0] || responses[0],
    tone: preferredTone,
    confidence: 0.85,
    reasoning: `Matches your preferred ${preferredTone} communication style.`,
  });
  
  // Add 1 alternate
  const altResponses = template.responses[otherTones[0]];
  const altShuffled = [...altResponses].sort(() => Math.random() - 0.5);
  suggestions.push({
    content: altShuffled[0] || altResponses[0],
    tone: otherTones[0],
    confidence: 0.6,
    reasoning: `Alternative ${otherTones[0]} response.`,
  });
  
  // Add 1 more from preferred (different)
  suggestions.push({
    content: shuffled[1] || responses[1] || responses[0],
    tone: preferredTone,
    confidence: 0.75,
    reasoning: `Another ${preferredTone} option.`,
  });
  
  return suggestions;
}

/**
 * Generate default suggestions based on sentiment
 */
function generateDefaultSuggestions(
  preferredTone: TonePreference,
  sentiment: 'positive' | 'negative' | 'neutral'
): ResponseSuggestion[] {
  const suggestions: ResponseSuggestion[] = [];
  
  // Get appropriate defaults based on sentiment
  let defaults = getDefaultsForTone(preferredTone);
  
  // If negative sentiment, add empathetic responses
  if (sentiment === 'negative') {
    defaults = [
      "Hey, I'm here for you if you want to talk 💙",
      "That sounds tough. Want to discuss?",
      "Sorry to hear that. I'm listening.",
      ...defaults,
    ];
  }
  
  // Shuffle and pick 3
  const shuffled = [...defaults].sort(() => Math.random() - 0.5);
  
  suggestions.push({
    content: shuffled[0],
    tone: preferredTone,
    confidence: 0.7,
    reasoning: 'Appropriate response for the conversation.',
  });
  
  suggestions.push({
    content: shuffled[1],
    tone: preferredTone,
    confidence: 0.6,
    reasoning: 'Alternative response.',
  });
  
  suggestions.push({
    content: shuffled[2],
    tone: preferredTone === 'casual' ? 'humorous' : 'casual',
    confidence: 0.5,
    reasoning: 'Light-hearted alternative.',
  });
  
  return suggestions;
}

/**
 * Get default responses for a tone
 */
function getDefaultsForTone(tone: TonePreference): string[] {
  switch (tone) {
    case 'casual':
      return DEFAULT_CASUAL;
    case 'formal':
      return DEFAULT_FORMAL;
    case 'humorous':
      return DEFAULT_HUMOROUS;
    default:
      return DEFAULT_CASUAL;
  }
}

/**
 * Create fallback suggestion
 */
function createFallbackSuggestion(index: number, preferredTone: TonePreference): ResponseSuggestion {
  const defaults = getDefaultsForTone(preferredTone);
  
  return {
    content: defaults[index % defaults.length],
    tone: preferredTone,
    confidence: 0.5,
    reasoning: 'Fallback suggestion.',
  };
}

// ============================================================================
// Context-Aware Suggestions
// ============================================================================

/**
 * Generate context-aware suggestions based on conversation history
 */
export function generateContextualSuggestions(
  recentMessages: Message[],
  contact: Contact
): ResponseSuggestion[] {
  if (recentMessages.length === 0) {
    return generateGenericSuggestions();
  }
  
  const lastMessage = recentMessages[recentMessages.length - 1];
  const analysis = MessageAnalyzer.analyzeMessage(lastMessage);
  
  // Check time since last message
  const lastMessageTime = new Date(lastMessage.timestamp).getTime();
  const now = Date.now();
  const hoursSinceMessage = (now - lastMessageTime) / (1000 * 60 * 60);
  
  // If responding quickly, match energy
  if (hoursSinceMessage < 1) {
    const quickResponses = [
      "Got it! 👍",
      "On it!",
      "Sounds good!",
      "Alright!",
    ];
    
    return quickResponses.map((content, i) => ({
      id: `quick_${i}`,
      content,
      tone: 'casual' as TonePreference,
      confidence: 0.8,
      reasoning: 'Quick response to keep the conversation flowing.',
    }));
  }
  
  // Otherwise, use standard suggestions
  return generateSuggestions(lastMessage, analysis, contact);
}

/**
 * Generate generic suggestions for no context
 */
function generateGenericSuggestions(): ResponseSuggestion[] {
  return [
    {
      id: 'generic_0',
      content: "Hey! What's up? 😊",
      tone: 'casual',
      confidence: 0.7,
      reasoning: 'Friendly opener.',
    },
    {
      id: 'generic_1',
      content: "Got it, thanks!",
      tone: 'casual',
      confidence: 0.6,
      reasoning: 'Simple acknowledgment.',
    },
    {
      id: 'generic_2',
      content: "Sounds good to me!",
      tone: 'casual',
      confidence: 0.5,
      reasoning: 'Agreeable response.',
    },
  ];
}

export default {
  generateSuggestions,
  generateContextualSuggestions,
};
