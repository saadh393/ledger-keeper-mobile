import type { CategoryItem } from '@/features/categories/schemas/category-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { booksKeys } from '@/features/books/utils/query-keys';
import { renameCategory } from '@/features/categories/api/rename-category';
import { categoriesQueryKey } from '@/features/categories/api/use-categories';

type RenameCategoryInput = {
  categoryId: string;
  name: string;
};

export function useRenameCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, name }: RenameCategoryInput) => renameCategory(categoryId, name),
    onSuccess: (renamed) => {
      queryClient.setQueryData<CategoryItem[]>(categoriesQueryKey, categories => categories?.map(category => (category.id === renamed.id ? renamed : category)));
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: categoriesQueryKey }),
        queryClient.invalidateQueries({ queryKey: booksKeys.all }),
      ]);
    },
  });
}
