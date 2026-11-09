import { ArrowDownUp } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { LedgerSortSheet } from '@/features/ledger/components/ledger-sort-sheet';
import { useLedgerFiltersStore } from '@/features/ledger/store/use-ledger-filters-store';
import { getSortLabelKey } from '@/features/ledger/utils/sort-options';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export function LedgerSortButton() {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const sort = useLedgerFiltersStore(state => state.sort);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Pressable
        testID="ledger-sort-button"
        accessibilityRole="button"
        accessibilityLabel={`${t('ledger.sort.button')}: ${t(getSortLabelKey(sort))}`}
        onPress={() => setIsOpen(true)}
        className="size-11 items-center justify-center rounded-full bg-paper-200 active:opacity-80"
      >
        <ArrowDownUp size={18} strokeWidth={1.75} color={themeColors['ink-700']} />
      </Pressable>
      {isOpen && <LedgerSortSheet onDismiss={() => setIsOpen(false)} />}
    </>
  );
}
