import type { DebtPage, DebtStatusFilter } from '@/features/loans/schemas/debt-schema';
import { debtPageSchema } from '@/features/loans/schemas/debt-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export const DEBTS_PAGE_SIZE = 20;

export async function fetchDebts(bookId: string, status: DebtStatusFilter, page: number): Promise<DebtPage> {
  const response = await apiClient.get(`/books/${bookId}/debts`, { params: { status, page, pageSize: DEBTS_PAGE_SIZE } });
  return parse(debtPageSchema, response.data);
}
