import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';
import { BackHandler } from 'react-native';
import { View } from '@/components/ui';
import { useSendMessage } from '@/features/assistant/api/use-send-message';
import { AiBar } from '@/features/assistant/components/ai-bar';
import { AssistantSheet } from '@/features/assistant/components/assistant-sheet';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
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
  const isAssistantOpen = useAssistantStore(state => state.isOpen);
  const { send } = useSendMessage();

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
      <View className="flex-1">
        <LedgerStats firstDay={ledgerMonth.firstDay} lastDay={ledgerMonth.lastDay} />
        <LedgerToolbar />
        <View className="mt-2 flex-1">
          <TransactionList month={ledgerMonth.month} firstDay={ledgerMonth.firstDay} lastDay={ledgerMonth.lastDay} />
          {isAssistantOpen ? null : <AddTransactionButton bottomInset={0} onPress={() => setIsAddOpen(true)} />}
        </View>
        {isAssistantOpen ? <AssistantSheet /> : null}
      </View>
      <AiBar onSend={send} onCamera={ignore} onMic={ignore} />
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
