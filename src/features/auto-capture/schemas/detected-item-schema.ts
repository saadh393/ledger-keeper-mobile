import { z } from 'zod';

export const detectedItemSchema = z.object({
  id: z.string(),
  packageName: z.string(),
  appName: z.string(),
  sourceText: z.string(),
  receivedAt: z.string(),
  kind: z.enum(['income', 'expense']).nullable(),
  title: z.string().nullable(),
  category: z.string().nullable(),
  amount: z.number().nullable(),
  currency: z.string(),
  dateIso: z.string().nullable(),
  duplicateOf: z.object({
    id: z.string(),
    title: z.string(),
    dateIso: z.string(),
    amount: z.number(),
    kind: z.enum(['income', 'expense']),
  }).nullable(),
});

export const detectedPageSchema = z.object({
  items: z.array(detectedItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type DetectedItem = z.infer<typeof detectedItemSchema>;
export type DetectedPage = z.infer<typeof detectedPageSchema>;
