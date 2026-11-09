import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { Language } from '@/lib/i18n/resources';
import { formatRowAmount } from '@/features/ledger/utils/format-row-amount';
import { formatDate } from '@/lib/format/date';

export function formatCopyText(row: Pick<TransactionRow, 'name' | 'amount' | 'kind' | 'dateIso'>, locale: Language, currency: string) {
  const amount = formatRowAmount(row, locale, currency).replace(/^([+−]) /, '$1');
  return [row.name, amount, formatDate(row.dateIso, locale)].join(' · ');
}
