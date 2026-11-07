import type { ThemeName } from '@/lib/theme/colors';
import { renderHook } from '@testing-library/react-native';
import { Uniwind } from 'uniwind';

import { colors } from '@/lib/theme/colors';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

describe('useThemeColors', () => {
  it.each<ThemeName>(['light', 'dark'])('returns the %s token values', (theme) => {
    Uniwind.setTheme(theme);
    const { result } = renderHook(() => useThemeColors());
    expect(result.current).toEqual(colors[theme]);
  });
});
