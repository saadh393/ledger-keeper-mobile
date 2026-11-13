import type { CreditLedgerEntry } from '@/features/credits/schemas/credit-ledger-schema';

export function collapseLedgerEntries(entries: CreditLedgerEntry[]): CreditLedgerEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (!entry.operation)
      return true;
    if (seen.has(entry.operation.id))
      return false;
    seen.add(entry.operation.id);
    return true;
  });
}
