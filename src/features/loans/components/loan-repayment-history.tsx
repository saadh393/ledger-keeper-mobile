import type { Debt } from '@/features/loans/schemas/debt-schema';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { useDebt } from '@/features/loans/api/use-debt';
import { LoanRepaymentItem } from '@/features/loans/components/loan-repayment-item';

export type LoanRepaymentHistoryProps = {
  bookId: string;
  debt: Debt;
  locale: Language;
  onUndo: (debt: Debt, repayment: NonNullable<Debt['repayments']>[number]) => void;
};

export function LoanRepaymentHistory({ bookId, debt, locale, onUndo }: LoanRepaymentHistoryProps) {
  const { t } = useTranslation();
  const query = useDebt(bookId, debt.id);
  const repayments = React.useMemo(
    () => [...(query.data?.repayments ?? [])].sort((a, b) => b.dateIso.localeCompare(a.dateIso)),
    [query.data],
  );

  if (query.isError && !query.data) {
    return (
      <View testID="loan-repayments-error" className="flex-row items-center gap-3">
        <Text className="flex-1 text-meta text-clay-500">{t('loans.details.error')}</Text>
        <Button testID="loan-repayments-retry" variant="outline" size="sm" fullWidth={false} label={t('loans.retry')} pending={query.isFetching} onPress={() => query.refetch()} />
      </View>
    );
  }

  if (!query.data) {
    return (
      <View testID="loan-repayments-loading" aria-busy className="gap-2 py-1" accessibilityLabel={t('common.loading')}>
        <View className="h-3 w-2/3 rounded-md bg-border" />
        <View className="h-3 w-1/2 rounded-md bg-border" />
      </View>
    );
  }

  if (!repayments.length)
    return <Text testID="loan-repayments-empty" className="text-meta text-ink-500">{t('loans.details.noRepayments')}</Text>;

  return (
    <View testID="loan-repayments">
      {repayments.map(repayment => (
        <LoanRepaymentItem key={repayment.id} repayment={repayment} currency={debt.currency} locale={locale} onUndo={item => onUndo(query.data!, item)} />
      ))}
    </View>
  );
}
