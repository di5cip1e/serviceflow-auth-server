// P.U.L.S.E Spacing System
// Based on 4px grid

export const spacing = {
  // Base spacing units
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48,
  
  // Specific use cases
  screenPadding: 16,
  cardPadding: 16,
  cardPaddingLarge: 20,
  listItemPadding: 12,
  inputPadding: 12,
  buttonPadding: 14,
  
  // Gaps
  gapXs: 4,
  gapSm: 8,
  gapMd: 12,
  gapBase: 16,
  gapLg: 20,
  gapXl: 24,
  
  // Border Radius
  radiusXs: 4,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusFull: 9999,
  
  // Icon sizes
  iconXs: 12,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  iconXxl: 48,
  
  // Avatar sizes
  avatarXs: 24,
  avatarSm: 32,
  avatarMd: 40,
  avatarLg: 56,
  avatarXl: 80,
  avatarXxl: 120,
  
  // Header heights
  headerHeight: 56,
  tabBarHeight: 60,
  inputHeight: 48,
  buttonHeight: 48,
  buttonHeightSmall: 36,
  
  // Card dimensions
  cardMinHeight: 80,
  cardElevation: 4,
  
  // Bottom sheet
  bottomSheetHandle: 4,
  bottomSheetRadius: 20,
  
  // Safe areas (will be overridden by SafeAreaView)
  safeAreaTop: 44,
  safeAreaBottom: 34,
};

export type SpacingKeys = keyof typeof spacing;