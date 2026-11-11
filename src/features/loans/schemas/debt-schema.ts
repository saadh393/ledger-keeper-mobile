import { z } from 'zod';

export const debtDirectionSchema = z.enum(['lent', 'borrowed']);

export const debtStatusSchema = z.enum(['open', 'settled']);

export const repaymentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  dateIso: z.string(),
});

export const debtSchema = z.object({
  id: z.string(),
  direction: debtDirectionSchema,
  counterparty: z.string(),
  amount: z.number(),
  repaid: z.number(),
  outstanding: z.number(),
  currency: z.string(),
  note: z.string().nullish(),
  dateIso: z.string(),
  dueDateIso: z.string().nullish(),
  status: debtStatusSchema,
  repayments: z.array(repaymentSchema).optional(),
});

export const debtTotalsSchema = z.object({
  lent: z.number(),
  borrowed: z.number(),
});

export const debtPageSchema = z.object({
  items: z.array(debtSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totals: debtTotalsSchema,
});

export type DebtDirection = z.infer<typeof debtDirectionSchema>;
export type DebtStatus = z.infer<typeof debtStatusSchema>;
export type DebtStatusFilter = DebtStatus | 'all';
export type Repayment = z.infer<typeof repaymentSchema>;
export type Debt = z.infer<typeof debtSchema>;
export type DebtTotals = z.infer<typeof debtTotalsSchema>;
export type DebtPage = z.infer<typeof debtPageSchema>;
