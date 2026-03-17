import { Colors } from './colors';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
};

export type Theme = {
  dark: boolean;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryEnd: string;
    accent: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    destructive: string;
    success: string;
    warning: string;
  };
};

export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: '#ffffff',
    foreground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    primary: Colors.primary,
    primaryEnd: Colors.primaryEnd,
    accent: Colors.accent,
    secondary: '#f5f5f4',
    secondaryForeground: '#1c1917',
    muted: '#f5f5f4',
    mutedForeground: '#78716c',
    border: '#e7e5e4',
    input: '#e7e5e4',
    destructive: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  },
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: '#0c0a09',
    foreground: '#fafaf9',
    card: '#1c1917',
    cardForeground: '#fafaf9',
    primary: Colors.primary,
    primaryEnd: Colors.primaryEnd,
    accent: Colors.accent,
    secondary: '#292524',
    secondaryForeground: '#fafaf9',
    muted: '#292524',
    mutedForeground: '#a8a29e',
    border: '#292524',
    input: '#292524',
    destructive: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  },
};

export { Colors };
export * from './colors';
