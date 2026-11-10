import type { CategoryItem, CategoryKind } from '@/features/categories/schemas/category-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { EmptyState } from '@/components/ui/empty-state';
import { useCategories } from '@/features/categories/api/use-categories';
import { CategoryRow } from '@/features/categories/components/category-row';
import { CategoryRowPlaceholder } from '@/features/categories/components/category-row-placeholder';

export type CategoryListProps = {
  kind: CategoryKind;
  onAdd: () => void;
  onDelete: (category: CategoryItem) => void;
};

const placeholderKeys = Array.from({ length: 6 }, (_, index) => `placeholder-${index}`);

export function CategoryList({ kind, onAdd, onDelete }: CategoryListProps) {
  const { t } = useTranslation();
  const query = useCategories();
  const categories = React.useMemo(() => query.data?.filter(category => category.kind === kind) ?? [], [query.data, kind]);

  if (query.isError && !query.data) {
    return (
      <EmptyState
        testID="category-list-error"
        variant="error"
        title={t('categories.error')}
        actionLabel={t('categories.retry')}
        onAction={() => query.refetch()}
        actionLoading={query.isFetching}
      />
    );
  }

  if (!query.data) {
    return (
      <View testID="category-list-loading" aria-busy>
        {placeholderKeys.map(key => <CategoryRowPlaceholder key={key} />)}
      </View>
    );
  }

  if (!categories.length) {
    return <EmptyState testID="category-list-empty" title={t('categories.empty')} actionLabel={t('categories.add')} onAction={onAdd} />;
  }

  return (
    <ScrollView testID="category-list" className="flex-1">
      {categories.map(category => <CategoryRow key={category.id} category={category} onDelete={onDelete} />)}
    </ScrollView>
  );
}
