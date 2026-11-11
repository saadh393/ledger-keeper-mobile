import type { ListRenderItem } from '@shopify/flash-list';
import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { LedgerListItem } from '@/features/ledger/utils/group-rows-by-day';
import type { Month, MonthRange } from '@/features/ledger/utils/month';
import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { EmptyState, showErrorMessage } from '@/components/ui';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { useBookTable } from '@/features/ledger/api/use-book-table';
import { LedgerDayHeader } from '@/features/ledger/components/ledger-day-header';
import { LedgerDeleteSheet } from '@/features/ledger/components/ledger-delete-sheet';
import { LedgerListFooter } from '@/features/ledger/components/ledger-list-footer';
import { LedgerRow } from '@/features/ledger/components/ledger-row';
import { LedgerRowMenuSheet } from '@/features/ledger/components/ledger-row-menu-sheet';
import { LedgerRowPlaceholder } from '@/features/ledger/components/ledger-row-placeholder';
import { TransactionFormSheet } from '@/features/ledger/components/transaction-form-sheet';
import { useCopyTransaction } from '@/features/ledger/hooks/use-copy-transaction';
import { useLedgerRowActions } from '@/features/ledger/hooks/use-ledger-row-actions';
import { useLedgerFiltersStore } from '@/features/ledger/store/use-ledger-filters-store';
import { filterRows, isAmountSort } from '@/features/ledger/utils/filter-rows';
import { groupRowsByDay } from '@/features/ledger/utils/group-rows-by-day';
import { formatMonthLabel } from '@/features/ledger/utils/month';
import { formatDayHeader } from '@/lib/format/day-header';
import { toDayKey } from '@/lib/format/day-key';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type TransactionListProps = MonthRange & {
  month: Month;
};

const placeholderKeys = Array.from({ length: 6 }, (_, index) => `placeholder-${index}`);

const searchDelayMs = 250;

function toFlatItems(rows: TransactionRow[]): LedgerListItem[] {
  return rows.map(row => ({ type: 'row', key: row.id, row }));
}

function LedgerListLoading() {
  return (
    <View testID="ledger-list-loading" aria-busy>
      {placeholderKeys.map(key => <LedgerRowPlaceholder key={key} />)}
    </View>
  );
}

export function TransactionList({ month, firstDay, lastDay }: TransactionListProps) {
  const { t, i18n } = useTranslation();
  const activeBook = useActiveBook();
  const table = useBookTable(activeBook.activeBookId, firstDay, lastDay);
  const [refreshing, setRefreshing] = React.useState(false);
  const locale = resolveLanguage(i18n.language);
  const currency = activeBook.activeBook?.currency ?? 'BDT';
  const today = toDayKey(new Date());
  const rows = table.data?.rows;
  const typedQuery = useLedgerFiltersStore(state => state.query);
  const debouncedQuery = useDebouncedValue(typedQuery, searchDelayMs);
  const query = typedQuery ? debouncedQuery : '';
  const kind = useLedgerFiltersStore(state => state.kind);
  const sort = useLedgerFiltersStore(state => state.sort);
  const clearFilters = useLedgerFiltersStore(state => state.clearFilters);
  const showDate = isAmountSort(sort);
  const shownRows = React.useMemo(() => filterRows(rows ?? [], { query, kind, sort }), [rows, query, kind, sort]);
  const items = React.useMemo(() => (showDate ? toFlatItems(shownRows) : groupRowsByDay(shownRows)), [showDate, shownRows]);
  const actions = useLedgerRowActions();
  const { expandedId, toggle, openMenu, askDelete } = actions;
  const copy = useCopyTransaction(locale, currency);

  const renderItem = React.useCallback<ListRenderItem<LedgerListItem>>(
    ({ item }) => (item.type === 'day'
      ? <LedgerDayHeader label={formatDayHeader(item.day, locale, today)} />
      : (
          <LedgerRow
            row={item.row}
            locale={locale}
            currency={currency}
            showDate={showDate}
            expanded={item.row.id === expandedId}
            onToggle={toggle}
            onOpenMenu={openMenu}
            onCopy={copy}
            onDelete={askDelete}
          />
        )),
    [locale, currency, today, showDate, expandedId, toggle, openMenu, copy, askDelete],
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

  if (!table.data)
    return <LedgerListLoading />;

  return (
    <>
      <FlashList
        testID="ledger-list"
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        getItemType={item => item.type}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={{ paddingBottom: 16 + 56 }}
        ListEmptyComponent={table.data.rows.length
          ? (
              <EmptyState
                testID="ledger-list-no-matches"
                title={t('ledger.list.noMatches')}
                actionLabel={t('ledger.list.clearFilters')}
                onAction={clearFilters}
              />
            )
          : (
              <EmptyState
                testID="ledger-list-empty"
                title={t('ledger.list.empty', { month: formatMonthLabel(month, locale) })}
              />
            )}
        ListFooterComponent={items.length
          ? <LedgerListFooter count={table.data.rows.length} shown={shownRows.length} stats={table.data.stats} locale={locale} currency={currency} />
          : null}
      />
      {actions.menuRow
        ? <LedgerRowMenuSheet row={actions.menuRow} onEdit={actions.openEdit} onCopy={copy} onDelete={askDelete} onDismiss={actions.closeMenu} />
        : null}
      {actions.editRow && activeBook.activeBookId
        ? <TransactionFormSheet bookId={activeBook.activeBookId} currency={currency} row={actions.editRow} viewedMonth={month} onDismiss={actions.closeEdit} />
        : null}
      {actions.deleteRow && activeBook.activeBookId
        ? <LedgerDeleteSheet bookId={activeBook.activeBookId} row={actions.deleteRow} locale={locale} currency={currency} onDismiss={actions.closeDelete} />
        : null}
    </>
  );
}
