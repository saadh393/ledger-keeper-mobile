import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

export type DebtArtifactAmountProps = {
  label: string;
  value: string;
  emphasis?: boolean;
};

export function DebtArtifactAmount({ label, value, emphasis = false }: DebtArtifactAmountProps) {
  return (
    <View className="min-w-0 flex-1">
      <Text className="text-meta text-ink-500">{label}</Text>
      <Text numberOfLines={1} className={emphasis ? 'text-title font-semibold text-ink-900' : 'text-row-title text-ink-900'} style={{ fontVariant: ['tabular-nums'] }}>{value}</Text>
    </View>
  );
}
