import { z } from 'zod';

export const installmentStatusSchema = z.enum(['active', 'completed']);

export const installmentPaymentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  dateIso: z.string(),
  note: z.string().nullable(),
});

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
  payments: z.array(installmentPaymentSchema).optional(),
});

export const installmentListSchema = z.object({
  items: z.array(installmentSchema),
});

export type InstallmentStatus = z.infer<typeof installmentStatusSchema>;
export type InstallmentStatusFilter = InstallmentStatus | 'all';
export type InstallmentPayment = z.infer<typeof installmentPaymentSchema>;
export type Installment = z.infer<typeof installmentSchema>;
