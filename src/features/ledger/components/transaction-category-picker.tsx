import type { CategoryItem } from '@/features/ledger/schemas/category-schema';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { Button, Input, Text } from '@/components/ui';
import { useCategories } from '@/features/ledger/api/use-categories';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type TransactionCategoryPickerProps = {
  selected: string;
  kind: 'income' | 'expense';
  onSelect: (name: string) => void;
  onBack: () => void;
  testID?: string;
};

export function TransactionCategoryPicker({
  selected,
  kind,
  onSelect,
  onBack,
  testID = 'transaction-category-picker',
}: TransactionCategoryPickerProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const { data: categories = [], isLoading } = useCategories();
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    return categories
      .filter((cat: CategoryItem) => cat.kind === kind)
      .filter((cat: CategoryItem) =>
        query.trim() === '' || cat.name.toLowerCase().includes(query.trim().toLowerCase()),
      );
  }, [categories, kind, query]);

  return (
    <View testID={testID} className="flex-1">
      <Input
        testID={`${testID}-search`}
        placeholder={t('ledger.form.searchCategory')}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        containerClassName="mb-3"
      />

      <ScrollView className="max-h-64 flex-1" testID={`${testID}-list`}>
        {filtered.length === 0 && !isLoading && (
          <View className="items-center justify-center py-6">
            <Text className="text-body text-ink-500">{t('ledger.form.noCategories')}</Text>
          </View>
        )}
        {filtered.map((cat: CategoryItem) => {
          const isSelected = selected === cat.name;
          return (
            <Pressable
              key={cat.id}
              testID={`category-item-${cat.name}`}
              accessibilityRole="button"
              accessibilityLabel={`${cat.name}${isSelected ? ', selected' : ''}`}
              onPress={() => onSelect(cat.name)}
              className="min-h-[44px] flex-row items-center justify-between border-b border-border/40 p-3 active:bg-paper-200"
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="size-3 rounded-full"
                  style={{ backgroundColor: cat.color || themeColors['forest-500'] }}
                />
                <Text className="text-body font-medium text-ink-900">{cat.name}</Text>
              </View>
              {isSelected && <Check size={18} strokeWidth={2} color={themeColors.accent} />}
            </Pressable>
          );
        })}
      </ScrollView>

      <Button
        variant="secondary"
        label={t('ledger.form.back')}
        onPress={onBack}
        className="mt-3"
        testID={`${testID}-back`}
      />
    </View>
  );
}
