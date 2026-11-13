import type { Debt } from '@/features/loans/schemas/debt-schema';
import type { RepaymentFormValues } from '@/features/loans/schemas/repayment-form-schema';
import type { DebtFieldKey } from '@/features/loans/utils/get-debt-error';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { parseAmount } from '@/features/ledger/schemas/amount-schema';
import { useAddRepayment } from '@/features/loans/api/use-add-repayment';
import { useConfirmDiscard } from '@/features/loans/hooks/use-confirm-discard';
import { useDebtErrorHandler } from '@/features/loans/hooks/use-debt-error-handler';
import { createRepaymentFormSchema } from '@/features/loans/schemas/repayment-form-schema';
import { getAmountErrorMessages } from '@/features/loans/utils/get-amount-error-messages';
import { getFormFieldErrors } from '@/features/loans/utils/get-form-field-errors';
import { formatCurrency } from '@/lib/format/currency';
import { toDayKey } from '@/lib/format/day-key';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type UseRepaymentFormOptions = {
  bookId: string;
  debt: Debt;
  onClose: () => void;
};

export function useRepaymentForm({ bookId, debt, onClose }: UseRepaymentFormOptions) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const [initial] = React.useState<RepaymentFormValues>(() => ({ amount: String(debt.outstanding), date: new Date().toISOString() }));
  const [values, setValues] = React.useState(initial);
  const submitting = React.useRef(false);
  const mutation = useAddRepayment(bookId, debt.id);
  const errors = useDebtErrorHandler({ bookId, currency: debt.currency, repaid: debt.repaid, outstanding: debt.outstanding, onClose });
  const schema = React.useMemo(() => createRepaymentFormSchema({
    ...getAmountErrorMessages(t),
    amountExceeds: t('loans.errors.repaymentExceeds', { amount: formatCurrency(debt.outstanding, locale, debt.currency) }),
    dateFuture: t('loans.errors.dateFuture'),
  }, debt.outstanding), [t, locale, debt.outstanding, debt.currency]);
  const isDirty = values.amount !== initial.amount || toDayKey(values.date) !== toDayKey(initial.date);
  const requestClose = useConfirmDiscard(isDirty, mutation.isPending, onClose);

  const setField = <K extends keyof RepaymentFormValues>(field: K, value: RepaymentFormValues[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    errors.clearFieldError(field as DebtFieldKey);
  };

  const submit = () => {
    if (submitting.current || mutation.isPending)
      return;
    errors.clearErrors();
    const validation = schema.safeParse(values);
    if (!validation.success) {
      errors.setFieldErrors(getFormFieldErrors<DebtFieldKey>(validation.error));
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

  return {
    values,
    setField,
    fieldErrors: errors.fieldErrors,
    formError: errors.formError,
    isPending: mutation.isPending,
    submit,
    requestClose,
  };
}
