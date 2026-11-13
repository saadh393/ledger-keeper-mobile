import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { getInstallmentTotal } from '@/features/installments/utils/get-installment-total';
import { formatCurrency } from '@/lib/format/currency';
import { formatNumber } from '@/lib/format/number';

export type InstallmentTotalPreviewProps = {
  amount: string;
  totalCount: string;
  currency: string;
  locale: Language;
};

export function InstallmentTotalPreview({ amount, totalCount, currency, locale }: InstallmentTotalPreviewProps) {
  const { t } = useTranslation();
  const preview = getInstallmentTotal(amount, totalCount);
  if (!preview)
    return null;
  return (
    <Text testID="installment-form-total" className="mb-4 text-meta text-ink-500" style={{ fontVariant: ['tabular-nums'] }}>
      {t('installments.form.total', {
        times: formatNumber(preview.count, locale),
        amount: formatCurrency(preview.amount, locale, currency),
        total: formatCurrency(preview.total, locale, currency),
      })}
    </Text>
  );
}
