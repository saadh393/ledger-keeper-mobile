import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

export type CategoryLegendRowProps = {
  name: string;
  color: string;
  amount: string;
  share: string;
  testID: string;
};

export function CategoryLegendRow({ name, color, amount, share, testID }: CategoryLegendRowProps) {
  return (
    <View testID={testID} className="flex-row items-center gap-2">
      <View className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text numberOfLines={1} className="min-w-0 flex-1 text-body text-ink-900">{name}</Text>
      <Text className="text-body text-ink-900" style={{ fontVariant: ['tabular-nums'] }}>{amount}</Text>
      <Text className="w-11 text-right text-meta text-ink-500" style={{ fontVariant: ['tabular-nums'] }}>{share}</Text>
    </View>
  );
}
