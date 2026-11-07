import type { fonts } from '@/lib/theme/fonts';
import { renderHook } from '@testing-library/react-native';

import { useFonts } from 'expo-font';
import { useFontsReady } from '@/lib/theme/use-fonts-ready';

jest.mock('expo-font', () => ({ useFonts: jest.fn() }));

const mockUseFonts = jest.mocked(useFonts);

describe('useFontsReady', () => {
  it('loads every Manrope and Noto Sans Bengali weight', () => {
    mockUseFonts.mockReturnValue([false, null]);
    renderHook(() => useFontsReady());
    expect(Object.keys(mockUseFonts.mock.calls[0][0] as typeof fonts)).toEqual([
      'Manrope_400Regular',
      'Manrope_500Medium',
      'Manrope_600SemiBold',
      'Manrope_700Bold',
      'NotoSansBengali_400Regular',
      'NotoSansBengali_500Medium',
      'NotoSansBengali_600SemiBold',
      'NotoSansBengali_700Bold',
    ]);
  });

  it('is not ready while fonts are loading', () => {
    mockUseFonts.mockReturnValue([false, null]);
    expect(renderHook(() => useFontsReady()).result.current).toBe(false);
  });

  it('is ready once fonts are loaded', () => {
    mockUseFonts.mockReturnValue([true, null]);
    expect(renderHook(() => useFontsReady()).result.current).toBe(true);
  });

  it('is ready when font loading fails so the app still opens', () => {
    mockUseFonts.mockReturnValue([false, new Error('load failed')]);
    expect(renderHook(() => useFontsReady()).result.current).toBe(true);
  });
});
