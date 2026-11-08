import type { Book } from '@/features/books/schemas/book-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBook } from '@/features/books/api/books-api';
import { useRefetchBooks } from '@/features/books/api/use-refetch-books';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { getActiveBookIdAfterDelete } from '@/features/books/utils/get-active-book-id-after-delete';
import { booksQueryKey } from '@/features/books/utils/query-keys';
import { toApiError } from '@/lib/api/errors';

export function useDeleteBook() {
  const queryClient = useQueryClient();
  const refetchBooks = useRefetchBooks();

  return useMutation({
    mutationFn: deleteBook,
    onSuccess: (_data, bookId) => {
      const books = queryClient.getQueryData<Book[]>(booksQueryKey) ?? [];
      const { activeBookId, setActiveBookId } = useActiveBookStore.getState();
      setActiveBookId(getActiveBookIdAfterDelete(books, bookId, activeBookId));
      queryClient.setQueryData<Book[]>(booksQueryKey, books.filter(book => book.id !== bookId));
      refetchBooks();
    },
    onError: (error) => {
      if (toApiError(error).kind === 'conflict') {
        refetchBooks();
      }
    },
  });
}
