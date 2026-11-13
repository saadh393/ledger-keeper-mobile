import { apiClient } from '@/lib/api';

export async function deleteDebt(bookId: string, debtId: string): Promise<void> {
  await apiClient.delete(`/books/${bookId}/debts/${debtId}`);
}
