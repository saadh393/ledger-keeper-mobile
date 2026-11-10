import { z } from 'zod';

export const categoryKindSchema = z.enum(['income', 'expense']);

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  kind: categoryKindSchema,
  system: z.boolean(),
});

export const categoriesListSchema = z.array(categorySchema);

export type CategoryItem = z.infer<typeof categorySchema>;
