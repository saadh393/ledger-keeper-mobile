import type { Language } from '@/lib/i18n/resources';
import { currencySymbol } from '@/lib/format/currency';
import { formatNumber } from '@/lib/format/number';

type CompactUnit = {
  factor: number;
  label: Record<Language, string>;
};

const lakhCrore: CompactUnit[] = [
  { factor: 1e5, label: { en: ' L', bn: ' লাখ' } },
  { factor: 1e7, label: { en: ' Cr', bn: ' কোটি' } },
];

const thousands: CompactUnit[] = [
  { factor: 1e3, label: { en: 'K', bn: 'K' } },
  { factor: 1e6, label: { en: 'M', bn: 'M' } },
  { factor: 1e9, label: { en: 'B', bn: 'B' } },
];

const compactFrom = 1e5;

function roundToThreeDigits(value: number) {
  const decimals = Math.min(2, Math.max(0, 2 - Math.floor(Math.log10(value))));
  const scale = 10 ** decimals;
  return Math.round(value * scale) / scale;
}

function formatMagnitude(amount: number, locale: Language, currency: string) {
  if (amount < compactFrom)
    return formatNumber(amount, locale);
  const units = currency === 'BDT' ? lakhCrore : thousands;
  let index = units.findLastIndex(unit => amount >= unit.factor);
  let scaled = roundToThreeDigits(amount / units[index]!.factor);
  const next = units[index + 1];
  if (next && scaled * units[index]!.factor >= next.factor) {
    index += 1;
    scaled = roundToThreeDigits(amount / next.factor);
  }
  return `${formatNumber(scaled, locale, { maximumFractionDigits: 2 })}${units[index]!.label[locale]}`;
}

export function formatCompactCurrency(value: number, locale: Language, currency = 'BDT') {
  const amount = Math.round(Math.abs(value));
  const sign = value < 0 && amount > 0 ? '−' : '';
  return `${sign}${currencySymbol(currency, locale)}${formatMagnitude(amount, locale, currency)}`;
}
