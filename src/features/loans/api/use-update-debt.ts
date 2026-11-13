import type { UpdateDebtInput } from '@/features/loans/api/update-debt';
import { useMutation } from '@tanstack/react-query';
import { updateDebt } from '@/features/loans/api/update-debt';
import { useInvalidateDebts } from '@/features/loans/api/use-invalidate-debts';

export function useUpdateDebt(bookId: string, debtId: string) {
  const invalidate = useInvalidateDebts(bookId);
  return useMutation({
    mutationFn: (patch: UpdateDebtInput) => updateDebt(bookId, debtId, patch),
    onSuccess: invalidate,
  });
}
