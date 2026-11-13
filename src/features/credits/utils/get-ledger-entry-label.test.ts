import type { TFunction } from 'i18next';
import type { CreditLedgerEntry } from '@/features/credits/schemas/credit-ledger-schema';
import { getLedgerEntryLabel } from '@/features/credits/utils/get-ledger-entry-label';
import i18n from '@/lib/i18n';

const t = i18n.t.bind(i18n) as TFunction;
const formatCount = (value: number) => String(value);

function entry(overrides: Partial<CreditLedgerEntry>): CreditLedgerEntry {
  return {
    id: '1',
    type: 'reserve',
    amount: 0,
    balanceAfter: 0,
    note: null,
    operation: null,
    purchase: null,
    createdAt: '2026-11-12T10:00:00.000Z',
    ...overrides,
  };
}

function operation(type: 'chat' | 'voice' | 'receipt', chargedCredits: number) {
  return { id: 'op', type, status: 'captured' as const, chargedCredits };
}

describe('getLedgerEntryLabel', () => {
  it('labels operations with charged credits', () => {
    expect(getLedgerEntryLabel(entry({ operation: operation('voice', 4) }), t, formatCount)).toBe('Voice note · 4 credits');
    expect(getLedgerEntryLabel(entry({ operation: operation('chat', 1) }), t, formatCount)).toBe('Chat message · 1 credit');
    expect(getLedgerEntryLabel(entry({ operation: operation('receipt', 0) }), t, formatCount)).toBe('Receipt scan · 0 credits');
  });

  it('labels purchases with the plan name', () => {
    expect(getLedgerEntryLabel(entry({ type: 'purchase', purchase: { id: 'p', planName: 'Starter' } }), t, formatCount)).toBe('Bought Starter');
  });

  it('labels trial, referral, and admin adjustment entries', () => {
    expect(getLedgerEntryLabel(entry({ type: 'trial' }), t, formatCount)).toBe('Free trial credits');
    expect(getLedgerEntryLabel(entry({ type: 'referral' }), t, formatCount)).toBe('Referral bonus');
    expect(getLedgerEntryLabel(entry({ type: 'admin_adjustment' }), t, formatCount)).toBe('Adjustment');
  });
});
