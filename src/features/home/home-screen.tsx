import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';
import { BackHandler } from 'react-native';
import { View } from '@/components/ui';
import { AiBar } from '@/features/assistant/components/ai-bar';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { CurrencyPickerSheet } from '@/features/currency';
import {
  AddTransactionButton,
  LedgerStats,
  LedgerToolbar,
  TransactionFormSheet,
  TransactionList,
  useLedgerMonth,
  useLedgerMonthSync,
} from '@/features/ledger';

function ignore() {}

export function HomeScreen() {
  useLedgerMonthSync();
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
    <View className="flex-1 bg-paper-100 pt-1">
      <LedgerStats firstDay={ledgerMonth.firstDay} lastDay={ledgerMonth.lastDay} />
      <LedgerToolbar />
      <View className="mt-2 flex-1">
        <TransactionList month={ledgerMonth.month} firstDay={ledgerMonth.firstDay} lastDay={ledgerMonth.lastDay} />
        <AddTransactionButton bottomInset={0} onPress={() => setIsAddOpen(true)} />
      </View>
      <AiBar onSend={ignore} onCamera={ignore} onMic={ignore} />
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
