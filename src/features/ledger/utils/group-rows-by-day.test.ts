import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import { groupRowsByDay } from '@/features/ledger/utils/group-rows-by-day';

function row(id: string, dateIso: string): TransactionRow {
  return {
    id,
    kind: 'expense',
    name: id,
    subtitle: 'Food',
    category: 'Food',
    dateIso,
    amount: 100,
    note: null,
    original: null,
    merchant: null,
    items: [],
  };
}

function shape(rows: TransactionRow[]) {
  return groupRowsByDay(rows).map(item => (item.type === 'day' ? item.day : item.row.id));
}

describe('groupRowsByDay', () => {
  it('returns nothing for no rows', () => {
    expect(groupRowsByDay([])).toEqual([]);
  });

  it('groups rows under their day, newest day first and newest row first within a day', () => {
    expect(shape([
      row('a', '2026-11-01T04:00:00.000Z'),
      row('b', '2026-11-03T03:00:00.000Z'),
      row('c', '2026-11-01T10:00:00.000Z'),
      row('d', '2026-11-03T09:00:00.000Z'),
      row('e', '2026-11-02T08:00:00.000Z'),
    ])).toEqual(['2026-11-03', 'd', 'b', '2026-11-02', 'e', '2026-11-01', 'c', 'a']);
  });

  it('puts a transaction at 23:30 UTC on the next Asia/Dhaka day', () => {
    expect(shape([
      row('late', '2026-11-02T23:30:00.000Z'),
      row('morning', '2026-11-02T03:00:00.000Z'),
    ])).toEqual(['2026-11-03', 'late', '2026-11-02', 'morning']);
  });

  it('splits rows either side of Dhaka midnight (18:00 UTC)', () => {
    expect(shape([
      row('before', '2026-11-02T17:59:59.000Z'),
      row('after', '2026-11-02T18:00:00.000Z'),
    ])).toEqual(['2026-11-03', 'after', '2026-11-02', 'before']);
  });

  it('keeps server order for rows at the same instant and gives each item a unique key', () => {
    const items = groupRowsByDay([
      row('first', '2026-11-02T08:00:00.000Z'),
      row('second', '2026-11-02T08:00:00.000Z'),
    ]);
    expect(items.map(item => item.key)).toEqual(['day-2026-11-02', 'first', 'second']);
  });

  it('does not mutate the input', () => {
    const rows = [row('a', '2026-11-01T04:00:00.000Z'), row('b', '2026-11-03T04:00:00.000Z')];
    groupRowsByDay(rows);
    expect(rows.map(item => item.id)).toEqual(['a', 'b']);
  });
});
