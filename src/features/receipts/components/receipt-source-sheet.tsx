import type { ReceiptSourceKind } from '@/features/receipts/types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, useBottomSheetModalRef } from '@/components/ui/bottom-sheet';
import { LedgerRowMenuOption } from '@/features/ledger/components/ledger-row-menu-option';

export type ReceiptSourceSheetProps = {
  onSelect: (kind: ReceiptSourceKind) => void;
  onDismiss: () => void;
};

export function ReceiptSourceSheet({ onSelect, onDismiss }: ReceiptSourceSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const select = (kind: ReceiptSourceKind) => {
    modal.dismiss();
    onSelect(kind);
  };

  return (
    <BottomSheet ref={modal.ref} title={t('receipts.source.title')} onDismiss={onDismiss} testID="receipt-source">
      <BottomSheetView className="px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <LedgerRowMenuOption testID="receipt-source-camera" label={t('receipts.source.camera')} onPress={() => select('camera')} />
        <LedgerRowMenuOption testID="receipt-source-gallery" label={t('receipts.source.gallery')} onPress={() => select('gallery')} />
      </BottomSheetView>
    </BottomSheet>
  );
}
