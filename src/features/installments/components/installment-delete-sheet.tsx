import type { Installment } from '@/features/installments/schemas/installment-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useBottomSheetModalRef } from '@/components/ui';
import { useDeleteInstallment } from '@/features/installments/api/use-installment-mutations';
import { useConfirmAction } from '@/features/installments/hooks/use-confirm-action';
import { LoanConfirmSheet } from '@/features/loans/components/loan-confirm-sheet';

export type InstallmentDeleteSheetProps = {
  bookId: string;
  installment: Installment;
  onDismiss: () => void;
};

export function InstallmentDeleteSheet({ bookId, installment, onDismiss }: InstallmentDeleteSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const mutation = useDeleteInstallment(bookId, installment.id);
  const action = useConfirmAction({ bookId, paidCount: installment.paidCount, mutation, variables: undefined, onClose: modal.dismiss });

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  return (
    <LoanConfirmSheet
      testID="installment-delete-sheet"
      modalRef={modal.ref}
      title={t('installments.delete.title', { title: installment.title })}
      body={t('installments.delete.body')}
      confirmLabel={t('installments.delete.confirm')}
      pendingLabel={t('installments.delete.pending')}
      pending={action.pending}
      error={action.error}
      onConfirm={action.confirm}
      onCancel={modal.dismiss}
      onDismiss={onDismiss}
    />
  );
}
