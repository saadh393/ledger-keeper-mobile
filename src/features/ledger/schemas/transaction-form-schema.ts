import { z } from 'zod';
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

const BANGLA_DIGITS_RANGE = /[\u09E6-\u09EF]/g;
const AMOUNT_CHARACTERS = /^[0-9.,\u09E6-\u09EF]+$/;
const MAX_AMOUNT = 999_999_999_999.99;

export function normalizeBanglaDigits(input: string): string {
  return input.replace(BANGLA_DIGITS_RANGE, digit => String(digit.charCodeAt(0) - 0x09E6));
}

export function parseAmount(input: string): number {
  const normalized = normalizeBanglaDigits(input).replace(/,/g, '').trim();
  const value = Number.parseFloat(normalized);
  return Number.isNaN(value) ? 0 : value;
}

export function createTransactionFormSchema(messages: TransactionFormErrorMessages) {
  return z.object({
    type: z.enum(['income', 'expense']),
    amount: z
      .string()
      .trim()
      .min(1, messages.amountRequired)
      .superRefine((val, ctx) => {
        const trimmed = val.trim();
        if (!AMOUNT_CHARACTERS.test(trimmed)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.amountInvalid });
          return;
        }

        const normalized = normalizeBanglaDigits(trimmed).replace(/,/g, '');
        const dotCount = (normalized.match(/\./g) || []).length;
        if (dotCount > 1) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.amountInvalid });
          return;
        }

        const parts = normalized.split('.');
        if (parts[1] !== undefined && parts[1].length > 2) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.amountDecimals });
          return;
        }

        const num = Number.parseFloat(normalized);
        if (Number.isNaN(num)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.amountInvalid });
          return;
        }

        if (num <= 0) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.amountPositive });
          return;
        }

        if (num > MAX_AMOUNT) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.amountTooLarge });
        }
      }),
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
