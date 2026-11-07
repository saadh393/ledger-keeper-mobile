import type { Theme } from '@react-navigation/native';
import type { ThemeColors } from '@/lib/theme/colors';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useUniwind } from 'uniwind';

import { colors } from '@/lib/theme/colors';

function createNavigationTheme(base: Theme, palette: ThemeColors): Theme {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.accent,
      background: palette['paper-100'],
      card: palette.surface,
      text: palette['ink-900'],
      border: palette.border,
    },
  };
}

const LightTheme = createNavigationTheme(DefaultTheme, colors.light);
const DarkNavigationTheme = createNavigationTheme(DarkTheme, colors.dark);

export function useThemeConfig() {
  const { theme } = useUniwind();

  if (theme === 'dark')
    return DarkNavigationTheme;

  return LightTheme;
}
