import type { Installment } from '@/features/installments/schemas/installment-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, Button, Input, Text, useBottomSheetModalRef } from '@/components/ui';
import { usePaymentForm } from '@/features/installments/hooks/use-payment-form';
import { TransactionDatePicker } from '@/features/ledger/components/transaction-date-picker';
import { LoanDateField } from '@/features/loans/components/loan-date-field';
import { LoanFormError } from '@/features/loans/components/loan-form-error';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type InstallmentPaymentSheetProps = {
  bookId: string;
  installment: Installment;
  onDismiss: () => void;
};

export function InstallmentPaymentSheet({ bookId, installment, onDismiss }: InstallmentPaymentSheetProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const modal = useBottomSheetModalRef();
  const insets = useSafeAreaInsets();
  const [picking, setPicking] = React.useState(false);
  const form = usePaymentForm({ bookId, installment, onClose: modal.dismiss });

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  return (
    <BottomSheet
      ref={modal.ref}
      title={t('installments.pay.title')}
      dismissible={!form.isPending}
      showCloseButton
      onRequestClose={form.requestClose}
      onDismiss={onDismiss}
      testID="installment-payment-sheet"
      snapPoints={['70%']}
    >
      <View className="flex-1 px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {picking
          ? (
              <TransactionDatePicker
                testID="installment-payment-date-picker"
                selected={form.values.date}
                onSelect={(iso) => {
                  form.setField('date', iso);
                  setPicking(false);
                }}
                onBack={() => setPicking(false)}
              />
            )
          : (
              <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text testID="installment-payment-next" className="mb-4 text-meta text-ink-500" style={{ fontVariant: ['tabular-nums'] }}>
                  {t('installments.pay.next', { title: installment.title, next: formatNumber(installment.paidCount + 1, locale), total: formatNumber(installment.totalCount, locale) })}
                </Text>
                <Input
                  testID="installment-payment-amount"
                  label={t('installments.form.amount')}
                  value={form.values.amount}
                  onChangeText={text => form.setField('amount', text)}
                  keyboardType="decimal-pad"
                  disabled={form.isPending}
                  error={form.fieldErrors.amount}
                  rightAccessory={<Text className="text-body font-medium text-ink-500">{installment.currency}</Text>}
                />
                <LoanDateField testID="installment-payment-date" label={t('loans.form.date')} value={form.values.date} error={form.fieldErrors.date} disabled={form.isPending} onPress={() => setPicking(true)} />
                <LoanFormError testID="installment-payment-error" message={form.formError} />
                <Button
                  testID="installment-payment-submit"
                  label={t(form.isPending ? 'installments.pay.saving' : 'installments.pay.save')}
                  pending={form.isPending}
                  disabled={form.isPending}
                  onPress={form.submit}
                />
              </ScrollView>
            )}
      </View>
    </BottomSheet>
  );
}
