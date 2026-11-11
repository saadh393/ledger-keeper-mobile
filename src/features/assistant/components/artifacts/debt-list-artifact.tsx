import type { DebtListArtifactData } from '@/features/assistant/schemas/loan-artifact-schemas';
import { HandCoins } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { ArtifactLink } from '@/features/assistant/components/artifacts/artifact-link';
import { DebtArtifactAmount } from '@/features/assistant/components/artifacts/debt-artifact-amount';
import { ShowAllButton } from '@/features/assistant/components/artifacts/show-all-button';
import { getVisibleRows } from '@/features/assistant/utils/get-visible-rows';
import { LoanSummary } from '@/features/loans/components/loan-summary';
import { formatCurrency } from '@/lib/format/currency';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type DebtListArtifactProps = {
  data: DebtListArtifactData;
};

export function DebtListArtifact({ data }: DebtListArtifactProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const [showAll, setShowAll] = React.useState(false);
  const lent = formatCurrency(data.lent, locale, data.currency);
  const borrowed = formatCurrency(data.borrowed, locale, data.currency);
  const summary = [
    t('loans.card.title'),
    `${t('loans.totals.lent')} ${lent}`,
    `${t('loans.totals.borrowed')} ${borrowed}`,
    ...data.rows.map(row => `${row.counterparty}, ${t(row.direction === 'lent' ? 'loans.direction.lent' : 'loans.direction.borrowed')}, ${formatCurrency(row.outstanding, locale, row.currency)}`),
  ].join('. ');

  return (
    <ArtifactCard
      testID="debt-list-artifact"
      label={t('loans.card.title')}
      icon={HandCoins}
      summary={summary}
      footer={(
        <>
          <ShowAllButton testID="debt-list-artifact-show-all" count={data.rows.length} showAll={showAll} onPress={() => setShowAll(true)} />
          <ArtifactLink testID="debt-list-artifact-view" label={t('loans.card.viewInLoans')} href="/loans" />
        </>
      )}
    >
      <View className="flex-row gap-3 pt-2">
        <DebtArtifactAmount label={t('loans.totals.lent')} value={lent} emphasis />
        <DebtArtifactAmount label={t('loans.totals.borrowed')} value={borrowed} emphasis />
      </View>
      {data.rows.length
        ? getVisibleRows(data.rows, showAll).map(row => (
            <View key={row.id} testID="debt-list-artifact-row" className="border-b border-border last:border-b-0">
              <LoanSummary debt={row} locale={locale} />
            </View>
          ))
        : <Text testID="debt-list-artifact-empty" className="py-2 text-meta text-ink-500">{t('loans.card.noOpenLoans')}</Text>}
    </ArtifactCard>
  );
}
