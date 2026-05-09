/**
 * TraitExtractor - Feature extraction from messages for Big Five analysis
 * Extracts linguistic and behavioral features that correlate with personality traits
 */

import { Message, ExtractedFeatures, WeightedMessage, Sentiment } from '../../types';

// ============================================================================
// Feature Word Lists (lexicons for trait detection)
// ============================================================================

const CREATIVE_WORDS = [
  'imagine', 'dream', 'creative', 'art', 'beauty', 'inspired', 'unique',
  'explore', 'discover', 'wonder', 'possibility', 'idea', 'concept',
  'abstract', 'innovative', 'original', 'unconventional', 'curious',
  'philosophy', 'theory', 'deep', 'meaning', 'purpose', 'vision'
];

const PLANNING_WORDS = [
  'plan', 'schedule', 'organize', 'prepare', '安排', '计划', '准备',
  'deadline', 'goal', 'objective', 'milestone', 'task', 'agenda',
  'meeting', 'appointment', 'reminder', 'todo', 'organize', 'structure'
];

const AGREEMENT_WORDS = [
  'yes', 'agree', 'definitely', 'sure', 'ok', 'okay', 'great', 'perfect',
  'sounds good', 'nice', 'awesome', 'love it', 'exactly', 'totally',
  'absolutely', 'certainly', 'indeed', 'of course', 'happy to'
];

const DISAGREEMENT_WORDS = [
  'no', 'disagree', 'but', 'however', 'although', 'instead', 'rather',
  'unfortunately', 'not sure', 'i dont think', 'problem', 'issue',
  'wrong', 'mistake', 'fail', 'wrong', 'different', 'actually'
];

const WORRY_WORDS = [
  'worry', 'concerned', 'nervous', 'anxious', 'stressed', 'scared',
  'afraid', 'hope', 'maybe', 'perhaps', 'if', 'might', 'could',
  'should', 'need to', 'have to', 'must', 'urgent', 'important'
];

const EMOTIONAL_WORDS = [
  'feel', 'feeling', 'felt', 'emotion', 'happy', 'sad', 'love', 'hate',
  'angry', 'excited', 'thrilled', 'terrible', 'amazing', 'awesome',
  'depressed', 'anxious', 'worried', 'grateful', 'blessed', 'frustrated'
];

const GRATITUDE_WORDS = [
  'thank', 'thanks', 'grateful', 'appreciate', 'blessed', 'fortunate',
  'helpful', 'kind', 'generous', 'support', 'means a lot', 'thanks to'
];

const APOLOGY_WORDS = [
  'sorry', 'apologize', 'my mistake', 'my fault', 'oops', 'forgive',
  'excuse me', 'pardon', 'regret', 'unfortunately'
];

// ============================================================================
// Main Extraction Functions
// ============================================================================

/**
 * Extract all features from a single message
 */
