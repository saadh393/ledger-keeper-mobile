import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

export type LedgerRowDetailProps = {
  label: string;
  value: string;
  testID: string;
};

export function LedgerRowDetail({ label, value, testID }: LedgerRowDetailProps) {
  return (
    <View testID={testID} className="flex-row gap-3 py-0.5">
      <Text className="w-28 text-meta text-ink-500">{label}</Text>
      <Text className="flex-1 text-meta text-ink-900">{value}</Text>
    </View>
  );
}
