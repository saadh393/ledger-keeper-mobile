import type { Repayment } from '@/features/loans/schemas/debt-schema';
import type { Language } from '@/lib/i18n/resources';
import { Undo2 } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { formatCurrency } from '@/lib/format/currency';
import { formatDate } from '@/lib/format/date';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type LoanRepaymentItemProps = {
  repayment: Repayment;
  currency: string;
  locale: Language;
  onUndo: (repayment: Repayment) => void;
};

export function LoanRepaymentItem({ repayment, currency, locale, onUndo }: LoanRepaymentItemProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const amount = formatCurrency(repayment.amount, locale, currency);
  const date = formatDate(repayment.dateIso, locale);

  return (
    <View testID={`loan-repayment-${repayment.id}`} className="flex-row items-center gap-2">
      <Text className="flex-1 text-meta text-ink-700" style={{ fontVariant: ['tabular-nums'] }}>{`${date} · ${amount}`}</Text>
      <Pressable
        testID={`loan-repayment-${repayment.id}-undo`}
        accessibilityRole="button"
        accessibilityLabel={t('loans.details.undoLabel', { amount, date })}
        onPress={() => onUndo(repayment)}
        className="size-11 items-center justify-center rounded-full active:bg-paper-200"
      >
        <Undo2 size={18} strokeWidth={1.75} color={themeColors['ink-700']} />
      </Pressable>
    </View>
  );
}
