import type { Debt } from '@/features/loans/schemas/debt-schema';
import { HandCoins } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { ArtifactLink } from '@/features/assistant/components/artifacts/artifact-link';
import { DebtArtifactAmount } from '@/features/assistant/components/artifacts/debt-artifact-amount';
import { LoanStatusBadge } from '@/features/loans/components/loan-status-badge';
import { describeDebt } from '@/features/loans/utils/describe-debt';
import { isDebtOverdue } from '@/features/loans/utils/is-debt-overdue';
import { formatCurrency } from '@/lib/format/currency';
import { formatDate } from '@/lib/format/date';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type DebtArtifactProps = {
  data: Debt;
};

export function DebtArtifact({ data }: DebtArtifactProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const lent = data.direction === 'lent';
  const settled = data.status === 'settled';
  const money = (value: number) => formatCurrency(value, locale, data.currency);

  return (
    <ArtifactCard
      testID="debt-artifact"
      label={t(lent ? 'loans.card.lentTo' : 'loans.card.borrowedFrom', { name: data.counterparty })}
      icon={HandCoins}
      tone={lent ? 'income' : 'expense'}
      summary={describeDebt(data, locale, t)}
      footer={<ArtifactLink testID="debt-artifact-view" label={t('loans.card.viewInLoans')} href="/loans" />}
    >
      <View className="flex-row flex-wrap items-center gap-2 pt-2">
        {settled ? <LoanStatusBadge testID="debt-artifact-settled" tone="neutral" label={t('loans.row.settled')} /> : null}
        {isDebtOverdue(data) ? <LoanStatusBadge testID="debt-artifact-overdue" tone="warning" label={t('loans.row.overdue')} /> : null}
        {data.dueDateIso && !settled
          ? <Text testID="debt-artifact-due" className="text-meta text-ink-500" style={{ fontVariant: ['tabular-nums'] }}>{t('loans.row.due', { date: formatDate(data.dueDateIso, locale) })}</Text>
          : null}
      </View>
      <View className="flex-row gap-3 py-2">
        <DebtArtifactAmount label={t('loans.card.outstanding')} value={money(data.outstanding)} emphasis />
        <DebtArtifactAmount label={t('loans.card.original')} value={money(data.amount)} />
        <DebtArtifactAmount label={t('loans.card.repaid')} value={money(data.repaid)} />
      </View>
    </ArtifactCard>
  );
}
