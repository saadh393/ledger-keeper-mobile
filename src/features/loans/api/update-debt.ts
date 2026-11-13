import type { CreateDebtInput } from '@/features/loans/api/create-debt';
import type { Debt } from '@/features/loans/schemas/debt-schema';
import { debtSchema } from '@/features/loans/schemas/debt-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export type UpdateDebtInput = Partial<Omit<CreateDebtInput, 'direction'>>;

export async function updateDebt(bookId: string, debtId: string, patch: UpdateDebtInput): Promise<Debt> {
  const response = await apiClient.patch(`/books/${bookId}/debts/${debtId}`, patch);
  return parse(debtSchema, response.data);
}
