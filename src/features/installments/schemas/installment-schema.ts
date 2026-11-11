import { z } from 'zod';

export const installmentStatusSchema = z.enum(['active', 'completed']);

export const installmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string().nullish(),
  amount: z.number(),
  totalCount: z.number(),
  paidCount: z.number(),
  paidAmount: z.number().optional(),
  remainingAmount: z.number(),
  currency: z.string(),
  status: installmentStatusSchema,
});

export type InstallmentStatus = z.infer<typeof installmentStatusSchema>;
export type Installment = z.infer<typeof installmentSchema>;
