/**
 * Global Query Key Factory for Books
 *
 * Rule: Every book-scoped query key MUST start with `['books', bookId, ...]`.
 * This guarantees complete cache isolation between books.
 * When switching active books, queries for the previous book will not collide or show stale data.
 */

export const booksQueryKey = ['books'] as const;

export const booksKeys = {
  /**
   * Root books query key for fetching the user's book list: `['books']`
   */
  all: booksQueryKey,

  /**
   * Root query key scope for a specific book: `['books', bookId]`
   */
  book: (bookId: string) => ['books', bookId] as const,

  /**
   * Book transactions table query key: `['books', bookId, 'table', ...params]`
   */
  table: (bookId: string, params?: Record<string, unknown>) =>
    params
      ? (['books', bookId, 'table', params] as const)
      : (['books', bookId, 'table'] as const),

  /**
   * Book conversations query key: `['books', bookId, 'conversations', ...params]`
   */
  conversations: (bookId: string, params?: Record<string, unknown>) =>
    params
      ? (['books', bookId, 'conversations', params] as const)
      : (['books', bookId, 'conversations'] as const),

  /**
   * Book loans query key: `['books', bookId, 'loans', ...params]`
   */
  loans: (bookId: string, params?: Record<string, unknown>) =>
    params
      ? (['books', bookId, 'loans', params] as const)
      : (['books', bookId, 'loans'] as const),

  /**
   * Book installments query key: `['books', bookId, 'installments', ...params]`
   */
  installments: (bookId: string, params?: Record<string, unknown>) =>
    params
      ? (['books', bookId, 'installments', params] as const)
      : (['books', bookId, 'installments'] as const),

  /**
   * Generic builder for any custom book-scoped query key: `['books', bookId, ...subKeys]`
   */
  scoped: <T extends readonly unknown[]>(bookId: string, ...subKeys: T) =>
    ['books', bookId, ...subKeys] as const,
};

/**
 * Helper to build a book-scoped query key: `['books', bookId, ...rest]`
 */
export function bookScopedQueryKey<T extends readonly unknown[]>(
  bookId: string,
  ...rest: T
): readonly ['books', string, ...T] {
  return ['books', bookId, ...rest] as const;
}
