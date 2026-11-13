import { ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type InstallmentCategoryFieldProps = {
  value: string;
  error?: string;
  disabled: boolean;
  onPress: () => void;
};

export function InstallmentCategoryField({ value, error, disabled, onPress }: InstallmentCategoryFieldProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const label = t('installments.form.category');
  const text = value || t('installments.form.categoryPlaceholder');

  return (
    <View className="mb-4">
      <Text className="mb-1 text-label text-ink-900">{label}</Text>
      <Pressable
        testID="installment-form-category"
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${text}`}
        disabled={disabled}
        onPress={onPress}
        className={`min-h-[44px] flex-row items-center rounded-[12px] border bg-surface-container px-4 py-3 ${error ? 'border-clay-500' : 'border-transparent'} ${disabled ? 'opacity-50' : ''}`}
      >
        <Text numberOfLines={1} className={`flex-1 text-body-l ${value ? 'text-ink-900' : 'text-ink-500'}`}>{text}</Text>
        <ChevronRight size={18} strokeWidth={1.75} color={themeColors['ink-500']} />
      </Pressable>
      {error ? <Text testID="installment-form-category-error" accessibilityRole="alert" className="mt-1 text-meta text-clay-500">{error}</Text> : null}
    </View>
  );
}
