import { useQuery } from '@tanstack/react-query';
import { creditBalanceQueryKey } from '@/features/credits/api/credit-balance-query-key';
import { fetchCreditBalance } from '@/features/credits/api/fetch-credit-balance';

export function useCreditBalance() {
  return useQuery({
    queryKey: creditBalanceQueryKey,
    queryFn: fetchCreditBalance,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
