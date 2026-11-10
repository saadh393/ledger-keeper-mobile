import type { MonthRange } from '@/features/ledger/utils/month';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { useBookTable } from '@/features/ledger/api/use-book-table';
import { LedgerSummaryCell } from '@/features/ledger/components/ledger-summary-cell';
import { LedgerSummaryError } from '@/features/ledger/components/ledger-summary-error';
import { formatCompactStat } from '@/features/ledger/utils/format-compact-stat';
import { formatStat } from '@/features/ledger/utils/format-stat';
import { getStatLabelKey, getStatShortLabelKey, placeholderStats } from '@/features/ledger/utils/stat-labels';
import { resolveLanguage } from '@/lib/i18n/resolve-language';
import { twMerge } from '@/lib/tw-merge';

const kindValueClassName = {
  income: 'text-forest-500',
  expense: 'text-clay-500',
};

export function LedgerStats({ firstDay, lastDay }: MonthRange) {
  const { t, i18n } = useTranslation();
  const activeBook = useActiveBook();
  const table = useBookTable(activeBook.activeBookId, firstDay, lastDay);
  const stacked = useWindowDimensions().fontScale > 1;

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
    <View
      testID="ledger-stats"
      className={twMerge('mx-4 flex-row rounded-2xl bg-surface-container px-1 py-2', stacked && 'flex-wrap gap-y-1')}
    >
      {stats.map((stat) => {
        const fullKey = getStatLabelKey(stat.label);
        const shortKey = getStatShortLabelKey(stat.label);
        const compact = formatCompactStat(stat, locale, currency);
        const exact = loading ? t('common.loading') : formatStat(stat, locale, currency).value;
        const fullLabel = fullKey ? t(fullKey) : stat.label;
        return (
          <LedgerSummaryCell
            key={stat.label}
            label={shortKey ? t(shortKey) : stat.label}
            value={compact.value}
            valueClassName={compact.valueClassName ?? (stat.kind && kindValueClassName[stat.kind])}
            loading={loading}
            accessibilityLabel={`${fullLabel}, ${exact}`}
            className={stacked ? 'basis-1/2' : 'flex-1 basis-0'}
            onLongPress={loading ? undefined : () => showMessage({ message: `${fullLabel} ${exact}`, type: 'info' })}
          />
        );
      })}
    </View>
  );
}
