import type { AmountErrorMessages } from '@/features/ledger/schemas/amount-schema';
import { z } from 'zod';
import { createAmountSchema, normalizeBanglaDigits } from '@/features/ledger/schemas/amount-schema';

export const MAX_INSTALLMENTS = 600;

export type InstallmentFormErrorMessages = AmountErrorMessages & {
  titleRequired: string;
  titleTooLong: string;
  categoryRequired: string;
  countInvalid: string;
  countBelowPaid: string;
};

export type InstallmentFormValues = {
  title: string;
  category: string;
  amount: string;
  totalCount: string;
};

export function parseCount(input: string) {
  const normalized = normalizeBanglaDigits(input).trim();
  return /^\d+$/.test(normalized) ? Number(normalized) : Number.NaN;
}

export function createInstallmentFormSchema(messages: InstallmentFormErrorMessages, paidCount = 0) {
  return z.object({
    title: z.string().trim().min(1, messages.titleRequired).max(200, messages.titleTooLong),
    category: z.string().trim().min(1, messages.categoryRequired),
    amount: createAmountSchema(messages),
    totalCount: z
      .string()
      .refine((value) => {
        const count = parseCount(value);
        return Number.isInteger(count) && count >= 1 && count <= MAX_INSTALLMENTS;
      }, messages.countInvalid)
      .refine(value => !(parseCount(value) < paidCount), messages.countBelowPaid),
  });
}
