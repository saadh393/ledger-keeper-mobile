import type { MonthRange } from '@/features/ledger/utils/month';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { useBookTable } from '@/features/ledger/api/use-book-table';
import { LedgerSummaryCell } from '@/features/ledger/components/ledger-summary-cell';
import { LedgerSummaryError } from '@/features/ledger/components/ledger-summary-error';
import { formatStat } from '@/features/ledger/utils/format-stat';
import { getStatLabelKey, placeholderStats } from '@/features/ledger/utils/stat-labels';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

const kindValueClassName = {
  income: 'text-forest-500',
  expense: 'text-clay-500',
};

export function LedgerStats({ firstDay, lastDay }: MonthRange) {
  const { t, i18n } = useTranslation();
  const activeBook = useActiveBook();
  const table = useBookTable(activeBook.activeBookId, firstDay, lastDay);

  if (activeBook.isError || (table.isError && !table.data)) {
    return (
      <LedgerSummaryError
        message={t('ledger.stats.error')}
        actionLabel={t('ledger.stats.retry')}
        loading={table.isFetching}
        onRetry={() => (activeBook.isError ? activeBook.refetch() : table.refetch())}
      />
    );
  }

  const loading = !table.data;
  const stats = table.data?.stats ?? placeholderStats;
  const locale = resolveLanguage(i18n.language);
  const currency = activeBook.activeBook?.currency ?? 'BDT';

  return (
    <View testID="ledger-stats" className="mx-4 flex-row rounded-2xl bg-surface-container px-1 py-2">
      {stats.map((stat) => {
        const key = getStatLabelKey(stat.label);
        const formatted = formatStat(stat, locale, currency);
        return (
          <LedgerSummaryCell
            key={stat.label}
            label={key ? t(key) : stat.label}
            value={formatted.value}
            valueClassName={formatted.valueClassName ?? (stat.kind && kindValueClassName[stat.kind])}
            loading={loading}
          />
        );
      })}
    </View>
  );
}
