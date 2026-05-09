/**
 * MessageAnalyzer - Analyzes incoming messages
 * Tone detection, sentiment analysis, summarization, topic extraction
 */

import {
  Message,
  MessageAnalysis,
  MoodType,
  Sentiment,
} from '../../types';

// ============================================================================
// Topic Keywords
// ============================================================================

const TOPIC_KEYWORDS: Record<string, string[]> = {
  work: ['meeting', 'project', 'deadline', 'client', 'boss', 'colleague', 'office', 'email', 'report', 'presentation'],
  social: ['party', 'hangout', 'dinner', 'lunch', 'coffee', 'movie', 'game', 'event', 'celebration'],
  family: ['mom', 'dad', 'parent', 'brother', 'sister', 'family', 'home', 'kids', 'birthday'],
  health: ['doctor', 'sick', 'health', 'exercise', 'gym', 'workout', 'medicine', 'appointment'],
  travel: ['trip', 'vacation', 'flight', 'hotel', 'travel', 'airport', 'destination', 'road'],
  money: ['money', 'bill', 'payment', 'cost', 'expensive', 'cheap', 'budget', 'salary', 'deal'],
  tech: ['app', 'phone', 'computer', 'software', 'update', 'tech', 'digital', 'online', 'wifi'],
  entertainment: ['movie', 'show', 'music', 'game', 'book', 'netflix', 'series', 'concert'],
  food: ['food', 'restaurant', 'cook', 'eat', 'recipe', 'dinner', 'lunch', 'breakfast', 'cuisine'],
  plans: ['plan', 'schedule', 'when', 'tomorrow', 'weekend', 'meet', 'go', 'come', 'together'],
};

// ============================================================================
// Mood Patterns
// ============================================================================

const MOOD_PATTERNS: Record<MoodType, { keywords: string[]; weight: number }> = {
  happy: {
    keywords: ['happy', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'love', 'excited', 'yay', '😊', '🎉', '❤️'],
    weight: 1.0,
  },
  sad: {
    keywords: ['sad', 'unhappy', 'depressed', 'down', 'upset', 'miss', 'lonely', 'tired', '😢', '💔'],
    weight: 0.9,
  },
  excited: {
    keywords: ['excited', 'can\'t wait', 'thrilled', 'amazing', 'incredible', 'wow', 'awesome', '🎉', '🙌'],
    weight: 1.0,
  },
  worried: {
    keywords: ['worried', 'concerned', 'nervous', 'anxious', 'scared', 'hope', 'if', 'maybe', '?', '😟'],
    weight: 0.85,
  },
  neutral: {
    keywords: ['ok', 'okay', 'sure', 'alright', 'fine', 'just'],
    weight: 0.5,
  },
  angry: {
    keywords: ['angry', 'mad', 'annoyed', 'frustrated', 'hate', 'stupid', 'annoying', '😠', '😤'],
    weight: 0.9,
  },
  grateful: {
    keywords: ['thank', 'thanks', 'grateful', 'appreciate', 'blessed', 'fortunate', '🙏', '❤️'],
    weight: 1.0,
  },
  frustrated: {
    keywords: ['frustrated', 'annoying', 'can\'t', 'impossible', 'ugh', 'seriously', '😩', '😤'],
    weight: 0.85,
  },
};

// ============================================================================
// Main Analysis Functions
// ============================================================================

/**
 * Analyze a single message
 */
export function analyzeMessage(message: Message): MessageAnalysis {
  const content = message.content;
  const lowerContent = content.toLowerCase();
  
  // Detect mood
  const { mood, confidence: moodConfidence } = detectMood(lowerContent);
  
  // Analyze sentiment
  const { sentiment, score: sentimentScore } = analyzeSentiment(lowerContent);
  
  // Extract topics
  const topics = extractTopics(lowerContent);
  
  // Generate summary
  const summary = generateSummary(content, mood, topics);
  
  // Detect intent
  const intent = detectIntent(lowerContent, message.metadata.isQuestion);
  
  return {
    messageId: message.id,
    summary,
    tone: mood,
    toneConfidence: moodConfidence,
    keyTopics: topics,
    sentiment,
    sentimentScore,
    suggestedIntent: intent,
  };
}

/**
 * Analyze multiple messages (conversation)
 */
