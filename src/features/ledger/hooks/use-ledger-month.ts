import type { Month } from '@/features/ledger/utils/month';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  getCurrentMonth,
  getMonthRange,
  getNextMonth,
  getPreviousMonth,
  isCurrentMonth,
} from '@/features/ledger/utils/month';

export function useLedgerMonth() {
  const [now, setNow] = useState(() => new Date());
  const [month, setMonth] = useState<Month>(() => getCurrentMonth(now));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active')
        setNow(new Date());
    });
    return () => subscription.remove();
  }, []);

  const goToPreviousMonth = useCallback(() => setMonth(getPreviousMonth), []);

  const goToNextMonth = useCallback(() => {
    setMonth(selected => (isCurrentMonth(selected, now) ? selected : getNextMonth(selected)));
  }, [now]);

  const goToCurrentMonth = useCallback(() => {
    const today = new Date();
    setNow(today);
    setMonth(getCurrentMonth(today));
  }, []);

  return {
    month,
    ...getMonthRange(month),
    isCurrentMonth: isCurrentMonth(month, now),
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  };
}
