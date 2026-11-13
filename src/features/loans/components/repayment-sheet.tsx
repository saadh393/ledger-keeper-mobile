import type { Debt } from '@/features/loans/schemas/debt-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, Button, Input, Text, useBottomSheetModalRef } from '@/components/ui';
import { TransactionDatePicker } from '@/features/ledger/components/transaction-date-picker';
import { LoanDateField } from '@/features/loans/components/loan-date-field';
import { LoanFormError } from '@/features/loans/components/loan-form-error';
import { useRepaymentForm } from '@/features/loans/hooks/use-repayment-form';
import { formatCurrency } from '@/lib/format/currency';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type RepaymentSheetProps = {
  bookId: string;
  debt: Debt;
  onDismiss: () => void;
};

export function RepaymentSheet({ bookId, debt, onDismiss }: RepaymentSheetProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const modal = useBottomSheetModalRef();
  const insets = useSafeAreaInsets();
  const [picking, setPicking] = React.useState(false);
  const form = useRepaymentForm({ bookId, debt, onClose: modal.dismiss });

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  return (
    <BottomSheet
      ref={modal.ref}
      title={t('loans.repay.title')}
      dismissible={!form.isPending}
      showCloseButton
      onRequestClose={form.requestClose}
      onDismiss={onDismiss}
      testID="repayment-sheet"
      snapPoints={['70%']}
    >
      <View className="flex-1 px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {picking
          ? (
              <TransactionDatePicker
                testID="repayment-date-picker"
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
                <Text testID="repayment-sheet-outstanding" className="mb-4 text-meta text-ink-500" style={{ fontVariant: ['tabular-nums'] }}>
                  {t('loans.repay.outstanding', { name: debt.counterparty, amount: formatCurrency(debt.outstanding, locale, debt.currency) })}
                </Text>
                <Input
                  testID="repayment-form-amount"
                  label={t('loans.form.amount')}
                  value={form.values.amount}
                  onChangeText={text => form.setField('amount', text)}
                  keyboardType="decimal-pad"
                  disabled={form.isPending}
                  error={form.fieldErrors.amount}
                  rightAccessory={<Text className="text-body font-medium text-ink-500">{debt.currency}</Text>}
                />
                <LoanDateField testID="repayment-form-date" label={t('loans.form.date')} value={form.values.date} error={form.fieldErrors.date} disabled={form.isPending} onPress={() => setPicking(true)} />
                <LoanFormError testID="repayment-form-error" message={form.formError} />
                <Button
                  testID="repayment-form-submit"
                  label={t(form.isPending ? 'loans.repay.saving' : 'loans.repay.save')}
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
