import type { CategoryItem } from '@/features/categories/schemas/category-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '@/features/categories/api/create-category';
import { categoriesQueryKey } from '@/features/categories/api/use-categories';

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: (category) => {
      queryClient.setQueryData<CategoryItem[]>(categoriesQueryKey, categories => [...(categories ?? []), category]);
      return queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
    },
  });
}
