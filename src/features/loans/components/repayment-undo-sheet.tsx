import type { Debt, Repayment } from '@/features/loans/schemas/debt-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useBottomSheetModalRef } from '@/components/ui';
import { useDeleteRepayment } from '@/features/loans/api/use-delete-repayment';
import { LoanConfirmSheet } from '@/features/loans/components/loan-confirm-sheet';
import { useDebtErrorHandler } from '@/features/loans/hooks/use-debt-error-handler';
import { formatCurrency } from '@/lib/format/currency';
import { formatDate } from '@/lib/format/date';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type RepaymentUndoSheetProps = {
  bookId: string;
  debt: Debt;
  repayment: Repayment;
  onDismiss: () => void;
};

export function RepaymentUndoSheet({ bookId, debt, repayment, onDismiss }: RepaymentUndoSheetProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const modal = useBottomSheetModalRef();
  const mutation = useDeleteRepayment(bookId, debt.id);
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
    mutation.mutate(repayment.id, {
      onSuccess: modal.dismiss,
      onError: errors.handleError,
      onSettled: () => {
        submitting.current = false;
      },
    });
  };

  return (
    <LoanConfirmSheet
      testID="repayment-undo-sheet"
      modalRef={modal.ref}
      title={t('loans.undo.title')}
      body={t('loans.undo.body', { amount: formatCurrency(repayment.amount, locale, debt.currency), date: formatDate(repayment.dateIso, locale) })}
      confirmLabel={t('loans.undo.confirm')}
      pendingLabel={t('loans.undo.pending')}
      pending={mutation.isPending}
      error={errors.formError}
      onConfirm={confirm}
      onCancel={modal.dismiss}
      onDismiss={onDismiss}
    />
  );
}
