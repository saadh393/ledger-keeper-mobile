import type { ListRenderItem } from '@shopify/flash-list';
import type { useInstallments } from '@/features/installments/api/use-installments';
import type { Installment, InstallmentStatusFilter } from '@/features/installments/schemas/installment-schema';
import type { InstallmentActions } from '@/features/installments/types';
import type { TxKeyPath } from '@/lib/i18n';
import type { Language } from '@/lib/i18n/resources';
import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, showErrorMessage } from '@/components/ui';
import { InstallmentListLoading } from '@/features/installments/components/installment-list-loading';
import { InstallmentRow } from '@/features/installments/components/installment-row';
import { useExpandedInstallment } from '@/features/installments/hooks/use-expanded-installment';

export type InstallmentListProps = InstallmentActions & {
  bookId: string;
  status: InstallmentStatusFilter;
  query: ReturnType<typeof useInstallments>;
  locale: Language;
  onAdd: () => void;
};

const emptyKeys: Record<InstallmentStatusFilter, TxKeyPath> = {
  active: 'installments.empty.active',
  completed: 'installments.empty.completed',
  all: 'installments.empty.all',
};

export function InstallmentList({ bookId, status, query, locale, onAdd, onEdit, onPay, onDelete, onUndo }: InstallmentListProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);
  const { expandedId, toggle } = useExpandedInstallment();

  const renderItem = React.useCallback<ListRenderItem<Installment>>(
    ({ item }) => (
      <InstallmentRow
        bookId={bookId}
        installment={item}
        locale={locale}
        expanded={item.id === expandedId}
        onToggle={toggle}
        onEdit={onEdit}
        onPay={onPay}
        onDelete={onDelete}
        onUndo={onUndo}
      />
    ),
    [bookId, locale, expandedId, toggle, onEdit, onPay, onDelete, onUndo],
  );

  const refresh = async () => {
    setRefreshing(true);
    const result = await query.refetch();
    setRefreshing(false);
    if (result.isError)
      showErrorMessage(t('installments.refreshError'));
  };

  if (query.isError && !query.data) {
    return (
      <EmptyState
        testID="installment-list-error"
        variant="error"
        title={t('installments.error')}
        actionLabel={t('installments.retry')}
        onAction={() => query.refetch()}
        actionLoading={query.isFetching}
      />
    );
  }

  if (!query.data)
    return <InstallmentListLoading />;

  return (
    <FlashList
      testID="installment-list"
      data={query.data}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      extraData={expandedId}
      refreshing={refreshing}
      onRefresh={refresh}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 + 56 }}
      ListEmptyComponent={(
        <EmptyState
          testID="installment-list-empty"
          title={t(emptyKeys[status])}
          actionLabel={status === 'completed' ? undefined : t('installments.actions.add')}
          onAction={status === 'completed' ? undefined : onAdd}
        />
      )}
    />
  );
}
