import type { useCreditLedger } from '@/features/credits/api/use-credit-ledger';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui';
import { CreditsHistoryPlaceholder } from '@/features/credits/components/credits-history-placeholder';

export type CreditsHistoryEmptyProps = {
  query: ReturnType<typeof useCreditLedger>;
};

export function CreditsHistoryEmpty({ query }: CreditsHistoryEmptyProps) {
  const { t } = useTranslation();

  if (query.isError && !query.data) {
    return (
      <EmptyState
        testID="credits-history-error"
        variant="error"
        title={t('credits.history.error')}
        actionLabel={t('credits.retry')}
        onAction={() => query.refetch()}
        actionLoading={query.isFetching}
      />
    );
  }

  if (!query.data)
    return <CreditsHistoryPlaceholder />;

  return <EmptyState testID="credits-history-empty" title={t('credits.history.empty')} />;
}
