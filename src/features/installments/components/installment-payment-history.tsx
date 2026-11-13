import type { Installment, InstallmentPayment } from '@/features/installments/schemas/installment-schema';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { useInstallment } from '@/features/installments/api/use-installment';
import { InstallmentPaymentItem } from '@/features/installments/components/installment-payment-item';
import { sortPayments } from '@/features/installments/utils/sort-payments';

export type InstallmentPaymentHistoryProps = {
  bookId: string;
  installment: Installment;
  locale: Language;
  onUndo: (installment: Installment, payment: InstallmentPayment) => void;
};

export function InstallmentPaymentHistory({ bookId, installment, locale, onUndo }: InstallmentPaymentHistoryProps) {
  const { t } = useTranslation();
  const query = useInstallment(bookId, installment.id);
  const payments = React.useMemo(() => sortPayments(query.data?.payments ?? []), [query.data]);

  if (query.isError && !query.data) {
    return (
      <View testID="installment-payments-error" className="flex-row items-center gap-3">
        <Text className="flex-1 text-meta text-clay-500">{t('installments.details.error')}</Text>
        <Button testID="installment-payments-retry" variant="outline" size="sm" fullWidth={false} label={t('installments.retry')} pending={query.isFetching} onPress={() => query.refetch()} />
      </View>
    );
  }

  if (!query.data) {
    return (
      <View testID="installment-payments-loading" aria-busy className="gap-2 py-1" accessibilityLabel={t('common.loading')}>
        <View className="h-3 w-2/3 rounded-md bg-border" />
        <View className="h-3 w-1/2 rounded-md bg-border" />
      </View>
    );
  }

  if (!payments.length)
    return <Text testID="installment-payments-empty" className="text-meta text-ink-500">{t('installments.details.noPayments')}</Text>;

  return (
    <View testID="installment-payments">
      {payments.map(payment => (
        <InstallmentPaymentItem key={payment.id} payment={payment} currency={installment.currency} locale={locale} onUndo={item => onUndo(query.data!, item)} />
      ))}
    </View>
  );
}
