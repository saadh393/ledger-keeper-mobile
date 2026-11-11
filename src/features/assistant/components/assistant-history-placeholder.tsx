import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

const rows = [0, 1, 2, 3];

export function AssistantHistoryPlaceholder() {
  const { t } = useTranslation();

  return (
    <View testID="assistant-history-loading" aria-busy accessibilityLabel={t('common.loading')} className="gap-1 p-2">
      {rows.map(row => (
        <View key={row} className="min-h-12 justify-center gap-2 px-3 py-2">
          <View className="h-4 w-2/3 rounded-md bg-border" />
          <View className="h-3 w-1/4 rounded-md bg-border" />
        </View>
      ))}
    </View>
  );
}
