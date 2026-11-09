import { useQuery } from '@tanstack/react-query';
import { booksKeys } from '@/features/books/utils/query-keys';
import { fetchBookTable } from '@/features/ledger/api/fetch-book-table';

export function bookTableQueryKey(bookId: string, fromDate: string, toDate: string) {
  return booksKeys.scoped(bookId, 'table', fromDate, toDate);
}

export function useBookTable(bookId: string | null, fromDate: string, toDate: string) {
  return useQuery({
    queryKey: bookTableQueryKey(bookId ?? '', fromDate, toDate),
    queryFn: () => fetchBookTable(bookId!, fromDate, toDate),
    enabled: Boolean(bookId),
  });
}
