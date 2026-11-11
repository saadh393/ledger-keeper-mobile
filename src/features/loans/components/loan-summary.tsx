import type { Debt } from '@/features/loans/schemas/debt-schema';
import type { Language } from '@/lib/i18n/resources';
import { HandCoins } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, ToneTile } from '@/components/ui';
import { LoanStatusBadge } from '@/features/loans/components/loan-status-badge';
import { isDebtOverdue } from '@/features/loans/utils/is-debt-overdue';
import { formatCurrency } from '@/lib/format/currency';
import { formatDate } from '@/lib/format/date';

export type LoanSummaryProps = {
  debt: Debt;
  locale: Language;
};

export function LoanSummary({ debt, locale }: LoanSummaryProps) {
  const { t } = useTranslation();
  const lent = debt.direction === 'lent';
  const settled = debt.status === 'settled';
  const overdue = isDebtOverdue(debt);
  const meta = [
    t(lent ? 'loans.direction.lent' : 'loans.direction.borrowed'),
    debt.dueDateIso && !settled ? t('loans.row.due', { date: formatDate(debt.dueDateIso, locale) }) : null,
  ].filter(Boolean).join(' · ');

  return (
    <View className="min-h-14 flex-row items-center gap-3 py-2">
      <ToneTile tone={lent ? 'income' : 'expense'} icon={HandCoins} iconSize={18} />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-2">
          <Text testID="loan-summary-person" numberOfLines={1} className="shrink text-row-title text-ink-900">{debt.counterparty}</Text>
          {settled ? <LoanStatusBadge testID="loan-summary-settled" tone="neutral" label={t('loans.row.settled')} /> : null}
          {overdue ? <LoanStatusBadge testID="loan-summary-overdue" tone="warning" label={t('loans.row.overdue')} /> : null}
        </View>
        <Text testID="loan-summary-meta" numberOfLines={1} className="mt-0.5 text-meta text-ink-500" style={{ fontVariant: ['tabular-nums'] }}>{meta}</Text>
      </View>
      <View className="shrink-0 items-end">
        {settled
          ? null
          : (
              <Text testID="loan-summary-outstanding" className={`text-row-title font-semibold ${lent ? 'text-forest-500' : 'text-ink-900'}`} style={{ fontVariant: ['tabular-nums'] }}>
                {formatCurrency(debt.outstanding, locale, debt.currency)}
              </Text>
            )}
        <Text testID="loan-summary-original" className="text-meta text-ink-500" style={{ fontVariant: ['tabular-nums'] }}>
          {settled ? formatCurrency(debt.amount, locale, debt.currency) : t('loans.row.of', { amount: formatCurrency(debt.amount, locale, debt.currency) })}
        </Text>
      </View>
    </View>
  );
}
