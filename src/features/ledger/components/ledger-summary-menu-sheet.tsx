import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, useBottomSheetModalRef } from '@/components/ui/bottom-sheet';
import { LedgerRowMenuOption } from '@/features/ledger/components/ledger-row-menu-option';
import { useLedgerPreferencesStore } from '@/features/ledger/store/use-ledger-preferences-store';

export type LedgerSummaryMenuSheetProps = {
  exactValue: string;
  onDismiss: () => void;
};

export function LedgerSummaryMenuSheet({ exactValue, onDismiss }: LedgerSummaryMenuSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const insets = useSafeAreaInsets();
  const setShowSummary = useLedgerPreferencesStore(state => state.setShowSummary);

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  return (
    <BottomSheet ref={modal.ref} title={exactValue} onDismiss={onDismiss} testID="ledger-summary-menu">
      <BottomSheetView className="px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <LedgerRowMenuOption
          testID="ledger-summary-menu-hide"
          label={t('ledger.summary.hide')}
          onPress={() => {
            modal.dismiss();
            setShowSummary(false);
          }}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}
