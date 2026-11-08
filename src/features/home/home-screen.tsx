import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';
import { BackHandler } from 'react-native';
import { Text, View } from '@/components/ui';
import { CurrencyPickerSheet } from '@/features/currency';

export function HomeScreen() {
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
    <View className="flex-1 items-center justify-center bg-paper-100 px-4">
      <Text className="text-center text-headline text-ink-900" tx="home.title" />
      <CurrencyPickerSheet />
    </View>
  );
}
