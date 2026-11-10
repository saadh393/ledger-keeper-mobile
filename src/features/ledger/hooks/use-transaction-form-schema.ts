import type { TFunction } from 'i18next';
import * as React from 'react';
import { createTransactionFormSchema } from '@/features/ledger/schemas/transaction-form-schema';

export function useTransactionFormSchema(t: TFunction) {
  return React.useMemo(
    () => createTransactionFormSchema({
      amountRequired: t('ledger.errors.amountRequired'),
      amountInvalid: t('ledger.errors.amountInvalid'),
      amountPositive: t('ledger.errors.amountPositive'),
      amountTooLarge: t('ledger.errors.amountTooLarge'),
      amountDecimals: t('ledger.errors.amountDecimals'),
      titleRequired: t('ledger.errors.titleRequired'),
      titleTooLong: t('ledger.errors.titleTooLong'),
      categoryRequired: t('ledger.errors.categoryRequired'),
      dateFuture: t('ledger.errors.dateFuture'),
      noteTooLong: t('ledger.errors.noteTooLong'),
    }),
    [t],
  );
}
