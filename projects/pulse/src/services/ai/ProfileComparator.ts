/**
 * ProfileComparator - Compare two Big Five profiles and generate bridging tips
 * Helps users understand differences and improve communication
 */

import {
  BigFiveProfile,
  OCEANDimension,
  PersonalityTrait,
  ComparisonResult,
  DimensionDifference,
  TraitDifference,
  CommunicationTip,
} from '../../types';
import PersonalityEngine from './PersonalityEngine';

// ============================================================================
// Constants
// ============================================================================

const SEVERITY_THRESHOLDS = {
  low: 10,      // Difference < 10: minor, no action needed
  medium: 20,   // 10-20: some adjustment may help
  high: 25,     // > 25: significant difference, needs attention
};

const DIMENSION_LABELS: Record<OCEANDimension, string> = {
  openness: 'Openness',
  conscientiousness: 'Conscientiousness',
  extroversion: 'Extroversion',
  agreeableness: 'Agreeableness',
  neuroticism: 'Neuroticism',
};

// ============================================================================
// Main Comparison Functions
// ============================================================================

/**
 * Compare two Big Five profiles
 */
export function compareProfiles(
  userProfile: BigFiveProfile,
  contactProfile: BigFiveProfile
): ComparisonResult {
  const dimensionDifferences = compareDimensions(userProfile, contactProfile);
  const traitDifferences = compareTraits(userProfile, contactProfile);
  
  return {
    userId: userProfile.userId,
    contactId: contactProfile.userId,
    dimensionDifferences,
    traitDifferences,
  };
}

/**
 * Compare dimension scores between two profiles
 */
function compareDimensions(
  userProfile: BigFiveProfile,
  contactProfile: BigFiveProfile
): DimensionDifference[] {
  const userDimensions = PersonalityEngine.getAllDimensionScores(userProfile);
  const contactDimensions = PersonalityEngine.getAllDimensionScores(contactProfile);
  
  const differences: DimensionDifference[] = [];
  
  for (const userDim of userDimensions) {
    const contactDim = contactDimensions.find(d => d.dimension === userDim.dimension);
    
    if (contactDim) {
      const difference = userDim.overall - contactDim.overall;
      const severity = getSeverity(difference);
      
      differences.push({
        dimension: userDim.dimension,
        userScore: userDim.overall,
        contactScore: contactDim.overall,
        difference,
        severity,
      });
    }
  }
  
  return differences;
}

/**
 * Compare all traits between two profiles
 */
function compareTraits(
  userProfile: BigFiveProfile,
  contactProfile: BigFiveProfile
): TraitDifference[] {
  const userDimensions = PersonalityEngine.getAllDimensionScores(userProfile);
  const contactDimensions = PersonalityEngine.getAllDimensionScores(contactProfile);
  
  const differences: TraitDifference[] = [];
  
  for (const userDim of userDimensions) {
    const contactDim = contactDimensions.find(d => d.dimension === userDim.dimension);
    
    if (contactDim) {
      for (const userTrait of userDim.traits) {
        const contactTrait = contactDim.traits.find(t => t.trait === userTrait.trait);
        
        if (contactTrait) {
          const difference = userTrait.score - contactTrait.score;
          
          differences.push({
            trait: userTrait.trait,
            dimension: userDim.dimension,
            userScore: userTrait.score,
            contactScore: contactTrait.score,
            difference,
          });
        }
      }
    }
  }
  
  // Sort by absolute difference (largest first)
  return differences.sort((a, b) => 
    Math.abs(b.difference) - Math.abs(a.difference)
  );
}

/**
 * Determine severity level based on difference
 */
function getSeverity(difference: number): 'low' | 'medium' | 'high' {
  const absDiff = Math.abs(difference);
  
  if (absDiff < SEVERITY_THRESHOLDS.low) return 'low';
  if (absDiff < SEVERITY_THRESHOLDS.medium) return 'medium';
  return 'high';
}

// ============================================================================
// Communication Tips Generation
// ============================================================================

/**
 * Generate communication tips based on profile differences
 */
