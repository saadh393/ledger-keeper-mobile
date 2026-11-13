import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, EmptyState, Text, useBottomSheetModalRef } from '@/components/ui';
import { useStorePacks } from '@/features/credits/api/use-store-packs';
import { BuyCreditsPackRow } from '@/features/credits/components/buy-credits-pack-row';
import { BuyCreditsPlaceholder } from '@/features/credits/components/buy-credits-placeholder';
import { useBuyCredits } from '@/features/credits/hooks/use-buy-credits';
import { resolveLanguage } from '@/lib/i18n/resolve-language';
import { twMerge } from '@/lib/tw-merge';

export type BuyCreditsSheetProps = {
  onDismiss: () => void;
};

export function BuyCreditsSheet({ onDismiss }: BuyCreditsSheetProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const insets = useSafeAreaInsets();
  const modal = useBottomSheetModalRef();
  const packs = useStorePacks();
  const { buy, pendingId, notice } = useBuyCredits(modal.dismiss);

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  return (
    <BottomSheet ref={modal.ref} title={t('credits.purchase.title')} dismissible={!pendingId} onDismiss={onDismiss} testID="buy-credits-sheet">
      <BottomSheetView className="gap-2 px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {packs.isError
          ? (
              <EmptyState
                testID="buy-credits-unavailable"
                variant="error"
                title={t('credits.purchase.unavailable')}
                actionLabel={t('credits.retry')}
                onAction={() => packs.refetch()}
                actionLoading={packs.isFetching}
              />
            )
          : null}
        {!packs.isError && !packs.data ? <BuyCreditsPlaceholder /> : null}
        {packs.data?.map(pack => (
          <BuyCreditsPackRow
            key={pack.id}
            pack={pack}
            locale={locale}
            pending={pendingId === pack.id}
            disabled={pendingId !== null}
            onPress={buy}
          />
        ))}
        {pendingId ? <Text testID="buy-credits-pending" className="text-center text-meta text-ink-500">{t('credits.purchase.purchasing')}</Text> : null}
        {notice
          ? (
              <View className={twMerge('rounded-2xl px-4 py-3', notice.tone === 'error' ? 'bg-clay-100' : 'bg-selected')}>
                <Text testID="buy-credits-notice" accessibilityRole="alert" className={twMerge('text-body', notice.tone === 'error' ? 'text-clay-500' : 'text-on-selected')}>
                  {notice.message}
                </Text>
              </View>
            )
          : null}
      </BottomSheetView>
    </BottomSheet>
  );
}