export function analyzeConversation(messages: Message[]): MessageAnalysis {
  if (messages.length === 0) {
    return {
      messageId: '',
      summary: 'No messages to analyze.',
      tone: 'neutral',
      toneConfidence: 0,
      keyTopics: [],
      sentiment: 'neutral',
      sentimentScore: 0,
    };
  }
  
  // Analyze each message
  const analyses = messages.map(analyzeMessage);
  
  // Aggregate results
  const dominantMood = aggregateMoods(analyses.map(a => a.tone));
  const avgMoodConfidence = analyses.reduce((sum, a) => sum + a.toneConfidence, 0) / analyses.length;
  const allTopics = analyses.flatMap(a => a.keyTopics);
  const uniqueTopics = [...new Set(allTopics)];
  const avgSentimentScore = analyses.reduce((sum, a) => sum + a.sentimentScore, 0) / analyses.length;
  
  // Generate conversation summary
  const summary = generateConversationSummary(analyses, messages.length);
  
  // Determine overall sentiment
  const sentiment = avgSentimentScore > 0.2 ? 'positive' : avgSentimentScore < -0.2 ? 'negative' : 'neutral';
  
  return {
    messageId: messages[messages.length - 1].id,
    summary,
    tone: dominantMood,
    toneConfidence: avgMoodConfidence,
    keyTopics: uniqueTopics.slice(0, 5),
    sentiment,
    sentimentScore: avgSentimentScore,
  };
}

// ============================================================================
// Mood Detection
// ============================================================================

/**
 * Detect mood from message content
 */
function detectMood(content: string): { mood: MoodType; confidence: number } {
  const scores: Record<MoodType, number> = {
    happy: 0,
    sad: 0,
    excited: 0,
    worried: 0,
    neutral: 0,
    angry: 0,
    grateful: 0,
    frustrated: 0,
  };
  
  for (const [mood, pattern] of Object.entries(MOOD_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      if (content.includes(keyword)) {
        scores[mood as MoodType] += pattern.weight;
      }
    }
  }
  
  // Check for emojis
  if (content.includes('😊') || content.includes('😄') || content.includes('🎉')) {
    scores.happy += 2;
  }
  if (content.includes('😢') || content.includes('💔')) {
    scores.sad += 2;
  }
  if (content.includes('😠') || content.includes('😤')) {
    scores.angry += 2;
  }
  if (content.includes('😟') || content.includes('😩')) {
    scores.worried += 2;
  }
  if (content.includes('🙏') || content.includes('❤️')) {
    scores.grateful += 2;
  }
  
  // Check for exclamation emphasis
  const exclamationCount = (content.match(/!/g) || []).length;
  if (exclamationCount >= 2) {
    scores.excited += exclamationCount;
  }
  
  // Check question marks (often indicates worry or curiosity)
  const questionCount = (content.match(/\?/g) || []).length;
  if (questionCount >= 2) {
    scores.worried += questionCount * 0.5;
  }
  
  // Find dominant mood
  let dominantMood: MoodType = 'neutral';
  let maxScore = 0;
  
  for (const [mood, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      dominantMood = mood as MoodType;
    }
  }
  
  // Calculate confidence (how much the dominant mood stands out)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? maxScore / (totalScore + 1) : 0;
  
  return {
    mood: dominantMood,
    confidence: Math.min(1, confidence),
  };
}

/**
 * Aggregate moods from multiple messages
 */
function aggregateMoods(moods: MoodType[]): MoodType {
  const counts: Record<MoodType, number> = {
    happy: 0,
    sad: 0,
    excited: 0,
    worried: 0,
    neutral: 0,
    angry: 0,
    grateful: 0,
    frustrated: 0,
  };
  
  for (const mood of moods) {
    counts[mood]++;
  }
  
  // Find most common mood
  let dominant = 'neutral' as MoodType;
  let max = 0;
  
  for (const [mood, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      dominant = mood as MoodType;
    }
  }
  
  return dominant;
}

// ============================================================================
// Sentiment Analysis
// ============================================================================

/**
 * Analyze sentiment of message
 */
