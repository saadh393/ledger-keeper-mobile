import type { ThemeName } from '@/lib/theme/colors';
import { renderHook } from '@testing-library/react-native';

import { Uniwind } from 'uniwind';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { colors } from '@/lib/theme/colors';

describe('useThemeConfig', () => {
  it.each<ThemeName>(['light', 'dark'])('maps %s tokens to the navigation theme', (theme) => {
    Uniwind.setTheme(theme);
    const { result } = renderHook(() => useThemeConfig());

    expect(result.current.dark).toBe(theme === 'dark');
    expect(result.current.colors).toMatchObject({
      background: colors[theme]['paper-100'],
      card: colors[theme].surface,
      text: colors[theme]['ink-900'],
      border: colors[theme].border,
      primary: colors[theme].accent,
    });
  });
});
