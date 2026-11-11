import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export function AssistantTypingIndicator() {
  const { t } = useTranslation();

  return (
    <View testID="assistant-typing" accessible accessibilityLabel={t('assistant.send.typing')} className="flex-row gap-1.5 px-4 py-3">
      <View className="size-2 rounded-full bg-ink-500" />
      <View className="size-2 rounded-full bg-ink-500 opacity-70" />
      <View className="size-2 rounded-full bg-ink-500 opacity-40" />
    </View>
  );
}
