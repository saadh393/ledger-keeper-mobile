import type { CurrencyItem } from '@/features/currency/data/currencies';
import * as React from 'react';
import { View } from 'react-native';
import { BottomSheetFlatList } from '@/components/ui/bottom-sheet';
import { Text } from '@/components/ui/text';
import { CurrencyRow } from '@/features/currency/components/currency-row';

export type CurrencyListProps = {
  filteredCurrencies: CurrencyItem[];
  selectedCurrency: string;
  onSelect: (code: string) => void;
  testID?: string;
};

export function CurrencyList({
  filteredCurrencies,
  selectedCurrency,
  onSelect,
  testID,
}: CurrencyListProps) {
  const renderItem = React.useCallback(
    ({ item }: { item: CurrencyItem }) => (
      <CurrencyRow
        item={item}
        isSelected={item.code === selectedCurrency}
        onSelect={onSelect}
        testID={testID}
      />
    ),
    [selectedCurrency, testID, onSelect],
  );

  return (
    <View className="min-h-[160px] flex-1">
      {filteredCurrencies.length === 0
        ? (
            <View
              testID={testID ? `${testID}-empty` : undefined}
              className="flex-1 items-center justify-center py-8"
            >
              <Text
                className="text-center text-body text-ink-500"
                tx="currency.noCurrencyFound"
              />
            </View>
          )
        : (
            <BottomSheetFlatList
              testID={testID ? `${testID}-list` : undefined}
              data={filteredCurrencies}
              keyExtractor={(item: CurrencyItem) => item.code}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={15}
              maxToRenderPerBatch={20}
              windowSize={5}
            />
          )}
    </View>
  );
}
