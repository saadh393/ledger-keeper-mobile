import type { UseQueryOptions } from '@tanstack/react-query';
import type { Book } from '@/features/books/schemas/book-schema';
import type { UseBooksResult } from '@/features/books/types';
import { useQuery } from '@tanstack/react-query';
import { useAuthStatus } from '@/features/auth';
import { fetchBooks } from '@/features/books/api/books-api';
import { booksQueryKey } from '@/features/books/utils/query-keys';

export function useBooks(
  options?: Partial<UseQueryOptions<Book[], Error>>,
): UseBooksResult {
  const authStatus = useAuthStatus();

  const query = useQuery({
    queryKey: booksQueryKey,
    queryFn: fetchBooks,
    enabled: authStatus === 'signedIn',
    staleTime: 1000 * 60 * 5,
    ...options,
  });

  return {
    ...query,
    books: query.data ?? [],
  };
}
