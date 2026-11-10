import type { CategoryItem, CategoryKind } from '@/features/categories/schemas/category-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { CategoryDeleteSheet } from '@/features/categories/components/category-delete-sheet';
import { CategoryFormSheet } from '@/features/categories/components/category-form-sheet';
import { CategoryList } from '@/features/categories/components/category-list';

export function CategoriesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [kind, setKind] = React.useState<CategoryKind>('income');
  const [isAdding, setIsAdding] = React.useState(false);
  const [renaming, setRenaming] = React.useState<CategoryItem | null>(null);
  const [deleting, setDeleting] = React.useState<CategoryItem | null>(null);
  const options = React.useMemo(() => [
    { value: 'income' as const, label: t('ledger.types.income') },
    { value: 'expense' as const, label: t('ledger.types.expense') },
  ], [t]);
  const openAdd = React.useCallback(() => setIsAdding(true), []);

  return (
    <View testID="categories-screen" className="flex-1 bg-paper-100" style={{ paddingBottom: insets.bottom + 16 }}>
      <SegmentedControl<CategoryKind> testID="categories-kind" className="mx-4 my-2" options={options} value={kind} onChange={setKind} />
      <View className="flex-1">
        <CategoryList kind={kind} onAdd={openAdd} onRename={setRenaming} onDelete={setDeleting} />
      </View>
      <View className="px-4 pt-2">
        <Button testID="categories-add" label={t('categories.add')} onPress={openAdd} />
      </View>
      {isAdding ? <CategoryFormSheet kind={kind} onDismiss={() => setIsAdding(false)} /> : null}
      {renaming ? <CategoryFormSheet kind={renaming.kind} category={renaming} onDismiss={() => setRenaming(null)} /> : null}
      {deleting ? <CategoryDeleteSheet category={deleting} onDismiss={() => setDeleting(null)} /> : null}
    </View>
  );
}
