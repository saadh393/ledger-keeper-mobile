import type { Debt } from '@/features/loans/schemas/debt-schema';
import { debtSchema } from '@/features/loans/schemas/debt-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export async function deleteRepayment(bookId: string, debtId: string, repaymentId: string): Promise<Debt> {
  const response = await apiClient.delete(`/books/${bookId}/debts/${debtId}/repayments/${repaymentId}`);
  return parse(debtSchema, response.data);
}
