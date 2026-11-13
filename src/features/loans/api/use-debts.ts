import type { DebtStatusFilter } from '@/features/loans/schemas/debt-schema';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchDebts } from '@/features/loans/api/fetch-debts';
import { debtsKeys } from '@/features/loans/utils/debts-keys';
import { getNextDebtsPage } from '@/features/loans/utils/get-next-debts-page';

export function useDebts(bookId: string | null, status: DebtStatusFilter) {
  return useInfiniteQuery({
    queryKey: debtsKeys.list(bookId ?? '', status),
    queryFn: ({ pageParam }) => fetchDebts(bookId!, status, pageParam),
    initialPageParam: 1,
    getNextPageParam: getNextDebtsPage,
    enabled: Boolean(bookId),
  });
}
