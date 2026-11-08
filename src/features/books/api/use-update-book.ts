import type { BookFormValues } from '@/features/books/schemas/book-form-schema';
import type { Book } from '@/features/books/schemas/book-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBook } from '@/features/books/api/books-api';
import { useRefetchBooks } from '@/features/books/api/use-refetch-books';
import { booksQueryKey } from '@/features/books/utils/query-keys';
import { toApiError } from '@/lib/api/errors';

export type UpdateBookVariables = {
  bookId: string;
  patch: Partial<BookFormValues>;
};

export function useUpdateBook() {
  const queryClient = useQueryClient();
  const refetchBooks = useRefetchBooks();

  return useMutation({
    mutationFn: ({ bookId, patch }: UpdateBookVariables) => updateBook(bookId, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData<Book[]>(
        booksQueryKey,
        books => books?.map(book => (book.id === updated.id ? updated : book)),
      );
      refetchBooks();
    },
    onError: (error) => {
      if (toApiError(error).kind === 'conflict') {
        refetchBooks();
      }
    },
  });
}
