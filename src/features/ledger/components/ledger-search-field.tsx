import { Search, X } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Input } from '@/components/ui';
import { useLedgerFiltersStore } from '@/features/ledger/store/use-ledger-filters-store';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export function LedgerSearchField() {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const query = useLedgerFiltersStore(state => state.query);
  const setQuery = useLedgerFiltersStore(state => state.setQuery);

  return (
    <View className="relative justify-center">
      <View className="absolute left-4 z-10" pointerEvents="none">
        <Search size={18} strokeWidth={1.75} color={themeColors['ink-500']} />
      </View>
      <Input
        testID="ledger-search"
        value={query}
        onChangeText={setQuery}
        placeholder={t('ledger.search.placeholder')}
        accessibilityLabel={t('ledger.search.placeholder')}
        returnKeyType="search"
        autoCorrect={false}
        containerClassName="mb-0"
        className="pl-11"
        rightAccessory={query
          ? (
              <Pressable
                testID="ledger-search-clear"
                accessibilityRole="button"
                accessibilityLabel={t('ledger.search.clear')}
                onPress={() => setQuery('')}
                hitSlop={8}
                className="size-9 items-center justify-center rounded-full active:bg-paper-200"
              >
                <X size={18} strokeWidth={1.75} color={themeColors['ink-500']} />
              </Pressable>
            )
          : undefined}
      />
    </View>
  );
}
