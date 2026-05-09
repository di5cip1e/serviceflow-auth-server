/**
 * CompatibilityScorer - Calculate relationship compatibility
 * Generates compatibility scores, strengths, challenges, and trends
 */

import {
  BigFiveProfile,
  CompatibilityResult,
  CompatibilityStrength,
  CompatibilityChallenge,
  HistoricalTrend,
  CompatibilityLevel,
  OCEANDimension,
  ComparisonResult,
} from '../../types';
import ProfileComparator from './ProfileComparator';

// ============================================================================
// Compatibility Weights
// ============================================================================

// How much each dimension contributes to compatibility
const DIMENSION_WEIGHTS: Record<OCEANDimension, number> = {
  agreeableness: 0.30,  // Most important for relationship harmony
  extroversion: 0.20,   // Communication frequency/style
  conscientiousness: 0.20, // Reliability and follow-through
  openness: 0.15,       // Shared interests and activities
  neuroticism: 0.15,   // Emotional stability (inverse - high neuroticism = lower compatibility)
};

// ============================================================================
// Main Scoring Functions
// ============================================================================

/**
 * Calculate compatibility between two profiles
 */
export function calculateCompatibility(
  userProfile: BigFiveProfile,
  contactProfile: BigFiveProfile,
  historicalScores?: number[] // Optional: previous scores for trend analysis
): CompatibilityResult {
  // Get comparison data
  const comparison = ProfileComparator.compareProfiles(userProfile, contactProfile);
  
  // Calculate base compatibility score
  const baseScore = calculateBaseScore(comparison);
  
  // Adjust for confidence levels
  const confidenceAdjustedScore = adjustForConfidence(baseScore, userProfile, contactProfile);
  
  // Determine compatibility level
  const level = getCompatibilityLevel(confidenceAdjustedScore);
  
  // Generate strengths and challenges
  const strengths = generateStrengths(comparison);
  const challenges = generateChallenges(comparison);
  
  // Generate or update trends
  const trends = generateTrends(historicalScores, confidenceAdjustedScore);
  const trendDirection = calculateTrendDirection(trends);
  
  return {
    compatibilityScore: Math.round(confidenceAdjustedScore),
    level,
    strengths,
    challenges,
    trends,
    trendDirection,
  };
}

/**
 * Calculate base compatibility score from comparison
 */
