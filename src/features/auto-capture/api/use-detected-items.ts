import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchDetectedItems } from '@/features/auto-capture/api/fetch-detected-items';
import { detectedKeys } from '@/features/auto-capture/utils/detected-keys';
import { getNextPage } from '@/lib/api/get-next-page';

export function useDetectedItems(bookId: string) {
  return useInfiniteQuery({
    queryKey: detectedKeys.list(bookId),
    queryFn: ({ pageParam }) => fetchDetectedItems(bookId, pageParam),
    initialPageParam: 1,
    getNextPageParam: getNextPage,
  });
}
