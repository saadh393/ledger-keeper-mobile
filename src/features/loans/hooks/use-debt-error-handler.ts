import type { DebtError, DebtFieldKey } from '@/features/loans/utils/get-debt-error';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { showErrorMessage } from '@/components/ui';
import { useInvalidateDebts } from '@/features/loans/api/use-invalidate-debts';
import { getDebtError } from '@/features/loans/utils/get-debt-error';
import { formatCurrency } from '@/lib/format/currency';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type DebtErrorHandlerOptions = {
  bookId: string;
  currency: string;
  repaid: number;
  outstanding: number;
  onClose: () => void;
};

export function useDebtErrorHandler({ bookId, currency, repaid, outstanding, onClose }: DebtErrorHandlerOptions) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const invalidate = useInvalidateDebts(bookId);
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<DebtFieldKey, string>>>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  const handleError = React.useCallback((error: unknown) => {
    const result: DebtError = getDebtError(error, {
      t,
      formatAmount: value => formatCurrency(value, locale, currency),
      repaid,
      outstanding,
    });
    if (result.type === 'notFound') {
      invalidate();
      onClose();
      showErrorMessage(result.message);
    }
    else if (result.type === 'fields') {
      setFieldErrors(result.fields);
    }
    else {
      setFormError(result.message);
    }
  }, [t, locale, currency, repaid, outstanding, invalidate, onClose]);

  const clearErrors = React.useCallback(() => {
    setFieldErrors({});
    setFormError(null);
  }, []);

  const clearFieldError = React.useCallback((field: DebtFieldKey) => setFieldErrors(prev => ({ ...prev, [field]: undefined })), []);

  return { fieldErrors, setFieldErrors, formError, handleError, clearErrors, clearFieldError };
}
