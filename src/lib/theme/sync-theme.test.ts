import { applyTheme } from '@/lib/theme/apply-theme';
import { syncTheme } from '@/lib/theme/sync-theme';
import { useThemeStore } from '@/lib/theme/use-theme-store';

jest.mock('@/lib/theme/apply-theme', () => ({ applyTheme: jest.fn() }));

describe('syncTheme', () => {
  it('applies the stored theme at once and again on every change', () => {
    const unsubscribe = syncTheme();
    expect(applyTheme).toHaveBeenLastCalledWith('dark');

    useThemeStore.getState().setTheme('light');
    expect(applyTheme).toHaveBeenLastCalledWith('light');

    unsubscribe();
    useThemeStore.getState().setTheme('dark');
    expect(applyTheme).toHaveBeenCalledTimes(2);
  });
});
