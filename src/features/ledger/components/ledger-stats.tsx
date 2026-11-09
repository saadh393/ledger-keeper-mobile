import type { MonthRange } from '@/features/ledger/utils/month';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { EmptyState, StatTile } from '@/components/ui';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { useBookTable } from '@/features/ledger/api/use-book-table';
import { formatStat } from '@/features/ledger/utils/format-stat';
import { getStatLabelKey, placeholderStats } from '@/features/ledger/utils/stat-labels';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export function LedgerStats({ firstDay, lastDay }: MonthRange) {
  const { t, i18n } = useTranslation();
  const activeBook = useActiveBook();
  const table = useBookTable(activeBook.activeBookId, firstDay, lastDay);

  if (activeBook.isError || table.isError) {
    return (
      <EmptyState
        testID="ledger-stats-error"
        variant="error"
        title={t('ledger.stats.error')}
        actionLabel={t('ledger.stats.retry')}
        onAction={() => (activeBook.isError ? activeBook.refetch() : table.refetch())}
        actionLoading={table.isFetching}
      />
    );
  }

  const loading = !table.data;
  const stats = table.data?.stats ?? placeholderStats;
  const locale = resolveLanguage(i18n.language);
  const currency = activeBook.activeBook?.currency ?? 'BDT';

  return (
    <View testID="ledger-stats" className="flex-row flex-wrap gap-3 px-4">
      {stats.map((stat) => {
        const key = getStatLabelKey(stat.label);
        const formatted = formatStat(stat, locale, currency);
        return (
          <StatTile
            key={stat.label}
            testID="ledger-stat-tile"
            className="min-w-[40%] flex-1 basis-[40%]"
            label={key ? t(key) : stat.label}
            value={formatted.value}
            valueClassName={formatted.valueClassName}
            tone={stat.kind ?? 'info'}
            loading={loading}
          />
        );
      })}
    </View>
  );
}
