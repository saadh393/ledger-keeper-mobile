import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import { toDayKey } from '@/lib/format/day-key';

export type LedgerListItem
  = | { type: 'day'; key: string; day: string }
    | { type: 'row'; key: string; row: TransactionRow };

export function groupRowsByDay(rows: TransactionRow[]): LedgerListItem[] {
  const items: LedgerListItem[] = [];
  let currentDay = '';
  for (const row of rows) {
    const day = toDayKey(row.dateIso);
    if (day !== currentDay) {
      currentDay = day;
      items.push({ type: 'day', key: `day-${day}`, day });
    }
    items.push({ type: 'row', key: row.id, row });
  }
  return items;
}
