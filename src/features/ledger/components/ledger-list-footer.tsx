import type { TableStat } from '@/features/ledger/schemas/book-table-schema';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { formatCurrency } from '@/lib/format/currency';
import { formatNumber } from '@/lib/format/number';

export type LedgerListFooterProps = {
  count: number;
  stats: TableStat[];
  locale: Language;
  currency: string;
};

export function LedgerListFooter({ count, stats, locale, currency }: LedgerListFooterProps) {
  const { t } = useTranslation();
  const total = (kind: TableStat['kind']) => formatCurrency(stats.find(stat => stat.kind === kind)?.value ?? 0, locale, currency);
  const items = [
    { key: 'count', label: t('ledger.list.transactions'), value: formatNumber(count, locale) },
    { key: 'income', label: t('ledger.stats.income'), value: total('income') },
    { key: 'expense', label: t('ledger.stats.expense'), value: total('expense') },
  ];

  return (
    <View testID="ledger-list-footer" className="mx-4 mt-4 flex-row flex-wrap justify-between gap-3 border-t border-border pt-4">
      {items.map(item => (
        <View key={item.key} testID={`ledger-list-footer-${item.key}`}>
          <Text className="text-meta text-ink-500">{item.label}</Text>
          <Text className="text-label text-ink-900" style={{ fontVariant: ['tabular-nums'] }}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}
