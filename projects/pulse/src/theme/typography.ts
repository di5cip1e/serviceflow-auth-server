// P.U.L.S.E Typography System
// Based on 16px base, 1.25 scale

import { TextStyle, Platform } from 'react-native';
import { colors } from './colors';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

const fontFamilyMono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export const typography = {
  // Display - Large headlines
  display: {
    fontFamily,
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  
  // H1 - Screen titles
  h1: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  
  // H2 - Section headers
  h2: {
    fontFamily,
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  
  // H3 - Subsection headers
  h3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.1,
    color: colors.textPrimary,
  },
  
  // H4 - Card titles
  h4: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  
  // Body Large
  bodyLarge: {
    fontFamily,
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  
  // Body - Default
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  
  // Body Small
  bodySmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
    color: colors.textSecondary,
  },
  
  // Caption
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.2,
    color: colors.textTertiary,
  },
  
  // Label
  label: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: colors.textSecondary,
  },
  
  // Button
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  
  // Button Small
  buttonSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  
  // Tab Bar
  tabBar: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  
  // Badge
  badge: {
    fontFamily,
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0.3,
  },
  
  // Number (for scores)
  number: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  
  // Number Large (big stats)
  numberLarge: {
    fontFamily,
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 56,
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  
  // Mono (for code/data)
  mono: {
    fontFamily: fontFamilyMono,
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0,
    color: colors.textSecondary,
  },
};

export type TypographyKeys = keyof typeof typography;