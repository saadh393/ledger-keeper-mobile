import type { Debt } from '@/features/loans/schemas/debt-schema';
import { debtSchema } from '@/features/loans/schemas/debt-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export async function fetchDebt(bookId: string, debtId: string): Promise<Debt> {
  const response = await apiClient.get(`/books/${bookId}/debts/${debtId}`);
  return parse(debtSchema, response.data);
}
