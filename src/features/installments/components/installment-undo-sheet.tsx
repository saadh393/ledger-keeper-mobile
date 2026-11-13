import type { Installment, InstallmentPayment } from '@/features/installments/schemas/installment-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useBottomSheetModalRef } from '@/components/ui';
import { useUndoInstallmentPayment } from '@/features/installments/api/use-installment-mutations';
import { useConfirmAction } from '@/features/installments/hooks/use-confirm-action';
import { LoanConfirmSheet } from '@/features/loans/components/loan-confirm-sheet';
import { formatCurrency } from '@/lib/format/currency';
import { formatDate } from '@/lib/format/date';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type InstallmentUndoSheetProps = {
  bookId: string;
  installment: Installment;
  payment: InstallmentPayment;
  onDismiss: () => void;
};

export function InstallmentUndoSheet({ bookId, installment, payment, onDismiss }: InstallmentUndoSheetProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const modal = useBottomSheetModalRef();
  const mutation = useUndoInstallmentPayment(bookId);
  const action = useConfirmAction({ bookId, paidCount: installment.paidCount, mutation, variables: payment.id, onClose: modal.dismiss });

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  return (
    <LoanConfirmSheet
      testID="installment-undo-sheet"
      modalRef={modal.ref}
      title={t('installments.undo.title')}
      body={t('installments.undo.body', { amount: formatCurrency(payment.amount, locale, installment.currency), date: formatDate(payment.dateIso, locale) })}
      confirmLabel={t('installments.undo.confirm')}
      pendingLabel={t('installments.undo.pending')}
      pending={action.pending}
      error={action.error}
      onConfirm={action.confirm}
      onCancel={modal.dismiss}
      onDismiss={onDismiss}
    />
  );
}
