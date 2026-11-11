import { useQuery } from '@tanstack/react-query';
import { fetchLatestConversation } from '@/features/assistant/api/fetch-latest-conversation';
import { booksKeys } from '@/features/books/utils/query-keys';

export function latestConversationQueryKey(bookId: string) {
  return booksKeys.scoped(bookId, 'conversations', 'latest');
}

export function useLatestConversation(bookId: string | null) {
  return useQuery({
    queryKey: latestConversationQueryKey(bookId ?? ''),
    queryFn: () => fetchLatestConversation(bookId!),
    enabled: Boolean(bookId),
  });
}
