import type { Book } from '@/features/books/schemas/book-schema';

export type ResolveActiveBookResult = {
  activeBook: Book | null;
  resolvedId: string | null;
  shouldUpdateSaved: boolean;
  isEmpty: boolean;
};

/**
 * Pure function to resolve the active book from the available books and the saved book ID.
 *
 * Rules:
 * 1. If books is empty/null/undefined: returns { activeBook: null, resolvedId: null, isEmpty: true }
 * 2. If savedId is valid and exists in books: returns that book, shouldUpdateSaved: false
 * 3. If savedId is missing (not in list) or no saved id:
 *    - Falls back to the default book (`isDefault: true`)
 *    - If no default book exists, falls back to the first book (`books[0]`)
 *    - shouldUpdateSaved: true (if savedId is different from resolvedId)
 */
export function resolveActiveBook(
  books: readonly Book[] | null | undefined,
  savedId?: string | null,
): ResolveActiveBookResult {
  if (!books || books.length === 0) {
    return {
      activeBook: null,
      resolvedId: null,
      shouldUpdateSaved: Boolean(savedId),
      isEmpty: true,
    };
  }

  // 1. Saved id is valid and found in the list
  if (savedId) {
    const matchedBook = books.find(book => book.id === savedId);
    if (matchedBook) {
      return {
        activeBook: matchedBook,
        resolvedId: matchedBook.id,
        shouldUpdateSaved: false,
        isEmpty: false,
      };
    }
  }

  // 2. Saved id is missing (not in list) or no saved id -> fall back to default book
  const defaultBook = books.find(book => book.isDefault);
  if (defaultBook) {
    return {
      activeBook: defaultBook,
      resolvedId: defaultBook.id,
      shouldUpdateSaved: savedId !== defaultBook.id,
      isEmpty: false,
    };
  }

  // 3. No default book in the list -> fall back to first book
  const firstBook = books[0];
  return {
    activeBook: firstBook,
    resolvedId: firstBook.id,
    shouldUpdateSaved: savedId !== firstBook.id,
    isEmpty: false,
  };
}
