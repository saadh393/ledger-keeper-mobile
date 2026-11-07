import type { Language } from '@/lib/i18n/resources';
import { resolveLocale } from '@/lib/format/locale';

export function formatNumber(
  value: number,
  locale: Language,
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat(resolveLocale(locale), options).format(Object.is(value, -0) ? 0 : value);
}
