import { create } from 'zustand';
import { lightTheme, darkTheme, Theme } from '../theme';

interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  theme: Theme;
  setMode: (mode: 'light' | 'dark' | 'system') => void;
  setSystemDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  theme: lightTheme,
  setMode: (mode) => {
    const isDark =
      mode === 'dark' || (mode === 'system' && false); // Will be updated by system
    set({ mode, theme: isDark ? darkTheme : lightTheme });
  },
  setSystemDark: (isDark) => {
    const { mode } = get();
    if (mode === 'system') {
      set({ theme: isDark ? darkTheme : lightTheme });
    }
  },
}));
