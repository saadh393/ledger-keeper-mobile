import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Chip, Text } from '@/components/ui';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';

const exampleKeys = ['spent', 'salary', 'food', 'lent'] as const;

export function AssistantEmptyState() {
  const { t } = useTranslation();
  const setDraft = useAssistantStore(state => state.setDraft);

  return (
    <View testID="assistant-empty" className="flex-1 items-center justify-center gap-4 px-6 py-8">
      <Text className="text-center text-body text-ink-700">{t('assistant.sheet.emptyTitle')}</Text>
      <View className="items-center gap-2">
        {exampleKeys.map((key) => {
          const phrase = t(`assistant.sheet.examples.${key}`);
          return <Chip key={key} testID={`assistant-example-${key}`} label={phrase} className="self-center" onPress={() => setDraft(phrase)} />;
        })}
      </View>
    </View>
  );
}
