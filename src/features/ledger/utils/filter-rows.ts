import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';

export type LedgerKindFilter = 'all' | TransactionRow['kind'];

export type LedgerSort = 'newest' | 'oldest' | 'highest' | 'lowest';

export type LedgerFilters = {
  query: string;
  kind: LedgerKindFilter;
  sort: LedgerSort;
};

type RowComparator = (a: TransactionRow, b: TransactionRow) => number;

const newestFirst: RowComparator = (a, b) => Date.parse(b.dateIso) - Date.parse(a.dateIso);

const comparators: Record<LedgerSort, RowComparator> = {
  newest: newestFirst,
  oldest: (a, b) => Date.parse(a.dateIso) - Date.parse(b.dateIso),
  highest: (a, b) => b.amount - a.amount || newestFirst(a, b),
  lowest: (a, b) => a.amount - b.amount || newestFirst(a, b),
};

function normalize(text: string) {
  return text.normalize('NFC').toLocaleLowerCase();
}

function searchText(row: TransactionRow) {
  return normalize([row.name, row.merchant, row.category, row.note, ...row.items.map(item => item.title)]
    .filter(Boolean)
    .join('\n'));
}

export function isAmountSort(sort: LedgerSort) {
  return sort === 'highest' || sort === 'lowest';
}

export function filterRows(rows: TransactionRow[], { query, kind, sort }: LedgerFilters) {
  const needle = normalize(query.trim());
  return rows
    .filter(row => (kind === 'all' || row.kind === kind) && (!needle || searchText(row).includes(needle)))
    .sort(comparators[sort]);
}
