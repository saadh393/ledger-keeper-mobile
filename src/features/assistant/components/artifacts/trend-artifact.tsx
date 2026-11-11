import type { TrendArtifactData } from '@/features/assistant/schemas/chart-artifact-schemas';
import { ChartColumn } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { SummaryArtifactStat } from '@/features/assistant/components/artifacts/summary-artifact-stat';
import { TrendChart } from '@/features/assistant/components/artifacts/trend-chart';
import { formatCurrency } from '@/lib/format/currency';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type TrendArtifactProps = {
  data: TrendArtifactData;
  currency: string;
};

export function TrendArtifact({ data, currency }: TrendArtifactProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const title = t('assistant.charts.trend');
  const hasSpending = data.values.some(value => value > 0);
  const peakIndex = data.values.indexOf(Math.max(...data.values));
  const stats = [
    { key: 'average', label: t('assistant.charts.average'), value: formatCurrency(data.average, locale, currency) },
    { key: 'peak', label: t('assistant.charts.peak'), value: formatCurrency(data.peak, locale, currency) },
    { key: 'days', label: t('assistant.charts.activeDays'), value: formatNumber(data.streakDays, locale) },
  ];
  const detail = hasSpending
    ? t('assistant.charts.peakOn', { amount: formatCurrency(data.peak, locale, currency), label: data.labels[peakIndex] })
    : t('assistant.charts.noSpending');
  const summary = [title, detail, ...stats.map(stat => `${stat.label} ${stat.value}`)].join(', ');

  return (
    <ArtifactCard testID="trend-artifact" label={title} icon={ChartColumn} summary={summary}>
      <View className="gap-3 py-3">
        {data.values.length ? <TrendChart values={data.values} labels={data.labels} /> : null}
        {hasSpending ? null : <Text testID="trend-artifact-empty" className="text-center text-meta text-ink-500">{t('assistant.charts.noSpending')}</Text>}
        <View className="flex-row gap-2">
          {stats.map(stat => (
            <SummaryArtifactStat key={stat.key} testID={`trend-artifact-${stat.key}`} label={stat.label} value={stat.value} valueClassName="text-ink-900" />
          ))}
        </View>
      </View>
    </ArtifactCard>
  );
}
