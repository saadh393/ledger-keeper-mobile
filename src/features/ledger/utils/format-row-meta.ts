import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { Language } from '@/lib/i18n/resources';
import { formatMonthDay } from '@/lib/format/date';
import { formatOriginalAmount } from '@/lib/format/original-amount';

export function formatRowMeta({ category, original, dateIso }: Pick<TransactionRow, 'category' | 'original' | 'dateIso'>, locale: Language, withDate = false) {
  return [withDate ? formatMonthDay(dateIso, locale) : '', category, original ? formatOriginalAmount(original, locale) : '']
    .filter(Boolean)
    .join(' · ');
}
