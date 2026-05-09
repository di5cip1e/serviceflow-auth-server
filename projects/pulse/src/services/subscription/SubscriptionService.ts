/**
 * Subscription Service - Manages user subscriptions
 */

import {
  SubscriptionTier,
  SubscriptionStatus,
  TierPricing,
  TIER_PRICING,
  DEFAULT_TRIAL_CONFIG,
} from '../../types';
import { isInTrialPeriod, getTrialDaysRemaining } from './TierGating';

export interface SubscriptionUpdate {
  tier?: SubscriptionTier;
  isActive?: boolean;
  trialStartDate?: Date;
  trialEndDate?: Date;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  storeProductId?: string;
  storeTransactionId?: string;
  autoRenew?: boolean;
}

class SubscriptionService {
  private currentSubscription: SubscriptionStatus = {
    tier: 'free',
    isActive: true,
    autoRenew: false,
  };

  /**
   * Initialize subscription from stored data
   */
  initializeFromStorage(subscriptionData?: Partial<SubscriptionStatus>): void {
    if (subscriptionData) {
      this.currentSubscription = {
        ...this.currentSubscription,
        ...subscriptionData,
      };
    }
  }

  /**
   * Get current subscription status
   */
  getSubscription(): SubscriptionStatus {
    return { ...this.currentSubscription };
  }

  /**
   * Get current user's tier
   */
  getCurrentTier(): SubscriptionTier {
    return this.currentSubscription.tier;
  }

  /**
   * Check if user is on a specific tier
   */
  isOnTier(tier: SubscriptionTier): boolean {
    return this.currentSubscription.tier === tier;
  }

  /**
   * Check if user has access to a specific tier
   */
  hasAccessToTier(tier: SubscriptionTier): boolean {
    const tierHierarchy: Record<SubscriptionTier, number> = {
      free: 0,
      pro: 1,
      businessPro: 2,
    };
    return tierHierarchy[this.currentSubscription.tier] >= tierHierarchy[tier];
  }

  /**
   * Start a trial period
   */
  startTrial(): SubscriptionStatus {
    const now = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + DEFAULT_TRIAL_CONFIG.durationDays);

    this.currentSubscription = {
      ...this.currentSubscription,
      trialStartDate: now,
      trialEndDate: trialEnd,
      isActive: true,
    };

    return this.getSubscription();
  }

  /**
   * Check if trial is available
   */
  isTrialAvailable(): boolean {
    // Can only start trial if never had a paid subscription
    return !this.currentSubscription.subscriptionStartDate && 
           !this.currentSubscription.trialStartDate &&
           DEFAULT_TRIAL_CONFIG.enabled;
  }

  /**
   * Check if currently in trial
   */
  isInTrial(): boolean {
    return isInTrialPeriod(this.currentSubscription);
  }

  /**
   * Get trial days remaining
   */
  getTrialDaysRemaining(): number {
    return getTrialDaysRemaining(this.currentSubscription);
  }

  /**
   * Upgrade subscription to a tier
   */
  async upgradeSubscription(
    tier: SubscriptionTier,
    storeProductId?: string,
    storeTransactionId?: string
  ): Promise<SubscriptionStatus> {
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    this.currentSubscription = {
      ...this.currentSubscription,
      tier,
      isActive: true,
      subscriptionStartDate: now,
      subscriptionEndDate: endDate,
      storeProductId,
      storeTransactionId,
      autoRenew: true,
      trialStartDate: undefined,
      trialEndDate: undefined,
      canceledAt: undefined,
    };

    // Persist to storage (stub - would connect to actual storage)
    await this.persistSubscription();

    return this.getSubscription();
  }

  /**
   * Downgrade subscription to a tier
   */
  async downgradeSubscription(tier: SubscriptionTier): Promise<SubscriptionStatus> {
    const now = new Date();
    
    this.currentSubscription = {
      ...this.currentSubscription,
      tier,
      autoRenew: false,
      canceledAt: now, // Mark when downgrade was requested
    };

    // Current subscription period remains valid until end date
    // But tier is changed immediately
    
    await this.persistSubscription();

    return this.getSubscription();
  }

  /**
   * Cancel subscription (turn off auto-renew)
   */
  async cancelSubscription(): Promise<SubscriptionStatus> {
    const now = new Date();
    
    this.currentSubscription = {
      ...this.currentSubscription,
      autoRenew: false,
      canceledAt: now,
    };

    await this.persistSubscription();

    return this.getSubscription();
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(): Promise<SubscriptionStatus> {
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    this.currentSubscription = {
      ...this.currentSubscription,
      isActive: true,
      autoRenew: true,
      subscriptionEndDate: endDate,
      canceledAt: undefined,
    };

    await this.persistSubscription();

    return this.getSubscription();
  }

  /**
   * Restore subscription from store (after app reinstall)
   */
  async restorePurchases(): Promise<{ success: boolean; subscription?: SubscriptionStatus }> {
    // Stub: In production, this would call the store integration
    // to verify existing purchases
    return { success: false };
  }

  /**
   * Handle subscription expiration
   */
  handleExpiration(): void {
    // When subscription expires, downgrade to free
    // but preserve user data
    this.currentSubscription = {
      ...this.currentSubscription,
      tier: 'free',
      isActive: false,
      autoRenew: false,
    };
  }

  /**
   * Get pricing for a specific tier
   */
  getPricingForTier(tier: SubscriptionTier): TierPricing | undefined {
    return TIER_PRICING.find(t => t.tier === tier);
  }

  /**
   * Get all available tiers with pricing
   */
  getAvailableTiers(): TierPricing[] {
    return TIER_PRICING;
  }

  /**
   * Check if user can upgrade
   */
  canUpgrade(): boolean {
    return this.currentSubscription.tier !== 'businessPro';
  }

  /**
   * Check if user can downgrade
   */
  canDowngrade(): boolean {
    return this.currentSubscription.tier !== 'free';
  }

  /**
   * Persist subscription to storage
   */
  private async persistSubscription(): Promise<void> {
    // Stub: In production, save to AsyncStorage or backend
    // For now, just log
    console.log('Persisting subscription:', this.currentSubscription);
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
export default subscriptionService;