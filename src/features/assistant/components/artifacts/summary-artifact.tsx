import type { SummaryArtifactData } from '@/features/assistant/schemas/transaction-artifact-schemas';
import { ChartColumn } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { SummaryArtifactStat } from '@/features/assistant/components/artifacts/summary-artifact-stat';
import { formatDelta } from '@/features/assistant/utils/format-delta';
import { formatSummaryPeriod } from '@/features/assistant/utils/format-summary-period';
import { formatStat } from '@/features/ledger/utils/format-stat';
import { netPositionLabel } from '@/features/ledger/utils/stat-labels';
import { formatCurrency } from '@/lib/format/currency';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type SummaryArtifactProps = {
  data: SummaryArtifactData;
  currency: string;
};

export function SummaryArtifact({ data, currency }: SummaryArtifactProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const period = formatSummaryPeriod(data, locale);
  const net = formatStat({ label: netPositionLabel, value: data.net, delta: '' }, locale, currency);
  const stats = [
    { kind: 'income', label: t('ledger.stats.income'), value: formatCurrency(data.income, locale, currency), valueClassName: 'text-forest-500', delta: formatDelta(data.incomeDelta, locale) },
    { kind: 'expense', label: t('ledger.stats.expense'), value: formatCurrency(data.expense, locale, currency), valueClassName: 'text-clay-500', delta: formatDelta(data.expenseDelta, locale) },
    { kind: 'net', label: t('ledger.stats.netPosition'), value: net.value, valueClassName: net.valueClassName ?? 'text-ink-900', delta: null },
  ].filter(stat => !data.kind || stat.kind === data.kind);
  const title = data.kind ? t(data.kind === 'income' ? 'ledger.types.income' : 'ledger.types.expense') : t('assistant.artifacts.summary');
  const label = `${title} · ${period}`;
  const summary = [label, ...stats.map(stat => [stat.label, stat.value, stat.delta].filter(Boolean).join(' '))].join(', ');

  return (
    <ArtifactCard
      testID="summary-artifact"
      label={label}
      icon={ChartColumn}
      tone={data.kind ?? (data.net >= 0 ? 'income' : 'expense')}
      summary={summary}
    >
      <View className="flex-row gap-2 py-3">
        {stats.map(stat => (
          <SummaryArtifactStat key={stat.kind} testID={`summary-artifact-${stat.kind}`} label={stat.label} value={stat.value} valueClassName={stat.valueClassName} delta={stat.delta} />
        ))}
      </View>
    </ArtifactCard>
  );
}
