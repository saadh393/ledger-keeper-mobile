import type { Installment } from '@/features/installments/schemas/installment-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, useBottomSheetModalRef } from '@/components/ui';
import { InstallmentFormFields } from '@/features/installments/components/installment-form-fields';
import { useInstallmentForm } from '@/features/installments/hooks/use-installment-form';
import { TransactionCategoryPicker } from '@/features/ledger/components/transaction-category-picker';

export type InstallmentFormSheetProps = {
  bookId: string;
  currency: string;
  installment?: Installment;
  onDismiss: () => void;
};

export function InstallmentFormSheet({ bookId, currency, installment, onDismiss }: InstallmentFormSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const insets = useSafeAreaInsets();
  const [picking, setPicking] = React.useState(false);
  const form = useInstallmentForm({ bookId, installment, onClose: modal.dismiss });

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  return (
    <BottomSheet
      ref={modal.ref}
      title={t(installment ? 'installments.form.editTitle' : 'installments.form.addTitle')}
      dismissible={!form.isPending}
      showCloseButton
      onRequestClose={form.requestClose}
      onDismiss={onDismiss}
      testID="installment-form-sheet"
      snapPoints={['90%']}
    >
      <View className="flex-1 px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {picking
          ? (
              <TransactionCategoryPicker
                testID="installment-category-picker"
                kind="expense"
                selected={form.values.category}
                onSelect={(name) => {
                  form.setField('category', name);
                  setPicking(false);
                }}
                onBack={() => setPicking(false)}
              />
            )
          : <InstallmentFormFields form={form} currency={installment?.currency ?? currency} paidCount={installment?.paidCount ?? 0} onPickCategory={() => setPicking(true)} />}
      </View>
    </BottomSheet>
  );
}
