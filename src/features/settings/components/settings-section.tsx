import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

export type SettingsSectionProps = {
  title: string;
  children: React.ReactNode;
  testID?: string;
};

export function SettingsSection({ title, children, testID }: SettingsSectionProps) {
  return (
    <View testID={testID} className="gap-1 pt-4">
      <Text className="px-3 pb-1 text-label text-ink-500">{title}</Text>
      <View className="overflow-hidden rounded-2xl bg-surface-container">{children}</View>
    </View>
  );
}
