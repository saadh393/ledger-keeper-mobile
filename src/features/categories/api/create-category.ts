import type { CategoryItem, CategoryKind } from '@/features/categories/schemas/category-schema';
import { categorySchema } from '@/features/categories/schemas/category-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export type CreateCategoryInput = {
  name: string;
  kind: CategoryKind;
};

export async function createCategory(input: CreateCategoryInput): Promise<CategoryItem> {
  const response = await apiClient.post('/categories', input);
  return parse(categorySchema, response.data);
}
