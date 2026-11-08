import type { CurrencyItem } from '@/features/currency/data/currencies';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type CurrencyRowProps = {
  item: CurrencyItem;
  isSelected: boolean;
  onSelect: (code: string) => void;
  testID?: string;
};

export function CurrencyRow({ item, isSelected, onSelect, testID }: CurrencyRowProps) {
  const themeColors = useThemeColors();

  return (
    <Pressable
      testID={testID ? `${testID}-item-${item.code}` : `currency-item-${item.code}`}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.code}, ${item.symbol}`}
      accessibilityState={{ selected: isSelected }}
      onPress={() => onSelect(item.code)}
      className={`my-0.5 min-h-[48px] flex-row items-center rounded-2xl px-3 py-2.5 ${
        isSelected ? 'bg-selected' : 'active:bg-paper-200'
      }`}
    >
      <Text
        className={`w-12 text-row-title font-semibold ${
          isSelected ? 'text-on-selected' : 'text-ink-900'
        }`}
      >
        {item.code}
      </Text>
      <Text
        numberOfLines={1}
        className={`flex-1 text-row-title ${
          isSelected ? 'font-medium text-on-selected' : 'text-ink-700'
        }`}
      >
        {item.name}
      </Text>
      <Text
        className={`mr-3 text-row-title font-medium ${
          isSelected ? 'text-on-selected' : 'text-ink-500'
        }`}
      >
        {item.symbol}
      </Text>
      <View className="w-5 items-center justify-center">
        {isSelected
          ? (
              <Check size={18} strokeWidth={2.2} color={themeColors.link} />
            )
          : null}
      </View>
    </Pressable>
  );
}
