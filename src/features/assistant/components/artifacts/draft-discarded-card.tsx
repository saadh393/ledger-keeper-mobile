import type { useDraftAction } from '@/features/assistant/api/use-draft-action';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { DraftActionError } from '@/features/assistant/components/artifacts/draft-action-error';

export type DraftDiscardedCardProps = {
  title: string;
  action: ReturnType<typeof useDraftAction>;
};

export function DraftDiscardedCard({ title, action }: DraftDiscardedCardProps) {
  const { t } = useTranslation();
  const name = title.trim() || t('assistant.draft.untitled');

  return (
    <ArtifactCard
      testID="draft-discarded"
      summary={`${name}, ${t('assistant.draft.discarded')}`}
      footer={(
        <>
          <DraftActionError failed={action.failed} onRetry={action.retry} />
          <Button
            testID="draft-undo"
            variant="text"
            size="sm"
            fullWidth={false}
            label={action.pending ? t('assistant.draft.restoring') : t('assistant.draft.undo')}
            pending={Boolean(action.pending)}
            onPress={() => action.run({ type: 'restore' })}
          />
        </>
      )}
    >
      <View className="py-2">
        <Text numberOfLines={1} className="text-row-title text-ink-700 line-through">{name}</Text>
        <Text className="mt-0.5 text-meta text-ink-500">{t('assistant.draft.discarded')}</Text>
      </View>
    </ArtifactCard>
  );
}