function calculateBaseScore(comparison: ComparisonResult): number {
  let weightedDiff = 0;
  
  for (const dimDiff of comparison.dimensionDifferences) {
    const weight = DIMENSION_WEIGHTS[dimDiff.dimension];
    
    // For neuroticism, difference is inverted (high neuroticism = less compatible)
    let adjustedDiff = dimDiff.difference;
    if (dimDiff.dimension === 'neuroticism') {
      adjustedDiff = -adjustedDiff * 0.5; // Invert and dampen
    }
    
    weightedDiff += Math.abs(adjustedDiff) * weight;
  }
  
  // Convert difference to compatibility score
  // Max difference possible is ~100, so we normalize
  const maxDiff = 100;
  const normalizedDiff = Math.min(weightedDiff, maxDiff);
  
  // Score = 100 - normalized difference
  // Apply a curve so differences matter less at the extremes
  const score = 100 - (normalizedDiff * 0.8);
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Adjust score based on profile confidence levels
 */
function adjustForConfidence(
  baseScore: number,
  userProfile: BigFiveProfile,
  contactProfile: BigFiveProfile
): number {
  // Lower confidence = less reliable score, so we dampen extreme scores
  const avgConfidence = (userProfile.overallConfidence + contactProfile.overallConfidence) / 2;
  
  // If confidence is low, pull score toward 50 (neutral)
  const confidenceFactor = avgConfidence;
  const neutralPull = 50 * (1 - confidenceFactor);
  
  const adjustedScore = (baseScore * confidenceFactor) + neutralPull;
  
  return adjustedScore;
}

/**
 * Determine compatibility level from score
 */
function getCompatibilityLevel(score: number): CompatibilityLevel {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'moderate';
  if (score >= 30) return 'challenging';
  return 'poor';
}

// ============================================================================
// Strengths Generation
// ============================================================================

/**
 * Generate compatibility strengths based on similarities
 */
function generateStrengths(comparison: ComparisonResult): CompatibilityStrength[] {
  const strengths: CompatibilityStrength[] = [];
  
  // Check for strong similarities (small differences)
  for (const dimDiff of comparison.dimensionDifferences) {
    if (Math.abs(dimDiff.difference) < 10) {
      strengths.push({
        category: 'similarity',
        description: `Similar ${formatDimension(dimDiff.dimension)} levels - natural understanding.`,
      });
    }
  }
  
  // Check for complementary traits
  if (comparison.dimensionDifferences.find(d => 
    d.dimension === 'extroversion' && d.difference > 15
  )) {
    strengths.push({
      category: 'complement',
      description: 'Complementary social energy - you balance each other well.',
    });
  }
  
  if (comparison.dimensionDifferences.find(d => 
    d.dimension === 'conscientiousness' && d.difference > 15
  )) {
    strengths.push({
      category: 'complement',
      description: 'Your different approaches to planning complement each other.',
    });
  }
  
  // Check for strong agreeableness on either side
  const userAgreeableness = comparison.dimensionDifferences.find(d => 
    d.dimension === 'agreeableness' && d.userScore > 75
  );
  const contactAgreeableness = comparison.dimensionDifferences.find(d => 
    d.dimension === 'agreeableness' && d.contactScore > 75
  );
  
  if (userAgreeableness || contactAgreeableness) {
    strengths.push({
      category: 'harmony',
      description: 'At least one of you values relationship harmony highly.',
    });
  }
  
  // If they share high openness
  const bothOpen = comparison.dimensionDifferences.find(d => 
    d.dimension === 'openness' && Math.abs(d.difference) < 20 &&
    d.userScore > 60 && d.contactScore > 60
  );
  
  if (bothOpen) {
    strengths.push({
      category: 'shared',
      description: 'Both open to new experiences - great for adventures together!',
    });
  }
  
  // Limit to top 4 strengths
  return strengths.slice(0, 4);
}

// ============================================================================
// Challenges Generation
// ============================================================================

/**
 * Generate compatibility challenges based on differences
 */
function generateChallenges(comparison: ComparisonResult): CompatibilityChallenge[] {
  const challenges: CompatibilityChallenge[] = [];
  
  for (const dimDiff of comparison.dimensionDifferences) {
    if (dimDiff.severity === 'high') {
      const challenge = getHighSeverityChallenge(dimDiff);
      if (challenge) challenges.push(challenge);
    } else if (dimDiff.severity === 'medium') {
      const challenge = getMediumSeverityChallenge(dimDiff);
      if (challenge) challenges.push(challenge);
    }
  }
  
  // Limit to top 4 challenges
  return challenges.slice(0, 4);
}

/**
 * Generate challenges for high-severity differences
 */
function getHighSeverityChallenge(diff: { dimension: OCEANDimension; difference: number }): CompatibilityChallenge | null {
  const isUserHigher = diff.difference > 0;
  const userLabel = isUserHigher ? 'You' : 'They';
  const otherLabel = isUserHigher ? 'They' : 'You';
  
  switch (diff.dimension) {
    case 'extroversion':
      return {
        category: 'communication',
        description: `${userLabel} prefer more social interaction than ${otherLabel}.`,
        mitigation: isUserHigher 
          ? 'Give them space and one-on-one time instead of big groups.'
          : 'Make an effort to initiate contact and be more responsive.',
      };
      
    case 'conscientiousness':
      return {
        category: 'reliability',
        description: `${userLabel} are more structured while ${otherLabel} are more spontaneous.`,
        mitigation: isUserHigher 
          ? 'Don\'t expect them to be as organized. Be flexible with plans.'
          : 'Try to be more reliable and follow through on commitments.',
      };
      
    case 'agreeableness':
      return {
        category: 'conflict',
        description: `${userLabel} value harmony more than ${otherLabel}.`,
        mitigation: isUserHigher 
          ? 'Speak up more - they can handle direct feedback.'
          : 'Be gentler with criticism and frame disagreements carefully.',
      };
      
    case 'neuroticism':
      return {
        category: 'emotional',
        description: `${otherLabel} are more emotionally reactive.`,
        mitigation: isUserHigher 
          ? 'Offer patience and emotional support when needed.'
          : 'Your stability is a calming influence - be reassuring.',
      };
      
    default:
      return null;
  }
}

/**
 * Generate challenges for medium-severity differences
 */
function getMediumSeverityChallenge(diff: { dimension: OCEANDimension; difference: number }): CompatibilityChallenge | null {
  const isUserHigher = diff.difference > 0;
  
  switch (diff.dimension) {
    case 'openness':
      return {
        category: 'interests',
        description: isUserHigher
          ? 'You enjoy abstract discussions more than they do.'
          : 'They prefer concrete topics over abstract ideas.',
        mitigation: isUserHigher
          ? 'Balance creative discussions with practical topics.'
          : 'Share ideas and possibilities, not just facts.',
      };
      
    case 'extroversion':
      return {
        category: 'social',
        description: isUserHigher
          ? 'You tend to be more outgoing in conversations.'
          : 'They\'re more reserved in communication.',
        mitigation: isUserHigher
          ? 'Let them set the pace in conversations.'
          : 'Be patient if they\'re slower to respond or share.',
      };
      
    default:
      return null;
  }
}

// ============================================================================
// Trends Generation
// ============================================================================

/**
 * Generate historical trends
 */
function generateTrends(historicalScores: number[] | undefined, currentScore: number): HistoricalTrend[] {
  const trends: HistoricalTrend[] = [];
  
  // Add historical scores if available
  if (historicalScores && historicalScores.length > 0) {
    const now = new Date();
    
    for (let i = historicalScores.length - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (historicalScores.length - 1 - i) * 7); // Weekly
      
      trends.push({
        date: date.toISOString().split('T')[0],
        score: historicalScores[i],
      });
    }
  }
  
  // Add current score
  trends.push({
    date: new Date().toISOString().split('T')[0],
    score: currentScore,
  });
  
  return trends;
}

