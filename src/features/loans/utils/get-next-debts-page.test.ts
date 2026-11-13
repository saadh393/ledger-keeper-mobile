import { getNextDebtsPage } from '@/features/loans/utils/get-next-debts-page';

const page = (n: number, total: number) => ({ items: [], page: n, pageSize: 20, total, totals: { lent: 0, borrowed: 0 } });

describe('getNextDebtsPage', () => {
  it('asks for the next page until total is reached', () => {
    expect(getNextDebtsPage(page(1, 45))).toBe(2);
    expect(getNextDebtsPage(page(2, 45))).toBe(3);
    expect(getNextDebtsPage(page(3, 45))).toBeUndefined();
    expect(getNextDebtsPage(page(1, 20))).toBeUndefined();
  });
});