function analyzeSentiment(content: string): { sentiment: Sentiment; score: number } {
  const positiveWords = [
    'good', 'great', 'awesome', 'amazing', 'love', 'happy', 'excellent',
    'perfect', 'wonderful', 'fantastic', 'best', 'better', 'nice', 'fun',
    'enjoy', 'excited', 'thrilled', 'grateful', 'thank', 'thanks', 'beautiful',
    'glad', 'pleased', 'delighted', 'joy', 'wonderful', 'terrific'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'worst', 'worse',
    'horrible', 'disappointed', 'frustrating', 'annoying', 'boring',
    'difficult', 'hard', 'problem', 'issue', 'wrong', 'fail', 'sad',
    'upset', 'annoyed', 'irritated', 'stupid', 'dumb', 'poor'
  ];
  
  const intensifiers = ['very', 'really', 'extremely', 'absolutely', 'totally', 'completely'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  const words = content.split(/\s+/);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase().replace(/[^a-z]/g, '');
    
    if (positiveWords.includes(word)) {
      // Check for intensifier before
      const hasIntensifier = i > 0 && intensifiers.includes(words[i - 1].toLowerCase());
      positiveCount += hasIntensifier ? 2 : 1;
    }
    
    if (negativeWords.includes(word)) {
      const hasIntensifier = i > 0 && intensifiers.includes(words[i - 1].toLowerCase());
      negativeCount += hasIntensifier ? 2 : 1;
    }
  }
  
  const total = positiveCount + negativeCount || 1;
  const rawScore = (positiveCount - negativeCount) / total;
  
  // Normalize to -1 to 1
  const score = Math.max(-1, Math.min(1, rawScore));
  
  let sentiment: Sentiment;
  if (score > 0.15) {
    sentiment = 'positive';
  } else if (score < -0.15) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }
  
  return { sentiment, score };
}

// ============================================================================
// Topic Extraction
// ============================================================================

/**
 * Extract topics from content
 */
function extractTopics(content: string): string[] {
  const foundTopics: string[] = [];
  
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        foundTopics.push(topic);
        break;
      }
    }
  }
  
  return foundTopics;
}

// ============================================================================
// Summary Generation
// ============================================================================

/**
 * Generate a brief summary of a single message
 */
function generateSummary(content: string, mood: MoodType, topics: string[]): string {
  const wordCount = content.split(/\s+/).length;
  
  // Short message summary
  if (wordCount < 5) {
    return content;
  }
  
  // Medium message - extract key parts
  if (wordCount < 20) {
    // Check for question
    if (content.includes('?')) {
      return `Asking about ${topics[0] || 'something'}`;
    }
    // Check for statement
    return content.substring(0, 100) + (content.length > 100 ? '...' : '');
  }
  
  // Longer message - summarize
  const topicStr = topics.length > 0 ? ` about ${topics[0]}` : '';
  const moodStr = mood === 'excited' ? ' is excited' : mood === 'worried' ? ' seems concerned' : '';
  
  return `Message${moodStr}${topicStr}: "${content.substring(0, 80)}..."`;
}

/**
 * Generate conversation summary
 */
function generateConversationSummary(analyses: MessageAnalysis[], messageCount: number): string {
  if (messageCount === 1) {
    return analyses[0].summary;
  }
  
  const moods = analyses.map(a => a.tone);
  const topics = [...new Set(analyses.flatMap(a => a.keyTopics))];
  
  // Count mood distribution
  const moodCounts = moods.reduce((acc, m) => {
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  
  const topicStr = topics.length > 0 ? ` discussing ${topics.slice(0, 2).join(', ')}` : '';
  const moodStr = dominantMood && dominantMood[1] > messageCount / 2 
    ? ` (mostly ${dominantMood[0]})` 
    : '';
  
  return `${messageCount} messages exchanged${topicStr}${moodStr}.`;
}

// ============================================================================
// Intent Detection
// ============================================================================

/**
 * Detect message intent
 */
function detectIntent(content: string, isQuestion: boolean): string {
  if (isQuestion) {
    if (content.includes('when')) return 'scheduling';
    if (content.includes('where')) return 'location_inquiry';
    if (content.includes('how much') || content.includes('price') || content.includes('cost')) return 'price_inquiry';
    if (content.includes('what') || content.includes('which')) return 'information_request';
    if (content.includes('who')) return 'person_inquiry';
    if (content.includes('why')) return 'explanation_request';
    if (content.includes('can you') || content.includes('would you') || content.includes('could you')) return 'request';
    return 'question';
  }
  
  // Non-question intents
  if (content.includes('!') && content.length < 50) return 'exclamation';
  if (content.startsWith('hey') || content.startsWith('hi') || content.startsWith('hello')) return 'greeting';
  if (content.includes('thank') || content.includes('thanks')) return 'gratitude';
  if (content.includes('sorry') || content.includes('apologize')) return 'apology';
  if (content.includes('bye') || content.includes('talk later') || content.includes('gotta go')) return 'farewell';
  if (content.includes('lol') || content.includes('haha') || content.includes('😂')) return 'joking';
  if (content.includes('plan') || content.includes('schedule') || content.includes('meeting')) return 'planning';
  if (content.includes('!')) return 'excitement';
  
  return 'statement';
}

export default {
  analyzeMessage,
  analyzeConversation,
};
