/**
 * PersonalityEngine - Big Five (OCEAN) scoring algorithm
 * Calculates personality trait scores from extracted message features
 */

import { 
  Message, 
  BigFiveProfile, 
  DimensionScore, 
  TraitScore,
  OCEANDimension,
  PersonalityTrait,
  OpennessTrait,
  ConscientiousnessTrait,
  ExtroversionTrait,
  AgreeablenessTrait,
  NeuroticismTrait
} from '../../types';
import TraitExtractor from './TraitExtractor';

// ============================================================================
// Trait Weight Configurations
// ============================================================================

interface TraitIndicator {
  positive: string[];  // Words that increase this trait
  negative: string[];  // Words that decrease this trait
  weight: number;      // How strongly this feature affects the trait
}

interface DimensionConfig {
  traitIndicators: Record<PersonalityTrait, TraitIndicator>;
}

// ============================================================================
// Openness Configuration
// ============================================================================

const OPENNESS_INDICATORS: Record<OpennessTrait, TraitIndicator> = {
  imagination: {
    positive: ['imagine', 'dream', 'creative', 'idea', 'wonder', 'possibility', 'vision', 'fantasy'],
    negative: ['realistic', 'practical', 'routine', 'normal'],
    weight: 1.2,
  },
  artisticInterests: {
    positive: ['art', 'music', 'beauty', 'design', 'photo', 'film', 'theater', 'gallery'],
    negative: ['practical', 'functional', 'useful'],
    weight: 1.0,
  },
  emotionality: {
    positive: ['feel', 'feeling', 'emotion', 'passion', 'deeply', 'intense', 'heart'],
    negative: ['detached', 'logical', 'practical'],
    weight: 1.1,
  },
  adventurousness: {
    positive: ['adventure', 'new', 'try', 'explore', 'discover', 'different', 'unique', ' exciting'],
    negative: ['same', 'familiar', 'routine', 'comfortable'],
    weight: 1.3,
  },
  intellect: {
    positive: ['think', 'idea', 'concept', 'theory', 'understand', 'learn', 'knowledge', 'smart'],
    negative: ['simple', 'basic', 'just'],
    weight: 1.2,
  },
  liberalism: {
    positive: ['maybe', 'perhaps', 'different', 'perspective', 'open-minded', 'consider'],
    negative: ['always', 'definitely', 'certainly', 'traditional', 'rules'],
    weight: 0.9,
  },
};

// ============================================================================
// Conscientiousness Configuration
// ============================================================================

const CONSCIENTIOUSNESS_INDICATORS: Record<ConscientiousnessTrait, TraitIndicator> = {
  selfDiscipline: {
    positive: ['will', 'must', 'need to', 'have to', 'going to', 'plan', 'goal', 'finish', 'complete'],
    negative: ['later', 'sometime', 'maybe', 'later', 'procrastinate'],
    weight: 1.3,
  },
  orderliness: {
    positive: ['organize', 'order', 'schedule', 'list', 'plan', 'arrange', 'systematic'],
    negative: ['messy', 'chaotic', 'random', 'whatever'],
    weight: 1.1,
  },
  dutifulness: {
    positive: ['should', 'must', 'need to', 'have to', 'responsible', 'duty', 'obligation'],
    negative: ['skip', 'ignore', 'forget', 'don\'t bother'],
    weight: 1.2,
  },
  achievementStriving: {
    positive: ['goal', 'achievement', 'success', 'win', 'accomplish', 'reach', 'target', 'better'],
    negative: ['enough', 'fine', 'okay', 'whatever'],
    weight: 1.2,
  },
  selfEfficacy: {
    positive: ['can', 'will', 'able', 'confident', 'sure', 'definitely', 'handle', 'manage'],
    negative: ['can\'t', 'unable', 'uncertain', 'maybe', 'probably not'],
    weight: 1.1,
  },
  cautiousness: {
    positive: ['careful', 'cautious', 'maybe', 'perhaps', 'think about', 'consider', 'slow', 'wait'],
    positive: ['definitely', 'certainly', 'absolutely', 'rush', 'immediately'],
    weight: 1.0,
  },
};

