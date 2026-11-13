import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useLedgerMonthStore } from '@/features/ledger/store/use-ledger-month-store';

export function useLedgerMonthSync() {
  useEffect(() => {
    useLedgerMonthStore.getState().goToCurrentMonth();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active')
        useLedgerMonthStore.getState().refreshNow();
    });
    return () => subscription.remove();
  }, []);
}
