import type { DebtFormValues } from '@/features/loans/schemas/debt-form-schema';
import type { Debt } from '@/features/loans/schemas/debt-schema';
import type { DebtFieldKey } from '@/features/loans/utils/get-debt-error';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateDebt } from '@/features/loans/api/use-create-debt';
import { useUpdateDebt } from '@/features/loans/api/use-update-debt';
import { useConfirmDiscard } from '@/features/loans/hooks/use-confirm-discard';
import { useDebtErrorHandler } from '@/features/loans/hooks/use-debt-error-handler';
import { createDebtFormSchema } from '@/features/loans/schemas/debt-form-schema';
import { buildDebtInput } from '@/features/loans/utils/build-debt-input';
import { getAmountErrorMessages } from '@/features/loans/utils/get-amount-error-messages';
import { getDebtChanges } from '@/features/loans/utils/get-debt-changes';
import { getFormFieldErrors } from '@/features/loans/utils/get-form-field-errors';

export type UseLoanFormOptions = {
  bookId: string;
  currency: string;
  debt?: Debt;
  onClose: () => void;
};

function getInitialValues(debt?: Debt): DebtFormValues {
  return {
    direction: debt?.direction ?? 'lent',
    counterparty: debt?.counterparty ?? '',
    amount: debt ? String(debt.amount) : '',
    date: debt?.dateIso ?? new Date().toISOString(),
    dueDate: debt?.dueDateIso ?? '',
    note: debt?.note ?? '',
  };
}

export function useLoanForm({ bookId, currency, debt, onClose }: UseLoanFormOptions) {
  const { t } = useTranslation();
  const [initial] = React.useState(() => getInitialValues(debt));
  const [values, setValues] = React.useState(initial);
  const submitting = React.useRef(false);
  const createMutation = useCreateDebt(bookId);
  const updateMutation = useUpdateDebt(bookId, debt?.id ?? '');
  const isPending = createMutation.isPending || updateMutation.isPending;
  const errors = useDebtErrorHandler({ bookId, currency, repaid: debt?.repaid ?? 0, outstanding: debt?.outstanding ?? 0, onClose });
  const schema = React.useMemo(() => createDebtFormSchema({
    ...getAmountErrorMessages(t),
    personRequired: t('loans.errors.personRequired'),
    personTooLong: t('loans.errors.personTooLong'),
    dateFuture: t('loans.errors.dateFuture'),
    dueBeforeDate: t('loans.errors.dueBeforeDate'),
    noteTooLong: t('loans.errors.noteTooLong'),
  }), [t]);

  const changes = debt ? getDebtChanges(debt, values) : null;
  const isDirty = debt ? Object.keys(changes!).length > 0 : JSON.stringify(values) !== JSON.stringify(initial);
  const requestClose = useConfirmDiscard(isDirty, isPending, onClose);

  const setField = <K extends keyof DebtFormValues>(field: K, value: DebtFormValues[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    errors.clearFieldError(field as DebtFieldKey);
  };

  const submit = () => {
    if (submitting.current || isPending)
      return;
    errors.clearErrors();
    const validation = schema.safeParse(values);
    if (!validation.success) {
      errors.setFieldErrors(getFormFieldErrors<DebtFieldKey>(validation.error));
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
    if (debt)
      updateMutation.mutate(changes!, callbacks);
    else
      createMutation.mutate(buildDebtInput(values), callbacks);
  };

  return {
    values,
    setField,
    fieldErrors: errors.fieldErrors,
    formError: errors.formError,
    isEditing: Boolean(debt),
    isPending,
    isSaveDisabled: isPending || (Boolean(debt) && !isDirty),
    submit,
    requestClose,
  };
}
