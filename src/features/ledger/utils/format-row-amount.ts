import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { Language } from '@/lib/i18n/resources';
import { formatSignedCurrency } from '@/lib/format/signed-currency';

export function formatRowAmount({ amount, kind }: Pick<TransactionRow, 'amount' | 'kind'>, locale: Language, currency: string) {
  return formatSignedCurrency(amount, locale, { kind, currency, fractionDigits: Number.isInteger(amount) ? 0 : 2 });
}
