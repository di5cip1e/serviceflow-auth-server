// P.U.L.S.E Mock Data
// Used across all screens for development/demo

import { Platform } from 'react-native';

// Types
export type SubscriptionTier = 'free' | 'pro' | 'businessPro';

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  tags: string[];
  relationshipScore: number;
  messageCount: number;
  lastContact: string;
  platform: Platform;
  notes?: string;
  // OCEAN scores (0-100)
  ocean?: {
    openness: number;
    conscientiousness: number;
    extroversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  // CRM fields (Business Pro)
  pipelineStage?: 'lead' | 'prospect' | 'negotiation' | 'close' | 'closed_won' | 'closed_lost';
  dealValue?: number;
  nextFollowUp?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  platform: string;
  isRead: boolean;
  isFromMe: boolean;
}

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar?: string;
  platform: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface MoodEntry {
  id: string;
  date: string;
  score: number; // 1-10
  journalText: string;
  triggers: string[];
}

export interface OceanProfile {
  openness: { overall: number; traits: number[] };
  conscientiousness: { overall: number; traits: number[] };
  extroversion: { overall: number; traits: number[] };
  agreeableness: { overall: number; traits: number[] };
  neuroticism: { overall: number; traits: number[] };
}

export interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  usageCount: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  audienceCount: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  scheduledAt?: string;
  startedAt?: string;
}

export interface Account {
  id: string;
  phoneNumber: string;
  label: string;
  isActive: boolean;
  lastActive: string;
}

// Mock User Profile
export const mockUserProfile: OceanProfile = {
  openness: { overall: 72, traits: [80, 65, 75, 70, 78, 64] },
  conscientiousness: { overall: 68, traits: [72, 60, 75, 70, 68, 65] },
  extroversion: { overall: 58, traits: [55, 60, 62, 55, 65, 58] },
  agreeableness: { overall: 75, traits: [80, 70, 78, 72, 68, 82] },
  neuroticism: { overall: 45, traits: [40, 50, 45, 48, 55, 38] },
};

