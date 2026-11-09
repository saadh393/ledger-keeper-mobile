import type { LedgerSort } from '@/features/ledger/utils/filter-rows';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type LedgerSortOptionProps = {
  value: LedgerSort;
  label: string;
  isActive: boolean;
  onSelect: (value: LedgerSort) => void;
};

export function LedgerSortOption({ value, label, isActive, onSelect }: LedgerSortOptionProps) {
  const themeColors = useThemeColors();

  return (
    <Pressable
      testID={`ledger-sort-option-${value}`}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: isActive }}
      onPress={() => onSelect(value)}
      className={`min-h-[48px] flex-row items-center rounded-2xl px-3 py-2.5 ${isActive ? 'bg-selected' : 'active:bg-paper-200'}`}
    >
      <Text className={`flex-1 text-row-title ${isActive ? 'font-medium text-on-selected' : 'text-ink-900'}`}>
        {label}
      </Text>
      <View className="w-5 items-center justify-center">
        {isActive
          ? (
              <View testID={`ledger-sort-check-${value}`}>
                <Check size={18} strokeWidth={2.2} color={themeColors.link} />
              </View>
            )
          : null}
      </View>
    </Pressable>
  );
}
