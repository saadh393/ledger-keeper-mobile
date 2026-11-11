import type { Language } from '@/lib/i18n/resources';
import { formatNumber } from '@/lib/format/number';

export function formatDelta(delta: number, locale: Language): string | null {
  if (!delta)
    return null;
  return `${delta > 0 ? '+' : '−'}${formatNumber(Math.abs(delta), locale, { maximumFractionDigits: 1 })}%`;
}
