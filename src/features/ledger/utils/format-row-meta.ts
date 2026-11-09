import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { Language } from '@/lib/i18n/resources';
import { formatOriginalAmount } from '@/lib/format/original-amount';

export function formatRowMeta({ category, original }: Pick<TransactionRow, 'category' | 'original'>, locale: Language) {
  return [category, original ? formatOriginalAmount(original, locale) : '']
    .filter(Boolean)
    .join(' · ');
}
