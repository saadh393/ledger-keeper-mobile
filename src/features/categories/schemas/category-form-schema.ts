import type { CategoryItem } from '@/features/categories/schemas/category-schema';
import { z } from 'zod';
import { categoryKindSchema } from '@/features/categories/schemas/category-schema';
import { hasCategoryName } from '@/features/categories/utils/has-category-name';

export const CATEGORY_NAME_MAX_LENGTH = 40;

export type CategoryFormMessages = {
  nameRequired: string;
  nameTooLong: string;
  nameTaken: string;
};

export function createCategoryFormSchema(messages: CategoryFormMessages, categories: CategoryItem[]) {
  return z
    .object({
      name: z.string().trim().min(1, messages.nameRequired).max(CATEGORY_NAME_MAX_LENGTH, messages.nameTooLong),
      kind: categoryKindSchema,
    })
    .superRefine((value, context) => {
      if (hasCategoryName(categories, value.kind, value.name))
        context.addIssue({ code: 'custom', path: ['name'], message: messages.nameTaken });
    });
}

export type CategoryFormValues = z.infer<ReturnType<typeof createCategoryFormSchema>>;