// ============================================================================
// Extroversion Configuration
// ============================================================================

const EXTRAVERSION_INDICATORS: Record<ExtroversionTrait, TraitIndicator> = {
  gregariousness: {
    positive: ['we', 'us', 'together', 'everyone', 'group', 'team', 'party', 'hang out', 'chat'],
    negative: ['alone', 'solo', 'individual', 'private', 'myself'],
    weight: 1.2,
  },
  assertiveness: {
    positive: ['i think', 'i want', 'i need', 'definitely', 'should', 'let\'s', 'will', 'going to'],
    negative: ['i don\'t know', 'maybe', 'perhaps', 'whatever', 'i guess', 'if you want'],
    weight: 1.1,
  },
  activityLevel: {
    positive: ['going', 'running', 'busy', 'active', 'quick', 'fast', 'now', 'today', 'tomorrow'],
    negative: ['rest', 'relax', 'later', 'sometime', 'slow', 'wait'],
    weight: 1.0,
  },
  excitementSeeking: {
    positive: ['excited', 'amazing', 'awesome', 'wow', 'incredible', 'thrilled', 'can\'t wait'],
    negative: ['calm', 'quiet', 'boring', 'usual', 'normal', 'routine'],
    weight: 1.2,
  },
  cheerfulness: {
    positive: ['happy', 'fun', 'laugh', 'smile', 'great', 'wonderful', 'lol', 'haha', '😊'],
    negative: ['sad', 'tired', 'boring', 'whatever', 'meh'],
    weight: 1.3,
  },
  positiveEmotion: {
    positive: ['love', 'happy', 'excited', 'grateful', 'thank', 'blessed', 'amazing', 'wonderful'],
    negative: ['hate', 'angry', 'frustrated', 'annoyed', 'upset'],
    weight: 1.2,
  },
};

// ============================================================================
// Agreeableness Configuration
// ============================================================================

const AGREEABLENESS_INDICATORS: Record<AgreeablenessTrait, TraitIndicator> = {
  trust: {
    positive: ['believe', 'trust', 'sure', 'definitely', 'probably', 'likely', 'hope'],
    negative: ['suspect', 'doubt', 'question', 'wonder if', 'maybe'],
    weight: 1.2,
  },
  straightforwardness: {
    positive: ['honestly', 'really', 'actually', 'simply', 'directly', 'clear'],
    negative: ['maybe', 'perhaps', 'might', 'could be', 'sort of'],
    weight: 1.0,
  },
  altruism: {
    positive: ['help', 'support', 'you', 'your', 'let me', 'i can', 'happy to', 'glad to'],
    negative: ['i', 'me', 'my', 'mine', 'need', 'want'],
    weight: 1.3,
  },
  compliance: {
    positive: ['ok', 'okay', 'sure', 'yes', 'definitely', 'agree', 'sounds good', 'no problem'],
    negative: ['no', 'but', 'however', 'disagree', 'instead', 'actually'],
    weight: 1.1,
  },
  modesty: {
    positive: ['i think', 'maybe', 'perhaps', 'possibly', 'not sure', 'might be'],
    negative: ['i\'m best', 'i\'m right', 'definitely', 'obviously', 'everyone knows'],
    weight: 0.9,
  },
  tenderMindedness: {
    positive: ['feel', 'understand', 'sorry', 'hope you\'re ok', 'care', 'concerned', 'sweet'],
    negative: ['whatever', 'not my problem', 'don\'t care', 'tough'],
    weight: 1.2,
  },
};

// ============================================================================
// Neuroticism Configuration
// ============================================================================

