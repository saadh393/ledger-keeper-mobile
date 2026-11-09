import { bookTableSchema } from '@/features/ledger/schemas/book-table-schema';

const row = {
  id: 'tx-1',
  kind: 'expense',
  name: 'Lunch',
  subtitle: 'Food',
  category: 'Food',
  dateIso: '2026-11-03T06:00:00.000Z',
  amount: 450,
  note: null,
  original: null,
  merchant: null,
  items: [],
};

describe('bookTableSchema', () => {
  it('parses stats and rows', () => {
    const table = {
      stats: [
        { label: 'Income', value: 1000, delta: '', kind: 'income' },
        { label: 'Net position', value: 550, delta: '' },
      ],
      rows: [row, { ...row, id: 'tx-2', account: 'bKash', original: { amount: 5, currency: 'USD', rate: 120 } }],
    };
    expect(bookTableSchema.parse(table)).toEqual(table);
  });

  it('rejects a non-numeric stat value', () => {
    expect(bookTableSchema.safeParse({ stats: [{ label: 'Income', value: 'NaN', delta: '' }], rows: [] }).success).toBe(false);
  });

  it('rejects a response without stats', () => {
    expect(bookTableSchema.safeParse({ rows: [] }).success).toBe(false);
  });
});
