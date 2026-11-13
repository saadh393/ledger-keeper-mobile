import type { Debt } from '@/features/loans/schemas/debt-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, useBottomSheetModalRef } from '@/components/ui';
import { TransactionDatePicker } from '@/features/ledger/components/transaction-date-picker';
import { LoanFormFields } from '@/features/loans/components/loan-form-fields';
import { useLoanForm } from '@/features/loans/hooks/use-loan-form';

export type LoanFormSheetProps = {
  bookId: string;
  currency: string;
  debt?: Debt;
  onDismiss: () => void;
};

type DatePickerTarget = 'date' | 'dueDate';

export function LoanFormSheet({ bookId, currency, debt, onDismiss }: LoanFormSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const insets = useSafeAreaInsets();
  const [picking, setPicking] = React.useState<DatePickerTarget | null>(null);
  const form = useLoanForm({ bookId, currency: debt?.currency ?? currency, debt, onClose: modal.dismiss });

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  return (
    <BottomSheet
      ref={modal.ref}
      title={t(debt ? 'loans.form.editTitle' : 'loans.form.addTitle')}
      dismissible={!form.isPending}
      showCloseButton
      onRequestClose={form.requestClose}
      onDismiss={onDismiss}
      testID="loan-form-sheet"
      snapPoints={['90%']}
    >
      <View className="flex-1 px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {picking
          ? (
              <TransactionDatePicker
                testID="loan-date-picker"
                allowFuture={picking === 'dueDate'}
                selected={form.values[picking] || form.values.date}
                onSelect={(iso) => {
                  form.setField(picking, iso);
                  setPicking(null);
                }}
                onBack={() => setPicking(null)}
              />
            )
          : <LoanFormFields form={form} currency={debt?.currency ?? currency} onPickDate={() => setPicking('date')} onPickDueDate={() => setPicking('dueDate')} />}
      </View>
    </BottomSheet>
  );
}
