import { z } from 'zod';
import { createAmountSchema } from '@/features/ledger/schemas/amount-schema';
import { toDayKey } from '@/lib/format/day-key';

export type TransactionFormErrorMessages = {
  amountRequired: string;
  amountInvalid: string;
  amountPositive: string;
  amountTooLarge: string;
  amountDecimals: string;
  titleRequired: string;
  titleTooLong: string;
  categoryRequired: string;
  dateFuture: string;
  noteTooLong: string;
};

export type TransactionFormValues = {
  type: 'income' | 'expense';
  amount: string;
  title: string;
  category: string;
  date: string;
  note: string;
};

export { normalizeBanglaDigits, parseAmount } from '@/features/ledger/schemas/amount-schema';

export function createTransactionFormSchema(messages: TransactionFormErrorMessages) {
  return z.object({
    type: z.enum(['income', 'expense']),
    amount: createAmountSchema(messages),
    title: z
      .string()
      .trim()
      .min(1, messages.titleRequired)
      .max(200, messages.titleTooLong),
    category: z
      .string()
      .trim()
      .min(1, messages.categoryRequired),
    date: z
      .string()
      .superRefine((val, ctx) => {
        const today = toDayKey(new Date());
        const day = toDayKey(val);
        if (day > today) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.dateFuture });
        }
      }),
    note: z
      .string()
      .max(500, messages.noteTooLong)
      .optional()
      .or(z.literal('')),
  });
}
