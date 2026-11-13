import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';

type LedgerPreferencesState = {
  showSummary: boolean;
  setShowSummary: (showSummary: boolean) => void;
};

export const useLedgerPreferencesStore = create<LedgerPreferencesState>()(
  persist(
    set => ({
      showSummary: true,
      setShowSummary: showSummary => set({ showSummary }),
    }),
    {
      name: 'ledger_preferences',
      storage: createJSONStorage(() => zustandStorage),
      partialize: state => ({ showSummary: state.showSummary }),
    },
  ),
);
