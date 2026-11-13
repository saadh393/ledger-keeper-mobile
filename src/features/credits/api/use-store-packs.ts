import { useQuery } from '@tanstack/react-query';
import { fetchStorePacks } from '@/features/credits/api/fetch-store-packs';
import { useUserProfile } from '@/features/currency';

export function useStorePacks() {
  const userId = useUserProfile().data?.id;
  return useQuery({
    queryKey: ['credits', 'store-packs', userId],
    queryFn: () => fetchStorePacks(userId!),
    enabled: Boolean(userId),
    retry: false,
  });
}
