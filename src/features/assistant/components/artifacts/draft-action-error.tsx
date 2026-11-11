import type { DraftAction } from '@/features/assistant/api/run-draft-action';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text } from '@/components/ui';

export type DraftActionErrorProps = {
  failed: DraftAction['type'] | null;
  onRetry: () => void;
};

export function DraftActionError({ failed, onRetry }: DraftActionErrorProps) {
  const { t } = useTranslation();

  if (!failed)
    return null;
  return (
    <View testID="draft-error" accessibilityRole="alert" className="w-full flex-row items-center gap-2 px-2">
      <Text className="min-w-0 flex-1 text-meta text-clay-500">{t(`assistant.draft.errors.${failed}`)}</Text>
      <Button testID="draft-retry" variant="text" size="sm" fullWidth={false} label={t('assistant.draft.retry')} onPress={onRetry} />
    </View>
  );
}
