import { useQuery } from '@tanstack/react-query';
import { fetchDetectedItems } from '@/features/auto-capture/api/fetch-detected-items';
import { detectedKeys } from '@/features/auto-capture/utils/detected-keys';

export function useDetectedCount(bookId: string | null, enabled = true) {
  return useQuery({
    queryKey: detectedKeys.count(bookId ?? ''),
    queryFn: async () => (await fetchDetectedItems(bookId!, 1, 1)).total,
    enabled: Boolean(bookId) && enabled,
  });
}
