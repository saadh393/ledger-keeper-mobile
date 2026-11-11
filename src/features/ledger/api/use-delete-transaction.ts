import type { BookTable } from '@/features/ledger/schemas/book-table-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { booksKeys } from '@/features/books/utils/query-keys';
import { deleteTransaction } from '@/features/ledger/api/delete-transaction';

export function useDeleteTransaction(bookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => deleteTransaction(bookId, transactionId),
    onSuccess: (_data, transactionId) => {
      const queryKey = booksKeys.table(bookId);
      queryClient.setQueriesData<BookTable>({ queryKey }, table => table && { ...table, rows: table.rows.filter(row => row.id !== transactionId) });
      return Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: booksKeys.conversations(bookId) }),
      ]);
    },
  });
}
