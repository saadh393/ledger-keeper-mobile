import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';
import { BackHandler } from 'react-native';
import { Text, View } from '@/components/ui';
import { CurrencyPickerSheet } from '@/features/currency';
import { LedgerStats, MonthSwitcher, useLedgerMonth } from '@/features/ledger';

export function HomeScreen() {
  const ledgerMonth = useLedgerMonth();

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
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-center text-headline text-ink-900" tx="home.title" />
      </View>
      <CurrencyPickerSheet />
    </View>
  );
}
