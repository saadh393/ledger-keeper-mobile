import type { AddRepaymentInput } from '@/features/loans/api/add-repayment';
import { useMutation } from '@tanstack/react-query';
import { addRepayment } from '@/features/loans/api/add-repayment';
import { useInvalidateDebts } from '@/features/loans/api/use-invalidate-debts';

export function useAddRepayment(bookId: string, debtId: string) {
  const invalidate = useInvalidateDebts(bookId);
  return useMutation({
    mutationFn: (input: AddRepaymentInput) => addRepayment(bookId, debtId, input),
    onSuccess: invalidate,
  });
}
