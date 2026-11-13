import type { InstallmentFieldKey } from '@/features/installments/utils/get-installment-error';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { showErrorMessage } from '@/components/ui';
import { useInvalidateInstallments } from '@/features/installments/api/use-installment-mutations';
import { getInstallmentError } from '@/features/installments/utils/get-installment-error';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type InstallmentErrorHandlerOptions = {
  bookId: string;
  paidCount: number;
  onClose: () => void;
};

export function useInstallmentErrorHandler({ bookId, paidCount, onClose }: InstallmentErrorHandlerOptions) {
  const { t, i18n } = useTranslation();
  const paid = formatNumber(paidCount, resolveLanguage(i18n.language));
  const invalidate = useInvalidateInstallments(bookId);
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<InstallmentFieldKey, string>>>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  const handleError = React.useCallback((error: unknown) => {
    const result = getInstallmentError(error, t, paid);
    if (result.type === 'notFound') {
      void invalidate();
      onClose();
      showErrorMessage(result.message);
    }
    else if (result.type === 'completed') {
      void invalidate();
      setFormError(result.message);
    }
    else if (result.type === 'fields') {
      setFieldErrors(result.fields);
    }
    else {
      setFormError(result.message);
    }
  }, [t, paid, invalidate, onClose]);

  const clearErrors = React.useCallback(() => {
    setFieldErrors({});
    setFormError(null);
  }, []);

  const clearFieldError = React.useCallback((field: InstallmentFieldKey) => setFieldErrors(prev => ({ ...prev, [field]: undefined })), []);

  return { fieldErrors, setFieldErrors, formError, handleError, clearErrors, clearFieldError };
}
