import type { InsightArtifactData } from '@/features/assistant/schemas/transaction-artifact-schemas';
import { Sparkles } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';

export type InsightArtifactProps = {
  data: InsightArtifactData;
};

export function InsightArtifact({ data }: InsightArtifactProps) {
  const { t } = useTranslation();
  const label = `${t('assistant.artifacts.insight')} · ${data.periodLabel}`;

  return (
    <ArtifactCard testID="insight-artifact" label={label} icon={Sparkles} summary={[label, data.title, data.body].join(', ')}>
      <Text numberOfLines={1} className="pt-2 text-row-title text-ink-900">{data.title}</Text>
      <Text className="pt-1 text-body text-ink-700">{data.body}</Text>
      <ProgressBar initialProgress={Math.min(100, Math.max(0, data.progress))} className="my-3 overflow-hidden rounded-full" />
    </ArtifactCard>
  );
}
