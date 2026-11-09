import type { TableStat } from '@/features/ledger/schemas/book-table-schema';
import type { TxKeyPath } from '@/lib/i18n/utils';

export const netPositionLabel = 'Net position';

const statLabelKeys: Record<string, TxKeyPath> = {
  'Income': 'ledger.stats.income',
  'Expense': 'ledger.stats.expense',
  [netPositionLabel]: 'ledger.stats.netPosition',
  'Avg / tx': 'ledger.stats.averagePerTransaction',
};

export const placeholderStats: TableStat[] = [
  { label: 'Income', value: 0, delta: '', kind: 'income' },
  { label: 'Expense', value: 0, delta: '', kind: 'expense' },
  { label: netPositionLabel, value: 0, delta: '' },
  { label: 'Avg / tx', value: 0, delta: '' },
];

export function getStatLabelKey(label: string): TxKeyPath | undefined {
  return statLabelKeys[label];
}
