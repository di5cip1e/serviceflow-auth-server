/**
 * Subscription Services Index
 */

export { default as subscriptionService } from './SubscriptionService';
export { default as FeatureFlags, 
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
} from './FeatureFlags';
export { default as TierGating,
  checkFeatureAccess,
  checkMultipleFeatures,
  generateUpgradePrompt,
  isInTrialPeriod,
  getTrialDaysRemaining,
  isSubscriptionExpired,
  getTierPricing,
  getTierDisplayName,
  getTierBadgeColor,
  type UpgradePromptConfig,
  type GatedFeatureResult,
} from './TierGating';
export { default as StoreIntegration,
  GooglePlayStore,
  AppStore,
  getStore,
  initializeStore,
  type StoreProduct,
  type PurchaseResult,
  type ValidationResult,
} from './StoreIntegration';

// Re-export types directly
export type { SubscriptionTier, SubscriptionStatus, TrialConfig, TierPricing, FeatureInfo } from '../../types/subscription';
export { TIER_PRICING, DEFAULT_TRIAL_CONFIG, FEATURE_TIER_REQUIREMENTS, ALL_FEATURES } from '../../types/subscription';
