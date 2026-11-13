import { z } from 'zod';

export const creditPlanSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  credits: z.number(),
  priceUsdCents: z.number(),
  sortOrder: z.number(),
});

export const creditPlansSchema = z.object({
  items: z.array(creditPlanSchema),
});

export type CreditPlan = z.infer<typeof creditPlanSchema>;
