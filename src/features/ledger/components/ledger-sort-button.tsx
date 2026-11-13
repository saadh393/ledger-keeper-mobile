import { ArrowDownUp } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Chip } from '@/components/ui/chip';
import { LedgerSortSheet } from '@/features/ledger/components/ledger-sort-sheet';
import { useLedgerFiltersStore } from '@/features/ledger/store/use-ledger-filters-store';
import { getSortLabelKey } from '@/features/ledger/utils/sort-options';

export function LedgerSortButton() {
  const { t } = useTranslation();
  const sort = useLedgerFiltersStore(state => state.sort);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Chip
        testID="ledger-sort-button"
        icon={ArrowDownUp}
        selected={sort !== 'newest'}
        accessibilityLabel={`${t('ledger.sort.button')}: ${t(getSortLabelKey(sort))}`}
        onPress={() => setIsOpen(true)}
        className="px-2.5"
      />
      {isOpen && <LedgerSortSheet onDismiss={() => setIsOpen(false)} />}
    </>
  );
}
