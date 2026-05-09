/**
 * Tier Gating - Check feature availability and generate upgrade prompts
 */

import { SubscriptionTier, SubscriptionStatus, TIER_PRICING, TierPricing } from '../../types';
import { hasFeatureAccess, getRequiredTier, getNextTier, getFeatureInfo, getFeaturesUnlockedByTier } from './FeatureFlags';

export interface UpgradePromptConfig {
  featureKey: string;
  featureName: string;
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  pricing?: TierPricing;
  unlockedFeatures: string[];
  message: string;
}

export interface GatedFeatureResult {
  isAllowed: boolean;
  upgradePrompt?: UpgradePromptConfig;
}

/**
 * Check if a feature is available for a user
 */
export function checkFeatureAccess(
  userTier: SubscriptionTier,
  featureKey: string
): GatedFeatureResult {
  const hasAccess = hasFeatureAccess(userTier, featureKey);
  
  if (hasAccess) {
    return { isAllowed: true };
  }
  
  const requiredTier = getRequiredTier(featureKey);
  const featureInfo = getFeatureInfo(featureKey);
  const nextTier = getNextTier(userTier);
  const pricing = TIER_PRICING.find(t => t.tier === requiredTier);
  
  const unlockedFeatures = nextTier 
    ? getFeaturesUnlockedByTier(userTier, requiredTier).map(f => f.name)
    : [];
  
  const upgradePrompt: UpgradePromptConfig = {
    featureKey,
    featureName: featureInfo?.name || featureKey,
    requiredTier,
    currentTier: userTier,
    pricing,
    unlockedFeatures,
    message: `Upgrade to ${requiredTier === 'pro' ? 'Pro' : 'Business Pro'} to unlock ${featureInfo?.name || featureKey}`,
  };
  
  return {
    isAllowed: false,
    upgradePrompt,
  };
}

/**
 * Check multiple features at once
 */
export function checkMultipleFeatures(
  userTier: SubscriptionTier,
  featureKeys: string[]
): Map<string, GatedFeatureResult> {
  const results = new Map<string, GatedFeatureResult>();
  
  for (const key of featureKeys) {
    results.set(key, checkFeatureAccess(userTier, key));
  }
  
  return results;
}

/**
 * Generate an upgrade prompt for a specific tier
 */
export function generateUpgradePrompt(
  currentTier: SubscriptionTier,
  targetTier: SubscriptionTier
): UpgradePromptConfig {
  const pricing = TIER_PRICING.find(t => t.tier === targetTier);
  const unlockedFeatures = getFeaturesUnlockedByTier(currentTier, targetTier);
  
  return {
    featureKey: 'tier.upgrade',
    featureName: `${targetTier === 'pro' ? 'Pro' : 'Business Pro'} Plan`,
    requiredTier: targetTier,
    currentTier,
    pricing,
    unlockedFeatures: unlockedFeatures.map(f => f.name),
    message: `Upgrade to ${targetTier === 'pro' ? 'Pro' : 'Business Pro'} to unlock ${unlockedFeatures.length}+ features!`,
  };
}

/**
 * Check if subscription is in trial period
 */
export function isInTrialPeriod(status: SubscriptionStatus): boolean {
  if (!status.trialEndDate) return false;
  return new Date() < status.trialEndDate && status.isActive;
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(status: SubscriptionStatus): number {
  if (!status.trialEndDate) return 0;
  
  const now = new Date();
  const end = new Date(status.trialEndDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Check if subscription is expired
 */
export function isSubscriptionExpired(status: SubscriptionStatus): boolean {
  if (status.tier === 'free') return false;
  if (!status.subscriptionEndDate) return false;
  return new Date() > status.subscriptionEndDate;
}

/**
 * Get pricing for a tier
 */
export function getTierPricing(tier: SubscriptionTier): TierPricing | undefined {
  return TIER_PRICING.find(t => t.tier === tier);
}

/**
 * Get display name for tier
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  switch (tier) {
    case 'free':
      return 'Free';
    case 'pro':
      return 'Pro Profile';
    case 'businessPro':
      return 'Business Pro';
    default:
      return tier;
  }
}

/**
 * Get tier badge color
 */
export function getTierBadgeColor(tier: SubscriptionTier): string {
  switch (tier) {
    case 'free':
      return '#9CA3AF'; // gray
    case 'pro':
      return '#3B82F6'; // blue
    case 'businessPro':
      return '#8B5CF6'; // purple
    default:
      return '#9CA3AF';
  }
}

export default {
  checkFeatureAccess,
  checkMultipleFeatures,
  generateUpgradePrompt,
  isInTrialPeriod,
  getTrialDaysRemaining,
  isSubscriptionExpired,
  getTierPricing,
  getTierDisplayName,
  getTierBadgeColor,
};