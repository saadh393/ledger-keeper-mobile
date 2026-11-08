import type { Book } from '@/features/books/schemas/book-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBook } from '@/features/books/api/books-api';
import { useRefetchBooks } from '@/features/books/api/use-refetch-books';
import { booksQueryKey } from '@/features/books/utils/query-keys';
import { toApiError } from '@/lib/api/errors';

export function useCreateBook() {
  const queryClient = useQueryClient();
  const refetchBooks = useRefetchBooks();

  return useMutation({
    mutationFn: createBook,
    onSuccess: (book) => {
      queryClient.setQueryData<Book[]>(booksQueryKey, books => [...(books ?? []), book]);
      refetchBooks();
    },
    onError: (error) => {
      if (toApiError(error).kind === 'conflict') {
        refetchBooks();
      }
    },
  });
}
