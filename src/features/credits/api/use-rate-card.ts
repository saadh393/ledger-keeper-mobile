import { useQuery } from '@tanstack/react-query';
import { fetchRateCard } from '@/features/credits/api/fetch-rate-card';

export const rateCardQueryKey = ['credits', 'rates'] as const;

export function useRateCard() {
  return useQuery({
    queryKey: rateCardQueryKey,
    queryFn: fetchRateCard,
    staleTime: 1000 * 60 * 5,
  });
}
