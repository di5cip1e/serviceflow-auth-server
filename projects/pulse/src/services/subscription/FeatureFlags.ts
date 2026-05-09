/**
 * Feature Flags - Defines all features with their tier requirements
 */

import { FEATURE_TIER_REQUIREMENTS, ALL_FEATURES, SubscriptionTier, FeatureInfo } from '../../types';

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  businessPro: 2,
};

const TIER_ORDER: SubscriptionTier[] = ['free', 'pro', 'businessPro'];

/**
 * Check if a user has access to a specific feature based on their tier
 */
export function hasFeatureAccess(userTier: SubscriptionTier, featureKey: string): boolean {
  const requiredTier = FEATURE_TIER_REQUIREMENTS[featureKey];
  
  if (!requiredTier) {
    // Feature not found - allow access by default for safety
    console.warn(`Feature "${featureKey}" not found in FEATURE_TIER_REQUIREMENTS, allowing access`);
    return true;
  }
  
  const userTierLevel = TIER_HIERARCHY[userTier];
  const requiredTierLevel = TIER_HIERARCHY[requiredTier];
  
  return userTierLevel >= requiredTierLevel;
}

/**
 * Get the tier required for a specific feature
 */
export function getRequiredTier(featureKey: string): SubscriptionTier {
  return FEATURE_TIER_REQUIREMENTS[featureKey] || 'free';
}

/**
 * Get all features for a specific category
 */
export function getFeaturesByCategory(category: string): FeatureInfo[] {
  return ALL_FEATURES.filter(f => f.category === category);
}

/**
 * Get all features available to a specific tier
 */
export function getAvailableFeatures(userTier: SubscriptionTier): FeatureInfo[] {
  return ALL_FEATURES.filter(f => hasFeatureAccess(userTier, f.key));
}

/**
 * Get all locked features for a specific tier (features they cannot access)
 */
export function getLockedFeatures(userTier: SubscriptionTier): FeatureInfo[] {
  return ALL_FEATURES.filter(f => !hasFeatureAccess(userTier, f.key));
}

/**
 * Get features that would be unlocked by upgrading to a specific tier
 */
export function getFeaturesUnlockedByTier(currentTier: SubscriptionTier, targetTier: SubscriptionTier): FeatureInfo[] {
  if (TIER_ORDER.indexOf(targetTier) <= TIER_ORDER.indexOf(currentTier)) {
    return [];
  }
  
  return ALL_FEATURES.filter(f => {
    const requiredTierLevel = TIER_HIERARCHY[f.requiredTier];
    const currentTierLevel = TIER_HIERARCHY[currentTier];
    const targetTierLevel = TIER_HIERARCHY[targetTier];
    
    return requiredTierLevel > currentTierLevel && requiredTierLevel <= targetTierLevel;
  });
}

/**
 * Check if user can upgrade to a specific tier
 */
export function canUpgradeToTier(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
  const currentLevel = TIER_HIERARCHY[currentTier];
  const targetLevel = TIER_HIERARCHY[targetTier];
  
  return targetLevel > currentLevel;
}

/**
 * Check if user can downgrade to a specific tier
 */
export function canDowngradeToTier(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
  const currentLevel = TIER_HIERARCHY[currentTier];
  const targetLevel = TIER_HIERARCHY[targetTier];
  
  return targetLevel < currentLevel;
}

/**
 * Get the next tier up from current
 */
export function getNextTier(currentTier: SubscriptionTier): SubscriptionTier | null {
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  if (currentIndex < TIER_ORDER.length - 1) {
    return TIER_ORDER[currentIndex + 1];
  }
  return null;
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const categories = new Set(ALL_FEATURES.map(f => f.category));
  return Array.from(categories);
}

/**
 * Get feature info by key
 */
export function getFeatureInfo(featureKey: string): FeatureInfo | undefined {
  return ALL_FEATURES.find(f => f.key === featureKey);
}

export default {
  hasFeatureAccess,
  getRequiredTier,
  getFeaturesByCategory,
  getAvailableFeatures,
  getLockedFeatures,
  getFeaturesUnlockedByTier,
  canUpgradeToTier,
  canDowngradeToTier,
  getNextTier,
  getAllCategories,
  getFeatureInfo,
};