import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, useBottomSheetModalRef } from '@/components/ui/bottom-sheet';
import { LedgerRowMenuOption } from '@/features/ledger/components/ledger-row-menu-option';

export type LedgerMoreMenuSheetProps = {
  onManageCategories: () => void;
  onDismiss: () => void;
};

export function LedgerMoreMenuSheet({ onManageCategories, onDismiss }: LedgerMoreMenuSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  return (
    <BottomSheet ref={modal.ref} title={t('ledger.more.label')} onDismiss={onDismiss} testID="ledger-more-menu">
      <BottomSheetView className="px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <LedgerRowMenuOption
          testID="ledger-more-menu-categories"
          label={t('ledger.more.manageCategories')}
          onPress={() => {
            modal.dismiss();
            onManageCategories();
          }}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}
