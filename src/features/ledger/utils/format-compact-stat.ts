import type { TableStat } from '@/features/ledger/schemas/book-table-schema';
import type { FormattedStat } from '@/features/ledger/utils/format-stat';
import type { Language } from '@/lib/i18n/resources';
import { netPositionLabel } from '@/features/ledger/utils/stat-labels';
import { formatCompactCurrency } from '@/lib/format/compact-currency';

export function formatCompactStat(stat: TableStat, locale: Language, currency: string): FormattedStat {
  const value = formatCompactCurrency(stat.value, locale, currency);
  if (stat.label !== netPositionLabel || Math.round(Math.abs(stat.value)) === 0)
    return { value };
  if (stat.value > 0)
    return { value: `+${value}`, valueClassName: 'text-forest-500' };
  return { value, valueClassName: 'text-clay-500' };
}
