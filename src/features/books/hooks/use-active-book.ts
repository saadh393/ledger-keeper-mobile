import type { Book } from '@/features/books/schemas/book-schema';
import type { UseActiveBookResult } from '@/features/books/types';
import { useCallback, useEffect } from 'react';
import { useBooks } from '@/features/books/api/use-books';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { resolveActiveBook } from '@/features/books/utils/resolve-active-book';

export function useActiveBook(): UseActiveBookResult {
  const {
    data: books,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  } = useBooks();

  const savedId = useActiveBookStore(state => state.activeBookId);
  const setSavedId = useActiveBookStore(state => state.setActiveBookId);

  const resolution = resolveActiveBook(books, savedId);

  useEffect(() => {
    if (books && books.length > 0 && resolution.shouldUpdateSaved && resolution.resolvedId) {
      setSavedId(resolution.resolvedId);
    }
    else if (books && books.length === 0 && savedId !== null) {
      setSavedId(null);
    }
  }, [books, resolution.shouldUpdateSaved, resolution.resolvedId, savedId, setSavedId]);

  const setActiveBook = useCallback(
    (bookOrId: Book | string) => {
      const id = typeof bookOrId === 'string' ? bookOrId : bookOrId.id;
      setSavedId(id);
    },
    [setSavedId],
  );

  return {
    activeBook: resolution.activeBook,
    activeBookId: resolution.activeBook?.id ?? null,
    setActiveBook,
    setActiveBookId: setSavedId,
    books: books ?? [],
    isLoading,
    isError,
    error: (error as Error) ?? null,
    isEmpty: isSuccess && (books?.length ?? 0) === 0,
    isSuccess,
    refetch,
  };
}
