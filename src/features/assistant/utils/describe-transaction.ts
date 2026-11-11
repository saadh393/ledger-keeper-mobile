import type { TFunction } from 'i18next';
import type { ArtifactTransaction } from '@/features/assistant/schemas/transaction-artifact-schemas';
import type { Language } from '@/lib/i18n/resources';
import { formatRowAmount } from '@/features/ledger/utils/format-row-amount';
import { formatMonthDay } from '@/lib/format/date';

export function describeTransaction(row: ArtifactTransaction, { locale, currency }: { locale: Language; currency: string }, t: TFunction): string {
  return [
    row.deleted ? t('assistant.artifacts.deleted') : null,
    t(row.kind === 'income' ? 'ledger.types.income' : 'ledger.types.expense'),
    row.name,
    row.category,
    formatMonthDay(row.dateIso, locale),
    formatRowAmount(row, locale, currency),
  ].filter(Boolean).join(', ');
}
