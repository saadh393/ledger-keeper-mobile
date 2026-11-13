import { useMutation } from '@tanstack/react-query';
import { deleteDebt } from '@/features/loans/api/delete-debt';
import { useInvalidateDebts } from '@/features/loans/api/use-invalidate-debts';

export function useDeleteDebt(bookId: string, debtId: string) {
  const invalidate = useInvalidateDebts(bookId);
  return useMutation({
    mutationFn: () => deleteDebt(bookId, debtId),
    onSuccess: invalidate,
  });
}