export function extractMessageFeatures(message: Message): ExtractedFeatures {
  const content = message.content;
  const words = content.toLowerCase().split(/\s+/);
  
  // Basic counts
  const wordCount = words.length;
  const charCount = content.length;
  const emojiCount = message.metadata.emojiCount || 0;
  const emojiTypes = extractEmojiTypes(content);
  const punctuationCount = content.replace(/[^\.,!?;:\-\(\)\[\]]/g, '').length;
  const exclamationCount = (content.match(/!/g) || []).length;
  const questionCount = (content.match(/\?/g) || []).length;
  const capsCount = (content.match(/[A-Z]/g) || []).length;
  const capsRatio = charCount > 0 ? capsCount / charCount : 0;
  
  // Language features
  const avgWordLength = wordCount > 0 ? charCount / wordCount : 0;
  const uniqueWords = new Set(words.map(w => w.replace(/[^\w]/g, ''))).size;
  const vocabularyRichness = wordCount > 0 ? uniqueWords / wordCount : 0;
  
  // Content detection
  const contentLower = content.toLowerCase();
  const hasGratitude = GRATITUDE_WORDS.some(w => contentLower.includes(w));
  const hasApology = APOLOGY_WORDS.some(w => contentLower.includes(w));
  const hasQuestion = questionCount > 0;
  const hasPlan = PLANNING_WORDS.some(w => contentLower.includes(w));
  const hasEmotionalWords = EMOTIONAL_WORDS.some(w => contentLower.includes(w));
  
  // Word category matching
  const creativeWords = CREATIVE_WORDS.filter(w => contentLower.includes(w));
  const planningWords = PLANNING_WORDS.filter(w => contentLower.includes(w));
  const agreementWords = AGREEMENT_WORDS.filter(w => contentLower.includes(w));
  const disagreementWords = DISAGREEMENT_WORDS.filter(w => contentLower.includes(w));
  const worryWords = WORRY_WORDS.filter(w => contentLower.includes(w));
  
  // Topic keywords (simple extraction)
  const topicKeywords = extractTopicKeywords(content);
  
  // Temporal features
  const timestamp = new Date(message.timestamp);
  const hourOfDay = timestamp.getHours();
  const dayOfWeek = timestamp.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Sentiment analysis
  const { sentiment, score } = analyzeSentiment(content);
  
  return {
    wordCount,
    charCount,
    emojiCount,
    emojiTypes,
    punctuationCount,
    exclamationCount,
    questionCount,
    capsRatio,
    avgWordLength,
    vocabularyRichness,
    sentiment,
    sentimentScore: score,
    hasGratitude,
    hasApology,
    hasQuestion,
    hasPlan,
    hasEmotionalWords,
    creativeWords,
    planningWords,
    agreementWords,
    disagreementWords,
    worryWords,
    topicKeywords,
    hourOfDay,
    dayOfWeek,
    isWeekend,
  };
}

/**
 * Apply temporal weighting to messages (recent messages weighted more)
 */
export function applyTemporalWeighting(
  messages: Message[],
  halfLifeDays: number = 30
): WeightedMessage[] {
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  
  return messages
    .filter(m => m.timestamp)
    .map(message => {
      const messageTime = new Date(message.timestamp).getTime();
      const daysAgo = (now - messageTime) / msPerDay;
      
      // Exponential decay weighting
      const weight = Math.exp(-daysAgo / halfLifeDays);
      
      return {
        message,
        weight,
        daysAgo,
      };
    })
    .sort((a, b) => b.weight - a.weight); // Most recent first
}

/**
 * Aggregate features across multiple messages
 */
