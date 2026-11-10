import type { CategoryItem } from '@/features/categories/schemas/category-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '@/features/categories/api/delete-category';
import { categoriesQueryKey } from '@/features/categories/api/use-categories';

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_data, categoryId) => {
      queryClient.setQueryData<CategoryItem[]>(categoriesQueryKey, categories => categories?.filter(category => category.id !== categoryId));
      return queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
    },
  });
}
