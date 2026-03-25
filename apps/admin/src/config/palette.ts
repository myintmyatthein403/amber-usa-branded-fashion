/**
 * Amber Brand Fashion - Global Color Palette
 * Centralized source of truth for all brand colors.
 */
export const PALETTE = {
  brand: {
    gold: '#C9A962',
    goldDark: '#b09353',
    black: '#0F0F0F',
    white: '#FDFDFD',
    pureWhite: '#FFFFFF',
  },
  neutral: {
    50: '#FAF8F5',
    100: '#F5F5F5',
    200: '#E5E5E5',
    400: '#A3A3A3',
    500: '#737373',
    800: '#1A1A1A',
    900: '#0A0A0A',
    950: '#050505',
  },
  system: {
    success: '#10B981',
    error: '#EF4444',
    errorDark: '#991B1B',
    warning: '#F59E0B',
  }
};

export const THEME_CONFIG = {
  light: {
    background: PALETTE.brand.white,
    foreground: PALETTE.brand.black,
    primary: PALETTE.brand.gold,
    muted: PALETTE.neutral[100],
    border: PALETTE.neutral[200],
    sidebar: PALETTE.brand.pureWhite,
  },
  dark: {
    background: PALETTE.neutral[900],
    foreground: PALETTE.neutral[50],
    primary: PALETTE.brand.gold,
    muted: PALETTE.neutral[800],
    border: PALETTE.neutral[800],
    sidebar: PALETTE.brand.black,
  }
};
