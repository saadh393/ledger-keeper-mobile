import type { BookFormValues } from '@/features/books/schemas/book-form-schema';
import type { Book } from '@/features/books/schemas/book-schema';
import { bookSchema, booksResponseSchema } from '@/features/books/schemas/book-schema';
import { apiClient } from '@/lib/api';

export async function fetchBooks(): Promise<Book[]> {
  const response = await apiClient.get('/books');
  const parsed = booksResponseSchema.parse(response.data);
  return parsed.items;
}

export async function createBook(input: BookFormValues): Promise<Book> {
  const response = await apiClient.post('/books', input);
  return bookSchema.parse(response.data);
}

export async function updateBook(bookId: string, patch: Partial<BookFormValues>): Promise<Book> {
  const response = await apiClient.patch(`/books/${bookId}`, patch);
  return bookSchema.parse(response.data);
}

export async function deleteBook(bookId: string): Promise<void> {
  await apiClient.delete(`/books/${bookId}`);
}
