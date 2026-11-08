import { useAuthStore } from '@/features/auth';
import {
  ACTIVE_BOOK_STORAGE_KEY,
  getActiveBookId,
  resetActiveBookStore,
  setActiveBookId,
  useActiveBookStore,
} from '@/features/books/store/use-active-book-store';
import { storage } from '@/lib/storage';

const getString = jest.mocked(storage.getString);
const set = jest.mocked(storage.set);
const remove = jest.mocked(storage.remove);

function stored(state: unknown) {
  getString.mockReturnValue(JSON.stringify({ state, version: 0 }));
}

describe('useActiveBookStore', () => {
  beforeEach(() => {
    getString.mockReset();
    set.mockClear();
    remove.mockClear();
    useActiveBookStore.setState({ activeBookId: null });
  });

  it('starts with activeBookId null by default', () => {
    expect(useActiveBookStore.getState().activeBookId).toBeNull();
    expect(getActiveBookId()).toBeNull();
  });

  describe('saving to MMKV and persistence', () => {
    it('sets activeBookId and persists it to MMKV', () => {
      setActiveBookId('book-100');

      expect(useActiveBookStore.getState().activeBookId).toBe('book-100');
      expect(getActiveBookId()).toBe('book-100');
      expect(set).toHaveBeenCalledWith(
        ACTIVE_BOOK_STORAGE_KEY,
        JSON.stringify({ state: { activeBookId: 'book-100' }, version: 0 }),
      );
    });

    it('rehydrates persisted activeBookId from MMKV across app restarts', async () => {
      stored({ activeBookId: 'persisted-book-456' });

      await useActiveBookStore.persist.rehydrate();

      expect(useActiveBookStore.getState().activeBookId).toBe('persisted-book-456');
    });

    it('handles invalid or non-JSON string in storage by staying null', async () => {
      getString.mockReturnValueOnce('not-valid-json');

      await useActiveBookStore.persist.rehydrate();

      expect(useActiveBookStore.getState().activeBookId).toBeNull();
    });

    it('handles corrupted or invalid JSON in storage by staying null', async () => {
      getString.mockReturnValueOnce('corrupted-data{}}');

      await useActiveBookStore.persist.rehydrate();

      expect(useActiveBookStore.getState().activeBookId).toBeNull();
    });
  });

  describe('resetting and sign-out', () => {
    it('clears activeBookId and removes key from MMKV on reset()', () => {
      useActiveBookStore.setState({ activeBookId: 'book-to-clear' });

      resetActiveBookStore();

      expect(useActiveBookStore.getState().activeBookId).toBeNull();
      expect(remove).toHaveBeenCalledWith(ACTIVE_BOOK_STORAGE_KEY);
    });

    it('resets active book store when useAuthStore transitions to signedOut', () => {
      useActiveBookStore.setState({ activeBookId: 'user-active-book' });
      useAuthStore.setState({ status: 'signedIn' });

      // Trigger sign out in auth store
      useAuthStore.setState({ status: 'signedOut' });

      expect(useActiveBookStore.getState().activeBookId).toBeNull();
      expect(remove).toHaveBeenCalledWith(ACTIVE_BOOK_STORAGE_KEY);
    });

    it('resets active book store and removes MMKV key when useAuthStore.signOut() is invoked', async () => {
      useActiveBookStore.setState({ activeBookId: 'user-active-book' });
      useAuthStore.setState({ status: 'signedIn' });

      await useAuthStore.getState().signOut();

      expect(useActiveBookStore.getState().activeBookId).toBeNull();
      expect(remove).toHaveBeenCalledWith(ACTIVE_BOOK_STORAGE_KEY);
    });
  });
});
