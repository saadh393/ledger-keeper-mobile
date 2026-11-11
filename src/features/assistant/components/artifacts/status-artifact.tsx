import type { LucideIcon } from 'lucide-react-native';
import type { Tone } from '@/components/ui';
import type { StatusArtifactData } from '@/features/assistant/schemas/transaction-artifact-schemas';
import { Check, Sparkles, Trash2, X } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { Text, ToneTile } from '@/components/ui';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';

export type StatusArtifactProps = {
  data: StatusArtifactData;
};

const toneStyles: Record<StatusArtifactData['tone'], { tone: Tone; icon: LucideIcon }> = {
  positive: { tone: 'income', icon: Check },
  negative: { tone: 'expense', icon: Trash2 },
  error: { tone: 'expense', icon: X },
  info: { tone: 'info', icon: Sparkles },
};

export function StatusArtifact({ data }: StatusArtifactProps) {
  const style = toneStyles[data.tone];

  return (
    <ArtifactCard testID="status-artifact" tone={style.tone} summary={[data.title, data.body].filter(Boolean).join(', ')}>
      <View className="flex-row items-start gap-3 pb-2">
        <ToneTile tone={style.tone} icon={style.icon} iconSize={18} />
        <View className="min-w-0 flex-1 pt-1">
          <Text numberOfLines={1} className="text-row-title text-ink-900">{data.title}</Text>
          {data.body ? <Text className="mt-0.5 text-meta text-ink-500">{data.body}</Text> : null}
        </View>
      </View>
    </ArtifactCard>
  );
}
