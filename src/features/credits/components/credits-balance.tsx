import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, EmptyState, Text } from '@/components/ui';
import { useCreditBalance } from '@/features/credits/api/use-credit-balance';
import { formatNumber } from '@/lib/format/number';

export type CreditsBalanceProps = {
  locale: Language;
  onBuy: () => void;
};

export function CreditsBalance({ locale, onBuy }: CreditsBalanceProps) {
  const { t } = useTranslation();
  const query = useCreditBalance();

  if (query.isError && !query.data) {
    return (
      <EmptyState
        testID="credits-balance-error"
        variant="error"
        title={t('credits.balance.error')}
        actionLabel={t('credits.retry')}
        onAction={() => query.refetch()}
        actionLoading={query.isFetching}
      />
    );
  }

  return (
    <View testID="credits-balance" className="gap-1 px-4 pt-4 pb-2">
      <Text className="text-label text-ink-500">{t('credits.balance.label')}</Text>
      {query.data
        ? (
            <Text testID="credits-balance-value" className="text-[40px] leading-[52px] font-semibold text-ink-900" style={{ fontVariant: ['tabular-nums'] }}>
              {formatNumber(query.data.balance, locale)}
            </Text>
          )
        : <View testID="credits-balance-placeholder" className="my-2 h-10 w-32 rounded-lg bg-border" />}
      {query.data && query.data.held > 0
        ? <Text testID="credits-balance-held" className="text-meta text-ink-500">{t('credits.balance.held', { held: formatNumber(query.data.held, locale) })}</Text>
        : null}
      <View className="mt-3">
        <Button testID="credits-buy" label={t('credits.buy')} onPress={onBuy} />
      </View>
    </View>
  );
}
