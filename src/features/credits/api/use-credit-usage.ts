import { useQuery } from '@tanstack/react-query';
import { fetchCreditUsage } from '@/features/credits/api/fetch-credit-usage';

export const creditUsageQueryKey = ['credits', 'usage'] as const;

export function useCreditUsage() {
  return useQuery({
    queryKey: creditUsageQueryKey,
    queryFn: fetchCreditUsage,
  });
}
