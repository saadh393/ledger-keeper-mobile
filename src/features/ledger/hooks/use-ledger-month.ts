import { useLedgerMonthStore } from '@/features/ledger/store/use-ledger-month-store';
import { getMonthRange, isCurrentMonth } from '@/features/ledger/utils/month';

export function useLedgerMonth() {
  const { now, month, goToPreviousMonth, goToNextMonth, goToCurrentMonth } = useLedgerMonthStore();

  return {
    month,
    ...getMonthRange(month),
    isCurrentMonth: isCurrentMonth(month, now),
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  };
}
