import type { CategoryItem } from '@/features/categories/schemas/category-schema';
import { Pencil, Trash2 } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type CategoryRowProps = {
  category: CategoryItem;
  onRename: (category: CategoryItem) => void;
  onDelete: (category: CategoryItem) => void;
};

export function CategoryRow({ category, onRename, onDelete }: CategoryRowProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();

  return (
    <View testID={`category-row-${category.id}`} className="min-h-14 flex-row items-center gap-3 px-4 py-1">
      <View className="size-3 rounded-full" style={{ backgroundColor: category.color }} />
      <Text numberOfLines={1} className="flex-1 text-row-title text-ink-900">{category.name}</Text>
      {category.system
        ? <Text testID={`category-row-${category.id}-built-in`} className="text-meta text-ink-500">{t('categories.builtIn')}</Text>
        : (
            <>
              <Pressable
                testID={`category-row-${category.id}-rename`}
                accessibilityRole="button"
                accessibilityLabel={t('categories.rename', { name: category.name })}
                onPress={() => onRename(category)}
                className="size-11 items-center justify-center rounded-full active:bg-paper-200"
              >
                <Pencil size={20} strokeWidth={1.75} color={themeColors['ink-700']} />
              </Pressable>
              <Pressable
                testID={`category-row-${category.id}-delete`}
                accessibilityRole="button"
                accessibilityLabel={t('categories.delete', { name: category.name })}
                onPress={() => onDelete(category)}
                className="size-11 items-center justify-center rounded-full active:bg-paper-200"
              >
                <Trash2 size={20} strokeWidth={1.75} color={themeColors['clay-500']} />
              </Pressable>
            </>
          )}
    </View>
  );
}
