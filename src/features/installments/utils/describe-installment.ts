import type { TFunction } from 'i18next';
import type { Installment } from '@/features/installments/schemas/installment-schema';
import type { Language } from '@/lib/i18n/resources';
import { formatCurrency } from '@/lib/format/currency';
import { formatNumber } from '@/lib/format/number';

export function describeInstallment(installment: Installment, locale: Language, t: TFunction): string {
  const money = (value: number) => formatCurrency(value, locale, installment.currency);
  return [
    installment.title,
    installment.category,
    t('installments.card.each', { amount: money(installment.amount) }),
    t('installments.card.progress', { paid: formatNumber(installment.paidCount, locale), total: formatNumber(installment.totalCount, locale) }),
    installment.status === 'completed' ? t('installments.card.completed') : t('installments.card.remaining', { amount: money(installment.remainingAmount) }),
  ].filter(Boolean).join(', ');
}
