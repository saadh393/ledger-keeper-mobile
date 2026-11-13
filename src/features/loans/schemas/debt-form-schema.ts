import type { AmountErrorMessages } from '@/features/ledger/schemas/amount-schema';
import type { DebtDirection } from '@/features/loans/schemas/debt-schema';
import { z } from 'zod';
import { createAmountSchema } from '@/features/ledger/schemas/amount-schema';
import { toDayKey } from '@/lib/format/day-key';

export type DebtFormErrorMessages = AmountErrorMessages & {
  personRequired: string;
  personTooLong: string;
  dateFuture: string;
  dueBeforeDate: string;
  noteTooLong: string;
};

export type DebtFormValues = {
  direction: DebtDirection;
  counterparty: string;
  amount: string;
  date: string;
  dueDate: string;
  note: string;
};

export function createNotFutureDateSchema(message: string) {
  return z.string().refine(value => toDayKey(value) <= toDayKey(new Date()), message);
}

export function createDebtFormSchema(messages: DebtFormErrorMessages) {
  return z
    .object({
      direction: z.enum(['lent', 'borrowed']),
      counterparty: z.string().trim().min(1, messages.personRequired).max(100, messages.personTooLong),
      amount: createAmountSchema(messages),
      date: createNotFutureDateSchema(messages.dateFuture),
      dueDate: z.string(),
      note: z.string().max(500, messages.noteTooLong),
    })
    .refine(values => !values.dueDate || toDayKey(values.dueDate) >= toDayKey(values.date), {
      message: messages.dueBeforeDate,
      path: ['dueDate'],
    });
}
