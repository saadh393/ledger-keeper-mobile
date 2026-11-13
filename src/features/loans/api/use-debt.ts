import { useQuery } from '@tanstack/react-query';
import { fetchDebt } from '@/features/loans/api/fetch-debt';
import { debtsKeys } from '@/features/loans/utils/debts-keys';

export function useDebt(bookId: string, debtId: string) {
  return useQuery({
    queryKey: debtsKeys.detail(bookId, debtId),
    queryFn: () => fetchDebt(bookId, debtId),
  });
}
