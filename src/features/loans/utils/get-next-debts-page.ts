import type { DebtPage } from '@/features/loans/schemas/debt-schema';

export function getNextDebtsPage(lastPage: DebtPage): number | undefined {
  return lastPage.page * lastPage.pageSize < lastPage.total ? lastPage.page + 1 : undefined;
}
