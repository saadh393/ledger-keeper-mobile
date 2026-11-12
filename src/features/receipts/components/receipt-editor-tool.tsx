import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable } from 'react-native';
import { Text } from '@/components/ui';

export type ReceiptEditorToolProps = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled: boolean;
  testID: string;
};

export function ReceiptEditorTool({ icon: Icon, label, onPress, disabled, testID }: ReceiptEditorToolProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-w-[72px] items-center gap-1 rounded-2xl px-3 py-2 active:bg-white/10 ${disabled ? 'opacity-40' : ''}`}
    >
      <Icon size={22} strokeWidth={1.75} color="white" />
      <Text className="text-meta text-white">{label}</Text>
    </Pressable>
  );
}
