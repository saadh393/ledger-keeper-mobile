import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import { toDayKey } from '@/lib/format/day-key';

export type LedgerListItem
  = | { type: 'day'; key: string; day: string }
    | { type: 'row'; key: string; row: TransactionRow };

export function groupRowsByDay(rows: TransactionRow[]): LedgerListItem[] {
  const sorted = [...rows].sort((a, b) => Date.parse(b.dateIso) - Date.parse(a.dateIso));
  const items: LedgerListItem[] = [];
  let currentDay = '';
  for (const row of sorted) {
    const day = toDayKey(row.dateIso);
    if (day !== currentDay) {
      currentDay = day;
      items.push({ type: 'day', key: `day-${day}`, day });
    }
    items.push({ type: 'row', key: row.id, row });
  }
  return items;
}
