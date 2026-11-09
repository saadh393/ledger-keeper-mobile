import * as React from 'react';
import { Pressable } from 'react-native';
import { Text } from '@/components/ui';

export type LedgerRowMenuOptionProps = {
  label: string;
  destructive?: boolean;
  onPress: () => void;
  testID: string;
};

export function LedgerRowMenuOption({ label, destructive = false, onPress, testID }: LedgerRowMenuOptionProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="min-h-[48px] justify-center rounded-2xl px-3 py-2.5 active:bg-paper-200"
    >
      <Text testID={`${testID}-label`} className={`text-row-title ${destructive ? 'text-clay-500' : 'text-ink-900'}`}>{label}</Text>
    </Pressable>
  );
}
