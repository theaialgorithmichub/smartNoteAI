import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { lightTheme, darkTheme } from '../theme';

export function useTheme() {
  const systemScheme = useColorScheme();
  const { mode, theme } = useThemeStore();

  const resolvedTheme =
    mode === 'system'
      ? systemScheme === 'dark'
        ? darkTheme
        : lightTheme
      : mode === 'dark'
      ? darkTheme
      : lightTheme;

  return {
    theme: resolvedTheme,
    isDark: resolvedTheme.dark,
    colors: resolvedTheme.colors,
  };
}
