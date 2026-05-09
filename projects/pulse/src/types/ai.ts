/**
 * AI-related TypeScript types for P.U.L.S.E
 * Big Five (OCEAN) personality profiling and AI Assistant types
 */

// ============================================================================
// Message Types
// ============================================================================

export type Platform = 
  | 'sms' 
  | 'rcs' 
  | 'messenger' 
  | 'instagram' 
  | 'whatsapp' 
  | 'telegram' 
  | 'discord' 
  | 'signal' 
  | 'slack' 
  | 'imessage';

export type CaptureMethod = 
  | 'notification' 
  | 'accessibility' 
  | 'content_resolver' 
  | 'api' 
  | 'manual_export';

export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface MessageMetadata {
  hasEmoji: boolean;
  emojiCount: number;
  hasPunctuation: boolean;
  punctuationCount: number;
  wordCount: number;
  isQuestion: boolean;
  isExclamation: boolean;
  sentiment: Sentiment;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string; // ISO8601
  platform: Platform;
  captureMethod: CaptureMethod;
  metadata: MessageMetadata;
}

// ============================================================================
// Big Five (OCEAN) Personality Types
// ============================================================================

export type OCEANDimension = 'openness' | 'conscientiousness' | 'extroversion' | 'agreeableness' | 'neuroticism';

// Openness traits
export type OpennessTrait = 
  | 'imagination' 
  | 'artisticInterests' 
  | 'emotionality' 
  | 'adventurousness' 
  | 'intellect' 
  | 'liberalism';

// Conscientiousness traits
export type ConscientiousnessTrait = 
  | 'selfDiscipline' 
  | 'orderliness' 
  | 'dutifulness' 
  | 'achievementStriving' 
  | 'selfEfficacy' 
  | 'cautiousness';

// Extroversion traits
export type ExtroversionTrait = 
  | 'gregariousness' 
  | 'assertiveness' 
  | 'activityLevel' 
  | 'excitementSeeking' 
  | 'cheerfulness' 
  | 'positiveEmotion';

// Agreeableness traits
export type AgreeablenessTrait = 
  | 'trust' 
  | 'straightforwardness' 
  | 'altruism' 
  | 'compliance' 
  | 'modesty' 
  | 'tenderMindedness';

// Neuroticism traits
export type NeuroticismTrait = 
  | 'anxiety' 
  | 'angryHostility' 
  | 'depression' 
  | 'selfConsciousness' 
  | 'impulsiveness' 
  | 'vulnerability';

export type PersonalityTrait = 
  | OpennessTrait 
  | ConscientiousnessTrait 
  | ExtroversionTrait 
  | AgreeablenessTrait 
  | NeuroticismTrait;

export interface TraitScore {
  trait: PersonalityTrait;
  score: number; // 0-100
  confidence: number; // 0-1 based on message count
}

export interface DimensionScore {
  dimension: OCEANDimension;
  overall: number; // 0-100
  traits: TraitScore[];
}

export interface BigFiveProfile {
  id: string;
  userId: string;
  openness: DimensionScore;
  conscientiousness: DimensionScore;
  extroversion: DimensionScore;
  agreeableness: DimensionScore;
  neuroticism: DimensionScore;
  overallConfidence: number;
  messageCount: number;
  lastAnalyzed: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Communication Style
// ============================================================================

export type TonePreference = 'casual' | 'formal' | 'humorous';
export type ResponsePattern = 'quick' | 'thoughtful' | 'sporadic';
export type EmojiUsage = 'none' | 'minimal' | 'moderate' | 'heavy';
export type PunctuationStyle = 'sparse' | 'standard' | 'enthusiastic';

export interface CommunicationStyle {
  preferredTone: TonePreference;
  responsePattern: ResponsePattern;
  emojiUsage: EmojiUsage;
  punctuation: PunctuationStyle;
}

// ============================================================================
// Relationship Metrics
// ============================================================================

export interface RelationshipMetrics {
  messagesExchanged: number;
  avgResponseTimeMinutes: number;
  avgMessageLength: number;
  initiationRatio: {
    user: number;
    contact: number;
  };
}

// ============================================================================
// Contact & Profile Types
// ============================================================================

export interface Contact {
  id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  avatar?: string;
  tags: string[];
  platform: Platform[];
  bigFiveProfile?: BigFiveProfile;
  communicationStyle?: CommunicationStyle;
  relationshipMetrics?: RelationshipMetrics;
  relationshipScore: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// AI Assistant Types
// ============================================================================

export type MoodType = 'happy' | 'sad' | 'excited' | 'worried' | 'neutral' | 'angry' | 'grateful' | 'frustrated';

export interface MessageAnalysis {
  messageId: string;
  summary: string;
  tone: MoodType;
  toneConfidence: number;
  keyTopics: string[];
  sentiment: Sentiment;
  sentimentScore: number; // -1 to 1
  suggestedIntent?: string;
}

export interface ResponseSuggestion {
  id: string;
  content: string;
  tone: TonePreference;
  confidence: number;
  reasoning: string;
}

export interface SnoozeSchedule {
  contactId: string;
  snoozeUntil: string;
  reason?: string;
}

export interface ContactDisposition {
  contactId: string;
  relationshipHealth: 'excellent' | 'good' | 'neutral' | 'poor' | 'at_risk';
  engagementLevel: number; // 0-100
  lastMeaningfulInteraction?: string;
  recommendedActions: string[];
  riskFactors: string[];
}

// ============================================================================
// Trait Extraction Types
// ============================================================================

export interface ExtractedFeatures {
  // Basic message features
  wordCount: number;
  charCount: number;
  emojiCount: number;
  emojiTypes: string[];
  punctuationCount: number;
  exclamationCount: number;
  questionCount: number;
  capsRatio: number;
  
