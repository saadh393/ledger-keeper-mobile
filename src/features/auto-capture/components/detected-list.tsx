import type { ListRenderItem } from '@shopify/flash-list';
import type { DetectedItem } from '@/features/auto-capture/schemas/detected-item-schema';
import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, Text } from '@/components/ui';
import { useDetectedItems } from '@/features/auto-capture/api/use-detected-items';
import { DetectedEditSheet } from '@/features/auto-capture/components/detected-edit-sheet';
import { DetectedRow } from '@/features/auto-capture/components/detected-row';
import { useDetectedActions } from '@/features/auto-capture/hooks/use-detected-actions';
import { CreditsHistoryPlaceholder } from '@/features/credits/components/credits-history-placeholder';
import { LoanListFooter } from '@/features/loans/components/loan-list-footer';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type DetectedListProps = {
  bookId: string;
  currency: string;
};

export function DetectedList({ bookId, currency }: DetectedListProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const insets = useSafeAreaInsets();
  const query = useDetectedItems(bookId);
  const actions = useDetectedActions(bookId);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<DetectedItem | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const items = React.useMemo(() => query.data?.pages.flatMap(page => page.items) ?? [], [query.data]);

  const renderItem = React.useCallback<ListRenderItem<DetectedItem>>(({ item }) => (
    <DetectedRow
      item={item}
      locale={locale}
      pending={actions.pendingIds.has(item.id)}
      expanded={item.id === expandedId}
      onToggle={value => setExpandedId(current => (current === value.id ? null : value.id))}
      onConfirm={actions.confirm}
      onEdit={setEditing}
      onDiscard={actions.discard}
    />
  ), [locale, actions, expandedId]);

  const refresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  if (query.isError && !query.data)
    return <EmptyState testID="detected-error" variant="error" title={t('autoCapture.inbox.error')} actionLabel={t('autoCapture.retry')} onAction={() => query.refetch()} />;

  if (!query.data)
    return <CreditsHistoryPlaceholder />;

  return (
    <>
      <FlashList
        testID="detected-list"
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        extraData={[expandedId, actions.pendingIds]}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListHeaderComponent={<Text className="px-4 pt-3 pb-1 text-meta text-ink-500">{t('autoCapture.inbox.hiddenNote')}</Text>}
        ListEmptyComponent={<EmptyState testID="detected-empty" title={t('autoCapture.inbox.emptyTitle')} body={t('autoCapture.inbox.emptyBody')} />}
        ListFooterComponent={<LoanListFooter loading={query.isFetchingNextPage} />}
      />
      {editing
        ? (
            <DetectedEditSheet
              bookId={bookId}
              currency={currency}
              item={editing}
              onDismiss={() => {
                setEditing(null);
                void actions.refresh();
              }}
            />
          )
        : null}
    </>
  );
}
