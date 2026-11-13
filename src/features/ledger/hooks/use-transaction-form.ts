import type { SegmentOption } from '@/components/ui';
import type { createTransaction } from '@/features/ledger/api/create-transaction';
import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { TransactionFormValues } from '@/features/ledger/schemas/transaction-form-schema';
import type { Month } from '@/features/ledger/utils/month';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useCategories } from '@/features/categories/api/use-categories';
import { useTransactionFormSchema } from '@/features/ledger/hooks/use-transaction-form-schema';
import { useTransactionSubmit } from '@/features/ledger/hooks/use-transaction-submit';
import { parseAmount } from '@/features/ledger/schemas/transaction-form-schema';
import { getTransactionChanges, hasFormChanges } from '@/features/ledger/utils/get-transaction-changes';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type UseTransactionFormOptions = {
  bookId: string;
  currency: string;
  row?: TransactionRow;
  viewedMonth?: Month;
  onDismiss: () => void;
  initial?: TransactionFormInitial;
  create?: typeof createTransaction;
};

export type TransactionFormInitial = Partial<Pick<TransactionFormValues, 'type' | 'amount' | 'title' | 'category' | 'date'>>;

export function useTransactionForm({
  bookId,
  row,
  viewedMonth,
  onDismiss,
  initial,
  create,
}: UseTransactionFormOptions) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const initialDateRef = React.useRef(row ? row.dateIso : initial?.date ?? new Date().toISOString());

  const [type, setType] = React.useState<'income' | 'expense'>(row?.kind ?? initial?.type ?? 'expense');
  const [amount, setAmount] = React.useState(row ? String(row.amount) : initial?.amount ?? '');
  const [title, setTitle] = React.useState(row ? row.name : initial?.title ?? '');
  const [category, setCategory] = React.useState(row ? row.category : initial?.category ?? '');
  const [date, setDate] = React.useState(initialDateRef.current);
  const [note, setNote] = React.useState(row?.note ?? '');

  const { data: categories = [] } = useCategories();
  const schema = useTransactionFormSchema(t);

  const formValues: TransactionFormValues = React.useMemo(() => ({
    type,
    amount,
    title,
    category,
    date,
    note,
  }), [type, amount, title, category, date, note]);

  const typeOptions: SegmentOption<'income' | 'expense'>[] = React.useMemo(() => [
    { label: t('ledger.types.expense'), value: 'expense', testID: 'transaction-form-type-expense' },
    { label: t('ledger.types.income'), value: 'income', testID: 'transaction-form-type-income' },
  ], [t]);

  const { isPending, fieldErrors, setFieldErrors, formError, handleSubmit } = useTransactionSubmit({
    bookId,
    row,
    viewedMonth,
    locale,
    onDismiss,
    formValues,
    schema,
    t,
    create,
  });

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setFieldErrors(prev => ({ ...prev, type: undefined }));
    if (category) {
      const match = categories.find(c => c.name === category);
      if (match && match.kind !== newType) {
        setCategory('');
      }
    }
  };

  const requestClose = React.useCallback(() => {
    if (isPending)
      return;
    if (hasFormChanges(formValues, row, initialDateRef.current)) {
      Alert.alert(
        t('ledger.form.discardTitle'),
        t('ledger.form.discardMessage'),
        [
          { text: t('ledger.form.keepEditing'), style: 'cancel' },
          { text: t('ledger.form.discard'), style: 'destructive', onPress: onDismiss },
        ],
      );
    }
    else {
      onDismiss();
    }
  }, [isPending, formValues, row, t, onDismiss]);

  const changes = row ? getTransactionChanges(row, formValues) : {};
  const isSaveDisabled = isPending || (Boolean(row) && Object.keys(changes).length === 0);

  return {
    type,
    amount,
    title,
    category,
    date,
    note,
    setAmount,
    setTitle,
    setCategory,
    setDate,
    setNote,
    fieldErrors,
    setFieldErrors,
    formError,
    isPending,
    isItemized: Boolean(row?.items && row.items.length > 0),
    isForeign: Boolean(row?.original),
    isAmountChanged: Boolean(row && parseAmount(amount) !== row.amount),
    isSaveDisabled,
    typeOptions,
    handleTypeChange,
    handleSubmit,
    requestClose,
    selectedCategoryObj: categories.find(c => c.name === category),
  };
}
