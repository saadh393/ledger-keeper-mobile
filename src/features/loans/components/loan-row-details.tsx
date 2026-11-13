import type { Debt } from '@/features/loans/schemas/debt-schema';
import type { LoanActions } from '@/features/loans/types';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { Button, Text } from '@/components/ui';
import { LoanRepaymentHistory } from '@/features/loans/components/loan-repayment-history';

export type LoanRowDetailsProps = LoanActions & {
  bookId: string;
  debt: Debt;
  locale: Language;
};

const expandMs = 120;

export function LoanRowDetails({ bookId, debt, locale, onEdit, onRepay, onDelete, onUndo }: LoanRowDetailsProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();

  return (
    <Animated.View testID="loan-row-details" entering={reducedMotion ? undefined : FadeIn.duration(expandMs)} className="mx-4 mb-2 gap-3 rounded-2xl bg-surface-container px-4 py-3">
      {debt.note ? <Text testID="loan-row-note" className="text-meta text-ink-700">{debt.note}</Text> : null}
      <View className="gap-1">
        <Text className="text-meta text-ink-500">{t('loans.details.repayments')}</Text>
        <LoanRepaymentHistory bookId={bookId} debt={debt} locale={locale} onUndo={onUndo} />
      </View>
      <View className="flex-row flex-wrap gap-2">
        {debt.status === 'open'
          ? <Button testID="loan-row-repay" size="sm" fullWidth={false} label={t('loans.actions.repay')} onPress={() => onRepay(debt)} />
          : null}
        <Button testID="loan-row-edit" variant="outline" size="sm" fullWidth={false} label={t('loans.actions.edit')} onPress={() => onEdit(debt)} />
        <Button testID="loan-row-delete" variant="destructive" size="sm" fullWidth={false} label={t('loans.actions.delete')} onPress={() => onDelete(debt)} />
      </View>
    </Animated.View>
  );
}
