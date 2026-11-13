import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchCreditLedger } from '@/features/credits/api/fetch-credit-ledger';
import { getNextPage } from '@/lib/api/get-next-page';

export const creditLedgerQueryKey = ['credits', 'ledger'] as const;

export function useCreditLedger() {
  return useInfiniteQuery({
    queryKey: creditLedgerQueryKey,
    queryFn: ({ pageParam }) => fetchCreditLedger(pageParam),
    initialPageParam: 1,
    getNextPageParam: getNextPage,
  });
}
