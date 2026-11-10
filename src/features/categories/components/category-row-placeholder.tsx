import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export function CategoryRowPlaceholder() {
  const { t } = useTranslation();

  return (
    <View testID="category-row-placeholder" accessibilityLabel={t('common.loading')} className="min-h-14 flex-row items-center gap-3 px-4 py-1">
      <View className="size-3 rounded-full bg-border" />
      <View className="h-4 w-1/2 rounded-md bg-border" />
    </View>
  );
}
