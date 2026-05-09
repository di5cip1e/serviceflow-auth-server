/**
 * Subscription tier types for P.U.L.S.E
 */

export type SubscriptionTier = 'free' | 'pro' | 'businessPro';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;
  trialStartDate?: Date;
  trialEndDate?: Date;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  storeProductId?: string;
  storeTransactionId?: string;
  canceledAt?: Date;
  autoRenew: boolean;
}

export interface TrialConfig {
  enabled: boolean;
  durationDays: number;
}

export interface TierPricing {
  tier: SubscriptionTier;
  monthlyPrice: number;
  yearlyPrice: number;
  productIdGooglePlay?: string;
  productIdAppStore?: string;
}

export const TIER_PRICING: TierPricing[] = [
  { tier: 'free', monthlyPrice: 0, yearlyPrice: 0 },
  { tier: 'pro', monthlyPrice: 4.99, yearlyPrice: 47.99, productIdGooglePlay: 'pro_monthly', productIdAppStore: 'com.pulse.pro.monthly' },
  { tier: 'businessPro', monthlyPrice: 14.99, yearlyPrice: 143.99, productIdGooglePlay: 'business_pro_monthly', productIdAppStore: 'com.pulse.business.monthly' },
];

export const DEFAULT_TRIAL_CONFIG: TrialConfig = {
  enabled: true,
  durationDays: 7,
};

export const FEATURE_TIER_REQUIREMENTS: Record<string, SubscriptionTier> = {
  // Messaging
  'messaging.basic': 'free',
  'messaging.ai.responses': 'free',
  'messaging.attachments': 'free',
  
  // AI Features
  'ai.conversation': 'free',
  'ai.personality.insights': 'pro',
  'ai.relationship.analysis': 'pro',
  'ai.mood.tracking': 'pro',
  'ai.advanced.predictions': 'businessPro',
  
  // Profile
  'profile.basic': 'free',
  'profile.deep.analysis': 'pro',
  'profile.cross.person': 'businessPro',
  
  // CRM Features
  'crm.pipeline': 'businessPro',
  'crm.lead.tracking': 'businessPro',
  'crm.activity.logging': 'businessPro',
  'crm.automations': 'businessPro',
  'crm.integration': 'businessPro',
  
  // Campaign Features
  'campaigns.create': 'businessPro',
  'campaigns.audience.targeting': 'businessPro',
  'campaigns.delivery.tracking': 'businessPro',
  'campaigns.analytics': 'businessPro',
  'campaigns.ab.testing': 'businessPro',
  
  // Analytics Features
  'analytics.response.metrics': 'businessPro',
  'analytics.engagement.scoring': 'businessPro',
  'analytics.export.csv': 'businessPro',
  'analytics.reports': 'businessPro',
  'analytics.dashboards': 'businessPro',
  
  // Storage & Limits
  'storage.messages': 'free',
  'storage.contacts': 'free',
  'storage.unlimited': 'pro',
  
  // Limits
  'limit.contacts': 'free',
  'limit.contacts.expanded': 'pro',
  'limit.contacts.unlimited': 'businessPro',
};

export interface FeatureInfo {
  key: string;
  name: string;
  description: string;
  category: string;
  requiredTier: SubscriptionTier;
}

