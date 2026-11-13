import { useMutation } from '@tanstack/react-query';
import { deleteRepayment } from '@/features/loans/api/delete-repayment';
import { useInvalidateDebts } from '@/features/loans/api/use-invalidate-debts';

export function useDeleteRepayment(bookId: string, debtId: string) {
  const invalidate = useInvalidateDebts(bookId);
  return useMutation({
    mutationFn: (repaymentId: string) => deleteRepayment(bookId, debtId, repaymentId),
    onSuccess: invalidate,
  });
}
