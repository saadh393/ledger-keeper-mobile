import type { TFunction } from 'i18next';
import type { z } from 'zod';
import type { createTransaction, CreateTransactionInput } from '@/features/ledger/api/create-transaction';
import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type {
  createTransactionFormSchema,
  TransactionFormValues,
} from '@/features/ledger/schemas/transaction-form-schema';
import type { TransactionFieldKey } from '@/features/ledger/utils/get-transaction-error';
import type { Month } from '@/features/ledger/utils/month';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';
import { showErrorMessage } from '@/components/ui';
import { useCreateTransaction } from '@/features/ledger/api/use-create-transaction';
import { useUpdateTransaction } from '@/features/ledger/api/use-update-transaction';
import { parseAmount } from '@/features/ledger/schemas/transaction-form-schema';
import { getTransactionChanges } from '@/features/ledger/utils/get-transaction-changes';
import { getTransactionError } from '@/features/ledger/utils/get-transaction-error';
import { formatMonthLabel } from '@/features/ledger/utils/month';
import { toDayKey } from '@/lib/format/day-key';

export type UseTransactionSubmitOptions = {
  bookId: string;
  row?: TransactionRow;
  viewedMonth?: Month;
  locale: Language;
  onDismiss: () => void;
  formValues: TransactionFormValues;
  schema: ReturnType<typeof createTransactionFormSchema>;
  t: TFunction;
  create?: typeof createTransaction;
};

type MonthToastOptions = {
  savedIso: string;
  viewedMonth: Month | undefined;
  locale: Language;
  t: TFunction;
};

function showSavedToMonthToast({ savedIso, viewedMonth, locale, t }: MonthToastOptions) {
  if (!viewedMonth)
    return;
  const parts = toDayKey(savedIso).split('-').map(Number);
  const targetYear = parts[0];
  const targetMonth = parts[1];

  if (targetYear !== viewedMonth.year || targetMonth !== viewedMonth.month) {
    const monthLabel = formatMonthLabel({ year: targetYear, month: targetMonth }, locale);
    showMessage({
      message: t('ledger.form.savedToMonth', { month: monthLabel }),
      type: 'success',
      duration: 3000,
    });
  }
}

function extractZodFieldErrors(error: z.ZodError) {
  const newErrors: Partial<Record<TransactionFieldKey, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as TransactionFieldKey;
    if (!newErrors[field]) {
      newErrors[field] = issue.message;
    }
  }
  return newErrors;
}

function buildCreateInput(values: TransactionFormValues): CreateTransactionInput {
  return {
    kind: values.type,
    title: values.title.trim(),
    category: values.category,
    amount: parseAmount(values.amount),
    dateIso: new Date(values.date).toISOString(),
    note: values.note.trim() ? values.note.trim() : null,
  };
}

export function useTransactionSubmit({
  bookId,
  row,
  viewedMonth,
  locale,
  onDismiss,
  formValues,
  schema,
  t,
  create,
}: UseTransactionSubmitOptions) {
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<TransactionFieldKey, string>>>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  const createMutation = useCreateTransaction(bookId, create);
  const updateMutation = useUpdateTransaction(bookId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleValidation = () => {
    setFieldErrors({});
    setFormError(null);
    const validation = schema.safeParse(formValues);
    if (!validation.success) {
      setFieldErrors(extractZodFieldErrors(validation.error));
      return false;
    }
    return true;
  };

  const handleEditSubmit = () => {
    if (!row)
      return;
    const patch = getTransactionChanges(row, formValues);
    if (Object.keys(patch).length === 0)
      return;

    updateMutation.mutate(
      { transactionId: row.id, patch },
      {
        onSuccess: (updated) => {
          showSavedToMonthToast({
            savedIso: updated.dateIso || formValues.date,
            viewedMonth,
            locale,
            t,
          });
          onDismiss();
        },
        onError: (error) => {
          const errResult = getTransactionError(error);
          if (errResult.type === 'notFound') {
            onDismiss();
            showErrorMessage(t(errResult.messageKey));
          }
          else if (errResult.type === 'fieldErrors') {
            setFieldErrors(errResult.fieldErrors);
          }
          else {
            setFormError(t(errResult.messageKey));
          }
        },
      },
    );
  };

  const handleCreateSubmit = () => {
    createMutation.mutate(buildCreateInput(formValues), {
      onSuccess: (created) => {
        showSavedToMonthToast({
          savedIso: created.dateIso || formValues.date,
          viewedMonth,
          locale,
          t,
        });
        onDismiss();
      },
      onError: (error) => {
        const errResult = getTransactionError(error);
        if (errResult.type === 'fieldErrors') {
          setFieldErrors(errResult.fieldErrors);
        }
        else {
          setFormError(t(errResult.messageKey));
        }
      },
    });
  };

  const handleSubmit = () => {
    if (isPending || !handleValidation())
      return;
    if (row) {
      handleEditSubmit();
    }
    else {
      handleCreateSubmit();
    }
  };

  return {
    isPending,
    fieldErrors,
    setFieldErrors,
    formError,
    setFormError,
    handleSubmit,
  };
}
