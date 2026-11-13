import { z } from 'zod';
import { creditOperationTypeSchema } from '@/features/credits/schemas/credit-ledger-schema';

export const creditUsageSchema = z.object({
  totals: z.array(z.object({
    type: creditOperationTypeSchema,
    operations: z.number(),
    credits: z.number(),
  })),
  points: z.array(z.object({
    date: z.string(),
    credits: z.number(),
  })),
});

export type CreditUsage = z.infer<typeof creditUsageSchema>;
export type CreditUsagePoint = CreditUsage['points'][number];
