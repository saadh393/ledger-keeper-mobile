import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchBookChats } from '@/features/assistant/api/fetch-book-chats';
import { booksKeys } from '@/features/books/utils/query-keys';

export const BOOK_CHATS_PAGE_SIZE = 20;

export function bookChatsQueryKey(bookId: string) {
  return booksKeys.scoped(bookId, 'conversations', 'list');
}

export function useBookChats(bookId: string | null) {
  return useInfiniteQuery({
    queryKey: bookChatsQueryKey(bookId ?? ''),
    queryFn: ({ pageParam }) => fetchBookChats(bookId!, pageParam, BOOK_CHATS_PAGE_SIZE),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.nextCursor ?? undefined,
    enabled: Boolean(bookId),
  });
}
