import type { CreateDebtInput } from '@/features/loans/api/create-debt';
import { useMutation } from '@tanstack/react-query';
import { createDebt } from '@/features/loans/api/create-debt';
import { useInvalidateDebts } from '@/features/loans/api/use-invalidate-debts';

export function useCreateDebt(bookId: string) {
  const invalidate = useInvalidateDebts(bookId);
  return useMutation({
    mutationFn: (input: CreateDebtInput) => createDebt(bookId, input),
    onSuccess: invalidate,
  });
}
