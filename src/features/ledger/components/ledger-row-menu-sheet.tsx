import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, useBottomSheetModalRef } from '@/components/ui';
import { LedgerRowMenuOption } from '@/features/ledger/components/ledger-row-menu-option';

export type LedgerRowMenuSheetProps = {
  row: TransactionRow;
  onCopy: (row: TransactionRow) => void;
  onDelete: (row: TransactionRow) => void;
  onDismiss: () => void;
};

export function LedgerRowMenuSheet({ row, onCopy, onDelete, onDismiss }: LedgerRowMenuSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const choose = (action: (value: TransactionRow) => void) => () => {
    action(row);
    modal.dismiss();
  };

  return (
    <BottomSheet ref={modal.ref} title={row.name} onDismiss={onDismiss} testID="ledger-row-menu">
      <BottomSheetView className="px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <LedgerRowMenuOption testID="ledger-row-menu-copy" label={t('ledger.actions.copy')} onPress={choose(onCopy)} />
        <LedgerRowMenuOption testID="ledger-row-menu-delete" label={t('ledger.actions.delete')} destructive onPress={choose(onDelete)} />
      </BottomSheetView>
    </BottomSheet>
  );
}
