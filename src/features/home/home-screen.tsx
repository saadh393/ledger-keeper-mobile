import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';
import { BackHandler } from 'react-native';
import { View } from '@/components/ui';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { CurrencyPickerSheet } from '@/features/currency';
import {
  AddTransactionButton,
  LedgerStats,
  LedgerToolbar,
  MonthSwitcher,
  TransactionFormSheet,
  TransactionList,
  useLedgerMonth,
} from '@/features/ledger';

export function HomeScreen() {
  const ledgerMonth = useLedgerMonth();
  const activeBook = useActiveBook();
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        BackHandler.exitApp();
        return true;
      });

      return () => {
        subscription.remove();
      };
    }, []),
  );

  return (
    <View className="flex-1 bg-paper-100">
      <MonthSwitcher
        month={ledgerMonth.month}
        isCurrentMonth={ledgerMonth.isCurrentMonth}
        onPrevious={ledgerMonth.goToPreviousMonth}
        onNext={ledgerMonth.goToNextMonth}
        onCurrent={ledgerMonth.goToCurrentMonth}
      />
      <LedgerStats firstDay={ledgerMonth.firstDay} lastDay={ledgerMonth.lastDay} />
      <LedgerToolbar />
      <View className="mt-2 flex-1">
        <TransactionList month={ledgerMonth.month} firstDay={ledgerMonth.firstDay} lastDay={ledgerMonth.lastDay} />
      </View>
      <AddTransactionButton onPress={() => setIsAddOpen(true)} />
      {isAddOpen
        ? (
            <TransactionFormSheet
              bookId={activeBook.activeBookId ?? ''}
              currency={activeBook.activeBook?.currency ?? 'BDT'}
              viewedMonth={ledgerMonth.month}
              onDismiss={() => setIsAddOpen(false)}
            />
          )
        : null}
      <CurrencyPickerSheet />
    </View>
  );
}
