import * as React from 'react';
import { View } from 'react-native';

export function BuyCreditsPlaceholder() {
  return (
    <View testID="buy-credits-loading" className="gap-2">
      {[0, 1, 2].map(index => <View key={index} className="h-14 rounded-2xl bg-surface-container" />)}
    </View>
  );
}
