import type { Language } from '@/lib/i18n/resources';
import { resolveLocale } from '@/lib/format/locale';
import { formatNumber } from '@/lib/format/number';

export function currencySymbol(currency: string, locale: Language) {
  try {
    const parts = new Intl.NumberFormat(resolveLocale(locale), {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);
    const symbol = parts.find(part => part.type === 'currency')?.value ?? currency;
    return /\p{L}$/u.test(symbol) ? `${symbol} ` : symbol;
  }
  catch {
    return `${currency} `;
  }
}

export function formatCurrency(value: number, locale: Language, currency = 'BDT') {
  return `${currencySymbol(currency, locale)}${formatNumber(value, locale)}`;
}
