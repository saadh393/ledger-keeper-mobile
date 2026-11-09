import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { formatCurrency } from '@/lib/format/currency';
import { formatNumber } from '@/lib/format/number';

export type LedgerReceiptItemProps = {
  item: TransactionRow['items'][number];
  locale: Language;
  currency: string;
};

export function LedgerReceiptItem({ item, locale, currency }: LedgerReceiptItemProps) {
  const { t } = useTranslation();
  const meta = [item.category, item.quantity === null ? null : t('ledger.details.quantity', { quantity: formatNumber(item.quantity, locale) })].filter(Boolean).join(' · ');
  const amount = `${item.amount < 0 ? '−' : ''}${formatCurrency(Math.abs(item.amount), locale, currency)}`;

  return (
    <View testID="ledger-receipt-item" className="flex-row items-start gap-3 py-1">
      <View className="min-w-0 flex-1">
        <Text testID="ledger-receipt-item-title" className="text-meta text-ink-900">{item.title}</Text>
        {meta ? <Text testID="ledger-receipt-item-meta" className="text-meta text-ink-500">{meta}</Text> : null}
      </View>
      <Text testID="ledger-receipt-item-amount" className="shrink-0 text-meta text-ink-900" style={{ fontVariant: ['tabular-nums'] }}>{amount}</Text>
    </View>
  );
}
