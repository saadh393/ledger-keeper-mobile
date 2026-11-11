import type { Installment } from '@/features/installments/schemas/installment-schema';
import type { Language } from '@/lib/i18n/resources';
import { CalendarClock } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, ToneTile } from '@/components/ui';
import { formatCurrency } from '@/lib/format/currency';
import { formatNumber } from '@/lib/format/number';

export type InstallmentSummaryProps = {
  installment: Installment;
  locale: Language;
};

export function InstallmentSummary({ installment, locale }: InstallmentSummaryProps) {
  const { t } = useTranslation();
  const completed = installment.status === 'completed';
  const money = (value: number) => formatCurrency(value, locale, installment.currency);
  const progress = installment.totalCount > 0 ? Math.min(100, (installment.paidCount / installment.totalCount) * 100) : 0;
  const meta = [installment.category, t('installments.card.each', { amount: money(installment.amount) })].filter(Boolean).join(' · ');

  return (
    <View className="min-h-14 flex-row items-center gap-3 py-2">
      <ToneTile tone="expense" icon={CalendarClock} iconSize={18} />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-2">
          <Text testID="installment-summary-title" numberOfLines={1} className="shrink text-row-title text-ink-900">{installment.title}</Text>
          {completed
            ? (
                <View testID="installment-summary-completed" className="shrink-0 rounded-full bg-paper-200 px-2 py-0.5">
                  <Text className="text-meta font-semibold text-ink-500">{t('installments.card.completed')}</Text>
                </View>
              )
            : null}
        </View>
        <Text numberOfLines={1} className="mt-0.5 text-meta text-ink-500" style={{ fontVariant: ['tabular-nums'] }}>{meta}</Text>
        <View className="mt-1.5 h-1 overflow-hidden rounded-full bg-paper-200">
          <View testID="installment-summary-progress" className="h-full rounded-full bg-clay-500" style={{ width: `${progress}%` }} />
        </View>
      </View>
      <View className="shrink-0 items-end">
        <Text testID="installment-summary-count" className="text-row-title font-semibold text-ink-900" style={{ fontVariant: ['tabular-nums'] }}>
          {t('installments.card.progress', { paid: formatNumber(installment.paidCount, locale), total: formatNumber(installment.totalCount, locale) })}
        </Text>
        {completed
          ? null
          : (
              <Text testID="installment-summary-remaining" className="text-meta text-ink-500" style={{ fontVariant: ['tabular-nums'] }}>
                {t('installments.card.remaining', { amount: money(installment.remainingAmount) })}
              </Text>
            )}
      </View>
    </View>
  );
}
