import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

export type SummaryArtifactStatProps = {
  label: string;
  value: string;
  valueClassName: string;
  delta?: string | null;
  testID: string;
};

export function SummaryArtifactStat({ label, value, valueClassName, delta, testID }: SummaryArtifactStatProps) {
  return (
    <View testID={testID} className="min-w-0 flex-1 rounded-2xl bg-paper-100 px-3 py-2.5">
      <Text numberOfLines={1} className="text-meta text-ink-500">{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} className={`text-title font-semibold ${valueClassName}`} style={{ fontVariant: ['tabular-nums'] }}>{value}</Text>
      {delta ? <Text testID={`${testID}-delta`} className="text-meta text-ink-500" style={{ fontVariant: ['tabular-nums'] }}>{delta}</Text> : null}
    </View>
  );
}
