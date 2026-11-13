import type { MonthRange } from '@/features/ledger/utils/month';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions, View } from 'react-native';
import { StatTile } from '@/components/ui/stat-tile';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { useBookTable } from '@/features/ledger/api/use-book-table';
import { LedgerSummaryError } from '@/features/ledger/components/ledger-summary-error';
import { LedgerSummaryMenuSheet } from '@/features/ledger/components/ledger-summary-menu-sheet';
import { useLedgerPreferencesStore } from '@/features/ledger/store/use-ledger-preferences-store';
import { formatCompactStat } from '@/features/ledger/utils/format-compact-stat';
import { formatStat } from '@/features/ledger/utils/format-stat';
import { getSummaryLayout } from '@/features/ledger/utils/get-summary-layout';
import { averageLabel, getStatLabelKey, getStatShortLabelKey, placeholderStats } from '@/features/ledger/utils/stat-labels';
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
  const { width, fontScale } = useWindowDimensions();
  const showSummary = useLedgerPreferencesStore(state => state.showSummary);
  const [exactValue, setExactValue] = React.useState<string | null>(null);

  if (!showSummary)
    return null;

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
  const stats = (table.data?.stats ?? placeholderStats).filter(stat => stat.label !== averageLabel);
  const locale = resolveLanguage(i18n.language);
  const currency = activeBook.activeBook?.currency ?? 'BDT';
  const compactValues = stats.map(stat => formatCompactStat(stat, locale, currency));
  const { stacked, fontSize } = getSummaryLayout(width - 32, compactValues.map(value => value.value), fontScale);

  return (
    <View
      testID="ledger-stats"
      className={twMerge('mx-4 gap-2', !stacked && 'flex-row')}
    >
      {stats.map((stat, index) => {
        const fullKey = getStatLabelKey(stat.label);
        const shortKey = getStatShortLabelKey(stat.label);
        const compact = compactValues[index]!;
        const exact = loading ? t('common.loading') : formatStat(stat, locale, currency).value;
        const fullLabel = fullKey ? t(fullKey) : stat.label;
        return (
          <StatTile
            key={stat.label}
            testID="ledger-summary-cell"
            label={shortKey ? t(shortKey) : stat.label}
            value={loading ? null : compact.value}
            valueClassName={compact.valueClassName ?? (stat.kind && kindValueClassName[stat.kind])}
            fontSize={fontSize}
            stacked={stacked}
            accessibilityLabel={`${fullLabel}, ${exact}`}
            onLongPress={loading ? undefined : () => setExactValue(`${fullLabel} ${exact}`)}
          />
        );
      })}
      {exactValue ? <LedgerSummaryMenuSheet exactValue={exactValue} onDismiss={() => setExactValue(null)} /> : null}
    </View>
  );
}
