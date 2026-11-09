import type { LedgerKindFilter } from '@/features/ledger/utils/filter-rows';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SegmentedControl } from '@/components/ui';
import { LedgerSearchField } from '@/features/ledger/components/ledger-search-field';
import { LedgerSortButton } from '@/features/ledger/components/ledger-sort-button';
import { useLedgerFiltersStore } from '@/features/ledger/store/use-ledger-filters-store';

export function LedgerToolbar() {
  const { t } = useTranslation();
  const kind = useLedgerFiltersStore(state => state.kind);
  const setKind = useLedgerFiltersStore(state => state.setKind);
  const options = React.useMemo(() => [
    { value: 'all' as const, label: t('ledger.filter.all') },
    { value: 'income' as const, label: t('ledger.filter.income') },
    { value: 'expense' as const, label: t('ledger.filter.expense') },
  ], [t]);

  return (
    <View testID="ledger-toolbar" className="gap-3 px-4 pt-4">
      <LedgerSearchField />
      <View className="flex-row items-center gap-3">
        <SegmentedControl<LedgerKindFilter>
          testID="ledger-kind-filter"
          className="flex-1"
          options={options}
          value={kind}
          onChange={setKind}
        />
        <LedgerSortButton />
      </View>
    </View>
  );
}
