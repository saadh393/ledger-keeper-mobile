import { getStatLabelKey, placeholderStats } from '@/features/ledger/utils/stat-labels';

describe('getStatLabelKey', () => {
  it.each([
    ['Income', 'ledger.stats.income'],
    ['Expense', 'ledger.stats.expense'],
    ['Net position', 'ledger.stats.netPosition'],
    ['Avg / tx', 'ledger.stats.averagePerTransaction'],
  ])('maps %p to %p', (label, key) => {
    expect(getStatLabelKey(label)).toBe(key);
  });

  it('returns undefined for an unknown label', () => {
    expect(getStatLabelKey('Savings rate')).toBeUndefined();
  });

  it('has a placeholder for each of the four server stats', () => {
    expect(placeholderStats.map(stat => stat.label)).toEqual(['Income', 'Expense', 'Net position', 'Avg / tx']);
  });
});
