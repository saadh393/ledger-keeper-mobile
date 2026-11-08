import { ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { ISO_4217_CURRENCIES } from '@/features/currency';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type BookCurrencyFieldProps = {
  value: string;
  error?: string;
  disabled: boolean;
  onPress: () => void;
};

export function BookCurrencyField({ value, error, disabled, onPress }: BookCurrencyFieldProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const name = ISO_4217_CURRENCIES.find(item => item.code === value)?.name ?? value;

  return (
    <View className="mb-4">
      <Text className="mb-1 text-label text-ink-900">{t('books.form.currency')}</Text>
      <Pressable
        testID="book-form-currency"
        accessibilityRole="button"
        accessibilityLabel={`${t('books.form.currency')}, ${value}`}
        accessibilityHint={t('books.form.chooseCurrency')}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        className={`min-h-[44px] flex-row items-center rounded-[12px] border bg-surface-container px-4 py-3 ${
          error ? 'border-clay-500' : 'border-transparent'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <Text testID="book-form-currency-code" className="w-12 text-body-l font-semibold text-ink-900">
          {value}
        </Text>
        <Text numberOfLines={1} className="flex-1 text-body text-ink-700">
          {name}
        </Text>
        <ChevronRight size={18} strokeWidth={1.75} color={themeColors['ink-500']} />
      </Pressable>
      {error && (
        <Text
          testID="book-form-currency-error"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          className="mt-1 text-meta text-clay-500"
        >
          {error}
        </Text>
      )}
    </View>
  );
}
