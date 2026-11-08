import {
  clearUserStorage,
  DEVICE_PREFERENCE_KEYS,
  getItem,
  removeItem,
  setItem,
  storage,
  zustandStorage,
} from '@/lib/storage';

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getItem, setItem, removeItem', () => {
    it('serializes values when setting items', async () => {
      await setItem('sample', { hello: 'world' });
      expect(storage.set).toHaveBeenCalledWith('sample', JSON.stringify({ hello: 'world' }));
    });

    it('parses values when getting items', () => {
      (storage.getString as jest.Mock).mockReturnValueOnce(JSON.stringify({ hello: 'world' }));
      const result = getItem<{ hello: string }>('sample');
      expect(result).toEqual({ hello: 'world' });
    });

    it('returns null when getting absent item or invalid json', () => {
      (storage.getString as jest.Mock).mockReturnValueOnce(undefined);
      expect(getItem('missing')).toBeNull();
    });

    it('deletes item when removeItem is called', async () => {
      await removeItem('sample');
      expect(storage.remove).toHaveBeenCalledWith('sample');
    });
  });

  describe('zustandStorage', () => {
    it('bridges getItem, setItem, removeItem', () => {
      (storage.getString as jest.Mock).mockReturnValueOnce('val');
      expect(zustandStorage.getItem('k')).toBe('val');

      zustandStorage.setItem('k', 'v');
      expect(storage.set).toHaveBeenCalledWith('k', 'v');

      zustandStorage.removeItem('k');
      expect(storage.remove).toHaveBeenCalledWith('k');
    });

    it('returns null when zustandStorage.getItem misses', () => {
      (storage.getString as jest.Mock).mockReturnValueOnce(undefined);
      expect(zustandStorage.getItem('missing')).toBeNull();
    });
  });

  describe('clearUserStorage', () => {
    it('deletes non-device keys and preserves device preferences', () => {
      (storage.getAllKeys as jest.Mock).mockReturnValueOnce([
        'theme',
        'local',
        'active_book_id',
        'custom_user_cache',
      ]);

      clearUserStorage();

      // Non-device keys should be removed
      expect(storage.remove).toHaveBeenCalledWith('active_book_id');
      expect(storage.remove).toHaveBeenCalledWith('custom_user_cache');

      // Device preferences should NOT be removed
      expect(storage.remove).not.toHaveBeenCalledWith('theme');
      expect(storage.remove).not.toHaveBeenCalledWith('local');
      expect(storage.remove).not.toHaveBeenCalledWith('language');
    });

    it('has expected device preference keys', () => {
      expect(DEVICE_PREFERENCE_KEYS.has('theme')).toBe(true);
      expect(DEVICE_PREFERENCE_KEYS.has('local')).toBe(true);
      expect(DEVICE_PREFERENCE_KEYS.has('language')).toBe(true);
      expect(DEVICE_PREFERENCE_KEYS.has('active_book_id')).toBe(false);
    });
  });
});