// Mock Contacts
export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    phone: '+1 555-0123',
    tags: ['Close Friend', 'Work'],
    relationshipScore: 78,
    messageCount: 142,
    lastContact: '2 hours ago',
    platform: 'whatsapp',
    ocean: {
      openness: 72,
      conscientiousness: 65,
      extroversion: 78,
      agreeableness: 71,
      neuroticism: 38,
    },
    pipelineStage: 'prospect',
    dealValue: 5000,
    nextFollowUp: 'Tomorrow',
  },
  {
    id: '2',
    name: 'Mike Torres',
    phone: '+1 555-0456',
    tags: ['Family'],
    relationshipScore: 65,
    messageCount: 89,
    lastContact: '2 days ago',
    platform: 'sms',
    ocean: {
      openness: 58,
      conscientiousness: 72,
      extroversion: 62,
      agreeableness: 80,
      neuroticism: 52,
    },
    pipelineStage: 'lead',
    dealValue: 2000,
  },
  {
    id: '3',
    name: 'Jordan Lee',
    phone: '+1 555-0789',
    tags: ['Close Friend', 'Gym'],
    relationshipScore: 82,
    messageCount: 234,
    lastContact: '3 hours ago',
    platform: 'discord',
    ocean: {
      openness: 85,
      conscientiousness: 55,
      extroversion: 88,
      agreeableness: 65,
      neuroticism: 42,
    },
  },
  {
    id: '4',
    name: 'Alex Kim',
    phone: '+1 555-0321',
    tags: ['Work', 'Client'],
    relationshipScore: 41,
    messageCount: 12,
    lastContact: '1 week ago',
    platform: 'email',
    ocean: {
      openness: 60,
      conscientiousness: 78,
      extroversion: 45,
      agreeableness: 72,
      neuroticism: 55,
    },
    pipelineStage: 'negotiation',
    dealValue: 15000,
  },
  {
    id: '5',
    name: 'Taylor Swift',
    phone: '+1 555-0654',
    tags: ['Work', 'VIP'],
    relationshipScore: 91,
    messageCount: 567,
    lastContact: '1 hour ago',
    platform: 'whatsapp',
    ocean: {
      openness: 78,
      conscientiousness: 82,
      extroversion: 72,
      agreeableness: 88,
      neuroticism: 32,
    },
    pipelineStage: 'close',
    dealValue: 25000,
  },
];

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    contactId: '1',
    contactName: 'Sarah Chen',
    platform: 'whatsapp',
    lastMessage: 'Hey! Are we still on for lunch?',
    lastMessageTime: '12:34 PM',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        conversationId: 'c1',
        senderId: '1',
        senderName: 'Sarah Chen',
        content: 'Hey! How\'s the project going?',
        timestamp: '10:30 AM',
        platform: 'whatsapp',
        isRead: true,
        isFromMe: false,
      },
      {
        id: 'm2',
        conversationId: 'c1',
        senderId: 'me',
        senderName: 'You',
        content: 'Going well! Just finished the first draft. Want to review?',
        timestamp: '10:32 AM',
        platform: 'whatsapp',
        isRead: true,
        isFromMe: true,
      },
      {
        id: 'm3',
        conversationId: 'c1',
        senderId: 'me',
        senderName: 'You',
        content: 'Looking forward to it! 🎉',
        timestamp: '10:35 AM',
        platform: 'whatsapp',
        isRead: true,
        isFromMe: true,
      },
      {
        id: 'm4',
        conversationId: 'c1',
        senderId: '1',
        senderName: 'Sarah Chen',
        content: 'Hey! Are we still on for lunch?',
        timestamp: '12:34 PM',
        platform: 'whatsapp',
        isRead: false,
        isFromMe: false,
      },
    ],
  },
  {
    id: 'c2',
    contactId: '2',
    contactName: 'Mike Torres',
    platform: 'sms',
    lastMessage: 'Check out this link...',
    lastMessageTime: '11:20 AM',
    unreadCount: 0,
    messages: [],
  },
  {
    id: 'c3',
    contactId: '3',
    contactName: 'Jordan Lee',
    platform: 'discord',
    lastMessage: 'Meeting moved to 3pm',
    lastMessageTime: '10:15 AM',
    unreadCount: 2,
    messages: [],
  },
];

// Mock Mood Entries
export const mockMoodEntries: MoodEntry[] = [
  {
    id: '1',
    date: '2026-03-07',
    score: 7,
    journalText: 'Great day overall! Made progress on the project and had a good workout.',
    triggers: ['work', 'fitness'],
  },
  {
    id: '2',
    date: '2026-03-06',
    score: 6,
    journalText: 'Pretty normal day. A bit tired but productive.',
    triggers: ['work'],
  },
  {
    id: '3',
    date: '2026-03-05',
    score: 8,
    journalText: 'Excellent! Caught up with old friends and felt really connected.',
    triggers: ['social', 'family'],
  },
  {
    id: '4',
    date: '2026-03-04',
    score: 5,
    journalText: 'Stressful day at work but managed to get through it.',
    triggers: ['work'],
  },
  {
    id: '5',
    date: '2026-03-03',
    score: 7,
    journalText: 'Relaxing weekend. Read a good book and enjoyed some quiet time.',
    triggers: ['self-care'],
  },
];

// Mock Templates
export const mockTemplates: Template[] = [
  {
    id: 't1',
    name: 'Initial Outreach',
    content: 'Hi {{name}}, thanks for connecting! I\'d love to learn more about your work at {{company}} and see how we might be able to help each other.',
    category: 'Sales',
    usageCount: 45,
  },
  {
    id: 't2',
    name: 'Follow-up',
    content: 'Hi {{name}}, just checking in on my last message. Would love to chat more about {{next_step}}. Let me know your availability!',
    category: 'Follow-up',
    usageCount: 32,
  },
  {
    id: 't3',
    name: 'Meeting Request',
    content: 'Hi {{name}}, would you have 15 minutes this week for a quick call? I\'d love to discuss {{meeting_time}} and see if there\'s a good fit.',
    category: 'Sales',
    usageCount: 28,
  },
  {
    id: 't4',
    name: 'Thank You',
    content: 'Hi {{name}}, just wanted to say thanks for taking the time to speak with me today. I really enjoyed learning more about {{company}}!',
    category: 'Support',
    usageCount: 56,
  },
];