export function aggregateFeatures(
  weightedMessages: WeightedMessage[]
): ExtractedFeatures {
  if (weightedMessages.length === 0) {
    return getEmptyFeatures();
  }
  
  const totalWeight = weightedMessages.reduce((sum, wm) => sum + wm.weight, 0);
  
  // Aggregate counts
  let totalWordCount = 0;
  let totalCharCount = 0;
  let totalEmojiCount = 0;
  const allEmojiTypes: string[] = [];
  let totalPunctuationCount = 0;
  let totalExclamationCount = 0;
  let totalQuestionCount = 0;
  let totalCapsChars = 0;
  
  // Language metrics
  let weightedWordLength = 0;
  const allWords: string[] = [];
  
  // Boolean flags (weighted)
  let gratitudeScore = 0;
  let apologyScore = 0;
  let questionScore = 0;
  let planScore = 0;
  let emotionalScore = 0;
  
  // Word lists (weighted)
  const creativeWordCounts: Record<string, number> = {};
  const planningWordCounts: Record<string, number> = {};
  const agreementWordCounts: Record<string, number> = {};
  const disagreementWordCounts: Record<string, number> = {};
  const worryWordCounts: Record<string, number> = {};
  
  // Sentiment
  let weightedSentimentScore = 0;
  
  // Temporal (mode)
  const hourHistogram = new Array(24).fill(0);
  const dayHistogram = new Array(7).fill(0);
  let weekendCount = 0;
  
  for (const wm of weightedMessages) {
    const features = extractMessageFeatures(wm.message);
    const weight = wm.weight;
    
    // Basic counts
    totalWordCount += features.wordCount * weight;
    totalCharCount += features.charCount * weight;
    totalEmojiCount += features.emojiCount * weight;
    allEmojiTypes.push(...features.emojiTypes);
    totalPunctuationCount += features.punctuationCount * weight;
    totalExclamationCount += features.exclamationCount * weight;
    totalQuestionCount += features.questionCount * weight;
    totalCapsChars += features.capsRatio * features.charCount * weight;
    
    // Language
    weightedWordLength += features.avgWordLength * weight;
    allWords.push(...features.topicKeywords);
    
    // Boolean flags
    gratitudeScore += (features.hasGratitude ? 1 : 0) * weight;
    apologyScore += (features.hasApology ? 1 : 0) * weight;
    questionScore += (features.hasQuestion ? 1 : 0) * weight;
    planScore += (features.hasPlan ? 1 : 0) * weight;
    emotionalScore += (features.hasEmotionalWords ? 1 : 0) * weight;
    
    // Word lists
    for (const w of features.creativeWords) {
      creativeWordCounts[w] = (creativeWordCounts[w] || 0) + weight;
    }
    for (const w of features.planningWords) {
      planningWordCounts[w] = (planningWordCounts[w] || 0) + weight;
    }
    for (const w of features.agreementWords) {
      agreementWordCounts[w] = (agreementWordCounts[w] || 0) + weight;
    }
    for (const w of features.disagreementWords) {
      disagreementWordCounts[w] = (disagreementWordCounts[w] || 0) + weight;
    }
    for (const w of features.worryWords) {
      worryWordCounts[w] = (worryWordCounts[w] || 0) + weight;
    }
    
    // Sentiment
    weightedSentimentScore += features.sentimentScore * weight;
    
    // Temporal
    hourHistogram[features.hourOfDay] += weight;
    dayHistogram[features.dayOfWeek] += weight;
    if (features.isWeekend) weekendCount += weight;
  }
  
  // Normalize
  const avgWordCount = totalWordCount / totalWeight;
  const avgCharCount = totalCharCount / totalWeight;
  const avgEmojiCount = totalEmojiCount / totalWeight;
  const avgPunctuation = totalPunctuationCount / totalWeight;
  const avgExclamation = totalExclamationCount / totalWeight;
  const avgQuestion = totalQuestionCount / totalWeight;
  const capsRatio = totalCharCount > 0 ? totalCapsChars / totalCharCount : 0;
  const avgWordLength = weightedWordLength / totalWeight;
  
  const uniqueWords = new Set(allWords).size;
  const vocabRichness = allWords.length > 0 ? uniqueWords / allWords.length : 0;
  
  const hasGratitude = gratitudeScore / totalWeight > 0.3;
  const hasApology = apologyScore / totalWeight > 0.2;
  const hasQuestion = questionScore / totalWeight > 0.3;
  const hasPlan = planScore / totalWeight > 0.15;
  const hasEmotionalWords = emotionalScore / totalWeight > 0.25;
  
  const avgSentimentScore = weightedSentimentScore / totalWeight;
  const sentiment = getSentimentLabel(avgSentimentScore);
  
  // Top words
  const topCreative = Object.entries(creativeWordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
  
  const topPlanning = Object.entries(planningWordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
  
  const topAgreement = Object.entries(agreementWordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
  
  const topDisagreement = Object.entries(disagreementWordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
  
  const topWorry = Object.entries(worryWordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
  
  // Topics (most common)
  const topicCounts: Record<string, number> = {};
  for (const t of allWords) {
    topicCounts[t] = (topicCounts[t] || 0) + 1;
  }
  const topicKeywords = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([t]) => t);
  
  // Temporal modes
  const modeHour = hourHistogram.indexOf(Math.max(...hourHistogram));
  const modeDay = dayHistogram.indexOf(Math.max(...dayHistogram));
  const isWeekend = weekendCount / totalWeight > 0.4;
  
  return {
    wordCount: Math.round(avgWordCount),
    charCount: Math.round(avgCharCount),
    emojiCount: Math.round(avgEmojiCount),
    emojiTypes: [...new Set(allEmojiTypes)],
    punctuationCount: Math.round(avgPunctuation),
    exclamationCount: Math.round(avgExclamation),
    questionCount: Math.round(avgQuestion),
    capsRatio,
    avgWordLength,
    vocabularyRichness: vocabRichness,
    sentiment,
    sentimentScore: avgSentimentScore,
    hasGratitude,
    hasApology,
    hasQuestion,
    hasPlan,
    hasEmotionalWords,
    creativeWords: topCreative,
    planningWords: topPlanning,
    agreementWords: topAgreement,
    disagreementWords: topDisagreement,
    worryWords: topWorry,
    topicKeywords,
    hourOfDay: modeHour,
    dayOfWeek: modeDay,
    isWeekend,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function extractEmojiTypes(text: string): string[] {
  // Simple emoji regex
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu;
  const matches = text.match(emojiRegex) || [];
  return [...new Set(matches)];
}

function extractTopicKeywords(text: string): string[] {
  // Simple keyword extraction - in production would use NLP
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
    'not', 'only', 'just', 'also', 'very', 'really', 'actually', 'literally'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
  
  return [...new Set(words)];
}

function analyzeSentiment(text: string): { sentiment: Sentiment; score: number } {
  const positiveWords = [
    'good', 'great', 'awesome', 'amazing', 'love', 'happy', 'excellent',
    'perfect', 'wonderful', 'fantastic', 'best', 'better', 'nice', 'fun',
    'enjoy', 'excited', 'thrilled', 'grateful', 'thank', 'thanks', 'beautiful'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'worst', 'worse',
    'horrible', 'disappointed', 'frustrating', 'annoying', 'boring',
    'difficult', 'hard', 'problem', 'issue', 'wrong', 'fail', 'sad'
  ];
  
  const textLower = text.toLowerCase();
  const words = textLower.split(/\s+/);
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of words) {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
  }
  
  const total = positiveCount + negativeCount || 1;
  const score = (positiveCount - negativeCount) / total;
  
  // Normalize to -1 to 1 range
  const normalizedScore = Math.max(-1, Math.min(1, score));
  
  let sentiment: Sentiment;
  if (normalizedScore > 0.2) {
    sentiment = 'positive';
  } else if (normalizedScore < -0.2) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }
  
  return { sentiment, score: normalizedScore };
}

function getSentimentLabel(score: number): Sentiment {
  if (score > 0.2) return 'positive';
  if (score < -0.2) return 'negative';
  return 'neutral';
}

function getEmptyFeatures(): ExtractedFeatures {
  return {
    wordCount: 0,
    charCount: 0,
    emojiCount: 0,
    emojiTypes: [],
    punctuationCount: 0,
    exclamationCount: 0,
    questionCount: 0,
    capsRatio: 0,
    avgWordLength: 0,
    vocabularyRichness: 0,
    sentiment: 'neutral',
    sentimentScore: 0,
    hasGratitude: false,
    hasApology: false,
    hasQuestion: false,
    hasPlan: false,
    hasEmotionalWords: false,
    creativeWords: [],
    planningWords: [],
    agreementWords: [],
    disagreementWords: [],
    worryWords: [],
    topicKeywords: [],
    hourOfDay: 12,
    dayOfWeek: 0,
    isWeekend: false,
  };
}

// ============================================================================
// Export all functions
// ============================================================================

export default {
  extractMessageFeatures,
  applyTemporalWeighting,
  aggregateFeatures,
};
