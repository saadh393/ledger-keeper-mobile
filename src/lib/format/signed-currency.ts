import type { Language } from '@/lib/i18n/resources';
import { currencySymbol } from '@/lib/format/currency';
import { formatNumber } from '@/lib/format/number';

export type LedgerKind = 'income' | 'expense';

type SignedCurrencyOptions = {
  kind: LedgerKind;
  currency?: string;
  fractionDigits?: number;
};

const signs: Record<LedgerKind, string> = {
  income: '+ ',
  expense: '− ',
};

export function formatSignedCurrency(
  value: number,
  locale: Language,
  { kind, currency = 'BDT', fractionDigits = 0 }: SignedCurrencyOptions,
) {
  const options = { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits };
  const amount = formatNumber(value, locale, options);
  const sign = amount === formatNumber(0, locale, options) ? '' : signs[kind];
  return `${sign}${currencySymbol(currency, locale)}${amount}`;
}
