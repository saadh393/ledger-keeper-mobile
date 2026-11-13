import type { ListRenderItem } from '@shopify/flash-list';
import type { useDebts } from '@/features/loans/api/use-debts';
import type { Debt, DebtStatusFilter } from '@/features/loans/schemas/debt-schema';
import type { LoanActions } from '@/features/loans/types';
import type { TxKeyPath } from '@/lib/i18n';
import type { Language } from '@/lib/i18n/resources';
import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, showErrorMessage } from '@/components/ui';
import { LoanListFooter } from '@/features/loans/components/loan-list-footer';
import { LoanListLoading } from '@/features/loans/components/loan-list-loading';
import { LoanRow } from '@/features/loans/components/loan-row';
import { useExpandedDebt } from '@/features/loans/hooks/use-expanded-debt';

export type LoanListProps = LoanActions & {
  bookId: string;
  status: DebtStatusFilter;
  query: ReturnType<typeof useDebts>;
  locale: Language;
  onAdd: () => void;
};

const emptyKeys: Record<DebtStatusFilter, TxKeyPath> = {
  open: 'loans.empty.open',
  settled: 'loans.empty.settled',
  all: 'loans.empty.all',
};

export function LoanList({ bookId, status, query, locale, onAdd, onEdit, onRepay, onDelete, onUndo }: LoanListProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);
  const { expandedId, toggle } = useExpandedDebt();
  const debts = React.useMemo(() => query.data?.pages.flatMap(page => page.items) ?? [], [query.data]);

  const renderItem = React.useCallback<ListRenderItem<Debt>>(
    ({ item }) => (
      <LoanRow
        bookId={bookId}
        debt={item}
        locale={locale}
        expanded={item.id === expandedId}
        onToggle={toggle}
        onEdit={onEdit}
        onRepay={onRepay}
        onDelete={onDelete}
        onUndo={onUndo}
      />
    ),
    [bookId, locale, expandedId, toggle, onEdit, onRepay, onDelete, onUndo],
  );

  const refresh = async () => {
    setRefreshing(true);
    const result = await query.refetch();
    setRefreshing(false);
    if (result.isError)
      showErrorMessage(t('loans.refreshError'));
  };

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage && !query.isError)
      query.fetchNextPage();
  };

  if (query.isError && !query.data) {
    return (
      <EmptyState
        testID="loan-list-error"
        variant="error"
        title={t('loans.error')}
        actionLabel={t('loans.retry')}
        onAction={() => query.refetch()}
        actionLoading={query.isFetching}
      />
    );
  }

  if (!query.data)
    return <LoanListLoading />;

  return (
    <FlashList
      testID="loan-list"
      data={debts}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      extraData={expandedId}
      refreshing={refreshing}
      onRefresh={refresh}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 + 56 }}
      ListEmptyComponent={(
        <EmptyState
          testID="loan-list-empty"
          title={t(emptyKeys[status])}
          actionLabel={status === 'settled' ? undefined : t('loans.actions.add')}
          onAction={status === 'settled' ? undefined : onAdd}
        />
      )}
      ListFooterComponent={<LoanListFooter loading={query.isFetchingNextPage} />}
    />
  );
}
