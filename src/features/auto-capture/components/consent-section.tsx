import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

export type ConsentSectionProps = {
  title: string;
  body: string;
};

export function ConsentSection({ title, body }: ConsentSectionProps) {
  return (
    <View className="gap-1">
      <Text accessibilityRole="header" className="text-row-title text-ink-900">{title}</Text>
      <Text className="text-body text-ink-700">{body}</Text>
    </View>
  );
}
