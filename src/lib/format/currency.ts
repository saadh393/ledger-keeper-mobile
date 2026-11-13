import type { Language } from '@/lib/i18n/resources';
import { ISO_4217_CURRENCIES } from '@/features/currency/data/currencies';
import { resolveLocale } from '@/lib/format/locale';
import { formatNumber } from '@/lib/format/number';

function knownSymbol(currency: string) {
  return ISO_4217_CURRENCIES.find(item => item.code === currency)?.symbol ?? currency;
}

function intlSymbol(currency: string, locale: Language) {
  try {
    const parts = new Intl.NumberFormat(resolveLocale(locale), {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);
    const symbol = parts.find(part => part.type === 'currency')?.value ?? currency;
    return symbol === currency ? knownSymbol(currency) : symbol;
  }
  catch {
    return knownSymbol(currency);
  }
}

export function currencySymbol(currency: string, locale: Language) {
  const symbol = intlSymbol(currency, locale);
  return /\p{L}$/u.test(symbol) ? `${symbol} ` : symbol;
}

export function formatCurrency(value: number, locale: Language, currency = 'BDT') {
  return `${currencySymbol(currency, locale)}${formatNumber(value, locale)}`;
}
