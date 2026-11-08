import type { Book } from '@/features/books/schemas/book-schema';

export function getActiveBookIdAfterDelete(
  books: Book[],
  deletedId: string,
  activeId: string | null,
): string | null {
  if (deletedId !== activeId) {
    return activeId;
  }
  return books.find(book => book.isDefault && book.id !== deletedId)?.id ?? null;
}
