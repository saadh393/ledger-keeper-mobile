import type { TableStat } from '@/features/ledger/schemas/book-table-schema';
import type { TxKeyPath } from '@/lib/i18n/utils';

export const netPositionLabel = 'Net position';

export const averageLabel = 'Avg / tx';

const statLabelKeys: Record<string, TxKeyPath> = {
  Income: 'ledger.stats.income',
  Expense: 'ledger.stats.expense',
  [netPositionLabel]: 'ledger.stats.netPosition',
  [averageLabel]: 'ledger.stats.averagePerTransaction',
};

const statShortLabelKeys: Record<string, TxKeyPath> = {
  Income: 'ledger.stats.short.income',
  Expense: 'ledger.stats.short.expense',
  [netPositionLabel]: 'ledger.stats.short.net',
  [averageLabel]: 'ledger.stats.short.average',
};

export const placeholderStats: TableStat[] = [
  { label: 'Income', value: 0, delta: '', kind: 'income' },
  { label: 'Expense', value: 0, delta: '', kind: 'expense' },
  { label: netPositionLabel, value: 0, delta: '' },
  { label: averageLabel, value: 0, delta: '' },
];

export function getStatLabelKey(label: string): TxKeyPath | undefined {
  return statLabelKeys[label];
}

export function getStatShortLabelKey(label: string): TxKeyPath | undefined {
  return statShortLabelKeys[label];
}
