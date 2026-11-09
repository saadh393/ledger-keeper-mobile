import type { Language } from '@/lib/i18n/resources';
import { formatCurrency } from '@/lib/format/currency';
import { formatNumber } from '@/lib/format/number';

export type OriginalAmount = {
  amount: number;
  currency: string;
  rate: number;
};

export function formatOriginalAmount(original: OriginalAmount, locale: Language) {
  return `${formatCurrency(original.amount, locale, original.currency)} at ${formatNumber(original.rate, locale, { maximumFractionDigits: 4 })}`;
}
