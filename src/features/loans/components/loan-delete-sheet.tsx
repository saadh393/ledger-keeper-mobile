import type { Debt } from '@/features/loans/schemas/debt-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useBottomSheetModalRef } from '@/components/ui';
import { useDeleteDebt } from '@/features/loans/api/use-delete-debt';
import { LoanConfirmSheet } from '@/features/loans/components/loan-confirm-sheet';
import { useDebtErrorHandler } from '@/features/loans/hooks/use-debt-error-handler';

export type LoanDeleteSheetProps = {
  bookId: string;
  debt: Debt;
  onDismiss: () => void;
};

export function LoanDeleteSheet({ bookId, debt, onDismiss }: LoanDeleteSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const mutation = useDeleteDebt(bookId, debt.id);
  const submitting = React.useRef(false);
  const errors = useDebtErrorHandler({ bookId, currency: debt.currency, repaid: debt.repaid, outstanding: debt.outstanding, onClose: modal.dismiss });

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const confirm = () => {
    if (submitting.current)
      return;
    submitting.current = true;
    errors.clearErrors();
    mutation.mutate(undefined, {
      onSuccess: modal.dismiss,
      onError: errors.handleError,
      onSettled: () => {
        submitting.current = false;
      },
    });
  };

  return (
    <LoanConfirmSheet
      testID="loan-delete-sheet"
      modalRef={modal.ref}
      title={t('loans.delete.title', { name: debt.counterparty })}
      body={t('loans.delete.body')}
      confirmLabel={t('loans.delete.confirm')}
      pendingLabel={t('loans.delete.pending')}
      pending={mutation.isPending}
      error={errors.formError}
      onConfirm={confirm}
      onCancel={modal.dismiss}
      onDismiss={onDismiss}
    />
  );
}