// Mock Campaigns
export const mockCampaigns: Campaign[] = [
  {
    id: 'camp1',
    name: 'Q1 Product Launch',
    status: 'sending',
    audienceCount: 200,
    sentCount: 156,
    deliveredCount: 152,
    openedCount: 89,
    startedAt: '9:00 AM',
  },
  {
    id: 'camp2',
    name: 'Valentine\'s Day Promo',
    status: 'scheduled',
    audienceCount: 150,
    sentCount: 0,
    deliveredCount: 0,
    openedCount: 0,
    scheduledAt: '2026-02-14 9:00 AM',
  },
  {
    id: 'camp3',
    name: 'Holiday Sale 2024',
    status: 'completed',
    audienceCount: 189,
    sentCount: 189,
    deliveredCount: 185,
    openedCount: 142,
  },
  {
    id: 'camp4',
    name: 'New Feature Announcement',
    status: 'completed',
    audienceCount: 247,
    sentCount: 247,
    deliveredCount: 247,
    openedCount: 198,
  },
];

// Mock Accounts
export const mockAccounts: Account[] = [
  {
    id: 'acc1',
    phoneNumber: '+1 555-0100',
    label: 'Personal',
    isActive: true,
    lastActive: 'Just now',
  },
  {
    id: 'acc2',
    phoneNumber: '+1 555-0200',
    label: 'Business',
    isActive: false,
    lastActive: '2 hours ago',
  },
  {
    id: 'acc3',
    phoneNumber: '+1 555-0300',
    label: 'Work',
    isActive: false,
    lastActive: 'Yesterday',
  },
];

// User subscription state
export const mockSubscription = {
  tier: 'pro' as SubscriptionTier,
  isTrial: false,
  expiresAt: '2026-04-07',
};

// Stats
export const mockStats = {
  messagesAnalyzed: 1247,
  contactsProfiled: 42,
  relationshipHealth: 78,
  currentStreak: 12,
};

// AI Suggestions
export const mockAISuggestions = [
  {
    id: '1',
    type: 'tone',
    message: 'Sarah seems in a good mood today',
    confidence: 0.85,
  },
  {
    id: '2',
    type: 'suggestion',
    message: 'Looking forward to it! 🎉',
    isEditable: true,
  },
  {
    id: '3',
    type: 'snooze',
    message: 'Snooze this conversation',
    options: ['1hr', '3hr', 'Tomorrow', 'Custom'],
  },
];

// OCEAN Trait Names
export const oceanTraitNames = {
  openness: ['Imagination', 'Artistic Interests', 'Emotionality', 'Adventurousness', 'Intellect', 'Liberalism'],
  conscientiousness: ['Self-Discipline', 'Orderliness', 'Dutifulness', 'Achievement-Striving', 'Self-Efficacy', 'Cautiousness'],
  extroversion: ['Gregariousness', 'Assertiveness', 'Activity-Level', 'Excitement-Seeking', 'Cheerfulness', 'Positive-Emotion'],
  agreeableness: ['Trust', 'Straightforwardness', 'Altruism', 'Compliance', 'Modesty', 'Tender-Mindedness'],
  neuroticism: ['Anxiety', 'Angry-Hostility', 'Depression', 'Self-Consciousness', 'Impulsiveness', 'Vulnerability'],
};

// Relationship tips
export const mockBridgeTips = [
  'Your contact is more outgoing. Consider more spontaneous messages.',
  'They value directness. Be more straightforward in communications.',
  'They prefer emoji-rich messages. Lighten up your tone!',
  'Your contact responds well to questions. Ask more about their day.',
];