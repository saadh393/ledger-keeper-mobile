import type { ListRenderItem } from '@shopify/flash-list';
import type { LedgerListItem } from '@/features/ledger/utils/group-rows-by-day';
import type { Month, MonthRange } from '@/features/ledger/utils/month';
import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, showErrorMessage } from '@/components/ui';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { useBookTable } from '@/features/ledger/api/use-book-table';
import { LedgerDayHeader } from '@/features/ledger/components/ledger-day-header';
import { LedgerListFooter } from '@/features/ledger/components/ledger-list-footer';
import { LedgerRow } from '@/features/ledger/components/ledger-row';
import { LedgerRowPlaceholder } from '@/features/ledger/components/ledger-row-placeholder';
import { groupRowsByDay } from '@/features/ledger/utils/group-rows-by-day';
import { formatMonthLabel } from '@/features/ledger/utils/month';
import { formatDayHeader } from '@/lib/format/day-header';
import { toDayKey } from '@/lib/format/day-key';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type TransactionListProps = MonthRange & {
  month: Month;
};

const placeholderKeys = Array.from({ length: 6 }, (_, index) => `placeholder-${index}`);

export function TransactionList({ month, firstDay, lastDay }: TransactionListProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const activeBook = useActiveBook();
  const table = useBookTable(activeBook.activeBookId, firstDay, lastDay);
  const [refreshing, setRefreshing] = React.useState(false);
  const locale = resolveLanguage(i18n.language);
  const currency = activeBook.activeBook?.currency ?? 'BDT';
  const today = toDayKey(new Date());
  const rows = table.data?.rows;
  const items = React.useMemo(() => groupRowsByDay(rows ?? []), [rows]);

  const renderItem = React.useCallback<ListRenderItem<LedgerListItem>>(
    ({ item }) => (item.type === 'day'
      ? <LedgerDayHeader label={formatDayHeader(item.day, locale, today)} />
      : <LedgerRow row={item.row} locale={locale} currency={currency} />),
    [locale, currency, today],
  );

  const refresh = async () => {
    setRefreshing(true);
    const result = await table.refetch();
    setRefreshing(false);
    if (result.isError)
      showErrorMessage(t('ledger.list.refreshError'));
  };

  if (activeBook.isError || (table.isError && !table.data)) {
    return (
      <EmptyState
        testID="ledger-list-error"
        variant="error"
        title={t('ledger.list.error')}
        actionLabel={t('ledger.stats.retry')}
        onAction={() => (activeBook.isError ? activeBook.refetch() : table.refetch())}
        actionLoading={table.isFetching}
      />
    );
  }

  if (!table.data) {
    return (
      <View testID="ledger-list-loading" aria-busy>
        {placeholderKeys.map(key => <LedgerRowPlaceholder key={key} />)}
      </View>
    );
  }

  return (
    <FlashList
      testID="ledger-list"
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.key}
      getItemType={item => item.type}
      refreshing={refreshing}
      onRefresh={refresh}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      ListEmptyComponent={(
        <EmptyState
          testID="ledger-list-empty"
          title={t('ledger.list.empty', { month: formatMonthLabel(month, locale) })}
        />
      )}
      ListFooterComponent={items.length
        ? <LedgerListFooter count={table.data.rows.length} stats={table.data.stats} locale={locale} currency={currency} />
        : null}
    />
  );
}
