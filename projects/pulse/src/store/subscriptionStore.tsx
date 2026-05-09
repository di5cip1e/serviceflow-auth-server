import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SubscriptionTier = 'free' | 'pro' | 'businessPro';

interface SubscriptionState {
  tier: SubscriptionTier;
  isTrialActive: boolean;
  trialExpiresAt: Date | null;
  setTier: (tier: SubscriptionTier) => void;
  startTrial: (days: number) => void;
  endTrial: () => void;
}

const defaultState: SubscriptionState = {
  tier: 'free',
  isTrialActive: false,
  trialExpiresAt: null,
  setTier: () => {},
  startTrial: () => {},
  endTrial: () => {},
};

const SubscriptionContext = createContext<SubscriptionState>(defaultState);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<SubscriptionTier>('free');
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialExpiresAt, setTrialExpiresAt] = useState<Date | null>(null);

  const setTier = (newTier: SubscriptionTier) => {
    setTierState(newTier);
  };

  const startTrial = (days: number) => {
    setIsTrialActive(true);
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    setTrialExpiresAt(expires);
  };

  const endTrial = () => {
    setIsTrialActive(false);
    setTrialExpiresAt(null);
    setTierState('free');
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isTrialActive,
        trialExpiresAt,
        setTier,
        startTrial,
        endTrial,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function useHasFeature(feature: string): boolean {
  const { tier } = useSubscription();
  
  const featureMap: Record<string, SubscriptionTier[]> = {
    // Free features
    unifiedInbox: ['free', 'pro', 'businessPro'],
    aiAssistantBasic: ['free', 'pro', 'businessPro'],
    basicContacts: ['free', 'pro', 'businessPro'],
    moodTracking: ['free', 'pro', 'businessPro'],
    oceanBasic: ['free', 'pro', 'businessPro'],
    
    // Pro features
    deepBigFive: ['pro', 'businessPro'],
    contactComparison: ['pro', 'businessPro'],
    compatibilityScores: ['pro', 'businessPro'],
    trends30_60_90: ['pro', 'businessPro'],
    aiAssistantAdvanced: ['pro', 'businessPro'],
    
    // Business Pro features
    multiAccount: ['businessPro'],
    crmDashboard: ['businessPro'],
    analyticsDashboard: ['businessPro'],
    autoReplies: ['businessPro'],
    campaigns: ['businessPro'],
    export: ['businessPro'],
  };
  
  const allowedTiers = featureMap[feature];
  if (!allowedTiers) return true;
  
  return allowedTiers.includes(tier);
}
