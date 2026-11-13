import type { InstallmentPayment } from '@/features/installments/schemas/installment-schema';
import type { Language } from '@/lib/i18n/resources';
import { Undo2 } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { formatCurrency } from '@/lib/format/currency';
import { formatDate } from '@/lib/format/date';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type InstallmentPaymentItemProps = {
  payment: InstallmentPayment;
  currency: string;
  locale: Language;
  onUndo: (payment: InstallmentPayment) => void;
};

export function InstallmentPaymentItem({ payment, currency, locale, onUndo }: InstallmentPaymentItemProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const amount = formatCurrency(payment.amount, locale, currency);
  const date = formatDate(payment.dateIso, locale);

  return (
    <View testID={`installment-payment-${payment.id}`} className="flex-row items-center gap-2">
      <View className="flex-1">
        <Text className="text-meta text-ink-700" style={{ fontVariant: ['tabular-nums'] }}>{`${date} · ${amount}`}</Text>
        {payment.note ? <Text className="text-meta text-ink-500">{payment.note}</Text> : null}
      </View>
      <Pressable
        testID={`installment-payment-${payment.id}-undo`}
        accessibilityRole="button"
        accessibilityLabel={t('installments.details.undoLabel', { amount, date })}
        onPress={() => onUndo(payment)}
        className="size-11 items-center justify-center rounded-full active:bg-paper-200"
      >
        <Undo2 size={18} strokeWidth={1.75} color={themeColors['ink-700']} />
      </Pressable>
    </View>
  );
}
