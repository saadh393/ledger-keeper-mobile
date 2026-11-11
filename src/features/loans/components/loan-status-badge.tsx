import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

export type LoanStatusBadgeProps = {
  label: string;
  tone: 'neutral' | 'warning';
  testID?: string;
};

export function LoanStatusBadge({ label, tone, testID }: LoanStatusBadgeProps) {
  return (
    <View testID={testID} className={`shrink-0 rounded-full px-2 py-0.5 ${tone === 'warning' ? 'bg-wheat-200' : 'bg-paper-200'}`}>
      <Text className={`text-meta font-semibold ${tone === 'warning' ? 'text-wheat-500' : 'text-ink-500'}`}>{label}</Text>
    </View>
  );
}
