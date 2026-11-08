import type { Book } from '@/features/books/schemas/book-schema';

/**
 * Sorts books according to Issue #22 requirements:
 * Default book is always listed first, followed by remaining books sorted by name alphabetically.
 */
export function sortBooks(books: Book[]): Book[] {
  return [...books].sort((a, b) => {
    if (a.isDefault && !b.isDefault) {
      return -1;
    }
    if (!a.isDefault && b.isDefault) {
      return 1;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}
