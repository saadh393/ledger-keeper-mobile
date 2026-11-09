import type { BookTable } from '@/features/ledger/schemas/book-table-schema';
import { bookTableSchema } from '@/features/ledger/schemas/book-table-schema';
import { apiClient } from '@/lib/api';

export async function fetchBookTable(bookId: string, fromDate: string, toDate: string): Promise<BookTable> {
  const response = await apiClient.get(`/books/${bookId}/table`, { params: { fromDate, toDate } });
  return bookTableSchema.parse(response.data);
}
