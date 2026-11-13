import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { twMerge } from '@/lib/tw-merge';

export type SettingsRowProps = {
  label: string;
  value?: string;
  destructive?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  testID?: string;
};

export function SettingsRow({ label, value, destructive = false, disabled = false, onPress, children, testID }: SettingsRowProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      className="min-h-[52px] flex-row items-center gap-3 px-4 py-3"
    >
      <Text className={twMerge('flex-1 text-row-title', destructive ? 'text-clay-500' : 'text-ink-900')}>{label}</Text>
      {value ? <Text numberOfLines={1} className="shrink text-body text-ink-500">{value}</Text> : null}
      {children ? <View>{children}</View> : null}
    </Pressable>
  );
}