export const ALL_FEATURES: FeatureInfo[] = [
  // Messaging Features
  { key: 'messaging.basic', name: 'Basic Messaging', description: 'Send and receive messages', category: 'Messaging', requiredTier: 'free' },
  { key: 'messaging.ai.responses', name: 'AI Responses', description: 'Get AI-generated responses', category: 'Messaging', requiredTier: 'free' },
  { key: 'messaging.attachments', name: 'Attachments', description: 'Share files and media', category: 'Messaging', requiredTier: 'free' },
  
  // AI Features
  { key: 'ai.conversation', name: 'AI Conversation', description: 'Chat with AI assistant', category: 'AI', requiredTier: 'free' },
  { key: 'ai.personality.insights', name: 'Personality Insights', description: 'Deep personality analysis', category: 'AI', requiredTier: 'pro' },
  { key: 'ai.relationship.analysis', name: 'Relationship Analysis', description: 'Analyze relationship patterns', category: 'AI', requiredTier: 'pro' },
  { key: 'ai.mood.tracking', name: 'Mood Tracking', description: 'Track emotional patterns', category: 'AI', requiredTier: 'pro' },
  { key: 'ai.advanced.predictions', name: 'Advanced Predictions', description: 'AI-powered relationship predictions', category: 'AI', requiredTier: 'businessPro' },
  
  // Profile Features
  { key: 'profile.basic', name: 'Basic Profile', description: 'View contact profiles', category: 'Profile', requiredTier: 'free' },
  { key: 'profile.deep.analysis', name: 'Deep Profile Analysis', description: 'Comprehensive personality profiles', category: 'Profile', requiredTier: 'pro' },
  { key: 'profile.cross.person', name: 'Cross-Person Analysis', description: 'Compare multiple people', category: 'Profile', requiredTier: 'businessPro' },
  
  // CRM Features
  { key: 'crm.pipeline', name: 'Pipeline Management', description: 'Manage sales pipeline', category: 'CRM', requiredTier: 'businessPro' },
  { key: 'crm.lead.tracking', name: 'Lead Tracking', description: 'Track leads and opportunities', category: 'CRM', requiredTier: 'businessPro' },
  { key: 'crm.activity.logging', name: 'Activity Logging', description: 'Log all interactions', category: 'CRM', requiredTier: 'businessPro' },
  { key: 'crm.automations', name: 'CRM Automations', description: 'Automated workflows', category: 'CRM', requiredTier: 'businessPro' },
  { key: 'crm.integration', name: 'CRM Integrations', description: 'Connect with external CRMs', category: 'CRM', requiredTier: 'businessPro' },
  
  // Campaign Features
  { key: 'campaigns.create', name: 'Create Campaigns', description: 'Create outreach campaigns', category: 'Campaigns', requiredTier: 'businessPro' },
  { key: 'campaigns.audience.targeting', name: 'Audience Targeting', description: 'Target specific audiences', category: 'Campaigns', requiredTier: 'businessPro' },
  { key: 'campaigns.delivery.tracking', name: 'Delivery Tracking', description: 'Track campaign delivery', category: 'Campaigns', requiredTier: 'businessPro' },
  { key: 'campaigns.analytics', name: 'Campaign Analytics', description: 'Detailed campaign metrics', category: 'Campaigns', requiredTier: 'businessPro' },
  { key: 'campaigns.ab.testing', name: 'A/B Testing', description: 'Test campaign variations', category: 'Campaigns', requiredTier: 'businessPro' },
  
  // Analytics Features
  { key: 'analytics.response.metrics', name: 'Response Metrics', description: 'Track response times', category: 'Analytics', requiredTier: 'businessPro' },
  { key: 'analytics.engagement.scoring', name: 'Engagement Scoring', description: 'Score engagement levels', category: 'Analytics', requiredTier: 'businessPro' },
  { key: 'analytics.export.csv', name: 'Export CSV', description: 'Export data to CSV', category: 'Analytics', requiredTier: 'businessPro' },
  { key: 'analytics.reports', name: 'Reports', description: 'Generate reports', category: 'Analytics', requiredTier: 'businessPro' },
  { key: 'analytics.dashboards', name: 'Dashboards', description: 'Custom dashboards', category: 'Analytics', requiredTier: 'businessPro' },
  
  // Storage
  { key: 'storage.messages', name: 'Message Storage', description: 'Store messages', category: 'Storage', requiredTier: 'free' },
  { key: 'storage.contacts', name: 'Contact Storage', description: 'Store contacts', category: 'Storage', requiredTier: 'free' },
  { key: 'storage.unlimited', name: 'Unlimited Storage', description: 'Unlimited message storage', category: 'Storage', requiredTier: 'pro' },
];