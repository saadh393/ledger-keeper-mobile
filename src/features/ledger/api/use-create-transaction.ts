import type { CreateTransactionInput } from '@/features/ledger/api/create-transaction';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { booksKeys } from '@/features/books/utils/query-keys';
import { createTransaction } from '@/features/ledger/api/create-transaction';

export function useCreateTransaction(bookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => createTransaction(bookId, input),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: booksKeys.table(bookId) });
    },
  });
}
