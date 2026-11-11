import type { TransactionDraftArtifactData } from '@/features/assistant/schemas/draft-artifact-schemas';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { ArtifactTransactionRow } from '@/features/assistant/components/artifacts/artifact-transaction-row';
import { describeTransaction } from '@/features/assistant/utils/describe-transaction';
import { toDraftTransaction } from '@/features/assistant/utils/to-draft-transaction';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type DraftSavedCardProps = {
  data: TransactionDraftArtifactData;
  currency: string;
};

export function DraftSavedCard({ data, currency }: DraftSavedCardProps) {
  const { t, i18n } = useTranslation();
  const row = toDraftTransaction(data);

  return (
    <ArtifactCard
      testID="draft-saved"
      label={t('assistant.draft.saved')}
      icon={Check}
      tone={row.deleted ? 'info' : row.kind}
      summary={`${t('assistant.draft.saved')}, ${describeTransaction(row, { locale: resolveLanguage(i18n.language), currency }, t)}`}
    >
      <View className="-mx-4 pb-1">
        <ArtifactTransactionRow row={row} currency={currency} />
      </View>
    </ArtifactCard>
  );
}
