import type { CategoryArtifactData } from '@/features/assistant/schemas/chart-artifact-schemas';
import { ChartPie } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { CategoryDonut } from '@/features/assistant/components/artifacts/category-donut';
import { CategoryLegendRow } from '@/features/assistant/components/artifacts/category-legend-row';
import { sharePercent } from '@/features/assistant/utils/share-percent';
import { formatCurrency } from '@/lib/format/currency';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type CategoryArtifactProps = {
  data: CategoryArtifactData;
  currency: string;
};

export function CategoryArtifact({ data, currency }: CategoryArtifactProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const title = t('assistant.charts.category');
  const total = formatCurrency(data.total, locale, currency);
  const hasData = data.total > 0 && data.items.length > 0;
  const rows = [...data.items]
    .sort((a, b) => b.value - a.value)
    .map(item => ({ ...item, amount: formatCurrency(item.value, locale, currency), share: `${formatNumber(sharePercent(item.value, data.total), locale)}%` }));
  const summary = hasData
    ? [title, `${t('assistant.charts.total')} ${total}`, ...rows.map(row => `${row.name} ${row.share}`)].join(', ')
    : [title, t('assistant.charts.noData')].join(', ');

  return (
    <ArtifactCard testID="category-artifact" label={title} icon={ChartPie} tone="expense" summary={summary}>
      {hasData
        ? (
            <View className="gap-4 py-3">
              <CategoryDonut items={rows} totalLabel={t('assistant.charts.total')} totalValue={total} />
              <View className="gap-2.5">
                {rows.map((row, index) => (
                  <CategoryLegendRow key={row.name} testID={`category-artifact-row-${index}`} name={row.name} color={row.color} amount={row.amount} share={row.share} />
                ))}
              </View>
            </View>
          )
        : <Text testID="category-artifact-empty" className="py-3 text-body text-ink-500">{t('assistant.charts.noData')}</Text>}
    </ArtifactCard>
  );
}
