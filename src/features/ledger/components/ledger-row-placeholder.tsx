import * as React from 'react';
import { View } from 'react-native';

export function LedgerRowPlaceholder() {
  return (
    <View testID="ledger-row-placeholder" className="min-h-14 flex-row items-center gap-3 px-4 py-2" accessibilityLabel="Loading">
      <View className="size-10 rounded-[12px] bg-border" />
      <View className="flex-1 gap-2">
        <View className="h-4 w-1/2 rounded-md bg-border" />
        <View className="h-3 w-1/3 rounded-md bg-border" />
      </View>
      <View className="h-4 w-16 rounded-md bg-border" />
    </View>
  );
}
