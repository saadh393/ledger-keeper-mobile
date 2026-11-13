import type { Language } from '@/lib/i18n/resources';
import { resolveLocale } from '@/lib/format/locale';
import { toLocaleDigits } from '@/lib/format/locale-digits';

export function formatNumber(
  value: number,
  locale: Language,
  options: Intl.NumberFormatOptions = {},
) {
  const formatter = new Intl.NumberFormat(resolveLocale(locale), options);
  const zero = formatter.format(0);
  return toLocaleDigits(formatter.format(Math.abs(value)) === zero ? zero : formatter.format(value), locale);
}