export function generateBridgingTips(
  comparison: ComparisonResult
): CommunicationTip[] {
  const tips: CommunicationTip[] = [];
  
  // Process each dimension difference
  for (const dimDiff of comparison.dimensionDifferences) {
    if (dimDiff.severity === 'low') continue;
    
    const dimensionTips = getDimensionTips(dimDiff);
    tips.push(...dimensionTips);
  }
  
  // Process top trait differences
  const significantTraits = comparison.traitDifferences
    .filter(t => Math.abs(t.difference) > 15)
    .slice(0, 5);
  
  for (const traitDiff of significantTraits) {
    const traitTip = getTraitTip(traitDiff);
    if (traitTip) tips.push(traitTip);
  }
  
  // Sort by priority
  return tips.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate tips based on dimension differences
 */
function getDimensionTips(diff: DimensionDifference): CommunicationTip[] {
  const tips: CommunicationTip[] = [];
  
  switch (diff.dimension) {
    case 'openness':
      if (diff.difference > SEVERITY_THRESHOLDS.medium) {
        tips.push({
          id: `openness_${Date.now()}_1`,
          category: 'content',
          priority: diff.severity,
          title: 'Embrace Their Creativity',
          description: 'They score higher in openness and may enjoy exploring new ideas.',
          actionableSuggestion: 'Share more creative topics, discuss possibilities, and be open to unconventional suggestions.',
          basedOnDifference: diff,
        });
      } else if (diff.difference < -SEVERITY_THRESHOLDS.medium) {
        tips.push({
          id: `openness_${Date.now()}_2`,
          category: 'content',
          priority: diff.severity,
          title: 'Ground the Conversation',
          description: 'You score higher in openness. They may prefer practical discussions.',
          actionableSuggestion: 'Balance abstract ideas with practical applications and concrete plans.',
          basedOnDifference: diff,
        });
      }
      break;
      
    case 'conscientiousness':
      if (diff.difference > SEVERITY_THRESHOLDS.medium) {
        tips.push({
          id: `conscientious_${Date.now()}_1`,
          category: 'timing',
          priority: diff.severity,
          title: 'Be More Structured',
          description: 'They value structure and planning more than you do.',
          actionableSuggestion: 'Give them advance notice for activities, be punctual, and follow through on commitments.',
          basedOnDifference: diff,
        });
      } else if (diff.difference < -SEVERITY_THRESHOLDS.medium) {
        tips.push({
          id: `conscientious_${Date.now()}_2`,
          category: 'frequency',
          priority: diff.severity,
          title: 'Flexible Approach Needed',
          description: 'They\'re more spontaneous. Don\'t over-plan everything.',
          actionableSuggestion: 'Leave room for spontaneity and don\'t be rigid about schedules.',
          basedOnDifference: diff,
        });
      }
      break;
      
    case 'extroversion':
      if (diff.difference > SEVERITY_THRESHOLDS.medium) {
        tips.push({
          id: `extroversion_${Date.now()}_1`,
          category: 'frequency',
          priority: diff.severity,
          title: 'Match Their Energy',
          description: 'They\'re more outgoing and may want more frequent contact.',
          actionableSuggestion: 'Initiate conversations more often and be open to group activities.',
          basedOnDifference: diff,
        });
      } else if (diff.difference < -SEVERITY_THRESHOLDS.medium) {
        tips.push({
          id: `extroversion_${Date.now()}_2`,
          category: 'content',
          priority: diff.severity,
          title: 'Respect Their Space',
          description: 'They prefer more private, one-on-one interactions.',
          actionableSuggestion: 'Don\'t overwhelm them with messages. Give them time to respond.',
          basedOnDifference: diff,
        });
      }
      break;
      
    case 'agreeableness':
      if (diff.difference > SEVERITY_THRESHOLDS.medium) {
        tips.push({
          id: `agreeableness_${Date.now()}_1`,
          category: 'tone',
          priority: diff.severity,
          title: 'Be Gentle with Feedback',
          description: 'They value harmony more than you do.',
          actionableSuggestion: 'Frame disagreements gently, use "I" statements, and avoid direct criticism.',
          basedOnDifference: diff,
        });
      } else if (diff.difference < -SEVERITY_THRESHOLDS.medium) {
        tips.push({
          id: `agreeableness_${Date.now()}_2`,
          category: 'tone',
          priority: diff.severity,
          title: 'They Appreciate Directness',
          description: 'They can handle straightforward communication.',
          actionableSuggestion: 'Be honest but respectful. They won\'t take things too personally.',
          basedOnDifference: diff,
        });
      }
      break;
      
    case 'neuroticism':
      if (diff.difference > SEVERITY_THRESHOLDS.medium) {
        tips.push({
          id: `neuroticism_${Date.now()}_1`,
          category: 'tone',
          priority: diff.severity,
          title: 'Be Supportive',
          description: 'They\'re more emotionally reactive. Be patient and supportive.',
          actionableSuggestion: 'Offer reassurance, avoid high-pressure situations, and check in regularly.',
          basedOnDifference: diff,
        });
      } else if (diff.difference < -SEVERITY_THRESHOLDS.medium) {
        tips.push({
          id: `neuroticism_${Date.now()}_2`,
          category: 'content',
          priority: diff.severity,
          title: 'Stay Calm Under Pressure',
          description: 'They\'re more emotionally stable. They can handle stress well.',
          actionableSuggestion: 'Don\'t panic during problems - they\'re a good anchor in difficult times.',
          basedOnDifference: diff,
        });
      }
      break;
  }
  
  return tips;
}

/**
 * Generate tips based on specific trait differences
 */
function getTraitTip(diff: TraitDifference): CommunicationTip | null {
  const absDiff = Math.abs(diff.difference);
  if (absDiff < 15) return null;
  
  const severity = getSeverity(diff.difference);
  const isUserHigher = diff.difference > 0;
  
  switch (diff.trait) {
    case 'gregariousness':
      return {
        id: `trait_${diff.trait}_${Date.now()}`,
        category: 'frequency',
        priority: severity,
        title: isUserHigher ? 'Include Them Socially' : 'Respect Solo Time',
        description: isUserHigher 
          ? 'You enjoy groups more - invite them along but don\'t force it.'
          : 'They prefer smaller groups or alone time.',
        actionableSuggestion: isUserHigher
          ? 'Suggest one-on-one activities occasionally to meet in the middle.'
          : 'Don\'t take it personally if they decline group invitations.',
        basedOnDifference: diff,
      };
      
    case 'assertiveness':
      return {
        id: `trait_${diff.trait}_${Date.now()}`,
        category: 'tone',
        priority: severity,
        title: isUserHigher ? 'Soften Your Approach' : 'Speak Up',
        description: isUserHigher
          ? 'You\'re more assertive - give them space to share their opinion.'
          : 'They\'re more laid back. Encourage them to share their thoughts.',
        actionableSuggestion: isUserHigher
          ? 'Ask for their input explicitly and listen actively.'
          : 'Share your preferences openly - they want to hear them.',
        basedOnDifference: diff,
      };
      
    case 'cheerfulness':
      return {
        id: `trait_${diff.trait}_${Date.now()}`,
        category: 'tone',
        priority: severity,
        title: isUserHigher ? 'Lift Their Spirits' : 'Match Their Energy',
        description: isUserHigher
          ? 'You\'re naturally more cheerful. Be patient if they\'re not as upbeat.'
          : 'Their energy is contagious. Let their positivity influence you.',
        actionableSuggestion: isUserHigher
          ? 'Share positive news and fun content to brighten their day.'
          : 'Embrace their optimistic outlook.',
        basedOnDifference: diff,
      };
      
    case 'trust':
      return {
        id: `trait_${diff.trait}_${Date.now()}`,
        category: 'content',
        priority: severity,
        title: isUserHigher ? 'Build Trust Gradually' : 'Be Reliable',
        description: isUserHigher
          ? 'You trust more easily. They may need more proof of trustworthiness.'
          : 'They trust easily. Don\'t take advantage of their openness.',
        actionableSuggestion: isUserHigher
          ? 'Give them time to build trust. Be consistent over time.'
          : 'Your reliability means everything to them.',
        basedOnDifference: diff,
      };
      
    case 'anxiety':
      return {
        id: `trait_${diff.trait}_${Date.now()}`,
        category: 'timing',
        priority: severity,
        title: isUserHigher ? 'Be Patient' : 'Offer Reassurance',
        description: isUserHigher
          ? 'You experience more anxiety. They might seem calmer about things.'
          : 'They worry more. Offer support without dismissing their concerns.',
        actionableSuggestion: isUserHigher
          ? 'Practice self-care and don\'t let stress compound.'
          : 'Check in on them and offer calm, steady support.',
        basedOnDifference: diff,
      };
      
    default:
      return null;
  }
}

// ============================================================================
// Summary Generation
// ============================================================================

/**
 * Generate a human-readable summary of the comparison
 */
export function generateComparisonSummary(comparison: ComparisonResult): string {
  const highDiffs = comparison.dimensionDifferences.filter(d => d.severity === 'high');
  const mediumDiffs = comparison.dimensionDifferences.filter(d => d.severity === 'medium');
  
  if (highDiffs.length === 0 && mediumDiffs.length === 0) {
    return 'You and this contact have very similar personality profiles!';
  }
  
  const summaryParts: string[] = [];
  
  if (highDiffs.length > 0) {
    summaryParts.push(`Key differences in: ${highDiffs.map(d => DIMENSION_LABELS[d.dimension]).join(', ')}.`);
  }
  
  if (mediumDiffs.length > 0) {
    summaryParts.push(`Some variation in: ${mediumDiffs.map(d => DIMENSION_LABELS[d.dimension]).join(', ')}.`);
  }
  
  return summaryParts.join(' ');
}

export default {
  compareProfiles,
  generateBridgingTips,
  generateComparisonSummary,
};
