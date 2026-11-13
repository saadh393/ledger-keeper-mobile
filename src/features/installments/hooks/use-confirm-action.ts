import type { UseMutationResult } from '@tanstack/react-query';
import * as React from 'react';
import { useInstallmentErrorHandler } from '@/features/installments/hooks/use-installment-error-handler';

export type UseConfirmActionOptions<T> = {
  bookId: string;
  paidCount: number;
  mutation: UseMutationResult<void, Error, T>;
  variables: T;
  onClose: () => void;
};

export function useConfirmAction<T>({ bookId, paidCount, mutation, variables, onClose }: UseConfirmActionOptions<T>) {
  const submitting = React.useRef(false);
  const errors = useInstallmentErrorHandler({ bookId, paidCount, onClose });

  const confirm = () => {
    if (submitting.current)
      return;
    submitting.current = true;
    errors.clearErrors();
    mutation.mutate(variables, {
      onSuccess: onClose,
      onError: errors.handleError,
      onSettled: () => {
        submitting.current = false;
      },
    });
  };

  return { confirm, error: errors.formError, pending: mutation.isPending };
}