const NEUROTICISM_INDICATORS: Record<NeuroticismTrait, TraitIndicator> = {
  anxiety: {
    positive: ['worry', 'concerned', 'nervous', 'anxious', 'scared', 'afraid', 'hope', 'if'],
    negative: ['calm', 'relax', 'fine', 'okay', 'confident', 'sure'],
    weight: 1.3,
  },
  angryHostility: {
    positive: ['angry', 'annoyed', 'frustrated', 'irritated', 'upset', 'mad', 'hate', 'stupid'],
    negative: ['fine', 'okay', 'no problem', 'it\'s ok', 'calm'],
    weight: 1.3,
  },
  depression: {
    positive: ['sad', 'depressed', 'down', 'tired', 'exhausted', 'hopeless', 'helpless'],
    negative: ['happy', 'great', 'awesome', 'excited', 'energetic'],
    weight: 1.2,
  },
  selfConsciousness: {
    positive: ['embarrassed', 'awkward', 'nervous', 'shy', 'afraid', 'worried what people think'],
    negative: ['confident', 'proud', 'comfortable', 'secure'],
    weight: 1.1,
  },
  impulsiveness: {
    positive: ['just', 'now', 'immediately', 'can\'t wait', 'going to do it', 'suddenly'],
    negative: ['think about', 'consider', 'maybe', 'later', 'plan'],
    weight: 1.0,
  },
  vulnerability: {
    positive: ['can\'t', 'unable', 'overwhelmed', 'struggle', 'hard', 'difficult', 'need help'],
    negative: ['can', 'able', 'handle', 'manage', ' cope', 'strong'],
    weight: 1.2,
  },
};

// ============================================================================
// Main Personality Engine
// ============================================================================

/**
 * Calculate Big Five personality profile from messages
 */
