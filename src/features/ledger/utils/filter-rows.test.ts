import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { LedgerFilters } from '@/features/ledger/utils/filter-rows';
import { filterRows, isAmountSort } from '@/features/ledger/utils/filter-rows';

function row(overrides: Partial<TransactionRow> & Pick<TransactionRow, 'id'>): TransactionRow {
  return {
    kind: 'expense',
    name: overrides.id,
    subtitle: '',
    category: '',
    dateIso: '2026-11-05T06:00:00.000Z',
    amount: 100,
    note: null,
    original: null,
    merchant: null,
    items: [],
    ...overrides,
  };
}

function item(title: string) {
  return { id: title, type: 'expense', title, category: null, amount: 10, quantity: null, note: null };
}

const all: LedgerFilters = { query: '', kind: 'all', sort: 'newest' };

function ids(rows: TransactionRow[], filters: Partial<LedgerFilters>) {
  return filterRows(rows, { ...all, ...filters }).map(result => result.id);
}

describe('filterRows', () => {
  const rows = [
    row({ id: 'lunch', name: 'Lunch', category: 'Food', dateIso: '2026-11-03T06:00:00.000Z', amount: 450 }),
    row({ id: 'salary', name: 'Salary', kind: 'income', category: 'Job', merchant: 'Acme Ltd', dateIso: '2026-11-01T06:00:00.000Z', amount: 50000 }),
    row({ id: 'groceries', name: 'Groceries', category: 'Shopping', note: 'Weekly run', items: [item('Rice'), item('Lentils')], dateIso: '2026-11-04T06:00:00.000Z', amount: 1200 }),
    row({ id: 'refund', name: 'Refund', kind: 'income', category: 'Other', dateIso: '2026-11-02T06:00:00.000Z', amount: 300 }),
  ];

  it('returns every row newest first with no query and All', () => {
    expect(ids(rows, {})).toEqual(['groceries', 'lunch', 'refund', 'salary']);
  });

  it.each([
    ['title', 'lunch', ['lunch']],
    ['merchant', 'acme', ['salary']],
    ['category', 'shopping', ['groceries']],
    ['note', 'weekly', ['groceries']],
    ['receipt item title', 'lentil', ['groceries']],
  ])('matches the %s', (_field, query, expected) => {
    expect(ids(rows, { query })).toEqual(expected);
  });

  it('ignores case', () => {
    expect(ids(rows, { query: 'LuNcH' })).toEqual(['lunch']);
  });

  it('ignores leading and trailing spaces', () => {
    expect(ids(rows, { query: '  acme  ' })).toEqual(['salary']);
  });

  it('treats a query of only spaces as no query', () => {
    expect(ids(rows, { query: '   ' })).toHaveLength(4);
  });

  it('does not match the subtitle or amount', () => {
    expect(ids([row({ id: 'a', subtitle: 'Hidden', amount: 777 })], { query: 'hidden' })).toEqual([]);
    expect(ids([row({ id: 'a', subtitle: 'Hidden', amount: 777 })], { query: '777' })).toEqual([]);
  });

  it('matches Bangla text in any field', () => {
    const bangla = [
      row({ id: 'bazar', name: 'বাজার', category: 'খাবার' }),
      row({ id: 'rent', name: 'ভাড়া', note: 'বাসা' }),
      row({ id: 'receipt', name: 'Receipt', items: [item('চাল')] }),
    ];
    expect(ids(bangla, { query: 'খাবার' })).toEqual(['bazar']);
    expect(ids(bangla, { query: ' বাসা ' })).toEqual(['rent']);
    expect(ids(bangla, { query: 'চাল' })).toEqual(['receipt']);
  });

  it('matches Bangla typed with a precomposed letter against the decomposed form', () => {
    const precomposed = 'য়';
    const decomposed = 'য়';
    expect(ids([row({ id: 'a', name: `আ${decomposed}` })], { query: `আ${precomposed}` })).toEqual(['a']);
    expect(ids([row({ id: 'a', name: `আ${precomposed}` })], { query: `আ${decomposed}` })).toEqual(['a']);
  });

  it('shows only income rows for Income and only expense rows for Expense', () => {
    expect(ids(rows, { kind: 'income' })).toEqual(['refund', 'salary']);
    expect(ids(rows, { kind: 'expense' })).toEqual(['groceries', 'lunch']);
  });

  it('combines the kind filter with search', () => {
    const mixed = [
      row({ id: 'food-out', name: 'Food', kind: 'expense' }),
      row({ id: 'food-in', name: 'Food refund', kind: 'income' }),
      row({ id: 'bus', name: 'Bus', kind: 'expense' }),
    ];
    expect(ids(mixed, { query: 'food', kind: 'income' })).toEqual(['food-in']);
    expect(ids(mixed, { query: 'food', kind: 'expense' })).toEqual(['food-out']);
    expect(ids(mixed, { query: 'bus', kind: 'income' })).toEqual([]);
  });

  it.each([
    ['newest', ['groceries', 'lunch', 'refund', 'salary']],
    ['oldest', ['salary', 'refund', 'lunch', 'groceries']],
    ['highest', ['salary', 'groceries', 'lunch', 'refund']],
    ['lowest', ['refund', 'lunch', 'groceries', 'salary']],
  ] as const)('sorts %s', (sort, expected) => {
    expect(ids(rows, { sort })).toEqual(expected);
  });

  it('keeps server order for rows at the same instant in date sorts', () => {
    const same = [row({ id: 'first' }), row({ id: 'second' })];
    expect(ids(same, { sort: 'newest' })).toEqual(['first', 'second']);
    expect(ids(same, { sort: 'oldest' })).toEqual(['first', 'second']);
  });

  it('breaks amount ties newest first, then by server order', () => {
    const ties = [
      row({ id: 'old', amount: 500, dateIso: '2026-11-01T06:00:00.000Z' }),
      row({ id: 'new', amount: 500, dateIso: '2026-11-09T06:00:00.000Z' }),
      row({ id: 'same-a', amount: 500, dateIso: '2026-11-05T06:00:00.000Z' }),
      row({ id: 'same-b', amount: 500, dateIso: '2026-11-05T06:00:00.000Z' }),
    ];
    expect(ids(ties, { sort: 'highest' })).toEqual(['new', 'same-a', 'same-b', 'old']);
    expect(ids(ties, { sort: 'lowest' })).toEqual(['new', 'same-a', 'same-b', 'old']);
  });

  it('returns nothing for no rows', () => {
    expect(filterRows([], { ...all, query: 'x' })).toEqual([]);
  });

  it('does not mutate the input', () => {
    const input = [row({ id: 'a', dateIso: '2026-11-01T06:00:00.000Z' }), row({ id: 'b', dateIso: '2026-11-03T06:00:00.000Z' })];
    filterRows(input, all);
    expect(input.map(result => result.id)).toEqual(['a', 'b']);
  });
});

describe('isAmountSort', () => {
  it.each([
    ['newest', false],
    ['oldest', false],
    ['highest', true],
    ['lowest', true],
  ] as const)('%s is an amount sort: %s', (sort, expected) => {
    expect(isAmountSort(sort)).toBe(expected);
  });
});
