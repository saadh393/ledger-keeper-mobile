import { z } from 'zod';

export const creditBalanceSchema = z.object({
  balance: z.number(),
  held: z.number(),
  lifetimeGranted: z.number(),
  lifetimeSpent: z.number(),
});

export type CreditBalance = z.infer<typeof creditBalanceSchema>;
