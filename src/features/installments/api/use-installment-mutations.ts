import type { InstallmentPaymentInput } from '@/features/installments/api/installment-mutations';
import type { InstallmentInput } from '@/features/installments/utils/build-installment-input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { booksKeys } from '@/features/books/utils/query-keys';
import { createInstallment, deleteInstallment, payInstallment, updateInstallment } from '@/features/installments/api/installment-mutations';
import { installmentsKeys } from '@/features/installments/utils/installments-keys';
import { deleteTransaction } from '@/features/ledger/api/delete-transaction';

function useInvalidate(bookId: string) {
  const queryClient = useQueryClient();
  return {
    plans: () => queryClient.invalidateQueries({ queryKey: installmentsKeys.all(bookId) }),
    book: () => queryClient.invalidateQueries({ queryKey: booksKeys.book(bookId) }),
  };
}

export function useCreateInstallment(bookId: string) {
  const invalidate = useInvalidate(bookId);
  return useMutation({ mutationFn: (input: InstallmentInput) => createInstallment(bookId, input), onSuccess: invalidate.plans });
}

export function useUpdateInstallment(bookId: string, installmentId: string) {
  const invalidate = useInvalidate(bookId);
  return useMutation({ mutationFn: (patch: Partial<InstallmentInput>) => updateInstallment(bookId, installmentId, patch), onSuccess: invalidate.plans });
}

export function useDeleteInstallment(bookId: string, installmentId: string) {
  const invalidate = useInvalidate(bookId);
  return useMutation({ mutationFn: () => deleteInstallment(bookId, installmentId), onSuccess: invalidate.plans });
}

export function usePayInstallment(bookId: string, installmentId: string) {
  const invalidate = useInvalidate(bookId);
  return useMutation({ mutationFn: (input: InstallmentPaymentInput) => payInstallment(bookId, installmentId, input), onSuccess: invalidate.book });
}

export function useUndoInstallmentPayment(bookId: string) {
  const invalidate = useInvalidate(bookId);
  return useMutation({ mutationFn: (transactionId: string) => deleteTransaction(bookId, transactionId), onSuccess: invalidate.book });
}

export function useInvalidateInstallments(bookId: string) {
  return useInvalidate(bookId).plans;
}
