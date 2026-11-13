import type { Month } from '@/features/ledger/utils/month';
import { create } from 'zustand';
import { getCurrentMonth, getNextMonth, getPreviousMonth, isCurrentMonth } from '@/features/ledger/utils/month';

type LedgerMonthState = {
  now: Date;
  month: Month;
  refreshNow: () => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
};

export const useLedgerMonthStore = create<LedgerMonthState>()(set => ({
  now: new Date(),
  month: getCurrentMonth(new Date()),
  refreshNow: () => set({ now: new Date() }),
  goToPreviousMonth: () => set(state => ({ month: getPreviousMonth(state.month) })),
  goToNextMonth: () => set(state => (isCurrentMonth(state.month, state.now) ? state : { month: getNextMonth(state.month) })),
  goToCurrentMonth: () => {
    const now = new Date();
    set({ now, month: getCurrentMonth(now) });
  },
}));
