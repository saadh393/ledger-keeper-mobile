import type { LedgerSort } from '@/features/ledger/utils/filter-rows';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheet, BottomSheetView, useBottomSheetModalRef } from '@/components/ui';
import { LedgerSortOption } from '@/features/ledger/components/ledger-sort-option';
import { useLedgerFiltersStore } from '@/features/ledger/store/use-ledger-filters-store';
import { sortOptions } from '@/features/ledger/utils/sort-options';

export type LedgerSortSheetProps = {
  onDismiss: () => void;
};

export function LedgerSortSheet({ onDismiss }: LedgerSortSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const sort = useLedgerFiltersStore(state => state.sort);
  const setSort = useLedgerFiltersStore(state => state.setSort);
  const snapPoints = React.useMemo(() => ['45%'], []);

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const select = React.useCallback((value: LedgerSort) => {
    setSort(value);
    modal.dismiss();
  }, [modal, setSort]);

  return (
    <BottomSheet
      ref={modal.ref}
      snapPoints={snapPoints}
      title={t('ledger.sort.title')}
      onDismiss={onDismiss}
      testID="ledger-sort-sheet"
    >
      <BottomSheetView testID="ledger-sort-sheet" accessibilityRole="radiogroup" className="px-4 pb-4">
        {sortOptions.map(option => (
          <LedgerSortOption
            key={option.value}
            value={option.value}
            label={t(option.labelKey)}
            isActive={option.value === sort}
            onSelect={select}
          />
        ))}
      </BottomSheetView>
    </BottomSheet>
  );
}
