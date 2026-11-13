import type { Debt } from '@/features/loans/schemas/debt-schema';
import { getDebtChanges } from '@/features/loans/utils/get-debt-changes';

const debt: Debt = {
  id: 'd1',
  direction: 'lent',
  counterparty: 'Rahim',
  amount: 1000,
  repaid: 200,
  outstanding: 800,
  currency: 'BDT',
  note: 'Rent',
  dateIso: '2026-11-01T06:00:00.000Z',
  dueDateIso: '2026-12-01T06:00:00.000Z',
  status: 'open',
};

const values = { direction: 'lent' as const, counterparty: 'Rahim', amount: '1000', date: debt.dateIso, dueDate: debt.dueDateIso!, note: 'Rent' };

describe('getDebtChanges', () => {
  it('sends nothing when nothing changed', () => {
    expect(getDebtChanges(debt, values)).toEqual({});
  });

  it('sends only the changed fields', () => {
    expect(getDebtChanges(debt, { ...values, counterparty: ' Karim ', amount: '১২০০' })).toEqual({ counterparty: 'Karim', amount: 1200 });
  });

  it('clears the due date and note with null', () => {
    expect(getDebtChanges(debt, { ...values, dueDate: '', note: '  ' })).toEqual({ dueDateIso: null, note: null });
  });

  it('sends a new date only when the day changes', () => {
    expect(getDebtChanges(debt, { ...values, date: '2026-11-01T10:00:00.000Z' })).toEqual({});
    expect(getDebtChanges(debt, { ...values, date: '2026-11-03T06:00:00.000Z' })).toEqual({ dateIso: '2026-11-03T06:00:00.000Z' });
  });
});
