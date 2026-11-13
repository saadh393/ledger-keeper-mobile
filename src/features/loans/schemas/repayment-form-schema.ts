import type { AmountErrorMessages } from '@/features/ledger/schemas/amount-schema';
import { z } from 'zod';
import { createAmountSchema, parseAmount } from '@/features/ledger/schemas/amount-schema';
import { createNotFutureDateSchema } from '@/features/loans/schemas/debt-form-schema';

export type RepaymentFormErrorMessages = AmountErrorMessages & {
  amountExceeds: string;
  dateFuture: string;
};

export type RepaymentFormValues = {
  amount: string;
  date: string;
};

export function createRepaymentFormSchema(messages: RepaymentFormErrorMessages, outstanding: number) {
  return z.object({
    amount: createAmountSchema(messages).refine(value => parseAmount(value) <= outstanding, messages.amountExceeds),
    date: createNotFutureDateSchema(messages.dateFuture),
  });
}
