import type { CreditLedgerEntry } from '@/features/credits/schemas/credit-ledger-schema';
import { collapseLedgerEntries } from '@/features/credits/utils/collapse-ledger-entries';

function entry(id: string, type: CreditLedgerEntry['type'], operationId?: string): CreditLedgerEntry {
  return {
    id,
    type,
    amount: type === 'release' ? 2 : -5,
    balanceAfter: 50,
    note: null,
    operation: operationId ? { id: operationId, type: 'voice', status: 'captured', chargedCredits: 3 } : null,
    purchase: null,
    createdAt: '2026-11-12T10:00:00.000Z',
  };
}

describe('collapseLedgerEntries', () => {
  it('shows a reserve and release pair as one line', () => {
    const result = collapseLedgerEntries([entry('2', 'release', 'op1'), entry('1', 'reserve', 'op1')]);
    expect(result.map(item => item.id)).toEqual(['2']);
  });

  it('keeps entries without an operation', () => {
    const result = collapseLedgerEntries([entry('3', 'purchase'), entry('2', 'trial'), entry('1', 'reserve', 'op1')]);
    expect(result.map(item => item.id)).toEqual(['3', '2', '1']);
  });

  it('keeps separate operations apart', () => {
    const result = collapseLedgerEntries([entry('2', 'reserve', 'op2'), entry('1', 'reserve', 'op1')]);
    expect(result.map(item => item.id)).toEqual(['2', '1']);
  });
});
