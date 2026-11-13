import type { createTransaction } from '@/features/ledger/api/create-transaction';
import type { TransactionFormInitial } from '@/features/ledger/hooks/use-transaction-form';
import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { Month } from '@/features/ledger/utils/month';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, useBottomSheetModalRef } from '@/components/ui';
import { TransactionCategoryPicker } from '@/features/ledger/components/transaction-category-picker';
import { TransactionDatePicker } from '@/features/ledger/components/transaction-date-picker';
import { TransactionFormFields } from '@/features/ledger/components/transaction-form-fields';
import { useTransactionForm } from '@/features/ledger/hooks/use-transaction-form';

export type TransactionFormSheetProps = {
  bookId: string;
  currency: string;
  row?: TransactionRow;
  viewedMonth?: Month;
  onDismiss: () => void;
  initial?: TransactionFormInitial;
  create?: typeof createTransaction;
  title?: string;
  testID?: string;
};

export function TransactionFormSheet({
  bookId,
  currency,
  row,
  viewedMonth,
  onDismiss,
  initial,
  create,
  title,
  testID = 'transaction-form-sheet',
}: TransactionFormSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const insets = useSafeAreaInsets();

  const [isPickingCategory, setIsPickingCategory] = React.useState(false);
  const [isPickingDate, setIsPickingDate] = React.useState(false);

  const form = useTransactionForm({
    bookId,
    currency,
    row,
    viewedMonth,
    initial,
    create,
    onDismiss: () => {
      modal.dismiss();
      onDismiss();
    },
  });

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const renderContent = () => {
    if (isPickingCategory) {
      return (
        <TransactionCategoryPicker
          selected={form.category}
          kind={form.type}
          onSelect={(name) => {
            form.setCategory(name);
            form.setFieldErrors(prev => ({ ...prev, category: undefined }));
            setIsPickingCategory(false);
          }}
          onBack={() => setIsPickingCategory(false)}
        />
      );
    }

    if (isPickingDate) {
      return (
        <TransactionDatePicker
          selected={form.date}
          onSelect={(isoDate) => {
            form.setDate(isoDate);
            form.setFieldErrors(prev => ({ ...prev, date: undefined }));
            setIsPickingDate(false);
          }}
          onBack={() => setIsPickingDate(false)}
        />
      );
    }

    return (
      <TransactionFormFields
        form={form}
        currency={currency}
        onOpenCategoryPicker={() => setIsPickingCategory(true)}
        onOpenDatePicker={() => setIsPickingDate(true)}
      />
    );
  };

  return (
    <BottomSheet
      ref={modal.ref}
      title={title ?? t(row ? 'ledger.form.editTitle' : 'ledger.form.createTitle')}
      dismissible={!form.isPending}
      showCloseButton
      onRequestClose={form.requestClose}
      onDismiss={onDismiss}
      testID={testID}
      snapPoints={['90%']}
    >
      <View testID={testID} className="flex-1 px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {renderContent()}
      </View>
    </BottomSheet>
  );
}
