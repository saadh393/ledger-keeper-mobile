import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/features/ledger/api/fetch-categories';

export const categoriesQueryKey = ['categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
  });
}
