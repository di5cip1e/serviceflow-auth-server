// P.U.L.S.E Theme Export
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';

// Create a theme object for React Navigation if needed
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  dark: false,
};

export type Theme = typeof theme;