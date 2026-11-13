import type { Installment } from '@/features/installments/schemas/installment-schema';
import type { InstallmentFieldKey } from '@/features/installments/utils/get-installment-error';
import type { RepaymentFormValues } from '@/features/loans/schemas/repayment-form-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { usePayInstallment } from '@/features/installments/api/use-installment-mutations';
import { useInstallmentErrorHandler } from '@/features/installments/hooks/use-installment-error-handler';
import { createAmountSchema, parseAmount } from '@/features/ledger/schemas/amount-schema';
import { useConfirmDiscard } from '@/features/loans/hooks/use-confirm-discard';
import { createNotFutureDateSchema } from '@/features/loans/schemas/debt-form-schema';
import { getAmountErrorMessages } from '@/features/loans/utils/get-amount-error-messages';
import { getFormFieldErrors } from '@/features/loans/utils/get-form-field-errors';
import { toDayKey } from '@/lib/format/day-key';

export type UsePaymentFormOptions = {
  bookId: string;
  installment: Installment;
  onClose: () => void;
};

export function usePaymentForm({ bookId, installment, onClose }: UsePaymentFormOptions) {
  const { t } = useTranslation();
  const [initial] = React.useState<RepaymentFormValues>(() => ({ amount: String(installment.amount), date: new Date().toISOString() }));
  const [values, setValues] = React.useState(initial);
  const submitting = React.useRef(false);
  const mutation = usePayInstallment(bookId, installment.id);
  const errors = useInstallmentErrorHandler({ bookId, paidCount: installment.paidCount, onClose });
  const schema = React.useMemo(() => z.object({
    amount: createAmountSchema(getAmountErrorMessages(t)),
    date: createNotFutureDateSchema(t('loans.errors.dateFuture')),
  }), [t]);
  const isDirty = values.amount !== initial.amount || toDayKey(values.date) !== toDayKey(initial.date);
  const requestClose = useConfirmDiscard(isDirty, mutation.isPending, onClose);

  const setField = <K extends keyof RepaymentFormValues>(field: K, value: RepaymentFormValues[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    errors.clearFieldError(field as InstallmentFieldKey);
  };

  const submit = () => {
    if (submitting.current || mutation.isPending)
      return;
    errors.clearErrors();
    const validation = schema.safeParse(values);
    if (!validation.success) {
      errors.setFieldErrors(getFormFieldErrors<InstallmentFieldKey>(validation.error));
      return;
    }
    submitting.current = true;
    mutation.mutate(
      { amount: parseAmount(values.amount), dateIso: new Date(values.date).toISOString() },
      {
        onSuccess: onClose,
        onError: errors.handleError,
        onSettled: () => {
          submitting.current = false;
        },
      },
    );
  };

  return { values, setField, fieldErrors: errors.fieldErrors, formError: errors.formError, isPending: mutation.isPending, submit, requestClose };
}
