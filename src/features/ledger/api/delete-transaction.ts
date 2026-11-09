import { apiClient } from '@/lib/api';
import { toApiError } from '@/lib/api/errors';

export async function deleteTransaction(bookId: string, transactionId: string): Promise<void> {
  try {
    await apiClient.delete(`/books/${bookId}/transactions/${transactionId}`);
  }
  catch (error) {
    if (toApiError(error).code !== 'transaction_not_found')
      throw error;
  }
}
