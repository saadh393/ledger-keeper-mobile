import { z } from 'zod';
import { installmentSchema } from '@/features/installments/schemas/installment-schema';
import { debtSchema, debtTotalsSchema } from '@/features/loans/schemas/debt-schema';

export const debtListArtifactSchema = debtTotalsSchema.extend({
  currency: z.string(),
  rows: z.array(debtSchema),
});

export const installmentListArtifactSchema = z.object({
  rows: z.array(installmentSchema),
});

export type DebtListArtifactData = z.infer<typeof debtListArtifactSchema>;
export type InstallmentListArtifactData = z.infer<typeof installmentListArtifactSchema>;
