import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable } from 'react-native';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type AiBarIconButtonProps = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accent?: boolean;
  testID?: string;
};

export function AiBarIconButton({ icon: Icon, label, onPress, disabled = false, accent = false, testID }: AiBarIconButtonProps) {
  const themeColors = useThemeColors();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`size-11 items-center justify-center rounded-full ${accent ? 'bg-accent active:opacity-90' : 'active:bg-paper-200'} ${disabled ? 'opacity-40' : ''}`}
    >
      <Icon size={20} strokeWidth={1.75} color={accent ? themeColors['on-accent'] : themeColors['ink-700']} />
    </Pressable>
  );
}
