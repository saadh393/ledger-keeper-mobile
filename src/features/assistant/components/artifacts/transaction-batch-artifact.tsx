import type { TransactionBatchArtifactData } from '@/features/assistant/schemas/transaction-artifact-schemas';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { ArtifactNet } from '@/features/assistant/components/artifacts/artifact-net';
import { ArtifactTransactionRow } from '@/features/assistant/components/artifacts/artifact-transaction-row';
import { describeTransaction } from '@/features/assistant/utils/describe-transaction';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type TransactionBatchArtifactProps = {
  data: TransactionBatchArtifactData;
  currency: string;
};

export function TransactionBatchArtifact({ data, currency }: TransactionBatchArtifactProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const label = t('assistant.artifacts.saved', { count: data.rows.length, total: formatNumber(data.rows.length, locale) });
  const summary = [label, ...data.rows.map(row => describeTransaction(row, { locale, currency }, t))].join('. ');

  return (
    <ArtifactCard
      testID="transaction-batch-artifact"
      label={label}
      icon={Check}
      tone={data.net >= 0 ? 'income' : 'expense'}
      meta={<ArtifactNet value={data.net} currency={currency} />}
      summary={summary}
    >
      <View className="-mx-4 pt-1">
        {data.rows.map(row => (
          <View key={row.id} testID="transaction-batch-artifact-row" className="border-b border-border last:border-b-0">
            <ArtifactTransactionRow row={row} currency={currency} />
          </View>
        ))}
      </View>
    </ArtifactCard>
  );
}
