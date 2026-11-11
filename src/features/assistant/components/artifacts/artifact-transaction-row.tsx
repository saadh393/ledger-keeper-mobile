import type { ArtifactTransaction } from '@/features/assistant/schemas/transaction-artifact-schemas';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ArtifactDeletedRow } from '@/features/assistant/components/artifacts/artifact-deleted-row';
import { LedgerRow } from '@/features/ledger/components/ledger-row';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type ArtifactTransactionRowProps = {
  row: ArtifactTransaction;
  currency: string;
  initiallyExpanded?: boolean;
};

export function ArtifactTransactionRow({ row, currency, initiallyExpanded = false }: ArtifactTransactionRowProps) {
  const { i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const [expanded, setExpanded] = React.useState(initiallyExpanded);

  if (row.deleted)
    return <ArtifactDeletedRow row={row} locale={locale} currency={currency} />;
  return <LedgerRow row={row} locale={locale} currency={currency} showDate expanded={expanded} onToggle={() => setExpanded(value => !value)} />;
}