  // Language features
  avgWordLength: number;
  vocabularyRichness: number; // unique words / total words
  
  // Behavioral features
  responseTimeMinutes?: number;
  messageLengthTrend: 'increasing' | 'decreasing' | 'stable';
  
  // Content features
  sentiment: Sentiment;
  sentimentScore: number;
  hasGratitude: boolean;
  hasApology: boolean;
  hasQuestion: boolean;
  hasPlan: boolean;
  hasEmotionalWords: boolean;
  creativeWords: string[];
  planningWords: string[];
  agreementWords: string[];
  disagreementWords: string[];
  worryWords: string[];
  topicKeywords: string[];
  
  // Temporal features
  hourOfDay: number;
  dayOfWeek: number;
  isWeekend: boolean;
}

export interface WeightedMessage {
  message: Message;
  weight: number;
  daysAgo: number;
}

// ============================================================================
// Personality Comparison Types
// ============================================================================

export interface DimensionDifference {
  dimension: OCEANDimension;
  userScore: number;
  contactScore: number;
  difference: number; // positive = user higher
  severity: 'low' | 'medium' | 'high';
}

export interface ComparisonResult {
  userId: string;
  contactId: string;
  dimensionDifferences: DimensionDifference[];
  traitDifferences: TraitDifference[];
}

export interface TraitDifference {
  trait: PersonalityTrait;
  dimension: OCEANDimension;
  userScore: number;
  contactScore: number;
  difference: number;
}

// ============================================================================
// Compatibility Types
// ============================================================================

export type CompatibilityLevel = 'excellent' | 'good' | 'moderate' | 'challenging' | 'poor';

export interface CompatibilityStrength {
  category: string;
  description: string;
}

export interface CompatibilityChallenge {
  category: string;
  description: string;
  mitigation?: string;
}

export interface HistoricalTrend {
  date: string;
  score: number;
}

export interface CompatibilityResult {
  compatibilityScore: number; // 0-100
  level: CompatibilityLevel;
  strengths: CompatibilityStrength[];
  challenges: CompatibilityChallenge[];
  trends: HistoricalTrend[];
  trendDirection: 'improving' | 'stable' | 'declining';
}

// ============================================================================
// Bridge/Communication Tips
// ============================================================================

export interface CommunicationTip {
  id: string;
  category: 'tone' | 'timing' | 'content' | 'frequency' | 'topics';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionableSuggestion: string;
  basedOnDifference: DimensionDifference | TraitDifference;
}

// ============================================================================
// Snooze/Reminder Types
// ============================================================================

export type SnoozeDuration = '1hr' | '3hr' | 'tomorrow' | 'custom';

export interface Reminder {
  id: string;
  contactId: string;
  messageId?: string;
  scheduledFor: string;
  message: string;
  status: 'pending' | 'completed' | 'dismissed';
  createdAt: string;
}

// ============================================================================
// AI Service Result Types
// ============================================================================

export interface AssistantResult {
  success: boolean;
  summary?: string;
  analysis?: MessageAnalysis;
  suggestions?: ResponseSuggestion[];
  disposition?: ContactDisposition;
  error?: string;
}