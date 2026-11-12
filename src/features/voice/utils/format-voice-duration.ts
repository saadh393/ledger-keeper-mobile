import type { Language } from '@/lib/i18n/resources';
import { formatNumber } from '@/lib/format/number';

export function formatVoiceDuration(seconds: number, locale: Language) {
  const whole = Math.floor(seconds);
  return `${formatNumber(Math.floor(whole / 60), locale)}:${formatNumber(whole % 60, locale, { minimumIntegerDigits: 2 })}`;
}
