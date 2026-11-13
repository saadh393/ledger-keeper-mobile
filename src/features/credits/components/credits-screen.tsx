import type { ListRenderItem } from '@shopify/flash-list';
import type { CreditLedgerEntry } from '@/features/credits/schemas/credit-ledger-schema';
import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { useCreditBalance } from '@/features/credits/api/use-credit-balance';
import { useCreditLedger } from '@/features/credits/api/use-credit-ledger';
import { useCreditUsage } from '@/features/credits/api/use-credit-usage';
import { BuyCreditsSheet } from '@/features/credits/components/buy-credits-sheet';
import { CreditsBalance } from '@/features/credits/components/credits-balance';
import { CreditsHistoryEmpty } from '@/features/credits/components/credits-history-empty';
import { CreditsHistoryRow } from '@/features/credits/components/credits-history-row';
import { CreditsUsage } from '@/features/credits/components/credits-usage';
import { collapseLedgerEntries } from '@/features/credits/utils/collapse-ledger-entries';
import { LoanListFooter } from '@/features/loans/components/loan-list-footer';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export function CreditsScreen() {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const insets = useSafeAreaInsets();
  const balance = useCreditBalance();
  const usage = useCreditUsage();
  const ledger = useCreditLedger();
  const [refreshing, setRefreshing] = React.useState(false);
  const [buying, setBuying] = React.useState(false);
  const entries = React.useMemo(() => collapseLedgerEntries(ledger.data?.pages.flatMap(page => page.items) ?? []), [ledger.data]);

  const renderItem = React.useCallback<ListRenderItem<CreditLedgerEntry>>(
    ({ item }) => <CreditsHistoryRow entry={item} locale={locale} />,
    [locale],
  );

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([balance.refetch(), usage.refetch(), ledger.refetch()]);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (ledger.hasNextPage && !ledger.isFetchingNextPage && !ledger.isError)
      ledger.fetchNextPage();
  };

  return (
    <View testID="credits-screen" className="flex-1 bg-paper-100">
      <FlashList
        testID="credits-history"
        data={entries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListHeaderComponent={(
          <>
            <CreditsBalance locale={locale} onBuy={() => setBuying(true)} />
            <CreditsUsage locale={locale} />
            <Text className="px-4 pt-2 pb-1 text-label text-ink-500">{t('credits.history.title')}</Text>
          </>
        )}
        ListEmptyComponent={<CreditsHistoryEmpty query={ledger} />}
        ListFooterComponent={<LoanListFooter loading={ledger.isFetchingNextPage} />}
      />
      {buying ? <BuyCreditsSheet onDismiss={() => setBuying(false)} /> : null}
    </View>
  );
}
