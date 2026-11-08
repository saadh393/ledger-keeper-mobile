import type { BookFormValues } from '@/features/books/schemas/book-form-schema';
import type { Book } from '@/features/books/schemas/book-schema';

export function getBookChanges(book: Book, values: BookFormValues): Partial<BookFormValues> {
  const name = values.name.trim();
  return {
    ...(name !== book.name ? { name } : {}),
    ...(values.currency !== book.currency ? { currency: values.currency } : {}),
  };
}
