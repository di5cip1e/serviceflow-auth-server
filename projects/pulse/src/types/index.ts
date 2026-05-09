// Re-export subscription types
export * from './subscription';

// Platform types for messaging
export type Platform = 'sms' | 'rcs' | 'messenger' | 'instagram' | 'whatsapp' | 'telegram' | 'discord' | 'signal' | 'slack' | 'imessage';

// Message capture method
export type CaptureMethod = 'notification' | 'accessibility' | 'content_resolver' | 'api' | 'manual_export';

// Sentiment type
export type Sentiment = 'positive' | 'negative' | 'neutral';

// Message interface
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  platform: Platform;
  captureMethod: CaptureMethod;
  metadata: {
    hasEmoji: boolean;
    emojiCount: number;
    hasPunctuation: boolean;
    punctuationCount: number;
    wordCount: number;
    isQuestion: boolean;
    isExclamation: boolean;
    sentiment: Sentiment;
  };
}

// Contact interface
export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  tags: string[];
  platform: Platform[];
  relationshipScore: number;
  messageCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Big Five (OCEAN) Profile
export interface BigFiveProfile {
  openness: TraitScore;
  conscientiousness: TraitScore;
  extroversion: TraitScore;
  agreeableness: TraitScore;
  neuroticism: TraitScore;
}

export interface TraitScore {
  overall: number;
  traits: {
    name: string;
    score: number;
  }[];
}

// Mood Entry
export interface MoodEntry {
  id: string;
  userId: string;
  date: string;
  moodScore: number;
  journalText: string;
  triggers: string[];
  createdAt: string;
  updatedAt: string;
}

// Conversation
export interface Conversation {
  id: string;
  participants: string[];
  contactId: string;
  platform: Platform;
  messageCount: number;
  firstMessageAt: string;
  lastMessageAt: string;
  relationshipScore: number;
}

// User Profile
export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  bigFive: BigFiveProfile;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Subscription Tier
export type SubscriptionTier = 'free' | 'pro' | 'businessPro';

// Feature flags
export interface TierFeatures {
  unifiedInbox: boolean;
  aiAssistantBasic: boolean;
  basicContacts: boolean;
  moodTracking: boolean;
  oceanBasic: boolean;
  deepBigFive: boolean;
  contactComparison: boolean;
  compatibilityScores: boolean;
  trends30_60_90: boolean;
  aiAssistantAdvanced: boolean;
  multiAccount: boolean;
  crmDashboard: boolean;
  analyticsDashboard: boolean;
  autoReplies: boolean;
  campaigns: boolean;
  export: boolean;
}

// App Settings
export interface AppSettings {
  tier: SubscriptionTier;
  notificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  googleDriveBackupEnabled: boolean;
  lastSyncTime?: string;
}

// Navigation types
export type RootTabParamList = {
  Dashboard: undefined;
  Contacts: undefined;
  Explore: undefined;
  Journal: undefined;
  Settings: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  AskGCP: undefined;
};

export type ContactsStackParamList = {
  ContactsList: undefined;
  ContactDetail: { contactId: string };
};

export type ExploreStackParamList = {
  ExploreHome: undefined;
  TraitDetail: { trait: keyof BigFiveProfile };
  MyProfile: undefined;
  Comparison: { contactId: string };
};

export type JournalStackParamList = {
  JournalHome: undefined;
  JournalEntry: { entryId?: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  ProfileManagement: undefined;
  MessageLoader: undefined;
  GoogleDriveBackup: undefined;
  Notifications: undefined;
  DataStorage: undefined;
  Permissions: undefined;
};
