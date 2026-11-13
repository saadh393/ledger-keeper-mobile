import * as React from 'react';
import { View } from 'react-native';

export function CreditsHistoryPlaceholder() {
  return (
    <View testID="credits-history-loading">
      {[0, 1, 2, 3].map(index => (
        <View key={index} className="gap-2 px-4 py-3">
          <View className="h-4 w-2/3 rounded-md bg-border" />
          <View className="h-3 w-1/3 rounded-md bg-border" />
        </View>
      ))}
    </View>
  );
}
