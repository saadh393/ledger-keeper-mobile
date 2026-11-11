import type { UpdateTransactionInput } from '@/features/ledger/api/update-transaction';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { booksKeys } from '@/features/books/utils/query-keys';
import { updateTransaction } from '@/features/ledger/api/update-transaction';

export function useUpdateTransaction(bookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, patch }: { transactionId: string; patch: UpdateTransactionInput }) =>
      updateTransaction(bookId, transactionId, patch),
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: booksKeys.table(bookId) }),
        queryClient.invalidateQueries({ queryKey: booksKeys.conversations(bookId) }),
      ]);
    },
  });
}
