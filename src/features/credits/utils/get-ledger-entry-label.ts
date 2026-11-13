import type { TFunction } from 'i18next';
import type { CreditLedgerEntry } from '@/features/credits/schemas/credit-ledger-schema';

export function getLedgerEntryLabel(entry: CreditLedgerEntry, t: TFunction, formatCount: (value: number) => string): string {
  if (entry.operation) {
    return t(`credits.history.operation.${entry.operation.type}`, {
      count: entry.operation.chargedCredits,
      credits: formatCount(entry.operation.chargedCredits),
    });
  }
  if (entry.type === 'purchase')
    return t('credits.history.purchase', { planName: entry.purchase?.planName ?? '' });
  return t(`credits.history.type.${entry.type}`);
}
