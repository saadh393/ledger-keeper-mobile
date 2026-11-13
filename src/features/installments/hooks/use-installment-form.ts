import type { InstallmentFormValues } from '@/features/installments/schemas/installment-form-schema';
import type { Installment } from '@/features/installments/schemas/installment-schema';
import type { InstallmentFieldKey } from '@/features/installments/utils/get-installment-error';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateInstallment, useUpdateInstallment } from '@/features/installments/api/use-installment-mutations';
import { useInstallmentErrorHandler } from '@/features/installments/hooks/use-installment-error-handler';
import { createInstallmentFormSchema } from '@/features/installments/schemas/installment-form-schema';
import { buildInstallmentInput } from '@/features/installments/utils/build-installment-input';
import { getInstallmentChanges } from '@/features/installments/utils/get-installment-changes';
import { useConfirmDiscard } from '@/features/loans/hooks/use-confirm-discard';
import { getAmountErrorMessages } from '@/features/loans/utils/get-amount-error-messages';
import { getFormFieldErrors } from '@/features/loans/utils/get-form-field-errors';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type UseInstallmentFormOptions = {
  bookId: string;
  installment?: Installment;
  onClose: () => void;
};

function getInitialValues(installment?: Installment): InstallmentFormValues {
  return {
    title: installment?.title ?? '',
    category: installment?.category ?? '',
    amount: installment ? String(installment.amount) : '',
    totalCount: installment ? String(installment.totalCount) : '',
  };
}

export function useInstallmentForm({ bookId, installment, onClose }: UseInstallmentFormOptions) {
  const { t, i18n } = useTranslation();
  const paidCount = installment?.paidCount ?? 0;
  const [initial] = React.useState(() => getInitialValues(installment));
  const [values, setValues] = React.useState(initial);
  const submitting = React.useRef(false);
  const createMutation = useCreateInstallment(bookId);
  const updateMutation = useUpdateInstallment(bookId, installment?.id ?? '');
  const isPending = createMutation.isPending || updateMutation.isPending;
  const errors = useInstallmentErrorHandler({ bookId, paidCount, onClose });
  const schema = React.useMemo(() => createInstallmentFormSchema({
    ...getAmountErrorMessages(t),
    titleRequired: t('installments.errors.titleRequired'),
    titleTooLong: t('installments.errors.titleTooLong'),
    categoryRequired: t('installments.errors.categoryRequired'),
    countInvalid: t('installments.errors.countInvalid'),
    countBelowPaid: t('installments.errors.countBelowPaid', { paid: formatNumber(paidCount, resolveLanguage(i18n.language)) }),
  }, paidCount), [t, i18n.language, paidCount]);

  const isDirty = JSON.stringify(values) !== JSON.stringify(initial);
  const requestClose = useConfirmDiscard(isDirty, isPending, onClose);

  const setField = <K extends keyof InstallmentFormValues>(field: K, value: InstallmentFormValues[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    errors.clearFieldError(field);
  };

  const submit = () => {
    if (submitting.current || isPending)
      return;
    errors.clearErrors();
    const validation = schema.safeParse(values);
    if (!validation.success) {
      errors.setFieldErrors(getFormFieldErrors<InstallmentFieldKey>(validation.error));
      return;
    }
    const changes = installment ? getInstallmentChanges(installment, values) : null;
    if (changes && !Object.keys(changes).length) {
      onClose();
      return;
    }
    submitting.current = true;
    const callbacks = {
      onSuccess: onClose,
      onError: errors.handleError,
      onSettled: () => {
        submitting.current = false;
      },
    };
    if (changes)
      updateMutation.mutate(changes, callbacks);
    else
      createMutation.mutate(buildInstallmentInput(values), callbacks);
  };

  return {
    values,
    setField,
    fieldErrors: errors.fieldErrors,
    formError: errors.formError,
    isEditing: Boolean(installment),
    isPending,
    isSaveDisabled: isPending || (Boolean(installment) && !isDirty),
    submit,
    requestClose,
  };
}