/**
 * Calculate trend direction
 */
function calculateTrendDirection(trends: HistoricalTrend[]): 'improving' | 'stable' | 'declining' {
  if (trends.length < 3) return 'stable';
  
  // Compare first third to last third
  const third = Math.floor(trends.length / 3);
  const earlyAvg = trends.slice(0, third).reduce((sum, t) => sum + t.score, 0) / third;
  const lateAvg = trends.slice(-third).reduce((sum, t) => sum + t.score, 0) / third;
  
  const change = lateAvg - earlyAvg;
  
  if (change > 5) return 'improving';
  if (change < -5) return 'declining';
  return 'stable';
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDimension(dimension: OCEANDimension): string {
  return dimension.charAt(0).toUpperCase() + dimension.slice(1);
}

/**
 * Get relationship health description
 */
export function getRelationshipHealthDescription(result: CompatibilityResult): string {
  switch (result.level) {
    case 'excellent':
      return 'You two have excellent compatibility! Your personalities complement each other well.';
    case 'good':
      return 'You have good compatibility with this contact. There are more strengths than challenges.';
    case 'moderate':
      return 'Your compatibility is moderate. Some differences exist but can be worked through.';
    case 'challenging':
      return 'This relationship has some challenges. Understanding each other key.';
    case 'poor':
      return 'You may need to work harder to understand each other. Focus on communication.';
  }
}

export default {
  calculateCompatibility,
  getRelationshipHealthDescription,
};
