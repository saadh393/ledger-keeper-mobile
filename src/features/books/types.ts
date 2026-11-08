import type { UseQueryResult } from '@tanstack/react-query';
import type { Book, BooksResponse } from '@/features/books/schemas/book-schema';
import type { ResolveActiveBookResult } from '@/features/books/utils/resolve-active-book';

export type { Book, BooksResponse, ResolveActiveBookResult };

export type ActiveBookState = {
  activeBookId: string | null;
  setActiveBookId: (id: string | null) => void;
  reset: () => void;
};

export type UseBooksResult = UseQueryResult<Book[], Error> & {
  books: Book[];
};

export type UseActiveBookResult = {
  activeBook: Book | null;
  activeBookId: string | null;
  setActiveBook: (bookOrId: Book | string) => void;
  setActiveBookId: (id: string | null) => void;
  books: Book[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isEmpty: boolean;
  isSuccess: boolean;
  refetch: () => Promise<unknown>;
};
