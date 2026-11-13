import type { Debt, DebtDirection } from '@/features/loans/schemas/debt-schema';
import { debtSchema } from '@/features/loans/schemas/debt-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export type CreateDebtInput = {
  direction: DebtDirection;
  counterparty: string;
  amount: number;
  dateIso: string;
  dueDateIso: string | null;
  note: string | null;
};

export async function createDebt(bookId: string, input: CreateDebtInput): Promise<Debt> {
  const response = await apiClient.post(`/books/${bookId}/debts`, input);
  return parse(debtSchema, response.data);
}
