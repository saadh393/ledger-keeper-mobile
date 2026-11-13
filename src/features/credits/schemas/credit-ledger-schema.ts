import { z } from 'zod';

export const creditOperationTypeSchema = z.enum(['chat', 'voice', 'receipt']);

export const creditLedgerEntrySchema = z.object({
  id: z.string(),
  type: z.enum(['purchase', 'trial', 'referral', 'admin_adjustment', 'reserve', 'release']),
  amount: z.number(),
  balanceAfter: z.number(),
  note: z.string().nullable(),
  operation: z.object({
    id: z.string(),
    type: creditOperationTypeSchema,
    status: z.enum(['reserved', 'captured', 'released']),
    chargedCredits: z.number(),
  }).nullable(),
  purchase: z.object({
    id: z.string(),
    planName: z.string(),
  }).nullable(),
  createdAt: z.string(),
});

export const creditLedgerPageSchema = z.object({
  items: z.array(creditLedgerEntrySchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type CreditOperationType = z.infer<typeof creditOperationTypeSchema>;
export type CreditLedgerEntry = z.infer<typeof creditLedgerEntrySchema>;
export type CreditLedgerPage = z.infer<typeof creditLedgerPageSchema>;
