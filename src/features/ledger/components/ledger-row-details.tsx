import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { LedgerReceiptItem } from '@/features/ledger/components/ledger-receipt-item';
import { LedgerRowDetail } from '@/features/ledger/components/ledger-row-detail';
import { formatCurrency } from '@/lib/format/currency';
import { formatDateTime } from '@/lib/format/date';
import { formatOriginalAmount } from '@/lib/format/original-amount';

export type LedgerRowDetailsProps = {
  row: TransactionRow;
  locale: Language;
  currency: string;
};

const expandMs = 120;

export function LedgerRowDetails({ row, locale, currency }: LedgerRowDetailsProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const items = [...row.items].sort((a, b) => Number(a.type === 'adjustment') - Number(b.type === 'adjustment'));

  return (
    <Animated.View testID="ledger-row-details" entering={reducedMotion ? undefined : FadeIn.duration(expandMs)} className="mx-4 mb-2 rounded-2xl bg-surface-container px-4 py-3">
      <LedgerRowDetail testID="ledger-row-detail-category" label={t('ledger.details.category')} value={row.category} />
      <LedgerRowDetail testID="ledger-row-detail-date" label={t('ledger.details.date')} value={formatDateTime(row.dateIso, locale)} />
      {row.note ? <LedgerRowDetail testID="ledger-row-detail-note" label={t('ledger.details.note')} value={row.note} /> : null}
      {row.merchant ? <LedgerRowDetail testID="ledger-row-detail-merchant" label={t('ledger.details.merchant')} value={row.merchant} /> : null}
      {row.original ? <LedgerRowDetail testID="ledger-row-detail-original" label={t('ledger.details.original')} value={formatOriginalAmount(row.original, locale)} /> : null}
      {items.length
        ? (
            <View testID="ledger-row-items" className="mt-2 border-t border-border pt-2">
              <Text className="mb-1 text-meta text-ink-500">{t('ledger.details.items')}</Text>
              {items.map(item => <LedgerReceiptItem key={item.id} item={item} locale={locale} currency={currency} />)}
              <View testID="ledger-row-items-total" className="mt-1 flex-row border-t border-border pt-2">
                <Text className="flex-1 text-meta font-medium text-ink-900">{t('ledger.details.total')}</Text>
                <Text className="text-meta font-medium text-ink-900" style={{ fontVariant: ['tabular-nums'] }}>{formatCurrency(row.amount, locale, currency)}</Text>
              </View>
            </View>
          )
        : null}
    </Animated.View>
  );
}
