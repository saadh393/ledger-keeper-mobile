import { Search } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { useLedgerFiltersStore } from '@/features/ledger/store/use-ledger-filters-store';
import { useThemeColors } from '@/lib/theme/use-theme-colors';
import { twMerge } from '@/lib/tw-merge';

export function LedgerSearchButton() {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const isOpen = useLedgerFiltersStore(state => state.isSearchOpen || state.query.length > 0);
  const openSearch = useLedgerFiltersStore(state => state.openSearch);
  const closeSearch = useLedgerFiltersStore(state => state.closeSearch);

  return (
    <Pressable
      testID="ledger-search-button"
      accessibilityRole="button"
      accessibilityLabel={t(isOpen ? 'ledger.search.close' : 'ledger.search.placeholder')}
      accessibilityState={{ expanded: isOpen }}
      onPress={isOpen ? closeSearch : openSearch}
      className={twMerge('size-11 items-center justify-center rounded-full active:bg-paper-200', isOpen && 'bg-selected')}
      hitSlop={4}
    >
      <Search size={22} strokeWidth={1.75} color={themeColors[isOpen ? 'on-selected' : 'ink-900']} />
    </Pressable>
  );
}
