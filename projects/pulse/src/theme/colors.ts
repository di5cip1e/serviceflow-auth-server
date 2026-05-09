// P.U.L.S.E Color System
// Mobile-first design with tier-aware colors

export const colors = {
  // Primary Brand Colors
  primary: '#6366F1',      // Indigo - main brand
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Secondary Accent
  secondary: '#8B5CF6',    // Purple - AI features
  secondaryLight: '#A78BFA',
  secondaryDark: '#7C3AED',
  
  // Semantic Colors
  success: '#10B981',      // Green - positive
  successLight: '#34D399',
  warning: '#F59E0B',      // Amber - caution
  warningLight: '#FBBF24',
  error: '#EF4444',        // Red - negative
  errorLight: '#F87171',
  
  // Neutral Palette
  white: '#FFFFFF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  // Text Colors
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // Border & Divider
  border: '#E2E8F0',
  divider: '#E2E8F0',
  
  // Tier Colors
  tierFree: '#6366F1',     // Indigo
  tierPro: '#8B5CF6',      // Purple  
  tierBusiness: '#F59E0B', // Amber
  
  // Relationship Score Colors
  scoreExcellent: '#10B981', // 75-100
  scoreGood: '#22C55E',      // 50-74
  scoreFair: '#F59E0B',      // 25-49
  scorePoor: '#EF4444',      // 0-24
  
  // Platform Colors (for message icons)
  platform: {
    sms: '#10B981',
    whatsapp: '#25D366',
    telegram: '#0088CC',
    discord: '#5865F2',
    messenger: '#0084FF',
    instagram: '#E4405F',
    slack: '#4A154B',
    signal: '#3A76F0',
    imessage: '#FF3B30',
  },
  
  // Mood Colors (gradient for slider)
  mood: {
    sad: '#6366F1',
    neutral: '#F59E0B',
    happy: '#10B981',
  },
  
  // Chart Colors (OCEAN dimensions)
  ocean: {
    openness: '#8B5CF6',
    conscientiousness: '#3B82F6',
    extroversion: '#F59E0B',
    agreeableness: '#10B981',
    neuroticism: '#EF4444',
  },
  
  // Shadows
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  
  // Overlay
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.2)',
};

export type ColorKeys = keyof typeof colors;