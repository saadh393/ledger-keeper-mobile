import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable } from 'react-native';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type AssistantHeaderButtonProps = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID: string;
};

export function AssistantHeaderButton({ icon: Icon, label, onPress, disabled = false, testID }: AssistantHeaderButtonProps) {
  const themeColors = useThemeColors();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      className={`size-11 items-center justify-center rounded-full active:bg-paper-200 ${disabled ? 'opacity-40' : ''}`}
    >
      <Icon size={20} strokeWidth={1.75} color={themeColors['ink-500']} />
    </Pressable>
  );
}
