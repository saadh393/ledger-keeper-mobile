import type { CategoryItem } from '@/features/categories/schemas/category-schema';
import { categoriesListSchema } from '@/features/categories/schemas/category-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export async function fetchCategories(): Promise<CategoryItem[]> {
  const response = await apiClient.get('/categories');
  return parse(categoriesListSchema, response.data);
}
