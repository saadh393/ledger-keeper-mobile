import type { ReceiptDraftArtifactData } from '@/features/receipts/schemas/receipt-artifact-schemas';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { formatCurrency } from '@/lib/format/currency';
import { formatOriginalAmount } from '@/lib/format/original-amount';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type ReceiptDraftTotalsProps = {
  subtotal: number;
  adjustment: number;
  total: number;
  original: ReceiptDraftArtifactData['original'];
  currency: string;
};

export function ReceiptDraftTotals({ subtotal, adjustment, total, original, currency }: ReceiptDraftTotalsProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);

  return (
    <View testID="receipt-totals" className="mb-4 gap-1 border-t border-dashed border-border pt-3">
      <View className="flex-row justify-between">
        <Text className="text-meta text-ink-500">{t('receipts.draft.subtotal')}</Text>
        <Text className="text-meta text-ink-700 tabular-nums">{formatCurrency(subtotal, locale, currency)}</Text>
      </View>
      {adjustment
        ? (
            <View testID="receipt-adjustment" className="flex-row justify-between">
              <Text className="text-meta text-ink-500">{t('receipts.draft.adjustment')}</Text>
              <Text className="text-meta text-ink-700 tabular-nums">{formatCurrency(adjustment, locale, currency)}</Text>
            </View>
          )
        : null}
      <View className="flex-row items-baseline justify-between pt-1">
        <Text className="text-row-title text-ink-900">{t('receipts.draft.total')}</Text>
        <Text testID="receipt-total" className="text-title font-semibold text-ink-900 tabular-nums">{formatCurrency(total, locale, currency)}</Text>
      </View>
      {original
        ? <Text testID="receipt-original" className="text-meta text-ink-500">{t('assistant.draft.original', { original: formatOriginalAmount(original, locale) })}</Text>
        : null}
    </View>
  );
}