export function calculatePersonalityProfile(
  messages: Message[],
  userId: string,
  halfLifeDays: number = 30
): BigFiveProfile {
  // Apply temporal weighting
  const weightedMessages = TraitExtractor.applyTemporalWeighting(messages, halfLifeDays);
  
  // Aggregate features
  const features = TraitExtractor.aggregateFeatures(weightedMessages);
  
  // Calculate confidence based on message count
  const messageCount = messages.length;
  const confidence = calculateConfidence(messageCount);
  
  // Calculate dimension scores
  const openness = calculateDimensionScore(
    'openness',
    OPENNESS_INDICATORS,
    features,
    confidence
  );
  
  const conscientiousness = calculateDimensionScore(
    'conscientiousness',
    CONSCIENTIOUSNESS_INDICATORS,
    features,
    confidence
  );
  
  const extroversion = calculateDimensionScore(
    'extroversion',
    EXTRAVERSION_INDICATORS,
    features,
    confidence
  );
  
  const agreeableness = calculateDimensionScore(
    'agreeableness',
    AGREEABLENESS_INDICATORS,
    features,
    confidence
  );
  
  const neuroticism = calculateDimensionScore(
    'neuroticism',
    NEUROTICISM_INDICATORS,
    features,
    confidence
  );
  
  const now = new Date().toISOString();
  
  return {
    id: generateProfileId(userId),
    userId,
    openness,
    conscientiousness,
    extroversion,
    agreeableness,
    neuroticism,
    overallConfidence: confidence,
    messageCount,
    lastAnalyzed: now,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Calculate a single dimension's score
 */
function calculateDimensionScore<T extends PersonalityTrait>(
  dimension: OCEANDimension,
  indicators: Record<T, TraitIndicator>,
  features: ReturnType<typeof TraitExtractor.aggregateFeatures>,
  confidence: number
): DimensionScore {
  const traits: TraitScore[] = [];
  
  const traitKeys = Object.keys(indicators) as T[];
  
  for (const traitKey of traitKeys) {
    const indicator = indicators[traitKey];
    let score = 50; // Start at neutral
    
    // Check positive indicators
    const positiveMatches = indicator.positive.filter(word => 
      features.creativeWords.includes(word) ||
      features.planningWords.includes(word) ||
      features.agreementWords.includes(word) ||
      features.worryWords.includes(word) ||
      features.topicKeywords.some(k => k.includes(word))
    );
    
    // Check negative indicators
    const negativeMatches = indicator.negative.filter(word =>
      features.creativeWords.includes(word) ||
      features.planningWords.includes(word) ||
      features.disagreementWords.includes(word) ||
      features.topicKeywords.some(k => k.includes(word))
    );
    
    // Adjust score based on matches
    const positiveWeight = positiveMatches.length * indicator.weight * 3;
    const negativeWeight = negativeMatches.length * indicator.weight * 3;
    
    score = 50 + positiveWeight - negativeWeight;
    
    // Clamp to 0-100
    score = Math.max(0, Math.min(100, score));
    
    // Apply confidence adjustment (less data = more variance)
    const variance = (1 - confidence) * 20;
    score = score + (Math.random() - 0.5) * variance;
    score = Math.max(0, Math.min(100, score));
    
    traits.push({
      trait: traitKey,
      score: Math.round(score),
      confidence,
    });
  }
  
  // Calculate overall dimension score (weighted average of traits)
  const overall = traits.reduce((sum, t) => sum + t.score, 0) / traits.length;
  
  return {
    dimension,
    overall: Math.round(overall),
    traits,
  };
}

/**
 * Calculate confidence based on message count
 */
function calculateConfidence(messageCount: number): number {
  if (messageCount < 10) return 0.2;
  if (messageCount < 25) return 0.4;
  if (messageCount < 50) return 0.6;
  if (messageCount < 100) return 0.75;
  if (messageCount < 200) return 0.85;
  return 0.95;
}

/**
 * Generate a unique profile ID
 */
function generateProfileId(userId: string): string {
  return `profile_${userId}_${Date.now()}`;
}

/**
 * Update an existing profile with new messages
 */
export function updateProfile(
  existingProfile: BigFiveProfile,
  newMessages: Message[]
): BigFiveProfile {
  // In a real app, you'd merge messages and recalculate
  // For now, recalculate entirely
  const updatedProfile = calculatePersonalityProfile(
    newMessages,
    existingProfile.userId
  );
  
  // Preserve creation date
  updatedProfile.createdAt = existingProfile.createdAt;
  updatedProfile.id = existingProfile.id;
  
  return updatedProfile;
}

/**
 * Get a specific dimension score from a profile
 */
export function getDimensionScore(profile: BigFiveProfile, dimension: OCEANDimension): DimensionScore {
  switch (dimension) {
    case 'openness':
      return profile.openness;
    case 'conscientiousness':
      return profile.conscientiousness;
    case 'extroversion':
      return profile.extroversion;
    case 'agreeableness':
      return profile.agreeableness;
    case 'neuroticism':
      return profile.neuroticism;
  }
}

/**
 * Get all dimension scores as an array
 */
export function getAllDimensionScores(profile: BigFiveProfile): DimensionScore[] {
  return [
    profile.openness,
    profile.conscientiousness,
    profile.extroversion,
    profile.agreeableness,
    profile.neuroticism,
  ];
}

/**
 * Get the dominant dimension (highest score)
 */
export function getDominantDimension(profile: BigFiveProfile): DimensionScore {
  const dimensions = getAllDimensionScores(profile);
  return dimensions.reduce((max, d) => d.overall > max.overall ? d : max, dimensions[0]);
}

/**
 * Calculate stability (how much the profile has changed over time)
 */
export function calculateProfileStability(
  currentProfile: BigFiveProfile,
  previousProfile: BigFiveProfile
): number {
  const currentDims = getAllDimensionScores(currentProfile);
  const previousDims = getAllDimensionScores(previousProfile);
  
  let totalDiff = 0;
  
  for (let i = 0; i < currentDims.length; i++) {
    totalDiff += Math.abs(currentDims[i].overall - previousDims[i].overall);
  }
  
  const avgDiff = totalDiff / 5;
  
  // Convert to stability score (0 = completely changed, 100 = no change)
  return Math.max(0, 100 - avgDiff);
}

export default {
  calculatePersonalityProfile,
  updateProfile,
  getDimensionScore,
  getAllDimensionScores,
  getDominantDimension,
  calculateProfileStability,
};
