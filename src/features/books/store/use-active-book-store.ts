import type { ActiveBookState } from '@/features/books/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { registerSignOutHook, useAuthStore } from '@/features/auth';
import { storage, zustandStorage } from '@/lib/storage';

export const ACTIVE_BOOK_STORAGE_KEY = 'active_book_id';

function removeStorageKey(key: string): void {
  if (typeof storage.remove === 'function') {
    storage.remove(key);
  }
  else if (typeof (storage as unknown as { delete?: (k: string) => void }).delete === 'function') {
    (storage as unknown as { delete: (k: string) => void }).delete(key);
  }
}

export const useActiveBookStore = create<ActiveBookState>()(
  persist(
    set => ({
      activeBookId: null,
      setActiveBookId: (id: string | null) => {
        set(state => (state.activeBookId === id ? state : { activeBookId: id }));
      },
      reset: () => {
        set({ activeBookId: null });
        removeStorageKey(ACTIVE_BOOK_STORAGE_KEY);
      },
    }),
    {
      name: ACTIVE_BOOK_STORAGE_KEY,
      storage: createJSONStorage(() => zustandStorage),
      partialize: state => ({ activeBookId: state.activeBookId }),
      merge: (persisted: unknown, current: ActiveBookState) => {
        if (!persisted) {
          return current;
        }
        if (typeof persisted === 'string') {
          return { ...current, activeBookId: persisted };
        }
        if (typeof persisted === 'object' && persisted !== null && 'activeBookId' in persisted) {
          const id = (persisted as { activeBookId: unknown }).activeBookId;
          return {
            ...current,
            activeBookId: typeof id === 'string' ? id : null,
          };
        }
        return current;
      },
    },
  ),
);

// Register sign-out hook so signing out clears the store
registerSignOutHook(() => {
  useActiveBookStore.getState().reset();
});

// React to auth store transitions to signedOut
useAuthStore.subscribe((state, prevState) => {
  if (state.status === 'signedOut' && prevState.status !== 'signedOut') {
    useActiveBookStore.getState().reset();
  }
});

export function getActiveBookId(): string | null {
  return useActiveBookStore.getState().activeBookId;
}

export function setActiveBookId(id: string | null): void {
  useActiveBookStore.getState().setActiveBookId(id);
}

export function resetActiveBookStore(): void {
  useActiveBookStore.getState().reset();
}
