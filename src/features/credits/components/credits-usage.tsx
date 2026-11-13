import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { EmptyState, StatTile, Text } from '@/components/ui';
import { TrendChart } from '@/features/assistant/components/artifacts/trend-chart';
import { useCreditUsage } from '@/features/credits/api/use-credit-usage';
import { fillUsageDays } from '@/features/credits/utils/fill-usage-days';
import { formatMonthDay } from '@/lib/format/date';
import { formatNumber } from '@/lib/format/number';

export type CreditsUsageProps = {
  locale: Language;
};

const operationTypes = ['chat', 'voice', 'receipt'] as const;

export function CreditsUsage({ locale }: CreditsUsageProps) {
  const { t } = useTranslation();
  const query = useCreditUsage();
  const days = React.useMemo(() => (query.data ? fillUsageDays(query.data.points, new Date()) : []), [query.data]);
  const hasUsage = Boolean(query.data?.totals.some(total => total.operations > 0));

  return (
    <View testID="credits-usage" className="gap-3 p-4">
      <Text className="text-label text-ink-500">{t('credits.usage.title')}</Text>
      {query.isError && !query.data
        ? (
            <EmptyState
              testID="credits-usage-error"
              variant="error"
              title={t('credits.usage.error')}
              actionLabel={t('credits.retry')}
              onAction={() => query.refetch()}
              actionLoading={query.isFetching}
            />
          )
        : null}
      {!query.isError || query.data
        ? (
            <View className="flex-row gap-2">
              {operationTypes.map((type) => {
                const total = query.data?.totals.find(item => item.type === type);
                return (
                  <StatTile
                    key={type}
                    testID={`credits-usage-${type}`}
                    label={t(`credits.usage.${type}`, { count: total?.operations ?? 0, operations: formatNumber(total?.operations ?? 0, locale) })}
                    value={query.data ? formatNumber(total?.credits ?? 0, locale) : null}
                  />
                );
              })}
            </View>
          )
        : null}
      {query.data && !hasUsage
        ? <EmptyState testID="credits-usage-empty" title={t('credits.usage.empty')} />
        : null}
      {query.data && hasUsage
        ? <TrendChart values={days.map(day => day.credits)} labels={days.map(day => formatMonthDay(day.date, locale))} />
        : null}
    </View>
  );
}
