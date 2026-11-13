import { ChevronRight, X } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { formatDate } from '@/lib/format/date';
import { resolveLanguage } from '@/lib/i18n/resolve-language';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type LoanDateFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  clearLabel?: string;
  onPress: () => void;
  onClear?: () => void;
  testID: string;
};

export function LoanDateField({ label, value, placeholder, error, disabled, clearLabel, onPress, onClear, testID }: LoanDateFieldProps) {
  const { i18n } = useTranslation();
  const themeColors = useThemeColors();
  const text = value ? formatDate(value, resolveLanguage(i18n.language)) : placeholder ?? '';

  return (
    <View className="mb-4">
      <Text className="mb-1 text-label text-ink-900">{label}</Text>
      <View className={`min-h-[44px] flex-row items-center rounded-[12px] border bg-surface-container ${error ? 'border-clay-500' : 'border-transparent'} ${disabled ? 'opacity-50' : ''}`}>
        <Pressable
          testID={testID}
          accessibilityRole="button"
          accessibilityLabel={`${label}, ${text}`}
          disabled={disabled}
          onPress={onPress}
          className="flex-1 flex-row items-center px-4 py-3"
        >
          <Text numberOfLines={1} className={`flex-1 text-body-l ${value ? 'text-ink-900' : 'text-ink-500'}`} style={{ fontVariant: ['tabular-nums'] }}>{text}</Text>
          {value && onClear ? null : <ChevronRight size={18} strokeWidth={1.75} color={themeColors['ink-500']} />}
        </Pressable>
        {value && onClear
          ? (
              <Pressable
                testID={`${testID}-clear`}
                accessibilityRole="button"
                accessibilityLabel={clearLabel}
                disabled={disabled}
                onPress={onClear}
                className="size-11 items-center justify-center"
              >
                <X size={18} strokeWidth={1.75} color={themeColors['ink-500']} />
              </Pressable>
            )
          : null}
      </View>
      {error ? <Text testID={`${testID}-error`} accessibilityRole="alert" className="mt-1 text-meta text-clay-500">{error}</Text> : null}
    </View>
  );
}
