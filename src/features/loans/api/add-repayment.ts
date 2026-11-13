import type { Debt } from '@/features/loans/schemas/debt-schema';
import { debtSchema } from '@/features/loans/schemas/debt-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export type AddRepaymentInput = {
  amount: number;
  dateIso: string;
};

export async function addRepayment(bookId: string, debtId: string, input: AddRepaymentInput): Promise<Debt> {
  const response = await apiClient.post(`/books/${bookId}/debts/${debtId}/repayments`, input);
  return parse(debtSchema, response.data);
}
