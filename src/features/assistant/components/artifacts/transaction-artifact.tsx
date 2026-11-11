import type { ArtifactTransaction } from '@/features/assistant/schemas/transaction-artifact-schemas';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { ArtifactTransactionRow } from '@/features/assistant/components/artifacts/artifact-transaction-row';
import { describeTransaction } from '@/features/assistant/utils/describe-transaction';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type TransactionArtifactProps = {
  data: ArtifactTransaction;
  currency: string;
};

export function TransactionArtifact({ data, currency }: TransactionArtifactProps) {
  const { t, i18n } = useTranslation();

  return (
    <ArtifactCard
      testID="transaction-artifact"
      tone={data.deleted ? 'info' : data.kind}
      summary={describeTransaction(data, { locale: resolveLanguage(i18n.language), currency }, t)}
    >
      <View className="-mx-4 pb-1">
        <ArtifactTransactionRow row={data} currency={currency} initiallyExpanded={data.items.length > 0} />
      </View>
    </ArtifactCard>
  );
}
