import type { Book } from '@/features/books/schemas/book-schema';
import { booksResponseSchema } from '@/features/books/schemas/book-schema';
import { apiClient } from '@/lib/api';

export async function fetchBooks(): Promise<Book[]> {
  const response = await apiClient.get('/books');
  const parsed = booksResponseSchema.parse(response.data);
  return parsed.items;
}
