import { CircleAlert } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';

export function ArtifactUnavailableCard() {
  const { t } = useTranslation();
  const message = t('assistant.artifacts.unavailable');
  return (
    <ArtifactCard testID="artifact-unavailable" label={message} icon={CircleAlert} tone="warning" summary={message}>
      <Text className="py-2 text-meta text-ink-500">{t('assistant.artifacts.unavailableBody')}</Text>
    </ArtifactCard>
  );
}
