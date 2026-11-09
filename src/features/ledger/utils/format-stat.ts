import type { TableStat } from '@/features/ledger/schemas/book-table-schema';
import type { Language } from '@/lib/i18n/resources';
import { netPositionLabel } from '@/features/ledger/utils/stat-labels';
import { formatCurrency } from '@/lib/format/currency';
import { formatSignedCurrency } from '@/lib/format/signed-currency';

export type FormattedStat = {
  value: string;
  valueClassName?: string;
};

export function formatStat(stat: TableStat, locale: Language, currency: string): FormattedStat {
  if (stat.label !== netPositionLabel)
    return { value: formatCurrency(stat.value, locale, currency) };
  const kind = stat.value > 0 ? 'income' : 'expense';
  const options = { kind, currency, fractionDigits: Number.isInteger(stat.value) ? 0 : 2 } as const;
  const value = formatSignedCurrency(Math.abs(stat.value), locale, options);
  if (value === formatSignedCurrency(0, locale, options))
    return { value };
  return { value, valueClassName: kind === 'income' ? 'text-forest-500' : 'text-clay-500' };
}
