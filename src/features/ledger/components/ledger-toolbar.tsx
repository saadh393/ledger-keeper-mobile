import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Chip } from '@/components/ui/chip';
import { LedgerSearchField } from '@/features/ledger/components/ledger-search-field';
import { LedgerSortButton } from '@/features/ledger/components/ledger-sort-button';
import { useLedgerFiltersStore } from '@/features/ledger/store/use-ledger-filters-store';

const kinds = ['all', 'income', 'expense'] as const;

export function LedgerToolbar() {
  const { t } = useTranslation();
  const kind = useLedgerFiltersStore(state => state.kind);
  const setKind = useLedgerFiltersStore(state => state.setKind);
  const showSearch = useLedgerFiltersStore(state => state.isSearchOpen || state.query.length > 0);

  return (
    <View testID="ledger-toolbar" className="gap-3 px-4 pt-3">
      {showSearch ? <LedgerSearchField /> : null}
      <View className="flex-row items-center gap-2">
        <View testID="ledger-kind-filter" accessibilityRole="tablist" className="flex-1 flex-row gap-2">
          {kinds.map(value => (
            <Chip
              key={value}
              testID={`ledger-kind-filter-${value}`}
              accessibilityRole="tab"
              label={t(`ledger.filter.${value}`)}
              selected={kind === value}
              onPress={() => setKind(value)}
            />
          ))}
        </View>
        <LedgerSortButton />
      </View>
    </View>
  );
}
