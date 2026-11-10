import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { TransactionFormValues } from '@/features/ledger/schemas/transaction-form-schema';
import { getTransactionChanges, hasFormChanges } from '@/features/ledger/utils/get-transaction-changes';

const mockRow: TransactionRow = {
  id: 'tx-1',
  kind: 'expense',
  name: 'Lunch',
  subtitle: 'Food',
  category: 'Food',
  dateIso: '2026-11-05T12:00:00.000Z',
  amount: 250,
  note: 'Burger',
  original: null,
  merchant: null,
  items: [],
};

describe('getTransactionChanges', () => {
  const baseValues: TransactionFormValues = {
    type: 'expense',
    title: 'Lunch',
    category: 'Food',
    amount: '250',
    date: '2026-11-05T12:00:00.000Z',
    note: 'Burger',
  };

  it('returns empty object when nothing changed', () => {
    const changes = getTransactionChanges(mockRow, baseValues);
    expect(changes).toEqual({});
  });

  it('detects type change', () => {
    const changes = getTransactionChanges(mockRow, { ...baseValues, type: 'income' });
    expect(changes).toEqual({ kind: 'income' });
  });

  it('detects title change with trimming', () => {
    const changes = getTransactionChanges(mockRow, { ...baseValues, title: '  Dinner  ' });
    expect(changes).toEqual({ title: 'Dinner' });
  });

  it('detects category change', () => {
    const changes = getTransactionChanges(mockRow, { ...baseValues, category: 'Entertainment' });
    expect(changes).toEqual({ category: 'Entertainment' });
  });

  it('detects amount change with Latin digits', () => {
    const changes = getTransactionChanges(mockRow, { ...baseValues, amount: '300' });
    expect(changes).toEqual({ amount: 300 });
  });

  it('detects amount change with Bangla digits', () => {
    const changes = getTransactionChanges(mockRow, { ...baseValues, amount: '৩০০.৫০' });
    expect(changes).toEqual({ amount: 300.5 });
  });

  it('does not include amount if unchanged numerically', () => {
    const changes = getTransactionChanges(mockRow, { ...baseValues, amount: '250.00' });
    expect(changes).toEqual({});
  });

  it('detects date change across days', () => {
    const changes = getTransactionChanges(mockRow, { ...baseValues, date: '2026-11-06T12:00:00.000Z' });
    expect(changes.dateIso).toBeDefined();
    expect(new Date(changes.dateIso!).toISOString()).toBe('2026-11-06T12:00:00.000Z');
  });

  it('does not include date if day is the same in Asia/Dhaka', () => {
    const changes = getTransactionChanges(mockRow, { ...baseValues, date: '2026-11-05T14:00:00.000Z' });
    expect(changes).toEqual({});
  });

  it('detects note change', () => {
    const changes = getTransactionChanges(mockRow, { ...baseValues, note: 'Pizza party' });
    expect(changes).toEqual({ note: 'Pizza party' });
  });

  it('detects note cleared', () => {
    const changes = getTransactionChanges(mockRow, { ...baseValues, note: '' });
    expect(changes).toEqual({ note: null });
  });

  it('detects multiple changes at once', () => {
    const changes = getTransactionChanges(mockRow, {
      ...baseValues,
      type: 'income',
      title: 'Freelance',
      amount: '5000',
    });
    expect(changes).toEqual({
      kind: 'income',
      title: 'Freelance',
      amount: 5000,
    });
  });
});

describe('hasFormChanges', () => {
  it('returns false for fresh add form with default values', () => {
    const today = new Date().toISOString();
    const defaults: TransactionFormValues = {
      type: 'expense',
      title: '',
      category: '',
      amount: '',
      date: today,
      note: '',
    };
    expect(hasFormChanges(defaults, undefined, today)).toBe(false);
  });

  it('returns true when title is typed in add form', () => {
    const today = new Date().toISOString();
    const values: TransactionFormValues = {
      type: 'expense',
      title: 'Groceries',
      category: '',
      amount: '',
      date: today,
      note: '',
    };
    expect(hasFormChanges(values, undefined, today)).toBe(true);
  });

  it('returns false for edit form when values match row', () => {
    const values: TransactionFormValues = {
      type: 'expense',
      title: 'Lunch',
      category: 'Food',
      amount: '250',
      date: '2026-11-05T12:00:00.000Z',
      note: 'Burger',
    };
    expect(hasFormChanges(values, mockRow)).toBe(false);
  });

  it('returns true for edit form when values differ from row', () => {
    const values: TransactionFormValues = {
      type: 'expense',
      title: 'Lunch',
      category: 'Food',
      amount: '350',
      date: '2026-11-05T12:00:00.000Z',
      note: 'Burger',
    };
    expect(hasFormChanges(values, mockRow)).toBe(true);
  });
});
