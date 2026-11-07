import { storage } from '@/lib/storage';
import { useThemeStore } from '@/lib/theme/use-theme-store';

const getString = jest.mocked(storage.getString);
const set = jest.mocked(storage.set);

function stored(state: unknown) {
  getString.mockReturnValue(JSON.stringify({ state, version: 0 }));
}

describe('useThemeStore', () => {
  it('defaults to dark', () => {
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  describe('with storage', () => {
    beforeEach(() => {
      getString.mockReset();
      set.mockClear();
      useThemeStore.setState({ theme: 'dark' });
    });

    it('sets light and saves it to storage', () => {
      useThemeStore.getState().setTheme('light');

      expect(useThemeStore.getState().theme).toBe('light');
      expect(set).toHaveBeenLastCalledWith('theme', JSON.stringify({ state: { theme: 'light' }, version: 0 }));
    });

    it('restores the stored theme', async () => {
      stored({ theme: 'light' });

      await useThemeStore.persist.rehydrate();

      expect(useThemeStore.getState().theme).toBe('light');
    });

    it('stays dark when nothing is stored', async () => {
      await useThemeStore.persist.rehydrate();

      expect(useThemeStore.getState().theme).toBe('dark');
    });

    it.each(['system', 'blue', 42, null])('falls back to dark for stored %p', async (theme) => {
      useThemeStore.setState({ theme: 'light' });
      stored({ theme });

      await useThemeStore.persist.rehydrate();

      expect(useThemeStore.getState().theme).toBe('dark');
    });

    it('stays dark when the stored value is not valid JSON', async () => {
      getString.mockReturnValue('not json');

      await useThemeStore.persist.rehydrate();

      expect(useThemeStore.getState().theme).toBe('dark');
    });
  });
});
