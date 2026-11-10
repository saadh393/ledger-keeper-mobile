import type { CategoryItem, CategoryKind } from '@/features/categories/schemas/category-schema';

export function hasCategoryName(categories: CategoryItem[], kind: CategoryKind, name: string): boolean {
  const key = name.trim().toLowerCase();
  return categories.some(category => category.kind === kind && category.name.trim().toLowerCase() === key);
}
