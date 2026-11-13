import * as React from 'react';
import { View } from 'react-native';

export function SettingsRowPlaceholder() {
  return (
    <View testID="settings-row-placeholder" className="min-h-[52px] justify-center gap-2 px-4 py-3">
      <View className="h-4 w-1/2 rounded-md bg-border" />
    </View>
  );
}
