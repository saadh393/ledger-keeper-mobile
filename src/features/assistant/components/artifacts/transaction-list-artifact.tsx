import type { TransactionListArtifactData } from '@/features/assistant/schemas/transaction-artifact-schemas';
import { Table } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { ArtifactNet } from '@/features/assistant/components/artifacts/artifact-net';
import { ArtifactTransactionRow } from '@/features/assistant/components/artifacts/artifact-transaction-row';
import { ShowAllButton } from '@/features/assistant/components/artifacts/show-all-button';
import { describeTransaction } from '@/features/assistant/utils/describe-transaction';
import { getNet } from '@/features/assistant/utils/get-net';
import { getVisibleRows } from '@/features/assistant/utils/get-visible-rows';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type TransactionListArtifactProps = {
  data: TransactionListArtifactData;
  currency: string;
};

export function TransactionListArtifact({ data, currency }: TransactionListArtifactProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const [showAll, setShowAll] = React.useState(false);
  const label = t('assistant.artifacts.transactions', { count: data.rows.length, total: formatNumber(data.rows.length, locale) });
  const summary = [label, ...data.rows.map(row => describeTransaction(row, { locale, currency }, t))].join('. ');

  return (
    <ArtifactCard
      testID="transaction-list-artifact"
      label={label}
      icon={Table}
      meta={data.rows.length ? <ArtifactNet value={getNet(data.rows)} currency={currency} /> : null}
      summary={summary}
      footer={<ShowAllButton testID="transaction-list-artifact-show-all" count={data.rows.length} showAll={showAll} onPress={() => setShowAll(true)} />}
    >
      {data.rows.length
        ? (
            <View className="-mx-4 pt-1">
              {getVisibleRows(data.rows, showAll).map(row => (
                <View key={row.id} testID="transaction-list-artifact-row" className="border-b border-border last:border-b-0">
                  <ArtifactTransactionRow row={row} currency={currency} />
                </View>
              ))}
            </View>
          )
        : <Text testID="transaction-list-artifact-empty" className="py-2 text-meta text-ink-500">{t('assistant.artifacts.noTransactions')}</Text>}
    </ArtifactCard>
  );
}
