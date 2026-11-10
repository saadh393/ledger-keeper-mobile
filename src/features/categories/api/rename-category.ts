import type { CategoryItem } from '@/features/categories/schemas/category-schema';
import { categorySchema } from '@/features/categories/schemas/category-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export async function renameCategory(categoryId: string, name: string): Promise<CategoryItem> {
  const response = await apiClient.patch(`/categories/${categoryId}`, { name });
  return parse(categorySchema, response.data);
}
